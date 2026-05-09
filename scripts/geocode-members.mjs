#!/usr/bin/env node
/**
 * Read members bundle JSON(s), set lat/lng from OpenStreetMap Nominatim (~1 req/s).
 *
 *   node scripts/geocode-members.mjs
 *   node scripts/geocode-members.mjs --file=data/members2.json
 *   node scripts/geocode-members.mjs --file=data/members.json --file=data/members2.json
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geocodeAddress } from './geocode-nominatim.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');

/** @returns {string[]} paths relative from repo ROOT */
function resolveTargets() {
  const args = process.argv.slice(2);
  const files = args.filter((a) => a.startsWith('--file=')).map((a) => a.slice('--file='.length).replace(/^\/+/, '').trim());
  const rels = files.length ? files : ['data/members.json'];
  return rels.map((rel) => join(ROOT, rel || 'data/members.json'));
}

function fallbackLatLng(seed) {
  const base = { lat: 45.486, lng: -122.762 };
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  const dx = (Math.abs(h % 2000) - 1000) / 80000;
  const dy = (Math.abs((h >> 7) % 2000) - 1000) / 80000;
  return { lat: base.lat + dx, lng: base.lng + dy };
}

async function geocodeBundle(PATH) {
  const raw = JSON.parse(readFileSync(PATH, 'utf8'));
  const members = raw.members;
  if (!Array.isArray(members)) throw new Error(`Invalid bundle: ${PATH}`);

  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    process.stdout.write(`\rGeocode ${i + 1}/${members.length}: ${m.name?.slice(0, 40)}…        `);
    const geo = await geocodeAddress(m.address || '');
    if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) {
      m.lat = geo.lat;
      m.lng = geo.lng;
    } else {
      const fb = fallbackLatLng(m.id || String(i));
      m.lat = fb.lat;
      m.lng = fb.lng;
    }
  }

  raw.geocoded = true;
  raw.geocodedAt = new Date().toISOString();
  writeFileSync(PATH, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
  console.log(`\nUpdated ${PATH} (${members.length} rows).`);
}

async function main() {
  const paths = resolveTargets();
  for (const PATH of paths) {
    await geocodeBundle(PATH);
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
