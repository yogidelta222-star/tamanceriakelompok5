/* =========================================================
   Menyusun daftar SEMUA kalimat yang bisa diucapkan Cuking,
   untuk dibuatkan rekamannya oleh tools/buat_suara.py.

   Jalankan:  node tools/daftar-kalimat.js
   Hasil:     tools/kalimat.json

   Pola kalimat di sini harus sama dengan yang ada di app.js.
   Kalimat yang terlewat tetap diucapkan dengan suara browser.
   ========================================================= */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const akar = path.join(__dirname, '..');
const konteks = {};
vm.createContext(konteks);
vm.runInContext(
  fs.readFileSync(path.join(akar, 'data.js'), 'utf8') +
    '\n;Object.assign(this, { ANGKA_KATA, HEWAN, DONGENG, BUAH, WARNA, BENTUK, HURUF, BENDA, MENU, CERITA, PUJIAN, SEMANGAT, BUNYI_KALIMAT });',
  konteks,
);
const { ANGKA_KATA, HEWAN, DONGENG, BUAH, WARNA, BENTUK, HURUF, BENDA, MENU, CERITA, PUJIAN, SEMANGAT, BUNYI_KALIMAT } = konteks;

const kata = (n) => ANGKA_KATA[n] || String(n);
const besarAwal = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const rentang = (a, b) => Array.from({ length: b - a + 1 }, (_, i) => a + i);
const deretKata = (a, b) => besarAwal((a <= b ? rentang(a, b) : rentang(b, a).reverse()).map(kata).join(', '));

// Harus sama persis dengan pecahKalimat() di app.js
const BUANG_EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
const pecahKalimat = (teks) => {
  const bersih = teks.replace(BUANG_EMOJI, '').replace(/\s+/g, ' ').trim();
  return (bersih.match(/[^.!?]+[.!?]*/g) || [bersih]).map((k) => k.trim()).filter(Boolean);
};

const semua = new Set();
const tambah = (...teks) => teks.forEach((t) => pecahKalimat(t).forEach((k) => semua.add(k)));

// ---------- Umum ----------
tambah(
  'Meong! Halo teman! Aku Cuking. Ayo kita belajar sambil bermain!',
  'Suara nyala!',
  'Ayo kenalan! Sentuh gambarnya, nanti Cuking sebutkan namanya.',
  'Hore! Kamu hebat sekali! Kamu dapat lima bintang! Mau main lagi?',
  'Hore! Kamu hebat sekali! Kamu dapat lima bintang! Semua pos sudah selesai! Ayo lihat kejutannya!',
  'Hore! Pos Kenalan Yuk selesai!',
  'Hore, semua pos sudah selesai! Sentuh bendera untuk melihat kejutannya!',
  ...PUJIAN, ...SEMANGAT,
);

// ---------- Jalan cerita & Peta Petualangan ----------
Object.values(CERITA).forEach((c) => tambah(c.teks.join(' ')));
MENU.forEach((m) => tambah(`Ayo lanjut ke ${m.nama}!`));
rentang(1, MENU.length).forEach((n) => tambah(`Selesaikan semua pos dulu, ya! Masih ada ${kata(n)} pos lagi.`));
['hewan', 'buah', 'angka', 'warna', 'bentuk', 'huruf'].forEach((t) => tambah(`Ayo kenalan dengan ${t}!`));
rentang(1, 10).forEach((n) => tambah(`${besarAwal(kata(n))}!`, `${besarAwal(kata(n))}.`, `Itu angka ${kata(n)}.`));

// ---------- Hewan: dongeng (Kenalan Yuk) & kuis dari petunjuk dongeng (Tebak Hewan) ----------
HEWAN.forEach((h) => {
  const d = DONGENG[h.nama];
  tambah(d.teks, `Itu ${h.nama}.`);
  d.petunjuk.forEach((p) => tambah(`Ingat dongengnya? Siapa yang ${p}?`, `Itu ${d.tokoh} dari dongeng tadi! ${besarAwal(d.tokoh)} ${p}.`));
});

