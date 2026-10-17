"use client";

import { X } from "lucide-react";
import { useState, type RefObject } from "react";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui/primitives";
import { StoryAgentChat } from "./story-agent-chat";
import { StoryAgentHistory } from "./story-agent-history";
import type { StoryAgentRun } from "../story-agent.types";

type StoryAgentPanelProps = {
  isOpen: boolean;
  input: string;
  isLoading: boolean;
  run: StoryAgentRun | null;
  history: StoryAgentRun[];
  isHistoryLoading: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onSend: () => void;
  onSuggestion: (suggestion: string) => void;
  onSelectHistory: (runId: string) => void;
};

export const StoryAgentPanel = (props: StoryAgentPanelProps): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <>
    <button type="button" aria-label="Close Story Agent" onClick={props.onClose} className={`fixed inset-0 z-40 bg-slate-950/50 transition-opacity ${props.isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />
    <aside aria-label="Story Agent" className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[450px] flex-col border-l border-slate-800 bg-slate-950 shadow-2xl transition-transform duration-300 ease-out ${props.isOpen ? "translate-x-0" : "translate-x-full"}`}>
      <header className="relative bg-gradient-to-r from-purple-600 to-pink-600 px-5 py-5 text-white">
        <p className="text-lg font-bold">Story Agent</p><p className="text-xs font-semibold tracking-widest text-white/75">IN SQUID NEXT</p>
        <Button type="button" variant="ghost" size="icon" aria-label="Close Story Agent" className="absolute right-3 top-3 text-white hover:bg-white/15 hover:text-white" onClick={props.onClose}><X /></Button>
      </header>
      <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
        <TabsList className="h-auto justify-start rounded-none border-b border-slate-800 bg-slate-950 p-0">
          <TabsTrigger value="chat" className="rounded-none px-5 py-3 text-slate-400 data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-400 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none">Chat</TabsTrigger>
          <TabsTrigger value="history" className="rounded-none px-5 py-3 text-slate-400 data-[state=active]:border-b-2 data-[state=active]:border-fuchsia-400 data-[state=active]:bg-transparent data-[state=active]:text-white data-[state=active]:shadow-none">History</TabsTrigger>
        </TabsList>
        <TabsContent value="chat" className="mt-0 flex min-h-0 flex-1 flex-col"><StoryAgentChat input={props.input} isLoading={props.isLoading} run={props.run} inputRef={props.inputRef} onInputChange={props.onInputChange} onSend={props.onSend} onSuggestion={props.onSuggestion} /></TabsContent>
        <TabsContent value="history" className="mt-0 flex min-h-0 flex-1 flex-col"><StoryAgentHistory runs={props.history} isLoading={props.isHistoryLoading} onSelect={(runId) => { props.onSelectHistory(runId); setActiveTab("chat"); }} /></TabsContent>
      </Tabs>
    </aside>
    </>
  );
};
