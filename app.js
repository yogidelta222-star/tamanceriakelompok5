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
        let diucap = false;
        const ucapkan = () => {
          if (id !== this.id || lewat || diucap) return;
          diucap = true;
          // Penjaga bila audio / suara macet: lanjut ke kalimat berikutnya.
          // Untuk rekaman, batasnya mengikuti panjang ucapan + waktu memuat, agar ucapan panjang tidak terpotong.
          const klip = rekaman && KLIP_SUARA[k];
          const lamaKlip = Array.isArray(klip) && klip[1] ? (klip[1] - (klip[2] ?? AWAL_KLIP)) * 1000 + 3000 : 0;
          clearTimeout(jaga);
          jaga = setTimeout(lanjutkan, Math.max(2000 + k.length * 120, lamaKlip) / cepat);
          if (klip) {
            const [berkas, selesaiDetik, mulaiDetik] = Array.isArray(klip) ? klip : [klip, null];
            // Hening di awal & akhir rekaman dilewati (detik mulai dari daftar.js bila ada)
            const a = new Audio(`suara/${berkas}#t=${mulaiDetik ?? AWAL_KLIP}`);
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
        // Tiruan bunyi hewan diganti rekaman hewan asli; kalau berkasnya tidak ada, diucapkan biasa
        const asli = BUNYI_KALIMAT[k];
        if (asli) {
          jaga = setTimeout(lanjutkan, 5000);
          const b = new Audio(asli);
          b.onended = lanjutkan;
          b.onerror = ucapkan;
          this.audio = b;
          b.play().catch(ucapkan);
        } else ucapkan();
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

    // Putar rekaman suara hewan asli (bisa dihentikan oleh ucapan berikutnya, seperti kalimat biasa)
    bunyi(berkas, selesai) {
      const id = ++this.id;
      this.hentikan();
      let beres = false;
      const akhiri = () => {
        if (beres || id !== this.id) return;
        beres = true;
        if (selesai) selesai();
      };
      if (!this.aktif || !berkas) { setTimeout(akhiri, 50); return; }
      setTimeout(akhiri, 5000);
      const a = new Audio(berkas);
      a.onended = akhiri;
      a.onerror = akhiri;
      this.audio = a;
      a.play().catch(akhiri);
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
  // Foto asli bila tersedia (gambar/...), kalau belum ada tetap memakai emoji
  const gambarHTML = (x) => (x.gambar
    ? `<img class="foto" src="${x.gambar}" alt="${x.nama}" draggable="false">`
    : emojiHTML(x.emoji));
  const catHTML = (hex) => `<span class="cat" style="--c:${hex}"></span>`;
  const bentukHTML = (b, c) => `<svg class="bentuk" viewBox="0 0 100 100" style="--c:${c}" aria-hidden="true">${b.svg}</svg>`;
  const gambarTanya = (e, foto) => (foto
    ? `<div class="gambar-tanya"><img class="foto" src="${foto}" alt="" draggable="false"></div>`
    : `<div class="gambar-tanya">${e}</div>`);
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
    tutupDongeng();
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
      layarCerita('pembukaan', () => layarMenu());
      setTimeout(() => {
        if (!('speechSynthesis' in window)) pesan('🔇 Browser ini belum mendukung suara. Coba pakai Google Chrome atau Microsoft Edge.');
        else if (!Suara.adaRekaman && !Suara.adaIndonesia) pesan('🔇 Suara Bahasa Indonesia belum tersedia di browser ini. Buka website dengan Google Chrome atau Microsoft Edge (tersambung internet) agar Cuking bisa bicara.');
      }, 1800);
    });
  }

  // ================= PROGRES PETUALANGAN =================
  // Pos yang sudah diselesaikan, disimpan di perangkat: { belajar: true, hewan: true, ... }
  let progres = simpan.ambil('tc_progres', {}) || {};
  const sudahSelesai = (id) => !!progres[id];
  const jumlahSelesai = () => MENU.filter((m) => progres[m.id]).length;
  const semuaSelesai = () => jumlahSelesai() === MENU.length;
  const posBerikut = () => MENU.find((m) => !progres[m.id]);
  // Mengembalikan true bila pos ini baru saja selesai untuk pertama kali
  function tandaiSelesai(id) {
    if (progres[id]) return false;
    progres[id] = true;
    simpan.taruh('tc_progres', progres);
    return true;
  }
  // Cerita yang sudah pernah dibuka (dipakai untuk menampilkan penutup sekali saja)
  const ceritaDilihat = simpan.ambil('tc_cerita', {}) || {};

  // Layar cerita: narasinya selalu dibacakan utuh oleh Cuking sebelum masuk pos, juga untuk pembukaan & penutup
  function layarCerita(id, lanjut) {
    main = null;
    const c = CERITA[id];
    ceritaDilihat[id] = true;
    simpan.taruh('tc_cerita', ceritaDilihat);
    const penutup = id === 'penutup';
    tampil(`
      <section class="cerita ${penutup ? 'cerita-penutup' : ''}">
        <div class="cerita-ikon">${c.ikon}</div>
        <p class="cerita-sub">${c.sub}</p>
        <h2 class="cerita-judul">${c.judul}</h2>
        <div class="cerita-teks">${c.teks.map((p) => `<p>${p}</p>`).join('')}</div>
        <div class="aksi">
          ${penutup
            ? `<button class="btn-besar btn-oranye" id="btnUlangPetualangan">🔁 Main Lagi dari Awal</button>
               <button class="btn-besar btn-biru" id="btnPeta">🗺️ Lihat Peta</button>`
            : `<button class="btn-besar btn-main" id="btnLanjut">${c.tombol || '▶ Mulai'}</button>`}
        </div>
      </section>`, id !== 'pembukaan');
    if (penutup) {
      Sfx.menang();
      konfeti();
      $('#btnUlangPetualangan').addEventListener('click', () => {
        Sfx.pop();
        progres = {};
        simpan.taruh('tc_progres', progres);
        layarMenu();
      });
      $('#btnPeta').addEventListener('click', () => { Sfx.pop(); layarMenu(); });
    } else {
      $('#btnLanjut').addEventListener('click', () => { Sfx.pop(); Suara.diam(); lanjut(); });
    }
    Suara.bicara(c.teks.join(' '), { tulis: `${c.ikon} ${c.judul}`, gaya: 'senang' });
  }

  // Peta Petualangan: pos berurutan sesuai cerita, semua bisa dibuka bebas
  function layarMenu() {
    main = null;
    const selesai = jumlahSelesai();
    const berikut = posBerikut();
    const [utama, ...lain] = MENU;
    const status = (m) => (sudahSelesai(m.id) ? 'selesai' : m === berikut ? 'berikut' : '');
    const lencana = (m, i) => `<span class="pos-no">${sudahSelesai(m.id) ? '✓' : i + 1}</span>${m === berikut ? '<span class="pos-ajak">Ayo ke sini!</span>' : ''}`;
    tampil(`
      <section class="menu">
        <div class="peta-kepala">
          <h2 class="judul-sub">🗺️ Peta Petualangan</h2>
          <div class="peta-progres" role="img" aria-label="${selesai} dari ${MENU.length} pos selesai">
            <div class="peta-isi" style="width:${(selesai / MENU.length) * 100}%"></div>
            <span>${selesai} / ${MENU.length} pos selesai</span>
          </div>
        </div>
        <button class="tile-utama ${status(utama)}" data-id="${utama.id}" style="--c:${utama.warna}">
          ${lencana(utama, 0)}
          <span class="ikon">${utama.ikon}</span>
          <span class="teks">
            <span class="nama">${utama.nama}</span>
            <span class="ket">${utama.ket}</span>
            <span class="contoh">${utama.contoh}</span>
          </span>
          <span class="ajak">▶ Ayo mulai!</span>
        </button>
        <div class="grid-menu">
          ${lain.map((m, i) => `
            <button class="tile ${status(m)}" data-id="${m.id}" style="--c:${m.warna};--d:${0.15 + i * 0.08}s">
              ${lencana(m, i + 1)}<span class="ikon">${m.ikon}</span><span class="nama">${m.nama}</span>
            </button>`).join('')}
          <button class="tile pos-akhir ${semuaSelesai() ? 'terbuka' : ''}" id="posAkhir" style="--d:${0.15 + lain.length * 0.08}s">
            <span class="ikon">${semuaSelesai() ? '🎉' : '🏁'}</span><span class="nama">Hore, Kita Berhasil!</span>
          </button>
        </div>
      </section>`, false);
    $$('[data-id]', layar).forEach((b) => b.addEventListener('click', () => {
      Sfx.pop();
      const id = b.dataset.id;
      layarCerita(id, () => (id === 'belajar' ? layarBelajar('hewan') : mulaiGame(id)));
    }));
    $('#posAkhir').addEventListener('click', () => {
      Sfx.pop();
      if (semuaSelesai()) layarCerita('penutup');
      else {
        const sisa = MENU.length - jumlahSelesai();
        Suara.bicara(`Selesaikan semua pos dulu, ya! Masih ada ${kata(sisa)} pos lagi.`, { tulis: `Selesaikan semua pos dulu ya! Tinggal ${sisa} pos lagi 💪` });
      }
    });
    if (berikut) Suara.bicara(`Ayo lanjut ke ${berikut.nama}!`, { tulis: `Ayo lanjut ke ${berikut.nama}! 👇` });
    else Suara.bicara('Hore, semua pos sudah selesai! Sentuh bendera untuk melihat kejutannya!', { tulis: 'Hore, semua pos sudah selesai! 🎉' });
  }

  // ================= PERMAINAN =================
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
  // Pilihan berupa tulisan nama (+ tombol 🔊): teks yang tampil, dengar = yang diucapkan
  const opsiNama = (list, t, no, nama, salah, saring) => buatOpsi(list, t, no < 2 ? 3 : 4, saring).map((x) => ({
    benar: x === t, teks: nama(x), dengar: `${besarAwal(nama(x))}.`, salah: salah(x),
  }));
  const kartuAngka = (x, n) => ({
    benar: x === n, html: `<span class="num" style="--c:${WARNA_ANGKA[x - 1]}">${x}</span>`, label: kata(x), salah: `Itu angka ${kata(x)}.`,
  });

  const progresHTML = () => `<div class="progres">${Array.from({ length: main.total }, (_, i) => `<span class="${i < main.no ? 'isi' : ''}">★</span>`).join('')}</div>`;
  const perbaruiProgres = () => $$('.progres span', layar).forEach((s, i) => s.classList.toggle('isi', i < main.no));

  // Pembuat soal pilihan ganda: mengembalikan { ucap, tulis, pilihan[], benar, atas? }
  const PEMBUAT = {
    // Soal dari petunjuk dongeng; hewan yang dongengnya sudah didengar didahulukan
    hewan(no) {
      const jml = no < 2 ? 3 : 4;
      const didengar = (h) => dongengDidengar.has(h.nama);
      const masihAda = HEWAN.some((h) => didengar(h) && !main.dipakai.has('hewan:' + h.nama));
      const t = ambilBaru(HEWAN, masihAda ? { saring: didengar } : {});
      const d = DONGENG[t.nama];
      const p = acak(d.petunjuk);
      const mirip = new Set(MIRIP_HEWAN.filter((g) => g.includes(t.nama)).flat());
      return {
        ucap: `Ingat dongengnya? Siapa yang ${p}?`,
        tulis: `Siapa yang ${p}? 🤔`,
        pilihan: buatOpsi(HEWAN, t, jml, (h) => !mirip.has(h.nama)).map((h) => ({
          benar: h === t, html: gambarHTML(h), label: h.nama, salah: `Itu ${h.nama}.`,
        })),
        benar: `Itu ${d.tokoh} dari dongeng tadi! ${besarAwal(d.tokoh)} ${p}.`,
        bunyi: BUNYI_HEWAN[t.nama],
      };
    },

    // Tebak nama (buah, warna, bentuk, huruf): gambar muncul, anak memilih tulisan namanya.
    // Setiap pilihan punya tombol 🔊 untuk mendengar namanya dulu.
    buah(no) {
      const t = ambilBaru(BUAH);
      return {
        ucap: 'Buah apa ini?', tulis: 'Buah apa ini? 🤔',
        atas: gambarTanya(t.emoji, t.gambar),
        pilihan: opsiNama(BUAH, t, no, (b) => b.nama, (b) => `Itu buah ${b.nama}.`),
        benar: `Ini buah ${t.nama}. Warnanya ${t.warna}, rasanya ${t.rasa}!`,
      };
    },

    warna(no) {
      const t = ambilBaru(WARNA);
      const tanpaMirip = no < 2 ? (w) => !t.mirip.includes(w.nama) : undefined;
      return {
        ucap: 'Warna apa ini?', tulis: 'Warna apa ini? 🎨',
        atas: `<div class="gambar-tanya">${catHTML(t.hex)}</div>`,
        pilihan: opsiNama(WARNA, t, no, (w) => w.nama, (w) => `Itu warna ${w.nama}.`, tanpaMirip),
        benar: `Ini warna ${t.nama}, seperti ${acak(t.benda).n}.`,
      };
    },

    bentuk(no) {
      const t = ambilBaru(BENTUK);
      const tanpaMirip = no < 2 ? (b) => !t.mirip.includes(b.nama) : undefined;
      return {
        ucap: 'Bentuk apa ini?', tulis: 'Bentuk apa ini? 🔺',
        atas: `<div class="gambar-tanya">${bentukHTML(t, acak(WARNA_ANGKA))}</div>`,
        pilihan: opsiNama(BENTUK, t, no, (b) => b.nama, (b) => `Itu ${b.nama}.`, tanpaMirip),
        benar: `Ini ${t.nama}, seperti ${acak(t.contoh).n}.`,
      };
    },

    // Tebak huruf: anak memilih kartu huruf ("Mana huruf B?" atau huruf depan dari gambar)
    huruf(no) {
      const jml = no < 2 ? 3 : 4;
      const tipe = pilihTipe(no < 1 ? ['nama'] : ['nama', 'awal']);
      const t = ambilBaru(HURUF, { kunci: (h) => h.h });
      const warna = kocok(WARNA_ANGKA);
      const pilihan = buatOpsi(HURUF, t, jml).map((h, i) => ({
        benar: h === t, html: `<span class="huruf" style="--c:${warna[i]}">${h.h}</span>`, label: h.kata, salah: `Itu huruf ${h.eja}.`,
      }));
      if (tipe === 'awal') {
        return { ucap: `${t.kata}. Huruf depannya apa?`, tulis: 'Huruf depannya apa? 🤔', atas: gambarTanya(t.emoji, t.gambar), pilihan, benar: `${t.kata}, dimulai dengan huruf ${t.eja}.` };
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
          <div class="tombol-tanya">
            <button class="btn-ulang" id="btnUlang">🔊 Dengar lagi</button>
            ${s.bunyi ? '<button class="btn-ulang" id="btnBunyi">🐾 Dengar suaranya</button>' : ''}
          </div>
        </div>
        <div class="pilihan n${s.pilihan.length} ${s.pilihan[0].teks ? 'pilihan-nama' : ''}">
          ${s.pilihan.map((p, i) => (p.teks
            ? `<div class="opsi-nama">
                 <button class="kartu kartu-nama" data-i="${i}">${p.teks}</button>
                 <button class="dengar-opsi" data-i="${i}" aria-label="Dengar: ${p.teks}">🔊</button>
               </div>`
            : `<button class="kartu" data-i="${i}" aria-label="Pilihan ${i + 1}">${p.html}<span class="label">${p.label}</span></button>`)).join('')}
        </div>
      </section>`);

    // Soal hewan bersuara: setelah pertanyaan, suara hewan aslinya diputar sebagai petunjuk
    const tanya = () => Suara.bicara(s.ucap, { tulis: s.tulis, selesai: s.bunyi ? () => Suara.bunyi(s.bunyi) : undefined });
    $('#btnUlang').addEventListener('click', () => { if (sibuk()) return; Sfx.pilih(); tanya(); });
    if (s.bunyi) $('#btnBunyi').addEventListener('click', () => { if (sibuk()) return; Suara.bunyi(s.bunyi); });
    pasangHitung(layar);
    $$('.dengar-opsi', layar).forEach((b) => b.addEventListener('click', () => {
      if (sibuk()) return;
      const p = s.pilihan[+b.dataset.i];
      Sfx.pilih();
      Suara.bicara(p.dengar, { tulis: `🔊 ${p.teks}` });
    }));

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

    tanya();
    pengingat(tanya);
  }

  // Ulangi pertanyaan bila anak diam cukup lama
  function pengingat(tanya) {
    nanti(() => { if (main && !main.kunci) tanya(); }, 18000);
  }

  function lanjut(ucap, tulis) {
    Suara.bicara(ucap, { tulis, gaya: 'senang', selesai: () => nanti(soalBerikut, 600) });
  }

  // ---------- Urutkan angka: kereta angka, disusun dari terkecil hingga terbesar ----------
  function soalUrut() {
    // Soal terakhir selalu kereta panjang 1 sampai 10, agar anak berhitung dari 1 hingga 10
    const terakhir = main.no === main.total - 1;
    const n = terakhir ? 10 : [3, 4, 5, 5][main.no] || 5;
    const awal = main.no < 2 || terakhir ? 1 : 1 + Math.floor(Math.random() * (10 - n + 1));
    const deret = Array.from({ length: n }, (_, i) => awal + i);
    let kartuN;
    do { kartuN = kocok(deret); } while (kartuN.every((v, i) => v === deret[i]));
    let idx = 0;

    tampil(`
      <section class="game game-urut ${n > 6 ? 'urut-panjang' : ''}">
        ${progresHTML()}
        <div class="papan-tanya"><button class="btn-ulang" id="btnUlang">🔊 Dengar lagi</button></div>
        <div class="rel">
          <div class="kereta" id="kereta">
            ${deret.map((d) => `<div class="gerbong" style="--c:${WARNA_ANGKA[(d - 1) % 10]}"><span>?</span></div>`).join('')}
            <span class="lokomotif">🚂</span>
          </div>
        </div>
        <div class="pilihan angka-acak" style="--n:${kartuN.length}">
          ${kartuN.map((d) => `<button class="kartu angka" data-n="${d}" aria-label="Angka ${d}">${angkaHTML(d)}</button>`).join('')}
        </div>
      </section>`);

    const gerbong = $$('.gerbong', layar);
    const kartu = $$('.kartu', layar);
    const urutan = deret.map(kata).join(', ');
    const ucapAwal = `Susun angkanya dari yang paling kecil. Mulai dari angka ${kata(deret[0])}!`;
    const tulisAwal = `Susun dari yang paling kecil! Mulai dari ${deret[0]} 🚂`;
    const tanya = () => (idx === 0
      ? Suara.bicara(ucapAwal, { tulis: tulisAwal })
      : Suara.bicara(`Sekarang cari angka ${kata(deret[idx])}!`, { tulis: `Sekarang cari angka ${deret[idx]} 🔍` }));

    $('#btnUlang').addEventListener('click', () => { if (sibuk()) return; Sfx.pilih(); tanya(); });

    kartu.forEach((btn) => btn.addEventListener('click', () => {
      if (sibuk()) return;
      const d = +btn.dataset.n;
      const harap = deret[idx];
      if (d === harap) {
        Sfx.pop();
        btn.classList.add('terpakai');
        btn.disabled = true;
        gerbong[idx].classList.add('isi');
        gerbong[idx].querySelector('span').textContent = d;
        kartu.forEach((k) => k.classList.remove('petunjuk'));
        main.salah = 0;
        idx++;
        hapusTimer();
        if (idx === deret.length) {
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
        Suara.bicara(`Itu angka ${kata(d)}. Cari angka ${kata(harap)} dulu ya!`, { tulis: `Itu angka ${d}. Cari angka ${harap} dulu ya! 🔍`, gaya: 'lembut' });
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
      nanti(() => { Sfx.tut(); $('#kereta').classList.add('jalan'); }, 900);
      lanjut(`${puji} ${besarAwal(urutan)}. Tut tuuut! Keretanya berangkat!`, `${puji} ${deret.join(' - ')} 🚂💨`);
    }

    Suara.bicara(ucapAwal, { tulis: tulisAwal });
    pengingat(tanya);
  }

  // ---------- Layar hasil ----------
  function layarHasil() {
    main.kunci = false;
    tandaiSelesai(main.jenis);
    // Semua pos baru saja selesai: ajak ke penutup
    const kePenutup = semuaSelesai() && !ceritaDilihat.penutup;
    Sfx.menang();
    konfeti();
    tampil(`
      <section class="hasil">
        <div class="piala">🏆</div>
        <h2>Hore! Kamu Hebat!</h2>
        <div class="bintang-hasil">${Array.from({ length: main.total }, (_, i) => `<span style="animation-delay:${0.3 + i * 0.2}s">⭐</span>`).join('')}</div>
        <div class="aksi">
          ${kePenutup
            ? '<button class="btn-besar btn-main" id="btnPenutup">🎉 Lihat Kejutan!</button>'
            : `<button class="btn-besar btn-oranye" id="btnLagi">🔁 Main Lagi</button>
               <button class="btn-besar btn-biru" id="btnMenu">🗺️ Peta</button>`}
        </div>
      </section>`);
    if (kePenutup) {
      $('#btnPenutup').addEventListener('click', () => { Sfx.pop(); layarCerita('penutup'); });
      Suara.bicara(`Hore! Kamu hebat sekali! Kamu dapat ${kata(main.total)} bintang! Semua pos sudah selesai! Ayo lihat kejutannya!`, { tulis: 'Hore! Semua pos sudah selesai! 🎉', gaya: 'senang' });
      return;
    }
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
    // Hewan membuka dongengnya, bukan sekadar disebut namanya
    hewan: () => HEWAN.map((h) => ({ html: gambarHTML(h), label: h.nama, hewan: h })),
    buah: () => BUAH.map((b) => ({
      html: gambarHTML(b), label: b.nama,
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
      html: `<span class="huruf" style="--c:${WARNA_ANGKA[i % 10]}">${h.h}</span>${h.gambar
        ? `<img class="foto-kecil" src="${h.gambar}" alt="${h.kata}" draggable="false">`
        : `<span class="emoji-kecil">${h.emoji}</span>`}`,
      label: h.kata, ucap: `Ini huruf ${h.eja}. ${besarAwal(h.eja)}, ${h.kata}.`, tulis: `${h.h} — ${h.kata} ${h.emoji}`,
    })),
  };

  // ---------- Dongeng hewan ----------
  // Hewan yang dongengnya sudah dibuka anak (dipakai untuk memilih soal Tebak Hewan)
  const dongengDidengar = new Set(simpan.ambil('tc_dongeng', []) || []);

  function tutupDongeng() {
    const latar = $('#panelDongeng');
    if (latar) latar.remove();
  }

  function bukaDongeng(h, selesai) {
    tutupDongeng();
    const d = DONGENG[h.nama];
    const bunyi = BUNYI_HEWAN[h.nama];
    dongengDidengar.add(h.nama);
    simpan.taruh('tc_dongeng', [...dongengDidengar]);
    document.body.insertAdjacentHTML('beforeend', `
      <div class="panel-latar" id="panelDongeng">
        <div class="panel dongeng" role="dialog" aria-modal="true" aria-label="Dongeng ${d.tokoh}">
          <div class="dongeng-gambar">${gambarHTML(h)}</div>
          <p class="cerita-sub">Dongeng</p>
          <h2 class="dongeng-judul">${d.tokoh}</h2>
          <p class="dongeng-teks">${d.teks}</p>
          <div class="panel-aksi">
            ${bunyi ? '<button class="btn-kecil" id="btnDongengBunyi">🐾 Suaranya</button>' : ''}
            <button class="btn-kecil" id="btnDongengUlang">🔊 Dengar lagi</button>
            <button class="btn-kecil utama" id="btnDongengTutup">✖ Tutup</button>
          </div>
        </div>
      </div>`);
    const latar = $('#panelDongeng');
    // Suara hewan aslinya dulu (bila ada), lalu Cuking membacakan dongeng.
    // Dongeng yang sudah berisi tiruan bunyi tidak diawali suara hewan, karena bunyinya diputar di tengah cerita.
    const adaBunyiDiCerita = pecahKalimat(d.teks).some((k) => BUNYI_KALIMAT[k]);
    const baca = (lalu) => Suara.bunyi(adaBunyiDiCerita ? null : bunyi, () => Suara.bicara(d.teks, { tulis: `📖 Dongeng ${d.tokoh}`, selesai: lalu }));
    if (bunyi) $('#btnDongengBunyi').addEventListener('click', () => Suara.bunyi(bunyi));
    const tutup = () => { Sfx.pop(); Suara.diam(); tutupDongeng(); };
    $('#btnDongengUlang').addEventListener('click', () => { Sfx.pilih(); baca(); });
    $('#btnDongengTutup').addEventListener('click', tutup);
    latar.addEventListener('click', (e) => { if (e.target === latar) tutup(); });
    baca(selesai);
  }

  // Pos Kenalan Yuk dianggap selesai setelah anak menyentuh beberapa gambar berbeda
  const SYARAT_KENALAN = 6;
  const dikenal = new Set();

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
      dikenal.add(`${tab}:${b.dataset.i}`);
      const baruSelesai = dikenal.size >= SYARAT_KENALAN && tandaiSelesai('belajar');
      const rayakan = baruSelesai ? () => {
        Sfx.benar();
        konfeti();
        const berikut = posBerikut();
        Suara.bicara(`Hore! Pos Kenalan Yuk selesai!${berikut ? ` Ayo lanjut ke ${berikut.nama}!` : ''}`, { tulis: 'Hore! Pos Kenalan Yuk selesai ✅', gaya: 'senang' });
      } : undefined;
      if (it.hewan) bukaDongeng(it.hewan, rayakan);
      else Suara.bicara(it.ucap, { tulis: it.tulis, selesai: rayakan });
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
