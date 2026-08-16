# Graph Report - pi-bifrost  (2026-08-16)

## Corpus Check
- cluster-only mode — file stats not available

## Summary
- 1077 nodes · 1894 edges · 54 communities (53 shown, 1 thin omitted)
- Extraction: 99% EXTRACTED · 1% INFERRED · 0% AMBIGUOUS · INFERRED: 21 edges (avg confidence: 0.7)
- Token cost: 0 input · 0 output

## Graph Freshness
- Built from commit: `045b61bc`
- Run `git rev-parse HEAD` and compare to check if the graph is stale.
- Run `graphify update .` after code changes (no API cost).

## Community Hubs (Navigation)
- Community 0
- Community 1
- Community 2
- Community 3
- Community 4
- Community 5
- Community 6
- Community 7
- Community 8
- Community 9
- Community 10
- Community 11
- Community 12
- Community 13
- Community 14
- Community 15
- Community 16
- Community 17
- Community 18
- Community 19
- Community 20
- Community 21
- Community 22
- Community 23
- Community 24
- Community 25
- Community 26
- Community 27
- Community 28
- Community 29
- Community 30
- Community 31
- Community 32
- Community 33
- Community 34
- Community 35
- Community 36
- Community 37
- Community 38
- Community 39
- Community 40
- Community 41
- Community 42
- Community 43
- Community 44
- Community 45
- Community 46
- Community 47
- Community 48
- Community 49
- Community 50
- Community 51
- Community 53
- Community 55

## God Nodes (most connected - your core abstractions)
1. `bifrostExtension()` - 51 edges
2. `createCommandRouter()` - 41 edges
3. `ReliabilityStore` - 22 edges
4. `handleInit()` - 20 edges
5. `debug()` - 19 edges
6. `handleUpdate()` - 19 edges
7. `modelKey()` - 18 edges
8. `enum` - 17 edges
9. `Screen` - 15 edges
10. `models` - 15 edges

## Surprising Connections (you probably didn't know these)
- `reconcileDiscoveredModels()` --indirect_call--> `modelKey()`  [INFERRED]
  discovery.ts → routing.ts
- `BifrostState` --references--> `BifrostConfig`  [EXTRACTED]
  commands.ts → config.ts
- `BifrostConfig` --references--> `ReliabilityConfig`  [EXTRACTED]
  config.ts → reliability.ts
- `BifrostConfig` --references--> `RouteRule`  [EXTRACTED]
  config.ts → routing.ts
- `DiscoveryDiff` --references--> `BifrostConfig`  [EXTRACTED]
  discovery.ts → config.ts

## Import Cycles
- None detected.

## Communities (54 total, 1 thin omitted)

### Community 0 - "Community 0"
Cohesion: 0.08
Nodes (33): CacheOptions, ALL_STRATEGIES, BifrostConfig, ClassifierConfig, ClassifierMethod, ConfigIssue, DEFAULT_RULES, DiscoveryConfig (+25 more)

### Community 1 - "Community 1"
Cohesion: 0.06
Nodes (49): ClassificationResult, ClassificationSource, createPipeline(), classify(), PipelineDeps, categoryLabel(), classificationPrompt(), classifierBaseUrl() (+41 more)

### Community 2 - "Community 2"
Cohesion: 0.06
Nodes (54): QuotaSnapshot, beginTrial(), CircuitState, DEFAULT_RELIABILITY, emptyReliabilityState(), getCircuitState(), loadReliability(), normalizeRecord() (+46 more)

### Community 3 - "Community 3"
Cohesion: 0.05
Nodes (53): advisory, apply, cheapest, cheapest_input, cheapest_output, fastest, first, high (+45 more)

### Community 4 - "Community 4"
Cohesion: 0.04
Nodes (48): agent-tui, @earendil-works/pi-ai, @earendil-works/pi-coding-agent, author, name, url, bugs, url (+40 more)

### Community 5 - "Community 5"
Cohesion: 0.04
Nodes (46): frontier, general, quick, oneOf, $ref, $ref, $ref, default (+38 more)

### Community 6 - "Community 6"
Cohesion: 0.05
Nodes (40): cache, enabled, maxEntries, threshold, categoryStrategies, architecture, code_review, debugging (+32 more)

### Community 7 - "Community 7"
Cohesion: 0.05
Nodes (39): auto, direct, subprocess, properties, description, type, default, description (+31 more)

### Community 8 - "Community 8"
Cohesion: 0.20
Nodes (16): cachePath(), DEFAULT_MAX_ENTRIES, DEFAULT_THRESHOLD, demoteCacheEntry(), evictIfNeeded(), findCachedCategory(), loadCache(), lookupCache() (+8 more)

### Community 9 - "Community 9"
Cohesion: 0.06
Nodes (31): cache, enabled, maxEntries, threshold, categoryStrategies, frontier, general, quick (+23 more)

### Community 10 - "Community 10"
Cohesion: 0.07
Nodes (29): cache, enabled, maxEntries, threshold, categoryStrategies, frontier, general, quick (+21 more)

