// Builds the watcher manifest from providers.json.
// Deterministic: urls sorted by url string so the shard cursor is stable across builds.
// Shared source URLs are deduplicated with every affected provider retained.

export function buildManifest(providers, { generatedAt = new Date().toISOString() } = {}) {
  const byUrl = new Map();
  for (const p of providers) {
    if (!p.sourceUrl) continue;
    if (!byUrl.has(p.sourceUrl)) byUrl.set(p.sourceUrl, { url: p.sourceUrl, providers: [] });
    byUrl.get(p.sourceUrl).providers.push({ id: p.id, name: p.name, surface: p.surface });
  }
  const urls = [...byUrl.values()].sort((a, b) => (a.url < b.url ? -1 : a.url > b.url ? 1 : 0));
  return { generatedAt, urls };
}
