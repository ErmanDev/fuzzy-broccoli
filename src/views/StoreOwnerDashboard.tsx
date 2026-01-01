import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";

/**
 * StoreOwnerDashboard View Component
 * Store owner-specific dashboard screen
 */
export function StoreOwnerDashboard() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Store Owner Dashboard</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Management</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>My Store</Text>
            <Text style={styles.cardText}>Manage your store information</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Products</Text>
            <Text style={styles.cardText}>Add and manage your products</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Orders</Text>
            <Text style={styles.cardText}>View and manage incoming orders</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Analytics</Text>
            <Text style={styles.cardText}>View your store's performance</Text>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  card: {
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
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  cardText: {
    fontSize: 14,
    color: "#6b7280",
  },
});

