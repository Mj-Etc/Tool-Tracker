import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardDescription,
} from "./ui/card";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Item, ItemMedia, ItemContent, ItemTitle } from "./ui/item";
import { Spinner } from "./ui/spinner";

type ItemWithUser = {
  id: string;
  name: string;
  description: string;
  user: {
    name: string;
    email: string;
  };
};

export function ListItem() {
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
            <CardDescription className="text-chart-3">
              Description: {item.description}
            </CardDescription>
            <CardDescription className="text-chart-5">
              Owner: {item.user.name}
            </CardDescription>
            <CardDescription className="text-chart-1">
              Owner email: {item.user.email}
            </CardDescription>
          </CardContent>
        </Card>
      ))}
    </>
  );
}
