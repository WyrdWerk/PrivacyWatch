# Changelog

All policy changes, new providers, and corrections are logged here.
Format: `[YYYY-MM-DD] Provider — what changed — source`

---

## v1.3.3 — 2026-06-08

**Custom domain canonical URLs.** Point SEO metadata, sitemap, and robots at `policywatch.wyrdwerk.com`. Added README custom-domain setup guide and `npm run deploy:legacy-redirect` for the old `modelwatch.pages.dev` URL.

---

## v1.3.2 — 2026-06-08

**Pages project migration.** Created Cloudflare Pages project `policywatch` and pointed deploy/canonical URLs at `policywatch-8j7.pages.dev`. Bare `policywatch.pages.dev` is unavailable; `modelwatch.pages.dev` now redirects to the new deployment.

---

## v1.3.1 — 2026-06-08

**PolicyWatch branding rename.** User-facing product name updated from ModelWatch to PolicyWatch across UI, public data metadata, schema title, and internal policy docs. Infra-dependent targets (`modelwatch.pages.dev`, GitHub repo slug, Cloudflare Pages project name) intentionally unchanged until new targets are live.

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
