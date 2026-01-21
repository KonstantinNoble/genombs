import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';

const CHECKOUT_BASE_URL = 'https://checkout.freemius.com/product/21730/plan/36437/';

export const useFreemiusCheckout = () => {
  const { user } = useAuth();

  const openCheckout = useCallback((email?: string) => {
    const userEmail = email || user?.email;
    
    // Email ist Pflicht - wenn keine vorhanden, zur Auth-Seite
    if (!userEmail) {
      window.location.href = '/auth?intent=premium';
      return;
    }

    // Checkout-URL mit Email-Parameter erstellen (readonly_user macht Email unveränderlich)
    const checkoutUrl = new URL(CHECKOUT_BASE_URL);
    checkoutUrl.searchParams.set('user_email', userEmail);
    checkoutUrl.searchParams.set('readonly_user', 'true');
    
    // Im gleichen Tab öffnen (ersetzt Synoptas-Seite temporär)
    window.location.href = checkoutUrl.toString();
  }, [user]);

  // Behalte isLoaded und isLoading für Rückwärtskompatibilität
  return { openCheckout, isLoaded: true, isLoading: false };
};
