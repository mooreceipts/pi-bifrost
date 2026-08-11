export type CollectionRanking = Map<string, number>;

const COLLECTION_URL = "https://openrouter.ai/collections/free-models";
const FETCH_TIMEOUT_MS = 6000;

export async function fetchFreeModelRanking(): Promise<CollectionRanking | null> {
  try {
    const res = await fetch(COLLECTION_URL, { signal: AbortSignal.timeout(FETCH_TIMEOUT_MS) });
    if (!res.ok) return null;
    return parseCollectionHtml(await res.text());
  } catch {
    return null;
  }
}

export function parseCollectionHtml(html: string): CollectionRanking | null {
  const slugs: string[] = [];
  const seen = new Set<string>();
  for (const match of html.matchAll(/href="\/([a-z0-9_-]+\/[a-z0-9._-]+(?::free))"/gi)) {
    const slug = match[1];
    if (!seen.has(slug)) {
      seen.add(slug);
      slugs.push(slug);
    }
  }
  if (slugs.length === 0) return null;
  return new Map(slugs.map((slug, index) => [slug, index]));
}

function openRouterSlug(key: string): string {
  return key.slice(key.indexOf("/") + 1);
}

export const FREE_MODEL_LIMIT = 5;

/**
 * Sort a tier's models in place: non-free first, then free. Non-free
 * models are ordered by probe duration ascending (missing = Infinity —
 * probe speed is the measured signal, not context window). Free models
 * are ordered by collection rank ascending (unranked = Infinity), tied
 * on probe duration ascending; when `ranking` is null, free models fall
 * back to probe duration ascending too.
 */
export function sortTierModels(
  models: string[],
  ranking: CollectionRanking | null,
  freeKeys: ReadonlySet<string>,
  durationByKey: Map<string, number>,
): void {
  models.sort((a, b) => {
    const aFree = freeKeys.has(a);
    const bFree = freeKeys.has(b);

    if (aFree !== bFree) return aFree ? 1 : -1;

    const durationA = durationByKey.get(a) ?? Infinity;
    const durationB = durationByKey.get(b) ?? Infinity;

    if (!aFree) return durationA - durationB;

    if (!ranking) return durationA - durationB;
    const rankA = ranking.get(openRouterSlug(a)) ?? Infinity;
    const rankB = ranking.get(openRouterSlug(b)) ?? Infinity;
    if (rankA !== rankB) return rankA - rankB;
    return durationA - durationB;
  });
}

/**
 * Cap discovered free models to the top `limit`, verified-only.
 * Ranked by collection rank ascending (unranked = Infinity), tied on
 * probe duration ascending; when `ranking` is null, sorted purely by
 * probe duration ascending.
 */
export function capFreeModels<T>(
  freeModels: T[],
  keyOf: (m: T) => string,
  verifiedKeys: ReadonlySet<string>,
  ranking: CollectionRanking | null,
  durationByKey: Map<string, number>,
  limit = FREE_MODEL_LIMIT,
): T[] {
  const verified = freeModels.filter((m) => verifiedKeys.has(keyOf(m)));
  const sorted = [...verified].sort((a, b) => {
    const keyA = keyOf(a);
    const keyB = keyOf(b);
    const durationA = durationByKey.get(keyA) ?? Infinity;
    const durationB = durationByKey.get(keyB) ?? Infinity;

    if (!ranking) return durationA - durationB;
    const rankA = ranking.get(openRouterSlug(keyA)) ?? Infinity;
    const rankB = ranking.get(openRouterSlug(keyB)) ?? Infinity;
    if (rankA !== rankB) return rankA - rankB;
    return durationA - durationB;
  });
  return sorted.slice(0, limit);
}
