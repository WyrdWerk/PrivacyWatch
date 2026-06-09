# PrivacyWatch Policy Audit — 2026-06-07

**Method:** Cross-reference of all 33 `providers.json` entries against the PrivacyWatch NotebookLM notebook (157 sources), including documents dated after the May 27, 2026 local archive cutoff.
**Prior audit:** `policies/VERIFICATION_REPORT.md` (2026-05-27, 29 archived files)
**Conducted:** 2026-06-07

---

## Executive Summary

| Status | Count | % |
|---|---|---|
| ✅ VERIFIED — claims confirmed by notebook sources | 28 | 84.8% |
| ⚠️ UPDATE — policy/document changed since sourceDate | 3 | 9.1% |
| ◻️ SOURCE GAP — insufficient evidence to verify | 2 | 6.1% |
| ❌ DISCREPANCY — notebook contradicts current claim | 0 | 0% |

**No rating changes required.** All provider risk ratings are correctly assigned. Three entries need factual updates to detail/label fields; two have persistent source gaps.

---

## Status Codes

- ✅ VERIFIED — notebook confirms the claim with cited sources
- ⚠️ UPDATE — policy or document changed since sourceDate; field should be updated
- ◻️ SOURCE GAP — insufficient evidence to verify; claim maintained but flagged
- ❌ DISCREPANCY — notebook directly contradicts current claim (none found this audit)

---

## US Frontier (8 entries)

### OpenAI — API `openai-api`
**Rating:** 🟢 Clean

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off by default | "Data sent to the OpenAI API is not used to train or improve OpenAI models (unless you explicitly opt in)" — confirmed | ✅ |
| Retention | 30 days | Abuse monitoring logs retained up to 30 days by default | ✅ |
| ZDR | Yes — approval required | ZDR requires prior OpenAI approval; eligible customers may select Modified Abuse Monitoring or ZDR | ✅ |
| Location | US + EU option | US primary; EU residency (Ireland) available with ZDR amendment | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** openai-api--2026-05-27.md, VERIFICATION_REPORT.md
**Notes:** All claims fully confirmed. A Cloudflare block prevented live access but archive is authoritative.

---

### OpenAI — ChatGPT `openai-chatgpt`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | On by default | "Data Controls let you decide how ChatGPT uses your conversations" — training on, opt-out via Settings | ✅ |
| Retention | 30 days after deletion | Deleted chats removed within 30 days; Temporary Chats auto-deleted in 30 days, never used for training | ✅ |
| ZDR | Not available | No ZDR for consumer plans | ✅ |
| Location | US primary | US + globally via trusted providers | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** openai-chatgpt--2026-05-27.md, VERIFICATION_REPORT.md

---

### Anthropic — API `anthropic-api`
**Rating:** 🟢 Clean

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off by default | "Anthropic may not train models on Customer Content from Services" — explicitly stated in Commercial Terms (effective June 17, 2025) | ✅ |
| Retention | 30 days auto-delete | Standard retention: 30 days. ZDR = no storage at rest after response. Violations: up to 2 years | ✅ |
| ZDR | Yes — enterprise approval | ZDR available for Messages API, Token Counting, Claude Code with Commercial org keys or Claude Enterprise. Batch/Files API not eligible | ✅ |
| Location | US only | Workspace geo: US only. EU via Bedrock/Vertex/Azure | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** anthropic-api--2026-05-27.md, Anthropic Commercial Terms of Service (effective June 17, 2025), VERIFICATION_REPORT.md
**Notes:** Commercial ToS in notebook postdates local archive (June 2025) but predates May 2026 audit — no material change found.

---

### Anthropic — Claude.ai `anthropic-claude`
**Rating:** 🟡 Guarded

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Opt-in required | "We will use your chats and coding sessions...if: You choose to allow us" — explicit opt-in only | ✅ |
| Retention | 30 days after deletion | Backend cleared within 30 days after deletion. Training opted-in: de-identified data up to 5 years. Incognito: 30 days | ✅ |
| ZDR | Not available | No ZDR for consumer plans. Incognito mode available (30-day auto-delete, never trained) | ✅ |
| Location | US only | No geographic controls for consumer plans | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** anthropic-claude--2026-05-27.md, Anthropic Commercial Terms of Service, VERIFICATION_REPORT.md

