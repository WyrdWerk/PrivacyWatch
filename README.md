# PrivacyWatch

**LLM data privacy, retention, and model training tracker.**

Who stores your prompts? Who trains on them? Researched from primary sources — privacy policies, ToS, DPAs, and API docs.

**Live:** [privacywatch.wyrdwerk.com](https://privacywatch.wyrdwerk.com)

---

## What this tracks

For each provider surface, we research and document:

| Field | What it means |
|---|---|
| **Training use** | Is your data used to train or fine-tune models? (includes default on/off) |
| **Zero Data Retention (ZDR)** | Does a ZDR option exist, and what tier unlocks it? |
| **Retention duration** | How long is your data stored? |
| **Data location** | Where is data processed and stored? |
| **Rating** | Overall assessment: Clean, Guarded, Caution, High Risk, or Unverified |

## Providers covered

**96 tracked surfaces** across 85 provider families in 4 categories:

**US Frontier:** OpenAI · Anthropic · Google Gemini · xAI / Grok

**Chinese:** Alibaba/Qwen · Moonshot AI/Kimi · Zhipu AI/GLM · MiniMax · DeepSeek · Xiaomi MiMo

**Inference:** Fireworks AI · Together AI · DeepInfra · Nebius AI · SiliconFlow · Groq · Cohere · Mistral · Perplexity · Cloudflare · Amazon Bedrock · Azure · AI21 · Cerebras · SambaNova · StepFun · Baidu Qianfan · ByteDance Seed · Tencent Cloud · Upstage · Meta · Deepgram · Voyage AI · Black Forest Labs · Modal · Baseten · CoreWeave · DigitalOcean (GenAI) · Crusoe · io.net · GMICloud · AtlasCloud · NVIDIA · Reka AI · Thinking Machines · Inception Labs · Sakana AI · Poolside · Relace · Decart · Liquid AI · Runway · Krea · HeyGen · Fish Audio · Sourceful · Chutes · Venice · Mancer · NextBit · AkashML · Phala · Inference.net · Novita AI · FriendliAI · Parasail · Open Inference · Ionstream · Darkbloom · Sail Research · Perceptron · Inceptron · DekaLLM · StreamLake · Aion Labs · MARA · Nex AGI · ModelRun · Morph

**Coding Tools:** Cursor · OpenCode · HyperAgent · Wafer AI · Neuralwatt · CommandCode

Public dataset: [`providers.json`](./providers.json) · Schema: [`providers.schema.json`](./providers.schema.json) · API: [`/api/v1`](#api) · Licence: CC BY 4.0

**Data sources:** Primary research from provider privacy policies, ToS, and DPAs. Cross-referenced with [OpenRouter](https://openrouter.ai)'s curated ToS index. Brand marks are local PNGs in `assets/logos/`, refreshed from [Logo.dev](https://www.logo.dev/docs/logo-images/introduction) via `npm run logos` (publishable key, never shipped to the browser).

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

---

## Contributing data updates

Provider data lives in [`providers.json`](./providers.json). When a policy changes:

1. Edit the relevant fields in `providers.json`
2. Update `sourceDate` to the verification date
3. Update `meta.lastUpdated` and bump `meta.version`
4. Log the change in `CHANGELOG.md`
5. Open a PR or push to `main`

Each row links to its official `sourceUrl` on the live dashboard.

---

## Deployment

PrivacyWatch is a static site hosted on Cloudflare Pages. Pushes to `main` trigger an automatic build (`npm ci && npm run build && npm run validate`) and deploy the `dist/` output. No secrets are stored in this repository.

---

## Caveats

- **Not legal advice.** This is a good-faith summary of public policy documents.
- **Policies change.** Always verify with primary sources before making compliance decisions.
- **"Unknown" ≠ safe.** ⚫ Unverified means the cited document never addresses API data — not that the provider is clean. 🟠 Caution on a silent/opaque host means we looked and they still don’t say; it is not a finding that they train.
- Research conducted May–September 2026. Verify dates on individual provider entries.

---

## License

- **Data** (`providers.json`, API responses, PrivacyWatch research notes): [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/) — credit "PrivacyWatch by WyrdWerk". Quoted policy text and logos belong to their owners. See [`LICENSE-DATA.md`](./LICENSE-DATA.md).
- **Code**: [MIT](./LICENSE).

---

Maintained by [WyrdWerk](https://wyrdwerk.com)
