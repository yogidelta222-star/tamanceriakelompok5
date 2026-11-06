"""Periksa mutu rekaman suara Cuking secara otomatis.

Setiap rekaman di suara/ "didengarkan" oleh Whisper (pengenal suara, berjalan di laptop) lalu dibandingkan
dengan teks aslinya, dan durasinya diperiksa. Hasilnya dipakai untuk merekam ulang rekaman yang melenceng.

Persiapan:  pip install faster-whisper imageio-ffmpeg
Pemakaian:  python tools/periksa_suara.py [--model large-v3-turbo] [--folder-model <folder>]
Hasil:      tools/periksa-suara.json   (semua kalimat: teks dengar, skor, alasan bila ditandai)
            tools/ulang-suara.json     (daftar kalimat yang perlu direkam ulang, untuk --ulang)
"""
import argparse
import difflib
import json
import re
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel, decode_audio

AKAR = Path(__file__).resolve().parent.parent
FOLDER = AKAR / 'suara'
SR = 16000
JEDA = 0.8          # detik hening di antara rekaman yang digabung
PANJANG_MAKS = 24   # detik audio per gabungan (Whisper membaca potongan 30 detik)
ANGKA = {'0': 'nol', '1': 'satu', '2': 'dua', '3': 'tiga', '4': 'empat', '5': 'lima', '6': 'enam', '7': 'tujuh',
         '8': 'delapan', '9': 'sembilan', '10': 'sepuluh'}


def nama_berkas(kalimat: str) -> str:
    import hashlib
    return hashlib.md5(kalimat.encode('utf-8')).hexdigest()[:12] + '.mp3'


def rata(teks: str) -> str:
    """Huruf kecil tanpa tanda baca & spasi; angka ditulis sebagai kata."""
    teks = re.sub(r'\d+', lambda m: ANGKA.get(m.group(), m.group()), teks.lower())
    return re.sub(r'[^a-z]', '', teks)


def ujung_keras(audio) -> float:
    """Kekerasan 50 ms terakhir dibanding bagian terkeras (dB). Mendekati 0 = ucapan terpotong mendadak."""
    db = lambda x: 20 * np.log10(max(float(np.sqrt(np.mean(x ** 2))), 1e-9))
    n = int(0.05 * SR)
    puncak = max(db(audio[i:i + n]) for i in range(0, max(1, len(audio) - n), n))
    return db(audio[-n:]) - puncak


def rawan(k: str) -> bool:
    """Kalimat yang sulit dinilai mesin (huruf dieja, sangat pendek, bunyi hewan): diperiksa telinga."""
    return len(k) <= 14 or bool(re.search(r'huruf|\b[A-Z]\b|guk|meong|mooo|cit|cuit|kwek|mbe', k))


