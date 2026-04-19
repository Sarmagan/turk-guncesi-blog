/**
 * Türkiye İnteraktif Türkü Haritası — app.js
 */

/* ── 81 PROVINCES ───────────────────────────────────────────────────────────── */
const TURKISH_PROVINCES = new Set([
  "ADANA","ADIYAMAN","AFYONKARAHİSAR","AFYON","AĞRI","AKSARAY","AMASYA","ANKARA",
  "ANTALYA","ARDAHAN","ARTVİN","AYDIN","BALIKESİR","BARTIN","BATMAN","BAYBURT",
  "BİLECİK","BİNGÖL","BİTLİS","BOLU","BURDUR","BURSA","ÇANAKKALE","ÇANKIRI",
  "ÇORUM","DENİZLİ","DİYARBAKIR","DÜZCE","EDİRNE","ELAZIĞ","ERZİNCAN",
  "ERZURUM","ESKİŞEHİR","GAZİANTEP","GİRESUN","GÜMÜŞHANE","HAKKARİ","HATAY","IĞDIR",
  "ISPARTA","İSTANBUL","İZMİR","KAHRAMANMARAŞ","K. MARAŞ","KARABÜK","KARAMAN","KARS",
  "KASTAMONU","KAYSERİ","KIRIKKALE","KIRKLARELİ","KIRŞEHİR","KİLİS","KOCAELİ","KONYA",
  "KÜTAHYA","MALATYA","MANİSA","MARDİN","MERSİN","MUĞLA","MUŞ","NEVŞEHİR","NİĞDE",
  "ORDU","OSMANİYE","RİZE","SAKARYA","SAMSUN","SİİRT","SİNOP","SİVAS","ŞANLIURFA",
  "ŞIRNAK","TEKİRDAĞ","TOKAT","TRABZON","TUNCELİ","UŞAK","VAN","YALOVA","YOZGAT","ZONGULDAK"
]);

/* ── DATA → CANONICAL PROVINCE NAME ────────────────────────────────────────────
   Maps short/alternate yoresi_ili values in the JSONL data to the canonical
   province name used as the key in songsByProvince (Title Case, matching SVG).
   Add new entries here whenever the data uses a non-standard name.
*/
const DATA_TO_PROVINCE = {
  // Afyon variants
  "AFYON"              : "Afyonkarahisar",
  "AFYONKARAHİSAR"     : "Afyonkarahisar",
  "AFYONKARAHISAR"     : "Afyonkarahisar",
  // Muş — data may use ASCII "MUS"
  "MUS"                : "Muş",
  "MUŞ"                : "Muş",
  // Kahramanmaraş variants
  "K. MARAŞ"           : "Kahramanmaraş",
  "K.MARAŞ"            : "Kahramanmaraş",
  "KAHRAMANMARAŞ"      : "Kahramanmaraş",
  "KAHRAMAN MARAŞ"     : "Kahramanmaraş",
  // Other common ASCII/short variants
  "AGRI"               : "Ağrı",
  "AĞRI"               : "Ağrı",
  "IGDIR"              : "Iğdır",
  "IĞDIR"              : "Iğdır",
  "ELAZIG"             : "Elazığ",
  "ELAZIĞ"             : "Elazığ",
  "NEVSEHIR"           : "Nevşehir",
  "NEVŞEHİR"           : "Nevşehir",
  "SANLIURFA"          : "Şanlıurfa",
  "ŞANLIURFA"          : "Şanlıurfa",
  "DIYARBAKIR"         : "Diyarbakır",
  "DİYARBAKIR"         : "Diyarbakır",
  "SIRNAK"             : "Şırnak",
  "ŞIRNAK"             : "Şırnak",
  "USAK"               : "Uşak",
  "UŞAK"               : "Uşak",
  "MUGLA"              : "Muğla",
  "MUĞLA"              : "Muğla",
  "KUTAHYA"            : "Kütahya",
  "KÜTAHYA"            : "Kütahya",
  "ESKISEHIR"          : "Eskişehir",
  "ESKİŞEHİR"          : "Eskişehir",
  "TEKIRDAG"           : "Tekirdağ",
  "TEKİRDAĞ"           : "Tekirdağ",
  "KIRKLARELI"         : "Kırklareli",
  "KIRKLARELİ"         : "Kırklareli",
  "KIRSEHIR"           : "Kırşehir",
  "KIRŞEHİR"           : "Kırşehir",
  "KIRIKKALE"          : "Kırıkkale",
  "KIRIKKALE"          : "Kırıkkale",
  "BALIKESIR"          : "Balıkesir",
  "BALIKESİR"          : "Balıkesir",
  "CANAKKALE"          : "Çanakkale",
  "ÇANAKKALE"          : "Çanakkale",
  "CANKIRI"            : "Çankırı",
  "ÇANKIRI"            : "Çankırı",
  "CORUM"              : "Çorum",
  "ÇORUM"              : "Çorum",
  "AYDIN"              : "Aydın",
  "AYDIN"              : "Aydın",
  "ADIYAMAN"           : "Adıyaman",
  "ADIYAMAN"           : "Adıyaman",
  "GUMUSHANE"          : "Gümüşhane",
  "GÜMÜŞHANE"          : "Gümüşhane",
  "NIGDE"              : "Niğde",
  "NİĞDE"              : "Niğde",
  "BARTIN"             : "Bartın",
  "BARTIN"             : "Bartın",
  "DUZCE"              : "Düzce",
  "DÜZCE"              : "Düzce",
  "BINGOL"             : "Bingöl",
  "BİNGÖL"             : "Bingöl",
  "ISTANBUL"           : "İstanbul",
  "İSTANBUL"           : "İstanbul",
  "IZMIR"              : "İzmir",
  "İZMİR"              : "İzmir",
};

/* ── SVG NAME → PROVINCE KEY ────────────────────────────────────────────────── */
const SVG_TO_PROVINCE = {
  "Sanliurfa":"Şanlıurfa","Diyarbakir":"Diyarbakır","Izmir":"İzmir",
  "Kirsehir":"Kırşehir","Mugla":"Muğla","Kutahya":"Kütahya","Kütahya":"Kütahya",
  "Bingöl":"Bingöl","Düzce":"Düzce","Gümüshane":"Gümüşhane",
  "K. Maras":"Kahramanmaraş","Kinkkale":"Kırıkkale","Zinguldak":"Zonguldak",
  "Çankiri":"Çankırı","Çanakkale":"Çanakkale","Çorum":"Çorum","Bartın":"Bartın",
  "Adiyaman":"Adıyaman","Agri":"Ağrı","Afyonkarahisar":"Afyonkarahisar",
  "Iğdir":"Iğdır","Istanbul":"İstanbul","Elazig":"Elazığ","Nevsehir":"Nevşehir",
  "Eskisehir":"Eskişehir","Usak":"Uşak","Balikesir":"Balıkesir",
  "Tekirdag":"Tekirdağ","Kirklareli":"Kırklareli","Nigde":"Niğde",
  "Aydin":"Aydın","Siirt":"Siirt","Sirnak":"Şırnak","Mus":"Muş",
};

/* ── NAMED EXTRA REGIONS (get their own button, not lumped into Diğer) ────────── */
const NAMED_REGIONS = {
  "RUMELİ"    : "Rumeli",
  "RUMELI"    : "Rumeli",
  "KIRKÜK"    : "Kerkük",
  "KERKÜK"    : "Kerkük",
  "KERKUK"    : "Kerkük",
  "AZERBAYCAN": "Azerbaycan",
  "KIBRIS"    : "Kıbrıs",
  "KIBRIŞ"    : "Kıbrıs",
  "KIBRИС"    : "Kıbrıs",
  "MUSUL"     : "Musul",
  "KIRIM"     : "Kırım",
  "KIRИМ"     : "Kırım",
};

/* ── PROVINCE LABEL COORDINATES (from SVG label_points, viewBox 0 0 1000 422) ── */
const PROVINCE_COORDS = {
  "Adana":[511.6,315.2],"Adiyaman":[654.1,282.2],"Afyonkarahisar":[277.4,233.6],
  "Agri":[869.6,173.1],"Aksaray":[434.1,252.8],"Amasya":[520.5,110.0],
  "Ankara":[374.2,163.1],"Antalya":[260.9,341.5],"Ardahan":[859.9,77.1],
  "Artvin":[807.8,83.6],"Aydin":[157.0,289.6],"Balikesir":[151.2,166.5],
  "Bartın":[369.3,53.1],"Batman":[794.5,257.1],"Bayburt":[736.9,133.7],
  "Bilecik":[254.6,145.8],"Bingöl":[763.2,210.5],"Bitlis":[837.3,242.3],
  "Bolu":[331.9,112.6],"Burdur":[247.3,305.0],"Bursa":[205.6,151.1],
  "Denizli":[216.6,283.6],"Diyarbakir":[737.1,269.4],"Düzce":[311.3,95.8],
  "Edirne":[87.9,81.4],"Elazig":[686.5,236.8],"Erzincan":[675.3,168.3],
  "Erzurum":[799.5,154.0],"Eskisehir":[302.9,174.3],"Gaziantep":[604.7,330.0],
  "Giresun":[656.3,115.1],"Gümüshane":[698.7,135.0],"Hakkari":[925.7,298.3],
  "Hatay":[546.0,370.8],"Isparta":[299.1,277.4],"Istanbul":[176.3,73.8],
  "Izmir":[127.6,259.0],"Iğdir":[915.7,161.9],"K. Maras":[580.1,277.2],
  "Karabük":[378.4,77.9],"Karaman":[398.4,323.7],"Kars":[875.3,126.2],
  "Kastamonu":[421.0,56.5],"Kayseri":[519.8,237.9],"Kilis":[586.2,344.3],
  "Kinkkale":[424.4,166.1],"Kirklareli":[126.1,47.6],"Kirsehir":[448.9,192.6],
  "Kocaeli":[254.3,93.2],"Konya":[368.1,267.4],"Kütahya":[231.8,194.5],
  "Malatya":[630.1,234.9],"Manisa":[175.1,230.6],"Mardin":[770.8,307.9],
  "Mersin":[432.7,353.6],"Mugla":[184.9,328.4],"Mus":[808.6,219.4],
  "Nevsehir":[473.8,226.7],"Nigde":[472.6,272.5],"Ordu":[609.4,101.2],
  "Osmaniye":[550.1,322.8],"Rize":[768.1,92.4],"Sakarya":[274.8,107.5],
  "Samsun":[529.3,74.0],"Sanliurfa":[688.5,321.0],"Siirt":[822.5,277.5],
  "Sinop":[483.6,48.4],"Sirnak":[843.9,306.9],"Sivas":[600.3,177.5],
  "Tekirdag":[115.5,87.1],"Tokat":[568.3,122.1],"Trabzon":[716.4,101.0],
  "Tunceli":[704.7,204.0],"Usak":[223.2,242.7],"Van":[900.1,246.9],
  "Yalova":[215.4,114.7],"Yozgat":[504.6,176.7],"Zinguldak":[343.3,71.5],
  "Çanakkale":[100.3,147.9],"Çankiri":[422.0,108.9],"Çorum":[471.6,120.2],
};

/* ── PROVINCE LABEL DISPLAY NAMES ───────────────────────────────────────────── */
/* ── LABEL FUNCTIONS ────────────────────────────────────────────────────────── */

