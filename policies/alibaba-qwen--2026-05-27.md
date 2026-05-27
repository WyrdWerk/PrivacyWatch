---
provider-id: alibaba-qwen
provider-name: Alibaba / Qwen
surface: API (DashScope)
category: chinese
url: https://docs.qwencloud.com/developer-guides/security-compliance/zero-data-retention
archived: 2026-05-27
---

# Zero data retention - Qwen Cloud

## How Qwen Cloud handles your data during inference

Qwen Cloud does not use your API inputs or outputs to train or improve models. This page explains how your data is handled during the inference process.

## Default data handling

When you send an API request to Qwen Cloud:

- **Inputs and outputs** are processed in memory for the duration of the request. Once the response is returned, the data is not retained in persistent storage.
- **Metadata** such as token counts, timestamps, and request IDs is logged for billing, rate limiting, and service delivery.
- **No training on your data**: Your prompts and completions are never used to train, fine-tune, or improve Qwen models.

## Prompt caching

When context caching is active, cached prompt data and associated key-value caches remain in volatile memory for the duration of the cache TTL. Cached data is not written to persistent storage and is automatically evicted when the TTL expires.

## Conversation storage (Responses API)

The Responses API stores conversation context for multi-turn workflows:

- **Context linking**: Use `previous_response_id` to link turns in a conversation. The response ID remains valid for 7 days, allowing the server to automatically retrieve and combine previous inputs and outputs as context.
- **Automatic expiration**: Conversation data linked through `previous_response_id` is automatically deleted after 7 days.

This storage is limited to the Responses API. All other Qwen Cloud APIs follow the default zero-retention behavior described above.

## Best practices

- Be aware that conversation context is stored for 7 days when using `previous_response_id` in the Responses API. Avoid linking turns if your application handles highly sensitive data.
- Avoid including personally identifiable information (PII) in prompts when possible.
- Implement data minimization at the application layer — send only the context the model needs.
