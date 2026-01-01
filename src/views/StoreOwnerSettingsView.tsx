import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Switch,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useStoreOwnerSettingsController } from "../controllers/useStoreOwnerSettingsController";

/**
 * Store Owner Settings View Component
 * This is the UI layer for store settings
 * Business logic is handled by the controller hook
 */
export function StoreOwnerSettingsView() {
  const { settings, handleUpdateStoreHours } = useStoreOwnerSettingsController();

  const days = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ] as const;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Store Settings</Text>
          <Text style={styles.subtitle}>Manage your store information</Text>
        </View>

        {/* Store Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Information</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Store Name</Text>
              <TextInput
                style={styles.input}
                value={settings.name}
                placeholder="Store name"
                placeholderTextColor="#9ca3af"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Description</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={settings.description}
                placeholder="Store description"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={3}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Pickup Time</Text>
              <TextInput
                style={styles.input}
                value={settings.pickupTime}
                placeholder="e.g., Ready in 30–45 min"
                placeholderTextColor="#9ca3af"
              />
            </View>
          </View>
        </View>

        {/* Contact Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <View style={styles.card}>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone</Text>
              <TextInput
                style={styles.input}
                value={settings.contactInfo?.phone}
                placeholder="Phone number"
                placeholderTextColor="#9ca3af"
                keyboardType="phone-pad"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email</Text>
              <TextInput
                style={styles.input}
                value={settings.contactInfo?.email}
                placeholder="Email address"
                placeholderTextColor="#9ca3af"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Address</Text>
              <TextInput
                style={[styles.input, styles.textArea]}
                value={settings.contactInfo?.address}
                placeholder="Store address"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={2}
              />
            </View>
          </View>
        </View>

        {/* Store Hours */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Store Hours</Text>
          <View style={styles.card}>
            {days.map((day) => {
              const dayHours = settings.storeHours?.[day.key];
              return (
                <View key={day.key} style={styles.hoursRow}>
                  <View style={styles.hoursDay}>
                    <Text style={styles.hoursDayLabel}>{day.label}</Text>
                    <Switch
                      value={dayHours?.isOpen ?? false}
                      onValueChange={(isOpen) => {
                        handleUpdateStoreHours(day.key, {
                          open: dayHours?.open || "09:00",
                          close: dayHours?.close || "18:00",
                          isOpen,
                        });
                      }}
                      trackColor={{ false: "#d1d5db", true: "#22c55e" }}
                      thumbColor="#ffffff"
                    />
                  </View>
                  {dayHours?.isOpen && (
                    <View style={styles.hoursTime}>
                      <TextInput
                        style={styles.timeInput}
                        value={dayHours.open}
                        placeholder="09:00"
                        placeholderTextColor="#9ca3af"
                      />
                      <Text style={styles.hoursSeparator}>-</Text>
                      <TextInput
                        style={styles.timeInput}
                        value={dayHours.close}
                        placeholder="18:00"
                        placeholderTextColor="#9ca3af"
                      />
                    </View>
                  )}
                </View>
              );
            })}
          </View>
        </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} activeOpacity={0.8}>
          <Text style={styles.saveButtonText}>Save Changes</Text>
        </TouchableOpacity>
      </ScrollView>
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
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 12,
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  inputContainer: {
    marginBottom: 16,
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
    minHeight: 80,
    textAlignVertical: "top",
  },
  hoursRow: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  hoursRowLast: {
    marginBottom: 0,
    paddingBottom: 0,
    borderBottomWidth: 0,
  },
  hoursDay: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  hoursDayLabel: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
  },
  hoursTime: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  timeInput: {
    backgroundColor: "#f9fafb",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    width: 80,
  },
  hoursSeparator: {
    fontSize: 16,
    color: "#6b7280",
  },
  saveButton: {
    backgroundColor: "#22c55e",
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "700",
  },
});

