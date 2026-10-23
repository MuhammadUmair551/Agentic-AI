"use client";

import type { RefObject } from "react";
import { ScrollArea } from "@workspace/ui";
import { StoryAgentComposer } from "./story-agent-composer";
import { StoryAgentEmptyState } from "./story-agent-empty-state";
import { StoryAgentLoadingState, StoryAgentRunState } from "./story-agent-run-state";
import type { StoryAgentRun, StoryAgentStory } from "../story-agent.types";

type StoryAgentChatProps = Readonly<{
  input: string;
  isLoading: boolean;
  run: StoryAgentRun | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSuggestion: (suggestion: string) => void;
  onCopyRun: (run: StoryAgentRun | null) => Promise<void>;
  onCopyStory: (story: StoryAgentStory) => Promise<void>;
}>;

export const StoryAgentChat = ({ input, isLoading, run, inputRef, onInputChange, onSend, onSuggestion, onCopyRun, onCopyStory }: StoryAgentChatProps): React.JSX.Element => (
  <div className="flex min-h-0 flex-1 flex-col bg-[#0c180f]">
    <ScrollArea className="min-h-0 flex-1 px-4 py-5 sm:px-6"><div className="mx-auto max-w-2xl">
      {!run && !isLoading ? <StoryAgentEmptyState onSuggestion={onSuggestion} /> : null}
      {isLoading ? <StoryAgentLoadingState /> : null}
      {run ? <StoryAgentRunState run={run} onCopyRun={onCopyRun} onCopyStory={onCopyStory} /> : null}
    </div></ScrollArea>
    <StoryAgentComposer input={input} isLoading={isLoading} inputRef={inputRef} onInputChange={onInputChange} onSend={onSend} />
  </div>
);
