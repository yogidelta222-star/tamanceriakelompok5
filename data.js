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
  { nama: 'kucing',       emoji: '🐱', gambar: 'gambar/hewan/kucing.webp', suara: 'meong, meong',     ciri: 'suka minum susu',                         tempat: 'darat', ukuran: 2 },
  { nama: 'anjing',       emoji: '🐶', gambar: 'gambar/hewan/anjing.webp', suara: 'guk, guk, guk',    ciri: 'suka menjaga rumah',                      tempat: 'darat', ukuran: 2 },
  { nama: 'sapi',         emoji: '🐮', gambar: 'gambar/hewan/sapi.webp', suara: 'mooooo',           ciri: 'memberi kita susu',                       tempat: 'darat', ukuran: 4 },
  { nama: 'ayam',         emoji: '🐔', gambar: 'gambar/hewan/ayam.webp', suara: 'kukuruyuuuk',      ciri: 'bertelur dan berkokok di pagi hari',      tempat: 'darat', ukuran: 2 },
  { nama: 'bebek',        emoji: '🦆', gambar: 'gambar/hewan/bebek.webp', suara: 'kwek, kwek, kwek', ciri: 'jalannya megal-megol',                    tempat: null,    ukuran: 2 },
  { nama: 'kambing',      emoji: '🐐', gambar: 'gambar/hewan/kambing.webp', suara: 'mbeeeek',          ciri: 'berjenggot dan suka makan rumput',        tempat: 'darat', ukuran: 3 },
  { nama: 'domba',        emoji: '🐑', gambar: 'gambar/hewan/domba.webp', suara: 'mbee, mbee',       ciri: 'bulunya tebal dan keriting',              tempat: 'darat', ukuran: 3 },
  { nama: 'kuda',         emoji: '🐴', gambar: 'gambar/hewan/kuda.webp', suara: 'hiiiihiii',        ciri: 'larinya cepat sekali',                    tempat: 'darat', ukuran: 4 },
  { nama: 'singa',        emoji: '🦁', gambar: 'gambar/hewan/singa.webp', suara: 'auuuum',           ciri: 'disebut raja hutan',                      tempat: 'darat', ukuran: 4 },
  { nama: 'harimau',      emoji: '🐯', gambar: 'gambar/hewan/harimau.webp', suara: 'grrr, auuum',      ciri: 'badannya belang-belang oranye',           tempat: 'darat', ukuran: 4 },
  { nama: 'monyet',       emoji: '🐵', gambar: 'gambar/hewan/monyet.webp', suara: 'uuk, aak, aak',    ciri: 'suka makan pisang dan memanjat pohon',    tempat: 'darat', ukuran: 2 },
  { nama: 'katak',        emoji: '🐸', gambar: 'gambar/hewan/katak.webp', suara: 'kung, kong, kung, kong', ciri: 'pandai melompat',                   tempat: null,    ukuran: 1 },
  { nama: 'burung',       emoji: '🐦', gambar: 'gambar/hewan/burung.webp', suara: 'cuit, cuit, cuit', ciri: 'bisa terbang tinggi di langit',           tempat: 'udara', ukuran: 1 },
  { nama: 'burung hantu', emoji: '🦉', gambar: 'gambar/hewan/burung-hantu.webp', suara: 'huu, huu',         ciri: 'matanya besar dan bangun di malam hari',  tempat: 'udara', ukuran: 1 },
  { nama: 'lebah',        emoji: '🐝', gambar: 'gambar/hewan/lebah.webp', suara: 'nguuung, nguuung', ciri: 'membuat madu',                            tempat: 'udara', ukuran: 1 },
  { nama: 'tikus',        emoji: '🐭', gambar: 'gambar/hewan/tikus.webp', suara: 'cit, cit, cit',    ciri: 'suka makan keju',                         tempat: 'darat', ukuran: 1 },
  { nama: 'gajah',        emoji: '🐘', gambar: 'gambar/hewan/gajah.webp', suara: null, ciri: 'punya belalai yang panjang',                tempat: 'darat', ukuran: 5 },
  { nama: 'ikan',         emoji: '🐟', gambar: 'gambar/hewan/ikan.webp', suara: null, ciri: 'berenang dengan sirip',                     tempat: 'air',   ukuran: 1 },
  { nama: 'kelinci',      emoji: '🐰', gambar: 'gambar/hewan/kelinci.webp', suara: null, ciri: 'telinganya panjang dan suka makan wortel',  tempat: 'darat', ukuran: 1 },
  { nama: 'jerapah',      emoji: '🦒', gambar: 'gambar/hewan/jerapah.webp', suara: null, ciri: 'lehernya panjang sekali',                   tempat: 'darat', ukuran: 5 },
  { nama: 'kura-kura',    emoji: '🐢', gambar: 'gambar/hewan/kura-kura.webp', suara: null, ciri: 'punya cangkang keras seperti batu',         tempat: null,    ukuran: 2 },
  { nama: 'ular',         emoji: '🐍', gambar: 'gambar/hewan/ular.webp', suara: null, ciri: 'tidak punya kaki',                          tempat: 'darat', ukuran: 2 },
  { nama: 'panda',        emoji: '🐼', gambar: 'gambar/hewan/panda.webp', suara: null, ciri: 'suka makan bambu',                          tempat: 'darat', ukuran: 4 },
  { nama: 'pinguin',      emoji: '🐧', gambar: 'gambar/hewan/pinguin.webp', suara: null, ciri: 'tinggal di tempat yang dingin',             tempat: null,    ukuran: 2 },
  { nama: 'beruang',      emoji: '🐻', gambar: 'gambar/hewan/beruang.webp', suara: null, ciri: 'badannya besar dan suka makan madu',        tempat: 'darat', ukuran: 4 },
  { nama: 'buaya',        emoji: '🐊', gambar: 'gambar/hewan/buaya.webp', suara: null, ciri: 'giginya tajam dan suka berjemur',           tempat: null,    ukuran: 4 },
  { nama: 'kupu-kupu',    emoji: '🦋', gambar: 'gambar/hewan/kupu-kupu.webp', suara: null, ciri: 'sayapnya indah berwarna-warni',             tempat: 'udara', ukuran: 1 },
  { nama: 'semut',        emoji: '🐜', gambar: 'gambar/hewan/semut.webp', suara: null, ciri: 'kecil sekali dan suka gotong royong',       tempat: 'darat', ukuran: 1 },
  { nama: 'laba-laba',    emoji: '🕷️', gambar: 'gambar/hewan/laba-laba.webp', suara: null, ciri: 'membuat jaring untuk menangkap serangga',   tempat: 'darat', ukuran: 1 },
  { nama: 'lumba-lumba',  emoji: '🐬', gambar: 'gambar/hewan/lumba-lumba.webp', suara: null, ciri: 'pintar dan suka melompat di laut',          tempat: 'air',   ukuran: 4 },
  { nama: 'ikan paus',    emoji: '🐳', gambar: 'gambar/hewan/ikan-paus.webp', suara: null, ciri: 'paling besar di laut',                      tempat: 'air',   ukuran: 5 },
  { nama: 'kepiting',     emoji: '🦀', gambar: 'gambar/hewan/kepiting.webp', suara: null, ciri: 'jalannya menyamping',                       tempat: 'air',   ukuran: 1 },
  { nama: 'gurita',       emoji: '🐙', gambar: 'gambar/hewan/gurita.webp', suara: null, ciri: 'punya delapan tangan',                      tempat: 'air',   ukuran: 2 },
  { nama: 'unta',         emoji: '🐫', gambar: 'gambar/hewan/unta.webp', suara: null, ciri: 'punya punuk dan tinggal di gurun',          tempat: 'darat', ukuran: 4 },
  { nama: 'zebra',        emoji: '🦓', gambar: 'gambar/hewan/zebra.webp', suara: null, ciri: 'badannya bergaris hitam putih',             tempat: 'darat', ukuran: 4 },
  { nama: 'rusa',         emoji: '🦌', gambar: 'gambar/hewan/rusa.webp', suara: null, ciri: 'punya tanduk bercabang',                    tempat: 'darat', ukuran: 3 },
  { nama: 'siput',        emoji: '🐌', gambar: 'gambar/hewan/siput.webp', suara: null, ciri: 'jalannya lambat dan membawa rumahnya',      tempat: 'darat', ukuran: 1 },
  { nama: 'kanguru',      emoji: '🦘', gambar: 'gambar/hewan/kanguru.webp', suara: null, ciri: 'punya kantong di perutnya',                 tempat: 'darat', ukuran: 4 },
  { nama: 'kuda nil',     emoji: '🦛', gambar: 'gambar/hewan/kuda-nil.webp', suara: null, ciri: 'mulutnya besar sekali dan suka berendam',   tempat: null,    ukuran: 5 },
  { nama: 'burung beo',   emoji: '🦜', gambar: 'gambar/hewan/burung-beo.webp', suara: null, ciri: 'bisa menirukan suara orang',                tempat: 'udara', ukuran: 1 },
  { nama: 'landak',       emoji: '🦔', gambar: 'gambar/hewan/landak.webp', suara: null, ciri: 'badannya penuh duri',                       tempat: 'darat', ukuran: 1 },
];

