import { UserRole } from '@/types/marketplace';

export type AdminSection = 
  | 'overview' 
  | 'resellers' 
  | 'subscriptions' 
  | 'stores' 
  | 'products' 
  | 'categories'
  | 'orders' 
  | 'customers' 
  | 'withdrawals' 
  | 'wallets' 
  | 'transactions' 
  | 'notifications' 
  | 'audit-log'
  | 'settings';

export interface PlatformSettings {
  // Platform
  platformName: string;
  supportEmail: string;
  supportPhone: string;
  currencySymbol: string;
  maintenanceMode: boolean;
  
  // Subscriptions
  trialPeriodDays: number;
  gracePeriodDays: number;
  enforceProductLimits: boolean;
  autoExpireUnpaidDays: number;

  // Delivery
  insideDhakaDeliveryFeeBDT: number;
  outsideDhakaDeliveryFeeBDT: number;
  defaultCourier: string;
  autoFulfillCOD: boolean;

  // Payments
  bkashMerchantNumber: string;
  nagadMerchantNumber: string;
  minWithdrawalBDT: number;
  payoutSchedule: string;

  // Reseller rules
  autoApproveResellers: boolean;
  defaultMaxCatalogItems: number;
  minProfitMarkupBDT: number;

  // Notifications
  emailAlertsOnHighOrder: boolean;
  payoutThresholdAlert: boolean;
  smsNotificationsEnabled: boolean;

  // Security
  superAdmin2FA: boolean;
  sessionTimeoutHours: number;
}

export interface CustomerRecord {
  id: string;
  firebaseUid: string;
  displayName: string;
  firstName?: string;
  lastName?: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: 'active' | 'suspended' | 'pending';
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string;
  totalOrders?: number;
  totalSpentBDT?: number;
  emailVerified?: boolean;
  phoneVerified?: boolean;
}

export interface AdminRecord {
  adminUid: string;
  email: string;
  assignedAt: string;
}

export interface AdminAuditLog {
  id: string;
  action: string;
  adminEmail: string;
  adminUid?: string;
  description: string;
  targetId: string;
  targetType: string;
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert' | string;
  createdAt: string;
  isRead: boolean;
  link?: string;
  metadata?: Record<string, any>;
}

export interface AdminOverviewMetrics {
  totalRevenueBDT: number;
  totalOrdersCount: number;
  totalResellersCount: number;
  totalCustomersCount: number;
  pendingWithdrawalsBDT: number;
  pendingOrdersCount: number;
  activeSubscriptionsCount: number;
  monthlyGrowthPercent?: number;

  // Additional overview tab metrics
  lastCalculatedAt?: string;
  totalOrders?: number;
  pendingOrders?: number;
  deliveredOrders?: number;
  grossPlatformSalesBDT?: number;
  totalResellers?: number;
  activeResellers?: number;
  suspendedResellers?: number;
  totalCustomers?: number;
  totalProducts?: number;
  resellerTotalEarningsBDT?: number;
  resellerTotalWithdrawnBDT?: number;
}
