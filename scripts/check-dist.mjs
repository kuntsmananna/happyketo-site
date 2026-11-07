// Post-build QA: internal links resolve, JSON-LD parses, recipe pages are complete, and the Markdown content
// (rendered as raw HTML) holds no script, event handler, javascript: URL or non-YouTube iframe.
//   npm run build && node scripts/check-dist.mjs
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
import { REVIEW_PARTS } from '../src/data/review.ts';

const DIST = path.resolve(import.meta.dirname, '../dist');
const pages = [];
(function walk(dir) {
  for (const f of readdirSync(dir)) {
    const p = path.join(dir, f);
    if (statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) pages.push(p);
  }
})(DIST);

const problems = [];
const warnings = [];
const resolves = (href) => {
  const clean = decodeURIComponent(href.split(/[?#]/)[0]);
  if (clean === '' || clean === '/') return true;
  const p = path.join(DIST, clean);
  return existsSync(p) && statSync(p).isFile() ? true : existsSync(path.join(p, 'index.html'));
};
let links = 0;
const ldTypes = {};
for (const file of pages) {
  const rel = path.relative(DIST, file);
  const html = readFileSync(file, 'utf8');
  for (const [, href] of html.matchAll(/href="(\/[^"]*)"/g)) {
    if (href.startsWith('/_astro/') || href.startsWith('/_vercel/') || href.startsWith('/videos/')) continue;
    if (href === '/admin') continue; // redirect to the Pages CMS panel (vercel-postbuild.mjs; tested by test:redirects)
    links++;
    if (!resolves(href)) problems.push(`${rel}: broken link ${decodeURIComponent(href)}`);
  }
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    try {
      for (const d of [JSON.parse(json)].flat()) {
        ldTypes[d['@type']] = (ldTypes[d['@type']] || 0) + 1;
        if (d['@type'] === 'Recipe') {
          for (const k of ['name', 'author', 'datePublished']) if (!d[k]) problems.push(`${rel}: Recipe missing ${k}`);
          // Google needs a photo for recipe rich results; a few original posts have none.
          if (!d.image) warnings.push(`${rel}: Recipe has no image (no rich result until a photo is added)`);
        }
      }
    } catch (e) {
      problems.push(`${rel}: invalid JSON-LD (${e.message})`);
    }
  }
  if (rel.startsWith('recipes/') && !rel.startsWith('recipes/category') && rel !== 'recipes/index.html') {
    if (html.includes('<!-- recipe -->')) problems.push(`${rel}: unreplaced recipe marker`);
    if (!/"@type":"Recipe"/.test(html)) problems.push(`${rel}: no Recipe JSON-LD`);
  }
}
// Content safety: posts are rendered with raw HTML allowed, so keep anything executable out of the Markdown.
const CONTENT = path.resolve(import.meta.dirname, '../src/content');
for (const dir of readdirSync(CONTENT)) {
  for (const f of readdirSync(path.join(CONTENT, dir)).filter((n) => n.endsWith('.md'))) {
    const md = readFileSync(path.join(CONTENT, dir, f), 'utf8');
    const rel = `src/content/${dir}/${f}`;
    if (/<script\b|<object\b|<embed\b|<base\b|<form\b/i.test(md)) problems.push(`${rel}: disallowed HTML element`);
    if (/<[a-z][^>]*\son[a-z]+\s*=/i.test(md)) problems.push(`${rel}: inline event handler`);
    if (/javascript:/i.test(md)) problems.push(`${rel}: javascript: URL`);
    for (const [, src] of md.matchAll(/<iframe[^>]*\ssrc="([^"]*)"/gi)) {
      if (!src.startsWith('https://www.youtube-nocookie.com/')) problems.push(`${rel}: iframe from ${src}`);
    }
  }
}
// Admin panel: the review "parts" options in .pages.yml must match src/data/review.ts (YAML can't import TS).
const pagesConfig = YAML.parse(readFileSync(path.resolve(import.meta.dirname, '../.pages.yml'), 'utf8'), { strict: false });
const expectedParts = Object.entries(REVIEW_PARTS).map(([value, { label }]) => `${value}=${label}`).join(', ');
for (const name of ['recipes', 'blog']) {
  const review = pagesConfig.content.find((c) => c.name === name)?.fields.find((f) => f.name === 'review');
  const values = review?.fields.find((f) => f.name === 'parts')?.options.values ?? [];
  const actual = values.map((v) => `${v.value}=${v.label}`).join(', ');
  if (actual !== expectedParts) problems.push(`.pages.yml ${name}.review.parts differs from src/data/review.ts:\n    yml:  ${actual}\n    code: ${expectedParts}`);
}
console.log({ pages: pages.length, internalLinks: links, jsonLd: ldTypes });
if (warnings.length) console.log('warnings:\n  ' + warnings.join('\n  '));
console.log(problems.length ? problems.slice(0, 40).join('\n') : 'no problems');
process.exitCode = problems.length ? 1 : 0;
