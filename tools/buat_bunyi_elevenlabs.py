"""Buat suara hewan yang belum punya rekaman asli dengan ElevenLabs Sound Effects.

Pemakaian (dari folder proyek, API key di tools/.elevenlabs-key):
    python tools/buat_bunyi_elevenlabs.py --versi 3          # buat 3 versi per hewan di suara-hewan/_pilihan/
    python tools/buat_bunyi_elevenlabs.py --pasang tikus=2   # pasang versi terpilih ke suara-hewan/tikus.mp3
Setelah dipasang: tambahkan lumba-lumba, tikus, dan ular ke BUNYI_HEWAN di data.js,
dan jalankan ulang node tools/daftar-kalimat.js (tiruan bunyinya otomatis tidak direkam lagi).
"""
import argparse
import json
import shutil
import subprocess
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

import imageio_ffmpeg

AKAR = Path(__file__).resolve().parent.parent
KUNCI = AKAR / 'tools' / '.elevenlabs-key'
FOLDER = AKAR / 'suara-hewan'
PILIHAN = FOLDER / '_pilihan'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# Hewan yang tidak ada rekaman aslinya di Wikimedia Commons
PERMINTAAN = {
    'lumba-lumba': 'A dolphin clicking and whistling at the water surface, realistic nature recording, no music, no voice',
    'tikus': 'A small house mouse squeaking several times, close up, realistic, no music, no voice',
    'ular': 'A snake hissing slowly and steadily, close up, realistic, no music, no voice',
    # Untuk "Ciap, ciap!" di dongeng ayam (lihat BUNYI_KALIMAT), bukan hewan tersendiri
    'anak-ayam': 'Baby chicks peeping softly, close up, realistic farm recording, no music, no voice',
    # Pengganti rekaman bebek Wikimedia yang kurang jelas
    'bebek': 'A single domestic duck quacking clearly several times, quack quack quack, close up, realistic farm recording, no music, no voice',
}


def buat(teks: str, kunci: str) -> bytes:
    badan = json.dumps({'text': teks, 'duration_seconds': 3, 'prompt_influence': 0.6}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation', data=badan, method='POST',
                                 headers={'xi-api-key': kunci, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    for coba in range(6):
        try:
            with urllib.request.urlopen(req, timeout=120) as r:
                return r.read()
        except urllib.error.HTTPError as e:
            if e.code in (429, 500, 502, 503, 504):
                time.sleep(5 * (coba + 1))
                continue
            sys.exit(f'Gagal dari ElevenLabs ({e.code}): {e.read().decode(errors="ignore")[:300]}')
    sys.exit('ElevenLabs sibuk terus, coba lagi nanti.')


def olah(mentah: Path, tujuan: Path):
    # Samakan dengan rekaman hewan lainnya: hening awal dibuang, maks 3,2 detik, volume disamakan
    subprocess.run([FFMPEG, '-y', '-v', 'error', '-i', str(mentah), '-af',
                    'silenceremove=start_periods=1:start_threshold=-45dB,atrim=0:3.2,afade=t=out:st=2.7:d=0.5,'
                    'loudnorm=I=-16:TP=-2:LRA=11',
                    '-ac', '1', '-ar', '44100', '-b:a', '64k', str(tujuan)], check=True)


def utama():
    ap = argparse.ArgumentParser()
    ap.add_argument('--versi', type=int, default=0, help='buat N versi per hewan untuk dipilih')
    ap.add_argument('--pasang', nargs='*', default=[], help='nama=nomor versi yang dipasang, mis. tikus=2')
    arg = ap.parse_args()

    for p in arg.pasang:
        nama, n = p.split('=')
        shutil.copyfile(PILIHAN / f'{nama}-{n}.mp3', FOLDER / f'{nama}.mp3')
        print('dipasang:', f'suara-hewan/{nama}.mp3', '<-', f'{nama}-{n}')
    if not arg.versi:
        return

    if not KUNCI.exists() or not KUNCI.read_text().strip():
        sys.exit(f'API key belum ada. Tempel API key ElevenLabs ke file: {KUNCI}')
    kunci = KUNCI.read_text().strip()
    PILIHAN.mkdir(parents=True, exist_ok=True)
    for nama, teks in PERMINTAAN.items():
        for n in range(1, arg.versi + 1):
            tujuan = PILIHAN / f'{nama}-{n}.mp3'
            if tujuan.exists():
                continue
            mentah = PILIHAN / f'_{nama}-{n}.mp3'
            mentah.write_bytes(buat(teks, kunci))
            olah(mentah, tujuan)
            mentah.unlink()
            print('dibuat:', tujuan.relative_to(AKAR), flush=True)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    utama()
