# Provider backlog — OpenRouter curated ToS list (2026-09-13)


> Manually reconciled snapshot (not script output): the dedupe script at PR head
> reports 34 covered / 47 new because it does not model URL aliases — Xiaomi's
> listed URL is a variant of the existing `xiaomi-mimo` row, and BFL's list URL
> differs from the API-terms URL actually cited in the row. Final arithmetic is
> unaffected: 45 remaining after batch 1.
Source: OpenRouter provider-selection docs list, deduplicated against
`providers.json` by sourceUrl (`scripts/dedupe-openrouter-list.mjs`).

- **81 entries submitted → 26 already covered** (same sourceUrl tracked), 1 URL
  variant duplicate (Xiaomi — same document as the existing `xiaomi-mimo` row),
  **54 new families**.
- **Batch 1 (9 providers) landed in v1.4.0**: StepFun, Baidu Qianfan, ByteDance
  Seed (BytePlus), Tencent Cloud, Upstage, Meta (Model API), Deepgram, Voyage AI,
  Black Forest Labs.
- Batches 2 (9) and 3 (13) landed in v1.5.0 (feat/provider-batch-2-3). Remaining 23 below, grouped into research batches. One batch ≈ one PR.

## Batch 2 — cloud / inference platforms (9) — ✅ landed in v1.5.0

| Provider | ToS URL |
|---|---|
| Modal | https://modal.com/legal/terms |
| Baseten | https://www.baseten.co/terms-and-conditions |
| CoreWeave | https://docs.coreweave.com/policies/terms-of-service |
| DigitalOcean (GenAI) | https://www.digitalocean.com/legal/terms-of-service-agreement |
| Crusoe (Managed Inference) | https://legal.crusoe.ai/open-router#managed-inference-tos-open-router |
| io.net | https://io.net/terms |
| GMICloud | https://www.gmicloud.ai/terms-and-conditions |
| AtlasCloud | https://www.atlascloud.ai/privacy |
| NVIDIA (API Catalog) | https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf |

## Batch 3 — model labs & specialists (13) — ✅ landed in v1.5.0

| Provider | ToS URL |
|---|---|
| Reka AI | https://reka.ai/legal/terms-of-use |
| Thinking Machines (free research API) | https://thinkingmachines.ai/legal/tml-free-research-api-tier-terms-of-service.pdf |
| Inception Labs | https://www.inceptionlabs.ai/terms |
| Sakana AI | https://console.sakana.ai/terms-of-service |
| Poolside | http://poolside.ai/legal |
| Relace | https://www.relace.ai/terms-of-use |
| Decart | https://cogito.decart.ai/legal/terms |
| Liquid AI | https://www.liquid.ai/terms-conditions |
| Runway | https://runwayml.com/terms-of-use |
| Krea | https://www.krea.ai/terms |
| HeyGen | https://www.heygen.com/terms |
| Fish Audio | https://fish.audio/terms |
| Sourceful | https://www.sourceful.com/legal/spring-terms-of-use |

## Batch 4 — discount / community compute (20)

| Provider | ToS URL |
|---|---|
| Chutes | https://chutes.ai/tos |
| Venice | https://venice.ai/legal/tos |
| Mancer | https://mancer.tech/terms |
| NextBit | https://www.nextbit256.com/docs/terms-of-service |
| AkashML | https://akashml.com/terms |
| Phala (Redpill) | https://redpill.ai/terms |
| inference.net | https://inference.net/terms-of-service |
| NovitaAI | https://novita.ai/legal/terms-of-service |
| Friendli | https://friendli.ai/terms-of-service |
| Parasail | https://parasail.io/legal/terms-of-service |
| OpenInference | https://www.openinference.ai/terms |
| Ionstream | https://ionstream.ai/terms-and-conditions/ |
| Darkbloom | https://www.darkbloom.dev/terms.html |
| Sail Research | https://www.sailresearch.com/terms |
| Perceptron | https://www.perceptron.inc/terms-of-use |
| Inceptron | https://www.inceptron.io/termsofservice |
| DekaLLM (Cloudeka) | https://docs.cloudeka.ai/service-portal-ai/end-user-license-agreement |
| StreamLake | https://www.streamlake.ai/document/DOC/mgkchnd89grpt1961fw |
| AionLabs | https://www.aionlabs.ai/terms/ |
| MARA | https://www.mara.com/mara-legals/ai-policies#cloud-toc |

## Batch 5 — misc (3)

| Provider | ToS URL |
|---|---|
| Nex AGI | https://api.nex-agi.cn/privacy-policy |
| ModelRun (by Modular) | https://www.modular.com/legal/terms |
| Morph | https://www.morphllm.com/privacy/tos |

## Research notes for whoever picks up a batch

- Use the batch's ToS URLs as primary sources; quote operative language; write
  "silent" where the terms don't address a field — never infer from industry norms.
- A few entries are PDFs (Thinking Machines, NVIDIA) or privacy-policy-only
  (AtlasCloud, Nex AGI, Poolside http) — fetch what's fetchable and mark the row
  `unverified` where evidence is thin.
- Record `sourceDate` as the research date, and distinguish observation dates from
  the policy's own effective dates.
