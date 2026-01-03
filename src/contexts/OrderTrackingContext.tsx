import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "./AuthContext";
import type { Order } from "../models/types/user";
import { OrderReadyOverlay } from "../components/OrderReadyOverlay";
import { OrderCompletedOverlay } from "../components/OrderCompletedOverlay";
import { useRouter } from "expo-router";

type OrderTrackingContextType = {
  activeOrders: Order[];
  readyOrder: Order | null;
  showReadyOverlay: boolean;
  dismissReadyOverlay: () => void;
  completedOrder: Order | null;
  showCompletedOverlay: boolean;
  dismissCompletedOverlay: () => void;
};

const OrderTrackingContext = createContext<OrderTrackingContextType | undefined>(undefined);

export function OrderTrackingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [readyOrder, setReadyOrder] = useState<Order | null>(null);
  const [showReadyOverlay, setShowReadyOverlay] = useState(false);
  const [alertedOrders, setAlertedOrders] = useState<Set<string>>(new Set());
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showCompletedOverlay, setShowCompletedOverlay] = useState(false);
  const [alertedCompletedOrders, setAlertedCompletedOrders] = useState<Set<string>>(new Set());

  // Listen for active orders (pending or ready status)
  useEffect(() => {
    if (!user?.id) {
      setActiveOrders([]);
      return;
    }

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", user.id),
      where("status", "in", ["pending", "ready"])
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orders: Order[] = [];
        const newReadyOrders: Order[] = [];

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

          orders.push(order);

          // Check if order just became ready (we'll check alertedOrders in the next step)
          if (order.status === "ready") {
            newReadyOrders.push(order);
          }
        });

        setActiveOrders(orders);

        // Check which ready orders haven't been alerted yet
        setAlertedOrders((prev) => {
          const unalertedReadyOrders = newReadyOrders.filter(
            (order) => !prev.has(order.id)
          );

          if (unalertedReadyOrders.length > 0) {
            const latestReadyOrder = unalertedReadyOrders[0];
            setReadyOrder(latestReadyOrder);
            setShowReadyOverlay(true);
            return new Set([...prev, latestReadyOrder.id]);
          }

          return prev;
        });
      },
      (error) => {
        console.error("Error listening to orders:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  // Listen for completed orders
  useEffect(() => {
    if (!user?.id) {
      return;
    }

    const ordersRef = collection(db, "orders");
    const q = query(
      ordersRef,
      where("userId", "==", user.id),
      where("status", "==", "completed")
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const newCompletedOrders: Order[] = [];

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

          newCompletedOrders.push(order);
        });

        // Check which completed orders haven't been alerted yet
        setAlertedCompletedOrders((prev) => {
          const unalertedCompletedOrders = newCompletedOrders.filter(
            (order) => !prev.has(order.id)
          );

          if (unalertedCompletedOrders.length > 0) {
            const latestCompletedOrder = unalertedCompletedOrders[0];
            setCompletedOrder(latestCompletedOrder);
            setShowCompletedOverlay(true);
            return new Set([...prev, latestCompletedOrder.id]);
          }

          return prev;
        });
      },
      (error) => {
        console.error("Error listening to completed orders:", error);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [user?.id]);

  const dismissReadyOverlay = () => {
    setShowReadyOverlay(false);
    // Keep the order in alertedOrders so we don't show it again
  };

  const dismissCompletedOverlay = () => {
    setShowCompletedOverlay(false);
    // Keep the order in alertedCompletedOrders so we don't show it again
  };

  const handleViewOrder = () => {
    if (readyOrder) {
      setShowReadyOverlay(false);
      router.push(`/order-tracking?orderId=${readyOrder.id}`);
    }
  };

  const handleViewCompletedOrder = () => {
    if (completedOrder) {
      setShowCompletedOverlay(false);
      router.push(`/order-tracking?orderId=${completedOrder.id}`);
    }
  };

  return (
    <OrderTrackingContext.Provider
      value={{
        activeOrders,
        readyOrder,
        showReadyOverlay,
        dismissReadyOverlay,
        completedOrder,
        showCompletedOverlay,
        dismissCompletedOverlay,
      }}
    >
      {children}
      {/* Global Order Ready Overlay */}
      <OrderReadyOverlay
        visible={showReadyOverlay}
        order={readyOrder}
        onDismiss={dismissReadyOverlay}
        onViewOrder={handleViewOrder}
      />
      {/* Global Order Completed Overlay */}
      <OrderCompletedOverlay
        visible={showCompletedOverlay}
        order={completedOrder}
        onDismiss={dismissCompletedOverlay}
        onViewOrder={handleViewCompletedOrder}
      />
    </OrderTrackingContext.Provider>
  );
}

export function useOrderTracking() {
  const context = useContext(OrderTrackingContext);
  if (context === undefined) {
    throw new Error("useOrderTracking must be used within an OrderTrackingProvider");
  }
  return context;
}

