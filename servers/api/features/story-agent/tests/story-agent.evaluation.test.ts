import test from "node:test";
import assert from "node:assert/strict";
import {
  classifyStoryAgentEvaluation,
  isExpectedStoryAgentResult,
  sanitizeStoryAgentDiagnostic,
  storyAgentEvaluationExitCode
} from "../story-agent.evaluation.js";
import type { StoryAgentPipelineResult } from "../story-agent.service.js";

const base = (overrides: Partial<StoryAgentPipelineResult>): StoryAgentPipelineResult => ({
  status: "failed",
  attempts: 1,
  usage: { inputTokens: 1, outputTokens: 1, totalTokens: 2 },
  providers: ["fake"],
  stages: [],
  validationErrors: [],
  ...overrides
});
const story = { title: "A customer adds a product to their cart", intent: "Add a product", epic: "Cart", size: "S" as const, acceptanceCriteria: ["The cart contains the product"], states: [], dependsOn: [], openQuestions: [], sliceRationale: "Proves one cart action." };

void test("classifies valid drafts, invalid provider output, and unavailable providers distinctly", () => {
  const draft = base({ status: "draft", stories: [story] });
  const invalid = base({ reason: "validation_failed", validationErrors: ["stories.0.intent: Invalid input"] });
  const unavailable = base({ status: "queued", reason: "providers_unavailable" });

  assert.equal(classifyStoryAgentEvaluation(draft, { expectedStatus: "draft" }), "passed");
  assert.equal(classifyStoryAgentEvaluation(invalid, { expectedStatus: "draft" }), "quality_failed");
  assert.equal(classifyStoryAgentEvaluation(unavailable, { expectedStatus: "draft" }), "inconclusive");
});

void test("accepts only an explicit no-partial structured refusal policy", () => {
  const refusal = base({ reason: "model_refusal" });
  assert.equal(isExpectedStoryAgentResult(refusal, { expectedStatus: "failed", expectedReason: "model_refusal" }), true);
  assert.equal(classifyStoryAgentEvaluation(refusal, { expectedStatus: "draft" }), "quality_failed");
});

void test("returns stable live evaluation exit codes", () => {
  assert.equal(storyAgentEvaluationExitCode(["passed"]), 0);
  assert.equal(storyAgentEvaluationExitCode(["passed", "inconclusive"]), 2);
  assert.equal(storyAgentEvaluationExitCode(["inconclusive", "quality_failed"]), 1);
});

void test("sanitizes credential-shaped diagnostic text", () => {
  const diagnostic = sanitizeStoryAgentDiagnostic("authorization=Bearer secret-value apiKey=AIza123456789012345678");
  assert.ok(!diagnostic.includes("secret-value"));
  assert.ok(!diagnostic.includes("AIza123456789012345678"));
});
