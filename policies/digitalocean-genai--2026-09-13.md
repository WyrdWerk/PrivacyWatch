# DigitalOcean — API (GenAI Platform) (research note, 2026-09-13)

Primary source: https://www.digitalocean.com/legal/terms-of-service-agreement

## Findings
- Training: General cloud ToS §4.4: "We may use Usage Data and other information about how you use and interact with the Services to provide, maintain, and improve our Services" — scoped to Usage Data; no clause addresses training on Services Content (customer inputs/outputs).
- Retention: Privacy policy: "All Account data will be deleted within 90 days of purging." ToS: DigitalOcean "will delete Services Content upon termination in accordance with its standard Account closure practices" with no fixed period.
- ZDR: No no-training or zero-retention tier published for the GenAI platform.
- Location: ToS §4.7: "you may specify the geographic region and jurisdiction in which your Services Content will be stored... you agree that DigitalOcean may transfer and store your Services Content in other geographic regions or jurisdictions at its sole discretion."
- Incident: Confirmed incident on record (see Notes).

## Notes
Privacy page used: https://www.digitalocean.com/legal/privacy-policy
Supporting documents: https://www.digitalocean.com/legal/privacy-policy; https://techcrunch.com/2021/04/28/digitalocean-customer-billing-data-breach/
Platform-wide cloud ToS/privacy apply; no GenAI-specific data-processing terms found at the cited URLs. April 2021: confirmed breach exposing customer billing data (TechCrunch/BleepingComputer). EU-U.S. DPF certified. Rated unverified pending GenAI-specific terms.

## 2026-09-15 re-verification
Still no GenAI-specific terms. Unverified → Caution for vague “improve our Services” language. Incident flag kept.
