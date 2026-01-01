import { Ionicons } from "@expo/vector-icons";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import type { CartItem as CartItemType } from "../models/types/cart";

export type CartItemProps = {
  item: CartItemType;
  onRemove: (productId: string) => void;
  onUpdateQuantity: (productId: string, quantity: number) => void;
};

export function CartItem({ item, onRemove, onUpdateQuantity }: CartItemProps) {
  const { product, quantity } = item;

  const handleDecrease = () => {
    if (quantity > 1) {
      onUpdateQuantity(product.id, quantity - 1);
    }
  };

  const handleIncrease = () => {
    onUpdateQuantity(product.id, quantity + 1);
  };

  return (
    <View style={styles.container}>
      <View style={styles.imageContainer}>
        {product.imageUrl ? (
          <Image
            source={{ uri: product.imageUrl }}
            style={styles.productImage}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={24} color="#9ca3af" />
          </View>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.price}>{product.price}</Text>
        {product.tag && (
          <View style={styles.tag}>
            <Text style={styles.tagText}>{product.tag}</Text>
          </View>
        )}
      </View>

      <View style={styles.actions}>
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleDecrease}
            activeOpacity={0.7}
            disabled={quantity <= 1}
          >
            <Ionicons
              name="remove-outline"
              size={18}
              color={quantity <= 1 ? "#d1d5db" : "#111827"}
            />
          </TouchableOpacity>
          <Text style={styles.quantityText}>{String(quantity)}</Text>
          <TouchableOpacity
            style={styles.quantityButton}
            onPress={handleIncrease}
            activeOpacity={0.7}
          >
            <Ionicons name="add-outline" size={18} color="#111827" />
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.removeButton}
          onPress={() => onRemove(product.id)}
          activeOpacity={0.7}
        >
          <Ionicons name="trash-outline" size={20} color="#ef4444" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  imageContainer: {
    width: 60,
    height: 60,
    borderRadius: 12,
    marginRight: 12,
    overflow: "hidden",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  imagePlaceholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#f3f4f6",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    justifyContent: "center",
  },
  name: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 4,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
    marginBottom: 4,
  },
  tag: {
    alignSelf: "flex-start",
    backgroundColor: "#dcfce7",
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "600",
  },
  actions: {
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    padding: 4,
  },
  quantityButton: {
    width: 28,
    height: 28,
    alignItems: "center",
    justifyContent: "center",
  },
  quantityText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#111827",
    minWidth: 24,
    textAlign: "center",
  },
  removeButton: {
    alignItems: "center",
    justifyContent: "center",
    padding: 8,
  },
});

