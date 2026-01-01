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

type CreateStoreOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (storeName: string, pickupTime?: string, logo?: string) => void;
  isLoading?: boolean;
};

export function CreateStoreOverlay({
  visible,
  onClose,
  onSubmit,
  isLoading = false,
}: CreateStoreOverlayProps) {
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

  const translateY = slideAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [600, 0],
  });

  const handlePickImage = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission", "Permission to access camera roll is required!");
        return;
      }

      // Use string value for mediaTypes (MediaType enum may not be available in all versions)
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
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
    // Validation
    if (!storeName.trim()) {
      Alert.alert("Error", "Store name is required");
      return;
    }

    onSubmit(
      storeName.trim(),
      pickupTime.trim() || undefined,
      logo || undefined
    );

    // Reset form
    setStoreName("");
    setPickupTime("");
    setLogo(null);
  };

  const handleClose = () => {
    // Reset form on close
    setStoreName("");
    setPickupTime("");
    setLogo(null);
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
            <Text style={styles.title}>Create Store</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
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
                {isLoading ? "Creating..." : "Create Store"}
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
});

