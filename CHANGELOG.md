# Changelog

All notable changes to pi-bifrost are documented here.

## [0.1.0]

### Changed
- copied commands.ts, routing.ts, config.ts, schema.json, index.ts from installed version
- New files added — discovery.ts (model discovery across sources) and quota.ts (subscription-aware routing)
- EISDIR fix preserved — storage.ts keeps our statSync().isDirectory() guard; re-applied same guard to new commands.ts
- Package.json updated — version and URLs updated to mooreceipts fork (hook applied 0.1.0)
- README rewritten — clean structure, mentions fork differences (discovery, quota routing, EISDIR fix), retains all credits to Aamir/iamaamir