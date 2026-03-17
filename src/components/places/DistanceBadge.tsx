import { formatDistance } from "@/lib/geo";

export function DistanceBadge({ metres }: { metres: number }) {
  return (
    <span className="text-xs text-text-muted">
      {formatDistance(metres)}
    </span>
  );
}
