import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { collection, query, where, onSnapshot } from "firebase/firestore";
import { db } from "../firebase/firebase";
import { useAuth } from "./AuthContext";
import type { Order } from "../models/types/user";
import { OrderReadyOverlay } from "../components/OrderReadyOverlay";
import { useRouter } from "expo-router";

type OrderTrackingContextType = {
  activeOrders: Order[];
  readyOrder: Order | null;
  showReadyOverlay: boolean;
  dismissReadyOverlay: () => void;
};

const OrderTrackingContext = createContext<OrderTrackingContextType | undefined>(undefined);

export function OrderTrackingProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const router = useRouter();
  const [activeOrders, setActiveOrders] = useState<Order[]>([]);
  const [readyOrder, setReadyOrder] = useState<Order | null>(null);
  const [showReadyOverlay, setShowReadyOverlay] = useState(false);
  const [alertedOrders, setAlertedOrders] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!user?.id) {
      setActiveOrders([]);
      return;
    }

    // Listen for active orders (pending or ready status)
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

  const dismissReadyOverlay = () => {
    setShowReadyOverlay(false);
    // Keep the order in alertedOrders so we don't show it again
  };

  const handleViewOrder = () => {
    if (readyOrder) {
      setShowReadyOverlay(false);
      router.push(`/order-tracking?orderId=${readyOrder.id}`);
    }
  };

  return (
    <OrderTrackingContext.Provider
      value={{
        activeOrders,
        readyOrder,
        showReadyOverlay,
        dismissReadyOverlay,
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

