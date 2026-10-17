import test from "node:test";
import assert from "node:assert/strict";
import {
  createStoryAgentProviderClient,
  isStoryAgentProviderError,
  type ProviderConfig
} from "../story-agent.integration.js";

const config: ProviderConfig = {
  name: "test-provider",
  baseUrl: "https://provider.example.test/v1/",
  apiKey: "test-key",
  model: "test-model",
  timeoutMs: 100
};

void test("posts an OpenAI-compatible completion request and normalizes usage", async () => {
  let request: Readonly<{ url: string; init: RequestInit }> | undefined;
  const fetch = async (url: string, init?: RequestInit): Promise<Response> => {
    await Promise.resolve();
    if (!init) throw new Error("Expected request initialization.");
    request = { url, init };
    return Response.json({
      choices: [{ message: { content: "{\\\"stories\\\":[]}" } }],
      usage: { prompt_tokens: 3, completion_tokens: 5, total_tokens: 8 }
    });
  };
  const client = createStoryAgentProviderClient({ config, fetch });

  const result = await client.complete({ messages: [{ role: "user", content: "Create stories" }] });

  assert.deepEqual(result, {
    text: "{\\\"stories\\\":[]}",
    usage: { inputTokens: 3, outputTokens: 5, totalTokens: 8 },
    provider: "test-provider",
    model: "test-model"
  });
  assert.ok(request);
  assert.equal(request.url, "https://provider.example.test/v1/chat/completions");
  assert.equal((request.init.headers as Record<string, string>).Authorization, "Bearer test-key");
  const body = request.init.body;
  if (typeof body !== "string") throw new Error("Expected a JSON request body.");
  assert.deepEqual(JSON.parse(body), {
    model: "test-model",
    messages: [{ role: "user", content: "Create stories" }]
  });
});

void test("classifies provider HTTP failures", async () => {
  const fetch = async (): Promise<Response> => {
    await Promise.resolve();
    return new Response("not authorized", { status: 401 });
  };
  const client = createStoryAgentProviderClient({ config, fetch });

  await assert.rejects(
    () => client.complete({ messages: [] }),
    (error: unknown): boolean => isStoryAgentProviderError(error) && error.kind === "auth" && error.status === 401
  );
});

void test("classifies retryable and bad-request provider responses", async () => {
  const retryable = createStoryAgentProviderClient({
    config,
    fetch: async (): Promise<Response> => {
      await Promise.resolve();
      return new Response("rate limited", { status: 429 });
    }
  });
  const badRequest = createStoryAgentProviderClient({
    config,
    fetch: async (): Promise<Response> => {
      await Promise.resolve();
      return new Response("invalid input", { status: 400 });
    }
  });

  await assert.rejects(
    () => retryable.complete({ messages: [] }),
    (error: unknown): boolean => isStoryAgentProviderError(error) && error.kind === "retryable" && error.status === 429
  );
  await assert.rejects(
    () => badRequest.complete({ messages: [] }),
    (error: unknown): boolean => isStoryAgentProviderError(error) && error.kind === "bad-request" && error.status === 400
  );
});

void test("treats fetch failures as retryable", async () => {
  const fetch = async (): Promise<Response> => {
    await Promise.resolve();
    throw new Error("network unavailable");
  };
  const client = createStoryAgentProviderClient({ config, fetch });

  await assert.rejects(
    () => client.complete({ messages: [] }),
    (error: unknown): boolean => isStoryAgentProviderError(error) && error.kind === "retryable"
  );
});

void test("treats an aborted request as retryable", async () => {
  const fetch = async (_url: string, init?: RequestInit): Promise<Response> => {
    await Promise.resolve();
    return new Promise((_, reject) => {
      init?.signal?.addEventListener("abort", () => { reject(new Error("request aborted")); });
    });
  };
  const client = createStoryAgentProviderClient({ config: { ...config, timeoutMs: 1 }, fetch });

  await assert.rejects(
    () => client.complete({ messages: [] }),
    (error: unknown): boolean => isStoryAgentProviderError(error) && error.kind === "retryable"
  );
});
