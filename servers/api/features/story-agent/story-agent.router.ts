import type { Logger } from "@workspace/logging";
import type { ProviderConfig } from "../../types/index.js";
import { isStoryAgentProviderError, type StoryAgentChatMessage, type StoryAgentProviderClient, type StoryAgentProviderResult } from "./story-agent.integration.js";

export type StoryAgentProviderProfile = "fast" | "generate" | "tools";
export type StoryAgentRouterError = Error & Readonly<{ code: "providers_unavailable" | "no_provider_configured" }>;
export type StoryAgentRouterConfig = Readonly<{ providers: readonly ProviderConfig[]; routes: Readonly<Record<StoryAgentProviderProfile, readonly string[]>>; cooldownMs: number }>;
type ProviderState = { consecutiveFailures: number; cooldownUntil?: number | undefined; trialInFlight: boolean };
type Clock = Readonly<{ now: () => number }>;
type RouterDependencies = Readonly<{ config: StoryAgentRouterConfig; createClient: (config: ProviderConfig) => StoryAgentProviderClient; logger: Pick<Logger, "warn">; clock: Clock }>;
export type StoryAgentProviderRouter = Readonly<{ complete: (input: Readonly<{ profile: StoryAgentProviderProfile; messages: readonly StoryAgentChatMessage[] }>) => Promise<StoryAgentProviderResult> }>;

const unavailable = (code: StoryAgentRouterError["code"], message: string): StoryAgentRouterError => Object.assign(new Error(message), { code });
export const isStoryAgentRouterError = (error: unknown): error is StoryAgentRouterError => error instanceof Error && "code" in error && (error.code === "providers_unavailable" || error.code === "no_provider_configured");

export const createStoryAgentProviderRouter = ({ config, createClient, logger, clock }: RouterDependencies): StoryAgentProviderRouter => {
  const providers = new Map(config.providers.map((provider) => [provider.name, provider]));
  const states = new Map<string, ProviderState>();
  const stateFor = (name: string): ProviderState => states.get(name) ?? (() => { const state = { consecutiveFailures: 0, trialInFlight: false }; states.set(name, state); return state; })();
  const eligible = (name: string): boolean => { const state = stateFor(name); if (state.cooldownUntil === undefined) return true; if (clock.now() < state.cooldownUntil || state.trialInFlight) return false; state.trialInFlight = true; return true; };
  const succeed = (state: ProviderState): void => { state.consecutiveFailures = 0; state.cooldownUntil = undefined; state.trialInFlight = false; };
  const fail = (name: string, state: ProviderState): void => { state.consecutiveFailures += 1; state.trialInFlight = false; if (state.consecutiveFailures >= 2) { state.cooldownUntil = clock.now() + config.cooldownMs; logger.warn("Story Agent provider circuit opened.", { provider: name, cooldownMs: config.cooldownMs }); } };
  return Object.freeze({ complete: async ({ profile, messages }): Promise<StoryAgentProviderResult> => {
    const route = config.routes[profile];
    if (route.length === 0) throw unavailable("no_provider_configured", `No providers configured for profile: ${profile}`);
    for (const name of route) {
      const provider = providers.get(name);
      if (provider === undefined) { logger.warn("Story Agent route references unconfigured provider.", { provider: name }); continue; }
      if (!eligible(name)) continue;
      const state = stateFor(name);
      try { const result = await createClient(provider).complete({ messages }); succeed(state); return result; }
      catch (error: unknown) {
        if (!isStoryAgentProviderError(error)) throw error;
        if (error.kind === "auth") { state.trialInFlight = false; logger.warn("Story Agent provider authentication failed; skipping provider.", { provider: name, status: error.status }); continue; }
        if (error.kind === "retryable") { fail(name, state); continue; }
        state.trialInFlight = false; throw error;
      }
    }
    throw unavailable("providers_unavailable", "All Story Agent providers are unavailable.");
  } });
};
