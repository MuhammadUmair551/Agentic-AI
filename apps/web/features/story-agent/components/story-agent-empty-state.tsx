import { Button, GeckoMascot } from "@workspace/ui";

const suggestions = [
  "A shopper can add an available product to their cart",
  "A customer can edit a cart quantity and see the revised total",
  "A content editor can draft and publish an article"
] as const;

export const StoryAgentEmptyState = ({ onSuggestion }: Readonly<{ onSuggestion: (value: string) => void }>): React.JSX.Element => (
  <section className="py-5 sm:py-10"><div className="grid gap-6 border-b border-[#3b573d] pb-8 sm:grid-cols-[auto_1fr] sm:items-end"><GeckoMascot className="size-24 text-[#a5d66c] sm:size-28" /><div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#a5c68a]">Story workshop</p><h2 className="mt-2 max-w-md font-serif text-3xl font-semibold leading-[1.06] text-[#f6f5e9]">Turn a product outcome into work your team can prove.</h2><p className="mt-3 max-w-md text-sm leading-6 text-[#aebdaa]">Start with the actor and the change they should experience. Gecko will find useful, testable slices.</p></div></div><div className="mt-7"><p className="text-xs font-bold uppercase tracking-[.16em] text-[#90a88d]">Try a starting point</p><div className="mt-3 grid gap-2">{suggestions.map((suggestion, index) => <Button key={suggestion} type="button" variant="outline" className="h-auto justify-start border-[#3e5b41] bg-[#152618] px-4 py-3 text-left text-sm font-normal text-[#dce8d7] hover:border-[#9ac66e] hover:bg-[#203923]" onClick={() => onSuggestion(suggestion)}><span className="mr-3 font-mono text-xs text-[#a5d66c]">0{index + 1}</span>{suggestion}</Button>)}</div></div></section>
);
