/* =========================================================
   Menyusun daftar SEMUA kalimat yang bisa diucapkan para tokoh,
   untuk dibuatkan rekamannya oleh tools/buat_suara_elevenlabs.py.

   Jalankan:  node tools/daftar-kalimat.js
   Hasil:     tools/kalimat.json

   Kalimat Kiku ditulis apa adanya; kalimat tokoh lain diberi awalan
   "tokoh|" (mis. "lili|Halo, teman-teman!") karena suaranya berbeda.
   Pola kalimat di sini harus sama dengan yang ada di app.js.
   ========================================================= */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const akar = path.join(__dirname, '..');
const konteks = {};
vm.createContext(konteks);
vm.runInContext(
  fs.readFileSync(path.join(akar, 'data.js'), 'utf8') +
    '\n;Object.assign(this, { HEWAN, ADEGAN, GAME, BUNYI_KALIMAT });',
  konteks,
);
const { HEWAN, ADEGAN, GAME, BUNYI_KALIMAT } = konteks;

// Harus sama persis dengan pecahKalimat() di app.js
const BUANG_EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
const pecahKalimat = (teks) => {
  const bersih = teks.replace(BUANG_EMOJI, '').replace(/\s+/g, ' ').trim();
  return (bersih.match(/[^.!?]+[.!?]*/g) || [bersih]).map((k) => k.trim()).filter(Boolean);
};

const semua = new Set();
const tambah = (tokoh, ...teks) => teks.forEach((t) => pecahKalimat(t).forEach((k) => semua.add(tokoh === 'kiku' ? k : `${tokoh}|${k}`)));

// ---------- Umum ----------
tambah('kiku', 'Cuit, cuit, cuit! Halo teman! Aku Kiku. Ayo kita belajar sambil bermain!', 'Suara nyala!');

// ---------- Adegan cerita ----------
Object.values(ADEGAN).forEach((a) => a.ucapan.forEach((u) => tambah(u.s, u.t)));
// Sentuh hewan di adegan
HEWAN.forEach((h) => tambah('kiku', `Ini ${h.nama}, hewan ${h.kelompok}.`));

// ---------- Permainan ----------
Object.values(GAME).forEach((g) => {
  tambah(g.tokoh, ...g.pembuka, g.salah, g.selesai);
  HEWAN.forEach((h) => {
    if (g.tanya && (!g.hewan || g.hewan.includes(h.nama))) tambah(g.tokoh, g.tanya(h));
    if (!g.hewan || g.hewan.includes(h.nama)) tambah(g.tokoh, g.benar(h));
  });
});

// Tiruan bunyi yang sudah punya rekaman hewan asli tidak perlu direkam
Object.keys(BUNYI_KALIMAT).filter((k) => fs.existsSync(path.join(akar, BUNYI_KALIMAT[k]))).forEach((k) => semua.delete(k));

const daftar = [...semua].sort((a, b) => a.localeCompare(b, 'id'));
fs.writeFileSync(path.join(__dirname, 'kalimat.json'), JSON.stringify(daftar, null, 1), 'utf8');
const per = {};
daftar.forEach((k) => { const t = k.includes('|') ? k.split('|')[0] : 'kiku'; per[t] = (per[t] || 0) + 1; });
console.log(`${daftar.length} kalimat ditulis ke tools/kalimat.json`, per);
