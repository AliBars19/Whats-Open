"use client";

import Link from "next/link";
import type { PlaceWithDistance } from "@/types";
import { getStatusWithCheckins } from "@/lib/hours";
import { CATEGORIES } from "@/lib/constants";
import { OpenBadge } from "./OpenBadge";
import { AmenityTags } from "./AmenityTags";
import { DistanceBadge } from "./DistanceBadge";

export function PlaceCard({ place }: { place: PlaceWithDistance }) {
  const status = getStatusWithCheckins(
    place.opening_hours,
    place.recent_checkins_open,
    place.recent_checkins_closed
  );

  const category = CATEGORIES.find((c) => c.value === place.category);

  return (
    <Link href={`/place/${place.id}`}>
      <div className="bg-bg-card border border-border-subtle rounded-xl p-4 hover:border-border-hover transition-colors">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="text-sm font-semibold text-text-primary truncate">
                {place.name}
              </h3>
              <OpenBadge status={status.displayStatus} compact />
            </div>
            <p className="text-xs text-text-muted mb-2">
              {category?.label} · {status.statusText}
            </p>
          </div>
          <DistanceBadge metres={place.distance_metres} />
        </div>

        <AmenityTags
          has_wifi={place.has_wifi}
          has_power_outlets={place.has_power_outlets}
          has_food={place.has_food}
          has_drinks={place.has_drinks}
          is_free_entry={place.is_free_entry}
        />

        {place.avg_rating > 0 && (
          <div className="flex items-center gap-1 mt-2">
            <span className="text-xs text-accent-primary">★ {place.avg_rating.toFixed(1)}</span>
            <span className="text-xs text-text-muted">({place.total_reviews})</span>
          </div>
        )}
      </div>
    </Link>
  );
}