// The SVG viewBox is 1000×422. At scale=1 the SVG renders at ~960px wide,
// so 1 SVG unit ≈ 0.96 CSS px. We target ~11px rendered text at scale=1,
// which means fontSize = 11 / scale (counter-scaled).
const LABEL_BASE_PX = 11;   // desired rendered size in CSS pixels at scale=1
const SVG_UNIT_PX   = 960 / 1000; // approx CSS-px per SVG viewBox unit at scale=1

function buildProvinceLabels() {
  const svg = mapContainer.querySelector('svg');
  labelGroup = svg.getElementById('province-labels');
  if (!labelGroup) return;

  // Clear any previously built labels
  labelGroup.innerHTML = '';

  const ns = 'http://www.w3.org/2000/svg';

  Object.entries(PROVINCE_COORDS).forEach(([svgName, [cx, cy]]) => {
    // resolveName handles all ASCII/broken SVG names → correct Turkish display name
    const label = resolveName(svgName);

    const text = document.createElementNS(ns, 'text');
    text.setAttribute('x', cx);
    text.setAttribute('y', cy);
    text.setAttribute('data-name', svgName);
    text.textContent = label;

    labelGroup.appendChild(text);
  });

  updateLabelScale();
}

function updateLabelScale() {
  if (!labelGroup) return;
  // Dampen the counter-scale so labels grow with zoom rather than staying
  // pinned to a fixed screen size. At scale=1 they render at LABEL_BASE_PX;
  // at higher zoom they grow proportionally to sqrt(scale), so they're always
  // readable but also visibly larger when the map is zoomed in.
  const dampened    = Math.sqrt(scale);
  const svgFontSize = (LABEL_BASE_PX / SVG_UNIT_PX) / dampened;
  const svgStrokeW  = (2.5 / SVG_UNIT_PX) / dampened;

  labelGroup.querySelectorAll('text').forEach(t => {
    t.setAttribute('font-size', svgFontSize);
    t.setAttribute('stroke-width', svgStrokeW);
  });
}

/* ── STATE ──────────────────────────────────────────────────────────────────── */
let songsByProvince = {};
let allSongs        = [];
let scale = 1, translateX = 0, translateY = 0;
let activePanel  = null;
let drawerOpen   = false;
/* ── Modal navigation context ───────────────────────────────────────────────── */
// Stores the ordered list of song indices shown when a modal is opened from a province/region
let modalSongList = [];   // array of allSongs indices available for prev/next navigation
let labelsVisible     = true;
let choroplethVisible = false;
let currentModalSongIdx = -1;
const MIN_SCALE  = 0.5, MAX_SCALE = 8, ZOOM_STEP = 0.25;

/* ── DOM REFS (set inside DOMContentLoaded) ─────────────────────────────────── */
let mapWrapper, mapContainer, tooltip, scaleBadge,
    selectedInfo, digerBtn, searchInput, searchClear,
    drawerToggle, drawerBackdrop, sidePanel,
    labelToggle, labelGroup, choroplethToggle;

/* ── HELPERS ────────────────────────────────────────────────────────────────── */
function toTitleCase(str) {
  return str.split(' ').map(w =>
    w.charAt(0).toLocaleUpperCase('tr-TR') + w.slice(1).toLocaleLowerCase('tr-TR')
  ).join(' ');
}

function fmt(val) {
  if (!val || val.trim() === '-' || val.trim() === '') return null;
  return val.trim();
}

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

function highlightText(text, query) {
  const escaped = escapeHtml(text);
  const re = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')})`, 'gi');
  return escaped.replace(re, '<span class="search-highlight">$1</span>');
}

/* ── DATA PROCESSING ────────────────────────────────────────────────────────── */
function processData(rawArray) {
  const grouped = {};
  rawArray.forEach(song => {
    const raw  = (song.yoresi_ili || '').trim();
    const norm = raw.toLocaleUpperCase('tr-TR');
    let key;
    if (DATA_TO_PROVINCE[norm]) {
      key = DATA_TO_PROVINCE[norm];
    } else if (NAMED_REGIONS[norm]) {
      key = NAMED_REGIONS[norm];
    } else if (TURKISH_PROVINCES.has(norm)) {
      key = toTitleCase(raw);
    } else {
      key = 'Diğer';
    }
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(song);
  });
  return grouped;
}

/* ── NAME RESOLUTION ────────────────────────────────────────────────────────── */
function resolveName(svgName) {
  if (!svgName) return svgName;
  if (SVG_TO_PROVINCE[svgName]) return SVG_TO_PROVINCE[svgName];
  const lower = svgName.toLowerCase();
  for (const key of Object.keys(songsByProvince)) {
    if (key.toLowerCase() === lower) return key;
  }
  return toTitleCase(svgName);
}

function getSongsFor(svgName) {
  return songsByProvince[resolveName(svgName)] || null;
}

/* ── SONG CARD ──────────────────────────────────────────────────────────────── */
function buildSongCard(song, highlightQuery, highlightScopes, navList = null) {
  const hl = (text, field) => {
    if (!highlightQuery || !text) return escapeHtml(text || '');
    if (highlightScopes && !highlightScopes.includes(field)) return escapeHtml(text);
    return highlightText(text, highlightQuery);
  };

  // Compact card only shows the most scannable fields
  const cardRows = [
    ['Makam',       fmt(song.makamsal_dizi)],
    ['Konu / Tür',  fmt(song.konusu_turu)],
    ['Usul',        fmt(song.usul)],
    ['Kaynak Kişi', fmt(song.kaynak_kisi)?.replace(/\n/g, ', ')],
    ['İcra Eden',   fmt(song.icra_eden)],
  ].filter(([, v]) => v);

  const fieldMap = {
    'Kaynak Kişi': 'kaynak_kisi',
    'İcra Eden':   'icra_eden',
  };

  const metaHTML = cardRows.map(([label, val]) => {
    const field = fieldMap[label];
    const displayVal = (field && highlightQuery && highlightScopes?.includes(field))
      ? highlightText(val, highlightQuery)
      : escapeHtml(val);
    return `<div class="song-meta-row">
       <span class="meta-label">${label}</span>
       <span class="meta-val">${displayVal}</span>
     </div>`;
  }).join('');

  const title = hl(song.song_title, 'song_title');

  // Store song index so the modal can look it up
  const idx = allSongs.indexOf(song);

  // Encode the navList as a JSON attribute so the modal can navigate within the context
  const navAttr = navList ? ` data-nav-list='${JSON.stringify(navList)}'` : '';

  return `<div class="song-card" onclick="openSongModal(${idx}, true, ${navList ? `JSON.parse(this.dataset.navList)` : 'null'})"${navAttr} role="button" tabindex="0" onkeydown="if(event.key==='Enter'||event.key===' ')openSongModal(${idx}, true, ${navList ? `JSON.parse(this.dataset.navList)` : 'null'})">
    <div class="song-card-title">♩ ${title}</div>
    <div class="song-meta">${metaHTML}</div>
    <div class="song-card-cta">Detayları gör ↗</div>
  </div>`;
}

/* ── SONG DETAIL MODAL ───────────────────────────────────────────────────────── */

let modalCloseTimer = null;

