import { defineCollection, type SchemaContext } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { recipeCategorySlugs } from './data/categories';

/** Fields shared by recipes and blog posts (all migrated from Wix). */
const base = ({ image }: SchemaContext) => ({
  title: z.string(),
  description: z.string().default(''),
  image: image().optional(),
  imageAlt: z.string().optional(),
  publishDate: z.coerce.date(),
  updatedDate: z.coerce.date().optional(),
  /** Original Wix URL — used for redirects and migration QA. */
  wixUrl: z.url().optional(),
  draft: z.boolean().default(false),
  /**
   * Changes Claude made that Anna should review (shown in purple on the page, listed at /review).
   * `parts` says what to highlight; ticking `approved` in the admin panel removes the marks.
   */
  review: z
    .object({
      note: z.string(),
      parts: z.array(z.enum(['image', 'ingredients', 'instructions', 'text', 'seo'])).default([]),
      approved: z.boolean().default(false),
    })
    .optional(),
});

const recipes = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/recipes' }),
  schema: ({ image }) =>
    z.object({
      ...base({ image }),
      category: z.array(z.enum(recipeCategorySlugs)).min(1),
      tags: z.array(z.string()).default([]),
      /** Minutes. Optional: many original recipes don't state it. */
      prepTime: z.number().int().positive().optional(),
      cookTime: z.number().int().positive().optional(),
      servings: z.string().optional(),
      /** Grouped so sub-sections ("לרוטב", "יבשים"/"רטובים") survive; title is omitted for a single plain group. */
      ingredients: z
        .array(z.object({ title: z.string().optional(), items: z.array(z.string()).min(1) }))
        .default([]),
      instructions: z
        .array(z.object({ title: z.string().optional(), steps: z.array(z.string()).min(1) }))
        .default([]),
    }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/blog' }),
  schema: ({ image }) =>
    z.object({
      ...base({ image }),
      tags: z.array(z.string()).default([]),
    }),
});

export const collections = { recipes, blog };
