import type { ExtensionContext } from "@earendil-works/pi-coding-agent";

export const REGISTRY_REFRESH_TTL_MS = 30_000;

export interface RegistryRefreshState {
  lastRegistryRefreshAt?: number;
  forceRegistryRefresh?: boolean;
}

export interface BifrostModeState {
  enabled: boolean;
  pinned: boolean;
  classifierEnabled: boolean;
  silent: boolean;
}

export function shouldRefreshRegistry(
  state: RegistryRefreshState,
  now = Date.now(),
  ttlMs = REGISTRY_REFRESH_TTL_MS,
): boolean {
  if (state.forceRegistryRefresh) return true;
  if (state.lastRegistryRefreshAt === undefined) return true;
  return now - state.lastRegistryRefreshAt >= ttlMs;
}

function statusText(ctx: ExtensionContext, tone: "dim" | "accent" | "success" | "warning" | "error", message: string): string {
  const bullet = tone === "success"
    ? ctx.ui.theme.fg("success", "●")
    : tone === "warning"
      ? ctx.ui.theme.fg("warning", "●")
      : tone === "error"
        ? ctx.ui.theme.fg("error", "●")
        : tone === "accent"
          ? ctx.ui.theme.fg("accent", "●")
          : ctx.ui.theme.fg("dim", "●");

  const textColor = tone === "success"
    ? "success"
    : tone === "warning"
      ? "warning"
      : tone === "error"
        ? "error"
        : tone === "accent"
          ? "accent"
          : "dim";

  return `${bullet}${ctx.ui.theme.fg("dim", " Bifrost · ")}${ctx.ui.theme.fg(textColor, message)}`;
}

export function setBifrostStatus(
  ctx: ExtensionContext,
  message?: string,
  tone: "dim" | "accent" | "success" | "warning" | "error" = "dim",
): void {
  if (!ctx.hasUI) return;
  if (!message) {
    ctx.ui.setStatus("bifrost-state", undefined);
    return;
  }

  const text = statusText(ctx, tone, message);
  ctx.ui.setStatus("bifrost-state", text);
}

export function setBifrostWorkingMessage(ctx: ExtensionContext, message?: string): void {
  if (!ctx.hasUI) return;
  ctx.ui.setWorkingMessage(message);
}

function modeLabel(state: BifrostModeState): { tone: "warning" | "success"; text: string } {
  if (!state.enabled) return { tone: "warning", text: "off" };
  if (state.pinned) return { tone: "warning", text: "pinned" };
  if (!state.classifierEnabled) return { tone: "warning", text: "on · classifier off" };
  return { tone: "success", text: "on" };
}

export function formatBifrostStatus(state: { enabled: boolean; pinned: boolean; silent: boolean }): string {
  const routing = state.enabled ? "\x1b[32mon\x1b[0m" : "\x1b[33moff\x1b[0m";
  const pin = state.pinned ? "\x1b[33mpinned\x1b[0m" : "\x1b[90munpinned\x1b[0m";
  const sil = state.silent ? "\x1b[36msilence\x1b[0m" : "\x1b[32munsilence\x1b[0m";
  const tilde = "\x1b[90m~\x1b[0m";
  return `\x1b[90m⚡ bifrost:\x1b[0m ${routing} ${tilde} ${pin} ${tilde} ${sil}`;
}

export function setBifrostModeStatus(ctx: ExtensionContext, state: BifrostModeState): void {
  if (!ctx.hasUI) return;

  const label = modeLabel(state);
  const text = statusText(ctx, label.tone, label.text);
  ctx.ui.setStatus("bifrost-state", text);
  ctx.ui.setStatus("bifrost", formatBifrostStatus(state));
}
