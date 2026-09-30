// Read-only API helpers shared by the /api/v1 Pages Function and the build.
// Pure functions over providers.json rows; no I/O.

import { VOCAB } from './v2-fields.mjs';

export const API_BASE = '/api/v1';
export const DATA_LICENSE = 'CC-BY-4.0';

const ENUMS = {
  category: ['us-frontier', 'chinese', 'inference', 'coding'],
  rating: ['clean', 'guarded', 'caution', 'high-risk', 'unverified'],
  surfaceType: ['api', 'consumer'],
  training: VOCAB['training.default'],
  zdr: VOCAB['zdr.access'],
  retention: VOCAB['retention.kind'],
  incident: ['true', 'false'],
  fields: ['summary', 'full'],
};
const FREE = ['region', 'ids', 'maxRetentionDays'];

const VALUE = {
  category: (p) => p.category,
  rating: (p) => p.rating,
  surfaceType: (p) => p.surfaceType,
  training: (p) => p.training?.default,
  zdr: (p) => p.zdr?.access,
  retention: (p) => p.retention?.kind,
  incident: (p) => String(Boolean(p.incident)),
};

export function summarize(p) {
  return {
    id: p.id,
    name: p.name,
    surface: p.surface,
    surfaceType: p.surfaceType,
    category: p.category,
    rating: p.rating,
    incident: Boolean(p.incident),
    training: p.training?.default ?? null,
    trainingOptOut: p.training?.optOut ?? null,
    retention: p.retention?.kind ?? null,
    retentionDays: p.retention?.kind === 'fixed' ? p.retention.days : null,
    zdr: p.zdr?.access ?? null,
    regions: p.location?.regions ?? [],
    sourceDate: p.sourceDate,
    url: `${API_BASE}/providers/${p.id}`,
  };
}

// params: URLSearchParams. Returns { data } or { error }.
export function filterProviders(providers, params) {
  const wanted = {};
  for (const key of new Set(params.keys())) {
    if (!ENUMS[key] && !FREE.includes(key)) return { error: `unknown parameter "${key}"; allowed: ${[...Object.keys(ENUMS), ...FREE].join(', ')}` };
    const values = params.getAll(key).flatMap((v) => v.split(',')).map((v) => v.trim()).filter(Boolean);
    if (ENUMS[key]) {
      const bad = values.find((v) => !ENUMS[key].includes(v));
      if (bad !== undefined) return { error: `${key} "${bad}" is not valid; allowed: ${ENUMS[key].join(', ')}` };
    }
    wanted[key] = values;
  }

  let maxDays = null;
  if (wanted.maxRetentionDays) {
    maxDays = Number(wanted.maxRetentionDays[0]);
    if (!Number.isInteger(maxDays) || maxDays < 0) return { error: 'maxRetentionDays must be a non-negative integer' };
  }

  const rows = providers.filter((p) => {
    for (const [key, get] of Object.entries(VALUE)) {
      if (wanted[key] && !wanted[key].includes(get(p))) return false;
    }
    if (wanted.region && !wanted.region.some((r) => (p.location?.regions ?? []).includes(r))) return false;
    if (wanted.ids && !wanted.ids.includes(p.id)) return false;
    if (maxDays !== null && !(p.retention?.kind === 'fixed' && p.retention.days <= maxDays)) return false;
    return true;
  });

  const full = wanted.fields?.[0] === 'full';
  return { data: full ? rows : rows.map(summarize) };
}

// --- Pages Function helpers -------------------------------------------------

const HEADERS = {
  'content-type': 'application/json; charset=utf-8',
  'access-control-allow-origin': '*',
  'cache-control': 'public, max-age=3600, stale-while-revalidate=86400',
};

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: HEADERS });
}

// Reads the deployed static dataset through the ASSETS binding so the API and
// /providers.json can never drift. Returns the parsed dataset or null.
export async function loadDataset(env, request, label) {
  try {
    const res = await env.ASSETS.fetch(new URL('/providers.json', request.url));
    if (!res.ok) throw new Error(`providers.json ${res.status}`);
    return await res.json();
  } catch (err) {
    console.error(`[${label}] dataset unavailable:`, err);
    return null;
  }
}

export function metaOf(dataset, extra = {}) {
  return { version: dataset.meta?.version, lastUpdated: dataset.meta?.lastUpdated, ...extra, license: DATA_LICENSE };
}

export function describeApi(dataset) {
  const providers = dataset.providers ?? [];
  const count = (f) => providers.reduce((acc, p) => ((acc[f(p)] = (acc[f(p)] ?? 0) + 1), acc), {});
  return {
    ...metaOf(dataset, { count: providers.length }),
    licenseUrl: 'https://creativecommons.org/licenses/by/4.0/',
    attribution: 'PrivacyWatch by WyrdWerk (https://privacywatch.wyrdwerk.com)',
    counts: { rating: count((p) => p.rating), category: count((p) => p.category) },
    filters: { ...ENUMS, region: 'ISO 3166-1 alpha-2, EU or GLOBAL', ids: 'comma-separated provider ids', maxRetentionDays: 'integer' },
    vocabularies: VOCAB,
    endpoints: {
      list: `${API_BASE}/providers`,
      provider: `${API_BASE}/providers/{id}`,
      meta: `${API_BASE}/meta`,
      openapi: `${API_BASE}/openapi.json`,
      search: '/api/search?q=',
      dataset: '/providers.json',
    },
  };
}
