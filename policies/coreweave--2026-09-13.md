# CoreWeave — API (GPU Cloud) (research note, 2026-09-13)

Primary source: https://docs.coreweave.com/policies/terms-of-service

## Findings
- Training: ToS license is limited to hosting/processing ("Customer grants CoreWeave a license to host, store, transfer, display, p[rocess] Customer Data") with no training right stated; the privacy policy's AI/ML clause covers service operations: "CoreWeave may use technologies such as artificial intelligence (AI) and machine learning (ML) when processing your data to operate, maintain, improve, and develop our Services."
- Retention: Customer-initiated deletion honored "within a maximum period of one hundred eighty (180) days"; on termination, deletion after "a recovery period of up to thirty (30) days".
- ZDR: No no-training or zero-retention tier is published; retention mechanics only.
- Location: TOS SLOs reference named US regions ("NJ1, NY1"); privacy policy: "CoreWeave operates globally and may transfer personal data to countries that may not provide the same level of data protection as your country of residence" with Standard Contractual Clauses.
- Incident: None found (confirmed breach, regulatory action, or government ban) as of 2026-09-13.

## Notes
Privacy page used: https://docs.coreweave.com/policies/terms-of-service/privacy-policy
Supporting documents: https://docs.coreweave.com/policies/terms-of-service/privacy-policy
Platform cloud ToS (compute infrastructure), not model-inference-specific terms. Rated unverified because no document affirmatively addresses training on Customer Data. Only availability incidents (console/connectivity) found on the public status page.
