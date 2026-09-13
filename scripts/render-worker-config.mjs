#!/usr/bin/env node
// Renders worker/wrangler.jsonc placeholders from environment variables.
// Runs in CI before deploy/preflight. Real resource IDs are never committed.
import fs from 'fs';

const kvId = process.env.KV_NAMESPACE_ID;
const bucket = process.env.R2_BUCKET;

function fail(msg) {
  console.error(`[render-worker-config] ${msg}`);
  process.exit(1);
}

if (!kvId || !bucket) fail('Both KV_NAMESPACE_ID and R2_BUCKET must be set (Actions variables).');
if (!/^[a-f0-9]{32}$/.test(kvId)) fail('KV_NAMESPACE_ID must be a 32-hex namespace id from the Cloudflare dashboard.');
if (!/^[a-z0-9][a-z0-9-_]{1,61}$/i.test(bucket)) fail('R2_BUCKET must be a valid bucket name.');

const path = 'worker/wrangler.jsonc';
const cfg = fs.readFileSync(path, 'utf-8');
if (!cfg.includes('__KV_NAMESPACE_ID__') || !cfg.includes('__R2_BUCKET__')) {
  fail('Placeholders missing from worker/wrangler.jsonc — refusing to double-render.');
}
fs.writeFileSync(path, cfg.replaceAll('__KV_NAMESPACE_ID__', kvId).replaceAll('__R2_BUCKET__', bucket));
console.log('[render-worker-config] rendered worker/wrangler.jsonc');
