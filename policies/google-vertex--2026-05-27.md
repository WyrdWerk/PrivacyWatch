---
provider-id: google-vertex
provider-name: Google Gemini
surface: Vertex AI / Paid API
category: us-frontier
url: https://cloud.google.com/vertex-ai/generative-ai/docs/data-governance
archived: 2026-05-27
---

# Vertex AI and zero data retention | Generative AI on Vertex AI | Google Cloud Documentation

Google was the first in the industry to publish an AI/ML Privacy Commitment, which outlines our belief that customers should have the highest level of security and control over their data that is stored in the cloud. That commitment extends to Google Cloud's generative AI products. Google ensures that its teams are following these commitments through robust data governance practices, which include reviews of the data that Google Cloud uses in the development of its products. More details about how Google processes data can also be found in Google's Cloud Data Processing Addendum (CDPA).

## Training restriction

As outlined in Section 17 "Training Restriction" in the Service Terms section of Service Specific Terms, Google won't use your data to train or fine-tune any AI/ML models without your prior permission or instruction. This applies to all managed models on Vertex AI, including GA and pre-GA models.

## Customer data retention and achieving zero data retention

Customer data is retained in Vertex AI for Google models for limited periods of time in the following scenarios and conditions. To achieve zero data retention, customers must take specific actions within each of these areas:

- **Prompt logging for abuse monitoring for Google models**: As outlined in Section 4.3 "Generative AI Safety and Abuse" of Google Cloud Platform Terms of Service, Google may log prompts to detect potential abuse and violations of its Acceptable Use Policy and Prohibited Use Policy as part of providing generative AI services to customers. Only customers whose use of Google Cloud is governed by the Google Cloud Platform Terms of Service are subject to prompt logging for abuse monitoring. If you are in scope for prompt logging for abuse monitoring and want zero data retention, you can request an exception for abuse monitoring. See Abuse monitoring.
- **Grounding with Google Search**: As outlined in Section 19 "Generative AI Services: Grounding with Google Search" of the Service Specific Terms, Google stores prompts and contextual information that customers may provide, and generated output for thirty (30) days for the purposes of creating grounded results and search suggestions, and this stored information may be used for debugging and testing of systems that support grounding with Google Search. There is no way to disable the storage of this information if you use Grounding with Google Search. If you require zero data retention, we recommend using Web Grounding for Enterprise.
- **Grounding with Google Maps**: As outlined in Section 19 "Generative AI Services: Grounding with Google Maps" of the Service Specific Terms, Google stores prompts and contextual information that customers may provide, and generated output for thirty (30) days for the purposes of creating grounded results, and this stored information may only be used for reliability engineering, such as debugging in case of service issues, of systems that support grounding with Google Maps. There is no way to disable the storage of this information if you use Grounding with Google Maps.
- **Session resumption for Gemini Live API:** This feature is disabled by default. It must be enabled by the user every time they call the API by specifying the field in the API request, and project-level privacy is enforced for cached data. Enabling Session Resumption allows the user to reconnect to a previous session within 24 hours by storing cached data, including text, video, and audio prompt data and model outputs, for up to 24 hours. To achieve zero data retention, do not enable this feature.

This applies to all managed models on Vertex AI, including GA and pre-GA models.

## In-memory data caching

By default, Google's published Gemini models cache Customer Data (inputs, outputs, and derived data) in-memory to reduce latency and accelerate responses. This data is stored only in-memory (not at-rest), is isolated at the project level, and has a 24-hour TTL. Cached data is used only for improving service performance and adheres to all Data Residency requirements for the selected location and does not violate zero data retention. This feature can be disabled at the project level.
