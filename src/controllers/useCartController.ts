import { useMemo } from "react";
import { useCart } from "../contexts/CartContext";

/**
 * Cart Controller Hook
 * Handles business logic for cart screen including price calculations
 */

export function useCartController() {
  const { items } = useCart();

  const totalPrice = useMemo(() => {
    return items.reduce((total, item) => {
      // Extract numeric value from price string (e.g., "₱199" -> 199)
      const priceStr = item.product.price.replace(/[^0-9.]/g, "");
      const price = parseFloat(priceStr) || 0;
      return total + price * item.quantity;
    }, 0);
  }, [items]);

  const formattedTotal = useMemo(() => {
    return `₱${totalPrice.toFixed(0)}`;
  }, [totalPrice]);

  const itemCount = items.length;

  return {
    items,
    totalPrice,
    formattedTotal,
    itemCount,
  };
}

