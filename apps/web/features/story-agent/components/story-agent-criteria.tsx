import { Check } from "lucide-react";

type StoryAgentCriteriaProps = Readonly<{
  criteria: readonly string[];
  storyNumber: number;
}>;

const renderCriterion = (criterion: string): React.JSX.Element => {
  const parts = criterion.split(/\b(?=(?:Given|When|Then)\b)/i).filter(Boolean);
  return <>{parts.map((part, index) => {
    const match = /^(Given|When|Then)\s+(.+)$/i.exec(part.trim());
    return match ? <span key={`${match[1]}-${index}`}><strong className="font-semibold text-[#cbeaa2]">{match[1]}</strong> {match[2]}{index < parts.length - 1 ? " · " : ""}</span> : <span key={index}>{part}</span>;
  })}</>;
};

export const StoryAgentCriteria = ({ criteria, storyNumber }: StoryAgentCriteriaProps): React.JSX.Element => (
  <section className="mt-5" aria-labelledby={`criteria-${storyNumber}`}>
    <div className="flex items-center justify-between gap-3"><h4 id={`criteria-${storyNumber}`} className="text-xs font-bold uppercase tracking-[.16em] text-[#c9e99c]">Acceptance criteria</h4><span className="text-xs text-[#8ea38b]">{criteria.length} checks</span></div>
    <ol className="mt-3 space-y-2">
      {criteria.map((criterion, index) => <li key={criterion} className="flex gap-3 rounded-sm bg-[#192b1d] px-3 py-2.5 text-sm leading-6 text-[#d8e2d3]"><span className="flex size-5 shrink-0 items-center justify-center rounded-full border border-[#587653] font-mono text-[10px] text-[#bde98a]">{index + 1}</span><Check aria-hidden="true" className="mt-1 size-3 shrink-0 text-[#9fce70]" /><span>{renderCriterion(criterion)}</span></li>)}
    </ol>
  </section>
);
