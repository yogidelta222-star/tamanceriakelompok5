/* =========================================================
   Taman Ceria — Data konten pembelajaran
   Tambah / ubah isi di sini tanpa menyentuh logika permainan.
   ========================================================= */

const ANGKA_KATA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh'];

const WARNA_ANGKA = ['#ff6b6b', '#ff922b', '#fab005', '#40c057', '#12b886', '#228be6', '#4c6ef5', '#ae3ec9', '#e64980', '#f76707'];

// ciri   = kalimat sifat, dipakai: "Hewan apa yang <ciri>?"
// tempat = darat / air / udara (null bila hidup di dua tempat)
// ukuran = 1 (kecil) sampai 5 (sangat besar)
const HEWAN = [
  { nama: 'kucing',       emoji: '🐱', suara: 'meong, meong',     ciri: 'suka minum susu',                         tempat: 'darat', ukuran: 2 },
  { nama: 'anjing',       emoji: '🐶', suara: 'guk, guk, guk',    ciri: 'suka menjaga rumah',                      tempat: 'darat', ukuran: 2 },
  { nama: 'sapi',         emoji: '🐮', suara: 'mooooo',           ciri: 'memberi kita susu',                       tempat: 'darat', ukuran: 4 },
  { nama: 'ayam',         emoji: '🐔', suara: 'kukuruyuuuk',      ciri: 'bertelur dan berkokok di pagi hari',      tempat: 'darat', ukuran: 2 },
  { nama: 'bebek',        emoji: '🦆', suara: 'kwek, kwek, kwek', ciri: 'jalannya megal-megol',                    tempat: null,    ukuran: 2 },
  { nama: 'kambing',      emoji: '🐐', suara: 'mbeeeek',          ciri: 'berjenggot dan suka makan rumput',        tempat: 'darat', ukuran: 3 },
  { nama: 'domba',        emoji: '🐑', suara: 'mbee, mbee',       ciri: 'bulunya tebal dan keriting',              tempat: 'darat', ukuran: 3 },
  { nama: 'kuda',         emoji: '🐴', suara: 'hiiiihiii',        ciri: 'larinya cepat sekali',                    tempat: 'darat', ukuran: 4 },
  { nama: 'singa',        emoji: '🦁', suara: 'auuuum',           ciri: 'disebut raja hutan',                      tempat: 'darat', ukuran: 4 },
  { nama: 'harimau',      emoji: '🐯', suara: 'grrr, auuum',      ciri: 'badannya belang-belang oranye',           tempat: 'darat', ukuran: 4 },
  { nama: 'monyet',       emoji: '🐵', suara: 'uuk, aak, aak',    ciri: 'suka makan pisang dan memanjat pohon',    tempat: 'darat', ukuran: 2 },
  { nama: 'katak',        emoji: '🐸', suara: 'kung, kong, kung, kong', ciri: 'pandai melompat',                   tempat: null,    ukuran: 1 },
  { nama: 'burung',       emoji: '🐦', suara: 'cuit, cuit, cuit', ciri: 'bisa terbang tinggi di langit',           tempat: 'udara', ukuran: 1 },
  { nama: 'burung hantu', emoji: '🦉', suara: 'huu, huu',         ciri: 'matanya besar dan bangun di malam hari',  tempat: 'udara', ukuran: 1 },
  { nama: 'lebah',        emoji: '🐝', suara: 'nguuung, nguuung', ciri: 'membuat madu',                            tempat: 'udara', ukuran: 1 },
  { nama: 'tikus',        emoji: '🐭', suara: 'cit, cit, cit',    ciri: 'suka makan keju',                         tempat: 'darat', ukuran: 1 },
  { nama: 'gajah',        emoji: '🐘', suara: null, ciri: 'punya belalai yang panjang',                tempat: 'darat', ukuran: 5 },
  { nama: 'ikan',         emoji: '🐟', suara: null, ciri: 'berenang dengan sirip',                     tempat: 'air',   ukuran: 1 },
  { nama: 'kelinci',      emoji: '🐰', suara: null, ciri: 'telinganya panjang dan suka makan wortel',  tempat: 'darat', ukuran: 1 },
  { nama: 'jerapah',      emoji: '🦒', suara: null, ciri: 'lehernya panjang sekali',                   tempat: 'darat', ukuran: 5 },
  { nama: 'kura-kura',    emoji: '🐢', suara: null, ciri: 'punya cangkang keras seperti batu',         tempat: null,    ukuran: 2 },
  { nama: 'ular',         emoji: '🐍', suara: null, ciri: 'tidak punya kaki',                          tempat: 'darat', ukuran: 2 },
  { nama: 'panda',        emoji: '🐼', suara: null, ciri: 'suka makan bambu',                          tempat: 'darat', ukuran: 4 },
  { nama: 'pinguin',      emoji: '🐧', suara: null, ciri: 'tinggal di tempat yang dingin',             tempat: null,    ukuran: 2 },
  { nama: 'beruang',      emoji: '🐻', suara: null, ciri: 'badannya besar dan suka makan madu',        tempat: 'darat', ukuran: 4 },
  { nama: 'buaya',        emoji: '🐊', suara: null, ciri: 'giginya tajam dan suka berjemur',           tempat: null,    ukuran: 4 },
  { nama: 'kupu-kupu',    emoji: '🦋', suara: null, ciri: 'sayapnya indah berwarna-warni',             tempat: 'udara', ukuran: 1 },
  { nama: 'semut',        emoji: '🐜', suara: null, ciri: 'kecil sekali dan suka gotong royong',       tempat: 'darat', ukuran: 1 },
  { nama: 'laba-laba',    emoji: '🕷️', suara: null, ciri: 'membuat jaring untuk menangkap serangga',   tempat: 'darat', ukuran: 1 },
  { nama: 'lumba-lumba',  emoji: '🐬', suara: null, ciri: 'pintar dan suka melompat di laut',          tempat: 'air',   ukuran: 4 },
  { nama: 'ikan paus',    emoji: '🐳', suara: null, ciri: 'paling besar di laut',                      tempat: 'air',   ukuran: 5 },
  { nama: 'kepiting',     emoji: '🦀', suara: null, ciri: 'jalannya menyamping',                       tempat: 'air',   ukuran: 1 },
  { nama: 'gurita',       emoji: '🐙', suara: null, ciri: 'punya delapan tangan',                      tempat: 'air',   ukuran: 2 },
  { nama: 'unta',         emoji: '🐫', suara: null, ciri: 'punya punuk dan tinggal di gurun',          tempat: 'darat', ukuran: 4 },
  { nama: 'zebra',        emoji: '🦓', suara: null, ciri: 'badannya bergaris hitam putih',             tempat: 'darat', ukuran: 4 },
  { nama: 'rusa',         emoji: '🦌', suara: null, ciri: 'punya tanduk bercabang',                    tempat: 'darat', ukuran: 3 },
  { nama: 'siput',        emoji: '🐌', suara: null, ciri: 'jalannya lambat dan membawa rumahnya',      tempat: 'darat', ukuran: 1 },
  { nama: 'kanguru',      emoji: '🦘', suara: null, ciri: 'punya kantong di perutnya',                 tempat: 'darat', ukuran: 4 },
  { nama: 'kuda nil',     emoji: '🦛', suara: null, ciri: 'mulutnya besar sekali dan suka berendam',   tempat: null,    ukuran: 5 },
  { nama: 'burung beo',   emoji: '🦜', suara: null, ciri: 'bisa menirukan suara orang',                tempat: 'udara', ukuran: 1 },
  { nama: 'landak',       emoji: '🦔', suara: null, ciri: 'badannya penuh duri',                       tempat: 'darat', ukuran: 1 },
];

