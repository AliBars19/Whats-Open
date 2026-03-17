"use client";

import { usePremium } from "@/hooks/usePremium";
import { PremiumBanner } from "./PremiumBanner";

type PremiumGateProps = {
  children: React.ReactNode;
  fallback?: React.ReactNode;
};

export function PremiumGate({ children, fallback }: PremiumGateProps) {
  const { isPremium, loading } = usePremium();

  if (loading) return null;

  if (!isPremium) {
    return (
      <div className="relative">
        <div className="blur-sm pointer-events-none select-none opacity-60">
          {children}
        </div>
        <div className="absolute inset-0 flex items-center justify-center">
          {fallback || <PremiumBanner />}
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
