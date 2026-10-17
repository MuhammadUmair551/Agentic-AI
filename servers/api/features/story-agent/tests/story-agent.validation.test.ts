import test from "node:test";
import assert from "node:assert/strict";
import { extractJson, extractJsonText } from "../story-agent.json.js";
import { clarificationsSchema, requirementInputSchema, runStatusSchema, storySchema } from "../story-agent.validation.js";

void test("validates Story Agent input and output contracts", () => {
  assert.deepEqual(requirementInputSchema.parse({ requirement: "Create a story agent" }), { requirement: "Create a story agent" });
  assert.deepEqual(clarificationsSchema.parse({ questions: ["Who is the actor?"], assumptions: [] }), {
    questions: ["Who is the actor?"], assumptions: []
  });
  assert.equal(runStatusSchema.parse("draft"), "draft");
  assert.equal(storySchema.parse({
    title: "A writer creates a story set",
    intent: "Create planning stories",
    epic: "Planning",
    size: "S",
    acceptanceCriteria: ["The result has one story"],
    states: [],
    dependsOn: [],
    openQuestions: [],
    sliceRationale: "It proves the happy path."
  }).size, "S");
});

void test("extracts JSON from Markdown fences and surrounding prose", () => {
  const text = "Here is the result:\n```json\n{\"stories\":[{\"title\":\"One\"}]}\n```\nThanks.";
  assert.equal(extractJsonText(text), "{\"stories\":[{\"title\":\"One\"}]}");
  assert.deepEqual(extractJson(text), { stories: [{ title: "One" }] });
});
