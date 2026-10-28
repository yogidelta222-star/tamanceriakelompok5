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
    '\n;Object.assign(this, { ANGKA_KATA, HEWAN, TEMPAT, BUAH, WARNA, BENTUK, HURUF, BENDA, BENDA_LAIN, PUJIAN, SEMANGAT });',
  konteks,
);
const { ANGKA_KATA, HEWAN, TEMPAT, BUAH, WARNA, BENTUK, HURUF, BENDA, BENDA_LAIN, PUJIAN, SEMANGAT } = konteks;

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
  'Meong! Halo teman! Aku Cuking, si kucing. Ayo kita belajar sambil bermain! Pilih gambarnya ya!',
  'Mau main apa hari ini? Pilih gambarnya ya!',
  'Meong! Halo teman! Aku Cuking. Ayo kita belajar sambil bermain!',
  'Suara nyala!',
  'Ayo kenalan! Sentuh gambarnya, nanti Cuking sebutkan namanya.',
  'Hore! Kamu hebat sekali! Kamu dapat lima bintang! Mau main lagi?',
  'Ayo tebak hewan!', 'Ayo tebak buah!', 'Ayo tebak warna!', 'Ayo tebak bentuk!', 'Ayo tebak huruf!',
  'Ayo berhitung bersama!', 'Tut tuut! Ayo bantu kereta.',
  ...PUJIAN, ...SEMANGAT,
);
['hewan', 'buah', 'angka', 'warna', 'bentuk', 'huruf'].forEach((t) => tambah(`Ayo kenalan dengan ${t}!`));
rentang(1, 10).forEach((n) => tambah(`${besarAwal(kata(n))}!`, `${besarAwal(kata(n))}.`, `Itu angka ${kata(n)}.`));

// ---------- Hewan ----------
HEWAN.forEach((h) => {
  const N = besarAwal(h.nama);
  tambah(`Mana ${h.nama}?`, `Ini ${h.nama}.`, `Itu ${h.nama}.`, `${N} itu hewan.`, `Hewan apa yang ${h.ciri}?`, `${N} ${h.ciri}.`, `${N}.`);
  if (h.suara) tambah(`Hewan apa yang bunyinya, ${h.suara}?`, `Bunyinya, ${h.suara}!`);
  if (h.tempat) tambah(`${N} ${TEMPAT[h.tempat].tanya}.`);
  if (h.ukuran >= 4) tambah(`${N} yang paling besar.`);
  if (h.ukuran === 1) tambah(`${N} yang paling kecil.`);
});
Object.values(TEMPAT).forEach((T) => tambah(`Mana hewan yang ${T.tanya}?`));
tambah('Mana hewan yang paling besar?', 'Mana hewan yang paling kecil?', 'Mana yang bukan hewan?', 'Mana yang bukan buah?');
[...BUAH, ...BENDA_LAIN].forEach((x) => tambah(`Ini ${x.nama}.`, `${besarAwal(x.nama)} bukan hewan.`));
[...HEWAN, ...BENDA_LAIN].forEach((x) => tambah(`Ini ${x.nama}.`, `${besarAwal(x.nama)} bukan buah.`));

// ---------- Buah ----------
BUAH.forEach((b) => {
  const N = besarAwal(b.nama);
  tambah(
    `Mana buah ${b.nama}?`, `Ini buah ${b.nama}.`, `Itu buah ${b.nama}.`, `Itu ${b.nama}.`, `${N} itu buah.`,
    `Buah apa yang ${b.ciri}?`, `Rasanya ${b.rasa}!`, `Warnanya ${b.warna}!`, `Warnanya ${b.warna}, rasanya ${b.rasa}!`,
    `${N}.`, `Warnanya ${b.warna}, rasanya ${b.rasa}.`,
  );
  if (b.warnaDasar) tambah(`Buah apa yang warnanya ${b.warnaDasar}?`);
});

// ---------- Warna ----------
WARNA.forEach((w) => {
  tambah(`Mana warna ${w.nama}?`, `Itu warna ${w.nama}.`, `${besarAwal(w.nama)}.`, `Seperti ${w.benda[0].n}.`);
  w.benda.forEach((b) => tambah(`Apa warna ${b.n}?`, `${besarAwal(b.n)} warnanya ${w.nama}.`, `Ini warna ${w.nama}, seperti ${b.n}.`));
});

// ---------- Bentuk ----------
BENTUK.forEach((s) => {
  tambah(`Mana bentuk ${s.nama}?`, `Itu ${s.nama}.`, `${besarAwal(s.nama)}.`, `Seperti ${s.contoh[0].n}.`);
  s.contoh.forEach((c) => tambah(`${besarAwal(c.n)}, bentuknya seperti apa?`, `${besarAwal(c.n)} bentuknya ${s.nama}.`, `Ini ${s.nama}, seperti ${c.n}.`));
});

// ---------- Huruf ----------
HURUF.forEach((h) => {
  const E = besarAwal(h.eja);
  tambah(
    `${h.kata}. Huruf depannya apa?`, `${h.kata}, dimulai dengan huruf ${h.eja}.`, `Mana huruf ${h.eja}?`, `Ini huruf ${h.eja}.`,
    `${E}, ${h.kata}!`, `Itu huruf ${h.eja}.`, `${E}.`, `${E}, ${h.kata}.`,
  );
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

// ---------- Urutkan angka ----------
tambah('Susun angkanya dari yang paling kecil.', 'Hitung mundur!', 'Susun dari yang paling besar.', 'Angka berapa yang hilang?',
  'Meluncuuur!', 'Tut tuuut!', 'Keretanya berangkat!');
rentang(1, 10).forEach((n) => tambah(
  `Mulai dari angka ${kata(n)}!`, `Sekarang cari angka ${kata(n)}!`, `Cari angka ${kata(n)} dulu ya!`, `Angka yang hilang adalah ${kata(n)}.`,
));
for (let pjg = 3; pjg <= 6; pjg++) {
  for (let a = 1; a + pjg - 1 <= 10; a++) {
    const b = a + pjg - 1;
    tambah(`${deretKata(a, b)}.`, `${deretKata(a, b)}!`, `${deretKata(b, a)}.`);
  }
}
[4, 5].forEach((n) => {
  for (let a = 1; a + n - 1 <= 10; a++) {
    for (let k = 1; k <= n - 2; k++) {
      tambah(`${besarAwal(rentang(a, a + n - 1).map((d, i) => (i === k ? 'berapa' : kata(d))).join(', '))}.`);
    }
  }
});

const daftar = [...semua].sort((a, b) => a.localeCompare(b, 'id'));
fs.writeFileSync(path.join(__dirname, 'kalimat.json'), JSON.stringify(daftar, null, 1), 'utf8');
console.log(`${daftar.length} kalimat ditulis ke tools/kalimat.json`);
