/*
 * Domia Stays website generator: shared helpers, icons and the amenity catalogue.
 * Runs unchanged in the browser (Property Manager) and in Node (build/cli.mjs).
 */
(function (g) {
  'use strict';

  var LANGS = ['en', 'es'];

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  // Text in a given language, falling back to English, then to any language that has it.
  function tx(v, lang) {
    if (v == null) return '';
    if (typeof v === 'string') return v;
    if (v[lang]) return v[lang];
    if (v.en) return v.en;
    for (var k in v) if (v[k]) return v[k];
    return '';
  }

  function slugify(s) {
    return String(s || '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '')
      .toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60);
  }

  function fill(str, vars) {
    return String(str).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] == null ? m : vars[k]; });
  }

  // Site text changed in the property manager (Texts tab) is kept in content/texts.json as
  // { "en": { "home.h1": "…" }, "es": { … } }, each key the path of a sentence in build/copy.js.
  // applyTexts lays those changes over the built-in text. Only existing sentences can change:
  // unknown paths, empty values and the locked ones (names that link pages and photos) are ignored.
  var TEXT_LOCKED = /^benidorm\.areas\.\d+\.(key|img)$|^benidorm\.pics\.\d+\.0$/;
  function applyTexts(copy, texts) {
    if (!texts) return copy;
    var out = JSON.parse(JSON.stringify(copy));
    LANGS.forEach(function (lang) {
      var changes = texts[lang] || {};
      Object.keys(changes).forEach(function (path) {
        var v = changes[path];
        if (typeof v !== 'string' || !v.trim() || TEXT_LOCKED.test(path)) return;
        var parts = path.split('.'), node = out[lang];
        for (var i = 0; i < parts.length - 1; i++) { if (node == null || typeof node !== 'object') return; node = node[parts[i]]; }
        var last = parts[parts.length - 1];
        if (node && typeof node === 'object' && typeof node[last] === 'string') node[last] = v;
      });
    });
    return out;
  }

  function money(n) {
    var v = Math.round(Number(n) || 0);
    return '€' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  }

  // File names. English pages are name.html, Spanish pages are name.es.html (the URLs the site has always used).
  function pageFile(key, lang) { return key + (lang === 'en' ? '' : '.' + lang) + '.html'; }
  function homeFile(id, lang) { return 'properties_' + id + (lang === 'en' ? '' : '.' + lang) + '.html'; }

  function photoSmall(file) { return String(file).replace(/(\.[a-z0-9]+)$/i, '-sm$1'); }
  function photoPath(home, photo, small) {
    return 'assets/properties/' + home.id + '/' + (small ? photoSmall(photo.file) : photo.file);
  }

  function waLink(site, text) {
    var n = String(site.whatsapp || '').replace(/\D/g, '');
    return 'https://wa.me/' + n + (text ? '?text=' + encodeURIComponent(text) : '');
  }
  function telLink(site) { return 'tel:' + String(site.phone || '').replace(/[^\d+]/g, ''); }
  function mapsLink(q) { return 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent(q); }

  function abs(site, path) {
    var base = String(site.url || '').replace(/\/+$/, '');
    if (!base) return '';
    return base + '/' + String(path).replace(/^\/+/, '').replace(/^index\.html$/, '');
  }

  /* ---------- icons: 24px line icons, drawn for this site ---------- */
  var P = {
    bed: 'M3 18v-6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v6M3 15h18M6 10V7a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v3M3 18v2M21 18v2',
    bath: 'M4 12h16v2a5 5 0 0 1-5 5H9a5 5 0 0 1-5-5v-2ZM6 12V6.5A2.5 2.5 0 0 1 8.5 4c1.2 0 2.1.8 2.4 1.9M7 19l-1 2M17 19l1 2',
    users: 'M9 11a3.5 3.5 0 1 0 0-7 3.5 3.5 0 0 0 0 7ZM2.5 20a6.5 6.5 0 0 1 13 0M16 4.3a3.5 3.5 0 0 1 0 6.4M18 14.2a6.5 6.5 0 0 1 3.5 5.8',
    size: 'M4 4h16v16H4zM4 9h3M4 14h3M10 20v-3M15 20v-3',
    pin: 'M12 21s7-6.2 7-11.5a7 7 0 1 0-14 0C5 14.8 12 21 12 21ZM12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z',
    wave: 'M2 8.5c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 13.5c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2M2 18.5c2.5 0 2.5-2 5-2s2.5 2 5 2 2.5-2 5-2 2.5 2 5 2',
    sun: 'M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
    balcony: 'M7 12V5h10v7M3.5 12h17M5 12v8M19 12v8M9.7 12v8M14.3 12v8M3.5 20h17',
    pool: 'M7 15V5.5a2 2 0 0 1 4 0M13 15V5.5a2 2 0 0 1 4 0M7 8.5h6M7 12h6M2 19c1.7 0 1.7 1 3.3 1s1.7-1 3.4-1 1.6 1 3.3 1 1.7-1 3.3-1 1.7 1 3.4 1 1.6-1 3.3-1',
    wifi: 'M2.5 9a14 14 0 0 1 19 0M5.5 12.5a9.5 9.5 0 0 1 13 0M8.5 16a5 5 0 0 1 7 0M12 19.5h.01',
    snow: 'M12 2v20M3.5 7l17 10M3.5 17l17-10M9.5 3.5 12 6l2.5-2.5M9.5 20.5 12 18l2.5 2.5',
    flame: 'M12 3c1 3.5 5 5.5 5 10a5 5 0 0 1-10 0c0-2 1-3.2 2-4.2.4 1.6 1.4 2.2 2 2.2 0-3-1-5 1-8Z',
    lift: 'M5 3h14v18H5zM12 3v18M7.3 9.5 8.5 8l1.2 1.5M14.3 14.5l1.2 1.5 1.2-1.5',
    parking: 'M5 4h14a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V5a1 1 0 0 1 1-1ZM9.5 17V7.5h3.25a2.75 2.75 0 0 1 0 5.5H9.5',
    kitchen: 'M5 3v5a2 2 0 0 0 4 0V3M7 3v18M17 3c-2 1.5-3 4.5-3 8h3M17 3v18',
    washer: 'M5 3h14a1 1 0 0 1 1 1v16a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1ZM12 17.5a4.5 4.5 0 1 0 0-9 4.5 4.5 0 0 0 0 9ZM7 6h.01M10 6h.01',
    tv: 'M3 5h18v12H3zM8 21h8M12 17v4',
    desk: 'M5 5h14v10H5zM2.5 19h19',
    paw: 'M12 20c-3 0-5-1.5-5-3.5S9.5 12 12 12s5 2.5 5 4.5-2 3.5-5 3.5ZM6 11.5a1.5 2 0 1 0 0-4 1.5 2 0 0 0 0 4ZM18 11.5a1.5 2 0 1 0 0-4 1.5 2 0 0 0 0 4ZM9.5 7.5a1.5 2 0 1 0 0-4 1.5 2 0 0 0 0 4ZM14.5 7.5a1.5 2 0 1 0 0-4 1.5 2 0 0 0 0 4Z',
    check: 'M5 12.5l4.5 4.5L19 7.5',
    key: 'M15 14a5 5 0 1 0-4.6-3L3 18.5V21h3.5v-2H9v-2.5h2l1.4-1.4A5 5 0 0 0 15 14ZM16.5 7.5h.01',
    clock: 'M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18ZM12 7v5l3 2',
    mail: 'M3 6h18v12H3zM3 7l9 6 9-6',
    phone: 'M5 4h4l1.5 4.5-2 1.5a12 12 0 0 0 5.5 5.5l1.5-2L20 15v4a1 1 0 0 1-1 1A15 15 0 0 1 4 5a1 1 0 0 1 1-1Z',
    arrow: 'M5 12h14M13 6l6 6-6 6',
    'chev-l': 'M15 5l-7 7 7 7',
    'chev-r': 'M9 5l7 7-7 7',
    'chev-d': 'M5 9l7 7 7-7',
    close: 'M6 6l12 12M18 6 6 18',
    menu: 'M4 7h16M4 12h16M4 17h16',
    grid: 'M4 4h7v7H4zM13 4h7v7h-7zM4 13h7v7H4zM13 13h7v7h-7z',
    shield: 'M12 3l7 3v5.5c0 4.3-2.9 7.6-7 9.5-4.1-1.9-7-5.2-7-9.5V6l7-3ZM9 12l2 2 4-4.5',
    leaf: 'M5 19c0-8 5-13 14-14 0 9-5 14-13 14M5 19l7-7',
    gym: 'M3 10v4M6 7v10M18 7v10M21 10v4M6 12h12',
    cot: 'M4 6v12M20 6v12M4 10h16M4 16h16M9 10v6M15 10v6',
    coffee: 'M5 9h11v5a5 5 0 0 1-5 5h-1a5 5 0 0 1-5-5V9ZM16 10h1.5a2.5 2.5 0 0 1 0 5H16M8 3v2.5M12 3v2.5',
    beach: 'M12 21V11M3.5 11a8.5 8.5 0 0 1 17 0ZM7 21h10',
    home: 'M4 11l8-7 8 7M6 9.5V20h12V9.5M10 20v-6h4v6',
    external: 'M14 4h6v6M20 4l-9 9M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6'
  };
  // Filled glyphs
  var F = {
    star: 'M12 3l2.7 5.6 6.1.8-4.5 4.2 1.2 6L12 16.7 6.5 19.6l1.2-6L3.2 9.4l6.1-.8L12 3Z',
    whatsapp: 'M12.04 2a9.9 9.9 0 0 0-8.5 15l-1.3 4.7 4.8-1.26A9.9 9.9 0 1 0 12.04 2Zm0 1.8a8.1 8.1 0 0 1 5.72 13.83 8.1 8.1 0 0 1-9.9 1.23l-.34-.2-2.85.75.76-2.78-.22-.36A8.1 8.1 0 0 1 12.04 3.8Zm-3.2 3.63c-.16 0-.42.06-.64.3-.22.24-.85.83-.85 2.02 0 1.2.87 2.35.99 2.51.12.16 1.7 2.6 4.16 3.64 2.05.86 2.47.69 2.92.65.45-.04 1.45-.59 1.65-1.16.2-.57.2-1.06.14-1.16-.06-.1-.22-.16-.46-.28-.24-.12-1.45-.72-1.67-.8-.22-.08-.38-.12-.55.12-.16.24-.63.8-.77.96-.14.16-.28.18-.52.06-.24-.12-1.03-.38-1.96-1.21-.72-.64-1.21-1.44-1.35-1.68-.14-.24-.02-.37.1-.49.11-.11.24-.28.36-.42.12-.14.16-.24.24-.4.08-.16.04-.3-.02-.42-.06-.12-.54-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47Z'
  };
  function icon(name, cls) {
    var c = 'ic' + (cls ? ' ' + cls : '');
    if (F[name]) return '<svg class="' + c + '" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" focusable="false"><path d="' + F[name] + '"/></svg>';
    return '<svg class="' + c + '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="' + (P[name] || P.check) + '"/></svg>';
  }

  /* ---------- amenities the Property Manager offers as tick boxes ---------- */
  var AMENITIES = [
    { key: 'sea-view', icon: 'wave', en: 'Sea view', es: 'Vistas al mar' },
    { key: 'beachfront', icon: 'beach', en: 'Beachfront', es: 'Primera línea de playa' },
    { key: 'beach-5min', icon: 'beach', en: '5 min to the beach', es: 'A 5 min de la playa' },
    { key: 'terrace', icon: 'sun', en: 'Private terrace', es: 'Terraza privada' },
    { key: 'balcony', icon: 'balcony', en: 'Balcony', es: 'Balcón' },
    { key: 'pool-shared', icon: 'pool', en: 'Shared pool', es: 'Piscina comunitaria' },
    { key: 'pool-private', icon: 'pool', en: 'Private pool', es: 'Piscina privada' },
    { key: 'garden', icon: 'leaf', en: 'Garden', es: 'Jardín' },
    { key: 'wifi', icon: 'wifi', en: 'Fast Wi-Fi', es: 'Wi-Fi rápido' },
    { key: 'ac', icon: 'snow', en: 'Air conditioning', es: 'Aire acondicionado' },
    { key: 'heating', icon: 'flame', en: 'Heating', es: 'Calefacción' },
    { key: 'lift', icon: 'lift', en: 'Lift', es: 'Ascensor' },
    { key: 'parking', icon: 'parking', en: 'Parking', es: 'Parking' },
    { key: 'kitchen', icon: 'kitchen', en: 'Full kitchen', es: 'Cocina equipada' },
    { key: 'coffee', icon: 'coffee', en: 'Coffee machine', es: 'Cafetera' },
    { key: 'washer', icon: 'washer', en: 'Washing machine', es: 'Lavadora' },
    { key: 'dishwasher', icon: 'washer', en: 'Dishwasher', es: 'Lavavajillas' },
    { key: 'tv', icon: 'tv', en: 'Smart TV', es: 'Smart TV' },
    { key: 'workspace', icon: 'desk', en: 'Desk to work at', es: 'Zona de trabajo' },
    { key: 'self-checkin', icon: 'key', en: 'Self check-in', es: 'Llegada autónoma' },
    { key: 'central', icon: 'pin', en: 'Central location', es: 'Ubicación céntrica' },
    { key: 'family', icon: 'cot', en: 'Cot and high chair', es: 'Cuna y trona' },
    { key: 'pets', icon: 'paw', en: 'Pets welcome', es: 'Admite mascotas' },
    { key: 'gym', icon: 'gym', en: 'Gym', es: 'Gimnasio' },
    { key: 'step-free', icon: 'check', en: 'Step-free access', es: 'Acceso sin escalones' }
  ];
  var AMENITY_BY_KEY = {};
  AMENITIES.forEach(function (a) { AMENITY_BY_KEY[a.key] = a; });

  var HOME_TYPES = [
    { key: 'apartment', en: 'Apartment', es: 'Apartamento' },
    { key: 'studio', en: 'Studio', es: 'Estudio' },
    { key: 'penthouse', en: 'Penthouse', es: 'Ático' },
    { key: 'house', en: 'House', es: 'Casa' },
    { key: 'villa', en: 'Villa', es: 'Villa' }
  ];

  // The amenities of a home as [{icon, label}] in one language.
  function amenityList(home, lang) {
    var out = [];
    (home.amenities || []).forEach(function (k) {
      var a = AMENITY_BY_KEY[k];
      if (a) out.push({ icon: a.icon, label: a[lang] || a.en });
    });
    (home.amenitiesExtra || []).forEach(function (x) {
      var label = tx(x, lang);
      if (label) out.push({ icon: 'check', label: label });
    });
    return out;
  }

  // Normalise one home record so templates can rely on every field existing.
  function cleanHome(h) {
    var o = {};
    for (var k in h) o[k] = h[k];
    o.id = slugify(o.id || o.name);
    o.status = o.status === 'hidden' ? 'hidden' : 'published';
    o.featured = o.featured !== false;
    o.name = String(o.name || '').trim();
    o.type = o.type || 'apartment';
    o.area = String(o.area || '').trim();
    o.town = String(o.town || '').trim();
    ['priceFrom', 'bedrooms', 'bathrooms', 'guests', 'size', 'minNights'].forEach(function (f) {
      var n = Number(o[f]);
      o[f] = isFinite(n) && n > 0 ? n : 0;
    });
    o.photos = (o.photos || []).filter(function (p) { return p && p.file; });
    o.amenities = o.amenities || [];
    o.amenitiesExtra = o.amenitiesExtra || [];
    ['licence', 'bookingUrl', 'airbnbUrl', 'bookingComUrl'].forEach(function (f) { o[f] = String(o[f] || '').trim(); });
    return o;
  }

  // Things worth telling the owner about before publishing. Returns plain-English strings.
  function checkHome(h) {
    var w = [];
    if (!h.name) w.push('has no name');
    if (!h.area) w.push('has no area');
    if (!h.priceFrom) w.push('has no price');
    if (!h.guests) w.push('does not say how many guests it sleeps');
    if (!h.photos.length) w.push('has no photos');
    if (!tx(h.description, 'en')) w.push('has no description');
    if (!(h.description && h.description.es)) w.push('has no Spanish description (the English one is shown instead)');
    if (!h.licence) w.push('has no tourist licence number');
    return w;
  }

  var api = {
    LANGS: LANGS, applyTexts: applyTexts, TEXT_LOCKED: TEXT_LOCKED, esc: esc, tx: tx, slugify: slugify, fill: fill, money: money,
    pageFile: pageFile, homeFile: homeFile, photoSmall: photoSmall, photoPath: photoPath,
    waLink: waLink, telLink: telLink, mapsLink: mapsLink, abs: abs, icon: icon,
    AMENITIES: AMENITIES, AMENITY_BY_KEY: AMENITY_BY_KEY, HOME_TYPES: HOME_TYPES,
    amenityList: amenityList, cleanHome: cleanHome, checkHome: checkHome
  };
  g.DomiaLib = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
