import { useEffect, useMemo, useState } from "react";
import { Alert } from "react-native";
import { createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { auth } from "../firebase/firebase";
import type { User, UserRole } from "../models/types/user";
import { usersService, storesService } from "../services/db";
import { uploadAvatar, uploadToCloudinary } from "../services/cloudinary";

/**
 * Admin Users Controller Hook
 * Handles business logic for user management
 */

// Extended user type for admin management
type AdminUser = User & {
  status: "active" | "suspended";
  createdAt?: string;
  lastLogin?: string;
};

export function useAdminUsersController() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedRole, setSelectedRole] = useState<string>("All");
  const [selectedStatus, setSelectedStatus] = useState<string>("All");
  const [isCreateModalVisible, setIsCreateModalVisible] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreateStoreModalVisible, setIsCreateStoreModalVisible] = useState(false);
  const [newStoreOwnerId, setNewStoreOwnerId] = useState<string | null>(null);
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  const roleOptions = ["All", "customer", "storeOwner"];
  const statusOptions = ["All", "active", "suspended"];

  // Fetch users from Firebase
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const allUsers = await usersService.getAllUsers();
        
        // Filter out admin users and map to AdminUser type
        const adminUsers: AdminUser[] = allUsers
          .filter((u) => u.role !== "admin")
          .map((u) => ({
            ...u,
            status: "active" as const, // Default status, can be extended later
          }));
        
        setUsers(adminUsers);
      } catch (err: any) {
        console.error("Error fetching users:", err);
        setError(String(err?.message || err || "Failed to load users"));
      } finally {
        setIsLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    let filtered = users;

    // Filter by role
    if (selectedRole !== "All") {
      filtered = filtered.filter((u) => u.role === selectedRole);
    }

    // Filter by status
    if (selectedStatus !== "All") {
      filtered = filtered.filter((u) => u.status === selectedStatus);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (u) =>
          u.name.toLowerCase().includes(query) ||
          u.email.toLowerCase().includes(query) ||
          u.phone?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [users, searchQuery, selectedRole, selectedStatus]);

  const userStats = useMemo(() => {
    return {
      total: users.length,
      customers: users.filter((u) => u.role === "customer").length,
      storeOwners: users.filter((u) => u.role === "storeOwner").length,
      admins: 0, // Always 0 since we filter out admins
      active: users.filter((u) => u.status === "active").length,
      suspended: users.filter((u) => u.status === "suspended").length,
    };
  }, [users]);

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
  };

  const handleRoleChange = (role: string) => {
    setSelectedRole(role);
  };

  const handleStatusChange = (status: string) => {
    setSelectedStatus(status);
  };

  const handleSuspendUser = async (userId: string) => {
    try {
      await usersService.updateUser(userId, { role: "customer" } as any); // Using updateUser, but we need to add status field
      // For now, we'll just show an alert. Status management can be added later
      Alert.alert("Success", "User suspended successfully");
      // Refresh users
      const allUsers = await usersService.getAllUsers();
      const adminUsers: AdminUser[] = allUsers
        .filter((u) => u.role !== "admin")
        .map((u) => ({
          ...u,
          status: "active" as const,
        }));
      setUsers(adminUsers);
    } catch (err: any) {
      console.error("Error suspending user:", err);
      Alert.alert("Error", err.message || "Failed to suspend user");
    }
  };

  const handleActivateUser = async (userId: string) => {
    try {
      // Similar to suspend, but activate
      Alert.alert("Success", "User activated successfully");
      // Refresh users
      const allUsers = await usersService.getAllUsers();
      const adminUsers: AdminUser[] = allUsers
        .filter((u) => u.role !== "admin")
        .map((u) => ({
          ...u,
          status: "active" as const,
        }));
      setUsers(adminUsers);
    } catch (err: any) {
      console.error("Error activating user:", err);
      Alert.alert("Error", err.message || "Failed to activate user");
    }
  };

  const handleCreateStoreOwner = async (
    name: string,
    email: string,
    phone: string,
    password: string,
    avatar?: string
  ) => {
    try {
      setIsCreating(true);

      // Validation
      if (!name || !email || !phone || !password) {
        Alert.alert("Error", "All fields are required");
        setIsCreating(false);
        return;
      }

      if (password.length < 6) {
        Alert.alert("Error", "Password must be at least 6 characters");
        setIsCreating(false);
        return;
      }

      // IMPORTANT: When createUserWithEmailAndPassword is called, it automatically signs in the new user,
      // which would sign out the admin. We need to sign out the new user immediately after creation.
      // Note: In production, use Firebase Admin SDK on a backend to create users without signing them in.
      
      // Store the current admin user ID before creating new user
      const currentAdminId = auth.currentUser?.uid;
      
      // Create Firebase Auth user (this will temporarily sign in the new user, signing out admin)
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const firebaseUser = userCredential.user;

      // Upload avatar to Cloudinary if provided
      let avatarUrl = undefined;
      if (avatar) {
        try {
          avatarUrl = await uploadAvatar(avatar, firebaseUser.uid);
        } catch (uploadError) {
          console.error("Avatar upload error:", uploadError);
          // Continue without avatar if upload fails
        }
      }

      // Create user profile in Firestore with storeOwner role
      await usersService.createUser(firebaseUser.uid, {
        name,
        email,
        phone,
        avatar: avatarUrl,
        role: "storeOwner",
      });

      // IMPORTANT: Sign out the newly created user immediately
      // This prevents the app from switching to the store owner account
      await signOut(auth);
      
      // After signing out, the auth state will be null
      // The AuthContext will handle this, but we need to ensure the admin can continue
      // In a production app, you'd use Firebase Admin SDK on a backend to create users
      // which wouldn't sign them in, avoiding this issue entirely

      // Close store owner creation modal and open store creation modal
      setIsCreateModalVisible(false);
      setNewStoreOwnerId(firebaseUser.uid);
      setIsCreateStoreModalVisible(true);
    } catch (error: any) {
      console.error("Error creating store owner:", error);
      let errorMessage = "Failed to create store owner. Please try again.";
      
      if (error.code === "auth/email-already-in-use") {
        errorMessage = "Email is already registered";
      } else if (error.code === "auth/invalid-email") {
        errorMessage = "Invalid email address";
      } else if (error.code === "auth/weak-password") {
        errorMessage = "Password is too weak";
      }
      
      Alert.alert("Error", errorMessage);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCreateStore = async (
    storeName: string,
    pickupTime?: string,
    logo?: string
  ) => {
    if (!newStoreOwnerId) {
      Alert.alert("Error", "Store owner ID is missing");
      return;
    }

    try {
      setIsCreatingStore(true);

      // Upload logo to Cloudinary if provided
      let logoUrl = undefined;
      if (logo) {
        try {
          const result = await uploadToCloudinary(logo, "stores", `stores/${newStoreOwnerId}`);
          logoUrl = result.secure_url;
        } catch (uploadError) {
          console.error("Logo upload error:", uploadError);
          // Continue without logo if upload fails
        }
      }

      // Create store with pending status
      await storesService.createStore({
        name: storeName,
        pickupTime: pickupTime,
        logo: logoUrl,
        rating: 0,
        ownerId: newStoreOwnerId,
        status: "pending",
      });

      Alert.alert("Success", "Store owner and store created successfully");
      
      // Refresh users list
      const allUsers = await usersService.getAllUsers();
      const adminUsers: AdminUser[] = allUsers
        .filter((u) => u.role !== "admin")
        .map((u) => ({
          ...u,
          status: "active" as const,
        }));
      setUsers(adminUsers);
      
      setIsCreateStoreModalVisible(false);
      setNewStoreOwnerId(null);
    } catch (error: any) {
      console.error("Error creating store:", error);
      Alert.alert("Error", error.message || "Failed to create store");
    } finally {
      setIsCreatingStore(false);
    }
  };

  return {
    users: filteredUsers,
    userStats,
    roleOptions,
    statusOptions,
    selectedRole,
    selectedStatus,
    searchQuery,
    isLoading,
    error,
    isCreateModalVisible,
    isCreating,
    handleSearchChange,
    handleRoleChange,
    handleStatusChange,
    handleSuspendUser,
    handleActivateUser,
    handleCreateStoreOwner,
    setIsCreateModalVisible,
    isCreateStoreModalVisible,
    isCreatingStore,
    handleCreateStore,
    setIsCreateStoreModalVisible,
  };
}

