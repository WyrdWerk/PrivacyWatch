// PrivacyWatch watcher — sharded conditional-GET policy checker.
// Runs twice daily on a cron trigger, checking SHARD_SIZE URLs per invocation.
// Free-plan budgets enforced in code: SOFT_SUBREQUEST_LIMIT aborts-and-defers
// before the 50-subrequest hard cap; hashing uses a byte-capped slice.

const SOFT_SUBREQUEST_LIMIT = 44;
const HASH_SLICE_BYTES = 65536;
const FETCH_TIMEOUT_MS = 15000;
const MAX_EVENTS = 50;
const EMBED_MODEL = '@cf/baai/bge-base-en-v1.5';
const EMBED_DIMS = 768;
const CHUNK_SIZE = 1500;
const CHUNK_OVERLAP = 150;
const MAX_CHUNKS_PER_URL = 40;
const MAX_BACKFILL_PER_RUN = 2;

function chunkText(normalized, { size = CHUNK_SIZE, overlap = CHUNK_OVERLAP, max = MAX_CHUNKS_PER_URL } = {}) {
  if (!normalized) return [];
  const chunks = [];
  let start = 0;
  while (start < normalized.length && chunks.length < max) {
    chunks.push(normalized.slice(start, start + size));
    if (start + size >= normalized.length) break;
    start += size - overlap;
  }
  return chunks;
}

export function l2normalize(vec) {
  let sum = 0;
  for (let i = 0; i < vec.length; i++) sum += vec[i] * vec[i];
  const norm = Math.sqrt(sum) || 1;
  for (let i = 0; i < vec.length; i++) vec[i] /= norm;
  return vec;
}

function f32Blob(vec) {
  return new Uint8Array(vec.buffer, vec.byteOffset, vec.byteLength);
}
// Measured (independent review benchmark): capped normalize+hash costs ~1.4-1.6 ms
// per 64 KiB body in a V8-shaped runtime. Free cron triggers allow 10 ms CPU, so a
// run that hashes every fetched body at shard 20 would exceed it (~29-33 ms).
// This caps bodies actually hashed per invocation; 200-responses beyond the cap are
// deferred (state untouched) and retried on later runs. 304s and errors cost no CPU.
// Changed bodies cost the same as baselined ones (one normalize + one hash — the old
// text is never re-read). Cap 4 keeps worst-case hashing at ~5.8-6.5 ms, ~35%
// headroom under 10 ms; raise only after reading real cpuTime from production logs.
const DEFAULT_MAX_HASHED_BODIES = 4;

