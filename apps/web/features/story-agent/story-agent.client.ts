import type {
  StoryAgentRun,
  StoryAgentRunDetail,
  StoryAgentRunResponse,
  StoryAgentStatus,
  StoryAgentStory
} from "./story-agent.types";

type Fetch = typeof fetch;

type CreateRunInput = {
  requirement: string;
};

const asRecord = (value: unknown): Record<string, unknown> =>
  typeof value === "object" && value !== null ? value as Record<string, unknown> : {};

const asStatus = (value: unknown): StoryAgentStatus => {
  if (value === "questions" || value === "draft" || value === "failed" || value === "queued") {
    return value;
  }

  return "failed";
};

const asStrings = (value: unknown): string[] | undefined =>
  Array.isArray(value) && value.every((item) => typeof item === "string") ? value : undefined;

const asStories = (value: unknown): StoryAgentStory[] | undefined =>
  Array.isArray(value) ? value as StoryAgentStory[] : undefined;

const toRun = (value: unknown): StoryAgentRun => {
  const record = asRecord(value);

  return {
    runId: typeof record.runId === "string" ? record.runId : "",
    status: asStatus(record.status),
    requirement: typeof record.requirement === "string" ? record.requirement : "",
    questions: asStrings(record.questions),
    stories: asStories(record.stories),
    usage: asRecord(record.usage),
    error: typeof record.error === "string" ? record.error : undefined,
    reason: typeof record.reason === "string" ? record.reason : undefined,
    createdAt: typeof record.createdAt === "string" ? record.createdAt : undefined,
    updatedAt: typeof record.updatedAt === "string" ? record.updatedAt : undefined
  };
};

const readJson = async (response: Response): Promise<unknown> => response.json() as Promise<unknown>;

const getErrorMessage = (payload: unknown): string => {
  const record = asRecord(payload);
  return typeof record.message === "string"
    ? record.message
    : typeof record.error === "string"
      ? record.error
      : "Story Agent could not complete that request.";
};

const request = async (fetcher: Fetch, url: string, init?: RequestInit): Promise<unknown> => {
  const response = await fetcher(url, init);
  const payload = await readJson(response);

  if (!response.ok) {
    throw new Error(getErrorMessage(payload));
  }

  return payload;
};

export const createStoryAgentClient = (baseUrl: string, fetcher: Fetch = fetch) => {
  const endpoint = `${baseUrl.replace(/\/$/, "")}/story-agent/runs`;

  return {
    createRun: async (input: CreateRunInput): Promise<StoryAgentRunResponse> => {
      const payload = asRecord(await request(fetcher, endpoint, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(input)
      }));

      return {
        runId: typeof payload.runId === "string" ? payload.runId : "",
        status: asStatus(payload.status),
        questions: asStrings(payload.questions),
        stories: asStories(payload.stories),
        usage: asRecord(payload.usage),
        error: typeof payload.error === "string" ? payload.error : undefined,
        reason: typeof payload.reason === "string" ? payload.reason : undefined,
        message: typeof payload.message === "string" ? payload.message : undefined
      };
    },
    listRuns: async (): Promise<StoryAgentRun[]> => {
      const payload = asRecord(await request(fetcher, `${endpoint}?limit=20&skip=0`));
      const runs = Array.isArray(payload.runs) ? payload.runs : [];
      return runs.map(toRun);
    },
    getRun: async (runId: string): Promise<StoryAgentRunDetail> => {
      const payload = asRecord(await request(fetcher, `${endpoint}/${encodeURIComponent(runId)}`));
      const draft = asRecord(payload.draft);

      return {
        run: toRun(payload.run),
        draft: payload.draft === null ? null : { stories: asStories(draft.stories) ?? [] }
      };
    }
  };
};
