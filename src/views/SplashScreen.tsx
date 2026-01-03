import { useEffect, useRef } from "react";
import { Animated, Image, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { useAuth } from "../contexts/AuthContext";

/**
 * SplashScreen View Component
 * Shows the app branding before navigating to the appropriate screen
 */
export function SplashScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  // Fade-in animation for the icon
  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, [fadeAnim]);

  useEffect(() => {
    // Wait for auth to finish loading
    if (isLoading) return;

    // Navigate after a short delay to show the splash screen
    const timer = setTimeout(() => {
      if (isAuthenticated) {
        // User is logged in, navigate based on role
        if (user?.role === "admin") {
          router.replace("/admin/dashboard");
        } else if (user?.role === "storeOwner") {
          router.replace("/store-owner/dashboard");
        } else {
          router.replace("/");
        }
      } else {
        // User is not logged in, go to login
        router.replace("/login");
      }
    }, 2000); // Show splash for 2 seconds

    return () => clearTimeout(timer);
  }, [isLoading, isAuthenticated, user, router]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.brandContainer}>
          <Animated.View style={[styles.brandIcon, { opacity: fadeAnim }]}>
            <Image
              source={require("../../assets/images/icon.png")}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </Animated.View>
          <Text style={styles.brandName}>E-GROCERY</Text>
          <Text style={styles.brandTagline}>Fresh groceries, ready for pickup</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffff",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  brandContainer: {
    alignItems: "center",
  },
  brandIcon: {
    width: 120,
    height: 120,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  logoImage: {
    width: 120,
    height: 120,
  },
  brandName: {
    fontSize: 42,
    fontWeight: "800",
    color: "#22c55e",
    letterSpacing: 3,
    marginBottom: 12,
  },
  brandTagline: {
    fontSize: 16,
    color: "#6b7280",
    fontWeight: "500",
  },
});



