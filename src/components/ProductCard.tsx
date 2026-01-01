import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useCartAnimation } from "../contexts/CartAnimationContext";
import type { Product } from "../models/types/product";

export type ProductCardProps = {
  product: Product;
  onAddToCart?: (product: Product) => void;
};

export function ProductCard({ product, onAddToCart }: ProductCardProps) {
  const { name, price, tag, imageUrl } = product;
  const { triggerAnimation, getCartIconPosition } = useCartAnimation();
  const buttonRef = React.useRef<View>(null);

  const handleAddToCart = () => {
    // Measure button position
    buttonRef.current?.measureInWindow((x: number, y: number, width: number, height: number) => {
      const buttonCenterX = x + width / 2;
      const buttonCenterY = y + height / 2;

      // Get cart icon position
      const cartPosition = getCartIconPosition();

      // Trigger animation
      triggerAnimation({
        startX: buttonCenterX - 20, // Center of animated icon (40px width / 2)
        startY: buttonCenterY - 20, // Center of animated icon (40px height / 2)
        endX: cartPosition.x - 20,
        endY: cartPosition.y - 20,
      });

      // Add to cart after a small delay to sync with animation
      setTimeout(() => {
        onAddToCart?.(product);
      }, 100);
    });
  };

  return (
    <View style={styles.card}>
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Ionicons name="image-outline" size={32} color="#d1d5db" />
          </View>
        )}
      {tag ? (
        <View style={styles.tag}>
          <Text style={styles.tagText}>{tag}</Text>
        </View>
      ) : null}
      </View>

      <View style={styles.content}>
        <Text style={styles.name} numberOfLines={2}>
          {String(name || "")}
        </Text>
      <Text style={styles.price}>{String(price || "")}</Text>

      <View ref={buttonRef} collapsable={false}>
        <TouchableOpacity
          style={styles.addButton}
          onPress={handleAddToCart}
          activeOpacity={0.8}
        >
            <Ionicons name="add" size={16} color="#f9fafb" />
            <Text style={styles.addButtonText}>Add</Text>
        </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: "48%",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  imageContainer: {
    position: "relative",
    width: "100%",
    height: 120,
    backgroundColor: "#f9fafb",
  },
  image: {
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
  tag: {
    position: "absolute",
    top: 8,
    left: 8,
    backgroundColor: "#dcfce7",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 10,
    color: "#166534",
    fontWeight: "700",
  },
  content: {
    padding: 12,
  },
  name: {
    fontSize: 14,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 6,
    minHeight: 36,
  },
  price: {
    fontSize: 16,
    fontWeight: "700",
    color: "#16a34a",
    marginBottom: 10,
  },
  addButton: {
    backgroundColor: "#22c55e",
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 4,
  },
  addButtonText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#f9fafb",
  },
});
