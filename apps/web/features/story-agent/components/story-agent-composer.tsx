"use client";

import { ArrowUp, Sparkles } from "lucide-react";
import type { FormEvent, RefObject } from "react";
import { Button, Textarea } from "@workspace/ui";

type StoryAgentComposerProps = Readonly<{
  input: string;
  isLoading: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onInputChange: (value: string) => void;
  onSend: () => void;
}>;

export const StoryAgentComposer = ({ input, isLoading, inputRef, onInputChange, onSend }: StoryAgentComposerProps): React.JSX.Element => {
  const submit = (event: FormEvent<HTMLFormElement>): void => { event.preventDefault(); onSend(); };
  return <form className="border-t border-[#365039] bg-[#102116] p-3 sm:p-4" onSubmit={submit}>
    <div className="mx-auto max-w-2xl rounded-sm border border-[#4c694d] bg-[#172a1a] p-2 transition focus-within:border-[#b6e278] focus-within:shadow-[0_0_0_3px_rgba(182,226,120,.12)]">
      <label htmlFor="story-agent-requirement" className="px-2 text-[10px] font-bold uppercase tracking-[.18em] text-[#a6c68a]">Product requirement brief</label>
      <Textarea id="story-agent-requirement" aria-label="Product requirement" ref={inputRef} value={input} onChange={(event) => onInputChange(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter" && !event.shiftKey) { event.preventDefault(); onSend(); } }} placeholder="Describe the actor, outcome, and non-negotiable constraints…" className="min-h-14 max-h-32 resize-none border-0 bg-transparent px-2 py-2 text-[#f4f3e8] placeholder:text-[#849983] shadow-none focus-visible:ring-0" />
      <div className="flex items-center justify-between gap-3 px-1 pb-1"><span className="hidden font-mono text-[11px] text-[#80977f] sm:inline">Enter to draft · Shift+Enter for a new line · Ctrl+J to focus</span><span className="font-mono text-[11px] text-[#80977f] sm:hidden">Shift+Enter adds a line</span><Button type="submit" disabled={isLoading || input.trim().length === 0} className="rounded-sm bg-[#b6e278] px-4 text-[#102116] hover:bg-[#ccef8c] disabled:bg-[#496645] disabled:text-[#aab7a4]"><Sparkles aria-hidden="true" className="mr-2 size-4" />Draft stories<ArrowUp aria-hidden="true" className="ml-2 size-4" /></Button></div>
    </div>
  </form>;
};
