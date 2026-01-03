import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, Alert, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useCheckoutController } from "../src/controllers/useCheckoutController";

/**
 * Checkout Success Screen
 * Handles payment verification and order creation after successful payment
 */
export default function CheckoutSuccess() {
  const router = useRouter();
  const { session_id } = useLocalSearchParams<{ session_id: string }>();
  const { completeCheckout } = useCheckoutController();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [orderId, setOrderId] = useState<string | null>(null);
  const hasProcessedRef = useRef(false);
  const processedSessionIdRef = useRef<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      if (!session_id) {
        setError("Missing payment session ID");
        setIsProcessing(false);
        return;
      }

      // Prevent duplicate processing of the same session
      if (hasProcessedRef.current && processedSessionIdRef.current === session_id) {
        return;
      }

      // Mark as processing
      hasProcessedRef.current = true;
      processedSessionIdRef.current = session_id;

      try {
        const result = await completeCheckout(session_id);
        
        if (result.success && result.orderId) {
          setOrderId(result.orderId);
          // Redirect to order tracking screen after a brief delay
          setTimeout(() => {
            router.replace(`/order-tracking?orderId=${result.orderId}`);
          }, 1500);
        } else {
          setError(result.error || "Payment verification failed");
        }
      } catch (err: any) {
        console.error("Error processing payment:", err);
        setError(err?.message || "Failed to process payment");
      } finally {
        setIsProcessing(false);
      }
    };

    processPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session_id]);

  if (isProcessing) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.processingText}>Processing your payment...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.errorIconContainer}>
            <Ionicons name="close-circle" size={64} color="#dc2626" />
          </View>
          <Text style={styles.errorTitle}>Payment Failed</Text>
          <Text style={styles.errorText}>{error}</Text>
          <View style={styles.buttonContainer}>
            <Text
              style={styles.buttonText}
              onPress={() => router.replace("/cart")}
            >
              Back to Cart
            </Text>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.successIconContainer}>
          <Ionicons name="checkmark-circle" size={64} color="#22c55e" />
        </View>
        <Text style={styles.successTitle}>Payment Successful!</Text>
        <Text style={styles.successText}>
          Your order has been placed successfully.
        </Text>
        {orderId && (
          <Text style={styles.orderIdText}>Order ID: {orderId}</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  content: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
  },
  processingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#6b7280",
  },
  successIconContainer: {
    marginBottom: 24,
  },
  errorIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  successText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 8,
  },
  orderIdText: {
    fontSize: 14,
    color: "#9ca3af",
    marginTop: 8,
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#dc2626",
    marginBottom: 12,
  },
  errorText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  buttonContainer: {
    marginTop: 24,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22c55e",
    textDecorationLine: "underline",
  },
});


