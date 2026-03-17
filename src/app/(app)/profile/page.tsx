"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { usePremium } from "@/hooks/usePremium";
import { Header } from "@/components/layout/Header";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { user, profile, signOut } = useAuth();
  const { isPremium } = usePremium();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const handleCheckout = async (plan: "monthly" | "yearly") => {
    if (!user) return;
    setCheckoutLoading(plan);

    try {
      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          priceId: plan === "monthly"
            ? process.env.NEXT_PUBLIC_STRIPE_PRICE_MONTHLY
            : process.env.NEXT_PUBLIC_STRIPE_PRICE_YEARLY,
          userId: user.id,
        }),
      });

      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        showToast("Failed to start checkout", "error");
      }
    } catch {
      showToast("Failed to start checkout", "error");
    } finally {
      setCheckoutLoading(null);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/");
  };

  return (
    <div>
      <Header />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-6">
        {/* Profile Info */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-accent-primary/20 flex items-center justify-center text-xl font-bold text-accent-primary">
              {profile?.username?.charAt(0).toUpperCase() || "?"}
            </div>
            <div>
              <h2 className="text-lg font-bold text-text-primary">{profile?.username}</h2>
              <p className="text-xs text-text-muted">{user?.email}</p>
              {profile?.university && (
                <p className="text-xs text-text-secondary mt-0.5">{profile.university}</p>
              )}
            </div>
          </div>
        </div>

        {/* Reputation */}
        <div className="bg-bg-card border border-border-subtle rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-3">Reputation</h3>
          <div className="grid grid-cols-3 gap-4">
            <Stat value={profile?.reputation_score || 0} label="Score" />
            <Stat value={profile?.total_checkins || 0} label="Check-ins" />
            <Stat value={profile?.total_places_added || 0} label="Places Added" />
          </div>
        </div>

        {/* Premium */}
        <div id="premium" className="bg-bg-card border border-border-subtle rounded-xl p-5">
          <h3 className="text-sm font-semibold text-text-primary mb-1">Premium</h3>
          {isPremium ? (
            <div>
              <p className="text-sm text-accent-green font-medium mb-2">Active</p>
              <p className="text-xs text-text-muted">
                Expires: {profile?.premium_expires_at
                  ? new Date(profile.premium_expires_at).toLocaleDateString()
                  : "Never"}
              </p>
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              <p className="text-sm text-text-secondary">
                Unlock saved places, noise filters, best spots ranking, and more.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleCheckout("monthly")}
                  disabled={checkoutLoading !== null}
                  className="p-4 bg-bg-elevated border border-border-subtle rounded-xl text-center
                    hover:border-accent-primary/30 transition-colors"
                >
                  <p className="text-lg font-bold text-text-primary">&pound;1.99</p>
                  <p className="text-xs text-text-muted">per month</p>
                </button>
                <button
                  onClick={() => handleCheckout("yearly")}
                  disabled={checkoutLoading !== null}
                  className="p-4 bg-accent-primary/5 border border-accent-primary/20 rounded-xl text-center
                    hover:border-accent-primary/40 transition-colors relative"
                >
                  <span className="absolute -top-2 right-2 px-2 py-0.5 bg-accent-primary text-bg-primary text-[10px] font-bold rounded-full">
                    Save 37%
                  </span>
                  <p className="text-lg font-bold text-text-primary">&pound;14.99</p>
                  <p className="text-xs text-text-muted">per year</p>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sign Out */}
        <button
          onClick={handleSignOut}
          className="w-full py-3 text-sm font-medium text-accent-red hover:bg-accent-red/10 rounded-xl transition-colors"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-2xl font-bold text-text-primary">{value}</p>
      <p className="text-xs text-text-muted">{label}</p>
    </div>
  );
}
