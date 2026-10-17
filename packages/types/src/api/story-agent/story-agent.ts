export type StoryAgentRunStatus = "questions" | "draft" | "failed" | "queued";

export type StoryAgentRequirementInput = Readonly<{
  requirement: string;
  context?: string | undefined;
}>;

export type StoryAgentClarifications = Readonly<{
  questions: readonly string[];
  assumptions: readonly string[];
}>;

export type StoryAgentStory = Readonly<{
  title: string;
  intent: string;
  epic: string;
  size: "S" | "M" | "L";
  acceptanceCriteria: readonly string[];
  states: readonly string[];
  dependsOn: readonly string[];
  openQuestions: readonly string[];
  sliceRationale: string;
}>;

export type StoryAgentUsage = Readonly<{
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}>;

export type StoryAgentRunResponse = Readonly<{
  runId: string;
  status: StoryAgentRunStatus;
  usage: StoryAgentUsage;
  questions?: readonly string[] | undefined;
  stories?: readonly StoryAgentStory[] | undefined;
  error?: string | undefined;
}>;
