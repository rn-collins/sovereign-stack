export type View =
  | "meeting"
  | "overview"
  | "simulation"
  | "proposal"
  | "gate"
  | "record"
  | "pilot"
  | "learning"
  | "readiness"
  | "definitions"
  | "session"
  | "charter"
  | "review"
  | "evidence";

export const VIEW_PATHS: Record<View, string> = {
  review: "/proposal",
  simulation: "/demo",
  proposal: "/system",
  pilot: "/engagement",
  evidence: "/evidence",
  overview: "/hypothesis",
  gate: "/tools/decision-gate",
  record: "/tools/authority-record",
  readiness: "/production",
  definitions: "/definitions",
  session: "/tools/co-design-session",
  charter: "/tools/pilot-charter",
  learning: "/learning",
  meeting: "/briefing",
};

export const SECTION_VIEWS = {
  proposal: "review",
  demo: "simulation",
  system: "proposal",
  engagement: "pilot",
  evidence: "evidence",
  hypothesis: "overview",
  production: "readiness",
  definitions: "definitions",
  learning: "learning",
  briefing: "meeting",
} as const satisfies Record<string, View>;

export const TOOL_VIEWS = {
  "decision-gate": "gate",
  "authority-record": "record",
  "co-design-session": "session",
  "pilot-charter": "charter",
} as const satisfies Record<string, View>;

export function viewFromPathname(pathname: string): View | null {
  const normalized = pathname.length > 1 ? pathname.replace(/\/$/, "") : pathname;
  if (normalized === "/") return "review";
  const match = (Object.entries(VIEW_PATHS) as [View, string][]).find(([, path]) => path === normalized);
  return match?.[0] ?? null;
}
