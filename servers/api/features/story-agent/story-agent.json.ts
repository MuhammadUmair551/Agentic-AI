const fencedJson = /```(?:json)?\s*([\s\S]*?)\s*```/i;

export const extractJsonText = (text: string): string => {
  const fenced = text.match(fencedJson)?.[1];
  const candidate = (fenced ?? text).trim();
  const objectStart = candidate.indexOf("{");
  const arrayStart = candidate.indexOf("[");
  const start = [objectStart, arrayStart].filter((index) => index >= 0).sort((left, right) => left - right)[0];

  if (start === undefined) return candidate;

  const closingCharacter = candidate[start] === "{" ? "}" : "]";
  const end = candidate.lastIndexOf(closingCharacter);
  return end >= start ? candidate.slice(start, end + 1) : candidate;
};

export const extractJson = (text: string): unknown => JSON.parse(extractJsonText(text));
