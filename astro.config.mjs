// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { remarkReadingTime } from './src/plugins/remark-reading-time.mjs';

// https://astro.build/config
export default defineConfig({
  site: 'https://teodorkurtev.com',
  // Matches the old Jekyll output: /blog/foo/index.html served at /blog/foo/
  build: { format: 'directory' },
  integrations: [sitemap()],
  markdown: {
    remarkPlugins: [remarkReadingTime],
  },
  redirects: {
    // Old Jekyll archive routes — low traffic, point at the blog index
    '/year-archive/': '/blog/',
    '/tags/': '/blog/',
    '/categories/': '/blog/',
    // jekyll-sitemap emitted /sitemap.xml; @astrojs/sitemap emits /sitemap-index.xml
    '/sitemap.xml': '/sitemap-index.xml',
  },
});
