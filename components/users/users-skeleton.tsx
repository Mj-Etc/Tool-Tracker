"use client";

import { Skeleton } from "@/components/ui/skeleton";
import { Card } from "@/components/ui/card";

export function UsersSkeleton() {
  return (
    <div className="h-auto flex flex-col gap-4 p-4 animate-in fade-in duration-500">
      <div className="flex justify-between items-center px-4 pt-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      
      <Card className="flex-1 overflow-hidden border shadow-sm p-4 space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />

        <div className="space-y-2">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-16 w-full" />
          ))}
        </div>
      </Card>
    </div>
  );
}
