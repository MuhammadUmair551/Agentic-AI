"use client";

import { Badge, Button, Input, ScrollArea, Skeleton } from "@workspace/ui";
import type { StoryAgentRun } from "../story-agent.types";

type StoryAgentHistoryProps = {
  runs: StoryAgentRun[];
  searchValue: string;
  isLoading: boolean;
  onSearchChange: (value: string) => void;
  onSelect: (runId: string) => void;
  onNewChat: () => void;
};

const statusClass: Record<StoryAgentRun["status"], string> = {
  draft: "border-[#76a95a] bg-[#23472a] text-[#d6efb7]",
  questions: "border-[#6faeab] bg-[#1d4542] text-[#c5efea]",
  queued: "border-[#c9ad66] bg-[#41351c] text-[#f2e5b4]",
  failed: "border-[#d87869] bg-[#482522] text-[#ffd9d1]"
};

const time = (value: string | undefined): string => value ? new Date(value).toLocaleString() : "Just now";

export const StoryAgentHistory = ({ runs, searchValue, isLoading, onSearchChange, onSelect, onNewChat }: StoryAgentHistoryProps): React.JSX.Element => (
  <ScrollArea className="min-h-0 flex-1 bg-[#0c180f] px-5 py-6">
    <div className="mx-auto max-w-2xl">
    <header className="border-b border-[#3a553d] pb-5"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#a6c68a]">Saved work</p><div className="mt-2 flex items-end justify-between gap-3"><h2 className="font-serif text-2xl font-semibold text-[#f5f4e9]">Conversation archive</h2><Button type="button" variant="outline" size="sm" className="shrink-0 border-[#5a7855] bg-transparent text-[#dce9d7] hover:bg-[#26412a]" onClick={onNewChat}>New brief</Button></div></header>
    <div className="my-5"><label htmlFor="story-agent-history-search" className="sr-only">Search conversations</label><Input id="story-agent-history-search" value={searchValue} aria-label="Search story history" onChange={(event) => onSearchChange(event.target.value)} placeholder="Search a requirement, story, or epic" className="h-11 border-[#496247] bg-[#152618] text-[#f4f3e8] placeholder:text-[#849983]" /></div>
    {isLoading ? <div className="space-y-3"><Skeleton className="h-20 w-full bg-[#243727]" /><Skeleton className="h-20 w-full bg-[#243727]" /></div> : null}
    {!isLoading && runs.length === 0 ? <p className="py-12 text-center text-sm leading-6 text-[#9caf9e]">{searchValue.trim() ? "No conversations match that search." : "Your saved conversations will appear here."}</p> : null}
    <ol className="border-l border-[#456247]">{runs.map((run) => <li key={run.runId} className="relative ml-5 border-b border-[#324a35] py-4 last:border-b-0"><span aria-hidden="true" className="absolute -left-[1.56rem] top-6 size-2.5 rounded-full border-2 border-[#0c180f] bg-[#a5d66c]" /><Button type="button" variant="ghost" className="h-auto w-full justify-start rounded-none p-0 text-left hover:bg-transparent" onClick={() => onSelect(run.runId)}><span className="min-w-0 flex-1 pr-3"><span className="block truncate font-serif text-base font-semibold text-[#f4f3e8]">{run.requirement || "Untitled requirement"}</span><span className="mt-1 block text-xs text-[#9caf9e]">{time(run.createdAt)}</span></span><Badge variant="outline" className={`shrink-0 rounded-sm ${statusClass[run.status]}`}>{run.status}</Badge></Button></li>)}</ol>
    </div>
  </ScrollArea>
);
