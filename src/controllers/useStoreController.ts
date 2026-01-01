import { useEffect, useMemo, useState } from "react";
import type { Store } from "../models/types/store";
import { storesService } from "../services/db";

/**
 * Store Controller Hook
 * Handles business logic and state management for the store screen
 */

export function useStoreController() {
  const [searchQuery, setSearchQuery] = useState("");
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch only active stores from Firebase on component mount
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        setError(null);
        // Fetch only active stores (not suspended or pending)
        const fetchedStores = await storesService.getActiveStores();
        setStores(fetchedStores);
        console.log("Fetched active stores from Firebase:", fetchedStores);
      } catch (err: any) {
        console.error("Error fetching stores:", err);
        setError(String(err?.message || err || "Failed to load stores"));
        setStores([]); 
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  const filteredStores = useMemo(() => {
    if (!searchQuery.trim()) {
      return stores;
    }

    const query = searchQuery.toLowerCase();
    return stores.filter(
      (store) =>
        store.name.toLowerCase().includes(query) ||
        store.pickupTime?.toLowerCase().includes(query)
    );
  }, [searchQuery, stores]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return {
    searchQuery,
    filteredStores,
    handleSearchChange,
    isLoading,
    error,
    stores,
  };
}

