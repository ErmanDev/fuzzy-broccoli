import { useRouter } from "expo-router";
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
import { useOrderHistoryController } from "../controllers/useOrderHistoryController";

/**
 * OrderHistoryScreen View Component
 * Displays customer's order history with filtering
 */
export function OrderHistoryScreen() {
  const router = useRouter();
  const {
    orders,
    orderStats,
    statusOptions,
    selectedStatus,
    isLoading,
    error,
    setSelectedStatus,
  } = useOrderHistoryController();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#fef3c7";
      case "ready":
        return "#dbeafe";
      case "completed":
        return "#d1fae5";
      case "cancelled":
        return "#fee2e2";
      default:
        return "#e5e7eb";
    }
  };

  const getStatusTextColor = (status: string) => {
    switch (status) {
      case "pending":
        return "#92400e";
      case "ready":
        return "#1e40af";
      case "completed":
        return "#065f46";
      case "cancelled":
        return "#991b1b";
      default:
        return "#111827";
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
          <Text style={styles.title}>Order History</Text>
          <View style={{ width: 24 }} />
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{orderStats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#fef3c7" }]}>
            <Text style={styles.statValue}>{orderStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#dbeafe" }]}>
            <View style={styles.statValueContainer}>
              <Text style={styles.statValue}>{orderStats.ready}</Text>
              {orderStats.ready > 0 && (
                <View style={styles.readyCountBadge}>
                  <Text style={styles.readyCountText}>{orderStats.ready}</Text>
                </View>
              )}
            </View>
            <Text style={styles.statLabel}>Ready</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: "#d1fae5" }]}>
            <Text style={styles.statValue}>{orderStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Status Filter */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusRow}
        >
          {statusOptions.map((status) => {
            const isActive = status === selectedStatus;
            return (
              <TouchableOpacity
                key={status}
                style={[
                  styles.statusChip,
                  isActive && styles.statusChipActive,
                ]}
                onPress={() => setSelectedStatus(status)}
                activeOpacity={0.8}
              >
                <Text
                  style={[
                    styles.statusChipText,
                    isActive && styles.statusChipTextActive,
                  ]}
                >
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Orders List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Loading orders...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={48} color="#dc2626" />
              <Text style={styles.errorTitle}>Error</Text>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <TouchableOpacity
                key={order.id}
                style={styles.orderCard}
                onPress={() => router.push(`/order-tracking?orderId=${order.id}`)}
                activeOpacity={0.7}
              >
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.storeName}>{order.storeName}</Text>
                  </View>
                  <View style={styles.statusBadgeContainer}>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(order.status) },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusTextColor(order.status) },
                        ]}
                      >
                        {order.status.toUpperCase()}
                      </Text>
                    </View>
                    {order.status === "ready" && (
                      <View style={styles.readyBadge}>
                        <Ionicons name="notifications" size={12} color="#ffffff" />
                      </View>
                    )}
                  </View>
                </View>

                <View style={styles.orderItems}>
                  {order.items.slice(0, 2).map((item, index) => (
                    <Text key={index} style={styles.orderItemText}>
                      {item.quantity}x {item.productName}
                    </Text>
                  ))}
                  {order.items.length > 2 && (
                    <Text style={styles.moreItemsText}>
                      +{order.items.length - 2} more item{order.items.length - 2 !== 1 ? "s" : ""}
                    </Text>
                  )}
                </View>

                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.orderDateLabel}>Order Date</Text>
                    <Text style={styles.orderDate}>{order.orderDate}</Text>
                  </View>
                  <View style={styles.orderTotalContainer}>
                    <Text style={styles.orderTotalLabel}>Total</Text>
                    <Text style={styles.orderTotal}>{order.total}</Text>
                  </View>
                </View>

                <View style={styles.viewOrderRow}>
                  <Text style={styles.viewOrderText}>Tap to track order</Text>
                  <Ionicons name="chevron-forward" size={20} color="#22c55e" />
                </View>
              </TouchableOpacity>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptySubtitle}>
                {selectedStatus !== "All"
                  ? `No ${selectedStatus} orders`
                  : "You haven't placed any orders yet"}
              </Text>
            </View>
          )}
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
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginTop: 16,
    marginBottom: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  statusRow: {
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 8,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  statusChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  statusChipText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  statusChipTextActive: {
    color: "#ffffff",
  },
  scrollContent: {
    padding: 20,
  },
  loadingContainer: {
    alignItems: "center",
    padding: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    alignItems: "center",
    padding: 48,
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#dc2626",
    marginTop: 16,
    marginBottom: 8,
  },
  errorText: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
  orderCard: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  orderId: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  storeName: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadgeContainer: {
    position: "relative",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
  },
  readyBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#ef4444",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#ffffff",
  },
  statValueContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  readyCountBadge: {
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    paddingHorizontal: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  readyCountText: {
    color: "#ffffff",
    fontSize: 12,
    fontWeight: "700",
  },
  orderItems: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  orderItemText: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 4,
  },
  moreItemsText: {
    fontSize: 12,
    color: "#6b7280",
    fontStyle: "italic",
    marginTop: 4,
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 12,
  },
  orderDateLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#111827",
  },
  orderTotalContainer: {
    alignItems: "flex-end",
  },
  orderTotalLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  orderTotal: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22c55e",
  },
  viewOrderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f3f4f6",
  },
  viewOrderText: {
    fontSize: 14,
    color: "#22c55e",
    fontWeight: "600",
    marginRight: 4,
  },
  emptyContainer: {
    alignItems: "center",
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});

