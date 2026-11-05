#!/usr/bin/env node
// Migrate all Wix blog posts (recipes + articles) into Astro content collections.
//
//   npm run scrape               # write missing posts, keep existing .md files (they may be hand-edited)
//   npm run scrape -- --force    # overwrite existing .md files
//   npm run scrape -- --refresh  # re-download pages instead of using scripts/scrape/.cache
//   npm run scrape -- --only=<slug>  # process a single post (handy while tuning the parser)
import { existsSync } from 'node:fs';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import pLimit from 'p-limit';
import { recipeCategories } from '../../src/data/categories.ts';
import { fetchCached, sitemapUrls } from './fetch.mjs';
import { parsePost } from './parse-post.mjs';
import { extractRecipe, guessPrepTime } from './recipe.mjs';
import { blocksToMarkdown, toYaml } from './render.mjs';
import { downloadImages, downloadWixVideo, gifVideoPath } from './download-images.mjs';
import { overrides } from './overrides.mjs';

const ROOT = path.resolve(import.meta.dirname, '../..');
const SITE = 'https://www.happyketoforme.com';
const args = new Set(process.argv.slice(2));
const FORCE = args.has('--force');
const REFRESH = args.has('--refresh');
const ONLY = [...args].find((a) => a.startsWith('--only='))?.slice(7);

const WIX_TO_CATEGORY = new Map(recipeCategories.flatMap((c) => c.wix.map((w) => [w, c.slug])));
const BLOG_TAGS = {
  'בלוג-קטוגני': 'בלוג קטוגני',
  'מדריך-לקיטו': 'מדריך לקיטו',
  'המדריך-לתזונה-דלת-פחמימות': 'המדריך לתזונה דלת פחמימות',
  'low-carb-1': 'המדריך לפליאו',
};
const RECIPE_TAGS = { 'lunch-box': 'lunch-box' };

/** Title keywords → category, used only when Wix gave no specific recipe category. */
const KEYWORD_CATEGORIES = [
  [/פליאו/, 'paleo'],
  [/מרק|ציר/, 'soups'],
  [/דג|סלמון|טונה|סביצ|סשימי|שרימפס/, 'fish'],
  [/עוף|בקר|רוסטביף|אסאדו|כבש|חזיר|קציצות|שווארמה|טרטר|לבבות/, 'meat'],
  [/ביצ|שקשוקה|חביתה/, 'eggs'],
  [/עוג|מוס|גלידה|קינוח|טראפלס|שוקולד|פנקוטה|כדורי|חטיף|סופגני/, 'desserts'],
  [/לחם|מאפינס|פיצה|קרקר|וופל|פנקייק|לביבות|רולדה|בצק|סקונס|טורטי|קרפ/, 'pastry'],
  [/רוטב|ממרח|מיונז|קטשופ|טפנד|מטבוחה|צ.?ימיצ/, 'spreads'],
  [/קפה|צ.?אי|משקה|שייק|bulletproof/i, 'drinks'],
  [/כרוב|כרובית|ירק|סלט|במיה|פטריות|קייל|סלק|לוביה|כרישה|קישוא|מלפפון|שורש|תרד/, 'vegetables'],
];

const log = (...m) => console.log(...m);

/** Meta description from the post's own opening paragraphs (Wix's og:description is a raw excerpt). */
function makeDescription(blocks, title) {
  let text = '';
  for (const b of blocks) {
    if (b.type !== 'p' || /^[*\s]/.test(b.text) || /^(בתאבון|לבריאות|תהנו)/.test(b.text)) continue;
    text += (text ? ' ' : '') + b.text.replace(/\s+/g, ' ');
    if (text.length >= 110) break;
  }
  if (!text) return title;
  if (text.length <= 160) return text;
  const cut = text.slice(0, 157);
  return cut.slice(0, cut.lastIndexOf(' ')).replace(/[,.;:\s]+$/, '') + '…';
}

