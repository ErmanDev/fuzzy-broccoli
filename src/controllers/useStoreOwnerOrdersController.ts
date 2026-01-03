import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import type { StoreOwnerOrder } from "../models/types/store-owner-order";
import { ordersService, storesService } from "../services/db";

/**
 * Store Owner Orders Controller Hook
 * Handles business logic for order management
 */

export function useStoreOwnerOrdersController() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<StoreOwnerOrder[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = ["All", "pending", "ready", "completed", "cancelled"];

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
          setStoreId((prevStoreId) => {
            // Only update if storeId is different to prevent unnecessary re-fetches
            if (prevStoreId !== stores[0].id) {
              return stores[0].id;
            }
            return prevStoreId;
          });
        } else {
          setError("No store found. Please create a store first.");
          setIsLoading(false);
        }
      } catch (err: any) {
        console.error("Error fetching store:", err);
        setError(String(err?.message || err || "Failed to load store"));
        setIsLoading(false);
      }
    };

    fetchStore();
  }, [user?.id, user?.role]);

  // Subscribe to orders in real-time when storeId is available
  useEffect(() => {
    if (!storeId) {
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set up real-time listener for orders
    const unsubscribe = ordersService.subscribeToStoreOrders(
      storeId,
      (storeOrders) => {
        setOrders(storeOrders);
        setIsLoading(false);
        setError(null);
      },
      (err) => {
        console.error("Error in orders subscription:", err);
        setError(String(err?.message || err || "Failed to load orders"));
        setIsLoading(false);
      }
    );

    // Cleanup subscription on unmount or when storeId changes
    return () => {
      unsubscribe();
    };
  }, [storeId]);

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter((o) => o.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.customerName?.toLowerCase().includes(query) ||
          o.customerPhone?.toLowerCase().includes(query) ||
          o.customerEmail?.toLowerCase().includes(query)
      );
    }

    return filtered.sort(
      (a, b) => {
        // Prefer createdAt timestamp if available (more accurate)
        const timeA = (a as any).createdAt || new Date(a.orderDate || 0).getTime();
        const timeB = (b as any).createdAt || new Date(b.orderDate || 0).getTime();
        return timeB - timeA; // descending order (newest first)
      }
    );
  }, [orders, selectedStatus, searchQuery]);

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      ready: orders.filter((o) => o.status === "ready").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleUpdateOrderStatus = async (orderId: string, newStatus: StoreOwnerOrder["status"]) => {
    try {
      await ordersService.updateOrderStatus(orderId, newStatus);
      
      // Update local state
      setOrders((prevOrders) =>
        prevOrders.map((order) =>
          order.id === orderId ? { ...order, status: newStatus } : order
        )
      );

      Alert.alert("Success", `Order status updated to ${newStatus}`);
    } catch (err: any) {
      console.error("Error updating order status:", err);
      Alert.alert("Error", err?.message || "Failed to update order status");
    }
  };

  return {
    orders: filteredOrders,
    orderStats,
    statusOptions,
    selectedStatus,
    searchQuery,
    isLoading,
    error,
    handleStatusChange,
    handleSearchChange,
    handleUpdateOrderStatus,
  };
}

