export type ItemWithUser = {
  id: string;
  name: string;
  description: string;
  costPrice: number;
  price: number;
  quantity: number;
  lowStockThreshold: number;
  category: {
    id: string;
    name: string;
  };
  subcategory: {
    id: string;
    name: string;
  };
  user: {
    id: string;
    name: string;
    email: string;
  };
};

export interface Subcategory {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  subcategories: Subcategory[];
}