function openSongModal(idx, updateUrl = true, navList = null) {
  const song = allSongs[idx];
  if (!song) return;
  currentModalSongIdx = idx;

  // Update navigation list if provided; otherwise keep existing list
  if (navList !== null) modalSongList = navList;

  // Hide share overlay if previously open
  document.getElementById('share-preview-overlay')?.setAttribute('hidden', '');

  const modal     = document.getElementById('song-modal');
  const backdrop  = modal.querySelector('.song-modal-backdrop');

  // ── Header ──
  document.getElementById('modal-title').textContent  = song.song_title || '—';
  const region = fmt(song.yoresi_ili)
    ? toTitleCase(song.yoresi_ili.trim())
    : null;
  const regionEl = document.getElementById('modal-region');
  if (region) {
    regionEl.textContent = '📍 ' + region;
    regionEl.style.display = '';
  } else {
    regionEl.style.display = 'none';
  }

  // ── Musical properties grid ──
  const musicalFields = [
    ['Makam / Dizi',  fmt(song.makamsal_dizi)],
    ['Konu / Tür',    fmt(song.konusu_turu)],
    ['Usul',          fmt(song.usul)],
    ['Karar Sesi',    fmt(song.karar_sesi)],
    ['Bitiş Sesi',    fmt(song.bitis_sesi)],
    ['İlçe / Köy',    fmt(song.ilcesi_koyu)],
  ].filter(([, v]) => v);

  const musicalGrid = document.getElementById('modal-grid-musical');
  musicalGrid.innerHTML = musicalFields.map(([l, v]) =>
    `<div class="modal-cell">
      <span class="modal-cell-label">${l}</span>
      <span class="modal-cell-value">${escapeHtml(v)}</span>
    </div>`
  ).join('');
  document.getElementById('modal-section-musical').style.display =
    musicalFields.length ? '' : 'none';

  // ── Range / pitch section ──
  const enPes  = fmt(song.en_pes_ses);
  const enTiz  = fmt(song.en_tiz_ses);
  const sesGen = fmt(song.ses_genisligi);
  const rangeRow = document.getElementById('modal-range-row');
  const rangeSection = document.getElementById('modal-section-range');
  if (enPes || enTiz || sesGen) {
    rangeRow.innerHTML = `
      ${enPes ? `<div class="modal-range-note">
        <span class="modal-range-note-name">${escapeHtml(enPes)}</span>
        <span class="modal-range-note-label">En Pes</span>
      </div>` : ''}
      ${(enPes || enTiz) ? `<div class="modal-range-bar-wrap">
        <div class="modal-range-bar-track"><div class="modal-range-bar-fill"></div></div>
        ${sesGen ? `<div class="modal-range-width">${escapeHtml(sesGen)}</div>` : ''}
      </div>` : ''}
      ${enTiz ? `<div class="modal-range-note">
        <span class="modal-range-note-name">${escapeHtml(enTiz)}</span>
        <span class="modal-range-note-label">En Tiz</span>
      </div>` : ''}
      ${fmt(song.karar_sesi) ? `<div class="modal-range-karar">
        <span class="modal-range-karar-name">${escapeHtml(song.karar_sesi)}</span>
        <span class="modal-range-karar-label">Karar</span>
      </div>` : ''}
    `;
    rangeSection.style.display = '';
  } else {
    rangeSection.style.display = 'none';
  }

  // ── People grid ──
  const peopleFields = [
    ['Kaynak Kişi',  fmt(song.kaynak_kisi)?.replace(/\n/g, ', ')],
    ['Derleyen',     fmt(song.derleyen)],
    ['Notaya Alan',  fmt(song.notaya_alan)?.replace(/\n/g, ', ')],
    ['İcra Eden',    fmt(song.icra_eden)],
  ].filter(([, v]) => v);

  const peopleGrid = document.getElementById('modal-grid-people');
  peopleGrid.innerHTML = peopleFields.map(([l, v]) =>
    `<div class="modal-cell">
      <span class="modal-cell-label">${l}</span>
      <span class="modal-cell-value">${escapeHtml(v)}</span>
    </div>`
  ).join('');
  document.getElementById('modal-section-people').style.display =
    peopleFields.length ? '' : 'none';

  // ── Lyrics ──
  const lyricsSection = document.getElementById('modal-section-lyrics');
  const lyricsEl = document.getElementById('modal-lyrics');
  if (fmt(song.lyrics)) {
    lyricsEl.textContent = song.lyrics;
    lyricsSection.style.display = '';
  } else {
    lyricsSection.style.display = 'none';
  }

  // ── Footer ──
  const repEl = document.getElementById('modal-rep-no');
  repEl.textContent = fmt(song.repertuar_no) ? `Repertuar No: ${song.repertuar_no}` : '';

  const linkEl = document.getElementById('modal-source-link');
  // Only accept http(s) URLs; data/javascript/file/etc. are rejected to
  // prevent a malicious source_url from executing code when the link is clicked.
  const rawUrl = fmt(song.source_url);
  const safeUrl = (rawUrl && rawUrl !== '#' && /^https?:\/\//i.test(rawUrl)) ? rawUrl : '';
  if (safeUrl) {
    linkEl.href = safeUrl;
    linkEl.classList.remove('hidden');
  } else {
    linkEl.removeAttribute('href');
    linkEl.classList.add('hidden');
  }

  // ── Show ──
  modal.removeAttribute('hidden');
  modal.classList.remove('closing');
  document.body.style.overflow = 'hidden';

  // Scroll body back to top
  const body = modal.querySelector('.song-modal-body');
  if (body) body.scrollTop = 0;

  // ── Prev / Next navigation ──
  const navPos = modalSongList.indexOf(idx);
  const hasPrev = navPos > 0;
  const hasNext = navPos >= 0 && navPos < modalSongList.length - 1;

  const prevBtn = document.getElementById('modal-prev');
  const nextBtn = document.getElementById('modal-next');
  const counterEl = document.getElementById('modal-nav-counter');

  if (prevBtn) prevBtn.classList.toggle('hidden', !hasPrev);
  if (nextBtn) nextBtn.classList.toggle('hidden', !hasNext);
  if (counterEl) {
    if (modalSongList.length > 1 && navPos >= 0) {
      counterEl.textContent = `${navPos + 1} / ${modalSongList.length}`;
      counterEl.style.display = '';
    } else {
      counterEl.style.display = 'none';
    }
  }

  // Update URL hash
  if (updateUrl) {
    const rep = fmt(song.repertuar_no);
    setHash(rep ? `song-${rep}` : `song-idx-${idx}`);
  }
}

function closeSongModal(updateUrl = true) {
  const modal = document.getElementById('song-modal');
  if (!modal || modal.hidden) return;
  modal.classList.add('closing');
  clearTimeout(modalCloseTimer);
  modalCloseTimer = setTimeout(() => {
    modal.setAttribute('hidden', '');
    modal.classList.remove('closing');
    document.body.style.overflow = '';
    // Restore province hash if one is active, else clear
    if (updateUrl) {
      if (activePanel) {
        setHash(slugify(resolveName(activePanel.getAttribute('name'))));
      } else {
        setHash('');
      }
    }
  }, 200);
}

/* ── SIDE PANEL ─────────────────────────────────────────────────────────────── */
function updateSidePanel(displayName, songs) {
  const count = songs ? songs.length : 0;
  // Build ordered list of allSongs indices for this panel's songs (use cached _idx).
  const navList = songs ? songs.map(s => (s._idx != null ? s._idx : allSongs.indexOf(s))).filter(i => i >= 0) : [];
  const visible = songs ? songs.slice(0, SEARCH_RENDER_LIMIT) : [];
  const truncated = count > visible.length;

  let html = `<div class="panel-province-header">
    <h3>${escapeHtml(displayName)}</h3>
    <div class="panel-header-row">
      <span class="panel-count">${count} türkü${truncated ? ` <span class="search-truncated-note">(ilk ${visible.length} gösteriliyor)</span>` : ''}</span>
      ${count > 1 ? `<button class="btn-random-province" onclick="showRandomSongFromList(${JSON.stringify(navList).replace(/"/g, '&quot;')})" title="${escapeHtml(displayName)} içinden rastgele türkü">🎲 Rastgele</button>` : ''}
    </div>
  </div>`;
  html += count > 0
    ? visible.map(s => buildSongCard(s, null, null, navList)).join('')
    : '<p class="empty-msg">Bu ile ait türkü bulunamadı.</p>';
  selectedInfo.innerHTML = html;
  selectedInfo.scrollTop = 0;
  const lbl = document.getElementById('drawer-toggle-label');
  if (lbl) lbl.textContent = count > 0 ? `♩ ${displayName} (${count})` : `♩ ${displayName}`;
}

function resetSearchAndFilters() {
  if (searchInput) { searchInput.value = ''; searchClear?.classList.remove('visible'); }
  activeFilters.makam = ''; activeFilters.konu = ''; activeFilters.usul = '';
  ['filter-makam','filter-konu','filter-usul'].forEach(id => { const el = document.getElementById(id); if (el) el.value = ''; });
  updateFilterDot();
}

function showDigerPanel() {
  const songs = songsByProvince['Diğer'] || [];
  const navList = songs.map(s => (s._idx != null ? s._idx : allSongs.indexOf(s))).filter(i => i >= 0);
  const visible = songs.slice(0, SEARCH_RENDER_LIMIT);
  const truncated = songs.length > visible.length;
  if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
  resetSearchAndFilters();
  digerBtn.classList.add('active');
  let html = `<div class="panel-province-header">
    <h3>Diğer Yöreler</h3>
    <div class="panel-header-row">
      <span class="panel-count">${songs.length} türkü${truncated ? ` <span class="search-truncated-note">(ilk ${visible.length} gösteriliyor)</span>` : ''}</span>
      ${songs.length > 1 ? `<button class="btn-random-province" onclick="showRandomSongFromList(${JSON.stringify(navList).replace(/"/g, '&quot;')})" title="Diğer yörelerden rastgele türkü">🎲 Rastgele</button>` : ''}
    </div>
  </div>
  <p class="diger-note">Diğer yöreler veya yöresi net bilinmeyen türküler</p>`;
  html += songs.length > 0
    ? visible.map(s => buildSongCard(s, null, null, navList)).join('')
    : '<p class="empty-msg">Henüz türkü eklenmedi.</p>';
  selectedInfo.innerHTML = html;
  selectedInfo.scrollTop = 0;
  if (window.innerWidth <= 700) openDrawer();
}

function showRegionPanel(regionName) {
  const songs = songsByProvince[regionName] || [];
  const navList = songs.map(s => (s._idx != null ? s._idx : allSongs.indexOf(s))).filter(i => i >= 0);
  const visible = songs.slice(0, SEARCH_RENDER_LIMIT);
  const truncated = songs.length > visible.length;
  if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
  resetSearchAndFilters();
  digerBtn.classList.remove('active');
  // Deactivate other region buttons, activate this one
  document.querySelectorAll('.btn-region').forEach(b => b.classList.remove('active'));
  const thisBtn = document.querySelector(`[data-region="${regionName}"]`);
  if (thisBtn) thisBtn.classList.add('active');

  let html = `<div class="panel-province-header">
    <h3>${escapeHtml(regionName)}</h3>
    <div class="panel-header-row">
      <span class="panel-count">${songs.length} türkü${truncated ? ` <span class="search-truncated-note">(ilk ${visible.length} gösteriliyor)</span>` : ''}</span>
      ${songs.length > 1 ? `<button class="btn-random-province" onclick="showRandomSongFromList(${JSON.stringify(navList).replace(/"/g, '&quot;')})" title="${escapeHtml(regionName)} içinden rastgele türkü">🎲 Rastgele</button>` : ''}
    </div>
  </div>`;
  html += songs.length > 0
    ? visible.map(s => buildSongCard(s, null, null, navList)).join('')
    : '<p class="empty-msg">Henüz türkü eklenmedi.</p>';
  selectedInfo.innerHTML = html;
  selectedInfo.scrollTop = 0;
  if (window.innerWidth <= 700) openDrawer();
}

/* ── SEARCH ─────────────────────────────────────────────────────────────────── */

// Active filter state
const activeFilters = { makam: '', konu: '', usul: '' };

// Maximum number of cards rendered in one go to keep the UI responsive.
// Thousands of matches for short queries would otherwise freeze the page.
const SEARCH_RENDER_LIMIT = 300;
// Minimum query length before we run a full text search. Single-character
// queries typically match almost every song and render thousands of cards.
const SEARCH_MIN_LENGTH = 2;

function getSearchScopes() {
  return Array.from(document.querySelectorAll('#search-scope input[name="scope"]:checked'))
    .map(el => el.value);
}

function announceResults(text) {
  const el = document.getElementById('search-status');
  if (el) el.textContent = text;
}

function getResultsSort() {
  const el = document.getElementById('results-sort');
  return el ? el.value : 'default';
}

function sortResults(results) {
  const mode = getResultsSort();
  if (mode === 'default' || !mode) return results;
  const coll = new Intl.Collator('tr', { sensitivity: 'base' });
  const key = (s, field) => (s[field] || '').trim();
  const copy = results.slice();
  if (mode === 'title')    copy.sort((a, b) => coll.compare(key(a, 'song_title'),   key(b, 'song_title')));
  if (mode === 'province') copy.sort((a, b) => coll.compare(key(a, 'yoresi_ili'),   key(b, 'yoresi_ili')));
  if (mode === 'usul')     copy.sort((a, b) => coll.compare(key(a, 'usul'),         key(b, 'usul')));
  return copy;
}

function matchesSearch(song, q, scopes) {
  if (!q) return true;
  return scopes.some(field => {
    const val = (song[field] || '').toLocaleLowerCase('tr-TR');
    return val.includes(q);
  });
}

function matchesFilters(song) {
  if (activeFilters.makam && (song.makamsal_dizi || '').trim() !== activeFilters.makam) return false;
  if (activeFilters.konu  && (song.konusu_turu  || '').trim() !== activeFilters.konu)  return false;
  if (activeFilters.usul  && (song.usul         || '').trim() !== activeFilters.usul)  return false;
  return true;
}

function hasActiveFilters() {
  return activeFilters.makam || activeFilters.konu || activeFilters.usul;
}

function runSearch(query) {
  if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
  digerBtn.classList.remove('active');
  const q = query.toLocaleLowerCase('tr-TR');
  const scopes = getSearchScopes();
  const results = sortResults(
    allSongs.filter(s => matchesSearch(s, q, scopes) && matchesFilters(s))
  );

  // Compute navList once (not per-card); rely on cached _idx to avoid O(n²) indexOf.
  const navList = results.map(r => (r._idx != null ? r._idx : allSongs.indexOf(r)))
    .filter(i => i >= 0);
  const visible = results.slice(0, SEARCH_RENDER_LIMIT);
  const truncated = results.length > visible.length;

  const filterTags = buildFilterTags();
  let html = `<div class="search-results-header">`;
  if (query) html += `"<strong>${escapeHtml(query)}</strong>" `;
  html += `— <strong>${results.length}</strong> sonuç`;
  if (truncated) html += ` <span class="search-truncated-note">(ilk ${visible.length} gösteriliyor)</span>`;
  if (filterTags) html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">${filterTags}</div>`;
  html += `</div>`;

  // Highlight only when the field being highlighted is in scopes
  html += results.length > 0
    ? visible.map(s => buildSongCard(s, query, scopes, navList)).join('')
    : '<p class="empty-msg">Sonuç bulunamadı.</p>';
  selectedInfo.innerHTML = html;
  selectedInfo.scrollTop = 0;
  announceResults(
    results.length === 0
      ? 'Sonuç bulunamadı.'
      : `${results.length} sonuç bulundu${truncated ? `, ilk ${visible.length} gösteriliyor` : ''}.`
  );
}

