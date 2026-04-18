#!/usr/bin/env node
/**
 * One-shot migration: pulls every published post from the WordPress REST API
 * at blog.turkguncesi.com and writes each one to disk as a local content
 * entry. After running this script the Astro site no longer needs the WP
 * backend at runtime or build time.
 *
 * Output:
 *   src/content/posts/<slug>.json          — post metadata + HTML body
 *   public/media/<slug>/<file>              — featured + in-body images
 *
 * Body image URLs that point back at blog.turkguncesi.com are rewritten to
 * the local /media/<slug>/<file> paths so the site is fully self-hosted.
 *
 * Usage:
 *   node scripts/migrate-from-wp.mjs
 *
 * Re-runs are safe: existing files are overwritten.
 */

import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, extname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { normalizeHtml } from './normalize-content.mjs';

const WP_API = 'https://blog.turkguncesi.com/wp-json/wp/v2';
const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const POSTS_OUT = resolve(ROOT, 'src/content/posts');
const MEDIA_OUT = resolve(ROOT, 'public/media');

const TIMEOUT_MS = 30_000;
const MAX_ATTEMPTS = 10;
const BACKOFF_BASE_MS = 1500;

/** Fetch with timeout + retries. Resolves to parsed JSON or Buffer. */
async function fetchRetry(url, { asBuffer = false } = {}) {
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const ctl = new AbortController();
    const t = setTimeout(() => ctl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(url, {
        signal: ctl.signal,
        headers: {
          Accept: asBuffer ? '*/*' : 'application/json',
          'User-Agent': 'turkguncesi-migrator/1.0',
        },
      });
      if (res.status === 429 || res.status >= 500) {
        throw new Error(`HTTP ${res.status}`);
      }
      if (!res.ok) {
        throw new Error(`HTTP ${res.status} ${res.statusText}`);
      }
      if (asBuffer) {
        const buf = Buffer.from(await res.arrayBuffer());
        return { body: buf, headers: res.headers };
      }
      const body = await res.json();
      return { body, headers: res.headers };
    } catch (err) {
      const isLast = attempt === MAX_ATTEMPTS;
      const wait = BACKOFF_BASE_MS * 2 ** (attempt - 1);
      console.warn(
        `  ↳ attempt ${attempt}/${MAX_ATTEMPTS} failed for ${url}: ${err.message}`,
      );
      if (isLast) throw err;
      await new Promise((r) => setTimeout(r, wait));
    } finally {
      clearTimeout(t);
    }
  }
  throw new Error('unreachable');
}

async function fetchAllPages(pathAndQuery) {
  // path is relative to WP_API (e.g. "/posts?..."); prefix directly so that
  // URL() doesn't swallow the /wp-json/wp/v2 prefix (that's what
  // `new URL('/posts', 'https://host/wp-json/wp/v2/')` would do).
  const full = pathAndQuery.startsWith('http')
    ? pathAndQuery
    : `${WP_API}${pathAndQuery.startsWith('/') ? '' : '/'}${pathAndQuery}`;
  const u = new URL(full);
  if (!u.searchParams.has('per_page')) u.searchParams.set('per_page', '100');

  const out = [];
  let page = 1;
  let totalPages = 1;

  do {
    u.searchParams.set('page', String(page));
    const { body, headers } = await fetchRetry(u.toString());
    const tp = headers.get('x-wp-totalpages');
    totalPages = tp ? parseInt(tp, 10) || 1 : 1;
    out.push(...body);
    page += 1;
  } while (page <= totalPages);

  return out;
}

