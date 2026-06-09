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

**33 tracked surfaces** across 22 provider families in 4 categories:

**US Frontier:** OpenAI · Anthropic · Google Gemini · xAI / Grok

**Chinese:** Alibaba/Qwen · Moonshot AI/Kimi · Zhipu AI/GLM · MiniMax · DeepSeek · Xiaomi MiMo

**Inference:** Fireworks AI · Together AI · DeepInfra · Nebius AI · SiliconFlow

**Coding Tools:** Cursor · OpenCode · HyperAgent · Crof AI · Wafer AI · Neuralwatt · CommandCode

Public dataset: [`providers.json`](./providers.json) · Schema: [`providers.schema.json`](./providers.schema.json)

---

## Rating system

| Rating | Meaning |
|---|---|
| 🟢 Clean | Training off by default, ZDR documented, clear policy |
| 🟡 Guarded | Generally safe with documented caveats |
| 🟠 Caution | Training on by default, or vague retention language |
| 🔴 High Risk | Training on with weak opt-out, China storage, confirmed breach or gov bans |
| ⚫ Unverified | Insufficient documentation to assess |

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
- **"Unknown" ≠ safe.** ⚫ Unverified means we couldn't confirm — not that the provider is clean.
- Research conducted May–June 2026. Verify dates on individual provider entries.

---

Maintained by [WyrdWerk](https://wyrdwerk.com)
