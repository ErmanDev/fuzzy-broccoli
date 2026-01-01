import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  Alert,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useCheckoutController, PICKUP_TIME_SLOTS } from "../controllers/useCheckoutController";

/**
 * CheckoutScreen View Component
 * This is the UI layer for the checkout screen
 * Business logic is handled by the controller hook
 */
export function CheckoutScreen() {
  const router = useRouter();
  const {
    pickupTime,
    setPickupTime,
    orderSummary,
    isLoading,
    isCreatingSession,
    error,
    initiatePayment,
  } = useCheckoutController();

  const handlePay = async () => {
    const sessionId = await initiatePayment();
    if (sessionId) {
      // Payment will be handled via deep link callback
      // The browser will open, user completes payment, then redirects back to our app
      // No need to navigate manually - deep link will handle it
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Checkout</Text>
          <View style={{ width: 24 }} />
        </View>

        {orderSummary.itemCount === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Your cart is empty</Text>
            <Text style={styles.emptySubtitle}>
              Add items to your cart to checkout
            </Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Error Message */}
            {error && (
              <View style={styles.errorContainer}>
                <Ionicons name="alert-circle" size={20} color="#dc2626" />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}

            {/* Order Summary */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Order Summary</Text>
              <View style={styles.itemsContainer}>
                {orderSummary.items.map((item, index) => (
                  <View key={index} style={styles.orderItem}>
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.orderItemName}>{item.productName}</Text>
                      <Text style={styles.orderItemQuantity}>Qty: {item.quantity}</Text>
                    </View>
                    <Text style={styles.orderItemPrice}>{item.price}</Text>
                  </View>
                ))}
              </View>
              <View style={styles.subtotalContainer}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.subtotalPrice}>{orderSummary.formattedSubtotal}</Text>
              </View>
            </View>

            {/* Pickup Time */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Pickup Time</Text>
              <Text style={styles.pickupTimeHelper}>
                Select your preferred pickup time. The store owner will notify you when your order is ready.
              </Text>
              <View style={styles.timeSlotsContainer}>
                {PICKUP_TIME_SLOTS.map((timeSlot) => (
                  <TouchableOpacity
                    key={timeSlot}
                    style={[
                      styles.timeSlotButton,
                      pickupTime === timeSlot && styles.timeSlotButtonSelected,
                      (isLoading || isCreatingSession) && styles.timeSlotButtonDisabled,
                    ]}
                    onPress={() => setPickupTime(timeSlot)}
                    disabled={isLoading || isCreatingSession}
                    activeOpacity={0.7}
                  >
                    <Text
                      style={[
                        styles.timeSlotText,
                        pickupTime === timeSlot && styles.timeSlotTextSelected,
                      ]}
                    >
                      {timeSlot}
                    </Text>
                    {pickupTime === timeSlot && (
                      <Ionicons name="checkmark-circle" size={20} color="#22c55e" />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Total and Pay Button */}
            <View style={styles.footer}>
              <View style={styles.totalContainer}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>{orderSummary.formattedSubtotal}</Text>
              </View>
              <TouchableOpacity
                style={[
                  styles.payButton,
                  (isLoading || isCreatingSession) && styles.payButtonDisabled,
                ]}
                onPress={handlePay}
                disabled={isLoading || isCreatingSession}
                activeOpacity={0.8}
              >
                {isCreatingSession ? (
                  <ActivityIndicator color="#ffffff" />
                ) : (
                  <Text style={styles.payButtonText}>Complete Payment</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    backgroundColor: "#ffffff",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 100,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 12,
  },
  addButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#22c55e",
  },
  itemsContainer: {
    marginBottom: 12,
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  orderItemInfo: {
    flex: 1,
  },
  orderItemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  orderItemQuantity: {
    fontSize: 14,
    color: "#6b7280",
  },
  orderItemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16a34a",
  },
  subtotalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  subtotalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  subtotalPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#16a34a",
  },
  addAddressButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    borderWidth: 2,
    borderColor: "#22c55e",
    borderStyle: "dashed",
    borderRadius: 12,
    gap: 8,
  },
  addAddressText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#22c55e",
  },
  addressesContainer: {
    gap: 12,
  },
  addressCard: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  addressCardSelected: {
    borderColor: "#22c55e",
    backgroundColor: "#f0fdf4",
  },
  addressHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  addressLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
  },
  defaultBadge: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginLeft: 8,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#ffffff",
    textTransform: "uppercase",
  },
  addressText: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
  },
  pickupTimeHelper: {
    fontSize: 12,
    color: "#9ca3af",
    marginBottom: 12,
  },
  timeSlotsContainer: {
    gap: 8,
  },
  timeSlotButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  timeSlotButtonSelected: {
    backgroundColor: "#f0fdf4",
    borderColor: "#22c55e",
  },
  timeSlotButtonDisabled: {
    opacity: 0.5,
  },
  timeSlotText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#111827",
  },
  timeSlotTextSelected: {
    color: "#22c55e",
    fontWeight: "600",
  },
  helperText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  footer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#ffffff",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  totalContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  totalPrice: {
    fontSize: 24,
    fontWeight: "700",
    color: "#16a34a",
  },
  payButton: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  payButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  payButtonText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#ffffff",
  },
});

