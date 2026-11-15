/* =========================================================
   Taman Ceria — Data: tokoh, hewan, jalan cerita, dan permainan
   Mengenal hewan herbivora, karnivora, dan omnivora bersama Kiku.
   Alur: Pembuka → Kenalan Yuk → 4 permainan tebak-tebakan → Penutup
   ========================================================= */

// Tokoh yang berbicara. warna = warna tulisan ucapannya
const TOKOH = {
  kiku: { nama: 'Kiku', sebutan: 'Kiku si Burung', gambar: 'gambar/kiku.webp', warna: '#e03131' },
  lili: { nama: 'Lili', sebutan: 'Lili si Kelinci', gambar: 'gambar/tokoh/lili.webp', warna: '#e64980' },
  leo: { nama: 'Leo', sebutan: 'Leo si Singa', gambar: 'gambar/tokoh/leo.webp', warna: '#e8590c' },
  bubu: { nama: 'Bubu', sebutan: 'Bubu si Beruang', gambar: 'gambar/tokoh/bubu.webp', warna: '#8d5524' },
};

// 15 hewan di Taman Ceria
// penjelasan = dibacakan Kiku di Kenalan Yuk; petunjuk = tebak-tebakan (Game 1)
// makan = makanan kesukaan (Game 2), bukan = pilihan yang salah
const HEWAN = [
  // ---------- Karnivora ----------
  {
    nama: 'singa', kelompok: 'karnivora', gambar: 'gambar/hewan/singa.webp', makan: 'daging', bukan: ['rumput', 'wortel'],
    petunjuk: 'Aku dijuluki raja hutan. Aku punya rambut tebal di sekeliling kepalaku.',
    penjelasan: 'Ini singa. Singa dijuluki raja hutan, karena tubuhnya besar, kuat, dan auman suaranya sangat keras. Singa termasuk hewan karnivora, yaitu hewan pemakan daging. Singa jantan punya rambut tebal di sekeliling kepalanya, yang disebut surai. Singa betina tidak punya surai, tetapi ia sangat pandai berburu. Singa punya gigi yang tajam dan cakar yang kuat untuk menangkap mangsanya. Singa hidup berkelompok bersama keluarganya. Siang hari, singa suka bermalas-malasan dan tidur di bawah pohon yang rindang. Singa tinggal di padang rumput yang luas di Afrika.',
  },
  {
    nama: 'harimau', kelompok: 'karnivora', gambar: 'gambar/hewan/harimau.webp', makan: 'daging', bukan: ['daun', 'wortel'],
    petunjuk: 'Buluku oranye dengan garis-garis hitam. Aku kucing besar yang kuat.',
    penjelasan: 'Ini harimau. Harimau adalah kucing besar yang kuat dan pemberani. Harimau termasuk hewan karnivora, artinya harimau makan daging. Bulu harimau berwarna oranye dengan garis-garis hitam. Setiap harimau punya pola garis yang berbeda, seperti sidik jari kita. Harimau pandai mengendap-endap dengan pelan, lalu menerkam mangsanya dengan cepat. Berbeda dengan kucing di rumah, harimau suka berenang dan bermain air. Di Indonesia ada harimau Sumatra yang hidup di hutan. Jumlah harimau Sumatra tinggal sedikit, jadi kita harus ikut menjaga hutan tempat tinggalnya.',
  },
  {
    nama: 'buaya', kelompok: 'karnivora', gambar: 'gambar/hewan/buaya.webp', makan: 'ikan', bukan: ['rumput', 'wortel'],
    petunjuk: 'Kulitku keras dan bersisik. Aku suka berjemur di tepi sungai.',
    penjelasan: 'Ini buaya. Buaya adalah hewan yang hidup di sungai dan rawa. Buaya termasuk hewan karnivora, yang makan ikan dan hewan lainnya. Kulit buaya keras dan bersisik, seperti baju pelindung. Mulut buaya panjang, dengan banyak gigi yang tajam. Buaya pandai berenang, dan bisa diam lama sekali di dalam air. Kadang hanya mata dan hidungnya saja yang terlihat di atas air. Buaya suka berjemur di tepi sungai untuk menghangatkan badannya. Buaya bertelur, dan induk buaya menjaga telurnya dengan baik. Kalau melihat buaya, kita harus menjauh dan tidak boleh mendekat, ya!',
  },
  {
    nama: 'serigala', kelompok: 'karnivora', gambar: 'gambar/hewan/serigala.webp', makan: 'daging', bukan: ['daun', 'wortel'],
    petunjuk: 'Aku mirip anjing. Malam hari aku suka melolong memanggil teman-temanku.',
    penjelasan: 'Ini serigala. Serigala adalah hewan yang mirip dengan anjing. Serigala termasuk hewan karnivora, yaitu hewan pemakan daging. Bulu serigala tebal, sehingga badannya tetap hangat walaupun udara sangat dingin. Hidung serigala sangat tajam, ia bisa mencium bau dari tempat yang jauh. Serigala hidup berkelompok, yang disebut kawanan. Mereka berburu bersama dan saling membantu. Pada malam hari, serigala suka melolong untuk memanggil teman-temannya. Serigala tinggal di hutan dan pegunungan, di negeri yang dingin.',
  },
  {
    nama: 'elang', kelompok: 'karnivora', gambar: 'gambar/hewan/elang.webp', makan: 'daging', bukan: ['rumput', 'wortel'],
    petunjuk: 'Aku burung yang terbang tinggi di langit. Mataku sangat tajam.',
    penjelasan: 'Ini elang. Elang adalah burung yang besar dan kuat. Elang termasuk hewan karnivora, yang makan daging, seperti ikan, tikus, dan ular. Sayap elang lebar, sehingga ia bisa terbang tinggi sekali di langit. Mata elang sangat tajam. Dari tempat yang tinggi, elang bisa melihat hewan kecil di tanah. Elang punya paruh yang bengkok dan cakar yang tajam untuk menangkap mangsanya. Elang membuat sarang di pohon yang tinggi atau di tebing. Di Indonesia ada elang Jawa, burung langka yang harus kita lindungi bersama.',
  },
  // ---------- Omnivora ----------
  {
    nama: 'ayam', kelompok: 'omnivora', gambar: 'gambar/hewan/ayam.webp', makan: 'biji jagung', bukan: ['daging', 'rumput'],
    petunjuk: 'Di kepalaku ada jengger merah. Setiap pagi aku berkokok membangunkan kalian.',
    penjelasan: 'Ini ayam. Ayam termasuk hewan omnivora, artinya ayam makan tumbuhan dan juga hewan kecil. Ayam suka makan biji jagung, beras, dan juga cacing atau serangga. Ayam punya paruh untuk mematuk makanan, dan jengger merah di kepalanya. Ayam jantan disebut ayam jago. Setiap pagi, ayam jago berkokok untuk membangunkan kita. Ayam betina disebut induk ayam, dan ia bertelur. Telur yang dierami induk ayam akan menetas menjadi anak ayam yang lucu. Ayam punya sayap, tetapi ayam tidak pandai terbang tinggi.',
  },
  {
    nama: 'bebek', kelompok: 'omnivora', gambar: 'gambar/hewan/bebek.webp', makan: 'biji-bijian', bukan: ['daging', 'wortel'],
    petunjuk: 'Aku pandai berenang di kolam. Aku suka berjalan berbaris dengan teman-temanku.',
    penjelasan: 'Ini bebek. Bebek termasuk hewan omnivora, yang suka makan biji-bijian, tumbuhan air, cacing, dan ikan kecil. Bebek pandai sekali berenang. Kaki bebek berselaput, seperti dayung, sehingga ia bisa mengayuh di air. Bulu bebek berminyak, jadi badannya tidak basah saat berenang. Paruh bebek lebar dan pipih, untuk mencari makanan di lumpur dan air. Bebek suka berjalan beramai-ramai sambil berbaris dengan rapi. Bebek juga bertelur, dan telurnya lebih besar dari telur ayam. Bebek tinggal di dekat sawah, kolam, dan sungai.',
  },
  {
    nama: 'monyet', kelompok: 'omnivora', gambar: 'gambar/hewan/monyet.webp', makan: 'pisang', bukan: ['daging', 'rumput'],
    petunjuk: 'Aku pandai memanjat dan bergelantungan di pohon. Makanan kesukaanku pisang.',
    penjelasan: 'Ini monyet. Monyet termasuk hewan omnivora, yang suka makan buah-buahan, daun, dan serangga kecil. Makanan kesukaan monyet adalah pisang. Monyet pandai sekali memanjat dan bergelantungan di pohon. Ekornya yang panjang membantu monyet menjaga keseimbangan. Tangan monyet bisa memegang dan mengupas buah, mirip seperti tangan kita. Monyet hidup berkelompok dan suka bermain bersama. Mereka juga saling membersihkan bulu teman-temannya. Monyet tinggal di hutan yang banyak pohonnya.',
  },
  {
    nama: 'beruang', kelompok: 'omnivora', gambar: 'gambar/hewan/beruang.webp', makan: 'buah', bukan: ['rumput', 'daun'],
    petunjuk: 'Badanku besar dan buluku tebal. Aku suka makan madu dan ikan.',
    penjelasan: 'Ini beruang. Beruang adalah hewan yang besar, dengan bulu yang tebal. Beruang termasuk hewan omnivora, yang makan tumbuhan dan juga hewan. Beruang suka makan buah-buahan, madu, dan ikan. Beruang pandai menangkap ikan di sungai dengan cakarnya yang kuat. Hidung beruang sangat tajam, sehingga ia bisa mencium bau makanan dari jauh. Beruang juga pandai memanjat pohon. Di negeri yang dingin, beruang tidur panjang selama musim dingin. Di Indonesia ada beruang madu, beruang kecil yang suka sekali makan madu.',
  },
  {
    nama: 'tupai', kelompok: 'omnivora', gambar: 'gambar/hewan/tupai.webp', makan: 'kacang', bukan: ['ikan', 'rumput'],
    petunjuk: 'Aku kecil dan lincah melompat di pohon. Aku suka makan kacang, dan ekorku lebat.',
    penjelasan: 'Ini tupai. Tupai adalah hewan kecil yang sangat lincah. Tupai termasuk hewan omnivora, yang makan tumbuhan dan juga serangga kecil. Tupai suka makan kacang, biji-bijian, dan buah-buahan. Tupai memegang makanan dengan kedua tangan kecilnya, lalu menggigitnya sedikit demi sedikit. Gigi tupai kuat, sehingga ia bisa membuka kulit kacang yang keras. Ekor tupai panjang dan berbulu lebat. Ekor itu membantu tupai menjaga keseimbangan saat melompat dari dahan ke dahan. Tupai tinggal di pohon, dan suka menyimpan makanan untuk dimakan nanti.',
  },
  // ---------- Herbivora ----------
  {
    nama: 'sapi', kelompok: 'herbivora', gambar: 'gambar/hewan/sapi.webp', makan: 'rumput', bukan: ['daging', 'ikan'],
    petunjuk: 'Aku punya empat kaki dan suka makan rumput. Aku memberi kalian susu yang sehat.',
    penjelasan: 'Ini sapi. Sapi termasuk hewan herbivora, artinya sapi hanya makan tumbuhan. Makanan kesukaan sapi adalah rumput hijau yang segar. Sapi punya badan yang besar, empat kaki yang kuat, dan ekor panjang untuk mengusir lalat. Sapi mengunyah makanannya lama sekali. Rumput yang sudah ditelan pun bisa dikunyah lagi, lho! Sapi tinggal di peternakan dan dirawat oleh peternak. Sapi memberi kita susu yang sehat dan bergizi. Ayo kita sayangi sapi, ya!',
  },
  {
    nama: 'kambing', kelompok: 'herbivora', gambar: 'gambar/hewan/kambing.webp', makan: 'daun', bukan: ['daging', 'ikan'],
    petunjuk: 'Aku punya tanduk kecil dan janggut di daguku. Aku suka makan daun.',
    penjelasan: 'Ini kambing. Kambing termasuk hewan herbivora, yaitu hewan pemakan tumbuhan. Kambing suka sekali makan daun dan rumput. Kambing punya tanduk kecil di kepalanya, dan janggut di dagunya. Kaki kambing lincah, jadi kambing pandai memanjat bukit yang berbatu. Bulu kambing ada yang putih, hitam, dan cokelat. Kambing biasanya tinggal di kandang dan dirawat oleh peternak. Kambing juga bisa memberi kita susu, lho! Kalau bertemu kambing, berikan dia daun yang segar, ya!',
  },
  {
    nama: 'kelinci', kelompok: 'herbivora', gambar: 'gambar/hewan/kelinci.webp', makan: 'wortel', bukan: ['daging', 'ikan'],
    petunjuk: 'Telingaku panjang dan aku pandai melompat. Aku suka makan wortel.',
    penjelasan: 'Ini kelinci. Kelinci termasuk hewan herbivora, yang suka makan wortel, sayuran, dan rumput. Kelinci punya telinga yang panjang, sehingga pendengarannya sangat tajam. Bulunya lembut, dan ekornya kecil dan bulat seperti kapas. Kaki belakang kelinci kuat, jadi kelinci pandai melompat jauh. Gigi depan kelinci terus tumbuh, karena itu kelinci suka mengunyah agar giginya tidak terlalu panjang. Di alam, kelinci tinggal di lubang di dalam tanah. Kelinci juga bisa dipelihara di rumah sebagai hewan kesayangan. Kalau memegang kelinci, lakukan dengan pelan dan lembut, ya!',
  },
  {
    nama: 'gajah', kelompok: 'herbivora', gambar: 'gambar/hewan/gajah.webp', makan: 'daun', bukan: ['daging', 'ikan'],
    petunjuk: 'Badanku sangat besar. Aku punya belalai yang panjang dan telinga yang lebar.',
    penjelasan: 'Ini gajah. Gajah adalah hewan darat yang paling besar di dunia. Walaupun badannya besar, gajah termasuk hewan herbivora, yang hanya makan tumbuhan. Gajah suka makan daun, rumput, batang pisang, dan buah-buahan. Gajah punya belalai yang panjang. Belalai dipakai untuk mengambil makanan, minum, dan menyemprotkan air saat mandi. Telinga gajah lebar seperti kipas, untuk mendinginkan badannya. Gajah hidup berkelompok dan saling menjaga, seperti sebuah keluarga. Di Indonesia ada gajah Sumatra yang harus kita jaga bersama.',
  },
  {
    nama: 'jerapah', kelompok: 'herbivora', gambar: 'gambar/hewan/jerapah.webp', makan: 'daun', bukan: ['daging', 'ikan'],
    petunjuk: 'Leherku sangat panjang. Aku makan daun dari pohon yang tinggi.',
    penjelasan: 'Ini jerapah. Jerapah adalah hewan yang paling tinggi di dunia. Lehernya sangat panjang, dan kakinya juga panjang. Jerapah termasuk hewan herbivora, yaitu hewan pemakan tumbuhan. Dengan lehernya yang panjang, jerapah bisa memetik daun dari pohon yang tinggi. Lidah jerapah juga panjang, untuk menarik daun dari dahan. Badan jerapah bercorak bintik-bintik cokelat, dan setiap jerapah punya corak yang berbeda. Jerapah tinggal di padang rumput yang luas di Afrika. Kalau mau minum, jerapah harus melebarkan kakinya dan menunduk rendah sekali.',
  },
];