const TEMPAT = {
  darat: { tanya: 'hidup di darat', ikon: '🌳' },
  air:   { tanya: 'hidup di air',   ikon: '🌊' },
  udara: { tanya: 'bisa terbang',   ikon: '☁️' },
};

// warnaDasar = warna sederhana untuk soal "Buah apa yang warnanya ...?" (null bila lebih dari satu warna)
const BUAH = [
  { nama: 'apel',     emoji: '🍎', warna: 'merah',  warnaDasar: 'merah',  rasa: 'manis',          ciri: 'bulat dan renyah' },
  { nama: 'pisang',   emoji: '🍌', warna: 'kuning', warnaDasar: 'kuning', rasa: 'manis',          ciri: 'panjang dan disukai monyet' },
  { nama: 'jeruk',    emoji: '🍊', warna: 'oranye', warnaDasar: 'oranye', rasa: 'segar',          ciri: 'bulat dan banyak airnya' },
  { nama: 'anggur',   emoji: '🍇', warna: 'ungu',   warnaDasar: 'ungu',   rasa: 'manis',          ciri: 'kecil-kecil dan bergerombol' },
  { nama: 'semangka', emoji: '🍉', warna: 'hijau di luar, merah di dalam', warnaDasar: null, rasa: 'segar', ciri: 'hijau di luar dan merah di dalam' },
  { nama: 'stroberi', emoji: '🍓', warna: 'merah',  warnaDasar: 'merah',  rasa: 'manis dan asam', ciri: 'punya bintik-bintik kecil' },
  { nama: 'nanas',    emoji: '🍍', warna: 'kuning', warnaDasar: 'kuning', rasa: 'manis dan asam', ciri: 'kulitnya kasar dan punya mahkota daun' },
  { nama: 'mangga',   emoji: '🥭', warna: 'kuning kehijauan', warnaDasar: null, rasa: 'manis', ciri: 'manis dan wangi' },
  { nama: 'ceri',     emoji: '🍒', warna: 'merah',  warnaDasar: 'merah',  rasa: 'manis',          ciri: 'kecil dan kembar' },
  { nama: 'pir',      emoji: '🍐', warna: 'hijau',  warnaDasar: 'hijau',  rasa: 'manis',          ciri: 'bentuknya seperti lonceng' },
  { nama: 'kelapa',   emoji: '🥥', warna: 'cokelat', warnaDasar: 'cokelat', rasa: 'gurih',        ciri: 'kulitnya keras dan airnya segar' },
  { nama: 'lemon',    emoji: '🍋', warna: 'kuning', warnaDasar: 'kuning', rasa: 'asam sekali',    ciri: 'rasanya asam sekali' },
  { nama: 'alpukat',  emoji: '🥑', warna: 'hijau',  warnaDasar: 'hijau',  rasa: 'lembut dan gurih', ciri: 'punya biji yang besar' },
  { nama: 'melon',    emoji: '🍈', warna: 'hijau',  warnaDasar: 'hijau',  rasa: 'manis',          ciri: 'besar dan bulat' },
  { nama: 'kiwi',     emoji: '🥝', warna: 'cokelat di luar, hijau di dalam', warnaDasar: null, rasa: 'manis dan asam', ciri: 'kulitnya berbulu halus' },
  { nama: 'persik',   emoji: '🍑', warna: 'oranye kemerahan', warnaDasar: null, rasa: 'manis',  ciri: 'kulitnya lembut seperti beludru' },
  { nama: 'bluberi',  emoji: '🫐', warna: 'biru',   warnaDasar: 'biru',   rasa: 'manis dan asam', ciri: 'kecil, bulat, dan biru' },
  { nama: 'tomat',    emoji: '🍅', warna: 'merah',  warnaDasar: 'merah',  rasa: 'segar',          ciri: 'sering dibuat saus' },
];