// Dongeng hewan (naskah disetujui pemilik proyek). Dibacakan saat foto hewan disentuh di Kenalan Yuk.
// petunjuk = bahan soal Tebak Hewan: "Ingat dongengnya? Siapa yang <petunjuk>?"
const DONGENG = {
  'kucing': { tokoh: 'Cuking', teks: 'Hai, teman-teman, ini aku, Cuking! Meong, meong! Setiap pagi, aku minum susu hangat dari mangkuk kesayanganku. Kumisku panjang, gunanya untuk merasakan jalan di tempat gelap. Siang hari, aku suka tidur di tempat yang hangat sambil berjemur. Kalau melihat bola benang, aku langsung bermain sampai puas. Aku juga pandai memanjat pohon, lho! Yuk, kita berteman!',
    petunjuk: ['suka minum susu dan tidur siang di tempat yang hangat', 'kumisnya panjang dan bunyinya meong, meong', 'suka bermain bola benang dan pandai memanjat'] },
  'anjing': { tokoh: 'Kak Anjing', teks: 'Guk, guk, guk! Itu suara Kak Anjing yang setia. Setiap pagi, Kak Anjing menemani anak-anak berjalan ke sekolah. Hidungnya pintar sekali mencium bau dari tempat yang jauh. Kalau senang, ekornya bergoyang-goyang ke kanan dan ke kiri. Malam harinya, Kak Anjing berjaga di depan rumah supaya semua aman. Kak Anjing memang sahabat yang baik.',
    petunjuk: ['menjaga rumah supaya aman di malam hari', 'ekornya bergoyang-goyang kalau senang', 'hidungnya pintar mencium bau dari jauh'] },
  'sapi': { tokoh: 'Bu Sapi', teks: 'Di sebuah peternakan yang hijau, tinggallah Bu Sapi yang baik hati. Setiap pagi, Bu Sapi makan rumput segar sampai kenyang. Mooo! Bu Sapi menyapa Pak Petani yang datang membawa ember. Pak Petani memerah susu Bu Sapi dengan hati-hati. Susu itu bisa dibuat menjadi keju dan yoghurt yang lezat. Bu Sapi senang sekali bisa memberi kita susu yang sehat.',
    petunjuk: ['setiap pagi makan rumput dan memberi kita susu', 'bunyinya mooo dan tinggal di peternakan', 'susunya bisa dibuat menjadi keju'] },
  'ayam': { tokoh: 'Pak Ayam Jago', teks: 'Kukuruyuuuk! Matahari baru saja terbit. Pak Ayam Jago berdiri di atas pagar dan berkokok membangunkan semua orang. Di kepalanya ada jengger merah yang gagah. Bu Ayam sibuk mengerami telur-telurnya di dalam kandang. Tidak lama kemudian, krak! Lahirlah anak-anak ayam yang lucu. Ciap, ciap! Mereka berjalan mengikuti Bu Ayam mencari biji jagung.',
    petunjuk: ['berkokok membangunkan semua orang di pagi hari', 'punya jengger merah di kepalanya', 'anaknya lahir dari telur dan suka makan biji jagung'] },
  'bebek': { tokoh: 'Adik Bebek', teks: 'Kwek, kwek, kwek! Adik Bebek bangun pagi dengan gembira. Ia berjalan megal-megol menuju kolam bersama saudara-saudaranya. Kakinya punya selaput, seperti dayung kecil. Byur! Adik Bebek melompat ke kolam dan berenang ke sana kemari. Bulunya tidak basah karena dilapisi minyak alami. Setelah lelah bermain, Adik Bebek berjemur di tepi kolam.',
    petunjuk: ['jalannya megal-megol menuju kolam', 'kakinya berselaput seperti dayung kecil', 'bulunya tidak basah walaupun berenang'] },
  'kambing': { tokoh: 'Pak Kambing', teks: 'Mbeeek! Pak Kambing menyapa teman-temannya di padang rumput. Di dagunya ada jenggot yang panjang. Di kepalanya ada tanduk kecil yang melengkung. Pak Kambing suka makan rumput dan daun-daunan segar. Ia juga pandai memanjat batu-batu yang tinggi. Kalau sore tiba, Pak Kambing pulang ke kandang dengan perut kenyang.',
    petunjuk: ['punya jenggot di dagunya', 'tanduknya kecil dan melengkung', 'pandai memanjat batu yang tinggi'] },
  'domba': { tokoh: 'Bu Domba', teks: 'Bu Domba punya bulu yang tebal, putih, dan keriting seperti awan. Bulu itu membuat Bu Domba tetap hangat saat cuaca dingin. Mbee, mbee! Bu Domba senang berjalan bersama teman-temannya. Saat musim panas, Pak Peternak mencukur bulunya pelan-pelan. Bu Domba tidak kesakitan, malah jadi sejuk. Bulunya lalu dibuat menjadi benang wol untuk baju hangat.',
    petunjuk: ['bulunya tebal dan keriting seperti awan', 'bulunya bisa dibuat menjadi benang wol', 'bulunya dicukur saat musim panas'] },
  'kuda': { tokoh: 'Pak Kuda', teks: 'Hiiihiii! Pak Kuda meringkik dengan gagah. Kakinya panjang dan kuat, dan larinya kencang sekali. Tak, tik, tuk! Suara kakinya terdengar saat berlari di padang rumput. Rambut di lehernya berkibar tertiup angin. Pak Kuda juga bisa membawa orang di punggungnya. Setelah berlari, Pak Kuda makan rumput dan minum air yang banyak.',
    petunjuk: ['berlari kencang di padang rumput', 'bisa membawa orang di punggungnya', 'rambut di lehernya berkibar tertiup angin'] },
  'tikus': { tokoh: 'Si Tikus', teks: 'Cit, cit, cit! Si Tikus kecil mengintip dari lubang di dinding. Hidungnya bergerak-gerak mencium bau keju. Ekornya panjang dan giginya tajam untuk menggigit. Pelan-pelan, Si Tikus keluar mengambil sepotong keju. Lalu ia berlari cepat kembali ke lubangnya. Si Tikus juga suka makan biji-bijian bersama keluarganya.',
    petunjuk: ['tinggal di lubang dan suka makan keju', 'ekornya panjang dan bunyinya cit, cit', 'giginya tajam untuk menggigit'] },
  'kelinci': { tokoh: 'Adik Kelinci', teks: 'Adik Kelinci punya telinga yang panjang dan bulu yang lembut. Pagi itu, Adik Kelinci melompat-lompat di kebun. Hop, hop, hop! Ia mencari makanan kesukaannya. Wah, ada wortel yang renyah! Adik Kelinci makan wortel dengan gembira, kres, kres. Hidungnya yang kecil selalu bergerak-gerak lucu. Setelah kenyang, Adik Kelinci tidur di liangnya.',
    petunjuk: ['telinganya panjang dan suka melompat', 'makanan kesukaannya wortel', 'hidungnya kecil dan selalu bergerak-gerak'] },
  'singa': { tokoh: 'Raja Singa', teks: 'Auuum! Suara Raja Singa terdengar sampai ke seluruh hutan. Raja Singa punya rambut tebal di sekeliling kepalanya, namanya surai. Karena gagah dan berani, Raja Singa disebut raja hutan. Raja Singa hidup bersama keluarganya dalam satu kelompok. Siang hari, mereka suka bermalas-malasan di bawah pohon yang teduh. Anak-anaknya bermain dan berguling-guling dengan riang.',
    petunjuk: ['punya rambut tebal di sekeliling kepalanya', 'disebut raja hutan dan mengaum keras', 'suka bermalas-malasan di bawah pohon bersama keluarganya'] },
  'harimau': { tokoh: 'Pak Harimau', teks: 'Pak Harimau berjalan pelan-pelan di hutan. Badannya berwarna oranye dengan garis-garis hitam. Garis-garis itu membuatnya sulit terlihat di antara rumput yang tinggi. Grrr! Pak Harimau adalah kucing yang paling besar. Biasanya kucing tidak suka air, tetapi Pak Harimau justru pandai berenang. Setelah berenang, Pak Harimau tidur siang di balik semak-semak.',
    petunjuk: ['badannya oranye bergaris-garis hitam', 'kucing paling besar yang pandai berenang', 'sulit terlihat di antara rumput yang tinggi'] },
  'monyet': { tokoh: 'Si Monyet', teks: 'Uuk, aak, aak! Si Monyet bangun pagi dan langsung bergelantungan di dahan pohon. Tangan dan kakinya kuat sekali untuk memanjat. Ia melompat dari satu pohon ke pohon lain. Wah, Si Monyet melihat setandan pisang yang kuning! Ia memetik pisang, mengupas kulitnya, lalu memakannya. Si Monyet senang berbagi pisang dengan teman-temannya.',
    petunjuk: ['bergelantungan dari pohon ke pohon', 'makanan kesukaannya pisang', 'mengupas kulit pisang sebelum memakannya'] },
  'gajah': { tokoh: 'Pak Gajah', teks: 'Di hutan yang luas, ada Pak Gajah yang badannya besar sekali. Belalainya panjang, bisa dipakai untuk minum dan mengambil daun. Telinganya lebar, seperti kipas raksasa! Telinga itu dikibas-kibaskan supaya badannya sejuk. Saat mandi di sungai, Pak Gajah menyemprotkan air dengan belalainya. Byur! Anak-anak gajah tertawa senang terkena cipratan air.',
    petunjuk: ['belalainya bisa dipakai untuk minum', 'telinganya lebar seperti kipas raksasa', 'mandi dengan menyemprotkan air dari belalainya'] },
  'jerapah': { tokoh: 'Kak Jerapah', teks: 'Kak Jerapah punya leher yang panjaaang sekali. Kak Jerapah adalah hewan paling tinggi di dunia. Dengan lehernya, ia bisa makan daun di pohon yang tinggi. Lidahnya juga panjang dan berwarna gelap. Badannya bertotol-totol cokelat seperti gambar peta. Saat minum, Kak Jerapah harus membuka kakinya lebar-lebar supaya bisa menunduk.',
    petunjuk: ['lehernya panjang untuk makan daun di pohon tinggi', 'badannya bertotol-totol cokelat', 'hewan paling tinggi di dunia'] },
  'panda': { tokoh: 'Adik Panda', teks: 'Adik Panda berwarna hitam dan putih. Di sekitar matanya ada lingkaran hitam, seperti memakai kacamata. Adik Panda suka sekali makan bambu. Kres, kres! Ia bisa makan bambu dari pagi sampai sore. Setelah kenyang, Adik Panda berguling-guling dan memanjat pohon. Lalu ia tidur nyenyak di atas dahan.',
    petunjuk: ['suka sekali makan bambu', 'ada lingkaran hitam di sekitar matanya seperti kacamata', 'makan bambu dari pagi sampai sore lalu tidur di atas dahan'] },
  'beruang': { tokoh: 'Pak Beruang', teks: 'Pak Beruang badannya besar dan bulunya tebal. Pak Beruang suka sekali makan madu yang manis. Ia juga pandai menangkap ikan di sungai dengan cakarnya. Hap! Satu ikan tertangkap. Saat musim dingin tiba, Pak Beruang masuk ke dalam gua. Di sana ia tidur lama sekali sampai cuaca hangat kembali.',
    petunjuk: ['suka makan madu dan menangkap ikan di sungai', 'tidur lama di dalam gua saat musim dingin', 'bulunya tebal dan cakarnya kuat'] },
  'zebra': { tokoh: 'Kak Zebra', teks: 'Kak Zebra mirip kuda, tetapi badannya bergaris hitam dan putih. Setiap zebra punya garis yang berbeda-beda, seperti sidik jari. Kak Zebra tinggal di padang rumput yang luas. Ia suka makan rumput bersama kawanannya. Kalau ada bahaya, para zebra berlari bersama-sama. Garis-garis mereka membuat musuh bingung melihatnya.',
    petunjuk: ['mirip kuda tetapi badannya bergaris hitam putih', 'garis di badannya berbeda-beda seperti sidik jari', 'garisnya membuat musuh bingung'] },
  'rusa': { tokoh: 'Pak Rusa', teks: 'Pak Rusa berdiri tegak di tengah hutan. Di kepalanya ada tanduk yang bercabang seperti ranting pohon. Kakinya ramping dan larinya cepat sekali. Telinganya bisa mendengar suara yang sangat pelan. Pak Rusa suka makan rumput dan daun muda. Kalau mendengar suara aneh, Pak Rusa segera berlari masuk ke hutan.',
    petunjuk: ['tanduknya bercabang seperti ranting pohon', 'kakinya ramping dan larinya cepat', 'telinganya bisa mendengar suara yang sangat pelan'] },
  'kanguru': { tokoh: 'Bu Kanguru', teks: 'Bu Kanguru tinggal di negeri yang jauh bernama Australia. Ia punya kantong di perutnya. Di dalam kantong itu, anaknya tidur dengan nyaman dan hangat. Bu Kanguru berjalan dengan cara melompat memakai kaki belakangnya yang kuat. Boing, boing! Ekornya yang panjang membantunya tetap seimbang. Anak kanguru suka mengintip dari kantong ibunya.',
    petunjuk: ['punya kantong di perut untuk anaknya', 'berjalan dengan melompat memakai kaki belakang', 'berasal dari Australia dan ekornya membantu seimbang'] },
  'unta': { tokoh: 'Pak Unta', teks: 'Pak Unta tinggal di gurun pasir yang panas dan luas. Di punggungnya ada punuk untuk menyimpan lemak sebagai bekal. Karena itu, Pak Unta kuat berjalan jauh walaupun jarang minum. Bulu matanya panjang untuk melindungi mata dari pasir. Pak Unta sering membantu orang membawa barang melewati gurun. Pelan-pelan, langkahnya tidak pernah lelah.',
    petunjuk: ['tinggal di gurun pasir yang panas', 'punya punuk di punggungnya', 'bulu matanya panjang untuk melindungi mata dari pasir'] },
  'kuda nil': { tokoh: 'Bu Kuda Nil', teks: 'Bu Kuda Nil suka berendam di sungai supaya badannya sejuk. Kulitnya tebal, dan ia bisa menahan napas lama di dalam air. Saat menguap, mulutnya terbuka lebar sekali. Wah, besar sekali mulutnya! Malam hari, Bu Kuda Nil naik ke darat untuk makan rumput. Walaupun badannya berat, Bu Kuda Nil bisa berlari cepat.',
    petunjuk: ['suka berendam di sungai supaya sejuk', 'mulutnya besar sekali saat menguap', 'naik ke darat di malam hari untuk makan rumput'] },
  'ular': { tokoh: 'Si Ular', teks: 'Ssst! Si Ular bergerak pelan di antara dedaunan. Si Ular tidak punya kaki. Ia berjalan dengan cara meliuk-liuk di tanah. Kulitnya bersisik dan licin. Lidahnya sering dijulurkan untuk mencium bau di sekitarnya. Kalau kulitnya sudah sempit, Si Ular berganti kulit yang baru.',
    petunjuk: ['tidak punya kaki dan berjalan meliuk-liuk', 'kulitnya bersisik dan licin', 'berganti kulit kalau kulitnya sudah sempit'] },
  'landak': { tokoh: 'Adik Landak', teks: 'Adik Landak keluar dari sarangnya saat hari mulai gelap. Badannya kecil dan penuh duri. Ia berjalan sambil mencari serangga kecil untuk dimakan. Tiba-tiba, ada suara keras! Adik Landak takut, lalu menggulung badannya menjadi bulat seperti bola. Duri-durinya melindunginya dari bahaya. Setelah aman, Adik Landak kembali berjalan pelan.',
    petunjuk: ['badannya penuh duri', 'menggulung badan seperti bola kalau takut', 'keluar mencari serangga saat hari mulai gelap'] },
  'ikan': { tokoh: 'Si Ikan Mas', teks: 'Si Ikan Mas tinggal di sebuah kolam yang jernih. Ia berenang ke sana kemari dengan siripnya. Si Ikan bernapas dengan insang, jadi bisa hidup di dalam air. Sisiknya berkilau berwarna oranye saat terkena cahaya. Blup, blup! Si Ikan membuat gelembung-gelembung kecil. Kalau ada makanan ditaburkan, Si Ikan cepat-cepat datang.',
    petunjuk: ['berenang dengan sirip dan bernapas dengan insang', 'sisiknya berkilau oranye', 'membuat gelembung blup, blup di kolam'] },
  'katak': { tokoh: 'Pak Katak', teks: 'Hujan turun rintik-rintik. Kung, kong, kung, kong! Pak Katak bernyanyi gembira di dekat kolam. Kaki belakangnya panjang, jadi Pak Katak pandai melompat jauh. Hap! Lidahnya yang panjang menangkap seekor nyamuk. Dulu, waktu kecil, Pak Katak adalah kecebong yang berenang di air. Sekarang ia bisa hidup di air dan di darat.',
    petunjuk: ['bernyanyi di dekat kolam saat hujan', 'lidahnya panjang untuk menangkap serangga', 'waktu kecil adalah kecebong'] },
  'kura-kura': { tokoh: 'Nenek Kura-kura', teks: 'Nenek Kura-kura berjalan pelan-pelan sekali menuju kolam. Di punggungnya ada cangkang keras seperti rumah. Kalau takut, Nenek Kura-kura menyembunyikan kepala dan kakinya di dalam cangkang. Walaupun pelan, Nenek Kura-kura tidak pernah menyerah. Kura-kura bisa hidup sangat lama, bahkan lebih dari seratus tahun. Nenek Kura-kura suka makan sayuran dan daun.',
    petunjuk: ['menyembunyikan kepala di dalam cangkang kalau takut', 'punya cangkang keras di punggungnya', 'bisa hidup sangat lama, lebih dari seratus tahun'] },
  'buaya': { tokoh: 'Pak Buaya', teks: 'Pak Buaya suka berjemur di tepi sungai saat matahari bersinar. Kulitnya keras dan bersisik, seperti baju besi. Giginya banyak dan tajam. Pak Buaya pandai berenang diam-diam di dalam air. Yang terlihat hanya mata dan hidungnya saja. Teman-teman, kalau bertemu buaya, jangan mendekat, ya!',
    petunjuk: ['suka berjemur di tepi sungai', 'giginya banyak dan tajam', 'berenang diam-diam, hanya mata dan hidungnya yang terlihat'] },
  'lumba-lumba': { tokoh: 'Kak Lumba-lumba', teks: 'Kak Lumba-lumba tinggal di laut yang biru. Kak Lumba-lumba sangat pintar dan ramah. Ia suka melompat tinggi keluar dari air. Byur! Lalu ia menyelam lagi ke dalam laut. Kak Lumba-lumba berbicara dengan teman-temannya memakai suara siulan. Ia senang bermain bersama teman-temannya setiap hari.',
    petunjuk: ['pintar dan suka melompat tinggi keluar dari air', 'berbicara dengan teman-temannya memakai suara siulan', 'tinggal di laut dan senang bermain bersama teman'] },
  'ikan paus': { tokoh: 'Pak Paus', teks: 'Pak Paus adalah hewan paling besar di laut. Badannya bahkan lebih besar daripada sebuah bus! Pak Paus bernapas dengan naik ke permukaan air. Dari atas kepalanya, Pak Paus menyemburkan air seperti air mancur. Byur! Pak Paus melompat dan membuat ombak besar. Lalu ia bernyanyi dengan suara yang merdu di dalam laut.',
    petunjuk: ['hewan paling besar di laut', 'menyemburkan air seperti air mancur dari kepalanya', 'badannya lebih besar daripada sebuah bus'] },
  'kepiting': { tokoh: 'Si Kepiting', teks: 'Si Kepiting tinggal di pantai yang berpasir. Si Kepiting punya dua capit yang kuat. Capit itu dipakai untuk mengambil makanan. Jalannya lucu, menyamping ke kiri dan ke kanan. Kalau ombak datang, Si Kepiting cepat-cepat bersembunyi di dalam lubang pasir. Setelah ombak pergi, ia keluar lagi berjalan-jalan.',
    petunjuk: ['punya dua capit yang kuat', 'jalannya menyamping', 'bersembunyi di lubang pasir saat ombak datang'] },
  'gurita': { tokoh: 'Bu Gurita', teks: 'Bu Gurita tinggal di dasar laut di antara batu karang. Bu Gurita punya delapan tangan yang panjang. Di tangannya ada alat isap kecil untuk menempel di batu. Bu Gurita juga bisa mengubah warna kulitnya supaya tidak terlihat. Kalau ada bahaya, Bu Gurita menyemprotkan tinta hitam. Lalu ia cepat-cepat bersembunyi.',
    petunjuk: ['punya delapan tangan yang panjang', 'menyemprotkan tinta hitam kalau ada bahaya', 'bisa mengubah warna kulitnya'] },
  'pinguin': { tokoh: 'Adik Pinguin', teks: 'Adik Pinguin tinggal di tempat yang dingin dan bersalju. Adik Pinguin adalah burung, tetapi tidak bisa terbang. Sayapnya dipakai untuk berenang cepat di dalam air. Di darat, jalannya lucu, bergoyang-goyang ke kanan dan ke kiri. Kadang-kadang, Adik Pinguin meluncur di atas es dengan perutnya. Wus! Seru sekali!',
    petunjuk: ['burung yang tidak bisa terbang', 'tinggal di tempat dingin dan bersalju', 'meluncur di atas es dengan perutnya'] },
  'burung': { tokoh: 'Si Burung Pipit', teks: 'Cuit, cuit, cuit! Si Burung Pipit bernyanyi di atas dahan. Ia mengepakkan sayapnya, lalu terbang tinggi di langit. Si Burung mencari ranting dan rumput kering. Dengan paruhnya, ia menyusun ranting itu menjadi sarang. Di dalam sarang, ada telur-telur kecil. Si Burung menjaga telurnya sampai menetas.',
    petunjuk: ['bernyanyi cuit, cuit di atas dahan', 'membuat sarang dari ranting dan rumput', 'menyusun sarang dengan paruhnya'] },
  'burung hantu': { tokoh: 'Kakek Burung Hantu', teks: 'Saat semua hewan tidur, Kakek Burung Hantu justru bangun. Huu, huu! Ia bertengger di dahan pohon yang tinggi. Matanya besar dan bulat, jadi bisa melihat dalam gelap. Kepalanya bisa menoleh jauh ke belakang. Sayapnya bergerak tanpa suara saat terbang. Pagi hari, Kakek Burung Hantu pulang dan tidur di lubang pohon.',
    petunjuk: ['bangun di malam hari dan matanya besar', 'kepalanya bisa menoleh jauh ke belakang', 'terbang tanpa suara'] },
  'burung beo': { tokoh: 'Si Beo', teks: 'Halo, halo! Selamat pagi! Itu suara Si Beo yang pintar. Si Beo bisa menirukan suara orang. Bulunya berwarna-warni, merah, kuning, dan biru. Paruhnya bengkok dan kuat untuk memecah biji-bijian. Si Beo suka bertengger di dahan sambil bernyanyi. Kalau diajak bicara, Si Beo menjawab dengan riang.',
    petunjuk: ['bisa menirukan suara orang', 'bulunya berwarna-warni merah, kuning, dan biru', 'paruhnya bengkok untuk memecah biji'] },
  'lebah': { tokoh: 'Si Lebah', teks: 'Nguuung! Si Lebah terbang dari bunga ke bunga. Ia mengumpulkan sari bunga yang manis. Badannya bergaris kuning dan hitam. Si Lebah membawa sari bunga pulang ke sarangnya. Di sana, para lebah bekerja sama membuat madu. Madu itu manis dan sehat untuk kita.',
    petunjuk: ['terbang dari bunga ke bunga dan membuat madu', 'badannya bergaris kuning dan hitam', 'bekerja sama di sarang membuat madu'] },
  'kupu-kupu': { tokoh: 'Kak Kupu-kupu', teks: 'Dulu, Kak Kupu-kupu adalah ulat kecil berwarna hijau. Ulat kecil itu makan daun setiap hari sampai gemuk. Lalu ia membungkus dirinya dan tidur di dalam kepompong. Beberapa hari kemudian, kepompong itu terbuka. Wah, keluarlah Kak Kupu-kupu dengan sayap yang indah berwarna-warni! Kak Kupu-kupu terbang ke taman dan hinggap di bunga-bunga.',
    petunjuk: ['dulu adalah ulat kecil yang tidur di kepompong', 'sayapnya indah berwarna-warni', 'waktu menjadi ulat, makan daun setiap hari sampai gemuk'] },
  'semut': { tokoh: 'Si Semut', teks: 'Si Semut badannya kecil, tetapi kuat sekali. Ia bisa mengangkat makanan yang lebih besar dari badannya. Suatu hari, Si Semut menemukan remah roti. Ia memanggil teman-temannya. Para semut berjalan berbaris rapi dan bergotong royong membawa roti ke sarang. Hidup rukun dan saling membantu itu menyenangkan!',
    petunjuk: ['kecil tetapi kuat mengangkat makanan', 'suka bergotong royong membawa makanan ke sarang', 'berjalan berbaris rapi'] },
  'laba-laba': { tokoh: 'Si Laba-laba', teks: 'Si Laba-laba punya delapan kaki yang panjang. Pagi-pagi, Si Laba-laba sudah sibuk bekerja. Ia membuat jaring dari benang yang sangat tipis. Jaring itu berbentuk seperti roda sepeda. Saat embun pagi menempel, jaringnya berkilau indah. Serangga yang terbang bisa tersangkut di jaringnya.',
    petunjuk: ['membuat jaring dari benang yang sangat tipis', 'serangga bisa tersangkut di jaringnya', 'jaringnya berbentuk seperti roda sepeda'] },
  'siput': { tokoh: 'Si Siput', teks: 'Setelah hujan reda, Si Siput keluar dari persembunyiannya. Si Siput berjalan pelan-pelan sekali di atas daun. Ia membawa rumahnya ke mana-mana, yaitu cangkang di punggungnya. Badannya lembut dan berlendir. Di kepalanya ada dua antena kecil untuk melihat. Kalau takut, Si Siput masuk ke dalam cangkangnya.',
    petunjuk: ['badannya lembut dan berlendir', 'membawa rumahnya ke mana-mana', 'punya dua antena kecil di kepalanya'] },
};

