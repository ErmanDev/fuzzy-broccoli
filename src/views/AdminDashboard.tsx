import {
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";

/**
 * AdminDashboard View Component
 * Admin-specific dashboard screen
 */
export function AdminDashboard() {
  const { user } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Text style={styles.title}>Admin Dashboard</Text>
          <Text style={styles.subtitle}>Welcome, {user?.name}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Admin Features</Text>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Store Management</Text>
            <Text style={styles.cardText}>Manage all stores in the system</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>User Management</Text>
            <Text style={styles.cardText}>View and manage all users</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Order Management</Text>
            <Text style={styles.cardText}>Monitor all orders across stores</Text>
          </View>
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Analytics</Text>
            <Text style={styles.cardText}>View system-wide analytics</Text>
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

