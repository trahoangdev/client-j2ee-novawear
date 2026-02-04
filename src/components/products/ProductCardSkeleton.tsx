import { cn } from '@/lib/utils';

export function ProductCardSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl overflow-hidden border border-border/50 animate-pulse',
        className
      )}
    >
      <div className="aspect-[4/5] bg-muted" />
      <div className="p-3 space-y-2">
        <div className="h-4 bg-muted rounded w-3/4" />
        <div className="h-5 bg-muted rounded w-1/2" />
      </div>
    </div>
  );
}
