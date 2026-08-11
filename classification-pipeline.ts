import type { ClassifierModel } from "./classifier.ts";
import { classify as regexClassify, type RouteRule } from "./routing.ts";
import { debug, debugMeasure } from "./debug.ts";
import type { SessionRoutingContext } from "./session-context.ts";
import { assessComplexity } from "./complexity.ts";

// ── ADT result type ────────────────────────────────────────────

export type ClassificationSource = "cache" | "classifier" | "regex" | "inline";

export type ClassificationResult =
  | { readonly kind: "classified"; readonly tier: string; readonly source: ClassificationSource }
  | { readonly kind: "fallback"; readonly tier: string }
  | { readonly kind: "unclassified" };

// ── Pipeline dependencies ──────────────────────────────────────

/**
 * Dependencies injected into the pipeline. All are in-process.
 *
 * `cacheLookup` may internally mutate its backing store for LRU
 * tracking — this is an accepted impurity (see ADR candidate #4).
 */
export interface PipelineDeps {
  /** Query cache. Returns tier or undefined. */
  readonly cacheLookup: (text: string) => string | undefined;
  /** Classifier models in priority order. Empty array = skip LLM. */
  readonly classifierModels: readonly ClassifierModel[];
  /** Invoke the LLM classifier for a single model. Returns tier or undefined. */
  readonly classifyWithLLM: (
    model: ClassifierModel,
    text: string,
    tiers: readonly string[],
  ) => Promise<string | undefined>;
  /** Regex routing rules. First match wins. */
  readonly regexRules: readonly RouteRule[];
  /** Default tier when nothing matches. */
  readonly defaultTier: string | undefined;
  /** Known tier names, from config.models keys. */
  readonly tiers: readonly string[];
  /** Session routing context for multi-turn momentum. */
  readonly sessionContext?: SessionRoutingContext;
  /** Enable complexity-based short-circuiting. */
  readonly complexityEnabled?: boolean;
}

// ── Pipeline interface ─────────────────────────────────────────

export interface ClassificationPipeline {
  readonly classify: (text: string) => Promise<ClassificationResult>;
}

// ── Factory ────────────────────────────────────────────────────

export function createPipeline(deps: PipelineDeps): ClassificationPipeline {
  const {
    cacheLookup,
    classifierModels,
    classifyWithLLM,
    regexRules,
    defaultTier,
    tiers,
    sessionContext,
    complexityEnabled,
  } = deps;

  async function classify(text: string): Promise<ClassificationResult> {
    // Stage 1: pre-check regex for direct model references only.
    {
      const endPre = debugMeasure("pipeline", "regex_pre");
      const pre = regexClassify(text, regexRules);
      endPre({ match: !!pre, tier: pre });
      if (pre && pre.includes("/") && !tiers.includes(pre)) {
        debug("pipeline", "result", { source: "regex", tier: pre, direct: true });
        return { kind: "classified", tier: pre, source: "regex" };
      }
    }

    if (tiers.length === 0) return { kind: "unclassified" };

    // Stage 2: cache lookup
    const endCache = debugMeasure("pipeline", "cache");
    const cached = cacheLookup(text);
    endCache({ hit: !!cached });
    if (cached && tiers.includes(cached)) {
      debug("pipeline", "result", { source: "cache", tier: cached });
      return { kind: "classified", tier: cached, source: "cache" };
    }

    // Stage 2.5: session momentum — reuse recent tier if conversation continues
    if (sessionContext) {
      const endSession = debugMeasure("pipeline", "session");
      const sessionTier = sessionContext.suggest(text);
      endSession({ tier: sessionTier });
      if (sessionTier && tiers.includes(sessionTier)) {
        debug("pipeline", "result", { source: "cache", tier: sessionTier, sessionMomentum: true });
        return { kind: "classified", tier: sessionTier, source: "cache" };
      }
    }

    // Stage 2.75: complexity heuristic — short-circuit for obvious cases
    if (complexityEnabled !== false) {
      const endComplexity = debugMeasure("pipeline", "complexity");
      const verdict = assessComplexity(text, tiers);
      endComplexity({ verdict });
      if (verdict && tiers.includes(verdict)) {
        debug("pipeline", "result", { source: "regex", tier: verdict, complexity: true });
        return { kind: "classified", tier: verdict, source: "regex" };
      }
    }

    // Stage 3: LLM classifier + regex rules in parallel
    if (classifierModels.length > 0) {
      const classifierPromise = (async (): Promise<string | undefined> => {
        for (const model of classifierModels) {
          try {
            const endLLM = debugMeasure("pipeline", "classifier.attempt");
            const tier = await classifyWithLLM(model, text, tiers);
            const modelId = model.kind === "registry" ? model.model.id : model.id;
            endLLM({ model: modelId, tier });
            if (tier && tiers.includes(tier)) return tier;
          } catch (err) {
            debug("pipeline", "classifier.error", { error: String(err) });
            console.error(`[bifrost] classifier model failed: ${err}`);
          }
        }
        return undefined;
      })();

      const endRegex = debugMeasure("pipeline", "regex");
      const regexResult = regexClassify(text, regexRules);
      endRegex({ match: !!regexResult, tier: regexResult });

      const classifierResult = await classifierPromise;

      if (classifierResult) {
        debug("pipeline", "result", { source: "classifier", tier: classifierResult });
        return { kind: "classified", tier: classifierResult, source: "classifier" };
      }

      if (regexResult) {
        if (tiers.includes(regexResult)) {
          debug("pipeline", "result", { source: "regex", tier: regexResult });
          return { kind: "classified", tier: regexResult, source: "regex" };
        }
        if (regexResult.includes("/")) {
          debug("pipeline", "result", { source: "regex", tier: regexResult, direct: true });
          return { kind: "classified", tier: regexResult, source: "regex" };
        }
      }
    } else {
      // No classifier models — regex only
      const endRegex = debugMeasure("pipeline", "regex");
      const regex = regexClassify(text, regexRules);
      endRegex({ match: !!regex, tier: regex });
      if (regex) {
        if (tiers.includes(regex)) {
          debug("pipeline", "result", { source: "regex", tier: regex });
          return { kind: "classified", tier: regex, source: "regex" };
        }
        if (regex.includes("/")) {
          debug("pipeline", "result", { source: "regex", tier: regex, direct: true });
          return { kind: "classified", tier: regex, source: "regex" };
        }
      }
    }

    // Stage 4: default fallback
    debug("pipeline", "result", { source: "fallback", tier: defaultTier });
    if (defaultTier) {
      return { kind: "fallback", tier: defaultTier };
    }

    return { kind: "unclassified" };
  }

  return { classify };
}
