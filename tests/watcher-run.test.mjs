import test from 'node:test';
import assert from 'node:assert/strict';
import watcher from '../worker/src/index.js';
import { l2normalize } from '../worker/src/index.js';

const PAGES = 8;
const bigBody = '<html><body><p>' + 'terms text '.repeat(7000) + '</p></body></html>'; // > 64 KiB cap
const manifest = {
  urls: Array.from({ length: PAGES }, (_, i) => ({
    url: `https://p${i}.example/terms`,
    providers: [{ id: `p${i}`, name: `P${i}`, surface: 'API' }],
  })),
};

function makeEnv({ maxHashed = 20, stored = null, mutatedUrl = null, withIndexing = false, failFirstIndex = false } = {}) {
  let storedState = stored;
  const snapshots = [];
  const d1Statements = [];
  const env = {
    MANIFEST_URL: 'https://manifest.example/watch-urls.json',
    SHARD_SIZE: '20',
    MAX_HASHED_BODIES: String(maxHashed),
    WATCH_STATE: {
      get: async () => storedState,
      put: async (_key, value) => {
        storedState = JSON.parse(value);
      },
    },
    SNAPSHOTS: {
      put: async (key, value) => {
        snapshots.push({ key, body: value });
      },
      get: async (key) => {
        const snap = snapshots.find((s) => s.key === key);
        return snap ? { key: snap.key, body: snap.body, text: async () => new TextDecoder().decode(snap.body) } : null;
      },
    },
  };
  if (withIndexing) {
    let aiCalls = 0;
    env.DB = {
      prepare: (sql) => ({ bind: (...params) => ({ sql, params }) }),
      batch: async (stmts) => {
        d1Statements.push(...stmts);
        return stmts.map(() => ({ success: true }));
      },
    };
    env.AI = {
      run: async (_model, { text }) => {
        aiCalls++;
        if (failFirstIndex && aiCalls === 1) throw new Error('injected AI failure');
        return { data: text.map((t) => Array.from(l2normalize(new Float32Array(768).fill(0.01)))) };
      },
    };
  }
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url === env.MANIFEST_URL) {
      return new Response(JSON.stringify(manifest), { headers: { 'content-type': 'application/json' } });
    }
    const changed = mutatedUrl === 'all' || (mutatedUrl && url === mutatedUrl);
    const body = changed ? bigBody.replace('terms', 'amended terms') : bigBody;
    return new Response(body, { status: 200, headers: { 'content-type': 'text/html' } });
  };
  return { env, snapshots, d1Statements, getState: () => storedState, restore: () => (globalThis.fetch = realFetch) };
}

test('baseline run defers bodies beyond the hashed-body CPU budget', async () => {
  const { env, snapshots, getState, restore } = makeEnv({ maxHashed: 3 });
  try {
    const result = await watcher.scheduled({}, env, {});
    const state = getState();
    assert.equal(result.ok, true);
    assert.equal(result.checked, PAGES);
    const baselined = Object.values(state.entries).filter((e) => e.seen);
    assert.equal(baselined.length, 3, 'only 3 bodies hashed');
    const deferred = Object.values(state.entries).filter((e) => e.lastStatus === 'deferred:body-budget');
    assert.equal(deferred.length, PAGES - 3);
    assert.equal(snapshots.length, 3);
    assert.equal(state.events.length, 0, 'baselines are never reported as changes');
    assert.equal(result.reportStatus, 'skipped');
  } finally {
    restore();
  }
});

test('a real content change after baseline creates a pending event and snapshot', async () => {
  const baseline = makeEnv({ maxHashed: 20 });
  try {
    await watcher.scheduled({}, baseline.env, {});
    const afterBaseline = baseline.getState();
    assert.equal(Object.values(afterBaseline.entries).every((e) => e.seen), true);

    const changed = makeEnv({
      maxHashed: 20,
      stored: afterBaseline,
      mutatedUrl: manifest.urls[3].url,
    });
    try {
      const result = await watcher.scheduled({}, changed.env, {});
      const state = changed.getState();
      assert.equal(result.changes, 1);
      assert.equal(state.events.length, 1);
      const ev = state.events[0];
      assert.equal(ev.providers[0].id, 'p3');
      assert.equal(ev.reported, false);
      assert.ok(ev.newHash !== ev.oldHash);
      assert.ok(changed.snapshots.some((s) => s.key === ev.newSnapshotKey));
      assert.equal(changed.snapshots.length, 1, 'exactly one new snapshot for the changed page');
      assert.equal(result.reportStatus, 'pending-no-credentials');
    } finally {
      changed.restore();
    }
  } finally {
    baseline.restore();
  }
});

