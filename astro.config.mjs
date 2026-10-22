import { defineConfig } from 'astro/config';
import { unified } from '@astrojs/markdown-remark';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

export default defineConfig({
  site: 'https://quchenyuan.github.io',
  trailingSlash: 'always',
  build: { format: 'directory' },
  markdown: {
    // Astro 7's default Sätteri processor is Rust and does not run remark/rehype
    // plugins. Opt back into unified, or KaTeX is silently left as plain text.
    processor: unified({
      remarkPlugins: [remarkMath],
      rehypePlugins: [rehypeKatex],
      smartypants: false,
    }),
    shikiConfig: {
      themes: { light: 'github-light', dark: 'github-dark' },
      wrap: false,
    },
  },
});
