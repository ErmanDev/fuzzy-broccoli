import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useState, useEffect } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useAdminDashboardController } from "../controllers/useAdminDashboardController";

/**
 * Admin Dashboard View Component
 * This is the UI layer for the admin dashboard
 * Business logic is handled by the controller hook
 */
export function AdminDashboardView() {
  const { user, stats } = useAdminDashboardController();
  const [avatarUpdateKey, setAvatarUpdateKey] = useState(0);

  // Update avatar key when user avatar changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarUpdateKey(prev => prev + 1);
    }
  }, [user?.avatar]);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.name}>{user?.name || "Admin"}</Text>
          </View>
          <View style={styles.avatar}>
            {user?.avatar ? (
              <Image
                key={`${user.avatar}-${user.id}-${avatarUpdateKey}`}
                source={{ 
                  uri: `${user.avatar}${user.avatar.includes('?') ? '&' : '?'}v=${avatarUpdateKey}`
                }}
                style={styles.avatarImage}
                resizeMode="cover"
                onError={(error) => {
                  console.error("Avatar image load error:", error);
                }}
              />
            ) : (
              <Text style={styles.avatarText}>
                {user?.name ? getInitials(user.name) : "AD"}
              </Text>
            )}
          </View>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Ionicons name="storefront-outline" size={24} color="#22c55e" />
            <Text style={styles.statValue}>{stats.totalStores}</Text>
            <Text style={styles.statLabel}>Stores</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="people-outline" size={24} color="#3b82f6" />
            <Text style={styles.statValue}>{stats.totalUsers}</Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="receipt-outline" size={24} color="#f59e0b" />
            <Text style={styles.statValue}>{stats.totalOrders}</Text>
            <Text style={styles.statLabel}>Orders</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="cash-outline" size={24} color="#8b5cf6" />
            <Text style={styles.statValue}>{stats.totalRevenue}</Text>
            <Text style={styles.statLabel}>Revenue</Text>
          </View>
        </View>

        {/* User Stats */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>User Statistics</Text>
          <View style={styles.userStatsRow}>
            <View style={styles.userStatCard}>
              <Ionicons name="person-outline" size={20} color="#3b82f6" />
              <Text style={styles.userStatValue}>{stats.customers}</Text>
              <Text style={styles.userStatLabel}>Customers</Text>
            </View>
            <View style={styles.userStatCard}>
              <Ionicons name="storefront-outline" size={20} color="#22c55e" />
              <Text style={styles.userStatValue}>{stats.storeOwners}</Text>
              <Text style={styles.userStatLabel}>Store Owners</Text>
            </View>
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  greeting: {
    fontSize: 16,
    color: "#6b7280",
  },
  name: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginTop: 4,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8b5cf6",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarImage: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#8b5cf6",
  },
  avatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  statsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    minWidth: "47%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  statValue: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  userStatsRow: {
    flexDirection: "row",
    gap: 12,
  },
  userStatCard: {
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
  userStatValue: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
    marginTop: 8,
  },
  userStatLabel: {
    fontSize: 11,
    color: "#6b7280",
    marginTop: 4,
  },
});

