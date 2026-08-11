# Changelog

All notable changes to pi-bifrost are documented here.

## 0.1.11
- `--free` discovery now fetches the OpenRouter free-models collection page at runtime and sorts quick-tier free models by popularity ranking (cumulative token throughput). Non-free quick-tier models sort by context window capacity. Falls back to probe-speed sort if collection page is unreachable.
- Status synchronization fix for Bifrost mode changes.
- Weekly quota tolerance routing for subscription-balanced model selection.

## 0.1.0
- Silent mode configuration (`"silent": true`) to turn off all Pi console outputs and UI notifications while model routing remains active.
- `/bifrost silence` and `/bifrost unsilence` slash subcommands.
- Persisted `silent` state in `.pi/bifrost-state.json`.
- `subscription_balance` routing strategy: weighs Codex/Antigravity candidates by weekly subscription allowance remaining and keeps paid OpenRouter-compatible candidates blocked until measured subscriptions reach the configured reserve.
- `quotaRouting` config (`reservePercent`, `gamma`, `staleMinutes`, `refreshMinutes`, optional provider overrides).
- Local, credential-safe quota telemetry for Codex and Antigravity; only normalized fractions/reset times enter routing state.
- Independent `/bifrost init --scoped`, `--free`, and combined discovery modes.
- `/bifrost update --scoped|--free` reconciliation with source ownership metadata, deduplication, and safe removal of discovery-managed entries only.
- Deterministic discovery and subscription-steering tests.
- Subscription-balanced frontier example and explicit original-project attribution.