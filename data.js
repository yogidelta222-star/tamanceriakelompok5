/* =========================================================
   Taman Ceria — Data: tokoh, hewan, jalan cerita, dan permainan
   Naskah dari pemilik proyek ("Narasi game"): mengenal hewan
   herbivora, karnivora, dan omnivora bersama Kiku dan tiga sahabat.
   ========================================================= */

// Tokoh yang berbicara. warna = warna tulisan ucapannya (sesuai naskah)
const TOKOH = {
  kiku: { nama: 'Kiku', sebutan: 'Kiku si Burung', gambar: 'gambar/kiku.webp', warna: '#e03131' },
  lili: { nama: 'Lili', sebutan: 'Lili si Kelinci', gambar: 'gambar/tokoh/lili.webp', warna: '#e64980' },
  leo: { nama: 'Leo', sebutan: 'Leo si Singa', gambar: 'gambar/tokoh/leo.webp', warna: '#e8590c' },
  bubu: { nama: 'Bubu', sebutan: 'Bubu si Beruang', gambar: 'gambar/tokoh/bubu.webp', warna: '#8d5524' },
};

// 15 hewan di Taman Ceria. makan = makanan kesukaan (Game 1), bukan = pilihan yang salah
const HEWAN = [
  { nama: 'sapi', kelompok: 'herbivora', gambar: 'gambar/hewan/sapi.webp', makan: 'rumput', bukan: ['daging', 'ikan'] },
  { nama: 'kelinci', kelompok: 'herbivora', gambar: 'gambar/hewan/kelinci.webp', makan: 'wortel', bukan: ['daging', 'ikan'] },
  { nama: 'kambing', kelompok: 'herbivora', gambar: 'gambar/hewan/kambing.webp', makan: 'daun', bukan: ['daging', 'ikan'] },
  { nama: 'rusa', kelompok: 'herbivora', gambar: 'gambar/hewan/rusa.webp', makan: 'tunas muda', bukan: ['daging', 'ikan'] },
  { nama: 'gajah', kelompok: 'herbivora', gambar: 'gambar/hewan/gajah.webp', makan: 'daun', bukan: ['daging', 'ikan'] },
  { nama: 'singa', kelompok: 'karnivora', gambar: 'gambar/hewan/singa.webp', makan: 'daging', bukan: ['rumput', 'wortel'] },
  { nama: 'harimau', kelompok: 'karnivora', gambar: 'gambar/hewan/harimau.webp', makan: 'daging', bukan: ['daun', 'wortel'] },
  { nama: 'buaya', kelompok: 'karnivora', gambar: 'gambar/hewan/buaya.webp', makan: 'ikan', bukan: ['rumput', 'wortel'] },
  { nama: 'elang', kelompok: 'karnivora', gambar: 'gambar/hewan/elang.webp', makan: 'daging', bukan: ['rumput', 'wortel'] },
  { nama: 'serigala', kelompok: 'karnivora', gambar: 'gambar/hewan/serigala.webp', makan: 'daging', bukan: ['daun', 'wortel'] },
  { nama: 'beruang', kelompok: 'omnivora', gambar: 'gambar/hewan/beruang.webp', makan: 'buah', bukan: ['rumput', 'daun'] },
  { nama: 'ayam', kelompok: 'omnivora', gambar: 'gambar/hewan/ayam.webp', makan: 'biji jagung', bukan: ['daging', 'rumput'] },
  { nama: 'babi', kelompok: 'omnivora', gambar: 'gambar/hewan/babi.webp', makan: 'sayuran', bukan: ['daging', 'rumput'] },
  { nama: 'bebek', kelompok: 'omnivora', gambar: 'gambar/hewan/bebek.webp', makan: 'biji-bijian', bukan: ['daging', 'wortel'] },
  { nama: 'monyet', kelompok: 'omnivora', gambar: 'gambar/hewan/monyet.webp', makan: 'pisang', bukan: ['daging', 'rumput'] },
];

const MAKANAN = {
  'rumput': '🌿', 'wortel': '🥕', 'daun': '🍃', 'tunas muda': '🌱', 'daging': '🍖', 'ikan': '🐟',
  'buah': '🍎', 'biji jagung': '🌽', 'sayuran': '🥬', 'biji-bijian': '🌾', 'pisang': '🍌',
};

