// Deterministic sharding over the watch manifest with a rolling cursor.

export function shardSlice(urls, cursor, size) {
  const n = urls.length;
  if (n === 0) return { slice: [], nextCursor: 0 };
  const effectiveSize = Math.min(Math.max(0, size), n);
  const wrapped = ((cursor % n) + n) % n;
  const slice = [];
  for (let i = 0; i < effectiveSize; i++) slice.push(urls[(wrapped + i) % n]);
  return { slice, nextCursor: (wrapped + effectiveSize) % n };
}

// A manifest content change resets the cursor so every URL is re-baselined against
// the new ordering instead of silently skipping part of the ring.
export function resolveCursor(prevManifestHash, nextManifestHash, cursor) {
  return prevManifestHash === nextManifestHash ? cursor : 0;
}
