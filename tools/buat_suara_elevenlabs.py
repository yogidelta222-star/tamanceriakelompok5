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
    python tools/buat_suara_elevenlabs.py --ulang daftar.json   # rekam ulang kalimat tertentu
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
from concurrent.futures import ThreadPoolExecutor, as_completed
from pathlib import Path

import imageio_ffmpeg

# ---- Pengaturan suara (isi sesuai pilihan di ElevenLabs) ----
# Suara pilihan: "Velora - Warm, Youthful & Conversational"
SUARA_ID = 'TrU3igk19A4aIUi2GAA2'   # Kiku (Velora)
# Suara tokoh lain; kalimatnya di kalimat.json diberi awalan "tokoh|"
SUARA_TOKOH = {
    'lili': 'd15jrIAARvF899pDoC6T',   # Kak Ceria - Cute Kids Storyteller
    'leo': 'THv4P0RGwO160U4WGB6c',    # Akbar - deep, slightly raspy
    'bubu': '8py0rPdIK626Y4I858QV',   # Alvar - Warm, Clear & Natural
}
MODEL = 'eleven_v3'      # atau 'eleven_multilingual_v2' (lebih stabil untuk kalimat sangat pendek)
# Eleven v3: stability 0.0 = Creative, 0.5 = Natural (dipakai saat uji coba), 1.0 = Robust
PENGATURAN = {'stability': 0.5, 'similarity_boost': 0.75, 'use_speaker_boost': True}

AKAR = Path(__file__).resolve().parent.parent
FOLDER = AKAR / 'suara'
WAKTU = AKAR / 'tools' / 'waktu-suara.json'
SELESAI = AKAR / 'tools' / 'elevenlabs-selesai.json'   # kalimat yang sudah direkam ElevenLabs
KUNCI = AKAR / 'tools' / '.elevenlabs-key'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()


def nama_berkas(kalimat: str) -> str:
    # Sama dengan tools/buat_suara.py agar daftar.js tetap cocok
    return hashlib.md5(kalimat.encode('utf-8')).hexdigest()[:12] + '.mp3'


class GagalElevenLabs(Exception):
    pass


AWALAN = ''   # diisi '[Indonesian accent] ' oleh --logat; tidak ikut diucapkan


