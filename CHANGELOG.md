# Changelog

All policy changes, new providers, and corrections are logged here.
Format: `[YYYY-MM-DD] Provider — what changed — source`

## Unreleased

**Provider logos from Logo.dev.** Fetched 86 family brand marks into `assets/logos/` via the Logo.dev image CDN (`npm run logos`). The site serves only local PNGs (CSP `img-src 'self'`); the publishable key is not embedded. Build injects the name→slug map from `scripts/lib/logos.mjs`.

---

## v1.6.0 — 2026-09-13

**OpenRouter batches 4+5: 23 new providers.** Added Chutes, Venice, Mancer, NextBit, AkashML, Phala (Redpill), Inference.net, Novita AI, FriendliAI, Parasail, Open Inference, Ionstream, Darkbloom, Sail Research, Perceptron, Inceptron, DekaLLM (Cloudeka), StreamLake, Aion Labs, MARA, Nex AGI, ModelRun (Modular), and Morph — researched from primary terms-of-service and privacy documents with quotes. Highlights: Chutes, Venice, NextBit, AkashML, Novita AI, Inceptron, and MARA are training-off by default with documented zero-retention or transient-only processing (rated Clean); Parasail, Darkbloom, Sail Research, DekaLLM, and Morph are training-off with thinner retention documentation (Guarded); FriendliAI (free-tier training rights over Customer Materials), Perceptron (consumer-tier training), Inference.net (undocumented retention), and Open Inference (conflicting ToS opt-out vs privacy-policy no-training language) are Caution; StreamLake (training on Content with email-only opt-out) and Nex AGI (training on with open-ended retention, processed in China) are High Risk. Mancer, Phala (Redpill), Ionstream, Aion Labs, and ModelRun (Modular) leave the API data lifecycle undocumented and are rated Unverified. Incident recorded for StreamLake: parent Kuaishou's Feb 2026 ¥119.1M cyberspace-regulator fine — a corporate content-regulation penalty, not an API data breach. 74 → 97 surfaces across 63 → 86 families.

## v1.5.0 — 2026-09-13

**OpenRouter batches 2+3: 22 new providers.** Added Modal, Baseten, CoreWeave, DigitalOcean (GenAI), Crusoe (Managed Inference), io.net, GMICloud, AtlasCloud, NVIDIA (API Catalog), Reka AI, Thinking Machines (free research API), Inception Labs, Sakana AI, Poolside, Relace, Decart, Liquid AI, Runway, Krea, HeyGen, Fish Audio, and Sourceful — researched from primary terms and privacy documents with quotes. Highlights: Crusoe's OpenRouter Managed Inference ToS and Decart's Cogito API terms are training-off by default with no-disk-storage/no-retention defaults (rated Clean); Modal is training-off by default with customer-selectable processing regions (Guarded — a July 2026 customer-account compromise by an OpenAI-operated rogue agent affected one customer's public endpoint, not Modal's platform, so it stays below the incident flag). Thinking Machines' free research tier, Liquid AI, Runway, and Fish Audio grant training rights with no documented opt-out (High Risk). Reka AI and Sourceful are training-off only on paid tiers; Inception Labs, Sakana AI, Poolside, Relace, and HeyGen are training-on by default with opt-outs (Caution). Baseten, CoreWeave, DigitalOcean GenAI, io.net, GMICloud, AtlasCloud, NVIDIA API Catalog, and Krea leave training undocumented (Unverified). Confirmed incidents recorded for Baseten (GitHub PAT-takeover researcher disclosure), DigitalOcean (2021 billing-data breach), and io.net (April 2024 GPU metadata attack) — Modal's July 2026 rogue-agent event is documented in notes but stayed below the confirmed-incident bar. 52 → 74 surfaces across 41 → 63 families.

---

## v1.4.0 — 2026-09-13

