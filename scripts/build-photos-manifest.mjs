#!/usr/bin/env node
/**
 * Merges image dimensions from public/rhba-images into data/photos.json.
 * Preserves manual fields: category, alt, tags, caption, themedKey, priority.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sizeOf from 'image-size';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const imgDir = path.join(root, 'public', 'rhba-images');
const outPath = path.join(root, 'data', 'photos.json');

/** basename -> themedKey */
const THEMED = {
  'business-lunch.jpg': 'business-lunch',
  'coffee-meetup.jpg': 'coffee-meetup',
  'zoom-calls.jpg': 'zoom-calls',
  'shred-event.jpg': 'shred-event',
  'swac-2023.jpg': 'shop-with-a-cop',
};

const HERO_FILES = new Set([
  'photo-9830.jpg',
  'photo-9834.jpg',
  'photo-2885.jpg',
  'photo-4353.jpg',
  'photo-5633.jpg',
  'photo-file-005.png',
  'photo-9831.jpg',
  'photo-2574.jpg',
]);

function defaultCategory(basename) {
  if (THEMED[basename]) return 'themed';
  if (HERO_FILES.has(basename)) return 'hero';
  return 'event';
}

function defaultAlt(basename, category, themedKey) {
  if (category === 'themed') {
    const labels = {
      'business-lunch': 'RHBA members at a no-host business lunch',
      'coffee-meetup': 'RHBA coffee meetup networking',
      'zoom-calls': 'RHBA virtual meeting on Zoom',
      'shred-event': 'RHBA community recycle and shred event',
      'shop-with-a-cop': 'RHBA Shop With A Cop volunteers and participants',
    };
    return labels[themedKey] ?? 'RHBA community photo';
  }
  if (category === 'hero') {
    return 'Raleigh Hills Business Association members';
  }
  return 'RHBA members at an association or community event';
}

function loadExisting() {
  try {
    const raw = fs.readFileSync(outPath, 'utf8');
    const j = JSON.parse(raw);
    const map = new Map();
    for (const p of j.photos ?? []) {
      if (p?.src) map.set(p.src, p);
    }
    return { meta: j, map };
  } catch {
    return { meta: {}, map: new Map() };
  }
}

function main() {
  const files = fs
    .readdirSync(imgDir)
    .filter((f) => /\.(jpe?g|png)$/i.test(f))
    .sort();

  const { map: existingBySrc } = loadExisting();

  const photos = [];
  for (const file of files) {
    const src = `/rhba-images/${file}`;
    const full = path.join(imgDir, file);
    let width = 1200;
    let height = 800;
    try {
      const buf = fs.readFileSync(full);
      const dim = sizeOf(buf);
      if (dim.width) width = dim.width;
      if (dim.height) height = dim.height;
      // Swap for EXIF orientation 5-8 if needed (simplified: use dimensions as stored)
      if (
        dim.orientation != null &&
        dim.orientation >= 5 &&
        dim.orientation <= 8
      ) {
        [width, height] = [height, width];
      }
    } catch {
      // keep defaults
    }

    const prev = existingBySrc.get(src);
    const category = prev?.category ?? defaultCategory(file);
    const themedKey =
      prev?.themedKey ?? (category === 'themed' ? THEMED[file] : undefined);
    const alt =
      prev?.alt && String(prev.alt).trim() !== ''
        ? prev.alt
        : defaultAlt(file, category, themedKey);

    /** @type {Record<string, unknown>} */
    const entry = {
      src,
      category,
      alt,
      width,
      height,
      ...(themedKey ? { themedKey } : {}),
      ...(prev?.tags ? { tags: prev.tags } : {}),
      ...(prev?.caption ? { caption: prev.caption } : {}),
    };
    if (prev?.priority === true) entry.priority = true;
    else if (category === 'hero' && file === 'photo-9830.jpg') {
      entry.priority = true;
    }

    photos.push(entry);
  }

  const out = {
    generatedAt: new Date().toISOString(),
    photos,
  };
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2) + '\n', 'utf8');
  console.log(`Wrote ${photos.length} photos to data/photos.json`);
}

main();
