/**
 * Central route definitions for the app
 * These constants mirror the file-based routing structure in app/
 */

export const Routes = {
  HOME: "/",
  STORE: "/store",
  CART: "/cart",
  PROFILE: "/profile",
  LOGIN: "/login",
  REGISTER: "/register",
  CHECKOUT: "/checkout",
  CHECKOUT_SUCCESS: "/checkout-success",
  CHECKOUT_FAILED: "/checkout-failed",
  ORDER_TRACKING: "/order-tracking",
  ORDER_HISTORY: "/order-history",
  // Store Owner routes
  STORE_OWNER_DASHBOARD: "/store-owner/dashboard",
  STORE_OWNER_PRODUCTS: "/store-owner/products",
  STORE_OWNER_ORDERS: "/store-owner/orders",
  STORE_OWNER_SETTINGS: "/store-owner/settings",
  STORE_OWNER_PROFILE: "/store-owner/profile",
  // Admin routes
  ADMIN_DASHBOARD: "/admin/dashboard",
  ADMIN_STORES: "/admin/stores",
  ADMIN_USERS: "/admin/users",
  ADMIN_ORDERS: "/admin/orders",
  ADMIN_PROFILE: "/admin/profile",
  // Add more routes as you create them:
  // PRODUCT_DETAILS: "/product/[id]",
} as const;

export type Route = typeof Routes[keyof typeof Routes];

