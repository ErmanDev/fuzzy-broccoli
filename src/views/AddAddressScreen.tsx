import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { useAddAddressController } from "../controllers/useAddAddressController";

/**
 * Add Address Screen View Component
 * This is the UI layer for adding a new address
 * Business logic is handled by the controller hook
 */
export function AddAddressScreen() {
  const {
    label,
    setLabel,
    address,
    setAddress,
    city,
    setCity,
    province,
    setProvince,
    postalCode,
    setPostalCode,
    isDefault,
    setIsDefault,
    error,
    setError,
    isLoading,
    handleAddAddress,
    resetForm,
  } = useAddAddressController();

  const { user } = useAuth();
  const router = useRouter();

  const handleSaveAddress = async () => {
    if (!user?.id) {
      Alert.alert("Error", "User not authenticated");
      return;
    }

    const success = await handleAddAddress(user.id);
    if (success) {
      Alert.alert("Success", "Address added successfully", [
        {
          text: "OK",
          onPress: () => {
            router.back();
          },
        },
      ]);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        {/* Header */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add New Address</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Error Message */}
          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{String(error)}</Text>
            </View>
          ) : null}

          {/* Label Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address Label *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Home, Work, Office"
              placeholderTextColor="#9ca3af"
              value={label}
              onChangeText={(text) => {
                setLabel(text);
                setError("");
              }}
              maxLength={20}
              editable={!isLoading}
            />
            <Text style={styles.helperText}>{label.length}/20</Text>
          </View>

          {/* Address Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Address *</Text>
            <TextInput
              style={[styles.input, { minHeight: 80 }]}
              placeholder="Enter street address"
              placeholderTextColor="#9ca3af"
              value={address}
              onChangeText={(text) => {
                setAddress(text);
                setError("");
              }}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
              editable={!isLoading}
            />
          </View>

          {/* City Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>City *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Cebu City"
              placeholderTextColor="#9ca3af"
              value={city}
              onChangeText={(text) => {
                setCity(text);
                setError("");
              }}
              editable={!isLoading}
            />
          </View>

          {/* Province Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Province/State *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., Cebu"
              placeholderTextColor="#9ca3af"
              value={province}
              onChangeText={(text) => {
                setProvince(text);
                setError("");
              }}
              editable={!isLoading}
            />
          </View>

          {/* Postal Code Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Postal Code *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g., 6000"
              placeholderTextColor="#9ca3af"
              value={postalCode}
              onChangeText={(text) => {
                setPostalCode(text);
                setError("");
              }}
              keyboardType="number-pad"
              editable={!isLoading}
            />
          </View>

          {/* Default Address Toggle */}
          <View style={styles.toggleContainer}>
            <Text style={styles.toggleLabel}>Set as default address</Text>
            <TouchableOpacity
              style={[
                styles.toggleButton,
                isDefault && styles.toggleButtonActive,
              ]}
              onPress={() => setIsDefault(!isDefault)}
              disabled={isLoading}
            >
              <View style={isDefault ? styles.toggleDot : styles.toggleDotInactive} />
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
            onPress={handleSaveAddress}
            disabled={isLoading}
          >
            <Text style={styles.saveButtonText}>
              {isLoading ? "Saving..." : "Save Address"}
            </Text>
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={() => router.back()}
            disabled={isLoading}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9fafb",
  },
  container: {
    flex: 1,
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  backButton: {
    padding: 8,
    marginLeft: -8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#111827",
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingVertical: 24,
  },
  errorContainer: {
    backgroundColor: "#fee2e2",
    borderRadius: 12,
    padding: 12,
    marginBottom: 20,
  },
  errorText: {
    color: "#dc2626",
    fontSize: 14,
    fontWeight: "500",
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  input: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  helperText: {
    fontSize: 12,
    color: "#9ca3af",
    marginTop: 4,
  },
  toggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingVertical: 12,
  },
  toggleLabel: {
    fontSize: 14,
    fontWeight: "500",
    color: "#111827",
  },
  toggleButton: {
    width: 50,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#e5e7eb",
    justifyContent: "center",
    paddingHorizontal: 2,
  },
  toggleButtonActive: {
    backgroundColor: "#22c55e",
  },
  toggleDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#22c55e",
    marginLeft: "auto",
  },
  toggleDotInactive: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ffffff",
  },
  saveButton: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginBottom: 12,
  },
  saveButtonDisabled: {
    backgroundColor: "#9ca3af",
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
  cancelButton: {
    backgroundColor: "#f3f4f6",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
  },
  cancelButtonText: {
    color: "#6b7280",
    fontSize: 16,
    fontWeight: "600",
  },
});
