/**
 * Content accessors backed by local Astro Content Collections.
 *
 * This module is the *only* place that knows where posts come from, so if
 * content moves to another store later (MDX, a Git-based CMS, etc.) only
 * this file needs to change.
 *
 * Shape goal: mirror what the old `wp.ts` module exposed so page files
 * didn't need big rewrites.
 */

import { getCollection, type CollectionEntry } from 'astro:content';
import authorsData from '../content/authors.json';
import imageManifestJson from '../data/image-manifest.json';

type ManifestEntry = {
  width: number;
  height: number;
  avif: string | null;
  webp: string | null;
};
const imageManifest = imageManifestJson as Record<string, ManifestEntry>;

export type PostEntry = CollectionEntry<'posts'>;
export type PoemEntry = CollectionEntry<'poems'>;

export interface AuthorRecord {
  id: number;
  name: string;
  slug: string;
  description: string;
  avatar: string | null;
}

/* ------------------------------- posts -------------------------------- */

export async function getAllPosts(): Promise<PostEntry[]> {
  const all = await getCollection('posts');
  return all.sort(
    (a, b) => new Date(b.data.date).getTime() - new Date(a.data.date).getTime(),
  );
}

export async function getPostBySlug(slug: string): Promise<PostEntry | null> {
  const all = await getCollection('posts', (p) => p.data.slug === slug);
  return all[0] ?? null;
}

export async function getPostsByCategorySlug(
  categorySlug: string,
): Promise<PostEntry[]> {
  const all = await getAllPosts();
  return all.filter((p) =>
    p.data.categories.some((c) => c.slug === categorySlug),
  );
}

/* ------------------------------ authors ------------------------------- */

export function getAllAuthors(): AuthorRecord[] {
  return (authorsData as AuthorRecord[]).filter((a) => !!a.name);
}

export function getAuthorBySlug(slug: string | undefined): AuthorRecord | null {
  if (!slug) return null;
  const match = (authorsData as AuthorRecord[]).find((a) => a.slug === slug);
  return match ?? null;
}

/**
 * Build a 1–2 character uppercase monogram from a full name. Uses the
 * Turkish locale so "i" -> "İ" (not "I"), which matters for names like
 * "İbrahim".
 */
export function authorInitials(name: string): string {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (parts.length === 0) return '?';
  const first = parts[0]!.charAt(0);
  const last = parts.length > 1 ? parts[parts.length - 1]!.charAt(0) : '';
  return (first + last).toLocaleUpperCase('tr');
}

/* ------------------------------- poems -------------------------------- */

export async function getAllPoems(): Promise<PoemEntry[]> {
  const all = await getCollection('poems');
  return all.sort((a, b) => {
    const oa = a.data.order ?? Number.POSITIVE_INFINITY;
    const ob = b.data.order ?? Number.POSITIVE_INFINITY;
    if (oa !== ob) return oa - ob;
    const da = a.data.date ? a.data.date.getTime() : 0;
    const db = b.data.date ? b.data.date.getTime() : 0;
    return db - da;
  });
}

export async function getPoemBySlug(slug: string): Promise<PoemEntry | null> {
  const all = await getCollection('poems', (p) => p.id === slug);
  return all[0] ?? null;
}

/* ----------------------------- view helpers --------------------------- */

/**
 * Strip HTML tags and decode common/numeric entities. Used for meta
 * descriptions and card excerpts where markup would be wrong.
 */
