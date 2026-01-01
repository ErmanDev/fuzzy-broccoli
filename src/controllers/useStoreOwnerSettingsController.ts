import { useState } from "react";
import type { StoreSettings } from "../models/types/store-settings";

/**
 * Store Owner Settings Controller Hook
 * Handles business logic for store settings management
 */

// Mock data - in a real app, this would come from an API
const MOCK_STORE_SETTINGS: StoreSettings = {
  id: "robinsons",
  name: "Robinsons Supermarket",
  description: "Your trusted neighborhood grocery store",
  pickupTime: "Ready in 30–45 min",
  storeHours: {
    monday: { open: "08:00", close: "20:00", isOpen: true },
    tuesday: { open: "08:00", close: "20:00", isOpen: true },
    wednesday: { open: "08:00", close: "20:00", isOpen: true },
    thursday: { open: "08:00", close: "20:00", isOpen: true },
    friday: { open: "08:00", close: "20:00", isOpen: true },
    saturday: { open: "08:00", close: "20:00", isOpen: true },
    sunday: { open: "09:00", close: "18:00", isOpen: true },
  },
  contactInfo: {
    phone: "+63 32 123 4567",
    email: "robinsons@example.com",
    address: "123 Main Street, Cebu City",
  },
};

export function useStoreOwnerSettingsController() {
  const [settings, setSettings] = useState<StoreSettings>(MOCK_STORE_SETTINGS);
  const [isLoading, setIsLoading] = useState(false);

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
    settings,
    isLoading,
    handleUpdateSettings,
    handleUpdateStoreHours,
  };
}

