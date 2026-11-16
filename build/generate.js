/*
 * Domia Stays website generator: turns the three content files into every page of the site.
 *
 *   DomiaBuild.generate({ site, properties, reviews })
 *     -> { files: { 'index.html': '<!doctype html>…', … }, notes: [ … ], homes: [ … ] }
 *
 * The Property Manager (admin/index.html) calls this in the browser and writes the files into
 * the website folder. `node build/cli.mjs` does the same from a terminal.
 */
(function (g) {
  'use strict';
  var L = g.DomiaLib, T = g.DomiaTemplates, COPY = g.DomiaCopy;

  // Generated property pages match this; anything matching that is no longer in `files` is stale.
  var HOME_PAGE_PATTERN = /^properties_[a-z0-9-]+(\.[a-z]{2})?\.html$/;

  function generate(data) {
    var site = data.site || {};
    var notes = [];
    var seen = {};
    var all = ((data.properties && data.properties.properties) || data.properties || []).map(L.cleanHome).filter(function (h) {
      if (!h.id) { notes.push('A home without a name was skipped.'); return false; }
      if (seen[h.id]) { notes.push('Two homes share the web address "' + h.id + '". Only the first is shown.'); return false; }
      seen[h.id] = true;
      return true;
    });
    var homes = all.filter(function (h) { return h.status === 'published'; });
    homes.forEach(function (h) {
      L.checkHome(h).forEach(function (w) { notes.push(h.name + ' ' + w + '.'); });
    });
    var reviews = ((data.reviews && data.reviews.reviews) || data.reviews || []).filter(function (r) { return r && r.author && L.tx(r.text, 'en'); });
    var areas = [];
    homes.forEach(function (h) { if (h.area && areas.indexOf(h.area) < 0) areas.push(h.area); });
    if (!site.url) notes.push('The website address is not set (Settings). Search engines and WhatsApp link previews work better once it is.');

    var files = {};
    var year = data.year || new Date().getFullYear();

    function ctxFor(lang, key, file, alt, section) {
      return {
        lang: lang, t: COPY[lang], site: site, homes: homes, reviews: reviews, areas: areas, year: year,
        key: key, file: file, alt: alt, section: section,
        href: function (k) { return L.pageFile(k, lang); },
        homeHref: function (h) { return L.homeFile(h.id, lang); }
      };
    }

    var pageKeys = Object.keys(T.pages);
    L.LANGS.forEach(function (lang) {
      pageKeys.forEach(function (key) {
        var alt = {};
        L.LANGS.forEach(function (l) { alt[l] = L.pageFile(key, l); });
        var section = key === 'owner-calculator' ? 'owners' : key;
        files[L.pageFile(key, lang)] = T.pages[key](ctxFor(lang, key, L.pageFile(key, lang), alt, section));
      });
      homes.forEach(function (h) {
        var alt = {};
        L.LANGS.forEach(function (l) { alt[l] = L.homeFile(h.id, l); });
        files[L.homeFile(h.id, lang)] = T.homePage(ctxFor(lang, 'home', L.homeFile(h.id, lang), alt, 'properties'), h);
      });
    });

    var alt404 = { en: 'index.html', es: 'index.es.html' };
    files['404.html'] = T.notFound(ctxFor('en', '404', '404.html', alt404, ''));

    // robots.txt and sitemap.xml
    var robots = 'User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /build/\nDisallow: /content/\nDisallow: /assets/originals/\n';
    if (site.url) {
      robots += '\nSitemap: ' + L.abs(site, 'sitemap.xml') + '\n';
      var urls = [];
      pageKeys.forEach(function (key) { urls.push(function (l) { return L.pageFile(key, l); }); });
      homes.forEach(function (h) { urls.push(function (l) { return L.homeFile(h.id, l); }); });
      var xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n';
      urls.forEach(function (fn) {
        L.LANGS.forEach(function (lang) {
          xml += '  <url>\n    <loc>' + L.esc(L.abs(site, fn(lang))) + '</loc>\n';
          L.LANGS.forEach(function (l) { xml += '    <xhtml:link rel="alternate" hreflang="' + l + '" href="' + L.esc(L.abs(site, fn(l))) + '"/>\n'; });
          xml += '  </url>\n';
        });
      });
      xml += '</urlset>\n';
      files['sitemap.xml'] = xml;
    }
    files['robots.txt'] = robots;

    return { files: files, notes: notes, homes: homes, allHomes: all };
  }

  var api = { generate: generate, HOME_PAGE_PATTERN: HOME_PAGE_PATTERN };
  g.DomiaBuild = api;
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
})(typeof globalThis !== 'undefined' ? globalThis : this);
