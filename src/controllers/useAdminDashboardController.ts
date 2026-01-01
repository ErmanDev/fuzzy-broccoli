import { useEffect, useMemo, useState } from "react";
import { useAuth } from "../contexts/AuthContext";
import type { Store } from "../models/types/store";
import type { User } from "../models/types/user";
import type { Order } from "../models/types/user";
import { storesService, usersService, ordersService } from "../services/db";

/**
 * Admin Dashboard Controller Hook
 * Handles business logic and state management for the admin dashboard
 */

export function useAdminDashboardController() {
  const { user } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch all data from Firebase
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [fetchedStores, fetchedUsers, fetchedOrders] = await Promise.all([
          storesService.getAllStores(),
          usersService.getAllUsers(),
          ordersService.getAllOrders(),
        ]);
        setStores(fetchedStores);
        setUsers(fetchedUsers);
        setOrders(fetchedOrders);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  const stats = useMemo(() => {
    const totalStores = stores.length;
    const totalUsers = users.length;
    const totalOrders = orders.length;
    const pendingOrders = orders.filter((o) => o.status === "pending").length;
    const completedOrders = orders.filter((o) => o.status === "completed").length;

    // Calculate total revenue from completed orders
    const totalRevenue = orders
      .filter((o) => o.status === "completed")
      .reduce((sum, order) => {
        // Handle different total formats: "₱398", "₱398.00", "398", etc.
        const totalStr = order.total || "0";
        const price = parseFloat(totalStr.replace(/₱|,/g, "")) || 0;
        return sum + price;
      }, 0);

    // Count users by role
    const customers = users.filter((u) => u.role === "customer").length;
    const storeOwners = users.filter((u) => u.role === "storeOwner").length;
    const admins = users.filter((u) => u.role === "admin").length;

    return {
      totalStores,
      totalUsers,
      totalOrders,
      pendingOrders,
      completedOrders,
      totalRevenue: `₱${totalRevenue.toFixed(2)}`,
      customers,
      storeOwners,
      admins,
    };
  }, [stores, users, orders]);

  const recentOrders = useMemo(() => {
    return orders.slice(0, 5).sort(
      (a, b) => new Date(b.orderDate || 0).getTime() - new Date(a.orderDate || 0).getTime()
    );
  }, [orders]);

  return {
    user,
    stats,
    recentOrders,
    isLoading,
  };
}

