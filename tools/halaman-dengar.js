/* =========================================================
   Membuat halaman dengar untuk memeriksa suara dengan telinga:
   pilihan suara hewan baru, suara hewan asli, narasi cerita,
   kalimat rawan (huruf, kalimat sangat pendek, bunyi hewan),
   dan kalimat yang masih ditandai pemeriksa otomatis.

   Jalankan:  node tools/halaman-dengar.js [daftar.json]
              (dengan daftar.json: hanya kalimat di daftar itu)
   Buka:      http://localhost:5500/.claude/dengar/   (saat pratinjau lokal berjalan)
   ========================================================= */
const fs = require('fs');
const path = require('path');
const vm = require('vm');

const akar = path.join(__dirname, '..');
const konteks = { window: {} };
vm.createContext(konteks);
vm.runInContext(
  fs.readFileSync(path.join(akar, 'data.js'), 'utf8') + '\n;Object.assign(this, { ADEGAN, BUNYI_HEWAN });',
  konteks,
);
vm.runInContext(fs.readFileSync(path.join(akar, 'suara', 'daftar.js'), 'utf8'), konteks);
const { ADEGAN, BUNYI_HEWAN } = konteks;
const KLIP = konteks.window.KLIP_SUARA;
const periksa = JSON.parse(fs.readFileSync(path.join(__dirname, 'periksa-suara.json'), 'utf8'));

const BUANG_EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
const pecahKalimat = (teks) => {
  const bersih = teks.replace(BUANG_EMOJI, '').replace(/\s+/g, ' ').trim();
  return (bersih.match(/[^.!?]+[.!?]*/g) || [bersih]).map((k) => k.trim()).filter(Boolean);
};
const klip = (k) => {
  const c = KLIP[k];
  return c ? { k, f: `../../suara/${c[0]}`, a: c[2] ?? 0.2, b: c[1] } : null;
};

const hanya = process.argv[2] ? JSON.parse(fs.readFileSync(process.argv[2], 'utf8')) : null;
const pilihan = {};
const folderPilihan = path.join(akar, 'suara-hewan', '_pilihan');
if (fs.existsSync(folderPilihan)) {
  fs.readdirSync(folderPilihan).filter((f) => /-\d+\.mp3$/.test(f)).sort().forEach((f) => {
    const nama = f.replace(/-\d+\.mp3$/, '');
    (pilihan[nama] = pilihan[nama] || []).push(`../../suara-hewan/_pilihan/${f}`);
  });
}

const narasi = [...new Set(Object.values(ADEGAN).flatMap((a) => a.ucapan.flatMap((u) => pecahKalimat(u.t).map((k) => (u.s === 'kiku' ? k : `${u.s}|${k}`)))))];
const dipakai = new Set(narasi);
const ambil = (saring) => Object.entries(periksa)
  .filter(([k, v]) => !dipakai.has(k) && saring(k, v))
  .map(([k]) => { dipakai.add(k); return k; })
  .sort((a, b) => a.localeCompare(b, 'id'));

const ditandai = ambil((k, v) => v.alasan && v.alasan.length);
const huruf = ambil((k) => /huruf|^[A-Z][a-z]{0,2}[.!,]/.test(k));
const pendek = ambil((k) => k.length <= 14);
const bunyi = ambil((k) => /guk|meong|mooo|cit|cuit|kwek|mbe|Cuking/i.test(k));

const bagian = hanya ? [
  { id: 'baru', judul: '📖 Kalimat dongeng baru', ket: 'Perhatikan logatnya: harus terdengar Indonesia, bukan Malaysia.', isi: hanya.map((k) => { const c = klip(k); return c && { ...c, cat: (periksa[k]?.alasan || []).join(', ') }; }) },
].map((b) => ({ ...b, isi: b.isi.filter(Boolean) })) : [
  { id: 'ditandai', judul: '⚠️ Masih ditandai pemeriksa otomatis', ket: 'Sudah direkam ulang otomatis, tapi mesin masih ragu. Mohon didengar baik-baik.', isi: ditandai.map((k) => ({ ...klip(k), cat: periksa[k].alasan.join(', ') })) },
  { id: 'narasi', judul: '📖 Narasi cerita', ket: 'Kalimat narasi di layar cerita tiap pos.', isi: narasi.map(klip) },
  { id: 'huruf', judul: '🔤 Huruf', ket: 'Pastikan huruf diucapkan benar (a, be, ce, de, ... eks, ye, zet).', isi: huruf.map(klip) },
  { id: 'pendek', judul: '🔢 Kalimat sangat pendek', ket: 'Angka dan kata singkat. Pastikan jelas, tidak terpotong.', isi: pendek.map(klip) },
  { id: 'bunyi', judul: '🐱 Bunyi hewan dalam kalimat & nama Cuking', ket: '', isi: bunyi.map(klip) },
].map((b) => ({ ...b, isi: b.isi.filter(Boolean) }));
const asli = hanya ? [] : Object.entries(BUNYI_HEWAN).map(([nama, f]) => ({ k: nama, f: `../../${f}` }));

