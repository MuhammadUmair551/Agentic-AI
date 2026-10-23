import type { SVGProps } from "react";
import { useId } from "react";

export type GeckoMascotState = "idle" | "thinking" | "speaking" | "happy" | "success" | "error";
export type GeckoMascotProps = SVGProps<SVGSVGElement> & Readonly<{ state?: GeckoMascotState }>;

/**
 * Canonical Gecko artwork. The compact side-on silhouette deliberately fills the
 * viewBox so its head, feet, and curled tail remain readable in launcher sizes.
 */
export const GeckoMascot = ({ state = "idle", className, ...props }: GeckoMascotProps): React.JSX.Element => {
  const body = useId().replace(/:/g, "");
  const belly = useId().replace(/:/g, "");
  const eye = useId().replace(/:/g, "");
  const shadow = useId().replace(/:/g, "");
  return <svg aria-hidden="true" className={`gecko-mascot gecko-mascot--${state} ${className ?? ""}`} viewBox="0 0 160 120" fill="none" {...props}>
    <defs>
      <linearGradient id={body} x1="42" y1="18" x2="119" y2="107" gradientUnits="userSpaceOnUse"><stop stopColor="#d2ff75" /><stop offset=".45" stopColor="#88dc42" /><stop offset="1" stopColor="#269e5a" /></linearGradient>
      <linearGradient id={belly} x1="104" y1="57" x2="95" y2="105" gradientUnits="userSpaceOnUse"><stop stopColor="#f6ffd0" /><stop offset="1" stopColor="#bee98e" /></linearGradient>
      <radialGradient id={eye} cx="0" cy="0" r="1" gradientTransform="translate(119 43) rotate(90) scale(22 16)" gradientUnits="userSpaceOnUse"><stop stopColor="#9effd7" /><stop offset=".6" stopColor="#38ad6a" /><stop offset="1" stopColor="#104d43" /></radialGradient>
      <filter id={shadow} x="0" y="1" width="160" height="119" filterUnits="userSpaceOnUse"><feDropShadow dx="0" dy="4" stdDeviation="3" floodColor="#071b16" floodOpacity=".35" /></filter>
    </defs>
    <g className="gecko-mascot__tail" filter={`url(#${shadow})`}><path d="M59 71C27 75 7 58 13 33c5-20 27-24 38-11 8 10 0 22-10 18-8-3-5-15 3-13" stroke={`url(#${body})`} strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" /><path d="M46 32c-8 8-11 18-9 28" stroke="#e5ff9a" strokeWidth="3" strokeLinecap="round" opacity=".6" /></g>
    <g className="gecko-mascot__body" filter={`url(#${shadow})`}>
      <path d="M42 71c0-28 19-45 49-45 30 0 49 18 49 42 0 24-18 38-44 38H65c-17 0-28-13-23-35Z" fill={`url(#${body})`} />
      <path d="M93 63c22-17 52-11 60 9 7 18-8 35-31 35-22 0-35-12-37-27-1-7 2-13 8-17Z" fill={`url(#${body})`} />
      <path d="M97 68c19-12 43-8 50 7 6 14-7 24-25 24-18 0-29-10-30-21Z" fill={`url(#${belly})`} />
      <path d="M59 83c17 9 32 11 44 7" stroke="#eaffab" strokeWidth="4" strokeLinecap="round" opacity=".6" />
      <g className="gecko-mascot__spots" fill="#2d9955" opacity=".66"><ellipse cx="57" cy="48" rx="5" ry="3" transform="rotate(-26 57 48)" /><ellipse cx="68" cy="40" rx="6" ry="3.5" transform="rotate(-18 68 40)" /><ellipse cx="78" cy="52" rx="4" ry="2.6" transform="rotate(-21 78 52)" /><ellipse cx="48" cy="62" rx="4" ry="2.5" transform="rotate(-20 48 62)" /><ellipse cx="72" cy="67" rx="5" ry="2.8" transform="rotate(-18 72 67)" /></g>
      <path d="M67 82 54 101m9-17-16 9m11-3-14 11M85 82l-4 20m6-16-11 10m8-7 9 13M102 85l-2 21m5-17-10 12m7-10 7 14M128 84l9 18m-5-14 13 8m-10-5 8 13" stroke={`url(#${body})`} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" />
      <g className="gecko-mascot__toes" fill="#caff6f" stroke="#297e42" strokeWidth="1.5"><circle cx="48" cy="104" r="5" /><circle cx="55" cy="108" r="5" /><circle cx="64" cy="103" r="5" /><circle cx="76" cy="104" r="4.5" /><circle cx="84" cy="109" r="4.5" /><circle cx="92" cy="105" r="4.5" /><circle cx="91" cy="108" r="5" /><circle cx="100" cy="111" r="5" /><circle cx="108" cy="106" r="5" /><circle cx="135" cy="105" r="5" /><circle cx="144" cy="108" r="5" /><circle cx="148" cy="100" r="5" /></g>
    </g>
    <g className="gecko-mascot__eyes">
      <ellipse cx="109" cy="45" rx="18" ry="22" fill="#fbfff5" /><ellipse cx="138" cy="41" rx="17" ry="22" fill="#fbfff5" />
      <ellipse className="gecko-mascot__pupil" cx="112" cy="47" rx="10" ry="15" fill={`url(#${eye})`} /><ellipse className="gecko-mascot__pupil" cx="139" cy="43" rx="9" ry="15" fill={`url(#${eye})`} /><ellipse className="gecko-mascot__pupil" cx="113" cy="49" rx="3.5" ry="8" fill="#082a2c" /><ellipse className="gecko-mascot__pupil" cx="139" cy="45" rx="3.3" ry="8" fill="#082a2c" /><circle className="gecko-mascot__pupil" cx="116" cy="41" r="3.5" fill="white" /><circle className="gecko-mascot__pupil" cx="142" cy="37" r="3.2" fill="white" /><circle cx="108" cy="55" r="1.5" fill="white" opacity=".8" /><circle cx="135" cy="51" r="1.4" fill="white" opacity=".8" />
    </g>
    <path d="M101 26c5-6 12-6 17-2M130 21c5-5 12-4 16 1" stroke="#2a7942" strokeWidth="3" strokeLinecap="round" /><ellipse cx="104" cy="67" rx="6" ry="3" fill="#ff9fb1" opacity=".42" /><ellipse cx="144" cy="63" rx="5" ry="2.8" fill="#ff9fb1" opacity=".42" /><path className="gecko-mascot__mouth" d="M115 70c7 6 16 5 23-1" stroke="#115746" strokeWidth="3" strokeLinecap="round" /><circle cx="126" cy="66" r="1.5" fill="#1b7245" /><circle cx="132" cy="66" r="1.5" fill="#1b7245" />
    <g className="gecko-mascot__thought" fill="#d7ff9c"><circle cx="146" cy="20" r="2.5" /><circle cx="153" cy="14" r="4" /><circle cx="147" cy="8" r="1.8" /></g><g className="gecko-mascot__speech" stroke="#ecffe1" strokeWidth="2.5" strokeLinecap="round"><path d="M145 77h8m-5-5h9m-9 10h6" /></g>
  </svg>;
};
