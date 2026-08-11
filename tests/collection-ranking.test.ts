import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { parseCollectionHtml, applyCollectionSort, type CollectionRanking } from "../collection-ranking.ts";

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

describe("applyCollectionSort", () => {
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
    applyCollectionSort(models, ranking, freeKeys);
    assert.deepEqual(models, [
      "openrouter/nvidia/model-a:free",
      "openrouter/poolside/model-b:free",
      "openrouter/google/model-c:free",
    ]);
  });

  it("places non-free models before free models", () => {
    const freeKeys = new Set(["openrouter/nvidia/model-a:free"]);
    const ctxMap = new Map([["vendor/cheap-paid", 128000]]);
    const models = [
      "openrouter/nvidia/model-a:free",
      "vendor/cheap-paid",
    ];
    applyCollectionSort(models, ranking, freeKeys, ctxMap);
    assert.equal(models[0], "vendor/cheap-paid");
    assert.equal(models[1], "openrouter/nvidia/model-a:free");
  });

  it("sorts non-free models by context window descending", () => {
    const freeKeys = new Set<string>();
    const ctxMap = new Map([
      ["vendor/small", 32000],
      ["vendor/large", 256000],
    ]);
    const models = ["vendor/small", "vendor/large"];
    applyCollectionSort(models, ranking, freeKeys, ctxMap);
    assert.deepEqual(models, ["vendor/large", "vendor/small"]);
  });

  it("sorts free models not in collection to end of free group", () => {
    const models = [
      "openrouter/unknown/mystery:free",
      "openrouter/nvidia/model-a:free",
    ];
    const freeKeys = new Set(models);
    applyCollectionSort(models, ranking, freeKeys);
    assert.equal(models[0], "openrouter/nvidia/model-a:free");
    assert.equal(models[1], "openrouter/unknown/mystery:free");
  });
});
