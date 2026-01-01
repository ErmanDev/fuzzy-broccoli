import { useRouter, useLocalSearchParams } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useOrderTrackingController } from "../controllers/useOrderTrackingController";

/**
 * OrderTrackingScreen View Component
 * Displays real-time order status tracking with progress visualization
 */
export function OrderTrackingScreen() {
  const router = useRouter();
  const { orderId } = useLocalSearchParams<{ orderId: string }>();
  const { order, isLoading, error, statusInfo } = useOrderTrackingController(orderId || "");

  if (isLoading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading order...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error || !order) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.container}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
              <Ionicons name="arrow-back" size={24} color="#111827" />
            </TouchableOpacity>
            <Text style={styles.title}>Order Tracking</Text>
            <View style={{ width: 24 }} />
          </View>
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={48} color="#dc2626" />
            <Text style={styles.errorTitle}>Order Not Found</Text>
            <Text style={styles.errorText}>{error || "Unable to load order details"}</Text>
            <TouchableOpacity
              style={styles.backButtonStyle}
              onPress={() => router.back()}
            >
              <Text style={styles.backButtonText}>Go Back</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const getStatusIcon = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return <Ionicons name="checkmark-circle" size={32} color="#22c55e" />;
    }
    if (order.status === status) {
      return <Ionicons name="time" size={32} color="#f59e0b" />;
    }
    return <Ionicons name="ellipse-outline" size={32} color="#d1d5db" />;
  };

  const getStatusColor = (status: string, isCompleted: boolean) => {
    if (isCompleted) {
      return "#22c55e";
    }
    if (order.status === status) {
      return "#f59e0b";
    }
    return "#d1d5db";
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.title}>Order Tracking</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Order ID */}
          <View style={styles.orderIdContainer}>
            <Text style={styles.orderIdLabel}>Order ID</Text>
            <Text style={styles.orderId}>{order.id}</Text>
          </View>

          {/* Status Progress */}
          {statusInfo && (
            <View style={styles.statusSection}>
              <Text style={styles.sectionTitle}>Order Status</Text>
              <View style={styles.progressContainer}>
                {statusInfo.steps.map((step, index) => {
                  const isCompleted = step.completed;
                  const isCurrent = order.status === step.status;
                  const isLast = index === statusInfo.steps.length - 1;

                  return (
                    <View key={step.status} style={styles.stepContainer}>
                      <View style={styles.stepContent}>
                        <View
                          style={[
                            styles.iconContainer,
                            { backgroundColor: isCompleted ? "#f0fdf4" : "#f9fafb" },
                          ]}
                        >
                          {getStatusIcon(step.status, isCompleted)}
                        </View>
                        <View style={styles.stepTextContainer}>
                          <Text
                            style={[
                              styles.stepLabel,
                              { color: isCompleted || isCurrent ? "#111827" : "#9ca3af" },
                            ]}
                          >
                            {step.label}
                          </Text>
                          {isCurrent && (
                            <Text style={styles.stepSubtext}>
                              {order.status === "pending"
                                ? "Your order is being prepared"
                                : order.status === "ready"
                                ? "Your order is ready for pickup"
                                : "Order completed"}
                            </Text>
                          )}
                        </View>
                      </View>
                      {!isLast && (
                        <View
                          style={[
                            styles.connector,
                            { backgroundColor: isCompleted ? "#22c55e" : "#e5e7eb" },
                          ]}
                        />
                      )}
                    </View>
                  );
                })}
              </View>
            </View>
          )}

          {/* Order Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Order Details</Text>
            <View style={styles.detailsCard}>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Store</Text>
                <Text style={styles.detailValue}>{order.storeName}</Text>
              </View>
              {order.pickupTime && (
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Pickup Time</Text>
                  <Text style={styles.detailValue}>{order.pickupTime}</Text>
                </View>
              )}
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Order Date</Text>
                <Text style={styles.detailValue}>{order.orderDate}</Text>
              </View>
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Payment Status</Text>
                <View
                  style={[
                    styles.paymentBadge,
                    order.paymentStatus === "paid" && styles.paymentBadgePaid,
                  ]}
                >
                  <Text
                    style={[
                      styles.paymentBadgeText,
                      order.paymentStatus === "paid" && styles.paymentBadgeTextPaid,
                    ]}
                  >
                    {order.paymentStatus === "paid" ? "Paid" : "Pending"}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Order Items */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Items</Text>
            <View style={styles.itemsCard}>
              {order.items.map((item, index) => (
                <View key={index} style={styles.itemRow}>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.productName}</Text>
                    <Text style={styles.itemQuantity}>Quantity: {item.quantity}</Text>
                  </View>
                  <Text style={styles.itemPrice}>{item.price}</Text>
                </View>
              ))}
              <View style={styles.totalRow}>
                <Text style={styles.totalLabel}>Total</Text>
                <Text style={styles.totalPrice}>{order.total}</Text>
              </View>
            </View>
          </View>
        </ScrollView>
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    marginBottom: 24,
  },
  backButtonStyle: {
    backgroundColor: "#22c55e",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  backButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollContent: {
    padding: 20,
  },
  orderIdContainer: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  orderIdLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  statusSection: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 20,
  },
  progressContainer: {
    gap: 8,
  },
  stepContainer: {
    position: "relative",
  },
  stepContent: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 16,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  stepTextContainer: {
    flex: 1,
    paddingTop: 8,
  },
  stepLabel: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  stepSubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
  connector: {
    width: 2,
    height: 24,
    marginLeft: 24,
    marginTop: 4,
    marginBottom: 4,
  },
  section: {
    marginBottom: 16,
  },
  detailsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  detailLabel: {
    fontSize: 14,
    color: "#6b7280",
  },
  detailValue: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  paymentBadge: {
    backgroundColor: "#fef3c7",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  paymentBadgePaid: {
    backgroundColor: "#d1fae5",
  },
  paymentBadgeText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#92400e",
  },
  paymentBadgeTextPaid: {
    color: "#065f46",
  },
  itemsCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  itemQuantity: {
    fontSize: 14,
    color: "#6b7280",
  },
  itemPrice: {
    fontSize: 16,
    fontWeight: "600",
    color: "#16a34a",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 8,
    borderTopWidth: 2,
    borderTopColor: "#e5e7eb",
  },
  totalLabel: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  totalPrice: {
    fontSize: 20,
    fontWeight: "700",
    color: "#16a34a",
  },
});

