"use client";

import { useAuth } from "./useAuth";

export function usePremium() {
  const { profile, loading } = useAuth();

  const isPremium =
    profile?.is_premium === true &&
    (!profile.premium_expires_at ||
      new Date(profile.premium_expires_at) > new Date());

  return { isPremium, loading };
}
