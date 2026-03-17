"use client";

import { useLiveCheckins } from "@/hooks/useLiveCheckins";
import { timeAgo } from "@/lib/utils";

export function LiveFeed({ placeId }: { placeId: string }) {
  const { checkins, loading } = useLiveCheckins(placeId);

  if (loading) {
    return (
      <div className="space-y-2">
        {[1, 2].map((i) => (
          <div key={i} className="h-12 bg-bg-elevated rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (checkins.length === 0) {
    return (
      <p className="text-sm text-text-muted text-center py-4">
        No recent check-ins. Be the first!
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {checkins.map((checkin) => (
        <div
          key={checkin.id}
          className="flex items-center gap-3 p-3 bg-bg-elevated rounded-lg"
        >
          <span
            className={`w-2 h-2 rounded-full flex-shrink-0 ${
              checkin.is_open ? "bg-accent-green" : "bg-accent-red"
            }`}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-text-primary">
              <span className="font-medium">
                {checkin.profiles?.username || "Anonymous"}
              </span>{" "}
              {checkin.is_open ? "confirmed open" : "reported closed"}
            </p>
            {checkin.note && (
              <p className="text-xs text-text-muted mt-0.5 truncate">
                &quot;{checkin.note}&quot;
              </p>
            )}
          </div>
          <span className="text-xs text-text-muted flex-shrink-0">
            {timeAgo(checkin.created_at)}
          </span>
        </div>
      ))}
    </div>
  );
}
