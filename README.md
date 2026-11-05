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
| `npm run scrape` | (stage 2) Import posts + images from the Wix site into `src/content/` |

## Environment

Copy `.env.example` → `.env` and set `PUBLIC_WEB3FORMS_KEY` (get one free at web3forms.com with the email that should receive form submissions). Set the same variable in the Vercel project settings.

## Structure

```
src/
  content.config.ts     content collections: recipes, blog
  content/recipes/      one .md per recipe (frontmatter: title, description, category[], prepTime, ingredients[], instructions[], image…)
  content/blog/         articles
  assets/recipes/       images (optimized at build time)
  data/                 site.ts (contact, nav), categories.ts, faq.ts
  layouts/              BaseLayout.astro (lang="he" dir="rtl", SEO meta)
  components/           UI components
  pages/                routes
  styles/global.css     Tailwind + design tokens
scripts/scrape/         Wix → Markdown migration script
```

## Roadmap

1. ✅ Project setup (Astro, Tailwind, Vercel adapter, content schema, design tokens)
2. Scraper: migrate ~130 Wix posts + images
3. UI components (Header, Hero, Services, FAQ, Footer, RecipeCard, RecipeFilter)
4. Homepage + recipe/blog/challenge/contact pages, Recipe JSON-LD
5. `vercel.json` (headers, 301 redirects from old Wix URLs), deploy, DNS for happyketoforme.com