const KELOMPOK = {
  herbivora: { nama: 'Herbivora', ket: 'Pemakan tumbuhan', ikon: '🌿', warna: '#2f9e44' },
  karnivora: { nama: 'Karnivora', ket: 'Pemakan daging', ikon: '🍖', warna: '#c92a2a' },
  omnivora: { nama: 'Omnivora', ket: 'Pemakan tumbuhan dan hewan', ikon: '🍽️', warna: '#e8590c' },
};

// Suara hewan asli (Wikimedia Commons, lihat suara-hewan/SUMBER.md): diputar saat hewan di adegan disentuh
const BUNYI_HEWAN = {
  'sapi': 'suara-hewan/sapi.mp3',
  'kambing': 'suara-hewan/kambing.mp3',
  'gajah': 'suara-hewan/gajah.mp3',
  'singa': 'suara-hewan/singa.mp3',
  'harimau': 'suara-hewan/harimau.mp3',
  'ayam': 'suara-hewan/ayam.mp3',
  'bebek': 'suara-hewan/bebek.mp3',
  'monyet': 'suara-hewan/monyet.mp3',
};

// Tiruan bunyi diputar dengan rekaman aslinya (tulisannya tetap tampil)
const BUNYI_KALIMAT = {
  'Cuit, cuit, cuit!': 'suara-hewan/burung.mp3',
};

