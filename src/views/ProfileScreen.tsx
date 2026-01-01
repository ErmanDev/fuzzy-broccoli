import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";
import { EditProfileOverlay } from "../components/EditProfileOverlay";
import { ProfileMenuItem } from "../components/ProfileMenuItem";
import { useAuth } from "../contexts/AuthContext";
import { useEditProfileController } from "../controllers/useEditProfileController";
import { useProfileController } from "../controllers/useProfileController";

/**
 * ProfileScreen View Component
 * This is the UI layer for the profile screen
 * Business logic is handled by the controller hook
 */
export function ProfileScreen() {
  const router = useRouter();
  const { user: profileUser, orders, handleLogout, isLoading, error } = useProfileController();
  const { user: authUser, logout, refreshUser } = useAuth();
  const { handleUpdateProfile, isLoading: isUpdating } = useEditProfileController();
  const [isEditModalVisible, setIsEditModalVisible] = useState(false);
  const [avatarKey, setAvatarKey] = useState(0);

  // Customer profile view (store owners and admins have their own profile screens)
  const user = authUser || profileUser;

  // Force image refresh when avatar changes
  useEffect(() => {
    if (user?.avatar) {
      setAvatarKey(prev => prev + 1);
    }
  }, [user?.avatar]);

  // Don't render if user is not available
  if (!user) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color="#22c55e" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

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
      // Small delay to ensure Firestore has propagated the changes
      await new Promise(resolve => setTimeout(resolve, 300));
      // Refresh user data to get the updated avatar
      await refreshUser();
      // Force image refresh with a new key
      setAvatarKey(prev => prev + 1);
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
              {user.avatar ? (
                <Image
                  key={`avatar-${user.id}-${avatarKey}`}
                  source={{ 
                    uri: `${user.avatar}${user.avatar.includes('?') ? '&' : '?'}v=${avatarKey}` 
                  }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                  onError={(error) => {
                    console.error("Avatar image load error:", error);
                  }}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {getInitials(user.name)}
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
          <Text style={styles.userName}>{user.name}</Text>
          <Text style={styles.userEmail}>{user.email}</Text>
          {user.phone && <Text style={styles.userPhone}>{user.phone}</Text>}
        </View>

        {/* Loading State */}
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#22c55e" />
            <Text style={styles.loadingText}>Loading profile data...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>Error: {String(error)}</Text>
            <Text style={styles.errorSubtext}>Please try again later</Text>
          </View>
        ) : (
          <>
            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Orders</Text>
              <ProfileMenuItem
                icon="receipt-outline"
                title="Order History"
                subtitle={`${orders.length} order${orders.length !== 1 ? "s" : ""}`}
                badge={orders.filter((o) => o.status === "ready" || o.status === "pending").length}
                onPress={() => {
                  router.push("/order-history");
                }}
              />
            </View>

            <View style={styles.menuSection}>
              <Text style={styles.sectionTitle}>Settings</Text>
              <ProfileMenuItem
                icon="card-outline"
                title="Payment Methods"
                onPress={() => {
                  // Navigate to payment methods
                  console.log("Navigate to payment methods");
                }}
              />
              <ProfileMenuItem
                icon="help-circle-outline"
                title="Help & Support"
                onPress={() => {
                  // Navigate to help
                  console.log("Navigate to help");
                }}
              />
              <ProfileMenuItem
                icon="information-circle-outline"
                title="About"
                onPress={() => {
                  // Navigate to about
                  console.log("Navigate to about");
                }}
              />
            </View>

            <View style={styles.menuSection}>
              <ProfileMenuItem
                icon="log-out-outline"
                title="Logout"
                danger
                onPress={handleLogoutPress}
                showChevron={false}
              />
            </View>
          </>
        )}
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
    paddingBottom: 24,
  },
  centerContainer: {
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  errorContainer: {
    minHeight: 300,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 20,
    margin: 20,
  },
  errorText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#dc2626",
    textAlign: "center",
  },
  errorSubtext: {
    fontSize: 14,
    color: "#991b1b",
    marginTop: 8,
    textAlign: "center",
  },
  header: {
    backgroundColor: "#ffffff",
    alignItems: "center",
    paddingVertical: 32,
    paddingHorizontal: 20,
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    overflow: "hidden",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
  },
  avatarText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 36,
  },
  editButton: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: "#ecfdf3",
  },
  editButtonText: {
    color: "#16a34a",
    fontSize: 14,
    fontWeight: "600",
  },
  userName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    color: "#6b7280",
    marginBottom: 2,
  },
  userPhone: {
    fontSize: 14,
    color: "#6b7280",
  },
  menuSection: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#6b7280",
    marginBottom: 12,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});

