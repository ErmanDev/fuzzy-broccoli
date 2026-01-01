import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import type { StoreOwnerProduct } from "../models/types/store-owner-product";
import { productsService } from "../services/db/products";
import { storesService } from "../services/db/stores";

/**
 * Store Owner Products Controller Hook
 * Handles business logic for product management
 */

export function useStoreOwnerProductsController() {
  const { user } = useAuth();
  const [products, setProducts] = useState<StoreOwnerProduct[]>([]);
  const [storeId, setStoreId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch store owner's store
  useEffect(() => {
    const fetchStore = async () => {
      if (!user?.id || user.role !== "storeOwner") {
        setIsLoading(false);
        return;
      }

      try {
        const stores = await storesService.getStoresByOwner(user.id);
        if (stores.length > 0) {
          setStoreId(stores[0].id); // Use first store if multiple
        } else {
          setError("No store found. Please create a store first.");
        }
      } catch (err: any) {
        console.error("Error fetching store:", err);
        setError(String(err?.message || err || "Failed to load store"));
      }
    };

    fetchStore();
  }, [user]);

  // Fetch products when storeId is available
  useEffect(() => {
    const fetchProducts = async () => {
      if (!storeId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        const fetchedProducts = await productsService.getStoreOwnerProducts(storeId);
        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(String(err?.message || err || "Failed to load products"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [storeId]);

  const categories = useMemo(() => {
    const cats = new Set(products.map((p) => p.category));
    return ["All", ...Array.from(cats).sort()];
  }, [products]);

  const filteredProducts = useMemo(() => {
    let filtered = products;

    // Filter by category
    if (selectedCategory !== "All") {
      filtered = filtered.filter((p) => p.category === selectedCategory);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (p) =>
          p.name.toLowerCase().includes(query) ||
          p.category.toLowerCase().includes(query) ||
          p.description?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, searchQuery, selectedCategory]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const handleAddProduct = async (product: Omit<StoreOwnerProduct, "id">) => {
    if (!storeId) {
      Alert.alert("Error", "No store found. Please create a store first.");
      return;
    }

    try {
      // Extract imageUri from product (passed as imageUrl from overlay)
      const imageUri = (product as any).imageUrl;
      const { imageUrl, ...productData } = product;

      // Ensure storeId matches the owner's store
      const productWithStoreId = {
        ...productData,
        storeId: storeId,
      };

      await productsService.createProduct(productWithStoreId, imageUri);

      // Refresh products list
      const updatedProducts = await productsService.getStoreOwnerProducts(storeId);
      setProducts(updatedProducts);

      Alert.alert("Success", "Product added successfully!");
    } catch (err: any) {
      console.error("Error adding product:", err);
      Alert.alert("Error", err.message || "Failed to add product");
    }
  };

  const handleUpdateProduct = async (
    id: string, 
    updates: Partial<StoreOwnerProduct>,
    imageUri?: string
  ) => {
    try {
      await productsService.updateProduct(id, updates, imageUri);

      // Refresh products list
      if (storeId) {
        const updatedProducts = await productsService.getStoreOwnerProducts(storeId);
        setProducts(updatedProducts);
      }

      Alert.alert("Success", "Product updated successfully!");
    } catch (err: any) {
      console.error("Error updating product:", err);
      Alert.alert("Error", err.message || "Failed to update product");
    }
  };

  const handleDeleteProduct = async (id: string) => {
    Alert.alert(
      "Delete Product",
      "Are you sure you want to delete this product?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              await productsService.deleteProduct(id);

              // Refresh products list
              if (storeId) {
                const updatedProducts = await productsService.getStoreOwnerProducts(storeId);
                setProducts(updatedProducts);
              }

              Alert.alert("Success", "Product deleted successfully!");
            } catch (err: any) {
              console.error("Error deleting product:", err);
              Alert.alert("Error", err.message || "Failed to delete product");
            }
          },
        },
      ]
    );
  };

  const handleToggleProductStatus = async (id: string) => {
    try {
      const product = products.find((p) => p.id === id);
      if (!product) return;

      const newStatus = !product.isActive;
      await productsService.updateProduct(id, { isActive: newStatus });

      // Refresh products list
      if (storeId) {
        const updatedProducts = await productsService.getStoreOwnerProducts(storeId);
        setProducts(updatedProducts);
      }
    } catch (err: any) {
      console.error("Error toggling product status:", err);
      Alert.alert("Error", err.message || "Failed to update product status");
    }
  };

  return {
    products: filteredProducts,
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
  };
}

