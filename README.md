# 🌈 Taman Ceria — Belajar Sambil Bermain

Website belajar untuk anak PAUD, dipandu **Cuking si Kucing** 🐱 yang berbicara dalam Bahasa Indonesia.

## Cara membuka

Klik dua kali **`index.html`**. Website langsung jalan di browser apa pun, tanpa internet.
Suara Cuking memakai rekaman bawaan di folder `suara/`, jadi folder itu harus selalu ikut disalin.

## Isi permainan

| Permainan | Isi |
|---|---|
| 🐶 Tebak Hewan | nama, bunyi, ciri, tempat hidup, besar/kecil, "mana yang bukan hewan" |
| 🍎 Tebak Buah | nama, ciri, warna, "mana yang bukan buah" |
| 🎨 Tebak Warna | nama warna, "apa warna stroberi?" |
| 🔺 Tebak Bentuk | 8 bentuk dan contoh bendanya |
| 🔤 Tebak Huruf | huruf A–Z dan huruf depan kata |
| 🧮 Ayo Berhitung | menghitung, lebih banyak/sedikit, penjumlahan sederhana |
| 🚂 Urutkan Angka | kereta angka, roket hitung mundur, angka yang hilang |
| 📖 Kenalan Yuk | galeri hewan, buah, angka, warna, bentuk, huruf |

Setiap ronde berisi 5 soal acak. Soal yang baru saja muncul tidak langsung diulang.
Jumlah soal per ronde bisa diubah di `app.js` (cari `total: 5`).

## Menambah atau mengubah materi

1. Ubah isinya di **`data.js`** (misalnya tambah hewan baru).
2. Buat rekaman suara untuk kalimat yang baru (butuh internet dan Python + Node.js):

```bash
pip install edge-tts
node tools/daftar-kalimat.js
python tools/buat_suara.py
```

Rekaman lama tidak dibuat ulang, jadi prosesnya cepat. Kalimat yang belum punya rekaman
tetap diucapkan memakai suara Bahasa Indonesia dari browser (Chrome/Edge) bila tersedia.

## Pengaturan suara (untuk guru / orang tua)

Tekan tombol ⚙️ di menu utama untuk memilih suara, mengatur kecepatan bicara, dan mencoba suara.
