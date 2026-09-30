// GET /api/v1/meta — dataset version, licence, counts, filter vocabularies and endpoint map.

import { describeApi, jsonResponse, loadDataset } from '../../../scripts/lib/api.mjs';

export async function onRequestGet({ request, env }) {
  const dataset = await loadDataset(env, request, '/api/v1/meta');
  if (!dataset) return jsonResponse({ error: 'dataset unavailable' }, 502);
  return jsonResponse(describeApi(dataset));
}