test('worst case: an all-changed batch hashes at most the cap and defers the rest', async () => {
  const baseline = makeEnv({ maxHashed: 20 });
  try {
    await watcher.scheduled({}, baseline.env, {});
    const afterBaseline = baseline.getState();
    assert.equal(afterBaseline.events.length, 0);

    // every page changes on the next run, with the cap at 4 — the worst case the
    // reviewer flagged: 4 full normalize+hash cycles plus deferred remainder
    const changed = makeEnv({
      maxHashed: 4,
      stored: afterBaseline,
      mutatedUrl: 'all',
    });
    try {
      const result = await watcher.scheduled({}, changed.env, {});
      const state = changed.getState();
      assert.equal(result.changes, 4);
      assert.equal(result.hashed, 4);
      assert.equal(state.events.length, 4, 'one event per hashed change');
      const deferred = Object.values(state.entries).filter((e) => e.lastStatus === 'deferred:body-budget');
      assert.equal(deferred.length, PAGES - 4);
      assert.equal(changed.snapshots.length, 4, 'one snapshot per hashed change');
      assert.equal(state.events.every((e) => e.reported === false), true);
      assert.equal(result.reportStatus, 'pending-no-credentials');
      // deferred URLs keep their previous hash so the next run re-checks them
      for (const entry of deferred) assert.ok(entry.hash, 'deferred entries retain known-good state');
    } finally {
      changed.restore();
    }
  } finally {
    baseline.restore();
  }
});

