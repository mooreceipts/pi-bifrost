import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCollectionHtml, sortTierModels, capFreeModels, FREE_MODEL_LIMIT, type CollectionRanking } from "../collection-ranking.ts";

describe("parseCollectionHtml", () => {
  it("extracts model slugs in page order", () => {
    const html = `
      <a href="/nvidia/nemotron-3-ultra:free">Model A</a>
      <a href="/poolside/laguna-s-2.1:free">Model B</a>
      <a href="/google/gemma-4-26b:free">Model C</a>
    `;
    const ranking = parseCollectionHtml(html);
    assert.ok(ranking);
    assert.equal(ranking.get("nvidia/nemotron-3-ultra:free"), 0);
    assert.equal(ranking.get("poolside/laguna-s-2.1:free"), 1);
    assert.equal(ranking.get("google/gemma-4-26b:free"), 2);
    assert.equal(ranking.size, 3);
  });

  it("deduplicates repeated slugs", () => {
    const html = `
      <a href="/nvidia/test:free">A</a>
      <a href="/nvidia/test:free">A again</a>
    `;
    const ranking = parseCollectionHtml(html);
    assert.ok(ranking);
    assert.equal(ranking.size, 1);
    assert.equal(ranking.get("nvidia/test:free"), 0);
  });

  it("returns null when no model links found", () => {
    assert.equal(parseCollectionHtml("<html><body>No models</body></html>"), null);
  });

  it("returns null for empty string", () => {
    assert.equal(parseCollectionHtml(""), null);
  });

  it("ignores non-free hrefs", () => {
    const html = `
      <a href="/nvidia/paid-model">Paid</a>
      <a href="/nvidia/free-model:free">Free</a>
    `;
    const ranking = parseCollectionHtml(html);
    assert.ok(ranking);
    assert.equal(ranking.size, 1);
    assert.ok(ranking.has("nvidia/free-model:free"));
  });
});

describe("sortTierModels", () => {
  const ranking: CollectionRanking = new Map([
    ["nvidia/model-a:free", 0],
    ["poolside/model-b:free", 1],
    ["google/model-c:free", 2],
  ]);

  it("sorts free models by collection rank", () => {
    const models = [
      "openrouter/google/model-c:free",
      "openrouter/nvidia/model-a:free",
      "openrouter/poolside/model-b:free",
    ];
    const freeKeys = new Set(models);
    sortTierModels(models, ranking, freeKeys, new Map());
    assert.deepEqual(models, [
      "openrouter/nvidia/model-a:free",
      "openrouter/poolside/model-b:free",
      "openrouter/google/model-c:free",
    ]);
  });

  it("places non-free models before free models", () => {
    const freeKeys = new Set(["openrouter/nvidia/model-a:free"]);
    const models = [
      "openrouter/nvidia/model-a:free",
      "vendor/cheap-paid",
    ];
    sortTierModels(models, ranking, freeKeys, new Map());
    assert.equal(models[0], "vendor/cheap-paid");
    assert.equal(models[1], "openrouter/nvidia/model-a:free");
  });

  it("sorts non-free models by probe duration ascending", () => {
    const freeKeys = new Set<string>();
    const durationByKey = new Map([
      ["vendor/slow", 900],
      ["vendor/fast", 100],
    ]);
    const models = ["vendor/slow", "vendor/fast"];
    sortTierModels(models, ranking, freeKeys, durationByKey);
    assert.deepEqual(models, ["vendor/fast", "vendor/slow"]);
  });

  it("puts non-free models with missing duration last among non-free", () => {
    const freeKeys = new Set<string>();
    const durationByKey = new Map([["vendor/fast", 100]]);
    const models = ["vendor/unknown", "vendor/fast"];
    sortTierModels(models, ranking, freeKeys, durationByKey);
    assert.deepEqual(models, ["vendor/fast", "vendor/unknown"]);
  });

  it("sorts free models not in collection to end of free group", () => {
    const models = [
      "openrouter/unknown/mystery:free",
      "openrouter/nvidia/model-a:free",
    ];
    const freeKeys = new Set(models);
    sortTierModels(models, ranking, freeKeys, new Map());
    assert.equal(models[0], "openrouter/nvidia/model-a:free");
    assert.equal(models[1], "openrouter/unknown/mystery:free");
  });

  it("breaks ties in free collection rank by probe duration ascending", () => {
    const tiedRanking: CollectionRanking = new Map([
      ["nvidia/model-a:free", 0],
      ["nvidia/model-b:free", 0],
    ]);
    const freeKeys = new Set(["openrouter/nvidia/model-a:free", "openrouter/nvidia/model-b:free"]);
    const durationByKey = new Map([
      ["openrouter/nvidia/model-a:free", 800],
      ["openrouter/nvidia/model-b:free", 200],
    ]);
    const models = ["openrouter/nvidia/model-a:free", "openrouter/nvidia/model-b:free"];
    sortTierModels(models, tiedRanking, freeKeys, durationByKey);
    assert.deepEqual(models, ["openrouter/nvidia/model-b:free", "openrouter/nvidia/model-a:free"]);
  });

  it("falls back to probe duration for free models when ranking is null", () => {
    const freeKeys = new Set(["openrouter/a:free", "openrouter/b:free"]);
    const durationByKey = new Map([
      ["openrouter/a:free", 900],
      ["openrouter/b:free", 300],
    ]);
    const models = ["openrouter/a:free", "openrouter/b:free"];
    sortTierModels(models, null, freeKeys, durationByKey);
    assert.deepEqual(models, ["openrouter/b:free", "openrouter/a:free"]);
  });
});

