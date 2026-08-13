import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { dirname, join } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const piPackageDir = dirname(dirname(fileURLToPath(import.meta.resolve("@earendil-works/pi-coding-agent"))));
const { loadExtensions } = await import(pathToFileURL(join(piPackageDir, "dist/core/extensions/loader.js")));
const projectDir = dirname(fileURLToPath(new URL("../package.json", import.meta.url)));

describe("extension loading", () => {
  it("does not call Pi action methods before runtime initialization", async () => {
    const result = await loadExtensions([join(projectDir, "index.ts")], projectDir);

    assert.deepEqual(result.errors, []);
    assert.equal(result.extensions.length, 1);
  });
});