const MAKANAN = {
  'rumput': '🌿', 'wortel': '🥕', 'daun': '🍃', 'daging': '🍖', 'ikan': '🐟',
  'buah': '🍎', 'biji jagung': '🌽', 'biji-bijian': '🌾', 'pisang': '🍌', 'kacang': '🥜',
};

// Urutan kelompok sesuai permintaan pemilik proyek: karnivora, omnivora, herbivora
// penjelasan = dibacakan Kiku saat judul kelompok di Kenalan Yuk disentuh
const KELOMPOK = {
  karnivora: { nama: 'Karnivora', ket: 'Pemakan daging', ikon: '🍖', warna: '#c92a2a', penjelasan: 'Karnivora adalah hewan pemakan daging.' },
  omnivora: { nama: 'Omnivora', ket: 'Pemakan tumbuhan dan hewan', ikon: '🍽️', warna: '#e8590c', penjelasan: 'Omnivora adalah hewan pemakan tumbuhan dan juga hewan.' },
  herbivora: { nama: 'Herbivora', ket: 'Pemakan tumbuhan', ikon: '🌿', warna: '#2f9e44', penjelasan: 'Herbivora adalah hewan pemakan tumbuhan.' },
};

// Suara hewan asli (Wikimedia Commons, lihat suara-hewan/SUMBER.md)
const BUNYI_HEWAN = {
  'sapi': 'suara-hewan/sapi.mp3',
  'kambing': 'suara-hewan/kambing.mp3',
  'gajah': 'suara-hewan/gajah.mp3',
  'singa': 'suara-hewan/singa.mp3',
  'harimau': 'suara-hewan/harimau.mp3',
  'ayam': 'suara-hewan/ayam.mp3',
  'bebek': 'suara-hewan/bebek.mp3',
  'monyet': 'suara-hewan/monyet.mp3',
  'buaya': 'suara-hewan/buaya.mp3',
  'tupai': 'suara-hewan/tupai.mp3',
  'beruang': 'suara-hewan/beruang.mp3',
  'elang': 'suara-hewan/elang.mp3',
  'serigala': 'suara-hewan/serigala.mp3',
};

