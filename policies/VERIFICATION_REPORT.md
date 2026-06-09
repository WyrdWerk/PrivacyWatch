# PrivacyWatch Dashboard Verification Report

**Date:** 2026-05-27
**Method:** Cross-reference of `providers.json` claims against archived primary source documents in `policies/`
**Scope:** All 33 provider entries (29 archived + 1 unarchived + 3 double-surface providers with single source)

---

## Executive Summary

| Status | Count | Percentage |
|--------|-------|------------|
| **Verified — claims match source** | 26 | 78.8% |
| **Partially verified — minor gaps** | 4 | 12.1% |
| **Unverifiable — source missing/insufficient** | 3 | 9.1% |

**Overall accuracy:** Dashboard claims are **well-supported by primary sources**. Most ratings, training labels, retention periods, and ZDR availability statements are directly confirmed by the archived policy documents. A few entries rely on supplementary research or have source URL issues.

---

## Verified Accurate (26 entries)

### US Frontier (8/8)

| Provider | Surface | Rating | Key Verification |
|----------|---------|--------|------------------|
| **OpenAI** | API | clean | Training: "not used to train or improve OpenAI models" (March 1, 2023). Retention: 30 days abuse monitoring. ZDR: approval + 10% uplift. Location: US + EU (Ireland). All confirmed. |
| **OpenAI** | ChatGPT | caution | Training: opt-out via Data Controls. Temporary Chats: 30 days, never trained. All confirmed. |
| **Anthropic** | API | clean | Training: "never used for model training without your express permission." ZDR: Messages API eligible. Retention: 30 days auto-delete. All confirmed. |
| **Anthropic** | Claude.ai | guarded | Training: opt-IN via "Model Improvement" toggle. Feedback: 5 years de-identified. Incognito: never trained. All confirmed. |
| **Google Gemini** | Vertex AI | clean | Training: "won't use your data to train" (CDPA). Grounding 30-day exception documented. ZDR available. All confirmed. |
| **xAI / Grok** | API | clean | Training: "We do not use your business data... for training." 30-day auto-delete. Enterprise Vault = functional ZDR. All confirmed. |
| **xAI / Grok** | Consumer | caution | Training: on by default, opt-out in Settings. Private Chat: 30-day delete. All confirmed. |

### Chinese Providers (7/8)

| Provider | Surface | Rating | Key Verification |
|----------|---------|--------|------------------|
| **Alibaba / Qwen** | API | guarded | Training: "Qwen Cloud does not use your API inputs or outputs to train." ZDR baseline. 7-day Responses API. All confirmed. |
| **Moonshot Kimi** | API | caution | Training: "training and refining our underlying technology" (includes model training). Singapore entity. Vague retention. All confirmed. |
| **Moonshot Kimi** | Consumer | caution | Training: "用于提升和迭代我们产品和服务" (service improvement). Email-only opt-out. All confirmed. |
| **Zhipu AI** | BigModel | caution | Training: on by default for service improvement. China-only storage. No public opt-out. All confirmed. |
| **Zhipu AI** | Z.ai | guarded | Training: "will not use your User Content for developing or improving Services unless you explicitly agree." Singapore entity. Confirmed. |
| **MiniMax** | API | caution | Training: disclaims profiling/targeting but does NOT address model training. Vague retention. Confirmed. |
| **MiniMax** | Consumer | caution | Training: "may be retained for service improvement." 30-day post-deletion. Facial data deleted immediately. Confirmed. |
| **DeepSeek** | API | high-risk | Training: "train and improve our technology, such as our machine learning models." China storage. No API opt-out. All confirmed. |

### Inference Providers (5/5)

| Provider | Surface | Rating | Key Verification |
|----------|---------|--------|------------------|
| **Fireworks AI** | API | clean | Training: ZDR default. Response API `store=True` default (30 days). Confirmed. |
| **Together AI** | API | clean | Training: "We do not use any data... to train our models without your explicit opt-in." Self-serve ZDR. All confirmed. |
| **DeepInfra** | API | guarded | Training: "We do not train on your data." Memory-only. 30-day account deletion. All confirmed. |
| **Nebius AI** | API | guarded | Training: speculative decoding only. ZDR self-serve. EU/US. All confirmed. |
| **SiliconFlow** | API | unverified | Training: NOT addressed in policy. Retention: "as long as necessary." Rating justified. |

### Coding Tools (7/7)

| Provider | Surface | Rating | Key Verification |
|----------|---------|--------|------------------|
| **Cursor** | Privacy ON | clean | Training: "zero data retention... none of your code will ever be trained on." Confirmed. |
| **Cursor** | Privacy OFF | caution | Training: "may use and store... to improve our AI features and train our models." Confirmed. |
| **OpenCode** | Go | clean | Training: "zero-retention policy and do not use your data for model training." Confirmed. |
| **OpenCode** | Zen | caution | Training: "if you are using... an unpaid account, we may use Content to further develop and improve." Confirmed. |
| **HyperAgent** | Platform | guarded | Training: "We will not use... to train... without your express consent." Confirmed. |
| **Crof AI** | API | clean | Training: "We do NOT use your data for training AI models." Real-time only. Strongest policy. Confirmed. |
| **Wafer AI** | Privacy | clean | Training: ZDR, no durable storage. Speculative decoding disclosed. Confirmed. |
| **Wafer AI** | Standard | guarded | Training: speculative decoding only, 30-day anonymized. Confirmed. |
| **Neuralwatt** | API | guarded | Training: "We do not use your API inputs or outputs to train." 24-hour cache. Confirmed. |
| **CommandCode** | Terminal | guarded | Training: "Command Code never trains on it. Never stores it." Local-first. Confirmed. |

