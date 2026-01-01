import { useState, useEffect, useMemo } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { ordersService, storesService, usersService } from "../services/db";
import {
  createCheckoutSessionWithDefaults,
  phpToCentavos,
  verifyPayment,
  markSessionAsPaid,
  type CheckoutSessionLineItem,
} from "../services/payment/payment";
import { MOCK_PAYMENT_CONFIG } from "../config/payment";

/**
 * Checkout Controller Hook
 * Handles business logic for checkout screen including:
 * - Pickup time selection
 * - Order summary calculation
 * - Payment session creation
 * - Payment status tracking
 */

// Available pickup time slots
export const PICKUP_TIME_SLOTS = [
  "9:00 AM - 11:00 AM",
  "11:00 AM - 1:00 PM",
  "1:00 PM - 3:00 PM",
  "3:00 PM - 5:00 PM",
  "5:00 PM - 7:00 PM",
  "7:00 PM - 9:00 PM",
];

export function useCheckoutController() {
  const { user } = useAuth();
  const { items, clearCart } = useCart();
  const router = useRouter();
  const [pickupTime, setPickupTime] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [storeName, setStoreName] = useState<string>("");

  // Calculate order summary
  const orderSummary = useMemo(() => {
    if (items.length === 0) {
      return {
        items: [],
        subtotal: 0,
        formattedSubtotal: "₱0",
        itemCount: 0,
        storeId: "",
        storeName: "",
      };
    }

    // Group items by store (assuming all items are from same store for simplicity)
    // If items are from different stores, we'll use the first store
    const firstStoreId = items[0].product.storeId;
    const allSameStore = items.every(item => item.product.storeId === firstStoreId);

    if (!allSameStore) {
      console.warn("Cart contains items from multiple stores. Using first store.");
    }

    const subtotal = items.reduce((total, item) => {
      const priceStr = item.product.price.replace(/[^0-9.]/g, "");
      const price = parseFloat(priceStr) || 0;
      return total + price * item.quantity;
    }, 0);

    return {
      items: items.map(item => ({
        productId: item.product.id,
        productName: item.product.name,
        quantity: item.quantity,
        price: item.product.price,
      })),
      subtotal,
      formattedSubtotal: `₱${subtotal.toFixed(0)}`,
      itemCount: items.reduce((total, item) => total + item.quantity, 0),
      storeId: firstStoreId,
    };
  }, [items]);

  // Fetch store name
  useEffect(() => {
    const fetchStoreName = async () => {
      if (!orderSummary.storeId) {
        setStoreName("");
        return;
      }

      try {
        const store = await storesService.getStoreById(orderSummary.storeId);
        if (store) {
          setStoreName(store.name);
        } else {
          setStoreName("");
        }
      } catch (err) {
        console.error("Error fetching store:", err);
        setStoreName("");
      }
    };

    fetchStoreName();
  }, [orderSummary.storeId]);

  // Validate checkout data
  const validateCheckout = (): string | null => {
    if (items.length === 0) {
      return "Your cart is empty";
    }

    if (!pickupTime.trim()) {
      return "Please select a pickup time";
    }

    if (!user?.id) {
      return "You must be logged in to checkout";
    }

    return null;
  };

  // Initiate payment
  const initiatePayment = async (): Promise<string | null> => {
    const validationError = validateCheckout();
    if (validationError) {
      setError(validationError);
      return null;
    }

    setIsCreatingSession(true);
    setError(null);

    try {
      // Get store name if not already fetched
      let currentStoreName = storeName;
      if (!currentStoreName && orderSummary.storeId) {
        const store = await storesService.getStoreById(orderSummary.storeId);
        currentStoreName = store?.name || "Store";
      }

      // Prepare line items for payment
      const lineItems: CheckoutSessionLineItem[] = items.map(item => {
        const priceStr = item.product.price.replace(/[^0-9.]/g, "");
        const price = parseFloat(priceStr) || 0;
        return {
          name: item.product.name,
          quantity: item.quantity,
          amount: phpToCentavos(price),
        };
      });

      // Create checkout session
      const session = await createCheckoutSessionWithDefaults(
        lineItems,
        undefined // orderId will be set after order creation
      );

      // For mock payment: simulate processing delay, then mark as paid
      // In a real payment system, this would open a browser for payment
      
      // Simulate payment processing delay
      await new Promise(resolve => setTimeout(resolve, MOCK_PAYMENT_CONFIG.PROCESSING_DELAY));
      
      // Determine if payment should succeed based on success rate
      const shouldSucceed = Math.random() < MOCK_PAYMENT_CONFIG.SUCCESS_RATE;
      
      if (shouldSucceed) {
        // Mark session as paid (simulate successful payment)
        const paymentMethods: Array<'gcash' | 'grab_pay' | 'card' | 'paymaya'> = ['gcash', 'grab_pay', 'card', 'paymaya'];
        const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
        markSessionAsPaid(session.id, randomMethod);
        
        // Navigate to success screen
        router.push(`/checkout-success?session_id=${session.id}`);
        return session.id;
      } else {
        // Simulate payment failure
        router.push('/checkout-failed');
        return null;
      }
    } catch (err: any) {
      console.error("Error initiating payment:", err);
      setError(err?.message || "Failed to initiate payment");
      return null;
    } finally {
      setIsCreatingSession(false);
    }
  };

  // Verify payment and create order
  const completeCheckout = async (sessionId: string): Promise<{ success: boolean; orderId?: string; error?: string }> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verify payment
      const paymentResult = await verifyPayment(sessionId);

      if (!paymentResult.isPaid) {
        return {
          success: false,
          error: `Payment not completed. Status: ${paymentResult.status}`,
        };
      }

      // Get store name
      let currentStoreName = storeName;
      if (!currentStoreName && orderSummary.storeId) {
        const store = await storesService.getStoreById(orderSummary.storeId);
        currentStoreName = store?.name || "Store";
      }

      // Fetch customer information
      const customerInfo = await usersService.getUserById(user!.id);
      if (!customerInfo) {
        throw new Error("Customer information not found");
      }

      // Create order
      const orderId = await ordersService.createOrder({
        userId: user!.id,
        storeId: orderSummary.storeId,
        storeName: currentStoreName,
        items: orderSummary.items,
        total: orderSummary.formattedSubtotal,
        status: "pending",
        pickupTime,
        paymentStatus: "paid",
        paymentId: paymentResult.paymentIntentId,
        checkoutSessionId: sessionId,
        paymentMethod: paymentResult.paymentMethod,
        customerName: customerInfo.name,
        customerPhone: customerInfo.phone,
        customerEmail: customerInfo.email,
      });

      // Clear cart on success
      clearCart();

      return {
        success: true,
        orderId,
      };
    } catch (err: any) {
      console.error("Error completing checkout:", err);
      const errorMessage = err?.message || "Failed to complete checkout";
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
      };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    pickupTime,
    setPickupTime,
    orderSummary: {
      ...orderSummary,
      storeName,
    },
    isLoading,
    isCreatingSession,
    error,
    initiatePayment,
    completeCheckout,
    validateCheckout,
  };
}