test('production shape: 176 URLs, shard 10, cap 4 — full baseline within 45 runs, no re-hash', async () => {
  const COUNT = 176;
  const prodManifest = {
    urls: Array.from({ length: COUNT }, (_, i) => ({
      url: `https://s${i}.example/terms`,
      providers: [{ id: `s${i}`, name: `S${i}`, surface: 'API' }],
    })),
  };
  let storedState = null;
  const snapshots = [];
  const env = {
    MANIFEST_URL: 'https://manifest.example/watch-urls.json',
    SHARD_SIZE: '10',
    MAX_HASHED_BODIES: '4',
    WATCH_STATE: {
      get: async () => storedState,
      put: async (_key, value) => {
        storedState = JSON.parse(value);
      },
    },
    SNAPSHOTS: { put: async (key) => snapshots.push(key) },
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url === env.MANIFEST_URL) {
      return new Response(JSON.stringify(prodManifest), { headers: { 'content-type': 'application/json' } });
    }
    return new Response(bigBody, { status: 200, headers: { 'content-type': 'text/html' } });
  };
  try {
    let runs = 0;
    let seen = 0;
    while (runs < 50) {
      runs++;
      const result = await watcher.scheduled({}, env, {});
      assert.ok(result.hashed <= 4, `run ${runs} hashed ${result.hashed} bodies — cap exceeded`);
      seen = Object.values(storedState.entries).filter((e) => e.seen).length;
      if (seen === COUNT) break;
    }
    assert.equal(seen, COUNT, `all ${COUNT} URLs baselined`);
    assert.ok(runs <= 45, `expected ≤ 45 runs at 4 hashes/run (ceil(176/4)), took ${runs}`);
    assert.equal(snapshots.length, COUNT, 'each URL snapshotted exactly once — no re-hashing');
    assert.equal(storedState.events.length, 0);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('deferred queue survives manifest changes and drains before seen URLs', async () => {
  const bodyHtml = '<html><body><p>' + 'terms text '.repeat(7000) + '</p></body></html>';
  const listA = Array.from({ length: 10 }, (_, i) => `https://p${i}.example/terms`);
  let currentUrls = listA;
  let storedState = null;
  const snapshots = [];
  const fetchCounts = {};
  const env = {
    MANIFEST_URL: 'https://manifest.example/watch-urls.json',
    SHARD_SIZE: '10',
    MAX_HASHED_BODIES: '4',
    WATCH_STATE: {
      get: async () => storedState,
      put: async (_key, value) => {
        storedState = JSON.parse(value);
      },
    },
    SNAPSHOTS: { put: async (key) => snapshots.push(key) },
  };
  const realFetch = globalThis.fetch;
  globalThis.fetch = async (input) => {
    const url = typeof input === 'string' ? input : input.url;
    if (url === env.MANIFEST_URL) {
      return new Response(JSON.stringify({
        urls: currentUrls.map((u) => ({ url: u, providers: [{ id: u, name: u, surface: 'API' }] })),
      }), { headers: { 'content-type': 'application/json' } });
    }
    fetchCounts[url] = (fetchCounts[url] ?? 0) + 1;
    return new Response(bodyHtml, { status: 200, headers: { 'content-type': 'text/html' } });
  };
  try {
    // run 1 (manifest A, 10 URLs, cap 4): p0-p3 baselined, p4-p9 CPU-deferred
    await watcher.scheduled({}, env, {});
    assert.deepEqual(storedState.deferred, listA.slice(4));

    // run 2 (manifest B appends s10): the queue must drain FIRST — p4-p7 hash,
    // p0-p3 are not re-fetched or re-hashed, p8-p9 re-queue
    currentUrls = [...listA, 'https://s10.example/terms'];
    await watcher.scheduled({}, env, {});
    assert.equal(fetchCounts['https://p4.example/terms'], 1, 'queued p4 fetched first');
    assert.equal(fetchCounts['https://p0.example/terms'], 1, 'seen p0 not re-fetched while queue drains');
    assert.ok(storedState.entries['https://p4.example/terms'].seen);
    assert.equal(storedState.deferred[0], 'https://p8.example/terms');
    assert.equal(storedState.deferred[1], 'https://p9.example/terms');

    // run 3 (manifest B' removes p9): queued p9 dropped, queued p8 hashes before fresh s10
    currentUrls = currentUrls.filter((u) => u !== 'https://p9.example/terms');
    await watcher.scheduled({}, env, {});
    assert.equal(fetchCounts['https://p8.example/terms'], 1, 'queued p8 retried before fresh URLs');
    assert.ok(!storedState.deferred.includes('https://p9.example/terms'), 'removed queued URL dropped');
    assert.ok(storedState.entries['https://p8.example/terms'].seen);
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('withIndexing: baseline indexes chunks atomically via D1 batch', async () => {
  const e = makeEnv({ withIndexing: true });
  try {
    const result = await watcher.scheduled({}, e.env, {});
    assert.equal(result.indexed > 0, true, `chunks indexed: ${result.indexed}`);
    const deletes = e.d1Statements.filter((s) => s.sql.startsWith('DELETE'));
    const inserts = e.d1Statements.filter((s) => s.sql.startsWith('INSERT'));
    const state = e.getState();
    const indexedEntries = Object.values(state.entries).filter((e) => e.indexedHash);
    const deferredEntries = Object.values(state.entries).filter((e) => e.lastStatus === 'deferred:body-budget' || e.indexError === 'index deferred: D1 statement budget');
    assert.equal(deletes.length, indexedEntries.length, 'one DELETE per indexed URL');
    for (const s of inserts) {
      assert.ok(s.params.length <= 100, `INSERT params ${s.params.length} exceed the D1 limit`);
      assert.ok(s.sql.includes('VALUES'), 'INSERT statement present');
    }
    assert.equal(deferredEntries.length, PAGES - indexedEntries.length, 'D1-budget-deferred URLs keep known-good state');
    for (const entry of indexedEntries) {
      assert.equal(entry.indexedHash, entry.hash, 'indexed revision matches stored hash');
      assert.equal(entry.indexError, undefined, 'no index errors on the happy path');
    }
  } finally {
    e.restore();
  }
});

test('indexing failure is non-fatal and retried on the next run', async () => {
  const first = makeEnv({ withIndexing: true, failFirstIndex: true });
  try {
    await watcher.scheduled({}, first.env, {});
    const state = first.getState();
    const failed = Object.values(state.entries).find((e) => e.indexError);
    assert.ok(failed, 'the first index failure is recorded on the entry');
    assert.equal(failed.indexedHash, undefined, 'failed URL is not marked indexed');
    assert.ok(Object.values(state.entries).some((e) => e.indexedHash === e.hash), 'other URLs still index');
  } finally {
    first.restore();
  }
});

test('304 responses cost no body hashing', async () => {
  const baseline = makeEnv({ maxHashed: 20 });
  try {
    await watcher.scheduled({}, baseline.env, {});
    const stored = baseline.getState();

    const fresh = makeEnv({ maxHashed: 20, stored });
    try {
      // all pages now send 304 via the mock (conditional request with etag stored)
      globalThis.fetch = async (input, init = {}) => {
        const url = typeof input === 'string' ? input : input.url;
        if (url === fresh.env.MANIFEST_URL) {
          return new Response(JSON.stringify(manifest), { headers: { 'content-type': 'application/json' } });
        }
        return new Response(null, { status: 304 });
      };
      const result = await watcher.scheduled({}, fresh.env, {});
      const state = fresh.getState();
      const notModified = Object.values(state.entries).filter((e) => e.lastStatus === 'not-modified').length;
      assert.equal(notModified, PAGES);
      assert.equal(result.changes, 0);
      assert.equal(fresh.snapshots.length, 0, '304s write no snapshots');
    } finally {
      fresh.restore();
    }
  } finally {
    baseline.restore();
  }
});
