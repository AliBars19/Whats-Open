"use client";

import { useQuery } from "@tanstack/react-query";
import { createClient } from "@/lib/supabase/client";
import type { PlaceWithDistance } from "@/types";
import type { PlaceCategory } from "@/lib/constants";

type UseNearbyPlacesOptions = {
  latitude: number | null;
  longitude: number | null;
  radius?: number;
  category?: PlaceCategory | null;
  enabled?: boolean;
};

export function useNearbyPlaces({
  latitude,
  longitude,
  radius = 2000,
  category = null,
  enabled = true,
}: UseNearbyPlacesOptions) {
  const supabase = createClient();

  return useQuery({
    queryKey: ["nearby-places", latitude, longitude, radius, category],
    queryFn: async (): Promise<PlaceWithDistance[]> => {
      if (!latitude || !longitude) return [];

      const { data, error } = await supabase.rpc("get_nearby_places", {
        user_lat: latitude,
        user_lng: longitude,
        radius_metres: radius,
        filter_category: category,
      });

      if (error) throw error;
      return (data as PlaceWithDistance[]) || [];
    },
    enabled: enabled && latitude !== null && longitude !== null,
    staleTime: 60000,
    refetchOnWindowFocus: false,
  });
}
