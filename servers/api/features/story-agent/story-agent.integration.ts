import type { ProviderConfig } from "../../types/index.js";

export type { ProviderConfig } from "../../types/index.js";

export type StoryAgentProviderUsage = Readonly<{
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}>;

export type StoryAgentProviderResult = Readonly<{
  text: string;
  usage: StoryAgentProviderUsage;
  provider: string;
  model: string;
}>;

export type StoryAgentProviderError = Error & Readonly<{
  kind: "retryable" | "auth" | "bad-request";
  status?: number | undefined;
}>;

export type StoryAgentChatMessage = Readonly<{
  role: "system" | "user" | "assistant";
  content: string;
}>;

type Fetch = (input: string, init?: RequestInit) => Promise<Response>;
type ProviderClientDependencies = Readonly<{ config: ProviderConfig; fetch: Fetch }>;
type CompletionInput = Readonly<{ messages: readonly StoryAgentChatMessage[] }>;

export type StoryAgentProviderClient = Readonly<{
  complete: (input: CompletionInput) => Promise<StoryAgentProviderResult>;
}>;

const providerError = (
  kind: StoryAgentProviderError["kind"],
  message: string,
  status?: number
): StoryAgentProviderError => Object.freeze(Object.assign(new Error(message), {
  kind,
  ...(status === undefined ? {} : { status })
}));

export const isStoryAgentProviderError = (error: unknown): error is StoryAgentProviderError =>
  typeof error === "object" && error !== null && "kind" in error
    && ["retryable", "auth", "bad-request"].includes(String(error.kind));

const errorKindForStatus = (status: number): StoryAgentProviderError["kind"] => {
  if (status === 401 || status === 403) return "auth";
  if (status === 429 || status >= 500) return "retryable";
  return "bad-request";
};

const readErrorMessage = async (response: Response): Promise<string> => {
  const body = await response.text();
  return body.trim() || `Provider request failed with status ${String(response.status)}.`;
};

const asRecord = (value: unknown): Record<string, unknown> | undefined =>
  typeof value === "object" && value !== null && !Array.isArray(value)
    ? value as Record<string, unknown>
    : undefined;

const readCompletion = async (response: Response): Promise<Readonly<{ text: string; usage: StoryAgentProviderUsage }>> => {
  let payload: unknown;
  try {
    payload = JSON.parse(await response.text()) as unknown;
  } catch {
    throw providerError("bad-request", "Provider returned invalid JSON.");
  }
  const record = asRecord(payload);
  if (!record) throw providerError("bad-request", "Provider returned an invalid response.");
  const choices = Array.isArray(record.choices) ? record.choices as unknown[] : [];
  const message = asRecord(choices[0])?.message;
  const text = asRecord(message)?.content;
  if (typeof text !== "string") throw providerError("bad-request", "Provider response does not contain message content.");

  const usage = asRecord(record.usage) ?? {};
  const numberAt = (key: string): number => {
    const value = usage[key];
    return typeof value === "number" ? value : 0;
  };
  return Object.freeze({
    text,
    usage: Object.freeze({
      inputTokens: numberAt("prompt_tokens"),
      outputTokens: numberAt("completion_tokens"),
      totalTokens: numberAt("total_tokens")
    })
  });
};

export const createStoryAgentProviderClient = ({ config, fetch }: ProviderClientDependencies): StoryAgentProviderClient => ({
  complete: async ({ messages }): Promise<StoryAgentProviderResult> => {
    const controller = new AbortController();
    const timeout = setTimeout(() => { controller.abort(); }, config.timeoutMs);
    try {
      const response = await fetch(`${config.baseUrl.replace(/\/$/, "")}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({ model: config.model, messages }),
        signal: controller.signal
      });
      if (!response.ok) throw providerError(errorKindForStatus(response.status), await readErrorMessage(response), response.status);
      const completion = await readCompletion(response);
      return Object.freeze({ ...completion, provider: config.name, model: config.model });
    } catch (error: unknown) {
      if (isStoryAgentProviderError(error)) throw error;
      const message = error instanceof Error ? error.message : "Provider request failed.";
      throw providerError("retryable", message);
    } finally {
      clearTimeout(timeout);
    }
  }
});
