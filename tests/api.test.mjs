import test from 'node:test';
import assert from 'node:assert/strict';
import { summarize, filterProviders } from '../scripts/lib/api.mjs';
import { onRequestGet } from '../functions/api/v1/providers/index.js';
import { onRequestGet as getOne } from '../functions/api/v1/providers/[id].js';
import { onRequestGet as getMeta } from '../functions/api/v1/meta.js';

const row = (id, o = {}) => ({
  id,
  name: id.toUpperCase(),
  surface: 'API',
  surfaceType: 'api',
  category: 'inference',
  categoryLabel: 'Inference',
  rating: 'clean',
  incident: false,
  training: { label: 'Off', detail: 'd', default: 'off', optOut: 'not-needed' },
  retention: { label: '30 days', detail: 'd', kind: 'fixed', days: 30 },
  zdr: { label: 'Yes', detail: 'd', status: 'full', access: 'default' },
  location: { label: 'US', flag: '🇺🇸', detail: 'd', regions: ['US'] },
  sourceUrl: 'https://x.example/terms',
  sourceDate: '2026-09-30',
  evidence: [{ field: 'training', url: 'https://x.example/terms', quote: 'q', retrieved: '2026-09-30' }],
  ...o,
});

const rows = [
  row('a'),
  row('b', { rating: 'caution', category: 'chinese', training: { label: 'On', detail: 'd', default: 'on', optOut: 'email' }, location: { label: 'CN', flag: '🇨🇳', detail: 'd', regions: ['CN'] }, incident: true }),
  row('c', { retention: { label: 'Silent', detail: 'd', kind: 'silent' }, location: { label: '?', flag: '❓', detail: 'd', regions: [] } }),
  row('d', { retention: { label: '90 days', detail: 'd', kind: 'fixed', days: 90 }, surfaceType: 'consumer', location: { label: 'EU', flag: '🇪🇺', detail: 'd', regions: ['EU', 'GLOBAL'] } }),
];

test('summarize keeps the structured core and links to the full row', () => {
  const s = summarize(rows[0]);
  assert.deepEqual(s, {
    id: 'a', name: 'A', surface: 'API', surfaceType: 'api', category: 'inference', rating: 'clean', incident: false,
    training: 'off', trainingOptOut: 'not-needed', retention: 'fixed', retentionDays: 30, zdr: 'default',
    regions: ['US'], sourceDate: '2026-09-30', url: '/api/v1/providers/a',
  });
  assert.equal(summarize(rows[2]).retentionDays, null);
});

test('no params returns every row', () => {
  assert.deepEqual(filterProviders(rows, new URLSearchParams()).data.map((r) => r.id), ['a', 'b', 'c', 'd']);
});

test('filters combine with AND; commas and repeats mean OR', () => {
  const ids = (q) => filterProviders(rows, new URLSearchParams(q)).data.map((r) => r.id);
  assert.deepEqual(ids('rating=caution'), ['b']);
  assert.deepEqual(ids('rating=clean,caution&category=chinese'), ['b']);
  assert.deepEqual(ids('training=off&training=on'), ['a', 'b', 'c', 'd']);
  assert.deepEqual(ids('surfaceType=consumer'), ['d']);
  assert.deepEqual(ids('incident=true'), ['b']);
  assert.deepEqual(ids('incident=false&region=US'), ['a']);
  assert.deepEqual(ids('region=EU'), ['d']);
  assert.deepEqual(ids('retention=silent'), ['c']);
  assert.deepEqual(ids('zdr=default&ids=a,d'), ['a', 'd']);
});

test('maxRetentionDays only matches fixed retention within the limit', () => {
  const ids = (q) => filterProviders(rows, new URLSearchParams(q)).data.map((r) => r.id);
  assert.deepEqual(ids('maxRetentionDays=30'), ['a', 'b']);
  assert.deepEqual(ids('maxRetentionDays=90'), ['a', 'b', 'd']);
});

test('fields=full returns complete rows including evidence', () => {
  const out = filterProviders(rows, new URLSearchParams('ids=a&fields=full'));
  assert.equal(out.data[0].evidence.length, 1);
  assert.equal(out.data[0].training.label, 'Off');
});

test('invalid values produce a 400-style error listing what is allowed', () => {
  const bad = (q) => filterProviders(rows, new URLSearchParams(q)).error;
  assert.match(bad('rating=great'), /rating.*clean/);
  assert.match(bad('training=maybe'), /training.*opt-in/);
  assert.match(bad('maxRetentionDays=-3'), /maxRetentionDays/);
  assert.match(bad('incident=yes'), /incident/);
  assert.match(bad('fields=some'), /fields/);
  assert.match(bad('colour=red'), /unknown parameter "colour"/);
});

function ctx(query, data = { meta: { version: '9.9.9', lastUpdated: '2026-09-30' }, providers: rows }) {
  const request = new Request(`https://pw.example/api/v1/providers${query}`);
  const env = { ASSETS: { fetch: async (req) => {
    assert.equal(new URL(req.url ?? req).pathname, '/providers.json');
    return new Response(JSON.stringify(data), { headers: { 'content-type': 'application/json' } });
  } } };
  return { request, env };
}

test('function: 200 with meta wrapper, CORS and cache headers', async () => {
  const res = await onRequestGet(ctx('?rating=caution'));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('access-control-allow-origin'), '*');
  assert.match(res.headers.get('cache-control'), /max-age/);
  const body = await res.json();
  assert.deepEqual(body.meta, { version: '9.9.9', lastUpdated: '2026-09-30', count: 1, license: 'CC-BY-4.0' });
  assert.equal(body.data[0].id, 'b');
});

test('function: 400 on bad params, 502 when the dataset cannot be read', async () => {
  const res = await onRequestGet(ctx('?rating=great'));
  assert.equal(res.status, 400);
  assert.match((await res.json()).error, /rating/);
  const broken = ctx('');
  broken.env.ASSETS.fetch = async () => new Response('nope', { status: 500 });
  assert.equal((await onRequestGet(broken)).status, 502);
});

test('function: /providers/{id} returns the full row or 404', async () => {
  const ok = await getOne({ ...ctx(''), params: { id: 'b' } });
  assert.equal(ok.status, 200);
  const body = await ok.json();
  assert.equal(body.data.training.optOut, 'email');
  assert.equal(body.meta.license, 'CC-BY-4.0');
  const missing = await getOne({ ...ctx(''), params: { id: 'nope' } });
  assert.equal(missing.status, 404);
});

test('function: /meta describes counts, vocabularies and endpoints', async () => {
  const body = await (await getMeta(ctx(''))).json();
  assert.equal(body.count, 4);
  assert.equal(body.counts.rating.caution, 1);
  assert.ok(body.vocabularies['training.default'].includes('opt-in'));
  assert.equal(body.endpoints.provider, '/api/v1/providers/{id}');
});
