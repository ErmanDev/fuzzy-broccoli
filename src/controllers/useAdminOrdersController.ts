import { useMemo, useState } from "react";
import type { Order } from "../models/types/user";

/**
 * Admin Orders Controller Hook
 * Handles business logic for all orders management
 */

// Mock data - in a real app, this would come from an API
const MOCK_ORDERS: Order[] = [
  {
    id: "ORD-001",
    storeId: "robinsons",
    storeName: "Robinsons Supermarket",
    items: [
      {
        productId: "1",
        productName: "Fresh Apples",
        quantity: 2,
        price: "₱199",
      },
      {
        productId: "2",
        productName: "Organic Milk",
        quantity: 1,
        price: "₱89",
      },
    ],
    total: "₱487",
    status: "pending",
    orderDate: "2024-01-15",
    pickupTime: "Ready in 30–45 min",
  },
  {
    id: "ORD-002",
    storeId: "gaisano",
    storeName: "Gaisano Supermarket",
    items: [
      {
        productId: "3",
        productName: "Bananas",
        quantity: 3,
        price: "₱69",
      },
    ],
    total: "₱207",
    status: "ready",
    orderDate: "2024-01-20",
    pickupTime: "Ready now",
  },
  {
    id: "ORD-003",
    storeId: "robinsons",
    storeName: "Robinsons Supermarket",
    items: [
      {
        productId: "1",
        productName: "Fresh Apples",
        quantity: 1,
        price: "₱199",
      },
    ],
    total: "₱199",
    status: "completed",
    orderDate: "2024-01-10",
  },
  {
    id: "ORD-004",
    storeId: "localmart",
    storeName: "Local Mart Supermarket",
    items: [
      {
        productId: "4",
        productName: "Bread",
        quantity: 2,
        price: "₱45",
      },
    ],
    total: "₱90",
    status: "pending",
    orderDate: "2024-01-22",
  },
];

export function useAdminOrdersController() {
  const [selectedStore, setSelectedStore] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");

  const stores = useMemo(() => {
    const storeIds = new Set(MOCK_ORDERS.map((o) => o.storeId));
    const storeNames = new Map(
      MOCK_ORDERS.map((o) => [o.storeId, o.storeName])
    );
    return Array.from(storeIds).map((id) => ({
      id,
      name: storeNames.get(id) || id,
    }));
  }, []);

  const statusOptions = ["All", "pending", "ready", "completed", "cancelled"];

  const filteredOrders = useMemo(() => {
    let filtered = MOCK_ORDERS;

    // Filter by store
    if (selectedStore !== "All") {
      filtered = filtered.filter((o) => o.storeId === selectedStore);
    }

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter((o) => o.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (o) =>
          o.id.toLowerCase().includes(query) ||
          o.storeName.toLowerCase().includes(query)
      );
    }

    return filtered.sort(
      (a, b) => new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
    );
  }, [selectedStore, selectedStatus, searchQuery]);

  const orderStats = useMemo(() => {
    return {
      total: MOCK_ORDERS.length,
      pending: MOCK_ORDERS.filter((o) => o.status === "pending").length,
      ready: MOCK_ORDERS.filter((o) => o.status === "ready").length,
      completed: MOCK_ORDERS.filter((o) => o.status === "completed").length,
      cancelled: MOCK_ORDERS.filter((o) => o.status === "cancelled").length,
    };
  }, []);

  const handleStoreChange = (store: string) => {
    setSelectedStore(store);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  return {
    orders: filteredOrders,
    stores: [{ id: "All", name: "All Stores" }, ...stores],
    orderStats,
    statusOptions,
    selectedStore,
    selectedStatus,
    searchQuery,
    handleStoreChange,
    handleStatusChange,
    handleSearchChange,
  };
}

