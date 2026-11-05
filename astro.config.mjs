// @ts-check
import { defineConfig, fontProviders } from 'astro/config';
import vercel from '@astrojs/vercel';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://docs.astro.build/en/reference/configuration-reference/
export default defineConfig({
  site: 'https://www.happyketoforme.com',
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'directory' },

  adapter: vercel({
    // Images are optimized at build time (sharp → WebP, responsive widths) and served as static
    // files from the CDN: no per-request image quota on Vercel, and identical output locally.
    imageService: false,
    webAnalytics: { enabled: true },
  }),

  integrations: [sitemap({ filter: (page) => !/\/thanks\/?$/.test(page) })],

  // Rubik (variable, 300–900) from the @fontsource-variable/rubik npm package: no network at build
  // time, self-hosted with the site, Hebrew + Latin subsets only (each loads only when its characters
  // appear), and a metric-matched fallback so text doesn't shift when the font arrives.
  fonts: [
    {
      provider: fontProviders.local(),
      name: 'Rubik',
      cssVariable: '--font-rubik',
      fallbacks: ['system-ui', 'sans-serif'],
      options: {
        variants: [
          {
            src: ['@fontsource-variable/rubik/files/rubik-latin-wght-normal.woff2'],
            weight: '300 900',
            style: 'normal',
            display: 'swap',
            unicodeRange: [
              'U+0000-00FF', 'U+0131', 'U+0152-0153', 'U+02BB-02BC', 'U+02C6', 'U+02DA', 'U+02DC', 'U+0304',
              'U+0308', 'U+0329', 'U+2000-206F', 'U+20AC', 'U+2122', 'U+2191', 'U+2193', 'U+2212', 'U+2215',
              'U+FEFF', 'U+FFFD',
            ],
          },
          {
            src: ['@fontsource-variable/rubik/files/rubik-hebrew-wght-normal.woff2'],
            weight: '300 900',
            style: 'normal',
            display: 'swap',
            unicodeRange: ['U+0307-0308', 'U+0590-05FF', 'U+200C-2010', 'U+20AA', 'U+25CC', 'U+FB1D-FB4F'],
          },
        ],
      },
    },
  ],

  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  vite: {
    plugins: [tailwindcss()],
  },
});
