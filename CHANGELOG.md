# Changelog

All notable changes to pi-bifrost are documented here.

## 0.3.3
- **Fixed scoped-models filtering on `init --scoped` and `update --scoped`**: when user explicitly requests `--scoped`, all configured scoped-models are now included regardless of discovery errors or probing failures. Auth and connectivity issues are left for the user to handle downstream instead of silently excluding models.

## 0.3.2
- **Immediate runtime-error failover**: any final provider error now opens that model's circuit immediately, including non-HTTP exhaustion errors such as `ResourceExhausted: Worker local total request limit reached`. The next prompt selects the next healthy model from the same category before falling back to the default category.
- Probe-only transient errors still use the configured failure threshold; automatic prompt replay remains disabled to prevent duplicate tool calls or other side effects.
- Removed a stale `rule-learning.ts` import so typechecking passes cleanly.

## 0.3.1
- **Fixed probe false-negatives on thinking-only models**: Antigravity Gemini models (and other reasoning-capable models) that return thinking-only output with no final text are now correctly treated as reachable. Previously these were marked as errors via a misleading minimal-session fallback that lost custom provider/OAuth registration. `PROBE_MAX_TOKENS` increased from 5 to 16 to reduce thinking truncation.
- **Probe signature simplified**: `runProbe()` no longer accepts a session-fallback callback; all call sites updated.
- **Tests updated**: Added "treats thinking-only stream response as ok" and "returns error when stream stopReason is error" tests.

## 0.3.0
- **Session-aware routing**: classification pipeline tracks recent tier history. When 2+ of the last 3 prompts used the same tier, ambiguous follow-ups inherit that tier instead of falling to default. Resets on topic change (Jaccard similarity < 0.3), idle timeout (10 min), or inline override.
- **Prompt complexity heuristic**: pre-classifier stage short-circuits to "quick" for trivially short prompts (<30 tokens, no code blocks, no frontier keywords) and escalates to "frontier" for complex prompts (200+ tokens, 3+ file references, or multi-paragraph with code). Reduces LLM classifier calls by 15-25%.
- **Tier descriptions in classifier prompt**: LLM classifier now receives auto-generated descriptions of what each tier handles (extracted from regex rules at build time), improving classification accuracy for ambiguous prompts.
- **Expanded general-tier regex rules**: 6 new rules cover refactoring, implementation, explanation, documentation, error handling, and API integration — previously only test-writing matched the general tier.
- **Implicit feedback loop**: cache entries track demotion signals from manual model overrides. After 3 demotions, an entry's tier auto-escalates (quick→general, general→frontier).
- **Parallel classification**: LLM classifier and regex rules now execute concurrently instead of sequentially, reducing routing latency by 200-500ms on cache-miss prompts.
- **Cache warm-start**: on first use, cache is pre-seeded with representative phrases from regex rules, eliminating cold-start LLM classifier calls for common patterns.
- **Rule learning module**: new `suggestRules()` analyzes cache entries to identify recurring prompt bigrams and proposes new regex rules, reducing future classifier dependency.

## 0.2.0
- Improved model discovery and model categorization logic.

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