---
provider-id: anthropic-api
provider-name: Anthropic
surface: API
category: us-frontier
url: https://platform.claude.com/docs/en/manage-claude/api-and-data-retention
archived: 2026-05-27
---

# API and data retention - Claude API Docs

Information about Anthropic's standard retention policies is set out in [Anthropic's commercial data retention policy](https://privacy.claude.com/en/articles/7996866-how-long-do-you-store-my-organization-s-data) and [consumer data retention policy](https://privacy.claude.com/en/articles/10023548-how-long-do-you-store-my-data).

Anthropic offers two data handling arrangements for the Claude API:

- **Zero data retention (ZDR):** Customer data is not stored at rest after the API response is returned, except where needed to comply with law or combat misuse.
- **HIPAA readiness:** For organizations handling protected health information (PHI), Anthropic offers HIPAA-ready API access with a signed Business Associate Agreement (BAA). See HIPAA readiness.

## Anthropic's approach to data retention

Different APIs and features have different storage and retention needs. Where an API or feature doesn't require storage of customer prompts or responses, it may be eligible for ZDR. Where an API or feature necessarily requires storage of customer prompts or responses, Anthropic designs for the smallest possible retention footprint. For these features:

- Retained data is never used for model training without your express permission.
- Only what is technically necessary for the API and feature to work is retained. Conversation content (your prompts and Claude's outputs) is never retained unless explicitly noted.
- Data is purged on the shortest practical TTL, and Anthropic aims to give customers control over how long data is retained. What is held, and the retention duration where a specific TTL applies, is documented on each feature's page.

Data accessible through the Compliance API follows its own retention model. The Activity Feed retains data for 6 years. Chat, file, and project content from claude.ai follows your organization's retention policy, set in claude.ai > Organization settings > Data and privacy.

In the feature eligibility table, some features are marked "Yes (qualified)" in the ZDR eligible column. If your organization has a ZDR arrangement, you can use these features with confidence that what Anthropic retains is narrow and is required for optimal performance.

## Zero data retention (ZDR) scope

**What ZDR covers**

- **Certain Claude APIs:** ZDR applies to the Claude Messages and Token Counting APIs
- **Claude Code:** ZDR applies when used with Commercial organization API keys or through Claude Enterprise (see Claude Code ZDR docs)

**What ZDR does NOT cover**

- **Console and Workbench:** Any usage on Console or Workbench
- **Claude Managed Agents:** Claude Managed Agents is a stateful resource. You can delete session transcripts, but there is no automatic deletion.
- **Claude consumer products:** Claude Free, Pro, or Max plans, including when customers on those plans use Claude's web, desktop, or mobile apps or Claude Code
- **Claude Teams and Claude Enterprise:** Claude Teams and Claude Enterprise product interfaces are **not ZDR-eligible**, except for Claude Code when used through Claude Enterprise with ZDR enabled for the organization. For other product interfaces, only Commercial organization API keys are eligible for ZDR.
- **Third-party integrations:** Data processed by third-party websites, tools, or other integrations is **not ZDR-eligible**, though some may have similar offerings. When using external services in conjunction with the Claude API, make sure to review those services' data handling practices.

For the most up-to-date information on what products and features are ZDR-eligible, refer to your contract terms or contact your Anthropic account representative.

## HIPAA readiness

The Claude API supports HIPAA-ready integrations for organizations that handle protected health information (PHI). With a signed BAA and a HIPAA-enabled organization, you can use supported API features to process PHI while supporting your organization's HIPAA compliance.

Previously, organizations that required HIPAA readiness for the Claude API needed to enable ZDR. HIPAA-ready API access removes this requirement and provides a foundation for Anthropic to progressively enable additional features as they are audited for HIPAA readiness.

This page covers HIPAA readiness for the Claude API. For the full HIPAA Implementation Guide covering Claude Enterprise and configuration requirements, see the Anthropic Trust Center.

### Getting started

To set up HIPAA-ready API access:

1. **Sign a Business Associate Agreement** — Contact the Anthropic sales team to sign a BAA that covers API usage.
2. **Provision a HIPAA-enabled organization** — Anthropic provisions a dedicated organization with HIPAA readiness controls enabled. This organization automatically enforces feature restrictions, blocking API requests that use non-eligible features.
3. **Build with eligible features** — Use the feature eligibility table to confirm which features are supported. Review the PHI handling guidelines for features that require specific restrictions on where PHI can appear. For detailed configuration and compliance requirements, refer to the HIPAA Implementation Guide.

HIPAA readiness is enforced at the organization level. If you need both HIPAA-ready and general-purpose API access, use separate organizations for each.

### HIPAA readiness scope

**What HIPAA readiness covers**

- **Claude API:** HIPAA readiness applies to the Claude API (`api.anthropic.com`) for eligible features listed in the feature eligibility table.

**What HIPAA readiness does NOT cover**

- **Claude consumer products:** Claude Free, Pro, or Max plans
- **Console and Workbench:** Usage through the Claude Console interface
- **Partner-operated platforms:** Amazon Bedrock or Vertex AI (refer to those platforms' compliance documentation)
- **Claude Platform on AWS and Microsoft Foundry:** HIPAA readiness is not available
- **Third-party integrations:** Data processed by external tools or services connected to your application
- **Claude Code:** Claude Code is not covered under HIPAA readiness
- **Beta features:** Features in beta are generally not covered under the BAA unless explicitly listed as eligible in the feature eligibility table

### PHI handling guidelines

Protected health information (PHI) includes any individually identifiable health information. In the context of the Claude API, PHI typically appears in:

- Message content (prompts and responses from Claude)
- Attached files (images, PDFs)
- File names and metadata associated with message content

The following fields are not expected to contain PHI under the BAA: workspace names, user information (name, email, phone number), billing data, and support tickets.

#### Schema and tool definition restrictions

When using structured outputs or tools with `strict: true`, the API compiles JSON schemas into grammars that are cached separately from message content. These cached schemas do not receive the same PHI protections as prompts and responses.

**Do not include PHI in JSON schema definitions.** This restriction applies to:

- Schema property names
- `enum` values
- `const` values
- `pattern` regular expressions

Patient-specific information should only appear in message content, where it is protected under HIPAA safeguards.

### HIPAA error handling

Your signed BAA is the official source of truth for which features are covered. The API also enforces these restrictions automatically: when a HIPAA-enabled organization sends a request that includes a non-eligible feature, the API returns a `400` error to prevent accidental use of features not covered by your BAA.

The error message lists the non-eligible features detected in your request. Remove these features from your request and retry.

## Feature eligibility

The following table lists which Claude API features are eligible for ZDR and HIPAA readiness arrangements. For HIPAA-enabled organizations, features marked "No" in the HIPAA column are automatically blocked, and requests that include them return a `400` error.

| Feature | Endpoint | ZDR eligible | HIPAA eligible | Details |
| --- | --- | --- | --- | --- |
| Messages API | `/v1/messages` | Yes | Yes | Standard API calls for generating Claude responses. |
| Token counting | `/v1/messages/count_tokens` | Yes | Yes | Count tokens before sending requests. |
| Web search | `/v1/messages` (with `web_search` tool) | Yes1 | Yes1 | Real-time web search results returned in the API response. |
| Web fetch | `/v1/messages` (with `web_fetch` tool) | Yes12 | No | Fetched web content returned in the API response. |
| Advisor tool | `/v1/messages` (with `advisor` tool) | Yes | No | Advisor model output is returned in the API response; nothing is stored server-side after the response. |
| Memory tool | `/v1/messages` (with `memory` tool) | Yes | Yes | Client-side memory storage where you control data retention. |
| Context management (compaction) | `/v1/messages` (with `context_management`) | Yes | No | Server-side compaction results are returned/round-tripped statelessly through the API response. |
| Context editing | `/v1/messages` (with `context_management`) | Yes | No | Context edits (tool use clearing + thinking clearing) are applied in real time. |
| Fast mode | `/v1/messages` (with `speed: "fast"`) | Yes | Yes | Same Messages API endpoint with faster inference. ZDR applies regardless of speed setting. |
| 1M token context window | `/v1/messages` | Yes | Yes | Extended context processing uses the standard Messages API. |
| Adaptive thinking | `/v1/messages` | Yes | Yes | Dynamic thinking depth uses the standard Messages API. |
| Citations | `/v1/messages` | Yes | Yes | Source attribution uses the standard Messages API. |
| Data residency | `/v1/messages` (with `inference_geo`) | Yes | Yes | Geographic routing uses the standard Messages API. |
| Effort | `/v1/messages` (with `effort`) | Yes | Yes | Token efficiency control uses the standard Messages API. |
| Extended thinking | `/v1/messages` (with `thinking`) | Yes | Yes | Step-by-step reasoning uses the standard Messages API. |
| PDF support | `/v1/messages` | Yes | Yes | PDF document processing uses the standard Messages API. HIPAA eligibility applies to PDFs sent inline via the Messages API, not through the Files API. |
| Search results | `/v1/messages` (with `search_results` source) | Yes | Yes | RAG citation support uses the standard Messages API. |
| Bash tool | `/v1/messages` (with `bash` tool) | Yes | Yes | Client-side tool executed in your environment. |
| Text editor tool | `/v1/messages` (with `text_editor` tool) | Yes | Yes | Client-side tool executed in your environment. |
| Computer use | `/v1/messages` (with `computer` tool) | Yes | No | Client-side tool where screenshots and files are captured and stored in your environment, not by Anthropic. See Computer use. |
| Fine-grained tool streaming | `/v1/messages` | Yes | Yes | Streaming tool parameters uses the standard Messages API. |
| Prompt caching | `/v1/messages` | Yes | Yes | Your prompts and Claude's outputs are not stored. KV cache representations and cryptographic hashes are held in memory for the cache TTL and promptly deleted after expiry. See Prompt caching. |
| Structured outputs | `/v1/messages` | Yes (qualified) | Yes3 | Your prompts and Claude's outputs are not stored. Only the JSON schema is cached, for up to 24 hours since last use. This also covers strict tool use (`strict: true` on tools), which uses the same grammar pipeline. See Structured outputs. |
| Cache diagnostics | `/v1/messages` (with `diagnostics`) | Yes (qualified) | No | Your prompts and Claude's outputs are not stored. A fingerprint of cryptographic hashes and token-count estimates is retained briefly to enable comparison against the next request. See Cache diagnostics. |
| Tool search | `/v1/messages` (with `tool_search` tool) | Yes | No | Tool search uses the standard Messages API. |
| Batch processing | `/v1/messages/batches` | No | No | 29-day retention; async storage required. See Batch processing. |
| Code execution | `/v1/messages` (with `code_execution` tool) | No | No | Container data retained up to 30 days. See Code execution. |
| Programmatic tool calling | `/v1/messages` (with `code_execution` tool) | No | No | Built on code execution containers; data retained up to 30 days. See Programmatic tool calling. |
| Files API | `/v1/files` | No | No | Files retained until explicitly deleted. See Files API. |
| Agent skills | `/v1/messages` (with `skills`) / `/v1/skills` | No | No | Skill data retained per standard policy. See Agent skills. |
| MCP connector | `/v1/messages` (with `mcp_servers`) | No | No | Data retained per standard policy. See MCP connector. |
| Claude Managed Agents | `/v1/agents`, `/v1/sessions`, `/v1/environments` | No | No | Sessions are stateful resources; transcripts persist until you delete them. Applies to all Managed Agents sub-features, including Self-hosted sandboxes. |
| MCP tunnels | `/v1/organizations/tunnels` | No | No | Research preview. See MCP tunnels security for the data-flow boundary and subprocessor details. |

1 Dynamic filtering is not eligible for ZDR or HIPAA.
2 While web fetch is ZDR-eligible, website publishers may retain request data (such as fetched URLs and request metadata) according to their own policies.
3 PHI must not be included in JSON schema definitions. See PHI handling guidelines.

## Limitations and exclusions

### CORS not supported for ZDR

**Cross-Origin Resource Sharing (CORS)** is not supported for organizations with ZDR arrangements. If you need to make API calls from browser-based applications, you must:

- Use a backend proxy server to make API calls on behalf of your front end
- Implement your own CORS handling on the proxy server
- Never expose API keys directly in browser JavaScript

### Data retention for policy violations and where required by law

Even with ZDR or HIPAA arrangements in place, Anthropic may retain data where required by law or to combat Usage Policy violations and malicious uses of Anthropic's platform. As a result, if a chat or session is flagged for such a violation, Anthropic may retain inputs and outputs for up to 2 years.
