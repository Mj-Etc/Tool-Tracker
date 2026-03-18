export type Transaction = {
  id: string;
  customerName: string | null;
  cashier: { name: string };
  totalAmount: number;
  createdAt: string;
  items: {
    item: { name: string; costPrice: number };
    quantity: number;
    unitPrice: number;
    subtotal: number;
  }[];
};

export type Item = {
  id: string;
  name: string;
  costPrice: number;
  price: number;
  quantity: number;
  category: { name: string } | null;
  createdAt: string;
  lowStockThreshold: number;
};

export type Stats = {
  totalInventoryValue: number;
  totalInventoryCost: number;
  avgTransactionValue: number;
  agingStock: number;
  totalRevenue: number;
  recentTransactionCount: number;
  fastMoving: { id: string; name: string; totalSold: number }[];
};

export type ReportMode = "daily" | "weekly" | "monthly" | "overall";
