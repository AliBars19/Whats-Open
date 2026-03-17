"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/components/ui/Toast";

type ReportFormProps = {
  placeId?: string;
  reviewId?: string;
  onClose: () => void;
};

export function ReportForm({ placeId, reviewId, onClose }: ReportFormProps) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const { showToast } = useToast();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !reason.trim()) return;

    setLoading(true);
    const { error } = await supabase.from("reports").insert({
      place_id: placeId || null,
      review_id: reviewId || null,
      reported_by: user.id,
      reason: reason.trim(),
    });

    if (error) {
      showToast("Failed to submit report", "error");
    } else {
      showToast("Report submitted. Thanks!", "success");
      onClose();
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <h3 className="text-lg font-semibold text-text-primary">Report an Issue</h3>
      <textarea
        value={reason}
        onChange={(e) => setReason(e.target.value)}
        placeholder="What's wrong? (incorrect info, spam, inappropriate content...)"
        maxLength={500}
        rows={3}
        required
        className="w-full px-3 py-2 rounded-xl bg-bg-input border border-border-subtle
          text-sm text-text-primary placeholder:text-text-muted resize-none
          focus:outline-none focus:border-accent-primary/50"
      />
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 py-2.5 rounded-xl text-sm font-medium text-text-muted hover:text-text-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading || !reason.trim()}
          className="flex-1 py-2.5 bg-accent-red text-white rounded-xl text-sm font-semibold
            hover:opacity-90 transition-opacity disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Report"}
        </button>
      </div>
    </form>
  );
}
