import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { getCategory } from '../categories';

export interface HtmlPage {
  slug: string;
  title: string;
  description: string;
  date?: string;
  category?: string;
}

interface Sidecar {
  title?: string;
  description?: string;
  date?: string;
  category?: string;
}

const ROOT = join(process.cwd(), 'public', 'html');

function decodeEntities(value: string): string {
  return value
    .replace(/&#(\d+);/g, (_, code: string) => String.fromCodePoint(Number(code)))
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => String.fromCodePoint(parseInt(code, 16)))
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;|&#39;/g, "'")
    .replace(/&nbsp;/g, ' ');
}

function metaContent(html: string, attr: 'name' | 'property', value: string): string | undefined {
  const attribute = new RegExp(`\\b${attr}=["']${value}["']`, 'i');
  for (const tag of html.match(/<meta\b[^>]*>/gi) ?? []) {
    if (attribute.test(tag)) {
      return tag.match(/\bcontent=["']([^"']*)["']/i)?.[1];
    }
  }
}

export function getHtmlPages(): HtmlPage[] {
  if (!existsSync(ROOT)) return [];

  const pages: HtmlPage[] = [];

  for (const entry of readdirSync(ROOT, { withFileTypes: true })) {
    if (!entry.isDirectory() || entry.name.startsWith('_') || entry.name.startsWith('.')) continue;

    const index = join(ROOT, entry.name, 'index.html');
    if (!existsSync(index)) continue;

    const html = readFileSync(index, 'utf8');
    const sidecarPath = join(ROOT, entry.name, 'meta.json');
    const sidecar: Sidecar = existsSync(sidecarPath)
      ? JSON.parse(readFileSync(sidecarPath, 'utf8'))
      : {};
    const category = sidecar.category?.trim();
    if (category && !getCategory(category)) {
      throw new Error(`Unknown category "${category}" in ${sidecarPath}; add it to src/categories.ts.`);
    }

    const rawTitle = html.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1]?.trim();
    const rawDescription = metaContent(html, 'name', 'description');
    const published = metaContent(html, 'property', 'article:published_time');
    const date = (sidecar.date ?? published ?? '').slice(0, 10);

    pages.push({
      slug: entry.name,
      title: sidecar.title?.trim() || (rawTitle ? decodeEntities(rawTitle) : entry.name),
      description: sidecar.description?.trim() || (rawDescription ? decodeEntities(rawDescription) : ''),
      ...(/^\d{4}-\d{2}-\d{2}$/.test(date) ? { date } : {}),
      ...(category ? { category } : {}),
    });
  }

  return pages.sort(
    (a, b) => (b.date ?? '').localeCompare(a.date ?? '') || a.title.localeCompare(b.title, 'zh-CN'),
  );
}
