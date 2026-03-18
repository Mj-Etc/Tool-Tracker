"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function ItemsSkeleton() {
  return (
    <div className="h-auto flex flex-col gap-4 p-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <Skeleton className="h-8 w-64" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
          <Skeleton className="h-10 w-32" />
        </div>
      </div>
      
      <Card className="flex-1 overflow-hidden border shadow-sm p-4 space-y-4">
        <div className="flex items-center justify-between gap-4">
          <Skeleton className="h-10 flex-1 max-w-sm" />
          <div className="flex gap-2">
             <Skeleton className="h-10 w-40" />
             <Skeleton className="h-10 w-32" />
          </div>
        </div>

        <div className="space-y-2">
          {[...Array(8)].map((_, i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </div>

        <div className="flex items-center justify-between pt-4">
          <Skeleton className="h-4 w-32" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-8" />
          </div>
        </div>
      </Card>
    </div>
  );
}
