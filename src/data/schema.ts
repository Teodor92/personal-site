import { site } from './site';

// schema.org Person markup, shared by the homepage and /cv/.
export const personSchema = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: site.name,
  url: site.url,
  email: `mailto:${site.email}`,
  jobTitle: 'Senior AI Software Engineer',
  worksFor: { '@type': 'Organization', name: 'YuLife', url: 'https://yulife.com/' },
  image: new URL(site.avatar, site.url).toString(),
  sameAs: site.socials.filter((s) => s.icon !== 'email').map((s) => s.url),
};
