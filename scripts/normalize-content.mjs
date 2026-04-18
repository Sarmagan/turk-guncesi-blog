#!/usr/bin/env node
/**
 * Rewrites all blog.turkguncesi.com references inside the local post
 * content JSON files to point at the Astro site's equivalent URLs, so
 * nothing in the built HTML links back at the retired WordPress backend.
 *
 *   /tum-yazilar/<slug>/        → /<slug>
 *   /author/<x>/, /category/<x>/ → unwrapped (link removed, text kept)
 *   any other blog.turkguncesi.com URL → /   (homepage of this site)
 *
 * Safe to run repeatedly. Run via `npm run normalize`.
 */

import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(fileURLToPath(import.meta.url), '../..');
const POSTS = resolve(ROOT, 'src/content/posts');

export function normalizeHtml(html) {
  if (!html) return html;
  let out = html;

  // 1) Strip anchors whose href points at WP author/category/tag archives —
  //    unwrap <a>…</a> so the inner text stays as plain text.
  out = out.replace(
    /<a\b[^>]*\bhref=["']https?:\/\/blog\.turkguncesi\.com\/(?:[a-z0-9-]+\/)?(?:author|category|tag)\/[^"']*["'][^>]*>([\s\S]*?)<\/a>/gi,
    '$1',
  );

  // 2) Canonical post permalinks:  /tum-yazilar/<slug>/  →  /<slug>
  out = out.replace(
    /https?:\/\/blog\.turkguncesi\.com\/tum-yazilar\/([a-z0-9-]+)\/?/gi,
    (_, slug) => `/${slug}`,
  );

  // 3) Bare host (e.g. <a href="https://blog.turkguncesi.com/">) → homepage
  out = out.replace(/https?:\/\/blog\.turkguncesi\.com\/?/gi, '/');

  return out;
}

async function main() {
  const files = (await readdir(POSTS)).filter((f) => f.endsWith('.json'));
  let touched = 0;

  for (const file of files) {
    const full = join(POSTS, file);
    const raw = await readFile(full, 'utf8');
    const record = JSON.parse(raw);

    const before = record.content + '\u0001' + record.excerpt;
    record.content = normalizeHtml(record.content || '');
    record.excerpt = normalizeHtml(record.excerpt || '');
    const after = record.content + '\u0001' + record.excerpt;

    if (before !== after) {
      await writeFile(full, JSON.stringify(record, null, 2) + '\n', 'utf8');
      touched += 1;
      console.log(`✓ ${file}`);
    }
  }

  console.log(`\nNormalized ${touched}/${files.length} post file(s).`);
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((err) => {
    console.error(err);
    process.exit(1);
  });
}
