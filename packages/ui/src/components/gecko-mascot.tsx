import type { SVGProps } from "react";

export type GeckoMascotProps = SVGProps<SVGSVGElement> & Readonly<{
  state?: "idle" | "thinking" | "success" | "error";
}>;

/**
 * An original long-tailed Gecko silhouette. Its animation is entirely CSS-driven
 * so it remains light at launcher size and calm when reduced motion is requested.
 */
export const GeckoMascot = ({ state = "idle", className, ...props }: GeckoMascotProps): React.JSX.Element => (
  <svg
    aria-hidden="true"
    className={`gecko-mascot gecko-mascot--${state} ${className ?? ""}`}
    viewBox="0 0 160 120"
    fill="none"
    {...props}
  >
    <g className="gecko-mascot__tail">
      <path d="M65 80C39 104 15 94 17 75c1-12 13-17 22-10-12 3-13 17-3 21 11 5 24-2 31-15" stroke="currentColor" strokeWidth="13" strokeLinecap="round" />
    </g>
    <g className="gecko-mascot__body">
      <path d="M54 74c0-29 17-50 46-50 24 0 42 15 42 38 0 23-19 37-42 37-15 0-28-5-36-15l-13 10 3-20Z" fill="currentColor" />
      <path d="M82 85c9 6 25 6 36-2" stroke="var(--gecko-mark, #e7f9c9)" strokeWidth="3.5" strokeLinecap="round" />
      <path d="M65 77 49 89M72 87 59 103M124 78l17 11M117 88l13 15" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
      <path d="M45 89l-5 4m9 5-4 5m10-1-1 6m86-19 5 4m-9 5 4 5m-10-1 1 6" stroke="var(--gecko-mark, #e7f9c9)" strokeWidth="2.5" strokeLinecap="round" />
    </g>
    <g className="gecko-mascot__eyes">
      <ellipse cx="88" cy="52" rx="11" ry="12" fill="#fcfff4" />
      <ellipse cx="116" cy="52" rx="11" ry="12" fill="#fcfff4" />
      <ellipse cx="89" cy="54" rx="3.5" ry="5" fill="#112716" />
      <ellipse cx="115" cy="54" rx="3.5" ry="5" fill="#112716" />
      <circle cx="90" cy="51" r="1.2" fill="#fff" />
      <circle cx="116" cy="51" r="1.2" fill="#fff" />
    </g>
    <path className="gecko-mascot__mark" d="M69 62c7-4 11-4 16 0M123 62c5-4 9-4 13 0" stroke="var(--gecko-mark, #e7f9c9)" strokeWidth="2.5" strokeLinecap="round" />
  </svg>
);
