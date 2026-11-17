/*
 * Domia Stays website generator: the HTML of every page.
 * Each function returns a string. Nothing here touches files or the network.
 */
(function (g) {
  'use strict';
  var L = g.DomiaLib, esc = L.esc, tx = L.tx, icon = L.icon, fill = L.fill, money = L.money;

  // Bump when css/site.css or js/site.js change, so browsers fetch the new files.
  var ASSET_VERSION = '20261117d';

  // Site photography in assets/img (name: [width, height] of the large file).
  var IMG = {
    'benidorm-dusk': [1800, 1200], 'levante-balcon': [1800, 1126], 'levante-summer': [1600, 1200],
    'poniente-aerial': [1600, 1066], 'old-town-balcon': [1600, 1067], 'bay-from-hills': [1000, 1500],
    'bay-aerial': [1400, 933], 'cove': [1400, 933], 'palms': [1050, 1400], 'golden-hour': [933, 1400],
    'sailboats': [1400, 934], 'towers': [787, 1400], 'bay-night': [1800, 1200]
  };
  var CHANNELS = [['Airbnb', 3], ['Booking.com', 15], ['direct', 0], ['VRBO', 8]];

  /* "Domia Stays S.L." already ends with a full stop: never print two */
  function sentence(x) { x = String(x || '').trim(); return /[.!?]$/.test(x) ? x : x + '.'; }
  function siteImg(name, alt, sizes, opts) {
    opts = opts || {};
    var d = IMG[name], sw = Math.min(900, d[0]);
    return '<img' + (opts.cls ? ' class="' + opts.cls + '"' : '') + ' src="assets/img/' + name + '.jpg" srcset="assets/img/' + name + '-sm.jpg ' + sw + 'w, assets/img/' + name + '.jpg ' + d[0] + 'w" sizes="' + sizes + '" width="' + d[0] + '" height="' + d[1] + '" alt="' + esc(alt) + '"' +
      (opts.eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + '>';
  }

  function homePhoto(home, photo, alt, sizes, opts) {
    opts = opts || {};
    var w = photo.w || 1600, h = photo.h || 1200, sw = Math.min(800, w);
    return '<img' + (opts.cls ? ' class="' + opts.cls + '"' : '') + ' src="' + esc(L.photoPath(home, photo, !!opts.small)) + '" srcset="' + esc(L.photoPath(home, photo, true)) + ' ' + sw + 'w, ' + esc(L.photoPath(home, photo)) + ' ' + w + 'w" sizes="' + sizes + '" width="' + w + '" height="' + h + '" alt="' + esc(alt) + '"' +
      (opts.eager ? ' fetchpriority="high"' : ' loading="lazy" decoding="async"') + '>';
  }

  function photoAlt(ctx, home, photo, i) {
    return tx(photo.alt, ctx.lang) || (home.name + ', ' + fill(ctx.t.homePage.photoN, { i: i + 1, n: home.photos.length }).toLowerCase());
  }

  function bedsText(ctx, home) {
    var f = ctx.t.facts;
    if (!home.bedrooms) return f.studio;
    return fill(home.bedrooms === 1 ? f.bed1 : f.bedN, { n: home.bedrooms });
  }
  function bathsText(ctx, home) { var f = ctx.t.facts; return fill(home.bathrooms === 1 ? f.bath1 : f.bathN, { n: home.bathrooms }); }
  function sleepsText(ctx, home) { return fill(ctx.t.facts.sleeps, { n: home.guests }); }

  function priceHtml(ctx, home, cls) {
    if (!home.priceFrom) return '';
    return '<p class="' + (cls || 'price') + '"><span>' + ctx.t.price.from + '</span> <b>' + money(home.priceFrom) + '</b> <span>' + ctx.t.price.night + '</span></p>';
  }

  function wa(ctx, text) { return esc(L.waLink(ctx.site, text)); }

  /* ---------- page shell ---------- */

  function head(ctx, o) {
    var site = ctx.site, t = ctx.t, s = '';
    var canonical = L.abs(site, ctx.file);
    var ogImage = o.image || 'assets/brand/og-cover.jpg';
    s += '<!doctype html>\n<html lang="' + ctx.lang + '">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1">\n';
    s += '<title>' + esc(o.title) + '</title>\n<meta name="description" content="' + esc(o.desc || '') + '">\n';
    if (o.noindex) s += '<meta name="robots" content="noindex">\n';
    if (canonical && !o.noindex) {
      s += '<link rel="canonical" href="' + esc(canonical) + '">\n';
      L.LANGS.forEach(function (l) { s += '<link rel="alternate" hreflang="' + l + '" href="' + esc(L.abs(site, ctx.alt[l])) + '">\n'; });
      s += '<link rel="alternate" hreflang="x-default" href="' + esc(L.abs(site, ctx.alt.en)) + '">\n';
    }
    s += '<meta property="og:type" content="website">\n<meta property="og:site_name" content="' + esc(site.name) + '">\n';
    s += '<meta property="og:title" content="' + esc(o.title) + '">\n<meta property="og:description" content="' + esc(o.desc || '') + '">\n';
    s += '<meta property="og:locale" content="' + (ctx.lang === 'es' ? 'es_ES' : 'en_GB') + '">\n';
    if (canonical) s += '<meta property="og:url" content="' + esc(canonical) + '">\n';
    s += '<meta property="og:image" content="' + esc(L.abs(site, ogImage) || ogImage) + '">\n<meta name="twitter:card" content="summary_large_image">\n';
    s += '<meta name="theme-color" content="#0F2740">\n';
    s += '<link rel="icon" href="assets/brand/monogram-tile.svg" type="image/svg+xml">\n<link rel="apple-touch-icon" href="assets/brand/apple-touch-icon.png">\n';
    s += '<link rel="preload" href="assets/fonts/cormorant-garamond-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>\n';
    s += '<link rel="preload" href="assets/fonts/dm-sans-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>\n';
    (o.preloads || (o.preloadImage ? [o.preloadImage] : [])).forEach(function (pl) {
      s += '<link rel="preload" as="image" href="' + esc(pl.src) + '"' + (pl.srcset ? ' imagesrcset="' + esc(pl.srcset) + '" imagesizes="' + esc(pl.sizes) + '"' : '') + (pl.media ? ' media="' + esc(pl.media) + '"' : '') + '>\n';
    });
    s += '<link rel="stylesheet" href="css/site.css?v=' + ASSET_VERSION + '">\n';
    (o.jsonld || []).forEach(function (j) { s += '<script type="application/ld+json">' + JSON.stringify(j).replace(/</g, '\\u003c') + '</script>\n'; });
    s += '</head>\n';
    return s;
  }

  function header(ctx) {
    var t = ctx.t, s = '';
    var items = [['properties', t.nav.homes], ['benidorm', t.nav.benidorm], ['owners', t.nav.owners], ['about', t.nav.about], ['contact', t.nav.contact]];
    function cur(key) { return ctx.section === key ? ' aria-current="page"' : ''; }
    var links = items.map(function (it) { return '<a href="' + ctx.href(it[0]) + '"' + cur(it[0]) + '>' + esc(it[1]) + '</a>'; }).join('');
    var langs = L.LANGS.map(function (l) {
      return '<a href="' + esc(ctx.alt[l]) + '" lang="' + l + '" hreflang="' + l + '"' + (l === ctx.lang ? ' aria-current="true"' : '') + '>' + l.toUpperCase() + '</a>';
    }).join('');
    s += '<a class="skip" href="#main">' + esc(t.skip) + '</a>\n';
    s += '<header class="hdr">\n<div class="wrap hdr__in">\n';
    s += '<a class="brand" href="' + ctx.href('index') + '" aria-label="' + esc(ctx.site.name) + '"><img src="assets/brand/monogram-gold.svg" alt="" width="38" height="35"><span>' + esc(ctx.site.name) + '</span></a>\n';
    s += '<nav class="nav" aria-label="' + esc(t.nav.main) + '">' + links + '</nav>\n';
    s += '<div class="hdr__tools"><div class="lang" role="group" aria-label="' + esc(t.nav.language) + '">' + langs + '</div>';
    s += '<a class="btn btn--ghost btn--sm hdr__wa" href="' + wa(ctx, t.wa.general) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(t.wa.short) + '</a>';
    s += '<button class="menu-btn" type="button" aria-expanded="false" aria-controls="menu"><span class="menu-btn__open">' + icon('menu') + '<span class="sr">' + esc(t.nav.menu) + '</span></span><span class="menu-btn__close">' + icon('close') + '<span class="sr">' + esc(t.nav.close) + '</span></span></button></div>\n';
    s += '</div>\n';
    s += '<div class="menu" id="menu" hidden>\n<div class="wrap menu__in">\n<nav class="menu__nav" aria-label="' + esc(t.nav.menu) + '">' + links + '<a href="' + ctx.href('guest-info') + '"' + cur('guest-info') + '>' + esc(t.nav.guest) + '</a></nav>\n';
    s += '<div class="menu__foot"><a class="btn btn--gold" href="' + wa(ctx, t.wa.general) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(t.wa.cta) + '</a><a class="menu__tel" href="' + esc(L.telLink(ctx.site)) + '">' + esc(ctx.site.phone) + '</a><div class="lang" role="group" aria-label="' + esc(t.nav.language) + '">' + langs + '</div></div>\n';
    s += '</div>\n</div>\n</header>\n';
    return s;
  }

  function footer(ctx) {
    var t = ctx.t, site = ctx.site, s = '';
    function a(key, label) { return '<li><a href="' + ctx.href(key) + '">' + esc(label) + '</a></li>'; }
    s += '<footer class="ftr">\n<div class="wrap">\n<div class="ftr__top">\n';
    s += '<div class="ftr__brand"><a href="' + ctx.href('index') + '"><img src="assets/brand/logo-gold.svg" alt="' + esc(sentence(site.legalName) + ' ' + site.tagline) + '" width="208" height="143" loading="lazy"></a><p>' + esc(t.footer.blurb) + '</p></div>\n';
    s += '<div class="ftr__col"><h2>' + esc(t.footer.stay) + '</h2><ul>' + a('properties', t.nav.homes) + a('benidorm', t.nav.benidorm) + a('guest-info', t.nav.guest) + '</ul></div>\n';
    s += '<div class="ftr__col"><h2>' + esc(t.footer.owners) + '</h2><ul>' + a('owners', t.footer.management) + a('owner-calculator', t.nav.calc) + '</ul></div>\n';
    s += '<div class="ftr__col"><h2>' + esc(t.footer.company) + '</h2><ul>' + a('about', t.nav.about) + a('contact', t.nav.contact) + '</ul></div>\n';
    s += '<div class="ftr__col ftr__contact"><h2>' + esc(t.footer.contact) + '</h2><ul>';
    s += '<li><a href="' + wa(ctx, t.wa.general) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(site.phone) + '</a></li>';
    s += '<li><a href="mailto:' + esc(site.email) + '">' + icon('mail') + esc(site.email) + '</a></li>';
    s += '<li><span>' + icon('pin') + esc(site.locality + ', ' + site.postalCode + ', ' + (ctx.lang === 'es' ? 'España' : 'Spain')) + '</span></li>';
    [['instagram', 'Instagram'], ['facebook', 'Facebook']].forEach(function (x) {
      if (site[x[0]]) s += '<li><a href="' + esc(site[x[0]]) + '" target="_blank" rel="noopener">' + icon('external') + x[1] + '</a></li>';
    });
    s += '</ul></div>\n</div>\n';
    s += '<div class="ftr__bar"><span>© ' + ctx.year + ' ' + esc(sentence(site.legalName)) + ' ' + esc(t.footer.rights) + '.</span><span class="ftr__legal"><a href="' + ctx.href('legal') + '">' + esc(t.footer.legal) + '</a><a href="' + ctx.href('privacy') + '">' + esc(t.footer.privacy) + '</a></span><span class="ftr__tag">' + esc(site.tagline) + '</span></div>\n';
    s += '</div>\n</footer>\n';
    return s;
  }

  function page(ctx, o, body) {
    var s = head(ctx, o);
    s += '<body class="' + (o.bodyClass || '') + (o.bar ? ' has-bar' : '') + '">\n' + header(ctx);
    s += '<main id="main">\n' + body + '</main>\n' + footer(ctx);
    if (o.bar) s += o.bar;
    else if (o.fab !== false) s += '<a class="fab" href="' + wa(ctx, ctx.t.wa.general) + '" target="_blank" rel="noopener" aria-label="' + esc(ctx.t.wa.cta) + '">' + icon('whatsapp') + '</a>\n';
    s += '<script src="js/site.js?v=' + ASSET_VERSION + '" defer></script>\n</body>\n</html>\n';
    return s;
  }

  /* ---------- shared pieces ---------- */

  function card(ctx, home, opts) {
    opts = opts || {};
    var cover = home.photos[0], s = '';
    var tag = tx(home.tag, ctx.lang);
    s += '<li class="card" data-area="' + esc(home.area) + '" data-guests="' + home.guests + '" data-beds="' + home.bedrooms + '" data-price="' + home.priceFrom + '" data-order="' + opts.index + '">';
    s += '<a class="card__link" href="' + ctx.homeHref(home) + '">';
    s += '<div class="card__media">' + (cover ? homePhoto(home, cover, photoAlt(ctx, home, cover, 0), opts.sizes || '(min-width: 1000px) 30vw, (min-width: 640px) 46vw, 88vw', { small: true, eager: opts.eager }) : '<span class="card__nophoto">' + icon('home') + '</span>');
    if (tag) s += '<span class="card__tag">' + esc(tag) + '</span>';
    s += '</div>';
    s += '<div class="card__body"><div class="card__row"><h3 class="card__name">' + esc(home.name) + '</h3>' + priceHtml(ctx, home, 'card__price') + '</div>';
    s += '<p class="card__meta">' + esc(home.area) + '</p>';
    s += '<p class="card__facts">' + esc(bedsText(ctx, home) + ', ' + sleepsText(ctx, home).toLowerCase()) + '</p>';
    if (opts.summary && tx(home.summary, ctx.lang)) s += '<p class="card__sum">' + esc(tx(home.summary, ctx.lang)) + '</p>';
    s += '</div></a></li>';
    return s;
  }

  function closing(ctx, title, text, waText) {
    var t = ctx.t;
    return '<section class="sec closing">\n<div class="wrap closing__in">\n<h2 class="h2">' + esc(title || t.cta.title) + '</h2>\n' +
      '<div class="closing__side"><p class="lead">' + esc(text || t.cta.text) + '</p><p class="btns"><a class="btn btn--navy" href="' + wa(ctx, waText || t.wa.general) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(t.wa.cta) + '</a><a class="btn btn--ghost" href="' + ctx.href('contact') + '">' + esc(t.cta.contact) + '</a></p></div>\n</div>\n</section>\n';
  }

  function stars(ctx, n) {
    n = Math.max(1, Math.min(5, Math.round(Number(n) || 5)));
    var s = '<span class="stars" role="img" aria-label="' + esc(fill(ctx.t.reviews.stars, { n: n })) + '">';
    for (var i = 0; i < n; i++) s += icon('star');
    return s + '</span>';
  }

  function reviewList(ctx, list) {
    return '<ul class="reviews">' + list.map(function (r) {
      var meta = [r.origin, r.source ? fill(ctx.t.reviews.via, { source: r.source }) : '', r.date].filter(Boolean).join(', ');
      return '<li class="review"><figure>' + stars(ctx, r.rating) + '<blockquote><p>' + esc(tx(r.text, ctx.lang)) + '</p></blockquote><figcaption><b>' + esc(r.author) + '</b>' + (meta ? '<span>' + esc(meta) + '</span>' : '') + '</figcaption></figure></li>';
    }).join('') + '</ul>';
  }

  function pageHead(ctx, o) {
    var s = '<section class="phead' + (o.navy ? ' navy' : '') + '">\n<div class="wrap">\n';
    if (o.crumb) s += '<nav class="crumbs" aria-label="' + (ctx.lang === 'es' ? 'Ruta de navegación' : 'Breadcrumb') + '"><a href="' + o.crumb.href + '">' + esc(o.crumb.label) + '</a><span aria-hidden="true">/</span><span>' + esc(o.crumbHere) + '</span></nav>\n';
    s += '<h1 class="h1">' + esc(o.h1) + '</h1>\n' + (o.lead ? '<p class="lead phead__lead">' + esc(o.lead) + '</p>\n' : '') + (o.extra || '') + '</div>\n</section>\n';
    return s;
  }

  function areaInfo(ctx, area) {
    var list = ctx.t.benidorm.areas;
    for (var i = 0; i < list.length; i++) if (list[i].key === area) return list[i];
    return null;
  }

  /* ---------- home ---------- */

  function home(ctx) {
    var t = ctx.t, h = t.home, site = ctx.site, homes = ctx.homes, s = '';
    var cine = site.heroStyle === 'cinematic';
    var featured = homes.filter(function (x) { return x.featured; }).slice(0, 6);
    if (!featured.length) featured = homes.slice(0, 6);
    var areas = ctx.areas, maxGuests = 0, maxBeds = 0;
    homes.forEach(function (x) { maxGuests = Math.max(maxGuests, x.guests); maxBeds = Math.max(maxBeds, x.bedrooms); });

    var buttons = '<p class="btns"><a class="btn btn--gold" href="' + ctx.href('properties') + '">' + esc(h.browse) + '</a><a class="btn btn--ghost" href="' + wa(ctx, t.wa.general) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(t.wa.cta) + '</a></p>\n';

    // The search sits under the homes, so the first screen stays clean.
    var finder = '';
    if (homes.length) {
      finder += '<div class="find">\n<div class="find__head"><h3 class="h3">' + esc(h.finder.title) + '</h3><p>' + esc(h.finder.lead) + '</p></div>\n';
      finder += '<form class="finder" action="' + ctx.href('properties') + '" method="get" aria-label="' + esc(h.finder.title) + '">\n';
      finder += '<label class="finder__f"><span>' + esc(h.finder.area) + '</span><select name="area"><option value="">' + esc(h.finder.anyArea) + '</option>' + areas.map(function (a) { return '<option>' + esc(a) + '</option>'; }).join('') + '</select></label>\n';
      finder += '<label class="finder__f"><span>' + esc(h.finder.guests) + '</span><select name="guests"><option value="">' + esc(h.finder.anyGuests) + '</option>';
      for (var gN = 2; gN <= maxGuests; gN += 2) finder += '<option value="' + gN + '">' + esc(fill(h.finder.guestsN, { n: gN })) + '</option>';
      finder += '</select></label>\n<label class="finder__f"><span>' + esc(h.finder.beds) + '</span><select name="beds"><option value="">' + esc(h.finder.anyBeds) + '</option>';
      for (var bN = 1; bN <= maxBeds; bN++) finder += '<option value="' + bN + '">' + esc(fill(h.finder.bedsN, { n: bN })) + '</option>';
      finder += '</select></label>\n<button class="btn btn--navy" type="submit">' + esc(h.finder.go) + '</button>\n</form>\n</div>\n';
    }

    var includesList = '<dl class="deflist">' + h.includes.map(function (it) {
      return '<div><dt>' + esc(it[0]) + '</dt><dd>' + esc(fill(it[1], { from: site.checkInFrom, until: site.checkInUntil })) + '</dd></div>';
    }).join('') + '</dl>';
    var guestLink = '<a class="tlink" href="' + ctx.href('guest-info') + '">' + esc(h.includesMore) + icon('arrow') + '</a>';

    var homesSec = '';
    if (featured.length) {
      homesSec += '<section class="sec sec--homes">\n<div class="wrap">\n<div class="sechead"><h2 class="h2">' + esc(h.homesTitle) + '</h2><a class="tlink" href="' + ctx.href('properties') + '">' + esc(fill(h.homesAll, { n: homes.length })) + icon('arrow') + '</a></div>\n';
      homesSec += '<ul class="cards cards--rail">' + featured.map(function (x, i) { return card(ctx, x, { index: i, eager: false }); }).join('') + '</ul>\n' + finder + '</div>\n</section>\n';
    }
    var statsSec = '<section class="sec sec--stats">\n<div class="wrap">\n<dl class="stats">' + h.stats.map(function (st) { return '<div><dt data-countup>' + esc(st[0]) + '</dt><dd>' + esc(st[1]) + '</dd></div>'; }).join('') + '</dl>\n</div>\n</section>\n';
    var reviews = ctx.reviews.slice(0, 3);
    var reviewsSec = reviews.length ? '<section class="sec sec--line">\n<div class="wrap">\n<div class="sechead"><h2 class="h2">' + esc(h.reviewsTitle) + '</h2></div>\n' + reviewList(ctx, reviews) + '\n</div>\n</section>\n' : '';
    var ownersSec = '<section class="sec navy owners-teaser">\n<div class="wrap owners-teaser__in">\n<div>\n<h2 class="h2">' + esc(h.ownersTitle) + '</h2>\n<p class="lead">' + esc(h.ownersText) + '</p>\n<p class="btns"><a class="btn btn--gold" href="' + ctx.href('owners') + '">' + esc(h.ownersCta) + '</a><a class="btn btn--ghost" href="' + ctx.href('owner-calculator') + '">' + esc(h.ownersCalc) + '</a></p>\n</div>\n' +
      '<p class="dfig"><b data-countup>' + esc(h.ownersFigure) + '</b><span>' + esc(h.ownersFigureLabel) + '</span></p>\n</div>\n</section>\n';

    // Headline: two lines that rise into place; the gold words carry a slow shine and one small glint.
    var c = h.cine;
    var spark = '<svg class="spark" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 0c.7 6.5 4.9 10.7 12 12-7.1 1.3-11.3 5.5-12 12-.7-6.5-4.9-10.7-12-12c7.1-1.3 11.3-5.5 12-12z"/></svg>';
    var headline = '<span class="ln"><span>' + esc(c.pre) + ' <em class="shim">' + esc(c.gold) + '</em> ' + esc(c.post) + '</span></span> <span class="ln ln--2"><span><em class="shim">' + esc(c.line2) + '</em>' + spark + '</span></span>';
    var words = [site.tagline, 'Benidorm', 'Costa Blanca'].concat(areas);
    var strip = words.map(function (w) { return '<span>' + esc(w) + '</span><i>◆</i>'; }).join('');
    var marquee = '<div class="marquee" aria-hidden="true"><div class="marquee__track">' + strip + strip + '</div></div>\n';

    var preloads;
    if (cine) {
      // Full-screen video behind the headline.
      s += '<section class="cine navy">\n<div class="cine__stage">\n';
      s += '<picture class="cine__media"><source media="(max-width: 700px)" srcset="assets/video/benidorm-tall-poster.jpg"><img src="assets/video/benidorm-wide-poster.jpg" width="1600" height="900" alt="' + esc(h.videoLabel) + '" fetchpriority="high"></picture>\n';
      s += '<video data-hero-video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-src="assets/video/benidorm-wide.mp4" data-src-sm="assets/video/benidorm-tall.mp4"></video>\n<div class="cine__shade"></div>\n';
      s += '<div class="wrap cine__in">\n<p class="eyebrow">' + esc(c.eyebrow) + '</p>\n<h1 class="hl">' + headline + '</h1>\n<p class="lead">' + esc(c.lead) + '</p>\n' + buttons + '</div>\n';
      s += '<span class="cine__cue" aria-hidden="true">' + esc(c.scroll) + '</span>\n</div>\n' + marquee + '</section>\n';
      preloads = [{ src: 'assets/video/benidorm-wide-poster.jpg', media: '(min-width: 701px)' }, { src: 'assets/video/benidorm-tall-poster.jpg', media: '(max-width: 700px)' }];
    } else {
      // The video plays inside a D-shaped window, the shape of the monogram, with a gold line drawn around it.
      var sealText = site.tagline + ' · ' + site.tagline + ' · ';
      var seal = '<div class="seal" aria-hidden="true"><svg viewBox="0 0 120 120"><path id="seal-arc" fill="none" d="M60 60m-46 0a46 46 0 1 1 92 0a46 46 0 1 1-92 0"/><text><textPath href="#seal-arc" textLength="286" lengthAdjust="spacing">' + esc(sealText) + '</textPath></text></svg><img src="assets/brand/monogram-gold.svg" width="46" height="42" alt=""></div>\n';
      s += '<section class="hero navy">\n<div class="wrap hero__in">\n';
      s += '<div class="hero__copy">\n<p class="eyebrow">' + esc(c.eyebrow) + '</p>\n<h1 class="hl">' + headline + '</h1>\n<p class="lead">' + esc(c.lead) + '</p>\n' + buttons + '</div>\n';
      // the gold line round the whole D, with a small gold diamond set on each corner of the straight side
      var stageOpen = '<div class="hero__stage" data-tilt>\n<span class="hero__ring" aria-hidden="true"></span><i class="hero__gem hero__gem--t" aria-hidden="true"></i><i class="hero__gem hero__gem--b" aria-hidden="true"></i>\n<div class="hero__window">\n<div class="hero__media">\n';
      var stageClose = '</div>\n</div>\n' + seal + '</div>\n';
      s += stageOpen + '<img src="assets/video/levante-loop-poster.jpg" srcset="assets/video/levante-loop-poster-sm.jpg 640w, assets/video/levante-loop-poster.jpg 1068w" sizes="(min-width: 900px) 48vw, 100vw" width="1068" height="900" alt="' + esc(h.videoLabel) + '" fetchpriority="high">\n';
      s += '<video data-hero-video muted loop playsinline preload="none" aria-hidden="true" tabindex="-1" data-src="assets/video/levante-loop.mp4" data-src-sm="assets/video/levante-loop-sm.mp4"></video>\n' + stageClose + '</div>\n' + marquee + '</section>\n';
      preloads = [{ src: 'assets/video/levante-loop-poster.jpg', srcset: 'assets/video/levante-loop-poster-sm.jpg 640w, assets/video/levante-loop-poster.jpg 1068w', sizes: '(min-width: 900px) 48vw, 100vw' }];
    }

    s += homesSec;
    s += '<section class="sec intro">\n<div class="wrap intro__in">\n<div class="intro__media">' + siteImg('bay-from-hills', c.introAlt, '(min-width: 900px) 36vw, 80vw') + '</div>\n';
    s += '<div class="intro__text"><h2 class="h2">' + esc(c.introTitle) + '</h2>\n<p class="lead">' + esc(c.introText) + '</p>\n' + includesList + '\n' + guestLink + '</div>\n</div>\n</section>\n';
    var quote = ('“' + site.tagline + '”').split(' ').map(function (w, i) { return '<span class="w" style="--i:' + i + '"><span>' + esc(w) + '</span></span>'; }).join(' ');
    s += '<section class="band band--tall" data-parallax>\n' + siteImg('benidorm-dusk', h.benidormAlt, '100vw', { cls: 'band__img' }) + '\n<div class="band__shade"></div>\n<div class="wrap band__in">\n<p class="band__quote" lang="en">' + quote + '</p>\n<h2 class="h2">' + esc(h.benidormTitle) + '</h2>\n<p class="lead">' + esc(h.benidormText) + '</p>\n<a class="btn btn--gold" href="' + ctx.href('benidorm') + '">' + esc(h.benidormLink) + '</a>\n</div>\n</section>\n';
    s += statsSec + reviewsSec + ownersSec;

    s += closing(ctx);

    var ld = [{
      '@context': 'https://schema.org', '@type': 'LodgingBusiness', name: site.name, legalName: site.registeredName || site.legalName,
      description: h.desc, slogan: site.tagline, email: site.email, telephone: String(site.phone).replace(/\s/g, ''),
      priceRange: '€€', areaServed: 'Benidorm, Costa Blanca, Spain',
      address: { '@type': 'PostalAddress', addressLocality: site.locality, postalCode: site.postalCode, addressRegion: site.region, addressCountry: site.country }
    }];
    if (site.taxId) ld[0].taxID = site.taxId;
    if (site.url) { ld[0].url = L.abs(site, 'index.html'); ld[0].image = L.abs(site, 'assets/brand/og-cover.jpg'); ld[0].logo = L.abs(site, 'assets/brand/icon-512.png'); }
    return page(ctx, { title: h.title, desc: h.desc, bodyClass: 'p-home' + (cine ? ' p-home--cine' : ' p-home--window'), jsonld: ld, preloads: preloads }, s);
  }

  /* ---------- the collection ---------- */

  function collection(ctx) {
    var t = ctx.t, c = t.homes, homes = ctx.homes, s = '';
    var maxGuests = 0, maxBeds = 0;
    homes.forEach(function (x) { maxGuests = Math.max(maxGuests, x.guests); maxBeds = Math.max(maxBeds, x.bedrooms); });
    s += pageHead(ctx, { h1: c.h1, lead: c.lead });
    s += '<section class="sec sec--flush">\n<div class="wrap">\n';
    if (homes.length) {
      s += '<form class="filters" data-filters aria-label="' + esc(c.filters) + '">\n';
      s += '<label><span>' + esc(c.area) + '</span><select name="area"><option value="">' + esc(c.allAreas) + '</option>' + ctx.areas.map(function (a) { return '<option>' + esc(a) + '</option>'; }).join('') + '</select></label>\n';
      s += '<label><span>' + esc(c.guests) + '</span><select name="guests"><option value="">' + esc(c.anyGuests) + '</option>';
      for (var gN = 2; gN <= maxGuests; gN += 2) s += '<option value="' + gN + '">' + esc(fill(c.guestsN, { n: gN })) + '</option>';
      s += '</select></label>\n<label><span>' + esc(c.beds) + '</span><select name="beds"><option value="">' + esc(c.anyBeds) + '</option>';
      for (var bN = 1; bN <= maxBeds; bN++) s += '<option value="' + bN + '">' + esc(fill(c.bedsN, { n: bN })) + '</option>';
      s += '</select></label>\n<label><span>' + esc(c.sort) + '</span><select name="sort"><option value="">' + esc(c.sortRec) + '</option><option value="low">' + esc(c.sortLow) + '</option><option value="high">' + esc(c.sortHigh) + '</option></select></label>\n';
      s += '<p class="filters__count" data-count data-one="' + esc(c.count1) + '" data-many="' + esc(c.countN) + '" aria-live="polite">' + esc(homes.length === 1 ? c.count1 : fill(c.countN, { n: homes.length })) + '</p>\n</form>\n';
      s += '<ul class="cards cards--grid" data-cards>' + homes.map(function (x, i) { return card(ctx, x, { index: i, summary: true, eager: i < 3 }); }).join('') + '</ul>\n';
      s += '<div class="empty" data-empty hidden><p class="h3">' + esc(c.empty) + '</p><p>' + esc(c.emptyHelp) + '</p><p class="btns"><button class="btn btn--navy" type="button" data-clear>' + esc(c.clear) + '</button><a class="btn btn--ghost" href="' + wa(ctx, t.wa.general) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(t.wa.cta) + '</a></p></div>\n';
    } else {
      s += '<div class="empty"><p class="h3">' + esc(c.none) + '</p><p class="btns"><a class="btn btn--navy" href="' + wa(ctx, t.wa.general) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(t.wa.cta) + '</a></p></div>\n';
    }
    s += '</div>\n</section>\n' + closing(ctx);
    var ld = [];
    if (ctx.site.url && homes.length) ld.push({ '@context': 'https://schema.org', '@type': 'ItemList', itemListElement: homes.map(function (x, i) { return { '@type': 'ListItem', position: i + 1, name: x.name, url: L.abs(ctx.site, L.homeFile(x.id, ctx.lang)) }; }) });
    return page(ctx, { title: c.title, desc: c.desc, bodyClass: 'p-homes', jsonld: ld }, s);
  }

  /* ---------- one home ---------- */

  function homePage(ctx, home) {
    var t = ctx.t, p = t.homePage, site = ctx.site, s = '';
    var n = home.photos.length, shown = Math.min(n, 5);
    var summary = tx(home.summary, ctx.lang), desc = tx(home.description, ctx.lang), tag = tx(home.tag, ctx.lang);
    var where = [home.area, home.town].filter(Boolean).join(', ');
    var waText = fill(t.wa.home, { name: home.name, area: home.area });

    s += '<section class="hhead">\n<div class="wrap">\n';
    s += '<nav class="crumbs" aria-label="' + (ctx.lang === 'es' ? 'Ruta de navegación' : 'Breadcrumb') + '"><a href="' + ctx.href('properties') + '">' + esc(p.crumb) + '</a><span aria-hidden="true">/</span><span>' + esc(home.name) + '</span></nav>\n';
    s += '<div class="hhead__row"><div><h1 class="h1">' + esc(home.name) + '</h1><p class="hhead__where">' + icon('pin') + esc(where) + (tag ? '<span class="pill">' + esc(tag) + '</span>' : '') + '</p></div></div>\n';
    if (n) {
      s += '<div class="gal gal--' + shown + '" data-gallery aria-label="' + esc(fill(p.photos, { name: home.name })) + '">\n<div class="gal__track" data-gal-track>\n';
      home.photos.forEach(function (ph, i) {
        var alt = photoAlt(ctx, home, ph, i);
        s += '<a class="gal__item' + (i >= shown ? ' gal__item--more' : '') + '" href="' + esc(L.photoPath(home, ph)) + '" data-w="' + (ph.w || '') + '" data-h="' + (ph.h || '') + '" data-alt="' + esc(alt) + '">' +
          homePhoto(home, ph, alt, i === 0 ? '(min-width: 900px) 56vw, 88vw' : '(min-width: 900px) 28vw, 88vw', { eager: i === 0, small: i > 0 }) + '</a>\n';
      });
      s += '</div>\n';
      if (n > 1) s += '<span class="gal__count" aria-hidden="true"><b data-gal-i>1</b> / ' + n + '</span>\n';
      if (n > 1) s += '<button class="gal__all" type="button" data-gal-open>' + icon('grid') + esc(fill(p.showAll, { n: n })) + '</button>\n';
      s += '</div>\n';
    }
    s += '</div>\n</section>\n';

    s += '<section class="sec sec--home">\n<div class="wrap hgrid">\n<div class="hgrid__main">\n';
    s += '<ul class="facts">';
    s += '<li>' + icon('bed') + esc(bedsText(ctx, home)) + '</li>';
    if (home.bathrooms) s += '<li>' + icon('bath') + esc(bathsText(ctx, home)) + '</li>';
    if (home.guests) s += '<li>' + icon('users') + esc(sleepsText(ctx, home)) + '</li>';
    if (home.size) s += '<li>' + icon('size') + esc(fill(t.facts.size, { n: home.size })) + '</li>';
    s += '</ul>\n';
    if (desc || summary) {
      s += '<h2 class="h3">' + esc(p.about) + '</h2>\n<div class="prose">';
      if (summary) s += '<p class="lead">' + esc(summary) + '</p>';
      String(desc).split(/\n\s*\n/).forEach(function (par) { if (par.trim()) s += '<p>' + esc(par.trim()).replace(/\n/g, '<br>') + '</p>'; });
      s += '</div>\n';
    }
    var am = L.amenityList(home, ctx.lang);
    if (am.length) s += '<h2 class="h3">' + esc(p.inside) + '</h2>\n<ul class="amen">' + am.map(function (a) { return '<li>' + icon(a.icon) + esc(a.label) + '</li>'; }).join('') + '</ul>\n';

    s += '<h2 class="h3">' + esc(p.know) + '</h2>\n<dl class="know">';
    s += '<div><dt>' + esc(p.checkIn) + '</dt><dd>' + esc(fill(p.checkInVal, { from: site.checkInFrom, until: site.checkInUntil })) + '</dd></div>';
    s += '<div><dt>' + esc(p.checkOut) + '</dt><dd>' + esc(fill(p.checkOutVal, { out: site.checkOutBy })) + '</dd></div>';
    if (home.minNights) s += '<div><dt>' + esc(p.minStay) + '</dt><dd>' + esc(fill(home.minNights === 1 ? p.nights1 : p.nightsN, { n: home.minNights })) + '</dd></div>';
    s += '<div><dt>' + esc(p.rules) + '</dt><dd>' + esc(p.rulesVal) + '</dd></div>';
    if (home.licence) s += '<div><dt>' + esc(p.licence) + '</dt><dd>' + esc(home.licence) + '</dd></div>';
    s += '</dl>\n';

    var info = areaInfo(ctx, home.area);
    s += '<h2 class="h3">' + esc(p.where) + '</h2>\n<div class="prose"><p><b>' + esc(where) + '.</b> ' + (info ? esc(info.text) : '') + '</p><p><a class="tlink" href="' + esc(L.mapsLink(where + ', Spain')) + '" target="_blank" rel="noopener">' + esc(fill(p.map, { area: home.area })) + icon('external') + '</a></p></div>\n';

    var revs = ctx.reviews.filter(function (r) { return r.home === home.id; });
    if (revs.length) s += '<h2 class="h3">' + esc(p.reviews) + '</h2>\n' + reviewList(ctx, revs) + '\n';
    s += '</div>\n';

    // enquiry card
    s += '<aside class="enq" id="enquire" aria-label="' + esc(p.enquire) + '">\n' + priceHtml(ctx, home, 'enq__price') + '\n';
    if (home.bookingUrl) s += '<a class="btn btn--gold btn--block" href="' + esc(home.bookingUrl) + '" target="_blank" rel="noopener">' + esc(p.book) + icon('external') + '</a>\n<p class="enq__or">' + esc(p.orAsk) + '</p>\n';
    s += '<form class="enq__form" action="' + esc(L.waLink(site, '')) + '" method="get" target="_blank" data-enquiry data-wa="' + esc(L.waLink(site, '')) + '" data-msg="' + esc(fill(p.msg, { name: home.name, area: home.area })) + '" data-msg-dates="' + esc(p.msgDates) + '" data-msg-guests="' + esc(p.msgGuests) + '" data-msg-end="' + esc(p.msgEnd) + '" data-error="' + esc(p.dateError) + '" data-locale="' + (ctx.lang === 'es' ? 'es-ES' : 'en-GB') + '">\n';
    s += '<input type="hidden" name="text" value="' + esc(waText) + '">\n';
    s += '<div class="enq__dates"><label><span>' + esc(p.arrive) + '</span><input type="date" name="in" data-skip></label><label><span>' + esc(p.depart) + '</span><input type="date" name="out" data-skip></label></div>\n';
    s += '<label><span>' + esc(p.guests) + '</span><select name="guests" data-skip>';
    for (var gI = 1; gI <= Math.max(1, home.guests); gI++) s += '<option value="' + gI + '"' + (gI === Math.min(2, home.guests) ? ' selected' : '') + '>' + esc(fill(gI === 1 ? p.guest1 : p.guestN, { n: gI })) + '</option>';
    s += '</select></label>\n<p class="enq__err" data-err role="alert" hidden></p>\n';
    s += '<button class="btn ' + (home.bookingUrl ? 'btn--ghost' : 'btn--gold') + ' btn--block" type="submit">' + icon('whatsapp') + esc(p.ask) + '</button>\n</form>\n';
    s += '<p class="enq__note">' + esc(p.note) + ' ' + privacyLine(ctx) + '</p>\n<p class="enq__note">' + esc(p.rate) + '</p>\n';
    s += '<ul class="enq__alt">';
    s += '<li><a href="mailto:' + esc(site.email) + '?subject=' + encodeURIComponent(fill(p.emailSubject, { name: home.name })) + '">' + esc(p.email) + '</a></li>';
    if (home.airbnbUrl) s += '<li><a href="' + esc(home.airbnbUrl) + '" target="_blank" rel="noopener">' + esc(p.onAirbnb) + icon('external') + '</a></li>';
    if (home.bookingComUrl) s += '<li><a href="' + esc(home.bookingComUrl) + '" target="_blank" rel="noopener">' + esc(p.onBooking) + icon('external') + '</a></li>';
    s += '</ul>\n</aside>\n</div>\n</section>\n';

    var others = ctx.homes.filter(function (x) { return x.id !== home.id; });
    var same = others.filter(function (x) { return x.area === home.area; });
    var more = same.concat(others.filter(function (x) { return x.area !== home.area; })).slice(0, 3);
    if (more.length) {
      s += '<section class="sec sec--line">\n<div class="wrap">\n<div class="sechead"><h2 class="h2">' + esc(p.more) + '</h2><a class="tlink" href="' + ctx.href('properties') + '">' + esc(p.back) + icon('arrow') + '</a></div>\n';
      s += '<ul class="cards cards--rail">' + more.map(function (x, i) { return card(ctx, x, { index: i }); }).join('') + '</ul>\n</div>\n</section>\n';
    }

    // full-screen photo viewer (filled in by js/site.js)
    s += '<dialog class="lb" data-lightbox aria-label="' + esc(fill(p.photos, { name: home.name })) + '">\n<button class="lb__close" type="button" data-lb-close aria-label="' + esc(p.closeGallery) + '">' + icon('close') + '</button>\n<button class="lb__nav lb__nav--prev" type="button" data-lb-prev aria-label="' + esc(p.prev) + '">' + icon('chev-l') + '</button>\n<figure class="lb__fig"><img alt="" data-lb-img><figcaption><span data-lb-cap></span><span data-lb-n></span></figcaption></figure>\n<button class="lb__nav lb__nav--next" type="button" data-lb-next aria-label="' + esc(p.next) + '">' + icon('chev-r') + '</button>\n</dialog>\n';

    var bar = '<div class="bar" data-bar data-watch="#enquire">' + (priceHtml(ctx, home, 'bar__price') || '<span></span>') + '<a class="btn btn--gold" href="#enquire">' + esc(home.bookingUrl ? p.bookShort : p.askShort) + '</a></div>\n';

    var title = fill(p.title, { name: home.name, area: home.area });
    var metaDesc = [summary, bedsText(ctx, home) + ', ' + bathsText(ctx, home).toLowerCase() + ', ' + sleepsText(ctx, home).toLowerCase() + '.', home.priceFrom ? (ctx.t.price.from + ' ' + money(home.priceFrom) + ' ' + ctx.t.price.night + '.') : ''].filter(Boolean).join(' ');
    var ld = [{
      '@context': 'https://schema.org', '@type': 'Accommodation', name: home.name, description: summary || desc,
      address: { '@type': 'PostalAddress', addressLocality: home.town || site.locality, addressRegion: site.region, addressCountry: site.country },
      numberOfBedrooms: home.bedrooms, numberOfBathroomsTotal: home.bathrooms || undefined,
      occupancy: { '@type': 'QuantitativeValue', maxValue: home.guests },
      floorSize: home.size ? { '@type': 'QuantitativeValue', value: home.size, unitCode: 'MTK' } : undefined,
      amenityFeature: am.map(function (a) { return { '@type': 'LocationFeatureSpecification', name: a.label, value: true }; }),
      identifier: home.licence || undefined
    }];
    if (site.url) {
      ld[0].url = L.abs(site, L.homeFile(home.id, ctx.lang));
      ld[0].image = home.photos.map(function (ph) { return L.abs(site, L.photoPath(home, ph)); });
      ld.push({ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [
        { '@type': 'ListItem', position: 1, name: p.crumb, item: L.abs(site, L.pageFile('properties', ctx.lang)) },
        { '@type': 'ListItem', position: 2, name: home.name, item: L.abs(site, L.homeFile(home.id, ctx.lang)) }] });
    }
    var cover = home.photos[0];
    return page(ctx, { title: title, desc: metaDesc.slice(0, 300), bodyClass: 'p-home-detail', jsonld: ld, bar: bar,
      image: cover ? L.photoPath(home, cover) : null,
      preloadImage: cover ? { src: L.photoPath(home, cover), srcset: L.photoPath(home, cover, true) + ' ' + Math.min(800, cover.w || 800) + 'w, ' + L.photoPath(home, cover) + ' ' + (cover.w || 1600) + 'w', sizes: '(min-width: 900px) 56vw, 88vw' } : null }, s);
  }

  /* ---------- owners ---------- */

  function ownersBar(ctx, text, watch) {
    return '<div class="bar bar--single" data-bar data-watch="' + watch + '"><a class="btn btn--gold btn--block" href="' + wa(ctx, text) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(ctx.t.owners.cta) + '</a></div>\n';
  }

  function owners(ctx) {
    var t = ctx.t, o = t.owners, s = '';
    s += '<section class="ohero navy">\n<div class="wrap ohero__in">\n<div>\n<h1 class="h1">' + esc(o.h1) + '</h1>\n<p class="lead">' + esc(o.lead) + '</p>\n<p class="btns"><a class="btn btn--gold" href="' + wa(ctx, t.wa.evaluation) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(o.cta) + '</a><a class="btn btn--ghost" href="' + ctx.href('owner-calculator') + '">' + esc(o.calc) + '</a></p>\n</div>\n';
    s += '<p class="dfig"><b data-countup>' + esc(o.figure) + '</b><span>' + esc(o.figureLabel) + '</span><small>' + esc(o.figureNote) + '</small></p>\n</div>\n</section>\n';

    s += '<section class="sec">\n<div class="wrap split">\n<div class="split__head"><h2 class="h2">' + esc(o.earnTitle) + '</h2></div>\n<div class="split__body">\n';
    s += '<div class="earn"><div class="earn__row"><p>' + esc(o.earnLong) + '</p><div class="earn__bar earn__bar--low"><span></span></div><p class="earn__val"><b>' + esc(o.earnLongVal) + '</b> ' + esc(o.perMonth) + '</p></div>';
    s += '<div class="earn__row"><p>' + esc(o.earnDomia) + '</p><div class="earn__bar earn__bar--high"><span></span></div><p class="earn__val"><b>' + esc(o.earnDomiaVal) + '</b> ' + esc(o.perMonth) + '</p></div></div>\n';
    s += '<p class="earn__up">' + esc(o.earnUp) + '</p>\n<p class="small muted">' + esc(o.earnNote) + '</p>\n<p class="btns"><a class="btn btn--navy" href="' + ctx.href('owner-calculator') + '">' + esc(o.calc) + '</a></p>\n</div>\n</div>\n</section>\n';

    s += '<section class="sec sec--line">\n<div class="wrap cmp">\n';
    s += '<div class="cmp__col"><h2 class="h3">' + esc(o.realityTitle) + '</h2><ul class="ticks ticks--minus">' + o.reality.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul><p class="small muted">' + esc(o.realityNote) + '</p></div>\n';
    s += '<div class="cmp__col cmp__col--yes"><h2 class="h3">' + esc(o.oppTitle) + '</h2><ul class="ticks">' + o.opp.map(function (x) { return '<li>' + icon('check') + esc(x) + '</li>'; }).join('') + '</ul><p class="small muted">' + esc(o.oppNote) + '</p></div>\n';
    s += '</div>\n</section>\n';

    s += '<section class="sec sec--line">\n<div class="wrap split">\n<div class="split__head"><h2 class="h2">' + esc(o.priceTitle) + '</h2></div>\n<div class="split__body">\n<p class="lead">' + esc(o.priceText) + '</p>\n<ul class="ticks">' + o.pricePoints.map(function (x) { return '<li>' + icon('check') + esc(x) + '</li>'; }).join('') + '</ul>\n<p class="small muted">' + esc(o.priceNote) + '</p>\n<p class="btns"><a class="btn btn--navy" href="' + wa(ctx, t.wa.owner) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(o.talk) + '</a><a class="btn btn--ghost" href="' + ctx.href('owner-calculator') + '">' + esc(o.calc) + '</a></p>\n</div>\n</div>\n</section>\n';

    s += '<section class="sec navy">\n<div class="wrap">\n<div class="sechead sechead--stack"><h2 class="h2">' + esc(o.doTitle) + '</h2><p class="lead">' + esc(o.doLead) + '</p></div>\n<div class="svc">';
    o.groups.forEach(function (grp) {
      s += '<section class="svc__group"><h3 class="svc__title">' + esc(grp[0]) + '</h3><dl>' + grp[1].map(function (it) { return '<div><dt>' + esc(it[0]) + '</dt><dd>' + esc(it[1]) + '</dd></div>'; }).join('') + '</dl></section>';
    });
    s += '</div>\n</div>\n</section>\n';

    s += '<section class="sec">\n<div class="wrap split">\n<div class="split__head"><h2 class="h2">' + esc(o.legalTitle) + '</h2><p class="muted">' + esc(o.legalLead) + '</p></div>\n<div class="split__body">\n<ul class="chips">' + o.legalChips.map(function (c) { return '<li>' + icon('shield') + esc(c) + '</li>'; }).join('') + '</ul>\n';
    s += '<dl class="rows">' + o.legal.map(function (it) { return '<div><dt>' + esc(it[0]) + '</dt><dd>' + esc(it[1]) + '</dd></div>'; }).join('') + '</dl>\n<p class="legal-end">' + esc(o.legalEnd) + '</p>\n</div>\n</div>\n</section>\n';

    s += '<section class="sec sec--line">\n<div class="wrap split">\n<div class="split__head"><h2 class="h2">' + esc(o.stepsTitle) + '</h2></div>\n<ol class="steps split__body">' + o.steps.map(function (it) { return '<li><h3>' + esc(it[0]) + '</h3><p>' + esc(it[1]) + '</p></li>'; }).join('') + '</ol>\n</div>\n</section>\n';

    s += '<section class="sec sec--line">\n<div class="wrap split">\n<div class="split__head"><h2 class="h2">' + esc(o.fitTitle) + '</h2></div>\n<ul class="ticks ticks--grid split__body">' + o.fit.map(function (x) { return '<li>' + icon('check') + esc(x) + '</li>'; }).join('') + '</ul>\n</div>\n</section>\n';

    s += '<section class="sec navy oend">\n<div class="wrap closing__in">\n<h2 class="h2">' + esc(o.endTitle) + '</h2>\n<div class="closing__side"><p class="lead">' + esc(o.endText) + '</p><p class="btns"><a class="btn btn--gold" href="' + wa(ctx, t.wa.evaluation) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(o.endCta) + '</a><a class="btn btn--ghost" href="' + ctx.href('owner-calculator') + '">' + esc(o.calc) + '</a></p></div>\n</div>\n</section>\n';

    return page(ctx, { title: o.title, desc: o.desc, bodyClass: 'p-owners', bar: ownersBar(ctx, t.wa.evaluation, '.ohero .btns, .oend .btns') }, s);
  }

  function calculator(ctx) {
    var t = ctx.t, c = t.calc, s = '';
    var price = 1000, nights = 15, rate = 150;
    function chName(x) { return x[0] === 'direct' ? c.direct : x[0]; }
    function payout(p, fee) { return (p - p * fee / 100) * 0.8; }
    var fee0 = CHANNELS[0][1], feeAmt = price * fee0 / 100, net = price - feeAmt, domia = net * 0.2, you = net - domia;
    function neg(n) { return Math.round(n) === 0 ? '€0' : '−' + money(n); }

    s += '<section class="calc navy">\n<div class="wrap">\n';
    s += '<nav class="crumbs" aria-label="' + (ctx.lang === 'es' ? 'Ruta de navegación' : 'Breadcrumb') + '"><a href="' + ctx.href('owners') + '">' + esc(c.crumb) + '</a><span aria-hidden="true">/</span><span>' + esc(c.h1) + '</span></nav>\n';
    s += '<h1 class="h1">' + esc(c.h1) + '</h1>\n<p class="lead phead__lead">' + esc(c.lead) + '</p>\n';
    s += '<div class="calc__grid" data-calc data-fee-label="' + esc(c.flowFee) + '">\n';

    s += '<div class="calc__panel calc__panel--main">\n<div class="calc__inputs">\n<div class="range"><label for="c-price">' + esc(c.price) + '</label><output for="c-price" data-out="price">' + money(price) + '</output><input id="c-price" type="range" min="300" max="4000" step="50" value="' + price + '" data-in="price"></div>\n';
    s += '<fieldset class="chan"><legend>' + esc(c.channel) + '</legend><div class="chan__opts">' + CHANNELS.map(function (x, i) {
      return '<label><input type="radio" name="channel" value="' + i + '" data-fee="' + x[1] + '" data-name="' + esc(chName(x)) + '"' + (i === 0 ? ' checked' : '') + '><span>' + esc(chName(x)) + ' <small>' + x[1] + '%</small></span></label>';
    }).join('') + '</div></fieldset>\n</div>\n';
    s += '<ol class="flow">';
    s += '<li><span>' + esc(c.flowPrice) + '</span><b data-flow="price">' + money(price) + '</b></li>';
    s += '<li class="flow__minus"><span data-flow="feeLabel">' + esc(fill(c.flowFee, { channel: chName(CHANNELS[0]), pct: fee0 })) + '</span><b data-flow="fee">' + neg(feeAmt) + '</b></li>';
    s += '<li><span>' + esc(c.flowNet) + '</span><b data-flow="net">' + money(net) + '</b></li>';
    s += '<li class="flow__minus"><span>' + esc(c.flowDomia) + '</span><b data-flow="domia">' + neg(domia) + '</b></li>';
    s += '<li class="flow__total"><span>' + esc(c.flowYou) + '</span><b data-flow="you">' + money(you) + '</b></li></ol>\n';
    s += '<h2 class="calc__h">' + esc(c.split) + '</h2>\n<div class="splitbar" aria-hidden="true"><span class="splitbar__you" data-split="you" style="width:' + (you / price * 100).toFixed(1) + '%"></span><span class="splitbar__domia" data-split="domia" style="width:' + (domia / price * 100).toFixed(1) + '%"></span><span class="splitbar__fee" data-split="fee" style="width:' + (feeAmt / price * 100).toFixed(1) + '%"></span></div>\n';
    s += '<ul class="legend"><li class="legend__you">' + esc(c.splitYou) + ' <b data-legend="you">' + money(you) + ' (' + Math.round(you / price * 100) + '%)</b></li><li class="legend__domia">' + esc(c.splitDomia) + ' <b data-legend="domia">' + money(domia) + ' (' + Math.round(domia / price * 100) + '%)</b></li><li class="legend__fee"><span data-legend="feeName">' + esc(chName(CHANNELS[0])) + '</span> <b data-legend="fee">' + money(feeAmt) + ' (' + Math.round(feeAmt / price * 100) + '%)</b></li></ul>\n</div>\n';

    s += '<div class="calc__panel">\n<h2 class="calc__h">' + esc(c.byChannel) + '</h2>\n<ul class="chbars">' + CHANNELS.map(function (x, i) {
      var v = payout(price, x[1]);
      return '<li><span>' + esc(chName(x)) + '</span><div class="chbars__track"><span data-chbar="' + i + '" style="width:' + (v / (price * 0.8) * 100).toFixed(1) + '%"></span></div><b data-chval="' + i + '">' + money(v) + '</b></li>';
    }).join('') + '</ul>\n</div>\n';

    s += '<div class="calc__panel">\n<h2 class="calc__h">' + esc(c.year) + '</h2>\n<div class="calc__inputs">\n';
    s += '<div class="range"><label for="c-nights">' + esc(c.nights) + '</label><output for="c-nights"><span data-out="nights">' + nights + '</span> ' + esc(c.nightsUnit) + '</output><input id="c-nights" type="range" min="4" max="28" step="1" value="' + nights + '" data-in="nights"></div>\n';
    s += '<div class="range"><label for="c-rate">' + esc(c.rate) + '</label><output for="c-rate"><span data-out="rate">' + money(rate) + '</span> ' + esc(c.rateUnit) + '</output><input id="c-rate" type="range" min="50" max="400" step="5" value="' + rate + '" data-in="rate"></div>\n</div>\n';
    s += '<p class="annual"><span>' + esc(c.annual) + '</span><b><span data-out="annual">' + money(nights * rate * 12 * (1 - fee0 / 100) * 0.8) + '</span> <small>' + esc(c.perYear) + '</small></b></p>\n<p class="small calc__note">' + esc(c.note) + '</p>\n</div>\n';

    s += '</div>\n<p class="btns calc__btns"><a class="btn btn--gold" href="' + wa(ctx, t.wa.calc) + '" target="_blank" rel="noopener">' + icon('whatsapp') + esc(c.cta) + '</a><a class="btn btn--ghost" href="' + ctx.href('owners') + '">' + esc(c.back) + '</a></p>\n</div>\n</section>\n';
    return page(ctx, { title: c.title, desc: c.desc, bodyClass: 'p-calc', bar: ownersBar(ctx, t.wa.calc, '.calc__btns') }, s);
  }

  /* ---------- Benidorm guide ---------- */

  function benidorm(ctx) {
    var t = ctx.t, b = t.benidorm, s = '';
    s += '<section class="ghero" data-parallax>\n' + siteImg('levante-balcon', b.heroAlt, '100vw', { cls: 'ghero__img', eager: true }) + '\n<div class="ghero__shade"></div>\n<div class="wrap ghero__in"><h1 class="h1">' + esc(b.h1) + '</h1><p class="lead">' + esc(b.lead) + '</p></div>\n</section>\n';
    function areaLink(a) {
      var count = ctx.homes.filter(function (x) { return x.area === a.key; }).length;
      if (!count) return '';
      return '<a class="tlink" href="' + ctx.href('properties') + '?area=' + encodeURIComponent(a.key) + '">' + esc(fill(count === 1 ? b.homesIn1 : b.homesInN, { n: count, area: a.key })) + icon('arrow') + '</a>';
    }
    function goodFor(a) { return '<p class="area__good"><span>' + esc(b.goodFor) + '</span> ' + esc(a.good.charAt(0).toLowerCase() + a.good.slice(1)) + '</p>'; }
    var pictured = b.areas.filter(function (a) { return a.img; }), plain = b.areas.filter(function (a) { return !a.img; });
    s += '<section class="sec">\n<div class="wrap">\n<div class="sechead"><h2 class="h2">' + esc(b.areasTitle) + '</h2></div>\n<ul class="areas">';
    pictured.forEach(function (a) {
      s += '<li class="area"><div class="area__media">' + siteImg(a.img, a.key, '(min-width: 900px) 44vw, 92vw') + '</div>';
      s += '<div class="area__body"><h3 class="h3">' + esc(a.key) + '</h3><p>' + esc(a.text) + '</p>' + goodFor(a) + areaLink(a) + '</div></li>';
    });
    s += '</ul>\n';
    if (plain.length) s += '<dl class="deflist areas-more">' + plain.map(function (a) { return '<div><dt>' + esc(a.key) + '</dt><dd>' + esc(a.text) + goodFor(a) + areaLink(a) + '</dd></div>'; }).join('') + '</dl>\n';
    s += '</div>\n</section>\n';
    s += '<section class="sec sec--line">\n<div class="wrap split">\n<div class="split__head"><h2 class="h2">' + esc(b.doTitle) + '</h2></div>\n<dl class="deflist split__body">' + b.todo.map(function (it) { return '<div><dt>' + esc(it[0]) + '</dt><dd>' + esc(it[1]) + '</dd></div>'; }).join('') + '</dl>\n</div>\n</section>\n';
    s += '<section class="sec sec--line">\n<div class="wrap">\n<div class="sechead"><h2 class="h2">' + esc(b.picsTitle) + '</h2></div>\n<ul class="pics">' + b.pics.map(function (pc) {
      var d = IMG[pc[0]];
      return '<li class="' + (d[1] > d[0] ? 'pics__tall' : 'pics__wide') + '"><figure>' + siteImg(pc[0], pc[1], '(min-width: 900px) 30vw, 46vw') + '<figcaption>' + esc(pc[1]) + '</figcaption></figure></li>';
    }).join('') + '</ul>\n</div>\n</section>\n';
    s += closing(ctx, b.endTitle);
    return page(ctx, { title: b.title, desc: b.desc, bodyClass: 'p-benidorm', image: 'assets/img/levante-balcon.jpg',
      preloadImage: { src: 'assets/img/levante-balcon.jpg', srcset: 'assets/img/levante-balcon-sm.jpg 900w, assets/img/levante-balcon.jpg 1800w', sizes: '100vw' } }, s);
  }

  /* ---------- about ---------- */

  function about(ctx) {
    var t = ctx.t, a = t.about, s = '';
    s += pageHead(ctx, { h1: a.h1, lead: a.lead });
    s += '<section class="sec sec--flush">\n<div class="wrap story">\n<div class="story__media">' + siteImg('old-town-balcon', a.imgAlt, '(min-width: 900px) 42vw, 92vw') + '</div>\n';
    s += '<div class="story__text"><h2 class="h2 story__tag" lang="en">' + esc(a.storyTitle) + '</h2><div class="prose">' + a.story.map(function (x) { return '<p>' + esc(x) + '</p>'; }).join('') + '</div></div>\n</div>\n</section>\n';
    s += '<section class="sec sec--line">\n<div class="wrap split">\n<div class="split__head"><h2 class="h2">' + esc(a.valuesTitle) + '</h2></div>\n<dl class="deflist deflist--one split__body">' + a.values.map(function (it) { return '<div><dt>' + esc(it[0]) + '</dt><dd>' + esc(it[1]) + '</dd></div>'; }).join('') + '</dl>\n</div>\n</section>\n';
    s += closing(ctx, a.endTitle);
    return page(ctx, { title: a.title, desc: a.desc, bodyClass: 'p-about' }, s);
  }

  /* ---------- guest information ---------- */

  function guest(ctx) {
    var t = ctx.t, q = t.guest, site = ctx.site, s = '';
    var vars = { from: site.checkInFrom, until: site.checkInUntil, out: site.checkOutBy, phone: site.phone, email: site.email };
    s += pageHead(ctx, { h1: q.h1, lead: q.lead });
    s += '<section class="sec sec--flush">\n<div class="wrap split">\n<div class="split__head"><h2 class="h2">' + esc(q.everyTitle) + '</h2></div>\n<dl class="deflist split__body">' + q.every.map(function (it) { return '<div><dt>' + esc(it[0]) + '</dt><dd>' + esc(it[1]) + '</dd></div>'; }).join('') + '</dl>\n</div>\n</section>\n';
    s += '<section class="sec sec--line">\n<div class="wrap split">\n<div class="split__head"><h2 class="h2">' + esc(q.faqTitle) + '</h2></div>\n<div class="faq split__body">' + q.faq.map(function (it, i) {
      return '<details' + (i === 0 ? ' open' : '') + '><summary>' + esc(it[0]) + icon('chev-d') + '</summary><p>' + esc(fill(it[1], vars)) + '</p></details>';
    }).join('') + '</div>\n</div>\n</section>\n';
    s += '<section class="sec sec--line">\n<div class="wrap split">\n<div class="split__head"><h2 class="h2">' + esc(q.knowTitle) + '</h2></div>\n<dl class="deflist deflist--one split__body">' + q.know.map(function (it) { return '<div><dt>' + esc(it[0]) + '</dt><dd>' + esc(it[1]) + '</dd></div>'; }).join('') + '</dl>\n</div>\n</section>\n';
    s += closing(ctx, q.endTitle);
    var ld = [{ '@context': 'https://schema.org', '@type': 'FAQPage', mainEntity: q.faq.map(function (it) { return { '@type': 'Question', name: it[0], acceptedAnswer: { '@type': 'Answer', text: fill(it[1], vars) } }; }) }];
    return page(ctx, { title: q.title, desc: q.desc, bodyClass: 'p-guest', jsonld: ld }, s);
  }

  /* ---------- contact ---------- */

  function contact(ctx) {
    var t = ctx.t, c = t.contact, site = ctx.site, s = '';
    s += pageHead(ctx, { h1: c.h1, lead: c.lead });
    s += '<section class="sec sec--flush">\n<div class="wrap contact">\n<div class="contact__ways">\n<ul class="ways">';
    s += '<li><a href="' + wa(ctx, t.wa.general) + '" target="_blank" rel="noopener">' + icon('whatsapp') + '<span><small>' + esc(c.waLabel) + '</small><b>' + esc(site.phone) + '</b></span></a></li>';
    s += '<li><a href="mailto:' + esc(site.email) + '">' + icon('mail') + '<span><small>' + esc(c.emailLabel) + '</small><b>' + esc(site.email) + '</b></span></a></li>';
    s += '<li><a href="' + esc(L.telLink(site)) + '">' + icon('phone') + '<span><small>' + esc(c.phoneLabel) + '</small><b>' + esc(site.phone) + '</b></span></a></li>';
    s += '<li><div>' + icon('pin') + '<span><small>' + esc(c.based) + '</small><b>' + esc(site.locality + ', ' + site.postalCode + ', ' + (ctx.lang === 'es' ? 'España' : 'Spain')) + '</b></span></div></li>';
    s += '</ul>\n<p class="contact__owner">' + esc(c.owner) + ' <a class="tlink" href="' + ctx.href('owners') + '">' + esc(c.ownerLink) + icon('arrow') + '</a></p>\n</div>\n';
    s += '<form class="form" action="' + esc(L.waLink(site, '')) + '" method="get" target="_blank" data-contact data-wa="' + esc(L.waLink(site, '')) + '" data-email="' + esc(site.email) + '" data-subject="' + esc(c.subject) + '" data-intro="' + esc(c.msgIntro) + '" data-l-name="' + esc(c.msgName) + '" data-l-dates="' + esc(c.msgDates) + '" data-l-guests="' + esc(c.msgGuests) + '" data-l-looking="' + esc(c.msgLooking) + '">\n<h2 class="h3">' + esc(c.formTitle) + '</h2>\n';
    s += '<input type="hidden" name="text" value="' + esc(c.msgIntro) + '">\n';
    s += '<label><span>' + esc(c.name) + '</span><input type="text" name="name" autocomplete="name" placeholder="' + esc(c.namePh) + '" required data-skip></label>\n';
    s += '<div class="form__two"><label><span>' + esc(c.dates) + '</span><input type="text" name="dates" placeholder="' + esc(c.datesPh) + '" data-skip></label><label><span>' + esc(c.guests) + '</span><select name="guests" data-skip>' + c.guestOpts.map(function (g2, i) { return '<option' + (i === 1 ? ' selected' : '') + '>' + esc(g2) + '</option>'; }).join('') + '</select></label></div>\n';
    s += '<label><span>' + esc(c.message) + '</span><textarea name="message" rows="4" placeholder="' + esc(c.messagePh) + '" data-skip></textarea></label>\n';
    s += '<p class="btns"><button class="btn btn--navy" type="submit" data-send="wa">' + icon('whatsapp') + esc(c.send) + '</button><button class="btn btn--ghost" type="submit" data-send="email">' + icon('mail') + esc(c.sendEmail) + '</button></p>\n<p class="small muted">' + esc(c.note) + ' ' + privacyLine(ctx) + '</p>\n</form>\n';
    s += '</div>\n</section>\n';
    return page(ctx, { title: c.title, desc: c.desc, bodyClass: 'p-contact', fab: false }, s);
  }

  /* ---------- legal notice and privacy policy ---------- */

  // One line under every form: what the details are used for, with a link to the privacy policy.
  function privacyLine(ctx) {
    return esc(ctx.t.privacy.formNote) + ' <a href="' + ctx.href('privacy') + '">' + esc(ctx.t.footer.privacy) + '</a>.';
  }

  // The company's details, from Settings. While the company is being incorporated (no registry details yet)
  // its name says so and the tax number is marked provisional, as on the tax card.
  function companyFacts(ctx) {
    var site = ctx.site, l = ctx.t.legal, f = l.f, forming = !String(site.registryDetails || '').trim();
    var name = (site.registeredName || site.legalName) + (forming ? ' (' + l.inFormation + ')' : '');
    var rows = [[f.company, esc(name)], [f.trade, esc(site.name)]];
    if (site.taxId) rows.push([f.taxId, esc(site.taxId) + (forming ? ' (' + esc(l.provisional) + ')' : '')]);
    if (site.registeredAddress) rows.push([f.address, esc(site.registeredAddress) + ', ' + (ctx.lang === 'es' ? 'España' : 'Spain')]);
    rows.push([f.email, '<a href="mailto:' + esc(site.email) + '">' + esc(site.email) + '</a>']);
    rows.push([f.phone, '<a href="' + esc(L.telLink(site)) + '">' + esc(site.phone) + '</a>']);
    rows.push([f.registry, forming ? esc(l.registryPending) : esc(site.registryDetails)]);
    if (site.url) rows.push([f.web, esc(site.url.replace(/^https?:\/\//, ''))]);
    return { name: name, html: '<dl class="legal__facts">' + rows.map(function (r) { return '<div><dt>' + esc(r[0]) + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>' };
  }

  // Legal text: paragraphs, and lists (a list item is plain text, or [lead, text]). {tokens} become links or details.
  function legalBody(ctx, sections, vars) {
    function text(x) { return esc(x).replace(/\{(\w+)\}/g, function (m, k) { return vars[k] == null ? m : vars[k]; }); }
    return sections.map(function (sec) {
      var body = sec[1].map(function (part) {
        if (Array.isArray(part)) return '<ul>' + part.map(function (it) { return '<li>' + (Array.isArray(it) ? '<b>' + esc(it[0]) + '.</b> ' + text(it[1]) : text(it)) + '</li>'; }).join('') + '</ul>';
        var out = text(part);
        return out ? '<p>' + out + '</p>' : '';
      }).join('');
      return '<section><h2>' + esc(sec[0]) + '</h2>' + body + '</section>';
    }).join('\n');
  }

  function legalPage(ctx, copy, cardHtml, vars, bodyClass) {
    var s = pageHead(ctx, { h1: copy.h1, lead: copy.lead });
    s += '<section class="sec sec--flush">\n<div class="wrap legal">\n<aside class="legal__card"><h2 class="h3">' + esc(copy.cardTitle) + '</h2>' + cardHtml + '</aside>\n';
    s += '<div class="legal__body">\n' + legalBody(ctx, copy.sections, vars) + '\n</div>\n</div>\n</section>\n';
    return page(ctx, { title: copy.title, desc: copy.desc, bodyClass: bodyClass }, s);
  }

  function legalVars(ctx, name) {
    var site = ctx.site, l = ctx.t.legal;
    var mail = '<a href="mailto:' + esc(site.email) + '">' + esc(site.email) + '</a>';
    var booking = site.bookingSite ? esc(fill(l.booking, { booking: String(site.bookingSite).replace(/^https?:\/\//, '') })) : esc(l.bookingNoSite);
    return {
      site: esc(site.url ? site.url.replace(/^https?:\/\//, '') : site.name), name: esc(name), email: mail, booking: booking,
      // only claimed once every published home has its licence number filled in
      licences: ctx.homes.length && ctx.homes.every(function (h) { return String(h.licence || '').trim(); }) ? esc(l.licences) : '',
      privacy: '<a href="' + ctx.href('privacy') + '">' + esc(ctx.t.footer.privacy.charAt(0).toLowerCase() + ctx.t.footer.privacy.slice(1)) + '</a>',
      aepd: '<a href="https://www.aepd.es" target="_blank" rel="noopener">www.aepd.es</a>'
    };
  }

  function legal(ctx) {
    var co = companyFacts(ctx);
    return legalPage(ctx, ctx.t.legal, co.html, legalVars(ctx, co.name), 'p-legal');
  }

  function privacy(ctx) {
    var co = companyFacts(ctx), p = ctx.t.privacy, v = legalVars(ctx, co.name);
    var card = co.html + '<p class="small muted legal__note">' + esc(p.cardNote).replace('{email}', v.email) + '</p>';
    return legalPage(ctx, p, card, v, 'p-privacy');
  }

  function notFound(ctx) {
    var n = ctx.t.notFound;
    var s = '<section class="phead nf">\n<div class="wrap">\n<h1 class="h1">' + esc(n.h1) + '</h1>\n<p class="lead phead__lead">' + esc(n.text) + '</p>\n<p class="btns"><a class="btn btn--navy" href="' + ctx.href('index') + '">' + esc(n.home) + '</a><a class="btn btn--ghost" href="' + ctx.href('properties') + '">' + esc(n.homes) + '</a></p>\n</div>\n</section>\n';
    return page(ctx, { title: n.title, desc: '', bodyClass: 'p-404', noindex: true }, s);
  }

  var api = {
    ASSET_VERSION: ASSET_VERSION, IMG: IMG,
    pages: { index: home, properties: collection, owners: owners, 'owner-calculator': calculator, benidorm: benidorm, about: about, 'guest-info': guest, contact: contact, legal: legal, privacy: privacy },
    homePage: homePage, notFound: notFound
  };
  g.DomiaTemplates = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
