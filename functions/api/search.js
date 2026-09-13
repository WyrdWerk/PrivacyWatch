// /api/search — semantic search over the indexed policy corpus (read path).
// Embeds the query with the Workers AI binding, single full-scan query over the
// chunks table (a few thousand rows ≈ a few MB), dot-product scoring over
// L2-normalized Float32 vectors (both query and stored vectors are normalized
// at write time), top-k results with source citations.
//
// Every controlled response carries `bench` telemetry (stage + timings) in a
// uniform nested shape, per the review gate: production cpuTime/latency
// evidence decides whether /api/ask ships. Unexpected errors return a generic
// public message with the same bench shape; details go to console.error only.

const EMBED_MODEL = '@cf/baai/bge-base-en-v1.5';
const EMBED_DIMS = 768;
const DEFAULT_TOP_K = 8;
const MAX_TOP_K = 25;
const MAX_QUERY_CHARS = 512;

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), { status, headers: { 'content-type': 'application/json' } });
}

function l2normalize(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
  const norm = Math.sqrt(sum) || 1;
  for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  return vec;
}

// Both vectors are L2-normalized (at write time and above), so cosine reduces
// to the dot product — roughly half the arithmetic of a full cosine.
function dot(a, b) {
  let dot = 0;
  for (let i = 0; i < a.length; i++) dot += a[i] * b[i];
  return dot;
}

function asVector(raw, dims) {
  const u8 = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  if (u8.byteLength % 4 !== 0) return null;
  const vec = new Float32Array(u8.buffer, u8.byteOffset, u8.byteLength / 4);
  if (vec.length !== dims) return null;
  return vec;
}

export async function onRequestGet({ request, env }) {
  const t0 = performance.now();
  const bench = { stage: 'start', embedMs: 0, scanMs: 0, rowsScanned: 0, totalMs: 0 };
  try {
    const params = new URL(request.url).searchParams;
    const q = (params.get('q') ?? '').trim().slice(0, 512);
    const k = Math.min(Math.max(parseInt(params.get('k') ?? String(DEFAULT_TOP_K), 10) || DEFAULT_TOP_K, 1), MAX_TOP_K);
    if (!q) {
      bench.stage = 'missing-q';
      bench.totalMs = Math.round(performance.now() - t0);
      return json({ bench, error: 'missing q parameter' }, 400);
    }

    bench.stage = 'embed';
    const embedRes = await env.AI.run(EMBED_MODEL, { text: [q] });
    const data = embedRes?.data ?? [];
    if (!data.length) {
      bench.stage = 'embed-failed';
      bench.totalMs = Math.round(performance.now() - t0);
      return json({ bench, error: 'embedding failed' }, 502);
    }
    const qv = l2normalize(new Float32Array(Array.isArray(data[0]) ? data[0] : data[0].embedding));
    if (qv.length !== EMBED_DIMS) {
      bench.stage = 'embed-dims-mismatch';
      bench.totalMs = Math.round(performance.now() - t0);
      return json({ bench, error: 'embedding dimension mismatch' }, 502);
    }
    bench.embedMs = Math.round(performance.now() - t0);

    bench.stage = 'scan';
    const { results } = await env.DB.prepare(
      'SELECT provider_id, url, text, embedding FROM chunks'
    ).all();
    const rows = results ?? [];
    bench.rowsScanned = rows.length;

    const scored = [];
    for (const r of rows) {
      const vec = asVector(r.embedding, qv.length);
      if (!vec) continue; // malformed/corrupt row — skip, never pollute ordering
      scored.push({ providerId: r.provider_id, url: r.url, text: r.text, score: dot(qv, vec) });
    }
    scored.sort((a, b) => b.score - a.score);
    bench.scanMs = Math.round(performance.now() - t0) - bench.embedMs;

    bench.stage = 'done';
    bench.totalMs = Math.round(performance.now() - t0);
    return json({
      bench,
      query: q,
      count: scored.length,
      results: scored.slice(0, k).map((s) => ({
        providerIds: s.providerId ? s.providerId.split(',') : [],
        url: s.url,
        score: Math.round(s.score * 1000) / 1000,
        snippet: s.text.slice(0, 400),
      })),
    });
  } catch (err) {
    console.error('[/api/search] internal error:', err);
    bench.stage = 'error';
    bench.totalMs = Math.round(performance.now() - t0);
    return json({ bench, error: 'internal error' }, 502);
  }
}
