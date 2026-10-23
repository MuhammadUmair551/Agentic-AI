import type { Logger } from "@workspace/logging";
import type { LlmGateway, MongoPersistence } from "../../integrations/index.js";
import { loadRouterConfig } from "./story-agent.config.js";
import { createStoryAgentProviderRouter } from "./story-agent.router.js";
import { createStoryAgentRepository } from "./story-agent.repository.js";
import { createStoryAgentService } from "./story-agent.service.js";
import { createStoryAgentQueue } from "./story-agent.queue.js";

type Clock = Readonly<{ now: () => number }>;
type FeatureDependencies = Readonly<{ db: MongoPersistence; llm: LlmGateway; logger: Logger; clock: Clock; queueIntervalMs: number }>;

const budget = Object.freeze({ maxCalls: 6, maxTotalTokens: 12_000, timeoutMs: 60_000, contextTokenLimit: 6_000, maxStories: 10 });

export const createStoryAgentFeature = ({ db, llm, logger, clock, queueIntervalMs }: FeatureDependencies) => {
  const router = createStoryAgentProviderRouter({
    config: loadRouterConfig(),
    createClient: llm.createClient,
    logger,
    clock
  });
  const service = createStoryAgentService({ route: router, now: clock.now, budget });
  const repository = createStoryAgentRepository(db);
  const queue = createStoryAgentQueue({ repository, service, logger, clock, intervalMs: queueIntervalMs });
  return Object.freeze({
    routeDependencies: { db, logger, clock, repository, service },
    ensureIndexes: repository.ensureIndexes,
    queue
  });
};

export { createStoryAgentRoutes } from "./routes/index.js";
export type { StoryAgentRouteDependencies } from "./routes/index.js";
