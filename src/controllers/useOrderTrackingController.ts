import { useEffect, useState } from "react";
import { onSnapshot, doc } from "firebase/firestore";
import { db } from "../firebase/firebase";
import type { Order } from "../models/types/user";

/**
 * Order Tracking Controller Hook
 * Handles real-time order status monitoring using Firestore listeners
 */

export function useOrderTrackingController(orderId: string) {
  const [order, setOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [hasStatusChanged, setHasStatusChanged] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Set up real-time listener for order status
    const orderRef = doc(db, "orders", orderId);
    const unsubscribe = onSnapshot(
      orderRef,
      (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();
          const orderData: Order = {
            id: snapshot.id,
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

          // Detect status change
          setOrder((prevOrder) => {
            if (prevOrder && prevOrder.status !== orderData.status) {
              setHasStatusChanged(true);
            }
            return orderData;
          });
          setIsLoading(false);
        } else {
          setError("Order not found");
          setIsLoading(false);
        }
      },
      (err) => {
        console.error("Error listening to order:", err);
        setError(err?.message || "Failed to load order");
        setIsLoading(false);
      }
    );

    // Cleanup listener on unmount
    return () => {
      unsubscribe();
    };
  }, [orderId]);

  // Get status information
  const statusInfo = order
    ? {
        current: order.status,
        steps: [
          { status: "pending", label: "Order Placed", completed: true },
          {
            status: "ready",
            label: "Ready for Pickup",
            completed: order.status === "ready" || order.status === "completed",
          },
          {
            status: "completed",
            label: "Completed",
            completed: order.status === "completed",
          },
        ],
      }
    : null;

  return {
    order,
    isLoading,
    error,
    statusInfo,
    hasStatusChanged,
    clearStatusChange: () => setHasStatusChanged(false),
  };
}

