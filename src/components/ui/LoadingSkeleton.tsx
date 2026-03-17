function CardSkeleton() {
  return (
    <div className="bg-bg-card border border-border-subtle rounded-xl p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-bg-elevated" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-bg-elevated rounded w-3/4" />
          <div className="h-3 bg-bg-elevated rounded w-1/2" />
        </div>
      </div>
      <div className="mt-3 flex gap-2">
        <div className="h-6 bg-bg-elevated rounded-full w-16" />
        <div className="h-6 bg-bg-elevated rounded-full w-12" />
        <div className="h-6 bg-bg-elevated rounded-full w-14" />
      </div>
    </div>
  );
}

export function CardListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}
