#!/usr/bin/env node
// Refresh local brand PNGs from Logo.dev (publishable key, image CDN only).
// Usage: LOGO_DEV_PUBLISHABLE_KEY=pk_… node scripts/fetch-logos.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { PROVIDER_LOGOS } from './lib/logos.mjs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const outDir = path.join(root, 'assets', 'logos');
const token = process.env.LOGO_DEV_PUBLISHABLE_KEY || '';

if (!token || !token.startsWith('pk_')) {
  console.error('LOGO_DEV_PUBLISHABLE_KEY is required (publishable pk_ key).');
  process.exit(1);
}

const PNG_SIG = Buffer.from([0x89, 0x50, 0x4e, 0x47]);
const CONCURRENCY = 4;
const SIZE = 64;

function logoUrl(kind, value) {
  const encoded = encodeURIComponent(value);
  const pathPart = kind === 'name' ? `name/${encoded}` : encoded;
  return `https://img.logo.dev/${pathPart}?token=${token}&size=${SIZE}&format=png&fallback=404`;
}

async function fetchPng(url) {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'PrivacyWatch-logo-fetch/1.0' },
    redirect: 'follow',
  });
  if (res.status === 404) return null;
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const buf = Buffer.from(await res.arrayBuffer());
  if (buf.length < 32 || !buf.subarray(0, 4).equals(PNG_SIG)) {
    throw new Error('response was not a PNG');
  }
  return buf;
}

async function resolveLogo(entry) {
  const tried = [];
  for (const domain of entry.domains) {
    tried.push(`domain:${domain}`);
    const buf = await fetchPng(logoUrl('domain', domain));
    if (buf) return { buf, via: `domain:${domain}` };
  }
  for (const name of entry.names) {
    tried.push(`name:${name}`);
    const buf = await fetchPng(logoUrl('name', name));
    if (buf) return { buf, via: `name:${name}` };
  }
  return { buf: null, via: null, tried };
}

async function mapPool(items, limit, fn) {
  const results = new Array(items.length);
  let i = 0;
  async function worker() {
    while (i < items.length) {
      const idx = i++;
      results[idx] = await fn(items[idx], idx);
    }
  }
  await Promise.all(Array.from({ length: Math.min(limit, items.length) }, worker));
  return results;
}

fs.mkdirSync(outDir, { recursive: true });

const entries = Object.entries(PROVIDER_LOGOS);
const ok = [];
const failed = [];

await mapPool(entries, CONCURRENCY, async ([name, entry]) => {
  try {
    const result = await resolveLogo(entry);
    if (!result.buf) {
      failed.push({ name, slug: entry.slug, tried: result.tried });
      return;
    }
    const dest = path.join(outDir, `${entry.slug}.png`);
    fs.writeFileSync(dest, result.buf);
    ok.push({ name, slug: entry.slug, via: result.via, bytes: result.buf.length });
  } catch (err) {
    failed.push({ name, slug: entry.slug, error: err.message });
  }
});

ok.sort((a, b) => a.slug.localeCompare(b.slug));
failed.sort((a, b) => a.name.localeCompare(b.name));

console.log(`Fetched ${ok.length}/${entries.length} logos → ${path.relative(root, outDir)}/`);
for (const row of ok) {
  console.log(`  ✓ ${row.slug}.png  (${row.via}, ${row.bytes}B)`);
}
if (failed.length) {
  console.error(`\nMissing ${failed.length}:`);
  for (const row of failed) {
    const detail = row.error || (row.tried || []).join(', ');
    console.error(`  ✗ ${row.name} [${row.slug}] ${detail}`);
  }
  process.exit(1);
}