const data = { pilihan, asli, bagian };
const html = `<!doctype html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Periksa Suara Cuking</title>
<style>
  :root { --latar: #f4f1fb; --kartu: #fff; --teks: #3b2a5a; --aksen: #7048e8; --hijau: #2b8a3e; --merah: #e03131; }
  * { box-sizing: border-box; }
  body { margin: 0; font-family: system-ui, sans-serif; background: var(--latar); color: var(--teks); padding: 20px 16px 120px; }
  main { max-width: 860px; margin: 0 auto; }
  h1 { font-size: 24px; margin: 0 0 6px; }
  h2 { font-size: 19px; margin: 28px 0 4px; }
  .ket { margin: 0 0 12px; opacity: .75; font-size: 14px; }
  .item { display: flex; align-items: center; gap: 10px; background: var(--kartu); border-radius: 12px; padding: 8px 10px; margin-bottom: 6px; border: 2px solid transparent; }
  .item.main { border-color: var(--aksen); }
  .item.oke { background: #ebfbee; }
  .item.salah { background: #fff0f0; border-color: var(--merah); }
  .no { font-size: 12px; opacity: .55; min-width: 34px; }
  .teks { flex: 1; min-width: 0; }
  .teks small { display: block; color: var(--merah); font-size: 12px; }
  button { font: inherit; border: 0; border-radius: 10px; padding: 7px 11px; cursor: pointer; background: #ece6ff; color: var(--teks); }
  button.putar { background: var(--aksen); color: #fff; }
  .nilai button.aktif.ya { background: var(--hijau); color: #fff; }
  .nilai button.aktif.tidak { background: var(--merah); color: #fff; }
  .nilai { display: flex; gap: 4px; }
  .alat { display: flex; gap: 8px; flex-wrap: wrap; margin-bottom: 10px; }
  .hewan { background: var(--kartu); border-radius: 12px; padding: 10px; margin-bottom: 8px; }
  .hewan .versi { display: flex; gap: 8px; flex-wrap: wrap; margin-top: 6px; }
  .hewan label { display: flex; align-items: center; gap: 6px; background: #f3f0ff; border-radius: 10px; padding: 6px 10px; }
  .bawah { position: fixed; left: 0; right: 0; bottom: 0; background: var(--teks); color: #fff; padding: 12px 16px; display: flex; gap: 12px; align-items: center; justify-content: center; flex-wrap: wrap; }
  .bawah button { background: #ffd43b; font-weight: 700; }
  @media (max-width: 560px) { .item { flex-wrap: wrap; } .teks { flex-basis: calc(100% - 50px); } }
</style>
</head>
<body>
<main>
  <h1>🐱 Periksa Suara Cuking</h1>
  <p class="ket">Tekan ▶ untuk mendengar. Beri ✅ kalau sudah pas, ❌ kalau ada yang salah (salah ucap, terpotong, suara aneh).
  "Putar berurutan" memutar semua kalimat di bagian itu satu per satu; Anda cukup menekan ❌ saat mendengar yang salah.
  Setelah selesai, tekan <b>Salin hasil</b> di bawah lalu tempel di chat.</p>
  <div id="isi"></div>
</main>
<div class="bawah"><span id="ringkas"></span><button id="salin">📋 Salin hasil</button></div>
<script>
const DATA = ${JSON.stringify(data)};
const KUNCI = 'periksa-suara-cuking';
let nilai = {};
try { nilai = JSON.parse(localStorage.getItem(KUNCI)) || {}; } catch (e) {}
const simpan = () => { try { localStorage.setItem(KUNCI, JSON.stringify(nilai)); } catch (e) {} ringkas(); };
const esc = (s) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

let audio = null, berurut = null;
function putar(it, el, lalu) {
  if (audio) { audio.pause(); audio = null; }
  document.querySelectorAll('.item.main').forEach((x) => x.classList.remove('main'));
  if (el) { el.classList.add('main'); el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
  const a = new Audio(it.a != null ? it.f + '#t=' + it.a : it.f);
  audio = a;
  let selesai = false;
  const akhir = () => { if (selesai) return; selesai = true; if (audio === a) a.pause(); if (lalu) setTimeout(lalu, 450); };
  a.onended = akhir; a.onerror = akhir;
  if (it.b) a.onplaying = () => { if (a.duration && a.duration - it.b >= 0.1) setTimeout(akhir, Math.max(0, (it.b - a.currentTime) * 1000) + 150); };
  a.play().catch(akhir);
}

let html = Object.keys(DATA.pilihan).length ? '<h2>🐾 Pilih suara hewan baru</h2><p class="ket">Dengarkan ketiga versi, lalu pilih yang paling mirip suara aslinya.</p>' : '';
for (const [nama, daftar] of Object.entries(DATA.pilihan)) {
  html += '<div class="hewan"><b>' + nama + '</b><div class="versi">' + daftar.map((f, i) =>
    '<label><input type="radio" name="p-' + nama + '" value="' + (i + 1) + '"' + (nilai['p:' + nama] == i + 1 ? ' checked' : '') + '>' +
    '<button class="putar" data-f="' + f + '">▶ Versi ' + (i + 1) + '</button></label>').join('') + '</div></div>';
}
const baris = (id, it, no) => '<div class="item" data-id="' + id + '"><span class="no">' + no + '</span>' +
  '<button class="putar">▶</button><div class="teks">' + esc(it.k) + (it.cat ? '<small>' + esc(it.cat) + '</small>' : '') + '</div>' +
  '<div class="nilai"><button class="ya">✅</button><button class="tidak">❌</button></div></div>';
if (DATA.asli.length) html += '<h2>🐮 Suara hewan asli (' + DATA.asli.length + ')</h2><p class="ket">Rekaman hewan sungguhan yang sudah dipakai.</p>' +
  '<div class="alat"><button class="urut" data-b="asli">▶ Putar berurutan</button></div>' +
  DATA.asli.map((it, i) => baris('asli:' + it.k, it, i + 1)).join('');
let no = 0;
for (const b of DATA.bagian) {
  if (!b.isi.length) continue;
  html += '<h2>' + b.judul + ' (' + b.isi.length + ')</h2><p class="ket">' + b.ket + '</p>' +
    '<div class="alat"><button class="urut" data-b="' + b.id + '">▶ Putar berurutan</button></div>' +
    b.isi.map((it) => baris('k:' + it.k, it, ++no)).join('');
}
document.getElementById('isi').innerHTML = html;

const semua = {};
DATA.asli.forEach((it) => { semua['asli:' + it.k] = { ...it, bagian: 'asli' }; });
DATA.bagian.forEach((b) => b.isi.forEach((it) => { semua['k:' + it.k] = { ...it, bagian: b.id }; }));
const tandai = (el) => {
  const v = nilai[el.dataset.id];
  el.classList.toggle('oke', v === 'ya'); el.classList.toggle('salah', v === 'tidak');
  el.querySelector('.ya').classList.toggle('aktif', v === 'ya'); el.querySelector('.tidak').classList.toggle('aktif', v === 'tidak');
};
document.querySelectorAll('.item').forEach(tandai);

document.addEventListener('click', (e) => {
  const t = e.target;
  const item = t.closest('.item');
  if (t.matches('.hewan .putar')) { e.preventDefault(); putar({ f: t.dataset.f }); }
  else if (item && t.matches('.putar')) { berurut = null; putar(semua[item.dataset.id], item); }
  else if (item && t.matches('.ya, .tidak')) {
    const v = t.matches('.ya') ? 'ya' : 'tidak';
    nilai[item.dataset.id] = nilai[item.dataset.id] === v ? undefined : v;
    tandai(item); simpan();
  } else if (t.matches('.urut')) {
    const daftar = [...document.querySelectorAll('.item')].filter((el) => semua[el.dataset.id].bagian === t.dataset.b);
    const sesi = berurut = {};
    const jalan = (i) => { if (berurut !== sesi || i >= daftar.length) return; putar(semua[daftar[i].dataset.id], daftar[i], () => jalan(i + 1)); };
    jalan(0);
  }
});
document.addEventListener('change', (e) => {
  if (e.target.name && e.target.name.startsWith('p-')) { nilai['p:' + e.target.name.slice(2)] = e.target.value; simpan(); }
});

function ringkas() {
  const v = Object.entries(nilai).filter(([k]) => !k.startsWith('p:'));
  document.getElementById('ringkas').textContent =
    v.filter(([, x]) => x === 'ya').length + ' ✅  ·  ' + v.filter(([, x]) => x === 'tidak').length + ' ❌  ·  dari ' + Object.keys(semua).length;
}
ringkas();
document.getElementById('salin').addEventListener('click', async () => {
  const hewan = Object.keys(DATA.pilihan).map((n) => n + '=' + (nilai['p:' + n] || '?')).join(', ');
  const salah = Object.entries(nilai).filter(([k, x]) => x === 'tidak' && !k.startsWith('p:')).map(([k]) => '- ' + k.replace(/^k:/, '').replace(/^asli:/, 'suara hewan asli: '));
  const teks = 'HASIL PERIKSA SUARA\\nPilihan hewan: ' + hewan + '\\nPerlu diperbaiki (' + salah.length + '):\\n' + (salah.join('\\n') || '- tidak ada');
  try { await navigator.clipboard.writeText(teks); alert('Hasil disalin. Tempel di chat ya!'); }
  catch (e) { prompt('Salin teks ini lalu tempel di chat:', teks); }
});
</script>
</body>
</html>
`;
const keluar = path.join(akar, '.claude', 'dengar');
fs.mkdirSync(keluar, { recursive: true });
fs.writeFileSync(path.join(keluar, 'index.html'), html, 'utf8');
const total = asli.length + bagian.reduce((a, b) => a + b.isi.length, 0);
console.log(`Halaman dengar dibuat: ${total} item (${bagian.map((b) => `${b.id} ${b.isi.length}`).join(', ')}, hewan asli ${asli.length}), pilihan hewan baru: ${Object.keys(pilihan).length}`);
