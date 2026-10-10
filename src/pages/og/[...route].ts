import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { site } from '../../data/site';

const posts = await getCollection('blog', ({ data }) => !data.draft);

const pages: Record<string, { title: string; description: string }> = {
  index: { title: site.name, description: site.role },
  cv: { title: `${site.name} · CV`, description: site.role },
  blog: { title: 'Blog', description: 'Writing about software engineering, tooling and teams.' },
  tags: { title: 'Tags', description: 'Blog posts by tag.' },
  uses: { title: 'Uses', description: 'The tools, editor setup and hardware I use day to day.' },
  now: { title: 'Now', description: "What I'm focused on right now." },
  ...Object.fromEntries(
    posts.map((post) => [
      `blog/${post.id}`,
      { title: post.data.title, description: post.data.description },
    ]),
  ),
};

export const { getStaticPaths, GET } = await OGImageRoute({
  pages,
  getImageOptions: (_path, page) => ({
    title: page.title,
    description: page.description,
    logo: { path: './public/icon-192.png', size: [96] },
    // Evolved neo-brutalist card: cream paper, a thick AI-yellow edge, ink type.
    bgGradient: [[255, 251, 234]],
    border: { color: [255, 210, 63], width: 28, side: 'inline-start' },
    padding: 72,
    // Same faces as the site: Bricolage Grotesque headings, Atkinson Hyperlegible Next body.
    fonts: [
      './node_modules/@fontsource-variable/bricolage-grotesque/files/bricolage-grotesque-latin-wght-normal.woff2',
      './node_modules/@fontsource-variable/atkinson-hyperlegible-next/files/atkinson-hyperlegible-next-latin-wght-normal.woff2',
    ],
    font: {
      title: {
        size: 68,
        weight: 'ExtraBold',
        color: [18, 17, 16],
        lineHeight: 1.1,
        families: ['Bricolage Grotesque'],
      },
      description: {
        size: 30,
        color: [59, 56, 48],
        lineHeight: 1.5,
        families: ['Atkinson Hyperlegible Next'],
      },
    },
  }),
});
