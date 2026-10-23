import { AlertCircle } from "lucide-react";
import { GeckoMascot, Skeleton } from "@workspace/ui";
import { StoryAgentDraftCollection } from "./story-agent-draft-collection";
import type { StoryAgentRun, StoryAgentStory } from "../story-agent.types";

type RunStateProps = Readonly<{ run: StoryAgentRun; onCopyRun: (run: StoryAgentRun | null) => Promise<void>; onCopyStory: (story: StoryAgentStory) => Promise<void> }>;

export const StoryAgentLoadingState = (): React.JSX.Element => <div className="border border-[#3d5a40] bg-[#132116] p-5"><div className="flex items-center gap-3"><GeckoMascot state="thinking" className="size-12 text-[#a7d66e]" /><div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a6c58c]">Shaping the work</p><p className="mt-1 text-sm text-[#d6e0d2]">Checking scope, outcomes, and testability.</p></div></div><div className="mt-6 space-y-3"><Skeleton className="h-4 w-4/5 bg-[#29422d]" /><Skeleton className="h-4 w-full bg-[#29422d]" /><Skeleton className="h-4 w-3/5 bg-[#29422d]" /></div></div>;

export const StoryAgentRunState = ({ run, onCopyRun, onCopyStory }: RunStateProps): React.JSX.Element => {
  if (run.status === "draft") return <StoryAgentDraftCollection run={run} onCopyRun={onCopyRun} onCopyStory={onCopyStory} />;
  if (run.status === "queued") return <section aria-label="Queued request" className="border-l-4 border-[#d3b964] bg-[#352e1c] p-5 text-[#f6e9c1]"><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#e7d488]">Queued for capacity</p><h2 className="mt-2 font-serif text-xl font-semibold">Your brief is safely waiting.</h2><p className="mt-2 text-sm leading-6">High demand right now. Your saved run will refresh automatically when provider capacity returns.</p></section>;
  if (run.status === "failed") return <section role="alert" className="border-l-4 border-[#df7868] bg-[#402521] p-5 text-[#ffe0d8]"><div className="flex gap-3"><AlertCircle className="mt-0.5 size-5 shrink-0" /><div><p className="text-[10px] font-bold uppercase tracking-[.18em] text-[#f4a99d]">Draft unavailable</p><h2 className="mt-2 font-serif text-xl font-semibold">We could not shape this brief.</h2><p className="mt-2 text-sm leading-6">{run.error ?? run.reason ?? "Please adjust the brief and try again."}</p></div></div></section>;
  return <section aria-labelledby="clarify-title" className="border border-[#466247] bg-[#17281a] p-5 sm:p-6"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#b8dc90]">Before we draft</p><h2 id="clarify-title" className="mt-2 font-serif text-2xl font-semibold text-[#f6f5e9]">A few decisions will sharpen the work.</h2><ol className="mt-5 divide-y divide-[#365139] border-y border-[#365139]">{run.questions?.map((question, index) => <li key={question} className="flex gap-4 py-4"><span className="font-mono text-sm text-[#a5d66c]">{String(index + 1).padStart(2, "0")}</span><p className="text-sm leading-6 text-[#e3ebdf]">{question}</p></li>)}</ol></section>;
};
