# Changelog

All notable changes to pi-bifrost are documented here.

## 0.1.14
- Structured diagnostics with corrective actions for all error paths. Unresolvable model patterns, classifier failures, and setModel errors now show what went wrong and how to fix it instead of dumping raw stderr.
- Startup validation warns about model patterns that don't resolve in the registry.
- Per-prompt warnings (debounced) when a tier has unresolved patterns.
- `/bifrost doctor` command: on-demand config health check validating all model patterns and classifier model against the live registry.
- `setModel` error messages now show the actual cause (auth missing, network error, etc.) instead of the generic "no API key" message.

## 0.1.13
- `/bifrost init` now shows a detailed summary before the write prompt: models grouped by tier, classifier selection, discovery skips, and probe errors. The confirm dialog includes model/tier counts and error totals instead of a generic "Write config?" message.

## 0.1.12
- Instant circuit-open on HTTP 400+ errors. Any 4xx/5xx response (rate limits, auth failures, server errors) immediately opens the circuit breaker for that model — no need to hit the 3-failure threshold. Next prompt automatically routes to a different model.
- Improved failure logging: HTTP status codes are surfaced in the warning message with a hint that the circuit has opened.

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