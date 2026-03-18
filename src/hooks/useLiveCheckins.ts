"use client";

import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import type { LiveCheckin } from "@/types";

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function useLiveCheckins(placeId: string | null) {
  const [checkins, setCheckins] = useState<LiveCheckin[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  const validPlaceId = placeId && UUID_RE.test(placeId) ? placeId : null;

  const fetchCheckins = useCallback(async () => {
    if (!validPlaceId) return;

    const fourHoursAgo = new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString();

    const { data } = await supabase
      .from("live_checkins")
      .select("*, profiles(username, avatar_url)")
      .eq("place_id", validPlaceId)
      .gte("created_at", fourHoursAgo)
      .order("created_at", { ascending: false })
      .limit(20);

    setCheckins(data || []);
    setLoading(false);
  }, [placeId, supabase]);

  useEffect(() => {
    fetchCheckins();

    if (!validPlaceId) return;

    const channel = supabase
      .channel(`checkins:${validPlaceId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "live_checkins",
          filter: `place_id=eq.${validPlaceId}`,
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
  }, [validPlaceId, supabase, fetchCheckins]);

  return { checkins, loading };
}
