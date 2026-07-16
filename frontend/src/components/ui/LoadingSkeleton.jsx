import React from "react";

const Skeleton = ({ className = "" }) => (
  <div className={`shimmer rounded-lg ${className}`} />
);

export const PageSkeleton = () => (
  <div className="space-y-6 p-6">
    <Skeleton className="h-8 w-64" />
    <Skeleton className="h-4 w-96" />
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="rounded-2xl border border-slate-200 p-5 space-y-3">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-8 w-16" />
        </div>
      ))}
    </div>
    <div className="rounded-2xl border border-slate-200 p-6 space-y-4 mt-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  </div>
);

export const CardSkeleton = () => (
  <div className="rounded-2xl border border-slate-200 p-5 space-y-3">
    <Skeleton className="h-4 w-3/4" />
    <Skeleton className="h-3 w-full" />
    <Skeleton className="h-3 w-1/2" />
  </div>
);

export default Skeleton;
