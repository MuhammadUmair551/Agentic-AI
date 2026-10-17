export type StoryAgentStatus = "questions" | "draft" | "failed" | "queued";

export type StoryAgentStory = {
  title: string;
  size: "S" | "M" | "L";
  acceptanceCriteria: string[];
  assumptions?: string[] | undefined;
  openQuestions?: string[] | undefined;
};

export type StoryAgentUsage = {
  inputTokens?: number | undefined;
  outputTokens?: number | undefined;
  totalTokens?: number | undefined;
};

export type StoryAgentRun = {
  runId: string;
  status: StoryAgentStatus;
  requirement: string;
  questions?: string[] | undefined;
  stories?: StoryAgentStory[] | undefined;
  usage?: StoryAgentUsage | undefined;
  error?: string | undefined;
  reason?: string | undefined;
  createdAt?: string | undefined;
  updatedAt?: string | undefined;
};

export type StoryAgentRunResponse = Pick<
  StoryAgentRun,
  "runId" | "status" | "questions" | "stories" | "usage" | "error" | "reason"
> & {
  message?: string | undefined;
};

export type StoryAgentRunDetail = {
  run: StoryAgentRun;
  draft: { stories: StoryAgentStory[] } | null;
};
