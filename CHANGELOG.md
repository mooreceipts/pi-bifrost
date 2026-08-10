# Changelog

All notable changes to pi-bifrost are documented here.

## [0.3.15] - 10-08-2026

### Added
- Statusline status formatting for Bifrost (`⚡ bifrost: on/off ~ pinned/unpinned ~ silence/unsilence`) registered under status key `bifrost`.

## [0.3.14] - 10-08-2026

### Added
- Silent mode configuration (`"silent": true`) to turn off all Pi console outputs and UI notifications while model routing remains active.
- `/bifrost silence` and `/bifrost unsilence` slash subcommands.
- Persisted `silent` state in `.pi/bifrost-state.json`.

## [0.1.1] - 10-08-2026

### Added
- `subscription_balance` routing strategy: weighs Codex/Antigravity candidates by weekly subscription allowance remaining and keeps paid OpenRouter-compatible candidates blocked until measured subscriptions reach the configured reserve.
- `quotaRouting` config (`reservePercent`, `gamma`, `staleMinutes`, `refreshMinutes`, optional provider overrides).
- Local, credential-safe quota telemetry for Codex and Antigravity; only normalized fractions/reset times enter routing state.
- Independent `/bifrost init --scoped`, `--free`, and combined discovery modes.
- `/bifrost update --scoped|--free` reconciliation with source ownership metadata, deduplication, and safe removal of discovery-managed entries only.
- Deterministic discovery and subscription-steering tests.
- Subscription-balanced frontier example and explicit original-project attribution.

### Changed
- Repository metadata now targets `mooreceipts/pi-pifrost` while crediting original author Aamir and `iamaamir/pi-bifrost`.
- Schema, README, ROADMAP, examples, generated init/update behavior, and package version updated for 1.0.0.

## [0.2.0] - UNRELEASED

### Added
- Inline tier override via first-word detection (`frontier debug this`)
- Config validation on startup (`validateConfig`)
- Extracted `parseInlineOverride` for testability
- User-facing config issue messages

### Changed
- Eliminated all `as unknown as` casts from production code
- Config merge order: `.pi/bifrost.json` now wins over root `bifrost.json`

## [0.1.7] - 2026-07-xx

### Added
- Direct model bindings via `"model": "provider/id"` in regex rules
- `parseInlineOverride` extraction
- Config validation
