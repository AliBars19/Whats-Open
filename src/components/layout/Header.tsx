"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export function Header() {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-40 bg-bg-primary/80 backdrop-blur-md border-b border-border-subtle safe-top">
      <div className="flex items-center justify-between h-12 px-4 max-w-lg mx-auto">
        <Link href="/map" className="text-sm font-bold text-accent-primary">
          Where&apos;s Open?
        </Link>
        <button
          onClick={() => router.push("/search")}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-bg-elevated transition-colors"
        >
          <svg className="w-4 h-4 text-text-secondary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </button>
      </div>
    </header>
  );
}
