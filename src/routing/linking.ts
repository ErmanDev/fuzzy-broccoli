/**
 * Helper functions for generating URLs/links
 * Useful for deep linking, sharing, and web compatibility
 */

import { Routes } from "./routes";

/**
 * Generate a deep link URL for a route
 */
export function generateDeepLink(route: string, params?: Record<string, string>): string {
  const baseUrl = "e-grocery://"; // Update with your actual scheme
  const url = new URL(route, baseUrl);
  
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  
  return url.toString();
}

/**
 * Generate a shareable link for a product or other resource
 */
export function generateShareLink(type: "product" | "cart" | "home", id?: string): string {
  const baseUrl = "https://your-app-domain.com"; // Update with your actual domain
  
  switch (type) {
    case "product":
      return `${baseUrl}/product/${id}`;
    case "cart":
      return `${baseUrl}/cart`;
    case "home":
    default:
      return baseUrl;
  }
}

