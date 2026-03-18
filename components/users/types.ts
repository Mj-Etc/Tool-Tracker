export type UserWithCounts = {
  id: string;
  name: string;
  email: string;
  role: string;
  createdAt: string;
  banned: boolean | null;
  _count: {
    transactions: number;
    items: number;
  };
};

export type UserRole = "admin" | "cashier";
