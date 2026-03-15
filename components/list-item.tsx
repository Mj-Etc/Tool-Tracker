"use client";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
  CardFooter,
} from "./ui/card";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Item, ItemMedia, ItemContent, ItemTitle } from "./ui/item";
import { Spinner } from "./ui/spinner";
import { DeleteItemButton } from "./ui/delete-item-button";
import { useSession } from "@/lib/auth-client";
import { ScrollArea } from "./ui/scroll-area";
import { Badge } from "./ui/badge";

type ItemWithUser = {
  id: string;
  name: string;
  description: string;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  category: string | null;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export function ListItem() {
  const { data: session } = useSession();
  const me = session;
  const { data, error, isLoading } = useSWR<ItemWithUser[]>(
    `/api/item/list-items`,
    fetcher,
  );

  const getStockStatus = (quantity: number, threshold: number) => {
    if (quantity === 0) return { label: "Out of Stock", color: "bg-red-500" };
    if (quantity <= threshold) return { label: "Low Stock", color: "bg-yellow-500" };
    return { label: "In Stock", color: "bg-green-500" };
  };

  if (error)
    return (
      <Item variant="outline">
        <ItemContent>
          <ItemTitle className="line-clamp-1">Failed to load items.</ItemTitle>
        </ItemContent>
      </Item>
    );
  if (isLoading)
    return (
      <Item variant="outline">
        <ItemMedia>
          <Spinner />
        </ItemMedia>
        <ItemContent>
          <ItemTitle className="line-clamp-1">Loading items...</ItemTitle>
        </ItemContent>
      </Item>
    );
  if (!data || data.length === 0) {
    return (
      <Item variant="outline">
        <ItemContent>
          <ItemTitle>Items is empty</ItemTitle>
        </ItemContent>
      </Item>
    );
  }

  return (
    <ScrollArea className="h-[calc(100vh-200px)] p-3 rounded-xl border">
      <div className="flex flex-col gap-2">
        {data?.map((item) => {
          const status = getStockStatus(item.quantity, item.lowStockThreshold);
          return (
            <Card key={item.id} className="w-full max-w-md">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-lg font-bold">{item.name}</CardTitle>
                <Badge className={status.color}>{status.label}</Badge>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Category</span>
                    <span>{item.category || "N/A"}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Price</span>
                    <span className="font-semibold">₱{Number(item.price).toFixed(2)}</span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Quantity</span>
                    <span className={item.quantity <= item.lowStockThreshold ? "text-red-500 font-bold" : ""}>
                      {item.quantity} units
                    </span>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-muted-foreground">Description</span>
                    <span className="line-clamp-1">{item.description}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t text-xs text-muted-foreground space-y-1">
                  <p>Owner: {item.user.name} ({item.user.email})</p>
                  <p>ID: {item.id}</p>
                </div>
              </CardContent>
              {me?.user.role === "admin" ? (
                <CardFooter className="flex-col gap-2">
                  <DeleteItemButton itemId={item.id} />
                </CardFooter>
              ) : null}
            </Card>
          );
        })}
      </div>
    </ScrollArea>
  );
}
