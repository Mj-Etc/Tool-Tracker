import { getSession } from "@/lib/auth-helpers";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default async function ReportsPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const totalItems = await prisma.item.count();
  const totalUsers = await prisma.user.count();
  const itemsWithUser = await prisma.item.findMany({
    include: { user: true },
  });

  const itemsByUser = itemsWithUser.reduce((acc, item) => {
    acc[item.user.name] = (acc[item.user.name] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reports & Analytics</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Items</CardDescription>
            <CardTitle className="text-4xl">{totalItems}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Tools in system</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Users</CardDescription>
            <CardTitle className="text-4xl">{totalUsers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Avg Items per User</CardDescription>
            <CardTitle className="text-4xl">
              {totalUsers > 0 ? (totalItems / totalUsers).toFixed(1) : 0}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Items per user average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Items by User</CardTitle>
          <CardDescription>Distribution of items across users</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {Object.entries(itemsByUser).map(([name, count]) => (
              <div key={name} className="flex items-center justify-between">
                <span className="text-sm font-medium">{name}</span>
                <span className="text-sm text-muted-foreground">{count} items</span>
              </div>
            ))}
            {Object.keys(itemsByUser).length === 0 && (
              <p className="text-sm text-muted-foreground">No items yet</p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>Latest items added to the system</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {itemsWithUser.slice(0, 5).map((item) => (
              <div key={item.id} className="flex items-center justify-between">
                <span className="text-sm font-medium">{item.name}</span>
                <span className="text-sm text-muted-foreground">
                  by {item.user.name}
                </span>
              </div>
            ))}
            {itemsWithUser.length === 0 && (
              <p className="text-sm text-muted-foreground">No recent activity</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
