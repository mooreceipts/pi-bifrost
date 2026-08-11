import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  patternUnresolvable,
  classifierModelMissing,
  classifierAuthMissing,
  classifierSubprocessFailed,
  setModelAuthMissing,
  setModelGenericFailure,
  tierNoCandidates,
  formatDiagnostic,
  parseClassifierStderr,
  parseSetModelError,
} from "../diagnostics.ts";

describe("patternUnresolvable", () => {
  it("returns a warning diagnostic", () => {
    const d = patternUnresolvable("fast", "gpt-4*");
    assert.equal(d.code, "pattern-unresolvable");
    assert.equal(d.severity, "warning");
    assert.equal(
      d.message,
      'Model pattern "gpt-4*" in tier "fast" matches nothing in the registry',
    );
    assert.equal(
      d.corrective,
      "Remove it from bifrost.json or run /bifrost init --scoped to regenerate.",
    );
  });
});

describe("classifierModelMissing", () => {
  it("returns a warning diagnostic", () => {
    const d = classifierModelMissing("openai/gpt-4o");
    assert.equal(d.code, "classifier-model-missing");
    assert.equal(d.severity, "warning");
    assert.equal(d.message, 'Classifier model "openai/gpt-4o" not found in registry');
    assert.equal(
      d.corrective,
      "Change classifier.model in bifrost.json to an available model. Run /bifrost probe to see what's reachable.",
    );
  });
});

describe("classifierAuthMissing", () => {
  it("returns a warning diagnostic", () => {
    const d = classifierAuthMissing("anthropic");
    assert.equal(d.code, "classifier-auth-missing");
    assert.equal(d.severity, "warning");
    assert.equal(d.message, 'No API key for classifier provider "anthropic"');
    assert.equal(
      d.corrective,
      'Add an API key for "anthropic" or change classifier.model to a model with valid credentials.',
    );
  });
});

describe("classifierSubprocessFailed", () => {
  it("returns a warning diagnostic with exit code and stderr snippet", () => {
    const d = classifierSubprocessFailed("openai/gpt-4o", 1, "boom");
    assert.equal(d.code, "classifier-subprocess-failed");
    assert.equal(d.severity, "warning");
    assert.equal(d.message, 'Classifier subprocess for "openai/gpt-4o" exited 1: boom');
    assert.equal(
      d.corrective,
      "Check classifier.model in bifrost.json. Run /bifrost doctor to diagnose.",
    );
  });

  it("handles a null exit code", () => {
    const d = classifierSubprocessFailed("openai/gpt-4o", null, "boom");
    assert.equal(d.message, 'Classifier subprocess for "openai/gpt-4o" exited null: boom');
  });
});

describe("setModelAuthMissing", () => {
  it("returns an error diagnostic", () => {
    const d = setModelAuthMissing("anthropic/claude-opus", "anthropic");
    assert.equal(d.code, "set-model-auth-missing");
    assert.equal(d.severity, "error");
    assert.equal(
      d.message,
      'Cannot activate anthropic/claude-opus: no API key for provider "anthropic"',
    );
    assert.equal(
      d.corrective,
      'Add an API key for "anthropic" or remove the model from bifrost.json.',
    );
  });
});

describe("setModelGenericFailure", () => {
  it("returns an error diagnostic", () => {
    const d = setModelGenericFailure("anthropic/claude-opus", "timeout");
    assert.equal(d.code, "set-model-generic-failure");
    assert.equal(d.severity, "error");
    assert.equal(d.message, "Cannot activate anthropic/claude-opus: timeout");
    assert.equal(d.corrective, "Run /bifrost probe to check model availability.");
  });
});

describe("tierNoCandidates", () => {
  it("returns a warning diagnostic listing unresolved patterns", () => {
    const d = tierNoCandidates("fast", ["gpt-4*", "claude-*"]);
    assert.equal(d.code, "tier-no-candidates");
    assert.equal(d.severity, "warning");
    assert.equal(
      d.message,
      'Tier "fast" has no available models. Unresolved patterns: gpt-4*, claude-*',
    );
    assert.equal(
      d.corrective,
      "Update model patterns in bifrost.json or run /bifrost init --scoped.",
    );
  });

  it("handles an empty pattern list", () => {
    const d = tierNoCandidates("fast", []);
    assert.equal(
      d.message,
      'Tier "fast" has no available models. Unresolved patterns: ',
    );
  });
});

describe("formatDiagnostic", () => {
  it("appends the corrective when present", () => {
    const d = patternUnresolvable("fast", "gpt-4*");
    assert.equal(
      formatDiagnostic(d),
      'Model pattern "gpt-4*" in tier "fast" matches nothing in the registry. Fix: Remove it from bifrost.json or run /bifrost init --scoped to regenerate.',
    );
  });

  it("returns just the message when corrective is absent", () => {
    const d = { code: "x", severity: "info" as const, message: "just a message" };
    assert.equal(formatDiagnostic(d), "just a message");
  });
});

describe("parseClassifierStderr", () => {
  it("detects a missing model pattern", () => {
    const d = parseClassifierStderr("Error: No models match pattern foo", "openai/gpt-4o", 1);
    assert.equal(d.code, "classifier-model-missing");
    assert.equal(d.message, 'Classifier model "openai/gpt-4o" not found in registry');
  });

  it("detects a missing API key and extracts the provider", () => {
    const d = parseClassifierStderr("No API key for anthropic.", "anthropic/claude", 1);
    assert.equal(d.code, "classifier-auth-missing");
    assert.equal(d.message, 'No API key for classifier provider "anthropic"');
  });

  it("falls back to model prefix when provider cannot be extracted", () => {
    const d = parseClassifierStderr("api key missing", "openai/gpt-4o", 1);
    assert.equal(d.code, "classifier-auth-missing");
    assert.equal(d.message, 'No API key for classifier provider "openai"');
  });

  it("detects an HTTP error code", () => {
    const d = parseClassifierStderr("request failed with 503 Service Unavailable", "openai/gpt-4o", 1);
    assert.equal(d.code, "classifier-subprocess-failed");
    assert.equal(
      d.message,
      'Classifier subprocess for "openai/gpt-4o" exited 1: HTTP 503',
    );
  });

  it("falls back to a generic subprocess failure with truncated stderr", () => {
    const longStderr = "x".repeat(300);
    const d = parseClassifierStderr(longStderr, "openai/gpt-4o", 1);
    assert.equal(d.code, "classifier-subprocess-failed");
    assert.equal(
      d.message,
      `Classifier subprocess for "openai/gpt-4o" exited 1: ${"x".repeat(200)}`,
    );
  });
});

describe("parseSetModelError", () => {
  it("returns a generic failure when no error is given", () => {
    const d = parseSetModelError(undefined, "openai/gpt-4o");
    assert.equal(d.code, "set-model-generic-failure");
    assert.equal(d.message, "Cannot activate openai/gpt-4o: setModel returned false");
  });

  it("detects auth-related errors and derives the provider", () => {
    const d = parseSetModelError(new Error("Unauthorized: invalid API key"), "openai/gpt-4o");
    assert.equal(d.code, "set-model-auth-missing");
    assert.equal(
      d.message,
      'Cannot activate openai/gpt-4o: no API key for provider "openai"',
    );
  });

  it("falls back to a generic failure with truncated error text", () => {
    const d = parseSetModelError(new Error("connection refused"), "openai/gpt-4o");
    assert.equal(d.code, "set-model-generic-failure");
    assert.equal(d.message, "Cannot activate openai/gpt-4o: Error: connection refused");
  });
});
