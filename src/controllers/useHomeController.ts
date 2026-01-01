import { useEffect, useMemo, useState } from "react";
import type { Product } from "../models/types/product";
import type { Store } from "../models/types/store";
import { productsService } from "../services/db/products";
import { storesService } from "../services/db/stores";

/**
 * Home Controller Hook
 * Handles business logic and state management for the home screen
 * This is where we orchestrate stores, products, and filters.
 */

const DEFAULT_CATEGORIES = ["All", "Fruits", "Vegetables", "Dairy", "Meat", "Snacks", "Drinks"] as const;

export function useHomeController() {
  // Get current time for greeting - updates based on current time
  const [currentHour, setCurrentHour] = useState(new Date().getHours());
  
  // Update hour every minute to keep greeting accurate
  useEffect(() => {
    const updateTime = () => {
      setCurrentHour(new Date().getHours());
    };
    
    // Update immediately
    updateTime();
    
    // Update every minute
    const interval = setInterval(updateTime, 60000);
    
    return () => clearInterval(interval);
  }, []);

  const greeting = useMemo(() => {
    if (currentHour >= 5 && currentHour < 12) return "Good morning";
    if (currentHour >= 12 && currentHour < 17) return "Good afternoon";
    if (currentHour >= 17 && currentHour < 21) return "Good evening";
    return "Good night"; // 21:00 - 04:59
  }, [currentHour]);

  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStoreId, setSelectedStoreId] = useState<string>("");
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  
  // Data states
  const [stores, setStores] = useState<Store[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingStores, setIsLoadingStores] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch stores on mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoadingStores(true);
        setError(null);
        const fetchedStores = await storesService.getActiveStores();
        setStores(fetchedStores);
        
        // Don't auto-select - let user choose or view all
      } catch (err: any) {
        console.error("Error fetching stores:", err);
        setError(String(err?.message || err || "Failed to load stores"));
      } finally {
        setIsLoadingStores(false);
      }
    };

    fetchStores();
  }, []);

  // Fetch products when store is selected or when showing all products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoadingProducts(true);
        setError(null);
        
        let fetchedProducts: Product[];
        if (selectedStoreId) {
          // Fetch products from selected store
          fetchedProducts = await productsService.getProductsByStore(selectedStoreId);
        } else {
          // Fetch all products from all active stores
          fetchedProducts = await productsService.getAllActiveProducts();
        }
        
        setProducts(fetchedProducts);
      } catch (err: any) {
        console.error("Error fetching products:", err);
        setError(String(err?.message || err || "Failed to load products"));
        setProducts([]);
      } finally {
        setIsLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [selectedStoreId]);

  // Extract unique categories from products
  const categories = useMemo(() => {
    const productCategories = products
      .map((p) => p.category)
      .filter((cat): cat is string => !!cat);
    const uniqueCategories = Array.from(new Set(productCategories));
    return ["All", ...uniqueCategories.sort()] as const;
  }, [products]);

  const filteredProducts = useMemo(() => {
    // Filter by category and search (works for both selected store and all products)
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === "All" || product.category === selectedCategory;

      if (!matchesCategory) return false;

      if (!searchQuery.trim()) return true;

      const query = searchQuery.toLowerCase();
      return (
        product.name.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        (product.tag?.toLowerCase().includes(query) ?? false)
      );
    });
  }, [products, searchQuery, selectedCategory]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleSelectCategory = (category: string) => {
    setSelectedCategory(category);
  };

  const handleSelectStore = (storeId: string) => {
    // Toggle: if clicking the same store, deselect it (show all products)
    if (selectedStoreId === storeId) {
      setSelectedStoreId("");
    } else {
      setSelectedStoreId(storeId);
    }
    // Reset category when switching stores
    setSelectedCategory("All");
  };

  return {
    greeting,
    searchQuery,
    selectedStoreId,
    selectedCategory,
    categories: categories.length > 1 ? categories : DEFAULT_CATEGORIES,
    stores,
    filteredProducts,
    isLoadingStores,
    isLoadingProducts,
    error,
    handleSearchChange,
    handleSelectCategory,
    handleSelectStore,
  };
}

