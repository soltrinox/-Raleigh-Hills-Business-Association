#!/usr/bin/env node
/**
 * Read data/members.json, set lat/lng from OpenStreetMap Nominatim (1 req/s).
 * Run after members:extract:fast if you need accurate map pins.
 *
 *   node scripts/geocode-members.mjs
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PATH = join(ROOT, 'data', 'members.json');
const UA =
  'RHBA-microsite-import/1.0 (https://raleighhillsbusiness.com; members geocode)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function geocode(address) {
  const q = `${address}, USA`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: { 'User-Agent': UA, Accept: 'application/json' },
  });
  if (!res.ok) return null;
  const data = await res.json();
  if (!data?.length) return null;
  return { lat: parseFloat(data[0].lat), lng: parseFloat(data[0].lon) };
}

function fallbackLatLng(seed) {
  const base = { lat: 45.486, lng: -122.762 };
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  const dx = (Math.abs(h % 2000) - 1000) / 80000;
  const dy = (Math.abs((h >> 7) % 2000) - 1000) / 80000;
  return { lat: base.lat + dx, lng: base.lng + dy };
}

async function main() {
  const raw = JSON.parse(readFileSync(PATH, 'utf8'));
  const members = raw.members;
  if (!Array.isArray(members)) throw new Error('Invalid members.json');

  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    process.stdout.write(`\rGeocode ${i + 1}/${members.length}: ${m.name?.slice(0, 40)}…`);
    const geo = await geocode(m.address || '');
    await sleep(1100);
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

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
