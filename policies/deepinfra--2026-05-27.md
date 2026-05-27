---
provider-id: deepinfra
provider-name: DeepInfra
surface: API
category: inference
url: https://docs.deepinfra.com/account/data-privacy
archived: 2026-05-27
---

# Data Privacy - DeepInfra

## Summary

- **Input data is not stored to disk** during inference — it exists only in memory while the request is being processed
- **Output data is not stored** — it is sent to you and then deleted from memory
- **We do not train on your data** (except Google/Anthropic model exceptions)
- **We do not share your data with third parties** (except Google/Anthropic model exceptions)

## Data privacy

When using DeepInfra inference APIs, we do not store the data you submit to our APIs on disk. We only hold it in memory during the inference process. Once inference is complete, the data is deleted from memory. The same applies to outputs — once sent back to you, they are deleted. **Exception:** Outputs of image generation models are stored for a short period of time to allow easy access.

## Google models

If you opt to use a Google model, Google will store the output as outlined in their Privacy Notice.

## Anthropic models

If you opt to use an Anthropic model, Anthropic will store the output as outlined in their Trust Center.

## Bulk inference APIs

When using our bulk inference APIs, we may need to store data for a longer period, potentially on disk in encrypted form. Once inference is complete and results are returned to you, the data is deleted from disk and memory after a short retention period.

## No training

We do not use data you submit to our APIs for training models, except when using Google or Anthropic models, where the receiving company's training policy applies.

## No sharing

We do not share data you submit to our APIs with any third party, except when using Google or Anthropic models, where we are required to transfer data to those endpoints to fulfill the request.

## Logs

We generally do not log the content of your requests. We log metadata useful for debugging: request ID, cost, sampling parameters. We reserve the right to log a small portion of requests when necessary for debugging or security purposes.
