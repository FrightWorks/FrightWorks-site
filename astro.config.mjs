// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

export default defineConfig({
  site: 'https://frightworks.dev',
  trailingSlash: 'ignore',
  // Writes sitemap-index.xml (linked from public/robots.txt) listing every page at build time.
  integrations: [sitemap()],
});
