// HTTP helpers with an on-disk cache so re-running the scraper doesn't hit Wix again.
import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';

const CACHE_DIR = path.resolve(import.meta.dirname, '.cache');
const UA = 'Mozilla/5.0 (compatible; HappyKetoMigration/1.0)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchWithRetry(url, { tries = 4, as = 'text' } = {}) {
  let lastErr;
  for (let i = 0; i < tries; i++) {
    try {
      const res = await fetch(url, { headers: { 'user-agent': UA } });
      if (res.status === 404) throw Object.assign(new Error(`404 ${url}`), { fatal: true });
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return as === 'buffer' ? Buffer.from(await res.arrayBuffer()) : await res.text();
    } catch (err) {
      lastErr = err;
      if (err.fatal) break;
      await sleep(1000 * 2 ** i);
    }
  }
  throw lastErr;
}

/** Fetch a page as text, cached under scripts/scrape/.cache unless refresh=true. */
export async function fetchCached(url, { refresh = false } = {}) {
  await mkdir(CACHE_DIR, { recursive: true });
  const file = path.join(CACHE_DIR, createHash('sha1').update(url).digest('hex') + '.html');
  if (!refresh && existsSync(file)) return readFile(file, 'utf8');
  const text = await fetchWithRetry(url);
  await writeFile(file, text);
  await sleep(250); // be polite to Wix
  return text;
}

export const fetchBuffer = (url) => fetchWithRetry(url, { as: 'buffer' });

/** Return all <loc> URLs of a sitemap. */
export async function sitemapUrls(url, opts) {
  const xml = await fetchCached(url, opts);
  return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].trim());
}
