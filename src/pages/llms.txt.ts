/**
 * /llms.txt (https://llmstxt.org): a plain-Markdown map of the site for AI assistants and AI search (GEO).
 * Generated at build time from the content, so new recipes and posts appear automatically.
 */
import type { APIRoute } from 'astro';
import { site } from '@/data/site';
import { recipeCategories } from '@/data/categories';
import { getPosts, getRecipes, postUrl, recipeUrl } from '@/lib/recipes';

export const GET: APIRoute = async () => {
  const recipes = await getRecipes();
  const posts = await getPosts();
  const abs = (p: string) => new URL(encodeURI(p), site.url).href;
  const line = (title: string, href: string, desc?: string) => `- [${title}](${abs(href)})${desc && desc !== title ? `: ${desc}` : ''}`;

  const byCategory = recipeCategories
    .map((c) => ({ c, items: recipes.filter((r) => r.data.category[0] === c.slug) }))
    .filter((g) => g.items.length);

  const text = [
    `# ${site.name}`,
    '',
    `> ${site.description}`,
    '',
    `האתר של ${site.author}: מתכונים קטוגניים ודלי פחמימות (ללא סוכר וללא קמח), מאמרים על תזונה קטוגנית ותוכנית ליווי של 4 שבועות למעבר לקיטו ("Going Keto"). התוכן בעברית; עמודי המידע קיימים גם באנגלית.`,
    '',
    '## עמודים עיקריים',
    line('אתגר קיטו – Going Keto, 4 שבועות', '/challenge', 'תוכנית ליווי למעבר הדרגתי לתזונה קטוגנית, עם 3 ימי ניסיון חינם'),
    line('אודות', '/about', `${site.author}, מייסדת Happy Keto`),
    line('מתכונים', '/recipes', `${recipes.length} מתכונים קטוגניים`),
    line('בלוג', '/blog', 'מאמרים ומדריכים על תזונה קטוגנית ודלת פחמימות'),
    line('המזווה – מוצרים מומלצים', '/favorites'),
    line('יצירת קשר', '/contact'),
    ...byCategory.flatMap(({ c, items }) => ['', `## מתכונים: ${c.label}`, ...items.map((r) => line(r.data.title, recipeUrl(r), r.data.description))]),
    '',
    '## בלוג',
    ...posts.map((p) => line(p.data.title, postUrl(p), p.data.description)),
    '',
    '## English',
    line('Home', '/en', 'Happy Keto – a natural, simple and tasty ketogenic diet'),
    line('Keto challenge (4 weeks)', '/en/challenge'),
    line('About Anna', '/en/about'),
    '',
  ].join('\n');

  return new Response(text, { headers: { 'Content-Type': 'text/plain; charset=utf-8' } });
};
