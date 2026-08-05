import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { site } from '../../data/site';

const posts = await getCollection('blog', ({ data }) => !data.draft);

const pages: Record<string, { title: string; description: string }> = {
  index: { title: site.name, description: site.role },
  cv: { title: 'Curriculum Vitae', description: `${site.name} · ${site.role}` },
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
      [16, 18, 20],
      [26, 29, 32],
    ],
    border: { color: [90, 162, 240], width: 14, side: 'inline-start' },
    padding: 72,
    font: {
      title: {
        size: 60,
        weight: 'Bold',
        color: [232, 234, 237],
        lineHeight: 1.2,
      },
      description: {
        size: 28,
        color: [162, 169, 179],
        lineHeight: 1.5,
      },
    },
  }),
});
