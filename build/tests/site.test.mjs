// Full check of the generated site: every file reference, then every interactive feature in a real browser.
// How to run: see build/tests/README.md
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = (process.env.SITE_URL || 'http://127.0.0.1:8765/').replace(/\/?$/, '/');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const launch = () => chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }), args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const require = createRequire(import.meta.url);
require('../lib.js'); const TEXTS = fs.existsSync(ROOT + '/content/texts.json') ? JSON.parse(fs.readFileSync(ROOT + '/content/texts.json', 'utf8')) : null;
const COPY = globalThis.DomiaLib.applyTexts(require('../copy.js'), TEXTS);
const results = [];
const L_esc = (x) => globalThis.DomiaLib.esc(x);
const ok = (name, cond, extra = '') => { results.push({ name, pass: !!cond, extra }); if (!cond) console.log('FAIL ' + name + (extra ? '  — ' + extra : '')); };
const data = JSON.parse(fs.readFileSync(ROOT + '/content/properties.json', 'utf8')).properties.filter(h => h.status !== 'hidden');
const site = JSON.parse(fs.readFileSync(ROOT + '/content/site.json', 'utf8'));
const pages = fs.readdirSync(ROOT).filter(f => f.endsWith('.html')).sort();

/* ================= A. static checks on every page ================= */
let refs = 0;
for (const file of pages) {
  const html = fs.readFileSync(path.join(ROOT, file), 'utf8');
  const es = /\.es\.html$/.test(file);
  const bad = [];
  const attr = /(?:href|src|poster|data-src|data-src-sm|action)="([^"]*)"/g; let m;
  const list = [];
  while ((m = attr.exec(html))) list.push(m[1]);
  for (const mm of html.matchAll(/(?:srcset|imagesrcset)="([^"]*)"/g)) for (const part of mm[1].split(',')) list.push(part.trim().split(/\s+/)[0]);
  for (let u of list) {
    u = u.replace(/&amp;/g, '&');
    if (!u || /^(https?:|mailto:|tel:|data:)/.test(u)) continue;
    if (u.startsWith('#')) { if (!new RegExp('id="' + u.slice(1) + '"').test(html)) bad.push('missing anchor ' + u); continue; }
    refs++;
    const clean = decodeURIComponent(u.split('#')[0].split('?')[0]);
    if (!fs.existsSync(path.join(ROOT, clean))) bad.push('missing file ' + u);
  }
  ok(`${file}: every link, image and script it points to exists`, bad.length === 0, bad.slice(0, 4).join(', '));
  ok(`${file}: language attribute`, new RegExp('<html lang="' + (es ? 'es' : 'en') + '"').test(html));
  ok(`${file}: exactly one main heading`, (html.match(/<h1[\s>]/g) || []).length === 1, String((html.match(/<h1[\s>]/g) || []).length));
  const title = (html.match(/<title>(.*?)<\/title>/) || [])[1] || '';
  const desc = (html.match(/<meta name="description" content="(.*?)"/) || [])[1] || '';
  ok(`${file}: has a title`, title.length > 10, title);
  if (file !== '404.html') {
    ok(`${file}: has a description`, desc.length >= 50, desc.length + ' chars');
    ok(`${file}: canonical and language alternates`, html.includes('<link rel="canonical" href="' + site.url + '/') && (html.match(/rel="alternate" hreflang=/g) || []).length === 3);
    ok(`${file}: share image is an absolute address`, html.includes('<meta property="og:image" content="' + site.url + '/assets/'));
  }
  ok(`${file}: every image has alt text set`, !/<img(?![^>]*\balt=)[^>]*>/.test(html));
  for (const j of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) { let good = true; try { JSON.parse(j[1]); } catch (e) { good = false; } ok(`${file}: structured data is valid JSON`, good); }
  const text = html.replace(/<script[\s\S]*?<\/script>/g, '').replace(/\sdata-[a-z-]+="[^"]*"/g, '').replace(/<[^>]+>/g, ' ');
  ok(`${file}: no template leftovers`, !/\{[a-z]+\}|\bundefined\b|\bNaN\b|\[object|[Hh]iggsfield|[Ll]orem ipsum/.test(text), (text.match(/\{[a-z]+\}|\bundefined\b|\bNaN\b|\[object|[Hh]iggsfield|[Ll]orem ipsum/) || [''])[0]);
}
const titles = {}, descs = {};
for (const file of pages) { const html = fs.readFileSync(path.join(ROOT, file), 'utf8'); const t = (html.match(/<title>(.*?)<\/title>/) || [])[1]; (titles[t] = titles[t] || []).push(file); }
ok('every page has its own title', Object.values(titles).every(v => v.length === 1), Object.entries(titles).filter(([, v]) => v.length > 1).map(([k, v]) => k + ' x' + v.length).join('; '));
ok('every page exists in English and Spanish', pages.filter(f => f !== '404.html' && !f.endsWith('.es.html')).every(f => pages.includes(f.replace('.html', '.es.html'))));
ok('each published home has a page in both languages', data.filter(h => h.status !== 'hidden').every(h => pages.includes(`properties_${h.id}.html`) && pages.includes(`properties_${h.id}.es.html`)));
const css = fs.readFileSync(ROOT + '/css/site.css', 'utf8');
ok('stylesheet: every font it loads exists', [...css.matchAll(/url\((\.\.\/[^)]+)\)/g)].every(m => fs.existsSync(path.join(ROOT, 'css', m[1]))));
const sm = fs.readFileSync(ROOT + '/sitemap.xml', 'utf8');
ok('sitemap lists every page', pages.filter(f => f !== '404.html').every(f => sm.includes('<loc>' + site.url + '/' + (f === 'index.html' ? '' : f) + '</loc>')));

