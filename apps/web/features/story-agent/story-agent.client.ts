import type {
  StoryAgentRun,
  StoryAgentRunDetail,
  StoryAgentRunResponse,
  StoryAgentStatus,
  StoryAgentStory
} from "./story-agent.types";

export const filterStoryAgentRuns = (runs: StoryAgentRun[], query: string): StoryAgentRun[] => {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return runs;

  return runs.filter((run) => {
    const searchable = [run.requirement, ...(run.stories ?? []).map((story) => story.title), ...(run.stories ?? []).map((story) => story.epic), ...(run.questions ?? [])].join(" ").toLowerCase();
    return searchable.includes(normalizedQuery);
  });
};

export const buildStoryAgentRunCopyText = (run: StoryAgentRun): string => {
  const sections: string[] = [];
  sections.push(`Requirement: ${run.requirement || "Untitled requirement"}`);
  if (run.status) sections.push(`Status: ${run.status}`);
  if (run.error) sections.push(`Error: ${run.error}`);
  if (run.reason) sections.push(`Reason: ${run.reason}`);
  const stories = run.stories ?? [];
  if (stories.length === 0) return sections.join("\n");

  sections.push("\nStories:");
  for (const story of stories) {
    sections.push(`\n- ${story.title} (${story.size})`);
    sections.push(`  Intent: ${story.intent}`);
    sections.push(`  Epic: ${story.epic}`);
    if (story.acceptanceCriteria.length > 0) {
      sections.push("  Acceptance criteria:");
      for (const criterion of story.acceptanceCriteria) sections.push(`    • ${criterion}`);
    }
    if (story.states.length > 0) sections.push(`  States: ${story.states.join(", ")}`);
    if (story.dependsOn.length > 0) sections.push(`  Depends on: ${story.dependsOn.join(", ")}`);
    if (story.openQuestions.length > 0) sections.push(`  Open questions: ${story.openQuestions.join(", ")}`);
    if (story.sliceRationale) sections.push(`  Slice rationale: ${story.sliceRationale}`);
  }
  return sections.join("\n");
};

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
