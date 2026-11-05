"""Buat suara hewan yang belum punya rekaman asli dengan ElevenLabs Sound Effects.

Pemakaian (dari folder proyek, API key di tools/.elevenlabs-key):
    python tools/buat_bunyi_elevenlabs.py
Hasil: suara-hewan/<hewan>.mp3 — lalu tambahkan lumba-lumba, tikus, dan ular ke BUNYI_HEWAN di data.js,
dan jalankan ulang node tools/daftar-kalimat.js (tiruan bunyinya otomatis tidak direkam lagi).
"""
import json
import subprocess
import sys
import urllib.error
import urllib.request
from pathlib import Path

import imageio_ffmpeg

AKAR = Path(__file__).resolve().parent.parent
KUNCI = AKAR / 'tools' / '.elevenlabs-key'
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()

# Hewan yang tidak ada rekaman aslinya di Wikimedia Commons
PERMINTAAN = {
    'lumba-lumba': 'A dolphin clicking and whistling underwater, realistic nature recording, no music',
    'tikus': 'A small mouse squeaking several times, close up, realistic, no music',
    'ular': 'A snake hissing slowly, close up, realistic, no music',
    # Untuk "Ciap, ciap!" di dongeng ayam (lihat BUNYI_KALIMAT), bukan hewan tersendiri
    'anak-ayam': 'Baby chicks peeping softly, close up, realistic farm recording, no music',
}


def buat(teks: str, kunci: str) -> bytes:
    badan = json.dumps({'text': teks, 'duration_seconds': 3, 'prompt_influence': 0.6}).encode()
    req = urllib.request.Request('https://api.elevenlabs.io/v1/sound-generation', data=badan, method='POST',
                                 headers={'xi-api-key': kunci, 'Content-Type': 'application/json', 'Accept': 'audio/mpeg'})
    try:
        with urllib.request.urlopen(req, timeout=120) as r:
            return r.read()
    except urllib.error.HTTPError as e:
        sys.exit(f'Gagal dari ElevenLabs ({e.code}): {e.read().decode(errors="ignore")[:300]}')


if not KUNCI.exists() or not KUNCI.read_text().strip():
    sys.exit(f'API key belum ada. Tempel API key ElevenLabs ke file: {KUNCI}')
kunci = KUNCI.read_text().strip()
folder = AKAR / 'suara-hewan'
for nama, teks in PERMINTAAN.items():
    mentah = folder / f'_{nama}.mp3'
    mentah.write_bytes(buat(teks, kunci))
    # Samakan volume dengan rekaman hewan lainnya
    subprocess.run([FFMPEG, '-y', '-v', 'error', '-i', str(mentah), '-af',
                    'atrim=0:3.2,afade=t=out:st=2.7:d=0.5,loudnorm=I=-16:TP=-2:LRA=11',
                    '-ac', '1', '-ar', '44100', '-b:a', '64k', str(folder / f'{nama}.mp3')], check=True)
    mentah.unlink()
    print('dibuat:', f'suara-hewan/{nama}.mp3')
