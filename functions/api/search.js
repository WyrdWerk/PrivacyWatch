// /api/search — semantic search over the indexed policy corpus (read path).
// Embeds the query with the Workers AI binding, single full-scan query over the
// chunks table (a few thousand rows ≈ a few MB), cosine over L2-normalized
// Float32 vectors, top-k results with source citations.

const EMBED_MODEL = '@cf/baai/bge-base-en-v1.5';
const DEFAULT_TOP_K = 8;
const MAX_TOP_K = 25;

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

function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    na += a[i] * a[i];
    nb += b[i] * b[i];
  }
  return dot / ((Math.sqrt(na) * Math.sqrt(nb)) || 1);
}

function asVector(raw) {
  const u8 = raw instanceof Uint8Array ? raw : new Uint8Array(raw);
  return new Float32Array(u8.buffer, u8.byteOffset, Math.floor(u8.byteLength / 4));
}

export async function onRequestGet({ request, env }) {
  const t0 = performance.now();
  const params = new URL(request.url).searchParams;
  const q = (params.get('q') ?? '').trim();
  if (!q) return json({ error: 'missing q parameter' }, 400);
  const k = Math.min(Math.max(parseInt(params.get('k') ?? String(DEFAULT_TOP_K), 10) || DEFAULT_TOP_K, 1), MAX_TOP_K);

  const embedRes = await env.AI.run(EMBED_MODEL, { text: [q] });
  const data = embedRes?.data ?? [];
  if (!data.length) return json({ error: 'embedding failed' }, 502);
  const qv = l2normalize(new Float32Array(Array.isArray(data[0]) ? data[0] : data[0].embedding));

  const { results } = await env.DB.prepare(
    'SELECT provider_id, url, text, embedding FROM chunks'
  ).all();
  const rows = results ?? [];

  const scored = rows
    .map((r) => {
      const vec = asVector(r.embedding);
      return { providerId: r.provider_id, url: r.url, text: r.text, score: cosine(qv, vec) };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, k)
    .map((s) => ({
      providerIds: s.providerId ? s.providerId.split(',') : [],
      url: s.url,
      score: Math.round(s.score * 1000) / 1000,
      snippet: s.text.slice(0, 400),
    }));

  return json({
    query: q,
    count: scored.length,
    // Production-shape evidence for the benchmark gate: rows scanned per query,
    // end-to-end wall time. Reviewer-mandated before /api/ask ships.
    bench: { rowsScanned: rows.length, totalMs: Math.round(performance.now() - t0) },
    results: scored,
  });
}