### Community 11 - "Community 11"
Cohesion: 0.08
Nodes (25): default, description, minimum, type, gamma, providers, refreshMinutes, reservePercent (+17 more)

### Community 12 - "Community 12"
Cohesion: 0.14
Nodes (15): Event, FreeTypeFont, ImageFont, Path, Popen, capture(), Cell, load_font() (+7 more)

### Community 13 - "Community 13"
Cohesion: 0.12
Nodes (23): CacheEntry, ClassificationPipeline, BifrostState, getBifrostCommandCompletions(), logOverwrite(), setBifrostSilent(), generateTierDescriptions(), loadConfig() (+15 more)

### Community 14 - "Community 14"
Cohesion: 0.16
Nodes (26): models, frontier, general, quick, provider/best-available-model, provider/cheap-coding-model, provider/free-coding-model, provider/free-fast-model (+18 more)

### Community 15 - "Community 15"
Cohesion: 0.12
Nodes (14): decideThinking(), assessThinking(), clampToModel(), compareThinkingLevels(), countQuestionMarks(), fileReferenceCount(), LEVELS, scoreThinking (+6 more)

### Community 16 - "Community 16"
Cohesion: 0.08
Nodes (24): cache, enabled, maxEntries, threshold, categoryStrategies, economical, frontier, classifier (+16 more)

### Community 17 - "Community 17"
Cohesion: 0.08
Nodes (23): categoryStrategies, frontier, general, quick, _comment, default, enabled, models (+15 more)

### Community 18 - "Community 18"
Cohesion: 0.14
Nodes (15): copyButtons, copyStatus, gatewayCanvas, reducedMotionQuery, setupGatewayAnimation(), createRoutes(), cubicPoint(), draw() (+7 more)

### Community 19 - "Community 19"
Cohesion: 0.10
Nodes (20): node, node_modules, tests/**/*.ts, *.ts, compilerOptions, allowImportingTsExtensions, forceConsistentCasingInFileNames, module (+12 more)

### Community 20 - "Community 20"
Cohesion: 0.16
Nodes (37): applyProbeOutcomes(), BIFROST_COMMAND_OPTIONS, buildInitProposal(), clearBifrostWidgets(), CommandEntry, CommandFn, CommandSpec, createCommandRouter() (+29 more)

### Community 21 - "Community 21"
Cohesion: 0.10
Nodes (19): cache, enabled, maxEntries, threshold, categoryStrategies, economical, frontier, classifier (+11 more)

### Community 22 - "Community 22"
Cohesion: 0.19
Nodes (9): fetchAnthropicQuota(), fetchAntigravityQuota(), fetchCodexQuota(), getAnthropicToken(), getAntigravityToken(), getAuth(), getCodexAccess(), ProviderQuota (+1 more)

### Community 23 - "Community 23"
Cohesion: 0.22
Nodes (9): additionalProperties, description, properties, type, DebugConfig, default, description, type (+1 more)

### Community 24 - "Community 24"
Cohesion: 0.19
Nodes (9): AGENT_TUI_SESSION_STORE, AGENT_TUI_SOCKET, AGENT_TUI_UI_STATE, AGENT_TUI_WS_DISABLED, AGENT_TUI_WS_STATE, poll_until(), prompt(), ui-reliability-fake-provider.sh script (+1 more)

### Community 25 - "Community 25"
Cohesion: 0.23
Nodes (10): AGENT_TUI_SESSION_STORE, AGENT_TUI_SOCKET, AGENT_TUI_UI_STATE, AGENT_TUI_WS_DISABLED, AGENT_TUI_WS_STATE, send_command(), ui-smoke-agent-tui.sh script, snapshot() (+2 more)

### Community 26 - "Community 26"
Cohesion: 0.27
Nodes (10): BifrostModeState, formatBifrostStatus(), modeLabel(), REGISTRY_REFRESH_TTL_MS, RegistryRefreshState, setBifrostModeStatus(), setBifrostStatus(), setBifrostWorkingMessage() (+2 more)

### Community 27 - "Community 27"
Cohesion: 0.18
Nodes (12): model, pattern, additionalProperties, description, required, type, definitions, ClassifierConfig (+4 more)

### Community 28 - "Community 28"
Cohesion: 0.22
Nodes (5): AssistantOutcome, modelKey(), RuntimeFailure, RuntimeReliabilityTracker, succeeded

### Community 29 - "Community 29"
Cohesion: 0.28
Nodes (9): models, frontier, models, economical, frontier, frontier, openai-codex/gpt-5.4, opencode-go/kimi-k3 (+1 more)

### Community 30 - "Community 30"
Cohesion: 0.15
Nodes (12): categoryStrategies, deep, long-context, quick, default, enabled, models, long-context (+4 more)

### Community 31 - "Community 31"
Cohesion: 0.12
Nodes (17): free, managed, scoped, items, uniqueItems, DiscoveryConfig, additionalProperties, description (+9 more)

### Community 32 - "Community 32"
Cohesion: 0.29
Nodes (4): isEscapeKey(), ResultTheme, ResultViewer, wrapResultLines()

