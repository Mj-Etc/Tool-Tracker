import { ListItem } from "@/components/list-item";
import { CategoriesDialog } from "@/components/categories-dialog";
import { DisabledItemsDialog } from "@/components/disabled-items-dialog";
import { AddItemDialog } from "@/components/add-item-dialog";

export default async function ItemsPage() {
  return (
    <div className="h-auto flex flex-col gap-4 p-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">Inventory Management</h2>
        <div className="flex items-center gap-2">
          <AddItemDialog />
          <DisabledItemsDialog />
          <CategoriesDialog />
        </div>
      </div>
      <div className="flex-1 overflow-auto border rounded-xl bg-card shadow-sm">
        <ListItem />
      </div>
    </div>
  );
}
