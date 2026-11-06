// Simulates Vercel's route matching on .vercel/output (status/Location routes, filesystem handle)
// and checks every old Wix URL ends on an existing page.   npm run build && node scripts/test-redirects.mjs
import { existsSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const STATIC = path.join(ROOT, '.vercel/output/static');
const { routes } = JSON.parse(readFileSync(path.join(ROOT, '.vercel/output/config.json'), 'utf8'));

function resolve(reqPath) {
  const headers = {};
  for (const r of routes) {
    if (r.handle === 'filesystem') {
      const p = path.join(STATIC, decodeURIComponent(reqPath.split('?')[0]));
      if (existsSync(p) && statSync(p).isFile()) return { status: 200, headers };
      if (existsSync(path.join(p, 'index.html'))) return { status: 200, headers };
      continue;
    }
    if (!r.src) continue;
    const m = new RegExp(r.src).exec(reqPath);
    if (!m) continue;
    for (const [k, v] of Object.entries(r.headers ?? {})) headers[k.toLowerCase()] = v.replace(/\$(\d)/g, (_, i) => m[i] ?? '');
    if (r.status && headers.location) return { status: r.status, headers };
    if (r.dest && r.status) return { status: r.status, headers };
    if (!r.continue && !r.status) continue;
  }
  return { status: 404, headers };
}

function follow(start) {
  let p = start;
  const hops = [];
  for (let i = 0; i < 5; i++) {
    const r = resolve(p);
    hops.push(r.status);
    if (r.status === 301 || r.status === 308) { p = r.headers.location; continue; }
    return { final: p, status: r.status, hops, headers: r.headers };
  }
  return { final: p, status: 'loop', hops };
}

const posts = JSON.parse(readFileSync(path.join(ROOT, 'src/data/wix-redirects.json'), 'utf8'));
const enc = (p) => p.split('/').map(encodeURIComponent).join('/');
const cases = [];
for (const [from, to] of Object.entries(posts)) cases.push([from, to], [enc(from), to], [enc(from) + '/', to]);
for (const [from, to] of [
  ['/keto-recipes', '/recipes'], ['/keto-blog', '/blog'], ['/about-happy-keto', '/about'], ['/contact-8', '/contact'],
  ['/ketochallenge', '/challenge'], ['/challenge-page/' + enc('קיטו4שבועות'), '/challenge'], ['/iherb-מומלצים', '/favorites'],
  [enc('/iherb-מומלצים'), '/favorites'], [enc('/מדיניותפרטיות'), '/privacy'], ['/pastry-recipes', '/recipes/category/pastry'],
  ['/paleo-recipes', '/recipes/category/paleo'], ['/keto-spread', '/recipes/category/spreads'],
  [enc('/recipes/categories/מאפים'), '/recipes/category/pastry'], ['/recipes/categories/low-carb', '/recipes/category/paleo'],
  ['/recipes/categories/low-carb-1', '/blog'], [enc('/recipes/categories/בלוג-קטוגני'), '/blog'], ['/recipes/categories/lunch-box', '/recipes'],
  ['/recipes', '/recipes'], ['/recipes/page/3', '/recipes'], ['/general-8', '/'], ['/profile/kuntsman-anna/profile', '/about'],
  ['/about/', '/about'], ['/', '/'],
  ['/en', '/en'], ['/en/about-happy-keto', '/en/about'], ['/en/contact-8', '/en/contact'], ['/en/ketochallenge', '/en/challenge'],
  [enc('/en/iherb-מומלצים'), '/en/favorites'], [enc('/en/מדיניותפרטיות'), '/en/privacy'], ['/en/challenge-page/' + enc('קיטו4שבועות'), '/en/challenge'],
  ['/en/keto-blog', '/blog'], ['/en/pastry-recipes', '/recipes/category/pastry'], ['/en/recipes', '/recipes'],
  ['/en/post/' + enc('פנקייק-קטוגני'), '/recipes/פנקייק-קטוגני'], ['/en/about', '/en/about'],
  [enc('/recipes/tags/צמחוני'), '/recipes?q=צמחוני'],
]) cases.push([from, to]);

let bad = 0;
for (const [from, expected] of cases) {
  const r = follow(from);
  const ok = r.status === 200 && decodeURIComponent(r.final) === expected;
  if (!ok) { bad++; console.log('FAIL', decodeURIComponent(from), '→', decodeURIComponent(r.final), r.status, r.hops); }
}
const sec = resolve('/').headers;
console.log(`${cases.length - bad}/${cases.length} redirect cases OK`);
console.log('security headers on /:', Object.keys(sec).filter((k) => k !== 'location').join(', '));
console.log('404 check:', resolve('/no-such-page').status, '| asset cache:', resolve('/_astro/x.js').headers['cache-control']);
process.exitCode = bad ? 1 : 0;
