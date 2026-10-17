import { z } from "zod";
import type { ProviderConfig, ValidatedApiEnvironment } from "../types/index.js";

const providerNames = ["gemini", "groq", "ollama"] as const;
type ProviderName = (typeof providerNames)[number];
const defaultProviderTimeoutMs = 30_000;
const defaultCooldownMs = 60_000;

export type ProviderProfile = "fast" | "generate" | "tools";
export type ProviderRouterConfig = Readonly<{
  providers: readonly ProviderConfig[];
  routes: Readonly<Record<ProviderProfile, readonly string[]>>;
  cooldownMs: number;
}>;

type ProviderEnvironment = Readonly<{
  baseUrl?: string | undefined;
  apiKey?: string | undefined;
  model?: string | undefined;
  timeoutMs?: number | undefined;
}>;

// ─── Zod schemas ───
const providerEnvironmentSchema = z.object({
  baseUrl: z.url(),
  apiKey: z.string().min(1),
  model: z.string().min(1),
  timeoutMs: z.number().int().positive().optional()
});

// ─── Parsers ───
const parseProviderNames = (value: string | undefined): readonly ProviderName[] => {
  if (!value) return [];
  return value.split(",").map((name) => z.enum(providerNames).parse(name.trim().toLowerCase()));
};

const namedEnvironment = (environment: ValidatedApiEnvironment, name: ProviderName): ProviderEnvironment => {
  if (name === "gemini") return {
    baseUrl: environment.LLM_GEMINI_BASE_URL,
    apiKey: environment.LLM_GEMINI_API_KEY,
    model: environment.LLM_GEMINI_MODEL,
    timeoutMs: environment.LLM_GEMINI_TIMEOUT_MS
  };
  if (name === "groq") return {
    baseUrl: environment.LLM_GROQ_BASE_URL,
    apiKey: environment.LLM_GROQ_API_KEY,
    model: environment.LLM_GROQ_MODEL,
    timeoutMs: environment.LLM_GROQ_TIMEOUT_MS
  };
  return {
    baseUrl: environment.LLM_OLLAMA_BASE_URL,
    apiKey: environment.LLM_OLLAMA_API_KEY,
    model: environment.LLM_OLLAMA_MODEL,
    timeoutMs: environment.LLM_OLLAMA_TIMEOUT_MS
  };
};

const toProviderConfig = (name: string, environment: ProviderEnvironment): ProviderConfig => {
  const parsed = providerEnvironmentSchema.parse(environment);
  return Object.freeze({ name, ...parsed, timeoutMs: parsed.timeoutMs ?? defaultProviderTimeoutMs });
};

const inferredProviderName = (baseUrl: string): string => {
  const host = new URL(baseUrl).hostname.toLowerCase();
  if (host.includes("groq")) return "groq";
  if (host.includes("google") || host.includes("gemini")) return "gemini";
  return "default";
};

const routeProviderNames = (value: string | undefined, fallback: readonly string[]): readonly string[] =>
  value ? value.split(",").map((name) => name.trim()).filter(Boolean) : fallback;

// ─── Public API ───
export const readProviderConfigs = (environment: ValidatedApiEnvironment): readonly ProviderConfig[] => {
  const named = parseProviderNames(environment.LLM_PROVIDERS).map((name) => toProviderConfig(name, namedEnvironment(environment, name)));
  if (named.length > 0) return named;
  if (!environment.LLM_BASE_URL && !environment.LLM_API_KEY && !environment.LLM_MODEL && environment.LLM_TIMEOUT_MS === undefined) return [];
  return [toProviderConfig(inferredProviderName(environment.LLM_BASE_URL ?? ""), {
    baseUrl: environment.LLM_BASE_URL,
    apiKey: environment.LLM_API_KEY,
    model: environment.LLM_MODEL,
    timeoutMs: environment.LLM_TIMEOUT_MS
  })];
};

export const readProviderRouterConfig = (environment: ValidatedApiEnvironment): ProviderRouterConfig => {
  const providers = readProviderConfigs(environment);
  const fallback = providers.map(({ name }) => name);
  return Object.freeze({
    providers,
    routes: Object.freeze({
      fast: routeProviderNames(environment.LLM_PROFILE_FAST, fallback),
      generate: routeProviderNames(environment.LLM_PROFILE_GENERATE, fallback),
      tools: routeProviderNames(environment.LLM_PROFILE_TOOLS, fallback)
    }),
    cooldownMs: environment.LLM_COOLDOWN_MS ?? defaultCooldownMs
  });
};