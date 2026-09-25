import { Product, UserProfile, UserRole } from '@/types/marketplace';

export type ResellerAccessStatus = 
  | 'verified' 
  | 'pending_verification' 
  | 'not_reseller' 
  | 'unauthenticated';

export interface ResellerProductPricing {
  supplierPrice: number;
  suggestedPrice: number;
  potentialProfit: number;
  profitMarginPercent: number;
  isAvailable: boolean;
  isVerifiedReseller: boolean;
  accessStatus: ResellerAccessStatus;
}

/**
 * Safely evaluates user verification status and role without breaking existing Firestore structures.
 */
export function getResellerAccessStatus(
  userProfile?: UserProfile | null,
  role?: UserRole | string | null,
  isAuthenticated?: boolean
): ResellerAccessStatus {
  // If explicitly not authenticated or no user details
  if (isAuthenticated === false || (!isAuthenticated && !userProfile && !role)) {
    return 'unauthenticated';
  }

  // Active role evaluation
  const activeRole = userProfile?.role || role;

  // Platform Admins have full access and verified status
  if (
    activeRole === 'admin' ||
    userProfile?.role === 'admin' ||
    (userProfile?.email && (
      userProfile.email.toLowerCase() === 'rifathq4637@gmail.com' ||
      userProfile.email.toLowerCase() === 'moonlit4637@gmail.com' ||
      userProfile.email.toLowerCase() === 'admin@zeroinvest.com' ||
      userProfile.email.toLowerCase().includes('admin')
    ))
  ) {
    return 'verified';
  }

  // Check explicit verification indicators
  const isVerifiedFlag = Boolean(
    userProfile?.isVerified === true ||
    (userProfile as any)?.isVerifiedReseller === true
  );

  const resellerStatus = (userProfile as any)?.resellerStatus;
  const status = userProfile?.status;

  // If status is pending, wholesale price remains LOCKED
  if (resellerStatus === 'pending' || status === 'pending') {
    return 'pending_verification';
  }

  // Wholesale price is unlocked ONLY when Admin approves (isVerified: true and/or status: 'approved'/'verified')
  if (
    (isVerifiedFlag && (resellerStatus === 'approved' || resellerStatus === 'verified' || !resellerStatus)) ||
    resellerStatus === 'approved' ||
    resellerStatus === 'verified'
  ) {
    return 'verified';
  }

  // Customer or general user
  if (activeRole === 'customer') {
    return 'not_reseller';
  }

  return 'not_reseller';
}

/**
 * Returns true only if the user is an authenticated and verified reseller/admin.
 */
export function isVerifiedResellerUser(
  userProfile?: UserProfile | null,
  role?: UserRole | string | null,
  isAuthenticated?: boolean
): boolean {
  return getResellerAccessStatus(userProfile, role, isAuthenticated) === 'verified';
}

/**
 * Calculate reseller product economics and price masking status
 */
export function getProductResellerPricing(
  product: Product,
  authInput?: boolean | { userProfile?: UserProfile | null; role?: UserRole | string | null; isAuthenticated?: boolean }
): ResellerProductPricing {
  let isVerified = false;
  let accessStatus: ResellerAccessStatus = 'unauthenticated';

  if (typeof authInput === 'boolean') {
    isVerified = authInput;
    accessStatus = authInput ? 'verified' : 'unauthenticated';
  } else if (authInput && typeof authInput === 'object') {
    accessStatus = getResellerAccessStatus(authInput.userProfile, authInput.role, authInput.isAuthenticated);
    isVerified = accessStatus === 'verified';
  }

  const supplierPrice = product.supplierPrice ?? Math.round(product.price * 0.7);
  const suggestedPrice = product.suggestedPrice ?? product.price;
  const potentialProfit = product.resellerProfit ?? Math.max(0, suggestedPrice - supplierPrice);
  const profitMarginPercent = suggestedPrice > 0 
    ? Math.round((potentialProfit / suggestedPrice) * 100) 
    : 0;

  return {
    supplierPrice,
    suggestedPrice,
    potentialProfit,
    profitMarginPercent,
    isAvailable: product.inStock && (product.stockCount > 0),
    isVerifiedReseller: isVerified,
    accessStatus
  };
}
