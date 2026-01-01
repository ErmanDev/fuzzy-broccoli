export type UserRole = "customer" | "admin" | "storeOwner";

export type User = {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: UserRole;
  token?: string;
};

export type Address = {
  id: string;
  label: string;
  address: string;
  city: string;
  province: string;
  postalCode: string;
  isDefault?: boolean;
};

export type Order = {
  id: string;
  storeId: string;
  storeName: string;
  items: Array<{
    productId: string;
    productName: string;
    quantity: number;
    price: string;
  }>;
  total: string;
  status: "pending" | "ready" | "completed" | "cancelled";
  orderDate: string;
  pickupTime?: string;
  // Payment fields
  paymentStatus?: "pending" | "paid" | "failed" | "refunded";
  paymentId?: string; // Payment intent ID
  checkoutSessionId?: string; // Checkout session ID
  paymentMethod?: "gcash" | "grab_pay" | "card" | "paymaya";
};

