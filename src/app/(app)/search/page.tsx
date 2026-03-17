"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { Header } from "@/components/layout/Header";
import { SearchBar } from "@/components/ui/SearchBar";
import { CardListSkeleton } from "@/components/ui/LoadingSkeleton";
import { EmptyState } from "@/components/ui/EmptyState";
import Link from "next/link";
import type { Place } from "@/types";

function SearchResults() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [results, setResults] = useState<Place[]>([]);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);
    const search = async () => {
      const { data } = await supabase
        .from("places")
        .select("*")
        .ilike("name", `%${query}%`)
        .limit(20);
      setResults((data as Place[]) || []);
      setLoading(false);
    };
    search();
  }, [query, supabase]);

  return (
    <>
      <SearchBar defaultValue={query} />

      {loading ? (
        <CardListSkeleton count={3} />
      ) : !query ? (
        <p className="text-sm text-text-muted text-center py-8">
          Search for a place by name
        </p>
      ) : results.length === 0 ? (
        <EmptyState
          title="No results"
          description={`No places found matching "${query}"`}
          actionLabel="Add This Place"
          actionHref="/add"
        />
      ) : (
        <div className="space-y-3">
          <p className="text-xs text-text-muted">{results.length} results</p>
          {results.map((place) => (
            <Link key={place.id} href={`/place/${place.id}`}>
              <div className="bg-bg-card border border-border-subtle rounded-xl p-4 hover:border-border-hover transition-colors">
                <h3 className="text-sm font-semibold text-text-primary">{place.name}</h3>
                <p className="text-xs text-text-muted mt-0.5">{place.address}, {place.city}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

export default function SearchPage() {
  return (
    <div>
      <Header />
      <div className="px-4 py-4 max-w-lg mx-auto space-y-4">
        <h1 className="text-xl font-bold text-text-primary">Search</h1>
        <Suspense fallback={<CardListSkeleton count={3} />}>
          <SearchResults />
        </Suspense>
      </div>
    </div>
  );
}
