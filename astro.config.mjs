// @ts-check
import { defineConfig } from 'astro/config';
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
    // Serve astro:assets <Image> through Vercel's image optimization in production.
    imageService: true,
    webAnalytics: { enabled: true },
  }),

  integrations: [sitemap()],

  image: {
    // Allows optimizing remote Wix images during migration; local assets are preferred.
    domains: ['static.wixstatic.com'],
  },

  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },

  vite: {
    plugins: [tailwindcss()],
  },
});
