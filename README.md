# 🌈 Taman Ceria — Belajar Sambil Bermain

Website belajar untuk anak PAUD, untuk mengenal hewan herbivora, karnivora, dan omnivora bersama **Kiku si Burung Biru** 🐦 dan tiga sahabatnya.

## Cara membuka

Klik dua kali **`index.html`**. Website langsung jalan di browser apa pun, tanpa internet.
Suara Kiku memakai rekaman bawaan di folder `suara/`, jadi folder itu harus selalu ikut disalin.

## Alur petualangan

1. **Pembuka**: Kiku si burung terbang ke dahan pohon lalu menyapa.
2. **Kenalan**: Kiku memperkenalkan Lili si Kelinci, Leo si Singa, dan Bubu si Beruang.
3. **Dongeng Tiga Sahabat**: pintu ajaib, lalu padang rumput (herbivora), hutan (karnivora), dan kebun buah (omnivora).
4. **Game 1 – Mengenal Makanan Hewan** (Lili): pilih makanan kesukaan hewan.
5. **Game 2 – Ayo Kelompokkan Hewan** (Leo): tarik 15 hewan ke kotak herbivora, karnivora, atau omnivora.
6. **Game 3 – Aku Sudah Pintar** (Bubu): kuis pilihan A, B, C.
7. **Penutup** (Kiku).

Setiap tokoh punya suara dan warna tulisan sendiri: Kiku merah, Lili pink, Leo oranye, Bubu cokelat.
Isi cerita dan permainan ada di **`data.js`**.

## Menambah atau mengubah materi

1. Ubah isinya di **`data.js`** (misalnya tambah hewan baru).
2. Buat rekaman suara untuk kalimat yang baru (butuh internet dan Python + Node.js):

```bash
node tools/daftar-kalimat.js
python tools/buat_suara_elevenlabs.py --logat
```

Suara direkam dengan ElevenLabs (API key di `tools/.elevenlabs-key`, tidak ikut diunggah).

Rekaman lama tidak dibuat ulang, jadi prosesnya cepat. Kalimat yang belum punya rekaman
tetap diucapkan memakai suara Bahasa Indonesia dari browser (Chrome/Edge) bila tersedia.

## Pengaturan suara (untuk guru / orang tua)

Tekan tombol ⚙️ di menu utama untuk memilih suara, mengatur kecepatan bicara, dan mencoba suara.