// ---------- Tebak nama: Buah, Warna, Bentuk ("... apa ini?" lalu pilih tulisan + 🔊) ----------
tambah('Buah apa ini?', 'Warna apa ini?', 'Bentuk apa ini?');
BUAH.forEach((b) => tambah(
  `${besarAwal(b.nama)}.`, `Itu buah ${b.nama}.`, `Ini buah ${b.nama}.`,
  `Warnanya ${b.warna}, rasanya ${b.rasa}!`, `Warnanya ${b.warna}, rasanya ${b.rasa}.`,
));
WARNA.forEach((w) => {
  tambah(`${besarAwal(w.nama)}.`, `Itu warna ${w.nama}.`, `Seperti ${w.benda[0].n}.`);
  w.benda.forEach((b) => tambah(`Ini warna ${w.nama}, seperti ${b.n}.`));
});
BENTUK.forEach((s) => {
  tambah(`${besarAwal(s.nama)}.`, `Itu ${s.nama}.`, `Seperti ${s.contoh[0].n}.`);
  s.contoh.forEach((c) => tambah(`Ini ${s.nama}, seperti ${c.n}.`));
});
HURUF.forEach((h) => {
  const E = besarAwal(h.eja);
  tambah(`Itu huruf ${h.eja}.`, `Ini huruf ${h.eja}.`, `${E}, ${h.kata}!`, `${E}, ${h.kata}.`);
  // Tebak Huruf: "Mana huruf B?" dan "Bola. Huruf depannya apa?"
  tambah(`Mana huruf ${h.eja}?`, `${h.kata}. Huruf depannya apa?`, `${h.kata}, dimulai dengan huruf ${h.eja}.`);
});

// ---------- Berhitung ----------
BENDA.forEach((b) => {
  tambah(`Ada berapa ${b.nama}? Ayo kita hitung!`, `Jadi, ada berapa ${b.nama}?`);
  rentang(1, 10).forEach((n) => tambah(`Ada ${kata(n)} ${b.nama}.`));
  rentang(1, 7).forEach((n) => tambah(`Yang itu ada ${kata(n)} ${b.nama}.`));
});
['banyak', 'sedikit'].forEach((s) => {
  tambah(`Mana yang lebih ${s}?`);
  rentang(1, 7).forEach((t) => rentang(1, 7).forEach((o) => {
    if ((s === 'banyak' ? t - o : o - t) >= 2) tambah(`Yang ini ada ${kata(t)}, lebih ${s} dari ${kata(o)}.`);
  }));
});
rentang(1, 3).forEach((c) => tambah(`Datang lagi ${kata(c)}.`));
rentang(1, 3).forEach((a) => rentang(1, 3).forEach((c) => tambah(`${besarAwal(kata(a))} tambah ${kata(c)}, sama dengan ${kata(a + c)}!`)));
rentang(1, 10).forEach((n) => tambah(`${deretKata(1, n)}!`));

// ---------- Urutkan angka (dari terkecil hingga terbesar) ----------
tambah('Susun angkanya dari yang paling kecil.', 'Tut tuuut!', 'Keretanya berangkat!');
rentang(1, 10).forEach((n) => tambah(`Mulai dari angka ${kata(n)}!`, `Sekarang cari angka ${kata(n)}!`, `Cari angka ${kata(n)} dulu ya!`));
for (let pjg = 3; pjg <= 5; pjg++) {
  for (let a = 1; a + pjg - 1 <= 10; a++) tambah(`${deretKata(a, a + pjg - 1)}.`);
}
tambah(`${deretKata(1, 10)}.`); // soal terakhir: kereta 1 sampai 10

// Tiruan bunyi yang sudah punya rekaman hewan asli tidak perlu direkam suara Cuking
const diganti = Object.keys(BUNYI_KALIMAT).filter((k) => fs.existsSync(path.join(akar, BUNYI_KALIMAT[k])));
diganti.forEach((k) => semua.delete(k));

const daftar = [...semua].sort((a, b) => a.localeCompare(b, 'id'));
fs.writeFileSync(path.join(__dirname, 'kalimat.json'), JSON.stringify(daftar, null, 1), 'utf8');
console.log(`${daftar.length} kalimat ditulis ke tools/kalimat.json (${diganti.length} tiruan bunyi memakai rekaman hewan asli)`);