/* ================= B. browser checks ================= */
const browser = await launch();
const hook = () => { window.__urls = []; window.open = () => null; document.addEventListener('domia:open', e => window.__urls.push(e.detail.url)); };
async function newPage(opts) {
  const ctx = await browser.newContext(opts);
  const page = await ctx.newPage();
  page.__errors = [];
  page.on('pageerror', e => page.__errors.push('script error: ' + e.message));
  page.on('console', m => { if (m.type() === 'error') page.__errors.push('console: ' + m.text().slice(0, 140)); });
  page.on('response', r => { if (r.status() >= 400) page.__errors.push(r.status() + ' ' + r.url().replace(BASE, '')); });
  await page.addInitScript(hook);
  return page;
}
const fileOf = (page) => page.url().replace(BASE, '').split('?')[0].split('#')[0] || 'index.html';
const lastUrl = (page) => page.evaluate(() => window.__urls[window.__urls.length - 1] || null);
const D = await newPage({ viewport: { width: 1440, height: 900 } });

// --- navigation, both ways, both languages
for (const lang of ['en', 'es']) {
  const suf = lang === 'es' ? '.es.html' : '.html';
  await D.goto(BASE + 'index' + suf, { waitUntil: 'load' });
  const expected = ['properties', 'benidorm', 'owners', 'about', 'contact'];
  for (let i = 0; i < expected.length; i++) {
    await Promise.all([D.waitForNavigation(), D.locator('.nav a').nth(i).click()]);
    ok(`${lang}: menu item ${i + 1} opens ${expected[i]}${suf}`, fileOf(D) === expected[i] + suf, fileOf(D));
    ok(`${lang}: ${expected[i]} is marked as the current page`, (await D.locator('.nav a[aria-current=page]').count()) === 1);
  }
  await Promise.all([D.waitForNavigation(), D.click('.brand')]);
  ok(`${lang}: the logo goes back to the home page`, fileOf(D) === 'index' + suf);
  await D.goBack(); ok(`${lang}: the browser Back button returns to the previous page`, fileOf(D) === 'contact' + suf);
  await D.goForward(); ok(`${lang}: the browser Forward button works`, fileOf(D) === 'index' + suf);
  const footer = await D.locator('.ftr__col a[href$=".html"]').evaluateAll(a => a.map(x => x.getAttribute('href')));
  ok(`${lang}: footer links stay in the same language`, footer.length >= 7 && footer.every(h => lang === 'es' ? h.endsWith('.es.html') : !h.endsWith('.es.html')), footer.join(' '));
}
// --- language switch on every page keeps you on the same page
for (const file of pages.filter(f => f !== '404.html' && !f.endsWith('.es.html'))) {
  await D.goto(BASE + file, { waitUntil: 'load' });
  await Promise.all([D.waitForNavigation(), D.click('.hdr__tools .lang a[lang=es]')]);
  const there = fileOf(D) === file.replace('.html', '.es.html') && (await D.evaluate(() => document.documentElement.lang)) === 'es';
  await Promise.all([D.waitForNavigation(), D.click('.hdr__tools .lang a[lang=en]')]);
  ok(`language switch on ${file} goes to Spanish and back`, there && fileOf(D) === file);
}

// --- home page
await D.goto(BASE + 'index.html', { waitUntil: 'load' });
await D.waitForFunction(() => { const v = document.querySelector('[data-hero-video]'); return v && v.classList.contains('is-on') && !v.paused; }, null, { timeout: 12000 }).then(() => ok('home: the hero video starts playing', true)).catch(() => ok('home: the hero video starts playing', false));
ok('home: desktop gets the larger video', await D.evaluate(() => { const v = document.querySelector('[data-hero-video]'); return v.currentSrc.endsWith(v.dataset.src); }));
ok('home: the headline reads "Your stay on the Costa Blanca" with the two gold phrases', await D.evaluate(() => { const h = document.querySelector('h1'); return h.textContent.replace(/\s+/g, ' ').trim() === 'Your stay on the Costa Blanca' && [...h.querySelectorAll('.shim')].map(e => e.textContent).join('|') === 'stay|Costa Blanca'; }));
ok('home: the first screen is clean: the search sits under the homes, not in the hero', await D.evaluate(() => { const f = document.querySelector('.finder'), hero = document.querySelector('.hero, .cine'), cards = document.querySelector('.sec--homes .cards'); return !hero.contains(f) && !!(cards.compareDocumentPosition(f) & Node.DOCUMENT_POSITION_FOLLOWING) && f.getBoundingClientRect().top + scrollY > innerHeight; }));
ok('home: the video plays inside the D-shaped window, with the seal carrying the exact tagline', await D.evaluate((tag) => { const w = document.querySelector('.hero__window'); if (!w) return document.querySelector('.cine') ? true : false; const r = getComputedStyle(w); const seal = document.querySelector('.seal'); return w.contains(document.querySelector('[data-hero-video]')) && parseFloat(r.borderTopRightRadius) > 100 && parseFloat(r.borderTopLeftRadius) === 0 && seal.textContent.includes(tag) && seal.querySelector('img').getAttribute('src') === 'assets/brand/monogram-gold.svg'; }, site.tagline));
ok('home: shows the featured homes', (await D.locator('.sec--homes .card').count()) === Math.min(6, data.filter(h => h.status !== 'hidden' && h.featured !== false).length));
const waHrefs = await D.locator('a[href^="https://wa.me/"]').evaluateAll(a => a.map(x => x.href));
ok('home: every WhatsApp link uses the right number and a ready message', waHrefs.length >= 4 && waHrefs.every(h => h.startsWith('https://wa.me/' + site.whatsapp + '?text=')), waHrefs.length + ' links');
const pickArea = data[Math.min(1, data.length - 1)].area;
await D.selectOption('.finder select[name=area]', pickArea); await D.selectOption('.finder select[name=guests]', '2');
await Promise.all([D.waitForNavigation(), D.click('.finder button')]);
const shownAfterFinder = await D.locator('.card:not([hidden]) .card__name').allTextContents();
ok('home: the finder opens the collection already filtered', fileOf(D) === 'properties.html' && shownAfterFinder.join() === data.filter(h => h.area === pickArea && h.guests >= 2).map(h => h.name).join(), shownAfterFinder.join());

