# Tencent Cloud — API (TokenHub) (research note, 2026-09-13)

Primary source: https://www.tencentcloud.com/en/document/product/301/78869

## Findings
- Training: "Tencent will not use User Input to train Tencent's AI models and systems, unless you grant your explicit opt-in consent." Material caveat: third-party models on the platform may retain or train on inputs under their own terms.
- Retention: "If you did not activate the ZDR function, we generally retain information for up to 30 days after your task request."
- ZDR: ZDR activation on Enterprise Token Plan in Singapore, Frankfurt, or Silicon Valley: "we will not store such information". Not documented for Personal Token Plan.
- Location: Personal data processed in the selected Service Region; subprocessors/authorized changes may involve other regions. TokenHub ZDR regions: Singapore, Frankfurt, Silicon Valley.

## Notes
AI/LLM rules live in separate docs (AI Service Terms, TokenHub DPSA). A 2025 Cybernews report on exposed subdomains was disputed by Tencent ("no user data was exposed"; claimed honeypot) — not an established customer-data breach.
