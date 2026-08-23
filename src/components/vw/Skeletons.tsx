import { cn } from "@/lib/utils";

export function Shimmer({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded bg-muted", className)} />;
}

export function KpiSkeletonRow({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg border border-border glass p-4">
          <Shimmer className="h-3 w-24" />
          <Shimmer className="mt-3 h-8 w-20" />
          <Shimmer className="mt-3 h-3 w-16" />
        </div>
      ))}
    </div>
  );
}

export function TableSkeleton({ rows = 6, label }: { rows?: number; label?: string }) {
  return (
    <div className="rounded-lg border border-border glass p-4">
      {label ? <Shimmer className="mb-4 h-3 w-32" /> : null}
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, i) => (
          <Shimmer key={i} className="h-9 w-full" />
        ))}
      </div>
    </div>
  );
}

export function PanelSkeleton({ height = "h-60" }: { height?: string }) {
  return (
    <div className="rounded-lg border border-border glass p-4">
      <Shimmer className="mb-3 h-3 w-28" />
      <Shimmer className={cn("w-full", height)} />
    </div>
  );
}

export function EmptyState({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="rounded-lg border border-dashed border-border glass px-4 py-12 text-center">
      <p className="text-sm font-medium text-foreground">{title}</p>
      {hint ? <p className="mt-1 text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}

export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <div className="rounded-lg border border-critical/40 bg-critical-soft/40 px-4 py-8 text-center">
      <p className="text-sm font-medium text-critical">{message}</p>
      {onRetry ? (
        <button
          type="button"
          onClick={onRetry}
          className="mt-3 rounded-md border border-border px-3 py-1.5 text-xs text-foreground hover:bg-secondary"
        >
          Try again
        </button>
      ) : null}
    </div>
  );
}
