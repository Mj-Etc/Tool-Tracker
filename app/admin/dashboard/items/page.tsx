import { CreateItem } from "@/components/create-item-form";
import { ListItem } from "@/components/list-item";

export default async function ItemsPage() {
  return (
    <div className="h-full flex flex-col gap-4 items-center md:flex-row md:gap-0 md:justify-evenly md:items-start">
      <CreateItem />
      <div className="flex flex-col gap-4">
        <ListItem />
      </div>
    </div>
  );
}
