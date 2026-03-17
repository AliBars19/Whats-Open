"use client";

import { useState } from "react";
import { useUserLocation } from "@/hooks/useUserLocation";
import { useNearbyPlaces } from "@/hooks/useNearbyPlaces";
import { isOpenNow } from "@/lib/hours";
import { FilterBar } from "@/components/ui/FilterBar";
import { SearchBar } from "@/components/ui/SearchBar";
import { PlaceCard } from "@/components/places/PlaceCard";
import { CardListSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumBanner } from "@/components/ui/PremiumBanner";
import { usePremium } from "@/hooks/usePremium";
import { Header } from "@/components/layout/Header";
import type { PlaceCategory } from "@/lib/constants";

export default function ListPage() {
  const { latitude, longitude } = useUserLocation();
  const { data: places = [], isLoading } = useNearbyPlaces({ latitude, longitude });
  const [selectedCategory, setSelectedCategory] = useState<PlaceCategory | null>(null);
  const [openNowOnly, setOpenNowOnly] = useState(true);
  const { isPremium } = usePremium();

  const filteredPlaces = places.filter((place) => {
    if (selectedCategory && place.category !== selectedCategory) return false;
    if (openNowOnly) {
      const status = isOpenNow(place.opening_hours);
      if (status.status === "closed") return false;
    }
    return true;
  });

  return (
    <div>
      <Header />
      <FilterBar
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        openNowOnly={openNowOnly}
        onOpenNowChange={setOpenNowOnly}
      />
      <div className="px-4 py-4 space-y-3 max-w-lg mx-auto">
        <SearchBar />

        {isLoading ? (
          <CardListSkeleton />
        ) : filteredPlaces.length === 0 ? (
          <EmptyState
            title="No places found"
            description="Try changing your filters or adding a new place."
            actionLabel="Add a Place"
            actionHref="/add"
          />
        ) : (
          <>
            <p className="text-xs text-text-muted">
              {filteredPlaces.length} places found
            </p>
            {filteredPlaces.map((place) => (
              <PlaceCard key={place.id} place={place} />
            ))}
          </>
        )}

        {/* Free tier ad placeholder */}
        {!isPremium && filteredPlaces.length > 3 && (
          <PremiumBanner compact />
        )}
      </div>
    </div>
  );
}
