# PrivacyWatch Dynamic Pipeline — Implementation Plan (v2)

**Goal:** Make PrivacyWatch self-updating — watch every provider `sourceUrl`, re-research only changed policies on a cadence, and give the site semantic search over the actual policy text.

**Architecture:** A separate Cloudflare Worker (`privacywatch-watcher`) runs daily sharded cron passes over a build-derived watch manifest (conditional GETs + KV hash store + R2 snapshots), sized against verified free-plan limits. Detected changes are reported durably to a pinned GitHub issue. The research loop is **tool-agnostic by design** — issue → re-research → PR — and runs by default as a scheduled Amp thread, with a documented manual fallback (same steps, run by hand) so no part of the pipeline *requires* Amp. Snapshots are chunked and embedded into a shared D1 database (Workers AI binding) to power `/api/search`, then `/api/ask` as Pages Functions.

**Credential model:** GitHub Actions is the **management source** for all credentials (precisely: Actions holds the only *authoritative* copies; the Worker holds a required runtime copy of `GH_REPORT_TOKEN` only, provisioned through the ops workflow). Orbs never hold Cloudflare credentials. Routine deploys are push-triggered CI (T1.3) and Pages stays Git-integrated; all credentialed *manual/one-off* Cloudflare operations run as protected `workflow_dispatch` jobs (T1.4). The watcher, reporter, and CI run with **no Amp involvement**; the research loop (Phase 3) is tool-agnostic — Amp schedule by default, human-run checklist as the documented fallback.

**Tech stack:** What the repo already uses — plain Node ESM scripts, no runtime deps, Node's built-in `node --test`, `wrangler` v4, Pages Git integration. Worker code is plain JS.

**Out of scope:** Vectorize at this scale (kept as a documented fallback if the T4.3 benchmark fails its gate), queue frameworks, knowledge-graph store, wiki migration, NotebookLM Enterprise integration (optional later), site redesign, auth.

**Review status:** Revised after an ultra-mode read-only review (2026-09-13) and a credential-model correction. Reconciliation notes at the end of this file.

---

## Verified constraints (drives every design choice)

| Constraint | Value | Status |
|---|---|---|
| Subrequests per Worker invocation | 50 (free) — every KV/R2/D1 call counts | verified (Workers limits doc) |
| CPU per cron invocation | 10 ms (free) — hashing/decoding burns it; network wait does not | verified |
| Cron triggers | 5 per account (free) | verified |
| KV free tier | 100k reads / 1k writes per day | verified |
| D1 queries per Worker invocation | 50 (free) — one big `SELECT` is one query | verified (D1 limits doc) |
| D1 free writes | 100,000 rows/day | verified (D1 pricing doc) |
| D1 free rows read | ~5M/day per review; **re-verify in dashboard** — bounds full-scan queries | review-claimed, unverified |
| Workers AI free allocation | 10,000 Neurons/day, resets 00:00 UTC, hard failure when exhausted — **shared** by watcher embeddings, search, and ask | verified (Workers AI pricing) |
| D1 free | 10 databases, 500 MB max per DB | verified |

**Subrequest budget (shard = 10 URLs):** manifest fetch (1) + cursor get/put (2) + 10 × (KV state get + conditional fetch + KV state put) = 33; worst case +10 R2 snapshot puts + 2 GitHub report calls ≈ **45**. A budget assertion in code aborts the run cleanly and defers remaining work to the next invocation rather than dying mid-shard at 50. Shard 14 (v1) failed exactly when changes exist — the moment the system matters.

**Freshness:** cycle length = `ceil(distinctUrls / (runsPerDay × shard))`. 2 runs/day × 10 URLs = 20/day → 43 surfaces (41 distinct URLs — Cursor and Wafer pairs share pages) cycle in ~2 days; a 200-URL manifest takes 10 days, so at that point move to 3 crons/day (30/day → 7 days). State per-source freshness as `≤ cycle length`, never "weekly" as a constant.

---

## Phase 0 — Groundwork (no credentials needed)

