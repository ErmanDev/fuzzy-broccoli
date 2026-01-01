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
import { Ionicons } from "@expo/vector-icons";
import { useAdminUsersController } from "../controllers/useAdminUsersController";
import { CreateStoreOwnerOverlay } from "../components/CreateStoreOwnerOverlay";
import { CreateStoreOverlay } from "../components/CreateStoreOverlay";

/**
 * Admin Users View Component
 * This is the UI layer for user management
 * Business logic is handled by the controller hook
 */
export function AdminUsersView() {
  const {
    users,
    userStats,
    roleOptions,
    statusOptions,
    selectedRole,
    selectedStatus,
    searchQuery,
    isLoading,
    error,
    isCreateModalVisible,
    isCreating,
    handleSearchChange,
    handleRoleChange,
    handleStatusChange,
    handleSuspendUser,
    handleActivateUser,
    handleCreateStoreOwner,
    setIsCreateModalVisible,
    isCreateStoreModalVisible,
    isCreatingStore,
    handleCreateStore,
    setIsCreateStoreModalVisible,
  } = useAdminUsersController();

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "customer":
        return "person-outline";
      case "storeOwner":
        return "storefront-outline";
      case "admin":
        return "shield-outline";
      default:
        return "person-outline";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "customer":
        return "#3b82f6";
      case "storeOwner":
        return "#22c55e";
      case "admin":
        return "#8b5cf6";
      default:
        return "#6b7280";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Users</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setIsCreateModalVisible(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.createButtonText}>Create Store Owner</Text>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{userStats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, styles.statCustomer]}>
            <Text style={styles.statValue}>{userStats.customers}</Text>
            <Text style={styles.statLabel}>Customers</Text>
          </View>
          <View style={[styles.statCard, styles.statStoreOwner]}>
            <Text style={styles.statValue}>{userStats.storeOwners}</Text>
            <Text style={styles.statLabel}>Store Owners</Text>
          </View>
          <View style={[styles.statCard, styles.statAdmin]}>
            <Text style={styles.statValue}>{userStats.admins}</Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            placeholder="Search users..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        {/* Filters */}
        <View style={styles.filtersContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <Text style={styles.filterLabel}>Role:</Text>
            {roleOptions.map((role) => {
              const isActive = role === selectedRole;
              return (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => handleRoleChange(role)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterRow}
          >
            <Text style={styles.filterLabel}>Status:</Text>
            {statusOptions.map((status) => {
              const isActive = status === selectedStatus;
              return (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.filterChip,
                    isActive && styles.filterChipActive,
                  ]}
                  onPress={() => handleStatusChange(status)}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      isActive && styles.filterChipTextActive,
                    ]}
                  >
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Error Message */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={20} color="#ef4444" />
            <Text style={styles.errorText}>{String(error)}</Text>
          </View>
        )}

        {/* Users List */}
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingText}>Loading users...</Text>
          </View>
        ) : (
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {users.length > 0 ? (
            users.map((user) => (
              <View key={user.id} style={styles.userCard}>
                <View style={styles.userHeader}>
                  <View style={styles.userInfo}>
                    <View
                      style={[
                        styles.userAvatar,
                        !user.avatar && { backgroundColor: getRoleColor(user.role) },
                      ]}
                    >
                      {user.avatar ? (
                        <Image source={{ uri: user.avatar }} style={styles.userAvatarImage} />
                      ) : (
                        <Text style={styles.userAvatarText}>
                          {getInitials(user.name)}
                        </Text>
                      )}
                    </View>
                    <View style={styles.userDetails}>
                      <Text style={styles.userName}>{user.name}</Text>
                      <Text style={styles.userEmail}>{user.email}</Text>
                      {user.phone && (
                        <Text style={styles.userPhone}>{user.phone}</Text>
                      )}
                    </View>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      user.status === "active" && styles.statusBadgeActive,
                      user.status === "suspended" && styles.statusBadgeSuspended,
                    ]}
                  >
                    <Text style={styles.statusText}>
                      {user.status.toUpperCase()}
                    </Text>
                  </View>
                </View>

                <View style={styles.userMeta}>
                  <View
                    style={[
                      styles.roleBadge,
                      { backgroundColor: getRoleColor(user.role) + "20" },
                    ]}
                  >
                    <Ionicons
                      name={getRoleIcon(user.role)}
                      size={14}
                      color={getRoleColor(user.role)}
                    />
                    <Text
                      style={[
                        styles.roleText,
                        { color: getRoleColor(user.role) },
                      ]}
                    >
                      {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                    </Text>
                  </View>
                </View>

                <View style={styles.userActions}>
                  {user.status === "active" ? (
                    <TouchableOpacity
                      style={styles.suspendButton}
                      onPress={() => handleSuspendUser(user.id)}
                      activeOpacity={0.8}
                    >
                      <Ionicons name="ban-outline" size={18} color="#ef4444" />
                      <Text style={styles.suspendButtonText}>Suspend</Text>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      style={styles.activateButton}
                      onPress={() => handleActivateUser(user.id)}
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
              <Ionicons name="people-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try adjusting your search"
                  : "No users match the selected filters"}
              </Text>
            </View>
          )}
          </ScrollView>
        )}

        {/* Create Store Owner Overlay */}
        <CreateStoreOwnerOverlay
          visible={isCreateModalVisible}
          onClose={() => setIsCreateModalVisible(false)}
          onSubmit={handleCreateStoreOwner}
          isLoading={isCreating}
        />

        {/* Create Store Overlay */}
        <CreateStoreOverlay
          visible={isCreateStoreModalVisible}
          onClose={() => setIsCreateStoreModalVisible(false)}
          onSubmit={handleCreateStore}
          isLoading={isCreatingStore}
        />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
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
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  createButtonText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#ffffff",
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
  statCustomer: {
    backgroundColor: "#ffffff",
    borderColor: "#22c55e",
  },
  statStoreOwner: {
    backgroundColor: "#ffffff",
    borderColor: "#22c55e",
  },
  statAdmin: {
    backgroundColor: "#ffffff",
    borderColor: "#22c55e",
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
  filtersContainer: {
    marginBottom: 16,
  },
  filterRow: {
    paddingHorizontal: 20,
    paddingBottom: 8,
    gap: 8,
    alignItems: "center",
  },
  filterLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#6b7280",
    marginRight: 4,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  filterChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  filterChipText: {
    fontSize: 12,
    color: "#6b7280",
    fontWeight: "500",
  },
  filterChipTextActive: {
    color: "#ffffff",
  },
  scrollContent: {
    padding: 20,
  },
  userCard: {
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
  userHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: "row",
    flex: 1,
  },
  userAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  userAvatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userAvatarText: {
    fontSize: 18,
    fontWeight: "700",
    color: "#ffffff",
  },
  userDetails: {
    flex: 1,
  },
  userName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 2,
  },
  userPhone: {
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
  statusBadgeSuspended: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "700",
    color: "#111827",
  },
  userMeta: {
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    gap: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
  },
  userActions: {
    flexDirection: "row",
    gap: 8,
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

