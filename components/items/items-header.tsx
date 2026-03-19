"use client";

import { Package, X } from "lucide-react";
import { AddItemDialog } from "@/components/add-item-dialog";
import { CategoriesDialog } from "@/components/categories-dialog";
import { DisabledItemsDialog } from "@/components/disabled-items-dialog";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export function ItemsHeader() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const status = searchParams.get("status");

  const clearFilter = () => {
    router.push(pathname);
  };

  return (
    <div className="flex justify-between items-center px-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="h-4 w-4" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Inventory Cluster</span>
        </div>
        <div className="flex items-center gap-3">
          <h2 className="text-2xl font-bold tracking-tight">Items Management</h2>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {status && (
            <Badge variant="secondary" className="h-6 gap-1 px-2 font-mono text-[10px] uppercase tracking-wider">
              {status.replace("-", " ")}
              <Button
                variant="ghost"
                size="icon"
                className="h-4 w-4 p-0 hover:bg-transparent"
                onClick={clearFilter}
              >
                <X className="h-3 w-3" />
              </Button>
            </Badge>
          )}
        <AddItemDialog />
        <DisabledItemsDialog />
        <CategoriesDialog />
      </div>
    </div>
  );
}
