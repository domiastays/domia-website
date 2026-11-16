// Full check of the generated site: every file reference, then every interactive feature in a real browser.
// How to run: see build/tests/README.md
import fs from 'node:fs'; import path from 'node:path'; import { fileURLToPath } from 'node:url'; import { createRequire } from 'node:module';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const BASE = (process.env.SITE_URL || 'http://127.0.0.1:8765/').replace(/\/?$/, '/');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const launch = () => chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }), args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
const require = createRequire(import.meta.url);
require('../lib.js'); const COPY = require('../copy.js');
const results = [];
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
await D.waitForFunction(() => { const v = document.querySelector('.hero__window video'); return v && v.classList.contains('is-on') && !v.paused; }, null, { timeout: 12000 }).then(() => ok('home: the hero video starts playing', true)).catch(() => ok('home: the hero video starts playing', false));
ok('home: desktop gets the larger video', (await D.evaluate(() => document.querySelector('.hero__window video').currentSrc)).endsWith('benidorm-bay.mp4'));
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
ok('owners: states 20% of net revenue', (await D.textContent('.dfig')).includes('20%') && (await D.textContent('.dfig')).includes('of net revenue'));
ok('owners: twelve services, six compliance items, five onboarding steps', (await D.locator('.svc dt').count()) === 12 && (await D.locator('.chips li').count()) === 6 && (await D.locator('.steps li').count()) === 5);
await Promise.all([D.waitForNavigation(), D.click('.ohero a[href="owner-calculator.html"]')]);
ok('owners: the calculator button opens the calculator', fileOf(D) === 'owner-calculator.html');
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
await M.waitForFunction(() => { const v = document.querySelector('.hero__window video'); return v && v.currentSrc; }, null, { timeout: 8000 }).catch(() => {});
ok('phone: gets the small video', (await M.evaluate(() => document.querySelector('.hero__window video').currentSrc)).endsWith('benidorm-bay-sm.mp4'));
ok('phone: the home cards can be swiped sideways', await M.evaluate(() => { const r = document.querySelector('.cards--rail'); return r.scrollWidth > r.clientWidth + 100; }));
await M.evaluate(() => window.scrollTo(0, 1500)); await M.waitForTimeout(500);
ok('phone: the WhatsApp button appears after scrolling', await M.evaluate(() => document.querySelector('.fab').classList.contains('is-on')));
const most = [...data].sort((a, b) => b.photos.length - a.photos.length)[0], nPh = most.photos.length;
await M.goto(BASE + `properties_${most.id}.html`, { waitUntil: 'load' });
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
