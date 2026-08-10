# Pi-Bifrost

Query-aware model routing extension for [Pi](https://pi.dev). Classifies prompts by complexity and switches Pi's active model before generation starts.

> **Fork of [iamaamir/pi-bifrost](https://github.com/iamaamir/pi-bifrost)** by [Aamir](https://github.com/iamaamir). Original work licensed MIT.

> **Disclaimer:** This fork is a personal project published for posterity and sharing purposes only. No warranties or guarantees of any kind are provided. Use at your own risk.

## What it does

Bifrost intercepts each prompt and routes it to a configured model tier (`quick`, `general`, `frontier`) based on regex rules, cached classifications, or an optional LLM classifier. It performs a native model switch — Pi uses the selected provider/model for the entire turn.

```text
"summarize this file"         -> quick model
"debug this race condition"   -> frontier model
```

If a model fails repeatedly, a persistent circuit breaker opens and routes future prompts to healthy alternatives. Bifrost never silently replays a failed prompt.

## Differences from upstream

This fork adds:

- **Model discovery** (`discovery.ts`) — scans scoped and free-tier model sources, deduplicates, guesses tiers, and reconciles against existing config
- **Subscription quota routing** (`quota.ts`) — fetches weekly quota for OpenAI Codex and Google Antigravity providers; `subscription_balance` strategy weights candidates by remaining allowance, draining subscriptions before paid OpenRouter
- **EISDIR fix** (`storage.ts`, `commands.ts`) — `readTextFile` now guards against directories passed as file paths, preventing `EISDIR: illegal operation on a directory, read` errors
- **Expanded routing strategies** — `subscription_balance` joins existing strategies (`cheapest`, `first`, `random`, etc.)

## Install

```bash
pi install npm:pi-bifrost
```

From source:

```bash
pi install git:github.com/mooreceipts/pi-bifrost
```

Original upstream:

```bash
pi install git:github.com/iamaamir/pi-bifrost
```

## Setup

```
/bifrost init
```

Probes every available model, finds working ones, and writes a config. Bifrost routes prompts after that.

## Commands

| Command | What it does |
|---------|-------------|
| `/bifrost` | Dashboard with mode/model status |
| `/bifrost init` | Probe models and generate config |
| `/bifrost init --scoped --free` | Init with model discovery from scoped/free sources |
| `/bifrost probe` | Test which models respond |
| `/bifrost preview <prompt>` | Inspect routing decision without sending |
| `/bifrost on` / `off` | Enable / disable routing |
| `/bifrost pin` / `unpin` | Lock current model / resume routing |
| `/bifrost reload` | Reload config from disk |
| `/bifrost cache stats` / `clear` | Inspect or clear classification cache |
| `/bifrost classifier on` / `off` / `status` | Toggle LLM classifier |

## Config

Config merges from four layers (later wins):

1. Extension default (`<extensionDir>/bifrost.json`)
2. Global (`~/.pi/agent/bifrost.json`)
3. Project root (`bifrost.json`)
4. Project config (`.pi/bifrost.json`)

### Tiers and models

```json
{
  "models": {
    "quick": ["opencode/deepseek-v4-flash-free"],
    "general": ["opencode-go/deepseek-v4-pro", "openai-codex/gpt-5.4-mini"],
    "frontier": ["openai-codex/gpt-5.6-sol"]
  }
}
```

Use `provider/id` for exact match or a substring like `qwen` for pattern match.

### Strategies

| Strategy | Picks |
|----------|-------|
| `cheapest` | Lowest total cost |
| `cheapest_input` / `cheapest_output` | Lowest input or output cost |
| `largest_context` | Biggest context window |
| `random` | Random pick |
| `first` / `fastest` | First in list |
| `subscription_balance` | Weighted by remaining weekly quota (this fork) |

### Routing rules

Regex patterns mapping prompts to tiers. First match wins. Case insensitive.

```json
{
  "rules": [
    { "pattern": "\\bcommit\\b", "model": "quick" },
    { "pattern": "\\b(debug|stack trace|crash)\\b", "model": "frontier" }
  ]
}
```

Direct model bindings: use `provider/id` instead of a tier name to bypass tier selection.

### Inline override

Type a tier name as first word to force it for one message:

```
frontier debug this race condition
quick summarize this
```

### Classifier

Optional LLM classifier for more accurate routing than regex alone:

```json
{
  "classifier": {
    "enabled": true,
    "model": "opencode/mimo-v2.5-free"
  }
}
```

Falls back to regex rules on failure.

### Quota routing (this fork)

Routes based on subscription quota remaining for Codex and Antigravity:

```json
{
  "quotaRouting": {
    "reservePercent": 0.03,
    "gamma": 3,
    "staleMinutes": 15,
    "refreshMinutes": 30
  }
}
```

Drains subscription allowances before falling back to paid providers.

### Reliability

Circuit breaker for flaky models:

```json
{
  "reliability": {
    "enabled": true,
    "failureThreshold": 3,
    "windowMinutes": 5,
    "cooldownMinutes": 60
  }
}
```

Opens circuit after repeated failures, auto-recovers after cooldown with a single trial request.

## Testing

```bash
npm test                       # unit tests
npm run test:integration       # integration tests
npm run test:ui                # Pi TUI smoke tests
npm run test:ui:reliability    # reliability E2E with fake provider
```

## Credits

Original author: [Aamir](https://github.com/iamaamir) — [iamaamir/pi-bifrost](https://github.com/iamaamir/pi-bifrost)

Companion project: [Bifrost Patterns](https://github.com/iamaamir/bifrost-pattern) — multi-model orchestration patterns built on Bifrost.

## License

MIT — see original repository for full license text.
