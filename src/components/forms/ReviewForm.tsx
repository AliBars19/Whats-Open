"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

type ReviewFormProps = {
  placeId: string;
  onReviewAdded?: () => void;
};

export function ReviewForm({ placeId, onReviewAdded }: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [noiseLevel, setNoiseLevel] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      showToast("Please log in to leave a review", "error");
      return;
    }
    if (rating === 0) {
      showToast("Please select a rating", "error");
      return;
    }

    setLoading(true);
    const { error } = await supabase.from("reviews").upsert(
      {
        place_id: placeId,
        user_id: user.id,
        rating,
        noise_level: noiseLevel || null,
        comment: comment.trim() || null,
      },
      { onConflict: "user_id,place_id" }
    );

    if (error) {
      showToast("Failed to submit review", "error");
    } else {
      showToast("Review submitted!", "success");
      setRating(0);
      setNoiseLevel(0);
      setComment("");
      onReviewAdded?.();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="text-sm font-medium text-text-primary block mb-2">Rating</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              className={`text-2xl transition-colors ${star <= rating ? "text-accent-primary" : "text-bg-elevated"}`}
            >
              ★
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-text-primary block mb-2">
          Noise Level <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <div className="flex gap-2">
          {[
            { value: 1, label: "Silent" },
            { value: 2, label: "Quiet" },
            { value: 3, label: "Moderate" },
            { value: 4, label: "Loud" },
            { value: 5, label: "Very Loud" },
          ].map((level) => (
            <button
              key={level.value}
              type="button"
              onClick={() => setNoiseLevel(level.value)}
              className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors
                ${noiseLevel === level.value
                  ? "bg-accent-primary text-bg-primary"
                  : "bg-bg-elevated text-text-secondary hover:bg-bg-card"
                }`}
            >
              {level.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-text-primary block mb-2">
          Comment <span className="text-text-muted font-normal">(optional)</span>
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="How was your experience?"
          maxLength={500}
          rows={3}
          className="w-full px-3 py-2 rounded-xl bg-bg-input border border-border-subtle
            text-sm text-text-primary placeholder:text-text-muted resize-none
            focus:outline-none focus:border-accent-primary/50"
        />
      </div>

      <button
        type="submit"
        disabled={loading || rating === 0}
        className="w-full py-3 bg-accent-primary text-bg-primary rounded-xl text-sm font-semibold
          hover:opacity-90 transition-opacity disabled:opacity-50 min-h-[44px]"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
}
