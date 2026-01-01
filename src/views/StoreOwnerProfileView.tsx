import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useState, useEffect } from "react";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../contexts/AuthContext";
import { useProfileController } from "../controllers/useProfileController";
import { useEditProfileController } from "../controllers/useEditProfileController";
import { EditProfileOverlay } from "../components/EditProfileOverlay";

/**
 * Store Owner Profile View Component
 * This is the UI layer for the store owner profile screen
 * Business logic is handled by the controller hook
 */
export function StoreOwnerProfileView() {
  const { user: authUser, logout, refreshUser } = useAuth();
  const { handleLogout } = useProfileController();
  const { handleUpdateProfile, isLoading: isUpdating } = useEditProfileController();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [avatarUpdateKey, setAvatarUpdateKey] = useState(0);

  const user = authUser;

  // Update avatar key when user avatar changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarUpdateKey(prev => prev + 1);
    }
  }, [user?.avatar]);

  const handleLogoutPress = () => {
    Alert.alert(
      "Logout",
      "Are you sure you want to logout?",
      [
        {
          text: "Cancel",
          style: "cancel",
        },
        {
          text: "Logout",
          style: "destructive",
          onPress: () => {
            handleLogout();
            logout();
          },
        },
      ]
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const handleEditProfile = async (name: string, phone: string, avatar?: string) => {
    const result = await handleUpdateProfile(name, phone, avatar);
    
    if (result.success) {
      // Explicitly refresh user data to get the updated avatar
      await refreshUser();
      // Force image refresh by updating the key
      setAvatarUpdateKey(prev => prev + 1);
      Alert.alert("Success", "Profile updated successfully");
      setIsEditModalVisible(false);
    } else {
      Alert.alert("Error", result.error || "Failed to update profile");
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* User Header */}
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              {user?.avatar ? (
                <Image
                  key={`${user.avatar}-${user.id}-${avatarUpdateKey}`} // Force re-render when avatar updates
                  source={{ 
                    uri: `${user.avatar}${user.avatar.includes('?') ? '&' : '?'}v=${avatarUpdateKey}` // Cache-busting with update key
                  }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error("Avatar image load error:", error);
                  }}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.name ? getInitials(user.name) : "SO"}
                </Text>
              )}
            </View>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditModalVisible(true)}
              activeOpacity={0.8}
            >
              <Text style={styles.editButtonText}>Edit</Text>
            </TouchableOpacity>
          </View>
          <Text style={styles.userName}>{user?.name || "Store Owner"}</Text>
          <Text style={styles.userEmail}>{user?.email || ""}</Text>
          {user?.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
          <View style={styles.roleBadge}>
            <Ionicons name="storefront" size={16} color="#22c55e" />
            <Text style={styles.roleText}>Store Owner</Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Account</Text>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons name="person-outline" size={24} color="#111827" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Personal Information</Text>
              <Text style={styles.menuItemSubtitle}>Update your profile details</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons name="lock-closed-outline" size={24} color="#111827" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Change Password</Text>
              <Text style={styles.menuItemSubtitle}>Update your password</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons name="notifications-outline" size={24} color="#111827" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Notifications</Text>
              <Text style={styles.menuItemSubtitle}>Manage notification preferences</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Support</Text>
          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons name="help-circle-outline" size={24} color="#111827" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Help & Support</Text>
              <Text style={styles.menuItemSubtitle}>Get help with your store</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons name="document-text-outline" size={24} color="#111827" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Terms & Conditions</Text>
              <Text style={styles.menuItemSubtitle}>Read our terms of service</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} activeOpacity={0.7}>
            <Ionicons name="shield-checkmark-outline" size={24} color="#111827" />
            <View style={styles.menuItemContent}>
              <Text style={styles.menuItemTitle}>Privacy Policy</Text>
              <Text style={styles.menuItemSubtitle}>Learn how we protect your data</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
          </TouchableOpacity>
        </View>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={handleLogoutPress}
          activeOpacity={0.8}
        >
          <Ionicons name="log-out-outline" size={24} color="#ef4444" />
          <Text style={styles.logoutButtonText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Edit Profile Overlay */}
      {user && (
        <EditProfileOverlay
          visible={isEditModalVisible}
          onClose={() => setIsEditModalVisible(false)}
          onSubmit={handleEditProfile}
          initialUser={user}
          isLoading={isUpdating}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  scrollContent: {
    padding: 20,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    fontSize: 36,
    fontWeight: "700",
    color: "#ffffff",
  },
  editButton: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#ffffff",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 2,
    borderColor: "#22c55e",
  },
  editButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#22c55e",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  userPhone: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 12,
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#d1fae5",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 6,
  },
  roleText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#065f46",
  },
  menuSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItemContent: {
    flex: 1,
    marginLeft: 16,
  },
  menuItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  menuItemSubtitle: {
    fontSize: 12,
    color: "#6b7280",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginTop: 8,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#fee2e2",
    gap: 8,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ef4444",
  },
});

