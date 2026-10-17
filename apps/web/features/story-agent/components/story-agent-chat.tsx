"use client";

import { AlertCircle, Send, Sparkles } from "lucide-react";
import type { FormEvent, RefObject } from "react";
import { Badge, Button, ScrollArea, Skeleton, Textarea } from "@workspace/ui/primitives";
import type { StoryAgentRun } from "../story-agent.types";

const suggestions = [
  "Draft stories from requirement",
  "Check existing stories",
  "Explain the hierarchy",
  "Help with acceptance criteria"
];

type StoryAgentChatProps = {
  input: string;
  isLoading: boolean;
  run: StoryAgentRun | null;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSuggestion: (suggestion: string) => void;
};

const formatError = (run: StoryAgentRun): string =>
  run.error ?? run.reason ?? "We could not create stories for that requirement.";

const StoryCards = ({ run }: { run: StoryAgentRun }): React.JSX.Element => (
  <div className="space-y-3">
    {run.stories?.map((story) => (
      <article key={story.title} className="rounded-xl border border-slate-700 bg-slate-900 p-3 shadow-sm">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-sm font-semibold text-slate-100">{story.title}</h3>
          <Badge className="border-fuchsia-400/40 bg-fuchsia-500/20 text-fuchsia-200" variant="outline">
            {story.size}
          </Badge>
        </div>
        <details className="mt-3 text-sm text-slate-300">
          <summary className="cursor-pointer text-xs font-medium text-fuchsia-300">Acceptance criteria</summary>
          <ul className="mt-2 list-disc space-y-1 pl-5">
            {story.acceptanceCriteria.map((criterion) => <li key={criterion}>{criterion}</li>)}
          </ul>
        </details>
      </article>
    ))}
  </div>
);

const RunResult = ({ run }: { run: StoryAgentRun }): React.JSX.Element => {
  if (run.status === "queued") {
    return <div className="rounded-xl border border-fuchsia-400/40 bg-fuchsia-500/15 p-3 text-sm text-fuchsia-100">High demand right now. Your request is queued; the result usually arrives in a few minutes.</div>;
  }

  if (run.status === "failed") {
    return <div className="flex gap-2 rounded-xl border border-red-400/40 bg-red-500/15 p-3 text-sm text-red-100"><AlertCircle className="mt-0.5 size-4 shrink-0" />{formatError(run)}</div>;
  }

  if (run.status === "questions") {
    return <div className="space-y-2">{run.questions?.map((question) => <div key={question} className="w-fit max-w-[92%] rounded-2xl rounded-tl-sm bg-slate-800 px-3 py-2 text-sm text-slate-100">{question}</div>)}</div>;
  }

  return <StoryCards run={run} />;
};

export const StoryAgentChat = ({ input, isLoading, run, inputRef, onInputChange, onSend, onSuggestion }: StoryAgentChatProps): React.JSX.Element => {
  const submit = (event: FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onSend();
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <ScrollArea className="min-h-0 flex-1 px-5 py-6">
        {!run && !isLoading ? (
          <div className="flex min-h-80 flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 p-3"><Sparkles className="size-7 text-white" /></div>
            <h2 className="text-lg font-semibold text-slate-100">What can I help with?</h2>
            <div className="mt-5 flex flex-wrap justify-center gap-2">{suggestions.map((suggestion) => <Button key={suggestion} type="button" variant="outline" size="sm" className="border-slate-700 bg-slate-900 text-slate-200 hover:bg-slate-800" onClick={() => onSuggestion(suggestion)}>{suggestion}</Button>)}</div>
          </div>
        ) : null}
        {isLoading ? <div className="space-y-3"><Skeleton className="h-4 w-4/5 bg-slate-800" /><Skeleton className="h-4 w-3/5 bg-slate-800" /><Skeleton className="h-4 w-2/3 bg-slate-800" /></div> : null}
        {run ? <RunResult run={run} /> : null}
      </ScrollArea>
      <form className="border-t border-slate-800 bg-slate-950 p-4" onSubmit={submit}>
        <div className="flex items-end gap-2 rounded-2xl border border-slate-700 bg-slate-900 p-2 focus-within:border-fuchsia-400">
          <Textarea ref={inputRef} value={input} onChange={(event) => onInputChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} placeholder="Describe your requirement... (Ctrl+J)" className="min-h-10 max-h-28 resize-none border-0 bg-transparent py-2 text-slate-100 shadow-none focus-visible:ring-0" />
          <Button type="submit" size="icon" disabled={isLoading || input.trim().length === 0} className="shrink-0 rounded-xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:opacity-90"><Send /></Button>
        </div>
      </form>
    </div>
  );
};
