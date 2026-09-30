# PrivacyWatch

**LLM data privacy, retention, and model training tracker.**

Who stores your prompts? Who trains on them? Researched from primary sources — privacy policies, ToS, DPAs, and API docs.

**96 provider surfaces across 85 families · all rows re-verified against live sources on 2026-09-30** (a few rows keep earlier verification dates — check each row's `sourceDate`).

**Live:** [privacywatch.wyrdwerk.com](https://privacywatch.wyrdwerk.com)

---

## What this tracks

For each provider surface, we research and document a human-readable summary (`label`/`detail`) plus machine-readable structured fields. Every structured value is backed by an `evidence[]` entry: a verbatim quote from the primary source, its URL, and the retrieval date. `silent` means we read the provider's documents and they don't address the field — a missing field means not researched yet.

| Field | Structured as | What it means |
|---|---|---|
| **Training use** | `training.default`, `training.optOut` | Is your data used to train or fine-tune models? (includes default on/off and how to opt out) |
| **Zero Data Retention (ZDR)** | `zdr.access` | Does a ZDR option exist, and what tier unlocks it? |
| **Retention duration** | `retention.kind`, `retention.days` | How long is your data stored? |
| **Data location** | `location.regions` | Where is data processed and stored? (ISO country codes, `EU`, `GLOBAL`) |
| **Compliance** | `compliance.dpa/soc2/hipaaBaa` | DPA availability, SOC 2, HIPAA BAA |
| **Incidents** | `incidents[]` | Confirmed breaches, regulatory actions, government bans (with sources) |
| **Evidence** | `evidence[]` | Verbatim quote + source URL + retrieval date per field |
| **Rating** | `rating` | Overall assessment: Clean, Guarded, Caution, High Risk, or Unverified |

Vocabularies are defined in [`scripts/lib/v2-fields.mjs`](./scripts/lib/v2-fields.mjs), mirrored in [`providers.schema.json`](./providers.schema.json), and enforced by `npm run validate`.

## Providers covered

**96 tracked surfaces** across 85 provider families in 4 categories:

**US Frontier:** OpenAI · Anthropic · Google Gemini · xAI / Grok

**Chinese:** Alibaba / Qwen · Moonshot AI / Kimi · Zhipu AI / GLM · MiniMax · DeepSeek · Xiaomi MiMo

**Inference:** Fireworks AI · Together AI · DeepInfra · Nebius AI · SiliconFlow · Groq · Cohere · Mistral · Perplexity · Cloudflare · Amazon Bedrock · Azure · AI21 · Cerebras · SambaNova · StepFun · Baidu · ByteDance · Tencent Cloud · Upstage · Meta · Deepgram · Voyage AI · Black Forest Labs · Modal · Baseten · CoreWeave · DigitalOcean · Crusoe · io.net · GMICloud · AtlasCloud · NVIDIA · Reka AI · Thinking Machines · Inception Labs · Sakana AI · Poolside · Relace · Decart · Liquid AI · Runway · Krea · HeyGen · Fish Audio · Sourceful · Chutes · Venice · Mancer · NextBit · AkashML · Phala (Redpill) · Inference.net · Novita AI · FriendliAI · Parasail · Open Inference · Ionstream · Darkbloom · Sail Research · Perceptron · Inceptron · DekaLLM (Cloudeka) · StreamLake · Aion Labs · MARA · Nex AGI · ModelRun (Modular) · Morph

**Coding Tools:** Cursor · OpenCode · HyperAgent · Wafer AI · Neuralwatt · CommandCode

(Crof AI was removed from the dataset in v1.9.0 as defunct; its snapshot stays in `policies/` for the record.)

**Provider briefs:** every row has its own page at `/p/<id>` (e.g. [/p/openai-api](https://privacywatch.wyrdwerk.com/p/openai-api)) with a plain-English summary, the evidence quotes and incidents.

Public dataset: [`providers.json`](./providers.json) · Schema: [`providers.schema.json`](./providers.schema.json) · API: [`/api/v1`](#api) · Licence: CC BY 4.0

**Data sources:** Primary research from provider privacy policies, ToS, DPAs, and API docs — every structured value carries a verbatim evidence quote with its source URL and retrieval date. Cross-referenced with [OpenRouter](https://openrouter.ai)'s curated ToS index. A Cloudflare Worker watches every `sourceUrl` 3× a day and reports detected changes to [issue #2](https://github.com/WyrdWerk/PrivacyWatch/issues/2) (see [Contributing data updates](#contributing-data-updates)). Brand marks are local PNGs in `assets/logos/`, refreshed from [Logo.dev](https://www.logo.dev/docs/logo-images/introduction) via `npm run logos` (publishable key, never shipped to the browser).

---

## API

Read-only JSON API, no key required. Responses are CORS-enabled and cached for an hour.

**Full reference:** [`docs/API.md`](./docs/API.md) · rendered page at [`/api-docs`](https://privacywatch.wyrdwerk.com/api-docs) · OpenAPI spec at [`/api/v1/openapi.json`](https://privacywatch.wyrdwerk.com/api/v1/openapi.json)

| Endpoint | Returns |
|---|---|
| `GET /api/v1/providers` | Summary rows; filter with `category`, `rating`, `surfaceType`, `training`, `zdr`, `retention`, `region`, `maxRetentionDays`, `incident`, `ids` (compare), `fields=full` |
| `GET /api/v1/providers/{id}` | One full row, including `evidence[]` (source URL + verbatim quote + retrieval date) and `incidents[]` |
| `GET /api/v1/meta` | Version, licence, counts, filter vocabularies, endpoint map |
| `GET /api/v1/openapi.json` | OpenAPI 3.1 spec |
| `GET /api/search?q=` | Semantic search over archived policy text |

Examples:

```
/api/v1/providers?training=off&zdr=default,self-serve&region=EU
/api/v1/providers?category=inference&maxRetentionDays=30
/api/v1/providers?ids=openai-api,anthropic-api,google-vertex&fields=full
```

Filter values: comma-separate or repeat a parameter for OR; different parameters combine with AND. `silent` means we read the provider's documents and they don't address the field.

---

## Rating system

| Rating | Meaning |
|---|---|
| 🟢 Clean | Training off by default, ZDR documented, clear policy |
| 🟡 Guarded | Generally safe with documented caveats |
| 🟠 Caution | Training on by default, vague retention, **or** published pages that stay silent/opaque after a live check (not evidence they train) |
| 🔴 High Risk | Training on with weak opt-out, China storage, confirmed breach or gov bans |
| ⚫ Unverified | We have a document but it never addresses API inputs/outputs at all — not a missing review, and not the same as Caution-for-opacity |

A 🚩 incident flag is additive — it marks confirmed security breaches, regulatory actions, or government bans on top of the base rating.

**Precedents** applied in the 2026-09-30 audit (recorded in CHANGELOG v1.7.0–v1.12.0):

- "Improve the Services" wording that never names model training → **Caution**, not High Risk.
- Export-control listings and parent-company content fines go in the row's notes, **not** the incident flag.
- The incident flag is additive: it never changes the base rating.
- No documented ZDR caps a row at **Guarded** at best.
- Vague or unbounded retention → **Caution**.
- `silent` (we read the document and it doesn't say) is not the same as missing (not researched); ⚫ Unverified means the document never addresses API data at all.

---

## Contributing data updates

Provider data lives in [`providers.json`](./providers.json). Each row carries human-readable `label`/`detail` text plus structured fields (vocabularies in [`scripts/lib/v2-fields.mjs`](./scripts/lib/v2-fields.mjs), enforced by [`providers.schema.json`](./providers.schema.json) and `npm run validate`). When a policy changes:

1. **Research from primary sources only** — the provider's privacy policy, ToS, DPA, or API docs. Never infer from industry norms.
2. **Edit both layers**: update the relevant `label`/`detail` text *and* the structured fields (`training`, `retention`, `zdr`, `location`, `compliance`, `incidents`).
3. **Add evidence**: an `evidence[]` entry per field you touched — source URL, **verbatim quote**, and retrieval date (`retrieved`). A quote may be omitted only when the value is `silent`. `silent` = we read the document and it doesn't address the field; a missing field = not researched yet. Never conflate the two.
4. **Update `sourceDate`** on the row to the verification date.
5. **Bump the version**: `meta.version` in `providers.json` *and* `version` in `package.json` (they must match — `npm run validate` checks), update `meta.lastUpdated`, and log the change in [`CHANGELOG.md`](./CHANGELOG.md).
6. **Run the checks**: `node --test tests/*.test.mjs`, `npm run validate` (prints structured-field coverage), `npm run build` — all must pass.
7. **Open a PR** that references the watcher report it processes: "Processes #2 up to comment `<id>`".

**Watcher / issue #2:** the watcher Worker checks every policy URL 3× a day and posts detected changes as comments on [issue #2](https://github.com/WyrdWerk/PrivacyWatch/issues/2), which it reopens. Maintainers close #2 once a research cycle has processed every comment — a closed issue means nothing is pending.

Each row links to its official `sourceUrl` on the live dashboard.

---

## Deployment

PrivacyWatch is a static site hosted on Cloudflare Pages. Pushes to `main` trigger an automatic build (`npm ci && npm run build && npm run validate`) and deploy the `dist/` output. No secrets are stored in this repository.

---

## Caveats

- **Not legal advice.** This is a good-faith summary of public policy documents.
- **Policies change.** Always verify with primary sources before making compliance decisions.
- **"Unknown" ≠ safe.** ⚫ Unverified means the cited document never addresses API data — not that the provider is clean. 🟠 Caution on a silent/opaque host means we looked and they still don’t say; it is not a finding that they train.
- Research dates: all 96 rows were re-verified against live sources on 2026-09-30, except a few rows whose live pages blocked automated fetches or had gone unreachable, so they keep earlier `sourceDate`s. Always check the per-row `sourceDate` and the `retrieved` dates in `evidence[]` before relying on a claim.

---

## License

- **Data** (`providers.json`, API responses, PrivacyWatch research notes): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — credit "PrivacyWatch by WyrdWerk". Quoted policy text and logos belong to their owners. See [`LICENSE-DATA.md`](./LICENSE-DATA.md).
- **Code**: [MIT](./LICENSE).

---

Maintained by [WyrdWerk](https://wyrdwerk.com)
