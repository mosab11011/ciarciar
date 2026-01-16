import { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { createCheckoutSession } from '@/services/payments';
import { Button } from '@/components/ui/button';

interface PaymentButtonProps {
  amount: number; // major units (e.g., 49.99)
  currency?: string; // default USD
  description?: string;
  metadata?: Record<string, any>;
  customerEmail?: string | null;
  paymentMethodTypes?: string[];
  className?: string;
  children?: React.ReactNode;
}

export default function PaymentButton({ amount, currency = 'USD', description = 'Tarhal Payment', metadata = {}, customerEmail = null, paymentMethodTypes, className, children }: PaymentButtonProps) {
  const [loading, setLoading] = useState(false);
  const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

  const handlePay = async () => {
    try {
      setLoading(true);

      const { sessionId, url } = await createCheckoutSession({ amount, currency, description, metadata, customer_email: customerEmail || undefined, payment_method_types: paymentMethodTypes });

      if (!publishableKey) {
        if (url) {
          window.location.href = url;
          return;
        }
        throw new Error('Stripe is not configured');
      }

      const stripe = await loadStripe(publishableKey);
      if (!stripe) throw new Error('Stripe failed to load');

      const { error } = await stripe.redirectToCheckout({ sessionId });
      if (error) throw error;
    } catch (e: any) {
      alert(e?.message || 'Payment failed to start');
    } finally {
      setLoading(false);
    }
  };

  const disabled = !amount || amount <= 0 || loading;
  const label = children || 'ادفع الآن';

  return (
    <Button onClick={handlePay} disabled={disabled} className={className}>
      {loading ? 'جاري المعالجة...' : label}
    </Button>
  );
}
