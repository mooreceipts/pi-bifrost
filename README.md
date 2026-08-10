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
| Model selection strategy | `first`, `cheapest`, `random`, `largest_context` | Adds `subscription_balance` — weights candidates by weekly subscription quota remaining |
| Credit spend policy | All candidates equally eligible | Subscription providers (Codex, Antigravity) preferred; paid OpenRouter candidates blocked until subscriptions drain past `reservePercent` |
| Model discovery | Probes all Pi models | Adds `--scoped` (Pi enabled-models only) and `--free` (OpenRouter free tier only) flags for `init` and `update` |
| Config reconciliation | `init` only | Adds `/bifrost update --scoped/--free` to preview and merge discovery results while preserving manual entries |
| Silent mode | Not available | `/bifrost silence` / `unsilence` suppresses console and UI output without disabling routing |

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
| `/bifrost init` | Probe models and generate config |
| `/bifrost on` / `off` | Enable or disable routing |
| `/bifrost pin` / `unpin` | Lock current model for this session |
| `/bifrost silence` / `unsilence` | Suppress or restore console output |
| `/bifrost preview <prompt>` | See routing decision without sending |
| `/bifrost reload` | Reload config after manual edits |
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
