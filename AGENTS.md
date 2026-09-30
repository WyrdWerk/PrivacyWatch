# PrivacyWatch — guide for AI agents

## Amp environment: global skills

Specifically within Amp environments, reusable global skills may be available under `~/.config/agents/skills/`. Before relevant work, inspect that directory for an applicable skill. When using a skill, read its complete `SKILL.md` and all referenced bundled resources before proceeding.

## What this repo is

PrivacyWatch tracks data privacy, retention, and model-training practices for 96 LLM provider surfaces (85 families): a static Cloudflare Pages site (`index.html`, vanilla JS/CSS) plus a public read-only JSON API at `/api/v1` (Pages Functions under `functions/`). Data licence CC BY 4.0 (`LICENSE-DATA.md`), code MIT (`LICENSE`).

## Key files

| Path | Role |
|---|---|
| `providers.json` | The dataset — source of truth. Do not edit provider data without a research-backed reason. |
| `providers.schema.json` | JSON schema for rows (mirrors the vocabularies). |
| `scripts/lib/v2-fields.mjs` | Structured-field vocabularies (`VOCAB`) and validation/evidence rules — the source of truth for allowed values. |
| `scripts/lib/api.mjs` | API summaries/filters — shared by the `/api/v1` Pages Function and the build. |
| `functions/` | Pages Functions: `/api/v1` (providers, meta, openapi) and `/api/search`. |
| `worker/` | Watcher Worker: checks policy URLs on cron (3×/day) and reports changes to issue #2. |
| `policies/` | Archived policy snapshots + research notes; index in `policies/index.md`. |
| `docs/`, `docs/plans/` | Plans, audits, API reference (`docs/API.md`). |
| `scripts/build.mjs`, `scripts/validate.mjs`, `tests/` | Build, validation (schema + vocab + coverage), `node --test` suites. |

## Commands

- `node --test tests/*.test.mjs` — unit tests (must pass).
- `npm run validate` — validates providers.json against the schema and vocabularies, checks evidence rules, prints structured-field coverage; also checks `meta.version` === `package.json` version.
- `npm run build` — builds `dist/` (injects logo map, copies API assets, stamps the OpenAPI version, emits the watcher manifest).

All three must pass before any data change ships.

## Research rules

- **Primary sources only**: the provider's privacy policy, ToS, DPA, or API docs. Never infer from industry norms.
- **Verbatim quotes**: every structured value needs an `evidence[]` entry — `{ field, url, quote, retrieved }`. Quote is copy-paste from the source; omit only when the value is `silent`.
- **`silent` vs missing**: `silent` = we read the document and it doesn't address the field. A missing field = not researched yet. Never conflate the two.
- **Never change a rating without evidence.** Precedents from the 2026-09-30 audit (details in CHANGELOG v1.7.0–v1.12.0):
  - "improve the Services" wording that never names training → Caution, not High Risk;
  - export-control listings and parent-company content fines → notes, not the incident flag;
  - the incident flag is additive and never changes the base rating;
  - no documented ZDR caps a row at Guarded;
  - vague retention → Caution;
  - opaque-after-live-check → Caution for opacity, Unverified only when the document never addresses API data at all.
- Update both layers when data changes: the human-readable `label`/`detail` text **and** the structured fields, plus `sourceDate`, `meta.version` + `package.json` version, and a CHANGELOG entry.

## Processing issue #2

The watcher Worker posts a comment per detected policy change to issue #2 and reopens it. To process: read new comments since the last processed one, re-research each affected provider from primary sources per the rules above, open a PR whose description says "Processes #2 up to comment `<id>`". Maintainers close #2 once every comment is processed — a closed issue means nothing is pending.

## API versioning policy

Within `/api/v1`, fields are added freely. Removing or renaming a field, or changing what a value means, is announced in the CHANGELOG at least 30 days ahead, and the old field keeps working during the notice period. Incompatible changes ship under `/api/v2`. Spec: `api/openapi.json`; reference: `docs/API.md`.

## Keep it simple

No new dependencies, no frameworks, no bundlers. Plain HTML/CSS/vanilla JS and Node ESM; tests with `node --test`. Escape every value from `providers.json` before putting it in HTML. Do not change provider data in `providers.json` without a research-backed reason.
