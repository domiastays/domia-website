#!/usr/bin/env node
/*
 * Rebuild the website from a terminal:   node build/cli.mjs
 * (The Property Manager in admin/index.html does the same thing with a button.)
 * Needs Node 18 or newer and nothing else.
 */
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
require('./lib.js'); require('./copy.js'); require('./templates.js');
const { generate, HOME_PAGE_PATTERN } = require('./generate.js');

const read = (f) => JSON.parse(fs.readFileSync(path.join(root, 'content', f), 'utf8'));
const texts = fs.existsSync(path.join(root, 'content', 'texts.json')) ? read('texts.json') : null;
const out = generate({ site: read('site.json'), properties: read('properties.json'), reviews: read('reviews.json'), texts });

let written = 0;
for (const [name, text] of Object.entries(out.files)) {
  const file = path.join(root, name);
  if (!fs.existsSync(file) || fs.readFileSync(file, 'utf8') !== text) { fs.writeFileSync(file, text); written++; }
}
let removed = 0;
for (const name of fs.readdirSync(root)) {
  if (HOME_PAGE_PATTERN.test(name) && !(name in out.files)) { fs.unlinkSync(path.join(root, name)); removed++; }
}
if (!('sitemap.xml' in out.files) && fs.existsSync(path.join(root, 'sitemap.xml'))) { fs.unlinkSync(path.join(root, 'sitemap.xml')); removed++; }

console.log(`${Object.keys(out.files).length} files, ${written} changed, ${removed} removed, ${out.homes.length} homes published.`);
for (const n of out.notes) console.log('  note: ' + n);
