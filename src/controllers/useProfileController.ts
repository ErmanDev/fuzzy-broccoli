import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useCart } from "../contexts/CartContext";
import type { Address, Order } from "../models/types/user";
import { addressesService, ordersService } from "../services/db";

/**
 * Profile Controller Hook
 * Handles business logic and state management for the profile screen
 */

export function useProfileController() {
  const { user: authUser, logout } = useAuth();
  const { clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Use authenticated user if available
  const user = useMemo(() => authUser, [authUser]);

  // Fetch addresses and orders from Firebase
  useEffect(() => {
    const fetchUserData = async () => {
      if (!authUser?.id) {
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);

        // Fetch user addresses
        const fetchedAddresses = await addressesService.getUserAddresses(
          authUser.id
        );
        setAddresses(fetchedAddresses);
        console.log("Fetched addresses:", fetchedAddresses);

        // Fetch user orders
        const fetchedOrders = await ordersService.getUserOrders(authUser.id);
        setOrders(fetchedOrders);
        console.log("Fetched orders:", fetchedOrders);
      } catch (err: any) {
        console.error("Error fetching user data:", err);
        setError(String(err?.message || err || "Failed to load profile data"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [authUser?.id]);

  const handleLogout = async () => {
    // Clear cart before logging out
    clearCart();
    // Logout will clear AsyncStorage and Firebase auth state
    await logout();
  };

  return {
    user,
    addresses,
    orders,
    handleLogout,
    isLoading,
    error,
  };
}

