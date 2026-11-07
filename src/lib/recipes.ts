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
