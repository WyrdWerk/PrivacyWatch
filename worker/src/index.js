// PrivacyWatch watcher — sharded conditional-GET policy checker.
// Runs twice daily on a cron trigger, checking SHARD_SIZE URLs per invocation.
// Free-plan budgets enforced in code: SOFT_SUBREQUEST_LIMIT aborts-and-defers
// before the 50-subrequest hard cap; hashing uses a byte-capped slice.

const SOFT_SUBREQUEST_LIMIT = 44;
const HASH_SLICE_BYTES = 65536;
const FETCH_TIMEOUT_MS = 15000;
const MAX_EVENTS = 50;
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
    state = { manifestHash, cursor: 0, entries: state.entries ?? {}, events: state.events ?? [] };
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
  const maxHashed = parseInt(env.MAX_HASHED_BODIES || String(DEFAULT_MAX_HASHED_BODIES), 10);
  let hashedBodies = 0;
  for (const item of slice) {
    if (subrequests >= SOFT_SUBREQUEST_LIMIT - 1) break; // defer the rest to the next invocation
    const url = item.url;
    const entry = state.entries[url] ?? { seen: false };
    entry.checkedAt = now;

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

    // CPU guard: hashing bodies is the dominant CPU cost. Deferred URLs keep their
    // previous etag/lastModified (so they retry with the same conditional request)
    // and are retried on later runs.
    if (hashedBodies >= maxHashed) {
      try {
        if (res.body) await res.body.cancel();
      } catch {
        // nothing to cancel
      }
      entry.lastStatus = 'deferred:body-budget';
      state.entries[url] = entry;
      continue;
    }
    hashedBodies++;

    entry.etag = res.headers.get('etag') ?? entry.etag ?? null;
    entry.lastModified = res.headers.get('last-modified') ?? entry.lastModified ?? null;
    const { text, truncated } = await readCappedBody(res);
    const newHash = await sha256Hex(normalizeHtml(text));
    const urlHash = await sha256Hex(url);
    const oldHash = entry.hash ?? null;

    if (oldHash === null) {
      // Baseline: first sighting, never reported as a change.
      entry.hash = newHash;
      entry.seen = true;
      entry.lastStatus = truncated ? 'baseline-capped' : 'baseline';
      entry.lastSnapshotKey = `snapshots/${urlHash}/${newHash}.html`;
      if (!dryRun && subrequests < SOFT_SUBREQUEST_LIMIT - 1) {
        await env.SNAPSHOTS.put(entry.lastSnapshotKey, new TextEncoder().encode(text));
        count();
      }
      state.entries[url] = entry;
      continue;
    }

    if (oldHash === newHash) {
      entry.lastStatus = truncated ? 'unchanged-capped-truncated' : 'unchanged';
      state.entries[url] = entry;
      continue;
    }

    // Confirmed content change.
    changes++;
    const eventId = await sha256Hex(`${url}:${oldHash}:${newHash}`);
    let newSnapshotKey = null;
    if (!dryRun && subrequests < SOFT_SUBREQUEST_LIMIT - 1) {
      newSnapshotKey = `snapshots/${urlHash}/${newHash}.html`;
      await env.SNAPSHOTS.put(newSnapshotKey, new TextEncoder().encode(text));
      count();
    }
    entry.hash = newHash;
    entry.seen = true;
    entry.lastStatus = truncated ? 'changed-capped-truncated' : 'changed';
    state.events.push({
      eventId,
      url,
      providers: item.providers,
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
      return json({
        ok: true,
        manifestUrl: env.MANIFEST_URL,
        shardSize: parseInt(env.SHARD_SIZE || '10', 10),
        cursor: state?.cursor ?? null,
        trackedUrls: state?.entries ? Object.keys(state.entries).length : 0,
        pendingEvents: (state?.events ?? []).filter((e) => !e.reported).length,
        lastManifestHash: state?.manifestHash ?? null,
      });
    }
    return json({ error: 'not found' }, 404);
  },
};
