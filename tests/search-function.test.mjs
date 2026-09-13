import test from 'node:test';
import assert from 'node:assert/strict';
import { onRequestGet } from '../functions/api/search.js';

// Deterministic 4-dim "embedding" derived from the text so relevance ordering is
// testable: the query vector and matching chunks share a direction.
function vecFor(text) {
  const v = new Float32Array(4);
  if (text.includes('training')) v[0] = 1;
  if (text.includes('retention')) v[1] = 1;
  if (text.includes('eu')) v[2] = 1;
  if (text.includes('chip')) v[3] = 1;
  return v;
}

function makeEnv({ chunks, queryText }) {
  const aiCalls = [];
  const env = {
    AI: {
      run: async (model, { text }) => {
        aiCalls.push({ model, text: [...text] });
        return { data: text.map((t) => Array.from(vecFor(t))) };
      },
    },
    DB: {
      prepare: (sql) => ({
        sql,
        all: async () => ({ results: chunks }),
      }),
    },
  };
  return { env, aiCalls };
}

function request(url) {
  return new Request(url);
}

test('missing q returns 400 with error', async () => {
  const { env } = makeEnv({ chunks: [] });
  const res = await onRequestGet({ request: request('https://site.example/api/search'), env });
  assert.equal(res.status, 400);
});

test('ranks the matching provider first by cosine score', async () => {
  const chunks = [
    { provider_id: 'openai-api', url: 'https://openai.example/terms', text: 'training off by default for api customers', embedding: vecFor('training').buffer && new Uint8Array(new Float32Array(vecFor('training')).buffer) },
    { provider_id: 'deepgram', url: 'https://deepgram.example/terms', text: 'retention 30 days for audio', embedding: new Uint8Array(new Float32Array(vecFor('retention')).buffer) },
  ].map((c) => ({ ...c, embedding: c.embedding }));
  const { env, aiCalls } = makeEnv({ chunks });
  const res = await onRequestGet({ request: request('https://site.example/api/search?q=training%20policy'), env });
  assert.equal(res.status, 200);
  const body = await res.json();
  assert.equal(body.count, 2);
  assert.deepEqual(body.results[0].providerIds, ['openai-api']);
  assert.equal(body.results[0].url, 'https://openai.example/terms');
  assert.equal(body.bench.rowsScanned, 2);
  assert.equal(aiCalls.length, 1, 'exactly one embedding call');
});

test('providerIds split on comma for shared source URLs', async () => {
  const chunks = [
    {
      provider_id: 'cursor-privacy-on,cursor-privacy-off',
      url: 'https://cursor.example/privacy',
      text: 'privacy mode controls training of your inputs',
      embedding: new Uint8Array(new Float32Array(vecFor('training')).buffer),
    },
  ];
  const { env } = makeEnv({ chunks });
  const res = await onRequestGet({ request: request('https://site.example/api/search?q=privacy%20mode'), env });
  const body = await res.json();
  assert.deepEqual(body.results[0].providerIds, ['cursor-privacy-on', 'cursor-privacy-off']);
});

test('empty corpus returns empty results with bench metadata', async () => {
  const { env } = makeEnv({ chunks: [] });
  const res = await onRequestGet({ request: request('https://site.example/api/search?q=anything'), env });
  const body = await res.json();
  assert.deepEqual(body.results, []);
  assert.equal(body.bench.rowsScanned, 0);
});

test('k parameter caps results', async () => {
  const chunks = Array.from({ length: 12 }, (_, i) => ({
    provider_id: `p${i}`,
    url: `https://p${i}.example/terms`,
    text: `provider ${i} policy text about training`,
    embedding: new Uint8Array(new Float32Array(vecFor('training')).buffer),
  }));
  const { env } = makeEnv({ chunks });
  const res = await onRequestGet({ request: request('https://site.example/api/search?q=training&k=3'), env });
  const body = await res.json();
  assert.equal(body.results.length, 3);
});