function safeFileName(name) {
  return name
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

function extFromUrlOrContentType(url, contentType) {
  const fromUrl = extname(new URL(url).pathname).toLowerCase();
  if (fromUrl && fromUrl.length <= 5) return fromUrl;
  if (!contentType) return '.bin';
  const mime = contentType.split(';')[0].trim();
  const map = {
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'image/gif': '.gif',
    'image/webp': '.webp',
    'image/svg+xml': '.svg',
    'image/avif': '.avif',
  };
  return map[mime] || '.bin';
}

async function downloadImage(url, slug, usedNames) {
  const { body, headers } = await fetchRetry(url, { asBuffer: true });
  const base = safeFileName(
    extname(new URL(url).pathname)
      ? new URL(url).pathname.split('/').pop().replace(/\.[^.]+$/, '')
      : 'image',
  );
  const ext = extFromUrlOrContentType(url, headers.get('content-type'));

  let name = `${base}${ext}`;
  let i = 1;
  while (usedNames.has(name)) {
    name = `${base}-${i}${ext}`;
    i += 1;
  }
  usedNames.add(name);

  const destDir = resolve(MEDIA_OUT, slug);
  await mkdir(destDir, { recursive: true });
  await writeFile(resolve(destDir, name), body);
  return `/media/${slug}/${name}`;
}

function extractImgSrcs(html) {
  const urls = new Set();
  const re = /<img\b[^>]*\bsrc=["']([^"']+)["']/gi;
  let m;
  while ((m = re.exec(html)) !== null) urls.add(m[1]);
  // srcset too
  const re2 = /\bsrcset=["']([^"']+)["']/gi;
  while ((m = re2.exec(html)) !== null) {
    for (const part of m[1].split(',')) {
      const url = part.trim().split(/\s+/)[0];
      if (url) urls.add(url);
    }
  }
  return [...urls];
}

async function main() {
  console.log('→ Fetching category + author lookups …');
  const [cats, users] = await Promise.all([
    fetchAllPages('/categories?hide_empty=0'),
    fetchAllPages('/users?per_page=100'),
  ]);
  const catById = new Map(cats.map((c) => [c.id, c]));
  const userById = new Map(users.map((u) => [u.id, u]));
  console.log(`  categories: ${cats.length}, users: ${users.length}`);

  console.log('→ Fetching all posts …');
  const posts = await fetchAllPages('/posts?_embed=1&orderby=date&order=desc');
  console.log(`  posts: ${posts.length}`);

  await mkdir(POSTS_OUT, { recursive: true });
  await mkdir(MEDIA_OUT, { recursive: true });

  for (const post of posts) {
    const slug = post.slug;
    console.log(`\n• ${slug}`);
    const used = new Set();

    // Featured image
    let featuredImage = null;
    let featuredImageAlt = '';
    const fm = post._embedded?.['wp:featuredmedia']?.[0];
    if (fm?.source_url) {
      try {
        const localPath = await downloadImage(fm.source_url, slug, used);
        featuredImage = localPath;
        featuredImageAlt = fm.alt_text || '';
        console.log(`  ✓ featured → ${localPath}`);
      } catch (e) {
        console.warn(`  ✗ featured image failed: ${e.message}`);
      }
    }

    // Body images — download and rewrite URLs
    let html = post.content.rendered || '';
    const imgUrls = extractImgSrcs(html);
    const urlMap = new Map();
    for (const src of imgUrls) {
      try {
        const local = await downloadImage(src, slug, used);
        urlMap.set(src, local);
        console.log(`  ✓ body img → ${local}`);
      } catch (e) {
        console.warn(`  ✗ body img ${src}: ${e.message}`);
      }
    }
    for (const [from, to] of urlMap) {
      html = html.split(from).join(to);
    }
    // Best effort: strip srcset entries pointing at blog.turkguncesi.com that
    // we didn't manage to remap, to avoid live network leaks.
    html = html.replace(
      /\ssrcset=["']([^"']+)["']/gi,
      (match, value) => {
        const cleaned = value
          .split(',')
          .map((p) => p.trim())
          .filter((p) => !/blog\.turkguncesi\.com/i.test(p))
          .join(', ');
        return cleaned ? ` srcset="${cleaned}"` : '';
      },
    );

    const authorId = post.author;
    const author = userById.get(authorId);
    const authorName = author?.name || 'Türk Güncesi';

    const categories = (post.categories || [])
      .map((id) => catById.get(id))
      .filter(Boolean)
      .map((c) => ({ id: c.id, name: c.name, slug: c.slug }));

    const record = {
      id: post.id,
      slug,
      title: post.title.rendered,
      date: post.date_gmt ? `${post.date_gmt}Z` : post.date,
      modified: post.modified_gmt ? `${post.modified_gmt}Z` : post.modified,
      author: {
        id: authorId,
        name: authorName,
        slug: author?.slug || '',
        description: author?.description || '',
        avatar: author?.avatar_urls?.['96'] || null,
      },
      categories,
      excerpt: normalizeHtml(post.excerpt.rendered),
      featuredImage,
      featuredImageAlt,
      content: normalizeHtml(html),
    };

    const out = resolve(POSTS_OUT, `${slug}.json`);
    await mkdir(dirname(out), { recursive: true });
    await writeFile(out, JSON.stringify(record, null, 2) + '\n', 'utf8');
    console.log(`  ✓ wrote ${out}`);
  }

  // Also snapshot the author directory so /yazarlar/ can be rendered locally.
  const authorsOut = resolve(ROOT, 'src/content/authors.json');
  const authorRecords = users
    .filter((u) => !!u.name)
    .map((u) => ({
      id: u.id,
      name: u.name,
      slug: u.slug,
      description: u.description || '',
      avatar: u.avatar_urls?.['96'] || null,
    }));
  await writeFile(authorsOut, JSON.stringify(authorRecords, null, 2) + '\n', 'utf8');
  console.log(`\n✓ wrote ${authorsOut}`);

  console.log('\nDone.');
}

main().catch((err) => {
  console.error('\nMigration failed:', err);
  process.exit(1);
});
