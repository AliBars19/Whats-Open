"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { isWithinRadius } from "@/lib/geo";
import { CHECKIN_RADIUS_METRES } from "@/lib/constants";
import { useToast } from "@/components/ui/Toast";
import { useAuth } from "@/hooks/useAuth";

type CheckInButtonProps = {
  placeId: string;
  placeLat: number;
  placeLng: number;
};

export function CheckInButton({ placeId, placeLat, placeLng }: CheckInButtonProps) {
  const [loading, setLoading] = useState(false);
  const [note, setNote] = useState("");
  const [showNote, setShowNote] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();

  const handleCheckIn = async (isOpen: boolean) => {
    if (!user) {
      showToast("Please log in to check in", "error");
      return;
    }

    setLoading(true);

    try {
      // Get user location
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
          });
        }
      );

      const userLat = position.coords.latitude;
      const userLng = position.coords.longitude;

      // Geofence check
      if (!isWithinRadius(userLat, userLng, placeLat, placeLng, CHECKIN_RADIUS_METRES)) {
        showToast("You need to be within 200m of this place to check in", "error");
        return;
      }

      // Rate limit check
      const { data: canCheck } = await supabase.rpc("can_checkin", {
        p_user_id: user.id,
        p_place_id: placeId,
      });

      if (!canCheck) {
        showToast("You already checked in here recently", "info");
        return;
      }

      // Insert check-in
      const { error } = await supabase.from("live_checkins").insert({
        place_id: placeId,
        user_id: user.id,
        is_open: isOpen,
        note: note.trim() || null,
        user_latitude: userLat,
        user_longitude: userLng,
      });

      if (error) throw error;

      showToast("Thanks! +1 reputation", "success");
      setNote("");
      setShowNote(false);
    } catch (err) {
      if (err instanceof GeolocationPositionError) {
        showToast("Enable location to check in", "error");
      } else {
        showToast("Failed to check in. Try again.", "error");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm font-medium text-text-primary">Are you here right now?</p>
      <div className="flex gap-3">
        <button
          onClick={() => handleCheckIn(true)}
          disabled={loading}
          className="flex-1 py-3 bg-accent-green/15 text-accent-green rounded-xl text-sm font-semibold
            hover:bg-accent-green/25 transition-colors disabled:opacity-50 min-h-[44px]"
        >
          Yes, it&apos;s open
        </button>
        <button
          onClick={() => handleCheckIn(false)}
          disabled={loading}
          className="flex-1 py-3 bg-accent-red/15 text-accent-red rounded-xl text-sm font-semibold
            hover:bg-accent-red/25 transition-colors disabled:opacity-50 min-h-[44px]"
        >
          No, it&apos;s closed
        </button>
      </div>

      {!showNote ? (
        <button
          onClick={() => setShowNote(true)}
          className="text-xs text-text-muted hover:text-text-secondary transition-colors"
        >
          + Add a note
        </button>
      ) : (
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="e.g. closing early today, massive queue..."
          maxLength={200}
          className="w-full h-10 px-3 rounded-lg bg-bg-input border border-border-subtle
            text-sm text-text-primary placeholder:text-text-muted
            focus:outline-none focus:border-accent-primary/50"
        />
      )}
    </div>
  );
}
