import { z } from "zod";
import type { ValidatedApiEnvironment } from "../types/index.js";

export const apiEnvironmentSchema = z.object({
  NODE_ENV: z.enum(["development", "test", "production"]),
  API_HOST: z.string().min(1),
  API_PORT: z.coerce.number().int().min(1).max(65_535),
  WEB_ORIGIN: z.url(),
  MONGODB_URI: z.string().min(1).optional(),
  LOG_LEVEL: z.enum(["fatal", "error", "warn", "info", "debug", "trace", "silent"]),
  LLM_PROVIDERS: z.string().min(1).optional(),
  LLM_BASE_URL: z.url().optional(),
  LLM_API_KEY: z.string().min(1).optional(),
  LLM_MODEL: z.string().min(1).optional(),
  LLM_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  LLM_GEMINI_BASE_URL: z.url().optional(),
  LLM_GEMINI_API_KEY: z.string().min(1).optional(),
  LLM_GEMINI_MODEL: z.string().min(1).optional(),
  LLM_GEMINI_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  LLM_GROQ_BASE_URL: z.url().optional(),
  LLM_GROQ_API_KEY: z.string().min(1).optional(),
  LLM_GROQ_MODEL: z.string().min(1).optional(),
  LLM_GROQ_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  LLM_OLLAMA_BASE_URL: z.url().optional(),
  LLM_OLLAMA_API_KEY: z.string().min(1).optional(),
  LLM_OLLAMA_MODEL: z.string().min(1).optional(),
  LLM_OLLAMA_TIMEOUT_MS: z.coerce.number().int().positive().optional(),
  LLM_PROFILE_FAST: z.string().min(1).optional(),
  LLM_PROFILE_GENERATE: z.string().min(1).optional(),
  LLM_PROFILE_TOOLS: z.string().min(1).optional(),
  LLM_COOLDOWN_MS: z.coerce.number().int().positive().optional(),
  QUEUE_INTERVAL_MS: z.coerce.number().int().positive().optional()
}) satisfies z.ZodType<ValidatedApiEnvironment>;

export const validateApiEnvironment = (input: unknown): ValidatedApiEnvironment =>
  Object.freeze(apiEnvironmentSchema.parse(input));
