import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { StoreOwnerOrder } from "../models/types/store-owner-order";
import type { StoreOwnerProduct } from "../models/types/store-owner-product";
import { ordersService, productsService, storesService } from "../services/db";

/**
 * Store Owner Dashboard Controller Hook
 * Handles business logic and state management for the store owner dashboard
 */

export function useStoreOwnerDashboardController() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<StoreOwnerOrder[]>([]);
  const [products, setProducts] = useState<StoreOwnerProduct[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch store owner's store
  useEffect(() => {
    const fetchStore = async () => {
      if (!user?.id || user.role !== "storeOwner") {
        setIsLoading(false);
        return;
      }

      try {
        const stores = await storesService.getStoresByOwner(user.id);
        if (stores.length > 0) {
          setStoreId(stores[0].id); // Use first store if multiple
        } else {
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching store:", err);
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [user]);

  // Fetch orders and products when storeId is available
  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const [fetchedOrders, fetchedProducts] = await Promise.all([
          ordersService.getStoreOrders(storeId),
          productsService.getStoreOwnerProducts(storeId),
        ]);
        setOrders(fetchedOrders);
        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeId]);

  const stats = useMemo(() => {
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const readyOrders = orders.filter((o) => o.status === "ready").length;
    const totalProducts = products.length;
    const activeProducts = products.filter((p) => p.isActive).length;
    const lowStockProducts = products.filter((p) => p.stock < 10).length;

    // Calculate total revenue from completed orders
    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, order) => {
        // Handle different total formats: "₱398", "₱398.00", "398", etc.
        const totalStr = order.total || "0";
        const price = parseFloat(totalStr.replace(/₱|,/g, "")) || 0;
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
  }, [orders, products]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5).sort(
      (a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime()
    );
  }, [orders]);

  return {
    user,
    stats,
    recentOrders,
    isLoading,
  };
}

