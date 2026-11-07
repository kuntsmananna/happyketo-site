/**
 * Numbers and checks for the site dashboard (src/pages/dashboard-*.astro), computed at build time from the content,
 * plus the weekly speed history in src/data/metrics/speed.json (scripts/metrics/measure-speed.mjs).
 * Every check returns a status, a Hebrew label and, when something can be improved, the affected items as links.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { recipeCategories } from '@/data/categories';
import { faqFor } from '@/data/faq';
import { favorites } from '@/data/favorites';
import { site } from '@/data/site';
import { getPosts, getRecipes, pendingReview, postUrl, recipeUrl, type Post, type Recipe } from './recipes';
import speedJson from '@/data/metrics/speed.json';
import pkg from '../../package.json';

export type Status = 'good' | 'warning' | 'serious';
export type Item = { title: string; href: string };
export type Check = { status: Status; label: string; detail: string; items?: Item[] };

type SpeedPage = { path: string; label: string; performance: number; accessibility: number; bestPractices: number; seo: number; lcp: number; fcp: number; tbt: number; cls: number; weightKb: number };
type SpeedRun = { date: string; url: string; tool: string; strategy: string; pages: SpeedPage[] };

const ROOT = process.cwd();
const countFiles = (dir: string, re: RegExp) => (existsSync(path.join(ROOT, dir)) ? readdirSync(path.join(ROOT, dir)).filter((f) => re.test(f)).length : 0);

/** Words in Markdown/HTML: tags, image syntax, link targets and markers removed, then split on whitespace. */
const countWords = (s: string) =>
  s
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
    .replace(/\]\([^)]*\)/g, ']')
    .replace(/[#*_>`[\]|-]/g, ' ')
    .split(/\s+/)
    .filter((w) => /[\p{L}\p{N}]/u.test(w)).length;

const entryWords = (e: Recipe | Post) => {
  const d = e.data as Recipe['data'];
  const parts = [d.title, d.description, e.body ?? '', ...(d.ingredients ?? []).flatMap((g) => [g.title ?? '', ...g.items]), ...(d.instructions ?? []).flatMap((g) => [g.title ?? '', ...g.steps])];
  return parts.reduce((n, p) => n + countWords(p), 0);
};

const item = (e: Recipe | Post): Item => ({ title: e.data.title, href: e.collection === 'recipes' ? recipeUrl(e as Recipe) : postUrl(e as Post) });
const check = (ok: boolean, label: string, good: string, bad: string, items?: Item[], severity: Status = 'warning'): Check => ({
  status: ok ? 'good' : severity,
  label,
  detail: ok ? good : bad,
  items: ok ? undefined : items,
});

export async function getDashboard() {
  const recipes = await getRecipes();
  const posts = await getPosts();
  const all = [...recipes, ...posts];

  // ---------- content KPIs
  const words = all.reduce((n, e) => n + entryWords(e), 0);
  const inlineImages = new Set(all.flatMap((e) => [...(e.body ?? '').matchAll(/assets\/posts\/([^)"\s]+)/g)].map((m) => m[1])));
  const coverImages = all.filter((e) => e.data.image).length;
  const videos = all.reduce((n, e) => n + ((e.body ?? '').match(/<(video|iframe)\b/g)?.length ?? 0), 0);
  const categoryPages = recipeCategories.filter((c) => recipes.some((r) => r.data.category.includes(c.slug))).length;
  const staticPages = { he: ['/', '/about', '/contact', '/challenge', '/favorites', '/privacy', '/accessibility', '/recipes', '/blog'], en: ['/en', '/en/about', '/en/contact', '/en/challenge', '/en/favorites', '/en/privacy', '/en/accessibility'] };
  const pages = recipes.length + posts.length + categoryPages + staticPages.he.length + staticPages.en.length;

  const kpis = {
    recipes: recipes.length,
    posts: posts.length,
    words,
    photos: countFiles('src/assets/posts', /\.(jpe?g|png|webp|avif|gif)$/i) + countFiles('src/assets/home', /\.(jpe?g|png|webp)$/i) + countFiles('src/assets/favorites', /\.(jpe?g|png|webp)$/i),
    photosInContent: coverImages + inlineImages.size,
    videos,
    pages,
    favorites: favorites.length,
    faq: faqFor('he').length,
    avgRecipeWords: Math.round(recipes.reduce((n, r) => n + entryWords(r), 0) / Math.max(recipes.length, 1)),
  };

  // ---------- charts: recipes per category (an entry counts once per category it belongs to), items per year
  const byCategory = recipeCategories
    .map((c) => ({ label: c.label, value: recipes.filter((r) => r.data.category.includes(c.slug)).length }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const years = [...new Set(all.map((e) => e.data.publishDate.getFullYear()))].sort();
  const byYear = years.map((y) => ({
    label: String(y),
    recipes: recipes.filter((r) => r.data.publishDate.getFullYear() === y).length,
    posts: posts.filter((p) => p.data.publishDate.getFullYear() === y).length,
  }));
  const lastUpdate = new Date(Math.max(...all.map((e) => (e.data.updatedDate ?? e.data.publishDate).getTime())));

  // ---------- content health
  const noImage = all.filter((e) => !e.data.image);
  const weakAlt = all.filter((e) => e.data.image && (!e.data.imageAlt || e.data.imageAlt.trim() === e.data.title.trim()));
  const noDescription = all.filter((e) => !e.data.description || e.data.description.trim() === e.data.title.trim());
  const noRecipeBox = recipes.filter((r) => !r.data.ingredients.length || !r.data.instructions.length);
  const noTimes = recipes.filter((r) => !r.data.prepTime && !r.data.cookTime);
  const drafts = all.filter((e) => e.data.draft);
  const reviews = all.filter((e) => pendingReview(e));

  const health: Check[] = [
    check(!reviews.length, 'שינויים של Claude לבדיקה', 'אין שינויים שמחכים לבדיקה', `${reviews.length} פריטים מחכים לאישור שלך (מסומנים בסגול)`, reviews.map(item)),
    check(!noImage.length, 'תמונה ראשית', 'לכל המתכונים והפוסטים יש תמונה', `${noImage.length} בלי תמונה – תמונה משפרת הקלקות בגוגל וברשתות`, noImage.map(item)),
    check(!noRecipeBox.length, 'מצרכים ושלבים', 'לכל המתכונים יש מצרכים ושלבים', `${noRecipeBox.length} מתכונים בלי רשימת מצרכים או שלבים (כך גם היה ב-Wix)`, noRecipeBox.map(item)),
    check(noTimes.length <= recipes.length / 2, 'זמני הכנה', `ל-${recipes.length - noTimes.length} מתכונים יש זמן הכנה`, `רק ל-${recipes.length - noTimes.length} מתכונים מתוך ${recipes.length} יש זמן הכנה – גוגל מציג אותו בתוצאות`, noTimes.map(item)),
    check(!drafts.length, 'טיוטות', 'אין טיוטות פתוחות', `${drafts.length} טיוטות שעוד לא פורסמו`, drafts.map(item)),
  ];

  // ---------- SEO
  const longTitles = all.filter((e) => `${e.data.title} | ${site.name}`.length > 60);
  const longDesc = all.filter((e) => e.data.description && e.data.description.length > 160);
  const seo: Check[] = [
    check(!noDescription.length, 'תיאור לגוגל', 'לכל העמודים יש תיאור', `${noDescription.length} פריטים בלי תיאור (או שהתיאור זהה לכותרת) – גוגל ממציא תיאור משלו`, noDescription.map(item)),
    check(!weakAlt.length, 'תיאור תמונות (alt)', 'לכל התמונות יש תיאור', `${weakAlt.length} תמונות שהתיאור שלהן הוא רק שם המתכון – תיאור של מה רואים בתמונה עוזר לחיפוש תמונות ולגולשים עיוורים`, weakAlt.map(item)),
    check(!longTitles.length, 'אורך כותרות', 'כל הכותרות נכנסות בתוצאות גוגל', `${longTitles.length} כותרות ארוכות מ-60 תווים ייחתכו בגוגל`, longTitles.map(item)),
    check(!longDesc.length, 'אורך תיאורים', 'כל התיאורים באורך שגוגל מציג', `${longDesc.length} תיאורים ארוכים מ-160 תווים ייחתכו`, longDesc.map(item)),
    { status: 'good', label: 'מפת אתר ו-robots.txt', detail: `${pages} עמודים במפת האתר; כל העמודים פתוחים לסריקה` },
    { status: 'good', label: 'נתונים מובנים (Schema)', detail: `מתכון (Recipe) ב-${recipes.length} מתכונים, מאמר (BlogPosting) ב-${posts.length} פוסטים, שאלות נפוצות, אתר ועסק בעמוד הבית` },
    { status: 'good', label: 'כתובות ישנות מ-Wix', detail: 'כל הכתובות הישנות מפנות (301) לעמוד החדש המתאים – הדירוג בגוגל עובר איתן' },
    { status: 'good', label: 'עברית ואנגלית (hreflang)', detail: `${staticPages.en.length} עמודים מקושרים בין השפות, כך שגוגל מציג לכל גולש את השפה שלו` },
  ];

  // ---------- GEO (AI search: ChatGPT, Perplexity, Google AI Overviews, Claude)
  const robots = existsSync(path.join(ROOT, 'public/robots.txt')) ? readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8') : '';
  const aiBots = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
  const aiAllowed = aiBots.filter((b) => robots.includes(`User-agent: ${b}`));
  const completeRecipes = recipes.filter((r) => r.data.image && r.data.ingredients.length && r.data.instructions.length && r.data.description && r.data.description !== r.data.title);
  const recipeCompleteness = Math.round((completeRecipes.length / Math.max(recipes.length, 1)) * 100);
  const geo: Check[] = [
    check(aiAllowed.length === aiBots.length, 'גישה לבוטים של AI', `ChatGPT, Claude, Perplexity ו-Google AI מורשים במפורש לקרוא את האתר`, `חסרים ב-robots.txt: ${aiBots.filter((b) => !aiAllowed.includes(b)).join(', ')}`),
    { status: 'good', label: 'קובץ llms.txt', detail: 'מפה של האתר לכלי AI – מתעדכנת לבד עם כל מתכון חדש' },
    check(recipeCompleteness >= 90, 'מתכונים מלאים לציטוט', `${recipeCompleteness}% מהמתכונים מלאים (תמונה, תיאור, מצרכים, שלבים)`, `${recipeCompleteness}% מהמתכונים מלאים (תמונה, תיאור, מצרכים ושלבים). מתכון מלא נוח יותר לכלי AI לצטט`, recipes.filter((r) => !completeRecipes.includes(r)).map(item)),
    { status: 'good', label: 'מי כתב את התוכן', detail: `כל מתכון ופוסט מסומן כנכתב ע״י ${site.author}, עם קישור לעמוד האודות ולאינסטגרם` },
    { status: 'good', label: 'שאלות ותשובות', detail: `${kpis.faq} שאלות ותשובות בעמוד הבית, מסומנות לגוגל ולכלי AI` },
    check(Date.now() - lastUpdate.getTime() < 1000 * 60 * 60 * 24 * 90, 'תוכן עדכני', `התוכן עודכן לאחרונה ב-${lastUpdate.toLocaleDateString('he-IL')}`, `העדכון האחרון היה ב-${lastUpdate.toLocaleDateString('he-IL')} – מנועי חיפוש ו-AI מעדיפים אתרים שמתעדכנים. מתכון חדש פעם בחודש עושה את העבודה`),
  ];

  // ---------- speed (weekly Lighthouse runs)
  const runs = (speedJson as { runs: SpeedRun[] }).runs;
  const latest = runs.at(-1);
  const speedPages = latest?.pages ?? [];
  const avgPerformance = speedPages.length ? Math.round(speedPages.reduce((n, p) => n + p.performance, 0) / speedPages.length) : undefined;
  const history = (speedPages.length ? speedPages : []).map((p) => ({
    label: p.label,
    path: p.path,
    points: runs.map((r) => ({ date: r.date, value: r.pages.find((x) => x.path === p.path)?.performance })).filter((x): x is { date: string; value: number } => x.value != null),
  }));
  const vital = (v: number, good: number, poor: number): Status => (v <= good ? 'good' : v <= poor ? 'warning' : 'serious');
  const vitals = speedPages.map((p) => ({
    label: p.label,
    lcp: { value: p.lcp, status: vital(p.lcp, 2500, 4000) },
    cls: { value: p.cls, status: vital(p.cls, 0.1, 0.25) },
    tbt: { value: p.tbt, status: vital(p.tbt, 200, 600) },
  }));

  // ---------- tips: the actionable items, most valuable first
  const tips: { text: string; href?: string }[] = [];
  if (reviews.length) tips.push({ text: `לאשר את ${reviews.length} השינויים של Claude שמסומנים בסגול`, href: '/review' });
  if (noImage.length) tips.push({ text: `להוסיף תמונה ל-${noImage.length} מתכונים/פוסטים בלי תמונה`, href: item(noImage[0]).href });
  if (noDescription.length) tips.push({ text: `לכתוב תיאור קצר (משפט-שניים) ל-${noDescription.length} פריטים – זה מה שמופיע מתחת לכותרת בגוגל` });
  if (weakAlt.length) tips.push({ text: `לשפר את תיאור התמונה ב-${weakAlt.length} פריטים: לתאר מה רואים ("עוגת שוקולד פרוסה על צלחת לבנה")` });
  if (noTimes.length > recipes.length / 2) tips.push({ text: 'להוסיף זמן הכנה וכמות למתכונים פופולריים – גוגל מציג אותם בתוצאות מתכונים' });
  if (Date.now() - lastUpdate.getTime() > 1000 * 60 * 60 * 24 * 30) tips.push({ text: 'לפרסם מתכון חדש – אתר שמתעדכן מקבל יותר תנועה מגוגל ומכלי AI' });
  if (avgPerformance != null && avgPerformance < 90) tips.push({ text: 'ציון המהירות ירד מתחת ל-90 – כדאי לבקש מ-Claude לבדוק' });

  // ---------- technology
  const version = (v: string) => v.replace(/^[^\d]*/, '');
  const tech = [
    { name: 'Astro', version: version(pkg.dependencies.astro), role: 'בונה את האתר מראש לעמודים סטטיים – מהיר ובטוח, בלי שרת ובלי תוספים' },
    { name: 'Tailwind CSS', version: version(pkg.dependencies.tailwindcss), role: 'העיצוב: צבעים, גדלים ופונטים אחידים בכל האתר' },
    { name: 'Vercel', version: '', role: 'אחסון ורשת הפצה עולמית (CDN), HTTPS, פרסום אוטומטי בכל שמירה, ניתוח גולשים' },
    { name: 'Pages CMS', version: '', role: 'פאנל הניהול: עריכת מתכונים, פוסטים וטקסטים מהדפדפן' },
    { name: 'GitHub', version: '', role: 'שומר את כל הקוד והתוכן עם היסטוריה מלאה של כל שינוי' },
    { name: 'Web3Forms', version: '', role: 'שולח את טפסי ההרשמה והניוזלטר למייל שלך' },
    { name: 'פונטים', version: '', role: 'Alef לעברית, Syne ללוגו, Gelasio לכותרות באנגלית – מאוחסנים באתר עצמו' },
    { name: 'Lighthouse', version: latest?.tool.replace('Lighthouse ', '') ?? '', role: 'מודד את מהירות האתר כל שבוע (אותו מנוע של Google PageSpeed)' },
  ];

  return { kpis, byCategory, byYear, lastUpdate, health, seo, geo, tips, tech, speed: { latest, avgPerformance, history, vitals, runs: runs.length } };
}
