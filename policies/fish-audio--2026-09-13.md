# Fish Audio — API (Voice/TTS) (research note, 2026-09-13)

Primary source: https://fish.audio/terms

## Findings
- Training: "Usage Data and Content may be used to develop, train, or enhance artificial intelligence or machine learning models that are part of Fish.Audio's products and services, including third-party components of the Services." No training opt-out appears in the ToS or privacy policy.
- Retention: License grants are "royalty-free, perpetual, sublicensable, irrevocable, and worldwide"; on account deletion Fish stops displaying User Submissions but no deletion period for API inputs/outputs is stated; privacy policy: "as long as necessary to provide you with our Services."
- ZDR: No no-training or zero-retention arrangement published.
- Location: "The entity providing the Services is Hanabi AI Inc., a corporation operating under the laws of Delaware"; no storage-region statement in the privacy policy.
- Incident: None found (confirmed breach, regulatory action, or government ban) as of 2026-09-13.

## Notes
Privacy page used: https://fish.audio/privacy/
Supporting documents: https://fish.audio/privacy/; https://github.com/advisories/GHSA-6w22-457x-2p92
May 2026: CVE-2026-8755 (path traversal) was published against the open-source fishaudio Bert-VITS2 project — a vulnerability disclosure, not a reported platform breach. UK performers' union Equity publicly demanded removal of unauthorized AI voices (2026), a dispute rather than a regulatory action. Training license extends to third-party model components.
