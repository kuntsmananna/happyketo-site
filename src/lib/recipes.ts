import { getCollection, type CollectionEntry } from 'astro:content';
import { recipeCategories, type RecipeCategorySlug } from '@/data/categories';

export type Recipe = CollectionEntry<'recipes'>;
export type Post = CollectionEntry<'blog'>;

const byDateDesc = (a: { data: { publishDate: Date } }, b: { data: { publishDate: Date } }) =>
  b.data.publishDate.getTime() - a.data.publishDate.getTime();

/** Published recipes, newest first. */
export async function getRecipes(): Promise<Recipe[]> {
  return (await getCollection('recipes', ({ data }) => !data.draft)).sort(byDateDesc);
}

/** Published blog posts, newest first. */
export async function getPosts(): Promise<Post[]> {
  return (await getCollection('blog', ({ data }) => !data.draft)).sort(byDateDesc);
}

export const recipeUrl = (r: Recipe) => `/recipes/${r.id}`;
export const postUrl = (p: Post) => `/blog/${p.id}`;
export const categoryUrl = (slug: RecipeCategorySlug) => `/recipes/category/${slug}`;

export const categoryLabel = (slug: string) => recipeCategories.find((c) => c.slug === slug)?.label ?? slug;

/** Number of recipes per category (a recipe can be in several). */
export function countByCategory(recipes: Recipe[]) {
  return Object.fromEntries(
    recipeCategories.map((c) => [c.slug, recipes.filter((r) => r.data.category.includes(c.slug)).length]),
  ) as Record<RecipeCategorySlug, number>;
}

/** "45 דק׳" / "שעה ו-15 דק׳" */
export function formatMinutes(min: number) {
  if (min < 60) return `${min} דק׳`;
  const h = Math.floor(min / 60);
  const m = min % 60;
  const hours = h === 1 ? 'שעה' : h === 2 ? 'שעתיים' : `${h} שעות`;
  return m ? `${hours} ו-${m} דק׳` : hours;
}

/** Review marks (Claude's changes waiting for Anna): the pending review of an entry, if any. */
export const pendingReview = (e: Recipe | Post) => (e.data.review && !e.data.review.approved ? e.data.review : undefined);
/** Review parts that change nothing visible on the page (Google description and photo alt texts). */
export const INVISIBLE_PARTS = ['description', 'imageAlt', 'bodyAlts'] as const;
type Part = NonNullable<Recipe['data']['review']>['parts'][number];
export const isVisiblePart = (p: Part) => !(INVISIBLE_PARTS as readonly string[]).includes(p);
/** A pending review that changed something visible on the page: purple marks + the tile tag. */
export const visibleReview = (e: Recipe | Post) => !!pendingReview(e)?.parts.some(isVisiblePart);
/** Page URL of a recipe or post. */
export const entryUrl = (e: Recipe | Post) => (e.collection === 'recipes' ? recipeUrl(e as Recipe) : postUrl(e as Post));
/** Alt texts of the photos inside the post text (Markdown images), in order. */
export const bodyImageAlts = (e: Recipe | Post) => [...(e.body ?? '').matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => m[1].trim());
/** Hebrew labels of review parts (keep in sync with the "parts" options in .pages.yml). */
export const reviewPartLabel: Record<Part, string> = {
  image: 'תמונה',
  ingredients: 'מצרכים',
  instructions: 'אופן ההכנה',
  text: 'טקסט',
  description: 'תיאור לגוגל',
  imageAlt: 'תיאור התמונה הראשית',
  bodyAlts: 'תיאורי התמונות בטקסט',
};
