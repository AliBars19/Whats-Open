"use client";

import { useState, useCallback } from "react";
import { MapView } from "@/components/map/MapView";
import { PlacePopup } from "@/components/map/PlacePopup";
import { FilterBar } from "@/components/ui/FilterBar";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { isOpenNow } from "@/lib/hours";
import type { PlaceWithDistance } from "@/types";
import type { PlaceCategory } from "@/lib/constants";

export default function MapPage() {
  const { latitude, longitude, loading: locationLoading, permissionState, requestLocation } = useUserLocation();
  const [selectedPlace, setSelectedPlace] = useState<PlaceWithDistance | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(true);

  const { data: places = [], isLoading: placesLoading } = useNearbyPlaces({
    latitude,
    longitude,
  });

  // Client-side filtering
  const filteredPlaces = places.filter((place) => {
    if (selectedCategory && place.category !== selectedCategory) return false;
    if (openNowOnly) {
      const status = isOpenNow(place.opening_hours);
      if (status.status === "closed") return false;
    }
    return true;
  });

  const handlePlaceSelect = useCallback((place: PlaceWithDistance | null) => {
    setSelectedPlace(place);
  }, []);

  // Location permission prompt
  if (!locationLoading && permissionState !== "granted" && !latitude) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-64px)] px-6 text-center">
        <div className="w-20 h-20 rounded-full bg-accent-blue/10 flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-accent-blue" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-text-primary mb-2">
          Where&apos;s Open needs your location
        </h2>
        <p className="text-sm text-text-secondary mb-6 max-w-[300px]">
          To show what&apos;s open nearby, we need to know where you are.
        </p>
        <button
          onClick={requestLocation}
          className="px-8 py-3 bg-accent-primary text-bg-primary rounded-full text-sm font-semibold
            hover:opacity-90 transition-opacity"
        >
          Enable Location
        </button>
      </div>
    );
  }

  return (
    <div className="relative h-[calc(100vh-64px)]">
      {/* Filter bar */}
      <div className="absolute top-0 left-0 right-0 z-20">
        <FilterBar
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          openNowOnly={openNowOnly}
          onOpenNowChange={setOpenNowOnly}
        />
      </div>

      {/* Map */}
      <MapView
        places={filteredPlaces}
        userLat={latitude}
        userLng={longitude}
        onPlaceSelect={handlePlaceSelect}
      />

      {/* Loading overlay */}
      {(locationLoading || placesLoading) && (
        <div className="absolute inset-0 flex items-center justify-center bg-bg-primary/50 z-10">
          <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
        </div>
      )}

      {/* Place popup */}
      {selectedPlace && (
        <PlacePopup
          place={selectedPlace}
          onClose={() => setSelectedPlace(null)}
        />
      )}
    </div>
  );
}