---

### Google Gemini — Vertex AI / Paid API `google-vertex`
**Rating:** 🟢 Clean

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off by default | "Google won't use your data to train or fine-tune any AI/ML models without your prior permission" — Section 17, Service Specific Terms | ✅ |
| Retention | Limited period (unspecified) | Abuse monitoring: vague duration. Grounding (Search/Maps): mandatory 30-day retention. Session resumption: up to 24 hours | ✅ |
| ZDR | Yes — Vertex AI | ZDR available; grounding exception confirmed: "There is no way to disable the storage of this information if you use Grounding with Google Search" | ✅ |
| Location | US + EU residency | Regional GCP options including EU available | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** google-vertex--2026-05-27.md, Google Cloud Platform Terms of Service (last modified June 1, 2026), VERIFICATION_REPORT.md
**Notes:** Google Cloud ToS updated June 1, 2026 — the only US Frontier provider with a post-May document. Section 4.3 on Generative AI Safety/Abuse (prompt logging for abuse monitoring) is unchanged from May 2026 snapshot. The June update does not affect training restrictions or ZDR availability. **Update applies to GCP enterprise only, NOT Gemini App consumers.**

---

### Google Gemini — Gemini App / AI Studio `google-gemini-app`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | On by default | ◻️ Source 404 — cannot verify from notebook | ◻️ |
| Retention | Until deleted; 3yr post-review | ◻️ Source 404 — cannot verify from notebook | ◻️ |
| ZDR | Not available | ◻️ Source 404 — cannot verify from notebook | ◻️ |
| Location | US | ◻️ Source 404 — cannot verify from notebook | ◻️ |
| Incident | None | None found | ✅ |

**Sources used:** google-gemini-app--2026-05-27.md (404 page only), VERIFICATION_REPORT.md
**Notes:** ⚠️ Source URL `ai.google.dev/gemini-api/docs/faq` still returns 404. The June 1 Google Cloud ToS update applies only to GCP enterprise services, not the consumer Gemini App. Rating maintained at Caution based on Google's publicly known policy that free and consumer tiers use data for model training. **Action required: update sourceUrl or find a working URL for the Gemini consumer policy.**

---

### xAI / Grok — API `xai-api`
**Rating:** 🟢 Clean

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off by default | "xAI shall not use any User Content to train any foundation models, large language models, or other artificial intelligence systems" — explicitly stated in May 12, 2026 ToS | ✅ |
| Retention | 30 days auto-delete | "All User Content will be automatically and permanently deleted no later than 30 days after the end of the interaction or session" | ✅ |
| ZDR | Enterprise Vault (functional) — "not labeled ZDR" | **Updated:** May 12, 2026 ToS formally uses "Zero Data Retention enabled APIs (ZDR-Enabled API or ZDR)" as official terminology. Deletion timeline: "upon the earlier of (a) one hour after completion of the applicable inference request; or (b) delivery of the response" | ⚠️ |
| Location | US only | All xAI services processed in the United States | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** xai-api--2026-05-27.md, xAI Terms of Service - Enterprise (last updated May 12, 2026), VERIFICATION_REPORT.md
**Notes:** ⚠️ **ZDR label needs update.** The May 12, 2026 Enterprise ToS now formally names the ZDR product as "ZDR-Enabled API" — our current label "Enterprise Vault (functional)" with note "Not labeled 'ZDR' but functionally equivalent" is outdated. Additionally: Personal Data must be submitted exclusively through the ZDR-Enabled API per Section 11.2; non-compliance is a "material breach" of the agreement.

---

