"use client";

import { Badge, Button, ScrollArea, Skeleton } from "@workspace/ui/primitives";
import type { StoryAgentRun } from "../story-agent.types";

type StoryAgentHistoryProps = {
  runs: StoryAgentRun[];
  isLoading: boolean;
  onSelect: (runId: string) => void;
};

const statusClass: Record<StoryAgentRun["status"], string> = {
  draft: "border-emerald-400/40 bg-emerald-500/15 text-emerald-200",
  questions: "border-sky-400/40 bg-sky-500/15 text-sky-200",
  queued: "border-fuchsia-400/40 bg-fuchsia-500/15 text-fuchsia-200",
  failed: "border-red-400/40 bg-red-500/15 text-red-200"
};

const time = (value: string | undefined): string => value ? new Date(value).toLocaleString() : "Just now";

export const StoryAgentHistory = ({ runs, isLoading, onSelect }: StoryAgentHistoryProps): React.JSX.Element => (
  <ScrollArea className="min-h-0 flex-1 px-5 py-5">
    {isLoading ? <div className="space-y-3"><Skeleton className="h-20 w-full bg-slate-800" /><Skeleton className="h-20 w-full bg-slate-800" /></div> : null}
    {!isLoading && runs.length === 0 ? <p className="py-12 text-center text-sm text-slate-400">No Story Agent runs yet.</p> : null}
    <div className="space-y-2">{runs.map((run) => <Button key={run.runId} type="button" variant="outline" className="h-auto w-full justify-start border-slate-800 bg-slate-900 p-3 text-left hover:bg-slate-800" onClick={() => onSelect(run.runId)}><span className="min-w-0 flex-1"><span className="block truncate text-sm font-medium text-slate-100">{run.requirement || "Untitled requirement"}</span><span className="mt-1 block text-xs text-slate-400">{time(run.createdAt)}</span></span><Badge variant="outline" className={statusClass[run.status]}>{run.status}</Badge></Button>)}</div>
  </ScrollArea>
);
