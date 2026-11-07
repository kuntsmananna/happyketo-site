# simplify-repo — Happy Keto (happyketo-site)

Project-specific settings for the `simplify-repo` skill. CLAUDE.md is the
standard; this file only adds what the sweep needs on top of it.

## Exclusions

`inventory.sh` already skips non-code files (`.md`, `.json`, `.yml`, images,
videos) and `public/`. In addition, never review or edit:

- exclude: `src/content/*`
- exclude: `src/data/content/*`
- exclude: `src/data/metrics/*`
- exclude: `scripts/scrape/overrides.mjs`
- exclude: `docs/*`

Why: recipes, posts and every JSON copy file are Anna's content — changing
their wording, structure or images needs a `review:` block and her approval
(CLAUDE.md "Content changes need Anna's review"). `overrides.mjs` is
hand-structured recipe data, not logic. If a code change would alter copy that
shows on a page, it is behaviour-changing: report it, don't make it.

## Standards greps (run once in Phase 1)

Each hit is a candidate; check CLAUDE.md for an exception first. The comment
above each grep names the rule it checks.

```bash
# Logical Tailwind only: ps-/pe-/ms-/me-/start-/end-/text-start, never pl-/pr-/left-/right-
grep -rnE '(^|[ "'"'"':])-?(pl|pr|ml|mr|left|right|rounded-l|rounded-r|border-l|border-r)-[0-9a-z[]|text-(left|right)\b' src --include=*.astro
# Colour tokens only, no hex in components
grep -rnE '#[0-9a-fA-F]{3,8}\b' src/components src/views src/pages src/layouts --include=*.astro
# Type scale utilities (h-display, h-section, h-card, text-body ...), not one-off sizes
grep -rnoE 'text-\[[0-9.]+(rem|px)\]' src --include=*.astro
# Content queries go through src/lib/recipes.ts
grep -rln 'getCollection' src | grep -v src/lib/recipes.ts
# Zod comes from astro/zod (v4: z.url(), not z.string().url())
grep -rnE "from 'zod'|z\.string\(\)\.(url|email)" src
# The @/ alias, not deep relative imports
grep -rnE "from '(\.\./){2,}" src
# Internal links built with localized('/path', lang)
grep -rnE 'href="/en/' src --include=*.astro
# Brand stickers are decorative: check each <Image> using them has alt=""
grep -rn 'assets/brand' src --include=*.astro
# Site constants (URLs, phone, email, Instagram) come from src/data/site.ts
grep -rnE 'happyketoforme\.com|instagram\.com|wa\.me|tel:|mailto:' src --include=*.astro
```

## Rules a "simplification" must not break

- **Layout copies the original Wix site.** Don't "tidy" markup into a different
  layout; spacing/size utilities that look arbitrary were measured.
- **Inline scripts are hashed into the CSP** at build time — fine to edit,
  but don't move one into an external file or add an external host.
- `<Image>` keeps its `width`/`height`/`fit="cover"`/`sizes`; the LCP image
  keeps `motion-safe:animate-settle` and no `data-reveal`.
- Hebrew next to an LTR inline element keeps its explicit `{' '}`.
- Never put a transform on an ancestor of a stretched link.
- `review.ts` is the one table for review parts — `.pages.yml` mirrors it, and
  `check:dist` fails if they drift. Changing `src/content.config.ts` or
  `src/data/content.ts` schemas means updating `.pages.yml` too (that is
  behaviour: report it unless it is a pure refactor).
- og-image `TEMPLATE_VERSION` must match in `src/lib/og.ts` and
  `scripts/og/render-og.mjs`; changing the card's look is not a simplification.
- Keep the `google-site-verification` meta.

## Verify

- **Per batch (fast):** `npm run check` (astro check: types for `.astro`,
  `.ts`). For a batch in `scripts/`, also run the script's own test where one
  exists (`npm run test:redirects` for redirect code, `npm run check:dist`
  after a build for `check-dist.mjs`).
- **Full (Phase 3):** `npm run check && npm run build && npm run check:dist && npm run test:redirects`
  — Vercel runs the last three, so a failure blocks the deploy.
- **Visual:** for batches that touched components/views/layouts/styles,
  screenshot the affected pages at 375px and 1280px wide (`npm run preview`
  after the build, Playwright) and compare against the same pages before the
  sweep (`git stash` / a build of the starting commit). Confirm no horizontal
  scroll. Any visible difference means the batch changed behaviour — revert
  that part.

## Shipping

- No version bump convention. Update CLAUDE.md in the final commit if a sweep
  renamed or moved anything it names.
- Commit to the current working branch; Anna's admin-panel saves go to `main`,
  so never push sweep commits to `main` directly.
