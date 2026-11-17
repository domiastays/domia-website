// End-to-end check of the property manager (admin/index.html).
// The manager normally writes into the website folder you pick. Here the browser's private file system
// stands in for that folder, filled with a copy of the real content, so nothing on disk is touched.
// How to run: see build/tests/README.md
const BASE = (process.env.SITE_URL || 'http://127.0.0.1:8765/').replace(/\/?$/, '/');
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE || 'playwright');
const SHOTS = process.env.SHOTS || '';
const results = [];
const ok = (name, cond, extra='') => { results.push({ name, pass: !!cond, extra }); console.log((cond ? 'PASS ' : 'FAIL ') + name + (extra ? '  — ' + extra : '')); };

const browser = await chromium.launch({ ...(process.env.CHROME_PATH ? { executablePath: process.env.CHROME_PATH } : { channel: 'chrome' }), args: ['--no-sandbox'] });
const shot = async (name, opts = {}) => { if (SHOTS) await page.screenshot({ path: SHOTS + '/' + name, ...opts }); };
const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errors = [];
page.on('pageerror', e => errors.push('PAGEERROR ' + e.message));
page.on('console', m => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });
await page.goto(BASE + 'admin/index.html', { waitUntil: 'load' });

// --- stand-in for the website folder: the browser's private file system, filled with the real site files
const seeded = await page.evaluate(async (BASE) => {
  const root = await navigator.storage.getDirectory();
  for await (const [name] of root.entries()) await root.removeEntry(name, { recursive: true });
  async function put(path, blob) {
    const parts = path.split('/'); const name = parts.pop(); let dir = root;
    for (const p of parts) dir = await dir.getDirectoryHandle(p, { create: true });
    const fh = await dir.getFileHandle(name, { create: true }); const w = await fh.createWritable(); await w.write(blob); await w.close();
  }
  const props = await (await fetch(BASE + 'content/properties.json')).json();
  const files = ['content/properties.json', 'content/site.json', 'content/reviews.json', 'index.html', 'properties.html', 'sitemap.xml'];
  for (const h of props.properties) {
    files.push('properties_' + h.id + '.html', 'properties_' + h.id + '.es.html');
    for (const p of h.photos) { files.push('assets/properties/' + h.id + '/' + p.file, 'assets/properties/' + h.id + '/' + p.file.replace('.jpg', '-sm.jpg')); }
  }
  for (const f of files) await put(f, await (await fetch(BASE + f)).blob());
  window.showDirectoryPicker = async () => navigator.storage.getDirectory();
  return { count: files.length, homes: props.properties.map(h => ({ id: h.id, name: h.name, photos: h.photos.length })) };
}, BASE);
const P = seeded.homes, LAST = P.length;
ok('seeded the test folder', seeded.count > 10 && P.length >= 2, seeded.count + ' files, ' + P.length + ' homes');

const read = (path) => page.evaluate(async (path) => {
  try { const parts = path.split('/'); const name = parts.pop(); let dir = await navigator.storage.getDirectory(); for (const p of parts) dir = await dir.getDirectoryHandle(p); return await (await (await dir.getFileHandle(name)).getFile()).text(); } catch (e) { return null; }
}, path);
const stat = (path) => page.evaluate(async (path) => {
  try { const parts = path.split('/'); const name = parts.pop(); let dir = await navigator.storage.getDirectory(); for (const p of parts) dir = await dir.getDirectoryHandle(p); const f = await (await dir.getFileHandle(name)).getFile(); const bmp = await createImageBitmap(f); return { size: f.size, w: bmp.width, h: bmp.height, type: f.type }; } catch (e) { return null; }
}, path);
const ls = (path) => page.evaluate(async (path) => {
  try { let dir = await navigator.storage.getDirectory(); if (path) for (const p of path.split('/')) dir = await dir.getDirectoryHandle(p); const out = []; for await (const [n] of dir.entries()) out.push(n); return out.sort(); } catch (e) { return null; }
}, path);
const saved = async () => { await page.waitForFunction(() => { const t = document.querySelector('#toast'); return t && !t.hidden && /^(Saved|Could not save)/.test(t.textContent); }, null, { timeout: 30000 }); const t = await page.textContent('#toast'); await page.evaluate(() => { document.querySelector('#toast').hidden = true; }); return t; };

