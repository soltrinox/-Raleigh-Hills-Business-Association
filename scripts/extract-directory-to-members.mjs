#!/usr/bin/env node
/**
 * Scrape https://raleighhillsbusinessassn.org/directory-2/ listing + per-business ?business=ID
 * pages, geocode addresses (Nominatim), write data/members.json
 *
 * Usage:
 *   node scripts/extract-directory-to-members.mjs           # fetch + Nominatim (slow, ~90s+)
 *   node scripts/extract-directory-to-members.mjs --no-geocode   # fast; lat/lng = stable offsets near Raleigh Hills
 *
 * Requires: network. Nominatim: max 1 req/s (https://operations.osmfoundation.org/policies/nominatim/).
 */

import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const OUT = join(ROOT, 'data', 'members.json');
const BASE = 'https://raleighhillsbusinessassn.org/directory-2/';
const UA =
  'RHBA-microsite-import/1.0 (https://raleighhillsbusiness.com; directory JSON sync)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function cleanWebsite(href) {
  if (!href) return undefined;
  let u = href.trim().replace(/\s+$/, '');
  if (!/^https?:\/\//i.test(u)) return undefined;
  u = u.replace(/^http:\/\/https:\/\//i, 'https://');
  u = u.replace(/^http:\/\/http:\/\//i, 'http://');
  return u;
}

function extractListingBlocks(html) {
  const blocks = [];
  const splitHtml = html.split("<div class='lddbd_business_listing'>");
  for (let i = 1; i < splitHtml.length; i++) {
    const chunk = splitHtml[i];
    const idM = chunk.match(/id='(\d+)_business_detail'/);
    if (!idM) continue;
    const id = idM[1];
    const nameM = chunk.match(/class='business_detail_link'[^>]*>([^<]*)</);
    const name = nameM ? nameM[1].trim() : '';
    const logoM = chunk.match(/lddbd_logo_holder[^>]*>[\s\S]*?<img[^>]*src='([^']+)'/);
    const logoUrl = logoM ? logoM[1].trim() : undefined;
    const webM = chunk.match(/target='_blank'\s+href='([^']+)'/g);
    let website;
    if (webM) {
      for (const w of webM) {
        const h = w.match(/href='([^']+)'/)[1];
        if (h.includes('website.png') || h.includes('email.png')) continue;
        if (/\.(jpe?g|png|gif|webp|pdf)(\?|$)/i.test(h)) continue;
        const c = cleanWebsite(h.startsWith('http') ? h : `http://${h}`);
        if (c) {
          website = c;
          break;
        }
      }
    }
    const phoneM = chunk.match(/<strong>Phone:<\/strong>\s*([^<]*)</i);
    const phone = phoneM ? phoneM[1].replace(/\s+/g, ' ').trim() : undefined;
    blocks.push({ id, name, logoUrl, website, phone });
  }
  return blocks;
}

function parseDetailHtml(html, listing) {
  const single = html.match(/<div id='lddbd_business_directory_single'>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/);
  if (!single) return { ...listing, category: 'Member', address: '', description: undefined };

  const block = single[0];
  const catM = block.match(/<h3>[\s\S]*?<span>([^<]*)<\/span>/);
  const category = catM && catM[1].trim() ? catM[1].trim() : 'Member';

  const nameM = block.match(/<h4>([^<]+)<\/h4>/);
  const name = nameM ? nameM[1].trim() : listing.name;

  const descM = block.match(/<h4>[^<]+<\/h4>\s*<p>([^<]+)<\/p>/);
  const description = descM ? descM[1].trim() : undefined;

  let address = '';
  const addrSection = block.match(/<strong>Address:<\/strong>([\s\S]*?)<strong>Phone:/i);
  if (addrSection) {
    const ps = [...addrSection[1].matchAll(/<p>([^<]*)<\/p>/g)].map((x) => x[1].trim()).filter(Boolean);
    address = ps.join(', ');
  }

  const phoneM = block.match(/<strong>Phone:<\/strong><p>([^<]*)<\/p>/i);
  const phone = phoneM && phoneM[1].trim() ? phoneM[1].trim() : listing.phone;

  const faxM = block.match(/<strong>Fax:<\/strong><p>([^<]*)<\/p>/i);
  let extra = '';
  if (faxM && faxM[1].trim()) extra += ` Fax: ${faxM[1].trim()}.`;

  const logoM = block.match(/<div class='single_business_left'>[\s\S]*?<img[^>]*src="([^"]+)"/);
  const logoUrl = logoM ? logoM[1].trim() : listing.logoUrl;

  const webM = block.match(/target='_blank'\s+href='([^']+)'/g);
  let website = listing.website;
  if (webM) {
    for (const w of webM) {
      const h = w.match(/href='([^']+)'/)[1];
      if (h.includes('website.png') || h.includes('email.png')) continue;
      if (/\.(jpe?g|png|gif|webp|pdf)(\?|$)/i.test(h)) continue;
      const c = cleanWebsite(h);
      if (c) {
        website = c;
        break;
      }
    }
  }

  const fullDescription =
    description && extra ? `${description}${extra}` : description ? description + extra : extra.trim() || undefined;

  return {
    id: `lddbd-${listing.id}`,
    name,
    category,
    description: fullDescription,
    address: address || 'Portland, Oregon metro (see website)',
    logoUrl,
    website,
    phone,
  };
}

async function fetchText(url) {
  const res = await fetch(url, { headers: { 'User-Agent': UA, Accept: 'text/html' } });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.text();
}

async function geocode(address) {
  const q = `${address}, USA`;
  const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': UA,
      Accept: 'application/json',
    },
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
  const noGeocode = process.argv.includes('--no-geocode');
  console.log('Fetching directory index…');
  const indexHtml = await fetchText(BASE);
  const listings = extractListingBlocks(indexHtml);
  console.log(`Found ${listings.length} listings.${noGeocode ? ' (--no-geocode: skipping Nominatim)' : ''}`);

  const members = [];
  for (let i = 0; i < listings.length; i++) {
    const L = listings[i];
    const url = `${BASE}?business=${L.id}`;
    process.stdout.write(`\rDetail ${i + 1}/${listings.length} (id ${L.id})…`);
    let html;
    try {
      html = await fetchText(url);
    } catch (e) {
      console.error(`\nSkip ${L.id}: ${e.message}`);
      continue;
    }
    const row = parseDetailHtml(html, L);
    await sleep(250);

    let lat;
    let lng;
    if (noGeocode) {
      const fb = fallbackLatLng(row.id);
      lat = fb.lat;
      lng = fb.lng;
    } else {
      const geo = await geocode(row.address);
      await sleep(1100);
      if (geo && Number.isFinite(geo.lat) && Number.isFinite(geo.lng)) {
        lat = geo.lat;
        lng = geo.lng;
      } else {
        const fb = fallbackLatLng(row.id);
        lat = fb.lat;
        lng = fb.lng;
      }
    }

    members.push({
      ...row,
      lat,
      lng,
    });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    source: BASE,
    geocoded: !noGeocode,
    members,
  };

  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`\nWrote ${members.length} members to ${OUT}`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
