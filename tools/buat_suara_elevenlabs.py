"""Rekam semua kalimat Cuking dengan suara ElevenLabs (menggantikan suara Gadis).

Persiapan (sekali saja):
    pip install imageio-ffmpeg
    1. Buat API key di ElevenLabs (profil -> API Keys).
    2. Tempel API key itu ke file  tools/.elevenlabs-key  (file ini tidak ikut ke GitHub).
    3. Isi SUARA_ID dan MODEL di bawah sesuai pilihan.

Pemakaian (dari folder proyek):
    node tools/daftar-kalimat.js
    python tools/buat_suara_elevenlabs.py --hitung      # hanya menghitung karakter / kredit
    python tools/buat_suara_elevenlabs.py --contoh 5     # rekam 5 kalimat contoh untuk didengar dulu
    python tools/buat_suara_elevenlabs.py                # rekam semua (yang sudah jadi dilewati)
"""
import argparse
import hashlib
import json
import re
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import imageio_ffmpeg

# ---- Pengaturan suara (isi sesuai pilihan di ElevenLabs) ----
SUARA_ID = 'ISI_VOICE_ID_DI_SINI'
MODEL = 'eleven_multilingual_v2'      # atau 'eleven_v3' / 'eleven_flash_v2_5'
PENGATURAN = {'stability': 0.45, 'similarity_boost': 0.8, 'style': 0.35, 'use_speaker_boost': True}

AKAR = Path(__file__).resolve().parent.parent
FOLDER = AKAR / 'suara'
WAKTU = AKAR / 'tools' / 'waktu-suara.json'
SELESAI = AKAR / 'tools' / 'elevenlabs-selesai.json'   # kalimat yang sudah direkam ElevenLabs
KUNCI = AKAR / 'tools' / '.elevenlabs-key'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def nama_berkas(kalimat: str) -> str:
    # Sama dengan tools/buat_suara.py agar daftar.js tetap cocok
    return hashlib.md5(kalimat.encode('utf-8')).hexdigest()[:12] + '.mp3'


def rekam(kalimat: str, kunci: str) -> bytes:
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{SUARA_ID}?output_format=mp3_44100_64'
    badan = json.dumps({'text': kalimat, 'model_id': MODEL, 'language_code': 'id', 'voice_settings': PENGATURAN}).encode()
    req = urllib.request.Request(url, data=badan, method='POST',
                                 headers={'xi-api-key': kunci, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    for coba in range(4):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            pesan = e.read().decode(errors='ignore')[:300]
            if e.code in (429, 500, 502, 503):
                time.sleep(5 * (coba + 1))
                continue
            sys.exit(f'Gagal dari ElevenLabs ({e.code}): {pesan}')
    sys.exit('ElevenLabs sibuk terus, coba lagi nanti.')


def batas_ucapan(berkas: Path):
    """Detik awal & akhir ucapan (hening di depan/belakang dilewati pemutar)."""
    keluar = subprocess.run([FFMPEG, '-i', str(berkas), '-af', 'silencedetect=noise=-40dB:d=0.1', '-f', 'null', '-'],
                            capture_output=True, text=True).stderr
    durasi = re.search(r'Duration: (\d+):(\d+):([\d.]+)', keluar)
    total = int(durasi.group(1)) * 3600 + int(durasi.group(2)) * 60 + float(durasi.group(3))
    mulai = [float(x) for x in re.findall(r'silence_start: (-?[\d.]+)', keluar)]
    selesai = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', keluar)]
    awal = selesai[0] if mulai and mulai[0] <= 0.05 and selesai else 0.0
    akhir = mulai[-1] if mulai and (len(selesai) < len(mulai) or selesai[-1] >= total - 0.05) else total
    return round(max(0.0, awal - 0.05), 3), round(min(total, akhir + 0.08), 3)


def tulis_daftar(kalimat: list, waktu: dict):
    peta = {}
    for k in kalimat:
        b = nama_berkas(k)
        if (FOLDER / b).exists() and b in waktu:
            w = waktu[b]
            peta[k] = [b, w[1], w[0]] if isinstance(w, list) else [b, w]
    (FOLDER / 'daftar.js').write_text(
        '// Dibuat otomatis oleh tools/buat_suara*.py, jangan diubah manual.\n'
        '// Isi: kalimat -> [berkas rekaman, detik ucapan selesai, detik ucapan mulai (opsional)]\n'
        'window.KLIP_SUARA = ' + json.dumps(peta, ensure_ascii=False, separators=(',', ':')) + ';\n', encoding='utf-8')


def utama():
    ap = argparse.ArgumentParser()
    ap.add_argument('--hitung', action='store_true', help='hanya hitung karakter yang akan direkam')
    ap.add_argument('--contoh', type=int, default=0, help='rekam N kalimat contoh saja')
    arg = ap.parse_args()

    kalimat = json.loads((AKAR / 'tools' / 'kalimat.json').read_text(encoding='utf-8'))
    sudah = set(json.loads(SELESAI.read_text(encoding='utf-8'))) if SELESAI.exists() else set()
    sisa = [k for k in kalimat if k not in sudah]
    if arg.contoh:
        # Contoh yang mewakili: sapaan, pujian, soal, dan sepotong dongeng
        prioritas = [k for k in sisa if re.match(r'^(Halo|Hore|Meong|Ingat dongengnya|Buah apa|Di sebuah peternakan)', k)]
        sisa = (prioritas + sisa)[:arg.contoh]
    jumlah = sum(len(k) for k in sisa)
    print(f'{len(sisa)} kalimat, {jumlah:,} karakter akan direkam (model {MODEL}).')
    if arg.hitung:
        return
    if 'ISI_VOICE_ID' in SUARA_ID:
        sys.exit('Isi dulu SUARA_ID di bagian atas file ini.')
    if not KUNCI.exists() or not KUNCI.read_text().strip():
        sys.exit(f'API key belum ada. Tempel API key ElevenLabs ke file: {KUNCI}')
    kunci = KUNCI.read_text().strip()

    waktu = json.loads(WAKTU.read_text(encoding='utf-8')) if WAKTU.exists() else {}
    FOLDER.mkdir(exist_ok=True)
    for i, k in enumerate(sisa, start=1):
        berkas = FOLDER / nama_berkas(k)
        berkas.write_bytes(rekam(k, kunci))
        waktu[berkas.name] = list(batas_ucapan(berkas))
        sudah.add(k)
        if i % 20 == 0 or i == len(sisa):
            WAKTU.write_text(json.dumps(waktu, indent=0), encoding='utf-8')
            SELESAI.write_text(json.dumps(sorted(sudah), ensure_ascii=False, indent=0), encoding='utf-8')
            tulis_daftar(kalimat, waktu)
            print(f'{i}/{len(sisa)}', flush=True)
        if arg.contoh:
            print('  contoh:', k, '->', berkas.name)
    print('Selesai. Buka website dan dengarkan hasilnya.')


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    utama()
