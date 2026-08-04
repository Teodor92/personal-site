// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://teodorkurtev.com',
  // Matches the old Jekyll output: /blog/foo/index.html served at /blog/foo/
  build: { format: 'directory' },
  integrations: [sitemap()],
  redirects: {
    // Old Jekyll archive routes — low traffic, point at the blog index
    '/year-archive/': '/blog/',
    '/categories/': '/blog/',
    // jekyll-sitemap emitted /sitemap.xml; @astrojs/sitemap emits /sitemap-index.xml
    '/sitemap.xml': '/sitemap-index.xml',
  },
});
