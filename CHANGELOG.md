# Changelog

All notable changes to pi-bifrost are documented here.

## [0.1.1]

### Fixed
- `runProbe` now accepts optional `models` parameter — discovery-restricted probing (`--scoped`/`--free`) passes discovered models instead of probing entire registry
- `QuotaStore.refreshIfStale` caches empty results — no longer re-fetches on every prompt when no subscription credentials exist
- `resolveTierDisplay` passes quota snapshot and config to `resolveModelWithFallback` — `/bifrost preview` now shows correct model selection under `subscription_balance` strategy
- `QuotaStore` config updated on `/bifrost reload` — `quotaRouting` changes (static provider overrides, refreshMinutes) take effect without restart
- `billingClass` regex no longer matches `google`/`gemini` providers that QuotaStore doesn't track — untracked providers get neutral weight instead of being penalized
- Auth token refresh writes `auth.json` atomically via temp file + rename — concurrent sessions no longer clobber each other's refresh tokens

## [0.1.0]

### Changed
- Synced fork to upstream v0.3.13
- Added `discovery.ts` (model discovery across scoped/free sources) and `quota.ts` (subscription-aware routing)
- Fixed EISDIR error in `storage.ts` and `commands.ts` — directory guard on file reads
- Single-prompt pin: manual model change pins for one prompt only, auto-unpins on submit
- Model change notification overwrites same line instead of stacking
- Rewrote README with fork attribution and disclaimer
- Updated `.npmignore` for cleaner npm package
