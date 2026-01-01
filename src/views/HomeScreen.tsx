import { router } from "expo-router";
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
import { ProductCard } from "../components/ProductCard";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import { useHomeController } from "../controllers/useHomeController";
import { goToProfile } from "../routing/navigation";

/**
 * HomeScreen View Component
 * This is the UI layer for the home screen
 * Business logic is handled by the controller hook
 */
export function HomeScreen() {
  const {
    greeting,
    searchQuery,
    selectedStoreId,
    selectedCategory,
    categories,
    filteredProducts,
    handleSearchChange,
    handleSelectCategory,
    stores,
    handleSelectStore,
    isLoadingStores,
    isLoadingProducts,
    error,
  } = useHomeController();
  const { addToCart } = useCart();
  const { user } = useAuth();

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
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerTextContainer}>
            <Text style={styles.greeting} numberOfLines={1}>
              {greeting}{user?.name ? `, ${user.name.split(' ')[0]}` : ''}!
            </Text>
            <Text style={styles.welcome}>Let&apos;s shop fresh groceries</Text>
          </View>
          <TouchableOpacity
            style={styles.avatar}
            onPress={goToProfile}
            activeOpacity={0.8}
          >
            {user?.avatar ? (
              <Image
                source={{ uri: user.avatar }}
                style={styles.avatarImage}
                resizeMode="cover"
              />
            ) : (
              <Text style={styles.avatarText}>
                {user?.name ? getInitials(user.name) : "U"}
              </Text>
            )}
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <TextInput
            placeholder="Search for fruits, vegetables, snacks..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error State */}
          {error && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{String(error)}</Text>
            </View>
          )}

          {/* Stores */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Supermarkets</Text>
            <TouchableOpacity onPress={() => router.push("/store")}>
              <Text style={styles.sectionAction}>View all</Text>
            </TouchableOpacity>
          </View>

          {isLoadingStores ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#22c55e" />
              <Text style={styles.loadingText}>Loading stores...</Text>
            </View>
          ) : stores.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No stores available</Text>
            </View>
          ) : (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.storesRow}
          >
            {stores.map((store) => {
              const isActive = store.id === selectedStoreId;
              return (
                <TouchableOpacity
                  key={store.id}
                  style={[styles.storeCard, isActive && styles.storeCardActive]}
                  onPress={() => handleSelectStore(store.id)}
                >
                  <View style={styles.storeAvatar}>
                  {store.logo ? (
                      <Image
                        source={{ uri: store.logo }}
                        style={styles.storeAvatarImage}
                        resizeMode="cover"
                      />
                    ) : (
                      <Text style={styles.storeAvatarText}>
                        {store.name.charAt(0)}
                      </Text>
                    )}
                  </View>
                  <View style={styles.storeInfo}>
                    <Text
                      numberOfLines={1}
                      style={[styles.storeName, isActive && styles.storeNameActive]}
                    >
                      {store.name}
                    </Text>
                 
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
          )}

          {/* Categories */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.sectionAction}>See all</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoriesRow}
          >
            {categories.map((category) => {
              const isActive = category === selectedCategory;
              return (
                <TouchableOpacity
                  key={category}
                  style={[
                    styles.categoryChip,
                    isActive && styles.categoryChipActive,
                  ]}
                  onPress={() => handleSelectCategory(category)}
                >
                  <Text
                    style={[
                      styles.categoryText,
                      isActive && styles.categoryTextActive,
                    ]}
                  >
                    {category}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Featured products */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Groceries</Text>
          <Text style={styles.sectionAction}>
                  {isLoadingProducts ? "Loading..." : `${filteredProducts.length} items`}
          </Text>
          </View>

          {isLoadingProducts ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : filteredProducts.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                {searchQuery ? "No products found" : "No products available"}
              </Text>
            </View>
          ) : (
            <View style={styles.productsGrid}>
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={addToCart}
                />
              ))}
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
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  greeting: {
    fontSize: 16,
    color: "#6b7280",
    flexShrink: 1,
  },
  welcome: {
    fontSize: 22,
    fontWeight: "700",
    color: "#111827",
    marginTop: 2,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 18,
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
  sectionHeaderRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  sectionAction: {
    fontSize: 14,
    color: "#22c55e",
  },
  categoriesRow: {
    paddingVertical: 8,
  },
  categoryChip: {
    backgroundColor: "#ecfdf3",
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 14,
    color: "#15803d",
    fontWeight: "500",
  },
  categoryChipActive: {
    backgroundColor: "#16a34a",
  },
  categoryTextActive: {
    color: "#f9fafb",
  },
  storesRow: {
    paddingVertical: 8,
  },
  storeCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 16,
    backgroundColor: "#ffffff",
    marginRight: 10,
  },
  storeCardActive: {
    backgroundColor: "#16a34a",
  },
  storeAvatar: {
    width: 32,
    height: 32,
    borderRadius: 999,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    overflow: "hidden",
  },
  storeAvatarImage: {
    width: "100%",
    height: "100%",
  },
  storeAvatarText: {
    color: "#f9fafb",
    fontWeight: "700",
  },
  storeInfo: {
    maxWidth: 140,
  },
  storeName: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  storeNameActive: {
    color: "#f9fafb",
  },
  storeMeta: {
    fontSize: 12,
    color: "#e5e7eb",
  },
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginTop: 8,
    gap: 0,
  },
  loadingContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  emptyContainer: {
    paddingVertical: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyText: {
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
});

