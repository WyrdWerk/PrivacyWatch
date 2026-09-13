# ByteDance — Seed / API (BytePlus ModelArk) (research note, 2026-09-13)

Primary source: https://docs.byteplus.com/en/docs/legal/docs-terms-of-service

## Findings
- Training: "Without the customer's prior authorization, BytePlus ModelArk... will [not] use Customer Data for its own model training." Consumer-facing ModelArk Starter apps/Playground are training-ON with email opt-out.
- Retention: Safety-filter-triggered input/output retained 180 days; no general retention period documented for other processing.
- ZDR: No-training posture is the corporate MaaS default; 180-day safety-filter retention means no full ZDR tier.
- Location: "Customer Data processing is located in Malaysia, Indonesia, and/or EU/EEA"; filter-triggered data retained in Malaysia.

## Notes
ModelArk-specific data-processing page: docs.byteplus.com/en/docs/ModelArk/BytePlus_ModelArk_Data_Processing. Consumer Starter/Playground surfaces are training-on — treat as a separate consumer surface if tracked later.
