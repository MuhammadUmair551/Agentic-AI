import type { StoryAgentPipelineResult } from "./story-agent.service.js";

export type StoryAgentEvaluationClassification = "passed" | "quality_failed" | "inconclusive";
export type StoryAgentEvaluationExpectation = Readonly<{
  expectedStatus: StoryAgentPipelineResult["status"];
  expectedReason?: string;
  existingTitles?: readonly string[];
}>;

const normalizeTitle = (value: string): string => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export const sanitizeStoryAgentDiagnostic = (value: string): string => value
  .replace(/(Duplicate (?:generated|existing) title):\s*[^;]+/giu, "$1: [REDACTED]")
  .replace(/\bauthorization\s*[:=]\s*(?:Bearer\s+)?\S+/giu, "authorization=[REDACTED]")
  .replace(/\b(api[_-]?key|authorization|token|password|secret)\s*[:=]\s*\S+/giu, "$1=[REDACTED]")
  .replace(/\b(?:sk|gsk|AIza)[A-Za-z0-9_-]{12,}\b/gu, "[REDACTED]")
  .slice(0, 500);

export const isExpectedStoryAgentResult = (
  result: StoryAgentPipelineResult,
  expectation: StoryAgentEvaluationExpectation
): boolean => {
  if (result.status !== expectation.expectedStatus) return false;
  if (expectation.expectedReason !== undefined && result.reason !== expectation.expectedReason) return false;
  if (result.status === "draft") {
    if ((result.stories?.length ?? 0) === 0) return false;
    const existing = new Set((expectation.existingTitles ?? []).map(normalizeTitle));
    return !(result.stories ?? []).some((story) => existing.has(normalizeTitle(story.title)));
  }
  if (result.status === "questions") return (result.questions?.length ?? 0) > 0;
  if (result.status === "failed" && expectation.expectedReason === "model_refusal") return result.stories === undefined;
  return true;
};

export const classifyStoryAgentEvaluation = (
  result: StoryAgentPipelineResult,
  expectation: StoryAgentEvaluationExpectation
): StoryAgentEvaluationClassification => {
  if (result.status === "queued" || result.reason === "no_provider_configured") return "inconclusive";
  return isExpectedStoryAgentResult(result, expectation) ? "passed" : "quality_failed";
};

export const storyAgentEvaluationExitCode = (classifications: readonly StoryAgentEvaluationClassification[]): 0 | 1 | 2 => {
  if (classifications.includes("quality_failed")) return 1;
  if (classifications.includes("inconclusive")) return 2;
  return 0;
};