function runFilterOnly() {
  if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
  digerBtn.classList.remove('active');
  const results = sortResults(allSongs.filter(s => matchesFilters(s)));
  const navList = results.map(r => (r._idx != null ? r._idx : allSongs.indexOf(r)))
    .filter(i => i >= 0);
  const visible = results.slice(0, SEARCH_RENDER_LIMIT);
  const truncated = results.length > visible.length;

  const filterTags = buildFilterTags();
  let html = `<div class="search-results-header">Filtre sonuçları — <strong>${results.length}</strong> türkü`;
  if (truncated) html += ` <span class="search-truncated-note">(ilk ${visible.length} gösteriliyor)</span>`;
  if (filterTags) html += `<div style="display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;">${filterTags}</div>`;
  html += `</div>`;
  html += results.length > 0
    ? visible.map(s => buildSongCard(s, null, null, navList)).join('')
    : '<p class="empty-msg">Sonuç bulunamadı.</p>';
  selectedInfo.innerHTML = html;
  selectedInfo.scrollTop = 0;
  announceResults(
    results.length === 0
      ? 'Sonuç bulunamadı.'
      : `Filtre sonucu: ${results.length} türkü${truncated ? `, ilk ${visible.length} gösteriliyor` : ''}.`
  );
}

function buildFilterTags() {
  const tags = [];
  if (activeFilters.makam) tags.push(`<span class="filter-tag">Makam: ${escapeHtml(activeFilters.makam)}</span>`);
  if (activeFilters.konu)  tags.push(`<span class="filter-tag">Konu: ${escapeHtml(activeFilters.konu)}</span>`);
  if (activeFilters.usul)  tags.push(`<span class="filter-tag">Usul: ${escapeHtml(activeFilters.usul)}</span>`);
  return tags.join('');
}

function updateFilterDot() {
  const dot = document.getElementById('filter-active-dot');
  if (dot) dot.classList.toggle('hidden', !hasActiveFilters());
}

function populateFilterDropdowns() {
  const makamSet = new Set(), konuSet = new Set(), usulSet = new Set();
  allSongs.forEach(s => {
    if (fmt(s.makamsal_dizi)) makamSet.add(s.makamsal_dizi.trim());
    if (fmt(s.konusu_turu))  konuSet.add(s.konusu_turu.trim());
    if (fmt(s.usul))         usulSet.add(s.usul.trim());
  });
  fillSelect('filter-makam', [...makamSet].sort((a, b) => a.localeCompare(b, 'tr')));
  fillSelect('filter-konu',  [...konuSet].sort((a, b) => a.localeCompare(b, 'tr')));
  fillSelect('filter-usul',  [...usulSet].sort((a, b) => a.localeCompare(b, 'tr')));
}

function fillSelect(id, values) {
  const sel = document.getElementById(id);
  if (!sel) return;
  values.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v;
    opt.textContent = v;
    sel.appendChild(opt);
  });
}

function clearSearch() {
  if (hasActiveFilters()) {
    runFilterOnly();
  } else {
    selectedInfo.innerHTML = '<p class="empty-msg">Bir ilin üzerine gelin ve tıklayın…</p>';
  }
}

/* ── RANDOM TÜRKÜ ────────────────────────────────────────────────────────────── */
function showRandomSong() {
  if (allSongs.length === 0) return;
  const song = allSongs[Math.floor(Math.random() * allSongs.length)];
  if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
  digerBtn.classList.remove('active');
  resetSearchAndFilters();
  // Highlight city on map
  const svg = mapContainer.querySelector('svg');
  if (svg) {
    const songCity = toTitleCase((song.yoresi_ili || '').trim());
    svg.querySelectorAll('path[name]').forEach(path => {
      if (resolveName(path.getAttribute('name')) === songCity) {
        activePanel = path;
        path.classList.add('active-province');
      }
    });
  }
  const cityDisplay = toTitleCase((song.yoresi_ili || '').trim());
  selectedInfo.innerHTML = `<div class="random-banner">🎲 Rastgele seçildi — <strong>${escapeHtml(cityDisplay)}</strong></div>
    ${buildSongCard(song)}`;
  selectedInfo.scrollTop = 0;
  if (window.innerWidth <= 700) openDrawer();
}

/* Picks a random song from a specific navList (array of allSongs indices) and
   opens it in the modal with full prev/next context for that list. */
function showRandomSongFromList(navList) {
  if (!navList || navList.length === 0) return;
  const randomIdx = navList[Math.floor(Math.random() * navList.length)];
  openSongModal(randomIdx, true, navList);
}

/* ── GÜNÜN TÜRKÜSÜ ───────────────────────────────────────────────────────────
   Deterministically picks one song per calendar day by hashing today's date
   string into a stable index. Same date always shows the same song.
   ─────────────────────────────────────────────────────────────────────────── */
function getDailyIndex(total) {
  const now  = new Date();
  // Zero-padded date string, e.g. "20250321" — changes once per day
  const dateStr = `${now.getFullYear()}${String(now.getMonth()+1).padStart(2,'0')}${String(now.getDate()).padStart(2,'0')}`;
  // Simple but stable hash: sum of (charCode * position)
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) >>> 0; // keep it 32-bit unsigned
  }
  return hash % total;
}

function renderTotd() {
  const container = document.getElementById('totd-container');
  if (!container || allSongs.length === 0) return;

  const idx  = getDailyIndex(allSongs.length);
  const song = allSongs[idx];
  if (!song) return;

  const region   = fmt(song.yoresi_ili) ? toTitleCase(song.yoresi_ili.trim()) : null;
  const makam    = fmt(song.makamsal_dizi);
  const konu     = fmt(song.konusu_turu);

  const metaParts = [region, makam, konu].filter(Boolean);

  container.innerHTML = `
    <div class="totd-card" id="totd-card" role="button" tabindex="0"
         title="Günün türküsünü aç"
         onclick="openSongModal(${idx})"
         onkeydown="if(event.key==='Enter'||event.key===' ')openSongModal(${idx})">
      <div class="totd-label">
        <span class="totd-star">☀</span>
        <span>Günün Türküsü</span>
      </div>
      <div class="totd-title">♩ ${escapeHtml(song.song_title || '—')}</div>
      ${metaParts.length ? `<div class="totd-meta">${metaParts.map(p => `<span>${escapeHtml(p)}</span>`).join('<span class="totd-sep">·</span>')}</div>` : ''}
      <div class="totd-cta">Detayları gör ↗</div>
    </div>
  `;
}

/* ── TOOLTIP ────────────────────────────────────────────────────────────────── */
function showTooltip(svgName, cx, cy) {
  const displayName = resolveName(svgName);
  const songs       = getSongsFor(svgName);
  const count       = songs ? songs.length : 0;
  const hasData     = count > 0;
  tooltip.className = 'visible' + (hasData ? ' has-data-tt' : '');
  tooltip.innerHTML = `<div class="tt-header">
    <span class="tt-city">${escapeHtml(displayName)}</span>
    <span class="tt-count ${hasData ? '' : 'tt-count-empty'}">${hasData ? count + ' türkü' : 'türkü yok'}</span>
  </div>
  ${hasData
    ? `<ul class="tt-list">${songs.slice(0,4).map(s=>`<li>${escapeHtml(s.song_title)}</li>`).join('')}
       ${count > 4 ? `<li class="tt-more">+${count-4} daha…</li>` : ''}</ul>`
    : '<p class="no-data">Henüz türkü eklenmedi.</p>'}`;
  positionTooltip(cx, cy);
}

function positionTooltip(cx, cy) {
  const tw = tooltip.offsetWidth || 240, th = tooltip.offsetHeight || 100;
  const OFFSET = 16;
  let left = cx + OFFSET, top = cy + OFFSET;
  if (left + tw > window.innerWidth  - 8) left = cx - tw - OFFSET;
  if (top  + th > window.innerHeight - 8) top  = cy - th - OFFSET;
  tooltip.style.left = `${left}px`;
  tooltip.style.top  = `${top}px`;
}

function hideTooltip() { tooltip.className = ''; }

/* ── TRANSFORM ──────────────────────────────────────────────────────────────── */
function applyTransform() {
  mapContainer.style.transition = 'none';
  mapContainer.style.transform  = `translate(${translateX}px,${translateY}px) scale(${scale})`;
  scaleBadge.textContent = `${Math.round(scale * 100)}%`;
  updateLabelScale();
}

function zoomAt(cx, cy, ns) {
  ns = Math.max(MIN_SCALE, Math.min(MAX_SCALE, ns));
  translateX = cx - (cx - translateX) * (ns / scale);
  translateY = cy - (cy - translateY) * (ns / scale);
  scale = ns;
  applyTransform();
}

/* ── PAN STATE ──────────────────────────────────────────────────────────────── */
let isDragging = false, dragStartX = 0, dragStartY = 0, dragOriginX = 0, dragOriginY = 0;

/* ── KEYBOARD NAV STATE ─────────────────────────────────────────────────────── */
let provincePaths = [];   // ordered list of all path elements
let kbIndex       = -1;   // currently keyboard-focused province index

window.addEventListener('mousemove', e => {
  if (!isDragging) return;
  translateX = dragOriginX + (e.clientX - dragStartX);
  translateY = dragOriginY + (e.clientY - dragStartY);
  applyTransform();
});
window.addEventListener('mouseup', () => {
  isDragging = false;
  if (mapContainer) mapContainer.classList.remove('dragging');
});

/* ── DRAWER ─────────────────────────────────────────────────────────────────── */
function openDrawer() {
  drawerOpen = true;
  hideTooltip();
  sidePanel.classList.add('drawer-open');
  drawerBackdrop.classList.add('visible');
  drawerToggle.classList.add('hidden');
}

function closeDrawer() {
  drawerOpen = false;
  sidePanel.classList.remove('drawer-open');
  drawerBackdrop.classList.remove('visible');
  drawerToggle.classList.remove('hidden');
}

/* ── KEYBOARD NEIGHBOR FINDING ──────────────────────────────────────────────── */
function findNeighbor(fromIndex, arrowKey) {
  // If no current province, start from westernmost
  if (fromIndex < 0) {
    let best = 0, bestX = Infinity;
    provincePaths.forEach((p, i) => {
      const c = PROVINCE_COORDS[p.getAttribute('name')];
      if (c && c[0] < bestX) { bestX = c[0]; best = i; }
    });
    return best;
  }

  const fromName = provincePaths[fromIndex].getAttribute('name');
  const from = PROVINCE_COORDS[fromName];
  if (!from) return fromIndex;

  const [fx, fy] = from;

  const dirs = {
    'ArrowRight': [ 1,  0],
    'ArrowLeft':  [-1,  0],
    'ArrowUp':    [ 0, -1],
    'ArrowDown':  [ 0,  1],
  };
  const [dx, dy] = dirs[arrowKey];

  // Collect all candidates that are in the right half-plane
  const candidates = [];
  provincePaths.forEach((p, i) => {
    if (i === fromIndex) return;
    const name = p.getAttribute('name');
    const c = PROVINCE_COORDS[name];
    if (!c) return;
    const relX = c[0] - fx;
    const relY = c[1] - fy;
    const dot  = relX * dx + relY * dy;
    if (dot <= 0) return;           // wrong direction
    const dist     = Math.sqrt(relX * relX + relY * relY);
    const cosAngle = dot / dist;    // 1 = perfectly aligned, 0 = perpendicular
    candidates.push({ i, dist, cosAngle });
  });

  if (!candidates.length) return fromIndex;

  // Sort by distance ascending, take only the closest ~8 to limit search space
  candidates.sort((a, b) => a.dist - b.dist);
  const pool = candidates.slice(0, 8);

  // Among the pool, pick the one with the best alignment (highest cosAngle)
  // but heavily penalise those with poor alignment (< 0.5 = >60° off-axis)
  let bestIndex = -1;
  let bestScore = Infinity;
  pool.forEach(({ i, dist, cosAngle }) => {
    // Reject candidates more than 70° off the target direction
    if (cosAngle < 0.34) return;
    // Score = dist * (2 - cosAngle)²  → nearby + aligned wins
    const score = dist * Math.pow(2 - cosAngle, 2);
    if (score < bestScore) { bestScore = score; bestIndex = i; }
  });

  // Fallback: if angle filter eliminated everyone, just take closest in pool
  if (bestIndex === -1) bestIndex = pool[0].i;

  return bestIndex;
}