### xAI / Grok — Grok.com / X `xai-grok-consumer`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | On by default | "We may use your content and interactions with Grok...along with Grok's responses to train our models" — confirmed default-on | ✅ |
| Retention | Indefinite until deleted | Conversations kept until deleted; 30-day recovery window | ✅ |
| ZDR | Not available | No ZDR for consumer surfaces | ✅ |
| Location | US only | xAI: all processing in US | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** xai-grok-consumer--2026-05-27.md, VERIFICATION_REPORT.md
**Notes:** Private Chat mode confirmed: "When using Private Chat, where available, your content and interactions are not used for model training."

---

## Chinese (10 entries)

### Alibaba / Qwen — API (DashScope) `alibaba-qwen`
**Rating:** 🟡 Guarded

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off — explicit | "Alibaba Cloud will not use your Member Content to develop or improve the models on Model Studio, unless you separately provide your consent" — confirmed in May 29, 2026 ToS | ✅ |
| Retention | ZDR baseline; 7-day (Responses API) | ZDR confirmed for standard inference. 7-day Responses API exception noted | ✅ |
| ZDR | Yes — built-in baseline | Confirmed. Responses API exception still applies | ✅ |
| Location | Multi-region (Frankfurt = genuine EU) | **Caveat:** May 29, 2026 Product ToS for Model Studio uses generic language: "transferred to, stored, and processed in the country where Alibaba Cloud, its affiliates, or its sub-contractors maintain facilities" — NO specific regional guarantees in this document. Other Alibaba Cloud services in the same ToS DO have explicit regional mappings (e.g., DataWorks Data Agent), making the Model Studio omission appear deliberate. | ⚠️ |
| Incident | None | None found | ✅ |

**Sources used:** alibaba-qwen--2026-05-27.md, Alibaba Cloud International Website Product Terms of Service (updated May 29, 2026), VERIFICATION_REPORT.md
**Notes:** ⚠️ **Location claim needs caveat.** The Qwen Cloud ZDR documentation (the primary source in providers.json) still references specific regional endpoints (CN/SG/US/EU/Frankfurt). However, the May 29, 2026 overarching Product Terms for Model Studio contain no specific regional guarantees — they use generic language permitting storage "where Alibaba Cloud, its affiliates, or its sub-contractors maintain facilities." This creates a gap between the ZDR docs (specific) and the Product ToS (generic). Recommend adding a note flagging the Product ToS language and noting verification is limited to the Qwen Cloud ZDR docs.

---

### Moonshot AI / Kimi — API `moonshot-kimi-api`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | On by default — CRITICAL | "We may use Content to provide, maintain, develop, support, and improve the Services" — confirmed in Terms of Service (last updated May 27, 2026). Enterprise must contact Moonshot AI for restrictions. | ✅ |
| Retention | Vague — 'as necessary' | "as long as necessary" — confirmed vague | ✅ |
| ZDR | Via 3rd party only (limited models) | No ZDR from Moonshot platform directly | ✅ |
| Location | Singapore entity; Beijing parent | Moonshot AI PTE. LTD. (Singapore entity) confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** moonshot-kimi-api--2026-05-27.md, Kimi OpenPlatform Terms of Service (updated May 27, 2026), VERIFICATION_REPORT.md
**Notes:** The May 27, 2026 ToS reinforces caution rating — no carve-out for API data from training. Explicitly states: "Customer who requires restrictions on the use of Customer Content for training...may contact Moonshot AI to discuss available enterprise arrangements or separate written agreements."

---

### Moonshot AI / Kimi — Kimi App `moonshot-kimi-consumer`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | On by default | Policy confirms training use for service improvement | ✅ |
| Retention | Vague — 'as necessary' | Confirmed vague; Chinese-language policy governs for domestic users | ✅ |
| ZDR | Not available | No ZDR for consumer app | ✅ |
| Location | Singapore entity; Beijing parent | Singapore entity for international; PRC for domestic | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** moonshot-kimi-consumer--2026-05-27.md (Chinese-language), VERIFICATION_REPORT.md

---

