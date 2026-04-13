#!/usr/bin/env node
/**
 * Re-geocode each member address via Nominatim and compare to stored lat/lng.
 *
 *   node scripts/validate-member-geocode.mjs           # report only
 *   node scripts/validate-member-geocode.mjs --apply     # write JSON when fresh geocode differs
 *
 * Respects ~1 req/s to Nominatim. With --apply, updates lat/lng to the new result
 * when a geocode is returned and distance from stored point exceeds --min-m (default 50m),
 * or when geocode exists and stored point was missing/invalid.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { geocodeAddress, haversineMeters } from './geocode-nominatim.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PATH = join(ROOT, 'data', 'members.json');

const args = process.argv.slice(2);
const apply = args.includes('--apply');
let minM = 50;
const minArg = args.find((a) => a.startsWith('--min-m='));
if (minArg) {
  const raw = minArg.slice('--min-m='.length);
  const parsed = Number(raw);
  minM = Number.isFinite(parsed) ? Math.max(0, parsed) : 50;
}

function tier(meters) {
  if (meters <= 80) return 'ok';
  if (meters <= 250) return 'near';
  if (meters <= 800) return 'warn';
  return 'bad';
}

async function main() {
  const raw = JSON.parse(readFileSync(PATH, 'utf8'));
  const members = raw.members;
  if (!Array.isArray(members)) throw new Error('Invalid members.json');

  const rows = [];
  let changed = 0;

  for (let i = 0; i < members.length; i++) {
    const m = members[i];
    const name = m.name || m.id;
    process.stdout.write(`\rValidate ${i + 1}/${members.length}: ${String(name).slice(0, 42)}…`);

    const stored = {
      lat: Number(m.lat),
      lng: Number(m.lng),
    };
    const storedOk = Number.isFinite(stored.lat) && Number.isFinite(stored.lng);

    const fresh = await geocodeAddress(m.address || '');

    if (!fresh) {
      rows.push({
        id: m.id,
        name: m.name,
        status: 'no_result',
        meters: null,
        address: m.address,
      });
      continue;
    }

    const meters = storedOk ? haversineMeters(stored, fresh) : Infinity;
    const t = storedOk ? tier(meters) : 'bad';
    rows.push({
      id: m.id,
      name: m.name,
      status: t,
      meters: storedOk ? Math.round(meters) : null,
      address: m.address,
      displayName: fresh.displayName?.slice(0, 120),
    });

    const shouldUpdate =
      apply &&
      (meters >= minM || !storedOk) &&
      Number.isFinite(fresh.lat) &&
      Number.isFinite(fresh.lng);

    if (shouldUpdate) {
      m.lat = fresh.lat;
      m.lng = fresh.lng;
      changed += 1;
    }
  }

  console.log('\n');
  const ok = rows.filter((r) => r.status === 'ok').length;
  const near = rows.filter((r) => r.status === 'near').length;
  const warn = rows.filter((r) => r.status === 'warn').length;
  const bad = rows.filter((r) => r.status === 'bad').length;
  const noResult = rows.filter((r) => r.status === 'no_result').length;

  console.log('Summary');
  console.log('-------');
  console.log(`  ok (≤80m):     ${ok}`);
  console.log(`  near (81–250m): ${near}`);
  console.log(`  warn (251–800m): ${warn}`);
  console.log(`  bad (>800m or no stored): ${bad}`);
  console.log(`  no Nominatim result: ${noResult}`);

  const problems = rows.filter((r) => r.status === 'warn' || r.status === 'bad' || r.status === 'no_result');
  if (problems.length) {
    console.log('\nNeeds review');
    console.log('------------');
    for (const r of problems) {
      console.log(
        `  [${r.status}] ${r.name} (${r.id})  Δ=${r.meters == null ? 'n/a' : r.meters + 'm'}`,
      );
      if (r.displayName) console.log(`      → ${r.displayName}`);
    }
  }

  if (apply) {
    raw.geocoded = true;
    raw.geocodedAt = new Date().toISOString();
    raw.geocodeValidatedAt = raw.geocodedAt;
    writeFileSync(PATH, `${JSON.stringify(raw, null, 2)}\n`, 'utf8');
    console.log(
      `\nWrote ${PATH} (${changed} coordinate pair(s) updated; apply threshold ${minM}m).`,
    );
  } else {
    console.log(
      '\nDry run only. Re-run with --apply to write updates for deltas ≥ min-m (use --min-m=0 to sync all successful geocodes).',
    );
    if (bad + noResult > 0) process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
