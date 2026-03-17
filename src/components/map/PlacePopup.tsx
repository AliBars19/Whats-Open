"use client";

import Link from "next/link";
import type { PlaceWithDistance } from "@/types";
import { getStatusWithCheckins } from "@/lib/hours";
import { CATEGORIES } from "@/lib/constants";
import { OpenBadge } from "@/components/places/OpenBadge";
import { DistanceBadge } from "@/components/places/DistanceBadge";

type PlacePopupProps = {
  place: PlaceWithDistance;
  onClose: () => void;
};

export function PlacePopup({ place, onClose }: PlacePopupProps) {
  const status = getStatusWithCheckins(
    place.opening_hours,
    place.recent_checkins_open,
    place.recent_checkins_closed
  );
  const category = CATEGORIES.find((c) => c.value === place.category);

  return (
    <div className="fixed bottom-20 left-0 right-0 z-30 px-4 animate-[slideUp_0.2s_ease-out]">
      <div className="bg-bg-card border border-border-subtle rounded-xl p-4 max-w-lg mx-auto shadow-xl">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-text-primary truncate">{place.name}</h3>
              <OpenBadge status={status.displayStatus} compact />
            </div>
            <p className="text-xs text-text-muted">
              {category?.label} · <DistanceBadge metres={place.distance_metres} />
            </p>
            <p className="text-xs text-text-secondary mt-1">{status.statusText}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated -mr-1 -mt-1"
          >
            <svg className="w-4 h-4 text-text-muted" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <Link
          href={`/place/${place.id}`}
          className="mt-3 block w-full text-center py-2.5 bg-accent-primary text-bg-primary rounded-lg text-sm font-semibold
            hover:opacity-90 transition-opacity"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
