import { useEffect, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { StoreSettings } from "../models/types/store-settings";
import { storesService } from "../services/db";

/**
 * Store Owner Settings Controller Hook
 * Handles business logic for store settings management
 */

export function useStoreOwnerSettingsController() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<StoreSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch store data for the store owner
  useEffect(() => {
    const fetchStoreSettings = async () => {
      if (!user?.id || user.role !== "storeOwner") {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Fetch all stores owned by this user
        const stores = await storesService.getStoresByOwner(user.id);
        
        if (stores.length === 0) {
          setError("No store found. Please create a store first.");
          setIsLoading(false);
          return;
        }

        // Use the first store (or you could add logic to select/store multiple stores)
        const store = stores[0];
        
        // Map store data to StoreSettings format
        const storeSettings: StoreSettings = {
          id: store.id,
          name: store.name || "",
          logo: store.logo,
          description: store.description || "",
          pickupTime: store.pickupTime || "",
          storeHours: store.storeHours || {
            monday: { open: "09:00", close: "18:00", isOpen: true },
            tuesday: { open: "09:00", close: "18:00", isOpen: true },
            wednesday: { open: "09:00", close: "18:00", isOpen: true },
            thursday: { open: "09:00", close: "18:00", isOpen: true },
            friday: { open: "09:00", close: "18:00", isOpen: true },
            saturday: { open: "09:00", close: "18:00", isOpen: true },
            sunday: { open: "09:00", close: "18:00", isOpen: true },
          },
          contactInfo: store.contactInfo || {
            phone: "",
            email: "",
            address: "",
          },
        };

        setSettings(storeSettings);
      } catch (err: any) {
        console.error("Error fetching store settings:", err);
        setError(String(err?.message || err || "Failed to load store settings"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStoreSettings();
  }, [user?.id, user?.role]);

  const handleUpdateSettings = async (updates: Partial<StoreSettings>) => {
    setIsLoading(true);
    try {
      // In a real app, this would call an API
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSettings((prev) => ({ ...prev, ...updates }));
      return { success: true };
    } catch (error) {
      return { success: false, error: "Failed to update settings" };
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStoreHours = (day: keyof StoreSettings["storeHours"], hours: {
    open: string;
    close: string;
    isOpen: boolean;
  }) => {
    setSettings((prev) => ({
      ...prev,
      storeHours: {
        ...prev.storeHours,
        [day]: hours,
      },
    }));
  };

  return {
    settings: settings || {
      id: "",
      name: "",
      description: "",
      pickupTime: "",
      storeHours: {},
      contactInfo: {},
    },
    isLoading,
    error,
    handleUpdateSettings,
    handleUpdateStoreHours,
  };
}