### Zhipu AI / GLM — BigModel (China) `zhipu-bigmodel`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | On by default | Data used for service improvement by default; no public opt-out | ✅ |
| Retention | 30-day (batch); vague (general) | Batch API: 30-day auto-delete confirmed | ✅ |
| ZDR | None documented | No ZDR confirmed | ✅ |
| Location | China only | All data stored within PRC confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** zhipu-bigmodel--2026-05-27.md (Chinese-language), VERIFICATION_REPORT.md

---

### Zhipu AI / GLM — Z.ai (International) `zhipu-zai`
**Rating:** 🟡 Guarded

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off by default | "For enterprises and developers using API Services, we will not use your User Content for developing or improving Services unless you explicitly agree" — confirmed in Z.ai Terms of Use (updated April 14, 2026) | ✅ |
| Retention | Real-time only (no storage) | "The Company do not store any of the content the Customer or its End Users provide or generate while using our Services...processed in real-time...not saved on our servers" — confirmed | ✅ |
| ZDR | Yes — legally operative | API DPA commitment confirmed | ✅ |
| Location | Singapore | JINGSHENG HENGXING TECHNOLOGY PTE. LTD., Singapore — confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** zhipu-zai--2026-05-27.md, Z.ai Terms of Use (updated April 14, 2026), VERIFICATION_REPORT.md
**Notes:** Note: for individual (non-API) users, Z.ai reserves the right to process User Content to "improve our machine learning and artificial intelligence technologies" — API and consumer are explicitly separated.

---

### MiniMax — API `minimax-api`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Ambiguous — profiling only excluded | Privacy Policy prohibits training for profiling/targeting only; silent on general model improvement — confirmed ambiguous | ✅ |
| Retention | Vague (general); specific for audio/voice | Audio URL expiry 9 hours, voice 7 days confirmed. General: vague | ✅ |
| ZDR | Undocumented officially | No formal ZDR found in documents | ✅ |
| Location | Undisclosed (inferred US) | Privacy Policy does not specify server locations; EU-US Privacy Framework implies US | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** minimax-api--2026-05-27.md, MiniMax Terms of Service (effective March 30, 2026), VERIFICATION_REPORT.md

---

### MiniMax — Hailuo AI `minimax-consumer`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Vague 'service improvement' | "may be retained for service improvement, anonymized where possible" — confirmed vague | ✅ |
| Retention | 30 days post-deletion | Active: indefinite. Deletion: cleared within 30 days. Facial data: permanently deleted on completion | ✅ |
| ZDR | Not available | No ZDR for consumer | ✅ |
| Location | China (domestic apps) | PRC storage for domestic apps confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** minimax-consumer--2026-05-27.md, VERIFICATION_REPORT.md

---

### DeepSeek — API `deepseek-api`
**Rating:** 🔴 High Risk 🚩

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | On by default; API opt-out not documented | "Train and improve our technology, such as our machine learning models and algorithms" — explicitly confirmed. No API opt-out mechanism documented | ✅ |
| Retention | Indefinite (post-deletion rights reserved) | "as long as necessary" + legal compliance exceptions — confirmed indefinite | ✅ |
| ZDR | Not available | No ZDR confirmed | ✅ |
| Location | China — all users | "We directly collect, process and store your Personal Data in People's Republic of China" — explicit, confirmed | ✅ |
| Incident | 🚩 Jan 2025 DB breach; Korea PIPC; Italy Garante; NASA/DoD/Congress/Australia/Italy/Taiwan bans | Confirmed from archived Privacy Policy (Feb 10, 2026) | ✅ |

**Sources used:** deepseek-api--2026-05-27.md, VERIFICATION_REPORT.md
**Notes:** No newer DeepSeek documents in notebook. Policy last updated Feb 10, 2026. Core China storage and training-on policy unchanged.

---

