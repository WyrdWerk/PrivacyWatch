# PrivacyWatch runtime rollout

This repository's Amp project uses two separate runtime layers:

- Project Pre-setup provisions the Pi runtime and extensions before the Amp
  agent starts. It is additive and contains no credentials or application
  state.
- `.agents/setup` owns the shared `bb-app` runtime at
  `~/.local/share/bb-pilot/runtime`. It only installs or verifies the exact
  package and never starts a server. An unowned occupant is refused.

## Audited pins

| Package | Version | Registry integrity |
| --- | --- | --- |
| `@earendil-works/pi-coding-agent` | `0.85.1` | `sha512-FGRN+OHbWaefBPGaTggAdLjrIHW+s2PzLyglz/5dfLzb9of7uuXMXYC0fJIeZTw+shS32o2cuQ9jF7YSDuL/oQ==` |
| `pi-zro-provider` | `1.3.11` | `sha512-OJgbYImZ7IHXSYXGlfD5dVraQLQuF0aAqsPBmZwZhC37Z4JLhQ5e0DSrRE+pN661a88semuSIytXwn43RrQ7kw==` |
| `pi-tool-repair` | `0.2.5` | `sha512-xYtW4kjgEC6xMsSAcoJJW10pfe5v/tPrWCIqpDQZyfFtQBVTqNHUnc/kdSDZeJCsuDLmRo1a3mhoBuSjEuQgPg==` |
| `pi-web-access` | `0.28.0` | `sha512-NMiRWiRXt46oNOoef+9WUN9IKzwADXuM9Wu6fPgMBScIVO8wQK3+dUV0CkmkvTHWADv8PBCqxcDSufVwqF++9Q==` |
| `pi-neuralwatt-provider` | `1.18.13` | `sha512-wYC7ooUElyZ71zH7e+Tow/uCqSze6YqgPfCUHOAA5z0I97yDQwrczxhQY0WJzPDtCg+IshDCq/IOQgFtYgyD1A==` |
| `bb-app` | `0.43.0` | `sha512-dL7IcXM4Zu6+zJdXRjticqu4aEve4vztSePDMrWlK5/AEesBb+81GWpekgIfche1/jf3JYINtsnIGT98ZKnydw==` |

Bun `1.4.2` is preferred when present; Node `26.5.1` is the fallback. The
default Pi route is `zro / deepseek-v4-flash-0731 / low`. NeuralWatt is an
explicit provider and is not a fallback route.

The NeuralWatt package's declared entrypoints are installed through Pi's
package installer. Its wire extension version is read from the installed
package's own MCR source during setup and seeded for future Pi launches; the
project does not embed a fleet-wide wire-version constant.

## bb service contract

`bb-pilot` starts only after Amp supplies `AMP_THREAD_ID`. It validates that ID,
uses `$HOME/.local/share/bb-pilot/data/$AMP_THREAD_ID`, binds the app and host
daemon to loopback, selects a distinct collision-checked daemon port, disables
telemetry, and launches with a minimal environment. Existing Zro or NeuralWatt
credentials may be passed to the provider process ephemerally when already
present; they are never copied into bb data, runtime files, or project
settings. Data directories and lock files use `0700`/`0600` under `umask 077`.

The clean `bb-app@0.43.0` reference inventory is 27 bundled, 20 enabled, and
seven default-off. The service does not install third-party plugins or force
plugin state at startup.

## Rollback

Stop only `bb-pilot`, then revert `.agents/setup`, `.amp/services.yaml`,
`bin/bb-pilot`, `config/bb-plugin-defaults-0.43.0.json`, and this document.
Preserve the bb data directory unless a separate cleanup is authorized. To
roll back Pi, restore the exact prior project Pre-setup bytes from the backup
record and create a new orb; the existing snapshot is intentionally preserved.
