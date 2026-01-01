import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import type { Store } from "../models/types/store";
import { storesService } from "../services/db";
import { usersService } from "../services/db";
import { uploadToCloudinary } from "../services/cloudinary";

/**
 * Admin Stores Controller Hook
 * Handles business logic for store management
 */

// Extended store type for admin management
type AdminStore = Store & {
  status: "active" | "suspended" | "pending";
  ownerId?: string;
  ownerName?: string;
  ownerEmail?: string;
  createdAt?: string;
};

export function useAdminStoresController() {
  const [stores, setStores] = useState<AdminStore[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isCreateStoreModalVisible, setIsCreateStoreModalVisible] = useState(false);
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const statusOptions = ["All", "active", "suspended", "pending"];

  // Fetch stores from Firebase
  useEffect(() => {
    const fetchStores = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allStores = await storesService.getAllStores();
        
        // Fetch owner information for each store
        const storesWithOwners = await Promise.all(
          allStores.map(async (store) => {
            let ownerName: string | undefined;
            let ownerEmail: string | undefined;
            
            // Fetch owner information if ownerId exists
            if (store.ownerId) {
              try {
                const owner = await usersService.getUserById(store.ownerId);
                if (owner) {
                  ownerName = owner.name;
                  ownerEmail = owner.email;
                }
              } catch (err) {
                console.error(`Error fetching owner for store ${store.id}:`, err);
              }
            }
            
            return {
              id: store.id,
              name: store.name,
              logo: store.logo,
              rating: store.rating,
              pickupTime: store.pickupTime,
              status: (store.status || "pending") as "active" | "suspended" | "pending",
              ownerId: store.ownerId,
              ownerName,
              ownerEmail,
            } as AdminStore;
          })
        );
        
        setStores(storesWithOwners);
      } catch (err: any) {
        console.error("Error fetching stores:", err);
        setError(String(err?.message || err || "Failed to load stores"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchStores();
  }, []);

  const filteredStores = useMemo(() => {
    let filtered = stores;

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter((s) => s.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (s) =>
          s.name.toLowerCase().includes(query) ||
          s.ownerName?.toLowerCase().includes(query) ||
          s.ownerEmail?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [stores, searchQuery, selectedStatus]);

  const storeStats = useMemo(() => {
    return {
      total: stores.length,
      active: stores.filter((s) => s.status === "active").length,
      suspended: stores.filter((s) => s.status === "suspended").length,
      pending: stores.filter((s) => s.status === "pending").length,
    };
  }, [stores]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const refreshStores = async () => {
    try {
      const allStores = await storesService.getAllStores();
      const storesWithOwners = await Promise.all(
        allStores.map(async (store) => {
          let ownerName: string | undefined;
          let ownerEmail: string | undefined;
          
          if (store.ownerId) {
            try {
              const owner = await usersService.getUserById(store.ownerId);
              if (owner) {
                ownerName = owner.name;
                ownerEmail = owner.email;
              }
            } catch (err) {
              console.error(`Error fetching owner for store ${store.id}:`, err);
            }
          }
          
          return {
            id: store.id,
            name: store.name,
            logo: store.logo,
            rating: store.rating,
            pickupTime: store.pickupTime,
            status: (store.status || "pending") as "active" | "suspended" | "pending",
            ownerId: store.ownerId,
            ownerName,
            ownerEmail,
          } as AdminStore;
        })
      );
      setStores(storesWithOwners);
    } catch (err: any) {
      console.error("Error refreshing stores:", err);
    }
  };

  const handleApproveStore = async (storeId: string) => {
    try {
      await storesService.updateStore(storeId, { status: "active" });
      Alert.alert("Success", "Store approved successfully");
      await refreshStores();
    } catch (err: any) {
      console.error("Error approving store:", err);
      Alert.alert("Error", err.message || "Failed to approve store");
    }
  };

  const handleSuspendStore = async (storeId: string) => {
    const store = stores.find((s) => s.id === storeId);
    const storeName = store?.name || "this store";
    
    Alert.alert(
      "Suspend Store",
      `Are you sure you want to suspend "${storeName}"? The store will be hidden from customers until reactivated.`,
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Suspend",
          style: "destructive",
          onPress: async () => {
            try {
              await storesService.updateStore(storeId, { status: "suspended" });
              Alert.alert("Success", `"${storeName}" has been suspended successfully`);
              await refreshStores();
            } catch (err: any) {
              console.error("Error suspending store:", err);
              Alert.alert("Error", String(err?.message || err || "Failed to suspend store"));
            }
          },
        },
      ]
    );
  };

  const handleActivateStore = async (storeId: string) => {
    try {
      await storesService.updateStore(storeId, { status: "active" });
      Alert.alert("Success", "Store activated successfully");
      await refreshStores();
    } catch (err: any) {
      console.error("Error activating store:", err);
      Alert.alert("Error", err.message || "Failed to activate store");
    }
  };

  const handleCreateStore = async (
    ownerId: string,
    storeName: string,
    pickupTime?: string,
    logo?: string
  ) => {
    if (!ownerId) {
      Alert.alert("Error", "Store owner ID is required");
      return;
    }

    if (!storeName.trim()) {
      Alert.alert("Error", "Store name is required");
      return;
    }

    try {
      setIsCreatingStore(true);

      // Upload logo to Cloudinary if provided
      let logoUrl = undefined;
      if (logo) {
        try {
          const result = await uploadToCloudinary(logo, "stores", `stores/${ownerId}`);
          logoUrl = result.secure_url;
        } catch (uploadError) {
          console.error("Logo upload error:", uploadError);
          // Continue without logo if upload fails
        }
      }

      // Create store with pending status
      const storeData: any = {
        name: storeName.trim(),
        rating: 0,
        ownerId: ownerId,
        status: "pending",
      };
      
      // Only include optional fields if they have values
      if (pickupTime?.trim()) {
        storeData.pickupTime = pickupTime.trim();
      }
      if (logoUrl) {
        storeData.logo = logoUrl;
      }
      
      await storesService.createStore(storeData);

      Alert.alert("Success", "Store created successfully");
      await refreshStores();
      setIsCreateStoreModalVisible(false);
    } catch (error: any) {
      console.error("Error creating store:", error);
      Alert.alert("Error", error.message || "Failed to create store");
    } finally {
      setIsCreatingStore(false);
    }
  };

  return {
    stores: filteredStores,
    storeStats,
    statusOptions,
    selectedStatus,
    searchQuery,
    isLoading,
    error,
    isCreateStoreModalVisible,
    isCreatingStore,
    handleSearchChange,
    handleStatusChange,
    handleApproveStore,
    handleSuspendStore,
    handleActivateStore,
    handleCreateStore,
    setIsCreateStoreModalVisible,
  };
}

