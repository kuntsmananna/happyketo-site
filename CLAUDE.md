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
- Forms post to Web3Forms with `import.meta.env.PUBLIC_WEB3FORMS_KEY`.
- Files/pages prefixed with `_` are ignored by Astro routing.

## Verify changes
`npm run check && npm run build` must pass. For visual changes, screenshot at 375px and 1280px wide and confirm no horizontal scroll.