// benda = contoh benda berwarna itu; mirip = warna yang mudah tertukar (tidak dijadikan pengecoh)
const WARNA = [
  { nama: 'merah',      hex: '#fa5252', mirip: ['merah muda', 'oranye'], benda: [{ e: '🍎', n: 'apel' }, { e: '🍓', n: 'stroberi' }, { e: '🚒', n: 'mobil pemadam kebakaran' }, { e: '🌹', n: 'bunga mawar' }, { e: '🍅', n: 'tomat' }] },
  { nama: 'kuning',     hex: '#fcc419', mirip: ['oranye'], benda: [{ e: '🍌', n: 'pisang' }, { e: '🌻', n: 'bunga matahari' }, { e: '🐥', n: 'anak ayam' }, { e: '🍋', n: 'lemon' }, { e: '🧀', n: 'keju' }] },
  { nama: 'hijau',      hex: '#40c057', mirip: [], benda: [{ e: '🐸', n: 'katak' }, { e: '🥦', n: 'brokoli' }, { e: '🥒', n: 'timun' }, { e: '🌳', n: 'daun pohon' }] },
  { nama: 'biru',       hex: '#339af0', mirip: ['ungu'], benda: [{ e: '🐳', n: 'ikan paus' }, { e: '💧', n: 'tetes air' }, { e: '🫐', n: 'bluberi' }, { e: '👖', n: 'celana jins' }] },
  { nama: 'oranye',     hex: '#fd7e14', mirip: ['merah', 'kuning', 'cokelat'], benda: [{ e: '🍊', n: 'jeruk' }, { e: '🥕', n: 'wortel' }, { e: '🎃', n: 'labu' }, { e: '🦊', n: 'rubah' }] },
  { nama: 'ungu',       hex: '#9c36b5', mirip: ['biru', 'merah muda'], benda: [{ e: '🍇', n: 'anggur' }, { e: '🍆', n: 'terong' }] },
  { nama: 'merah muda', hex: '#f783ac', mirip: ['merah', 'ungu'], benda: [{ e: '🌸', n: 'bunga sakura' }, { e: '🦩', n: 'burung flamingo' }, { e: '🎀', n: 'pita' }] },
  { nama: 'cokelat',    hex: '#8d5524', mirip: ['oranye', 'hitam'], benda: [{ e: '🐻', n: 'beruang' }, { e: '🥥', n: 'kelapa' }, { e: '🍫', n: 'cokelat batang' }, { e: '🪵', n: 'kayu' }] },
  { nama: 'hitam',      hex: '#212529', mirip: ['cokelat', 'abu-abu'], benda: [{ e: '🎩', n: 'topi pesulap' }, { e: '🎱', n: 'bola biliar' }, { e: '🕷️', n: 'laba-laba' }] },
  { nama: 'putih',      hex: '#ffffff', mirip: ['abu-abu'], benda: [{ e: '☁️', n: 'awan' }, { e: '⛄', n: 'boneka salju' }, { e: '🍚', n: 'nasi' }] },
  { nama: 'abu-abu',    hex: '#868e96', mirip: ['hitam', 'putih'], benda: [{ e: '🐘', n: 'gajah' }, { e: '🐨', n: 'koala' }, { e: '🪨', n: 'batu' }] },
];