// Rekaman suara hewan asli (Wikimedia Commons, lihat suara-hewan/SUMBER.md). Hewan tanpa rekaman tidak dicantumkan.
const BUNYI_HEWAN = {
  'kucing': 'suara-hewan/kucing.mp3',
  'anjing': 'suara-hewan/anjing.mp3',
  'sapi': 'suara-hewan/sapi.mp3',
  'ayam': 'suara-hewan/ayam.mp3',
  'bebek': 'suara-hewan/bebek.mp3',
  'kambing': 'suara-hewan/kambing.mp3',
  'domba': 'suara-hewan/domba.mp3',
  'kuda': 'suara-hewan/kuda.mp3',
  'singa': 'suara-hewan/singa.mp3',
  'harimau': 'suara-hewan/harimau.mp3',
  'monyet': 'suara-hewan/monyet.mp3',
  'katak': 'suara-hewan/katak.mp3',
  'burung': 'suara-hewan/burung.mp3',
  'burung hantu': 'suara-hewan/burung-hantu.mp3',
  'lebah': 'suara-hewan/lebah.mp3',
  'gajah': 'suara-hewan/gajah.mp3',
  'burung beo': 'suara-hewan/burung-beo.mp3',
  // Dibuat dengan ElevenLabs Sound Effects (tidak ada rekaman asli yang cocok)
  'tikus': 'suara-hewan/tikus.mp3',
  'ular': 'suara-hewan/ular.mp3',
  'lumba-lumba': 'suara-hewan/lumba-lumba.mp3',
};

