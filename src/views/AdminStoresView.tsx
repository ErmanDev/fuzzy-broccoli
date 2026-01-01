import { Ionicons } from "@expo/vector-icons";
import {
  ActivityIndicator,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAdminStoresController } from "../controllers/useAdminStoresController";
import { CreateStoreForOwnerOverlay } from "../components/CreateStoreForOwnerOverlay";

/**
 * Admin Stores View Component
 * This is the UI layer for store management
 * Business logic is handled by the controller hook
 */
export function AdminStoresView() {
  const {
    stores,
    storeStats,
    statusOptions,
    selectedStatus,
    searchQuery,
    isLoading,
    error,
    isCreateStoreModalVisible,
    isCreatingStore,
    handleSearchChange,
    handleStatusChange,
    handleApproveStore,
    handleSuspendStore,
    handleActivateStore,
    handleCreateStore,
    setIsCreateStoreModalVisible,
  } = useAdminStoresController();

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Stores</Text>
          <TouchableOpacity
            style={styles.createButton}
            activeOpacity={0.8}
            onPress={() => setIsCreateStoreModalVisible(true)}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>Create</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{String(storeStats.total)}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, styles.statActive]}>
            <Text style={styles.statValue}>{String(storeStats.active)}</Text>
            <Text style={styles.statLabel}>Active</Text>
          </View>
          <View style={[styles.statCard, styles.statPending]}>
            <Text style={styles.statValue}>{String(storeStats.pending)}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
          <View style={[styles.statCard, styles.statSuspended]}>
            <Text style={styles.statValue}>{String(storeStats.suspended)}</Text>
            <Text style={styles.statLabel}>Suspended</Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            placeholder="Search stores..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{String(error)}</Text>
          </View>
        )}

        {/* Status Filter */}
        <View style={styles.statusSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Status</Text>
            <Text style={styles.sectionAction}>
              {String(stores.length)} store{stores.length !== 1 ? "s" : ""}
            </Text>
          </View>
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
        </View>

        {/* Stores List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingText}>Loading stores...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {stores.length > 0 ? (
            stores.map((store) => (
              <View key={store.id} style={styles.storeCard}>
                <View style={styles.storeHeader}>
                  <View style={styles.storeInfo}>
                    <View style={styles.storeLogo}>
                      {store.logo ? (
                        <Image
                          source={{ uri: store.logo }}
                          style={styles.storeLogoImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.storeLogoText}>
                          {store.name.charAt(0)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.storeDetails}>
                      <Text style={styles.storeName}>{store.name}</Text>
                      {store.ownerName && (
                        <Text style={styles.storeOwner}>
                          Owner: {store.ownerName}
                        </Text>
                      )}
                      {store.rating !== undefined && store.rating !== null && (
                        <View style={styles.ratingContainer}>
                          <Ionicons name="star" size={14} color="#fbbf24" />
                          <Text style={styles.rating}>{String(Number(store.rating).toFixed(1))}</Text>
                        </View>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      store.status === "active" && styles.statusBadgeActive,
                      store.status === "pending" && styles.statusBadgePending,
                      store.status === "suspended" && styles.statusBadgeSuspended,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {String(store.status || "").toUpperCase()}
                    </Text>
                  </View>
                </View>

         

                <View style={styles.storeActions}>
                  {store.status === "pending" && (
                    <TouchableOpacity
                      style={styles.approveButton}
                      onPress={() => handleApproveStore(store.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color="#22c55e" />
                      <Text style={styles.approveButtonText}>Approve</Text>
                    </TouchableOpacity>
                  )}
                  {store.status === "active" && (
                    <TouchableOpacity
                      style={styles.suspendButton}
                      onPress={() => handleSuspendStore(store.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="ban-outline" size={18} color="#ef4444" />
                      <Text style={styles.suspendButtonText}>Suspend</Text>
                    </TouchableOpacity>
                  )}
                  {store.status === "suspended" && (
                    <TouchableOpacity
                      style={styles.activateButton}
                      onPress={() => handleActivateStore(store.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="checkmark-circle-outline" size={18} color="#22c55e" />
                      <Text style={styles.activateButtonText}>Activate</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No stores found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try adjusting your search"
                  : "No stores match the selected filter"}
              </Text>
            </View>
          )}
          </ScrollView>
        )}
      </View>

      {/* Create Store Overlay */}
      <CreateStoreForOwnerOverlay
        visible={isCreateStoreModalVisible}
        onClose={() => setIsCreateStoreModalVisible(false)}
        onSubmit={handleCreateStore}
        isLoading={isCreatingStore}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
  },
  createButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
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
    borderWidth: 2,
    borderColor: "#22c55e",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statActive: {
    backgroundColor: "#ffffff",
    borderColor: "#22c55e",
  },
  statPending: {
    backgroundColor: "#ffffff",
    borderColor: "#22c55e",
  },
  statSuspended: {
    backgroundColor: "#ffffff",
    borderColor: "#22c55e",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  statLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
    fontWeight: "800",
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
  statusSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  sectionAction: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  statusRow: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    paddingBottom: 16,
  },
  statusChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 999,
    backgroundColor: "#ecfdf3",
    marginRight: 8,
  },
  statusChipActive: {
    backgroundColor: "#16a34a",
  },
  statusChipText: {
    fontSize: 14,
    color: "#15803d",
    fontWeight: "500",
  },
  statusChipTextActive: {
    color: "#f9fafb",
  },
  scrollContent: {
    padding: 20,
  },
  storeCard: {
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
  storeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  storeInfo: {
    flexDirection: "row",
    flex: 1,
  },
  storeLogo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  storeLogoImage: {
    width: "100%",
    height: "100%",
  },
  storeLogoText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  storeDetails: {
    flex: 1,
  },
  storeName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  storeOwner: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: "#6b7280",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: "#e5e7eb",
  },
  statusBadgeActive: {
    backgroundColor: "#d1fae5",
  },
  statusBadgePending: {
    backgroundColor: "#fef3c7",
  },
  statusBadgeSuspended: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111827",
  },
  storeMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 12,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
  storeActions: {
    flexDirection: "row",
    gap: 8,
  },
  approveButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  approveButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065f46",
  },
  suspendButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  suspendButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#991b1b",
  },
  activateButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    gap: 6,
  },
  activateButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065f46",
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
  errorContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    marginHorizontal: 20,
    marginBottom: 16,
    padding: 12,
    borderRadius: 12,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: "#991b1b",
  },
  loadingContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 48,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
});

