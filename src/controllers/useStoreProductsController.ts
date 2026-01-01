import { useEffect, useMemo, useState } from "react";
import type { Product } from "../models/types/product";
import { productsService } from "../services/db/products";
import { storesService } from "../services/db/stores";

/**
 * Store Products Controller Hook
 * Handles business logic for displaying products from a specific store
 */
export function useStoreProductsController(storeId: string, initialStoreName?: string) {
  const [storeName, setStoreName] = useState<string>(initialStoreName || "");
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");

  // Fetch store name and products
  useEffect(() => {
    const fetchData = async () => {
      if (!storeId) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch store name if not provided
        if (!initialStoreName) {
          const store = await storesService.getStoreById(storeId);
          if (store) {
            setStoreName(store.name);
          }
        }

        // Fetch products for this store
        const fetchedProducts = await productsService.getProductsByStore(storeId);
        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error("Error fetching store products:", err);
        setError(String(err?.message || err || "Failed to load products"));
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [storeId, initialStoreName]);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const productCategories = products
      .map((p) => p.category)
      .filter((cat): cat is string => !!cat);
    const uniqueCategories = Array.from(new Set(productCategories));
    return ["All", ...uniqueCategories.sort()];
  }, [products]);

  // Filter products by category and search
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
          p.category?.toLowerCase().includes(query) ||
          p.tag?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [products, selectedCategory, searchQuery]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  return {
    storeName,
    products: filteredProducts,
    categories,
    selectedCategory,
    searchQuery,
    isLoading,
    error,
    handleSearchChange,
    handleSelectCategory,
  };
}

