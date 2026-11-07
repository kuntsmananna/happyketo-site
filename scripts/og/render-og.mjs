#!/usr/bin/env node
// Branded share images (og:image, 1200×630) for every recipe and blog post: the cover photo, the title and the
// Happy Keto wordmark, rendered by Chrome (correct Hebrew shaping and RTL with the site's own fonts).
// Writes public/og/<hash>.jpg + public/og/manifest.json ({ id: { file, key } }). An entry is re-rendered only when its
// key (title + image + TEMPLATE_VERSION) changes; images of deleted entries are removed. The site uses a card only
// when its key matches the current title/image (src/lib/og.ts), otherwise it falls back to the plain photo.
//   node scripts/og/render-og.mjs [--force]
import { readFileSync, writeFileSync, existsSync, readdirSync, mkdirSync, unlinkSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const require = createRequire(import.meta.url);
const YAML = require('yaml');
const { chromium } = require('playwright');

export const TEMPLATE_VERSION = '1';
const ROOT = path.resolve(import.meta.dirname, '../..');
const OUT = path.join(ROOT, 'public/og');
const MANIFEST = path.join(OUT, 'manifest.json');
const force = process.argv.includes('--force');
const TMP = path.join(OUT, '.render.html');
const font = (p) => pathToFileURL(path.join(ROOT, 'node_modules', p)).href;
const asset = (p) => pathToFileURL(path.join(ROOT, p)).href;
const categories = { paleo: 'פליאו', pastry: 'מאפים', meat: 'בשר', fish: 'דגים', soups: 'מרקים', eggs: 'ביצים', vegetables: 'ירקות', desserts: 'קינוחים', spreads: 'ממרחים ורטבים', drinks: 'משקאות' };

/** Same key as src/lib/og.ts: changes when the title, the image or the template changes. */
export const ogKey = (title, image) => createHash('sha1').update(`${TEMPLATE_VERSION}|${title}|${image ?? ''}`).digest('hex').slice(0, 16);
const fileFor = (collection, id) => `${collection === 'recipes' ? 'r' : 'b'}-${createHash('sha1').update(id).digest('hex').slice(0, 12)}.jpg`;

const entries = ['recipes', 'blog'].flatMap((collection) =>
  readdirSync(path.join(ROOT, 'src/content', collection))
    .filter((f) => f.endsWith('.md'))
    .map((f) => {
      const src = readFileSync(path.join(ROOT, 'src/content', collection, f), 'utf8');
      const fm = YAML.parse(src.match(/^---\r?\n([\s\S]*?)\r?\n---/)[1]);
      const image = fm.image ? path.join('src/content', collection, fm.image) : null;
      return { id: `${collection}/${f.replace(/\.md$/, '')}`, collection, title: String(fm.title), image: image && existsSync(path.join(ROOT, image)) ? path.normalize(image) : null, imageRef: fm.image ?? null, chip: collection === 'recipes' ? `מתכון · ${categories[fm.category?.[0]] ?? ''}`.replace(/ · $/, '') : 'בלוג', draft: fm.draft === true };
    })
    .filter((e) => !e.draft),
);

const html = (e) => `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><style>
@font-face { font-family: Alef; font-weight: 700; src: url(${font('@fontsource/alef/files/alef-hebrew-700-normal.woff2')}) format('woff2'); unicode-range: U+0590-05FF, U+FB1D-FB4F, U+200C-2010, U+20AA, U+25CC; }
@font-face { font-family: Alef; font-weight: 700; src: url(${font('@fontsource/alef/files/alef-latin-700-normal.woff2')}) format('woff2'); }
@font-face { font-family: Syne; font-weight: 700; src: url(${font('@fontsource-variable/syne/files/syne-latin-wght-normal.woff2')}) format('woff2'); }
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; overflow: hidden; background: #235b47; font-family: Alef, sans-serif; }
.card { display: flex; width: 1200px; height: 630px; }
.panel { position: relative; width: ${e.image ? 560 : 1200}px; padding: 56px 60px; display: flex; flex-direction: column; justify-content: center; gap: 28px; color: #f3f1e4;
  background: #235b47 url(${asset('public/leaf-shadow.svg')}) no-repeat -160px -120px / 760px auto; }
.word { position: absolute; top: 52px; right: 60px; font-family: Syne; font-weight: 700; letter-spacing: .14em; font-size: 30px; color: #f1fbbd; direction: ltr; }
.chip { align-self: flex-start; background: #f9ac28; color: #124633; font-size: 26px; font-weight: 700; padding: 8px 18px; border-radius: 999px; }
h1 { font-size: ${e.title.length > 34 ? 54 : 64}px; line-height: 1.15; font-weight: 700; display: -webkit-box; -webkit-line-clamp: 4; -webkit-box-orient: vertical; overflow: hidden; text-wrap: balance; }
.site { position: absolute; bottom: 48px; right: 60px; font-size: 24px; color: #f1fbbd; opacity: .9; direction: ltr; }
.photo { flex: 1; background: #124633 center / cover no-repeat; ${e.image ? `background-image: url(${asset(e.image)});` : ''} }
.egg { position: absolute; bottom: 34px; left: -56px; width: 112px; transform: rotate(-10deg); filter: drop-shadow(0 6px 12px rgba(0,0,0,.25)); }
</style></head><body><div class="card">
<div class="panel"><div class="word">HAPPY KETO</div><span class="chip">${e.chip}</span><h1>${e.title.replace(/[&<>]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' })[c])}</h1><div class="site">happyketoforme.com</div>
${e.image ? `<img class="egg" src="${asset('src/assets/brand/sticker-happy-keto.png')}">` : ''}</div>
${e.image ? '<div class="photo"></div>' : ''}
</div></body></html>`;

mkdirSync(OUT, { recursive: true });
const manifest = existsSync(MANIFEST) ? JSON.parse(readFileSync(MANIFEST, 'utf8')) : {};
const todo = entries.filter((e) => force || manifest[e.id]?.key !== ogKey(e.title, e.imageRef) || !existsSync(path.join(OUT, manifest[e.id].file)));
console.log(`${entries.length} entries, ${todo.length} to render`);

if (todo.length) {
  const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  for (const e of todo) {
    // Load from a file:// page: Chrome only lets file:// pages use the local fonts and photos.
    writeFileSync(TMP, html(e));
    await page.goto(pathToFileURL(TMP).href, { waitUntil: 'load' });
    await page.evaluate(() => document.fonts.ready);
    const file = fileFor(e.collection, e.id);
    await page.screenshot({ path: path.join(OUT, file), type: 'jpeg', quality: 82 });
    manifest[e.id] = { file, key: ogKey(e.title, e.imageRef) };
  }
  await browser.close();
  unlinkSync(TMP);
}

// Drop entries (and images) that no longer exist.
const live = new Set(entries.map((e) => e.id));
for (const id of Object.keys(manifest)) if (!live.has(id)) delete manifest[id];
const used = new Set(Object.values(manifest).map((m) => m.file));
for (const f of readdirSync(OUT)) if (f.endsWith('.jpg') && !used.has(f)) unlinkSync(path.join(OUT, f));
writeFileSync(MANIFEST, JSON.stringify(Object.fromEntries(Object.entries(manifest).sort()), null, 2) + '\n');
console.log('done');
