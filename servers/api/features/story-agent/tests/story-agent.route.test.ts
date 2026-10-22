/* eslint-disable @typescript-eslint/require-await, @typescript-eslint/no-confusing-void-expression */
import { createServer } from "node:http";
import test from "node:test";
import assert from "node:assert/strict";
import express from "express";
import type { Logger } from "@workspace/logging";
import type { MongoPersistence } from "../../../integrations/index.js";
import { createErrorHandler } from "../../../middleware/index.js";
import { createStoryAgentRoutes } from "../routes/story-agent.route.js";
import type { StoryAgentRepository } from "../story-agent.repository.js";
import type { StoryAgentPipelineResult } from "../story-agent.service.js";

const usage = { inputTokens: 1, outputTokens: 1, totalTokens: 2 };
const story = { title: "A writer creates stories", intent: "Plan", epic: "Planning", size: "S" as const, acceptanceCriteria: ["Stories appear"], states: [], dependsOn: [], openQuestions: [], sliceRationale: "Proves creation." };
const logger: Logger = { info: (): void => undefined, warn: (): void => undefined, error: (): void => undefined };
const db: MongoPersistence = { getCollection: () => { throw new Error("Route test does not use Mongo directly."); } };

const result = (status: StoryAgentPipelineResult["status"]): StoryAgentPipelineResult => ({
  status, attempts: 1, usage, providers: ["gemini"], stages: [], validationErrors: [],
  ...(status === "draft" ? { stories: [story] } : {}),
  ...(status === "questions" ? { questions: ["Who is the actor?"] } : {}),
  ...(status === "failed" ? { reason: "provider_failed" } : {}),
  ...(status === "queued" ? { reason: "providers_unavailable" } : {})
});

const createRepository = (saved: unknown[]): StoryAgentRepository => ({
  saveRun: async (document) => { saved.push(document); },
  updateRunStatus: async () => undefined,
  getRun: async () => null,
  listRuns: async () => [],
  saveDraft: async (document) => { saved.push(document); },
  getDraftByRun: async () => null,
  countQueuedRuns: async () => 0,
  claimQueuedRun: async () => null,
  ensureIndexes: async () => undefined
});

const request = async (pipeline: StoryAgentPipelineResult): Promise<Readonly<{ response: Response; saved: unknown[] }>> => {
  const saved: unknown[] = [];
  const app = express();
  app.use(express.json());
  app.use(createStoryAgentRoutes({
    db,
    logger,
    clock: { now: () => 0 },
    repository: createRepository(saved),
    service: { run: async () => pipeline }
  }));
  app.use(createErrorHandler({ logger }));
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const response = await fetch(`http://127.0.0.1:${String(address.port)}/story-agent/runs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requirement: "Create stories" }) });
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  return { response, saved };
};

void test("POST saves and returns a draft", async () => {
  const outcome = await request(result("draft"));
  assert.equal(outcome.response.status, 200);
  assert.equal((await outcome.response.json() as { status: string }).status, "draft");
  assert.equal(outcome.saved.length, 2);
  assert.deepEqual((outcome.saved[0] as { stories?: unknown[] }).stories, [story]);
});

void test("POST persists question payloads for history restoration", async () => {
  const saved: unknown[] = [];
  const app = express();
  app.use(express.json());
  app.use(createStoryAgentRoutes({
    db,
    logger,
    clock: { now: () => 0 },
    repository: createRepository(saved),
    service: { run: async () => ({ status: "questions", attempts: 1, usage, providers: ["gemini"], stages: [], validationErrors: [], questions: ["Who is the actor?"] }) }
  }));
  app.use(createErrorHandler({ logger }));
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const response = await fetch(`http://127.0.0.1:${String(address.port)}/story-agent/runs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requirement: "Create stories" }) });
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  assert.equal(response.status, 200);
  assert.deepEqual((saved[0] as { questions?: string[] }).questions, ["Who is the actor?"]);
});

void test("POST saves queued runs and returns 202", async () => {
  const outcome = await request(result("queued"));
  assert.equal(outcome.response.status, 202);
  assert.equal((await outcome.response.json() as { status: string }).status, "queued");
  assert.equal(outcome.saved.length, 1);
});

void test("POST saves failed runs and returns 500", async () => {
  const outcome = await request(result("failed"));
  assert.equal(outcome.response.status, 500);
  assert.equal((await outcome.response.json() as { status: string }).status, "failed");
  assert.equal(outcome.saved.length, 1);
});

void test("POST rejects invalid request bodies", async () => {
  const saved: unknown[] = [];
  const app = express();
  app.use(express.json());
  app.use(createStoryAgentRoutes({ db, logger, clock: { now: () => 0 }, repository: createRepository(saved), service: { run: async () => result("draft") } }));
  app.use(createErrorHandler({ logger }));
  const server = createServer(app);
  await new Promise<void>((resolve, reject) => { server.once("error", reject); server.listen(0, "127.0.0.1", resolve); });
  const address = server.address();
  assert.ok(address && typeof address === "object");
  const response = await fetch(`http://127.0.0.1:${String(address.port)}/story-agent/runs`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ requirement: "" }) });
  server.closeAllConnections();
  await new Promise<void>((resolve, reject) => server.close((error) => error ? reject(error) : resolve()));
  assert.equal(response.status, 400);
  assert.equal(saved.length, 0);
});
