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

export default async function BorrowersPage() {
  const session = await getSession();

  if (!session?.user) {
    redirect("/login");
  }

  const items = await prisma.item.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  const borrowers = items.reduce((acc, item) => {
    const userId = item.user.id;
    if (!acc[userId]) {
      acc[userId] = {
        name: item.user.name,
        email: item.user.email,
        items: [],
      };
    }
    acc[userId].items.push({
      name: item.name,
      description: item.description,
      borrowedAt: item.createdAt,
    });
    return acc;
  }, {} as Record<string, { name: string; email: string; items: { name: string; description: string; borrowedAt: Date }[] }>);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Borrowers</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Borrowers</CardDescription>
            <CardTitle className="text-4xl">{Object.keys(borrowers).length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Users with borrowed items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Borrowed Items</CardDescription>
            <CardTitle className="text-4xl">{items.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Items currently borrowed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Loans</CardDescription>
            <CardTitle className="text-4xl">{items.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Items out on loan</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {Object.entries(borrowers).map(([userId, borrower]) => (
          <Card key={userId}>
            <CardHeader>
              <CardTitle>{borrower.name}</CardTitle>
              <CardDescription>{borrower.email}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {borrower.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <span className="text-muted-foreground">
                      {new Date(item.borrowedAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
                {borrower.items.length === 0 && (
                  <p className="text-sm text-muted-foreground">No items borrowed</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
        {Object.keys(borrowers).length === 0 && (
          <Card className="md:col-span-2">
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">No borrowers yet</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