// 1. connect
await shot('01-connect.png');
await page.click('[data-act=pick]');
await page.waitForSelector('.homes .home');
ok('lists the existing homes', (await page.locator('.homes .home').count()) === P.length);
await page.waitForTimeout(600);
await shot('02-homes.png', { fullPage: true });

// 2. add a home with two photos
await page.click('[data-act=new]');
await page.fill('[data-f=name]', 'Casa Azul Test');
ok('web address preview follows the name', (await page.inputValue('#slug-preview')) === 'properties_casa-azul-test.html');
// saving with missing fields must be refused with messages
await page.click('#editor button[type=submit]');
ok('refuses to save an incomplete home', (await page.locator('.err').count()) >= 3, (await page.locator('.err').allTextContents()).join(' | '));
await page.fill('[data-f=name]', 'Casa Azul Test');
await page.fill('[data-f=area]', 'Playa de Levante');
await page.fill('[data-f=priceFrom]', '120');
await page.fill('[data-f=bedrooms]', '2');
await page.fill('[data-f=bathrooms]', '1');
await page.fill('[data-f=guests]', '4');
await page.fill('[data-f=size]', '64');
await page.fill('[data-f="tag.en"]', 'New');
await page.fill('[data-f="summary.en"]', 'A test home two streets from the sand.');
await page.fill('[data-f="description.en"]', 'First paragraph of the test home.\n\nSecond paragraph, with <b>angle brackets</b> & an ampersand.');
await page.fill('[data-f="summary.es"]', 'Un alojamiento de prueba a dos calles de la arena.');
await page.check('[data-am=wifi]'); await page.check('[data-am=ac]'); await page.check('[data-am="sea-view"]');
await page.fill('#extra-en', 'Beach towels'); await page.fill('#extra-es', 'Toallas de playa');
await page.fill('[data-f=licence]', 'VT-000000-A');
const makeJpeg = async (w, h, hue) => Buffer.from(await page.evaluate(([w, h, hue]) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); const g = x.createLinearGradient(0, 0, w, h); g.addColorStop(0, `hsl(${hue} 60% 70%)`); g.addColorStop(1, `hsl(${hue + 40} 50% 35%)`); x.fillStyle = g; x.fillRect(0, 0, w, h); return c.toDataURL('image/jpeg', 0.9).split(',')[1]; }, [w, h, hue]), 'base64');
await page.setInputFiles('#pick-photos', [{ name: 'landscape.jpg', mimeType: 'image/jpeg', buffer: await makeJpeg(3000, 1876, 200) }, { name: 'portrait.jpg', mimeType: 'image/jpeg', buffer: await makeJpeg(1086, 1448, 30) }]);
await page.waitForFunction(() => document.querySelectorAll('#photos .photo').length === 2, null, { timeout: 30000 });
await page.fill('[data-f="photos.0.alt.en"]', 'Levante beach from the viewpoint');
await page.waitForTimeout(400);
await shot('03-editor.png', { fullPage: true });
await page.click('#editor button[type=submit]');
let msg = await saved();
ok('saves the new home', /^Saved/.test(msg), msg);
let props = JSON.parse(await read('content/properties.json'));
const added = props.properties.find(h => h.id === 'casa-azul-test');
ok('new home is in properties.json', !!added && added.priceFrom === 120 && added.guests === 4 && added.amenities.join() === 'wifi,ac,sea-view' && added.amenitiesExtra[0].es === 'Toallas de playa');
ok('no private fields leak into the data file', !/"_/.test(await read('content/properties.json')));
ok('photos get file names', added.photos.map(p => p.file).join() === 'casa-azul-test-01.jpg,casa-azul-test-02.jpg', JSON.stringify(added.photos.map(p => [p.file, p.w, p.h])));
ok('a 3000 px photo is scaled to 2000 px', added.photos[0].w === 2000);
const big = await stat('assets/properties/casa-azul-test/casa-azul-test-01.jpg'), small = await stat('assets/properties/casa-azul-test/casa-azul-test-01-sm.jpg');
ok('large photo is resized for the web', big && Math.max(big.w, big.h) <= 2000 && big.type === 'image/jpeg', JSON.stringify(big));
ok('small photo is 800px wide or less', small && small.w <= 800 && small.w >= 700, JSON.stringify(small));
const portrait = await stat('assets/properties/casa-azul-test/casa-azul-test-02.jpg');
ok('portrait photo keeps its shape', portrait && portrait.h > portrait.w, JSON.stringify(portrait));
let pg = await read('properties_casa-azul-test.html');
ok('its English page exists with name, price and licence', pg && pg.includes('Casa Azul Test') && pg.includes('€120') && pg.includes('VT-000000-A') && pg.includes('Beach towels'));
ok('text is escaped, not injected', pg && pg.includes('&lt;b&gt;angle brackets&lt;/b&gt; &amp; an ampersand') && !pg.includes('<b>angle brackets</b>'));
const pgEs = await read('properties_casa-azul-test.es.html');
ok('its Spanish page exists and falls back to English where Spanish is missing', pgEs && pgEs.includes('lang="es"') && pgEs.includes('Un alojamiento de prueba') && pgEs.includes('First paragraph of the test home.') && pgEs.includes('Toallas de playa'));
ok('the collection lists one more home', ((await read('properties.html')).match(/class="card"/g) || []).length === P.length + 1);
ok('the sitemap includes the new home', (await read('sitemap.xml')).includes('properties_casa-azul-test.html'));

// 3. edit: change the price and the cover photo
await page.click('.homes .home:last-child [data-act=edit]');
await page.fill('[data-f=priceFrom]', '135');
await page.waitForFunction(() => { const i = document.querySelector('[data-ph="1"]'); return i && i.naturalWidth > 0; }, null, { timeout: 15000 });
await page.click('[data-act=ph-cover][data-i="1"]');
await page.click('#editor button[type=submit]');
msg = await saved();
props = JSON.parse(await read('content/properties.json'));
const edited = props.properties.find(h => h.id === 'casa-azul-test');
ok('price change is saved', edited.priceFrom === 135 && (await read('properties_casa-azul-test.html')).includes('€135'));
ok('cover photo change is saved', edited.photos[0].file === 'casa-azul-test-02.jpg');
ok('the web address did not change on edit', edited.id === 'casa-azul-test');

// 4. remove a photo: its files leave the folder
await page.click('.homes .home:last-child [data-act=edit]');
await page.click('[data-act=ph-del][data-i="1"]');
await page.click('#editor button[type=submit]');
await saved();
ok('removed photo files are deleted', (await ls('assets/properties/casa-azul-test')).join() === 'casa-azul-test-02-sm.jpg,casa-azul-test-02.jpg', (await ls('assets/properties/casa-azul-test')).join());

// 5. hide a home: pages go, data and photos stay
const H = P[LAST - 1];
await page.click(`.homes .home:nth-child(${LAST}) [data-act=toggle]`);
await page.click('#save-all'); await saved();
ok('hidden home loses its pages', (await read(`properties_${H.id}.html`)) === null && (await read(`properties_${H.id}.es.html`)) === null);
ok('hidden home keeps its data and photos', JSON.parse(await read('content/properties.json')).properties.find(h => h.id === H.id).status === 'hidden' && (await ls('assets/properties/' + H.id)).length === H.photos * 2);
ok('hidden home is gone from the collection page', !(await read('properties.html')).includes(`properties_${H.id}.html`));
await page.click(`.homes .home:nth-child(${LAST}) [data-act=toggle]`);
await page.click('#save-all'); await saved();
ok('showing it again brings the page back', (await read(`properties_${H.id}.html`)) !== null);

// 6. reorder
await page.click('.homes .home:nth-child(2) [data-act=up]');
await page.click('#save-all'); await saved();
ok('order change is saved', JSON.parse(await read('content/properties.json')).properties[0].id === P[1].id);
await page.click('.homes .home:nth-child(2) [data-act=up]');
await page.click('#save-all'); await saved();

// 7. delete the test home
await page.click('.homes .home:last-child [data-act=del]');
await page.waitForSelector('#confirm[open]');
await shot('04-delete.png');
await page.click('#confirm-yes');
await page.click('#save-all'); await saved();
ok('deleted home: pages removed', (await read('properties_casa-azul-test.html')) === null && (await read('properties_casa-azul-test.es.html')) === null);
ok('deleted home: photo folder removed', (await ls('assets/properties/casa-azul-test')) === null);
ok('the original homes remain, in the original order', JSON.parse(await read('content/properties.json')).properties.map(h => h.id).join() === P.map(h => h.id).join());

// 8. settings
await page.click('[data-tab=settings]');
await page.fill('[data-s=checkOutBy]', '11:00');
await shot('05-settings.png', { fullPage: true });
await page.click('#save-all'); await saved();
ok('settings change reaches the pages', (await read(`properties_${P[0].id}.html`)).includes('by 11:00') && JSON.parse(await read('content/site.json')).checkOutBy === '11:00');
await page.fill('[data-s=checkOutBy]', '10:00'); await page.click('#save-all'); await saved();

// 8b. texts: change a sentence, find one by its words, put both back
await page.click('[data-tab=texts]');
await page.click('[data-act=t-group][data-g=legal]');
await page.fill('[data-tx="legal.h1"] textarea[data-t=en]', 'Legal notice, test wording');
await page.fill('[data-tx="legal.h1"] textarea[data-t=es]', 'Aviso legal, texto de prueba');
ok('a changed sentence is marked and can be undone', await page.locator('[data-tx="legal.h1"].tx--changed [data-act=t-reset]').isVisible());
await page.fill('[data-tfind]', 'check-out is by');
ok('find a sentence: typing words from the site finds it', (await page.locator('[data-tx="guest.faq.0.1"]').count()) === 1 && (await page.locator('.tx').count()) <= 4, String(await page.locator('.tx').count()));
await page.fill('[data-tx="guest.faq.0.1"] textarea[data-t=en]', 'Check-in is in the afternoon.');
ok('warns when a {placeholder} is removed', await page.locator('[data-tx="guest.faq.0.1"] .tx__warn').isVisible() && /\{from\}/.test(await page.textContent('[data-tx="guest.faq.0.1"] .tx__warn')));
await page.click('[data-tx="guest.faq.0.1"] [data-act=t-reset]');
await shot('05b-texts.png', { fullPage: true });
await page.click('#save-all'); await saved();
const tj = JSON.parse(await read('content/texts.json') || '{}');
ok('changed text is saved in content/texts.json, and only what changed', tj.en && tj.en['legal.h1'] === 'Legal notice, test wording' && tj.es['legal.h1'] === 'Aviso legal, texto de prueba' && Object.keys(tj.en).length === 1 && Object.keys(tj.es).length === 1, JSON.stringify(tj));
ok('changed text reaches the pages in both languages', (await read('legal.html') || '').includes('<h1 class="h1">Legal notice, test wording</h1>') && (await read('legal.es.html') || '').includes('Aviso legal, texto de prueba'));
await page.fill('[data-tfind]', '');
await page.click('[data-act=t-group][data-g=legal]');
await page.click('[data-tx="legal.h1"] [data-act=t-reset]');
await page.click('#save-all'); await saved();
const tj2 = JSON.parse(await read('content/texts.json') || '{}');
ok('back to the original text: the change is gone from the file and the page', Object.keys(tj2.en || {}).length === 0 && (await read('legal.html') || '').includes('<h1 class="h1">Legal notice</h1>'));

// 9. reviews
await page.click('[data-tab=reviews]');
await page.click('[data-act=rev-new]');
await page.fill('[data-r=author]', 'Test Guest'); await page.fill('[data-r=origin]', 'Leeds'); await page.selectOption('[data-r=source]', 'Airbnb');
await page.fill('[data-r="text.en"]', 'A placeholder review used only by the automated test.');
await page.click('#save-all'); await saved();
ok('a review appears on the home page', (await read('index.html')).includes('A placeholder review used only by the automated test.') && (await read('index.html')).includes('via Airbnb'));
await page.click('[data-act=rev-del]'); await page.click('#save-all'); await saved();
ok('removing the review removes the section', !(await read('index.html')).includes('class="reviews"'));

// 10. the content files end up byte-identical to the originals after undoing everything
const same = await page.evaluate(async ([BASE, ids]) => {
  const root = await navigator.storage.getDirectory(); const out = {};
  for (const f of ['properties.json', 'site.json', 'reviews.json']) { const mine = await (await (await (await root.getDirectoryHandle('content')).getFileHandle(f)).getFile()).text(); const orig = await (await fetch(BASE + 'content/' + f)).text(); out[f] = mine === orig; }
  for (const f of ['index.html', 'properties.html', `properties_${ids[1]}.es.html`]) { const mine = await (await (await root.getFileHandle(f)).getFile()).text(); const orig = await (await fetch(BASE + f)).text(); out[f] = mine === orig; }
  return out;
}, [BASE, P.map(h => h.id)]);
ok('after undoing every change, data and pages match the originals exactly', Object.values(same).every(Boolean), JSON.stringify(same));

// 11. help tab renders, reload remembers the folder
await page.click('[data-tab=help]');
await shot('06-help.png', { fullPage: true });
// The private test file system cannot be read back from the browser's memory of folders (it stops this
// test browser), so forget it before reloading. Real folders chosen in Chrome do not have this limit.
await page.evaluate(() => new Promise((res) => { const r = indexedDB.deleteDatabase('domia-property-manager'); r.onsuccess = r.onerror = r.onblocked = () => res(); }));
await page.reload({ waitUntil: 'load' });
await page.waitForSelector('[data-act=pick]', { timeout: 8000 }).then(() => ok('after a reload the manager starts cleanly and offers to open the folder', true)).catch(() => ok('after a reload the manager starts cleanly and offers to open the folder', false));
// Note: "open the same folder again" relies on Chrome keeping a real folder handle between visits.
// The private test file system used here cannot be stored that way, so that one convenience is not covered by this test.

// self-healing start: if a previous visit died while reading the remembered folder, the next one must still start
const p2 = await ctx.newPage();
await p2.addInitScript(() => { try { localStorage.setItem('domia-pm-reading-folder', '1'); } catch (e) {} });
await p2.goto(BASE + 'admin/index.html', { waitUntil: 'load' });
await p2.waitForSelector('[data-act=pick]', { timeout: 8000 }).then(() => ok('starts even if the remembered folder could not be read last time', true)).catch(() => ok('starts even if the remembered folder could not be read last time', false));
ok('and it forgets that folder instead of failing again', (await p2.locator('[data-act=reconnect]').count()) === 0);
await p2.close();

ok('no script errors in the manager', errors.length === 0, errors.slice(0, 5).join(' || '));
await browser.close();
const failed = results.filter(r => !r.pass);
console.log('\n' + (results.length - failed.length) + '/' + results.length + ' checks passed');
process.exit(failed.length ? 1 : 0);
