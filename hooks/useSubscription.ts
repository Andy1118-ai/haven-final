import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import {
  initializePayments,
  getPackages,
  getCustomerInfo,
  purchasePackage,
  restorePurchases,
  getSubscriptionStatus,
  addSubscriptionListener,
  getRemainingSessions,
  canBookSession,
  SUBSCRIPTION_TIERS,
  type PurchasesPackage,
} from '../services/payments';

interface SubscriptionState {
  packages: PurchasesPackage[];
  customerInfo: any;
  subscriptionStatus: {
    isSubscribed: boolean;
    tier: keyof typeof SUBSCRIPTION_TIERS | null;
    features: any;
    expiresAt: string | null;
  };
  isLoading: boolean;
  error: string | null;
}

export function useSubscription() {
  const { user } = useAuth();
  const [state, setState] = useState<SubscriptionState>({
    packages: [],
    customerInfo: null,
    subscriptionStatus: {
      isSubscribed: false,
      tier: null,
      features: null,
      expiresAt: null,
    },
    isLoading: true,
    error: null,
  });

  // Initialize payments and load subscription data
  useEffect(() => {
    if (!user) return;

    const initialize = async () => {
      try {
        setState(prev => ({ ...prev, isLoading: true, error: null }));

        // Initialize RevenueCat
        await initializePayments(user.id);

        // Load packages and customer info
        const [packages, customerInfo] = await Promise.all([
          getPackages(),
          getCustomerInfo(),
        ]);

        setState(prev => ({
          ...prev,
          packages,
          customerInfo,
          subscriptionStatus: getSubscriptionStatus(customerInfo),
          isLoading: false,
        }));
      } catch (error) {
        setState(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : 'Failed to load subscription data',
        }));
      }
    };

    initialize();

    // Add subscription listener
    const subscription = addSubscriptionListener((customerInfo) => {
      setState(prev => ({
        ...prev,
        customerInfo,
        subscriptionStatus: getSubscriptionStatus(customerInfo),
      }));
    });

    return () => {
      subscription.remove();
    };
  }, [user]);

  // Purchase a package
  const purchase = useCallback(async (packageToPurchase: PurchasesPackage) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const customerInfo = await purchasePackage(packageToPurchase);

      setState(prev => ({
        ...prev,
        customerInfo,
        subscriptionStatus: getSubscriptionStatus(customerInfo),
        isLoading: false,
      }));

      return customerInfo;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to purchase package',
      }));
      throw error;
    }
  }, []);

  // Restore purchases
  const restore = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));

      const customerInfo = await restorePurchases();

      setState(prev => ({
        ...prev,
        customerInfo,
        subscriptionStatus: getSubscriptionStatus(customerInfo),
        isLoading: false,
      }));

      return customerInfo;
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Failed to restore purchases',
      }));
      throw error;
    }
  }, []);

  // Check if user can book a session
  const canBook = useCallback(
    (usedSessions: number) => {
      if (!state.customerInfo) return false;
      return canBookSession(state.customerInfo, usedSessions);
    },
    [state.customerInfo]
  );

  // Get remaining sessions
  const getRemaining = useCallback(
    (usedSessions: number) => {
      if (!state.customerInfo) return 0;
      return getRemainingSessions(state.customerInfo, usedSessions);
    },
    [state.customerInfo]
  );

  return {
    ...state,
    purchase,
    restore,
    canBook,
    getRemaining,
  };
} 