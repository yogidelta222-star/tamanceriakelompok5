"""Membuat rekaman suara Bahasa Indonesia untuk setiap kalimat Cuking.

Memakai suara neural "Gadis" (id-ID-GadisNeural) lewat paket edge-tts.
Butuh internet saat membuat rekaman; setelah jadi, website bisa bicara tanpa internet.

Cara pakai (dari folder proyek):
    pip install edge-tts
    node tools/daftar-kalimat.js
    python tools/buat_suara.py

Rekaman yang sudah ada tidak dibuat ulang, jadi menambah data cukup menjalankan ulang kedua perintah.
"""
import asyncio
import hashlib
import json
import sys
from pathlib import Path

import edge_tts

AKAR = Path(__file__).resolve().parent.parent
FOLDER = AKAR / 'suara'
WAKTU = AKAR / 'tools' / 'waktu-suara.json'  # catatan kapan ucapan selesai di tiap rekaman
SUARA = 'id-ID-GadisNeural'
KECEPATAN = '-5%'   # sedikit lebih pelan agar mudah ditangkap anak; nada dibiarkan asli supaya alami
SERENTAK = 6


def nama_berkas(kalimat: str) -> str:
    return hashlib.md5(kalimat.encode('utf-8')).hexdigest()[:12] + '.mp3'


async def rekam(kalimat: str, batas: asyncio.Semaphore, waktu: dict, gagal: list) -> None:
    nama = nama_berkas(kalimat)
    tujuan = FOLDER / nama
    if tujuan.exists() and nama in waktu:
        return
    sementara = tujuan.with_suffix('.tmp')
    async with batas:
        for coba in range(4):
            try:
                akhir = 0.0
                with open(sementara, 'wb') as berkas:
                    async for potong in edge_tts.Communicate(kalimat, SUARA, rate=KECEPATAN, boundary='WordBoundary').stream():
                        if potong['type'] == 'audio':
                            berkas.write(potong['data'])
                        elif potong['type'] == 'WordBoundary':
                            akhir = max(akhir, (potong['offset'] + potong['duration']) / 1e7)
                sementara.replace(tujuan)
                # Hening di akhir rekaman (±0,9 detik) dilewati pemutar; sisakan 0,08 detik agar tidak terpotong
                waktu[nama] = round(akhir + 0.08, 3)
                return
            except Exception:
                await asyncio.sleep(2 * (coba + 1))
    sementara.unlink(missing_ok=True)
    gagal.append(kalimat)


async def utama() -> None:
    kalimat = json.loads((AKAR / 'tools' / 'kalimat.json').read_text(encoding='utf-8'))
    FOLDER.mkdir(exist_ok=True)
    waktu = json.loads(WAKTU.read_text(encoding='utf-8')) if WAKTU.exists() else {}
    batas = asyncio.Semaphore(SERENTAK)
    gagal: list = []

    selesai = 0
    for tugas in asyncio.as_completed([rekam(k, batas, waktu, gagal) for k in kalimat]):
        await tugas
        selesai += 1
        if selesai % 100 == 0 or selesai == len(kalimat):
            print(f'{selesai}/{len(kalimat)}', flush=True)
            WAKTU.write_text(json.dumps(waktu, indent=0), encoding='utf-8')

    peta = {k: [nama_berkas(k), waktu[nama_berkas(k)]] for k in kalimat
            if (FOLDER / nama_berkas(k)).exists() and nama_berkas(k) in waktu}

    # Hapus rekaman lama yang kalimatnya sudah tidak dipakai
    dipakai = {berkas for berkas, _ in peta.values()}
    for berkas in FOLDER.glob('*.mp3'):
        if berkas.name not in dipakai:
            berkas.unlink()
    WAKTU.write_text(json.dumps({n: waktu[n] for n in dipakai}, indent=0), encoding='utf-8')

    (FOLDER / 'daftar.js').write_text(
        '// Dibuat otomatis oleh tools/buat_suara.py, jangan diubah manual.\n'
        '// Isi: kalimat -> [berkas rekaman, detik saat ucapan selesai]\n'
        'window.KLIP_SUARA = ' + json.dumps(peta, ensure_ascii=False, separators=(',', ':')) + ';\n',
        encoding='utf-8',
    )
    print(f'Selesai: {len(peta)} rekaman, gagal: {len(gagal)}')
    for k in gagal:
        print('  GAGAL:', k)


if __name__ == '__main__':
    sys.stdout.reconfigure(encoding='utf-8')
    asyncio.run(utama())
