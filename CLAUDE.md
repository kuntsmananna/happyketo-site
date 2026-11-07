# CLAUDE.md

Happy Keto (happyketoforme.com) — Anna Kuntsman Rosenberg's keto site, rebuilt from Wix as a static Astro site on Vercel.

## Stack
- Astro 7, `output: 'static'`, `@astrojs/vercel` adapter (image service + web analytics), `@astrojs/sitemap`.
- Tailwind CSS 4 via `@tailwindcss/vite` — config lives in CSS (`src/styles/global.css`, `@theme` + `@utility`). There is no `tailwind.config.js`.
- Zod comes from `astro/zod` (Zod v4: use `z.url()`, not `z.string().url()`).
- Content collections in `src/content.config.ts` (glob loader). Schema helpers take `SchemaContext` from `astro:content`.
- No UI framework. Interactivity = small inline `<script>` in `.astro` components (vanilla TS).

## Conventions
- Hebrew is the default language (root URLs, RTL). English lives under `/en` (LTR) for Home, About, Contact, Challenge, Pantry, Privacy, Thanks; recipes/blog are Hebrew-only. `BaseLayout` sets `lang`/`dir` and hreflang alternates from the URL (`getLang`, `alternates` in `src/i18n/index.ts`; pairs listed in `PAIRS`).
- Bilingual pages are thin routes in `src/pages/` and `src/pages/en/` that render a shared view from `src/views/`. UI strings: `src/i18n/ui.ts` (`t(lang)`); homepage copy: `homeFor(lang)`; FAQ: `faqFor(lang)` (both from `src/data/content.ts`). Build internal links with `localized('/path', lang)`.
- **Editable copy lives in JSON** (`src/data/content/*.json`: home, faq, about, challenge per language; favorites; contact) so the Pages CMS admin panel can edit it. `src/data/content.ts` validates every file with Zod at build time (a bad edit fails the build with the file + field) and exports typed getters (`homeFor`, `faqFor`, `favorites`, `aboutContent`, …); components import them directly, `site.ts` builds contact/social from it. Change text there, not in components. Challenge form labels/field names stay in `ChallengeView` (they shape the emails).
- The original's English copy had mistranslations; fixes are deliberate and commented in the data files — don't re-copy from Wix.
- Use **logical** Tailwind utilities (`ps-/pe-/ms-/me-/start-/end-/text-start`), never `pl-/pr-/left-/right-`.
- Colors follow the original Wix theme: `forest-*` (brand green, 600 = #235B47), `navy-*` (700 = #223766), `mustard-*` (CTA, 400 = #F9AC28), `lime-*` (100 = #F1FBBD), `cream-*` (page bg cream-100), `mint-*`, `bark-*` (text browns), `coral-*`. Use tokens only, no hex in components.
- Design system utilities in `src/styles/global.css` – use them instead of ad-hoc sizes:
  - Type scale (the original's measured sizes, phones/desktop — use these, not one-off `text-[…]`): `h-display` (hero/page h1, 2.1/2.625rem), `h-section` (section h2 and inner-page h1, 1.85/2.3rem), `h-card` (h3, 1.5/1.75rem), `text-body` (20px copy), `lead`, `eyebrow` (serif-italic Latin label), `wordmark` (HAPPY KETO logo type).
  - Lists/links: `list-star` (✦ bullets), `link-arrow` (+ `<Icon name="arrowLong">`).
  - Spacing: `section-y` / `section-y-sm`; layout: `container-page`.
  - Buttons (all pills, ≥ 44px): `btn-primary` (mustard → green on hover), `btn-secondary` (green → mustard), `btn-outline`; sizes `btn-sm`, `btn-lg` (the original's 51px/45px CTA; override the desktop min-width with `lg:[--btn-w:…]`). Heights come from `--btn-h`, so size utilities never fight. Hover = colour swap + small lift. Surfaces: `card`, `card-interactive`, `surface-navy` (navy + leaf-shadow artwork).
  - Motion (subtle; everything is off under `prefers-reduced-motion`): add `data-reveal` (rise) / `="fade"` / `="zoom"` / `="start"` to elements that should build up as they scroll into view (BaseLayout's script staggers elements entering together; `data-reveal-delay="ms"` overrides). Don't put it on the LCP image (hero/About photos use `motion-safe:animate-settle`, a zoom without fade). `hover-zoom` on an `<img>` inside a `group overflow-hidden` card. `ArrowLong` slides on link hover. FAQ `<details data-smooth>` animate open. Cross-page fade via `@view-transition` (header has its own `view-transition-name`). Never put a transform/translate on an ancestor of a stretched link (`after:absolute after:inset-0`) — it shrinks the link's hit area.
  - Forms: `input-field` (+ `input-pill` for single-line pill inputs), `field-label`; errors show via `:user-invalid`.
- Images: give `<Image>` the displayed aspect via `width`/`height` + `fit="cover"` and realistic `sizes`, so generated files are cropped to what is shown. Images are optimized at build time (adapter `imageService: false`).
- Fonts are free look-alikes of the original's Wix-only fonts, self-hosted from npm `@fontsource*` packages via Astro's fonts API (local provider, `family()` helper in `astro.config.mjs`): Alef 400/700 = `font-sans` and `font-display` (text and headings; Anna's choice — Alef has old-style numerals and only two weights), Syne = `font-logo`, Georgia/Gelasio = `font-serif` (italic English accents). Don't add Google Fonts links.
- Don't reuse Wix stock images (file ids `11062b_*`, `c837a6_*` etc.) — they are licensed for Wix only. All were replaced; sources of post photos are in `docs/photo-credits.md`.
- Hebrew next to an LTR inline element (phone, email) across a line break loses its space in compressed HTML: add `{' '}` explicitly.
- Import alias `@/` → `src/`.
- Site constants (nav, URLs; phone/email/Instagram via `contact.json`) live in `src/data/site.ts`; recipe categories (+ Wix slug mapping) in `src/data/categories.ts`. Don't hardcode these in components.
- Recipe URLs keep the original Hebrew Wix slugs: `/post/<slug>` → `/recipes/<slug>` or `/blog/<slug>` (301s generated by `scripts/vercel-postbuild.mjs`; test with `node scripts/test-redirects.mjs`).
- Forms post to Web3Forms using `forms` from `src/data/site.ts` (public access key; `PUBLIC_WEB3FORMS_KEY` overrides it).
- Security headers incl. a Content-Security-Policy are added by `scripts/vercel-postbuild.mjs`; `script-src` lists the SHA-256 of every inline script found in the build, so new inline scripts are picked up automatically, but external script hosts must be added there. `check:dist` fails on `<script>`, `on…=` handlers, `javascript:` or non-YouTube iframes in `src/content`.
- Files/pages prefixed with `_` are ignored by Astro routing.
- Stylesheets are inlined into every page (`build.inlineStylesheets: 'always'`) – no render-blocking CSS request.
- Domain: registered at Wix, DNS at Wix; switch-day steps in `docs/domain-switch.md`. Keep the `google-site-verification` meta (Search Console ownership carried over from Wix).

## Components
- `BaseLayout` renders `Header`, `Footer` and the `KickstartBadge` (slides in, hides while scrolling down, smaller on phones; `hideBadge` on the challenge and thanks pages); pages only pass `title`/`description`.
- Layout rule: pages copy the original Wix layout (measured on desktop 1280px and the original mobile site); keep improvements for later and only deviate for a stated reason (licensing, accessibility, broken links), with a comment.
- `PageHero` (recipes/blog/categories): mustard `Marquee` band + visible Hebrew h1 and intro (Anna's choice). `Marquee` scrolls slowly (pauses on hover; static and centered under reduced motion), `sparkles` on About.
- Header: centered wordmark, flag language switch, a "מתכונים" shortcut (Anna's choice) and the "Menu" pill opening a `<dialog>` side panel (slides in; English items that lead to Hebrew pages are marked "(Hebrew)"). Original shapes: `Star.astro` (✦ bullets, also via `list-star`) and `ArrowLong.astro` (long arrow).
- Posts (`/recipes/[slug]`, `/blog/[slug]`): one 740px column; `Prose` = original post typography (its list/heading rules skip `.recipe-box`). Recipe pages: "למתכון ↓" jump pill under the h1; `RecipeBox` = time/servings chips, print button, ingredients and steps that tick off (native checkboxes, remembered per recipe in localStorage), print view showing only the title and the recipe.
- `Web3Form` wraps every form (newsletter, challenge; with JS it validates itself and shows a message under each invalid field (`aria-invalid`/`aria-describedby`, texts in `t(lang).form.invalid`); the contact page is text-only like the original, Anna's choice): pass `subject`, put fields in the slot, use `type="submit"`. It has a honeypot and works without JS (redirects to `/thanks` or `/en/thanks`).
- Homepage: the original's sections in order, plus `LatestRecipes` after the challenge block (Anna's choice): the 4 newest recipes with photos, `compact` tiles, one row on desktop, swipeable on phones.
- `RecipeCard`/`PostCard`: thin wrappers around `PhotoTile` (pass `priority` to the first tile of a list only: it gets `fetchpriority=high` and no reveal; other tiles lazy-load, compact ones at low priority) (the original's square photo tile, title + tag over the photo, whole tile clickable), two columns. `RecipeFilter` (an addition Anna chose to keep: vanilla JS, category chips are real links, Hebrew-aware search, state in `?category=&q=`); cards must be inside the element whose id is the filter's `target`.
- Use `src/lib/recipes.ts` for queries (`getRecipes`, `getPosts`, `entryUrl`, `countByCategory`) instead of calling `getCollection` directly.
- Brand stickers (`src/assets/brand/`) are decorative: always `alt=""`.

## Content (migrated from Wix)
- `src/content/recipes/*.md` and `src/content/blog/*.md`; file name = original Hebrew Wix slug = entry id.
- Recipe `ingredients` / `instructions` are **groups**: `[{ title?, items[] }]` / `[{ title?, steps[] }]`. Render group titles only when present; flatten for JSON-LD.
- Post images are relative paths to `src/assets/posts/`; looping MP4s (ex-GIFs) and videos are in `public/videos/` and appear in markdown as raw `<video>`; YouTube as `<iframe>` (youtube-nocookie).
- `npm run scrape` regenerates from Wix but never overwrites an existing `.md` without `--force`. Hand-structured recipes live in `scripts/scrape/overrides.mjs`. Check with `npm run scrape:verify`. Details: `docs/migration-report.md`.

## Pages
- `/recipes/[slug]`: renders the Markdown via `SplitContent`, which puts `RecipeBox` where the scraper left `<!-- recipe -->` (keep that marker when editing a recipe). Recipe/BlogPosting JSON-LD builders are in `src/lib/schema.ts`.
- 404: `NotFoundView` in both languages; `/404.html` (Hebrew) and `/en/404` (served for missing `/en/*` by a route added in `scripts/vercel-postbuild.mjs`).
- `/recipes/category/[category]` only exists for categories with recipes. FAQPage JSON-LD is emitted on the homepage only (`<FaqAccordion schema={false} />` elsewhere).
- Pantry products: `src/data/content/favorites.json` (`image` = `/src/assets/favorites/<file>`, the path the admin panel stores) ; links keep Anna's iHerb `rcode`.
- Form field names are in the page language (except `name`/`email`, which Web3Forms uses) so the emails read naturally.

## Verify changes
`npm run check && npm run build && npm run check:dist && npm run test:redirects` must pass (Vercel's build command runs the last three, so a failure blocks the deploy). For visual changes, screenshot at 375px and 1280px wide and confirm no horizontal scroll.

## Admin panel (Pages CMS)
- Anna edits content at app.pagescms.org; config in `.pages.yml`; her how-to is `docs/editing-guide.md`. Saves are commits to `main` → Vercel deploy.
- Keep `.pages.yml` in sync when changing a content schema (`src/content.config.ts`, `src/data/content.ts`): every key inside a list of objects must be declared (undeclared keys are dropped on save); top-level unknown frontmatter keys survive thanks to `settings.content.merge`.
- Post bodies are a plain `text` field (the rich-text editor would drop `<video>`, `<iframe>` and `<!-- recipe -->`). Renaming entries is off (file name = URL). New entries need Latin file names (Pages CMS slugify strips Hebrew).
- Dates are saved as `yyyy-MM-dd'T'HH:mm:ss.SSSXXX`; images as `../../assets/posts/<file>` (media `posts`) or `/src/assets/favorites/<file>` (media `favorites`).

## Share images & accessibility
- Branded og:image cards: `scripts/og/render-og.mjs` (Chrome via Playwright) → `public/og/<hash>.jpg` + `manifest.json`; `.github/workflows/og-images.yml` re-renders on content pushes. `src/lib/og.ts` uses a card only when its key (title + image + TEMPLATE_VERSION) matches; bump TEMPLATE_VERSION in both files when changing the card design.
- Accessibility statement: `/accessibility` + `/en/accessibility`, text in `src/data/content/accessibility.*.json`, footer link. Update "how it was tested" after big changes.

## Dashboard
- `/admin` = Anna's single entry point: a 302 (in `scripts/vercel-postbuild.mjs`) to the Pages CMS panel for this repo. The dashboard is `src/pages/admin/dashboard.astro` (noindex, not in the sitemap, not linked from the public site; linked from the panel entry `docs/dashboard-link.json`, the guide, and back to `/admin`). Hebrew. Nothing private on it. `/dashboard-hk7m2q` (old address) 301s there.
- Five tabs (סקירה, מהירות, גוגל ו-AI, תוכן, גולשים וטכנולוגיה): jump links + all panels without JS, ARIA tabs with it (hash remembers the tab). Every number/check has an ⓘ `InfoTip` (short Hebrew explanation; check texts in `HELP` in `src/lib/dashboard.ts`); ⓘ buttons and chart marks share one hover/focus/tap box (`data-tip`). `Meter` = share/score bar, `ScoreRing` = headline speed score; icons from `Icon.astro`.
- Numbers/checks: `src/lib/dashboard.ts` (build time: content KPIs, content health, SEO, GEO, tips, tech, completeness, Lighthouse score averages). Charts in `src/components/dashboard/` follow the dataviz rules: one hue for magnitude (`chart-1`), the validated categorical order `chart-1..4` (don't add hues), status = icon + word, tooltip via `data-tip`, table view under every chart.
- Speed history: `src/data/metrics/speed.json`, appended by `.github/workflows/weekly-metrics.yml` (Mondays; runs `scripts/metrics/measure-speed.mjs` = Lighthouse mobile, median of 3, measures www.happyketoforme.com once it is on Vercel). The workflow commits the JSON, which triggers a deploy.
- Visitors: Vercel Web Analytics has no query API on this plan – the dashboard links to it instead.
- GEO: `public/robots.txt` allows AI crawlers explicitly; `/llms.txt` is generated from content (`src/pages/llms.txt.ts`); homepage carries WebSite + Organization JSON-LD (`siteJsonLd`).

## Content changes need Anna's review
When you change the wording, structure or images of a recipe/post, add to its frontmatter
`review: { note?: "<Hebrew: what changed and why>", parts: [image|ingredients|instructions|text|description|imageAlt|bodyAlts], approved: false }`. `description` / `imageAlt` / `bodyAlts` (Google description, main-photo alt, alts of photos in the body) are invisible parts: no tile tag, the review box and the `/review` table show their current text – don't copy that text into the note. The parts, their labels and visible/invisible flag live in one table, `src/data/review.ts` (schema enum and helpers derive from it); `.pages.yml` repeats values + labels once (YAML anchor `&reviewField`) and `check:dist` fails if they drift. Helpers in `src/lib/recipes.ts`: `pendingReview`, `reviewSplit`, `visibleReview`, `invisibleReviewTexts`, `entryUrl`, `bodyImages`/`bodyImageAlts`.
The page then shows a purple `ReviewNote` (with a link to the Wix original) and purple marks on the listed parts, tiles get a "לבדיקה" tag, and `/review` lists everything pending. The marks are visible **only in review mode**: opening `/review` (or any URL with `?review=on`; `?review=off` clears it) sets `localStorage` `hk-review`, and BaseLayout's head script adds `reviewer` to `<html>`. Visitors never see them. Wrap Anna-only elements in `reviewer-only` and purple styling in the `reviewer:` variant (global.css). Anna ticks "אישרתי" in the admin panel to clear it. Purple tokens: `review-*` in global.css.

## Reviews
Three review subagents live in `.claude/agents/` (`code-reviewer`, `security-reviewer`, `ux-reviewer`); they are discovered when a session starts in the repo root. Treat their findings as claims and verify before acting.
