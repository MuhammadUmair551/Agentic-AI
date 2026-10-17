"use client";

import { Sparkles } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@workspace/ui/primitives";
import { createStoryAgentClient } from "../story-agent.client";
import type { StoryAgentRun } from "../story-agent.types";
import { StoryAgentPanel } from "./story-agent-panel";

type StoryAgentWidgetProps = { apiBaseUrl: string };

export const StoryAgentWidget = ({ apiBaseUrl }: StoryAgentWidgetProps): React.JSX.Element => {
  const client = useMemo(() => createStoryAgentClient(apiBaseUrl), [apiBaseUrl]);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [run, setRun] = useState<StoryAgentRun | null>(null);
  const [history, setHistory] = useState<StoryAgentRun[]>([]);

  const loadHistory = useCallback(async (): Promise<void> => {
    setIsHistoryLoading(true);
    try { setHistory(await client.listRuns()); } catch { setHistory([]); } finally { setIsHistoryLoading(false); }
  }, [client]);

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
    const interval = window.setInterval(() => { void client.getRun(run.runId).then((detail) => { setRun({ ...detail.run, stories: detail.draft?.stories ?? detail.run.stories }); void loadHistory(); }).catch(() => undefined); }, 10_000);
    return () => window.clearInterval(interval);
  }, [client, loadHistory, run]);

  const send = useCallback(async (): Promise<void> => {
    const requirement = input.trim();
    if (!requirement || isLoading) { return; }
    setIsLoading(true); setRun(null);
    try {
      const result = await client.createRun({ requirement });
      setRun({ ...result, requirement });
      setInput("");
      void loadHistory();
    } catch (error: unknown) {
      setRun({ runId: "", status: "failed", requirement, error: error instanceof Error ? error.message : "Story Agent could not complete that request." });
    } finally { setIsLoading(false); }
  }, [client, input, isLoading, loadHistory]);

  const selectHistory = useCallback(async (runId: string): Promise<void> => {
    setIsLoading(true);
    try { const detail = await client.getRun(runId); setRun({ ...detail.run, stories: detail.draft?.stories ?? detail.run.stories }); }
    catch (error: unknown) { setRun({ runId, status: "failed", requirement: "", error: error instanceof Error ? error.message : "Unable to load this run." }); }
    finally { setIsLoading(false); }
  }, [client]);

  return <><Button type="button" size="icon" aria-label="Open Story Agent" className="fixed bottom-6 right-6 z-40 size-14 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 text-white shadow-lg shadow-fuchsia-950/50 hover:opacity-90" onClick={openPanel}><Sparkles className="size-6" /></Button><StoryAgentPanel isOpen={isOpen} input={input} isLoading={isLoading} run={run} history={history} isHistoryLoading={isHistoryLoading} inputRef={inputRef} onClose={() => setIsOpen(false)} onInputChange={setInput} onSend={() => { void send(); }} onSuggestion={(suggestion) => { setInput(suggestion); inputRef.current?.focus(); }} onSelectHistory={(runId) => { void selectHistory(runId); }} /></>;
};
