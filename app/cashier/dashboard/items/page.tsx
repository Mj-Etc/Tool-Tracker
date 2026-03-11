import { ListItem } from "@/components/list-item";
import { CreateItem } from "@/components/create-item-form";
import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";

export default async function ItemsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Items Management</h1>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <CreateItem />
      </div>

      <div className="flex h-full flex-col gap-4 items-center p-4 overflow-y-auto">
        <ListItem id={session.user.id} />
      </div>
    </div>
  );
}
