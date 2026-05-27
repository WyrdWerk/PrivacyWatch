---
provider-id: openai-api
provider-name: OpenAI
surface: API
category: us-frontier
url: https://platform.openai.com/docs/guides/your-data
archived: 2026-05-27
---

# Data controls in the OpenAI platform

Understand how OpenAI uses your data, and how you can control it.

Your data is your data. As of March 1, 2023, data sent to the OpenAI API is not used to train or improve OpenAI models (unless you explicitly opt in to share data with us).

## Types of data stored with the OpenAI API

When using the OpenAI API, data may be stored as:

- **Abuse monitoring logs:** Logs generated from your use of the platform, necessary for OpenAI to enforce our Usage Policies and mitigate harmful uses of AI.
- **Application state:** Data persisted from some API features in order to fulfill the task or request.

## Data retention controls for abuse monitoring

Abuse monitoring logs may contain certain customer content, such as prompts and responses, as well as metadata derived from that customer content, such as classifier outputs. By default, abuse monitoring logs are generated for all API feature usage and retained for up to 30 days, unless longer retention is required by law, or is reasonably necessary to protect our services or any third party from harm.

Eligible customers may have their customer content excluded from these abuse monitoring logs, subject to the limitations below, by getting approved for the Zero Data Retention or Modified Abuse Monitoring controls. Currently, these controls are subject to prior approval by OpenAI and acceptance of additional requirements. Approved customers may select between Modified Abuse Monitoring or Zero Data Retention for their API Organization or project.

Customers who enable Modified Abuse Monitoring or Zero Data Retention are responsible for ensuring their users abide by OpenAI's policies for safe and responsible use of AI and complying with any moderation and reporting requirements under applicable law.

### Modified Abuse Monitoring

Modified Abuse Monitoring excludes customer content (other than image and file inputs in rare cases, as described below) from abuse monitoring logs across all API endpoints, while still allowing the customer to take advantage of the full capabilities of the OpenAI platform.

### Zero Data Retention

Zero Data Retention excludes customer content from abuse monitoring logs in the same way as Modified Abuse Monitoring.

Additionally, Zero Data Retention changes some endpoint behavior: the `store` parameter for `/v1/responses` and `v1/chat/completions` will always be treated as `false`, even if the request attempts to set the value to `true`.

Besides those specific behavior changes, the endpoints and capabilities listed as No for Zero Data Retention Eligible in the table below may still store application state, even if Zero Data Retention is enabled.

### Safety Retention

We reserve the right to make `gpt-5.5`, `gpt-5.5-pro`, and future models ineligible for Zero Data Retention or Modified Abuse Monitoring for specific customers if reasonably necessary to investigate severe risk activity, as notified in advance to the impacted customers in writing. In this instance, we may retain customer content when using these models that our classifiers detect as potentially violating our Usage Policies. Otherwise retention will not be affected.

### Configuring data retention controls

Once your organization has been approved for data retention controls, you'll see a **Data Retention** tab within Settings > Organization > Data controls. From that tab, you can configure data retention controls at both the organization and project level.

- **Organization-level controls:** Choose between Zero Data Retention or Modified Abuse Monitoring for your entire organization.
- **Project-level controls:** For each project, select `default` to inherit the organization-level setting, explicitly pick Zero Data Retention or Modified Abuse Monitoring, or select **None** to disable these controls for that project.

### Storage requirements and retention controls per endpoint

The table below indicates when application state is stored for each endpoint. Zero Data Retention eligible endpoints do not retain any customer content for application state, subject to the limitations below. Zero Data Retention ineligible endpoints or capabilities may retain application state when used, even if you have Zero Data Retention enabled.

