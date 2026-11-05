/**
 * Recipe categories of the new site.
 * `slug` is the URL segment (/recipes/category/<slug>); `wix` lists the matching
 * Wix blog-category slugs (from /recipes/categories/<wix-slug>) used by the scraper
 * and for 301 redirects. `wixPage` is the old Wix landing page for that category.
 */
export const recipeCategories = [
  { slug: 'paleo', label: 'פליאו', wix: [], wixPage: '/paleo-recipes' },
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

export const getCategory = (slug: string) => recipeCategories.find((c) => c.slug === slug);

/**
 * Wix blog categories that mark a post as an article (blog) rather than a recipe.
 * Paleo, lunch-box and low-carb mappings get verified against real data in stage 2.
 */
export const wixBlogCategories = ['בלוג-קטוגני', 'מדריך-לקיטו', 'המדריך-לתזונה-דלת-פחמימות'];