// Tiruan bunyi diputar dengan rekaman aslinya (tulisannya tetap tampil)
const BUNYI_KALIMAT = {
  'Cuit, cuit, cuit!': 'suara-hewan/burung.mp3',
};

// ---------- Narasi Kiku ----------
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
  penutup: {
    judul: 'Hore, Kita Berhasil!', latar: 'hutan', sahabat: true, kiku: true,
    ucapan: [
      { s: 'kiku', t: 'Horeee! Kita sudah menyelesaikan semua misi petualangan di Taman Ceria!' },
      { s: 'kiku', t: 'Wah, seru sekali ya! Kita sudah belajar banyak hal dan berhasil mengumpulkan banyak bintang. ⭐' },
      { s: 'kiku', t: 'Tapi, petualangan kita belum selesai, lho! Yuk, main lagi dan kumpulkan bintang sebanyak-banyaknya! Ayo, teman-teman, kita cari bintang lebih banyak lagi! 🌟🐦' },
    ],
  },
};

// Kenalan Yuk: Kiku mengajak anak menyentuh hewan satu per satu
const KENALAN = {
  judul: 'Kenalan Yuk!',
  ajakan: [
    'Ayo kenalan dengan teman-teman hewan! Ada hewan karnivora, omnivora, dan herbivora.',
    'Sentuh gambar hewannya satu per satu, nanti Kiku ceritakan tentang hewan itu.',
  ],
  semua: 'Hore! Kalian sudah mengenal semua hewan! Sekarang, ayo kita main tebak-tebakan!',
};

