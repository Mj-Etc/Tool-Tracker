"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

type Transaction = {
  id: string;
  cashier: { name: string };
  totalAmount: number;
  createdAt: string;
  items: {
    item: { name: string };
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
};

type Item = {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string | null;
};

export default function ReportsPage() {
  const { data: transactions, isLoading: transLoading } = useSWR<Transaction[]>("/api/transactions", fetcher);
  const { data: items, isLoading: itemsLoading } = useSWR<Item[]>("/api/item/list-items", fetcher);

  const totalRevenue = transactions?.reduce((sum, t) => sum + Number(t.totalAmount), 0) || 0;
  const inventoryValue = items?.reduce((sum, i) => sum + (Number(i.price) * i.quantity), 0) || 0;

  if (transLoading || itemsLoading) {
    return <div className="flex h-full items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="flex flex-col gap-6 p-4">
      <h1 className="text-3xl font-bold">Reports</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total Sales Revenue</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-600">₱{totalRevenue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-2">From {transactions?.length || 0} transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Total Inventory Value</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-600">₱{inventoryValue.toFixed(2)}</div>
            <p className="text-sm text-muted-foreground mt-2">For {items?.length || 0} unique products</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="w-full">
        <TabsList>
          <TabsTrigger value="sales">Sales Report</TabsTrigger>
          <TabsTrigger value="inventory">Inventory Report</TabsTrigger>
        </TabsList>
        <TabsContent value="sales">
          <Card>
            <CardHeader>
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Date</th>
                      <th className="text-left py-2 px-2">Cashier</th>
                      <th className="text-left py-2 px-2">Items</th>
                      <th className="text-right py-2 px-2">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions?.map((t) => (
                      <tr key={t.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-2 px-2">{new Date(t.createdAt).toLocaleString()}</td>
                        <td className="py-2 px-2">{t.cashier.name}</td>
                        <td className="py-2 px-2 max-w-[200px] truncate">
                          {t.items.map(i => `${i.quantity}x ${i.item.name}`).join(", ")}
                        </td>
                        <td className="py-2 px-2 text-right font-semibold">₱{Number(t.totalAmount).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>Stock Status & Valuation</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <table className="w-full text-sm">
                  <thead className="sticky top-0 bg-background border-b">
                    <tr>
                      <th className="text-left py-2 px-2">Product</th>
                      <th className="text-center py-2 px-2">Qty</th>
                      <th className="text-right py-2 px-2">Price</th>
                      <th className="text-right py-2 px-2">Total Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items?.map((i) => (
                      <tr key={i.id} className="border-b hover:bg-muted/50 transition-colors">
                        <td className="py-2 px-2 font-medium">{i.name}</td>
                        <td className="py-2 px-2 text-center">{i.quantity}</td>
                        <td className="py-2 px-2 text-right">₱{Number(i.price).toFixed(2)}</td>
                        <td className="py-2 px-2 text-right font-semibold">
                          ₱{(Number(i.price) * i.quantity).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
