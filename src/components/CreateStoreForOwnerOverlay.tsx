import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import type { User } from "../models/types/user";
import { usersService } from "../services/db/users";
import { storesService } from "../services/db/stores";

type CreateStoreForOwnerOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (ownerId: string, storeName: string, pickupTime?: string, logo?: string) => void;
  isLoading?: boolean;
};

export function CreateStoreForOwnerOverlay({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateStoreForOwnerOverlayProps) {
  const [step, setStep] = useState<"selectOwner" | "createStore">("selectOwner");
  const [storeOwners, setStoreOwners] = useState<User[]>([]);
  const [isLoadingOwners, setIsLoadingOwners] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOwner, setSelectedOwner] = useState<User | null>(null);
  const [existingStoresCount, setExistingStoresCount] = useState(0);
  const [storeName, setStoreName] = useState("");
  const [pickupTime, setPickupTime] = useState("");
  const [logo, setLogo] = useState<string | null>(null);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      // Fade in background and slide up content simultaneously
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.spring(slideAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 65,
          friction: 11,
        }),
      ]).start();
    } else {
      // Fade out background and slide down content simultaneously
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible, slideAnim, fadeAnim]);

  // Fetch store owners when overlay opens
  useEffect(() => {
    if (visible && step === "selectOwner") {
      const fetchStoreOwners = async () => {
        try {
          setIsLoadingOwners(true);
          const owners = await usersService.getUsersByRole("storeOwner");
          setStoreOwners(owners);
        } catch (error) {
          console.error("Error fetching store owners:", error);
          Alert.alert("Error", "Failed to load store owners");
        } finally {
          setIsLoadingOwners(false);
        }
      };
      fetchStoreOwners();
    }
  }, [visible, step]);

  // Fetch existing stores count when owner is selected
  useEffect(() => {
    if (selectedOwner) {
      const fetchExistingStores = async () => {
        try {
          const stores = await storesService.getStoresByOwner(selectedOwner.id);
          setExistingStoresCount(stores.length);
        } catch (error) {
          console.error("Error fetching existing stores:", error);
        }
      };
      fetchExistingStores();
    }
  }, [selectedOwner]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const filteredOwners = useMemo(() => {
    if (!searchQuery.trim()) {
      return storeOwners;
    }
    const query = searchQuery.toLowerCase();
    return storeOwners.filter(
      (owner) =>
        owner.name.toLowerCase().includes(query) ||
        owner.email.toLowerCase().includes(query)
    );
  }, [storeOwners, searchQuery]);

  const handleSelectOwner = (owner: User) => {
    setSelectedOwner(owner);
    setStep("createStore");
  };

  const handleBackToSelection = () => {
    setStep("selectOwner");
    setStoreName("");
    setPickupTime("");
    setLogo(null);
  };

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission", "Permission to access camera roll is required!");
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: "images",
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setLogo(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleRemoveImage = () => {
    setLogo(null);
  };

  const handleSubmit = () => {
    if (!selectedOwner) {
      Alert.alert("Error", "Please select a store owner");
      return;
    }

    if (!storeName.trim()) {
      Alert.alert("Error", "Store name is required");
      return;
    }

    onSubmit(
      selectedOwner.id,
      storeName.trim(),
      pickupTime.trim() || undefined,
      logo || undefined
    );
  };

  const handleClose = () => {
    // Reset form on close
    setStep("selectOwner");
    setSearchQuery("");
    setSelectedOwner(null);
    setStoreName("");
    setPickupTime("");
    setLogo(null);
    setExistingStoresCount(0);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: fadeAnim,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY }],
            },
          ]}
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerContent}>
              {step === "createStore" && (
                <TouchableOpacity
                  onPress={handleBackToSelection}
                  style={styles.backButton}
                  activeOpacity={0.8}
                >
                  <Ionicons name="arrow-back" size={24} color="#6b7280" />
                </TouchableOpacity>
              )}
              <Text style={styles.title}>
                {step === "selectOwner" ? "Select Store Owner" : "Create Store"}
              </Text>
            </View>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {step === "selectOwner" ? (
              <>
                {/* Search bar */}
                <View style={styles.searchContainer}>
                  <Ionicons
                    name="search-outline"
                    size={20}
                    color="#9ca3af"
                    style={styles.searchIcon}
                  />
                  <TextInput
                    placeholder="Search store owners..."
                    placeholderTextColor="#9ca3af"
                    style={styles.searchInput}
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>

                {/* Store Owners List */}
                {isLoadingOwners ? (
                  <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#22c55e" />
                    <Text style={styles.loadingText}>Loading store owners...</Text>
                  </View>
                ) : filteredOwners.length > 0 ? (
                  <View style={styles.ownersList}>
                    {filteredOwners.map((owner) => (
                      <TouchableOpacity
                        key={owner.id}
                        style={styles.ownerCard}
                        onPress={() => handleSelectOwner(owner)}
                        activeOpacity={0.8}
                      >
                        <View style={styles.ownerAvatar}>
                          {owner.avatar ? (
                            <Image
                              source={{ uri: owner.avatar }}
                              style={styles.ownerAvatarImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <Text style={styles.ownerAvatarText}>
                              {owner.name.charAt(0).toUpperCase()}
                            </Text>
                          )}
                        </View>
                        <View style={styles.ownerInfo}>
                          <Text style={styles.ownerName}>{owner.name}</Text>
                          <Text style={styles.ownerEmail}>{owner.email}</Text>
                        </View>
                        <Ionicons name="chevron-forward" size={20} color="#9ca3af" />
                      </TouchableOpacity>
                    ))}
                  </View>
                ) : (
                  <View style={styles.emptyContainer}>
                    <Ionicons name="person-outline" size={64} color="#d1d5db" />
                    <Text style={styles.emptyTitle}>No store owners found</Text>
                    <Text style={styles.emptySubtitle}>
                      {searchQuery
                        ? "Try adjusting your search"
                        : "No store owner users available"}
                    </Text>
                  </View>
                )}
              </>
            ) : (
              <>
                {/* Selected Owner Info */}
                {selectedOwner && (
                  <View style={styles.selectedOwnerInfo}>
                    <View style={styles.ownerAvatar}>
                      {selectedOwner.avatar ? (
                        <Image
                          source={{ uri: selectedOwner.avatar }}
                          style={styles.ownerAvatarImage}
                          resizeMode="cover"
                        />
                      ) : (
                        <Text style={styles.ownerAvatarText}>
                          {selectedOwner.name.charAt(0).toUpperCase()}
                        </Text>
                      )}
                    </View>
                    <View style={styles.selectedOwnerDetails}>
                      <Text style={styles.selectedOwnerName}>{selectedOwner.name}</Text>
                      <Text style={styles.selectedOwnerEmail}>{selectedOwner.email}</Text>
                      {existingStoresCount > 0 && (
                        <Text style={styles.existingStoresText}>
                          {existingStoresCount} existing store{existingStoresCount !== 1 ? "s" : ""}
                        </Text>
                      )}
                    </View>
                  </View>
                )}

                {/* Store Logo */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Store Logo (Optional)</Text>
                  <TouchableOpacity
                    style={styles.logoButton}
                    onPress={handlePickImage}
                    activeOpacity={0.8}
                  >
                    {logo ? (
                      <View style={styles.logoImageContainer}>
                        <Image source={{ uri: logo }} style={styles.logoImage} />
                        <TouchableOpacity
                          style={styles.removeImageButton}
                          onPress={(e) => {
                            e.stopPropagation();
                            handleRemoveImage();
                          }}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="close-circle" size={24} color="#ef4444" />
                        </TouchableOpacity>
                      </View>
                    ) : (
                      <View style={styles.logoPlaceholder}>
                        <Ionicons name="storefront-outline" size={32} color="#6b7280" />
                        <Text style={styles.logoPlaceholderText}>Tap to add logo</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                </View>

                {/* Store Name */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Store Name *</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="Enter store name"
                    placeholderTextColor="#9ca3af"
                    value={storeName}
                    onChangeText={setStoreName}
                    autoCapitalize="words"
                  />
                </View>

                {/* Pickup Time */}
                <View style={styles.inputContainer}>
                  <Text style={styles.label}>Pickup Time (Optional)</Text>
                  <TextInput
                    style={styles.input}
                    placeholder="e.g., Ready in 30-45 min"
                    placeholderTextColor="#9ca3af"
                    value={pickupTime}
                    onChangeText={setPickupTime}
                  />
                </View>
              </>
            )}
          </ScrollView>

          {/* Footer Buttons */}
          {step === "createStore" && (
            <View style={styles.footer}>
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleClose}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.submitButton, isLoading && styles.submitButtonDisabled]}
                onPress={handleSubmit}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <Text style={styles.submitButtonText}>
                  {isLoading ? "Creating..." : "Create Store"}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "90%",
    paddingBottom: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  backButton: {
    marginRight: 12,
    padding: 4,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    color: "#111827",
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 20,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginBottom: 16,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  loadingContainer: {
    paddingVertical: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#6b7280",
  },
  ownersList: {
    gap: 12,
  },
  ownerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  ownerAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
    overflow: "hidden",
  },
  ownerAvatarImage: {
    width: "100%",
    height: "100%",
  },
  ownerAvatarText: {
    fontSize: 20,
    fontWeight: "700",
    color: "#ffffff",
  },
  ownerInfo: {
    flex: 1,
  },
  ownerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  ownerEmail: {
    fontSize: 14,
    color: "#6b7280",
  },
  selectedOwnerInfo: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0fdf4",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#bbf7d0",
  },
  selectedOwnerDetails: {
    flex: 1,
    marginLeft: 12,
  },
  selectedOwnerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  selectedOwnerEmail: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  existingStoresText: {
    fontSize: 12,
    color: "#16a34a",
    fontWeight: "500",
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  logoButton: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  logoPlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  logoPlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
  logoImageContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  logoImage: {
    width: "100%",
    height: "100%",
  },
  removeImageButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
  },
  footer: {
    flexDirection: "row",
    paddingHorizontal: 20,
    paddingTop: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#f9fafb",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  cancelButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#6b7280",
  },
  submitButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  emptyContainer: {
    alignItems: "center",
    padding: 48,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
  },
});

