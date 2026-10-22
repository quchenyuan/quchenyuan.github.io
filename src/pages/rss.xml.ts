import rss from '@astrojs/rss';
import { getCollection } from 'astro:content';
import type { APIContext } from 'astro';
import { SITE } from '../consts';

export async function GET(context: APIContext) {
  if (!context.site) throw new Error('Set `site` in astro.config.mjs');

  const posts = (await getCollection('posts')).sort(
    (a, b) => b.data.date.valueOf() - a.data.date.valueOf() || a.id.localeCompare(b.id),
  );

  return rss({
    title: SITE.title,
    description: SITE.description,
    site: context.site,
    trailingSlash: true,
    customData: '<language>zh-CN</language>',
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.date,
      link: `/posts/${post.id}/`,
      customData: `<guid isPermaLink="false">urn:blog:${post.id}</guid>`,
    })),
  });
}
