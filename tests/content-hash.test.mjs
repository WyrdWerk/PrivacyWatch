import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeForHash, fingerprintSlice, HASH_SLICE_BYTES } from '../scripts/lib/content-hash.mjs';

test('whitespace-only edits do not change the normalized content', () => {
  const a = normalizeForHash('<p>Training:  off  by default</p>');
  const b = normalizeForHash('<p>Training: off by\ndefault</p>');
  assert.equal(a, b);
});

test('substantive edits change the normalized content', () => {
  const a = normalizeForHash('<p>Training off by default</p>');
  const b = normalizeForHash('<p>Training ON by default</p>');
  assert.notEqual(a, b);
});

test('script and style blocks are ignored', () => {
  const a = normalizeForHash('<p>Retained 30 days</p>');
  const b = normalizeForHash('<script>tracker({"v":42})</script><p>Retained 30 days</p><style>.a{}</style>');
  assert.equal(a, b);
});

test('case differences do not change the hash', async () => {
  const a = await fingerprintSlice('<p>Zero Data Retention available</p>');
  const b = await fingerprintSlice('<p>zero data retention available</p>');
  assert.equal(a.hash, b.hash);
  assert.equal(a.truncated, false);
});

test('a document larger than the cap is flagged truncated, not silently hashed', async () => {
  const big = '<p>' + 'x'.repeat(200) + '</p>';
  const r = await fingerprintSlice(big, { cap: 64 });
  assert.equal(r.truncated, true);
  // the same big doc with a larger cap is not truncated and hashes differently
  const full = await fingerprintSlice(big, { cap: 4096 });
  assert.notEqual(r.hash, full.hash);
});

test('default cap matches the documented 64 KB slice', () => {
  assert.equal(HASH_SLICE_BYTES, 65536);
});
