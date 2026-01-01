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
import type { StoreOwnerProduct } from "../models/types/store-owner-product";

type AddProductOverlayProps = {
  visible: boolean;
  onClose: () => void;
  onSubmit: (product: Omit<StoreOwnerProduct, "id">) => void;
  categories: string[];
};

const AVAILABLE_CATEGORIES = [
  "Fruits",
  "Vegetables",
  "Dairy",
  "Meat",
  "Snacks",
  "Drinks",
  "Bakery",
  "Frozen",
];

export function AddProductOverlay({
  visible,
  onClose,
  onSubmit,
  categories,
}: AddProductOverlayProps) {
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [category, setCategory] = useState("");
  const [stock, setStock] = useState("");
  const [description, setDescription] = useState("");
  const [tag, setTag] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [imageUri, setImageUri] = useState<string | null>(null);

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
        setImageUri(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Failed to pick image");
    }
  };

  const handleRemoveImage = () => {
    setImageUri(null);
  };

  const handleSubmit = () => {
    // Validation
    if (!name.trim()) {
      Alert.alert("Error", "Product name is required");
      return;
    }
    if (!price.trim()) {
      Alert.alert("Error", "Price is required");
      return;
    }
    if (!category) {
      Alert.alert("Error", "Category is required");
      return;
    }
    if (!stock.trim() || isNaN(Number(stock)) || Number(stock) < 0) {
      Alert.alert("Error", "Valid stock quantity is required");
      return;
    }

    // Format price with peso sign if not already present
    const formattedPrice = price.startsWith("₱") ? price : `₱${price}`;

    onSubmit({
      name: name.trim(),
      price: formattedPrice,
      category,
      stock: Number(stock),
      isActive,
      description: description.trim() || undefined,
      tag: tag.trim() || undefined,
      imageUrl: imageUri || undefined,
    });

    // Reset form
    setName("");
    setPrice("");
    setCategory("");
    setStock("");
    setDescription("");
    setTag("");
    setIsActive(true);
    setImageUri(null);
    onClose();
  };

  const handleClose = () => {
    // Reset form on close
    setName("");
    setPrice("");
    setCategory("");
    setStock("");
    setDescription("");
    setTag("");
    setIsActive(true);
    setImageUri(null);
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
            <Text style={styles.title}>Add New Product</Text>
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#6b7280" />
            </TouchableOpacity>
          </View>

          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            {/* Product Image */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Product Image (Optional)</Text>
              <TouchableOpacity
                style={styles.imagePicker}
                onPress={handlePickImage}
                activeOpacity={0.8}
              >
                {imageUri ? (
                  <View style={styles.imagePreviewContainer}>
                    <Image source={{ uri: imageUri }} style={styles.imagePreview} />
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
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={32} color="#6b7280" />
                    <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            {/* Product Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Product Name *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter product name"
                placeholderTextColor="#9ca3af"
                value={name}
                onChangeText={setName}
              />
            </View>

            {/* Price */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Price *</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.currencySymbol}>₱</Text>
                <TextInput
                  style={styles.priceInput}
                  placeholder="0.00"
                  placeholderTextColor="#9ca3af"
                  value={price}
                  onChangeText={setPrice}
                  keyboardType="decimal-pad"
                />
              </View>
            </View>

            {/* Category */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Category *</Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.categoryRow}
              >
                {AVAILABLE_CATEGORIES.map((cat) => {
                  const isSelected = category === cat;
                  return (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.categoryChip,
                        isSelected && styles.categoryChipActive,
                      ]}
                      onPress={() => setCategory(cat)}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.categoryChipText,
                          isSelected && styles.categoryChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Stock */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Stock Quantity *</Text>
              <TextInput
                style={styles.input}
                placeholder="Enter stock quantity"
                placeholderTextColor="#9ca3af"
                value={stock}
                onChangeText={setStock}
                keyboardType="number-pad"
              />
            </View>

            {/* Tag */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Tag (Optional)</Text>
              <TextInput
                style={styles.input}
                placeholder="e.g., Best Seller, Organic, New"
                placeholderTextColor="#9ca3af"
                value={tag}
                onChangeText={setTag}
              />
            </View>

            {/* Description */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description (Optional)</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                placeholder="Enter product description"
                placeholderTextColor="#9ca3af"
                value={description}
                onChangeText={setDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </View>

            {/* Active Status */}
            <View style={styles.inputContainer}>
              <View style={styles.switchContainer}>
                <View>
                  <Text style={styles.label}>Product Status</Text>
                  <Text style={styles.switchSubtext}>
                    {isActive ? "Product will be visible to customers" : "Product will be hidden"}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[
                    styles.toggleSwitch,
                    isActive && styles.toggleSwitchActive,
                  ]}
                  onPress={() => setIsActive(!isActive)}
                  activeOpacity={0.7}
                >
                  <View
                    style={[
                      styles.toggleCircle,
                      isActive && styles.toggleCircleActive,
                    ]}
                  />
                </TouchableOpacity>
              </View>
            </View>
          </ScrollView>

          {/* Footer Buttons */}
          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={handleClose}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.submitButton}
              onPress={handleSubmit}
              activeOpacity={0.8}
            >
              <Text style={styles.submitButtonText}>Add Product</Text>
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
  textArea: {
    minHeight: 100,
    textAlignVertical: "top",
  },
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    paddingHorizontal: 16,
  },
  currencySymbol: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginRight: 8,
  },
  priceInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
  },
  categoryRow: {
    gap: 8,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    marginRight: 8,
  },
  categoryChipActive: {
    backgroundColor: "#22c55e",
    borderColor: "#22c55e",
  },
  categoryChipText: {
    fontSize: 14,
    color: "#6b7280",
    fontWeight: "500",
  },
  categoryChipTextActive: {
    color: "#ffffff",
  },
  switchContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  switchSubtext: {
    fontSize: 12,
    color: "#6b7280",
    marginTop: 4,
  },
  toggleSwitch: {
    width: 50,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#d1d5db",
    justifyContent: "center",
    padding: 2,
  },
  toggleSwitchActive: {
    backgroundColor: "#22c55e",
  },
  toggleCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#ffffff",
    alignSelf: "flex-start",
  },
  toggleCircleActive: {
    alignSelf: "flex-end",
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
  submitButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#ffffff",
  },
  imagePicker: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    overflow: "hidden",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  imagePreviewContainer: {
    width: "100%",
    height: "100%",
    position: "relative",
  },
  imagePreview: {
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
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  imagePlaceholderText: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
  },
});

