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

/**
 * Sort quick-tier models: non-free first (by context window desc),
 * then free by collection rank, then free not in collection last.
 */
export function applyCollectionSort(
  models: string[],
  ranking: CollectionRanking,
  freeKeys: ReadonlySet<string>,
  contextWindowByKey?: Map<string, number>,
): void {
  models.sort((a, b) => {
    const aFree = freeKeys.has(a);
    const bFree = freeKeys.has(b);

    if (!aFree && !bFree) {
      const ctxA = contextWindowByKey?.get(a) ?? 0;
      const ctxB = contextWindowByKey?.get(b) ?? 0;
      return ctxB - ctxA;
    }
    if (!aFree) return -1;
    if (!bFree) return 1;

    const rankA = ranking.get(openRouterSlug(a)) ?? Infinity;
    const rankB = ranking.get(openRouterSlug(b)) ?? Infinity;
    return rankA - rankB;
  });
}
