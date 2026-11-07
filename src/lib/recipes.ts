import { getCollection, type CollectionEntry } from 'astro:content';
import { isInvisiblePart, isVisiblePart, reviewPartLabel, type InvisiblePart } from '@/data/review';
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

/** Page URL of a recipe or post (the collection name is the URL section). */
export const entryUrl = (e: Recipe | Post) => `/${e.collection}/${e.id}`;
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
/** A pending review split into the parts visible on the page (purple marks) and the invisible ones (texts). */
export function reviewSplit(e: Recipe | Post) {
  const review = pendingReview(e);
  if (!review) return undefined;
  return { review, visible: review.parts.filter(isVisiblePart), invisible: review.parts.filter(isInvisiblePart) };
}
/** A pending review that changed something visible on the page: purple marks + the tile tag. */
export const visibleReview = (e: Recipe | Post) => !!reviewSplit(e)?.visible.length;
/** The photos inside the post text (Markdown images), in order. */
export const bodyImages = (e: Recipe | Post) => [...(e.body ?? '').matchAll(/!\[([^\]]*)\]\(([^)]+)\)/g)].map((m) => ({ alt: m[1].trim(), src: m[2] }));
export const bodyImageAlts = (e: Recipe | Post) => bodyImages(e).map((i) => i.alt);
/** The current text of each invisible part under review (Google description, main-photo alt, alts in the body). */
const invisibleText: Record<InvisiblePart, (e: Recipe | Post) => string[]> = {
  description: (e) => [e.data.description],
  imageAlt: (e) => (e.data.imageAlt ? [e.data.imageAlt] : []),
  bodyAlts: bodyImageAlts,
};
export const invisibleReviewTexts = (e: Recipe | Post) =>
  (reviewSplit(e)?.invisible ?? []).map((part) => ({ part, label: reviewPartLabel(part), texts: invisibleText[part](e) }));
