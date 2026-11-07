// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

const RANGES = {
  latin: ['U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC', 'U+0304', 'U+0308',
    'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122', 'U+2191', 'U+2193', 'U+2212', 'U+2215', 'U+FEFF', 'U+FFFD'],
  hebrew: ['U+0307-0308', 'U+0590-05FF', 'U+200C-2010', 'U+20AA', 'U+25CC', 'U+FB1D-FB4F'],
};

/**
 * A self-hosted font family from local woff2 files, one face per subset (Latin first: fallback metrics use it).
 * @param {string} name
 * @param {`--${string}`} cssVariable
 * @param {string} weight
 * @param {Partial<Record<keyof typeof RANGES, string>>} files
 * @param {'normal' | 'italic'} [style]
 * @param {string[]} [fallbacks]
 * @returns {any}
 */
function family(name, cssVariable, weight, files, style = 'normal', fallbacks = ['system-ui', 'sans-serif']) {
  return {
    provider: fontProviders.local(),
    name,
    cssVariable,
    fallbacks,
    options: {
      variants: Object.entries(files).map(([subset, src]) => ({
        src: [src], weight, style, display: 'swap', unicodeRange: RANGES[/** @type {keyof typeof RANGES} */ (subset)],
      })),
    },
  };
}

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://www.happyketoforme.com',
  output: 'static',
  trailingSlash: 'never',
  // Stylesheets are inlined (~16 KB, ~4 KB gzipped): no render-blocking CSS request before the first paint.
  build: { format: 'directory', inlineStylesheets: 'always' },

  adapter: vercel({
    // Images are optimized at build time (sharp → WebP, responsive widths) and served as static
    // files from the CDN: no per-request image quota on Vercel, and identical output locally.
    imageService: false,
    webAnalytics: { enabled: true },
  }),

  integrations: [sitemap({ filter: (page) => !/\/(thanks|404)\/?$/.test(page) })],

  // Free look-alikes of the original Wix brand fonts, self-hosted from npm (no network at build time).
  // Each family gets Hebrew + Latin faces split by unicode-range (a face downloads only when used),
  // and a metric-matched fallback so text doesn't shift when the font arrives.
  //   sans    Alef (400/700) for headings and text, replacing the original's Asimon + Almoni (chosen by Anna)
  //   logo    Syne = original logo font               serif   Gelasio (Georgia twin) for italic Latin labels
  fonts: [
    {
      ...family('Alef', '--font-alef', '400', {}),
      options: {
        variants: ['400', '700'].flatMap((weight) =>
          /** @type {const} */ (['latin', 'hebrew']).map((subset) => ({
            src: [`@fontsource/alef/files/alef-${subset}-${weight}-normal.woff2`],
            weight, style: 'normal', display: 'swap', unicodeRange: RANGES[subset],
          })),
        ),
      },
    },
    family('Syne', '--font-syne', '400 800', {
      latin: '@fontsource-variable/syne/files/syne-latin-wght-normal.woff2',
    }),
    family('Gelasio', '--font-gelasio', '400', {
      latin: '@fontsource/gelasio/files/gelasio-latin-400-italic.woff2',
    }, 'italic', ['Georgia', 'serif']),
  ],

  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  vite: {
    plugins: [tailwindcss()],
  },
});
