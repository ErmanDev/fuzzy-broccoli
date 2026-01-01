import React, { createContext, useContext, useState, ReactNode, useRef, useEffect } from "react";
import { Animated, Dimensions, StyleSheet, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

type AnimationConfig = {
  startX: number;
  startY: number;
  endX: number;
  endY: number;
  onComplete?: () => void;
};

type CartAnimationContextType = {
  triggerAnimation: (config: AnimationConfig) => void;
  getCartIconPosition: () => { x: number; y: number };
};

const CartAnimationContext = createContext<CartAnimationContextType | undefined>(undefined);

export function CartAnimationProvider({ children }: { children: ReactNode }) {
  const [animationConfig, setAnimationConfig] = useState<AnimationConfig | null>(null);

  const triggerAnimation = (config: AnimationConfig) => {
    setAnimationConfig(config);
  };

  // Calculate cart icon position in bottom tab bar
  // Tab bar is typically at the bottom, and cart is the 3rd tab (index 2)
  // Each tab takes roughly SCREEN_WIDTH / 4 (4 tabs)
  const getCartIconPosition = () => {
    // Cart is the 3rd tab (0-indexed: 2)
    // Tab bar height is typically around 50-60px
    const tabBarHeight = 60;
    const tabWidth = SCREEN_WIDTH / 4;
    const cartTabCenterX = tabWidth * 2 + tabWidth / 2; // Center of 3rd tab
    const cartIconY = SCREEN_HEIGHT - tabBarHeight / 2; // Center of tab bar
    
    return {
      x: cartTabCenterX,
      y: cartIconY,
    };
  };

  return (
    <CartAnimationContext.Provider
      value={{
        triggerAnimation,
        getCartIconPosition,
      }}
    >
      {children}
      {animationConfig && (
        <CartAnimationOverlay
          config={animationConfig}
          onComplete={() => setAnimationConfig(null)}
        />
      )}
    </CartAnimationContext.Provider>
  );
}

function CartAnimationOverlay({
  config,
  onComplete,
}: {
  config: AnimationConfig;
  onComplete: () => void;
}) {
  const animatedValue = useRef(new Animated.Value(0)).current;
  const scaleValue = useRef(new Animated.Value(1)).current;
  const opacityValue = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Reset values
    animatedValue.setValue(0);
    scaleValue.setValue(1);
    opacityValue.setValue(1);

    // Create parallel animations
    Animated.parallel([
      // Position animation
      Animated.timing(animatedValue, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      // Scale animation - start small, grow, then shrink
      Animated.sequence([
        Animated.timing(scaleValue, {
          toValue: 1.2,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(scaleValue, {
          toValue: 0.5,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
      // Opacity animation - fade out at the end
      Animated.sequence([
        Animated.delay(400),
        Animated.timing(opacityValue, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
    ]).start(() => {
      config.onComplete?.();
      onComplete();
    });
  }, []);

  const translateX = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [config.startX, config.endX],
  });

  const translateY = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [config.startY, config.endY],
  });

  return (
    <View style={styles.overlay} pointerEvents="none">
      <Animated.View
        style={[
          styles.animatedIcon,
          {
            transform: [
              { translateX },
              { translateY },
              { scale: scaleValue },
            ],
            opacity: opacityValue,
          },
        ]}
      >
        <Ionicons name="cart" size={24} color="#22c55e" />
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 9999,
    pointerEvents: "none",
  },
  animatedIcon: {
    position: "absolute",
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#ffffff",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
});

export function useCartAnimation() {
  const context = useContext(CartAnimationContext);
  if (context === undefined) {
    throw new Error("useCartAnimation must be used within a CartAnimationProvider");
  }
  return context;
}

