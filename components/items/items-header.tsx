"use client";

import { Package } from "lucide-react";
import { AddItemDialog } from "@/components/add-item-dialog";
import { CategoriesDialog } from "@/components/categories-dialog";
import { DisabledItemsDialog } from "@/components/disabled-items-dialog";

export function ItemsHeader() {
  return (
    <div className="flex justify-between items-center px-4 pt-4">
      <div className="flex flex-col">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Package className="h-4 w-4" />
          <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Inventory Cluster</span>
        </div>
        <h2 className="text-2xl font-bold tracking-tight">Product Management</h2>
      </div>
      <div className="flex items-center gap-2">
        <AddItemDialog />
        <DisabledItemsDialog />
        <CategoriesDialog />
      </div>
    </div>
  );
}
