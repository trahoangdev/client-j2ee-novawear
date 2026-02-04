export function ProductDetailSkeleton() {
  return (
    <>
      <div className="container px-4 sm:px-6 py-4">
        <div className="h-5 bg-muted rounded w-64 mb-4 animate-pulse" />
      </div>
      <div className="container px-4 sm:px-6 pb-16">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 animate-pulse">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="aspect-[4/5] bg-muted rounded-xl" />
            <div className="flex gap-3 overflow-auto pb-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-20 w-20 shrink-0 bg-muted rounded-lg" />
              ))}
            </div>
          </div>
          {/* Product Info */}
          <div className="lg:py-4 space-y-6">
            <div className="h-4 bg-muted rounded w-24" />
            <div className="h-8 bg-muted rounded w-3/4" />
            <div className="h-6 bg-muted rounded w-48" />
            <div className="h-10 bg-muted rounded w-40" />
            <div className="space-y-2">
              <div className="h-4 bg-muted rounded w-full" />
              <div className="h-4 bg-muted rounded w-5/6" />
              <div className="h-4 bg-muted rounded w-4/5" />
            </div>
            <div className="space-y-3">
              <div className="h-5 bg-muted rounded w-24" />
              <div className="flex gap-2">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="h-10 w-10 bg-muted rounded-full" />
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <div className="h-5 bg-muted rounded w-32" />
              <div className="flex gap-2">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="h-10 w-12 bg-muted rounded" />
                ))}
              </div>
            </div>
            <div className="flex gap-3">
              <div className="h-12 bg-muted rounded flex-1" />
              <div className="h-12 bg-muted rounded w-12" />
            </div>
            <div className="h-12 bg-muted rounded w-full" />
          </div>
        </div>
      </div>
    </>
  );
}
