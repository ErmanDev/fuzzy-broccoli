import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStoreOwnerOrdersController } from "../controllers/useStoreOwnerOrdersController";

/**
 * Store Owner Orders View Component
 * This is the UI layer for order management
 * Business logic is handled by the controller hook
 */
export function StoreOwnerOrdersView() {
  const {
    orders,
    orderStats,
    statusOptions,
    selectedStatus,
    searchQuery,
    isLoading,
    error,
    handleStatusChange,
    handleSearchChange,
    handleUpdateOrderStatus,
  } = useStoreOwnerOrdersController();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Orders</Text>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{orderStats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, styles.statPending]}>
            <Text style={styles.statValue}>{orderStats.pending}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.statReady]}>
            <Text style={styles.statValue}>{orderStats.ready}</Text>
            <Text style={styles.statLabel}>Ready</Text>
          </View>
          <View style={[styles.statCard, styles.statCompleted]}>
            <Text style={styles.statValue}>{orderStats.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            placeholder="Search orders..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
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
                onPress={() => handleStatusChange(status)}
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

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color="#dc2626" />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

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
          ) : orders.length > 0 ? (
            orders.map((order) => (
              <View key={order.id} style={styles.orderCard}>
                <View style={styles.orderHeader}>
                  <View>
                    <Text style={styles.orderId}>{order.id}</Text>
                    <Text style={styles.orderCustomer}>
                      {order.customerName || "Customer"}
                    </Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      order.status === "pending" && styles.statusPending,
                      order.status === "ready" && styles.statusReady,
                      order.status === "completed" && styles.statusCompleted,
                      order.status === "cancelled" && styles.statusCancelled,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {order.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.orderItems}>
                  {order.items.map((item, index) => (
                    <View key={index} style={styles.orderItem}>
                      <Text style={styles.orderItemName}>
                        {item.quantity}x {item.productName}
                      </Text>
                      <Text style={styles.orderItemPrice}>{item.price}</Text>
                    </View>
                  ))}
                </View>

                <View style={styles.orderFooter}>
                  <View>
                    <Text style={styles.orderDateLabel}>Order Date</Text>
                    <Text style={styles.orderDate}>{order.orderDate}</Text>
                    {order.pickupTime && (
                      <>
                        <Text style={[styles.orderDateLabel, { marginTop: 8 }]}>Pickup Time</Text>
                        <Text style={styles.orderDate}>{order.pickupTime}</Text>
                      </>
                    )}
                  </View>
                  <View style={styles.orderTotalContainer}>
                    <Text style={styles.orderTotalLabel}>Total</Text>
                    <Text style={styles.orderTotal}>{order.total}</Text>
                  </View>
                </View>

                {order.status === "pending" && (
                  <TouchableOpacity
                    style={styles.updateButton}
                    activeOpacity={0.8}
                    onPress={() => handleUpdateOrderStatus(order.id, "ready")}
                  >
                    <Text style={styles.updateButtonText}>Mark as Ready</Text>
                  </TouchableOpacity>
                )}

                {order.status === "ready" && (
                  <TouchableOpacity
                    style={[styles.updateButton, styles.completeButton]}
                    activeOpacity={0.8}
                    onPress={() => handleUpdateOrderStatus(order.id, "completed")}
                  >
                    <Text style={styles.updateButtonText}>Mark as Completed</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="receipt-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No orders found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try adjusting your search"
                  : "Orders will appear here when customers place them"}
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
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  statsContainer: {
    flexDirection: "row",
    paddingHorizontal: 20,
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
  statPending: {
    backgroundColor: "#fef3c7",
  },
  statReady: {
    backgroundColor: "#dbeafe",
  },
  statCompleted: {
    backgroundColor: "#d1fae5",
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
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    marginHorizontal: 20,
    marginBottom: 16,
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
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
  orderCustomer: {
    fontSize: 14,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  statusPending: {
    backgroundColor: "#fef3c7",
  },
  statusReady: {
    backgroundColor: "#dbeafe",
  },
  statusCompleted: {
    backgroundColor: "#d1fae5",
  },
  statusCancelled: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111827",
  },
  orderItems: {
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  orderItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 4,
  },
  orderItemName: {
    fontSize: 14,
    color: "#111827",
  },
  orderItemPrice: {
    fontSize: 14,
    color: "#6b7280",
  },
  orderFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
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
  updateButton: {
    marginTop: 12,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
  },
  completeButton: {
    backgroundColor: "#16a34a",
  },
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
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