def rekam(kalimat: str, kunci: str) -> bytes:
    tokoh, _, teks = kalimat.partition('|') if '|' in kalimat else ('', '', kalimat)
    suara = SUARA_TOKOH.get(tokoh, SUARA_ID)
    url = f'https://api.elevenlabs.io/v1/text-to-speech/{suara}?output_format=mp3_44100_128'
    badan = json.dumps({'text': AWALAN + teks, 'model_id': MODEL, 'language_code': 'id', 'voice_settings': PENGATURAN}).encode()
    req = urllib.request.Request(url, data=badan, method='POST',
                                 headers={'xi-api-key': kunci, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    for coba in range(6):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            pesan = e.read().decode(errors='ignore')[:300]
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(5 * (coba + 1))
                continue
            raise GagalElevenLabs(f'Gagal dari ElevenLabs ({e.code}): {pesan}')
        except (urllib.error.URLError, TimeoutError, ConnectionError):
            time.sleep(5 * (coba + 1))
    raise GagalElevenLabs('ElevenLabs sibuk terus, coba lagi nanti.')


def batas_ucapan(berkas: Path):
    """Detik awal & akhir ucapan (hening di depan/belakang dilewati pemutar)."""
    keluar = subprocess.run([FFMPEG, '-i', str(berkas), '-af', 'silencedetect=noise=-45dB:d=0.1', '-f', 'null', '-'],
                            capture_output=True, text=True).stderr
    durasi = re.search(r'Duration: (\d+):(\d+):([\d.]+)', keluar)
    total = int(durasi.group(1)) * 3600 + int(durasi.group(2)) * 60 + float(durasi.group(3))
    mulai = [float(x) for x in re.findall(r'silence_start: (-?[\d.]+)', keluar)]
    selesai = [float(x) for x in re.findall(r'silence_end: ([\d.]+)', keluar)]
    awal = selesai[0] if mulai and mulai[0] <= 0.05 and selesai else 0.0
    akhir = mulai[-1] if mulai and (len(selesai) < len(mulai) or selesai[-1] >= total - 0.05) else total
    return round(max(0.0, awal - 0.05), 3), round(min(total, akhir + 0.15), 3)


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
    ap.add_argument('--ulang', help='file JSON berisi daftar kalimat yang direkam ulang (menimpa rekaman lama)')
    ap.add_argument('--serentak', type=int, default=4, help='jumlah rekaman yang diminta bersamaan')
    ap.add_argument('--logat', action='store_true', help='beri petunjuk logat Indonesia (mencegah logat Malaysia)')
    arg = ap.parse_args()
    global AWALAN
    AWALAN = '[Indonesian accent] ' if arg.logat else ''

    kalimat = json.loads((AKAR / 'tools' / 'kalimat.json').read_text(encoding='utf-8'))
    sudah = set(json.loads(SELESAI.read_text(encoding='utf-8'))) if SELESAI.exists() else set()
    if arg.ulang:
        ulang = set(json.loads(Path(arg.ulang).read_text(encoding='utf-8')))
        sisa = [k for k in kalimat if k in ulang]
    else:
        sisa = [k for k in kalimat if k not in sudah]
    if arg.contoh:
        # Contoh yang mewakili: sapaan, pujian, soal, kalimat sangat pendek, dan sepotong dongeng
        pola = [r'^Halo, teman-teman!$', r'^Kamu hebat sekali!$', r'^Siapa yang badannya bergaris', r'^Tiga!$', r'^Setiap pagi, Kak Anjing']
        prioritas = [next(k for k in sisa if re.match(p, k)) for p in pola if any(re.match(p, k) for k in sisa)]
        sisa = (prioritas + [k for k in sisa if k not in prioritas])[:arg.contoh]
    jumlah = sum(len(k) for k in sisa)
    print(f'{len(sisa)} kalimat, {jumlah:,} karakter akan direkam (model {MODEL}).', flush=True)
    if arg.hitung or not sisa:
        return
    if 'ISI_VOICE_ID' in SUARA_ID:
        sys.exit('Isi dulu SUARA_ID di bagian atas file ini.')
    if not KUNCI.exists() or not KUNCI.read_text().strip():
        sys.exit(f'API key belum ada. Tempel API key ElevenLabs ke file: {KUNCI}')
    kunci = KUNCI.read_text().strip()

    waktu = json.loads(WAKTU.read_text(encoding='utf-8')) if WAKTU.exists() else {}
    FOLDER.mkdir(exist_ok=True)

    def satu(k):
        berkas = FOLDER / nama_berkas(k)
        sementara = berkas.with_suffix('.tmp')
        sementara.write_bytes(rekam(k, kunci))
        sementara.replace(berkas)
        return k, berkas, batas_ucapan(berkas)

    def simpan():
        WAKTU.write_text(json.dumps(waktu, indent=0), encoding='utf-8')
        SELESAI.write_text(json.dumps(sorted(sudah), ensure_ascii=False, indent=0), encoding='utf-8')
        tulis_daftar(kalimat, waktu)

    gagal = None
    with ThreadPoolExecutor(max_workers=arg.serentak) as kolam:
        tugas = [kolam.submit(satu, k) for k in sisa]
        for i, t in enumerate(as_completed(tugas), start=1):
            try:
                k, berkas, batas = t.result()
            except GagalElevenLabs as e:
                gagal = gagal or str(e)
                for lain in tugas:
                    lain.cancel()
                continue
            waktu[berkas.name] = list(batas)
            sudah.add(k)
            if arg.contoh:
                print('  contoh:', k, '->', berkas.name, flush=True)
            if i % 25 == 0:
                simpan()
                print(f'{i}/{len(sisa)}', flush=True)
    simpan()
    if gagal:
        sys.exit(gagal + ' (rekaman yang sudah jadi tersimpan; jalankan lagi untuk melanjutkan)')
    print(f'Selesai: {len(sisa)} kalimat direkam.', flush=True)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    utama()
