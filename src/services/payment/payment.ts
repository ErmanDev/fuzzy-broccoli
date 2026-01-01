/**
 * Mock Payment Service
 * Simulates payment processing for testing and demo purposes.
 * Uses the same interface as real payment providers for easy migration.
 */

import { CHECKOUT_FAILED_URL, CHECKOUT_SUCCESS_URL, MOCK_PAYMENT_CONFIG } from '../../config/payment';

export type PaymentMethod = 'gcash' | 'grab_pay' | 'card' | 'paymaya';

export type CheckoutSessionLineItem = {
  name: string;
  quantity: number;
  amount: number; // Amount in centavos (PHP * 100)
};

export type CreateCheckoutSessionParams = {
  lineItems: CheckoutSessionLineItem[];
  successUrl: string;
  cancelUrl: string;
  description?: string;
  metadata?: Record<string, string>;
};

export type CheckoutSession = {
  id: string;
  type: string;
  attributes: {
    checkout_url: string;
    status: 'pending' | 'paid' | 'unpaid' | 'cancelled';
    payment_intent_id?: string;
    payment_method?: PaymentMethod;
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, string>;
    created_at: number;
    updated_at: number;
  };
};

// In-memory storage for mock sessions
const mockSessions: Map<string, CheckoutSession> = new Map();

/**
 * Generate a mock session ID
 */
function generateSessionId(): string {
  return `mock_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generate a mock payment intent ID
 */
function generatePaymentIntentId(): string {
  return `mock_pi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Create a mock checkout session
 */
export async function createCheckoutSession(
  params: CreateCheckoutSessionParams
): Promise<CheckoutSession> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));

  const sessionId = generateSessionId();
  const totalAmount = params.lineItems.reduce((sum, item) => sum + item.amount, 0);

  // Create mock checkout URL with session ID
  // In a real scenario, this would be a hosted payment page
  // For mock, we'll use a data URL with HTML that simulates payment
  const checkoutUrl = createMockCheckoutPage(sessionId, params.successUrl, params.cancelUrl);

  const session: CheckoutSession = {
    id: sessionId,
    type: 'checkout_session',
    attributes: {
      checkout_url: checkoutUrl,
      status: 'pending',
      amount: totalAmount,
      currency: 'PHP',
      description: params.description || 'E-Grocery Order',
      metadata: params.metadata || {},
      created_at: Date.now(),
      updated_at: Date.now(),
    },
  };

  // Store session for later retrieval
  mockSessions.set(sessionId, session);

  return session;
}

/**
 * Get checkout session details by ID
 */
export async function getCheckoutSession(sessionId: string): Promise<CheckoutSession> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 300));

  const session = mockSessions.get(sessionId);
  if (!session) {
    throw new Error(`Checkout session ${sessionId} not found`);
  }

  return session;
}

/**
 * Verify payment status from checkout session
 * For mock payments, if session is still pending when verifying from success URL,
 * we automatically mark it as paid (simulating payment completion)
 */
export async function verifyPayment(sessionId: string): Promise<{
  isPaid: boolean;
  paymentIntentId?: string;
  paymentMethod?: PaymentMethod;
  status: string;
}> {
  try {
    const session = await getCheckoutSession(sessionId);
    
    // For mock payments: if we're verifying and session is still pending,
    // it means user completed payment, so mark it as paid
    if (session.attributes.status === 'pending') {
      const paymentMethods: PaymentMethod[] = ['gcash', 'grab_pay', 'card', 'paymaya'];
      const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      markSessionAsPaid(sessionId, randomMethod);
      
      // Get updated session
      const updatedSession = await getCheckoutSession(sessionId);
      return {
        isPaid: updatedSession.attributes.status === 'paid',
        paymentIntentId: updatedSession.attributes.payment_intent_id,
        paymentMethod: updatedSession.attributes.payment_method,
        status: updatedSession.attributes.status,
      };
    }
    
    return {
      isPaid: session.attributes.status === 'paid',
      paymentIntentId: session.attributes.payment_intent_id,
      paymentMethod: session.attributes.payment_method,
      status: session.attributes.status,
    };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw error;
  }
}

/**
 * Helper to convert PHP amount to centavos
 */
export function phpToCentavos(phpAmount: number): number {
  return Math.round(phpAmount * 100);
}

/**
 * Helper to create checkout session with default success/cancel URLs
 */
