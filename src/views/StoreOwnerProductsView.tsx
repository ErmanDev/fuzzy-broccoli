import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
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
import { AddProductOverlay } from "../components/AddProductOverlay";
import { EditProductOverlay } from "../components/EditProductOverlay";
import { useStoreOwnerProductsController } from "../controllers/useStoreOwnerProductsController";
import type { StoreOwnerProduct } from "../models/types/store-owner-product";

/**
 * Store Owner Products View Component
 * This is the UI layer for product management
 * Business logic is handled by the controller hook
 */
export function StoreOwnerProductsView() {
  const {
    products,
    categories,
    searchQuery,
    selectedCategory,
    isLoading,
    error,
    handleSearchChange,
    handleCategoryChange,
    handleAddProduct,
    handleUpdateProduct,
    handleDeleteProduct,
    handleToggleProductStatus,
  } = useStoreOwnerProductsController();
  const [showAddOverlay, setShowAddOverlay] = useState(false);
  const [editingProduct, setEditingProduct] = useState<StoreOwnerProduct | null>(null);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Products</Text>
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => setShowAddOverlay(true)}
          >
            <Ionicons name="add" size={20} color="#ffffff" />
            <Text style={styles.addButtonText}>Add</Text>
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchContainer}>
          <Ionicons name="search-outline" size={20} color="#9ca3af" style={styles.searchIcon} />
          <TextInput
            placeholder="Search products..."
            placeholderTextColor="#9ca3af"
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={handleSearchChange}
          />
        </View>

        {/* Categories */}
        <View style={styles.categoriesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Categories</Text>
            <Text style={styles.productCount}>
              {products.length} product{products.length !== 1 ? "s" : ""}
            </Text>
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
                  onPress={() => handleCategoryChange(category)}
                  activeOpacity={0.8}
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
        </View>

        {/* Error State */}
        {error && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{String(error)}</Text>
          </View>
        )}

        {/* Products List */}
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#22c55e" />
              <Text style={styles.loadingText}>Loading products...</Text>
            </View>
          ) : products.length > 0 ? (
            products.map((product) => (
              <View key={product.id} style={styles.productCard}>
                <View style={styles.productImageContainer}>
                  {product.imageUrl ? (
                    <Image
                      source={{ uri: product.imageUrl }}
                      style={styles.productImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.productImagePlaceholder}>
                      <Ionicons name="image-outline" size={24} color="#9ca3af" />
                    </View>
                  )}
                </View>
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <Text style={styles.productName}>{product.name}</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        !product.isActive && styles.statusInactive,
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {product.isActive ? "Active" : "Inactive"}
                      </Text>
                    </View>
                  </View>
                  <Text style={styles.productPrice}>{String(product.price || "")}</Text>
                  <Text style={styles.productCategory}>{String(product.category || "")}</Text>
                  <View style={styles.productMeta}>
                    <View style={styles.stockContainer}>
                      <Ionicons name="cube-outline" size={16} color="#6b7280" />
                      <Text style={styles.stockText}>
                        Stock: {String(product.stock || 0)}
                      </Text>
                    </View>
                    {product.stock < 10 && (
                      <Text style={styles.lowStockText}>Low Stock</Text>
                    )}
                  </View>
                </View>
                <View style={styles.productActions}>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.editButton]}
                    activeOpacity={0.7}
                    onPress={() => setEditingProduct(product)}
                  >
                    <Ionicons name="pencil-outline" size={18} color="#3b82f6" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.toggleButton]}
                    activeOpacity={0.7}
                    onPress={() => handleToggleProductStatus(product.id)}
                  >
                    <Ionicons
                      name={product.isActive ? "eye-outline" : "eye-off-outline"}
                      size={18}
                      color={product.isActive ? "#22c55e" : "#6b7280"}
                    />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.actionButton, styles.deleteButton]}
                    activeOpacity={0.7}
                    onPress={() => handleDeleteProduct(product.id)}
                  >
                    <Ionicons name="trash-outline" size={18} color="#ef4444" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="cube-outline" size={64} color="#d1d5db" />
              <Text style={styles.emptyTitle}>No products found</Text>
              <Text style={styles.emptySubtitle}>
                {searchQuery
                  ? "Try adjusting your search"
                  : "Add your first product to get started"}
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Add Product Overlay */}
      <AddProductOverlay
        visible={showAddOverlay}
        onClose={() => setShowAddOverlay(false)}
        onSubmit={handleAddProduct}
        categories={categories.filter((cat) => cat !== "All")}
      />

      {/* Edit Product Overlay */}
      <EditProductOverlay
        visible={editingProduct !== null}
        product={editingProduct}
        onClose={() => setEditingProduct(null)}
        onSubmit={(productId, updates, imageUri) => {
          handleUpdateProduct(productId, updates, imageUri);
          setEditingProduct(null);
        }}
        categories={categories.filter((cat) => cat !== "All")}
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
  addButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#22c55e",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    gap: 6,
  },
  addButtonText: {
    color: "#ffffff",
    fontSize: 14,
    fontWeight: "600",
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
  categoriesSection: {
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
  },
  productCount: {
    fontSize: 14,
    color: "#6b7280",
  },
  categoriesRow: {
    paddingHorizontal: 20,
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  categoryChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  categoryText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  categoryTextActive: {
    color: "#ffffff",
  },
  scrollContent: {
    padding: 20,
  },
  productCard: {
    flexDirection: "row",
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
  productImageContainer: {
    width: 80,
    height: 80,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  productImagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  productImageText: {
    fontSize: 12,
    color: "#9ca3af",
  },
  productInfo: {
    flex: 1,
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  productName: {
    flex: 1,
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    backgroundColor: "#d1fae5",
  },
  statusInactive: {
    backgroundColor: "#fee2e2",
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#111827",
  },
  productPrice: {
    fontSize: 18,
    fontWeight: "700",
    color: "#22c55e",
    marginBottom: 4,
  },
  productCategory: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 8,
  },
  productMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  stockContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  stockText: {
    fontSize: 12,
    color: "#6b7280",
  },
  lowStockText: {
    fontSize: 12,
    color: "#ef4444",
    fontWeight: "600",
  },
  productActions: {
    flexDirection: "column",
    justifyContent: "center",
    gap: 8,
    marginLeft: 12,
    paddingLeft: 12,
    borderLeftWidth: 1,
    borderLeftColor: "#e5e7eb",
  },
  actionButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f9fafb",
  },
  editButton: {
    backgroundColor: "#eff6ff",
  },
  toggleButton: {
    backgroundColor: "#f0fdf4",
  },
  deleteButton: {
    backgroundColor: "#fef2f2",
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
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 20,
    marginBottom: 16,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    textAlign: "center",
  },
});