// ---------- Jalan cerita ----------
// Setiap adegan: latar, hewan yang tampil, dan ucapan berurutan { s: tokoh, t: teks }
// tata = posisi di panggung [kiri %, bawah %, lebar %], disesuaikan dengan gambar latarnya
const ADEGAN = {
  pembuka: {
    judul: 'Selamat Datang di Taman Ceria', latar: 'hutan', kikuTerbang: true,
    ucapan: [
      { s: 'kiku', t: 'Halo, teman-teman! Selamat datang di Taman Ceria! 🌻' },
      { s: 'kiku', t: 'Wah, di taman ini ada banyak sekali hewan yang menarik, lho! Ada sapi, kelinci, singa, harimau, ayam, beruang, dan masih banyak lagi.' },
      { s: 'kiku', t: 'Tahukah teman-teman? Setiap hewan memiliki makanan yang berbeda. Ada hewan yang suka makan tumbuhan, ada yang makan daging, dan ada juga yang makan tumbuhan serta hewan lainnya.' },
      { s: 'kiku', t: 'Nah, hari ini kita akan berpetualang untuk mengenal tiga kelompok hewan, yaitu herbivora, karnivora, dan omnivora.' },
      { s: 'kiku', t: 'Kita akan mendengarkan cerita, menebak nama hewan, mencocokkan makanan, dan menyelesaikan berbagai permainan seru!' },
      { s: 'kiku', t: 'Yuk, teman-teman! Siapkan semangat kalian. Mari kita mulai petualangan mengenal dunia hewan di Taman Ceria! 🐰🐻🦁' },
    ],
  },
  perkenalan: {
    judul: 'Kenalan dengan Tiga Sahabat', latar: 'hutan', kiku: true,
    ucapan: [
      { s: 'kiku', t: 'Halo, teman-teman! Sebelum memulai petualangan, yuk kenalan dulu dengan tiga sahabat yang akan menemani kalian!' },
      { s: 'kiku', t: 'Ini Lili si Kelinci. Lili suka belajar dan memiliki rasa ingin tahu yang tinggi.', muncul: 'lili' },
      { s: 'kiku', t: 'Ini Leo si Singa. Leo pemberani dan suka menjelajahi tempat baru.', muncul: 'leo' },
      { s: 'kiku', t: 'Ini Bubu si Beruang. Bubu ramah dan menyukai berbagai macam makanan.', muncul: 'bubu' },
      { s: 'lili', t: 'Halo, teman-teman! Senang sekali bisa bertemu kalian!' },
      { s: 'leo', t: 'Ayo, kita berpetualang bersama!' },
      { s: 'bubu', t: 'Kita akan bertemu banyak teman hewan yang menarik!' },
    ],
  },
  pintu: {
    judul: 'Petualangan Tiga Sahabat', latar: 'pintu-tutup', sahabat: true,
    tata: { lili: [53, 3, 12], leo: [64, 3, 15], bubu: [78, 3, 13] },
    ucapan: [
      { s: 'kiku', t: 'Di suatu pagi yang cerah, Lili, Leo, dan Bubu menemukan sebuah pintu ajaib di balik pohon besar.' },
      { s: 'kiku', t: 'Saat pintu dibuka, muncul tulisan, selamat datang di Taman Pengetahuan Hewan!', aksi: 'buka-pintu' },
      { s: 'kiku', t: 'Mereka pun masuk dan memulai petualangan.', aksi: 'masuk-pintu' },
    ],
  },
  herbivora: {
    judul: 'Petualangan Pertama: Padang Rumput', latar: 'padang', sahabat: true,
    hewan: ['sapi', 'kelinci', 'kambing', 'rusa', 'gajah'],
    tata: {
      rusa: [86, 31, 10], kambing: [56, 19, 12], sapi: [35, 5, 19], kelinci: [58, 3, 8], gajah: [72, 2, 20],
    },
    ucapan: [
      { s: 'kiku', t: 'Di padang rumput, mereka bertemu sapi yang sedang makan rumput, kelinci yang sedang menikmati wortel, kambing yang memakan daun, rusa yang mencari tumbuhan muda, dan gajah yang sedang mengambil dedaunan.' },
      { s: 'bubu', t: 'Wah, kalian semua suka makan tumbuhan, ya?' },
      { s: 'lili', t: 'Iya! Hewan yang makanan utamanya berasal dari tumbuhan disebut herbivora.' },
      { s: 'kiku', t: 'Mereka pun mengenal sapi, kelinci, kambing, rusa, dan gajah sebagai hewan herbivora.' },
    ],
  },
  karnivora: {
    judul: 'Petualangan Kedua: Hutan', latar: 'rimba', sahabat: true,
    hewan: ['singa', 'harimau', 'buaya', 'elang', 'serigala'],
    tata: {
      elang: [76, 39, 11], serigala: [66, 23, 11], singa: [51, 7, 14], buaya: [35, 2, 19], harimau: [80, 5, 16],
    },
    ucapan: [
      { s: 'kiku', t: 'Kemudian, mereka berjalan menuju hutan. Di sana mereka bertemu singa, harimau, buaya, elang, dan serigala.' },
      { s: 'kiku', t: 'Singa berkata, kami suka memakan hewan lain, seperti daging dan ikan.' },
      { s: 'leo', t: 'Hewan yang makanan utamanya berasal dari hewan lain disebut karnivora.' },
      { s: 'lili', t: 'Baik, aku paham sekarang! Singa, harimau, buaya, elang, dan serigala termasuk karnivora.' },
    ],
  },
  omnivora: {
    judul: 'Petualangan Ketiga: Kebun Buah', latar: 'kebun', sahabat: true,
    hewan: ['ayam', 'babi', 'bebek', 'monyet'],
    tata: {
      monyet: [1, 37, 10], bebek: [62, 26, 9], ayam: [46, 4, 10], babi: [74, 4, 14],
      lili: [12, 3, 12], leo: [22, 3, 14], bubu: [33, 4, 12],
    },
    ucapan: [
      { s: 'kiku', t: 'Selanjutnya, mereka tiba di kebun buah. Di sana Bubu sedang menikmati buah-buahan.' },
      { s: 'lili', t: 'Apakah kamu hanya makan buah, Bubu?' },
      { s: 'bubu', t: 'Tidak! Aku juga bisa makan ikan. Aku suka makanan yang beragam!' },
      { s: 'kiku', t: 'Mereka juga bertemu ayam yang makan biji-bijian dan serangga, lalu babi, bebek, serta monyet.' },
      { s: 'bubu', t: 'Kami termasuk omnivora, yaitu hewan yang dapat memakan tumbuhan dan hewan.' },
      { s: 'kiku', t: 'Akhirnya, ketiga sahabat memahami tiga kelompok hewan beserta makanannya.' },
      { s: 'lili', t: 'Wah, ternyata banyak sekali hal yang bisa kita pelajari!' },
      { s: 'leo', t: 'Sekarang saatnya kita mengajak teman-teman bermain!' },
      { s: 'bubu', t: 'Ayo, kita mulai tantangannya!' },
    ],
  },
  penutup: {
    judul: 'Hore, Kalian Hebat!', latar: 'hutan', sahabat: true, kiku: true,
    ucapan: [
      { s: 'kiku', t: 'Horeeeee! Selamat, teman-teman! Kalian sudah berhasil menyelesaikan semua permainan di Taman Ceria!' },
      { s: 'kiku', t: 'Sekarang kalian sudah mengenal makanan hewan, mengelompokkan hewan, dan membedakan hewan herbivora, karnivora, serta omnivora.' },
      { s: 'kiku', t: 'Lili, Leo, dan Bubu bangga sekali kepada kalian! Jangan lupa untuk selalu menyayangi dan menjaga hewan-hewan di sekitar kita, ya!' },
      { s: 'kiku', t: 'Terima kasih sudah bermain bersama kami. Sampai jumpa di petualangan berikutnya!' },
    ],
  },
};