// Tiruan bunyi hewan tidak dibacakan Cuking, tapi diganti rekaman hewan aslinya (tulisannya tetap tampil).
// Bila berkasnya belum ada, kalimat itu tetap diucapkan Cuking seperti biasa.
const BUNYI_KALIMAT = {
  'Meong!': 'suara-hewan/kucing.mp3',
  'Meong, meong!': 'suara-hewan/kucing.mp3',
  'Guk, guk, guk!': 'suara-hewan/anjing.mp3',
  'Mooo!': 'suara-hewan/sapi.mp3',
  'Kukuruyuuuk!': 'suara-hewan/ayam.mp3',
  'Ciap, ciap!': 'suara-hewan/anak-ayam.mp3',
  'Kwek, kwek, kwek!': 'suara-hewan/bebek.mp3',
  'Mbeeek!': 'suara-hewan/kambing.mp3',
  'Mbee, mbee!': 'suara-hewan/domba.mp3',
  'Hiiihiii!': 'suara-hewan/kuda.mp3',
  'Cit, cit, cit!': 'suara-hewan/tikus.mp3',
  'Auuum!': 'suara-hewan/singa.mp3',
  'Grrr!': 'suara-hewan/harimau.mp3',
  'Uuk, aak, aak!': 'suara-hewan/monyet.mp3',
  'Ssst!': 'suara-hewan/ular.mp3',
  'Kung, kong, kung, kong!': 'suara-hewan/katak.mp3',
  'Cuit, cuit, cuit!': 'suara-hewan/burung.mp3',
  'Huu, huu!': 'suara-hewan/burung-hantu.mp3',
  'Nguuung!': 'suara-hewan/lebah.mp3',
};

