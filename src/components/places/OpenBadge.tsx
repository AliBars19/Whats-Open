import type { DisplayStatus } from "@/lib/hours";

const CONFIG = {
  open: { bg: "bg-accent-green/15", text: "text-accent-green", dot: "bg-accent-green", label: "Open" },
  closed: { bg: "bg-accent-red/15", text: "text-accent-red", dot: "bg-accent-red", label: "Closed" },
  reported_closed: { bg: "bg-accent-amber/15", text: "text-accent-amber", dot: "bg-accent-amber", label: "Reported Closed" },
  reported_open: { bg: "bg-accent-amber/15", text: "text-accent-amber", dot: "bg-accent-amber", label: "Reported Open" },
  unknown: { bg: "bg-accent-grey/15", text: "text-accent-grey", dot: "bg-accent-grey", label: "Unknown" },
} as const;

type OpenBadgeProps = {
  status: DisplayStatus["displayStatus"];
  compact?: boolean;
};

export function OpenBadge({ status, compact = false }: OpenBadgeProps) {
  const config = CONFIG[status];

  return (
    <span className={`inline-flex items-center gap-1.5 ${config.bg} ${config.text} ${compact ? "px-2 py-0.5 text-[10px]" : "px-2.5 py-1 text-xs"} rounded-full font-medium`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}
