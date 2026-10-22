export type StoryAgentStatus = "questions" | "draft" | "failed" | "queued";

export type StoryAgentStory = {
  title: string;
  intent: string;
  epic: string;
  size: "S" | "M" | "L";
  acceptanceCriteria: string[];
  states: string[];
  dependsOn: string[];
  openQuestions: string[];
  sliceRationale: string;
  assumptions?: string[] | undefined;
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
  message?: string | undefined;
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
