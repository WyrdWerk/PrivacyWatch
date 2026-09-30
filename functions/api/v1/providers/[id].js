// GET /api/v1/providers/{id} — one full provider row, including evidence[] and incidents[].

import { jsonResponse, loadDataset, metaOf } from '../../../../scripts/lib/api.mjs';

export async function onRequestGet({ request, env, params }) {
  const dataset = await loadDataset(env, request, '/api/v1/providers/{id}');
  if (!dataset) return jsonResponse({ error: 'dataset unavailable' }, 502);

  const row = (dataset.providers ?? []).find((p) => p.id === params.id);
  if (!row) return jsonResponse({ error: `unknown provider id "${params.id}"` }, 404);

  return jsonResponse({ meta: metaOf(dataset), data: row });
}