describe("capFreeModels", () => {
  // Keys use the "openrouter/<slug>" form — capFreeModels looks ranks up
  // via openRouterSlug(key), which strips everything up to the first "/".
  const ranking: CollectionRanking = new Map([
    ["p/m1:free", 0],
    ["p/m2:free", 1],
    ["p/m3:free", 2],
    ["p/m4:free", 3],
    ["p/m5:free", 4],
    ["p/m6:free", 5],
  ]);
  const keyOf = (m: string) => m;

  it("caps at FREE_MODEL_LIMIT (5) by default", () => {
    const models = [
      "openrouter/p/m1:free",
      "openrouter/p/m2:free",
      "openrouter/p/m3:free",
      "openrouter/p/m4:free",
      "openrouter/p/m5:free",
      "openrouter/p/m6:free",
    ];
    const verified = new Set(models);
    const result = capFreeModels(models, keyOf, verified, ranking, new Map());
    assert.equal(result.length, FREE_MODEL_LIMIT);
    assert.deepEqual(result, [
      "openrouter/p/m1:free",
      "openrouter/p/m2:free",
      "openrouter/p/m3:free",
      "openrouter/p/m4:free",
      "openrouter/p/m5:free",
    ]);
  });

  it("drops unverified models", () => {
    const models = ["openrouter/p/m1:free", "openrouter/p/m2:free", "openrouter/p/m3:free"];
    const verified = new Set(["openrouter/p/m1:free", "openrouter/p/m3:free"]);
    const result = capFreeModels(models, keyOf, verified, ranking, new Map());
    assert.deepEqual(result, ["openrouter/p/m1:free", "openrouter/p/m3:free"]);
  });

  it("orders by collection rank when ranking is available", () => {
    const models = ["openrouter/p/m3:free", "openrouter/p/m1:free", "openrouter/p/m2:free"];
    const verified = new Set(models);
    const result = capFreeModels(models, keyOf, verified, ranking, new Map());
    assert.deepEqual(result, ["openrouter/p/m1:free", "openrouter/p/m2:free", "openrouter/p/m3:free"]);
  });

  it("orders by probe duration ascending when ranking is null", () => {
    const models = ["openrouter/p/m1:free", "openrouter/p/m2:free", "openrouter/p/m3:free"];
    const verified = new Set(models);
    const durationByKey = new Map([
      ["openrouter/p/m1:free", 900],
      ["openrouter/p/m2:free", 100],
      ["openrouter/p/m3:free", 500],
    ]);
    const result = capFreeModels(models, keyOf, verified, null, durationByKey);
    assert.deepEqual(result, ["openrouter/p/m2:free", "openrouter/p/m3:free", "openrouter/p/m1:free"]);
  });

  it("respects a custom limit", () => {
    const models = ["openrouter/p/m1:free", "openrouter/p/m2:free", "openrouter/p/m3:free"];
    const verified = new Set(models);
    const result = capFreeModels(models, keyOf, verified, ranking, new Map(), 2);
    assert.deepEqual(result, ["openrouter/p/m1:free", "openrouter/p/m2:free"]);
  });
});
