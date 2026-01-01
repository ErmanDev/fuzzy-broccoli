import { useEffect, useMemo, useState } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "../contexts/AuthContext";
import type { Order } from "../models/types/user";

/**
 * Order History Controller Hook
 * Handles order history management for customers with real-time updates
 */

export function useOrderHistoryController() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStatus, setSelectedStatus] = useState<string>("All");

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      setOrders([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set up real-time listener for user orders
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("userId", "==", user.id));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const userOrders: Order[] = [];
        
        snapshot.forEach((doc) => {
          const data = doc.data();
          const order: Order = {
            id: doc.id,
            storeId: data.storeId,
            storeName: data.storeName,
            items: data.items,
            total: data.total,
            status: data.status,
            orderDate: data.orderDate?.toDate?.().toISOString().split("T")[0] || data.orderDate,
            pickupTime: data.pickupTime,
            paymentStatus: data.paymentStatus,
            paymentId: data.paymentId,
            checkoutSessionId: data.checkoutSessionId,
            paymentMethod: data.paymentMethod,
          };
          userOrders.push(order);
        });

        // Sort by date (most recent first)
        userOrders.sort((a, b) => {
          const dateA = new Date(a.orderDate || 0).getTime();
          const dateB = new Date(b.orderDate || 0).getTime();
          return dateB - dateA;
        });

        setOrders(userOrders);
        setIsLoading(false);
      },
      (err) => {
        console.error("Error listening to orders:", err);
        setError(String(err?.message || err || "Failed to load orders"));
        setIsLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const statusOptions = ["All", "pending", "ready", "completed", "cancelled"];

  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter((o) => o.status === selectedStatus);
    }

    // Sort by date (most recent first)
    return filtered.sort((a, b) => {
      const dateA = new Date(a.orderDate || 0).getTime();
      const dateB = new Date(b.orderDate || 0).getTime();
      return dateB - dateA;
    });
  }, [orders, selectedStatus]);

  const orderStats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      ready: orders.filter((o) => o.status === "ready").length,
      completed: orders.filter((o) => o.status === "completed").length,
      cancelled: orders.filter((o) => o.status === "cancelled").length,
    };
  }, [orders]);

  return {
    orders: filteredOrders,
    orderStats,
    statusOptions,
    selectedStatus,
    isLoading,
    error,
    setSelectedStatus,
  };
}

