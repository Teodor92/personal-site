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
    logo: { path: './public/icon-192.png', size: [76] },
    bgGradient: [
      [12, 20, 19],
      [20, 32, 30],
    ],
    border: { color: [45, 212, 191], width: 14, side: 'inline-start' },
    padding: 72,
    font: {
      title: {
        size: 60,
        weight: 'Bold',
        color: [230, 239, 237],
        lineHeight: 1.2,
      },
      description: {
        size: 28,
        color: [160, 180, 176],
        lineHeight: 1.5,
      },
    },
  }),
});
