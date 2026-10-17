import { randomUUID } from "node:crypto";
import type { NextFunction, Request, Response } from "express";
import { ERROR_CODES, ERROR_MESSAGES, HTTP_STATUS } from "../../constants/index.js";
import { createApplicationError } from "../../errors/index.js";
import { requirementInputSchema } from "./story-agent.validation.js";
import type { StoryAgentRepository, StoryAgentRunDocument } from "./story-agent.repository.js";
import type { StoryAgentPipelineResult } from "./story-agent.service.js";

type Clock = Readonly<{ now: () => number }>;
type Service = Readonly<{ run: (input: Readonly<{ requirement: string; context?: string | undefined }>) => Promise<StoryAgentPipelineResult> }>;
type ControllerDependencies = Readonly<{ repository: StoryAgentRepository; service: Service; clock: Clock; createRunId?: () => string }>;
type JsonResponse = Pick<Response, "json" | "status">;

const toIso = (value: number): string => new Date(value).toISOString();
const queuedRetryDelayMs = 2 * 60 * 1_000;
const queuedExpiryMs = 30 * 60 * 1_000;

const runDocument = (runId: string, input: Readonly<{ requirement: string; context?: string | undefined }>, pipeline: StoryAgentPipelineResult, now: number): StoryAgentRunDocument => ({
  runId,
  status: pipeline.status,
  requirement: input.requirement,
  ...(input.context ? { context: input.context } : {}),
  usage: pipeline.usage,
  providers: pipeline.providers,
  attempts: pipeline.attempts,
  stages: pipeline.stages,
  validationErrors: pipeline.validationErrors,
  ...(pipeline.reason ? { reason: pipeline.reason, error: pipeline.reason } : {}),
  ...(pipeline.status === "queued" ? { nextAttemptAt: toIso(now + queuedRetryDelayMs), expiresAt: toIso(now + queuedExpiryMs) } : {}),
  createdAt: toIso(now),
  updatedAt: toIso(now)
});

export const createStoryAgentController = ({ repository, service, clock, createRunId = randomUUID }: ControllerDependencies) => ({
  createRun: async (request: Request, response: JsonResponse, next: NextFunction): Promise<void> => {
    try {
      const input = requirementInputSchema.parse(request.body);
      if (await repository.countQueuedRuns() >= 20) {
        response.status(HTTP_STATUS.serviceUnavailable).json({ error: "Story Agent queue is full. Please try again shortly." });
        return;
      }
      const pipeline = await service.run(input);
      const runId = createRunId();
      const now = clock.now();
      await repository.saveRun(runDocument(runId, input, pipeline, now));
      if (pipeline.status === "draft") {
        await repository.saveDraft({ runId, stories: pipeline.stories ?? [], createdAt: toIso(now) });
        response.status(HTTP_STATUS.ok).json({ runId, status: pipeline.status, stories: pipeline.stories ?? [], usage: pipeline.usage });
        return;
      }
      if (pipeline.status === "queued") {
        response.status(HTTP_STATUS.accepted).json({ runId, status: pipeline.status, message: "Providers are unavailable; the run is queued for retry." });
        return;
      }
      if (pipeline.status === "questions") {
        response.status(HTTP_STATUS.ok).json({ runId, status: pipeline.status, questions: pipeline.questions ?? [], usage: pipeline.usage });
        return;
      }
      response.status(HTTP_STATUS.internalServerError).json({ runId, status: pipeline.status, error: pipeline.reason ?? "Story generation failed.", usage: pipeline.usage });
    } catch (error: unknown) {
      next(error);
    }
  },
  listRuns: async (request: Request, response: JsonResponse, next: NextFunction): Promise<void> => {
    try {
      const limit = Number(request.query.limit ?? 20);
      const skip = Number(request.query.skip ?? 0);
      const runs = await repository.listRuns({ limit: Number.isInteger(limit) && limit > 0 ? Math.min(limit, 100) : 20, skip: Number.isInteger(skip) && skip >= 0 ? skip : 0 });
      response.status(HTTP_STATUS.ok).json({ runs });
    } catch (error: unknown) {
      next(error);
    }
  },
  getRun: async (request: Request, response: JsonResponse, next: NextFunction): Promise<void> => {
  try {
    const runIdParam = request.params.id;
    const runId = Array.isArray(runIdParam) ? runIdParam[0] : runIdParam;
    if (!runId) {
      next(createApplicationError({
        code: ERROR_CODES.routeNotFound,
        message: ERROR_MESSAGES.routeNotFound,
        status: HTTP_STATUS.notFound,
        details: { path: "story-agent/runs" }
      }));
      return;
    }
    const run = await repository.getRun(runId);
    if (!run) {
      next(createApplicationError({
        code: ERROR_CODES.routeNotFound,
        message: ERROR_MESSAGES.routeNotFound,
        status: HTTP_STATUS.notFound,
        details: { path: `story-agent/runs/${runId}` }
      }));
      return;
    }
    const draft = await repository.getDraftByRun(run.runId);
    response.status(HTTP_STATUS.ok).json({ run, draft });
  } catch (error: unknown) {
    next(error);
  }
}
});
