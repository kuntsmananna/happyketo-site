#!/usr/bin/env node
// Weekly speed measurement for the dashboard: Lighthouse (the engine behind Google PageSpeed Insights), mobile,
// 3 runs per page, median kept. Appends one entry per day to src/data/metrics/speed.json (history for the charts).
// Measures www.happyketoforme.com once it is served by Vercel, otherwise the Vercel address.
//   cd scripts/metrics && npm ci && node measure-speed.mjs        (CHROME_PATH=... to pick a Chrome binary)
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';

const OUT = path.resolve(import.meta.dirname, '../../src/data/metrics/speed.json');
const PAGES = [
  { path: '/', label: 'עמוד הבית' },
  { path: '/recipes', label: 'מתכונים' },
  { path: '/recipes/חטיף-טוויקס-קטוגני', label: 'עמוד מתכון' },
  { path: '/challenge', label: 'אתגר קיטו' },
];
const RUNS = 3;
let lighthouseVersion = '';

async function baseUrl() {
  try {
    const res = await fetch('https://www.happyketoforme.com/', { redirect: 'manual' });
    if (res.headers.get('server')?.toLowerCase().includes('vercel') || res.headers.has('x-vercel-id')) return 'https://www.happyketoforme.com';
  } catch {}
  return 'https://happyketo-site.vercel.app';
}

const median = (xs) => [...xs].sort((a, b) => a - b)[Math.floor(xs.length / 2)];

async function measure(url, port) {
  const runs = [];
  for (let i = 0; i < RUNS; i++) {
    const { lhr } = await lighthouse(url, { port, output: 'json', logLevel: 'error', onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] });
    if (lhr.runtimeError) throw new Error(`${url}: ${lhr.runtimeError.message}`);
    lighthouseVersion = lhr.lighthouseVersion;
    const a = lhr.audits;
    runs.push({
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100),
      lcp: Math.round(a['largest-contentful-paint'].numericValue),
      fcp: Math.round(a['first-contentful-paint'].numericValue),
      tbt: Math.round(a['total-blocking-time'].numericValue),
      cls: Number(a['cumulative-layout-shift'].numericValue.toFixed(3)),
      weightKb: Math.round(a['total-byte-weight'].numericValue / 1024),
    });
  }
  // The run with the median performance score represents the page (Lighthouse varies run to run).
  const m = median(runs.map((r) => r.performance));
  return runs.find((r) => r.performance === m);
}

const base = await baseUrl();
const chrome = await chromeLauncher.launch({ chromePath: process.env.CHROME_PATH, chromeFlags: ['--headless=new', '--no-sandbox'] });
const pages = [];
try {
  for (const p of PAGES) {
    const result = await measure(base + encodeURI(p.path), chrome.port);
    pages.push({ path: p.path, label: p.label, ...result });
    console.log(`${p.label}: performance ${result.performance}, LCP ${result.lcp}ms`);
  }
} finally {
  chrome.kill();
}

const data = existsSync(OUT) ? JSON.parse(readFileSync(OUT, 'utf8')) : { runs: [] };
const date = new Date().toISOString().slice(0, 10);
data.runs = [...data.runs.filter((r) => r.date !== date), { date, url: base, tool: `Lighthouse ${lighthouseVersion}`, strategy: 'mobile', pages }]
  .sort((a, b) => a.date.localeCompare(b.date))
  .slice(-104); // two years of weekly runs
writeFileSync(OUT, JSON.stringify(data, null, 2) + '\n');
console.log(`saved ${date} (${base})`);
