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
    // Neo-brutalist card: cream paper, thick pink edge, black type.
    bgGradient: [[255, 251, 234]],
    border: { color: [255, 107, 157], width: 28, side: 'inline-start' },
    padding: 72,
    // Same faces as the site: Space Grotesk headings, Inter body.
    fonts: [
      './node_modules/@fontsource-variable/space-grotesk/files/space-grotesk-latin-wght-normal.woff2',
      './node_modules/@fontsource-variable/inter/files/inter-latin-wght-normal.woff2',
    ],
    font: {
      title: {
        size: 68,
        weight: 'Bold',
        color: [0, 0, 0],
        lineHeight: 1.15,
        families: ['Space Grotesk'],
      },
      description: {
        size: 30,
        color: [51, 51, 51],
        lineHeight: 1.5,
        families: ['Inter'],
      },
    },
  }),
});