| Endpoint | Data used for training | Abuse monitoring retention | Application state retention | Zero Data Retention eligible |
| --- | --- | --- | --- | --- |
| `/v1/chat/completions` | No | 30 days | None, see below for exceptions | Yes, see below for limitations |
| `/v1/responses` | No | 30 days | None, see below for exceptions | Yes, see below for limitations |
| `/v1/conversations` | No | Until deleted | Until deleted | No |
| `/v1/conversations/items` | No | Until deleted | Until deleted | No |
| `/v1/chatkit/threads` | No | Until deleted | Until deleted | No |
| `/v1/assistants` | No | 30 days | Until deleted | No |
| `/v1/threads` | No | 30 days | Until deleted | No |
| `/v1/threads/messages` | No | 30 days | Until deleted | No |
| `/v1/threads/runs` | No | 30 days | Until deleted | No |
| `/v1/threads/runs/steps` | No | 30 days | Until deleted | No |
| `/v1/vector_stores` | No | 30 days | Until deleted | No |
| `/v1/images/generations` | No | 30 days | None | Yes, see below for limitations |
| `/v1/images/edits` | No | 30 days | None | Yes, see below for limitations |
| `/v1/images/variations` | No | 30 days | None | Yes, see below for limitations |
| `/v1/embeddings` | No | 30 days | None | Yes |
| `/v1/audio/transcriptions` | No | None | None | Yes |
| `/v1/audio/translations` | No | None | None | Yes |
| `/v1/audio/speech` | No | 30 days | None | Yes |
| `/v1/files` | No | 30 days | Until deleted* | No |
| `/v1/fine_tuning/jobs` | No | 30 days | Until deleted | No |
| `/v1/evals` | No | 30 days | Until deleted | No |
| `/v1/batches` | No | 30 days | Until deleted | No |
| `/v1/moderations` | No | None | None | Yes |
| `/v1/completions` | No | 30 days | None | Yes |
| `/v1/realtime` | No | 30 days | None | Yes |
| `/v1/videos` | No | 30 days | None | No |

#### `/v1/chat/completions`

- Audio outputs application state is stored for 1 hour to enable multi-turn conversations.
- When Zero Data Retention is enabled for an organization, the `store` parameter will always be treated as `false`, even if the request attempts to set the value to `true`.
- See image and file inputs.
- Extended prompt caching requires storing encrypted key/value tensors to GPU-local storage as application state. This data is stored on the local GPU machines and is not retained after the 24 hour data expiration. Requests to gpt-5.5, gpt-5.5-pro, and all future models require extended prompt caching, and setting a prompt_cache_retention value to in_memory will cause a request error.

#### `/v1/responses`

- The Responses API has a 30 day Application State retention period by default, or when the `store` parameter is set to `true`. Response data will be stored for at least 30 days.
- When Zero Data Retention is enabled for an organization, the `store` parameter will always be treated as `false`, even if the request attempts to set the value to `true`.
- Background mode stores response data to disk for roughly 10 minutes to enable polling.
- Audio outputs application state is stored for 1 hour to enable multi-turn conversations.
- See image and file inputs.
- MCP servers (used with the remote MCP server tool) are third-party services, and data sent to an MCP server is subject to their data retention policies.
- Hosted containers used by Hosted Shell and Code Interpreter may write temporary application state to the container filesystem (backed by ephemeral block storage) while the container is active. Container data is deleted when the container expires or is explicitly deleted.
- Extended prompt caching requires storing encrypted key/value tensors to GPU-local storage as application state. This data is stored on the local GPU machines and is not retained after the 24 hour data expiration. Requests to gpt-5.5, gpt-5.5-pro, and all future models require extended prompt caching.
- For server-side compaction, no data is retained when `store="false"`.
- We support Skills in two form factors, both local execution and hosted container-based execution. Hosted skills follow the same container lifecycle as hosted shell: mounted skills and container files remain available while the container is active and are discarded when the container expires or is deleted.
- Data transmitted to third-party services over network connections is subject to their data retention policies.

#### `/v1/assistants`, `/v1/threads`, and `/v1/vector_stores`

- Objects related to the Assistants API are deleted from our servers 30 days after you delete them via the API or the dashboard. Objects that are not deleted via the API or the dashboard are retained indefinitely.

#### `/v1/images`

- Image generation is Zero Data Retention compatible when using `gpt-image-2`, `gpt-image-1.5`, `gpt-image-1`, and `gpt-image-1-mini`, not when using `dall-e-3` or `dall-e-2`.

#### `/v1/files`

- Files can be manually deleted via the API or the dashboard, or can be automatically deleted by setting the `expires_after` parameter.

#### `/v1/videos`

- The `v1/videos` API includes a workflow that saves data to disk while processing and retains it for 48 hours to allow the caller to download the produced video and then for 30 days for abuse monitoring. `v1/videos` is currently blocked for MAM or ZDR requests. If your organization has data retention controls enabled, configure a project with its retention setting set to **None** as described in Configuring data retention controls to use `/v1/videos` with that project.

#### Image and file inputs

Images and files may be uploaded as inputs to `/v1/responses` (including when using the Computer Use tool), `/v1/chat/completions`, and `/v1/images`. Image and file inputs are scanned for CSAM content upon submission. If the classifier detects potential CSAM content, the image will be retained for manual review, even if Zero Data Retention or Modified Abuse Monitoring is enabled.

#### Web Search