/* ── CHOROPLETH TIER ────────────────────────────────────────────────────────── */
// Maps a song count to a tier 1-5 for CSS fill colouring.
// Thresholds: 1-4 | 5-14 | 15-29 | 30-99 | 100+
function songCountToTier(n) {
  if (n >= 100) return 5;
  if (n >= 30)  return 4;
  if (n >= 15)  return 3;
  if (n >= 5)   return 2;
  return 1;
}

/* ── PROVINCE WIRING ────────────────────────────────────────────────────────── */
function wireProvinces() {
  const svg = mapContainer.querySelector('svg');
  if (!svg) return;
  provincePaths = Array.from(svg.querySelectorAll('path[name]'));

  provincePaths.forEach((path, idx) => {
    const svgName = path.getAttribute('name');
    const count   = getSongsFor(svgName)?.length ?? 0;
    if (count > 0) {
      path.classList.add('has-data');           // keep for tooltip / JS checks
      path.setAttribute('data-tier', songCountToTier(count));
    }

    // Make focusable for keyboard nav
    path.setAttribute('tabindex', '-1');

    path.addEventListener('mouseover', e => {
      if (window.innerWidth <= 700) return;
      e.stopPropagation();
      showTooltip(svgName, e.clientX, e.clientY);
    });
    path.addEventListener('mousemove', e => {
      if (window.innerWidth <= 700) return;
      positionTooltip(e.clientX, e.clientY);
    });
    path.addEventListener('mouseout', () => {
      hideTooltip();
    });
    path.addEventListener('click', e => {
      e.stopPropagation();
      selectProvince(path, svgName);
      kbIndex = idx;
    });
    path.addEventListener('focus', () => {
      kbIndex = idx;
    });
  });
}

/* ── URL HASH / DEEP LINKING ─────────────────────────────────────────────────
   Supported formats:
     #konya              → select province (ASCII-normalised, case-insensitive)
     #song-1234          → open song modal by repertuar_no
     #song-idx-42        → open song modal by allSongs index (fallback)
   ─────────────────────────────────────────────────────────────────────────── */

