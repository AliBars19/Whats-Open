"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LiveCheckin } from "@/types";

export function useLiveCheckins(placeId: string | null) {
  const [checkins, setCheckins] = useState<LiveCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const fetchCheckins = useCallback(async () => {
    if (!placeId) return;

    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from("live_checkins")
      .select("*, profiles(username, avatar_url)")
      .eq("place_id", placeId)
      .gte("created_at", fourHoursAgo)
      .order("created_at", { ascending: false })
      .limit(20);

    setCheckins(data || []);
    setLoading(false);
  }, [placeId, supabase]);

  useEffect(() => {
    fetchCheckins();

    if (!placeId) return;

    const channel = supabase
      .channel(`checkins:${placeId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_checkins",
          filter: `place_id=eq.${placeId}`,
        },
        async (payload) => {
          const { data: enriched } = await supabase
            .from("live_checkins")
            .select("*, profiles(username, avatar_url)")
            .eq("id", payload.new.id)
            .single();

          if (enriched) {
            setCheckins((prev) => [enriched, ...prev]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [placeId, supabase, fetchCheckins]);

  return { checkins, loading };
}
