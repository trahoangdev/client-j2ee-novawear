export function OrderCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-4 md:p-6 animate-pulse">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-5 bg-muted rounded w-32" />
          <div className="h-4 bg-muted rounded w-48" />
          <div className="h-4 bg-muted rounded w-24" />
        </div>
        <div className="flex items-center gap-4">
          <div className="h-6 bg-muted rounded w-20" />
          <div className="h-9 bg-muted rounded w-24" />
        </div>
      </div>
    </div>
  );
}
