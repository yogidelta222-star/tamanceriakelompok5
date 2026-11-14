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
  // Rekaman tokoh selain Kiku disimpan dengan kunci "tokoh|kalimat" (suaranya berbeda)
  const kunciKlip = (k, tokoh) => (tokoh && tokoh !== 'kiku' ? `${tokoh}|${k}` : k);
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
    // Tanpa keduanya Kiku diam, daripada dibacakan dengan logat bahasa lain.
    // gaya: 'senang' (memuji), 'lembut' (saat salah), atau biasa — hanya berlaku untuk suara browser
    bicara(ucap, opsi = {}) {
      const { tulis = ucap, selesai, gaya, tokoh } = opsi;
      const id = ++this.id;
      this.terakhir = { ucap, tulis, tokoh };
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
          const klip = rekaman && KLIP_SUARA[kunciKlip(k, tokoh)];
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
                // Rekaman tanpa hening di ujung dibiarkan habis sendiri: suara perangkat keluar sedikit
                // terlambat, jadi kalau dihentikan dengan timer, suku kata terakhir bisa ikut terpotong
                if (!a.duration || a.duration - selesaiDetik < 0.1) return;
                potong = setTimeout(() => { a.pause(); lanjutkan(); }, (Math.max(0, selesaiDetik - a.currentTime) * 1000 + 150) / cepat);
              };
            }
            a.onerror = () => this.ucapkanBrowser(k, f, id, lanjutkan);
            this.audio = a;
            a.play().catch(() => this.ucapkanBrowser(k, f, id, lanjutkan));
          } else {
            if (rekaman) kalimatTanpaRekaman.add(kunciKlip(k, tokoh));
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


  // ================= TOKOH YANG BERBICARA =================
  const maskotGambar = $('#maskotBadan img');
  // Wajah di pojok kiri atas dan warna tulisan mengikuti tokoh yang sedang berbicara
  function aturPembicara(id) {
    const t = TOKOH[id] || TOKOH.kiku;
    if (!maskotGambar.src.endsWith(t.gambar)) maskotGambar.src = t.gambar;
    maskotGambar.alt = t.sebutan;
    maskot.style.setProperty('--warna-tokoh', t.warna);
    maskot.dataset.tokoh = id;
  }
  function ucap(id, teks, selesai, gaya) {
    aturPembicara(id);
    Suara.bicara(teks, { tulis: `${TOKOH[id].nama}: ${teks}`, tokoh: id, selesai, gaya });
  }
  // Memutar beberapa ucapan berurutan; padaBaris dipanggil tepat sebelum setiap ucapan
  let putaran = 0;
  function putarUcapan(daftar, { padaBaris, selesai } = {}) {
    const id = ++putaran;
    let i = 0;
    const jalan = () => {
      if (id !== putaran) return;
      if (i >= daftar.length) { if (selesai) selesai(); return; }
      const u = daftar[i++];
      if (padaBaris) padaBaris(u, i - 1);
      ucap(u.s, u.t, () => nanti(jalan, 380));
    };
    jalan();
  }

  // ================= MUSIK LATAR CERITA =================
  // musik/latar.mp3 diputar pelan selama cerita; bila berkasnya belum ada, diam saja
  const Musik = {
    audio: null,
    nyala() {
      if (!Suara.aktif) return;
      if (!this.audio) {
        this.audio = new Audio('musik/latar.mp3');
        this.audio.loop = true;
        this.audio.volume = 0.16;
        this.audio.onerror = () => { this.audio = null; };
      }
      this.audio.play().catch(() => {});
    },
    mati() { if (this.audio) this.audio.pause(); },
  };

  // ================= NAVIGASI =================
  let main = null; // permainan yang sedang berjalan (dikunci saat menunggu ucapan)
  const sibuk = () => main && main.kunci;

  function tampil(html, rumah = true) {
    hapusTimer();
    putaran++;
    layar.innerHTML = html;
    layar.classList.remove('masuk');
    void layar.offsetWidth;
    layar.classList.add('masuk');
    $('#btnRumah').hidden = !rumah;
    $('#btnAtur').hidden = rumah;
    window.scrollTo(0, 0);
  }

  // Bilah langkah perjalanan (Pembuka → … → Penutup)
  const langkahHTML = (id) => {
    const aktif = LANGKAH.findIndex((l) => l.id === id || (l.bagian || []).includes(id));
    return `<ol class="langkah">${LANGKAH.map((l, i) => `<li class="${i < aktif ? 'lewat' : i === aktif ? 'aktif' : ''}"><span>${l.ikon}</span><b>${l.nama}</b></li>`).join('')}</ol>`;
  };
  const hewanDari = (nama) => HEWAN.find((h) => h.nama === nama);
  const fotoHTML = (h, kelas = 'foto') => `<img class="${kelas}" src="${h.gambar}" alt="${h.nama}" draggable="false">`;

  function layarMulai() {
    Musik.mati();
    const lanjutDari = simpan.ambil('tc_langkah', 0);
    tampil(`
      <section class="mulai">
        <h1>Taman Ceria</h1>
        <p class="sub">Petualangan Mengenal Hewan Herbivora, Karnivora, dan Omnivora</p>
        <div class="parade">${['🐮', '🐰', '🦁', '🐻', '🐔', '🐘'].map((e, i) => `<span style="--i:${i}">${e}</span>`).join('')}</div>
        <button class="btn-besar btn-main" id="btnMulai">▶ Ayo Main!</button>
        ${lanjutDari > 0 && lanjutDari < ALUR.length ? '<button class="btn-kecil" id="btnLanjutkan">↪ Lanjutkan petualangan</button>' : ''}
      </section>`, false);
    aturPembicara('kiku');
    tampilGelembung('Kiku: Cuit! Aku Kiku 🐦 Tekan tombol hijau ya!');
    const mulai = (dari) => {
      Sfx.siap();
      Sfx.benar();
      jalankan(dari);
      setTimeout(() => {
        if (!('speechSynthesis' in window) && !Suara.adaRekaman) pesan('🔇 Browser ini belum mendukung suara. Coba pakai Google Chrome atau Microsoft Edge.');
      }, 1800);
    };
    $('#btnMulai').addEventListener('click', () => mulai(0));
    const lanjutkan = $('#btnLanjutkan');
    if (lanjutkan) lanjutkan.addEventListener('click', () => mulai(lanjutDari));
  }

  // Menjalankan langkah ke-i dari ALUR (adegan cerita atau permainan)
  function jalankan(i) {
    const id = ALUR[i];
    if (!id) return layarMulai();
    simpan.taruh('tc_langkah', id === 'penutup' ? 0 : i);
    const lanjut = () => jalankan(i + 1);
    if (ADEGAN[id]) layarAdegan(id, lanjut);
    else if (id === 'makanan') gameMakanan(lanjut);
    else if (id === 'kelompok') gameKelompok(lanjut);
    else if (id === 'kuis') gameKuis(lanjut);
  }

  // ================= ADEGAN CERITA =================
  // Posisi bawaan tiga sahabat [kiri %, bawah %, lebar %]; tiap adegan bisa mengaturnya sendiri lewat "tata"
  const POSISI_SAHABAT = { lili: [1, 3, 12], leo: [11, 3, 15], bubu: [24, 3, 12] };

  function layarAdegan(id, lanjut) {
    main = null;
    const a = ADEGAN[id];
    const penutup = id === 'penutup';
    const tata = a.tata || {};
    // Makin ke belakang (bawah % lebih besar) makin di belakang tumpukan
    const letak = ([x, b, w]) => `--x:${x}%;--b:${b}%;--lebar:${w}%;z-index:${60 - b}`;
    const sahabat = ['lili', 'leo', 'bubu'].map((s) => `
      <div class="aktor sahabat ${a.sahabat ? 'tampak' : ''}" data-tokoh="${s}" style="${letak(tata[s] || POSISI_SAHABAT[s])};--w:${TOKOH[s].warna}">
        <img src="${TOKOH[s].gambar}" alt="${TOKOH[s].sebutan}" draggable="false"><span>${TOKOH[s].nama}</span>
      </div>`).join('');
    const hewan = (a.hewan || []).map((n, i) => `
      <button class="aktor hewan" style="${letak(tata[n])};--i:${i}" data-hewan="${n}" aria-label="${n}">${fotoHTML(hewanDari(n))}<span>${n}</span></button>`).join('');
    tampil(`
      <section class="adegan">
        ${langkahHTML(id)}
        <h2 class="judul-adegan"><span>${a.judul}</span></h2>
        <div class="panggung" id="panggung" style="background-image:url(gambar/latar/${a.latar}.webp)">
          ${a.latar === 'pintu-tutup' ? '<div class="latar-buka" style="background-image:url(gambar/latar/pintu-buka.webp)"></div><div class="pintu-ajaib"><div class="papan-pintu">Selamat datang di Taman Pengetahuan Hewan!</div></div>' : ''}
          ${a.kikuTerbang ? '<video class="video-adegan" src="video/pembuka.mp4" muted playsinline preload="auto"></video>' : ''}
          ${a.kiku ? '<img class="aktor kiku hinggap" src="gambar/kiku.webp" alt="Kiku" draggable="false">' : ''}
          ${sahabat}${hewan}
        </div>
        <div class="teks-adegan" id="teksAdegan" aria-live="polite"></div>
        <div class="aksi">
          <button class="btn-kecil" id="btnUlangAdegan">🔊 Dengar lagi</button>
          ${penutup
            ? '<button class="btn-besar btn-oranye" id="btnUlangSemua">🔁 Main Lagi</button>'
            : `<button class="btn-besar btn-main" id="btnLanjut">${id === 'omnivora' ? '🎮 Mulai Game' : 'Lanjut ▶'}</button>`}
        </div>
      </section>`);
    Musik.nyala();
    const panggung = $('#panggung');
    const teks = $('#teksAdegan');
    const baris = (u) => {
      $$('.ucapan.kini', teks).forEach((p) => p.classList.remove('kini'));
      const t = TOKOH[u.s];
      teks.insertAdjacentHTML('beforeend', `
        <div class="ucapan kini" style="--w:${t.warna}">
          <img class="wajah" src="${t.gambar}" alt="" draggable="false">
          <div class="isi-ucapan"><b>${t.nama}</b><p>${u.t}</p></div>
        </div>`);
      teks.scrollTop = teks.scrollHeight;
      if (u.muncul) {
        const s = $(`.sahabat[data-tokoh="${u.muncul}"]`, panggung);
        s.classList.add('tampak', 'muncul');
      }
      if (u.aksi) panggung.classList.add(u.aksi);
      $$('.aktor', panggung).forEach((x) => x.classList.toggle('bicara', x.dataset.tokoh === u.s));
    };
    const putar = () => {
      teks.innerHTML = '';
      panggung.classList.remove('buka-pintu', 'masuk-pintu');
      if (id === 'perkenalan') $$('.sahabat', panggung).forEach((s) => s.classList.remove('tampak', 'muncul'));
      putarUcapan(a.ucapan, { padaBaris: baris, selesai: () => $$('.aktor', panggung).forEach((x) => x.classList.remove('bicara')) });
    };
    // Video 3D: Kiku terbang lalu hinggap di dahan; gambar terakhirnya tetap tampil selama Kiku bercerita
    const video = $('.video-adegan', panggung);
    if (video) {
      let mulai = false;
      const cerita = () => { if (mulai) return; mulai = true; putar(); };
      video.addEventListener('ended', cerita);
      video.addEventListener('error', () => { video.remove(); panggung.insertAdjacentHTML('beforeend', '<img class="aktor kiku" src="gambar/kiku.webp" alt="Kiku" draggable="false">'); cerita(); });
      video.play().catch(cerita);
      nanti(cerita, 9000);
    } else putar();
    if (penutup) { Sfx.menang(); konfeti(); }

    // Sentuh hewan di adegan: suara aslinya lalu namanya
    $$('.aktor.hewan', panggung).forEach((b) => b.addEventListener('click', () => {
      const h = hewanDari(b.dataset.hewan);
      Sfx.pop();
      b.classList.remove('loncat');
      void b.offsetWidth;
      b.classList.add('loncat');
      putaran++;
      const sebut = () => ucap('kiku', `Ini ${h.nama}, hewan ${h.kelompok}.`);
      if (BUNYI_HEWAN[h.nama]) Suara.bunyi(BUNYI_HEWAN[h.nama], sebut); else sebut();
    }));
    $('#btnUlangAdegan').addEventListener('click', () => { Sfx.pilih(); putar(); });
    if (penutup) {
      $('#btnUlangSemua').addEventListener('click', () => { Sfx.pop(); Suara.diam(); simpan.taruh('tc_langkah', 0); jalankan(0); });
    } else {
      $('#btnLanjut').addEventListener('click', () => { Sfx.pop(); Suara.diam(); lanjut(); });
    }
  }

  // ================= PERMAINAN =================
  const bintangHTML = (no, total) => `<div class="progres">${Array.from({ length: total }, (_, i) => `<span class="${i < no ? 'isi' : ''}">★</span>`).join('')}</div>`;

  // Layar pembuka game: tokoh pemandu membacakan narasinya
  function layarPembukaGame(id, mulai) {
    main = null;
    const g = GAME[id];
    const t = TOKOH[g.tokoh];
    tampil(`
      <section class="cerita pembuka-game">
        ${langkahHTML(id)}
        <img class="tokoh-besar" src="${t.gambar}" alt="${t.sebutan}" draggable="false">
        <p class="cerita-sub">${t.sebutan}</p>
        <h2 class="cerita-judul">${g.judul}</h2>
        <div class="cerita-teks" style="--w:${t.warna}">${g.pembuka.map((p) => `<p>${p}</p>`).join('')}</div>
        <div class="aksi">
          <button class="btn-kecil" id="btnUlangPembuka">🔊 Dengar lagi</button>
          <button class="btn-besar btn-main" id="btnMulaiGame">▶ Mulai</button>
        </div>
      </section>`);
    Musik.mati();
    const baca = () => putarUcapan(g.pembuka.map((p) => ({ s: g.tokoh, t: p })));
    baca();
    $('#btnUlangPembuka').addEventListener('click', () => { Sfx.pilih(); baca(); });
    $('#btnMulaiGame').addEventListener('click', () => { Sfx.pop(); Suara.diam(); mulai(); });
  }

  function layarSelesaiGame(id, bintang, total, lanjut) {
    main = null;
    const g = GAME[id];
    tampil(`
      <section class="hasil">
        ${langkahHTML(id)}
        <div class="piala">🏆</div>
        <h2>${g.judul.replace(/^Game \d: /, '')}</h2>
        <div class="bintang-hasil">${Array.from({ length: Math.min(total, 10) }, (_, i) => `<span style="animation-delay:${i * 0.08}s">${i < Math.round(bintang / total * Math.min(total, 10)) ? '⭐' : '☆'}</span>`).join('')}</div>
        <div class="aksi"><button class="btn-besar btn-main" id="btnLanjutGame">Lanjut ▶</button></div>
      </section>`);
    Sfx.menang();
    konfeti();
    ucap(g.tokoh, g.selesai, null, 'senang');
    $('#btnLanjutGame').addEventListener('click', () => { Sfx.pop(); Suara.diam(); lanjut(); });
  }

  // ---------- Game 1: memilih makanan kesukaan hewan ----------
  function gameMakanan(lanjut) {
    const g = GAME.makanan;
    layarPembukaGame('makanan', () => {
      const daftar = kocok(HEWAN).slice(0, g.ronde);
      let no = 0;
      let bintang = 0;
      const soal = () => {
        if (no >= daftar.length) return layarSelesaiGame('makanan', bintang, daftar.length, lanjut);
        const h = daftar[no];
        main = { kunci: false, salah: false };
        tampil(`
          <section class="game">
            ${langkahHTML('makanan')}
            ${bintangHTML(no, daftar.length)}
            <div class="papan-tanya">
              <div class="gambar-tanya">${fotoHTML(h)}</div>
              <p class="tanya-teks">${g.tanya(h)}</p>
              <button class="btn-ulang" id="btnUlang">🔊 Dengar lagi</button>
            </div>
            <div class="pilihan pilihan-makanan">
              ${kocok([h.makan, ...h.bukan]).map((m) => `<button class="kartu makanan" data-m="${m}"><span class="emoji">${MAKANAN[m]}</span><span class="label">${m}</span></button>`).join('')}
            </div>
          </section>`);
        const tanya = () => ucap(g.tokoh, g.tanya(h));
        $('#btnUlang').addEventListener('click', () => { if (sibuk()) return; Sfx.pilih(); tanya(); });
        $$('.kartu.makanan', layar).forEach((b) => b.addEventListener('click', () => {
          if (sibuk()) return;
          if (b.dataset.m === h.makan) {
            main.kunci = true;
            Sfx.benar();
            b.classList.add('benar');
            if (!main.salah) { bintang++; terbangkanBintang(b); tambahBintang(); }
            ucap(g.tokoh, g.benar(h), () => { no++; nanti(soal, 450); }, 'senang');
          } else {
            main.salah = true;
            Sfx.salah();
            goyang(b);
            b.classList.add('redup');
            ucap(g.tokoh, g.salah, null, 'lembut');
          }
        }));
        tanya();
      };
      soal();
    });
  }

  // ---------- Game 2: mengelompokkan 15 hewan (tarik, atau sentuh lalu sentuh kotak) ----------
  function gameKelompok(lanjut) {
    const g = GAME.kelompok;
    layarPembukaGame('kelompok', () => {
      main = { kunci: false };
      tampil(`
        <section class="game game-kelompok">
          ${langkahHTML('kelompok')}
          <div class="kotak-kelompok">
            ${Object.entries(KELOMPOK).map(([k, v]) => `
              <div class="kotak" data-k="${k}" style="--k:${v.warna}">
                <div class="kotak-judul"><span>${v.ikon}</span>${v.nama}<small>${v.ket}</small></div>
                <div class="kotak-isi"></div>
              </div>`).join('')}
          </div>
          <p class="petunjuk-kecil">Tarik hewan ke kotak kelompoknya, atau sentuh hewan lalu sentuh kotaknya.</p>
          <div class="kolam-hewan">
            ${kocok(HEWAN).map((h) => `<button class="kartu-hewan" data-hewan="${h.nama}">${fotoHTML(h)}<span>${h.nama}</span></button>`).join('')}
          </div>
        </section>`);
      let dipilih = null;
      let bintang = 0;
      let beres = 0;
      const pernahSalah = new Set();
      const pilih = (el) => {
        $$('.kartu-hewan.dipilih', layar).forEach((x) => x.classList.remove('dipilih'));
        dipilih = el;
        if (el) el.classList.add('dipilih');
      };
      const taruh = (el, k) => {
        const h = hewanDari(el.dataset.hewan);
        const kotak = $(`.kotak[data-k="${k}"]`, layar);
        if (h.kelompok !== k) {
          pernahSalah.add(h.nama);
          Sfx.salah();
          goyang(el);
          goyang(kotak);
          ucap(g.tokoh, g.salah, null, 'lembut');
          return;
        }
        Sfx.benar();
        if (!pernahSalah.has(h.nama)) { bintang++; terbangkanBintang(el); tambahBintang(); }
        kotak.querySelector('.kotak-isi').insertAdjacentHTML('beforeend', fotoHTML(h, 'mini'));
        kotak.classList.remove('pas');
        void kotak.offsetWidth;
        kotak.classList.add('pas');
        el.remove();
        pilih(null);
        beres++;
        if (beres === HEWAN.length) {
          main.kunci = true;
          ucap(g.tokoh, g.benar(h), () => nanti(() => layarSelesaiGame('kelompok', bintang, HEWAN.length, lanjut), 300), 'senang');
        } else {
          ucap(g.tokoh, g.benar(h), null, 'senang');
        }
      };

      // Sentuh hewan, lalu sentuh kotak
      let barusDiseret = false;
      $$('.kartu-hewan', layar).forEach((el) => el.addEventListener('click', () => {
        if (barusDiseret || sibuk()) return;
        Sfx.pilih();
        pilih(dipilih === el ? null : el);
      }));
      $$('.kotak', layar).forEach((k) => k.addEventListener('click', () => {
        if (dipilih && !sibuk()) taruh(dipilih, k.dataset.k);
      }));

      // Tarik dengan jari / tetikus
      $$('.kartu-hewan', layar).forEach((el) => el.addEventListener('pointerdown', (e) => {
        if (sibuk()) return;
        const awalX = e.clientX;
        const awalY = e.clientY;
        let bayang = null;
        const gerak = (ev) => {
          if (!bayang && Math.hypot(ev.clientX - awalX, ev.clientY - awalY) < 10) return;
          if (!bayang) {
            bayang = el.cloneNode(true);
            bayang.classList.add('bayang-seret');
            bayang.style.width = el.offsetWidth + 'px';
            document.body.appendChild(bayang);
            el.classList.add('diseret');
          }
          bayang.style.left = ev.clientX + 'px';
          bayang.style.top = ev.clientY + 'px';
          $$('.kotak', layar).forEach((k) => k.classList.remove('sasaran'));
          const bawah = document.elementFromPoint(ev.clientX, ev.clientY);
          const k = bawah && bawah.closest('.kotak');
          if (k) k.classList.add('sasaran');
        };
        const lepas = (ev) => {
          document.removeEventListener('pointermove', gerak);
          document.removeEventListener('pointerup', lepas);
          document.removeEventListener('pointercancel', lepas);
          $$('.kotak', layar).forEach((k) => k.classList.remove('sasaran'));
          if (!bayang) return;
          bayang.remove();
          el.classList.remove('diseret');
          barusDiseret = true;
          setTimeout(() => { barusDiseret = false; }, 50);
          const bawah = document.elementFromPoint(ev.clientX, ev.clientY);
          const k = bawah && bawah.closest('.kotak');
          if (k && el.isConnected) taruh(el, k.dataset.k);
        };
        document.addEventListener('pointermove', gerak);
        document.addEventListener('pointerup', lepas);
        document.addEventListener('pointercancel', lepas);
      }));
    });
  }

  // ---------- Game 3: kuis pilihan A, B, C ----------
  function gameKuis(lanjut) {
    const g = GAME.kuis;
    layarPembukaGame('kuis', () => {
      const daftar = kocok(g.hewan.map(hewanDari));
      let no = 0;
      let bintang = 0;
      const soal = () => {
        if (no >= daftar.length) return layarSelesaiGame('kuis', bintang, daftar.length, lanjut);
        const h = daftar[no];
        main = { kunci: false, salah: false };
        tampil(`
          <section class="game">
            ${langkahHTML('kuis')}
            ${bintangHTML(no, daftar.length)}
            <div class="papan-tanya">
              <div class="gambar-tanya">${fotoHTML(h)}</div>
              <p class="tanya-teks">${g.tanya(h)}</p>
              <button class="btn-ulang" id="btnUlang">🔊 Dengar lagi</button>
            </div>
            <div class="pilihan pilihan-abc">
              ${Object.entries(KELOMPOK).map(([k, v], i) => `<button class="kartu abc" data-k="${k}" style="--k:${v.warna}"><span class="huruf-abc">${'ABC'[i]}</span><span class="nama-abc">${v.ikon} ${v.nama}</span></button>`).join('')}
            </div>
          </section>`);
        const tanya = () => ucap(g.tokoh, g.tanya(h));
        $('#btnUlang').addEventListener('click', () => { if (sibuk()) return; Sfx.pilih(); tanya(); });
        $$('.kartu.abc', layar).forEach((b) => b.addEventListener('click', () => {
          if (sibuk()) return;
          if (b.dataset.k === h.kelompok) {
            main.kunci = true;
            Sfx.benar();
            b.classList.add('benar');
            if (!main.salah) { bintang++; terbangkanBintang(b); tambahBintang(); }
            ucap(g.tokoh, g.benar(h), () => { no++; nanti(soal, 450); }, 'senang');
          } else {
            main.salah = true;
            Sfx.salah();
            goyang(b);
            b.classList.add('redup');
            ucap(g.tokoh, g.salah, null, 'lembut');
          }
        }));
        tanya();
      };
      soal();
    });
  }

  // ================= PENGATURAN SUARA (untuk guru / orang tua) =================
  const panelAtur = $('#panelAtur');
  const pilihSuara = $('#pilihSuara');

  function isiPilihanSuara() {
    if (!pilihSuara) return;
    const indo = Suara.semua.filter(apakahIndo).sort((a, b) => nilaiSuara(b) - nilaiSuara(a));
    const opsiRekaman = Suara.adaRekaman ? '<option value="rekaman">Kiku · rekaman bawaan ⭐ (tanpa internet)</option>' : '';
    pilihSuara.innerHTML = opsiRekaman + indo.map((v) => `<option value="${v.voiceURI}">Suara browser: ${namaSuara(v)}</option>`).join('')
      || '<option value="">Belum ada suara Bahasa Indonesia</option>';
    pilihSuara.disabled = !Suara.adaRekaman && !indo.length;
    pilihSuara.value = Suara.pakaiRekaman() ? 'rekaman' : Suara.voice ? Suara.voice.voiceURI : '';
    $('#aturNada').disabled = Suara.pakaiRekaman();
    const adaAlami = indo.some((v) => nilaiSuara(v) >= 4);
    $('#tipsSuara').textContent = Suara.pakaiRekaman()
      ? '✅ Kiku memakai rekaman suara Bahasa Indonesia bawaan, jadi bisa bicara di semua browser, juga tanpa internet. Nada suara hanya bisa diatur untuk suara browser.'
      : !indo.length
        ? '⚠️ Browser ini belum punya suara Bahasa Indonesia, jadi Kiku tidak bisa bicara. Buka website dengan Google Chrome atau Microsoft Edge yang tersambung internet.'
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
    ucap('kiku', 'Cuit, cuit, cuit! Halo teman! Aku Kiku. Ayo kita belajar sambil bermain!', null, 'senang');
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
    layarMulai();
  });

  $('#btnSuara').addEventListener('click', () => {
    Suara.aktif = !Suara.aktif;
    simpan.taruh('tc_suara', Suara.aktif);
    ikonSuara();
    if (Suara.aktif) { Sfx.pilih(); ucap('kiku', 'Suara nyala!'); }
    else { Musik.mati(); if ('speechSynthesis' in window) speechSynthesis.cancel(); }
  });

  // Ketuk Kiku untuk mengulang ucapan terakhir
  $('#maskotBadan').addEventListener('click', () => {
    if (sibuk() || !Suara.terakhir) return;
    Sfx.pilih();
    Suara.bicara(Suara.terakhir.ucap, { tulis: Suara.terakhir.tulis, tokoh: Suara.terakhir.tokoh });
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && 'speechSynthesis' in window) speechSynthesis.cancel();
  });

  Suara.init();
  perbaruiSkor();
  ikonSuara();
  layarMulai();
})();
