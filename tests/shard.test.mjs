import test from 'node:test';
import assert from 'node:assert/strict';
import { shardSlice, resolveCursor } from '../scripts/lib/shard.mjs';

const urls = ['a', 'b', 'c', 'd', 'e'].map((x) => ({ url: x }));

test('returns the requested slice in order and advances the cursor', () => {
  const { slice, nextCursor } = shardSlice(urls, 0, 2);
  assert.deepEqual(slice.map((u) => u.url), ['a', 'b']);
  assert.equal(nextCursor, 2);
});

test('wraps around the end of the ring', () => {
  const { slice, nextCursor } = shardSlice(urls, 4, 2);
  assert.deepEqual(slice.map((u) => u.url), ['e', 'a']);
  assert.equal(nextCursor, 1);
});

test('cursor larger than the ring wraps cleanly', () => {
  const { slice } = shardSlice(urls, 7, 1);
  assert.deepEqual(slice.map((u) => u.url), ['c']);
});

test('size larger than the ring yields the full set exactly once', () => {
  const { slice, nextCursor } = shardSlice(urls, 2, 99);
  assert.deepEqual(slice.map((u) => u.url), ['c', 'd', 'e', 'a', 'b']);
  assert.equal(nextCursor, 2);
});

test('empty manifest yields an empty slice', () => {
  const { slice, nextCursor } = shardSlice([], 0, 10);
  assert.deepEqual(slice, []);
  assert.equal(nextCursor, 0);
});

test('a manifest hash change resets the cursor to zero', () => {
  assert.equal(resolveCursor('h1', 'h1', 4), 4);
  assert.equal(resolveCursor('h1', 'h2', 4), 0);
});