// ---------- Permainan ----------
const GAME = {
  makanan: {
    judul: 'Game 1: Mengenal Makanan Hewan', tokoh: 'lili', ronde: 6,
    pembuka: [
      'Halo, teman-teman! Sekarang bantu Lili mencarikan makanan kesukaan teman-teman hewan, yuk!',
      'Coba perhatikan gambar hewan yang muncul. Pilih makanan yang sesuai dengan hewan tersebut, ya!',
    ],
    tanya: (h) => `Apa makanan kesukaan ${h.nama}?`,
    benar: (h) => `Hore, benar! ${besar(h.nama)} suka makan ${h.makan}.`,
    salah: 'Hmm, bukan itu. Ayo coba lagi!',
    selesai: 'Hebat! Semua teman hewan sudah mendapat makanannya!',
  },
  kelompok: {
    judul: 'Game 2: Ayo Kelompokkan Hewan', tokoh: 'leo',
    pembuka: [
      'Yeay! Teman-teman berhasil membantu hewan menemukan makanannya!',
      'Sekarang Leo punya tantangan baru. Semua hewan di Taman Ceria sedang berkumpul dan bercampur menjadi satu.',
      'Ayo, bantu Leo memasukkan hewan-hewan tersebut ke kelompok yang benar!',
      'Tarik gambar hewan ke kotak kelompoknya, atau sentuh hewannya lalu sentuh kotaknya.',
    ],
    benar: (h) => `Pintar! ${besar(h.nama)} termasuk ${h.kelompok}.`,
    salah: 'Ups, belum tepat. Coba kotak yang lain, ya!',
    selesai: 'Hebat! Semua hewan sudah masuk ke kelompoknya!',
  },
  kuis: {
    judul: 'Game 3: Aku Sudah Pintar', tokoh: 'bubu',
    hewan: ['sapi', 'singa', 'ayam', 'kelinci', 'harimau', 'beruang', 'gajah', 'buaya', 'bebek', 'monyet'],
    pembuka: [
      'Horeee! Teman-teman sudah menyelesaikan dua permainan!',
      'Sekarang Bubu mempunyai tantangan terakhir untuk kalian. Jawablah pertanyaan yang muncul dengan benar, ya!',
      'Ayo, buktikan bahwa kalian sudah benar-benar mengenal hewan herbivora, karnivora, dan omnivora!',
    ],
    tanya: (h) => `${besar(h.nama)} termasuk kelompok hewan apa?`,
    benar: (h) => `Betul sekali! ${besar(h.nama)} termasuk ${h.kelompok}.`,
    salah: 'Hmm, bukan itu. Ayo coba sekali lagi!',
    selesai: 'Luar biasa! Semua pertanyaan sudah kamu jawab!',
  },
};

// Urutan perjalanan: adegan cerita dan permainan
const ALUR = ['pembuka', 'perkenalan', 'pintu', 'herbivora', 'karnivora', 'omnivora', 'makanan', 'kelompok', 'kuis', 'penutup'];
const LANGKAH = [
  { id: 'pembuka', ikon: '🌳', nama: 'Pembuka' },
  { id: 'perkenalan', ikon: '👋', nama: 'Kenalan' },
  { id: 'pintu', ikon: '📖', nama: 'Dongeng', bagian: ['pintu', 'herbivora', 'karnivora', 'omnivora'] },
  { id: 'makanan', ikon: '🥕', nama: 'Game 1' },
  { id: 'kelompok', ikon: '🧺', nama: 'Game 2' },
  { id: 'kuis', ikon: '🏆', nama: 'Game 3' },
  { id: 'penutup', ikon: '🎉', nama: 'Penutup' },
];

function besar(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
