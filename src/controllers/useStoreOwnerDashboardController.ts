import { useMemo } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { StoreOwnerOrder } from "../models/types/store-owner-order";
import type { StoreOwnerProduct } from "../models/types/store-owner-product";

/**
 * Store Owner Dashboard Controller Hook
 * Handles business logic and state management for the store owner dashboard
 */

// Mock data - in a real app, this would come from an API
const MOCK_ORDERS: StoreOwnerOrder[] = [
  {
    id: "ORD-001",
    storeId: "robinsons",
    storeName: "Robinsons Supermarket",
    items: [
      {
        productId: "1",
        productName: "Fresh Apples",
        quantity: 2,
        price: "₱199",
      },
    ],
    total: "₱398",
    status: "pending",
    orderDate: "2024-01-15",
    customerName: "John Customer",
    customerPhone: "+63 912 345 6789",
  },
  {
    id: "ORD-002",
    storeId: "robinsons",
    storeName: "Robinsons Supermarket",
    items: [
      {
        productId: "2",
        productName: "Organic Milk",
        quantity: 1,
        price: "₱89",
      },
    ],
    total: "₱89",
    status: "ready",
    orderDate: "2024-01-20",
    customerName: "Jane Doe",
    customerPhone: "+63 912 345 6790",
  },
];

const MOCK_PRODUCTS: StoreOwnerProduct[] = [
  {
    id: "1",
    storeId: "robinsons",
    name: "Fresh Apples",
    price: "₱199",
    tag: "Best Seller",
    category: "Fruits",
    stock: 50,
    isActive: true,
  },
  {
    id: "2",
    storeId: "robinsons",
    name: "Organic Milk",
    price: "₱89",
    tag: "Organic",
    category: "Dairy",
    stock: 30,
    isActive: true,
  },
];

export function useStoreOwnerDashboardController() {
  const { user } = useAuth();

  const stats = useMemo(() => {
    const totalOrders = MOCK_ORDERS.length;
    const pendingOrders = MOCK_ORDERS.filter((o) => o.status === "pending").length;
    const readyOrders = MOCK_ORDERS.filter((o) => o.status === "ready").length;
    const totalProducts = MOCK_PRODUCTS.length;
    const activeProducts = MOCK_PRODUCTS.filter((p) => p.isActive).length;
    const lowStockProducts = MOCK_PRODUCTS.filter((p) => p.stock < 10).length;

    // Calculate total revenue (mock)
    const totalRevenue = MOCK_ORDERS
      .filter((o) => o.status === "completed")
      .reduce((sum, order) => {
        const price = parseFloat(order.total.replace("₱", "").replace(",", ""));
        return sum + price;
      }, 0);

    return {
      totalOrders,
      pendingOrders,
      readyOrders,
      totalProducts,
      activeProducts,
      lowStockProducts,
      totalRevenue: `₱${totalRevenue.toFixed(2)}`,
    };
  }, []);

  const recentOrders = useMemo(() => {
    return MOCK_ORDERS.slice(0, 5).sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
  }, []);

  return {
    user,
    stats,
    recentOrders,
  };
}