// Hewan yang petunjuknya mirip tidak dijadikan pilihan jawaban di soal yang sama
const MIRIP_HEWAN = [
  ['kura-kura', 'siput'], ['gurita', 'laba-laba'], ['kuda', 'zebra'], ['panda', 'zebra'],
  ['singa', 'harimau'], ['kucing', 'harimau'], ['lebah', 'kupu-kupu'], ['ular', 'buaya'],
  ['tikus', 'kelinci'], ['katak', 'kanguru'], ['monyet', 'panda'], ['kambing', 'domba', 'rusa'],
  ['burung', 'burung beo', 'burung hantu'], ['gajah', 'ikan paus'], ['bebek', 'pinguin', 'ikan'],
];


// warnaDasar = warna sederhana untuk soal "Buah apa yang warnanya ...?" (null bila lebih dari satu warna)
const BUAH = [
  { nama: 'apel',     emoji: '🍎', gambar: 'gambar/buah/apel.webp', warna: 'merah',  warnaDasar: 'merah',  rasa: 'manis',          ciri: 'bulat dan renyah' },
  { nama: 'pisang',   emoji: '🍌', gambar: 'gambar/buah/pisang.webp', warna: 'kuning', warnaDasar: 'kuning', rasa: 'manis',          ciri: 'panjang dan disukai monyet' },
  { nama: 'jeruk',    emoji: '🍊', gambar: 'gambar/buah/jeruk.webp', warna: 'oranye', warnaDasar: 'oranye', rasa: 'segar',          ciri: 'bulat dan banyak airnya' },
  { nama: 'anggur',   emoji: '🍇', gambar: 'gambar/buah/anggur.webp', warna: 'ungu',   warnaDasar: 'ungu',   rasa: 'manis',          ciri: 'kecil-kecil dan bergerombol' },
  { nama: 'semangka', emoji: '🍉', gambar: 'gambar/buah/semangka.webp', warna: 'hijau di luar, merah di dalam', warnaDasar: null, rasa: 'segar', ciri: 'hijau di luar dan merah di dalam' },
  { nama: 'stroberi', emoji: '🍓', gambar: 'gambar/buah/stroberi.webp', warna: 'merah',  warnaDasar: 'merah',  rasa: 'manis dan asam', ciri: 'punya bintik-bintik kecil' },
  { nama: 'nanas',    emoji: '🍍', gambar: 'gambar/buah/nanas.webp', warna: 'kuning', warnaDasar: 'kuning', rasa: 'manis dan asam', ciri: 'kulitnya kasar dan punya mahkota daun' },
  { nama: 'mangga',   emoji: '🥭', gambar: 'gambar/buah/mangga.webp', warna: 'kuning kehijauan', warnaDasar: null, rasa: 'manis', ciri: 'manis dan wangi' },
  { nama: 'ceri',     emoji: '🍒', gambar: 'gambar/buah/ceri.webp', warna: 'merah',  warnaDasar: 'merah',  rasa: 'manis',          ciri: 'kecil dan kembar' },
  { nama: 'pir',      emoji: '🍐', gambar: 'gambar/buah/pir.webp', warna: 'hijau',  warnaDasar: 'hijau',  rasa: 'manis',          ciri: 'bentuknya seperti lonceng' },
  { nama: 'kelapa',   emoji: '🥥', gambar: 'gambar/buah/kelapa.webp', warna: 'cokelat', warnaDasar: 'cokelat', rasa: 'gurih',        ciri: 'kulitnya keras dan airnya segar' },
  { nama: 'lemon',    emoji: '🍋', gambar: 'gambar/buah/lemon.webp', warna: 'kuning', warnaDasar: 'kuning', rasa: 'asam sekali',    ciri: 'rasanya asam sekali' },
  { nama: 'alpukat',  emoji: '🥑', gambar: 'gambar/buah/alpukat.webp', warna: 'hijau',  warnaDasar: 'hijau',  rasa: 'lembut dan gurih', ciri: 'punya biji yang besar' },
  { nama: 'melon',    emoji: '🍈', gambar: 'gambar/buah/melon.webp', warna: 'hijau',  warnaDasar: 'hijau',  rasa: 'manis',          ciri: 'besar dan bulat' },
  { nama: 'kiwi',     emoji: '🥝', gambar: 'gambar/buah/kiwi.webp', warna: 'cokelat di luar, hijau di dalam', warnaDasar: null, rasa: 'manis dan asam', ciri: 'kulitnya berbulu halus' },
  { nama: 'persik',   emoji: '🍑', gambar: 'gambar/buah/persik.webp', warna: 'oranye kemerahan', warnaDasar: null, rasa: 'manis',  ciri: 'kulitnya lembut seperti beludru' },
  { nama: 'bluberi',  emoji: '🫐', gambar: 'gambar/buah/bluberi.webp', warna: 'biru',   warnaDasar: 'biru',   rasa: 'manis dan asam', ciri: 'kecil, bulat, dan biru' },
  { nama: 'tomat',    emoji: '🍅', gambar: 'gambar/buah/tomat.webp', warna: 'merah',  warnaDasar: 'merah',  rasa: 'segar',          ciri: 'sering dibuat saus' },
];

