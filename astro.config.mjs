import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Public site URL — used for canonical links, OG tags and the sitemap.
// If you change the production domain, update it here.
const SITE = 'https://blog.turkguncesi.com';

export default defineConfig({
  site: SITE,
  trailingSlash: 'ignore',
  build: {
    format: 'directory',
  },
  integrations: [
    sitemap({
      changefreq: 'weekly',
      priority: 0.7,
    }),
  ],
  server: {
    port: 4321,
    host: true,
  },
  devToolbar: {
    enabled: false,
  },
  // Pagefind generates /pagefind/pagefind.js during `postbuild`, after
  // Astro has already bundled the site. Mark it as external so rollup
  // does not try to resolve it at build time.
  vite: {
    build: {
      rollupOptions: {
        external: [/^\/pagefind\//],
      },
    },
  },
});
