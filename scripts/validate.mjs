#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const jsonPath = path.join(root, 'providers.json');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf-8'));
const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
const providers = data.providers || [];
const ids = new Set();
const errors = [];

if (!data.meta?.lastUpdated) errors.push('meta.lastUpdated is required');
if (!data.meta?.version) errors.push('meta.version is required');
if (data.meta?.version !== pkg.version) {
  errors.push(`meta.version (${data.meta.version}) must match package.json (${pkg.version})`);
}

for (const p of providers) {
  const required = ['id', 'name', 'surface', 'surfaceType', 'category', 'categoryLabel', 'rating', 'training', 'retention', 'zdr', 'location', 'sourceUrl', 'sourceDate'];
  for (const field of required) {
    if (p[field] == null || p[field] === '') errors.push(`${p.id || '?'}: missing ${field}`);
  }
  if (!['full', 'partial', 'none'].includes(p.zdr?.status)) {
    errors.push(`${p.id || '?'}: invalid zdr.status`);
  }
  if (ids.has(p.id)) errors.push(`duplicate id: ${p.id}`);
  ids.add(p.id);
}

if (errors.length) {
  console.error(`❌ providers.json validation failed (${errors.length} issue(s)):`);
  for (const err of errors) console.error(' -', err);
  process.exit(1);
}

console.log(`✅ providers.json — ${providers.length} providers, version ${data.meta.version}, last updated ${data.meta.lastUpdated}`);