export async function createCheckoutSessionWithDefaults(
  lineItems: CheckoutSessionLineItem[],
  orderId?: string
): Promise<CheckoutSession> {
  const metadata: Record<string, string> = {};
  if (orderId) {
    metadata.orderId = orderId;
  }

  return createCheckoutSession({
    lineItems,
    successUrl: `${CHECKOUT_SUCCESS_URL}?session_id={CHECKOUT_SESSION_ID}`,
    cancelUrl: CHECKOUT_FAILED_URL,
    description: 'E-Grocery Order',
    metadata,
  });
}

/**
 * Create a mock checkout page as data URL
 * This simulates a payment page that the user interacts with
 */
function createMockCheckoutPage(sessionId: string, successUrl: string, cancelUrl: string): string {
  // Replace placeholder with actual session ID in success URL
  const actualSuccessUrl = successUrl.replace('{CHECKOUT_SESSION_ID}', sessionId);
  
  // Determine if payment should succeed based on success rate
  const shouldSucceed = Math.random() < MOCK_PAYMENT_CONFIG.SUCCESS_RATE;
  
  // Random payment method for demo
  const paymentMethods: PaymentMethod[] = ['gcash', 'grab_pay', 'card', 'paymaya'];
  const randomMethod = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];

  // Create HTML page that simulates payment processing
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Mock Payment Checkout</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 16px;
      padding: 40px;
      max-width: 400px;
      width: 100%;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      text-align: center;
    }
    h1 { color: #333; margin-bottom: 10px; font-size: 24px; }
    p { color: #666; margin-bottom: 30px; line-height: 1.6; }
    .spinner {
      border: 4px solid #f3f3f3;
      border-top: 4px solid #22c55e;
      border-radius: 50%;
      width: 50px;
      height: 50px;
      animation: spin 1s linear infinite;
      margin: 20px auto;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    .button {
      background: #22c55e;
      color: white;
      border: none;
      padding: 14px 28px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: 600;
      cursor: pointer;
      width: 100%;
      margin-top: 20px;
      transition: background 0.2s;
    }
    .button:hover { background: #16a34a; }
    .button:disabled { background: #9ca3af; cursor: not-allowed; }
    .cancel-button {
      background: #f3f4f6;
      color: #6b7280;
      margin-top: 10px;
    }
    .cancel-button:hover { background: #e5e7eb; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Mock Payment Checkout</h1>
    <p>This is a simulated payment page for testing purposes.</p>
    <div class="spinner" id="spinner"></div>
    <p id="status">Processing payment...</p>
    <button class="button" id="completeBtn" onclick="completePayment()" style="display: none;">
      Complete Payment
    </button>
    <button class="button cancel-button" onclick="cancelPayment()">
      Cancel Payment
    </button>
  </div>
  <script>
    const sessionId = '${sessionId}';
    const successUrl = '${actualSuccessUrl}';
    const cancelUrl = '${cancelUrl}';
    const shouldSucceed = ${shouldSucceed};
    const paymentMethod = '${randomMethod}';
    
    // Simulate payment processing
    setTimeout(() => {
      document.getElementById('spinner').style.display = 'none';
      document.getElementById('status').textContent = shouldSucceed 
        ? 'Payment ready! Click to complete.' 
        : 'Payment will fail. Click to test failure.';
      document.getElementById('completeBtn').style.display = 'block';
    }, ${MOCK_PAYMENT_CONFIG.PROCESSING_DELAY});
    
    function completePayment() {
      if (shouldSucceed) {
        // Redirect to success URL
        // The session will be marked as paid when verifyPayment is called
        window.location.href = successUrl;
      } else {
        // Simulate failure - redirect to cancel URL
        // Session will remain pending (not paid)
        window.location.href = cancelUrl;
      }
    }
    
    function cancelPayment() {
      window.location.href = cancelUrl;
    }
    
    // Auto-complete after delay for better UX
    setTimeout(() => {
      if (shouldSucceed && document.getElementById('completeBtn').style.display !== 'none') {
        completePayment();
      }
    }, ${MOCK_PAYMENT_CONFIG.PROCESSING_DELAY + 1000});
  </script>
</body>
</html>
  `.trim();

  // Convert to data URL
  return `data:text/html;charset=utf-8,${encodeURIComponent(html)}`;
}

/**
 * Mark a session as paid (called from mock checkout page)
 * This simulates the payment completion
 */
export function markSessionAsPaid(sessionId: string, paymentMethod: PaymentMethod = 'card'): void {
  const session = mockSessions.get(sessionId);
  if (session) {
    session.attributes.status = 'paid';
    session.attributes.payment_intent_id = generatePaymentIntentId();
    session.attributes.payment_method = paymentMethod;
    session.attributes.updated_at = Date.now();
    mockSessions.set(sessionId, session);
  }
}

