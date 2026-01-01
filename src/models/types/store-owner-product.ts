import type { Product } from "./product";

export type StoreOwnerProduct = Product & {
  stock: number;
  isActive: boolean;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