// benda = contoh benda berwarna itu; mirip = warna yang mudah tertukar (tidak dijadikan pengecoh)
const WARNA = [
  { nama: 'merah',      hex: '#fa5252', mirip: ['pink', 'oranye'], benda: [{ e: '🍎', n: 'apel' }, { e: '🍓', n: 'stroberi' }, { e: '🚒', n: 'mobil pemadam kebakaran' }, { e: '🌹', n: 'bunga mawar' }, { e: '🍅', n: 'tomat' }] },
  { nama: 'kuning',     hex: '#fcc419', mirip: ['oranye'], benda: [{ e: '🍌', n: 'pisang' }, { e: '🌻', n: 'bunga matahari' }, { e: '🐥', n: 'anak ayam' }, { e: '🍋', n: 'lemon' }, { e: '🧀', n: 'keju' }] },
  { nama: 'hijau',      hex: '#40c057', mirip: [], benda: [{ e: '🐸', n: 'katak' }, { e: '🥦', n: 'brokoli' }, { e: '🥒', n: 'timun' }, { e: '🌳', n: 'daun pohon' }] },
  { nama: 'biru',       hex: '#339af0', mirip: ['ungu'], benda: [{ e: '🐳', n: 'ikan paus' }, { e: '💧', n: 'tetes air' }, { e: '🫐', n: 'bluberi' }, { e: '👖', n: 'celana jins' }] },
  { nama: 'oranye',     hex: '#fd7e14', mirip: ['merah', 'kuning', 'cokelat'], benda: [{ e: '🍊', n: 'jeruk' }, { e: '🥕', n: 'wortel' }, { e: '🎃', n: 'labu' }, { e: '🦊', n: 'rubah' }] },
  { nama: 'ungu',       hex: '#9c36b5', mirip: ['biru', 'pink'], benda: [{ e: '🍇', n: 'anggur' }, { e: '🍆', n: 'terong' }] },
  { nama: 'pink',       hex: '#f783ac', mirip: ['merah', 'ungu'], benda: [{ e: '🌸', n: 'bunga sakura' }, { e: '🦩', n: 'burung flamingo' }, { e: '🎀', n: 'pita' }] },
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
  { h: 'A', eja: 'a',   kata: 'Ayam',    emoji: '🐔', gambar: 'gambar/hewan/ayam.webp' },
  { h: 'B', eja: 'be',  kata: 'Bola',    emoji: '⚽', gambar: 'gambar/huruf/bola.webp' },
  { h: 'C', eja: 'ce',  kata: 'Cicak',   emoji: '🦎', gambar: 'gambar/huruf/cicak.webp' },
  { h: 'D', eja: 'de',  kata: 'Domba',   emoji: '🐑', gambar: 'gambar/hewan/domba.webp' },
  { h: 'E', eja: 'e',   kata: 'Elang',   emoji: '🦅', gambar: 'gambar/huruf/elang.webp' },
  { h: 'F', eja: 'ef',  kata: 'Foto',    emoji: '📷', gambar: 'gambar/huruf/foto.webp' },
  { h: 'G', eja: 'ge',  kata: 'Gajah',   emoji: '🐘', gambar: 'gambar/hewan/gajah.webp' },
  { h: 'H', eja: 'ha',  kata: 'Harimau', emoji: '🐯', gambar: 'gambar/hewan/harimau.webp' },
  { h: 'I', eja: 'i',   kata: 'Ikan',    emoji: '🐟', gambar: 'gambar/hewan/ikan.webp' },
  { h: 'J', eja: 'je',  kata: 'Jeruk',   emoji: '🍊', gambar: 'gambar/buah/jeruk.webp' },
  { h: 'K', eja: 'ka',  kata: 'Kucing',  emoji: '🐱', gambar: 'gambar/hewan/kucing.webp' },
  { h: 'L', eja: 'el',  kata: 'Lebah',   emoji: '🐝', gambar: 'gambar/hewan/lebah.webp' },
  { h: 'M', eja: 'em',  kata: 'Mobil',   emoji: '🚗', gambar: 'gambar/huruf/mobil.webp' },
  { h: 'N', eja: 'en',  kata: 'Nanas',   emoji: '🍍', gambar: 'gambar/buah/nanas.webp' },
  { h: 'O', eja: 'o',   kata: 'Obeng',   emoji: '🪛', gambar: 'gambar/huruf/obeng.webp' },
  { h: 'P', eja: 'pe',  kata: 'Pisang',  emoji: '🍌', gambar: 'gambar/buah/pisang.webp' },
  { h: 'Q', eja: 'ki',  kata: 'Quran',   emoji: '📖', gambar: 'gambar/huruf/quran.webp' },
  { h: 'R', eja: 'er',  kata: 'Rumah',   emoji: '🏠', gambar: 'gambar/huruf/rumah.webp' },
  { h: 'S', eja: 'es',  kata: 'Sapi',    emoji: '🐮', gambar: 'gambar/hewan/sapi.webp' },
  { h: 'T', eja: 'te',  kata: 'Topi',    emoji: '🎩', gambar: 'gambar/huruf/topi.webp' },
  { h: 'U', eja: 'u',   kata: 'Ular',    emoji: '🐍', gambar: 'gambar/hewan/ular.webp' },
  { h: 'V', eja: 've',  kata: 'Vas',     emoji: '🏺', gambar: 'gambar/huruf/vas.webp' },
  { h: 'W', eja: 'we',  kata: 'Wortel',  emoji: '🥕', gambar: 'gambar/huruf/wortel.webp' },
  { h: 'X', eja: 'eks', kata: 'Xilofon', emoji: '🎶' },
  { h: 'Y', eja: 'ye',  kata: 'Yoyo',    emoji: '🪀' },
  { h: 'Z', eja: 'zet', kata: 'Zebra',   emoji: '🦓', gambar: 'gambar/hewan/zebra.webp' },
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


// Urutan = urutan pos di Peta Petualangan (sesuai jalan cerita)
const MENU = [
  // Pos utama: tampil paling besar di atas
  { id: 'belajar', ikon: '📖', nama: 'Kenalan Yuk',   warna: '#22b8cf', utama: true,
    ket: 'Kenali hewan, buah, angka, warna, bentuk, dan huruf', contoh: '🐶 🍎 🔢 🎨 🔺 🔤' },
  { id: 'hewan',   ikon: '🐶', nama: 'Tebak Hewan',   warna: '#ff8a5c' },
  { id: 'buah',    ikon: '🍎', nama: 'Tebak Buah',    warna: '#51cf66' },
  { id: 'warna',   ikon: '🎨', nama: 'Tebak Warna',   warna: '#cc5de8' },
  { id: 'bentuk',  ikon: '🔺', nama: 'Tebak Bentuk',  warna: '#f06595' },
  { id: 'huruf',   ikon: '🔤', nama: 'Tebak Huruf',   warna: '#845ef7' },
  { id: 'hitung',  ikon: '🧮', nama: 'Ayo Berhitung', warna: '#fcc419' },
  { id: 'urut',    ikon: '🚂', nama: 'Urutkan Angka', warna: '#4dabf7' },
];

// Jalan cerita dari pemilik proyek. teks = narasi yang selalu dibacakan Cuking saat layar cerita dibuka
const CERITA = {
  pembukaan: {
    ikon: '🌈', judul: 'Selamat Datang di Taman Ceria', sub: 'Pembukaan', tombol: '▶ Mulai Petualangan',
    teks: [
      'Halo, teman-teman! Selamat datang di Taman Ceria! 🌻',
      'Di sini ada banyak hal menarik yang bisa kita pelajari. Ada berbagai macam hewan, buah-buahan, warna, bentuk, angka, dan huruf.',
      'Yuk, kita mulai petualangan untuk mengenal hal-hal baru sambil bermain. Siapkan semangat kalian, ya!',
    ],
  },
  belajar: {
    ikon: '👋', judul: 'Kenalan Yuk', sub: 'Ayo Mengenal Lebih Banyak!',
    teks: [
      'Sebelum memulai berbagai permainan, kita akan berkenalan terlebih dahulu dengan hal-hal menarik yang ada di Taman Ceria.',
      'Di sini teman-teman bisa memilih gambar hewan, buah, angka, warna, bentuk, dan huruf. Sentuh setiap gambar yang tersedia untuk mengetahui nama dan mengenalnya lebih dekat.',
      'Meong! Ayo, teman-teman, kita bermain bersama! Ada banyak tebak-tebakan seru yang harus dijawab. Selesaikan semua misinya dan kumpulkan bintang sebanyak-banyaknya, ya!',
    ],
  },
  hewan: {
    ikon: '🐶', judul: 'Tebak Hewan', sub: 'Mengenal Sahabat Hewan',
    teks: [
      'Setelah berkenalan dengan berbagai hewan, sekarang waktunya bermain tebak-tebakan!',
      'Coba dengarkan suara yang muncul, lalu pilih gambar hewan yang cocok dengan suara tersebut.',
      'Kira-kira suara hewan apa, ya? Yuk, kita tebak bersama! 🐾🎉',
    ],
  },
  buah: {
    ikon: '🍎', judul: 'Tebak Buah', sub: 'Berkunjung ke Kebun Buah',
    teks: [
      'Selanjutnya, kita pergi ke kebun buah yang penuh dengan buah-buahan segar.',
      'Ada apel, pisang, jeruk, mangga, dan berbagai buah lainnya.',
      'Ayo, tebak nama buah yang muncul. Siapa yang bisa menjawab dengan benar?',
    ],
  },
  warna: {
    ikon: '🎨', judul: 'Tebak Warna', sub: 'Bermain di Taman Pelangi',
    teks: [
      'Wah, sekarang kita sampai di taman pelangi!',
      'Ada banyak warna indah di sana, seperti merah, kuning, hijau, biru, dan ungu.',
      'Yuk, amati warna yang muncul dan tebak namanya!',
    ],
  },
  bentuk: {
    ikon: '🔺', judul: 'Tebak Bentuk', sub: 'Menjelajahi Dunia Bentuk',
    teks: [
      'Perjalanan berlanjut ke tempat berbagai bentuk.',
      'Ada lingkaran, segitiga, persegi, dan persegi panjang.',
      'Ayo, kenali bentuk-bentuk tersebut dan tebak nama bentuk yang ditampilkan!',
    ],
  },
  huruf: {
    ikon: '🔤', judul: 'Tebak Huruf', sub: 'Berkunjung ke Dunia Huruf',
    teks: [
      'Sekarang kita memasuki dunia huruf.',
      'Di sini ada banyak huruf dari A sampai Z. Teman-teman diajak mengenal dan menebak huruf yang muncul.',
      'Yuk, belajar huruf dengan cara yang menyenangkan!',
    ],
  },
  hitung: {
    ikon: '🧮', judul: 'Ayo Berhitung', sub: 'Bermain Angka',
    teks: [
      'Setelah mengenal huruf, sekarang waktunya belajar berhitung.',
      'Kita akan menghitung berbagai benda dan mengenal jumlahnya.',
      'Ayo, hitung bersama dan pilih jawaban yang tepat!',
    ],
  },
  urut: {
    ikon: '🚂', judul: 'Urutkan Angka', sub: 'Petualangan Kereta Angka',
    teks: [
      'Teman-teman, lihat deh! Ada kereta api yang sedang membawa gerbong kosong, nih.',
      'Wah, sepertinya gerbongnya belum tersusun dengan benar. Yuk, kita bantu Pak Masinis menyusun angka-angkanya, agar kereta bisa melanjutkan perjalanan!',
    ],
  },
  penutup: {
    ikon: '🎉', judul: 'Hore, Kita Berhasil!', sub: 'Penutup',
    teks: [
      'Horeee! Kita sudah menyelesaikan semua misi petualangan di Taman Ceria!',
      'Wah, seru sekali ya! Kita sudah belajar banyak hal dan berhasil mengumpulkan banyak bintang. ⭐',
      'Tapi, petualangan kita belum selesai, lho! Yuk, main lagi dan kumpulkan bintang sebanyak-banyaknya! Ayo, teman-teman, kita cari bintang lebih banyak lagi! 🌟🐱',
    ],
  },
};

const PUJIAN = ['Hebat!', 'Pintar sekali!', 'Wah, keren!', 'Betul sekali!', 'Hore, benar!', 'Kamu jago!', 'Luar biasa!', 'Mantap!', 'Tepuk tangan untukmu!'];
const SEMANGAT = ['Coba lagi ya!', 'Ayo, kamu pasti bisa!', 'Hampir! Coba lagi ya!', 'Tidak apa-apa, coba lagi!'];
