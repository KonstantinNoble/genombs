import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const CHECKOUT_BASE_URL = 'https://checkout.freemius.com/product/21730/plan/36437/';

export const useFreemiusCheckout = () => {
  const { user } = useAuth();

  const openCheckout = useCallback((email?: string) => {
    const userEmail = email || user?.email;
    
    // Email is required - redirect to auth page if missing
    if (!userEmail) {
      window.location.href = '/auth?intent=premium';
      return;
    }

    // Build checkout URL with email parameter (readonly_user makes email immutable)
    const checkoutUrl = new URL(CHECKOUT_BASE_URL);
    checkoutUrl.searchParams.set('user_email', userEmail);
    checkoutUrl.searchParams.set('readonly_user', 'true');
    
    // Open in same tab (temporarily replaces Synoptas page)
    window.location.href = checkoutUrl.toString();
  }, [user]);

  // Keep isLoaded and isLoading for backwards compatibility
  return { openCheckout, isLoaded: true, isLoading: false };
};
