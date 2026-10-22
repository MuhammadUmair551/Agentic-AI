"use client";

import { Leaf, X } from "lucide-react";
import { useEffect, useState, type RefObject } from "react";
import { Button, GeckoMascot, Tabs, TabsContent, TabsList, TabsTrigger } from "@workspace/ui";
import { StoryAgentChat } from "./story-agent-chat";
import { StoryAgentHistory } from "./story-agent-history";
import type { StoryAgentRun, StoryAgentStory } from "../story-agent.types";

type StoryAgentPanelProps = {
  isOpen: boolean;
  input: string;
  isLoading: boolean;
  run: StoryAgentRun | null;
  history: StoryAgentRun[];
  historySearch: string;
  isHistoryLoading: boolean;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  onClose: () => void;
  onInputChange: (value: string) => void;
  onNewChat: () => void;
  onHistorySearchChange: (value: string) => void;
  onSend: () => void;
  onSuggestion: (suggestion: string) => void;
  onSelectHistory: (runId: string) => void;
  onCopyRun: (run: StoryAgentRun | null) => Promise<void>;
  onCopyStory: (story: StoryAgentStory) => Promise<void>;
};

export const StoryAgentPanel = (props: StoryAgentPanelProps): React.JSX.Element => {
  const [activeTab, setActiveTab] = useState("chat");

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent): void => {
      if (event.key === "Escape" && props.isOpen) props.onClose();
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [props.isOpen, props.onClose]);

  return (
    <>
      <button type="button" aria-label="Close Story Agent" onClick={props.onClose} className={`fixed inset-0 z-40 bg-[#061008]/70 backdrop-blur-[2px] transition-opacity ${props.isOpen ? "opacity-100" : "pointer-events-none opacity-0"}`} />
      <aside id="story-agent-panel" role="dialog" aria-modal="true" aria-labelledby="story-agent-title" className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-[470px] flex-col border-l border-[#38513b] bg-[#0e1c12] shadow-2xl transition-transform duration-300 ease-out ${props.isOpen ? "translate-x-0" : "translate-x-full"}`}>
        <header className="relative overflow-hidden border-b border-[#4b674a] bg-[#173b24] px-5 py-5 text-[#f4f3e8]">
          <Leaf aria-hidden="true" className="absolute -right-4 -top-4 size-28 rotate-12 text-[#83ac62]/15" />
          <div className="flex items-center justify-between gap-3 pr-12">
            <div className="flex items-center gap-3">
              <GeckoMascot className="size-10 text-[#b8e47a]" />
              <div>
                <p id="story-agent-title" className="font-serif text-xl font-semibold tracking-tight">Story Agent</p><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#c1d3b6]">A calm space for product thinking</p>
              </div>
            </div>
            <Button type="button" variant="outline" size="sm" className="border-[#668461] bg-[#23452b] text-[#edf2df] hover:bg-[#2b5734]" onClick={props.onNewChat}>New chat</Button>
          </div>
          <Button type="button" variant="ghost" size="icon" aria-label="Close Story Agent" className="absolute right-3 top-3 text-[#edf2df] hover:bg-[#315d39] hover:text-white" onClick={props.onClose}><X /></Button>
        </header>
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex min-h-0 flex-1 flex-col">
          <TabsList className="h-auto justify-start rounded-none border-b border-[#304635] bg-[#0e1c12] p-0">
            <TabsTrigger value="chat" className="rounded-none px-5 py-3 text-[#9caf9e] data-[state=active]:border-b-2 data-[state=active]:border-[#b8e47a] data-[state=active]:bg-transparent data-[state=active]:text-[#f4f3e8] data-[state=active]:shadow-none">Chat</TabsTrigger>
            <TabsTrigger value="history" className="rounded-none px-5 py-3 text-[#9caf9e] data-[state=active]:border-b-2 data-[state=active]:border-[#b8e47a] data-[state=active]:bg-transparent data-[state=active]:text-[#f4f3e8] data-[state=active]:shadow-none">History</TabsTrigger>
          </TabsList>
          <TabsContent value="chat" className="mt-0 flex min-h-0 flex-1 flex-col"><StoryAgentChat input={props.input} isLoading={props.isLoading} run={props.run} inputRef={props.inputRef} onInputChange={props.onInputChange} onSend={props.onSend} onSuggestion={props.onSuggestion} onCopyRun={props.onCopyRun} onCopyStory={props.onCopyStory} /></TabsContent>
          <TabsContent value="history" className="mt-0 flex min-h-0 flex-1 flex-col"><StoryAgentHistory runs={props.history} searchValue={props.historySearch} isLoading={props.isHistoryLoading} onSearchChange={props.onHistorySearchChange} onSelect={(runId) => { props.onSelectHistory(runId); setActiveTab("chat"); }} onNewChat={props.onNewChat} /></TabsContent>
        </Tabs>
      </aside>
    </>
  );
};
