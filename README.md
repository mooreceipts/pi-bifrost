# Pi-Bifrost

Native model routing for [Pi](https://pi.dev). Before generation starts, Bifrost switches Pi's active model based on prompt complexity, routing rules, or LLM classification.

```text
"summarize this file"         → quick model
"debug this race condition"   → frontier model
```

## Disclaimer

This repository exists for **learning and personal use**. It is shared publicly for posterity and community benefit. There are **no guarantees or warranties**, express or implied, regarding fitness for any particular purpose, reliability, or correctness. **Caveat emptor** — use at your own risk.

This is not an official product. It may break, drift from upstream, or stop working without notice.

## Attribution

Pi-Bifrost is a fork and continuation of [Pi-Bifrost](https://github.com/iamaamir/pi-bifrost), originally created by [Aamir (`@iamaamir`)](https://github.com/iamaamir). Core architecture, routing foundation, reliability/circuit-breaker design, command interface, tests, documentation, and project identity remain credited to that project and author.

See [NOTICE.md](NOTICE.md) and [CHANGELOG.md](CHANGELOG.md) for full attribution and change history.

## What This Fork Adds

| Area | Original | This fork |
|------|----------|-----------|
| Model selection strategy | `first`, `cheapest`, `random`, `largest_context` | Adds `subscription_balance`; opted-in categories favor Codex or Antigravity when one has over 2 percentage points more weekly quota, otherwise preserve configured order |
| Credit spend policy | All candidates equally eligible | Subscription providers (Codex, Antigravity) preferred; paid OpenRouter candidates blocked until subscriptions drain past `reservePercent` |
| Model discovery | Probes all Pi models | Adds `--scoped` (Pi enabled-models only) and `--free` (top 5 OpenRouter free models by collection ranking, or top 5 fastest if ranking fetch fails) flags for `init` and `update`; `update --free` enforces the same cap |
| Reliability | Threshold-based circuit breaker | Instant circuit-open on HTTP 400+ errors (429 rate limits, auth failures, server errors); next prompt auto-routes to a different model |
| Config reconciliation | `init` only | Adds `/bifrost update --scoped/--free` to preview and merge discovery results while preserving manual entries |
| Silent mode | Not available | `/bifrost silence` / `unsilence` suppresses console and UI output without disabling routing |
| Error diagnostics | Raw stderr dumps | Structured error messages with corrective actions; `/bifrost doctor` validates config against live registry |
| Classification pipeline | 4-stage waterfall (cache→LLM→regex→default) | 7-stage adaptive pipeline: regex pre-check → cache → session momentum → complexity heuristic → parallel LLM+regex → default |
| Classifier accuracy | Tier names only in LLM prompt | Auto-generated tier descriptions from regex rules injected into classifier prompt |
| Multi-turn routing | Each prompt classified independently | Session momentum: 2+ same-tier classifications carry forward; topic-change detection resets momentum |
| Routing latency | Sequential: cache miss → LLM → regex | Parallel: LLM classifier and regex execute concurrently; complexity heuristic skips LLM for obvious cases |
| Self-correction | Static cache, no feedback | Demotion tracking on manual overrides; cache entries auto-escalate tier after 3 demotions |
| Cold start | Empty cache → every prompt hits LLM | Cache warm-start seeds entries from regex rules on first use |

### How the Improved Routing Pipeline Works

The original Bifrost pipeline was a 4-stage waterfall: try the cache, then ask an LLM classifier, then fall back to regex rules, then use the default tier. Each prompt was classified independently with no memory of recent context, no awareness of prompt complexity, and no feedback from routing outcomes.

The improved pipeline addresses each of these gaps:

1. **Session momentum** prevents tier thrashing in multi-turn conversations. If you're debugging across several prompts, ambiguous follow-ups like "yes, try that" stay on the frontier tier instead of dropping to general.

2. **Complexity heuristics** skip the LLM classifier entirely for clear-cut cases — a 3-word formatting request goes straight to quick tier, a 500-line multi-file paste goes straight to frontier. This reduces classifier calls by 15-25%.

3. **Tier descriptions** tell the classifier LLM what each tier actually handles (auto-generated from your regex rules), instead of just sending bare tier names. This improves accuracy for ambiguous prompts.

4. **Parallel execution** runs the LLM classifier and regex rules concurrently instead of sequentially, saving 200-500ms per cache-miss prompt.

5. **Self-correction** tracks when you manually override a routing decision. After 3 such signals on the same prompt pattern, the cache entry's tier auto-escalates.

6. **Warm start** pre-seeds the cache from your regex rules on first use, so common patterns route instantly without waiting for the LLM classifier.

## Install

From npm (scoped):

```bash
pi install npm:@tenchi4u/pi-bifrost
```

From source:

```bash
pi install git:github.com/mooreceipts/pi-bifrost
```

## Setup

Run once after install:

```
/bifrost init
```

This probes every model you have access to, finds which ones respond, and writes a config. Bifrost routes prompts from that point forward.

Narrow discovery scope when needed:

```text
/bifrost init --scoped          # Pi scoped-models selection only
/bifrost init --free            # OpenRouter free tier only
/bifrost init --scoped --free   # union of both
```

## Usage

| Command | What it does |
|---------|-------------|
| `/bifrost` | Dashboard with mode, model, and quick actions |
| `/bifrost init` | Probe models and generate config (shows tier breakdown, errors, and model list before writing) |
| `/bifrost on` / `off` | Enable or disable routing |
| `/bifrost pin` / `unpin` | Lock current model for this session |
| `/bifrost silence` / `unsilence` | Suppress or restore console output |
| `/bifrost preview <prompt>` | See routing decision without sending |
| `/bifrost reload` | Reload config after manual edits |
| `/bifrost doctor` | Validate config against available models |
| `/bifrost classifier on` / `off` | Toggle LLM classifier |

Force a tier for one message by prefixing it:

```
frontier debug this race condition
quick summarize this
```

## Config

Config merges from multiple paths (later wins):

1. Extension default (`<extensionDir>/bifrost.json`)
2. Global (`~/.pi/agent/bifrost.json`)
3. Project root (`bifrost.json`)
4. Project config (`.pi/bifrost.json`)

Minimal config after `init`:

```json
{
  "enabled": true,
  "default": "general",
  "strategy": "first",
  "models": {
    "quick": ["opencode/deepseek-v4-flash-free"],
    "general": ["opencode-go/deepseek-v4-pro"],
    "frontier": ["openai-codex/gpt-5.6-sol"]
  }
}
```

See the [full config reference](docs/) and [examples/](examples/) for advanced options including routing rules, classifier setup, reliability tuning, and quota-aware routing.

## Testing

```bash
npm test                       # unit tests
npm run test:integration       # integration tests
npm run test:ui                # Pi TUI smoke tests
npm run test:ui:reliability    # reliability E2E with fake provider
```

## Related

[Bifrost Patterns](https://github.com/iamaamir/bifrost-pattern) — prompt workflows built on top of Bifrost routing (scouts, reviewers, model comparisons). Optional, not required.

## License

MIT. See [NOTICE.md](NOTICE.md) for attribution details.