// ---------- Permainan tebak-tebakan (urutannya bebas, dipilih dari menu) ----------
const GAME = {
  tebak: {
    judul: 'Tebak Hewan', tokoh: 'kiku', ronde: 6,
    pembuka: [
      'Sekarang kita main tebak-tebakan, yuk!',
      'Kiku akan memberikan petunjuk tentang seekor hewan. Dengarkan baik-baik, lalu pilih gambar hewan yang benar!',
    ],
    tanya: (h) => `${h.petunjuk} Siapakah aku?`,
    benar: (h) => `Hore, benar! Aku adalah ${h.nama}.`,
    salah: 'Hmm, bukan itu. Dengarkan petunjuknya lagi, ya!',
    selesai: 'Wah, hebat! Kalian pandai sekali menebak hewan!',
  },
  makanan: {
    judul: 'Makanan Hewan', tokoh: 'lili', ronde: 6,
    pembuka: [
      'Halo, teman-teman! Aku Lili si Kelinci. Bantu aku mencarikan makanan kesukaan teman-teman hewan, yuk!',
      'Coba perhatikan gambar hewan yang muncul. Pilih makanan yang sesuai dengan hewan tersebut, ya!',
    ],
    tanya: (h) => `Apa makanan kesukaan ${h.nama}?`,
    benar: (h) => `Hore, benar! ${besar(h.nama)} suka makan ${h.makan}.`,
    salah: 'Hmm, bukan itu. Ayo coba lagi!',
    selesai: 'Hebat! Semua teman hewan sudah mendapat makanannya!',
  },
  kelompok: {
    judul: 'Ayo Kelompokkan Hewan', tokoh: 'leo',
    pembuka: [
      'Halo, aku Leo si Singa! Semua hewan di Taman Ceria sedang berkumpul dan bercampur menjadi satu.',
      'Ayo, bantu Leo memasukkan hewan-hewan tersebut ke kelompok yang benar!',
      'Tarik gambar hewan ke kotak kelompoknya, atau sentuh hewannya lalu sentuh kotaknya.',
    ],
    benar: (h) => `Pintar! ${besar(h.nama)} termasuk ${h.kelompok}.`,
    salah: 'Ups, belum tepat. Coba kotak yang lain, ya!',
    selesai: 'Hebat! Semua hewan sudah masuk ke kelompoknya!',
  },
  kuis: {
    judul: 'Kuis: Aku Sudah Pintar', tokoh: 'bubu',
    hewan: ['sapi', 'singa', 'ayam', 'kelinci', 'harimau', 'beruang', 'gajah', 'buaya', 'bebek', 'monyet'],
    pembuka: [
      'Halo, aku Bubu si Beruang! Jawablah pertanyaan yang muncul dengan benar, ya!',
      'Ayo, buktikan bahwa kalian sudah benar-benar mengenal hewan herbivora, karnivora, dan omnivora!',
    ],
    tanya: (h) => `${besar(h.nama)} termasuk kelompok hewan apa?`,
    benar: (h) => `Betul sekali! ${besar(h.nama)} termasuk ${h.kelompok}.`,
    salah: 'Hmm, bukan itu. Ayo coba sekali lagi!',
    selesai: 'Luar biasa! Semua pertanyaan sudah kamu jawab!',
  },
};

// Menu utama: tinggal pilih fitur yang diinginkan. Penutup diputar setelah keempat permainan selesai.
const MENU = [
  { id: 'kenalan', ikon: '👋', nama: 'Kenalan Yuk' },
  { id: 'tebak', ikon: '🔍', nama: 'Tebak Hewan' },
  { id: 'makanan', ikon: '🥕', nama: 'Makanan Hewan' },
  { id: 'kelompok', ikon: '🧺', nama: 'Kelompokkan' },
  { id: 'kuis', ikon: '🏆', nama: 'Kuis' },
];
// Diucapkan Kiku saat kembali ke menu setelah selesai bermain
const MENU_AJAK = 'Mau main apa lagi? Pilih tombolnya, ya!';

function besar(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
