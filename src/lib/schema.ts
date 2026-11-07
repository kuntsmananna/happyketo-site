/** schema.org JSON-LD builders (Google rich results). */
import { site } from '@/data/site';
import { categoryLabel, type Post, type Recipe } from './recipes';

const author = { '@type': 'Person', name: site.author, url: `${site.url}/about`, sameAs: site.social.map((s) => s.href) };
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
    inLanguage: 'he',
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
    inLanguage: 'he',
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

/** Homepage: the site and the business behind it (helps search engines and AI assistants attribute content). */
export function siteJsonLd(lang: 'he' | 'en') {
  const home = lang === 'en' ? `${site.url}/en` : site.url;
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: site.name,
      url: home,
      inLanguage: lang,
      description: site.description,
      publisher: { '@id': `${site.url}/#organization` },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      '@id': `${site.url}/#organization`,
      name: site.name,
      url: site.url,
      logo: `${site.url}/favicon.svg`,
      email: site.contact.email,
      telephone: site.contact.phoneHref.replace('tel:', ''),
      sameAs: site.social.map((s) => s.href),
      founder: author,
      areaServed: 'IL',
    },
  ];
}

export const formatDate = (date: Date) =>
  new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long', year: 'numeric' }).format(date);
