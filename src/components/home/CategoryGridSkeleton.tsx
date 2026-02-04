export function CategoryGridSkeleton() {
  return (
    <section className="section-spacing" aria-label="Danh mục đang tải">
      <div className="container px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-12">
          <div className="h-10 bg-muted rounded w-64 mx-auto mb-3 animate-pulse" />
          <div className="h-5 bg-muted rounded w-96 mx-auto animate-pulse" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 md:gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="aspect-square bg-muted rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    </section>
  );
}