// --- the collection: filters, sorting, empty state
await D.goto(BASE + 'properties.html', { waitUntil: 'load' });
const visible = () => D.locator('.card:not([hidden]) .card__name').allTextContents();
const areas = [...new Set(data.map(h => h.area))];
let filtersOk = true;
for (const a of areas) { await D.selectOption('[data-filters] select[name=area]', a); const v = await visible(); if (v.join() !== data.filter(h => h.area === a).map(h => h.name).join()) filtersOk = false; }
ok('collection: each area filter shows exactly the homes in that area', filtersOk);
await D.selectOption('[data-filters] select[name=area]', '');
const guestOpts = (await D.locator('[data-filters] select[name=guests] option').evaluateAll(o => o.map(x => x.value))).filter(Boolean);
const bedOpts = (await D.locator('[data-filters] select[name=beds] option').evaluateAll(o => o.map(x => x.value))).filter(Boolean);
const gTop = guestOpts[guestOpts.length - 1], bTop = bedOpts[bedOpts.length - 1];
await D.selectOption('[data-filters] select[name=guests]', gTop);
ok('collection: guest filter', (await visible()).join() === data.filter(h => h.guests >= +gTop).map(h => h.name).join());
const nTop = data.filter(h => h.guests >= +gTop).length;
ok('collection: the count updates', (await D.textContent('[data-count]')).trim() === (nTop === 1 ? COPY.en.homes.count1 : COPY.en.homes.countN.replace('{n}', nTop)));
await D.selectOption('[data-filters] select[name=guests]', ''); await D.selectOption('[data-filters] select[name=beds]', bTop);
ok('collection: bedroom filter', (await visible()).join() === data.filter(h => h.bedrooms >= +bTop).map(h => h.name).join());
await D.selectOption('[data-filters] select[name=beds]', ''); await D.selectOption('[data-filters] select[name=sort]', 'low');
ok('collection: sort by price, low to high', (await visible()).join() === [...data].sort((a, b) => a.priceFrom - b.priceFrom).map(h => h.name).join());
await D.selectOption('[data-filters] select[name=sort]', 'high');
ok('collection: sort by price, high to low', (await visible()).join() === [...data].sort((a, b) => b.priceFrom - a.priceFrom).map(h => h.name).join());
ok('collection: the address bar keeps the filter so it can be shared', D.url().endsWith('?sort=high'));
await D.selectOption('[data-filters] select[name=sort]', '');
let none = null;
for (const a of areas) for (const g of guestOpts) if (!none && !data.some(h => h.area === a && h.guests >= +g)) none = [a, g];
if (none) {
  await D.selectOption('[data-filters] select[name=area]', none[0]); await D.selectOption('[data-filters] select[name=guests]', none[1]);
  ok('collection: no match shows a helpful message', await D.locator('[data-empty]').isVisible() && (await visible()).length === 0);
  await D.click('[data-clear]');
  ok('collection: "Clear filters" brings everything back', (await visible()).length === data.length && !(await D.locator('[data-empty]').isVisible()));
}
const lastArea = areas[areas.length - 1];
await D.goto(BASE + 'properties.html?area=' + encodeURIComponent(lastArea), { waitUntil: 'load' });
ok('collection: a shared filtered link opens filtered', (await visible()).join() === data.filter(h => h.area === lastArea).map(h => h.name).join());
await Promise.all([D.waitForNavigation(), D.click('.card:not([hidden]) a')]);
ok('collection: a card opens its home', fileOf(D) === `properties_${data.find(h => h.area === lastArea).id}.html`);