async function main() {
  log('▸ Reading sitemap…');
  let urls = await sitemapUrls(`${SITE}/blog-posts-sitemap.xml`, { refresh: REFRESH });
  if (ONLY) urls = urls.filter((u) => decodeURIComponent(u).endsWith(`/post/${ONLY}`));
  log(`  ${urls.length} posts`);

  log('▸ Fetching + parsing posts…');
  const limit = pLimit(4);
  const posts = [];
  const fetchErrors = [];
  await Promise.all(
    urls.map((url) =>
      limit(async () => {
        try {
          posts.push(parsePost(await fetchCached(url, { refresh: REFRESH }), url));
        } catch (e) {
          fetchErrors.push({ url, error: String(e.message || e) });
        }
      }),
    ),
  );
  posts.sort((a, b) => a.slug.localeCompare(b.slug, 'he'));

  // --- classify
  for (const p of posts) {
    const r = extractRecipe(p.blocks);
    const mapped = [...new Set(p.wixCategories.map((c) => WIX_TO_CATEGORY.get(c)).filter(Boolean))];
    const isBlogOnly = p.wixCategories.length > 0 && p.wixCategories.every((c) => c in BLOG_TAGS);
    p.kind = !isBlogOnly && (mapped.length || p.wixCategories.includes('מתכונים') || r.sawRecipe) ? 'recipe' : 'blog';
    const o = overrides[p.slug];
    if (o) {
      r.ingredients = o.ingredients;
      r.instructions = o.instructions;
      r.body = p.blocks.filter((b) => ['img', 'video', 'youtube'].includes(b.type));
      r.flags = [];
      r.sawRecipe = true;
    }
    p.recipe = r;
    p.flags = p.kind === 'recipe' ? [...r.flags] : [];
    if (p.kind === 'recipe') {
      p.category = mapped;
      if (!mapped.length) {
        const hit = KEYWORD_CATEGORIES.find(([re]) => re.test(p.title));
        p.category = [hit ? hit[1] : 'vegetables'];
        p.flags.push(hit ? `category-guessed:${p.category[0]}` : 'category-defaulted');
      }
      if (!r.sawRecipe && !r.implicit) p.flags.push('no-recipe-sections');
    }
    p.newPath = `/${p.kind === 'recipe' ? 'recipes' : 'blog'}/${p.slug}`;
  }

  // --- link rewriting: old Wix URLs → new paths
  const bySlug = new Map(posts.map((p) => [p.slug, p]));
  const staticMap = {
    '/': '/',
    '/recipes': '/recipes',
    '/keto-blog': '/blog',
    '/ketochallenge': '/challenge',
    '/about-happy-keto': '/about',
    '/contact-8': '/contact',
    '/iherb-מומלצים': '/favorites',
  };
  for (const c of recipeCategories) staticMap[c.wixPage] = `/recipes/category/${c.slug}`;
  const rewriteHref = (href) => {
    let u;
    try {
      u = new URL(href, SITE);
    } catch {
      return href;
    }
    if (!/(^|\.)happyketoforme\.com$/.test(u.hostname)) return href;
    const p = decodeURIComponent(u.pathname).replace(/\/$/, '') || '/';
    const post = p.match(/^\/post\/(.+)$/);
    if (post && bySlug.has(post[1])) return bySlug.get(post[1]).newPath + u.hash;
    const cat = p.match(/^\/recipes\/categories\/(.+)$/);
    if (cat && WIX_TO_CATEGORY.has(cat[1])) return `/recipes/category/${WIX_TO_CATEGORY.get(cat[1])}`;
    if (staticMap[p]) return staticMap[p] + u.hash;
    return p + u.hash; // unknown internal page: keep the path, report it
  };

  // --- images
  const uris = new Set();
  for (const p of posts) {
    if (p.coverUri) uris.add(p.coverUri);
    p.blocks.filter((b) => b.type === 'img').forEach((b) => uris.add(b.uri));
  }
  log(`▸ Images: ${uris.size} referenced`);
  const img = await downloadImages(uris, { log });
  log(`  ${img.fetched} downloaded, ${img.ok.size - img.fetched} already on disk, ${img.failed.length} failed`);

  // --- write markdown
  log('▸ Writing markdown…');
  const written = { recipes: 0, blog: 0, skipped: 0 };
  const redirects = {};
  const unknownLinks = new Set();
  const videos = [];
  for (const p of posts) {
    const dir = path.join(ROOT, 'src/content', p.kind === 'recipe' ? 'recipes' : 'blog');
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `${p.slug}.md`);
    redirects[`/post/${p.slug}`] = p.newPath;
    if (existsSync(file) && !FORCE) {
      written.skipped++;
      continue;
    }

    const imagePath = (uri) => (img.files.has(uri) ? `../../assets/posts/${img.files.get(uri)}` : null);
    let bodyBlocks = p.kind === 'recipe' ? p.recipe.body : p.blocks;
    const coverOk = p.coverUri && img.ok.has(p.coverUri);
    // Animated cover: the card/hero uses the still frame, the post shows the animation up top.
    if (coverOk && img.gifVideos.has(p.coverUri)) bodyBlocks = [{ type: 'gifvideo', uri: p.coverUri, alt: p.title }, ...bodyBlocks];

    const videoMap = new Map();
    for (const b of p.blocks.filter((b) => b.type === 'video' && b.src)) {
      const local = await downloadWixVideo(b.src).catch(() => null);
      if (local) videoMap.set(b.src, local);
      videos.push({ slug: p.slug, src: b.src, local, raw: b.raw });
    }
    p.blocks.filter((b) => b.type === 'youtube').forEach((b) => videos.push({ slug: p.slug, youtube: b.id }));

    const markdown = blocksToMarkdown(bodyBlocks, {
      rewriteHref: (href) => {
        const out = rewriteHref(href);
        if (out.startsWith('/') && !/^\/(recipes|blog|challenge|about|contact|favorites)?(\/|$|#)/.test(out)) unknownLinks.add(out);
        return out;
      },
      imagePath,
      gifVideoPath: (uri) => (img.gifVideos.has(uri) ? gifVideoPath(uri) : null),
      videoPath: (src) => videoMap.get(src) || null,
      fallbackAlt: p.title,
      // The cover is shown by the page template; don't repeat it as the first body image.
      skipUris: coverOk ? new Set([p.coverUri]) : undefined,
    });

    const description = makeDescription(bodyBlocks, p.title);
    const tags = [
      ...new Set(
        p.wixCategories.map((c) => (p.kind === 'recipe' ? RECIPE_TAGS[c] : BLOG_TAGS[c])).filter(Boolean),
      ),
    ];

    const fm = {
      title: p.title,
      description,
      image: coverOk ? imagePath(p.coverUri) : undefined,
      imageAlt: coverOk ? p.title : undefined,
      publishDate: p.datePublished ? new Date(p.datePublished) : undefined,
      updatedDate: p.dateModified ? new Date(p.dateModified) : undefined,
      wixUrl: encodeURI(`${SITE}/post/${p.slug}`),
      ...(p.kind === 'recipe'
        ? {
            category: p.category,
            tags,
            prepTime: guessPrepTime(p.title, p.blocks),
            ingredients: p.recipe.ingredients,
            instructions: p.recipe.instructions,
          }
        : { tags }),
    };
    await writeFile(file, `---\n${toYaml(fm)}\n---\n\n${markdown}\n`);
    written[p.kind === 'recipe' ? 'recipes' : 'blog']++;
  }

  await writeFile(path.join(ROOT, 'src/data/wix-redirects.json'), JSON.stringify(redirects, null, 2) + '\n');

  // --- report
  const report = {
    generatedAt: new Date().toISOString(),
    totals: {
      posts: posts.length,
      recipes: posts.filter((p) => p.kind === 'recipe').length,
      blog: posts.filter((p) => p.kind === 'blog').length,
      ...written,
    },
    fetchErrors,
    imageFailures: img.failed,
    flagged: posts.filter((p) => p.flags.length).map((p) => ({ slug: p.slug, kind: p.kind, flags: p.flags })),
    videos,
    unknownInternalLinks: [...unknownLinks],
    categories: Object.fromEntries(
      recipeCategories.map((c) => [c.slug, posts.filter((p) => p.category?.includes(c.slug)).length]),
    ),
  };
  await writeFile(path.join(import.meta.dirname, 'report.json'), JSON.stringify(report, null, 2) + '\n');
  log('▸ Done', report.totals);
  log('  categories', report.categories);
  log(`  flagged: ${report.flagged.length}, videos: ${videos.length}, unknown links: ${unknownLinks.size}`);
  log('  details → scripts/scrape/report.json');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
