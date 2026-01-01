import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { Store } from "../models/types/store";

export type StoreCardProps = {
  store: Store;
  onPress?: () => void;
};

export function StoreCard({ store, onPress }: StoreCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.imageContainer}>
        <View style={styles.storeLogo}>
          {store.logo ? (
            <Image
              source={{ uri: store.logo }}
              style={styles.storeLogoImage}
              resizeMode="cover"
            />
          ) : (
            <Text style={styles.storeLogoText}>{store.name.charAt(0)}</Text>
          )}
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={1}>
          {store.name}
        </Text>

        {store.rating !== undefined && store.rating !== null && (
          <View style={styles.ratingContainer}>
            <Ionicons name="star" size={14} color="#fbbf24" />
            <Text style={styles.rating}>{String(Number(store.rating).toFixed(1))}</Text>
          </View>
        )}

        {store.pickupTime && (
          <View style={styles.metaContainer}>
            <View style={styles.metaItem}>
              <Ionicons name="bag-outline" size={12} color="#6b7280" />
              <Text style={styles.metaText}>{store.pickupTime}</Text>
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    alignItems: "center",
    marginBottom: 12,
  },
  storeLogo: {
    width: 80,
    height: 80,
    borderRadius: 16,
    backgroundColor: "#22c55e",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  storeLogoImage: {
    width: "100%",
    height: "100%",
  },
  storeLogoText: {
    color: "#f9fafb",
    fontWeight: "700",
    fontSize: 32,
  },
  content: {
    alignItems: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "700",
    color: "#111827",
    marginBottom: 8,
    textAlign: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  rating: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginLeft: 4,
  },
  metaContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#6b7280",
  },
});

