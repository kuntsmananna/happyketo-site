/**
 * Numbers and checks for the site dashboard (src/pages/admin/dashboard.astro), computed at build time from the content,
 * plus the weekly speed history in src/data/metrics/speed.json (scripts/metrics/measure-speed.mjs).
 * Every check returns a status, a Hebrew label, a short explanation (`help`, shown in the ⓘ hover box) and, when
 * something can be improved, the affected items as links.
 */
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import path from 'node:path';
import { recipeCategories } from '@/data/categories';
import { faqFor, favorites } from '@/data/content';
import { fullTitle, site } from '@/data/site';
import { bodyImageAlts, bodyImages, countByCategory, entryUrl, getPosts, getRecipes, reviewSplit, visibleReview, type Post, type Recipe } from './recipes';
import speedJson from '@/data/metrics/speed.json';
import pkg from '../../package.json';
import type { IconName } from '@/components/Icon.astro';

export type Status = 'good' | 'warning' | 'serious';
export type Item = { title: string; href: string };
export type Check = { status: Status; label: string; detail: string; help?: string; items?: Item[] };

/** What each check means, in plain words (the ⓘ box next to its name). Keyed by the check's label. */
const HELP: Record<string, string> = {
  'שינויים של Claude לבדיקה': 'מתכונים ופוסטים ש-Claude תיקן (מצרכים, שלבים, תמונה). השינויים מסומנים בסגול עד שמסמנים "אישרתי" בפאנל.',
  'תיאורים של Claude לבדיקה': 'תיאורים חדשים שגוגל מציג מתחת לכותרת, ותיאורי תמונות. לא רואים אותם בעמוד – הם מופיעים בטבלה בעמוד הבדיקה.',
  'תמונה ראשית': 'התמונה שמופיעה בכרטיס של המתכון, בגוגל ובשיתוף בוואטסאפ. בלי תמונה – פחות הקלקות.',
  'מצרכים ושלבים': 'רשימות מסודרות של מצרכים ושלבים. גוגל מציג אותן בתוצאות מתכונים, וגולשים יכולים לסמן מה כבר עשו.',
  'זמני הכנה': 'זמן ההכנה מופיע בתוצאות החיפוש של גוגל ליד המתכון ועוזר לגולשים לבחור.',
  'טיוטות': 'פריטים שסומנו "טיוטה" בפאנל ועדיין לא מופיעים באתר.',
  'תיאור לגוגל': 'המשפט שמופיע מתחת לכותרת בתוצאות גוגל. תיאור טוב = יותר אנשים לוחצים.',
  'תיאור תמונות (alt)': 'טקסט קצר שמתאר מה רואים בתמונה. קוראי מסך מקריאים אותו לגולשים עיוורים, וגוגל משתמש בו בחיפוש תמונות.',
  'אורך כותרות': 'גוגל מציג בערך 60 תווים מהכותרת. כותרת ארוכה יותר נחתכת עם "...".',
  'אורך תיאורים': 'גוגל מציג בערך 160 תווים מהתיאור. מה שמעבר לזה נחתך.',
  'מפת אתר ו-robots.txt': 'קבצים שאומרים לגוגל אילו עמודים יש באתר ומה מותר לסרוק. נוצרים לבד בכל עדכון.',
  'נתונים מובנים (Schema)': 'מידע נסתר בקוד שמסביר לגוגל "זה מתכון, זה זמן ההכנה, זו התמונה". כך מתקבלות תוצאות עשירות עם תמונה וזמן.',
  'כתובות ישנות מ-Wix': 'קישורים ישנים מגוגל, מפייסבוק ומאינסטגרם ממשיכים לעבוד ומגיעים לעמוד החדש.',
  'עברית ואנגלית (hreflang)': 'סימון שאומר לגוגל שלכל עמוד יש גרסה בשפה השנייה, כדי שכל גולש יראה את השפה שלו.',
  'גישה לבוטים של AI': 'ChatGPT, Claude ו-Perplexity קוראים אתרים כדי לענות על שאלות. האתר מרשה להם במפורש.',
  'קובץ llms.txt': 'תוכן עניינים של האתר שנכתב במיוחד לכלי AI, כדי שימצאו מהר את המתכונים.',
  'מתכונים מלאים לציטוט': 'מתכון עם תמונה, תיאור, מצרכים ושלבים. כלי AI מעדיפים לצטט מתכונים שלמים ולקשר אליהם.',
  'מי כתב את התוכן': 'כלי AI וגוגל סומכים יותר על תוכן שיש מאחוריו אדם אמיתי עם ניסיון.',
  'שאלות ותשובות': 'שאלות ותשובות מסומנות בקוד, כך שגוגל וכלי AI יכולים להציג אותן ישירות בתשובות.',
  'תוכן עדכני': 'מנועי חיפוש וכלי AI מעדיפים אתרים שמתעדכנים. מתכון חדש פעם בחודש מספיק.',
};
const withHelp = (checks: Check[]) => checks.map((c) => ({ ...c, help: HELP[c.label] }));

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

