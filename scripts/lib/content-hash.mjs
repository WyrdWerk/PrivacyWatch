// Normalized content fingerprinting for change detection.
// Uses globalThis.crypto.subtle (available in Node 18+ and Workers), so the same
// code runs in CI tests and in the watcher Worker.

export const HASH_SLICE_BYTES = 65536;

// Strip script/style blocks and tags, collapse whitespace, lowercase.
export function normalizeForHash(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

export async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await globalThis.crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Fingerprint a byte-capped slice of raw page bytes. Truncation is flagged so the
// caller can treat the check as incomplete rather than "unchanged".
export async function fingerprintSlice(rawBytes, { cap = HASH_SLICE_BYTES } = {}) {
  const bytes = rawBytes instanceof Uint8Array ? rawBytes : new TextEncoder().encode(String(rawBytes));
  const truncated = bytes.byteLength > cap;
  const slice = truncated ? bytes.slice(0, cap) : bytes;
  const text = new TextDecoder('utf-8', { fatal: false }).decode(slice);
  return { hash: await sha256Hex(normalizeForHash(text)), truncated };
}
