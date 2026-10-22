import { getCollection } from 'astro:content';
import { getHtmlPages } from './html-pages';

export interface Entry {
  kind: 'post' | 'html';
  title: string;
  description: string;
  date?: string;
  href: string;
  category?: string;
}

export async function getEntries(): Promise<Entry[]> {
  const posts = (await getCollection('posts')).map(
    (post): Entry => ({
      kind: 'post',
      title: post.data.title,
      description: post.data.description,
      date: post.data.date.toISOString().slice(0, 10),
      href: `/posts/${post.id}/`,
      ...(post.data.category ? { category: post.data.category } : {}),
    }),
  );

  const htmlPages = getHtmlPages().map(
    (page): Entry => ({
      kind: 'html',
      title: page.title,
      description: page.description,
      ...(page.date ? { date: page.date } : {}),
      href: `/html/${page.slug}/`,
      ...(page.category ? { category: page.category } : {}),
    }),
  );

  return [...posts, ...htmlPages].sort(
    (a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title, 'zh-CN'),
  );
}
