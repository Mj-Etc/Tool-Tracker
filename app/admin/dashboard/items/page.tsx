import { CreateItem } from "@/components/create-item-form";
import { ListItem } from "@/components/list-item";
import { CategoriesDialog } from "@/components/categories-dialog";

export default async function ItemsPage() {
  return (
    <div className="h-full flex flex-col gap-4 items-center md:flex-row md:gap-0 md:justify-evenly md:items-start p-4">
      <div className="flex flex-col gap-4 w-full max-w-sm">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-bold">Manage Items</h2>
          <CategoriesDialog />
        </div>
        <CreateItem />
      </div>
      <div className="flex flex-col gap-4">
        <ListItem />
      </div>
    </div>
  );
}
