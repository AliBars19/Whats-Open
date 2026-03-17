"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { Header } from "@/components/layout/Header";
import { EmptyState } from "@/components/ui/EmptyState";
import { PremiumGate } from "@/components/ui/PremiumGate";
import { CardListSkeleton } from "@/components/ui/LoadingSkeleton";
import Link from "next/link";
import type { Place } from "@/types";

type SavedPlace = {
  id: string;
  place_id: string;
  notify_on_open: boolean;
  places: Place;
};

export default function SavedPage() {
  const [savedPlaces, setSavedPlaces] = useState<SavedPlace[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { isPremium } = usePremium();
  const supabase = createClient();

  useEffect(() => {
    if (!user) return;
    const fetch = async () => {
      const { data } = await supabase
        .from("saved_places")
        .select("*, places(*)")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      setSavedPlaces((data as unknown as SavedPlace[]) || []);
      setLoading(false);
    };
    fetch();
  }, [user, supabase]);

  return (
    <div>
      <Header />
      <div className="px-4 py-4 max-w-lg mx-auto">
        <h1 className="text-xl font-bold text-text-primary mb-4">Saved Places</h1>

        <PremiumGate>
          {loading ? (
            <CardListSkeleton count={3} />
          ) : savedPlaces.length === 0 ? (
            <EmptyState
              title="No saved places"
              description="Save places from the map or list view to find them quickly later."
              actionLabel="Explore Map"
              actionHref="/map"
            />
          ) : (
            <div className="space-y-3">
              {savedPlaces.map((saved) => (
                <Link key={saved.id} href={`/place/${saved.place_id}`}>
                  <div className="bg-bg-card border border-border-subtle rounded-xl p-4 hover:border-border-hover transition-colors">
                    <h3 className="text-sm font-semibold text-text-primary">
                      {saved.places.name}
                    </h3>
                    <p className="text-xs text-text-muted mt-0.5">{saved.places.address}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </PremiumGate>
      </div>
    </div>
  );
}
