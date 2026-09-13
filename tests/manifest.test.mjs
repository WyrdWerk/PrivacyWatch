import test from 'node:test';
import assert from 'node:assert/strict';
import { buildManifest } from '../scripts/lib/manifest.mjs';

test('dedupes shared source URLs and retains every affected provider', () => {
  const providers = [
    { id: 'cursor', name: 'Cursor', surface: 'Extension', sourceUrl: 'https://cursor.com/privacy' },
    { id: 'cursor-admin', name: 'Cursor', surface: 'Admin', sourceUrl: 'https://cursor.com/privacy' },
    { id: 'openai-api', name: 'OpenAI', surface: 'API', sourceUrl: 'https://openai.com/terms' },
  ];
  const m = buildManifest(providers, { generatedAt: '2026-09-13T00:00:00Z' });
  assert.equal(m.urls.length, 2);
  const shared = m.urls.find((u) => u.url === 'https://cursor.com/privacy');
  assert.deepEqual(shared.providers.map((p) => p.id), ['cursor', 'cursor-admin']);
  assert.equal(m.urls.find((u) => u.url === 'https://openai.com/terms').providers.length, 1);
});

test('sorts deterministically so the shard cursor is stable across builds', () => {
  const providers = [
    { id: 'b', name: 'B', surface: 'API', sourceUrl: 'https://bbb.example/policy' },
    { id: 'a', name: 'A', surface: 'API', sourceUrl: 'https://aaa.example/policy' },
  ];
  const m1 = buildManifest(providers, { generatedAt: '2026-09-13T00:00:00Z' });
  const m2 = buildManifest([...providers].reverse(), { generatedAt: '2026-09-13T00:00:00Z' });
  assert.deepEqual(m1.urls.map((u) => u.url), m2.urls.map((u) => u.url));
  assert.deepEqual(m1.urls.map((u) => u.url), ['https://aaa.example/policy', 'https://bbb.example/policy']);
});

test('skips providers without a sourceUrl', () => {
  const m = buildManifest([{ id: 'x', sourceUrl: '' }, { id: 'y', sourceUrl: 'https://ok.example/p' }]);
  assert.equal(m.urls.length, 1);
});