// svg digambar pada kotak 100x100; contoh = benda yang bentuknya serupa
const BENTUK = [
  { nama: 'lingkaran',       svg: '<circle cx="50" cy="50" r="42"/>', mirip: ['oval'], contoh: [{ e: '⚽', n: 'bola' }, { e: '🍪', n: 'kue kering' }, { e: '🕒', n: 'jam dinding' }] },
  { nama: 'segitiga',        svg: '<polygon points="50,8 94,90 6,90"/>', mirip: [], contoh: [{ e: '🍕', n: 'potongan pizza' }, { e: '⛺', n: 'tenda' }] },
  { nama: 'persegi',         svg: '<rect x="12" y="12" width="76" height="76" rx="6"/>', mirip: ['persegi panjang', 'belah ketupat'], contoh: [{ e: '🎁', n: 'kotak hadiah' }, { e: '🧊', n: 'es batu' }] },
  { nama: 'persegi panjang', svg: '<rect x="4" y="24" width="92" height="52" rx="6"/>', mirip: ['persegi'], contoh: [{ e: '🚪', n: 'pintu' }, { e: '📱', n: 'ponsel' }] },
  { nama: 'bintang',         svg: '<polygon points="50,5 61,38 96,38 68,59 79,93 50,72 21,93 32,59 4,38 39,38"/>', mirip: [], contoh: [{ e: '⭐', n: 'bintang di langit' }, { e: '🌟', n: 'hiasan bintang' }] },
  { nama: 'hati',            svg: '<path d="M50 88C20 66 6 48 6 30 6 16 17 6 30 6c10 0 16 6 20 14 4-8 10-14 20-14 13 0 24 10 24 24 0 18-14 36-44 58z"/>', mirip: [], contoh: [{ e: '❤️', n: 'tanda sayang' }, { e: '💝', n: 'kado sayang' }] },
  { nama: 'oval',            svg: '<ellipse cx="50" cy="50" rx="30" ry="44"/>', mirip: ['lingkaran'], contoh: [{ e: '🥚', n: 'telur' }, { e: '🏉', n: 'bola rugbi' }] },
  { nama: 'belah ketupat',   svg: '<polygon points="50,4 92,50 50,96 8,50"/>', mirip: ['persegi'], contoh: [{ e: '🪁', n: 'layang-layang' }, { e: '🔷', n: 'hiasan biru' }] },
];