function slugify(str) {
  return str
    .toLocaleLowerCase('tr-TR')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')   // strip diacritics
    .replace(/ı/g, 'i').replace(/ğ/g, 'g')
    .replace(/ş/g, 's').replace(/ç/g, 'c')
    .replace(/ö/g, 'o').replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function setHash(hash) {
  // replaceState so we don't flood the browser history
  history.replaceState(null, '', hash ? '#' + hash : location.pathname + location.search);
}

function resolveHashToProvincePath(slug) {
  // Try to find a province path whose slugified name matches
  const svg = mapContainer?.querySelector('svg');
  if (!svg) return null;
  for (const path of svg.querySelectorAll('path[name]')) {
    const resolved = resolveName(path.getAttribute('name'));
    if (slugify(resolved) === slug) return path;
  }
  return null;
}

function resolveHashToSongIndex(hash) {
  // #song-<repertuar_no>  or  #song-idx-<n>
  const idxMatch = hash.match(/^song-idx-(\d+)$/);
  if (idxMatch) {
    const n = parseInt(idxMatch[1], 10);
    return n >= 0 && n < allSongs.length ? n : -1;
  }
  const repMatch = hash.match(/^song-(.+)$/);
  if (repMatch) {
    const rep = repMatch[1];
    return allSongs.findIndex(s => String(s.repertuar_no) === rep);
  }
  return -1;
}

function applyHash(hash, pushHistory) {
  if (!hash) return false;
  hash = hash.replace(/^#/, '');

  if (hash.startsWith('song-')) {
    const idx = resolveHashToSongIndex(hash);
    if (idx >= 0) { openSongModal(idx, false); return true; }
    return false;
  }

  // Province
  const path = resolveHashToProvincePath(hash);
  if (path) {
    selectProvince(path, path.getAttribute('name'), false);
    return true;
  }
  return false;
}

/* ── SELECT PROVINCE (shared by click + keyboard Enter) ─────────────────────── */
function selectProvince(path, svgName, updateUrl = true) {
  // Clear classes and blur all paths reliably
  provincePaths.forEach(p => {
    p.classList.remove('active-province', 'kb-focus');
    p.blur(); 
  });

  activePanel = path;
  path.classList.add('active-province');
  
  // Force the browser to shift focus to the new element
  path.focus({ preventScroll: true });

  digerBtn.classList.remove('active');
  document.querySelectorAll('.btn-region').forEach(b => b.classList.remove('active'));
  resetSearchAndFilters();
  const songs = getSongsFor(svgName);
  updateSidePanel(resolveName(svgName), songs);
  if (window.innerWidth <= 700) openDrawer();

  if (updateUrl) setHash(slugify(resolveName(svgName)));
}

/* ── SHARE CARD GENERATOR ────────────────────────────────────────────────────
   On mobile (Web Share API available): draws card then immediately fires
   the OS share sheet — user picks Instagram, WhatsApp, Twitter, etc.
   On desktop: shows an inline preview with a prominent download button.
   ─────────────────────────────────────────────────────────────────────────── */

async function triggerNativeShare() {
  const canvas = document.getElementById('share-canvas');
  const song   = allSongs[currentModalSongIdx];
  try {
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    const file = new File([blob], 'turku.png', { type: 'image/png' });
    const shareData = { files: [file], title: song?.song_title || 'Türkü' };
    if (navigator.canShare && navigator.canShare(shareData)) {
      await navigator.share(shareData);
      return true;
    }
  } catch (e) {
    if (e.name !== 'AbortError') console.warn('Share failed:', e);
  }
  return false;
}

function generateShareCard(song) {
  const canvas  = document.getElementById('share-canvas');
  const overlay = document.getElementById('share-preview-overlay');

  const W = 1080, H = 1080;
  canvas.width  = W;
  canvas.height = H;
  const ctx = canvas.getContext('2d');

  // ── Palette (always dark, looks great on social) ──
  const C = {
    bg:        '#0f1829',
    panel:     '#16213e',
    surface:   '#0f3460',
    accent:    '#e94560',
    highlight: '#f5a623',
    textPri:   '#f0f0f0',
    textSec:   '#a8b2c1',
    border:    '#1a2d50',
  };

  // ── Background gradient ──
  const bgGrad = ctx.createRadialGradient(W/2, H*0.55, 0, W/2, H*0.55, W*0.72);
  bgGrad.addColorStop(0,   '#0d2137');
  bgGrad.addColorStop(1,   '#060d18');
  ctx.fillStyle = bgGrad;
  ctx.fillRect(0, 0, W, H);

  // ── Subtle dot-grid texture ──
  ctx.fillStyle = 'rgba(255,255,255,0.022)';
  const GRID = 36;
  for (let x = GRID; x < W; x += GRID) {
    for (let y = GRID; y < H; y += GRID) {
      ctx.beginPath();
      ctx.arc(x, y, 1.4, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // ── Ornamental corner brackets ──
  const drawBracket = (ox, oy, flipX, flipY) => {
    const L = 72, T = 4, M = 22;
    ctx.save();
    ctx.translate(ox, oy);
    ctx.scale(flipX ? -1 : 1, flipY ? -1 : 1);
    ctx.strokeStyle = C.highlight;
    ctx.lineWidth   = T;
    ctx.lineCap     = 'square';
    ctx.globalAlpha = 0.55;
    ctx.beginPath(); ctx.moveTo(M, 0); ctx.lineTo(0, 0); ctx.lineTo(0, M); ctx.stroke();
    ctx.globalAlpha = 0.25;
    ctx.beginPath(); ctx.moveTo(L, 0); ctx.lineTo(0, 0); ctx.lineTo(0, L); ctx.stroke();
    ctx.restore();
  };
  const PAD = 48;
  drawBracket(PAD, PAD,       false, false);
  drawBracket(W-PAD, PAD,     true,  false);
  drawBracket(PAD, H-PAD,     false, true);
  drawBracket(W-PAD, H-PAD,   true,  true);

  // ── Giant faint ♩ watermark ──
  ctx.save();
  ctx.font         = 'bold 520px serif';
  ctx.fillStyle    = 'rgba(245,166,35,0.045)';
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('♩', W/2 + 30, H/2 + 60);
  ctx.restore();

  // ── Thin full-width accent rule at top ──
  const topRule = ctx.createLinearGradient(0, 0, W, 0);
  topRule.addColorStop(0,    'transparent');
  topRule.addColorStop(0.2,  C.accent);
  topRule.addColorStop(0.8,  C.highlight);
  topRule.addColorStop(1,    'transparent');
  ctx.fillStyle   = topRule;
  ctx.fillRect(0, 0, W, 5);

  // ── Province badge ──
  const region = fmt(song.yoresi_ili) ? toTitleCase(song.yoresi_ili.trim()) : null;
  if (region) {
    const BADGE_Y = 148, BADGE_X = W / 2;
    ctx.font         = 'bold 26px "Lato", sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const badgeText  = ('📍 ' + region).toLocaleUpperCase('tr-TR');
    const badgeW     = ctx.measureText(badgeText).width + 48;
    const badgeH     = 46;
    const bx = BADGE_X - badgeW / 2;
    const by = BADGE_Y - badgeH / 2;

    ctx.beginPath();
    ctx.roundRect(bx, by, badgeW, badgeH, badgeH / 2);
    ctx.fillStyle = C.surface;
    ctx.fill();
    ctx.strokeStyle = C.highlight;
    ctx.lineWidth   = 1.5;
    ctx.globalAlpha = 0.45;
    ctx.stroke();
    ctx.globalAlpha = 1;

    ctx.fillStyle    = C.highlight;
    ctx.fillText(badgeText, BADGE_X, BADGE_Y);
  }

  // ── Song title ──
  const titleY0 = region ? 260 : 200;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.fillStyle    = C.textPri;

  const wrapText = (text, maxW, lineH, startY, maxLines) => {
    const words = text.split(' ');
    const lines = [];
    let line = '';
    for (const word of words) {
      const test = line ? line + ' ' + word : word;
      if (ctx.measureText(test).width > maxW && line) {
        lines.push(line);
        line = word;
        if (lines.length >= maxLines) break;
      } else {
        line = test;
      }
    }
    if (line && lines.length < maxLines) lines.push(line);
    const totalH = lines.length * lineH;
    lines.forEach((l, i) => ctx.fillText(l, W / 2, startY + i * lineH));
    return startY + totalH;
  };

  ctx.font = 'bold 72px "Playfair Display", serif';
  let afterTitle = wrapText(song.song_title || '—', W - 160, 90, titleY0, 3);

  // ── Thin divider ──
  afterTitle += 42;
  const divGrad = ctx.createLinearGradient(W*0.2, 0, W*0.8, 0);
  divGrad.addColorStop(0,   'transparent');
  divGrad.addColorStop(0.3, C.highlight);
  divGrad.addColorStop(0.7, C.highlight);
  divGrad.addColorStop(1,   'transparent');
  ctx.fillStyle = divGrad;
  ctx.fillRect(W*0.2, afterTitle, W*0.6, 2);
  afterTitle += 40;

  // ── Lyric snippet ──
  const lyrics = fmt(song.lyrics);
  if (lyrics) {
    const lines = lyrics.split('\n').map(l => l.trim()).filter(l => l);
    const snippet = lines.slice(0, 3).join('\n');

    ctx.font         = 'bold 96px "Playfair Display", serif';
    ctx.fillStyle    = C.accent;
    ctx.globalAlpha  = 0.6;
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText('\u201C', 108, afterTitle - 24);
    ctx.globalAlpha  = 1;

    ctx.font         = '38px "Lato", sans-serif';
    ctx.fillStyle    = C.textSec;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'top';
    afterTitle = wrapText(snippet, W - 220, 58, afterTitle + 12, 4);

    ctx.font         = 'bold 96px "Playfair Display", serif';
    ctx.fillStyle    = C.accent;
    ctx.globalAlpha  = 0.6;
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'top';
    ctx.fillText('\u201D', W - 108, afterTitle - 20);
    ctx.globalAlpha  = 1;
    afterTitle += 28;
  }

  // ── Metadata pills ──
  const pills = [
    fmt(song.makamsal_dizi),
    fmt(song.konusu_turu),
    fmt(song.usul),
  ].filter(Boolean).slice(0, 3);

  if (pills.length) {
    afterTitle += 36;
    ctx.font         = 'bold 24px "Lato", sans-serif';
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    const pillH = 42, pillGap = 14;
    const pillWidths = pills.map(p => ctx.measureText(p.toLocaleUpperCase('tr-TR')).width + 40);
    const totalPillW = pillWidths.reduce((a, b) => a + b, 0) + pillGap * (pills.length - 1);
    let px = (W - totalPillW) / 2;
    pills.forEach((pill, i) => {
      const pw = pillWidths[i];
      ctx.beginPath();
      ctx.roundRect(px, afterTitle, pw, pillH, pillH / 2);
      ctx.fillStyle   = C.border;
      ctx.fill();
      ctx.strokeStyle = C.surface;
      ctx.lineWidth   = 1;
      ctx.stroke();
      ctx.fillStyle = C.textSec;
      ctx.fillText(pill.toLocaleUpperCase('tr-TR'), px + pw / 2, afterTitle + pillH / 2);
      px += pw + pillGap;
    });
  }

  // ── Bottom rule ──
  const botRule = ctx.createLinearGradient(0, 0, W, 0);
  botRule.addColorStop(0,    'transparent');
  botRule.addColorStop(0.2,  C.highlight);
  botRule.addColorStop(0.8,  C.accent);
  botRule.addColorStop(1,    'transparent');
  ctx.fillStyle = botRule;
  ctx.fillRect(0, H - 5, W, 5);

  // ── Branding footer ──
  ctx.font         = 'bold 24px "Lato", sans-serif';
  ctx.fillStyle    = C.textSec;
  ctx.globalAlpha  = 0.45;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'bottom';
  ctx.fillText('turkguncesi.com  •  Türkiye Türkü Haritası', W / 2, H - 28);
  ctx.globalAlpha  = 1;

  // ── Decide: native share or preview overlay ──
  // On mobile/touch devices with Web Share API → fire the OS share sheet directly.
  // On desktop → show the preview overlay with download option.
  const canNativeShare = navigator.canShare &&
    (() => { try { return navigator.canShare({ files: [new File([], 't.png', { type: 'image/png' })] }); } catch(e) { return false; } })();

  if (canNativeShare) {
    triggerNativeShare();   // card is already drawn on the canvas
  } else {
    // Desktop: show preview + download
    // Update overlay button visibility
    const nativeBtn = document.getElementById('share-native-btn');
    if (nativeBtn) nativeBtn.classList.add('hidden');
    overlay.removeAttribute('hidden');
  }
}

/* ── MAIN INIT ───────────────────────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', async () => {
  mapWrapper     = document.getElementById('map-wrapper');
  mapContainer   = document.getElementById('map-container');
  tooltip        = document.getElementById('tooltip');
  scaleBadge     = document.getElementById('scale-badge');
  selectedInfo   = document.getElementById('selected-info');
  digerBtn       = document.getElementById('btn-diger');
  searchInput    = document.getElementById('search-input');
  searchClear    = document.getElementById('search-clear');
  drawerToggle   = document.getElementById('drawer-toggle');
  drawerBackdrop = document.getElementById('drawer-backdrop');
  sidePanel      = document.getElementById('side-panel');

  // ── THEME SYNC ──────────────────────────────────────────────────────────────
  // The map app uses a `light-mode` class on its wrapper to switch to the light
  // palette. We mirror it from the surrounding site's `html[data-theme]` value
  // so the map automatically follows the site-wide theme toggle.
  const mapAppEl = document.querySelector('.turku-map-app') || document.body;

  function syncTheme() {
    const isLight = (document.documentElement.dataset.theme || 'light') !== 'dark';
    mapAppEl.classList.toggle('light-mode', isLight);
  }

  syncTheme();
  document.addEventListener('themechange', syncTheme);
  // Also catch external changes to `data-theme` (e.g. system theme follower).
  new MutationObserver(syncTheme).observe(document.documentElement, {
    attributes: true,
    attributeFilter: ['data-theme'],
  });

  // ── MODAL CLOSE WIRING ──────────────────────────────────────────────────────
  document.getElementById('modal-close')?.addEventListener('click', closeSongModal);
  document.querySelector('.song-modal-backdrop') && document.getElementById('song-modal')
    .querySelector('.song-modal-backdrop')
    .addEventListener('click', closeSongModal);

  // ── MODAL PREV / NEXT WIRING ────────────────────────────────────────────────
  document.getElementById('modal-prev')?.addEventListener('click', () => {
    const pos = modalSongList.indexOf(currentModalSongIdx);
    if (pos > 0) openSongModal(modalSongList[pos - 1], true, modalSongList);
  });
  document.getElementById('modal-next')?.addEventListener('click', () => {
    const pos = modalSongList.indexOf(currentModalSongIdx);
    if (pos >= 0 && pos < modalSongList.length - 1) openSongModal(modalSongList[pos + 1], true, modalSongList);
  });

  // ── MODAL SWIPE NAVIGATION ──────────────────────────────────────────────────
  (() => {
    const sheet = document.querySelector('.song-modal-sheet');
    if (!sheet) return;
    let swipeStartX = 0, swipeStartY = 0;
    sheet.addEventListener('touchstart', e => {
      swipeStartX = e.touches[0].clientX;
      swipeStartY = e.touches[0].clientY;
    }, { passive: true });
    sheet.addEventListener('touchend', e => {
      const dx = e.changedTouches[0].clientX - swipeStartX;
      const dy = Math.abs(e.changedTouches[0].clientY - swipeStartY);
      if (Math.abs(dx) < 60 || dy > 80) return; // not a horizontal swipe
      const pos = modalSongList.indexOf(currentModalSongIdx);
      if (dx < 0 && pos >= 0 && pos < modalSongList.length - 1) {
        // Swipe left → next
        openSongModal(modalSongList[pos + 1], true, modalSongList);
      } else if (dx > 0 && pos > 0) {
        // Swipe right → previous
        openSongModal(modalSongList[pos - 1], true, modalSongList);
      }
    }, { passive: true });
  })();

  // ── COPY LINK WIRING ────────────────────────────────────────────────────────
  document.getElementById('modal-copy-link-btn')?.addEventListener('click', () => {
    const url = location.href;
    const labelEl = document.getElementById('copy-link-label');
    navigator.clipboard.writeText(url).then(() => {
      if (labelEl) { labelEl.textContent = 'Kopyalandı ✓'; }
      setTimeout(() => { if (labelEl) labelEl.textContent = 'Bağlantı'; }, 2000);
    }).catch(() => {
      // Fallback: select a temporary input
      const inp = document.createElement('input');
      inp.value = url;
      document.body.appendChild(inp);
      inp.select();
      document.execCommand('copy');
      document.body.removeChild(inp);
      if (labelEl) { labelEl.textContent = 'Kopyalandı ✓'; }
      setTimeout(() => { if (labelEl) labelEl.textContent = 'Bağlantı'; }, 2000);
    });
  });

  // ── SHARE BUTTON WIRING ──────────────────────────────────────────────────────
  document.getElementById('modal-share-btn')?.addEventListener('click', () => {
    const idx = currentModalSongIdx;
    if (idx < 0) return;
    generateShareCard(allSongs[idx]);
  });
  document.getElementById('share-close-btn')?.addEventListener('click', () => {
    document.getElementById('share-preview-overlay').setAttribute('hidden', '');
  });
  document.getElementById('share-download-btn')?.addEventListener('click', () => {
    const canvas = document.getElementById('share-canvas');
    const song   = allSongs[currentModalSongIdx];
    const name   = (song?.song_title || 'turku').slice(0, 40).replace(/[^a-zA-ZğşıöüçĞŞİÖÜÇ0-9 ]/g, '').trim().replace(/ +/g, '-');
    const a = document.createElement('a');
    a.download = `turku-${name}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
  });
  document.getElementById('share-native-btn')?.addEventListener('click', triggerNativeShare);

  // Zoom buttons
  document.getElementById('btn-zoom-in').addEventListener('click', () => {
    const r = mapWrapper.getBoundingClientRect();
    zoomAt(r.width/2, r.height/2, scale + ZOOM_STEP); applyTransform();
  });
  document.getElementById('btn-zoom-out').addEventListener('click', () => {
    const r = mapWrapper.getBoundingClientRect();
    zoomAt(r.width/2, r.height/2, scale - ZOOM_STEP); applyTransform();
  });
  document.getElementById('btn-reset').addEventListener('click', () => {
    scale = 1; translateX = 0; translateY = 0; applyTransform();
  });

  // Panel buttons
  digerBtn.addEventListener('click', showDigerPanel);

  // Named region buttons (Rumeli, Kerkük, Azerbaycan…)
  document.getElementById('extra-regions').addEventListener('click', e => {
    const btn = e.target.closest('[data-region]');
    if (btn) showRegionPanel(btn.dataset.region);
  });
  document.getElementById('btn-random').addEventListener('click', showRandomSong);

  // Search — debounced so typing doesn't trigger a full re-render per keystroke.
  let searchDebounceTimer = null;
  const applySearch = () => {
    const q = searchInput.value.trim();
    if (q.length >= SEARCH_MIN_LENGTH) {
      runSearch(q);
    } else if (hasActiveFilters()) {
      runFilterOnly();
    } else if (q.length === 0) {
      clearSearch();
    } else {
      // 1-char query: show a hint instead of matching thousands of songs.
      selectedInfo.innerHTML =
        `<p class="empty-msg">Arama için en az ${SEARCH_MIN_LENGTH} karakter girin…</p>`;
      selectedInfo.scrollTop = 0;
    }
  };
  searchInput.addEventListener('input', () => {
    const q = searchInput.value.trim();
    searchClear.classList.toggle('visible', q.length > 0);
    clearTimeout(searchDebounceTimer);
    searchDebounceTimer = setTimeout(applySearch, 180);
  });
  searchClear.addEventListener('click', () => {
    searchInput.value = '';
    searchClear.classList.remove('visible');
    if (hasActiveFilters()) {
      runFilterOnly();
    } else {
      clearSearch();
    }
    searchInput.focus();
  });

  // Filter toggle button
  const filterToggleBtn = document.getElementById('filter-toggle');
  const filterPanel     = document.getElementById('filter-panel');
  filterToggleBtn?.addEventListener('click', () => {
    const open = !filterPanel.classList.contains('hidden');
    filterPanel.classList.toggle('hidden', open);
    filterToggleBtn.classList.toggle('active', !open);
    filterToggleBtn.setAttribute('aria-expanded', String(!open));
  });

  // Scope chips — re-run search when scope changes
  document.querySelectorAll('#search-scope input[name="scope"]').forEach(cb => {
    cb.addEventListener('change', () => {
      const q = searchInput.value.trim();
      if (q) runSearch(q);
    });
  });

  // Sort dropdown — re-run whichever view is currently active
  document.getElementById('results-sort')?.addEventListener('change', () => {
    const q = searchInput.value.trim();
    if (q.length >= SEARCH_MIN_LENGTH) runSearch(q);
    else if (hasActiveFilters()) runFilterOnly();
  });

  // Filter selects
  document.getElementById('filter-makam')?.addEventListener('change', e => {
    activeFilters.makam = e.target.value;
    updateFilterDot();
    const q = searchInput.value.trim();
    q ? runSearch(q) : (hasActiveFilters() ? runFilterOnly() : clearSearch());
  });
  document.getElementById('filter-konu')?.addEventListener('change', e => {
    activeFilters.konu = e.target.value;
    updateFilterDot();
    const q = searchInput.value.trim();
    q ? runSearch(q) : (hasActiveFilters() ? runFilterOnly() : clearSearch());
  });
  document.getElementById('filter-usul')?.addEventListener('change', e => {
    activeFilters.usul = e.target.value;
    updateFilterDot();
    const q = searchInput.value.trim();
    q ? runSearch(q) : (hasActiveFilters() ? runFilterOnly() : clearSearch());
  });

  // Filter reset
  document.getElementById('filter-reset')?.addEventListener('click', () => {
    activeFilters.makam = '';
    activeFilters.konu  = '';
    activeFilters.usul  = '';
    ['filter-makam','filter-konu','filter-usul'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    updateFilterDot();
    const q = searchInput.value.trim();
    q ? runSearch(q) : clearSearch();
  });

  // Drawer (mobile)
  drawerToggle.addEventListener('click', openDrawer);
  drawerBackdrop.addEventListener('click', closeDrawer);
  let touchStartY = 0;
  sidePanel.addEventListener('touchstart', e => { touchStartY = e.touches[0].clientY; }, { passive: true });
  sidePanel.addEventListener('touchend',   e => { if (e.changedTouches[0].clientY - touchStartY > 60) closeDrawer(); }, { passive: true });

  // Map interactions
  mapWrapper.addEventListener('wheel', e => {
    e.preventDefault();
    const r = mapWrapper.getBoundingClientRect();
    zoomAt(e.clientX - r.left, e.clientY - r.top, scale + (e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP));
  }, { passive: false });

  mapWrapper.addEventListener('mousedown', e => {
    if (e.button !== 0) return;
    isDragging = true;
    dragStartX = e.clientX; dragStartY = e.clientY;
    dragOriginX = translateX; dragOriginY = translateY;
    mapContainer.classList.add('dragging');
  });

  // --- MOBILE PINCH-TO-ZOOM & PAN LOGIC ---
  let initialPinchDistance = 0;
  let pinchMidX = 0;
  let pinchMidY = 0;

  mapWrapper.addEventListener('touchstart', e => {
    if (e.touches.length === 1) {
      // 1 Finger = Pan the map
      isDragging = true;
      dragStartX = e.touches[0].clientX; dragStartY = e.touches[0].clientY;
      dragOriginX = translateX; dragOriginY = translateY;
    } else if (e.touches.length === 2) {
      // 2 Fingers = Pinch to zoom
      isDragging = false;
      e.preventDefault(); // Stop the entire browser window from zooming
      
      // Calculate starting distance between fingers
      initialPinchDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      // Calculate the center point between the two fingers
      const r = mapWrapper.getBoundingClientRect();
      pinchMidX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - r.left;
      pinchMidY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - r.top;
    }
  }, { passive: false }); // <--- passive: false is required here so we can preventDefault()

  mapWrapper.addEventListener('touchmove', e => {
    if (e.touches.length === 1 && isDragging) {
      // 1 Finger = Pan the map
      translateX = dragOriginX + (e.touches[0].clientX - dragStartX);
      translateY = dragOriginY + (e.touches[0].clientY - dragStartY);
      applyTransform();
    } else if (e.touches.length === 2) {
      // 2 Fingers = Pinch to zoom
      e.preventDefault();
      
      const currentDistance = Math.hypot(
        e.touches[0].clientX - e.touches[1].clientX,
        e.touches[0].clientY - e.touches[1].clientY
      );
      
      // Calculate how much to zoom based on finger movement
      const zoomFactor = currentDistance / initialPinchDistance;
      const newScale = scale * zoomFactor;
      
      // Use your existing zoomAt function so it zooms smoothly into the center of your fingers!
      zoomAt(pinchMidX, pinchMidY, newScale);
      
      // Update variables for the next frame of animation
      initialPinchDistance = currentDistance;
      
      const r = mapWrapper.getBoundingClientRect();
      pinchMidX = ((e.touches[0].clientX + e.touches[1].clientX) / 2) - r.left;
      pinchMidY = ((e.touches[0].clientY + e.touches[1].clientY) / 2) - r.top;
    }
  }, { passive: false });

  mapWrapper.addEventListener('touchend', e => { 
    // If the user lifts one finger, stop dragging until they put it back down
    if (e.touches.length < 2) {
      isDragging = false; 
    }
  });


  // Load data
  // Show a loading state immediately so the sidebar isn't blank during the
  // ~9MB songs.jsonl download on slow connections.
  selectedInfo.innerHTML = `
    <div class="loading-state" role="status" aria-live="polite">
      <div class="loading-spinner" aria-hidden="true"></div>
      <p class="loading-text">Türküler yükleniyor…</p>
      <div class="loading-skeleton" aria-hidden="true">
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
        <div class="skeleton-card"></div>
      </div>
    </div>`;

  let rawArray = [];
  let loadFailed = false;
  try {
    const res = await fetch('/turku-haritasi/songs.jsonl');
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const text = await res.text();
    rawArray = text.split('\n').map(l => l.trim()).filter(l => l).map(l => JSON.parse(l));
    console.log(`✅ Loaded ${rawArray.length} songs`);
  } catch (err) {
    loadFailed = true;
    console.error('❌ songs.jsonl yüklenemedi:', err.message);
    selectedInfo.innerHTML = '<p class="empty-msg" style="color:var(--accent)">songs.jsonl yüklenemedi. Dosyanın index.html ile aynı klasörde olduğundan emin olun.</p>';
  }

  songsByProvince = processData(rawArray);
  allSongs = rawArray;
  // Cache each song's index so search/filter don't need O(n) indexOf lookups per result.
  allSongs.forEach((s, i) => { s._idx = i; });

  // Clear the loading state now that data is ready. Deep-link restore below
  // may overwrite this immediately with a province/song view.
  if (!loadFailed) {
    selectedInfo.innerHTML = '<p class="empty-msg">Bir ilin üzerine gelin ve tıklayın…</p>';
  }

  populateFilterDropdowns();

  const totalEl = document.getElementById('total-count');
  if (totalEl) totalEl.textContent = rawArray.length;

  const digerCount = (songsByProvince['Diğer'] || []).length;
  const badge = document.getElementById('diger-count');
  if (badge) badge.textContent = digerCount;
  digerBtn.style.display = digerCount > 0 ? 'inline-flex' : 'none';

  // Populate named region buttons
  const regionContainer = document.getElementById('extra-regions');
  Object.values(NAMED_REGIONS).forEach(regionName => {
    const count = (songsByProvince[regionName] || []).length;
    const countEl = document.getElementById('count-' + regionName);
    if (countEl) countEl.textContent = count;
    const btn = regionContainer?.querySelector(`[data-region="${regionName}"]`);
    if (btn) btn.style.display = count > 0 ? 'inline-flex' : 'none';
  });

  // ── GÜNÜN TÜRKÜSÜ ────────────────────────────────────────────────────────────
  renderTotd();

  applyTransform();
  wireProvinces();
  buildProvinceLabels();
  if (labelGroup) labelGroup.classList.add('visible');

  // ── DEEP LINK RESTORE ───────────────────────────────────────────────────────
  // Run after data + SVG paths are fully wired so province paths exist
  if (location.hash) applyHash(location.hash);

  // Back / forward button support
  window.addEventListener('hashchange', () => {
    const hash = location.hash.replace(/^#/, '');
    if (!hash) {
      // Hash cleared (e.g. user navigated back to bare URL)
      closeSongModal(false);
      if (activePanel) {
        activePanel.classList.remove('active-province');
        activePanel = null;
        selectedInfo.innerHTML = '<p class="empty-msg">Bir ilin üzerine gelin ve tıklayın…</p>';
      }
      return;
    }
    applyHash(location.hash);
  });

  // Label toggle
  labelToggle = document.getElementById('toggle-labels');
  labelGroup  = mapContainer.querySelector('#province-labels');
  if (labelToggle && labelGroup) {
    labelToggle.addEventListener('change', () => {
      labelsVisible = labelToggle.checked;
      labelGroup.classList.toggle('visible', labelsVisible);
    });
  }

  // Choropleth toggle
  choroplethToggle = document.getElementById('toggle-choropleth');
  if (choroplethToggle) {
    choroplethToggle.addEventListener('change', () => {
      choroplethVisible = choroplethToggle.checked;
      (document.querySelector('.turku-map-app') || document.body)
        .classList.toggle('choropleth-on', choroplethVisible);
    });
  }

  // Keyboard navigation — registered after wireProvinces so provincePaths is populated
  window.addEventListener('keydown', e => {
    if (document.activeElement === searchInput) return;
    if (!provincePaths.length) return;
    if (!['ArrowRight','ArrowLeft','ArrowUp','ArrowDown','Enter',' ','Escape'].includes(e.key)) return;
    e.preventDefault();

    if (e.key === 'Escape') {
      const modal = document.getElementById('song-modal');
      if (modal && !modal.hidden) { closeSongModal(); return; }
      hideTooltip();
      provincePaths.forEach(p => p.classList.remove('kb-focus'));
      kbIndex = -1;
      return;
    }

    // Arrow Left/Right navigate within an open modal
    const modal = document.getElementById('song-modal');
    if (modal && !modal.hidden) {
      if (e.key === 'ArrowLeft') {
        const pos = modalSongList.indexOf(currentModalSongIdx);
        if (pos > 0) openSongModal(modalSongList[pos - 1], true, modalSongList);
        return;
      }
      if (e.key === 'ArrowRight') {
        const pos = modalSongList.indexOf(currentModalSongIdx);
        if (pos >= 0 && pos < modalSongList.length - 1) openSongModal(modalSongList[pos + 1], true, modalSongList);
        return;
      }
    }

    if (e.key === 'Enter' || e.key === ' ') {
      console.log('Enter pressed, kbIndex:', kbIndex, provincePaths[kbIndex]?.getAttribute('name'));
      if (kbIndex >= 0) {
        const path = provincePaths[kbIndex];
        hideTooltip();
        selectProvince(path, path.getAttribute('name'));
      }
      return;
    }

    const next = findNeighbor(kbIndex, e.key);
    if (next === -1) return;
    kbIndex = next;

    const path = provincePaths[kbIndex];
    const svgName = path.getAttribute('name');

    // Highlight without selecting — clear any previous mouse/click selection
    if (activePanel) { activePanel.classList.remove('active-province'); activePanel = null; }
    
    // Blur all paths so CSS :focus pseudo-class doesn't keep the clicked city red
    provincePaths.forEach(p => { p.classList.remove('kb-focus'); p.blur(); });
    path.classList.add('kb-focus');

    // Force focus to the new element while navigating with arrows
    path.focus({ preventScroll: true });

    if (window.innerWidth > 700) {
      const coords = PROVINCE_COORDS[svgName];
      if (coords) {
        const svgEl = mapContainer.querySelector('svg');
        const pt = svgEl.createSVGPoint();
        pt.x = coords[0]; pt.y = coords[1];
        const screen = pt.matrixTransform(svgEl.getScreenCTM());
        showTooltip(svgName, screen.x, screen.y);
      }
    }
  });
});
/* ═══════════════════════════════════════════════════════════════
   ONBOARDING TOUR
   ═══════════════════════════════════════════════════════════════ */

(function initOnboarding() {
  const STORAGE_KEY = 'turkuharitasi_toured_v1';
  if (localStorage.getItem(STORAGE_KEY)) return;

  const isMobile = () => window.innerWidth <= 700;

  // Steps: desktop and mobile variants where behaviour differs
  const STEPS_DESKTOP = [
    {
      icon: '🗺️',
      title: 'Türkiye Türkü Haritası\'na Hoş Geldiniz',
      body: 'Her ilin üzerine gelerek ya da tıklayarak o ile ait türküleri keşfedebilirsiniz.',
      targetId: 'map-wrapper',
      arrow: 'none',
    },
    {
      icon: '🖱️',
      title: 'Üzerine Gelin',
      body: 'Fare ile bir ilin üzerine gelince, o ile ait türküler küçük bir baloncukta belirir.',
      targetId: 'map-wrapper',
      arrow: 'none',
    },
    {
      icon: '📌',
      title: 'Tıklayın',
      body: 'Bir ile tıklarsanız türküleri yan panelde sabitlenmiş olarak görürsünüz. Kartlara tıklayarak detayları açabilirsiniz.',
      targetId: 'side-panel',
      arrow: 'left',
    },
    {
      icon: '🎲',
      title: 'Rastgele Türkü',
      body: '\"Rastgele\" düğmesiyle veri tabanından rastgele bir türkü seçilir ve ilgili il vurgulanır.',
      targetId: 'btn-random',
      arrow: 'top',
    },
    {
      icon: '🔍',
      title: 'Arama',
      body: 'Türkü adına, kaynak kişiye veya makami\'e göre filtreleyerek arama yapabilirsiniz.',
      targetId: 'search-input',
      arrow: 'top',
    },
    {
      icon: '🔎',
      title: 'Yakınlaştır & Kaydır',
      body: 'Fare tekerleğiyle yakınlaştırın, sürükleyerek haritada gezinin. Sağ alttaki düğmelerle de zoom yapabilirsiniz.',
      targetId: 'zoom-controls',
      arrow: 'right',
    },
  ];

  const STEPS_MOBILE = [
    {
      icon: '🗺️',
      title: 'Türkiye Türkü Haritası\'na Hoş Geldiniz',
      body: 'Haritada bir ile dokunarak o ile ait türküleri keşfedebilirsiniz.',
      targetId: 'map-wrapper',
      arrow: 'none',
    },
    {
      icon: '👆',
      title: 'Bir İle Dokunun',
      body: 'Herhangi bir ile dokunduğunuzda türküleri alt panelde görürsünüz. Kartlara tıklayarak detayları açabilirsiniz.',
      targetId: 'map-wrapper',
      arrow: 'none',
    },
    {
      icon: '📋',
      title: 'Alt Panel',
      body: 'Alttaki "Türküler" düğmesiyle paneli açıp kapayabilir, arama yapabilir ve türkülere göz atabilirsiniz.',
      targetId: 'drawer-toggle',
      arrow: 'bottom',
    },
    {
      icon: '🎲',
      title: 'Rastgele Türkü',
      body: 'Panel içindeki \"Rastgele\" düğmesiyle veri tabanından rastgele bir türkü seçilir.',
      targetId: 'btn-random',
      arrow: 'top',
    },
    {
      icon: '🤏',
      title: 'Yakınlaştır & Kaydır',
      body: 'İki parmakla sıkıştırma hareketi ile yakınlaştırın, tek parmakla sürükleyerek haritada gezinin.',
      targetId: 'zoom-controls',
      arrow: 'right',
    },
  ];

  let currentStep = 0;
  let steps;

  const overlay   = document.getElementById('onboarding-overlay');
  const spotlight = document.getElementById('onboarding-spotlight');
  const card      = document.getElementById('onboarding-card');
  const stepDots  = document.getElementById('onboarding-step-indicator');
  const iconEl    = document.getElementById('onboarding-icon');
  const titleEl   = document.getElementById('onboarding-title');
  const bodyEl    = document.getElementById('onboarding-body');
  const nextBtn   = document.getElementById('onboarding-next');
  const skipBtn   = document.getElementById('onboarding-skip');

  function getTargetRect(id) {
    const el = document.getElementById(id);
    if (!el) return null;
    return el.getBoundingClientRect();
  }

  const PAD = 10; // spotlight padding around target

  function buildSpotlightPath(rect) {
    if (!rect) {
      // No spotlight — just a full dark scrim
      return 'rgba(0,0,0,0.6)';
    }
    const x = Math.max(0, rect.left - PAD);
    const y = Math.max(0, rect.top  - PAD);
    const w = rect.width  + PAD * 2;
    const h = rect.height + PAD * 2;
    const r = 10; // border-radius of hole
    const W = window.innerWidth;
    const H = window.innerHeight;

    // SVG path: outer rect (whole screen) then inner rounded-rect cutout (hole)
    // Uses even-odd fill rule so the hole is transparent
    const path = `M 0 0 L ${W} 0 L ${W} ${H} L 0 ${H} Z ` +
      `M ${x+r} ${y} ` +
      `L ${x+w-r} ${y} Q ${x+w} ${y} ${x+w} ${y+r} ` +
      `L ${x+w} ${y+h-r} Q ${x+w} ${y+h} ${x+w-r} ${y+h} ` +
      `L ${x+r} ${y+h} Q ${x} ${y+h} ${x} ${y+h-r} ` +
      `L ${x} ${y+r} Q ${x} ${y} ${x+r} ${y} Z`;

    return path;
  }

  function positionCard(rect, arrow) {
    const CARD_W = isMobile() ? window.innerWidth - 32 : 260;
    const CARD_ESTIMATE_H = 200;
    const MARGIN = 16;
    const W = window.innerWidth;
    const H = window.innerHeight;

    card.className = `arrow-${arrow}`;

    if (isMobile() || !rect || arrow === 'none') {
      // Centre-bottom on mobile, or no target
      card.style.top  = `${H / 2 - CARD_ESTIMATE_H / 2}px`;
      card.style.left = `${MARGIN}px`;
      return;
    }

    let top, left;

    if (arrow === 'top') {
      // Card below the target
      top  = rect.bottom + PAD + 10;
      left = rect.left;
    } else if (arrow === 'bottom') {
      // Card above the target
      top  = rect.top - PAD - CARD_ESTIMATE_H - 10;
      left = rect.left;
    } else if (arrow === 'left') {
      // Card to the right of the target
      top  = rect.top;
      left = rect.right + PAD + 14;
    } else if (arrow === 'right') {
      // Card to the left of the target
      top  = rect.top;
      left = rect.left - CARD_W - PAD - 14;
    } else {
      // Centre of screen
      top  = H / 2 - CARD_ESTIMATE_H / 2;
      left = W / 2 - CARD_W / 2;
    }

    // Clamp to viewport
    left = Math.max(MARGIN, Math.min(left, W - CARD_W - MARGIN));
    top  = Math.max(MARGIN, Math.min(top, H - CARD_ESTIMATE_H - MARGIN));

    card.style.top  = `${top}px`;
    card.style.left = `${left}px`;
  }

  function renderStep(idx) {
    const step = steps[idx];
    const isLast = idx === steps.length - 1;
    const rect = getTargetRect(step.targetId);

    // Spotlight
    if (step.arrow === 'none' || !rect) {
      spotlight.style.background = 'rgba(0,0,0,0.55)';
      spotlight.style.clipPath   = 'none';
    } else {
      const svgPath = buildSpotlightPath(rect);
      spotlight.style.background = 'rgba(0,0,0,0)';
      spotlight.style.clipPath   = 'none';
      // Use inline SVG mask approach via a painted canvas-style overlay
      spotlight.style.background = 'none';
      // Draw via a pseudo-SVG overlay on the spotlight div
      spotlight.innerHTML = `<svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" style="position:absolute;inset:0">
        <path fill-rule="evenodd" fill="rgba(0,0,0,0.58)" d="${svgPath}"/>
      </svg>`;
    }

    // Step dots
    stepDots.innerHTML = steps.map((_, i) =>
      `<div class="ob-dot ${i === idx ? 'active' : ''}"></div>`
    ).join('');

    // Content
    iconEl.textContent  = step.icon;
    titleEl.textContent = step.title;
    bodyEl.textContent  = step.body;
    nextBtn.textContent = isLast ? 'Başla ✓' : 'İleri →';

    // Position card
    positionCard(rect, step.arrow);

    // Animate card
    card.classList.remove('animating');
    void card.offsetWidth; // reflow
    card.classList.add('animating');
  }

  function advance() {
    if (currentStep < steps.length - 1) {
      currentStep++;
      renderStep(currentStep);
    } else {
      dismiss();
    }
  }

  function dismiss() {
    localStorage.setItem(STORAGE_KEY, '1');
    overlay.hidden = true;
    spotlight.innerHTML = '';
  }

  function start() {
    steps = isMobile() ? STEPS_MOBILE : STEPS_DESKTOP;
    currentStep = 0;
    overlay.hidden = false;
    renderStep(0);
  }

  nextBtn.addEventListener('click', advance);
  skipBtn.addEventListener('click', dismiss);

  // Reposition on resize
  window.addEventListener('resize', () => {
    if (!overlay.hidden) renderStep(currentStep);
  });

  // Start after a short delay so the map finishes loading/painting
  setTimeout(start, 900);
})();