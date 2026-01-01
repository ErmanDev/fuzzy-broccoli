/**
 * Payment Configuration
 * 
 * Mock payment system configuration for testing and demo purposes.
 * This simulates payment processing without requiring external payment APIs.
 */

// Deep link URLs for payment callbacks
export const CHECKOUT_SUCCESS_URL = 'egrocery://checkout-success';
export const CHECKOUT_FAILED_URL = 'egrocery://checkout-failed';

// Mock payment settings
export const MOCK_PAYMENT_CONFIG = {
  // Simulated processing delay in milliseconds
  PROCESSING_DELAY: 2000,
  
  // Success rate (0.0 to 1.0) - for testing different scenarios
  // Set to 1.0 for always successful, 0.0 for always failed
  SUCCESS_RATE: 0.9,
  
  // Mock checkout page URL (will be served locally)
  CHECKOUT_PAGE_URL: 'http://localhost:8080/mock-checkout',
};