export function stripHtml(html: string, maxLen = 180): string {
  const named: Record<string, string> = {
    '&nbsp;': ' ',
    '&quot;': '"',
    '&apos;': "'",
    '&lsquo;': "'",
    '&rsquo;': "'",
    '&ldquo;': '"',
    '&rdquo;': '"',
    '&laquo;': '«',
    '&raquo;': '»',
    '&hellip;': '…',
    '&mdash;': '—',
    '&ndash;': '–',
    '&lt;': '<',
    '&gt;': '>',
  };

  let text = html.replace(/<[^>]+>/g, ' ');

  text = text.replace(/&#(x?[0-9a-fA-F]+);/g, (_, code: string) => {
    const num = code.toLowerCase().startsWith('x')
      ? parseInt(code.slice(1), 16)
      : parseInt(code, 10);
    return Number.isFinite(num) ? String.fromCodePoint(num) : '';
  });

  for (const [entity, replacement] of Object.entries(named)) {
    text = text.split(entity).join(replacement);
  }

  // Must come last so we don't double-decode entities like &amp;#8217;
  text = text.split('&amp;').join('&');
  text = text.replace(/\s+/g, ' ').trim();

  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1).trimEnd() + '…';
}

/**
 * Rewrite a post's raw HTML (migrated from WordPress) to:
 *   - ensure every <img> has loading="lazy" and decoding="async"
 *   - wrap images whose source is in the image manifest with a
 *     <picture> element that offers AVIF/WebP siblings, so modern
 *     browsers download ~80% fewer bytes.
 *
 * Keeps the original <img> (and its src) as the fallback, so older
 * clients — and anything that can't parse <picture> — still work.
 */
export function enhancePostHtml(html: string): string {
  // Match an <img ...> tag *without* consuming surrounding markup.
  // WP output is well-formed so a single regex pass is safe here;
  // if we ever start authoring richer bodies we should swap to a
  // real HTML parser.
  return html.replace(/<img\b([^>]*)\/?>/gi, (full, attrs: string) => {
    const hasLoading = /\bloading\s*=/.test(attrs);
    const hasDecoding = /\bdecoding\s*=/.test(attrs);

    let nextAttrs = attrs;
    if (!hasLoading) nextAttrs += ' loading="lazy"';
    if (!hasDecoding) nextAttrs += ' decoding="async"';

    const srcMatch = nextAttrs.match(/\bsrc\s*=\s*["']([^"']+)["']/i);
    const src = srcMatch?.[1];
    const entry = src ? imageManifest[src] : undefined;
    const imgTag = `<img${nextAttrs}>`;

    if (!entry || (!entry.avif && !entry.webp)) return imgTag;

    const sources: string[] = [];
    if (entry.avif) {
      sources.push(`<source type="image/avif" srcset="${entry.avif}">`);
    }
    if (entry.webp) {
      sources.push(`<source type="image/webp" srcset="${entry.webp}">`);
    }
    return `<picture>${sources.join('')}${imgTag}</picture>`;
  });
}

/**
 * Estimate reading time in whole minutes for a chunk of HTML. Uses a
 * Turkish-leaning 200 wpm baseline which matches common research for
 * general prose in Turkish and English. Minimum of 1 minute so we never
 * show "0 dk" on very short posts.
 */
export function readingTimeMinutes(html: string, wpm = 200): number {
  const text = html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#?[a-z0-9]+;/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  if (!text) return 1;
  const words = text.split(' ').filter(Boolean).length;
  return Math.max(1, Math.round(words / wpm));
}

/**
 * Given the full chronological list and a slug, return the post that
 * was published just before and just after it. Lists are sorted
 * newest-first, so "previous" here means an older post (later in the
 * array) and "next" means a newer one (earlier in the array).
 */
export function getAdjacentPosts(
  all: PostEntry[],
  slug: string,
): { previous: PostEntry | null; next: PostEntry | null } {
  const index = all.findIndex((p) => p.data.slug === slug);
  if (index === -1) return { previous: null, next: null };
  return {
    previous: all[index + 1] ?? null,
    next: all[index - 1] ?? null,
  };
}

export function formatDateTR(iso: string | Date): string {
  try {
    const d = iso instanceof Date ? iso : new Date(iso);
    return new Intl.DateTimeFormat('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }).format(d);
  } catch {
    return String(iso);
  }
}
