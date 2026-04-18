import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

/**
 * `posts` — migrated from WordPress (one JSON file per post in
 * src/content/posts/). Body is raw HTML as it came from WP, stored in
 * the `content` field. Featured/body images are rewritten to local paths
 * under /media/<slug>/.
 */
const posts = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/posts' }),
  schema: z.object({
    id: z.number().optional(),
    slug: z.string(),
    title: z.string(),
    date: z.string(),
    modified: z.string().optional(),
    author: z.object({
      id: z.number().optional(),
      name: z.string(),
      slug: z.string().optional(),
      description: z.string().optional(),
      avatar: z.string().nullable().optional(),
    }),
    categories: z
      .array(
        z.object({ id: z.number().optional(), name: z.string(), slug: z.string() }),
      )
      .default([]),
    excerpt: z.string().default(''),
    featuredImage: z.string().nullable().optional(),
    featuredImageAlt: z.string().default(''),
    content: z.string(),
  }),
});

/**
 * `poems` — markdown files in src/content/poems/, each one a poem that
 * appears on /siirler/ and at /siirler/<slug>.
 */
const poems = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/poems' }),
  schema: z.object({
    title: z.string(),
    author: z.string(),
    date: z.coerce.date().optional(),
    order: z.number().optional(),
    location: z.string().optional(),
    excerpt: z.string().optional(),
  }),
});

export const collections = { posts, poems };
