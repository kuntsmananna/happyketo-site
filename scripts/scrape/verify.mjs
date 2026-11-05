// Check that every text fragment of each original post appears in its generated .md file.
//   npm run scrape:verify   (uses the page cache from `npm run scrape`)
import { readFileSync, existsSync } from 'node:fs';
import { fetchCached, sitemapUrls } from './fetch.mjs';
import { parsePost } from './parse-post.mjs';
import { overrides } from './overrides.mjs';
const GENERIC = /^ה?(מצרכים|מרכיבים|רכיבים|חומרים|אופן\s+(ה)?הכנה|הוראות\s+(ה)?הכנה|ה?הכנה|איך\s+מכינים)\s*:?$/;
const norm = (s) => s.replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1').replace(/<[^>]+>/g, '').replace(/\\([*_\[\]#>.\-+!`])/g, '$1').replace(/[*_`"'״׳]/g, '').replace(/\s+/g, ' ').trim();
const urls = await sitemapUrls('https://www.happyketoforme.com/blog-posts-sitemap.xml');
let missingTotal = 0, postsWithMissing = 0;
const stats = { withIng: 0, withSteps: 0, recipes: 0 };
for (const u of urls) {
  const p = parsePost(await fetchCached(u), u);
  if (overrides[p.slug]) continue; // hand-structured on purpose
  const file = ['recipes', 'blog'].map((d) => `src/content/${d}/${p.slug}.md`).find(existsSync);
  const raw = readFileSync(file, 'utf8');
  const md = norm(raw.replace(/\\"/g, '"'));
  if (file.includes('/recipes/')) { stats.recipes++; if (/^ingredients:\n/m.test(raw)) stats.withIng++; if (/^instructions:\n/m.test(raw)) stats.withSteps++; }
  const frags = p.blocks.flatMap((b) => b.type === 'p' || b.type === 'h' ? b.text.split('\n') : b.items ? b.items.map((i) => i.text) : []);
  const missing = frags.filter((t) => !GENERIC.test(t.trim())).map(norm).filter((t) => t && !md.includes(t.replace(/:$/, '')) && !md.includes(t));
  if (missing.length) { postsWithMissing++; missingTotal += missing.length; console.log(p.slug, missing.slice(0, 3)); }
}
console.log({ postsWithMissing, missingTotal, ...stats });
