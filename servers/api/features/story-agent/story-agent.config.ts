import { readApiEnvironment, readProviderRouterConfig } from "../../config/index.js";
import type { StoryAgentRouterConfig } from "./story-agent.router.js";

export const loadRouterConfig = (): StoryAgentRouterConfig => readProviderRouterConfig(readApiEnvironment());