function json(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

async function sha256Hex(text) {
  const data = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(digest)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

// Embed a batch of texts with the Workers AI binding. Returns L2-normalized
// Float32Array vectors in input order.
async function embedTexts(env, texts) {
  const out = [];
  for (let i = 0; i < texts.length; i += 8) {
    const res = await env.AI.run(EMBED_MODEL, { text: texts.slice(i, i + 8) });
    const data = res?.data ?? [];
    for (const d of data) {
      const vec = l2normalize(new Float32Array(Array.isArray(d) ? d : d.embedding));
      if (vec.length !== EMBED_DIMS) throw new Error(`embedding dimension mismatch: ${vec.length} != ${EMBED_DIMS}`);
      out.push(vec);
    }
  }
  return out;
}

// Re-index one URL atomically: drop its previous chunks, insert the fresh
// revision. Called from the change/baseline paths (text in hand) and the
// backfill route (snapshot re-read). Generates one INSERT per 14-row batch so
// every statement stays under D1's 100-parameter limit regardless of chunk
// count, and charges each statement against the caller's D1 statement budget.
const INSERT_CHUNK_SQL_BASE = 'INSERT INTO chunks (id, provider_id, url, text, embedding, revision, updated_at) VALUES ';

function insertChunkStatements(env, url, providerId, chunks, vectors, contentHash, urlHash, now) {
  const stmts = [env.DB.prepare('DELETE FROM chunks WHERE url = ?1').bind(url)];
  for (let start = 0; start < chunks.length; start += 14) {
    const rows = Math.min(14, chunks.length - start);
    const sql = INSERT_CHUNK_SQL_BASE + Array(rows).fill('(?, ?, ?, ?, ?, ?, ?)').join(', ');
    const params = [];
    for (let i = start; i < start + rows; i++) {
      params.push(`${urlHash}:${i}`, providerId, url, chunks[i], f32Blob(vectors[i]), contentHash, now);
    }
    stmts.push(env.DB.prepare(sql).bind(...params));
  }
  return stmts;
}

async function indexUrl(env, url, providerIds, normalized, contentHash, urlHash, d1Budget) {
  const chunks = chunkText(normalized);
  // Always emit the DELETE: an empty/failed re-index must still remove obsolete
  // chunks so stale content never stays searchable.
  const statements = 1 + Math.ceil(Math.max(chunks.length, 1) / 14);
  if (d1Budget) {
    if (d1Budget.remaining < statements) return { deferred: true, statements };
    d1Budget.remaining -= statements;
  }
  const vectors = await embedTexts(env, chunks);
  const now = new Date().toISOString();
  const providerId = providerIds.map((p) => p.id).join(',');
  const stmts = insertChunkStatements(env, url, providerId, chunks, vectors, contentHash, urlHash, now);
  await env.DB.batch(stmts);
  return { chunks: chunks.length, statements, aiCalls: Math.ceil(Math.max(chunks.length, 1) / 8) };
}

function normalizeHtml(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

// Read at most `cap` bytes of the body via streaming. Never loads the full page.
// Truncation is flagged: capped bodies are hashed (prefix-stable) but marked as
// incomplete checks, never silently reported as "unchanged".
async function readCappedBody(response, cap = HASH_SLICE_BYTES) {
  if (!response.body) return { text: '', truncated: false };
  const reader = response.body.getReader();
  const decoder = new TextDecoder('utf-8', { fatal: false });
  let text = '';
  let bytes = 0;
  let truncated = false;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    if (bytes + value.byteLength > cap) {
      const remaining = cap - bytes;
      if (remaining > 0) text += decoder.decode(value.slice(0, remaining), { stream: true });
      truncated = true;
      break;
    }
    bytes += value.byteLength;
    text += decoder.decode(value, { stream: true });
  }
  try {
    await reader.cancel();
  } catch {
    // body already consumed or cancelled
  }
  return { text, truncated };
}

function renderEvent(e) {
  const providers = e.providers.map((p) => `${p.name} (${p.surface})`).join(', ');
  const lines = [
    `**Policy change detected** — <${e.url}>`,
    ``,
    `- Providers: ${providers}`,
    `- Content hash: \`${e.oldHash ?? 'none'}\` → \`${e.newHash}\``,
    `- Detected (observation time): ${e.detectedAt}`,
    `- Fetch result: ${e.checkStatus}`,
    `- Snapshots: old \`${e.oldSnapshotKey ?? 'n/a'}\` / new \`${e.newSnapshotKey ?? 'deferred — over invocation budget'}\` (R2, private)`,
    ``,
    `New content excerpt (first ~400 chars of normalized text):`,
    ``,
    `> ${e.excerpt.replace(/\n/g, ' ')}`,
  ];
  return lines.join('\n');
}

// Semantic-index catch-up shared by the cron run and the /__ops/backfill route:
// re-indexes up to `limit` URLs whose stored hash has no matching indexed
// revision, reading their latest snapshot from R2. Mutates `state` in place.
// Selection is starvation-safe: never-attempted URLs sort before retries, and
// entries that failed MAX_INDEX_ATTEMPTS times are set aside (visible via
// preflight's indexErrors) so one persistently broken page cannot block the rest.
const MAX_INDEX_ATTEMPTS = 5;

async function indexCatchUp(env, state, providerByUrl, limit, count, d1Budget) {
  let processed = 0;
  let chunksIndexed = 0;
  let d1Queries = 0;
  let aiCalls = 0;
  const errors = [];
  const indexPending = Object.entries(state.entries)
    .filter(([, e]) => e.seen && e.hash && e.lastSnapshotKey && e.indexedHash !== e.hash && (e.indexAttempts ?? 0) < MAX_INDEX_ATTEMPTS)
    .sort((a, b) => (a[1].indexAttempts ?? 0) - (b[1].indexAttempts ?? 0) || (a[0] < b[0] ? -1 : 1))
    .slice(0, limit);
  for (const [u, e] of indexPending) {
    if (count() > SOFT_SUBREQUEST_LIMIT - 2) break;
    e.indexAttempts = (e.indexAttempts ?? 0) + 1;
    try {
      const snap = await env.SNAPSHOTS.get(e.lastSnapshotKey);
      if (!snap) { e.indexError = 'snapshot missing'; continue; }
      const raw = await snap.text();
      const normalized = normalizeHtml(raw);
      const urlHash = await sha256Hex(u);
      const r = await indexUrl(env, u, providerByUrl.get(u) ?? [], normalized, e.hash, urlHash, d1Budget);
      d1Queries += r.statements;
      aiCalls += r.aiCalls;
      if (r.deferred) {
        e.indexError = 'index deferred: D1 statement budget';
        continue;
      }
      e.indexedHash = e.hash;
      e.indexAttempts = 0;
      e.indexError = null;
      chunksIndexed += r.chunks;
      processed++;
    } catch (err) {
      e.indexError = String(err.message ?? err).slice(0, 160);
      errors.push(u);
    }
  }
  return { processed, chunksIndexed, d1Queries, aiCalls, attempted: indexPending.length, errors };
}

// Ops-route backfill: catches up the semantic index on demand. Bounded per
// dispatch by the caller-supplied limit AND by an explicit daily cap
// (MAX_BACKFILL_PER_DAY URLs ATTEMPTED per UTC day, tracked in state) so
// repeated dispatches cannot drain the Workers AI daily allocation — attempted
// URLs are counted, not just successful ones, so AI-consuming failures still
// draw down the allowance.
const MAX_BACKFILL_PER_DAY = 20;

async function runBackfill(env, limit) {
  const state = await env.WATCH_STATE.get('watcher', 'json');
  if (!state) return { ok: true, processed: 0, chunksIndexed: 0, remaining: 0 };
  state.entries = state.entries ?? {};
  state.backfillDay = state.backfillDay ?? '';
  state.backfillCount = state.backfillCount ?? 0;
  const today = new Date().toISOString().slice(0, 10);
  if (state.backfillDay !== today) {
    state.backfillDay = today;
    state.backfillCount = 0;
  }
  const remainingToday = MAX_BACKFILL_PER_DAY - state.backfillCount;
  if (remainingToday <= 0) {
    return { ok: false, reason: `daily backfill cap reached (${MAX_BACKFILL_PER_DAY}/day) — resets 00:00 UTC` };
  }
  const mRes = await fetch(env.MANIFEST_URL, { headers: { 'cache-control': 'no-cache' } });
  if (!mRes.ok) return { ok: false, reason: `manifest fetch failed: ${mRes.status}` };
  const manifest = await mRes.json();
  const providerByUrl = new Map((manifest.urls ?? []).map((u) => [u.url, u.providers]));
  const d1Budget = { remaining: 40 };
  let used = 0;
  const effectiveLimit = Math.min(limit, remainingToday);
  const cu = await indexCatchUp(env, state, providerByUrl, effectiveLimit, () => ++used, d1Budget);
  state.backfillCount += cu.attempted;
  await env.WATCH_STATE.put('watcher', JSON.stringify(state));
  const remaining = Object.values(state.entries)
    .filter((e) => e.seen && e.hash && e.lastSnapshotKey && e.indexedHash !== e.hash).length;
  return { ok: true, processed: cu.processed, chunksIndexed: cu.chunksIndexed, d1Queries: cu.d1Queries, aiCalls: cu.aiCalls, errors: cu.errors, dailyRemaining: Math.max(0, MAX_BACKFILL_PER_DAY - state.backfillCount), remaining };
}

async function runCheck(env) {
  const dryRun = env.DRY_RUN === '1';
  const shardSize = parseInt(env.SHARD_SIZE || '10', 10);
  let subrequests = 0;
  const count = () => ++subrequests;

  const manifestUrl = env.MANIFEST_URL;
  const mRes = await fetch(manifestUrl, { headers: { 'cache-control': 'no-cache' } });
  count();
  if (!mRes.ok) return { ok: false, reason: `manifest fetch failed: ${mRes.status}` };
  const manifest = await mRes.json();
  const urls = manifest.urls ?? [];
  if (urls.length === 0) return { ok: false, reason: 'manifest has no urls' };
  const manifestHash = await sha256Hex(JSON.stringify(urls.map((u) => u.url)));

  let state = (await env.WATCH_STATE.get('watcher', 'json')) || {
    manifestHash: null,
    cursor: 0,
    entries: {},
    events: [],
  };
  count(); // state get
  if (state.manifestHash !== manifestHash) {
    state = {
      manifestHash,
      cursor: 0,
      entries: state.entries ?? {},
      events: state.events ?? [],
      deferred: state.deferred ?? [],
    };
  }
  state.entries = state.entries ?? {};
  state.events = state.events ?? [];

  // URL removals: mark stale, keep last snapshot reference per retention policy (cleanup happens on report).
  const known = new Set(urls.map((u) => u.url));
  for (const key of Object.keys(state.entries)) {
    if (!known.has(key) && !state.entries[key].stale) {
      state.entries[key].stale = true;
      state.entries[key].checkedAt = new Date().toISOString();
      state.entries[key].lastStatus = 'removed-from-manifest';
      // Remove a stale URL's chunks so removed pages never stay searchable.
      if (env.DB && !dryRun) {
        try {
          await env.DB.prepare('DELETE FROM chunks WHERE url = ?1').bind(key).run();
          count();
        } catch (err) {
          state.entries[key].chunkDeleteError = String(err.message ?? err).slice(0, 120);
        }
      }
    }
  }

  // Deterministic shard slice; entries are keyed by URL (stable across manifest reorders).
  const slice = [];
  for (let i = 0; i < Math.min(shardSize, urls.length); i++) {
    slice.push(urls[(state.cursor + i) % urls.length]);
  }
  state.cursor = (state.cursor + Math.min(shardSize, urls.length)) % urls.length;

  const now = new Date().toISOString();
  let changes = 0;
  let indexed = 0;
  let d1Queries = 0;
  let aiCalls = 0;
  const maxHashed = parseInt(env.MAX_HASHED_BODIES || String(DEFAULT_MAX_HASHED_BODIES), 10);
  let hashedBodies = 0;
  // D1 statement budget per invocation: each indexed URL costs 1 DELETE +
  // ceil(chunks/14) INSERTs; 24 keeps a 4-URL run well under the free plan's
  // 50-queries-per-invocation D1 limit with margin.
  const d1Budget = { remaining: 24 };

  // Deferred-first worklist: URLs queued by earlier runs' body-budget are retried
  // before fresh shard URLs, so CPU deferral can never stall coverage — a deferred
  // baseline completes on a later run instead of waiting for the cursor to wrap.
  state.deferred = state.deferred ?? [];
  const queued = state.deferred.splice(0);
  const queuedSet = new Set(queued);
  const providerByUrl = new Map(urls.map((u) => [u.url, u.providers]));
  const worklist = [
    ...queued.map((url) => ({ url, providers: providerByUrl.get(url) ?? [], fromQueue: true })),
    ...slice.filter((item) => !queuedSet.has(item.url)).map((item) => ({ ...item, fromQueue: false })),
  ];
  const stillQueued = [];

  for (const w of worklist) {
    const url = w.url;
    const entry = state.entries[url] ?? { seen: false };
    entry.checkedAt = now;
    if (w.fromQueue && !known.has(url)) continue; // page left the manifest — drop from queue
    // Subrequest/CPU budget exhausted: queued items re-queue, fresh items queue for
    // the next run without fetching (a fetch here would waste a subrequest).
    if (subrequests >= SOFT_SUBREQUEST_LIMIT - 1 || hashedBodies >= maxHashed) {
      entry.lastStatus = 'deferred:body-budget';
      state.entries[url] = entry;
      if (!stillQueued.includes(url)) stillQueued.push(url);
      continue;
    }

    const headers = {};
    if (entry.etag) headers['If-None-Match'] = entry.etag;
    if (entry.lastModified) headers['If-Modified-Since'] = entry.lastModified;

    let res;
    try {
      count(); // count the attempt: failed/timed-out fetches still consumed the call
      res = await fetch(url, { headers, redirect: 'follow', signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    } catch (err) {
      entry.lastStatus = `inconclusive:fetch-error:${err.message ?? 'unknown'}`;
      state.entries[url] = entry;
      continue;
    }

    if (res.status === 304) {
      entry.lastStatus = 'not-modified';
      state.entries[url] = entry;
      continue;
    }
    if (res.status !== 200) {
      // Challenge pages, rate limits, server errors: inconclusive. Known-good
      // state is never replaced by an error page's hash.
      entry.lastStatus = `inconclusive:${res.status}`;
      state.entries[url] = entry;
      continue;
    }

    hashedBodies++;

    entry.etag = res.headers.get('etag') ?? entry.etag ?? null;
    entry.lastModified = res.headers.get('last-modified') ?? entry.lastModified ?? null;
    const { text, truncated } = await readCappedBody(res);
    const normalized = normalizeHtml(text);
    const newHash = await sha256Hex(normalized);
    const urlHash = await sha256Hex(url);
    const oldHash = entry.hash ?? null;

    if (oldHash === null) {
      // Baseline: all-or-nothing — hash/seen/lastSnapshotKey are committed only
      // after the snapshot is durably stored; on failure the URL re-queues with
      // no hash, so a missing snapshot can never 304-freeze the entry.
      const snapshotKey = `snapshots/${urlHash}/${newHash}.html`;
      let stored = false;
      if (!dryRun && subrequests < SOFT_SUBREQUEST_LIMIT - 1) {
        try {
          await env.SNAPSHOTS.put(snapshotKey, new TextEncoder().encode(text));
          count();
          stored = true;
        } catch (err) {
          entry.lastStatus = `inconclusive:snapshot-error:${err.message ?? 'unknown'}`;
          state.entries[url] = entry;
          if (!stillQueued.includes(url)) stillQueued.push(url);
          continue;
        }
      } else {
        // Dry-run or subrequest budget: nothing durably changed; retry next run.
        entry.lastStatus = 'inconclusive:deferred';
        state.entries[url] = entry;
        if (!stillQueued.includes(url)) stillQueued.push(url);
        continue;
      }
      entry.hash = newHash;
      entry.seen = true;
      entry.lastStatus = truncated ? 'baseline-capped' : 'baseline';
      entry.lastSnapshotKey = stored ? snapshotKey : null;
      entry.indexedHash = null;
      entry.indexAttempts = 0;
      state.entries[url] = entry;
      continue;
    }

    if (oldHash === newHash) {
      entry.lastStatus = truncated ? 'unchanged-capped-truncated' : 'unchanged';
      state.entries[url] = entry;
      continue;
    }

    // Confirmed content change — recorded only once the new snapshot is durably
    // stored. If the budget skips the R2 put, the URL re-queues with its old hash
    // so the change is detected and fully handled (snapshot + event + index) on a
    // later run; partial state is never recorded.
    let newSnapshotKey = null;
    if (!dryRun && subrequests < SOFT_SUBREQUEST_LIMIT - 1) {
      try {
        newSnapshotKey = `snapshots/${urlHash}/${newHash}.html`;
        await env.SNAPSHOTS.put(newSnapshotKey, new TextEncoder().encode(text));
        count();
      } catch (err) {
        entry.lastStatus = `inconclusive:snapshot-error:${err.message ?? 'unknown'}`;
        state.entries[url] = entry;
        continue;
      }
    }
    if (!newSnapshotKey) {
      entry.lastStatus = truncated ? 'changed-deferred-budget-capped' : 'changed-deferred-budget';
      state.entries[url] = entry;
      if (!stillQueued.includes(url)) stillQueued.push(url);
      continue;
    }
    changes++;
    const eventId = await sha256Hex(`${url}:${oldHash}:${newHash}`);
    entry.hash = newHash;
    entry.seen = true;
    entry.lastStatus = truncated ? 'changed-capped-truncated' : 'changed';
    state.events.push({
      eventId,
      url,
      providers: w.providers,
      oldHash,
      newHash,
      oldSnapshotKey: entry.lastSnapshotKey ?? null,
      newSnapshotKey,
      excerpt: normalizeHtml(text).slice(0, 400),
      detectedAt: now,
      checkStatus: entry.lastStatus,
      reported: false,
      reportedAt: null,
    });
    entry.lastSnapshotKey = newSnapshotKey ?? entry.lastSnapshotKey;
    state.entries[url] = entry;
  }
  state.deferred = stillQueued;

  // Semantic index catch-up: re-index entries whose stored hash has no matching
  // indexed revision (indexing failures, entries baselined before the index
  // existed). Bounded per run; converges across runs.
  if (!dryRun && env.DB && env.AI) {
    const cu = await indexCatchUp(env, state, providerByUrl, MAX_BACKFILL_PER_RUN, (n) => count(), d1Budget);
    indexed += cu.chunksIndexed;
  }

  // Durable reporting: pending events are retried on every subsequent run until
  // GitHub acknowledges; eventId dedupe keeps comments identifiable on retries.
  const pending = state.events.filter((e) => !e.reported);
  let reportStatus = 'skipped';
  if (!dryRun && pending.length > 0 && env.GH_REPORT_TOKEN && env.ISSUE_REPO && env.ISSUE_NUMBER) {
    if (subrequests >= SOFT_SUBREQUEST_LIMIT - 1) {
      reportStatus = 'deferred-budget';
    } else {
      const body = pending.map(renderEvent).join('\n\n---\n\n');
      const ghRes = await fetch(`https://api.github.com/repos/${env.ISSUE_REPO}/issues/${env.ISSUE_NUMBER}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${env.GH_REPORT_TOKEN}`,
          Accept: 'application/vnd.github+json',
          'X-GitHub-Api-Version': '2022-11-28',
          'User-Agent': 'privacywatch-watcher',
        },
        body: JSON.stringify({ body: `**Watcher report — ${now} — ${pending.length} change(s)**\n\n${body}` }),
      });
      count();
      reportStatus = ghRes.ok ? 'reported' : `error:${ghRes.status}`;
      if (ghRes.ok) {
        for (const e of pending) {
          e.reported = true;
          e.reportedAt = now;
        }
      }
    }
  } else if (pending.length > 0 && !env.GH_REPORT_TOKEN) {
    reportStatus = 'pending-no-credentials';
  }

  // Retention: keep the newest MAX_EVENTS, dropping oldest reported events first.
  if (state.events.length > MAX_EVENTS) {
    const reported = state.events.filter((e) => e.reported);
    const unreported = state.events.filter((e) => !e.reported);
    state.events = [...unreported, ...reported].slice(-MAX_EVENTS);
  }

  if (!dryRun) {
    await env.WATCH_STATE.put('watcher', JSON.stringify(state));
    count();
  }

  return {
    ok: true,
    dryRun,
    manifestUrls: urls.length,
    shardSize,
    cursor: state.cursor,
    checked: slice.length,
    changes,
    hashed: hashedBodies,
    deferredForCpu: slice.filter((u) => state.entries[u.url]?.lastStatus === 'deferred:body-budget').length,
    indexed,
    d1Queries,
    aiCalls,
    indexErrors: Object.values(state.entries).filter((e) => e.indexError).length,
    pendingEvents: state.events.filter((e) => !e.reported).length,
    reportStatus,
    subrequests,
  };
}

export default {
  async scheduled(controller, env, ctx) {
    const result = await runCheck(env);
    console.log('[watcher]', JSON.stringify(result));
    return result; // returned so tests (and tail logs) can assert run outcomes
  },

  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === '/__health') {
      return json({ ok: true, service: 'privacywatch-watcher' });
    }
    if (url.pathname === '/__ops/preflight') {
      // Requires OPS_TOKEN (a Worker secret, provisioned via the ops workflow).
      if (!env.OPS_TOKEN) return json({ error: 'OPS_TOKEN not provisioned yet' }, 503);
      if (request.headers.get('x-ops-token') !== env.OPS_TOKEN) return json({ error: 'unauthorized' }, 401);
      const state = await env.WATCH_STATE.get('watcher', 'json');
      const entries = Object.values(state?.entries ?? {});
      return json({
        ok: true,
        manifestUrl: env.MANIFEST_URL,
        shardSize: parseInt(env.SHARD_SIZE || '10', 10),
        cursor: state?.cursor ?? null,
        trackedUrls: entries.length,
        pendingEvents: (state?.events ?? []).filter((e) => !e.reported).length,
        needsIndexing: entries.filter((e) => e.seen && e.hash && e.indexedHash !== e.hash).length,
        indexErrors: entries.filter((e) => e.indexError).length,
        lastManifestHash: state?.manifestHash ?? null,
      });
    }
    if (url.pathname === '/__ops/backfill' && request.method === 'POST') {
      // Authenticated semantic-index catch-up: re-indexes up to `limit` URLs whose
      // stored hash has no matching indexed revision (snapshots re-read from R2).
      if (!env.OPS_TOKEN) return json({ error: 'OPS_TOKEN not provisioned yet' }, 503);
      if (request.headers.get('x-ops-token') !== env.OPS_TOKEN) return json({ error: 'unauthorized' }, 401);
      let limit = 5;
      try { limit = Math.max(1, Math.min(8, parseInt((await request.json()).limit ?? '5', 10) || 5)); } catch { /* default */ }
      const result = await runBackfill(env, limit);
      return json({ ok: true, ...result });
    }
    return json({ error: 'not found' }, 404);
  },
};