Web Search with live internet access is not HIPAA eligible and is not covered by a BAA. Web Search in offline/cache-only mode (`external_web_access: false`) is eligible to be covered by a BAA when used with an API key from a ZDR-enabled project within a ZDR organization. This HIPAA/BAA guidance applies only to the Responses API `web_search` tool. Note: Preview variants (`web_search_preview`) ignore this parameter and behave as if `external_web_access` is `true`. We recommend using `web_search`.

## Data residency controls

Data residency controls are a project configuration option that allow you to configure the location of infrastructure OpenAI uses to provide services.

Contact our sales team to see if you're eligible for using data residency controls. Data residency endpoints are charged a 10% uplift for `gpt-5.5`, `gpt-5.5-pro`, `gpt-5.4` and `gpt-5.4-pro`.

### How does data residency work?

When data residency is enabled on your account, you can set a region for new projects you create in your account from the available regions listed below. If you use the supported endpoints, models, and snapshots listed below, your customer content (as defined in your services agreement) for that project will be stored at rest in the selected region to the extent the endpoint requires data persistence to function (such as /v1/batches).

If you select a region that supports regional processing, as specifically identified below, the services will perform inference for your Customer Content in the selected region as well.

Data residency does not apply to system data, which may be processed and stored outside the selected region. System data means account data, metadata, and usage data that do not contain Customer Content, which are collected by the services and used to manage and operate the services, such as account information or profiles of end users that directly access the services (e.g., your personnel), analytics, usage statistics, billing information, support requests, and structured output schema.

### Limitations

Data residency does not apply to: (a) any transmission or storage of Customer Content outside of the selected region caused by the location of an End User or Customer's infrastructure when accessing the services; (b) products, services, or content offered by parties other than OpenAI through the Services; or (c) any data other than Customer Content, such as system data.

If your selected Region does not support regional processing, as identified below, OpenAI may also process and temporarily store Customer Content outside of the Region to deliver the services.

### Additional requirements for non-US regions

To use data residency with any region other than the United States, you must be approved for abuse monitoring controls, and execute a Zero Data Retention amendment.

Selecting the United Arab Emirates region requires additional approval. Contact sales for assistance.

### How to use data residency

Data residency is configured per-project within your API Organization.

To configure data residency for regional storage, select the appropriate region from the dropdown when creating a new project.

For requests to projects with data residency configured, add the domain prefix as defined in the table below to each request.

### Which models and features are eligible for data residency?

The following models and API services are eligible for data residency today for the regions specified below.

**Table 1: Regional data residency capabilities**

| Region | Regional storage | Regional processing | Requires modified abuse monitoring or ZDR | Default modes of entry | Domain prefix |
| --- | --- | --- | --- | --- | --- |
| US | Yes | Yes | No | Text, Audio, Voice, Image | us.api.openai.com |
| Europe (EEA + Switzerland) | Yes | Yes | Yes | Text, Audio, Voice, Image* | eu.api.openai.com |
| Australia | Yes | No | Yes | Text, Audio, Voice, Image* | au.api.openai.com |
| Canada | Yes | No | Yes | Text, Audio, Voice, Image* | ca.api.openai.com |
| Japan | Yes | No | Yes | Text, Audio, Voice, Image* | jp.api.openai.com |
| India | Yes | No | Yes | Text, Audio, Voice, Image* | in.api.openai.com |
| Singapore | Yes | No | Yes | Text, Audio, Voice, Image* | sg.api.openai.com |
| South Korea | Yes | No | Yes | Text, Audio, Voice, Image* | kr.api.openai.com |
| United Kingdom | Yes | No | Yes | Text, Audio, Voice, Image* | gb.api.openai.com |
| United Arab Emirates | Yes | No | Yes | Text, Audio, Voice, Image* | ae.api.openai.com |

* Image support in these regions requires approval for enhanced Zero Data Retention or enhanced Modified Abuse Monitoring.

## Enterprise Key Management (EKM)

Enterprise Key Management (EKM) allows you to encrypt your customer content at OpenAI using keys managed by your own external Key Management System (KMS).

Once configured, EKM applies to any application state created during your use of the platform. See the EKM help center article for more information about how EKM works, and how to integrate with your KMS provider.

### EKM limitations

OpenAI supports Bring Your Own Key (BYOK) encryption with external accounts in AWS KMS, Google Cloud (GCP), and Azure Key Vault. If your organization leverages a different key management service, those keys need to be synced to one of the supported Cloud KMSs for use with OpenAI.

EKM does not support the following products. An attempt to use these endpoints in a project with EKM enabled will return an error.

- Assistants (/v1/assistants)
- Vision fine tuning
