import { useRouter } from "expo-router";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { StoreCard } from "../components/StoreCard";
import { useStoreController } from "../controllers/useStoreController";

/**
 * StoreScreen View Component
 * This is the UI layer for the store screen
 * Business logic is handled by the controller hook
 */
export function StoreScreen() {
  const router = useRouter();
  const { searchQuery, filteredStores, handleSearchChange, isLoading, error } =
    useStoreController();

  const handleStorePress = (storeId: string, storeName: string) => {
    router.push({
      pathname: "/store-products",
      params: { storeId, storeName },
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Supermarkets</Text>
          <Text style={styles.subtitle}>
            Choose your preferred grocery store for pickup
          </Text>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search supermarkets..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        {/* Stores list */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.centerContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Loading stores...</Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>Error: {String(error)}</Text>
              <Text style={styles.errorSubtext}>Please try again later</Text>
            </View>
          ) : filteredStores.length > 0 ? (
            filteredStores.map((store) => (
              <StoreCard
                key={store.id}
                store={store}
                onPress={() => handleStorePress(store.id, store.name)}
              />
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No stores found</Text>
              <Text style={styles.emptySubtext}>
                Try adjusting your search
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
    paddingHorizontal: 20,
    paddingTop: 8,
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
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
    minHeight: 300,
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#991b1b",
    marginTop: 8,
    textAlign: "center",
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  searchContainer: {
    marginBottom: 16,
  },
  searchInput: {
    backgroundColor: "#e5e7eb",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14,
    color: "#111827",
  },
  scrollContent: {
    paddingBottom: 24,
  },
  emptyContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: "#6b7280",
  },
});

