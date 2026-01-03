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

  // Subscribe to orders in real-time and fetch products when storeId is available
  useEffect(() => {
    if (!storeId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    // Set up real-time listener for orders
    const unsubscribeOrders = ordersService.subscribeToStoreOrders(
      storeId,
      (storeOrders) => {
        setOrders(storeOrders);
      },
      (err) => {
        console.error("Error in orders subscription:", err);
      }
    );

    // Fetch products (can be made real-time later if needed)
    const fetchProducts = async () => {
      try {
        const fetchedProducts = await productsService.getStoreOwnerProducts(storeId);
        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error("Error fetching products:", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();

    // Cleanup subscription on unmount or when storeId changes
    return () => {
      unsubscribeOrders();
    };
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
    // Sort all orders first (newest first), then take top 5
    const sorted = [...orders].sort((a, b) => {
      // Prefer createdAt timestamp if available (more accurate)
      const timeA = (a as any).createdAt || new Date(a.orderDate || 0).getTime();
      const timeB = (b as any).createdAt || new Date(b.orderDate || 0).getTime();
      return timeB - timeA; // descending order (newest first)
    });
    return sorted.slice(0, 5);
  }, [orders]);

  return {
    user,
    stats,
    recentOrders,
    isLoading,
  };
}

