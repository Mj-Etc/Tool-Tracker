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

type ItemWithUser = {
  id: string;
  name: string;
  description: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export function ListItem({ id }: any) {
  const { data, error, isLoading } = useSWR<ItemWithUser[]>(
    `/api/item/list-items`,
    fetcher,
  );
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

  return (
    <>
      {data?.map((item) => (
        <Card key={item.id} className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>{item.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Description: {item.description}</CardDescription>
            <CardDescription>Owner: {item.user.name}</CardDescription>
            <CardDescription>email: {item.user.email}</CardDescription>
            <CardDescription>id: {item.id}</CardDescription>
          </CardContent>
          {id === item.user.id ? (
            <CardFooter className="flex-col gap-2">
              <DeleteItemButton
                itemId={item.id}
                endpoint="/api/item/delete-item"
              />
            </CardFooter>
          ) : null}
        </Card>
      ))}
    </>
  );
}
