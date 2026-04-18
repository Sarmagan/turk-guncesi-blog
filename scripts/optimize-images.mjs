#!/usr/bin/env node
/**
 * optimize-images.mjs
 *
 * Walks public/ for raster images and, for each source, emits:
 *   - an AVIF sibling  (quality ~55, resized so max dimension ≤ MAX_DIM)
 *   - a WebP sibling   (quality ~78, resized so max dimension ≤ MAX_DIM)
 *
 * The original file is left untouched so browsers that can't decode
 * AVIF/WebP still have a fallback (wired up via <picture> in the
 * OptimizedImage component).
 *
 * Also writes src/data/image-manifest.json mapping every absolute
 * public path (e.g. "/media/foo/bar.jpg") to:
 *   { width, height, avif, webp }
 *
 * Where `width` / `height` are the *intrinsic* dimensions of the
 * original source (used to set width/height on <img> and kill CLS),
 * and `avif` / `webp` are the public URLs of the siblings (or null
 * if generation was skipped).
 *
 * The script is incremental: a sibling is regenerated only when the
 * source is newer, so repeated builds are near-instant.
 */
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const ROOT = path.resolve(fileURLToPath(import.meta.url), '../..');
const PUBLIC_DIR = path.join(ROOT, 'public');
const MANIFEST_OUT = path.join(ROOT, 'src/data/image-manifest.json');

// Extensions we treat as "a raster source we should optimize".
// We deliberately skip .svg (vector) and .gif (animated / niche).
const SOURCE_EXTS = new Set(['.jpg', '.jpeg', '.png']);
// We also want to generate AVIF siblings for existing .webp sources
// (no point generating a webp-of-a-webp).
const WEBP_PASSTHROUGH_EXTS = new Set(['.webp']);

// Double-extension suffixes that identify files this script itself
// produced (and therefore must NOT be treated as fresh sources on the
// next run). Keeping this explicit avoids an infinite loop where the
// optimizer would otherwise build e.g. `foo.jpg.webp.avif.webp.avif…`.
const DERIVATIVE_SUFFIXES = [
  '.jpg.avif',
  '.jpeg.avif',
  '.png.avif',
  '.webp.avif',
  '.jpg.webp',
  '.jpeg.webp',
  '.png.webp',
];

function isDerivativeFile(absPath) {
  const lower = absPath.toLowerCase();
  return DERIVATIVE_SUFFIXES.some((suffix) => lower.endsWith(suffix));
}

// Sharp outputs: never upscale, and cap the longest side at this many
// pixels. 1920 covers a 2× retina 960-wide hero; anything larger is
// wasted bytes for a reading-focused site.
const MAX_DIM = 1920;

const AVIF_OPTS = { quality: 55, effort: 4 };
const WEBP_OPTS = { quality: 78, effort: 5 };

/** Recursively list every file under `dir`. */
async function walk(dir) {
  const out = [];
  const entries = await fs.readdir(dir, { withFileTypes: true });
  for (const entry of entries) {
    const abs = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      out.push(...(await walk(abs)));
    } else if (entry.isFile()) {
      out.push(abs);
    }
  }
  return out;
}

/**
 * Generate a single variant (avif or webp) as a sibling file.
 * Returns the public URL of the sibling, or null if skipped.
 *
 * Naming: "foo.jpg" -> "foo.jpg.avif" / "foo.jpg.webp".
 * Keeping the original extension in the output filename makes it
 * trivial to .gitignore generated artefacts (`*.jpg.avif` etc.)
 * without risking a collision with a hand-authored .webp source.
 */
async function generateVariant(sourceAbs, format) {
  const siblingAbs = `${sourceAbs}.${format}`;

  const [srcStat, siblingStat] = await Promise.all([
    fs.stat(sourceAbs),
    fs.stat(siblingAbs).catch(() => null),
  ]);

  // Skip if sibling already exists *and* is newer than source.
  if (siblingStat && siblingStat.mtimeMs >= srcStat.mtimeMs) {
    return toPublicUrl(siblingAbs);
  }

  const pipeline = sharp(sourceAbs, { failOn: 'error' }).resize({
    width: MAX_DIM,
    height: MAX_DIM,
    fit: 'inside',
    withoutEnlargement: true,
  });

  if (format === 'avif') pipeline.avif(AVIF_OPTS);
  else pipeline.webp(WEBP_OPTS);

  await pipeline.toFile(siblingAbs);
  return toPublicUrl(siblingAbs);
}

function toPublicUrl(abs) {
  const rel = path.relative(PUBLIC_DIR, abs).split(path.sep).join('/');
  return `/${rel}`;
}

async function main() {
  const all = await walk(PUBLIC_DIR);
  const manifest = {};

  let processed = 0;
  let skipped = 0;
  let bytesOrig = 0;
  let bytesAvif = 0;
  let bytesWebp = 0;

  for (const abs of all) {
    const ext = path.extname(abs).toLowerCase();
    const isSource = SOURCE_EXTS.has(ext);
    const isWebpSource = WEBP_PASSTHROUGH_EXTS.has(ext);

    if (!isSource && !isWebpSource) continue;
    // Never re-process our own generated outputs (`foo.jpg.avif`,
    // `foo.png.webp`, `foo.webp.avif`, …).
    if (isDerivativeFile(abs)) continue;

    const rel = toPublicUrl(abs);
    let meta;
    try {
      meta = await sharp(abs).metadata();
    } catch (err) {
      console.warn(`! skipping (metadata failed): ${rel} — ${err.message}`);
      continue;
    }
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;

    const entry = { width, height, avif: null, webp: null };

    try {
      entry.avif = await generateVariant(abs, 'avif');
      if (isSource) entry.webp = await generateVariant(abs, 'webp');
    } catch (err) {
      console.warn(`! skipping variants for ${rel} — ${err.message}`);
    }

    manifest[rel] = entry;
    processed += 1;

    // bookkeeping — best-effort, only counts what now exists on disk.
    try {
      bytesOrig += (await fs.stat(abs)).size;
      if (entry.avif) {
        bytesAvif += (await fs.stat(path.join(PUBLIC_DIR, entry.avif.slice(1)))).size;
      }
      if (entry.webp) {
        bytesWebp += (await fs.stat(path.join(PUBLIC_DIR, entry.webp.slice(1)))).size;
      }
    } catch {
      // ignore stat failures
    }
  }

  skipped = all.length - processed;

  await fs.mkdir(path.dirname(MANIFEST_OUT), { recursive: true });
  await fs.writeFile(MANIFEST_OUT, JSON.stringify(manifest, null, 2) + '\n');

  const mib = (n) => (n / 1024 / 1024).toFixed(1);
  console.log(
    [
      `images processed: ${processed} (skipped ${skipped})`,
      `orig  total: ${mib(bytesOrig)} MiB`,
      `webp  total: ${mib(bytesWebp)} MiB`,
      `avif  total: ${mib(bytesAvif)} MiB`,
      `manifest: ${path.relative(ROOT, MANIFEST_OUT)}`,
    ].join('\n'),
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