// --- every home page
for (const h of data) {
  await D.goto(BASE + `properties_${h.id}.html`, { waitUntil: 'load' });
  ok(`${h.name}: name, price and facts are right`, (await D.textContent('h1')).trim() === h.name && (await D.textContent('.enq__price')).includes('€' + h.priceFrom) && (await D.textContent('.facts')).includes('Sleeps ' + h.guests));
  ok(`${h.name}: shows all ${h.photos.length} photos`, (await D.locator('.gal__item').count()) === h.photos.length);
  ok(`${h.name}: all photos load`, await D.evaluate(async () => { const imgs = [...document.querySelectorAll('.gal__item:not(.gal__item--more) img')]; await Promise.all(imgs.map(i => i.complete ? 0 : new Promise(r => { i.onload = i.onerror = r; }))); return imgs.every(i => i.naturalWidth > 0); }));
  await D.click('.gal__item >> nth=0');
  ok(`${h.name}: clicking a photo opens the viewer`, await D.evaluate(() => document.querySelector('[data-lightbox]').open));
  const first = await D.getAttribute('[data-lb-img]', 'src');
  if (h.photos.length > 1) {
    await D.click('[data-lb-next]'); const second = await D.getAttribute('[data-lb-img]', 'src');
    await D.keyboard.press('ArrowRight'); const third = await D.getAttribute('[data-lb-img]', 'src');
    await D.keyboard.press('ArrowLeft'); await D.click('[data-lb-prev]');
    ok(`${h.name}: next, previous and arrow keys move through the photos`, second.endsWith(h.photos[1].file) && third.endsWith(h.photos[2 % h.photos.length].file) && (await D.getAttribute('[data-lb-img]', 'src')) === first && (await D.textContent('[data-lb-n]')) === '1 / ' + h.photos.length);
  }
  await D.keyboard.press('Escape');
  ok(`${h.name}: Escape closes the viewer`, !(await D.evaluate(() => document.querySelector('[data-lightbox]').open)));
  if (h.photos.length > 1) { await D.click('[data-gal-open]'); ok(`${h.name}: "Show all photos" opens the viewer`, await D.evaluate(() => document.querySelector('[data-lightbox]').open)); await D.click('[data-lb-close]'); }
  await D.fill('.enq input[name=in]', '2027-08-12'); await D.fill('.enq input[name=out]', '2027-08-19');
  await D.selectOption('.enq select[name=guests]', String(Math.min(h.guests, 3)));
  await D.click('.enq button[type=submit]');
  const u = await lastUrl(D), text = u ? decodeURIComponent(u.split('?text=')[1]) : '';
  ok(`${h.name}: the enquiry opens WhatsApp with the home, dates and guests filled in`, u && u.startsWith('https://wa.me/' + site.whatsapp + '?text=') && text.includes('"' + h.name + '"') && text.includes('12 Aug 2027') && text.includes('19 Aug 2027') && text.includes('We are ' + Math.min(h.guests, 3) + '.'), text);
  ok(`${h.name}: email link carries the home name`, decodeURIComponent(await D.getAttribute('.enq__alt a[href^="mailto:"]', 'href')).includes('Enquiry: ' + h.name));
  ok(`${h.name}: "More homes" never lists the home itself`, !(await D.locator('.sec--line .card__name').allTextContents()).includes(h.name));
}
await D.goto(BASE + `properties_${data[0].id}.html`, { waitUntil: 'load' });
await D.fill('.enq input[name=in]', '2027-08-19');
await D.evaluate(() => { const o = document.querySelector('.enq input[name=out]'); o.removeAttribute('min'); o.value = '2027-08-12'; });
const before = await D.evaluate(() => window.__urls.length);
await D.click('.enq button[type=submit]');
ok('enquiry: departure before arrival is refused with a message', (await D.evaluate(() => window.__urls.length)) === before && await D.locator('[data-err]').isVisible());
await D.evaluate(() => { document.querySelector('.enq input[name=in]').value = ''; document.querySelector('.enq input[name=out]').value = ''; });
await D.click('.enq button[type=submit]');
ok('enquiry: works without dates too', decodeURIComponent(await lastUrl(D)).includes('Could you confirm availability') && !decodeURIComponent(await lastUrl(D)).includes('Arrival'));
await D.goto(BASE + `properties_${data[0].id}.es.html`, { waitUntil: 'load' });
await D.fill('.enq input[name=in]', '2027-08-12'); await D.fill('.enq input[name=out]', '2027-08-19'); await D.click('.enq button[type=submit]');
const esText = decodeURIComponent((await lastUrl(D)).split('?text=')[1]);
ok('Spanish home page: the WhatsApp message is in Spanish', esText.startsWith('Hola Domia Stays') && /12 ago\.? 2027/.test(esText) && esText.includes('¿Podéis confirmarme'), esText);

// --- calculator: compare the page with the formula, across channels and values
await D.goto(BASE + 'owner-calculator.html', { waitUntil: 'load' });
const euro = n => '€' + Math.round(n).toLocaleString('en-US');
const fees = [['Airbnb', 3], ['Booking.com', 15], ['Direct', 0], ['VRBO', 8]];
let calcOk = true, calcNote = '';
for (const [price, nights, rate] of [[1000, 15, 150], [300, 4, 50], [4000, 28, 400], [1750, 21, 95]]) {
  await D.evaluate(([p, n, r]) => { const set = (sel, v) => { const el = document.querySelector(sel); el.value = v; el.dispatchEvent(new Event('input', { bubbles: true })); }; set('[data-in=price]', p); set('[data-in=nights]', n); set('[data-in=rate]', r); }, [price, nights, rate]);
  for (let i = 0; i < fees.length; i++) {
    await D.locator('.chan label').nth(i).click();
    const fee = fees[i][1], feeAmt = price * fee / 100, net = price - feeAmt, domia = net * 0.2, you = net - domia;
    const got = await D.evaluate(() => ({ price: document.querySelector('[data-flow=price]').textContent, fee: document.querySelector('[data-flow=fee]').textContent, net: document.querySelector('[data-flow=net]').textContent, domia: document.querySelector('[data-flow=domia]').textContent, you: document.querySelector('[data-flow=you]').textContent, label: document.querySelector('[data-flow=feeLabel]').textContent, annual: document.querySelector('[data-out=annual]').textContent, ch: [...document.querySelectorAll('[data-chval]')].map(e => e.textContent).join() }));
    const want = { price: euro(price), fee: Math.round(feeAmt) === 0 ? '€0' : '−' + euro(feeAmt), net: euro(net), domia: '−' + euro(domia), you: euro(you), label: `${fees[i][0]} platform fee (${fee}%)`, annual: euro(nights * rate * 12 * (1 - fee / 100) * 0.8), ch: fees.map(f => euro((price - price * f[1] / 100) * 0.8)).join() };
    if (JSON.stringify(got) !== JSON.stringify(want)) { calcOk = false; calcNote = JSON.stringify({ got, want }); }
  }
}
ok('calculator: every figure matches 20% of net after the platform fee, for 16 combinations', calcOk, calcNote);
ok('calculator: channel fees are Airbnb 3%, Booking.com 15%, Direct 0%, VRBO 8%', (await D.locator('.chan input').evaluateAll(a => a.map(x => x.dataset.name + ' ' + x.dataset.fee).join())) === 'Airbnb 3,Booking.com 15,Direct 0,VRBO 8');
const widths = await D.evaluate(() => ['you', 'domia', 'fee'].map(k => parseFloat(document.querySelector(`[data-split=${k}]`).style.width)));
ok('calculator: the "where the money goes" bar adds up to the whole booking', Math.abs(widths.reduce((a, b) => a + b, 0) - 100) < 0.3, widths.join('+'));