def utama():
    ap = argparse.ArgumentParser()
    ap.add_argument('--model', default='large-v3-turbo')
    ap.add_argument('--folder-model', default=None)
    ap.add_argument('--hanya', help='file JSON berisi daftar kalimat yang diperiksa (default: semua)')
    ap.add_argument('--sendiri', action='store_true', help='dengarkan tiap rekaman sendiri-sendiri (lebih lambat, lebih teliti)')
    arg = ap.parse_args()

    kalimat = json.loads((AKAR / 'tools' / 'kalimat.json').read_text(encoding='utf-8'))
    if arg.hanya:
        pilih = set(json.loads(Path(arg.hanya).read_text(encoding='utf-8')))
        kalimat = [k for k in kalimat if k in pilih]
    waktu = json.loads((AKAR / 'tools' / 'waktu-suara.json').read_text(encoding='utf-8'))
    selesai = set(json.loads((AKAR / 'tools' / 'elevenlabs-selesai.json').read_text(encoding='utf-8')))
    model = WhisperModel(arg.model, device='cpu', compute_type='int8', download_root=arg.folder_model)

    hasil_lama = AKAR / 'tools' / 'periksa-suara.json'
    hasil = json.loads(hasil_lama.read_text(encoding='utf-8')) if hasil_lama.exists() and arg.hanya else {}

    # Ambil potongan ucapan tiap rekaman (hening awal/akhir dibuang, sesuai yang diputar website)
    antre = []
    for k in kalimat:
        b = nama_berkas(k)
        w = waktu.get(b)
        if k not in selesai or not isinstance(w, list):
            hasil[k] = {'dengar': '', 'skor': 0, 'alasan': ['belum direkam ElevenLabs']}
            continue
        audio = decode_audio(str(FOLDER / b), sampling_rate=SR)
        mulai, akhir = w
        antre.append((k, audio[int(mulai * SR):int(akhir * SR)], ujung_keras(audio), mulai, akhir))

    # Gabungkan beberapa rekaman jadi satu potongan agar Whisper jauh lebih cepat
    kelompok, isi, pjg = [], [], 0.0
    for item in antre:
        d = len(item[1]) / SR
        if isi and (arg.sendiri or pjg + d + JEDA > PANJANG_MAKS):
            kelompok.append(isi)
            isi, pjg = [], 0.0
        isi.append(item)
        pjg += d + JEDA
    if isi:
        kelompok.append(isi)

    hening = np.zeros(int(JEDA * SR), dtype=np.float32)
    for n, isi in enumerate(kelompok, start=1):
        bagian, rentang, t = [], [], 0.0
        for k, potong, *_ in isi:
            rentang.append((t, t + len(potong) / SR))
            bagian += [potong, hening]
            t += len(potong) / SR + JEDA
        gabung = np.concatenate(bagian)
        seg, _ = model.transcribe(gabung, language='id', beam_size=5, word_timestamps=True,
                                  vad_filter=False, condition_on_previous_text=False)
        kata = [[] for _ in isi]
        for s in seg:
            for w in s.words or []:
                tengah = (w.start + w.end) / 2
                i = min(range(len(rentang)), key=lambda j: 0 if rentang[j][0] - 0.3 <= tengah <= rentang[j][1] + 0.3
                        else min(abs(tengah - rentang[j][0]), abs(tengah - rentang[j][1])))
                kata[i].append(w.word)
        for (k, potong, ujung, mulai, akhir), ks in zip(isi, kata):
            dengar = ''.join(ks).strip()
            skor = difflib.SequenceMatcher(None, rata(k), rata(dengar)).ratio()
            durasi = akhir - mulai
            laju = len(rata(k)) / max(durasi, 0.1)
            alasan = []
            if skor < 0.8 and not rawan(k):
                alasan.append(f'kata tidak cocok ({skor:.0%})')
            if rawan(k) and (not rata(dengar) or skor < 0.5):
                alasan.append(f'tidak terdengar jelas ("{dengar}")')
            if ujung > -6:
                alasan.append('ujung ucapan terpotong mendadak')
            if durasi < 0.35:
                alasan.append(f'terlalu singkat ({durasi:.2f} dtk)')
            if laju < 5 and len(k) > 14:
                alasan.append(f'terlalu lambat/panjang ({durasi:.1f} dtk)')
            if laju > 22:
                alasan.append(f'terlalu cepat/pendek ({durasi:.1f} dtk)')
            hasil[k] = {'dengar': dengar, 'skor': round(skor, 3), 'durasi': round(durasi, 2), 'ujung': round(ujung, 1),
                        'rawan': rawan(k), 'alasan': alasan}
        print(f'{n}/{len(kelompok)} gabungan diperiksa', flush=True)
        if n % 10 == 0:
            hasil_lama.write_text(json.dumps(hasil, ensure_ascii=False, indent=1), encoding='utf-8')

    hasil_lama.write_text(json.dumps(hasil, ensure_ascii=False, indent=1), encoding='utf-8')
    ulang = sorted(k for k, v in hasil.items() if v['alasan'])
    (AKAR / 'tools' / 'ulang-suara.json').write_text(json.dumps(ulang, ensure_ascii=False, indent=1), encoding='utf-8')
    print(f'Selesai: {len(hasil)} diperiksa, {len(ulang)} perlu direkam ulang, '
          f'{sum(1 for v in hasil.values() if v.get("rawan"))} kalimat rawan untuk diperiksa telinga.')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    utama()