### Community 33 - "Community 33"
Cohesion: 0.25
Nodes (8): ReliabilityConfig, description, type, path, additionalProperties, description, properties, type

### Community 34 - "Community 34"
Cohesion: 0.33
Nodes (8): args, bumpVersion(), getLatestTag(), main(), parseVersion(), ROOT, run(), SCRIPT_DIR

### Community 35 - "Community 35"
Cohesion: 0.44
Nodes (7): capFreeModels(), CollectionRanking, fetchFreeModelRanking(), FREE_MODEL_LIMIT, openRouterSlug(), parseCollectionHtml(), sortTierModels()

### Community 36 - "Community 36"
Cohesion: 0.22
Nodes (8): classifier, enabled, model, default, enabled, rules, $schema, strategy

### Community 37 - "Community 37"
Cohesion: 0.28
Nodes (9): economical, lmstudio/openai/gpt-oss-20b, ollama/qwen2.5-coder:latest, quick, models, economical, frontier, lmstudio/openai/gpt-oss-120b (+1 more)

### Community 38 - "Community 38"
Cohesion: 0.25
Nodes (7): default, enabled, models, economical, rules, $schema, strategy

### Community 39 - "Community 39"
Cohesion: 0.36
Nodes (6): assistantText(), PROBE_PROMPT_TEXT, probeOne(), ProbeResult, runProbe(), worker()

### Community 40 - "Community 40"
Cohesion: 0.39
Nodes (5): isExecutable(), resolveTestBinary(), scriptPath, trimEnvValue(), unique()

### Community 41 - "Community 41"
Cohesion: 0.38
Nodes (6): attempts, json(), port, server, sse(), stats

### Community 42 - "Community 42"
Cohesion: 0.33
Nodes (5): description, $id, $schema, title, type

### Community 43 - "Community 43"
Cohesion: 0.33
Nodes (6): default, description, maximum, minimum, type, maxEntries

### Community 44 - "Community 44"
Cohesion: 0.18
Nodes (11): additionalProperties, description, properties, type, CacheConfig, threshold, default, description (+3 more)

### Community 45 - "Community 45"
Cohesion: 0.33
Nodes (3): __dirname, EXTENSION_PATH, PI_ARGS

### Community 46 - "Community 46"
Cohesion: 0.22
Nodes (14): saveCache(), writeAndReloadConfig(), ADR-0015, DEFAULT_RUNTIME_STATE, loadRuntimeState(), PersistedModeState, RuntimeModeState, runtimeStatePath() (+6 more)

### Community 47 - "Community 47"
Cohesion: 0.40
Nodes (5): classifier, enabled, fallbackToRegex, method, model

### Community 48 - "Community 48"
Cohesion: 0.40
Nodes (5): default, description, minimum, type, cooldownMinutes

### Community 49 - "Community 49"
Cohesion: 0.40
Nodes (5): default, description, minimum, type, failureThreshold

### Community 50 - "Community 50"
Cohesion: 0.40
Nodes (5): windowMinutes, default, description, minimum, type

### Community 51 - "Community 51"
Cohesion: 0.40
Nodes (4): ctx, dispatch, logged, state

### Community 53 - "Community 53"
Cohesion: 0.50
Nodes (4): QuotaRoutingConfig, additionalProperties, description, type

## Knowledge Gaps
- **450 isolated node(s):** `ClassifierConfig`, `ClassifierMethod`, `ConfigIssue`, `DiscoveryConfig`, `BifrostTier` (+445 more)
  These have ≤1 connection - possible missing edges or undocumented components.
- **1 thin communities (<3 nodes) omitted from report** — run `graphify query` to explore isolated nodes.

## Suggested Questions
_Questions this graph is uniquely positioned to answer:_

- **Why does `definitions` connect `Community 27` to `Community 33`, `Community 3`, `Community 42`, `Community 44`, `Community 53`, `Community 23`, `Community 31`?**
  _High betweenness centrality (0.029) - this node is a cross-community bridge._
- **Why does `properties` connect `Community 5` to `Community 42`, `Community 3`, `Community 23`?**
  _High betweenness centrality (0.019) - this node is a cross-community bridge._
- **Why does `properties` connect `Community 11` to `Community 53`?**
  _High betweenness centrality (0.017) - this node is a cross-community bridge._
- **Are the 13 inferred relationships involving `bifrostExtension()` (e.g. with `getBifrostCommandCompletions()` and `getPipeline()`) actually correct?**
  _`bifrostExtension()` has 13 INFERRED edges - model-reasoned connections that need verification._
- **What connects `ClassifierConfig`, `ClassifierMethod`, `ConfigIssue` to the rest of the system?**
  _450 weakly-connected nodes found - possible documentation gaps or missing edges._
- **Should `Community 0` be split into smaller, more focused modules?**
  _Cohesion score 0.07926829268292683 - nodes in this community are weakly interconnected._
- **Should `Community 1` be split into smaller, more focused modules?**
  _Cohesion score 0.06299603174603174 - nodes in this community are weakly interconnected._