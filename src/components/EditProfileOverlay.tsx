import { Ionicons } from "@expo/vector-icons";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useRef, useState } from "react";
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
} from "react-native";
import type { User } from "../models/types/user";

type EditProfileOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (name: string, phone: string, avatar?: string) => Promise<void>;
  initialUser: User;
  isLoading?: boolean;
};

export function EditProfileOverlay({
  visible,
  onClose,
  onSubmit,
  initialUser,
  isLoading = false,
}: EditProfileOverlayProps) {
  const [name, setName] = useState(initialUser.name || "");
  const [phone, setPhone] = useState(initialUser.phone || "");
  const [avatar, setAvatar] = useState<string | null>(null);
  const [hasAvatarChanged, setHasAvatarChanged] = useState(false);

  const slideAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Reset form when modal opens or initialUser changes
  useEffect(() => {
    if (visible) {
      setName(initialUser.name || "");
      setPhone(initialUser.phone || "");
      setAvatar(null);
      setHasAvatarChanged(false);
    }
  }, [visible, initialUser]);

  useEffect(() => {
    let animation: Animated.CompositeAnimation | null = null;

    if (visible) {
      // Fade in background and slide up content simultaneously
      animation = Animated.parallel([
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
      ]);
      animation.start();
    } else {
      // Fade out background and slide down content simultaneously
      animation = Animated.parallel([
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
      ]);
      animation.start();
    }

    // Cleanup: stop animation if component unmounts
    return () => {
      if (animation) {
        animation.stop();
      }
    };
  }, [visible, slideAnim, fadeAnim]);

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handlePickImage = async () => {
    try {
      // Request permissions
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission", "Permission to access camera roll is required!");
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      // Check if user canceled
      if (result.canceled) {
        return;
      }

      // Check if we have assets
      if (!result.assets || result.assets.length === 0) {
        Alert.alert("Error", "No image was selected");
        return;
      }

      // Get the first asset
      const asset = result.assets[0];
      if (!asset || !asset.uri) {
        Alert.alert("Error", "Invalid image selected");
        return;
      }

      // Set the avatar with local file URI
      setAvatar(asset.uri);
      setHasAvatarChanged(true);
    } catch (error: any) {
      console.error("Image picker error:", error);
      Alert.alert("Error", `Failed to pick image: ${error?.message || "Unknown error occurred"}`);
    }
  };

  const handleRemoveImage = () => {
    setAvatar(null);
    setHasAvatarChanged(true);
  };

  const handleSubmit = async () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Name is required");
      return;
    }

    try {
      // Determine what to submit for avatar
      let avatarToSubmit: string | undefined;
      
      if (hasAvatarChanged) {
        if (avatar && avatar.trim().length > 0) {
          // New image selected - pass local file URI
          avatarToSubmit = avatar;
        } else {
          // User removed image - pass empty string
          avatarToSubmit = "";
        }
      }
      // If hasAvatarChanged is false, avatarToSubmit remains undefined (no change)
      
      await onSubmit(name.trim(), phone.trim(), avatarToSubmit);
    } catch (error) {
      // Error handling is done in the controller
      console.error("Error in handleSubmit:", error);
    }
  };

  const handleClose = () => {
    // Reset form on close
    setName(initialUser.name || "");
    setPhone(initialUser.phone || "");
    setAvatar(null);
    setHasAvatarChanged(false);
    onClose();
  };

  // Determine which avatar to display
  // Prioritize newly selected avatar, then fallback to initial user avatar
  const displayAvatar = avatar ? avatar : (initialUser.avatar || null);

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
            <Text style={styles.title}>Edit Profile</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Avatar */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Profile Picture</Text>
              <TouchableOpacity
                style={styles.avatarButton}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                {displayAvatar ? (
                  <View style={styles.avatarImageContainer}>
                    <Image 
                      source={{ uri: displayAvatar }} 
                      style={styles.avatarImage}
                      resizeMode="cover"
                    />
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
                    {avatar && (
                      <View style={styles.newImageBadge}>
                        <Text style={styles.newImageBadgeText}>New</Text>
                      </View>
                    )}
                  </View>
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <Ionicons name="camera-outline" size={32} color="#6b7280" />
                    <Text style={styles.avatarPlaceholderText}>Tap to add photo</Text>
                  </View>
                )}
              </TouchableOpacity>
              {avatar && (
                <Text style={styles.helperText}>New photo selected. Click "Save Changes" to update your profile picture.</Text>
              )}
            </View>

            {/* Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Full Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter full name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
                autoCapitalize="words"
              />
            </View>

            {/* Email (Read-only) */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={[styles.input, styles.inputDisabled]}
                value={initialUser.email}
                editable={false}
                placeholderTextColor="#9ca3af"
              />
              <Text style={styles.helperText}>
                Email cannot be changed
              </Text>
            </View>

            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter phone number"
                placeholderTextColor="#9ca3af"
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
              />
            </View>
          </ScrollView>

          {/* Footer Buttons */}
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
                {isLoading ? "Saving..." : "Save Changes"}
              </Text>
            </TouchableOpacity>
          </View>
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
  inputDisabled: {
    backgroundColor: "#f3f4f6",
    color: "#6b7280",
  },
  helperText: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  avatarButton: {
    width: "100%",
    alignItems: "center",
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "#f9fafb",
    borderWidth: 2,
    borderColor: "#e5e7eb",
    borderStyle: "dashed",
    alignItems: "center",
    justifyContent: "center",
  },
  avatarPlaceholderText: {
    marginTop: 8,
    fontSize: 12,
    color: "#6b7280",
  },
  avatarImageContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    position: "relative",
    overflow: "hidden",
    backgroundColor: "#f3f4f6",
    borderWidth: 2,
    borderColor: "#e5e7eb",
  },
  avatarImage: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f3f4f6",
  },
  removeImageButton: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 4,
  },
  newImageBadge: {
    position: "absolute",
    bottom: 4,
    left: 4,
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  newImageBadgeText: {
    color: "#ffffff",
    fontSize: 10,
    fontWeight: "600",
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
});