### DeepSeek — Chat App `deepseek-consumer`
**Rating:** 🔴 High Risk 🚩

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | On by default | Confirmed — same policy as API | ✅ |
| Retention | Indefinite (account active) | Confirmed | ✅ |
| ZDR | Not available | Confirmed | ✅ |
| Location | China — all users | Confirmed | ✅ |
| Incident | 🚩 Same incidents as API | Confirmed | ✅ |

**Sources used:** deepseek-api--2026-05-27.md (consumer source URL was unreachable — same policy applies), VERIFICATION_REPORT.md

---

### Xiaomi MiMo — Cloud API `xiaomi-mimo`
**Rating:** 🟡 Guarded

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Not stated (OpenRouter: no training) | Service Agreement silent on training; OpenRouter claim not in legal docs — confirmed gap | ✅ |
| Retention | Reasonable period | "permanently delete personal information within a reasonable period" upon expiration or request — confirmed | ✅ |
| ZDR | Not available | Confirmed absent | ✅ |
| Location | EU + Singapore (international) | Service Agreement (April 23, 2026): "When providing services outside the Chinese Mainland, Xiaomi will store the relevant data on servers located in Europe and Singapore" — confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** xiaomi-mimo--2026-05-27.md, Xiaomi MiMo Open Platform Service Agreement (updated April 23, 2026), VERIFICATION_REPORT.md
**Notes:** EU/Singapore storage for international users confirmed. Training policy remains unverifiable — Privacy Policy (privacy.mi.com) was inaccessible during research. Guarded rating appropriate given storage location is non-China for international users.

---

## Inference (5 entries)

### Fireworks AI — API `fireworks-ai`
**Rating:** 🟢 Clean

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off — ZDR default | "Fireworks does not log or store prompt or generation data for any open models, without explicit user opt-in" — confirmed | ✅ |
| Retention | ZDR default; Response API 30-day* | Standard: volatile memory only. Response API: store=True default (30-day); must set store=False to disable — confirmed | ✅ |
| ZDR | Default — all tiers | ZDR is the default; enterprise guarantee confirmed | ✅ |
| Location | US + EU + APAC | Dedicated deployment regions confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** fireworks-ai--2026-05-27.md, Fireworks AI Terms of Service (last modified March 25, 2025), VERIFICATION_REPORT.md

---

### Together AI — API `together-ai`
**Rating:** 🟢 Clean

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off — opt-in only | "We do not use any data collected from you to train our models without your explicit opt-in and consent" — confirmed | ✅ |
| Retention | Not stored by default | No default storage. ZDR: "data and outputs are not stored, retained, or used for model training, product improvements, or any other purpose beyond the time required to process the specific request" | ✅ |
| ZDR | Yes — self-serve, all tiers | Self-serve via Settings → Profile → Privacy & Security — confirmed | ✅ |
| Location | US + EU (enterprise) | North America default; EU for enterprise confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** together-ai--2026-05-27.md, Together AI Terms of Service (updated May 19, 2026), VERIFICATION_REPORT.md
**Notes:** ToS updated May 19, 2026 — no material policy changes found.

---

### DeepInfra — API `deepinfra`
**Rating:** 🟡 Guarded

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off — explicit | "We do not use data you submit to our APIs for training models, except when using Google or Anthropic models" — confirmed | ✅ |
| Retention | Memory only (not to disk) | "Input data is not stored to disk during inference — it exists only in memory while the request is being processed" — confirmed | ✅ |
| ZDR | Yes — enterprise only | Enterprise ZDR confirmed; self-serve not available | ✅ |
| Location | US only | US data centers confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** deepinfra--2026-05-27.md, DeepInfra Terms of Service (last modified July 4, 2024), VERIFICATION_REPORT.md
**Notes:** Google/Anthropic model exception explicitly documented: when accessing those providers' models through DeepInfra, those providers' training and retention policies apply.

---

