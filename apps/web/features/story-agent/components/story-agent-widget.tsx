"use client";

import { Plus } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button, GeckoMascot } from "@workspace/ui";
import { buildStoryAgentRunCopyText, createStoryAgentClient, filterStoryAgentRuns } from "../story-agent.client";
import type { StoryAgentRun, StoryAgentStory } from "../story-agent.types";
import { StoryAgentPanel } from "./story-agent-panel";

type StoryAgentWidgetProps = { apiBaseUrl: string };

export const StoryAgentWidget = ({ apiBaseUrl }: StoryAgentWidgetProps): React.JSX.Element => {
  const client = useMemo(() => createStoryAgentClient(apiBaseUrl), [apiBaseUrl]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const requestSequenceRef = useRef(0);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historySearch, setHistorySearch] = useState("");
  const [run, setRun] = useState<StoryAgentRun | null>(null);
  const [history, setHistory] = useState<StoryAgentRun[]>([]);

  const loadHistory = useCallback(async (): Promise<void> => {
    setIsHistoryLoading(true);
    try { setHistory(await client.listRuns()); } catch { setHistory([]); } finally { setIsHistoryLoading(false); }
  }, [client]);

  const filteredHistory = useMemo(() => filterStoryAgentRuns(history, historySearch), [history, historySearch]);

  const resetActiveConversation = useCallback((): void => {
    requestSequenceRef.current += 1;
    setIsLoading(false);
    setRun(null);
    setInput("");
  }, []);

  const copyText = useCallback(async (text: string): Promise<void> => {
    try {
      if (typeof navigator !== "undefined" && navigator.clipboard) {
        await navigator.clipboard.writeText(text);
      }
    } catch {
      // no-op: clipboard requests are best-effort for the chat UI.
    }
  }, []);

  const openPanel = useCallback((): void => {
    setIsOpen(true);
    void loadHistory();
  }, [loadHistory]);

  useEffect(() => {
    const focusInput = (event: KeyboardEvent): void => { if (event.ctrlKey && event.key.toLowerCase() === "j") { event.preventDefault(); openPanel(); requestAnimationFrame(() => inputRef.current?.focus()); } };
    window.addEventListener("keydown", focusInput);
    return () => window.removeEventListener("keydown", focusInput);
  }, [openPanel]);

  useEffect(() => {
    if (run?.status !== "queued" || run.runId.length === 0) { return; }
    const runId = run.runId;
    const interval = window.setInterval(() => {
      void client.getRun(runId).then((detail) => {
        setRun((current) => {
          if (current?.runId !== runId) return current;
          return { ...detail.run, requirement: detail.run.requirement || current.requirement, stories: detail.draft?.stories ?? detail.run.stories, message: detail.run.message };
        });
        void loadHistory();
      }).catch(() => undefined);
    }, 10_000);
    return () => window.clearInterval(interval);
  }, [client, loadHistory, run]);

  const send = useCallback(async (): Promise<void> => {
    const requirement = input.trim();
    if (!requirement || isLoading) { return; }
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    setIsLoading(true);
    setRun(null);
    try {
      const result = await client.createRun({ requirement });
      if (requestId !== requestSequenceRef.current) return;
      setRun({ ...result, requirement });
      setInput("");
      void loadHistory();
    } catch (error: unknown) {
      if (requestId !== requestSequenceRef.current) return;
      setRun({ runId: "", status: "failed", requirement, error: error instanceof Error ? error.message : "Story Agent could not complete that request." });
      setInput(requirement);
    } finally {
      if (requestId === requestSequenceRef.current) setIsLoading(false);
    }
  }, [client, input, isLoading, loadHistory]);

  const selectHistory = useCallback(async (runId: string): Promise<void> => {
    const requestId = requestSequenceRef.current + 1;
    requestSequenceRef.current = requestId;
    setIsLoading(true);
    try {
      const detail = await client.getRun(runId);
      if (requestId !== requestSequenceRef.current) return;
      const restoredRun = {
        ...detail.run,
        requirement: detail.run.requirement || history.find((item) => item.runId === runId)?.requirement || "",
        stories: detail.draft?.stories ?? detail.run.stories,
        message: detail.run.message
      };
      setRun(restoredRun);
      setInput(detail.run.requirement || "");
    } catch (error: unknown) {
      if (requestId !== requestSequenceRef.current) return;
      setRun({ runId, status: "failed", requirement: history.find((item) => item.runId === runId)?.requirement || "", error: error instanceof Error ? error.message : "Unable to load this run." });
    } finally {
      if (requestId === requestSequenceRef.current) setIsLoading(false);
    }
  }, [client, history]);

  const copyRun = useCallback(async (runToCopy: StoryAgentRun | null): Promise<void> => {
    if (!runToCopy) return;
    await copyText(buildStoryAgentRunCopyText(runToCopy));
  }, [copyText]);

  const copyStory = useCallback(async (story: StoryAgentStory): Promise<void> => {
    const text = [
      `Title: ${story.title}`,
      `Intent: ${story.intent}`,
      `Epic: ${story.epic}`,
      `Size: ${story.size}`,
      "Acceptance criteria:",
      ...story.acceptanceCriteria.map((criterion) => `- ${criterion}`)
    ].join("\n");
    await copyText(text);
  }, [copyText]);

  return <>
    <Button
      type="button"
      size="icon"
      aria-label="Open Story Agent"
      aria-expanded={isOpen}
      aria-controls="story-agent-panel"
      className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-40 size-14 rounded-[1.35rem] border border-[#d7efb0]/45 bg-[#1d4227] text-[#dff6bc] shadow-[0_12px_32px_rgba(3,19,10,.48)] transition hover:-translate-y-0.5 hover:bg-[#285533] focus-visible:ring-2 focus-visible:ring-[#c9ef8a] sm:bottom-6 sm:right-6"
      onClick={openPanel}
    >
      <GeckoMascot className="size-10" />
      <Plus aria-hidden="true" className="absolute -right-1 -top-1 size-4 rounded-full bg-[#b8e47a] p-0.5 text-[#102116]" />
    </Button>
    <StoryAgentPanel isOpen={isOpen} input={input} isLoading={isLoading} run={run} history={filteredHistory} historySearch={historySearch} isHistoryLoading={isHistoryLoading} inputRef={inputRef} onClose={() => setIsOpen(false)} onInputChange={setInput} onNewChat={resetActiveConversation} onHistorySearchChange={setHistorySearch} onSend={() => { void send(); }} onSuggestion={(suggestion) => { setInput(suggestion); inputRef.current?.focus(); }} onSelectHistory={(runId) => { void selectHistory(runId); }} onCopyRun={copyRun} onCopyStory={copyStory} />
  </>;
};
