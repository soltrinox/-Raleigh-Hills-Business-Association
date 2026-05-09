#!/usr/bin/env node
/**
 * Parse data/RHBA membership listing April 2026.xlsx (sheet1) and write data/members2.json
 * No extra deps: uses system `unzip -p` (macOS/Linux) to read xl XML inside the .xlsx ZIP.
 *
 * Usage: node scripts/parse-rhba-xlsx.mjs
 */

import { execFileSync } from 'node:child_process';
import { writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const XLSX = join(ROOT, 'data', 'RHBA membership listing April 2026.xlsx');
const OUT = join(ROOT, 'data', 'members2.json');

function unzipPath(archive, entry) {
  try {
    return execFileSync('unzip', ['-p', archive, entry], {
      encoding: 'utf8',
      maxBuffer: 20 * 1024 * 1024,
    });
  } catch {
    throw new Error(
      `Failed to read "${entry}" from xlsx. Requires \`unzip\` on PATH (macOS/Linux).`,
    );
  }
}

/** Walk sharedStrings: each <si>...</si> yields one string (concatenate <t> fragments). */
function parseSharedStrings(xml) {
  const out = [];
  const re = /<si(?:\s[^>]*)?>([\s\S]*?)<\/si>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const chunk = m[1];
    let text = '';
    const tRe = /<t[^>]*>([^<]*)<\/t>/gi;
    let tm;
    while ((tm = tRe.exec(chunk)) !== null) {
      text += tm[1];
    }
    out.push(text);
  }
  return out;
}

/** Column letter(s) to zero-based index A=0, AA=26, etc. */
function colLettersToIndex(letters) {
  let n = 0;
  for (let i = 0; i < letters.length; i++) {
    n = n * 26 + (letters.charCodeAt(i) - 64);
  }
  return n - 1;
}

function cellRefToCol(ref) {
  const letters = ref.match(/^([A-Z]+)/);
  if (!letters) return -1;
  return colLettersToIndex(letters[1]);
}

/** Parse sheet XML into array of row maps: colIndex -> raw cell value string */
function parseSheetToRows(sheetXml, sharedStrings) {
  const rows = [];
  const rowRe = /<row[^>]*>([\s\S]*?)<\/row>/gi;
  let rowMatch;
  while ((rowMatch = rowRe.exec(sheetXml)) !== null) {
    const rowInner = rowMatch[1];
    const cells = {};
    const cRe = /<c\b([^>]*)\/>|<c\b([^>]*)>([\s\S]*?)<\/c>/gi;
    let cm;
    while ((cm = cRe.exec(rowInner)) !== null) {
      const tagAttrs = (cm[1] || cm[2] || '').trim();
      const inner = cm[3] ?? '';
      const rM = tagAttrs.match(/\br=["']([A-Z]+\d+)["']/i);
      if (!rM) continue;
      const ref = rM[1];
      const col = cellRefToCol(ref);
      if (col < 0) continue;
      const tM = tagAttrs.match(/\bt=["']([^"']*)["']/);
      const t = tM ? tM[1] : '';
      const vM = inner.match(/<v[^>]*>([^<]*)<\/v>/i);
      const isM = inner.match(/<is[^>]*>([\s\S]*?)<\/is>/i);
      let val = '';
      if (t === 's' && vM) {
        const idx = Number.parseInt(vM[1], 10);
        val = Number.isFinite(idx) ? (sharedStrings[idx] ?? '') : '';
      } else if (t === 'inlineStr' && isM) {
        const isInner = isM[1];
        const tFragments = [...isInner.matchAll(/<t[^>]*>([^<]*)<\/t>/gi)];
        val = tFragments.map((x) => x[1]).join('');
      } else if (vM) {
        val = vM[1];
      }
      cells[col] = val;
    }
    rows.push(cells);
  }
  return rows;
}

function normalizeWhitespace(s) {
  return String(s ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

function isPlaceholder(s) {
  const t = normalizeWhitespace(s);
  return t === '' || t === 'NA' || t === 'x' || t === ' ';
}

/** Omit key if empty after trim */
function appendIfNonempty(obj, key, value) {
  const v =
    typeof value === 'string' ? normalizeWhitespace(value) : String(value ?? '').trim();
  if (!v || v === 'NA') return;
  obj[key] = v;
}

function normalizeWebsite(web) {
  let w = normalizeWhitespace(web);
  if (!w || w === 'NA') return undefined;
  if (!/^https?:\/\//i.test(w)) w = `http://${w}`;
  return w;
}

/**
 * Append default city/ZIP only when address has no ZIP and no OR state indicator.
 */
function normalizeAddress(raw) {
  let a = normalizeWhitespace(raw);
  if (!a) return '';
  const hasZip = /\b\d{5}(-\d{4})?\b/.test(a);
  const hasOrState =
    /\bOR\b/i.test(a) || /,\s*Oregon\b/i.test(a) || /\bPortland\b/i.test(a);
  if (hasZip || hasOrState) return a;
  return `${a}, Portland, OR 97225`;
}

/** Section heading rows in the spreadsheet — not organizations */
const SKIP_NAMES = new Set(['former members']);

function rowsToMembers(rows) {
  if (rows.length < 2) return [];
  /** row 0 = header */
  const dataRows = rows.slice(1);
  const members = [];
  let seq = 0;

  for (const cells of dataRows) {
    const name = normalizeWhitespace(cells[0]);
    const nameKey = name.toLowerCase();
    if (!name || nameKey === 'members' || SKIP_NAMES.has(nameKey)) continue;

    seq += 1;
    const obj = {
      id: `rhba-${seq}`,
      name,
    };

    const emailRaw = cells[1];
    const contactNameRaw = cells[2];
    const phoneRaw = cells[3];
    const webRaw = cells[4];
    const addrRaw = cells[5];

    if (!isPlaceholder(emailRaw))
      appendIfNonempty(obj, 'contactEmail', emailRaw);
    if (!isPlaceholder(contactNameRaw))
      appendIfNonempty(obj, 'contactName', contactNameRaw);
    if (!isPlaceholder(phoneRaw)) appendIfNonempty(obj, 'phone', phoneRaw);

    const site = normalizeWebsite(webRaw);
    if (site) obj.website = site;

    const addr = normalizeAddress(addrRaw);
    if (addr) obj.address = addr;

    members.push(obj);
  }
  return members;
}

function main() {
  const sharedXml = unzipPath(XLSX, 'xl/sharedStrings.xml');
  const sheetXml = unzipPath(XLSX, 'xl/worksheets/sheet1.xml');
  const strings = parseSharedStrings(sharedXml);
  const rows = parseSheetToRows(sheetXml, strings);
  const members = rowsToMembers(rows);

  const payload = {
    generatedAt: new Date().toISOString(),
    source: 'data/RHBA membership listing April 2026.xlsx',
    geocoded: false,
    members,
  };

  writeFileSync(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(`Wrote ${members.length} members to ${OUT}`);
}

main();