// --- guest information
await D.goto(BASE + 'guest-info.html', { waitUntil: 'load' });
ok('guest info: seven questions, the first one open', (await D.locator('.faq details').count()) === 7 && await D.evaluate(() => document.querySelector('.faq details').open));
await D.click('.faq details:nth-child(3) summary');
ok('guest info: a question opens when clicked', await D.evaluate(() => document.querySelector('.faq details:nth-child(3)').open) && await D.locator('.faq details:nth-child(3) p').isVisible());
await D.click('.faq details:nth-child(3) summary');
ok('guest info: and closes again', !(await D.evaluate(() => document.querySelector('.faq details:nth-child(3)').open)));
ok('guest info: check-in and check-out times come from the settings', (await D.textContent('.faq')).includes(`between ${site.checkInFrom} and ${site.checkInUntil}`) && (await D.textContent('.faq')).includes(`by ${site.checkOutBy}`));

// --- contact form
await D.goto(BASE + 'contact.html', { waitUntil: 'load' });
const n0 = await D.evaluate(() => window.__urls.length);
await D.click('[data-send=wa]');
ok('contact: the form asks for a name before sending', (await D.evaluate(() => window.__urls.length)) === n0);
await D.fill('.form input[name=name]', 'Test Person'); await D.fill('.form input[name=dates]', '12 to 19 Aug'); await D.selectOption('.form select[name=guests]', { index: 2 }); await D.fill('.form textarea', 'Sea view & a quiet street');
await D.click('[data-send=wa]');
let cu = decodeURIComponent((await lastUrl(D)) || '');
ok('contact: "Send on WhatsApp" opens WhatsApp with every field', cu.startsWith('https://wa.me/' + site.whatsapp + '?text=') && cu.includes('Name: Test Person') && cu.includes('Dates: 12 to 19 Aug') && cu.includes('Guests: 2 adults + children') && cu.includes('Looking for: Sea view & a quiet street'), cu);
await D.click('[data-send=email]');
cu = decodeURIComponent((await lastUrl(D)) || '');
ok('contact: "Send by email" opens an email with the same details', cu.startsWith('mailto:' + site.email + '?subject=Stay enquiry&body=') && cu.includes('Name: Test Person'), cu.slice(0, 120));
ok('contact: phone, email and WhatsApp links are correct', (await D.getAttribute('.ways a[href^="tel:"]', 'href')) === 'tel:' + site.phone.replace(/\s/g, '') && (await D.getAttribute('.ways a[href^="mailto:"]', 'href')) === 'mailto:' + site.email);

// --- owners
await D.goto(BASE + 'owners.html', { waitUntil: 'load' });
await D.waitForTimeout(2200); // the figure counts up when it comes on screen
ok('owners: states 20% of net revenue', (await D.textContent('.dfig')).includes('20%') && (await D.textContent('.dfig')).includes('of net revenue'));
ok('owners: twelve services, six compliance items, five onboarding steps', (await D.locator('.svc dt').count()) === 12 && (await D.locator('.chips li').count()) === 6 && (await D.locator('.steps li').count()) === 5);
await Promise.all([D.waitForNavigation(), D.click('.ohero a[href="owner-calculator.html"]')]);
ok('owners: the calculator button opens the calculator', fileOf(D) === 'owner-calculator.html');
// --- Spanish pages are fully in Spanish (brand, tagline, place names and international terms aside)
{
  const lines = async f => { await D.goto(BASE + f, { waitUntil: 'load' }); return D.evaluate(() => { document.querySelectorAll('details').forEach(d => d.open = true); const a = document.body.innerText.split('\n'); document.querySelectorAll('[alt],[aria-label],[placeholder],[title]').forEach(e => ['alt', 'aria-label', 'placeholder', 'title'].forEach(k => e.getAttribute(k) && a.push(e.getAttribute(k)))); document.querySelectorAll('option').forEach(o => a.push(o.textContent)); a.push(document.title, (document.querySelector('meta[name=description]') || {}).content || ''); return [...new Set(a.map(x => x.trim()).filter(Boolean))]; }); };
  const english = /\b(the|and|of|to|with|your|our|for|from|home|homes|at|breadcrumb|menu|close|open|search|send|name|phone|message|guests|bedrooms|area|about|contact|owners|language|skip|next|previous|photo|photos|book|read|more|show|all|any)\b/i;
  const left = [];
  for (const f of pages.filter(f => f !== '404.html' && !f.endsWith('.es.html'))) {
    const en = await lines(f), es = new Set(await lines(f.replace('.html', '.es.html')));
    for (const l of en) if (es.has(l) && english.test(l.split(site.tagline).join('')) && !data.some(h => h.name === l)) left.push(f.replace('.html', '.es.html') + ': "' + l.slice(0, 60) + '"');
  }
  ok('Spanish pages: no text left in English', left.length === 0, left.slice(0, 5).join('; '));
}

// --- every D shape keeps the proportions of a real D, on a computer and on a phone
for (const [name, vp] of [['computer', { width: 1440, height: 820 }], ['small laptop', { width: 1280, height: 640 }], ['tablet', { width: 820, height: 1100 }], ['phone', { width: 390, height: 780 }]]) {
  const P = await newPage({ viewport: vp });
  const off = [];
  for (const f of ['index.html', 'owners.html', 'about.html']) {
    await P.goto(BASE + f, { waitUntil: 'load' });
    off.push(...await P.evaluate(f => [...document.querySelectorAll('.hero__window, .intro__media, .dfig, .story__media')].map(e => { const b = e.getBoundingClientRect(), c = getComputedStyle(e), r = b.width / b.height; const fits = [...e.children].every(k => { const kb = k.getBoundingClientRect(); return e.matches('.dfig') ? kb.right <= b.right && kb.bottom <= b.bottom && kb.top >= b.top : true; }); return r >= .9 && r <= 1.12 && parseFloat(c.borderTopRightRadius) >= b.height / 2 && parseFloat(c.borderBottomRightRadius) >= b.height / 2 && parseFloat(c.borderTopLeftRadius) === 0 && b.right <= innerWidth && fits ? null : f + ' ' + e.className + ' ' + Math.round(b.width) + 'x' + Math.round(b.height); }).filter(Boolean), f));
  }
  ok(`D shapes on a ${name}: about as wide as tall, a true half circle, nothing spilling out`, off.length === 0, off.join('; '));
  await P.close();
}

