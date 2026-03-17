"use client";

import type { Place } from "@/types";
import { getStatusWithCheckins } from "@/lib/hours";
import { CATEGORIES } from "@/lib/constants";
import { OpenBadge } from "./OpenBadge";
import { HoursDisplay } from "./HoursDisplay";
import { AmenityTags } from "./AmenityTags";
import { CheckInButton } from "./CheckInButton";
import { LiveFeed } from "./LiveFeed";

type PlaceDetailProps = {
  place: Place;
  recentCheckinsOpen: number;
  recentCheckinsClosed: number;
};

export function PlaceDetail({ place, recentCheckinsOpen, recentCheckinsClosed }: PlaceDetailProps) {
  const status = getStatusWithCheckins(
    place.opening_hours,
    recentCheckinsOpen,
    recentCheckinsClosed
  );
  const category = CATEGORIES.find((c) => c.value === place.category);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-2">
          <span className="px-2 py-0.5 bg-bg-elevated rounded-full text-xs text-text-secondary">
            {category?.label}
          </span>
          {!place.is_verified && (
            <span className="px-2 py-0.5 bg-accent-amber/10 rounded-full text-xs text-accent-amber">
              Unverified
            </span>
          )}
        </div>
        <h1 className="text-2xl font-bold text-text-primary">{place.name}</h1>
        <p className="text-sm text-text-muted mt-1">{place.address}</p>
        {place.description && (
          <p className="text-sm text-text-secondary mt-2">{place.description}</p>
        )}
      </div>

      {/* Status */}
      <div className="flex items-center gap-3">
        <OpenBadge status={status.displayStatus} />
        <span className="text-sm text-text-secondary">{status.statusText}</span>
      </div>

      {/* Rating */}
      {place.avg_rating > 0 && (
        <div className="flex items-center gap-2">
          <div className="flex">
            {Array.from({ length: 5 }).map((_, i) => (
              <span
                key={i}
                className={`text-sm ${i < Math.round(place.avg_rating) ? "text-accent-primary" : "text-bg-elevated"}`}
              >
                ★
              </span>
            ))}
          </div>
          <span className="text-sm text-text-secondary">
            {place.avg_rating.toFixed(1)} ({place.total_reviews} reviews)
          </span>
        </div>
      )}

      {/* Amenities */}
      <AmenityTags
        has_wifi={place.has_wifi}
        has_power_outlets={place.has_power_outlets}
        has_food={place.has_food}
        has_drinks={place.has_drinks}
        is_free_entry={place.is_free_entry}
      />

      {/* Hours */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Opening Hours</h2>
        <HoursDisplay hours={place.opening_hours} />
      </div>

      {/* Check-in */}
      <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
        <CheckInButton
          placeId={place.id}
          placeLat={place.latitude}
          placeLng={place.longitude}
        />
      </div>

      {/* Live Feed */}
      <div>
        <h2 className="text-sm font-semibold text-text-primary mb-3">Recent Activity</h2>
        <LiveFeed placeId={place.id} />
      </div>

      {/* Links */}
      {place.website_url && (
        <a
          href={place.website_url}
          target="_blank"
          rel="noopener noreferrer"
          className="block text-sm text-accent-blue hover:underline"
        >
          Visit website
        </a>
      )}
    </div>
  );
}
