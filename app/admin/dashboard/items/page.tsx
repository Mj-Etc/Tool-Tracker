import { CreateItem } from "@/components/create-item-form";
import { ListItem } from "@/components/list-item";
import { ScrollArea } from "@/components/ui/scroll-area";

export default async function ItemsPage() {
  return (
    <div className="grid grid-cols-3 gap-4 grid-rows-1">
      <div className="">
        <CreateItem />
      </div>
        <ScrollArea className="h-70 col-start-2 border p-4 rounded-xl">
          <div className="flex flex-col gap-4">
            <ListItem />
          </div>
        </ScrollArea>
    </div>
  );
}
