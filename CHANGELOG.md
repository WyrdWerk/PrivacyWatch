# Changelog

All policy changes, new providers, and corrections are logged here.
Format: `[YYYY-MM-DD] Provider — what changed — source`

## v1.8.0 — 2026-09-30

**Chinese providers re-verified against live sources (10 rows)** and given structured fields with verbatim evidence (coverage 18/97).

Rating changes:
- Moonshot Kimi App — **Caution → High Risk.** Privacy Policy v2 (effective 2026-08-31) names the Beijing entity and PRC-only storage; content is used for model training unless you ask customer service to stop (with identity verification). May 2025: named by a Chinese government notice among 35 apps collecting personal data unrelated to their function (incident flag added).
- Zhipu BigModel (China) — **Caution → High Risk.** Sep 2026 User Agreement allows use of service data unless otherwise agreed, anonymized data for training without consent, and a perpetual licence; China-only.

Corrections:
- DeepSeek API — the Open Platform Terms (effective 2026-04-29) are a Specific Agreement to the general Terms of Use, so the §4.3 training clause and its opt-out ("Improve the model for everyone" toggle, or privacy@deepseek.com) apply to the API. Retention is account lifetime, not indefinite. Incidents now itemized (7 confirmed).
- DeepSeek App — source URLs moved from the dead deepseek-en.com mirror to cdn.deepseek.com.
- MiniMax API — ToS §3 allows use of input and output "to provide, maintain, develop, and improve our Services" (was "silent"); US storage is stated, not inferred. Rating unchanged (improvement language, not explicit training).
- MiniMax Hailuo — operator is Nanonoble Pte. Ltd. (Singapore); earlier "anonymized", "30 days post-deletion" and "China/PIPL" claims were not supported by the policy.
- Moonshot Kimi API — ToS (Jul 2026) permits training unless agreed in writing, while the help FAQ says API data is never trained on: recorded as `conflicting`. Enterprise ZDR now offered directly. The Sep 2026 Anthropic routing allegation is recorded as unconfirmed.
- Alibaba Qwen — the ZDR page cited earlier now redirects to a page without a ZDR statement; Model Studio stores call data in-region with no stated duration. Rating kept at Guarded (training off, public DPA, SOC 2 Type 2).
- Xiaomi MiMo — international data hosted in the Netherlands and Singapore; international privacy policy URL; Service Agreement dated 2026-07-07.
- Zhipu Z.ai — individual-user retention is "as long as you have an account".

The US Entity List designation of Zhipu (Jan 2025) is noted in both Zhipu rows but is not treated as a privacy incident (export control, not a data event).

---

## v1.7.0 — 2026-09-30

**Structured fields (v2 pilot).** Optional machine-readable fields alongside the existing text: `training.default`/`optOut`, `retention.kind`/`days`, `zdr.access`, `location.regions`, `compliance` (DPA, SOC 2, HIPAA BAA), `incidents[]`, and `evidence[]` (URL + verbatim quote + retrieval date). Spec: [docs/plans/2026-09-30-schema-v2.md](docs/plans/2026-09-30-schema-v2.md). `npm run validate` enforces the vocabularies and evidence rules and reports coverage (8/97).

**US Frontier re-verified against live sources (8 rows).** Corrections:
- Anthropic Claude.ai — **Guarded → Caution.** Training is no longer opt-in only: the Privacy Policy (effective 2026-09-10) trains on Inputs/Outputs "unless you opt out"; safety-flagged chats are used regardless. Retention detail adds 2-year flagged-chat and 7-year safety-score retention.
- Anthropic API — storage is US, but inference may run globally by default (US-only inference at 1.1x). Anthropic is processor for Microsoft Foundry.
- OpenAI API — 10 residency regions + global default; the 10% uplift applies to data-residency endpoints, not ZDR. Incident flag added: Nov 2025 Mixpanel vendor breach (account profile data).
- OpenAI ChatGPT — incident flag added (Mar 2023 breach, Mar 2023 Italy ban, Dec 2024 Garante fine later annulled).
- Google Vertex — retention exceptions documented (90-day abuse flags, 3-day Search grounding, Interactions API storage); multi-region.
- Google Gemini App — retention is 18-month auto-delete by default (72h with Keep Activity off; 3 years if human-reviewed), not "until deleted"; location unspecified.
- xAI API — default endpoint may route between regions (US-only via `us.api.x.ai`); ZDR now self-serve.
- xAI Grok consumer — incident flag added (Irish DPC actions, Aug 2025 shared-chat indexing, Jan 2026 Indonesia/Malaysia blocks); location unspecified.

x.ai and openai.com/help.openai.com block automated fetches; Grok consumer and ChatGPT evidence uses the 2026-05-27 archived snapshots (dated accordingly) and those rows keep their earlier `sourceDate`.

---

## v1.6.1 — 2026-09-15

**Light mode default.** WyrdWerk cream/ink/teal palette is now the default theme. Dark mode remains available via the header toggle (`localStorage`).

**Rating legend.** Caution now includes opaque/silent public pages after a live check (GMICloud, AtlasCloud). That is not a finding that they train. Unverified is reserved for documents that exist but never mention API inputs/outputs (Ionstream).

**Full 97-surface audit.** Pass 3 corrected Unverified rows that had training/improvement language in **privacy policies or later ToS sections**, not only the first ToS page: CoreWeave → Caution (PP inputs/outputs + AI/ML), NVIDIA API Catalog → High Risk (§3.3(iv) User Content including AI models), io.net → High Risk (§9 non-confidential UGC), Modular → Caution (§4.2 perpetual Derivative Data), DigitalOcean/GMICloud/AtlasCloud → Caution (vague or silent). Ionstream remains Unverified. Notes: [policies/AUDIT_2026-09-15.md](policies/AUDIT_2026-09-15.md).

**Provider logos from Logo.dev.** Local 64px PNGs for all 86 families in `assets/logos/` (`npm run logos`). The site does not call img.logo.dev in the browser.

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
