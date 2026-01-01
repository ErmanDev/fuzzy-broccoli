/**
 * Navigation helpers that abstract Expo Router navigation primitives
 * Use these functions in controllers and views instead of directly importing Expo Router APIs
 */

import { router } from "expo-router";
import { Routes, Route } from "./routes";

/**
 * Navigate to a specific route
 */
export function navigateTo(route: Route) {
  router.push(route as any);
}

/**
 * Navigate back
 */
export function goBack() {
  router.back();
}

/**
 * Replace current route
 */
export function replaceRoute(route: Route) {
  router.replace(route as any);
}

/**
 * Navigate to home screen
 */
export function goToHome() {
  navigateTo(Routes.HOME);
}

/**
 * Navigate to profile screen
 */
export function goToProfile() {
  navigateTo(Routes.PROFILE);
}

/**
 * Navigate to cart screen
 */
export function goToCart() {
  navigateTo(Routes.CART);
}

/**
 * Navigate to store screen
 */
export function goToStore() {
  navigateTo(Routes.STORE);
}

/**
 * Navigate to login screen
 */
export function goToLogin() {
  navigateTo(Routes.LOGIN);
}

/**
 * Navigate to register screen
 */
export function goToRegister() {
  navigateTo(Routes.REGISTER);
}

/**
 * Navigate to store owner dashboard
 */
export function goToStoreOwnerDashboard() {
  navigateTo(Routes.STORE_OWNER_DASHBOARD);
}

/**
 * Navigate to store owner products
 */
export function goToStoreOwnerProducts() {
  navigateTo(Routes.STORE_OWNER_PRODUCTS);
}

/**
 * Navigate to store owner orders
 */
export function goToStoreOwnerOrders() {
  navigateTo(Routes.STORE_OWNER_ORDERS);
}

/**
 * Navigate to store owner settings
 */
export function goToStoreOwnerSettings() {
  navigateTo(Routes.STORE_OWNER_SETTINGS);
}

/**
 * Navigate to store owner profile
 */
export function goToStoreOwnerProfile() {
  navigateTo(Routes.STORE_OWNER_PROFILE);
}

/**
 * Navigate to admin dashboard
 */
export function goToAdminDashboard() {
  navigateTo(Routes.ADMIN_DASHBOARD);
}

/**
 * Navigate to admin stores
 */
export function goToAdminStores() {
  navigateTo(Routes.ADMIN_STORES);
}

/**
 * Navigate to admin users
 */
export function goToAdminUsers() {
  navigateTo(Routes.ADMIN_USERS);
}

/**
 * Navigate to admin orders
 */
export function goToAdminOrders() {
  navigateTo(Routes.ADMIN_ORDERS);
}

/**
 * Navigate to admin profile
 */
export function goToAdminProfile() {
  navigateTo(Routes.ADMIN_PROFILE);
}

