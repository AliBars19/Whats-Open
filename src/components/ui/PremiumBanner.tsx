"use client";

import Link from "next/link";

export function PremiumBanner({ compact = false }: { compact?: boolean }) {
  if (compact) {
    return (
      <Link
        href="/profile#premium"
        className="block px-4 py-2 bg-gradient-to-r from-accent-primary/20 to-accent-primary/5
          border border-accent-primary/20 rounded-xl text-center"
      >
        <span className="text-xs font-medium text-accent-primary">
          Unlock Premium features from &pound;1.99/mo
        </span>
      </Link>
    );
  }

  return (
    <div className="bg-gradient-to-br from-accent-primary/10 to-bg-card border border-accent-primary/20 rounded-xl p-5">
      <h3 className="text-lg font-bold text-text-primary mb-1">Go Premium</h3>
      <p className="text-sm text-text-secondary mb-4">
        Save places, filter by noise level, see the best spots ranked, and more.
      </p>
      <Link
        href="/profile#premium"
        className="inline-block px-6 py-2.5 bg-accent-primary text-bg-primary rounded-full text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Upgrade from &pound;1.99/mo
      </Link>
    </div>
  );
}
