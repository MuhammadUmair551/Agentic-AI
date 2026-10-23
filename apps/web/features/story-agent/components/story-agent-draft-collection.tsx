import { Copy } from "lucide-react";
import { Badge, Button } from "@workspace/ui";
import { StoryAgentCriteria } from "./story-agent-criteria";
import type { StoryAgentRun, StoryAgentStory } from "../story-agent.types";

type DraftCollectionProps = Readonly<{
  run: StoryAgentRun;
  onCopyRun: (run: StoryAgentRun | null) => Promise<void>;
  onCopyStory: (story: StoryAgentStory) => Promise<void>;
}>;

const StoryDossier = ({ story, index, onCopyStory }: Readonly<{ story: StoryAgentStory; index: number; onCopyStory: (story: StoryAgentStory) => Promise<void> }>): React.JSX.Element => (
  <article id={`story-${index}`} className="group relative overflow-hidden border border-[#3e5a41] bg-[#132116] p-5 shadow-[0_12px_32px_rgba(1,12,5,.16)] transition hover:border-[#789b65] sm:p-6">
    <div className="absolute left-0 top-0 h-full w-1 bg-[#a5d66c]" />
    <div className="flex items-start justify-between gap-4"><p className="font-mono text-[11px] font-bold tracking-[.18em] text-[#9fbe84]">STORY {String(index).padStart(2, "0")}</p><div className="flex items-center gap-2"><Badge variant="outline" className="rounded-sm border-[#708e5c] bg-[#253f27] px-2.5 text-[#ddf3c0]">{story.size} slice</Badge><Button type="button" variant="ghost" size="icon" aria-label={`Copy ${story.title}`} className="size-8 text-[#b7c8af] hover:bg-[#29442d] hover:text-[#f8faed]" onClick={() => { void onCopyStory(story); }}><Copy className="size-3.5" /></Button></div></div>
    <h3 className="mt-4 max-w-[25rem] font-serif text-xl font-semibold leading-tight text-[#f7f5e9] sm:text-2xl">{story.title}</h3><p className="mt-3 max-w-[34rem] text-sm leading-6 text-[#c7d1c3]">{story.intent}</p>
    <dl className="mt-5 grid grid-cols-2 border-y border-[#304a34] py-3 text-xs sm:grid-cols-3"><div className="border-r border-[#304a34] pr-3"><dt className="font-bold uppercase tracking-[.14em] text-[#829a7f]">Epic</dt><dd className="mt-1 font-medium text-[#e2eadc]">{story.epic}</dd></div><div className="px-3"><dt className="font-bold uppercase tracking-[.14em] text-[#829a7f]">Scope</dt><dd className="mt-1 font-medium text-[#e2eadc]">{story.size} / testable</dd></div><div className="col-span-2 mt-3 border-t border-[#304a34] pt-3 sm:col-span-1 sm:mt-0 sm:border-l sm:border-t-0 sm:pl-3 sm:pt-0"><dt className="font-bold uppercase tracking-[.14em] text-[#829a7f]">State</dt><dd className="mt-1 truncate font-medium text-[#e2eadc]">{story.states.join(", ") || "Ready to refine"}</dd></div></dl>
    <StoryAgentCriteria criteria={story.acceptanceCriteria} storyNumber={index} />
    {story.openQuestions.length > 0 ? <p className="mt-4 border-l-2 border-[#c8aa5f] bg-[#352d1b] px-3 py-2 text-xs leading-5 text-[#f3e4b7]">Open question: {story.openQuestions.join(" · ")}</p> : null}
  </article>
);

export const StoryAgentDraftCollection = ({ run, onCopyRun, onCopyStory }: DraftCollectionProps): React.JSX.Element => {
  const stories = run.stories ?? [];
  return <section aria-labelledby="draft-title" className="space-y-4"><header className="border-b border-[#3e5a41] pb-4"><div className="flex items-center justify-between gap-4"><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a5c68a]">Draft collection</p><h2 id="draft-title" className="mt-2 font-serif text-2xl font-semibold text-[#f6f5e9]">{stories.length} independent slices</h2></div><Button type="button" variant="outline" size="sm" className="shrink-0 border-[#5a7855] bg-transparent text-[#dce9d7] hover:bg-[#26412a]" onClick={() => { void onCopyRun(run); }}><Copy className="mr-2 size-3.5" />Copy all</Button></div><p className="mt-3 text-sm leading-6 text-[#aebdaa]">Each slice is independently demonstrable, with a focused outcome and explicit checks.</p></header><nav aria-label="Stories in this draft" className="flex gap-2 overflow-x-auto pb-1">{stories.map((story, index) => <a key={story.title} href={`#story-${index + 1}`} className="shrink-0 border border-[#426044] bg-[#17281a] px-3 py-2 text-xs text-[#d7e5d0] transition hover:border-[#9bca6f] hover:text-white">{String(index + 1).padStart(2, "0")} · {story.epic}</a>)}</nav><div className="space-y-3">{stories.map((story, index) => <StoryDossier key={story.title} story={story} index={index + 1} onCopyStory={onCopyStory} />)}</div></section>;
};
