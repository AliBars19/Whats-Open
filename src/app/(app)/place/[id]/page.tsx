"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { PlaceDetail } from "@/components/places/PlaceDetail";
import { ReviewForm } from "@/components/forms/ReviewForm";
import { ReportForm } from "@/components/forms/ReportForm";
import { Header } from "@/components/layout/Header";
import type { Place, Review } from "@/types";

export default function PlaceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [place, setPlace] = useState<Place | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [checkinsOpen, setCheckinsOpen] = useState(0);
  const [checkinsClosed, setCheckinsClosed] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showReport, setShowReport] = useState(false);
  const supabase = createClient();

  const placeId = params.id as string;

  const fetchData = async () => {
    const [placeRes, reviewsRes, checkinsRes] = await Promise.all([
      supabase.from("places").select("*").eq("id", placeId).single(),
      supabase
        .from("reviews")
        .select("*, profiles(username, avatar_url)")
        .eq("place_id", placeId)
        .order("created_at", { ascending: false }),
      supabase
        .from("live_checkins")
        .select("is_open")
        .eq("place_id", placeId)
        .gte("created_at", new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()),
    ]);

    if (placeRes.error || !placeRes.data) {
      router.replace("/map");
      return;
    }

    setPlace(placeRes.data as Place);
    setReviews((reviewsRes.data as Review[]) || []);

    const checkins = checkinsRes.data || [];
    setCheckinsOpen(checkins.filter((c) => c.is_open).length);
    setCheckinsClosed(checkins.filter((c) => !c.is_open).length);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, [placeId]); // eslint-disable-line react-hooks/exhaustive-deps

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="w-8 h-8 border-2 border-accent-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!place) return null;

  return (
    <div>
      <Header />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1 text-sm text-text-muted hover:text-text-secondary"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back
        </button>

        <PlaceDetail
          place={place}
          recentCheckinsOpen={checkinsOpen}
          recentCheckinsClosed={checkinsClosed}
        />

        {/* Reviews */}
        <div>
          <h2 className="text-sm font-semibold text-text-primary mb-3">
            Reviews ({reviews.length})
          </h2>
          {reviews.length > 0 ? (
            <div className="space-y-3 mb-6">
              {reviews.map((review) => (
                <div key={review.id} className="bg-bg-card border border-border-subtle rounded-xl p-3">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-text-primary">
                      {review.profiles?.username || "Anonymous"}
                    </span>
                    <div className="flex">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span
                          key={i}
                          className={`text-xs ${i < review.rating ? "text-accent-primary" : "text-bg-elevated"}`}
                        >
                          ★
                        </span>
                      ))}
                    </div>
                  </div>
                  {review.comment && (
                    <p className="text-xs text-text-secondary">{review.comment}</p>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-text-muted mb-6">No reviews yet. Be the first!</p>
          )}

          <div className="bg-bg-card border border-border-subtle rounded-xl p-4">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Leave a Review</h3>
            <ReviewForm placeId={placeId} onReviewAdded={fetchData} />
          </div>
        </div>

        {/* Report */}
        <div className="pt-4 border-t border-border-subtle">
          {showReport ? (
            <ReportForm placeId={placeId} onClose={() => setShowReport(false)} />
          ) : (
            <button
              onClick={() => setShowReport(true)}
              className="text-xs text-text-muted hover:text-accent-red transition-colors"
            >
              Report incorrect information
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
