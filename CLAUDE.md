# CLAUDE.md

Happy Keto (happyketoforme.com) — Anna Kuntsman Rosenberg's keto site, rebuilt from Wix as a static Astro site on Vercel.

## Stack
- Astro 7, `output: 'static'`, `@astrojs/vercel` adapter (image service + web analytics), `@astrojs/sitemap`.
- Tailwind CSS 4 via `@tailwindcss/vite` — config lives in CSS (`src/styles/global.css`, `@theme` + `@utility`). There is no `tailwind.config.js`.
- Zod comes from `astro/zod` (Zod v4: use `z.url()`, not `z.string().url()`).
- Content collections in `src/content.config.ts` (glob loader). Schema helpers take `SchemaContext` from `astro:content`.
- No UI framework. Interactivity = small inline `<script>` in `.astro` components (vanilla TS).

## Conventions
- All user-facing copy is **Hebrew**; `<html lang="he" dir="rtl">` is set in `BaseLayout.astro`.
- Use **logical** Tailwind utilities (`ps-/pe-/ms-/me-/start-/end-/text-start`), never `pl-/pr-/left-/right-`.
- Colors: `olive-*`, `sage-*`, `cream-*`, `cocoa-*` tokens only. Shared utilities: `container-page`, `btn-primary`, `btn-secondary`, `card`.
- Import alias `@/` → `src/`.
- Site constants (phone, email, nav, social) live in `src/data/site.ts`; recipe categories (+ Wix slug mapping) in `src/data/categories.ts`; FAQ text in `src/data/faq.ts`. Don't hardcode these in components.
- Recipe URLs keep the original Hebrew Wix slugs: `/post/<slug>` → `/recipes/<slug>` or `/blog/<slug>` (301 in `vercel.json`).
- Forms post to Web3Forms using `forms` from `src/data/site.ts` (public access key; `PUBLIC_WEB3FORMS_KEY` overrides it).
- Files/pages prefixed with `_` are ignored by Astro routing.

## Components
- `BaseLayout` renders `Header` and `Footer`; pages only pass `title`/`description`.
- `Web3Form` wraps every form (newsletter, contact, challenge): pass `subject`, put fields in the slot, use `type="submit"`. It has a honeypot and works without JS (redirects to `/thanks`).
- `RecipeCard` + `RecipeFilter` (vanilla JS: category chips are real links, search is Hebrew-aware, state in `?category=&q=`). Cards need to be inside the element whose id is the filter's `target`.
- Use `src/lib/recipes.ts` for queries (`getRecipes`, `getPosts`, `recipeUrl`, `countByCategory`) instead of calling `getCollection` directly.
- Brand stickers (`src/assets/brand/`) are decorative: always `alt=""`.

## Content (migrated from Wix)
- `src/content/recipes/*.md` and `src/content/blog/*.md`; file name = original Hebrew Wix slug = entry id.
- Recipe `ingredients` / `instructions` are **groups**: `[{ title?, items[] }]` / `[{ title?, steps[] }]`. Render group titles only when present; flatten for JSON-LD.
- Post images are relative paths to `src/assets/posts/`; looping MP4s (ex-GIFs) and videos are in `public/videos/` and appear in markdown as raw `<video>`; YouTube as `<iframe>` (youtube-nocookie).
- `npm run scrape` regenerates from Wix but never overwrites an existing `.md` without `--force`. Hand-structured recipes live in `scripts/scrape/overrides.mjs`. Check with `npm run scrape:verify`. Details: `docs/migration-report.md`.

## Pages
- `/recipes/[slug]`: renders the Markdown via `SplitContent`, which puts `RecipeBox` where the scraper left `<!-- recipe -->` (keep that marker when editing a recipe). Recipe/BlogPosting JSON-LD builders are in `src/lib/schema.ts`.
- `/recipes/category/[category]` only exists for categories with recipes. FAQPage JSON-LD is emitted on the homepage only (`<FaqAccordion schema={false} />` elsewhere).
- Pantry products: `src/data/favorites.ts` + `src/assets/favorites/<slug>.webp`; links keep Anna's iHerb `rcode`.
- Form field names are Hebrew (except `name`/`email`, which Web3Forms uses) so the emails read naturally.

## Verify changes
`npm run check && npm run build && npm run check:dist` must pass. For visual changes, screenshot at 375px and 1280px wide and confirm no horizontal scroll.
