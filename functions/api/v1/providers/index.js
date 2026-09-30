// GET /api/v1/providers — filterable list over providers.json (read-only).
// Filters and vocabularies live in scripts/lib/api.mjs.

import { filterProviders, jsonResponse, loadDataset, metaOf } from '../../../../scripts/lib/api.mjs';

export async function onRequestGet({ request, env }) {
  const dataset = await loadDataset(env, request, '/api/v1/providers');
  if (!dataset) return jsonResponse({ error: 'dataset unavailable' }, 502);

  const result = filterProviders(dataset.providers ?? [], new URL(request.url).searchParams);
  if (result.error) return jsonResponse({ error: result.error }, 400);

  return jsonResponse({ meta: metaOf(dataset, { count: result.data.length }), data: result.data });
}
