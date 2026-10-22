import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { categories } from './categories';

const categorySlugs = categories.map((category) => category.slug);

export const collections = {
  posts: defineCollection({
    loader: glob({ pattern: '*.md', base: './src/content/posts' }),
    schema: z.object({
      title: z.string().min(1),
      description: z.string().min(1).max(300),
      date: z.coerce.date(),
      updated: z.coerce.date().optional(),
      category: z
        .string()
        .min(1)
        .refine((slug) => categorySlugs.includes(slug), {
          message: 'Unknown category. Add it to src/categories.ts first.',
        })
        .optional(),
    }),
  }),
};
