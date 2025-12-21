import { cn } from "@/lib/utils";

interface LoadingSkeletonProps {
  className?: string;
}

export function LoadingSkeleton({ className }: LoadingSkeletonProps) {
  return (
    <div
      className={cn("animate-shimmer rounded-lg", className)}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-border bg-card p-6">
      <LoadingSkeleton className="mb-4 h-40 w-full rounded-xl" />
      <LoadingSkeleton className="mb-2 h-6 w-3/4" />
      <LoadingSkeleton className="h-4 w-1/2" />
    </div>
  );
}

export function ListItemSkeleton() {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
      <LoadingSkeleton className="h-12 w-12 rounded-lg" />
      <div className="flex-1">
        <LoadingSkeleton className="mb-2 h-5 w-1/3" />
        <LoadingSkeleton className="h-4 w-1/4" />
      </div>
      <LoadingSkeleton className="h-8 w-20 rounded-full" />
    </div>
  );
}