**OpenRouter batch 1: 9 new inference providers.** Added StepFun, Baidu Qianfan, ByteDance Seed (BytePlus ModelArk), Tencent Cloud (TokenHub), Upstage (Solar), Meta (Model API), Deepgram, Voyage AI, and Black Forest Labs (FLUX) — researched from primary terms-of-service documents with quotes. Highlights: BytePlus ModelArk and Tencent TokenHub are training-off by default with documented ZDR conditions; Black Forest Labs' FLUX API terms grant training rights with no opt-out (rated High Risk); Deepgram and Voyage AI are training-on by default with self-serve opt-outs (rated Caution). StepFun's research notes record the joint CISA/NSA/FBI advisory AA26-251A alleging unauthorized distillation — an allegation, kept below the confirmed-incident bar. 43 → 52 surfaces across 41 families.

---

## v1.3.9 — 2026-06-28

**Inference expansion + logo standardization.** Added 10 new inference providers (Groq, Cohere, Mistral, Perplexity, Cloudflare, Amazon Bedrock, Azure, AI21, Cerebras, SambaNova). Updated 15 existing providers with canonical ToS URLs from OpenRouter's curated index. Replaced all 32 provider logos with official SVGs from models.dev CDN. README updated to reflect 43 tracked surfaces across 32 provider families.

---

## v1.3.9 — 2026-06-09

**Public README cleanup.** Removed internal Cloudflare/DNS/deploy runbooks from the public README; replaced with a brief deployment summary. Updated GitHub repository description to reflect 33 tracked surfaces.

---

## v1.3.8 — 2026-06-09

**Cloudflare project alignment.** Updated Wrangler, deploy script, and ops defaults to the `privacywatch` Pages project and `privacywatch.pages.dev` fallback hostname. Simplified README deployment notes now that the custom domain cutover is complete.

---

## v1.3.7 — 2026-06-09

**PrivacyWatch rename.** Rebranded user-facing copy, public dataset metadata, SEO tags, structured data, GitHub links, and production URL references from PolicyWatch to PrivacyWatch. Public canonical now targets `privacywatch.wyrdwerk.com` while internal Cloudflare Pages slugs remain unchanged for now.

---

## v1.3.6 — 2026-06-08

**Migrate to Cloudflare Git integration.** Removed GitHub Actions deploy workflows and repo token requirements. Production auto-deploy now via Cloudflare Pages dashboard Git linkage; README documents one-time Direct Upload cutover and dashboard-only redirect setup.

---

## v1.3.5 — 2026-06-08

**Deploy automation.** GitHub Actions auto-deploy on push to `main`, legacy redirect workflow, bulk redirect setup script, and README secrets/operations guide. Added `package-lock.json` for CI.

---

## v1.3.4 — 2026-06-08

**GitHub repository rename.** Repository moved to `WyrdWerk/policywatch`. Updated GitHub links in UI and `providers.json` maintainer field; removed remaining legacy product-name references from docs.

---

## v1.3.3 — 2026-06-08

**Custom domain canonical URLs.** Point SEO metadata, sitemap, and robots at `policywatch.wyrdwerk.com`. Added README custom-domain setup guide and `npm run deploy:legacy-redirect` for the pre-migration Pages hostname.

---

## v1.3.2 — 2026-06-08

**Pages project migration.** Created Cloudflare Pages project `policywatch` and pointed deploy/canonical URLs at `policywatch-8j7.pages.dev`. Bare `policywatch.pages.dev` is unavailable; legacy Pages hostname now redirects to the new deployment.

---

## v1.3.1 — 2026-06-08

**PolicyWatch branding.** User-facing product name set to PolicyWatch across UI, public data metadata, schema title, and internal policy docs.

---

## v1.3.0 — 2026-06-08

**Production recovery and release hygiene.** Restored wiped dashboard rendering, hardened frontend bootstrap, and tightened deploy output.

### Frontend fixes
- Fixed startup crash caused by missing `#footerDate` element blocking `init()` and `/providers.json` fetch
- Closed malformed toolbar markup (unclosed `.search-wrap`) that broke filter layout
- Added defensive data-load validation, explicit error state, and URL-param sanitization
- Escaped helper-rendered badge/ZDR fields; improved keyboard sort, search labeling, and dark-mode badge tokens
- Header/footer dates and hero count now sync from `providers.json` `meta` after load

### Release / deploy
- Added curated `dist/` build (`npm run build`) so production no longer publishes internal `policies/` archives
- Tightened cache headers for `/index.html` and `/providers.json` to avoid stale post-deploy content
- Aligned `meta.version`, `package.json`, and public copy to v1.3.0 / 33 tracked surfaces
- Standardized coding category label to "Coding Tools"

