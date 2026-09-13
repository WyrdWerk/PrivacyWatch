# NVIDIA — API (Model Catalog) (research note, 2026-09-13)

Primary source: https://assets.ngc.nvidia.com/products/api-catalog/legal/NVIDIA%20API%20Trial%20Terms%20of%20Service.pdf

## Findings
- Training: The API Trial ToS never uses the word "train"; §3.2–3.3: NVIDIA will "use such data to provide you with the API Services and for any other purpose expressly disclosed to you for an API Service, in each case subject to your consent, where required by law" and "will collect the following data, without identifying specific users, to operate and improve the API Services and other products."
- Retention: Privacy policy: "We retain your personal data for as long as our engagement with you continues (e.g., emails, website visits, logins, or event attendance)"; the Trial ToS sets no retention period for inputs/outputs.
- ZDR: No no-training or zero-retention tier is published for the API Catalog trial.
- Location: Privacy policy: "NVIDIA is located in California, and in most cases we need to securely transfer and store your information in the United States."
- Incident: None found (confirmed breach, regulatory action, or government ban) as of 2026-09-13.

## Notes
Privacy page used: https://www.nvidia.com/en-us/about-nvidia/privacy-policy/
Supporting documents: https://www.nvidia.com/en-us/about-nvidia/privacy-policy/
Product-specific NVIDIA API Trial Terms of Service (PDF, parsed successfully) govern the build.nvidia.com API Catalog trial; the general NVIDIA privacy policy supplements them. The privacy policy's model-training clause covers NVIDIA's own licensed datasets, not customer API content. Rated unverified on training.
