"use client";

import { AlertCircle, ArrowUp, Check, Copy, Layers3, Sparkles } from "lucide-react";
import type { FormEvent, RefObject } from "react";
import { Badge, Button, GeckoMascot, ScrollArea, Skeleton, Textarea } from "@workspace/ui";
import type { StoryAgentRun, StoryAgentStory } from "../story-agent.types";

const suggestions = [
  "A shopper can add an available product to their cart",
  "A customer can edit a cart quantity and see the revised total",
  "A content editor can draft and publish an article"
] as const;

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

const formatError = (run: StoryAgentRun): string => run.error ?? run.reason ?? "We could not create stories for that requirement.";

const criterionParts = (criterion: string): React.JSX.Element => {
  const segments = criterion.split(/\b(?=(?:Given|When|Then)\b)/i).filter(Boolean);
  return <>{segments.map((segment, index) => {
    const match = /^(Given|When|Then)\s+(.+)$/i.exec(segment.trim());
    return match ? <span key={`${match[1]}-${index}`}><strong className="font-semibold text-[#cbeaa2]">{match[1]}</strong> {match[2]}{index < segments.length - 1 ? " · " : ""}</span> : <span key={index}>{segment}</span>;
  })}</>;
};

const StoryDossier = ({ index, story, onCopyStory }: Readonly<{ index: number; story: StoryAgentStory; onCopyStory: (story: StoryAgentStory) => Promise<void> }>): React.JSX.Element => (
  <article className="group relative overflow-hidden border border-[#3e5a41] bg-[#132116] p-5 shadow-[0_12px_32px_rgba(1,12,5,.16)] transition hover:border-[#789b65] sm:p-6">
    <div className="absolute left-0 top-0 h-full w-1 bg-[#a5d66c]" />
    <div className="flex items-start justify-between gap-4">
      <p className="font-mono text-[11px] font-bold tracking-[.18em] text-[#9fbe84]">STORY {String(index).padStart(2, "0")}</p>
      <div className="flex items-center gap-2">
        <Badge variant="outline" className="rounded-sm border-[#708e5c] bg-[#253f27] px-2.5 text-[#ddf3c0]">{story.size} slice</Badge>
        <Button type="button" variant="ghost" size="icon" aria-label={`Copy ${story.title}`} className="size-8 text-[#b7c8af] hover:bg-[#29442d] hover:text-[#f8faed]" onClick={() => { void onCopyStory(story); }}><Copy className="size-3.5" /></Button>
      </div>
    </div>
    <h3 className="mt-4 max-w-[25rem] font-serif text-xl font-semibold leading-tight text-[#f7f5e9] sm:text-2xl">{story.title}</h3>
    <p className="mt-3 max-w-[34rem] text-sm leading-6 text-[#c7d1c3]">{story.intent}</p>
    <dl className="mt-5 grid grid-cols-2 border-y border-[#304a34] py-3 text-xs sm:grid-cols-3">
      <div className="border-r border-[#304a34] pr-3"><dt className="font-bold uppercase tracking-[.14em] text-[#829a7f]">Epic</dt><dd className="mt-1 font-medium text-[#e2eadc]">{story.epic}</dd></div>
      <div className="px-3"><dt className="font-bold uppercase tracking-[.14em] text-[#829a7f]">Scope</dt><dd className="mt-1 font-medium text-[#e2eadc]">{story.size} / testable</dd></div>
      <div className="col-span-2 mt-3 border-t border-[#304a34] pt-3 sm:col-span-1 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0"><dt className="font-bold uppercase tracking-[.14em] text-[#829a7f]">State</dt><dd className="mt-1 truncate font-medium text-[#e2eadc]">{story.states.join(", ") || "Ready to refine"}</dd></div>
    </dl>
    <section className="mt-5" aria-labelledby={`criteria-${index}`}>
      <div className="flex items-center justify-between gap-3"><h4 id={`criteria-${index}`} className="text-xs font-bold uppercase tracking-[.16em] text-[#c9e99c]">Acceptance criteria</h4><span className="text-xs text-[#8ea38b]">{story.acceptanceCriteria.length} checks</span></div>
      <ol className="mt-3 space-y-2">
        {story.acceptanceCriteria.map((criterion, criterionIndex) => <li key={criterion} className="flex gap-3 rounded-sm bg-[#192b1d] px-3 py-2.5 text-sm leading-6 text-[#d8e2d3]"><span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[#587653] font-mono text-[10px] text-[#bde98a]">{criterionIndex + 1}</span><span>{criterionParts(criterion)}</span></li>)}
      </ol>
    </section>
    {story.openQuestions.length > 0 ? <p className="mt-4 border-l-2 border-[#c8aa5f] bg-[#352d1b] px-3 py-2 text-xs leading-5 text-[#f3e4b7]">Open question: {story.openQuestions.join(" · ")}</p> : null}
  </article>
);

const DraftCollection = ({ run, onCopyRun, onCopyStory }: Readonly<{ run: StoryAgentRun; onCopyRun: (run: StoryAgentRun | null) => Promise<void>; onCopyStory: (story: StoryAgentStory) => Promise<void> }>): React.JSX.Element => {
  const stories = run.stories ?? [];
  return <section aria-labelledby="draft-title" className="space-y-4">
    <header className="border-b border-[#3e5a41] pb-4">
      <div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a5c68a]">Draft collection</p><h2 id="draft-title" className="mt-2 font-serif text-2xl font-semibold text-[#f6f5e9]">{stories.length} independent slices</h2></div><Button type="button" variant="outline" size="sm" className="shrink-0 border-[#5a7855] bg-transparent text-[#dce9d7] hover:bg-[#26412a]" onClick={() => { void onCopyRun(run); }}><Copy className="mr-2 size-3.5" />Copy all</Button></div>
      <p className="mt-3 text-sm leading-6 text-[#aebdaa]">Each slice is independently demonstrable, with a focused outcome and explicit checks.</p>
    </header>
    <nav aria-label="Stories in this draft" className="flex gap-2 overflow-x-auto pb-1">{stories.map((story, index) => <a key={story.title} href={`#story-${index + 1}`} className="shrink-0 border border-[#426044] bg-[#17281a] px-3 py-2 text-xs text-[#d7e5d0] transition hover:border-[#9bca6f] hover:text-white">{String(index + 1).padStart(2, "0")} · {story.epic}</a>)}</nav>
    <div className="space-y-3">{stories.map((story, index) => <div id={`story-${index + 1}`} key={story.title}><StoryDossier index={index + 1} story={story} onCopyStory={onCopyStory} /></div>)}</div>
  </section>;
};

const RunResult = ({ run, onCopyRun, onCopyStory }: Readonly<{ run: StoryAgentRun; onCopyRun: (run: StoryAgentRun | null) => Promise<void>; onCopyStory: (story: StoryAgentStory) => Promise<void> }>): React.JSX.Element => {
  if (run.status === "draft") return <DraftCollection run={run} onCopyRun={onCopyRun} onCopyStory={onCopyStory} />;
  if (run.status === "queued") return <section aria-label="Queued request" className="border-l-4 border-[#d3b964] bg-[#352e1c] p-5 text-[#f6e9c1]"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e7d488]">Queued for capacity</p><h2 className="mt-2 font-serif text-xl font-semibold">Your brief is safely waiting.</h2><p className="mt-2 text-sm leading-6">High demand right now. We will keep this run and refresh the result when provider capacity returns.</p></section>;
  if (run.status === "failed") return <section role="alert" className="border-l-4 border-[#df7868] bg-[#402521] p-5 text-[#ffe0d8]"><div className="flex gap-3"><AlertCircle className="mt-0.5 size-5 shrink-0" /><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#f4a99d]">Draft unavailable</p><h2 className="mt-2 font-serif text-xl font-semibold">We could not shape this brief.</h2><p className="mt-2 text-sm leading-6">{formatError(run)}</p></div></div></section>;
  return <section aria-labelledby="clarify-title" className="border border-[#466247] bg-[#17281a] p-5 sm:p-6"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b8dc90]">Before we draft</p><h2 id="clarify-title" className="mt-2 font-serif text-2xl font-semibold text-[#f6f5e9]">A few decisions will sharpen the work.</h2><ol className="mt-5 divide-y divide-[#365139] border-y border-[#365139]">{run.questions?.map((question, index) => <li key={question} className="flex gap-4 py-4"><span className="font-mono text-sm text-[#a5d66c]">{String(index + 1).padStart(2, "0")}</span><p className="text-sm leading-6 text-[#e3ebdf]">{question}</p></li>)}</ol></section>;
};

const LoadingState = (): React.JSX.Element => <div className="border border-[#3d5a40] bg-[#132116] p-5"><div className="flex items-center gap-3"><GeckoMascot state="thinking" className="size-12 text-[#a7d66e]" /><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a6c58c]">Shaping the work</p><p className="mt-1 text-sm text-[#d6e0d2]">Checking scope, outcomes, and testability.</p></div></div><div className="mt-6 space-y-3"><Skeleton className="h-4 w-4/5 bg-[#29422d]" /><Skeleton className="h-4 w-full bg-[#29422d]" /><Skeleton className="h-4 w-3/5 bg-[#29422d]" /></div></div>;

export const StoryAgentChat = ({ input, isLoading, run, inputRef, onInputChange, onSend, onSuggestion, onCopyRun, onCopyStory }: StoryAgentChatProps): React.JSX.Element => {
  const submit = (event: FormEvent<HTMLFormElement>): void => { event.preventDefault(); onSend(); };
  return <div className="flex min-h-0 flex-1 flex-col bg-[#0c180f]">
    <ScrollArea className="min-h-0 flex-1 px-4 py-5 sm:px-6">
      <div className="mx-auto max-w-2xl">
        {!run && !isLoading ? <section className="py-5 sm:py-10"><div className="grid gap-6 border-b border-[#3b573d] pb-8 sm:grid-cols-[auto_1fr] sm:items-end"><GeckoMascot className="size-24 text-[#a5d66c] sm:size-28" /><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a5c68a]">Story workshop</p><h2 className="mt-2 max-w-md font-serif text-3xl font-semibold leading-[1.06] text-[#f6f5e9]">Turn a product outcome into work your team can prove.</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#aebdaa]">Start with the actor and the change they should experience. Gecko will find the useful slices.</p></div></div><div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#90a88d]">Try a starting point</p><div className="mt-3 grid gap-2">{suggestions.map((suggestion, index) => <Button key={suggestion} type="button" variant="outline" className="h-auto justify-start border-[#3e5b41] bg-[#152618] px-4 py-3 text-left text-sm font-normal text-[#dce8d7] hover:border-[#9ac66e] hover:bg-[#203923]" onClick={() => onSuggestion(suggestion)}><span className="mr-3 font-mono text-xs text-[#a5d66c]">0{index + 1}</span>{suggestion}</Button>)}</div></div></section> : null}
        {isLoading ? <LoadingState /> : null}
        {run ? <RunResult run={run} onCopyRun={onCopyRun} onCopyStory={onCopyStory} /> : null}
      </div>
    </ScrollArea>
    <form className="border-t border-[#365039] bg-[#102116] p-3 sm:p-4" onSubmit={submit}>
      <div className="mx-auto max-w-2xl rounded-sm border border-[#4c694d] bg-[#172a1a] p-2 transition focus-within:border-[#b6e278] focus-within:shadow-[0_0_0_3px_rgba(182,226,120,.12)]"><label htmlFor="story-agent-requirement" className="sr-only">Product requirement</label><Textarea id="story-agent-requirement" aria-label="Product requirement" ref={inputRef} value={input} onChange={(event) => onInputChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} placeholder="Describe the actor, outcome, and constraints…" className="min-h-14 max-h-32 resize-none border-0 bg-transparent px-2 py-2 text-[#f4f3e8] placeholder:text-[#849983] shadow-none focus-visible:ring-0" /><div className="flex items-center justify-between gap-3 px-1 pb-1"><span className="hidden text-xs text-[#80977f] sm:inline">Enter to draft · Shift+Enter for a new line</span><span className="text-xs text-[#80977f] sm:hidden">Shift+Enter adds a line</span><Button type="submit" disabled={isLoading || input.trim().length === 0} className="rounded-sm bg-[#b6e278] px-4 text-[#102116] hover:bg-[#ccef8c] disabled:bg-[#496645] disabled:text-[#aab7a4]"><Sparkles aria-hidden="true" className="mr-2 size-4" />Draft stories<ArrowUp aria-hidden="true" className="ml-2 size-4" /></Button></div></div>
    </form>
  </div>;
};
