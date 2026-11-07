/**
 * Recipe categories of the new site.
 * `slug` is the URL segment (/recipes/category/<slug>); `wix` lists the matching
 * Wix blog-category slugs (from /recipes/categories/<wix-slug>) used by the scraper
 * and for 301 redirects. `wixPage` is the old Wix landing page for that category.
 */
export const recipeCategories = [
  { slug: 'paleo', label: 'פליאו', wix: ['low-carb'], wixPage: '/paleo-recipes' },
  { slug: 'pastry', label: 'מאפים', wix: ['מאפים'], wixPage: '/pastry-recipes' },
  { slug: 'meat', label: 'בשר', wix: ['בשר'], wixPage: '/meat-recipes' },
  { slug: 'fish', label: 'דגים', wix: ['דגים'], wixPage: '/fish-recipes' },
  { slug: 'soups', label: 'מרקים', wix: ['מרקים'], wixPage: '/soups-recipes' },
  { slug: 'eggs', label: 'ביצים', wix: ['מתכוני-ביצים'], wixPage: '/eggs-recipes' },
  { slug: 'vegetables', label: 'ירקות', wix: ['מתכוני-ירקות'], wixPage: '/vegetables-recipes' },
  { slug: 'desserts', label: 'קינוחים', wix: ['קינוחים'], wixPage: '/desserts-recipes' },
  { slug: 'spreads', label: 'ממרחים ורטבים', wix: ['ממרחים'], wixPage: '/keto-spread' },
  { slug: 'drinks', label: 'משקאות', wix: ['משקאות'], wixPage: '/drinks-recipes' },
] as const;

export type RecipeCategorySlug = (typeof recipeCategories)[number]['slug'];

export const recipeCategorySlugs = recipeCategories.map((c) => c.slug) as [
  RecipeCategorySlug,
  ...RecipeCategorySlug[],
];
