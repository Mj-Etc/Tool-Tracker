"use client";

import { AddItemDialog } from "@/components/add-item-dialog";
import { CategoriesDialog } from "@/components/categories-dialog";
import { DisabledItemsDialog } from "@/components/disabled-items-dialog";

export function ItemsHeader() {
  return (
    <div className="flex justify-between items-center px-4 pt-4">
      <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
      <div className="flex items-center gap-2">
        <AddItemDialog />
        <DisabledItemsDialog />
        <CategoriesDialog />
      </div>
    </div>
  );
}
