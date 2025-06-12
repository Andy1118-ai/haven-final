import Purchases, { CustomerInfo, PurchasesPackage } from 'react-native-purchases';
import AsyncStorage from '@react-native-async-storage/async-storage';

// RevenueCat API key - replace with your actual key
const REVENUECAT_API_KEY = 'your_revenuecat_api_key';

// Subscription tiers
export const SUBSCRIPTION_TIERS = {
  BASIC: 'basic_monthly',
  PREMIUM: 'premium_monthly',
  ANNUAL: 'annual',
} as const;

// Feature flags for different subscription tiers
export const SUBSCRIPTION_FEATURES = {
  [SUBSCRIPTION_TIERS.BASIC]: {
    maxSessionsPerMonth: 4,
    chatAccess: true,
    contentAccess: 'basic',
    videoSessions: false,
  },
  [SUBSCRIPTION_TIERS.PREMIUM]: {
    maxSessionsPerMonth: 8,
    chatAccess: true,
    contentAccess: 'premium',
    videoSessions: true,
  },
  [SUBSCRIPTION_TIERS.ANNUAL]: {
    maxSessionsPerMonth: 12,
    chatAccess: true,
    contentAccess: 'premium',
    videoSessions: true,
    discount: 0.2, // 20% discount
  },
} as const;

// Initialize RevenueCat
export async function initializePayments(userId: string) {
  try {
    await Purchases.configure({
      apiKey: REVENUECAT_API_KEY,
      appUserID: userId,
    });

    // Set user attributes
    await Purchases.setAttributes({
      $email: await AsyncStorage.getItem('userEmail'),
    });

    return true;
  } catch (error) {
    console.error('Error initializing payments:', error);
    throw error;
  }
}

// Get available packages
export async function getPackages(): Promise<PurchasesPackage[]> {
  try {
    const offerings = await Purchases.getOfferings();
    return offerings.current?.availablePackages || [];
  } catch (error) {
    console.error('Error getting packages:', error);
    throw error;
  }
}

// Get customer info
export async function getCustomerInfo(): Promise<CustomerInfo> {
  try {
    return await Purchases.getCustomerInfo();
  } catch (error) {
    console.error('Error getting customer info:', error);
    throw error;
  }
}

// Purchase a package
export async function purchasePackage(package: PurchasesPackage) {
  try {
    const { customerInfo } = await Purchases.purchasePackage(package);
    return customerInfo;
  } catch (error) {
    console.error('Error purchasing package:', error);
    throw error;
  }
}

// Restore purchases
export async function restorePurchases(): Promise<CustomerInfo> {
  try {
    return await Purchases.restorePurchases();
  } catch (error) {
    console.error('Error restoring purchases:', error);
    throw error;
  }
}

// Check if user has access to a feature
export function hasFeatureAccess(
  customerInfo: CustomerInfo,
  feature: keyof typeof SUBSCRIPTION_FEATURES[keyof typeof SUBSCRIPTION_TIERS]
): boolean {
  try {
    // Check if user has any active subscription
    const hasActiveSubscription = Object.values(SUBSCRIPTION_TIERS).some(
      (tier) => customerInfo.entitlements.active[tier]
    );

    if (!hasActiveSubscription) return false;

    // Get the highest tier the user has access to
    const activeTier = Object.values(SUBSCRIPTION_TIERS).find(
      (tier) => customerInfo.entitlements.active[tier]
    );

    if (!activeTier) return false;

    // Check if the feature is available in the user's tier
    return feature in SUBSCRIPTION_FEATURES[activeTier];
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

// Get user's subscription status
export function getSubscriptionStatus(customerInfo: CustomerInfo) {
  try {
    const activeTier = Object.values(SUBSCRIPTION_TIERS).find(
      (tier) => customerInfo.entitlements.active[tier]
    );

    if (!activeTier) {
      return {
        isSubscribed: false,
        tier: null,
        features: null,
        expiresAt: null,
      };
    }

    const entitlement = customerInfo.entitlements.active[activeTier];
    return {
      isSubscribed: true,
      tier: activeTier,
      features: SUBSCRIPTION_FEATURES[activeTier],
      expiresAt: entitlement.expirationDate,
    };
  } catch (error) {
    console.error('Error getting subscription status:', error);
    throw error;
  }
}

// Handle subscription changes
export function addSubscriptionListener(
  callback: (customerInfo: CustomerInfo) => void
) {
  return Purchases.addCustomerInfoUpdateListener(callback);
}

// Get remaining sessions for the current month
export function getRemainingSessions(
  customerInfo: CustomerInfo,
  usedSessions: number
): number {
  try {
    const { tier, features } = getSubscriptionStatus(customerInfo);
    if (!tier || !features) return 0;

    const maxSessions = features.maxSessionsPerMonth;
    return Math.max(0, maxSessions - usedSessions);
  } catch (error) {
    console.error('Error getting remaining sessions:', error);
    return 0;
  }
}

// Check if user can book a session
export function canBookSession(
  customerInfo: CustomerInfo,
  usedSessions: number
): boolean {
  return getRemainingSessions(customerInfo, usedSessions) > 0;
} 