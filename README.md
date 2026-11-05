# Happy Keto — happyketoforme.com

Static rebuild of the Happy Keto Wix site: **Astro 7 + Tailwind CSS 4**, Hebrew RTL, deployed on **Vercel**.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Install dependencies (Node ≥ 22.12) |
| `npm run dev` | Dev server at http://localhost:4321 |
| `npm run build` | Static build → `dist/` and `.vercel/output/` |
| `npm run preview` | Preview the production build |
| `npm run check` | Type-check `.astro`/TS files and content schemas |
| `npm run scrape` | Import posts + images from the Wix site into `src/content/` (`--force` overwrites, `--refresh` refetches, `--only=<slug>`) |
| `npm run scrape:verify` | Check that no text of the original posts was lost |
| `npm run check:dist` | After a build: every internal link resolves, JSON-LD is valid, recipe pages are complete |

## Environment

Forms use Web3Forms. The (public) access key lives in `src/data/site.ts`; `PUBLIC_WEB3FORMS_KEY` in `.env` or Vercel overrides it.

## Structure

```
src/
  content.config.ts     content collections: recipes, blog
  content/recipes/      one .md per recipe (frontmatter: title, description, category[], prepTime, ingredients[], instructions[], image…)
  content/blog/         articles
  assets/posts/         post images (optimized at build time)
  assets/home/, brand/  homepage photos and the Happy Keto stickers
  data/                 site.ts (contact, nav), categories.ts, faq.ts
  layouts/              BaseLayout.astro (lang="he" dir="rtl", SEO meta, Header + Footer)
  lib/recipes.ts        collection queries, URLs, category counts
  components/           UI components
  pages/                routes
  styles/global.css     Tailwind + design tokens
scripts/scrape/         Wix → Markdown migration (see docs/migration-report.md)
public/videos/          looping MP4s (converted GIFs) and post videos
```

## Roadmap

1. ✅ Project setup (Astro, Tailwind, Vercel adapter, content schema, design tokens)
2. ✅ Scraper: 127 Wix posts + 162 images migrated ([report](docs/migration-report.md))
3. ✅ UI components (Header, Hero, Challenge, About, Services, FAQ, Newsletter/Web3Form, Footer, RecipeCard, RecipeFilter) + homepage and `/recipes` catalog
4. ✅ Recipe pages (Recipe JSON-LD), category pages, blog + articles, challenge (registration form), contact, about, favorites, privacy, 404
5. `vercel.json` (headers, 301 redirects from old Wix URLs), deploy, DNS for happyketoforme.com