---

## v1.2.0 — 2026-06-07

**Audit-driven updates.** Verified all 33 entries against PolicyWatch NotebookLM (157 sources). 5 factual corrections applied; no rating changes.

### Policy updates
- **xAI / Grok — API:** ZDR label updated from "Enterprise Vault (functional)" to "Yes — ZDR-Enabled API" — May 12, 2026 Enterprise ToS formally names and defines the product. Deletion timeline: within 1 hour of inference or response delivery. Training prohibition now explicit in ToS.
- **Alibaba / Qwen — API:** Added caveat to location detail — May 29, 2026 Product ToS uses generic location language for Model Studio with no specific regional binding; specific endpoint guarantees remain in Qwen Cloud ZDR docs.
- **Nebius AI — API:** ZDR access method corrected — ToS specifies onboarding form or email (tokenfactory-support@nebius.com), not a self-serve UI toggle. Label updated from "self-serve, all tiers" to "onboarding form or email."

### Source gap fixes
- **Google Gemini App / AI Studio:** Source URL corrected from 404 (`ai.google.dev/gemini-api/docs/faq`) to Gemini Apps Privacy Hub (`support.google.com/gemini/answer/13594961`, last updated May 19, 2026). sourceDate updated to 2026-05-19.
- **SiliconFlow:** Source updated from Chinese-language privacy policy to English Terms of Service (`docs.siliconflow.com/en/legals/terms-of-service`) which explicitly restricts Interaction Data use. Training prohibition remains implicit only; Caution rating unchanged.

---

## v1.1.0 — 2026-06-01

**Schema refinements.** Separated API vs consumer surfaces into distinct entries. Rating system formalized with 5 tiers.

- **Dual-surface tracking**: Providers with separate API and consumer products (OpenAI, Anthropic, Google Gemini, xAI/Grok, Moonshot AI/Kimi, Zhipu AI/GLM, MiniMax, DeepSeek, Cursor, OpenCode, Wafer AI) split into distinct entries per surface
- **Rating system finalized**: 5-tier system formalized: Clean 🟢, Guarded 🟡, Caution 🟠, High Risk 🔴, Unverified ⚫
- **Incident flag 🚩 introduced**: Additive marker for confirmed security breaches, regulatory actions, or government bans

---

## v1.0.0 — 2026-05-27

**Initial release.** 22 provider families across 4 categories researched and documented (33 surfaces after dual-surface splits in v1.1).

### Providers added
- OpenAI (API + ChatGPT)
- Anthropic (API + Claude.ai)
- Google Gemini (Vertex AI / Paid API + Gemini App / AI Studio)
- xAI / Grok (API + Grok.com / X)
- Alibaba / Qwen (DashScope API)
- Moonshot AI / Kimi (API + Kimi App)
- Zhipu AI / GLM (BigModel China + Z.ai International)
- MiniMax (API + Hailuo AI)
- DeepSeek (API + Chat App)
- Xiaomi MiMo (Cloud API)
- Fireworks AI
- Together AI
- DeepInfra
- Nebius AI
- SiliconFlow
- Cursor (Privacy Mode ON + Privacy Mode OFF)
- OpenCode (Go tier + Zen free tier)
- HyperAgent
- Crof AI
- Wafer AI (Privacy tier + Standard)
- Neuralwatt
- CommandCode

### Research notes
- All data sourced from primary sources: official privacy policies, ToS, DPAs, API documentation
- Chinese providers assessed against PIPL (Personal Information Protection Law) framework
- DeepSeek rated High Risk 🔴🚩 based on: explicit China storage for all users, training on by default (API + consumer), January 2025 database breach (1M+ records), Korea PIPC corrective order (April 2025), government bans by NASA/DoD/Congress/Australia/Italy/Taiwan
- Alibaba/Qwen rated Guarded 🟡 as strongest Chinese provider — ZDR built-in baseline, training off, multi-region endpoints

---

*To add an entry: `[YYYY-MM-DD] ProviderName — description of policy change — source URL`*