// --- movement
await D.goto(BASE + 'index.html', { waitUntil: 'load' }); await D.waitForTimeout(2600);
ok('movement: the headline and buttons finish their entrance', await D.evaluate(() => [...document.querySelectorAll('.cine__in > *, .hero__copy > *')].every(e => getComputedStyle(e).opacity === '1')));
ok('movement: the gold words shine and the line around the window is drawn', await D.evaluate(() => { const names = e => getComputedStyle(e).animationName; const shim = [...document.querySelectorAll('h1 .shim')]; const ring = document.querySelector('.hero__ring'), sealSvg = document.querySelector('.seal svg'); return shim.length === 2 && shim.every(e => names(e).includes('shine') && getComputedStyle(e).color === 'rgba(0, 0, 0, 0)') && names(document.querySelector('.spark')).includes('twinkle') && (!ring || (names(ring).includes('ring-draw') && names(sealSvg).includes('spin'))); }));
ok('movement: the video window follows the pointer a little', await (async () => { const st = D.locator('[data-tilt]'); if (!(await st.count())) return true; await D.mouse.move(1300, 200); await D.waitForTimeout(250); const a = await st.evaluate(e => e.style.getPropertyValue('--px')); await D.mouse.move(120, 600); await D.waitForTimeout(250); const b = await st.evaluate(e => e.style.getPropertyValue('--px')); return parseFloat(a) > 0.5 && parseFloat(b) < -0.5; })());
ok('movement: the video window and the video stay still when the mouse moves (sharp picture, no stray lines)', await (async () => { const st = D.locator('.hero__window'); if (!(await st.count())) return true; const read = () => D.evaluate(() => { const w = document.querySelector('.hero__window'), m = document.querySelector('.hero__media'), v = m.querySelector('video').getBoundingClientRect(), b = w.getBoundingClientRect(); return { box: [b.left, b.top, b.right, b.bottom].join(), wt: getComputedStyle(w).transform, clip: getComputedStyle(w).clipPath + getComputedStyle(m).clipPath, covers: v.left <= b.left && v.top <= b.top && v.right >= b.right && v.bottom >= b.bottom, mt: getComputedStyle(m).transform, vt: getComputedStyle(m.querySelector('video')).transform }; }); await D.mouse.move(700, 400); await D.waitForTimeout(1300); const a = await read(); let good = a.wt === 'none' && a.clip === 'nonenone' && a.covers && a.mt === 'none' && a.vt === 'none'; for (const [x, y] of [[1430, 90], [1430, 700], [760, 700]]) { await D.mouse.move(x, y, { steps: 4 }); await D.waitForTimeout(1300); const b = await read(); good = good && b.box === a.box && b.wt === 'none' && b.covers && b.mt === 'none'; } return good; })());
ok('movement: content below the screen waits, then eases in when reached', await D.evaluate(async () => { const el = document.querySelector('.owners-teaser .dfig'); const before = el.classList.contains('is-in'); el.scrollIntoView({ block: 'center' }); await new Promise(r => setTimeout(r, 1500)); return !before && el.classList.contains('is-in') && getComputedStyle(el).opacity === '1'; }));
ok('movement: numbers count up to their real value', await D.evaluate(async () => { await new Promise(r => setTimeout(r, 1800)); return document.querySelector('.owners-teaser [data-countup]').textContent === '20%'; }));
ok('movement: the progress line follows the scroll', await D.evaluate(async () => { window.scrollTo(0, document.documentElement.scrollHeight); await new Promise(r => setTimeout(r, 400)); return /scaleX\((1|0\.99)/.test(document.querySelector('.progress').style.transform); }));
ok('movement: nothing is left invisible at the end of the page', await D.evaluate(async () => { for (let y = 0; y <= document.documentElement.scrollHeight; y += 500) { window.scrollTo(0, y); await new Promise(r => setTimeout(r, 80)); } await new Promise(r => setTimeout(r, 1600)); return [...document.querySelectorAll('.rv')].filter(e => !e.closest('[hidden]') && getComputedStyle(e).opacity !== '1').length; }) === 0);
const R = await newPage({ viewport: { width: 1280, height: 800 }, reducedMotion: 'reduce' });
await R.goto(BASE + 'index.html', { waitUntil: 'load' }); await R.waitForTimeout(600);
ok('movement: with "reduce motion" switched on, everything is simply shown', await R.evaluate(() => document.querySelectorAll('.rv').length === 0 && !document.querySelector('[data-hero-video]').currentSrc && getComputedStyle(document.querySelector('.owners-teaser .dfig')).opacity === '1'));
await R.context().close();
await D.goto(BASE + '404.html', { waitUntil: 'load' });
ok('missing-page screen offers a way back', (await D.locator('main a.btn').count()) === 2);
ok('desktop run: no script errors or failed requests on any page', D.__errors.length === 0, [...new Set(D.__errors)].slice(0, 6).join(' | '));

/* ---------- phone ---------- */
const M = await newPage({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
await M.goto(BASE + 'index.html', { waitUntil: 'load' });
ok('phone: the desktop menu is replaced by a menu button', !(await M.locator('.nav').isVisible()) && await M.locator('.menu-btn').isVisible());
await M.tap('.menu-btn');
ok('phone: the menu opens with all six pages', await M.locator('#menu').isVisible() && (await M.locator('.menu__nav a').count()) === 6 && (await M.getAttribute('.menu-btn', 'aria-expanded')) === 'true');
await M.tap('.menu-btn');
ok('phone: the same button closes it', !(await M.locator('#menu').isVisible()));
await M.tap('.menu-btn');
await Promise.all([M.waitForNavigation(), M.locator('.menu__nav a').nth(1).tap()]);
ok('phone: a menu link opens its page', fileOf(M) === 'benidorm.html');
await M.goto(BASE + 'index.html', { waitUntil: 'load' });
await M.waitForFunction(() => { const v = document.querySelector('[data-hero-video]'); return v && v.currentSrc; }, null, { timeout: 8000 }).catch(() => {});
ok('phone: gets the small video', await M.evaluate(() => { const v = document.querySelector('[data-hero-video]'); return v.currentSrc.endsWith(v.dataset.srcSm); }));
ok('phone: the home cards can be swiped sideways', await M.evaluate(() => { const r = document.querySelector('.cards--rail'); return r.scrollWidth > r.clientWidth + 100; }));
await M.evaluate(() => window.scrollTo(0, 1500)); await M.waitForTimeout(500);
ok('phone: the WhatsApp button appears after scrolling', await M.evaluate(() => document.querySelector('.fab').classList.contains('is-on')));
const most = [...data].sort((a, b) => b.photos.length - a.photos.length)[0], nPh = most.photos.length;
await M.goto(BASE + `properties_${most.id}.html`, { waitUntil: 'load' });
ok('phone: on a home page the menu button is visible against the header', await M.evaluate(() => { const b = document.querySelector('.menu-btn'), r = b.getBoundingClientRect(); const lum = c => { const m = c.match(/[\d.]+/g).map(Number); const f = v => { v /= 255; return v <= .03928 ? v / 12.92 : Math.pow((v + .055) / 1.055, 2.4); }; return .2126 * f(m[0]) + .7152 * f(m[1]) + .0722 * f(m[2]); }; const fg = lum(getComputedStyle(b).color), bg = lum(getComputedStyle(document.querySelector('.hdr')).backgroundColor); const ratio = (Math.max(fg, bg) + .05) / (Math.min(fg, bg) + .05); return r.width >= 40 && r.height >= 40 && r.right <= innerWidth && r.top >= 0 && getComputedStyle(b).visibility === 'visible' && ratio > 4.5 && document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2).closest('.menu-btn') === b; }));
await M.click('.menu-btn');
ok('phone: and it opens the menu there too', await M.locator('#menu').isVisible() && (await M.locator('.menu__nav a').count()) === 6);
await M.click('.menu-btn');
ok('phone: a home page shows the price bar at the bottom', await M.locator('[data-bar]').isVisible() && !(await M.evaluate(() => document.querySelector('[data-bar]').classList.contains('is-off'))));
await M.evaluate(() => { const t = document.querySelector('[data-gal-track]'); t.scrollTo({ left: t.scrollWidth, behavior: 'instant' }); }); await M.waitForTimeout(500);
ok('phone: the photo counter follows the swipe', nPh < 2 || (await M.textContent('[data-gal-i]')) === String(nPh));
await M.locator('.gal__item').nth(nPh - 1).tap();
ok('phone: tapping a photo opens it full screen', await M.evaluate(() => document.querySelector('[data-lightbox]').open) && (await M.textContent('[data-lb-n]')) === nPh + ' / ' + nPh);
const box = await M.locator('[data-lb-img]').boundingBox();
ok('phone: the full-screen photo fits the screen', box && box.width <= 390 && box.height <= 844, JSON.stringify(box));
await M.tap('[data-lb-close]');
await M.tap('[data-bar] a'); await M.waitForTimeout(900);
ok('phone: the bar jumps to the enquiry card and then hides', await M.evaluate(() => { const r = document.getElementById('enquire').getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 && document.querySelector('[data-bar]').classList.contains('is-off'); }));
await M.goto(BASE + 'owners.html', { waitUntil: 'load' }); await M.waitForTimeout(400);
ok('phone: owners page hides the bottom button while the same button is on screen', await M.evaluate(() => document.querySelector('[data-bar]').classList.contains('is-off')));
await M.evaluate(() => window.scrollTo(0, 2200)); await M.waitForTimeout(600);
ok('phone: owners page keeps a WhatsApp button at the bottom once you scroll', await M.evaluate(() => { const b = document.querySelector('[data-bar]'); return !b.classList.contains('is-off') && b.getBoundingClientRect().bottom <= innerHeight + 1; }));
ok('phone run: no script errors or failed requests', M.__errors.length === 0, [...new Set(M.__errors)].slice(0, 6).join(' | '));

/* ---------- every page at five widths: nothing wider than the screen, tap targets big enough ---------- */
const W = await newPage({ viewport: { width: 390, height: 844 } });
const wide = [], small = [];
for (const width of [320, 390, 768, 1024, 1440]) {
  await W.setViewportSize({ width, height: 900 });
  for (const file of pages) {
    await W.goto(BASE + file, { waitUntil: 'domcontentloaded' });
    const r = await W.evaluate(() => {
      const de = document.documentElement, out = { over: de.scrollWidth > de.clientWidth, small: [] };
      document.querySelectorAll('.btn, .menu-btn, .menu__nav a, summary, .chan label, select, input:not([type=hidden]):not([type=radio]), textarea').forEach(el => { const b = el.getBoundingClientRect(); if (b.width && b.height && b.height < 40) out.small.push(el.className + ' ' + Math.round(b.height)); });
      return out;
    });
    if (r.over) wide.push(width + ':' + file);
    if (r.small.length) small.push(width + ':' + file + ' ' + r.small[0]);
  }
}
ok(`no page is wider than the screen at 320, 390, 768, 1024 or 1440 px (${pages.length} pages x 5 widths)`, wide.length === 0, wide.slice(0, 6).join(', '));
ok('buttons, menu links and form fields are at least 40 px tall everywhere', small.length === 0, small.slice(0, 6).join(', '));

/* ---------- legal notice, privacy policy, cookies ---------- */
for (const [f, es] of [['legal.html', false], ['legal.es.html', true], ['privacy.html', false], ['privacy.es.html', true]]) {
  const html = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const forming = !String(site.registryDetails || '').trim();
  ok(`${f}: shows the company exactly as registered, with its tax number and registered address`, html.includes(L_esc(site.registeredName) + (forming ? (es ? ' (en constitución)' : ' (in formation)') : '')) && html.includes(site.taxId + (forming ? ' (provisional)' : '')) && html.includes(L_esc(site.registeredAddress)) && html.includes('mailto:' + site.email));
}
ok('privacy policy: names the Spanish data protection agency and says there are no cookies', ['privacy.html', 'privacy.es.html'].every(f => { const h = fs.readFileSync(path.join(ROOT, f), 'utf8'); return h.includes('https://www.aepd.es') && /cookies/i.test(h); }));
ok('every page links to the legal notice and the privacy policy in its footer', pages.every(f => { const h = fs.readFileSync(path.join(ROOT, f), 'utf8'); const es = f.endsWith('.es.html'); return h.includes('<a href="' + (es ? 'legal.es.html' : 'legal.html') + '">') && h.includes('<a href="' + (es ? 'privacy.es.html' : 'privacy.html') + '">'); }));
ok('every form that collects details links to the privacy policy', pages.filter(f => /data-(contact|enquiry)/.test(fs.readFileSync(path.join(ROOT, f), 'utf8'))).every(f => { const h = fs.readFileSync(path.join(ROOT, f), 'utf8'); return (h.match(/href="privacy(\.es)?\.html"/g) || []).length >= 2; }));
ok('no page loads anything from another website (so no consent banner is needed)', pages.every(f => !/<(script|link|img|iframe|video|source)[^>]+(src|href)="https?:\/\//.test(fs.readFileSync(path.join(ROOT, f), 'utf8').replace(/<link rel="(canonical|alternate)"[^>]*>/g, ''))));
{
  const P = await newPage({ viewport: { width: 1440, height: 900 } });
  for (const f of ['index.html', 'contact.html', 'properties.html', 'privacy.es.html']) await P.goto(BASE + f, { waitUntil: 'load' });
  ok('the site sets no cookies and stores nothing in the browser', (await P.context().cookies()).length === 0 && await P.evaluate(() => localStorage.length === 0 && sessionStorage.length === 0));
  await P.context().close();
}

/* ---------- the other home page styles (built in memory, served in place of the home page) ---------- */
require('../templates.js'); const { generate } = require('../generate.js');
const readJson = (f) => JSON.parse(fs.readFileSync(ROOT + '/content/' + f, 'utf8'));
for (const style of ['window', 'cinematic']) {
  const built = generate({ site: { ...site, heroStyle: style }, properties: readJson('properties.json'), reviews: readJson('reviews.json'), texts: TEXTS }).files;
  for (const [label, opts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true }]]) {
    const P = await newPage(opts);
    for (const f of ['index.html', 'index.es.html']) await P.route(BASE + '__style-' + f, r => r.fulfill({ contentType: 'text/html', body: built[f] }));
    for (const f of ['index.html', 'index.es.html']) {
      await P.goto(BASE + '__style-' + f, { waitUntil: 'load' }); await P.waitForTimeout(300);
      ok(`home style ${style} (${f}, ${label}): no errors and nothing wider than the screen`, !P.__errors.length && await P.evaluate(() => document.documentElement.scrollWidth <= innerWidth), P.__errors.join('; '));
    }
    await P.context().close();
  }
}
{ // with reduced motion the window and its gold line are simply there, finished
  const P = await newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' });
  await P.goto(BASE + 'index.html', { waitUntil: 'load' });
  ok('home: with reduced motion the gold line around the D shows at once, without animation', await P.evaluate(() => { const r = document.querySelector('.hero__ring'); return !r || (getComputedStyle(r).getPropertyValue('--ring').trim() === '360deg' && document.getAnimations().filter(a => a.effect && a.effect.target && a.effect.target.closest && a.effect.target.closest('.hero__stage')).length === 0); }));
  await P.context().close();
}

/* ---------- page weight of the home page ---------- */
for (const [label, opts] of [['desktop', { viewport: { width: 1440, height: 900 } }], ['phone', { viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true }]]) {
  const P = await newPage(opts); let bytes = 0, video = 0; const kinds = {};
  P.on('response', async r => { try { const b = (await r.body()).length; const u = r.url(); if (/\.mp4/.test(u)) video += b; else { bytes += b; const k = (u.split('?')[0].match(/\.(\w+)$/) || [0, 'html'])[1]; kinds[k] = (kinds[k] || 0) + b; } } catch (e) {} });
  await P.goto(BASE + 'index.html', { waitUntil: 'load' }); await P.waitForTimeout(2500);
  console.log(`weight ${label}: ${(bytes / 1024).toFixed(0)} KB before the video (${Object.entries(kinds).map(([k, v]) => k + ' ' + (v / 1024).toFixed(0)).join(', ')}), video ${(video / 1024).toFixed(0)} KB`);
  await P.context().close();
}
await browser.close();
const failed = results.filter(r => !r.pass);
console.log(`\n${results.length - failed.length}/${results.length} checks passed across ${pages.length} pages (${refs} file references followed)`);
process.exit(failed.length ? 1 : 0);
