export interface CreateCheckoutPayload {
  amount?: number; // major units (e.g., 10.50 USD)
  amount_cents?: number; // minor units
  currency?: string; // ISO code
  description?: string | null;
  metadata?: Record<string, any>;
  customer_email?: string | null;
  success_url?: string;
  cancel_url?: string;
  payment_method_types?: string[];
}

export async function createCheckoutSession(payload: CreateCheckoutPayload) {
  const res = await fetch('/api/payments/checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || 'Failed to create checkout session');
  }
  return data as { success: true; sessionId: string; url?: string; localPaymentId: string };
}
