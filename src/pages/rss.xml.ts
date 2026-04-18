import rss from '@astrojs/rss';
import type { APIContext } from 'astro';
import { SITE } from '@lib/config';
import { getAllPosts, getAllPoems, stripHtml } from '@lib/content';

export async function GET(context: APIContext) {
  const posts = await getAllPosts();
  const poems = await getAllPoems();

  const postItems = posts.map((post) => ({
    title: stripHtml(post.data.title, 200),
    link: `/tum-yazilar/${post.data.slug}/`,
    pubDate: new Date(post.data.date),
    description: stripHtml(post.data.excerpt || post.data.content, 300),
    author: post.data.author?.name,
    categories: post.data.categories.map((c) => c.name),
  }));

  const poemItems = poems.map((poem) => ({
    title: poem.data.title,
    link: `/siirler/${poem.id}/`,
    pubDate: poem.data.date ?? new Date(0),
    description: poem.data.excerpt ?? `${poem.data.title} — ${poem.data.author}`,
    author: poem.data.author,
    categories: ['Şiir'],
  }));

  const items = [...postItems, ...poemItems].sort(
    (a, b) => b.pubDate.getTime() - a.pubDate.getTime(),
  );

  return rss({
    title: SITE.name,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items,
    customData: '<language>tr-TR</language>',
    trailingSlash: false,
  });
}
