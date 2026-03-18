"use client";

import * as React from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { useSession } from "@/lib/auth-client";
import { useSocket } from "@/components/socket-provider";
import { toast } from "sonner";

// Modular Components
import { ItemsHeader } from "@/components/items/items-header";
import { ItemsTable } from "@/components/items/items-table";
import { ItemsSkeleton } from "@/components/items/items-skeleton";
import { ItemWithUser, Category } from "@/components/items/types";

export default function ItemsPage() {
  const { data: session } = useSession();
  const isAdmin = session?.user.role === "admin";
  const { sendMessage } = useSocket();

  const { data: items, error, isLoading, mutate } = useSWR<ItemWithUser[]>(
    `/api/item/list-items`,
    fetcher
  );

  const { data: categories } = useSWR<Category[]>("/api/categories", fetcher);

  const handleBatchDisable = React.useCallback(async (ids: string[]) => {
    try {
      const response = await fetch("/api/item/batch-toggle-active", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids, isActive: false }),
      });

      if (!response.ok) throw new Error("Batch disable failed");

      toast.success(`Successfully disabled ${ids.length} item(s)`);
      
      // Notify other clients/components
      sendMessage({ type: "items:updated" });
      sendMessage({ type: "items:disabled" });
      
      // Refresh local data
      mutate();
    } catch (error) {
      console.error(error);
      toast.error("Failed to disable items");
    }
  }, [sendMessage, mutate]);

  if (isLoading) {
    return <ItemsSkeleton />;
  }

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-destructive">
        <p>Failed to load items. Please try again later.</p>
      </div>
    );
  }

  return (
    <div className="h-auto flex flex-col gap-4 p-4 min-h-screen">
      <ItemsHeader />
      
      <div className="flex-1 overflow-auto border rounded-xl bg-card shadow-sm animate-in fade-in duration-500">
        <ItemsTable 
          data={items || []} 
          categories={categories} 
          isAdmin={isAdmin}
          onBatchDisable={handleBatchDisable}
        />
      </div>
    </div>
  );
}
