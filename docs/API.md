# PrivacyWatch API

Read-only JSON API over the PrivacyWatch dataset: 96 LLM provider surfaces with data privacy, retention, model-training, and zero-data-retention fields, each backed by verbatim evidence quotes. No API key, no account, no writes.

- **Base URL:** `https://privacywatch.wyrdwerk.com`
- **CORS:** `Access-Control-Allow-Origin: *` on all API responses
- **Caching:** `Cache-Control: public, max-age=3600, stale-while-revalidate=86400` (responses may be up to an hour stale)
- **Cost:** free. Be reasonable with request volume — there are no keys or rate-limit tiers; Cloudflare's default edge protection is the only guard.

This page is also rendered as a human-readable page at [`/api-docs`](https://privacywatch.wyrdwerk.com/api-docs). A machine-readable OpenAPI 3.1 spec is served at [`/api/v1/openapi.json`](https://privacywatch.wyrdwerk.com/api/v1/openapi.json).

## Quick start

```bash
# Providers that don't train on API data by default and offer self-serve ZDR
curl "https://privacywatch.wyrdwerk.com/api/v1/providers?training=off&zdr=self-serve"

# One full provider row, including evidence quotes and incidents
curl "https://privacywatch.wyrdwerk.com/api/v1/providers/anthropic-api"

# Dataset version, counts, and the exact filter vocabularies
curl "https://privacywatch.wyrdwerk.com/api/v1/meta"
```

Every response is JSON. List endpoints wrap rows in `{ "meta": { version, lastUpdated, count, license }, "data": [...] }`.

## Endpoints

### `GET /api/v1/providers`

Summary rows for all 96 provider surfaces, filtered in memory. Use this for comparisons, dashboards, and "show me providers that…" queries.

**Parameters:** see the [filters table](#filters) below. All are optional.

**Example response** (`?training=off&zdr=default&rating=clean`, trimmed to 2 of 3 matches):

```json
{
  "meta": { "version": "1.13.0", "lastUpdated": "2026-09-30", "count": 3, "license": "CC-BY-4.0" },
  "data": [
    {
      "id": "fireworks-ai", "name": "Fireworks AI", "surface": "API", "surfaceType": "api",
      "category": "inference", "rating": "clean", "incident": false,
      "training": "off", "trainingOptOut": "not-needed",
      "retention": "fixed", "retentionDays": 30, "zdr": "default",
      "regions": ["GLOBAL", "US", "CA", "EU"], "sourceDate": "2026-09-30",
      "url": "/api/v1/providers/fireworks-ai"
    }
  ]
}
```

**Errors:**
- `400` — unknown filter value or unknown parameter. The response lists what is allowed: `{"error": "rating \"great\" is not valid; allowed: clean, guarded, caution, high-risk, unverified"}`
- `502` — `{"error": "dataset unavailable"}` (the deployed `providers.json` could not be read)

Add `fields=full` to get complete rows (the same shape as `/api/v1/providers/{id}`) instead of summaries, or `ids=a,b,c` to compare a few providers side by side.

### `GET /api/v1/providers/{id}`

One full provider row, including `evidence[]` (source URL + verbatim quote + retrieval date), `incidents[]`, and compliance fields. IDs are stable and lowercase, e.g. `openai-api`, `anthropic-api`, `deepseek-api`.

**Example response** (`anthropic-api`, trimmed):

```json
{
  "meta": { "version": "1.13.0", "lastUpdated": "2026-09-30", "license": "CC-BY-4.0" },
  "data": {
    "id": "anthropic-api", "name": "Anthropic", "surface": "API", "surfaceType": "api",
    "category": "us-frontier", "rating": "clean", "incident": false,
    "training": { "label": "Off by default", "default": "off", "optOut": "not-needed", "detail": "No training on commercial API data. Opt-in via feedback submission only." },
    "retention": { "label": "30 days auto-delete", "kind": "fixed", "days": 30, "detail": "Inputs/outputs auto-deleted within 30 days. ZDR = immediate post-response." },
    "zdr": { "label": "Yes — enterprise approval", "status": "full", "access": "approval", "detail": "ZDR available for enterprise API customers. Requires Anthropic account team + per-org enablement." },
    "location": { "label": "US storage; global inference", "regions": ["GLOBAL", "US"], "detail": "Data stored in the US. Inference may run in any geography by default; US-only inference available at 1.1x pricing." },
    "compliance": { "dpa": "public", "soc2": "type2", "hipaaBaa": "available" },
    "incidents": [],
    "evidence": [
      {
        "field": "training",
        "url": "https://privacy.claude.com/en/articles/7996868",
        "quote": "By default, we will not use your inputs or outputs from our commercial products (e.g. Claude for Work, Anthropic API, Claude Gov, etc.) to train our models.",
        "retrieved": "2026-09-30"
      }
    ],
    "sourceUrl": "https://www.anthropic.com/legal/commercial-terms",
    "sourceDate": "2026-09-30"
  }
}
```

**Errors:**
- `404` — `{"error": "unknown provider id \"…\"}`. Valid IDs are listed by `/api/v1/providers` and `/providers.json`.
- `502` — `{"error": "dataset unavailable"}`

### `GET /api/v1/meta`

Dataset version, licence, counts by rating and category, the exact filter vocabularies, and an endpoint map. Use it to validate filter values client-side or to detect dataset updates.

**Example response** (trimmed):

```json
{
  "version": "1.13.0",
  "lastUpdated": "2026-09-30",
  "count": 96,
  "license": "CC-BY-4.0",
  "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
  "attribution": "PrivacyWatch by WyrdWerk (https://privacywatch.wyrdwerk.com)",
  "counts": { "rating": { "clean": 21, "guarded": 23, "caution": 38, "high-risk": 13, "unverified": 1 }, "category": { "us-frontier": 8, "chinese": 10, "inference": 69, "coding": 9 } },
  "endpoints": { "list": "/api/v1/providers", "provider": "/api/v1/providers/{id}", "meta": "/api/v1/meta", "openapi": "/api/v1/openapi.json", "search": "/api/search?q=", "dataset": "/providers.json" }
}
```

**Errors:** `502` — `{"error": "dataset unavailable"}`

### `GET /api/v1/openapi.json`

OpenAPI 3.1 spec for the API, with the dataset version injected as `info.version`. Machine-readable; import it into tooling or code generators.

### `GET /api/search?q=`

Semantic search over the archived policy corpus (privacy policies, ToS, DPAs behind the dataset). Returns the top matching text chunks with source URLs and provider IDs. Not a provider filter — it searches documents, not the structured fields.

**Parameters:** `q` (required, free text, max 512 chars), `k` (optional, results 1–25, default 8).

**Example response** (`?q=zero+data+retention`, trimmed):

```json
{
  "query": "zero data retention",
  "count": 42,
  "results": [
    {
      "providerIds": ["anthropic-api"],
      "url": "https://platform.claude.com/docs/en/manage-claude/api-and-data-retention",
      "score": 0.822,
      "snippet": "ZDR is enabled per organization; each new organization requires ZDR to be enabled separately by your account team…"
    }
  ]
}
```

**Errors:**
- `400` — `{"error": "missing q parameter"}`
- `502` — embedding or index errors: `{"error": "embedding failed"}` / `{"error": "internal error"}`

### `GET /providers.json`

The full raw dataset — `meta` plus all 96 complete provider rows. Same data the API reads, served as a static file. Use it for bulk processing or offline analysis; use the API for filtered/point queries. CORS-enabled, cached for an hour.

## Filters

All filters are optional and combine with **AND**. Within one filter, comma-separated values or repeated parameters mean **OR**. The vocabularies come from [`scripts/lib/v2-fields.mjs`](../scripts/lib/v2-fields.mjs); `/api/v1/meta` returns the same lists at runtime.

| Parameter | Matches | Allowed values |
|---|---|---|
| `category` | `row.category` | `us-frontier`, `chinese`, `inference`, `coding` |
| `rating` | `row.rating` | `clean`, `guarded`, `caution`, `high-risk`, `unverified` |
| `surfaceType` | `row.surfaceType` | `api`, `consumer` |
| `training` | `training.default` | `off`, `on`, `opt-in`, `tier-dependent`, `silent`, `conflicting` |
| `zdr` | `zdr.access` | `default`, `self-serve`, `approval`, `enterprise`, `none`, `silent` |
| `retention` | `retention.kind` | `none`, `transient`, `fixed`, `until-deleted`, `indefinite`, `silent` |
| `region` | value appears in `location.regions` | ISO 3166-1 alpha-2 code (e.g. `US`, `DE`), `EU`, or `GLOBAL` |
| `maxRetentionDays` | `retention.kind` is `fixed` **and** `retention.days ≤ N` | non-negative integer. Only `fixed` retention can match; `silent`, `indefinite`, etc. never do |
| `incident` | `row.incident` | `true`, `false` |
| `ids` | `row.id` in the list | comma-separated provider IDs (use to compare rows side by side) |
| `fields` | response shape | `summary` (default), `full` |

Invalid values return `400` with the allowed list, so a client can self-correct from the error alone. Example:

```
GET /api/v1/providers?rating=great
→ 400 {"error": "rating \"great\" is not valid; allowed: clean, guarded, caution, high-risk, unverified"}
```

## Field glossary

### Summary row (`/api/v1/providers`)

| Field | Meaning |
|---|---|
| `id`, `name`, `surface`, `surfaceType` | Stable ID, display name, product surface ("API", "Consumer"…) and its type (`api`/`consumer`) |
| `category` | `us-frontier`, `chinese`, `inference`, `coding` |
| `rating` | Overall assessment — see [the rating system](../README.md#rating-system) |
| `incident` | `true` when a confirmed breach, regulatory action, or government ban is on record |
| `training` | `training.default`: what a new account gets |
| `trainingOptOut` | `training.optOut`: how to turn training off when it's on |
| `retention` / `retentionDays` | `retention.kind`; `retentionDays` is only set when kind is `fixed`, otherwise `null` |
| `zdr` | `zdr.access`: whether a zero-data-retention option exists and what unlocks it |
| `regions` | `location.regions` |
| `sourceDate` | When this row was last verified against the primary source |
| `url` | Path to the full row for this provider |

### Structured fields (full rows)

| Field | Values | Meaning |
|---|---|---|
| `training.default` | `off` · `on` · `opt-in` · `tier-dependent` · `silent` · `conflicting` | Training use for a new account by default. `tier-dependent` = free/paid/enterprise differ (details in `training.detail`); `conflicting` = the provider's own documents disagree |
| `training.optOut` | `setting` · `api-param` · `email` · `contract` · `not-needed` · `none` · `silent` | How to opt out. `not-needed` pairs with `training.default: off`; `none` = training is on and there is no opt-out |
| `retention.kind` | `none` · `transient` · `fixed` · `until-deleted` · `indefinite` · `silent` | How long inputs/outputs are kept. `transient` = only to serve the request |
| `retention.days` | positive integer | Present only when `retention.kind` is `fixed` |
| `zdr.access` | `default` · `self-serve` · `approval` · `enterprise` · `none` · `silent` | Zero data retention option: `default` = on for everyone, `self-serve` = toggle in settings/console, `approval` = requires provider sign-off, `enterprise` = contract-gated, `none` = no ZDR |
| `location.regions` | ISO 3166-1 alpha-2 codes, `EU`, `GLOBAL`; `[]` = silent | Where data can be processed/stored. `GLOBAL` = provider states global processing. Empty array = read the docs, they don't say |
| `compliance.dpa` | `public` · `on-request` · `enterprise` · `none` · `silent` | Data processing addendum availability |
| `compliance.soc2` | `type1` · `type2` · `none` · `silent` | SOC 2 attestation level |
| `compliance.hipaaBaa` | `available` · `enterprise` · `none` · `silent` | HIPAA business associate agreement availability |
| `incidents[]` | `{ date, type, confirmed, summary, sourceUrl }` | `type`: `breach`, `regulatory`, `ban`, `allegation`. `date` is `YYYY-MM` or `YYYY-MM-DD`. Only confirmed non-allegation entries set the row's `incident` flag |
| `evidence[]` | `{ field, url, quote, retrieved }` | The backing for a structured field: verbatim quote from the source URL, with the date we retrieved it. `field` is one of `training`, `retention`, `zdr`, `location`, `compliance`, `incidents`. Quotes are omitted only when the value is `silent` |

### "silent" vs missing

- **`silent`** — we read the provider's documents and they don't address this field. A finding of opacity, not an absence of research, and **not** evidence the provider trains or retains anything.
- **Missing** — not researched yet. Never conflate the two.

### Ratings

`rating` summarises the row: 🟢 **Clean** (training off by default, ZDR documented, clear policy), 🟡 **Guarded** (safe with documented caveats), 🟠 **Caution** (training on by default, vague retention, or docs that stay opaque after a live check), 🔴 **High Risk** (training on with weak opt-out, China storage, confirmed breach or government bans), ⚫ **Unverified** (the cited document never addresses API data at all). Full definitions with caveats: [README rating system](../README.md#rating-system). The 🚩 `incident` flag is additive on top of the base rating.

## Versioning policy

- **Fields may be added at any time.** Treat unknown new fields in responses as normal.
- **Removing or renaming a field, or changing what a value means, is announced in [CHANGELOG.md](../CHANGELOG.md) at least 30 days ahead, and the old field keeps working during that notice period.**
- Large or incompatible changes ship under `/api/v2` instead, leaving `/api/v1` working.

`meta.version` (also in every response's `meta`) is the dataset version; `/api/v1/meta`'s `lastUpdated` is the research date.

## Licence & attribution

- **Data** (`providers.json`, API responses, research notes): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — credit **"PrivacyWatch by WyrdWerk — https://privacywatch.wyrdwerk.com"**. See [LICENSE-DATA.md](../LICENSE-DATA.md).
- **Quoted policy text and logos** belong to their respective owners and are excluded from the data licence.
- **Code** (including the API functions): [MIT](../LICENSE).

**Not legal advice.** This is a good-faith summary of public policy documents. Policies change — verify with primary sources (each row's `evidence[]` links them) before making compliance decisions.
