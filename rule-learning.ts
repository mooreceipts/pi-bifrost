import type { CacheEntry } from "./cache.ts";
import type { RouteRule } from "./routing.ts";
import { debug } from "./debug.ts";

export interface LearnedRule extends RouteRule {
  source: "learned";
  hitCount: number;
}

export function suggestRules(
  cacheEntries: CacheEntry[],
  existingRules: readonly RouteRule[],
  tiers: readonly string[],
  minHits: number = 5,
  maxRules: number = 30,
): LearnedRule[] {
  const tierBigrams = new Map<string, Map<string, number>>();

  for (const entry of cacheEntries) {
    if (entry.synthetic) continue;
    if (!tiers.includes(entry.category)) continue;

    if (!tierBigrams.has(entry.category)) {
      tierBigrams.set(entry.category, new Map());
    }
    const bigrams = tierBigrams.get(entry.category)!;

    const tokens = entry.normalized.split(" ").filter(Boolean);
    for (let i = 0; i < tokens.length - 1; i++) {
      const bigram = `${tokens[i]} ${tokens[i + 1]}`;
      bigrams.set(bigram, (bigrams.get(bigram) ?? 0) + 1);
    }
  }

  const existingPatterns = new Set(
    existingRules.map((r) => r.pattern.toLowerCase()),
  );

  const suggestions: LearnedRule[] = [];

  for (const [tier, bigrams] of tierBigrams) {
    const sorted = [...bigrams.entries()]
      .filter(([, count]) => count >= minHits)
      .sort((a, b) => b[1] - a[1]);

    for (const [bigram, count] of sorted) {
      if (suggestions.length >= maxRules) break;

      const pattern = `\\b(${bigram.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})\\b`;
      if (existingPatterns.has(pattern.toLowerCase())) continue;

      suggestions.push({
        pattern,
        model: tier,
        source: "learned",
        hitCount: count,
      });
    }
  }

  debug("rule-learning", "suggestions", {
    count: suggestions.length,
    tiers: [...tierBigrams.keys()],
  });

  return suggestions;
}
