---
provider-id: xiaomi-mimo
provider-name: Xiaomi MiMo
surface: Cloud API
category: chinese
url: https://platform.xiaomimimo.com/docs/en-US/faq
archived: 2026-05-27
---

# Xiaomi MiMo API Open Platform FAQ

## Verification Issues

### What's the difference between personal and business verification?

Domestic users are required to complete real-name authentication before recharging. Real-name verification includes personal and business types. An account can only be verified for one type. After completing the real-name authentication for a personal account, it can be converted into a business account through business authentication. Business accounts cannot be converted back into personal accounts.

## Payment Issues

### How to top up on the Open Platform?

Go to the Balance page. Domestic users can use Xiaomi Pay, Alipay, WeChat Pay; overseas users can use Apple Pay, Google Pay, Credit Card / Debit Card. Top-ups are usually instant.

### Is refund supported?

If you have a refund request, you contact us by clicking the "Apply for Refund" button in the upper right corner of Recharge Details, select the "Refund" option, and explain the reason to initiate the refund request. The account balance will be returned to the original source after approval (consumed amount, invoiced amount, and platform gifted amount cannot be refunded).

### How to issue an invoice?

Domestic users: Go to the Invoice page, select a successful top-up order, and apply for an e-invoice.
Overseas users: Invoices are auto-generated after top-ups, you can view them in the order page or download historical invoices in Recharge Details.

## Related to Token Plan

### Packages and Prices

Currently, four packages are offered: Lite, Standard, Pro, and Max, along with two subscription cycles: continuous monthly and continuous annual. Each package includes different usage quotas and special privileges.

### Which models does Token Plan support?

Supports a total of 8 models from the MiMo-V2 series and MiMo-V2.5 series.

### Does it support continuous subscription?

Support. It supports two subscription cycles: continuous monthly and continuous annual, with automatic renewal after expiration. You can cancel automatic renewal at any time on the subscription management page.

### Can I purchase multiple packages or upgrade a package?

Currently, the platform only supports purchasing 1 package at a time. Cross-level package upgrades by topping up the price difference are supported, while package downgrades are not.

### How long is the package valid after purchase?

It takes effect immediately after purchase, and the validity period of the package is "the day of purchase + 30 complete natural days (as of 23:59:59 UTC)".

### Can I still use it if the quota is used up but not expired?

No. The service will stop when either the "expiration" or "all Credits used up" condition is met. The system will not continue to consume your bonus or account balance.

## API Key and Access

### How do I obtain an API Key after purchase?

After successful purchase, you can view the exclusive API Key on the Subscription page. Note: The API Key is only visible and copyable when created, please save it properly.

### Which programming tools are supported?

Supports mainstream programming tools and model frameworks, such as Claude Code, OpenClaw, OpenCode, Kilo Code, Cline, Hermes Agent, CodeBuddy Code, etc.

### How to obtain the Base URL?

Refer to the Base URL provided on the subscription management page: There are 2 types of Base URLs provided, one compatible with the OpenAI interface protocol and the other compatible with the Anthropic interface protocol.

## API Call Issues

### How to obtain and use API Key?

After logging into the Xiaomi MiMo API Open Platform, apply for an API Key on the Console-API Keys page. When using the model through the API, please include your API Key in the request header: `api-key: $MIMO_API_KEY` or `Authorization: Bearer $MIMO_API_KEY`.

### Are there rate limits?

During the open beta period, RPM is set to 100, and TPM has no limit for the time being, which may be adjusted after the open beta ends.

### What if the API returns inappropriate content?

The platform has added content review for both user input and model output. If violations occur, the returned content will be automatically intercepted to ensure the content you receive is safe.

## Model Capabilities and More Methods

### Does the model support local deployment?

The currently released large models can be found at https://github.com/XiaomiMiMo/MiMo-V2-Flash. Local deployment is primarily supported for sglang.

## Account Issues

### What login methods are supported?

The platform uses Xiaomi account login. Registration methods for Mainland China users include phone number registration and third-party account authorization registration. Registration methods for overseas users include email registration and third-party account authorization registration (Google/Facebook).

### Can model services still be used after the Xiaomi account is deactivated?

After deactivating the Xiaomi account, platform data will be cleared, and the API Key will be synchronized for expiration.

## Contact Us

For assistance or business inquiries, feel free to reach out to us through the following channels:
- Email: support-mimo@xiaomi.com
- Scan the QR code at the bottom left to join the developer communication group.

Update Time April 29, 2026
