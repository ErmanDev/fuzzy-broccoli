import type { Order } from "./user";

export type StoreOwnerOrder = Order & {
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  notes?: string;
};

