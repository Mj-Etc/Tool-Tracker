"use client";

import { Card, CardContent, CardHeader, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";

export function CashierSkeleton() {
  return (
    <div className="w-full max-w-7xl px-4 space-y-6 animate-in fade-in duration-500">
      {/* Sales Form Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 w-full">
        {/* Product Search & List Skeleton */}
        <Card className="lg:col-span-7 h-fit shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div className="space-y-2">
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-3 w-56" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-20" />
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-24" />
            </div>
            <div className="space-y-2">
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
              <Skeleton className="h-10 w-full" />
            </div>
          </CardContent>
        </Card>

        {/* Cart & Checkout Skeleton */}
        <Card className="lg:col-span-5 h-fit shadow-sm">
          <CardHeader>
             <Skeleton className="h-6 w-24" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-16 w-full rounded-lg" />
            <Skeleton className="h-48 w-full rounded-md" />
            
            <Separator />
            
            <div className="space-y-3">
               <div className="space-y-1.5">
                 <Skeleton className="h-3 w-32" />
                 <div className="flex gap-2">
                   <Skeleton className="h-8 w-16" />
                   <Skeleton className="h-8 w-16" />
                   <Skeleton className="h-8 w-16" />
                 </div>
               </div>
               
               <div className="grid grid-cols-2 gap-3">
                 <div className="space-y-1.5">
                   <Skeleton className="h-3 w-24" />
                   <Skeleton className="h-10 w-full" />
                 </div>
                 <div className="space-y-1.5">
                   <Skeleton className="h-3 w-24" />
                   <Skeleton className="h-10 w-full" />
                 </div>
               </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4 border-t pt-4">
            <div className="flex justify-between w-full items-center">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-6 w-24" />
            </div>
            <Skeleton className="h-12 w-full" />
          </CardFooter>
        </Card>
      </div>

      <Separator />

      {/* Journal Entry Skeleton */}
      <div className="w-full space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-3 w-40" />
          </div>
          <div className="flex flex-col items-end gap-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-10 w-[240px]" />
          </div>
        </div>

        <div className="rounded-md border">
          <div className="p-4">
            <div className="flex items-center justify-between mb-4">
               <Skeleton className="h-10 w-64" />
               <div className="flex gap-2">
                  <Skeleton className="h-9 w-24" />
                  <Skeleton className="h-9 w-24" />
               </div>
            </div>
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-center justify-between py-2">
                  <div className="flex items-center gap-4">
                     <Skeleton className="h-10 w-10 rounded-full" />
                     <div className="space-y-1">
                        <Skeleton className="h-4 w-40" />
                        <Skeleton className="h-3 w-24" />
                     </div>
                  </div>
                  <Skeleton className="h-4 w-20" />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
