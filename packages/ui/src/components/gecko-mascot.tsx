import type { SVGProps } from "react";

export type GeckoMascotProps = SVGProps<SVGSVGElement> & Readonly<{
  state?: "idle" | "thinking" | "success" | "error";
}>;

/**
 * An original Gecko portrait with a clear face, feet and curled tail at small sizes.
 * Its animation is CSS-driven so it remains light in a floating launcher.
 */
export const GeckoMascot = ({ state = "idle", className, ...props }: GeckoMascotProps): React.JSX.Element => (
  <svg
    aria-hidden="true"
    className={`gecko-mascot gecko-mascot--${state} ${className ?? ""}`}
    viewBox="0 0 96 96"
    fill="none"
    {...props}
  >
    <g className="gecko-mascot__tail">
      <path d="M35 67C14 77 12 58 22 55c7-2 10 6 5 9-4 2-2 7 4 6l10-3" stroke="currentColor" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" />
    </g>
    <g className="gecko-mascot__body">
      <path d="M30 58c0-22 15-37 35-37 18 0 28 13 28 29 0 17-12 29-29 29-13 0-23-5-29-14l-9 4 4-12Z" fill="currentColor" />
      <path d="m37 65-9 9m13-3-5 10m32-15 9 8m-4-12 7 6" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
      <path d="m26 74-4 4m10-2-2 5m49-7 4 4m-9-1 2 5" stroke="var(--gecko-mark, #e7f9c9)" strokeWidth="2" strokeLinecap="round" />
      <circle cx="57" cy="65" r="2" fill="var(--gecko-mark, #e7f9c9)" opacity=".8" />
      <circle cx="66" cy="69" r="1.5" fill="var(--gecko-mark, #e7f9c9)" opacity=".65" />
    </g>
    <g className="gecko-mascot__eyes">
      <ellipse cx="52" cy="45" rx="10" ry="11" fill="#fcfff4" />
      <ellipse cx="75" cy="45" rx="10" ry="11" fill="#fcfff4" />
      <ellipse cx="53" cy="47" rx="3.1" ry="5" fill="#102116" />
      <ellipse cx="74" cy="47" rx="3.1" ry="5" fill="#102116" />
      <circle cx="54" cy="44" r="1.15" fill="#fff" />
      <circle cx="75" cy="44" r="1.15" fill="#fff" />
    </g>
    <path className="gecko-mascot__mark" d="M55 60c4 2 9 2 13-1" stroke="#102116" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
