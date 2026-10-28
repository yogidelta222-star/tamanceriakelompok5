/* =========================================================
   Taman Ceria — Logika permainan & suara
   ========================================================= */
(() => {
  'use strict';

  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];
  const layar = $('#layar');
  const maskot = $('#maskot');
  const gelembung = $('#gelembung');

  const acak = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const kocok = (arr) => {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };
  const kata = (n) => ANGKA_KATA[n] || String(n);
  const besarAwal = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const batas = (x, min, maks) => Math.min(maks, Math.max(min, x));

  const simpan = {
    ambil(k, d) { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } },
    taruh(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* abaikan */ } },
  };

  // Timer yang otomatis dibersihkan saat pindah layar
  let timers = [];
  const nanti = (fn, ms) => { const t = setTimeout(fn, ms); timers.push(t); return t; };
  const hapusTimer = () => { timers.forEach(clearTimeout); timers = []; };

  function tampilGelembung(teks) {
    gelembung.textContent = teks;
    gelembung.classList.remove('pop');
    void gelembung.offsetWidth;
    gelembung.classList.add('pop');
  }

  // ================= SUARA (Text-to-Speech) =================
  const apakahIndo = (v) => /^(id|in)[-_]/i.test(v.lang) || /indonesia/i.test(v.name);
  // Suara "Natural" (Edge) paling mirip manusia, lalu "Online", lalu Google
  const nilaiSuara = (v) => (/natural/i.test(v.name) ? 4 : 0) + (/online/i.test(v.name) ? 2 : 0) + (/google/i.test(v.name) ? 1 : 0);
  // Nama suara yang ramah, mis. "Microsoft Gadis Online (Natural) - Indonesian" → "Gadis · perempuan ⭐ paling alami"
  const namaSuara = (v) => {
    const dasar = v.name.replace(/^Microsoft\s+/i, '').replace(/\s*Online.*$/i, '').replace(/\s*-\s*Indonesian.*$/i, '').replace(/\s*\(.*\)\s*$/, '');
    const jenis = /gadis|damayanti|female|wanita/i.test(v.name) ? ' · perempuan' : /ardi|andika|male/i.test(v.name) ? ' · laki-laki' : '';
    return dasar + jenis + (nilaiSuara(v) >= 4 ? ' ⭐ paling alami' : '');
  };
  // Harus sama persis dengan pecahKalimat() di tools/daftar-kalimat.js
  const BUANG_EMOJI = /[\p{Extended_Pictographic}\u{FE0F}\u{200D}]/gu;
  const pecahKalimat = (teks) => {
    const bersih = teks.replace(BUANG_EMOJI, '').replace(/\s+/g, ' ').trim();
    return (bersih.match(/[^.!?]+[.!?]*/g) || [bersih]).map((k) => k.trim()).filter(Boolean);
  };
  // Rekaman bawaan dari suara/daftar.js (dibuat oleh tools/buat_suara.py)
  const KLIP_SUARA = window.KLIP_SUARA || {};
  const AWAL_KLIP = 0.2; // detik; ucapan di rekaman baru mulai sekitar 0,25 detik
  // Kalimat yang belum punya rekaman, untuk diperiksa saat pengembangan
  const kalimatTanpaRekaman = window.kalimatTanpaRekaman = new Set();

  const Suara = {
    aktif: simpan.ambil('tc_suara', true),
    atur: Object.assign({ voiceURI: null, rate: 0.95, pitch: 1.1 }, simpan.ambil('tc_atur_suara', {})),
    semua: [],
    voice: null,
    adaIndonesia: false,
    adaRekaman: Object.keys(KLIP_SUARA).length > 0,
    id: 0,
    terakhir: null,
    audio: null,
    u: null,

    init() {
      if (!('speechSynthesis' in window)) return;
      const muat = () => {
        this.semua = speechSynthesis.getVoices();
        const indo = this.semua.filter(apakahIndo).sort((a, b) => nilaiSuara(b) - nilaiSuara(a));
        this.adaIndonesia = indo.length > 0;
        // Hanya suara Bahasa Indonesia yang dipakai
        this.voice = indo.find((v) => v.voiceURI === this.atur.voiceURI) || indo[0] || null;
        isiPilihanSuara();
      };
      muat();
      speechSynthesis.onvoiceschanged = muat;
    },

    // Rekaman bawaan dipakai kecuali guru memilih suara browser tertentu
    pakaiRekaman() {
      return this.adaRekaman && (!this.atur.voiceURI || this.atur.voiceURI === 'rekaman');
    },

    // Diucapkan per kalimat: rekaman bawaan bila ada, kalau tidak suara browser Bahasa Indonesia.
    // Tanpa keduanya Cuking diam, daripada dibacakan dengan logat bahasa lain.
    // gaya: 'senang' (memuji), 'lembut' (saat salah), atau biasa — hanya berlaku untuk suara browser
    bicara(ucap, opsi = {}) {
      const { tulis = ucap, selesai, gaya } = opsi;
      const id = ++this.id;
      this.terakhir = { ucap, tulis };
      tampilGelembung(tulis);
      this.hentikan();
      maskot.classList.add('bicara');
      let beres = false;
      const akhiri = () => {
        if (beres || id !== this.id) return;
        beres = true;
        maskot.classList.remove('bicara');
        if (selesai) selesai();
      };

      const rekaman = this.pakaiRekaman();
      const bisaBicara = this.aktif && (rekaman || (this.voice && 'speechSynthesis' in window));
      if (!bisaBicara) {
        setTimeout(akhiri, 900 + ucap.length * 35);
        return;
      }

      const kalimat = pecahKalimat(ucap);
      const f = { senang: { r: 1.05, p: 1.12 }, lembut: { r: 0.93, p: 0.96 } }[gaya] || { r: 1, p: 1 };
      const cepat = batas(this.atur.rate / 0.95, 0.5, 2);
      let jaga;
      const putar = (i) => {
        clearTimeout(jaga);
        if (id !== this.id) return;
        if (i >= kalimat.length) return akhiri();
        const k = kalimat[i];
        let lewat = false;
        let potong;
        // Jeda antar-kalimat seperti orang berbicara: lebih panjang setelah titik, tanda tanya, dan seru
        const jeda = /[.!?]$/.test(k) ? 260 : 120;
        const lanjutkan = () => {
          if (lewat) return;
          lewat = true;
          clearTimeout(jaga);
          clearTimeout(potong);
          setTimeout(() => putar(i + 1), jeda);
        };
        // Penjaga bila audio / suara macet: lanjut ke kalimat berikutnya
        jaga = setTimeout(lanjutkan, (2000 + k.length * 120) / cepat);
        const klip = rekaman && KLIP_SUARA[k];
        if (klip) {
          const [berkas, selesaiDetik] = Array.isArray(klip) ? klip : [klip, null];
          // Rekaman diawali hening ±0,25 detik dan diakhiri hening ±0,9 detik; keduanya dilewati
          const a = new Audio(`suara/${berkas}#t=${AWAL_KLIP}`);
          a.playbackRate = cepat;
          a.onended = lanjutkan;
          if (selesaiDetik) {
            a.onplaying = () => {
              clearTimeout(potong);
              potong = setTimeout(() => { a.pause(); lanjutkan(); }, Math.max(0, (selesaiDetik - a.currentTime) * 1000) / cepat);
            };
          }
          a.onerror = () => this.ucapkanBrowser(k, f, id, lanjutkan);
          this.audio = a;
          a.play().catch(() => this.ucapkanBrowser(k, f, id, lanjutkan));
        } else {
          if (rekaman) kalimatTanpaRekaman.add(k);
          this.ucapkanBrowser(k, f, id, lanjutkan);
        }
      };
      putar(0);
    },

    ucapkanBrowser(k, f, id, lanjut) {
      if (id !== this.id) return;
      if (!this.voice || !('speechSynthesis' in window)) return lanjut();
      const u = new SpeechSynthesisUtterance(k);
      u.lang = 'id-ID';
      u.voice = this.voice;
      const seru = /!$/.test(k) ? 1.06 : /\?$/.test(k) ? 1.03 : 1;
      u.rate = batas(this.atur.rate * f.r, 0.5, 1.6);
      u.pitch = batas(this.atur.pitch * f.p * seru, 0.5, 2);
      u.onend = lanjut;
      u.onerror = lanjut;
      this.u = u; // simpan referensi agar tidak dibuang browser
      setTimeout(() => { if (id === this.id) speechSynthesis.speak(u); }, 40);
    },

    hentikan() {
      if (this.audio) { this.audio.pause(); this.audio = null; }
      if ('speechSynthesis' in window) speechSynthesis.cancel();
    },

    diam() {
      this.id++;
      maskot.classList.remove('bicara');
      this.hentikan();
    },
  };

  // ================= EFEK BUNYI (Web Audio) =================
  const Sfx = {
    ctx: null,
    siap() {
      if (!this.ctx) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return null;
        this.ctx = new AC();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      return this.ctx;
    },
    nada(f, t0, dur, tipe = 'sine', vol = 0.18, fAkhir) {
      if (!Suara.aktif) return;
      const c = this.siap();
      if (!c) return;
      const o = c.createOscillator();
      const g = c.createGain();
      const t = c.currentTime + t0;
      o.type = tipe;
      o.frequency.setValueAtTime(f, t);
      if (fAkhir) o.frequency.exponentialRampToValueAtTime(fAkhir, t + dur);
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(vol, t + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
      o.connect(g).connect(c.destination);
      o.start(t);
      o.stop(t + dur + 0.05);
    },
    pop() { this.nada(400, 0, 0.12, 'sine', 0.22, 900); },
    pilih() { this.nada(660, 0, 0.08, 'sine', 0.12); },
    benar() { [523, 659, 784, 1047].forEach((f, i) => this.nada(f, i * 0.08, 0.25, 'triangle', 0.2)); },
    salah() { this.nada(320, 0, 0.35, 'sine', 0.22, 150); },
    tut() { this.nada(587, 0, 0.3, 'square', 0.05); this.nada(494, 0.38, 0.55, 'square', 0.05); },
    roket() { this.nada(120, 0, 1.6, 'sawtooth', 0.05, 900); },
    menang() { [523, 523, 659, 784, 659, 784, 1047].forEach((f, i) => this.nada(f, i * 0.13, 0.3, 'triangle', 0.2)); },
  };

  // ================= BINTANG & EFEK =================
  let totalBintang = simpan.ambil('tc_bintang', 0);
  function perbaruiSkor(animasi) {
    $('#totalBintang').textContent = totalBintang;
    if (animasi) {
      const s = $('.skor');
      s.classList.remove('bump');
      void s.offsetWidth;
      s.classList.add('bump');
    }
  }
  function tambahBintang() {
    totalBintang++;
    simpan.taruh('tc_bintang', totalBintang);
    setTimeout(() => perbaruiSkor(true), 800);
  }

  function terbangkanBintang(dariEl) {
    const r = dariEl.getBoundingClientRect();
    const tujuan = $('.skor').getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const b = document.createElement('div');
    b.className = 'bintang-terbang';
    b.textContent = '⭐';
    b.style.left = x + 'px';
    b.style.top = y + 'px';
    document.body.appendChild(b);
    b.getBoundingClientRect();
    b.style.transform = `translate(${tujuan.left + tujuan.width / 2 - x}px, ${tujuan.top + tujuan.height / 2 - y}px) scale(.5)`;
    b.style.opacity = '0.3';
    setTimeout(() => b.remove(), 900);
  }

  function konfeti() {
    const wadah = $('#konfeti');
    const warna = ['#ff6b6b', '#ffd43b', '#69db7c', '#4dabf7', '#da77f2', '#ffa94d'];
    for (let i = 0; i < 90; i++) {
      const k = document.createElement('i');
      k.className = 'kf';
      k.style.left = Math.random() * 100 + 'vw';
      k.style.background = acak(warna);
      k.style.animationDuration = 2.2 + Math.random() * 2 + 's';
      k.style.animationDelay = Math.random() * 0.8 + 's';
      k.style.setProperty('--r', Math.random() * 720 - 360 + 'deg');
      wadah.appendChild(k);
      setTimeout(() => k.remove(), 5200);
    }
  }

  function goyang(el) {
    el.classList.remove('goyang');
    void el.offsetWidth;
    el.classList.add('goyang');
  }

  function pesan(teks) {
    const p = document.createElement('div');
    p.className = 'pesan';
    p.textContent = teks;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), 7000);
  }

  // ---------- Potongan HTML ----------
  const emojiHTML = (e) => `<span class="emoji">${e}</span>`;
  const catHTML = (hex) => `<span class="cat" style="--c:${hex}"></span>`;
  const bentukHTML = (b, c) => `<svg class="bentuk" viewBox="0 0 100 100" style="--c:${c}" aria-hidden="true">${b.svg}</svg>`;
  const gambarTanya = (e) => `<div class="gambar-tanya">${e}</div>`;
  const bendaHTML = (b, n) => Array.from({ length: n }, () => `<button class="benda" aria-label="${b.nama}">${b.emoji}</button>`).join('');
  const angkaHTML = (n) => {
    const c = WARNA_ANGKA[(n - 1) % 10];
    return `<span class="num" style="--c:${c}">${n}</span><span class="titik" style="--c:${c}">${'<i></i>'.repeat(n)}</span>`;
  };

  // ================= NAVIGASI LAYAR =================
  let main = null; // status permainan yang sedang berjalan
  const sibuk = () => main && main.kunci;

  function tampil(html, rumah = true) {
    hapusTimer();
    layar.innerHTML = html;
    layar.classList.remove('masuk');
    void layar.offsetWidth;
    layar.classList.add('masuk');
    $('#btnRumah').hidden = !rumah;
    $('#btnAtur').hidden = rumah;
    window.scrollTo(0, 0);
  }

  function layarMulai() {
    tampil(`
      <section class="mulai">
        <h1>Taman Ceria</h1>
        <p class="sub">Belajar sambil bermain!</p>
        <div class="parade">${['🐶', '🍎', '🚂', '🎨', '🔺', '🍌'].map((e, i) => `<span style="--i:${i}">${e}</span>`).join('')}</div>
        <button class="btn-besar btn-main" id="btnMulai">▶ Ayo Main!</button>
      </section>`, false);
    tampilGelembung('Meong! Aku Cuking 🐱 Tekan tombol hijau ya!');
    $('#btnMulai').addEventListener('click', () => {
      Sfx.siap();
      Sfx.benar();
      layarMenu({
        ucap: 'Meong! Halo teman! Aku Cuking, si kucing. Ayo kita belajar sambil bermain! Pilih gambarnya ya!',
        tulis: 'Meong! Halo teman, aku Cuking 🐱 Ayo pilih permainan!',
      });
      setTimeout(() => {
        if (!('speechSynthesis' in window)) pesan('🔇 Browser ini belum mendukung suara. Coba pakai Google Chrome atau Microsoft Edge.');
        else if (!Suara.adaRekaman && !Suara.adaIndonesia) pesan('🔇 Suara Bahasa Indonesia belum tersedia di browser ini. Buka website dengan Google Chrome atau Microsoft Edge (tersambung internet) agar Cuking bisa bicara.');
      }, 1800);
    });
  }

  function layarMenu(sapaan) {
    main = null;
    tampil(`
      <section class="menu">
        <h2 class="judul">Mau main apa hari ini?</h2>
        <div class="grid-menu">
          ${MENU.map((m, i) => `
            <button class="tile" data-id="${m.id}" style="--c:${m.warna};--d:${i * 0.1}s">
              <span class="ikon">${m.ikon}</span><span class="nama">${m.nama}</span>
            </button>`).join('')}
        </div>
      </section>`, false);
    $$('.tile', layar).forEach((b) => b.addEventListener('click', () => {
      Sfx.pop();
      if (b.dataset.id === 'belajar') layarBelajar('hewan', true);
      else mulaiGame(b.dataset.id);
    }));
    if (sapaan) Suara.bicara(sapaan.ucap, { tulis: sapaan.tulis, gaya: 'senang' });
    else Suara.bicara('Mau main apa hari ini? Pilih gambarnya ya!', { tulis: 'Mau main apa? Pilih gambarnya ya! 👇' });
  }

  // ================= PERMAINAN =================
  const INTRO = {
    hewan: 'Ayo tebak hewan!',
    buah: 'Ayo tebak buah!',
    warna: 'Ayo tebak warna!',
    bentuk: 'Ayo tebak bentuk!',
    huruf: 'Ayo tebak huruf!',
    hitung: 'Ayo berhitung bersama!',
    urut: 'Tut tuut! Ayo bantu kereta.',
  };

  function mulaiGame(jenis) {
    main = { jenis, no: 0, total: 5, dipakai: new Set(), kunci: false, salah: 0, tipeLalu: null };
    soalBerikut();
  }

  function soalBerikut() {
    if (main.no >= main.total) return layarHasil();
    main.kunci = false;
    main.salah = 0;
    if (main.jenis === 'urut') soalUrut();
    else soalPilih();
  }

  // Riwayat lintas ronde: yang belum pernah / paling lama tidak muncul didahulukan
  const riwayat = simpan.ambil('tc_riwayat', {}) || {};
  function ambilBaru(list, opsi = {}) {
    const { kunci = (x) => x.nama, saring = () => true, ruang = main.jenis } = opsi;
    const calon = list.filter(saring);
    const lalu = riwayat[ruang] || [];
    const segar = calon.filter((x) => !main.dipakai.has(ruang + ':' + kunci(x)));
    const urutan = (segar.length ? segar : calon)
      .map((x) => ({ x, umur: lalu.indexOf(kunci(x)) }))
      .sort((a, b) => a.umur - b.umur);
    const belumPernah = urutan.filter((o) => o.umur === -1);
    const t = (belumPernah.length ? acak(belumPernah) : acak(urutan.slice(0, Math.ceil(urutan.length * 0.4)))).x;
    const k = kunci(t);
    main.dipakai.add(ruang + ':' + k);
    riwayat[ruang] = [...lalu.filter((x) => x !== k), k].slice(-list.length);
    simpan.taruh('tc_riwayat', riwayat);
    return t;
  }
  const buatOpsi = (list, target, jml, saring = () => true) =>
    kocok([target, ...kocok(list.filter((x) => x !== target && saring(x))).slice(0, jml - 1)]);

  // Jenis soal diacak, tapi tidak sama dengan soal sebelumnya
  function pilihTipe(daftar) {
    const sisa = daftar.filter((t) => t !== main.tipeLalu);
    const t = acak(sisa.length ? sisa : daftar);
    main.tipeLalu = t;
    return t;
  }

  const opsiAngka = (n, jml = 3) => {
    const s = new Set([n]);
    while (s.size < jml) {
      const c = n + acak([-2, -1, 1, 2, 3]);
      if (c >= 1 && c <= 10) s.add(c);
    }
    return kocok([...s]);
  };
  const kartuAngka = (x, n) => ({
    benar: x === n, html: `<span class="num" style="--c:${WARNA_ANGKA[x - 1]}">${x}</span>`, label: kata(x), salah: `Itu angka ${kata(x)}.`,
  });

  const progresHTML = () => `<div class="progres">${Array.from({ length: main.total }, (_, i) => `<span class="${i < main.no ? 'isi' : ''}">★</span>`).join('')}</div>`;
  const perbaruiProgres = () => $$('.progres span', layar).forEach((s, i) => s.classList.toggle('isi', i < main.no));

  // Pembuat soal pilihan ganda: mengembalikan { ucap, tulis, pilihan[], benar, atas? }
  const PEMBUAT = {
    hewan(no) {
      const jml = no < 2 ? 3 : 4;
      const tipe = pilihTipe(no < 2 ? ['nama', 'suara'] : ['nama', 'suara', 'ciri', 'tempat', 'ukuran', 'bukan']);
      const opsi = (t, saring) => buatOpsi(HEWAN, t, jml, saring).map((h) => ({
        benar: h === t, html: emojiHTML(h.emoji), label: h.nama, salah: `Itu ${h.nama}.`,
      }));

      if (tipe === 'suara') {
        const t = ambilBaru(HEWAN, { saring: (h) => h.suara });
        return { ucap: `Hewan apa yang bunyinya, ${t.suara}?`, tulis: `Siapa yang bunyinya "${t.suara}"? 🔊`, pilihan: opsi(t), benar: `Ini ${t.nama}. Bunyinya, ${t.suara}!` };
      }
      if (tipe === 'ciri') {
        const t = ambilBaru(HEWAN);
        return { ucap: `Hewan apa yang ${t.ciri}?`, tulis: `Siapa yang ${t.ciri}? 🤔`, pilihan: opsi(t), benar: `Ini ${t.nama}. ${besarAwal(t.nama)} ${t.ciri}.` };
      }
      if (tipe === 'tempat') {
        const t = ambilBaru(HEWAN, { saring: (h) => h.tempat });
        const saring = t.tempat === 'darat' ? (h) => h.tempat === 'air' : (h) => h.tempat && h.tempat !== t.tempat;
        const T = TEMPAT[t.tempat];
        return { ucap: `Mana hewan yang ${T.tanya}?`, tulis: `Mana hewan yang ${T.tanya}? ${T.ikon}`, pilihan: opsi(t, saring), benar: `Ini ${t.nama}. ${besarAwal(t.nama)} ${T.tanya}.` };
      }
      if (tipe === 'ukuran') {
        const besar = Math.random() < 0.5;
        const t = ambilBaru(HEWAN, { saring: (h) => (besar ? h.ukuran >= 4 : h.ukuran === 1) });
        const sifat = besar ? 'paling besar' : 'paling kecil';
        return {
          ucap: `Mana hewan yang ${sifat}?`, tulis: `Mana hewan yang ${sifat}? ${besar ? '🐘' : '🐜'}`,
          pilihan: opsi(t, (h) => (besar ? h.ukuran <= t.ukuran - 2 : h.ukuran >= 3)),
          benar: `${besarAwal(t.nama)} yang ${sifat}.`,
        };
      }
      if (tipe === 'bukan') {
        const t = ambilBaru([...BUAH, ...BENDA_LAIN], { ruang: 'bukan-hewan' });
        return {
          ucap: 'Mana yang bukan hewan?', tulis: 'Mana yang BUKAN hewan? 🤔',
          pilihan: kocok([t, ...kocok(HEWAN).slice(0, jml - 1)]).map((x) => ({
            benar: x === t, html: emojiHTML(x.emoji), label: x.nama, salah: `Itu ${x.nama}. ${besarAwal(x.nama)} itu hewan.`,
          })),
          benar: `Ini ${t.nama}. ${besarAwal(t.nama)} bukan hewan.`,
        };
      }
      const t = ambilBaru(HEWAN);
      return {
        ucap: `Mana ${t.nama}?`, tulis: `Mana ${t.nama}? 🔍`, pilihan: opsi(t),
        benar: t.suara ? `Ini ${t.nama}. Bunyinya, ${t.suara}!` : `Ini ${t.nama}. ${besarAwal(t.nama)} ${t.ciri}.`,
      };
    },

    buah(no) {
      const jml = no < 2 ? 3 : 4;
      const tipe = pilihTipe(no < 2 ? ['nama'] : ['nama', 'ciri', 'warna', 'bukan']);
      const opsi = (t, saring) => buatOpsi(BUAH, t, jml, saring).map((b) => ({
        benar: b === t, html: emojiHTML(b.emoji), label: b.nama, salah: `Itu buah ${b.nama}.`,
      }));

      if (tipe === 'ciri') {
        const t = ambilBaru(BUAH);
        return { ucap: `Buah apa yang ${t.ciri}?`, tulis: `Buah apa yang ${t.ciri}? 🤔`, pilihan: opsi(t), benar: `Ini buah ${t.nama}. Rasanya ${t.rasa}!` };
      }
      if (tipe === 'warna') {
        const t = ambilBaru(BUAH, { saring: (b) => b.warnaDasar });
        return {
          ucap: `Buah apa yang warnanya ${t.warnaDasar}?`, tulis: `Buah apa yang warnanya ${t.warnaDasar}? 🎨`,
          pilihan: opsi(t, (b) => b.warnaDasar && b.warnaDasar !== t.warnaDasar),
          benar: `Ini buah ${t.nama}. Warnanya ${t.warna}!`,
        };
      }
      if (tipe === 'bukan') {
        const t = ambilBaru([...HEWAN, ...BENDA_LAIN], { ruang: 'bukan-buah' });
        return {
          ucap: 'Mana yang bukan buah?', tulis: 'Mana yang BUKAN buah? 🤔',
          pilihan: kocok([t, ...kocok(BUAH).slice(0, jml - 1)]).map((x) => ({
            benar: x === t, html: emojiHTML(x.emoji), label: x.nama, salah: `Itu ${x.nama}. ${besarAwal(x.nama)} itu buah.`,
          })),
          benar: `Ini ${t.nama}. ${besarAwal(t.nama)} bukan buah.`,
        };
      }
      const t = ambilBaru(BUAH);
      return { ucap: `Mana buah ${t.nama}?`, tulis: `Mana buah ${t.nama}? 🔍`, pilihan: opsi(t), benar: `Ini buah ${t.nama}. Warnanya ${t.warna}, rasanya ${t.rasa}!` };
    },

    warna(no) {
      const jml = no < 2 ? 3 : 4;
      const tipe = pilihTipe(no < 1 ? ['nama'] : ['nama', 'benda']);
      const t = ambilBaru(WARNA);
      const b = acak(t.benda);
      const tanpaMirip = (w) => !t.mirip.includes(w.nama);
      const opsi = (saring) => buatOpsi(WARNA, t, jml, saring).map((w) => ({
        benar: w === t, html: catHTML(w.hex), label: w.nama, salah: `Itu warna ${w.nama}.`,
      }));
      if (tipe === 'benda') {
        return { ucap: `Apa warna ${b.n}?`, tulis: `Apa warna ${b.n}? 🎨`, atas: gambarTanya(b.e), pilihan: opsi(tanpaMirip), benar: `${besarAwal(b.n)} warnanya ${t.nama}.` };
      }
      return { ucap: `Mana warna ${t.nama}?`, tulis: `Mana warna ${t.nama}? 🎨`, pilihan: opsi(no < 2 ? tanpaMirip : undefined), benar: `Ini warna ${t.nama}, seperti ${b.n}.` };
    },

    bentuk(no) {
      const jml = no < 2 ? 3 : 4;
      const tipe = pilihTipe(no < 1 ? ['nama'] : ['nama', 'benda']);
      const t = ambilBaru(BENTUK);
      const c = acak(t.contoh);
      const warna = kocok(WARNA_ANGKA);
      const saring = tipe === 'benda' || no < 2 ? (b) => !t.mirip.includes(b.nama) : undefined;
      const pilihan = buatOpsi(BENTUK, t, jml, saring).map((b, i) => ({
        benar: b === t, html: bentukHTML(b, warna[i]), label: b.nama, salah: `Itu ${b.nama}.`,
      }));
      if (tipe === 'benda') {
        return { ucap: `${besarAwal(c.n)}, bentuknya seperti apa?`, tulis: `${besarAwal(c.n)} bentuknya seperti apa? 🤔`, atas: gambarTanya(c.e), pilihan, benar: `${besarAwal(c.n)} bentuknya ${t.nama}.` };
      }
      return { ucap: `Mana bentuk ${t.nama}?`, tulis: `Mana bentuk ${t.nama}? 🔍`, pilihan, benar: `Ini ${t.nama}, seperti ${c.n}.` };
    },

    huruf(no) {
      const jml = no < 2 ? 3 : 4;
      const tipe = pilihTipe(no < 1 ? ['nama'] : ['nama', 'awal']);
      const t = ambilBaru(HURUF, { kunci: (h) => h.h });
      const warna = kocok(WARNA_ANGKA);
      const pilihan = buatOpsi(HURUF, t, jml).map((h, i) => ({
        benar: h === t, html: `<span class="huruf" style="--c:${warna[i]}">${h.h}</span>`, label: h.kata, salah: `Itu huruf ${h.eja}.`,
      }));
      if (tipe === 'awal') {
        return { ucap: `${t.kata}. Huruf depannya apa?`, tulis: 'Huruf depannya apa? 🤔', atas: gambarTanya(t.emoji), pilihan, benar: `${t.kata}, dimulai dengan huruf ${t.eja}.` };
      }
      return { ucap: `Mana huruf ${t.eja}?`, tulis: `Mana huruf ${t.h}? 🔍`, pilihan, benar: `Ini huruf ${t.eja}. ${besarAwal(t.eja)}, ${t.kata}!` };
    },

    hitung(no) {
      const tipe = pilihTipe(no < 2 ? ['hitung'] : ['hitung', 'banyak', 'tambah']);
      const b = ambilBaru(BENDA, { ruang: 'benda' });

      if (tipe === 'banyak') {
        const sedikit = Math.random() < 0.4;
        const a = 1 + Math.floor(Math.random() * 6);
        let c;
        do { c = 1 + Math.floor(Math.random() * 7); } while (Math.abs(a - c) < 2);
        const t = sedikit ? Math.min(a, c) : Math.max(a, c);
        const sifat = sedikit ? 'sedikit' : 'banyak';
        return {
          ucap: `Mana yang lebih ${sifat}?`, tulis: `Mana yang lebih ${sifat.toUpperCase()}? ${b.emoji}`,
          pilihan: [a, c].map((x) => ({
            benar: x === t, html: `<span class="kelompok">${`<i>${b.emoji}</i>`.repeat(x)}</span>`, label: `${x} ${b.nama}`, salah: `Yang itu ada ${kata(x)} ${b.nama}.`,
          })),
          benar: `Yang ini ada ${kata(t)}, lebih ${sifat} dari ${kata(t === a ? c : a)}.`,
        };
      }
      if (tipe === 'tambah') {
        const a = 1 + Math.floor(Math.random() * 3);
        const c = 1 + Math.floor(Math.random() * 3);
        const n = a + c;
        return {
          ucap: `Ada ${kata(a)} ${b.nama}. Datang lagi ${kata(c)}. Jadi, ada berapa ${b.nama}?`,
          tulis: `${a} ${b.nama} ditambah ${c}, jadi berapa? ➕`,
          atas: `<p class="petunjuk-kecil">👆 Sentuh bendanya untuk menghitung</p>
                 <div class="benda-area">${bendaHTML(b, a)}<span class="tanda-tambah">+</span>${bendaHTML(b, c)}</div>`,
          pilihan: opsiAngka(n).map((x) => kartuAngka(x, n)),
          benar: `${besarAwal(kata(a))} tambah ${kata(c)}, sama dengan ${kata(n)}!`,
        };
      }
      const maks = [3, 4, 5, 7, 10][no] || 10;
      const min = no < 2 ? 1 : 2;
      const n = min + Math.floor(Math.random() * (maks - min + 1));
      return {
        ucap: `Ada berapa ${b.nama}? Ayo kita hitung!`,
        tulis: `Ada berapa ${b.nama}? ${b.emoji}`,
        atas: `<p class="petunjuk-kecil">👆 Sentuh bendanya satu per satu untuk menghitung</p>
               <div class="benda-area">${bendaHTML(b, n)}</div>`,
        pilihan: opsiAngka(n).map((x) => kartuAngka(x, n)),
        benar: `Ada ${kata(n)} ${b.nama}. ${besarAwal(Array.from({ length: n }, (_, i) => kata(i + 1)).join(', '))}!`,
      };
    },
  };

  // Benda di soal berhitung bisa disentuh satu per satu sambil dihitung
  function pasangHitung(root) {
    let hit = 0;
    $$('.benda', root).forEach((el) => el.addEventListener('click', () => {
      if (sibuk() || el.classList.contains('dihitung')) return;
      hit++;
      el.classList.add('dihitung');
      el.insertAdjacentHTML('beforeend', `<span class="tanda">${hit}</span>`);
      Sfx.pop();
      Suara.bicara(besarAwal(kata(hit)) + '!', { tulis: `${hit} — ${kata(hit)}` });
    }));
  }

  function soalPilih() {
    const s = PEMBUAT[main.jenis](main.no);
    tampil(`
      <section class="game game-${main.jenis}">
        ${progresHTML()}
        <div class="papan-tanya">
          ${s.atas || ''}
          <button class="btn-ulang" id="btnUlang">🔊 Dengar lagi</button>
        </div>
        <div class="pilihan n${s.pilihan.length}">
          ${s.pilihan.map((p, i) => `<button class="kartu" data-i="${i}" aria-label="Pilihan ${i + 1}">${p.html}<span class="label">${p.label}</span></button>`).join('')}
        </div>
      </section>`);

    const tanya = () => Suara.bicara(s.ucap, { tulis: s.tulis });
    $('#btnUlang').addEventListener('click', () => { if (sibuk()) return; Sfx.pilih(); tanya(); });
    pasangHitung(layar);

    const kartu = $$('.kartu', layar);
    kartu.forEach((btn) => btn.addEventListener('click', () => {
      if (sibuk()) return;
      const p = s.pilihan[+btn.dataset.i];
      if (p.benar) {
        main.kunci = true;
        hapusTimer();
        kartu.forEach((k) => { k.classList.add('terbuka'); k.classList.remove('petunjuk'); if (k !== btn) k.classList.add('redup'); });
        btn.classList.add('benar');
        Sfx.benar();
        terbangkanBintang(btn);
        tambahBintang();
        main.no++;
        perbaruiProgres();
        lanjut(`${acak(PUJIAN)} ${s.benar}`);
      } else {
        main.salah++;
        Sfx.salah();
        btn.classList.add('terbuka', 'coba');
        btn.disabled = true;
        goyang(btn);
        if (main.salah >= 2) kartu[s.pilihan.findIndex((x) => x.benar)].classList.add('petunjuk');
        const semangat = acak(SEMANGAT);
        Suara.bicara(`${p.salah} ${semangat} ${s.ucap}`, { tulis: `${p.salah} ${semangat} 💪`, gaya: 'lembut' });
        hapusTimer();
        pengingat(tanya);
      }
    }));

    Suara.bicara((main.no === 0 ? INTRO[main.jenis] + ' ' : '') + s.ucap, { tulis: s.tulis });
    pengingat(tanya);
  }

  // Ulangi pertanyaan bila anak diam cukup lama
  function pengingat(tanya) {
    nanti(() => { if (main && !main.kunci) tanya(); }, 18000);
  }

  function lanjut(ucap, tulis) {
    Suara.bicara(ucap, { tulis, gaya: 'senang', selesai: () => nanti(soalBerikut, 600) });
  }

  // ---------- Urutkan angka: kereta (naik), roket (hitung mundur), angka hilang ----------
  function soalUrut() {
    const tipe = main.no < 2 ? 'kecil' : pilihTipe(['kecil', 'besar', 'hilang']);
    const n = tipe === 'hilang' ? (main.no < 3 ? 4 : 5) : [3, 4, 5, 5, 6][main.no] || 5;
    const awal = main.no < 2 ? 1 : 1 + Math.floor(Math.random() * (10 - n + 1));
    const deret = Array.from({ length: n }, (_, i) => awal + i);
    if (tipe === 'besar') deret.reverse();
    const roket = tipe === 'besar';
    const kosong = tipe === 'hilang' ? 1 + Math.floor(Math.random() * (n - 2)) : -1;
    const terisi = (i) => tipe === 'hilang' && i !== kosong;

    let kartuN;
    if (tipe === 'hilang') kartuN = opsiAngka(deret[kosong]);
    else do { kartuN = kocok(deret); } while (kartuN.every((v, i) => v === deret[i]));
    let idx = 0;

    tampil(`
      <section class="game game-urut">
        ${progresHTML()}
        <div class="papan-tanya"><button class="btn-ulang" id="btnUlang">🔊 Dengar lagi</button></div>
        <div class="rel ${roket ? 'rel-roket' : ''}">
          <div class="kereta ${roket ? 'roket' : ''}" id="kereta">
            ${deret.map((d, i) => `<div class="gerbong ${terisi(i) ? 'isi' : ''}" style="--c:${WARNA_ANGKA[(d - 1) % 10]}"><span>${terisi(i) ? d : '?'}</span></div>`).join('')}
            <span class="lokomotif">${roket ? '🚀' : '🚂'}</span>
          </div>
        </div>
        <div class="pilihan angka-acak" style="--n:${kartuN.length}">
          ${kartuN.map((d) => `<button class="kartu angka" data-n="${d}" aria-label="Angka ${d}">${angkaHTML(d)}</button>`).join('')}
        </div>
      </section>`);

    const gerbong = $$('.gerbong', layar);
    const kartu = $$('.kartu', layar);
    const urutan = deret.map(kata).join(', ');
    const [ucapAwal, tulisAwal] = {
      kecil: [`Susun angkanya dari yang paling kecil. Mulai dari angka ${kata(deret[0])}!`, `Susun dari yang paling kecil! Mulai dari ${deret[0]} 🚂`],
      besar: [`Hitung mundur! Susun dari yang paling besar. Mulai dari angka ${kata(deret[0])}!`, `Hitung mundur! Mulai dari ${deret[0]} 🚀`],
      hilang: [`${besarAwal(deret.map((d, i) => (i === kosong ? 'berapa' : kata(d))).join(', '))}. Angka berapa yang hilang?`,
        `${deret.map((d, i) => (i === kosong ? '?' : d)).join(' - ')}  Angka berapa yang hilang? 🔍`],
    }[tipe];
    const tanya = () => (idx === 0 || tipe === 'hilang'
      ? Suara.bicara(ucapAwal, { tulis: tulisAwal })
      : Suara.bicara(`Sekarang cari angka ${kata(deret[idx])}!`, { tulis: `Sekarang cari angka ${deret[idx]} 🔍` }));

    $('#btnUlang').addEventListener('click', () => { if (sibuk()) return; Sfx.pilih(); tanya(); });

    kartu.forEach((btn) => btn.addEventListener('click', () => {
      if (sibuk()) return;
      const d = +btn.dataset.n;
      const slot = tipe === 'hilang' ? kosong : idx;
      const harap = deret[slot];
      if (d === harap) {
        Sfx.pop();
        btn.classList.add('terpakai');
        btn.disabled = true;
        gerbong[slot].classList.add('isi');
        gerbong[slot].querySelector('span').textContent = d;
        kartu.forEach((k) => k.classList.remove('petunjuk'));
        main.salah = 0;
        idx++;
        hapusTimer();
        if (tipe === 'hilang' || idx === deret.length) {
          kartu.forEach((k) => k.classList.add('redup'));
          selesai();
        } else {
          Suara.bicara(besarAwal(kata(d)) + '!', { tulis: `${d} — ${kata(d)} ✔️` });
          pengingat(tanya);
        }
      } else {
        main.salah++;
        Sfx.salah();
        goyang(btn);
        if (tipe === 'hilang') {
          btn.disabled = true;
          btn.classList.add('coba');
          Suara.bicara(`Itu angka ${kata(d)}. ${acak(SEMANGAT)}`, { tulis: `Itu angka ${d}. Coba lagi ya! 💪`, gaya: 'lembut' });
        } else {
          Suara.bicara(`Itu angka ${kata(d)}. Cari angka ${kata(harap)} dulu ya!`, { tulis: `Itu angka ${d}. Cari angka ${harap} dulu ya! 🔍`, gaya: 'lembut' });
        }
        if (main.salah >= 2) $(`.kartu[data-n="${harap}"]`, layar).classList.add('petunjuk');
      }
    }));

    function selesai() {
      main.kunci = true;
      Sfx.benar();
      terbangkanBintang($('#kereta'));
      tambahBintang();
      main.no++;
      perbaruiProgres();
      const puji = acak(PUJIAN);
      nanti(() => {
        if (roket) Sfx.roket(); else Sfx.tut();
        $('#kereta').classList.add(roket ? 'meluncur' : 'jalan');
      }, 900);
      if (roket) lanjut(`${puji} ${besarAwal(urutan)}. Meluncuuur!`, `${puji} ${deret.join(' - ')} 🚀✨`);
      else if (tipe === 'hilang') lanjut(`${puji} Angka yang hilang adalah ${kata(deret[kosong])}. ${besarAwal(urutan)}!`, `${puji} ${deret.join(' - ')} 🚂💨`);
      else lanjut(`${puji} ${besarAwal(urutan)}. Tut tuuut! Keretanya berangkat!`, `${puji} ${deret.join(' - ')} 🚂💨`);
    }

    Suara.bicara((main.no === 0 ? INTRO.urut + ' ' : '') + ucapAwal, { tulis: tulisAwal });
    pengingat(tanya);
  }

  // ---------- Layar hasil ----------
  function layarHasil() {
    main.kunci = false;
    Sfx.menang();
    konfeti();
    tampil(`
      <section class="hasil">
        <div class="piala">🏆</div>
        <h2>Hore! Kamu Hebat!</h2>
        <div class="bintang-hasil">${Array.from({ length: main.total }, (_, i) => `<span style="animation-delay:${0.3 + i * 0.2}s">⭐</span>`).join('')}</div>
        <div class="aksi">
          <button class="btn-besar btn-oranye" id="btnLagi">🔁 Main Lagi</button>
          <button class="btn-besar btn-biru" id="btnMenu">🏠 Menu</button>
        </div>
      </section>`);
    $('#btnLagi').addEventListener('click', () => { Sfx.pop(); mulaiGame(main.jenis); });
    $('#btnMenu').addEventListener('click', () => { Sfx.pop(); layarMenu(); });
    Suara.bicara(`Hore! Kamu hebat sekali! Kamu dapat ${kata(main.total)} bintang! Mau main lagi?`, { tulis: `Hore! Kamu dapat ${main.total} bintang! ⭐`, gaya: 'senang' });
  }

  // ================= KENALAN YUK (galeri belajar) =================
  const TAB_BELAJAR = [
    { id: 'hewan', ikon: '🐶', nama: 'Hewan' },
    { id: 'buah', ikon: '🍎', nama: 'Buah' },
    { id: 'angka', ikon: '🔢', nama: 'Angka' },
    { id: 'warna', ikon: '🎨', nama: 'Warna' },
    { id: 'bentuk', ikon: '🔺', nama: 'Bentuk' },
    { id: 'huruf', ikon: '🔤', nama: 'Huruf' },
  ];

  const ITEM_BELAJAR = {
    hewan: () => HEWAN.map((h) => ({
      html: emojiHTML(h.emoji), label: h.nama,
      ucap: h.suara ? `${besarAwal(h.nama)}. Bunyinya, ${h.suara}!` : `${besarAwal(h.nama)}. ${besarAwal(h.nama)} ${h.ciri}.`,
      tulis: h.suara ? `${h.emoji} ${besarAwal(h.nama)} bunyinya "${h.suara}"` : `${h.emoji} ${besarAwal(h.nama)} ${h.ciri}`,
    })),
    buah: () => BUAH.map((b) => ({
      html: emojiHTML(b.emoji), label: b.nama,
      ucap: `${besarAwal(b.nama)}. Warnanya ${b.warna}, rasanya ${b.rasa}.`,
      tulis: `${b.emoji} ${besarAwal(b.nama)}: warnanya ${b.warna}, rasanya ${b.rasa}`,
    })),
    angka: () => Array.from({ length: 10 }, (_, i) => i + 1).map((n) => ({
      html: angkaHTML(n), label: kata(n),
      ucap: besarAwal(kata(n)) + '.', tulis: `${n} — ${kata(n)}`,
    })),
    warna: () => WARNA.map((w) => ({
      html: catHTML(w.hex), label: w.nama,
      ucap: `${besarAwal(w.nama)}. Seperti ${w.benda[0].n}.`, tulis: `${w.benda[0].e} ${besarAwal(w.nama)}, seperti ${w.benda[0].n}`,
    })),
    bentuk: () => BENTUK.map((b, i) => ({
      html: bentukHTML(b, WARNA_ANGKA[i % 10]), label: b.nama,
      ucap: `${besarAwal(b.nama)}. Seperti ${b.contoh[0].n}.`, tulis: `${b.contoh[0].e} ${besarAwal(b.nama)}, seperti ${b.contoh[0].n}`,
    })),
    huruf: () => HURUF.map((h, i) => ({
      html: `<span class="huruf" style="--c:${WARNA_ANGKA[i % 10]}">${h.h}</span><span class="emoji-kecil">${h.emoji}</span>`,
      label: h.kata, ucap: `${besarAwal(h.eja)}. ${besarAwal(h.eja)}, ${h.kata}.`, tulis: `${h.h} — ${h.kata} ${h.emoji}`,
    })),
  };

  function layarBelajar(tab, sapa) {
    main = null;
    const items = ITEM_BELAJAR[tab]();
    tampil(`
      <section class="belajar">
        <div class="tab">
          ${TAB_BELAJAR.map((t) => `<button class="tab-btn ${t.id === tab ? 'aktif' : ''}" data-tab="${t.id}"><span>${t.ikon}</span>${t.nama}</button>`).join('')}
        </div>
        <div class="galeri">
          ${items.map((it, i) => `<button class="kartu" data-i="${i}">${it.html}<span class="label">${it.label}</span></button>`).join('')}
        </div>
      </section>`);
    $$('.tab-btn', layar).forEach((b) => b.addEventListener('click', () => { Sfx.pop(); layarBelajar(b.dataset.tab); }));
    $$('.kartu', layar).forEach((b) => b.addEventListener('click', () => {
      const it = items[+b.dataset.i];
      Sfx.pop();
      b.classList.remove('loncat');
      void b.offsetWidth;
      b.classList.add('loncat');
      Suara.bicara(it.ucap, { tulis: it.tulis });
    }));
    const namaTab = TAB_BELAJAR.find((t) => t.id === tab).nama.toLowerCase();
    if (sapa) Suara.bicara('Ayo kenalan! Sentuh gambarnya, nanti Cuking sebutkan namanya.', { tulis: 'Ayo kenalan! Sentuh gambarnya ya 👆' });
    else Suara.bicara(`Ayo kenalan dengan ${namaTab}!`, { tulis: `Ayo kenalan dengan ${namaTab}! 👆` });
  }

  // ================= PENGATURAN SUARA (untuk guru / orang tua) =================
  const panelAtur = $('#panelAtur');
  const pilihSuara = $('#pilihSuara');

  function isiPilihanSuara() {
    if (!pilihSuara) return;
    const indo = Suara.semua.filter(apakahIndo).sort((a, b) => nilaiSuara(b) - nilaiSuara(a));
    const opsiRekaman = Suara.adaRekaman ? '<option value="rekaman">Cuking · rekaman bawaan ⭐ (tanpa internet)</option>' : '';
    pilihSuara.innerHTML = opsiRekaman + indo.map((v) => `<option value="${v.voiceURI}">Suara browser: ${namaSuara(v)}</option>`).join('')
      || '<option value="">Belum ada suara Bahasa Indonesia</option>';
    pilihSuara.disabled = !Suara.adaRekaman && !indo.length;
    pilihSuara.value = Suara.pakaiRekaman() ? 'rekaman' : Suara.voice ? Suara.voice.voiceURI : '';
    $('#aturNada').disabled = Suara.pakaiRekaman();
    const adaAlami = indo.some((v) => nilaiSuara(v) >= 4);
    $('#tipsSuara').textContent = Suara.pakaiRekaman()
      ? '✅ Cuking memakai rekaman suara Bahasa Indonesia bawaan, jadi bisa bicara di semua browser, juga tanpa internet. Nada suara hanya bisa diatur untuk suara browser.'
      : !indo.length
        ? '⚠️ Browser ini belum punya suara Bahasa Indonesia, jadi Cuking tidak bisa bicara. Buka website dengan Google Chrome atau Microsoft Edge yang tersambung internet.'
        : adaAlami
          ? '✅ Suara yang paling alami sudah tersedia. Pilih yang bertanda ⭐.'
          : '💡 Suara yang paling alami ada di Microsoft Edge, yaitu suara Gadis (perempuan) atau Ardi (laki-laki).';
  }

  function simpanAtur() {
    simpan.taruh('tc_atur_suara', Suara.atur);
  }

  $('#btnAtur').addEventListener('click', () => {
    Sfx.pilih();
    isiPilihanSuara();
    $('#aturKecepatan').value = Suara.atur.rate;
    $('#aturNada').value = Suara.atur.pitch;
    panelAtur.hidden = false;
  });
  pilihSuara.addEventListener('change', () => {
    Suara.atur.voiceURI = pilihSuara.value;
    if (pilihSuara.value !== 'rekaman') Suara.voice = Suara.semua.find((v) => v.voiceURI === pilihSuara.value) || Suara.voice;
    simpanAtur();
    isiPilihanSuara();
  });
  $('#aturKecepatan').addEventListener('input', (e) => { Suara.atur.rate = +e.target.value; simpanAtur(); });
  $('#aturNada').addEventListener('input', (e) => { Suara.atur.pitch = +e.target.value; simpanAtur(); });
  $('#btnCoba').addEventListener('click', () => {
    Suara.bicara('Meong! Halo teman! Aku Cuking. Ayo kita belajar sambil bermain!', { tulis: 'Meong! Halo teman, aku Cuking 🐱', gaya: 'senang' });
  });
  $('#btnReset').addEventListener('click', () => {
    Suara.atur = { voiceURI: null, rate: 0.95, pitch: 1.1 };
    simpanAtur();
    Suara.init();
    $('#aturKecepatan').value = Suara.atur.rate;
    $('#aturNada').value = Suara.atur.pitch;
  });
  $('#btnTutup').addEventListener('click', () => { panelAtur.hidden = true; });
  panelAtur.addEventListener('click', (e) => { if (e.target === panelAtur) panelAtur.hidden = true; });

  // ================= TOMBOL UMUM =================
  function ikonSuara() {
    $('#btnSuara').textContent = Suara.aktif ? '🔊' : '🔇';
  }

  $('#btnRumah').addEventListener('click', () => {
    Suara.diam();
    Sfx.pop();
    layarMenu();
  });

  $('#btnSuara').addEventListener('click', () => {
    Suara.aktif = !Suara.aktif;
    simpan.taruh('tc_suara', Suara.aktif);
    ikonSuara();
    if (Suara.aktif) { Sfx.pilih(); Suara.bicara('Suara nyala!', { tulis: 'Suara nyala! 🔊' }); }
    else if ('speechSynthesis' in window) speechSynthesis.cancel();
  });

  // Ketuk Cuking untuk mengulang ucapan terakhir
  $('#maskotBadan').addEventListener('click', () => {
    if (sibuk() || !Suara.terakhir) return;
    Sfx.pilih();
    Suara.bicara(Suara.terakhir.ucap, { tulis: Suara.terakhir.tulis });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && 'speechSynthesis' in window) speechSynthesis.cancel();
  });

  // Emoji 🚂 menghadap kanan di Windows, menghadap kiri di Apple/Android
  document.documentElement.classList.toggle('emoji-kiri', !/Windows/i.test(navigator.userAgent));

  Suara.init();
  perbaruiSkor();
  ikonSuara();
  layarMulai();
})();