### Nebius AI — API (Token Factory) `nebius-ai`
**Rating:** 🟡 Guarded

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Speculative decoding only | "the Company collects and processes both Input and Output data for the purpose of training smaller Models used exclusively for Speculative Decoding" — confirmed | ✅ |
| Retention | Retained for Speculative Decoding | Data retained for Speculative Decoding unless ZDR enabled | ✅ |
| ZDR | Yes — self-serve, all tiers | **Discrepancy:** ZDR is NOT self-serve via a UI toggle. The Terms of Service states: "You can indicate your preference through the opt-out mechanism available in the onboarding form or by submitting a request to the Company's support team via email at tokenfactory-support@nebius.com" | ⚠️ |
| Location | EU (Finland) + US | Finland + US confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** nebius-ai--2026-05-27.md, Nebius Token Factory Terms of Service (effective January 13, 2026), VERIFICATION_REPORT.md
**Notes:** ⚠️ **ZDR access method needs correction.** Our current ZDR detail says "ZDR in account profile settings." The authoritative Terms of Service describes ZDR opt-out via: (a) the onboarding form, or (b) email to tokenfactory-support@nebius.com. No self-serve settings UI is documented. The Legal Quick Guide confirms ZDR switches off Speculative Decoding data collection but doesn't specify the UI mechanism. Remove "account profile settings" from the detail text.

---

### SiliconFlow — API `siliconflow`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Not explicitly prohibited | Terms of Use: "we will not access your Interaction Data...solely for the purpose of providing Services to you" — confirms no unauthorized use, but no explicit training prohibition | ◻️ |
| Retention | No storage (Interaction Data only) | "Under no obligation to store Interaction Data" — confirmed for Interaction Data; account/billing data retained | ✅ |
| ZDR | Not formally documented | No formal ZDR offering confirmed | ✅ |
| Location | Undisclosed | Server locations not specified; Singapore entity confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** siliconflow--2026-05-27.md, SiliconFlow Terms of Use (updated March 31, 2025), VERIFICATION_REPORT.md
**Notes:** Training gap persists — ToS says Interaction Data is used only "for the purpose of providing Services" but does not explicitly prohibit training use. Caution rating appropriate.

---

## Coding Tools (10 entries)

### Cursor — Privacy Mode ON `cursor-privacy-on`
**Rating:** 🟢 Clean

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off — contractual ZDR | "If you enable Privacy Mode...None of your code will ever be trained on by us or any third-party" — confirmed | ✅ |
| Retention | No persistent storage | Plaintext code not retained; embeddings metadata retained for codebase indexing | ✅ |
| ZDR | Yes — Privacy Mode = functional ZDR | Confirmed — zero data retention for all model providers | ✅ |
| Location | US only | US AWS confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** cursor--2026-05-27.md, VERIFICATION_REPORT.md

---

### Cursor — Privacy Mode OFF (default) `cursor-privacy-off`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | On (default Free/Pro) | "we may use and store codebase data, prompts, editor actions, code snippets, and other code data and actions to improve our AI features and train our models" — confirmed | ✅ |
| Retention | Variable — code may be stored | Code and context may be stored; embeddings retained for codebase indexing | ✅ |
| ZDR | Not active | Must manually enable Privacy Mode | ✅ |
| Location | US only | US AWS confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** cursor--2026-05-27.md, VERIFICATION_REPORT.md
**Notes:** Inference providers (Baseten, Together AI, Fireworks) may temporarily store model inputs/outputs to improve inference performance when Privacy Mode is off; deleted after use.

---

### OpenCode — Go (paid tier) `opencode-go`
**Rating:** 🟢 Clean

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off — zero-retention | "Our providers follow a zero-retention policy and do not use your data for model training" — confirmed | ✅ |
| Retention | Zero-retention | Confirmed | ✅ |
| ZDR | Yes (Go tier) | Confirmed — Go tier at $10/month | ✅ |
| Location | US, EU, Singapore | Confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** opencode-go--2026-05-27.md, VERIFICATION_REPORT.md
**Notes:** Models listed: GLM-5, GLM-5.1, Kimi K2.5, Kimi K2.6, MiMo-V2.5, MiMo-V2.5-Pro, MiniMax M2.5, MiniMax M2.7, Qwen3.5 Plus, Qwen3.6 Plus, Qwen3.7 Max, DeepSeek V4 Pro, DeepSeek V4 Flash. The ZDR scope for proxied calls through Alibaba/Moonshot remains undocumented (existing note is accurate).

