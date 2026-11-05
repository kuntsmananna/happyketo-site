/** schema.org JSON-LD builders (Google rich results). */
import { site } from '@/data/site';
import { categoryLabel, type Post, type Recipe } from './recipes';

const author = { '@type': 'Person', name: site.author, url: `${site.url}/about` };
const publisher = { '@type': 'Organization', name: site.name, url: site.url, logo: `${site.url}/favicon.svg` };
const isoMinutes = (m?: number) => (m ? `PT${m}M` : undefined);

/** https://developers.google.com/search/docs/appearance/structured-data/recipe */
export function recipeJsonLd(recipe: Recipe, url: string, imageUrl?: string) {
  const d = recipe.data;
  const steps = d.instructions;
  const toSteps = (list: string[]) => list.map((text) => ({ '@type': 'HowToStep', text }));
  const total = (d.prepTime ?? 0) + (d.cookTime ?? 0);

  return {
    '@context': 'https://schema.org',
    '@type': 'Recipe',
    name: d.title,
    description: d.description || undefined,
    image: imageUrl ? [imageUrl] : undefined,
    url,
    author,
    publisher,
    datePublished: d.publishDate.toISOString(),
    dateModified: (d.updatedDate ?? d.publishDate).toISOString(),
    recipeCategory: d.category.map(categoryLabel).join(', '),
    keywords: ['קיטו', 'דל פחמימות', ...d.category.map(categoryLabel), ...d.tags].join(', '),
    prepTime: isoMinutes(d.prepTime),
    cookTime: isoMinutes(d.cookTime),
    totalTime: isoMinutes(total || undefined),
    recipeYield: d.servings,
    recipeIngredient: d.ingredients.length ? d.ingredients.flatMap((g) => g.items) : undefined,
    recipeInstructions: !steps.length
      ? undefined
      : steps.length === 1 && !steps[0].title
        ? toSteps(steps[0].steps)
        : steps.map((g, i) => ({
            '@type': 'HowToSection',
            name: g.title ?? (i === 0 ? 'הכנה' : `שלב ${i + 1}`),
            itemListElement: toSteps(g.steps),
          })),
  };
}

export function postJsonLd(post: Post, url: string, imageUrl?: string) {
  const d = post.data;
  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: d.title,
    description: d.description || undefined,
    image: imageUrl ? [imageUrl] : undefined,
    url,
    mainEntityOfPage: url,
    author,
    publisher,
    datePublished: d.publishDate.toISOString(),
    dateModified: (d.updatedDate ?? d.publishDate).toISOString(),
    keywords: d.tags.length ? d.tags.join(', ') : undefined,
  };
}

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
