import rss from '@astrojs/rss';
import { experimental_AstroContainer as AstroContainer } from 'astro/container';
import { getCollection, render } from 'astro:content';
import sanitizeHtml from 'sanitize-html';
import { site } from '../data/site';

// Served at /feed.xml — same path jekyll-feed used, so subscribers keep working.
// Items carry the full post HTML (rendered via the container API so optimized
// image URLs are correct), made absolute and sanitized for feed readers.
export async function GET(context) {
  const posts = (await getCollection('blog', ({ data }) => !data.draft)).sort(
    (a, b) => b.data.pubDate.valueOf() - a.data.pubDate.valueOf(),
  );

  const container = await AstroContainer.create();

  const items = [];
  for (const post of posts) {
    const { Content } = await render(post);
    const html = await container.renderToString(Content);
    items.push({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
      content: sanitizeHtml(html, {
        allowedTags: sanitizeHtml.defaults.allowedTags.concat(['img']),
        // Make relative asset URLs absolute for feed readers.
        transformTags: {
          img: (tagName, attribs) => ({
            tagName,
            attribs: { ...attribs, src: new URL(attribs.src, site.url).toString() },
          }),
          a: (tagName, attribs) => ({
            tagName,
            attribs: attribs.href
              ? { ...attribs, href: new URL(attribs.href, site.url).toString() }
              : attribs,
          }),
        },
      }),
    });
  }

  return rss({
    title: `${site.name} — Blog`,
    description: site.description,
    site: context.site,
    items,
  });
}