const item = (e: Recipe | Post): Item => ({ title: e.data.title, href: entryUrl(e) });
const check = (ok: boolean, label: string, good: string, bad: string, items?: Item[], severity: Status = 'warning'): Check => ({
  status: ok ? 'good' : severity,
  label,
  detail: ok ? good : bad,
  items: ok ? undefined : items,
});

export async function getDashboard() {
  const [recipes, posts] = await Promise.all([getRecipes(), getPosts()]);
  const all = [...recipes, ...posts];

  // ---------- content KPIs
  const words = all.reduce((n, e) => n + entryWords(e), 0);
  const inlineImages = new Set(all.flatMap((e) => bodyImages(e).map((i) => i.src)));
  const coverImages = all.filter((e) => e.data.image).length;
  const videos = all.reduce((n, e) => n + ((e.body ?? '').match(/<(video|iframe)\b/g)?.length ?? 0), 0);
  const perCategory = countByCategory(recipes);
  const categoryPages = recipeCategories.filter((c) => perCategory[c.slug] > 0).length;
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
    .map((c) => ({ label: c.label, value: perCategory[c.slug] }))
    .filter((c) => c.value > 0)
    .sort((a, b) => b.value - a.value);
  const years = [...new Set(all.map((e) => e.data.publishDate.getFullYear()))].sort();
  const byYear = years.map((y) => ({
    label: String(y),
    recipes: recipes.filter((r) => r.data.publishDate.getFullYear() === y).length,
    posts: posts.filter((p) => p.data.publishDate.getFullYear() === y).length,
  }));
  const lastUpdate = new Date(Math.max(...all.map((e) => (e.data.updatedDate ?? e.data.publishDate).getTime())));
  const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);

  // ---------- content health
  const noImage = all.filter((e) => !e.data.image);
  // A description is weak when it is empty or just repeats the title (Google description and photo alt texts alike).
  const weakText = (text: string | undefined, e: Recipe | Post) => !text || text.trim() === e.data.title.trim();
  // Weak photo descriptions per entry, computed once: the main photo's and those of the photos inside the text.
  const weakAlts = all.map((e) => ({ e, n: [...(e.data.image ? [e.data.imageAlt] : []), ...bodyImageAlts(e)].filter((a) => weakText(a, e)).length }));
  const weakAlt = weakAlts.filter((x) => x.n).map((x) => x.e);
  const weakAltCount = weakAlts.reduce((n, x) => n + x.n, 0);
  const noDescription = all.filter((e) => weakText(e.data.description, e));
  const noRecipeBox = recipes.filter((r) => !r.data.ingredients.length || !r.data.instructions.length);
  const noTimes = recipes.filter((r) => !r.data.prepTime && !r.data.cookTime);
  const drafts = all.filter((e) => e.data.draft);
  const totalAlts = all.reduce((n, e) => n + (e.data.image ? 1 : 0) + bodyImageAlts(e).length, 0);
  const pct = (part: number, whole: number) => Math.round((part / Math.max(whole, 1)) * 100);
  // How complete the content is, as shares (meters on the content tab). Recipes only where the field is recipe-only.
  const completeness = [
    { label: 'תמונה ראשית', value: pct(all.length - noImage.length, all.length), detail: `${all.length - noImage.length} מתוך ${all.length} מתכונים ופוסטים`, help: HELP['תמונה ראשית'] },
    { label: 'תיאור לגוגל', value: pct(all.length - noDescription.length, all.length), detail: `${all.length - noDescription.length} מתוך ${all.length} מתכונים ופוסטים`, help: HELP['תיאור לגוגל'] },
    { label: 'תיאור תמונות', value: pct(totalAlts - weakAltCount, totalAlts), detail: `${totalAlts - weakAltCount} מתוך ${totalAlts} תמונות`, help: HELP['תיאור תמונות (alt)'] },
    { label: 'מצרכים ושלבים', value: pct(recipes.length - noRecipeBox.length, recipes.length), detail: `${recipes.length - noRecipeBox.length} מתוך ${recipes.length} מתכונים`, help: HELP['מצרכים ושלבים'] },
    { label: 'זמן הכנה', value: pct(recipes.length - noTimes.length, recipes.length), detail: `${recipes.length - noTimes.length} מתוך ${recipes.length} מתכונים`, help: HELP['זמני הכנה'] },
  ];
  // Same split as /review: page changes (purple marks) and description drafts; an entry can be in both.
  const pageReviews = all.filter(visibleReview);
  const descriptionReviews = all.filter((e) => reviewSplit(e)?.invisible.length);

  const health: Check[] = withHelp([
    check(!pageReviews.length, 'שינויים של Claude לבדיקה', 'אין שינויים בעמודים שמחכים לבדיקה', `${pageReviews.length} פריטים עם שינויים בעמוד שמחכים לאישור שלך (מסומנים בסגול)`, pageReviews.map(item)),
    check(!descriptionReviews.length, 'תיאורים של Claude לבדיקה', 'אין תיאורים שמחכים לבדיקה', `${descriptionReviews.length} פריטים עם תיאור חדש לגוגל או תיאורי תמונות חדשים – לא נראה בעמוד, מופיע בטבלה בעמוד הבדיקה`, descriptionReviews.map(item)),
    check(!noImage.length, 'תמונה ראשית', 'לכל המתכונים והפוסטים יש תמונה', `${noImage.length} בלי תמונה – תמונה משפרת הקלקות בגוגל וברשתות`, noImage.map(item)),
    check(!noRecipeBox.length, 'מצרכים ושלבים', 'לכל המתכונים יש מצרכים ושלבים', `${noRecipeBox.length} מתכונים בלי רשימת מצרכים או שלבים (כך גם היה ב-Wix)`, noRecipeBox.map(item)),
    check(noTimes.length <= recipes.length / 2, 'זמני הכנה', `ל-${recipes.length - noTimes.length} מתכונים יש זמן הכנה`, `רק ל-${recipes.length - noTimes.length} מתכונים מתוך ${recipes.length} יש זמן הכנה – גוגל מציג אותו בתוצאות`, noTimes.map(item)),
    check(!drafts.length, 'טיוטות', 'אין טיוטות פתוחות', `${drafts.length} טיוטות שעוד לא פורסמו`, drafts.map(item)),
  ]);

  // ---------- SEO
  const longTitles = all.filter((e) => fullTitle(e.data.title).length > 60);
  const longDesc = all.filter((e) => e.data.description && e.data.description.length > 160);
  const seo: Check[] = withHelp([
    check(!noDescription.length, 'תיאור לגוגל', 'לכל העמודים יש תיאור', `${noDescription.length} פריטים בלי תיאור (או שהתיאור זהה לכותרת) – גוגל ממציא תיאור משלו`, noDescription.map(item)),
    check(!weakAlt.length, 'תיאור תמונות (alt)', 'לכל התמונות (הראשיות ובתוך הטקסט) יש תיאור', `${weakAltCount} תמונות ב-${weakAlt.length} פריטים שהתיאור שלהן ריק או רק שם המתכון – תיאור של מה רואים בתמונה עוזר לחיפוש תמונות ולגולשים עיוורים`, weakAlt.map(item)),
    check(!longTitles.length, 'אורך כותרות', 'כל הכותרות נכנסות בתוצאות גוגל', `${longTitles.length} כותרות ארוכות מ-60 תווים ייחתכו בגוגל`, longTitles.map(item)),
    check(!longDesc.length, 'אורך תיאורים', 'כל התיאורים באורך שגוגל מציג', `${longDesc.length} תיאורים ארוכים מ-160 תווים ייחתכו`, longDesc.map(item)),
    { status: 'good', label: 'מפת אתר ו-robots.txt', detail: `${pages} עמודים במפת האתר; כל העמודים פתוחים לסריקה` },
    { status: 'good', label: 'נתונים מובנים (Schema)', detail: `מתכון (Recipe) ב-${recipes.length} מתכונים, מאמר (BlogPosting) ב-${posts.length} פוסטים, שאלות נפוצות, אתר ועסק בעמוד הבית` },
    { status: 'good', label: 'כתובות ישנות מ-Wix', detail: 'כל הכתובות הישנות מפנות (301) לעמוד החדש המתאים – הדירוג בגוגל עובר איתן' },
    { status: 'good', label: 'עברית ואנגלית (hreflang)', detail: `${staticPages.en.length} עמודים מקושרים בין השפות, כך שגוגל מציג לכל גולש את השפה שלו` },
  ]);

  // ---------- GEO (AI search: ChatGPT, Perplexity, Google AI Overviews, Claude)
  const robots = existsSync(path.join(ROOT, 'public/robots.txt')) ? readFileSync(path.join(ROOT, 'public/robots.txt'), 'utf8') : '';
  const aiBots = ['GPTBot', 'OAI-SearchBot', 'ClaudeBot', 'PerplexityBot', 'Google-Extended'];
  const aiAllowed = aiBots.filter((b) => robots.includes(`User-agent: ${b}`));
  const completeRecipes = recipes.filter((r) => r.data.image && r.data.ingredients.length && r.data.instructions.length && !weakText(r.data.description, r));
  const recipeCompleteness = pct(completeRecipes.length, recipes.length);
  const geo: Check[] = withHelp([
    check(aiAllowed.length === aiBots.length, 'גישה לבוטים של AI', `ChatGPT, Claude, Perplexity ו-Google AI מורשים במפורש לקרוא את האתר`, `חסרים ב-robots.txt: ${aiBots.filter((b) => !aiAllowed.includes(b)).join(', ')}`),
    { status: 'good', label: 'קובץ llms.txt', detail: 'מפה של האתר לכלי AI – מתעדכנת לבד עם כל מתכון חדש' },
    check(recipeCompleteness >= 90, 'מתכונים מלאים לציטוט', `${recipeCompleteness}% מהמתכונים מלאים (תמונה, תיאור, מצרכים, שלבים)`, `${recipeCompleteness}% מהמתכונים מלאים (תמונה, תיאור, מצרכים ושלבים). מתכון מלא נוח יותר לכלי AI לצטט`, recipes.filter((r) => !completeRecipes.includes(r)).map(item)),
    { status: 'good', label: 'מי כתב את התוכן', detail: `כל מתכון ופוסט מסומן כנכתב ע״י ${site.author}, עם קישור לעמוד האודות ולאינסטגרם` },
    { status: 'good', label: 'שאלות ותשובות', detail: `${kpis.faq} שאלות ותשובות בעמוד הבית, מסומנות לגוגל ולכלי AI` },
    check(daysSinceUpdate < 90, 'תוכן עדכני', `התוכן עודכן לאחרונה ב-${lastUpdate.toLocaleDateString('he-IL')}`, `העדכון האחרון היה ב-${lastUpdate.toLocaleDateString('he-IL')} – מנועי חיפוש ו-AI מעדיפים אתרים שמתעדכנים. מתכון חדש פעם בחודש עושה את העבודה`),
  ]);

  // ---------- speed (weekly Lighthouse runs)
  const runs = (speedJson as { runs: SpeedRun[] }).runs;
  const latest = runs.at(-1);
  const speedPages = latest?.pages ?? [];
  const history = speedPages.map((p) => ({
    label: p.label,
    path: p.path,
    points: runs.map((r) => ({ date: r.date, value: r.pages.find((x) => x.path === p.path)?.performance })).filter((x): x is { date: string; value: number } => x.value != null),
  }));
  // The four Lighthouse scores, averaged over the measured pages (meters on the speed tab).
  const avg = (k: 'performance' | 'accessibility' | 'bestPractices' | 'seo') => Math.round(speedPages.reduce((n, p) => n + p[k], 0) / Math.max(speedPages.length, 1));
  const avgPerformance = speedPages.length ? avg('performance') : undefined;
  const scores = speedPages.length
    ? [
        { label: 'ביצועים', icon: 'gauge', value: avg('performance'), help: 'כמה מהר העמוד נטען ומגיב בטלפון. זה הציון שגוגל לוקח בחשבון בדירוג.' },
        { label: 'נגישות', icon: 'a11y', value: avg('accessibility'), help: 'האם גם גולשים עם מוגבלות (קוראי מסך, ניווט במקלדת, ראייה חלשה) יכולים להשתמש באתר.' },
        { label: 'שיטות עבודה', icon: 'shield', value: avg('bestPractices'), help: 'אבטחה ותקינות: HTTPS, בלי שגיאות בדפדפן, תמונות בגודל נכון.' },
        { label: 'SEO', icon: 'search', value: avg('seo'), help: 'הבסיס הטכני לגוגל: כותרות, תיאורים, קישורים שאפשר לסרוק.' },
      ] as const
    : [];
  const vital = (v: number, good: number, poor: number): Status => (v <= good ? 'good' : v <= poor ? 'warning' : 'serious');
  const vitals = speedPages.map((p) => ({
    label: p.label,
    lcp: { value: p.lcp, status: vital(p.lcp, 2500, 4000) },
    cls: { value: p.cls, status: vital(p.cls, 0.1, 0.25) },
    tbt: { value: p.tbt, status: vital(p.tbt, 200, 600) },
  }));

  // ---------- tips: the actionable items, most valuable first
  const tips: { text: string; href?: string; icon: IconName }[] = [];
  if (pageReviews.length) tips.push({ text: `לבדוק ולאשר את ${pageReviews.length} השינויים של Claude בעמודים (מסומנים בסגול)`, href: '/review', icon: 'pencil' });
  if (descriptionReviews.length) tips.push({ text: `לעבור על הטבלה של ${descriptionReviews.length} התיאורים החדשים לגוגל ולתמונות ולאשר`, href: '/review', icon: 'fileText' });
  if (noImage.length) tips.push({ text: `להוסיף תמונה ל-${noImage.length} מתכונים/פוסטים בלי תמונה`, href: item(noImage[0]).href, icon: 'image' });
  if (noDescription.length) tips.push({ text: `לכתוב תיאור קצר (משפט-שניים) ל-${noDescription.length} פריטים – זה מה שמופיע מתחת לכותרת בגוגל`, icon: 'fileText' });
  if (weakAlt.length) tips.push({ text: `לשפר את תיאור ${weakAltCount} תמונות: לתאר מה רואים ("עוגת שוקולד פרוסה על צלחת לבנה")`, icon: 'image' });
  if (noTimes.length > recipes.length / 2) tips.push({ text: 'להוסיף זמן הכנה וכמות למתכונים פופולריים – גוגל מציג אותם בתוצאות מתכונים', icon: 'clock' });
  if (daysSinceUpdate > 30) tips.push({ text: 'לפרסם מתכון חדש – אתר שמתעדכן מקבל יותר תנועה מגוגל ומכלי AI', icon: 'sparkles' });
  if (avgPerformance != null && avgPerformance < 90) tips.push({ text: 'ציון המהירות ירד מתחת ל-90 – כדאי לבקש מ-Claude לבדוק', icon: 'gauge' });

  // ---------- technology
  const version = (v: string) => v.replace(/^[^\d]*/, '');
  const tech = [
    { name: 'Astro', icon: 'layers', version: version(pkg.dependencies.astro), role: 'בונה את האתר מראש לעמודים סטטיים – מהיר ובטוח, בלי שרת ובלי תוספים' },
    { name: 'Tailwind CSS', icon: 'palette', version: version(pkg.dependencies.tailwindcss), role: 'העיצוב: צבעים, גדלים ופונטים אחידים בכל האתר' },
    { name: 'Vercel', icon: 'globe', version: '', role: 'אחסון ורשת הפצה עולמית (CDN), HTTPS, פרסום אוטומטי בכל שמירה, ניתוח גולשים' },
    { name: 'Pages CMS', icon: 'pencil', version: '', role: 'פאנל הניהול: עריכת מתכונים, פוסטים וטקסטים מהדפדפן' },
    { name: 'GitHub', icon: 'code', version: '', role: 'שומר את כל הקוד והתוכן עם היסטוריה מלאה של כל שינוי' },
    { name: 'Web3Forms', icon: 'mail', version: '', role: 'שולח את טפסי ההרשמה והניוזלטר למייל שלך' },
    { name: 'פונטים', icon: 'type', version: '', role: 'Alef לעברית, Syne ללוגו, Gelasio לכותרות באנגלית – מאוחסנים באתר עצמו' },
    { name: 'Lighthouse', icon: 'gauge', version: latest?.tool.replace('Lighthouse ', '') ?? '', role: 'מודד את מהירות האתר כל שבוע (אותו מנוע של Google PageSpeed)' },
  ] as const;

  return { kpis, byCategory, byYear, lastUpdate, health, seo, geo, tips, tech, completeness, speed: { latest, avgPerformance, scores, history, vitals, runs: runs.length } };
}
