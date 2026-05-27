---
provider-id: commandcode
provider-name: CommandCode
surface: Terminal Agent
category: coding
url: https://commandcode.ai/docs/resources/security
archived: 2026-05-27
---

# Security & Privacy | Command Code

Command Code is designed with security and privacy as core principles. Your code stays yours — we never train on it, and you control exactly what Command Code can access.

## Your Data

| What | Stored? | Where | Used for training? |
| --- | --- | --- | --- |
| Source code | Never stored | Your machine only | No |
| Taste profile | Local + optional cloud sync | `.commandcode/taste/` and `commandcode.ai` | No |
| Conversation history | Local only | `~/.commandcode/projects/` | No |
| Authentication tokens | Local only | `~/.commandcode/auth.json` | No |
| AGENTS.md | Local only | Project root | No |

**Privacy:** Command Code does not train on your code. Taste learning runs locally and stores preferences as structured rules — not code snippets.

## Permission Model

Command Code uses a permission system that puts you in control of every action.

| Mode | File reads | File writes | Shell commands | When to use |
| --- | --- | --- | --- | --- |
| Default | Allowed | Requires approval | Requires approval | Day-to-day work |
| Plan | Allowed | Blocked | Blocked | Exploring and designing |
| Auto-Accept | Allowed | Allowed | Allowed | Trusted iteration |

## Network Access

Command Code connects to the internet for:
- API requests to the AI provider (Command Code or Anthropic)
- Authentication via OAuth
- Taste sync when you push/pull taste profiles
- MCP servers you explicitly configure

Command Code does **not** make any network requests for telemetry or tracking without your knowledge.

## Local File Access

Command Code only accesses files within:
1. Your current project directory
2. Additional directories you explicitly add
3. Command Code config in `~/.commandcode/`

## API Key Storage

Authentication credentials stored locally at `~/.commandcode/auth.json`. Never sent to any third party.

If you use BYOK with Anthropic, your API key is stored in environment variables — Command Code does not persist it.

## Enterprise

For organizations with stricter requirements:
- Self-hosted deployment options
- Your code never leaves your infrastructure
- Custom security policies