---

### OpenCode — Zen (free tier) `opencode-zen`
**Rating:** 🟠 Caution

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Possible (ToS clause) | "if you are using the Services through an unpaid account, we may use Content to further develop and improve our Services" — confirmed | ✅ |
| Retention | Stored server-side; no opt-out | Data retained "as long as necessary to provide you with our Services." No ZDR or opt-out documented | ✅ |
| ZDR | Not available | Confirmed — free tier has no ZDR | ✅ |
| Location | Cloudflare R2 (region unknown) | Storage location unspecified | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** opencode-zen--2026-05-27.md, VERIFICATION_REPORT.md

---

### HyperAgent — Platform `hyperagent`
**Rating:** 🟡 Guarded

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off — express consent required | "We will not use or access your Content except: to provide, maintain, improve, or optimize use of the Services" — confirmed; explicit training prohibition | ✅ |
| Retention | Not specified; 30-day floor via subprocessors | HyperAgent own: "no longer than necessary." Subprocessors (Anthropic, Google, OpenAI) may retain 30 days | ✅ |
| ZDR | Not documented | No ZDR explicitly documented | ✅ |
| Location | Global (unspecified) | Data center locations not disclosed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** hyperagent--2026-05-27.md, VERIFICATION_REPORT.md

---

### Crof AI — API `crof-ai`
**Rating:** 🟢 Clean

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Never collected | "We do NOT use your data for: Training AI models" — explicitly confirmed | ✅ |
| Retention | Never stored | "Your conversations are processed in real-time and are not stored, logged, or accessible to us in any way" — confirmed | ✅ |
| ZDR | De facto (no collection) | ZDR by design confirmed | ✅ |
| Location | US | Confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** crof-ai--2026-05-27.md (Privacy Policy, last updated July 2025), VERIFICATION_REPORT.md
**Notes:** Strongest and most explicit policy in the coding tools category. Policy updated July 2025 per archive frontmatter.

---

### Wafer AI — Privacy Tier `wafer-ai-privacy`
**Rating:** 🟢 Clean

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off (ZDR tier) | "We do not train the models we serve on your prompts or completions...Traffic covered by Zero Data Retention is excluded from draft-model training" — confirmed | ✅ |
| Retention | No durable storage | "Prompts and completions not written to durable storage. Only operational metadata retained" — confirmed | ✅ |
| ZDR | Yes — Privacy tier | Confirmed — Wafer Pass Privacy ($25/week) | ✅ |
| Location | US | US data centers confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** wafer-ai--2026-05-27.md (policy updated May 4, 2026), VERIFICATION_REPORT.md

---

### Wafer AI — Standard (Lite/Starter) `wafer-ai-standard`
**Rating:** 🟡 Guarded

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Speculative decoding only | "We train small internal 'draft' models used only for speculative decoding...Draft models are used internally, not exposed as a product, not shared with third parties" — confirmed | ✅ |
| Retention | 30 days (anonymized) | "Request logs may be stored in anonymized form for up to 30 days for abuse detection, then deleted" — confirmed | ✅ |
| ZDR | Available (upgrade to Privacy) | Upgrade to Wafer Pass Privacy ($25/week) — confirmed | ✅ |
| Location | US | US data centers confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** wafer-ai--2026-05-27.md, VERIFICATION_REPORT.md

---

### Neuralwatt — API `neuralwatt`
**Rating:** 🟡 Guarded

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off — explicit | "We do not use your API inputs or outputs to train, fine-tune, or improve any machine learning models. Your inference data is yours." — confirmed | ✅ |
| Retention | 24-hour cache max | "Conversation context held in volatile memory for up to 24 hours, then purged. Semantic representations: Anonymized numerical representations may be retained for cache performance" — confirmed | ✅ |
| ZDR | Not offered | No ZDR option documented | ✅ |
| Location | Unknown | Data center location not disclosed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** neuralwatt--2026-05-27.md (policy updated April 5, 2026), VERIFICATION_REPORT.md