// eja = cara membaca huruf dalam bahasa Indonesia
const HURUF = [
  { h: 'A', eja: 'a',   kata: 'Ayam',    emoji: '🐔' },
  { h: 'B', eja: 'be',  kata: 'Bola',    emoji: '⚽' },
  { h: 'C', eja: 'ce',  kata: 'Cicak',   emoji: '🦎' },
  { h: 'D', eja: 'de',  kata: 'Domba',   emoji: '🐑' },
  { h: 'E', eja: 'e',   kata: 'Elang',   emoji: '🦅' },
  { h: 'F', eja: 'ef',  kata: 'Foto',    emoji: '📷' },
  { h: 'G', eja: 'ge',  kata: 'Gajah',   emoji: '🐘' },
  { h: 'H', eja: 'ha',  kata: 'Harimau', emoji: '🐯' },
  { h: 'I', eja: 'i',   kata: 'Ikan',    emoji: '🐟' },
  { h: 'J', eja: 'je',  kata: 'Jeruk',   emoji: '🍊' },
  { h: 'K', eja: 'ka',  kata: 'Kucing',  emoji: '🐱' },
  { h: 'L', eja: 'el',  kata: 'Lebah',   emoji: '🐝' },
  { h: 'M', eja: 'em',  kata: 'Mobil',   emoji: '🚗' },
  { h: 'N', eja: 'en',  kata: 'Nanas',   emoji: '🍍' },
  { h: 'O', eja: 'o',   kata: 'Ombak',   emoji: '🌊' },
  { h: 'P', eja: 'pe',  kata: 'Pisang',  emoji: '🍌' },
  { h: 'Q', eja: 'ki',  kata: 'Quran',   emoji: '📖' },
  { h: 'R', eja: 'er',  kata: 'Rumah',   emoji: '🏠' },
  { h: 'S', eja: 'es',  kata: 'Sapi',    emoji: '🐮' },
  { h: 'T', eja: 'te',  kata: 'Topi',    emoji: '🎩' },
  { h: 'U', eja: 'u',   kata: 'Ular',    emoji: '🐍' },
  { h: 'V', eja: 've',  kata: 'Vas',     emoji: '🏺' },
  { h: 'W', eja: 'we',  kata: 'Wortel',  emoji: '🥕' },
  { h: 'X', eja: 'eks', kata: 'Xilofon', emoji: '🎶' },
  { h: 'Y', eja: 'ye',  kata: 'Yoyo',    emoji: '🪀' },
  { h: 'Z', eja: 'zet', kata: 'Zebra',   emoji: '🦓' },
];

// Benda untuk permainan berhitung
const BENDA = [
  { emoji: '🍎', nama: 'apel' },
  { emoji: '🐥', nama: 'anak ayam' },
  { emoji: '⭐', nama: 'bintang' },
  { emoji: '🎈', nama: 'balon' },
  { emoji: '🐟', nama: 'ikan' },
  { emoji: '🌸', nama: 'bunga' },
  { emoji: '🍓', nama: 'stroberi' },
  { emoji: '🚗', nama: 'mobil' },
  { emoji: '🦋', nama: 'kupu-kupu' },
  { emoji: '🧁', nama: 'kue' },
  { emoji: '🐞', nama: 'kepik' },
  { emoji: '🍩', nama: 'donat' },
  { emoji: '⚽', nama: 'bola' },
  { emoji: '🐠', nama: 'ikan hias' },
];

// Benda yang bukan hewan dan bukan buah, untuk soal "Mana yang bukan ...?"
const BENDA_LAIN = [
  { emoji: '🚗', nama: 'mobil' },
  { emoji: '⚽', nama: 'bola' },
  { emoji: '🏠', nama: 'rumah' },
  { emoji: '🎈', nama: 'balon' },
  { emoji: '✏️', nama: 'pensil' },
  { emoji: '🚲', nama: 'sepeda' },
  { emoji: '☂️', nama: 'payung' },
  { emoji: '📚', nama: 'buku' },
  { emoji: '🪑', nama: 'kursi' },
  { emoji: '⏰', nama: 'jam weker' },
];

const MENU = [
  { id: 'hewan',   ikon: '🐶', nama: 'Tebak Hewan',   warna: '#ff8a5c' },
  { id: 'buah',    ikon: '🍎', nama: 'Tebak Buah',    warna: '#51cf66' },
  { id: 'warna',   ikon: '🎨', nama: 'Tebak Warna',   warna: '#cc5de8' },
  { id: 'bentuk',  ikon: '🔺', nama: 'Tebak Bentuk',  warna: '#f06595' },
  { id: 'huruf',   ikon: '🔤', nama: 'Tebak Huruf',   warna: '#845ef7' },
  { id: 'hitung',  ikon: '🧮', nama: 'Ayo Berhitung', warna: '#fcc419' },
  { id: 'urut',    ikon: '🚂', nama: 'Urutkan Angka', warna: '#4dabf7' },
  { id: 'belajar', ikon: '📖', nama: 'Kenalan Yuk',   warna: '#22b8cf' },
];

const PUJIAN = ['Hebat!', 'Pintar sekali!', 'Wah, keren!', 'Betul sekali!', 'Hore, benar!', 'Kamu jago!', 'Luar biasa!', 'Mantap!', 'Tepuk tangan untukmu!'];
const SEMANGAT = ['Coba lagi ya!', 'Ayo, kamu pasti bisa!', 'Hampir! Coba lagi ya!', 'Tidak apa-apa, coba lagi!'];
