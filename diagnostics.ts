export type DiagnosticSeverity = "error" | "warning" | "info";

export interface BifrostDiagnostic {
  readonly code: string;
  readonly severity: DiagnosticSeverity;
  readonly message: string;
  readonly corrective?: string;
}

export function patternUnresolvable(tier: string, pattern: string): BifrostDiagnostic {
  return {
    code: "pattern-unresolvable",
    severity: "warning",
    message: `Model pattern "${pattern}" in tier "${tier}" matches nothing in the registry`,
    corrective: `Remove it from bifrost.json or run /bifrost init --scoped to regenerate.`,
  };
}

export function classifierModelMissing(pattern: string): BifrostDiagnostic {
  return {
    code: "classifier-model-missing",
    severity: "warning",
    message: `Classifier model "${pattern}" not found in registry`,
    corrective: `Change classifier.model in bifrost.json to an available model. Run /bifrost probe to see what's reachable.`,
  };
}

export function classifierAuthMissing(provider: string): BifrostDiagnostic {
  return {
    code: "classifier-auth-missing",
    severity: "warning",
    message: `No API key for classifier provider "${provider}"`,
    corrective: `Add an API key for "${provider}" or change classifier.model to a model with valid credentials.`,
  };
}

export function classifierSubprocessFailed(
  model: string,
  exitCode: number | null,
  stderrSnippet: string,
): BifrostDiagnostic {
  return {
    code: "classifier-subprocess-failed",
    severity: "warning",
    message: `Classifier subprocess for "${model}" exited ${exitCode}: ${stderrSnippet}`,
    corrective: `Check classifier.model in bifrost.json. Run /bifrost doctor to diagnose.`,
  };
}

export function setModelAuthMissing(model: string, provider: string): BifrostDiagnostic {
  return {
    code: "set-model-auth-missing",
    severity: "error",
    message: `Cannot activate ${model}: no API key for provider "${provider}"`,
    corrective: `Add an API key for "${provider}" or remove the model from bifrost.json.`,
  };
}

export function setModelGenericFailure(model: string, reason: string): BifrostDiagnostic {
  return {
    code: "set-model-generic-failure",
    severity: "error",
    message: `Cannot activate ${model}: ${reason}`,
    corrective: `Run /bifrost probe to check model availability.`,
  };
}

export function tierNoCandidates(tier: string, unresolvedPatterns: string[]): BifrostDiagnostic {
  return {
    code: "tier-no-candidates",
    severity: "warning",
    message: `Tier "${tier}" has no available models. Unresolved patterns: ${unresolvedPatterns.join(", ")}`,
    corrective: `Update model patterns in bifrost.json or run /bifrost init --scoped.`,
  };
}

export function formatDiagnostic(d: BifrostDiagnostic): string {
  return d.corrective ? `${d.message}. Fix: ${d.corrective}` : d.message;
}

export function parseClassifierStderr(
  stderr: string,
  model: string,
  exitCode: number | null,
): BifrostDiagnostic {
  if (/No models match pattern/i.test(stderr)) {
    return classifierModelMissing(model);
  }
  if (/No API key|api.?key/i.test(stderr)) {
    const providerMatch = stderr.match(/for\s+(\S+)/i);
    const provider = providerMatch?.[1]?.replace(/[.\s]+$/, "") ?? model.split("/")[0];
    return classifierAuthMissing(provider);
  }
  const httpMatch = stderr.match(/\b([45]\d{2})\b/);
  if (httpMatch) {
    return classifierSubprocessFailed(model, exitCode, `HTTP ${httpMatch[1]}`);
  }
  return classifierSubprocessFailed(model, exitCode, stderr.slice(0, 200).trim());
}

export function parseSetModelError(error: unknown, model: string): BifrostDiagnostic {
  const errorStr = error ? String(error) : "";
  const provider = model.split("/")[0];

  if (!error) {
    return setModelGenericFailure(model, "setModel returned false");
  }
  if (/api.?key|authentication|unauthorized|auth/i.test(errorStr)) {
    return setModelAuthMissing(model, provider);
  }
  return setModelGenericFailure(model, errorStr.slice(0, 200));
}