### T0.0 — Source-coverage audit (new)
- **Objective:** One `sourceUrl` does not prove every claim in a row (e.g., `openai-api`'s `sourceUrl` is the ToS while its notes name platform.openai.com/docs/guides/your-data). Audit all 43 rows; record where one URL is insufficient.
- **Files:** create `docs/source-coverage-audit.md`; only extend `providers.json` with a `sources: [{url, covers}]` array for rows that genuinely need it (YAGNI — no schema change until the audit says so).
- **Verify:** audit lists every row with a verdict; `npm run validate` still green.

### T0.1 — Derive the watch manifest (deduplicated)
- **Objective:** Every build emits `dist/watch-urls.json`; distinct URLs are deduplicated with all affected provider IDs retained (41 fetches cover 43 surfaces).
- **Files:** modify `scripts/build.mjs`; create `scripts/lib/manifest.mjs` (pure `buildManifest(providers)` → `{ generatedAt, urls: [{ url, providers: [{ id, name, surface }] }] }`, sorted deterministically so the shard cursor is stable).
- **Verify:** `npm run build` then assert `urls.length === distinct sourceUrl count` (not a hard-coded 43) and that every provider id appears; spot-check a shared-URL pair (Cursor, Wafer).
- **Commit:** `build: emit deduplicated watch manifest`

### T0.2 — Unit tests (`node --test`) including adversarial cases
- **Files:** create `scripts/lib/content-hash.mjs` (SHA-256 over a **byte-capped stream slice** — see T1.2 semantics), `scripts/lib/shard.mjs`; tests: `tests/manifest.test.mjs`, `tests/content-hash.test.mjs`, `tests/shard.test.mjs`.
- **Adversarial cases required:** whitespace-only edit → same hash; substantive edit → different hash; document shrinks below prior size; edit beyond the byte cap (must flag `truncated: true`, never silently pass); all-new shard; cursor wraps on manifest reorder (cursor keyed by manifest content hash, resets cleanly); empty manifest.
- **Verify:** `node --test tests/` fails on stubs, passes after implementation.
- **Commit:** `test: cover manifest, hash, and shard logic`

### T0.3 — Validation tightening
- **Objective:** `validate.mjs` already rejects missing `sourceUrl`; add URL well-formedness + `https://` scheme checks.
- **Verify:** passes on current data; temporarily corrupt one URL → fails → restore.
- **Commit:** `validate: require https, well-formed sourceUrl`

## Phase 1 — Watcher Worker (needs: Cloudflare token scoped to Workers Scripts Edit only, account ID)

### T1.1 — Scaffold (explicit provisioning)
- **User does once in the Cloudflare dashboard:** create KV namespace `watch-state`, R2 bucket `privacywatch-snapshots`, confirm R2 is enabled on the account. Runtime bindings need no API credentials.
- **Files:** create `worker/wrangler.jsonc` (name `privacywatch-watcher`, `main src/index.js`, explicit `kv_namespaces`/`r2_buckets` with real IDs, `triggers.crons`, its own `compatibility_date`, `migrations_dir` declared), `worker/src/index.js` stub.
- **Verify:** `npx wrangler deploy -c worker/wrangler.jsonc --dry-run` resolves all bindings.

### T1.2 — Sharded scheduled handler with explicit failure semantics
- **Objective:** Each invocation: fetch manifest from the live site, read cursor, check next 10 URLs.
- **Per-URL semantics (all defined, none implicit):**
  - Conditional GET (`If-None-Match`/`If-Modified-Since`); max 3 redirects; per-request timeout (AbortController).
  - `304` → update `checkedAt` only. `200` → hash a **byte-capped body slice read via streaming** (never `res.text()` the full body into hashing blindly); `truncated` pages are recorded as **inconclusive checks**, not unchanged.
  - `403/429/5xx`, challenge pages, timeouts → **inconclusive**; known-good state is never replaced by an error page's hash.
  - Change confirmed → snapshot stored at immutable key `snapshots/<url-hash>/<content-hash>.html` (retries and multi-change days can't overwrite); state updated; snapshot write deferred if the subrequest budget assertion trips.
  - First sighting of a URL = baseline snapshot, never reported as a change.
  - URLs removed from the manifest → state marked stale, cleaned up per retention policy (keep last 3 snapshots per URL + 90 days).
- **CPU:** before finalizing slice size, benchmark normalization+hashing on ~10 representative largest policy bodies in the deployed runtime (`wrangler dev` CPU logs); adjust cap so worst-case URL stays well under 10 ms.
- **Verify:** `--test-scheduled` runs: baseline pass, no-change stability pass, forced-change pass (flip KV hash), inconclusive pass (mock 403). Check KV/R2 state after each.
- **Commit:** `feat(watcher): sharded conditional-GET checker with failure semantics`

### T1.3 — CI deploy (gated on tests)
- **Files:** `.github/workflows/watcher-deploy.yml` — on push to `main` touching `worker/**`, `scripts/lib/**`, `scripts/build.mjs`, `package*.json`, `tests/**`; runs `node --test tests/` + `npm run validate` on pinned Node before `cloudflare/wrangler-action@v3` deploy. Worker-adjacent changes always redeploy the Worker.
- **Verify:** green run; first real cron day produces `checkedAt` for the whole manifest (spot-check counts, not assumptions).
- **Commit:** `ci: gated watcher deploy from main`

### T1.4 — Ops workflow (protected workflow_dispatch)
- **Objective:** One-off Cloudflare operations without giving orbs credentials: `gh workflow run ops.yml -f task=<task>`, watch with `gh run view`. Fixed task allowlist, validated server-side (no free-text command or project interpolation): `preflight` (read-only wiring check — first dispatch, proves the workflow runs and reads secrets before any mutation), `secret-put` (provisions `GH_REPORT_TOKEN` into the Worker), `d1-migrate` (Phase 4, after the D1 database and bindings exist), `backfill` (Phase 4).
- **Hardening (all required):** `permissions: contents: read` as the workflow default with each secret injected only into the job that needs it (`GH_REPORT_TOKEN` exists only in the `secret-put` job, piped via stdin, never logged or in artifacts); third-party actions pinned to immutable revisions; pinned Node; workflow file merged and reviewed on `main` before first dispatch, dispatch recorded against a known revision with run conclusion/logs inspected (a successful trigger is not success); mutating tasks gated on a protected GitHub Environment (main-only, reviewer approval — solo-maintainer compatible); mutating ops serialized and never cancelled mid-migration; no public unauthenticated triggers.
- **Verify:** `preflight` dispatch green on the first try; then `secret-put` → Worker secret present (checked in the Cloudflare dashboard, not by echoing).
- **Commit:** `ci: protected ops entrypoint with preflight`

## Phase 2 — Durable change report → GitHub (needs: `GH_REPORT_TOKEN` = fine-grained PAT, **Issues: write only**)

- **Objective:** Only-when-changed reports to one **pre-created, pinned** issue (its number is config — no lookup logic).
- **Report identity (each comment):** URL, affected provider IDs + surfaces, old/new content hashes, checked/detected timestamps (distinct from policy publication dates — those come from research), fetch result class, and **bounded old/new excerpts** (the first divergent section of each) so the research agent has evidence in the issue itself — the R2 bucket stays private and neither the agent nor the reporter needs bucket access.
- **Durability:** a change event is written to KV as `pending` with an event ID **before** hash state is committed; the GitHub post is retried on subsequent runs until the API acknowledges, then marked `reported`. Event-ID dedupe prevents duplicate comments on retry. A GitHub failure never silently loses a change.
- **Verify:** forced change → comment appears once; simulate GitHub failure → retried next run, still exactly one comment; no-change run posts nothing.
- **Commit:** `feat(watcher): durable change reports with event dedupe`

## Phase 3 — Research loop (tool-agnostic; Amp schedule is the default, not a dependency)

- **Objective:** Cycle: read unprocessed issue comments → re-research affected providers against the changed pages → update `providers.json` + `policies/*.md` + `CHANGELOG.md` → bump `meta.version`, `package.json`, **and `package-lock.json` root version together** → open PR.
- **Amp variant (default):** biweekly scheduled thread. **Manual variant (documented fallback):** the same checklist executed by hand from the issue — the pipeline does not depend on Amp existing. A CI variant is possible later if the project leaves Amp.
- **Loop hygiene:** process all unprocessed comments (paginate), record a processed checkpoint, dedupe providers already covered by an open PR, link PRs back to event IDs, acknowledge events only after a durable outcome (merged PR or documented no-change).
- **Authority:** the research agent pushes branches and opens PRs — **never merges**, never touches infrastructure settings.
- **Verify:** one dry cycle (manual changed list, before Phase 2 even) produces a reviewable PR with source-dated edits and green `npm run validate`.

## Phase 4 — `/api/search` (gate: T4.3 benchmark must pass before Phase 5)

### T4.1 — Shared D1 + bindings on both runtimes
- **User does once in dashboard:** create D1 database `privacywatch-index`.
- **Files:** add to *both* `worker/wrangler.jsonc` (write path) and `wrangler.jsonc` (Pages read path) — same `database_id`: `d1_databases` and the Workers AI binding spelled **`ai: { binding: "AI" }`** (correct config key; `workers_ai` is not). `migrations_dir` = `worker/migrations`; distinguish local vs remote migration runs; preview database separate from production. Migration `worker/migrations/0001-chunks.sql`: `chunks(id, provider_id, url, text, embedding BLOB, updated_at)` (+ index on `url`). **Ordering:** schema deploys land before consumers, and each schema change stays backward-compatible across the two independent release surfaces (Worker and Pages deploy separately).
- **Verify:** `wrangler d1 migrations apply` against preview; both dry-runs list the bindings.
- **Note:** "read path" is an application convention, not a D1 permission boundary.

### T4.2 — Indexing pipeline (fully specified)
- Extraction from snapshot HTML → main-content text (reuse the hash normalizer's stripping); chunk bounds ~1,500 chars with ~150 overlap; embed with **pinned model+version** `@cf/baai/bge-base-en-v1.5` (768 dims), Float32-encoded BLOBs; provider/surface mapping from the manifest.
- **Atomic revisions:** a source revision is written as a new chunk set under a `revision` key and swapped in one transaction — readers never mix old/new chunks; obsolete chunks (removed paragraphs, replaced pages) are **deleted**, not just upserted past.
- **Backfill:** runs *inside the Worker* as an authenticated ops route (`OPS_TOKEN` Worker secret, set via T1.4; requests must present it as a header) using runtime bindings — this avoids both extra AI/REST API permissions and the Action-runner CPU question, since extraction and orchestration share the Worker's budget instead of needing a Node runner with `env.AI`/`env.SNAPSHOTS`/`env.DB`. Reads snapshots from R2, bounded batches, resumable via cursor, verified against actual snapshot coverage (per-URL chunk counts, not just `rows > 0`).
- **Verify:** forced re-index of one provider → old chunks gone, new chunks present, single revision visible.

### T4.3 — Query path + benchmark gate
- **Files:** `functions/api/search.ts` — embed query (1 AI call), **one full-scan `SELECT`** (a single query even on free; 3k rows × 768 dims ≈ 9.2 MB — fits Worker memory), in-isolate cosine over pre-normalized Float32 vectors, isolate-level vector cache to absorb repeat traffic, top-k `{ provider, surface, snippet, sourceUrl }`.
- **Budget honesty (v1's "single-digit ms" claim is retracted):** ~3k-row scans ≈ 3k rows-read/query → at the review-claimed 5M/day quota that bounds ~1,600 queries/day before other reads — fine for a tracker site, **but measured, not assumed**: the gate is a benchmarked cold end-to-end request (latency, CPU, neurons/query) plus a projected monthly query volume. If the gate fails: first try lexical prefilter + smaller candidate sets; Vectorize ($5/mo Workers Paid) is the documented fallback, not a default.
- **Labeling:** results carry both the indexed snapshot date and the provider's `sourceDate` from `providers.json`, so unreviewed live-source text is never presented as human-verified data (the PR gate protects the dataset; search shows live evidence distinctly).
- **Verify:** curl the deployed endpoint for a known question → top hits cite the right policy pages; benchmark numbers recorded in the PR description.

## Phase 5 — `/api/ask` + Ask UI (gated on T4.3 passing)

- **T5.1:** `functions/api/ask.ts` — same retrieval, then Workers AI `@cf/meta/llama-3.1-8b-instruct`, grounded strictly on retrieved chunks. **Refusal gate is enforced, not prompted:** retrieval relevance threshold (cosine cutoff) + citation validation (every cited claim must map to a retrieved chunk) — unconditional top-k always returns "neighbors", so a nonempty corpus alone must never produce an answer. Rendered text/links escaped in `index.html`.
- **Quota + abuse:** the 10k Neurons/day free allocation is **shared** — watcher embeddings, search, and ask all draw from it; ask adds an in-Worker per-IP rate limit and prompt-size cap so the quota can't be drained by one user, starving the watcher. Quota-exhaustion returns an explicit error state, tested.
- **T5.2:** "Ask the policies" box matching existing styling; states: answer+citations, unsupported-question refusal, quota error. **Verify:** browser inspection of all three states before merge.
- **Adversarial tests:** unrelated question → refusal; plausible-but-unsupported claim → refusal; provider/surface confusion (ChatGPT vs API row) → correct attribution; policy text containing prompt-injection strings → treated as data, never instructions.
- **Commits:** `feat(api): grounded ask endpoint with enforced refusal` → `feat(ui): ask-the-policies box`

## Phase 6 — Breadth expansion (rolling, rides Phase 3)

Candidate backlog: Chinese long tail (Baidu ERNIE, ByteDance Doubao/Volcano, Tencent Hunyuan, StepFun, 01.AI), aggregators (OpenRouter, Vercel AI Gateway), enterprise platforms (Snowflake Cortex, Databricks, Hugging Face), AI tools (GitHub Copilot, Windsurf, Cline, Roo Code, Aider, Claude Code, Codex CLI, Gemini CLI, Bolt, v0, Replit, Devin, Jules — consider `surfaceType: "agent"`), consumer (Meta AI, Poe, Character.AI, Mistral Le Chat, DeepSeek app). One provider per PR, validated, CHANGELOG-logged.

---

## Sequencing

| Phase | Blocked on | Notes |
|---|---|---|
| 0 (audit/manifest/tests/validate) | nothing | start immediately |
| 1–2 (watcher + durable report) | Actions secrets: CF token (Workers Scripts Edit), account ID, `GH_REPORT_TOKEN` (Issues:write) | resources created in dashboard by user |
| 3 (research loop) | cadence sign-off | Amp-scheduled or manual; can run on manual lists pre-Phase-2 |
| 4 (search) | Actions secrets gain D1 Edit (only permission added) | T4.3 benchmark gates Phase 5 |
| 5 (ask + UI) | T4.3 gate | |
| 6 (breadth) | nothing | rolling |

## Needed from the user

1. **GitHub Actions secrets** (repo Settings → Secrets and variables → Actions): `CLOUDFLARE_API_TOKEN` — initially scoped to **Workers Scripts Edit only** (deploy + `secret put`; no KV/R2/Account-Settings permissions — resources are created in the dashboard, runtime uses bindings); extend with **D1 Edit** when Phase 4 starts; nothing else unless a proven operation requires it. Plus `CLOUDFLARE_ACCOUNT_ID` (an identifier — an Actions *variable* is fine, storing it as a secret is harmless). Plus `GH_REPORT_TOKEN` — fine-grained PAT, **Issues: write only** on this repo, pre-created pinned issue available.
2. **One-time dashboard actions:** create the KV namespace, R2 bucket (confirm R2 is enabled on the account), later the D1 database.
3. **Cadence confirmation:** watcher 2×/day (automatic), research PR biweekly.
4. **Repo guardrails:** protect `main` with required checks (solo-compatible settings); workflow changes to T1.3/T1.4 get the same review.
5. **Authority verification:** Actions-dispatch authority (`workflow_dispatch` via `gh`) is verified by the T1.4 `preflight` dispatch; branch push/PR authority for the research loop is verified on the first PR. Only if the existing GitHub auth proves insufficient are separate scoped PATs provisioned as Actions secrets — the reporter PAT is never broadened.

---

## Review reconciliation (2026-09-13, ultra review)

**Accepted:** shard 14→10 with budget assertion and deferral (v1 failed precisely when changes exist); full failure-semantics spec (inconclusive ≠ unchanged, immutable snapshot keys, retention, baseline behavior, cursor stability); CPU treated as unmeasured until benchmarked; streaming byte-capped reads; manifest dedupe (41 distinct URLs); T0.0 source-coverage audit; deploy path filters + tests-before-deploy + lockfile version sync; T4.1 `ai` binding key, migrations dir, preview/prod split; T4.2 atomic revisions + chunk deletion + resumable backfill; T4.3 budget honesty (v1 "single-digit ms" retracted) with a benchmark gate; T5.1 enforced refusal gate + shared-neurons abuse controls; durable event-ID'd reports with retry; Phase 3 checkpoint/dedupe/authority semantics; unreviewed-search labeling; adversarial test lists; credential reductions (Issues:write-only PAT, no Account Settings Read, D1 Edit deferred to Phase 4, dashboard-created resources, Worker-internal backfill avoiding AI/REST permissions).

**Weighed and declined:** a queue framework or extra database to rescue shard size (reviewer concurred — heavier indexing stays in the research/backfill runner); Vectorize now (fallback only); bucket-scoped R2 tokens (unnecessary — resources pre-created in dashboard, runtime uses bindings); Account Settings Read (no named operation needs it).

**Second review round (same day):** accepted — T1.4 rewritten as a protected ops workflow (task allowlist with server-side validation, `permissions: contents: read` default, secret scoped to the `secret-put` job only, immutable action pins, read-only `preflight` before any mutation, protected environment for mutating tasks, main-only dispatch with recorded revisions); credential wording corrected (Actions is the management source; the Worker holds a runtime copy of `GH_REPORT_TOKEN` only — "exclusively in Actions" was not literal); schema migration ordering + backward compatibility across the separate Worker/Pages releases; backfill route auth (`OPS_TOKEN`) and batch/cursor bounds, resolving the AI-credential question (binding-based Worker backfill needs no AI REST permission, so the three-secret set is complete for Phases 1–3); bounded evidence excerpts embedded in change reports; account-ID-as-variable note; main-branch protection added to the asks. Already present in v2 before this round: shard 10 + budget assertion, freshness formula, `ai` binding key, manifest dedupe, durable event-ID'd reports, benchmark-gated T4.3 (v1's "single-digit ms" retracted), enforced refusal gate, Amp-optional research loop.
