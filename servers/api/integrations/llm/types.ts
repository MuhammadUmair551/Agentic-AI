import type { ProviderConfig } from "../../types/index.js";

export type LlmChatMessage = Readonly<{
  role: "system" | "user" | "assistant";
  content: string;
}>;

export type LlmUsage = Readonly<{
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}>;

export type LlmCompletion = Readonly<{
  text: string;
  usage: LlmUsage;
  provider: string;
  model: string;
}>;

export type LlmTransportError = Error & Readonly<{
  kind: "retryable" | "auth" | "bad-request";
  status?: number | undefined;
}>;

export type LlmClient = Readonly<{
  complete: (input: Readonly<{ messages: readonly LlmChatMessage[] }>) => Promise<LlmCompletion>;
}>;

export type LlmGateway = Readonly<{
  createClient: (config: ProviderConfig) => LlmClient;
}>;

export type LlmFetch = (input: string, init?: RequestInit) => Promise<Response>;