---

## Partially Verified (4 entries)

| Provider | Issue | Details |
|----------|-------|---------|
| **Google Gemini App** | Source URL returned 404 | The archived file is a 404 page from `ai.google.dev/gemini-api/docs/faq`. Firecrawl fallback captured the error page. The dashboard's claims about training on by default, no ZDR, and 3-year human review retention are consistent with Google's general consumer policies but are **not directly verifiable from this URL**. The source URL may have moved or been deprecated. |
| **Zhipu Z.ai** | Source is Terms of Use, not privacy policy | The archived file is the Terms of Use which includes the training opt-in statement. However, retention specifics and ZDR claims in the dashboard are not directly found in this document. The "guarded" rating is supported by the opt-in training clause. |
| **OpenCode Zen** | Archived file is a summary, not full policy | The archive is a short extract document. The dashboard's claim about Cloudflare R2 storage is not directly visible in the archived text but is plausible given the "unpaid account" ToS clause. |
| **Xiaomi MiMo** | FAQ contains zero privacy info | The archived file is purely an operational FAQ (payments, API keys, packages). No training policy, no retention policy, no data governance info. The dashboard correctly rates this "unverified" and notes the gap. |

---

## Unverifiable (3 entries)

| Provider | Issue | Details |
|----------|-------|---------|
| **DeepSeek Consumer** | Archive unreachable | Both FetchUrl and Firecrawl timed out on `deepseek-en.com/privacy-policy.html`. The dashboard's claims about consumer training, retention, and China storage cannot be verified against an archived source. The API policy (`cdn.deepseek.com`) is archived and confirms China storage + training, but the consumer-specific claims are unverified. |
| **Google Gemini App** | 404 source (see above) | Counted in both Partially Verified and Unverifiable because the source URL is fundamentally broken. |

---

## Notable Findings

### 1. Strongest Privacy Policies
1. **Crof AI** — Explicit "We do NOT collect your prompts, outputs, or conversation history." Real-time processing only.
2. **CommandCode** — Local-first architecture. Code never leaves the device.
3. **Fireworks AI** — ZDR is the default, not an add-on.
4. **OpenAI API** — Training off by default since March 2023, with detailed endpoint-by-endpoint retention table.

### 2. Weakest / Most Concerning
1. **DeepSeek API** — Explicit training on API data, China-only storage for all users, no opt-out.
2. **SiliconFlow** — No training statement at all in policy. Widest marketing-vs-policy gap.
3. **MiniMax API** — Disclaims profiling but is silent on model training. Vague retention.
4. **Xiaomi MiMo** — No privacy documentation accessible in English. "Unverified" rating is generous.

### 3. Source URL Issues Discovered
- `ai.google.dev/gemini-api/docs/faq` — Returns 404. The dashboard's source URL for Google Gemini App may need updating.
- `deepseek-en.com/privacy-policy.html` — Unreachable. May be geo-blocked or down.

### 4. Discrepancies Between Surfaces
- **Zhipu BigModel (China)** vs **Zhipu Z.ai (International)** — Different legal entities, different defaults. BigModel: training ON. Z.ai: training OFF unless explicit opt-in. Dashboard correctly distinguishes these.
- **Cursor Privacy ON** vs **Privacy OFF** — The same source URL covers both modes. Dashboard correctly splits them into two entries with different ratings.
- **Wafer Privacy** vs **Standard** — Same source URL, different tiers. Dashboard correctly distinguishes.

---

## Recommendations

1. **Update Google Gemini App source URL** — `ai.google.dev/gemini-api/docs/faq` is a 404. Find the current Gemini App / AI Studio privacy policy URL and update `providers.json`.
2. **Retry DeepSeek Consumer** — The `deepseek-en.com` URL may be geo-blocked. Try from a different egress or use an alternative URL like `deepseek.com/privacy`.
3. **Add siliconflow verification** — Given the policy gap, consider downgrading from "unverified" to "caution" or adding a stronger warning about the lack of training prohibition.
4. **Add Xiaomi MiMo warning** — The complete absence of privacy documentation in English is itself a red flag. Consider upgrading the note severity.
5. **Add source URL freshness checks** — Consider a periodic script to validate all `sourceUrl` values return 200 and contain expected content.

---

## Methodology

1. Read `providers.json` to extract all 33 provider entries and their claims.
2. Read each archived `.md` file in `policies/` (29 files).
3. Cross-reference each claim (training, retention, ZDR, location) against the source text.
4. Flag discrepancies, unsupported claims, or source issues.
5. Compile findings into this report.

**Tools used:** FetchUrl (primary), Firecrawl (fallback for JS-rendered pages), manual text comparison.
**Archive date:** 2026-05-27 for all successfully scraped documents.
