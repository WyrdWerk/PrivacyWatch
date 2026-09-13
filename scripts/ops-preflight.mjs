#!/usr/bin/env node
// Read-only ops preflight. Uses no Cloudflare credentials: checks that the
// rendered worker config is complete, well-formed, and that the live watch
// manifest is reachable. Run via the Ops workflow `preflight` task.
import fs from 'fs';

function fail(msg) {
  console.error(`[preflight] FAIL: ${msg}`);
  process.exit(1);
}

const cfg = fs.readFileSync('worker/wrangler.jsonc', 'utf-8');
if (cfg.includes('__KV_NAMESPACE_ID__') || cfg.includes('__R2_BUCKET__')) {
  fail('worker/wrangler.jsonc still contains placeholders — KV_NAMESPACE_ID/R2_BUCKET variables missing.');
}

// Strip JSONC comments, parse, sanity-check config fields.
const stripped = cfg.replace(/^\s*\/\/.*$/gm, '');
let parsed;
try {
  parsed = JSON.parse(stripped);
} catch (err) {
  fail(`rendered config is not valid JSON: ${err.message}`);
}
if (parsed.name !== 'privacywatch-watcher') fail(`unexpected worker name: ${parsed.name}`);
if (!parsed.kv_namespaces?.[0]?.id) fail('WATCH_STATE binding has no namespace id');
if (!parsed.r2_buckets?.[0]?.bucket_name) fail('SNAPSHOTS binding has no bucket name');
if (!parsed.triggers?.crons?.length) fail('no cron triggers configured');
const vars = parsed.vars ?? {};
if (!vars.MANIFEST_URL) fail('vars.MANIFEST_URL missing');
if (!vars.ISSUE_NUMBER || Number.isNaN(Number(vars.ISSUE_NUMBER))) fail('vars.ISSUE_NUMBER missing or not numeric');

const manifestRes = await fetch(vars.MANIFEST_URL).catch((err) => fail(`manifest fetch threw: ${err.message}`));
if (!manifestRes.ok) fail(`live manifest not reachable: ${vars.MANIFEST_URL} → ${manifestRes.status}`);
const manifest = await manifestRes.json();
const count = manifest.urls?.length ?? 0;
if (count === 0) fail('live manifest has no urls');

const summary = [
  '[preflight] OK',
  `- worker: ${parsed.name}`,
  `- crons: ${parsed.triggers.crons.join(', ')}`,
  `- KV namespace id: ${parsed.kv_namespaces[0].id.slice(0, 8)}…`,
  `- R2 bucket: ${parsed.r2_buckets[0].bucket_name}`,
  `- live manifest: ${count} distinct URLs (issue #${vars.ISSUE_NUMBER})`,
].join('\n');
console.log(summary);
if (process.env.GITHUB_STEP_SUMMARY) {
  fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, summary + '\n');
}
