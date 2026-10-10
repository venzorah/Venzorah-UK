import React from "react";

export function Skeleton({ className = "" }: {className?: string;}) {
  return <div className={`animate-pulse rounded-xl bg-line/70 ${className}`} aria-hidden="true" />;
}

export function CardGridSkeleton({ count = 8 }: {count?: number;}) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4" role="status" aria-label="Loading">
      {Array.from({ length: count }).map((_, i) =>
      <div key={i} className="bg-white rounded-2xl border border-line overflow-hidden">
          <Skeleton className="aspect-square rounded-none" />
          <div className="p-3 space-y-2">
            <Skeleton className="h-3 w-1/2" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-5 w-1/3" />
          </div>
        </div>
      )}
    </div>);

}