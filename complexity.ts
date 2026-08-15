import { debug } from "./debug.ts";

export interface ComplexitySignals {
  tokenCount: number;
  hasCodeBlocks: boolean;
  fileReferences: number;
  paragraphCount: number;
  hasMultipleQuestions: boolean;
}

export type ComplexityVerdict = "quick" | "frontier" | "image-quick" | "image-complex" | undefined;

const QUICK_TOKEN_CEILING = 30;
const FRONTIER_TOKEN_FLOOR = 200;
const FRONTIER_FILE_THRESHOLD = 3;

const FRONTIER_KEYWORDS = /\b(debug|architecture|security|review|refactor|redesign|optimize|performance|migrate|race condition|deadlock|memory leak)\b/i;
const IMAGE_KEYWORDS = /\b((?:re)?generate|(?:re)?create|make|draw|render|produce)\s+(?:\w+\s+){0,4}(?:image|icon|logo|thumbnail|banner|avatar|illustration|graphic|picture|photo|artwork|scene|portrait|poster|wallpaper)\b|\b(?:text-?to-?image|image (?:re)?generation|image synthesis|ai (?:art|image|painting|render)|stable diffusion|dall-?e|midjourney|photorealistic|cinematic render)\b/i;
const IMAGE_COMPLEX_KEYWORDS = /\b(?:detailed|complex|realistic|high.?quality|high.?res(?:olution)?|professional|photorealistic|cinematic|elaborate|concept art|character design|product (?:image|render)|marketing (?:image|visual))\b/i;
const CODE_BLOCK_PATTERN = /```[\s\S]*?```/g;
const FILE_REF_PATTERN = /(?:^|\s)(?:[\w./\\-]+\.(?:ts|js|tsx|jsx|py|go|rs|java|rb|cpp|c|h|css|html|json|yaml|yml|toml|sql|sh|md))\b/gi;
const QUESTION_PATTERN = /\?/g;

export function analyzeComplexity(text: string): ComplexitySignals {
  const codeBlocks = text.match(CODE_BLOCK_PATTERN) ?? [];
  const textWithoutCode = text.replace(CODE_BLOCK_PATTERN, "");
  const tokens = textWithoutCode.split(/\s+/).filter(Boolean);
  const fileRefs = new Set(text.match(FILE_REF_PATTERN) ?? []);
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  const questions = text.match(QUESTION_PATTERN) ?? [];

  return {
    tokenCount: tokens.length,
    hasCodeBlocks: codeBlocks.length > 0,
    fileReferences: fileRefs.size,
    paragraphCount: paragraphs.length,
    hasMultipleQuestions: questions.length > 1,
  };
}

export function assessComplexity(
  text: string,
  tiers: readonly string[],
): ComplexityVerdict {
  // Image tier short-circuit: runs before quick/frontier to avoid misrouting image tasks.
  if (IMAGE_KEYWORDS.test(text)) {
    if (tiers.includes("image-complex") && IMAGE_COMPLEX_KEYWORDS.test(text)) {
      debug("complexity", "image_complex", {});
      return "image-complex";
    }
    if (tiers.includes("image-quick")) {
      debug("complexity", "image_quick", {});
      return "image-quick";
    }
  }

  if (!tiers.includes("quick") && !tiers.includes("frontier")) return undefined;

  const signals = analyzeComplexity(text);

  if (
    tiers.includes("quick") &&
    signals.tokenCount <= QUICK_TOKEN_CEILING &&
    !signals.hasCodeBlocks &&
    signals.fileReferences === 0 &&
    !signals.hasMultipleQuestions &&
    !FRONTIER_KEYWORDS.test(text)
  ) {
    debug("complexity", "quick_shortcircuit", {
      tokens: signals.tokenCount,
    });
    return "quick";
  }

  if (
    tiers.includes("frontier") &&
    (signals.tokenCount >= FRONTIER_TOKEN_FLOOR ||
      signals.fileReferences >= FRONTIER_FILE_THRESHOLD ||
      (signals.hasCodeBlocks && signals.paragraphCount >= 3))
  ) {
    debug("complexity", "frontier_escalation", {
      tokens: signals.tokenCount,
      files: signals.fileReferences,
      paragraphs: signals.paragraphCount,
    });
    return "frontier";
  }

  return undefined;
}
