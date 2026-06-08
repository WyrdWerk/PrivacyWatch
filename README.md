# PolicyWatch

**LLM data retention and model training policy tracker.**

Who stores your prompts? Who trains on them? Researched from primary sources — privacy policies, ToS, DPAs, and API docs — across 33 tracked provider surfaces.

Live at: **[policywatch.wyrdwerk.com](https://policywatch.wyrdwerk.com)** (Pages fallback: [policywatch-8j7.pages.dev](https://policywatch-8j7.pages.dev))

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

## Providers covered (v1.3, June 2026)

**33 tracked surfaces** across 22 provider families in 4 categories:

**US Frontier:** OpenAI · Anthropic · Google Gemini · xAI / Grok

**Chinese:** Alibaba/Qwen · Moonshot AI/Kimi · Zhipu AI/GLM · MiniMax · DeepSeek · Xiaomi MiMo

**Inference:** Fireworks AI · Together AI · DeepInfra · Nebius AI · SiliconFlow

**Coding Tools:** Cursor · OpenCode · HyperAgent · Crof AI · Wafer AI · Neuralwatt · CommandCode

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

## Updating a provider

All provider data lives in [`providers.json`](./providers.json). Each entry follows this schema (see [`providers.schema.json`](./providers.schema.json)):

```json
{
  "id": "openai-api",
  "name": "OpenAI",
  "surface": "API",
  "surfaceType": "api",
  "category": "us-frontier",
  "categoryLabel": "US Frontier",
  "rating": "clean",
  "incident": false,
  "training": {
    "label": "Off by default",
    "detail": "Full explanation shown on row expand."
  },
  "retention": { "label": "30 days", "detail": "..." },
  "zdr": { "label": "Yes — approval required", "detail": "...", "status": "full" },
  "location": { "label": "US + EU option", "flag": "🇺🇸", "detail": "..." },
  "sourceUrl": "https://...",
  "sourceDate": "2026-05-27",
  "notes": "Optional footnote shown on expand."
}
```

To update a provider when their policy changes:
1. Edit the relevant fields in `providers.json`
2. Update `sourceDate` to the verification date
3. Update `meta.lastUpdated` and bump `meta.version` at the top of the file
4. Bump `package.json` version to match
5. Log the change in `CHANGELOG.md`
6. Validate and deploy: `npm run deploy`

Provider rows in the UI link to each entry's official `sourceUrl`. Local archived policy snapshots under `policies/` are for internal research reference and are not published in production builds.

---

## Development

```bash
npm run build      # build curated dist/ artifact
npm run validate   # validate providers.json
npm run dev        # local preview from dist/
npm run deploy     # build, validate, deploy to Cloudflare Pages
```

Hosted on Cloudflare Pages. Production deploys only the curated `dist/` output (app shell, data JSON, assets, and public metadata).

### Custom domain setup (`policywatch.wyrdwerk.com`)

`wyrdwerk.com` is already on Cloudflare (same account as other Pages projects like `metrics.wyrdwerk.com`). Link the subdomain to the **`policywatch`** Pages project:

#### Step 1 — Attach the domain in Cloudflare Pages

1. Open [Cloudflare Dashboard](https://dash.cloudflare.com) → **Workers & Pages**
2. Select the **`policywatch`** project
3. Go to **Custom domains** → **Set up a custom domain**
4. Enter **`policywatch.wyrdwerk.com`** → **Continue**
5. Confirm when prompted — Cloudflare should **auto-create the DNS record** because `wyrdwerk.com` is already a zone on this account

Wait until the domain status shows **Active** (SSL certificate provisioning can take a few minutes).

#### Step 2 — Verify DNS (usually automatic)

If Cloudflare did not auto-create the record, add this manually under **wyrdwerk.com** → **DNS** → **Records**:

| Type  | Name        | Content / Target              | Proxy status |
|-------|-------------|-------------------------------|--------------|
| CNAME | `policywatch` | `policywatch-8j7.pages.dev` | **Proxied** (orange cloud) |

**Important:** Add the domain through the Pages UI first. A CNAME added only in DNS (without linking it in Pages) will 522.

#### Step 3 — Smoke test

```bash
curl -sI https://policywatch.wyrdwerk.com | head -5
# Expect: HTTP/2 200

curl -sL https://policywatch.wyrdwerk.com | grep canonical
# Expect: policywatch.wyrdwerk.com
```

#### Step 4 — Deploy and update legacy redirect

After DNS is active:

```bash
npm run deploy                  # publish app with canonical URLs
npm run deploy:legacy-redirect  # legacy Pages hostname → policywatch.wyrdwerk.com
```

#### Optional — Redirect `*.pages.dev` to custom domain

In Cloudflare **Bulk Redirects** (account-level), you can 301 `policywatch-8j7.pages.dev` → `policywatch.wyrdwerk.com` so only the branded URL is used publicly.

### Infra notes

- **GitHub:** [WyrdWerk/policywatch](https://github.com/WyrdWerk/policywatch)
- **Cloudflare Pages project:** `policywatch` → `policywatch-8j7.pages.dev` (bare `policywatch.pages.dev` is unavailable on Pages)
- **Production canonical:** `policywatch.wyrdwerk.com`
- **Legacy Pages hostname:** 301 to production via `npm run deploy:legacy-redirect`

---

## Caveats

- **Not legal advice.** This is a good-faith summary of public policy documents.
- **Policies change.** Always verify with primary sources before making compliance decisions.
- **"Unknown" ≠ safe.** ⚫ Unverified means we couldn't confirm — not that the provider is clean.
- Research conducted May–June 2026. Verify dates on individual provider entries.

---

Maintained by [WyrdWerk](https://wyrdwerk.com)