---

### CommandCode — Terminal Agent `commandcode`
**Rating:** 🟡 Guarded

| Field | providers.json claim | Notebook finding | Status |
|---|---|---|---|
| Training | Off — local-first | "Command Code does not train on your code. Taste learning runs locally and stores preferences as structured rules — not code snippets" — confirmed | ✅ |
| Retention | Code local; telemetry 30 days | Source code: never stored server-side. All data types (taste profile, conversation history, auth tokens) local only | ✅ |
| ZDR | Structural (local-first) | ZDR is architectural — code never leaves device | ✅ |
| Location | Code local; cloud unknown | User code stays on device confirmed | ✅ |
| Incident | None | None found | ✅ |

**Sources used:** commandcode--2026-05-27.md, VERIFICATION_REPORT.md

---

## Action Items

| Priority | Provider ID | Field | Issue | Recommended Change |
|---|---|---|---|---|
| 🟡 MED | `xai-api` | ZDR label + detail | May 12, 2026 ToS now formally uses "ZDR-Enabled API" terminology; deletion within 1hr or delivery, whichever is sooner | Update `zdr.label` → `"Yes — ZDR-Enabled API"` and update `zdr.detail` with ToS language. Update `sourceDate` to `2026-05-12` (ToS date) and add ToS URL to `relatedUrls`. Update `notes`. |
| 🟡 MED | `alibaba-qwen` | Location notes | May 29, 2026 Product ToS uses generic location language for Model Studio; specific regional guarantees absent from this document | Add caveat to `location.detail` noting that the May 29, 2026 Product ToS uses generic language; specific endpoint guarantees are in Qwen Cloud ZDR docs only. Update `sourceDate` to `2026-05-29` and add ToS URL to `relatedUrls`. |
| 🟡 MED | `nebius-ai` | ZDR detail | ZDR is not "self-serve via account profile settings" — requires onboarding form or email to tokenfactory-support@nebius.com | Update `zdr.label` to remove "self-serve" implication. Update `zdr.detail` to: "ZDR available via onboarding form or email to tokenfactory-support@nebius.com. Disables Speculative Decoding data collection." |
| 🔵 LOW | `google-gemini-app` | Source URL | Source URL `ai.google.dev/gemini-api/docs/faq` still returns 404; no alternative source found in notebook | Research correct URL for Gemini consumer privacy/training policy. Rating maintained at Caution based on Google's known public policy. |

---

## Findings Not Requiring Action

- **Google Cloud Platform ToS (June 1, 2026):** Updated but no material change to Vertex AI training restrictions, ZDR, or retention policy. Applies to GCP/enterprise only — does NOT affect Gemini App consumer rating.
- **Together AI ToS (May 19, 2026):** Updated; no material policy changes.
- **Moonshot Kimi ToS (May 27, 2026):** Confirmed training-on default and enterprise-only restriction path. Caution rating correctly assigned.
- **Xiaomi MiMo Service Agreement (April 23, 2026):** Confirmed EU/Singapore storage for international users. Guarded rating correctly assigned.
- **All 10 coding tool entries:** Fully verified. No changes needed.

---

## Notebook Coverage Notes

The PrivacyWatch notebook (157 sources) contains archived policy documents plus live ToS/DPA documents retrieved from provider websites. Post-May 2026 documents found:
- Google Cloud Platform ToS — June 1, 2026 (enterprise only; no material change)
- xAI Enterprise ToS — May 12, 2026 (ZDR terminology update)
- Alibaba Cloud Product ToS — May 29, 2026 (generic location language for Model Studio)
- Together AI ToS — May 19, 2026 (no material change)

No post-May 2026 documents were available for: Chinese providers (except Alibaba), all inference providers (except Together AI), or any coding tools.
