import { Ionicons } from "@expo/vector-icons";
import { Tabs, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, LogBox, StyleSheet, Text, View } from "react-native";
import { AuthProvider, useAuth } from "../src/contexts/AuthContext";
import { CartAnimationProvider } from "../src/contexts/CartAnimationContext";
import { CartProvider, useCart } from "../src/contexts/CartContext";
import { OrderTrackingProvider } from "../src/contexts/OrderTrackingContext";

// Suppress harmless Firestore WebChannelConnection warnings
// These occur during normal connection resets and don't affect functionality
LogBox.ignoreLogs([
  'WebChannelConnection RPC',
  '@firebase/firestore: WebChannelConnection',
]);

function CartIconWithBadge({ color, size }: { color: string; size: number }) {
  const { getTotalItems } = useCart();
  const itemCount = getTotalItems();

  return (
    <View style={styles.iconContainer}>
      <Ionicons name="cart-outline" size={size} color={color} />
      {itemCount > 0 && (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>
            {itemCount > 99 ? "99+" : itemCount}
          </Text>
        </View>
      )}
    </View>
  );
}

function RootLayoutContent() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const currentRoute = segments[0];
    const isAuthRoute = currentRoute === "login" || currentRoute === "register";
    const isSplashRoute = currentRoute === "splash";

    // If on splash, let it handle navigation
    if (isSplashRoute) return;

    // Redirect to splash if not already on a valid route
    if (!isAuthRoute && !isAuthenticated) {
      // Only redirect to splash if we're not already on a valid route
      // This prevents infinite loops
      if (currentRoute !== "splash") {
        router.replace("/splash");
      }
    } else if (isAuthenticated && isAuthRoute) {
      if (user?.role === "admin") {
        router.replace("/admin/dashboard");
      } else if (user?.role === "storeOwner") {
        router.replace("/store-owner/dashboard");
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isLoading, segments, user, router]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#22c55e" />
      </View>
    );
  }

  const currentRoute = segments[0];
  const isAuthRoute = currentRoute === "login" || currentRoute === "register";

  // 1. Auth Flow
  if (!isAuthenticated) {
    return (
      <Tabs screenOptions={{ headerShown: false, tabBarStyle: { display: "none" } }}>
        <Tabs.Screen name="splash" />
        <Tabs.Screen name="login" />
        <Tabs.Screen name="register" />
      </Tabs>
    );
  }

  // 2. Admin Flow
  if (user?.role === "admin") {
    return (
      <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#22c55e" }}>
        <Tabs.Screen name="admin/dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="admin/stores" options={{ title: "Stores", tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="admin/users" options={{ title: "Users", tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="admin/profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
        {/* Hide all other routes */}
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="store" options={{ href: null }} />
        <Tabs.Screen name="cart" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="add-address" options={{ href: null }} />
        <Tabs.Screen name="store-products" options={{ href: null }} />
        <Tabs.Screen name="store-owner/dashboard" options={{ href: null }} />
        <Tabs.Screen name="store-owner/products" options={{ href: null }} />
        <Tabs.Screen name="store-owner/orders" options={{ href: null }} />
        <Tabs.Screen name="store-owner/settings" options={{ href: null }} />
        <Tabs.Screen name="store-owner/profile" options={{ href: null }} />
        <Tabs.Screen name="admin/orders" options={{ href: null }} />
        <Tabs.Screen name="checkout" options={{ href: null }} />
        <Tabs.Screen name="checkout-success" options={{ href: null }} />
        <Tabs.Screen name="checkout-failed" options={{ href: null }} />
        <Tabs.Screen name="order-tracking" options={{ href: null }} />
        <Tabs.Screen name="order-history" options={{ href: null }} />
      <Tabs.Screen name="splash" options={{ href: null }} />
        <Tabs.Screen name="login" options={{ href: null }} />
        <Tabs.Screen name="register" options={{ href: null }} />
      </Tabs>
    );
  }

  // 3. Store Owner Flow
  if (user?.role === "storeOwner") {
    return (
      <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#22c55e" }}>
        <Tabs.Screen name="store-owner/dashboard" options={{ title: "Dashboard", tabBarIcon: ({ color, size }) => <Ionicons name="grid-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="store-owner/products" options={{ title: "Products", tabBarIcon: ({ color, size }) => <Ionicons name="cube-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="store-owner/orders" options={{ title: "Orders", tabBarIcon: ({ color, size }) => <Ionicons name="receipt-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="store-owner/settings" options={{ title: "Settings", tabBarIcon: ({ color, size }) => <Ionicons name="settings-outline" size={size} color={color} /> }} />
        <Tabs.Screen name="store-owner/profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
        {/* Hide all other routes */}
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="store" options={{ href: null }} />
        <Tabs.Screen name="cart" options={{ href: null }} />
        <Tabs.Screen name="profile" options={{ href: null }} />
        <Tabs.Screen name="add-address" options={{ href: null }} />
        <Tabs.Screen name="store-products" options={{ href: null }} />
        <Tabs.Screen name="admin/dashboard" options={{ href: null }} />
        <Tabs.Screen name="admin/stores" options={{ href: null }} />
        <Tabs.Screen name="admin/users" options={{ href: null }} />
        <Tabs.Screen name="admin/orders" options={{ href: null }} />
        <Tabs.Screen name="admin/profile" options={{ href: null }} />
        <Tabs.Screen name="checkout" options={{ href: null }} />
        <Tabs.Screen name="checkout-success" options={{ href: null }} />
        <Tabs.Screen name="checkout-failed" options={{ href: null }} />
        <Tabs.Screen name="order-tracking" options={{ href: null }} />
        <Tabs.Screen name="order-history" options={{ href: null }} />
        <Tabs.Screen name="splash" options={{ href: null }} />
        <Tabs.Screen name="login" options={{ href: null }} />
        <Tabs.Screen name="register" options={{ href: null }} />
      </Tabs>
    );
  }

  // 4. Default Customer Flow
  return (
    <Tabs screenOptions={{ headerShown: false, tabBarActiveTintColor: "#22c55e" }}>
      <Tabs.Screen name="index" options={{ title: "Home", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="store" options={{ title: "Store", tabBarIcon: ({ color, size }) => <Ionicons name="storefront-outline" size={size} color={color} /> }} />
      <Tabs.Screen name="cart" options={{ title: "Cart", tabBarIcon: ({ color, size }) => <CartIconWithBadge color={color} size={size} /> }} />
      <Tabs.Screen name="profile" options={{ title: "Profile", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={color} /> }} />
      {/* Hide management routes */}
      <Tabs.Screen name="add-address" options={{ href: null }} />
      <Tabs.Screen name="store-products" options={{ href: null }} />
      <Tabs.Screen name="store-owner/dashboard" options={{ href: null }} />
      <Tabs.Screen name="store-owner/products" options={{ href: null }} />
      <Tabs.Screen name="store-owner/orders" options={{ href: null }} />
      <Tabs.Screen name="store-owner/settings" options={{ href: null }} />
      <Tabs.Screen name="store-owner/profile" options={{ href: null }} />
      <Tabs.Screen name="admin/dashboard" options={{ href: null }} />
      <Tabs.Screen name="admin/stores" options={{ href: null }} />
      <Tabs.Screen name="admin/users" options={{ href: null }} />
      <Tabs.Screen name="admin/orders" options={{ href: null }} />
      <Tabs.Screen name="admin/profile" options={{ href: null }} />
      <Tabs.Screen name="checkout" options={{ href: null }} />
      <Tabs.Screen name="checkout-success" options={{ href: null }} />
      <Tabs.Screen name="checkout-failed" options={{ href: null }} />
      <Tabs.Screen name="order-tracking" options={{ href: null }} />
      <Tabs.Screen name="order-history" options={{ href: null }} />
      <Tabs.Screen name="splash" options={{ href: null }} />
      <Tabs.Screen name="login" options={{ href: null }} />
      <Tabs.Screen name="register" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  iconContainer: { position: "relative" },
  badge: {
    position: "absolute",
    top: -6,
    right: -8,
    backgroundColor: "#ef4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  badgeText: { color: "#ffffff", fontSize: 10, fontWeight: "700" },
  loadingContainer: { flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#f9fafb" },
});

export default function RootLayout() {
  return (
    <AuthProvider>
      <CartProvider>
        <CartAnimationProvider>
          <OrderTrackingProvider>
            <RootLayoutContent />
          </OrderTrackingProvider>
        </CartAnimationProvider>
      </CartProvider>
    </AuthProvider>
  );
}