export interface ResellerPlan {
  id: string;
  name: string;
  priceBDT: number;
  billingPeriod: string;
  description: string;
  features: string[];
  badge?: string;
  ctaText?: string;
  durationDays?: number;
  isActive?: boolean;
}

export type SubscriptionStatus = 'active' | 'pending_payment' | 'cancelled' | 'expired';

export interface ResellerSubscription {
  id: string;
  resellerId: string;
  resellerName?: string;
  resellerEmail?: string;
  plan: string;
  planName: string;
  priceBDT: number;
  billingCycle: 'monthly' | 'yearly' | 'lifetime' | string;
  startDate: string;
  expiryDate: string;
  durationDays?: number;
  status: SubscriptionStatus;
  paymentMethod?: string;
  transactionId?: string;
  paymentTrxId?: string;
  createdAt: string;
  updatedAt?: string;
}

export type WithdrawalStatus = 'Pending' | 'Approved' | 'Completed' | 'Rejected' | 'Processing';

export interface WithdrawalAccountDetails {
  accountNumber?: string;
  accountType?: 'personal' | 'agent' | string;
  bankName?: string;
  branchName?: string;
  routingNumber?: string;
  accountHolderName?: string;
  [key: string]: any;
}

export interface ResellerWithdrawal {
  id: string;
  resellerId: string;
  resellerName?: string;
  resellerEmail?: string;
  amount: number;
  amountBDT: number;
  method: 'bkash' | 'nagad' | 'bank' | string;
  accountDetails: WithdrawalAccountDetails;
  status: WithdrawalStatus;
  requestedAt: string;
  processedAt?: string;
  transactionId?: string;
  adminNotes?: string;
  rejectionReason?: string;
}

export interface ResellerWallet {
  resellerId: string;
  resellerName?: string;
  availableBalanceBDT: number;
  pendingBalanceBDT: number;
  totalEarningsBDT: number;
  totalWithdrawnBDT: number;
  updatedAt: string;
}

export interface WalletTransaction {
  id: string;
  resellerId: string;
  type: 'sale_commission' | 'withdrawal' | 'subscription_fee' | 'bonus' | 'adjustment' | string;
  amountBDT: number;
  direction: 'credit' | 'debit';
  description: string;
  referenceId: string;
  status: 'completed' | 'pending' | 'failed' | string;
  createdAt: string;
}

export interface ResellerStore {
  id: string;
  resellerId: string;
  storeName: string;
  storeSlug: string;
  logoUrl?: string;
  bannerUrl?: string;
  tagline?: string;
  description?: string;
  status: 'active' | 'suspended' | 'pending' | string;
  contactPhone?: string;
  contactEmail?: string;
  totalSales?: number;
  totalProducts?: number;
  createdAt: string;
  updatedAt?: string;
}

export interface ResellerProduct {
  id: string;
  resellerId: string;
  storeId?: string;
  originalProductId: string;
  productId?: string;
  productName: string;
  category: string;
  imageUrl: string;
  images?: string[];
  resellerPrice: number; // Platform base cost (supplier wholesale cost)
  baseCost?: number;     // Platform base cost alias
  suggestedPrice: number; // Reseller's chosen selling price
  sellingPrice?: number;  // Reseller's chosen selling price alias
  sellingPriceBDT?: number; // Reseller's chosen selling price alias
  potentialProfit?: number; // sellingPrice - baseCost
  description?: string;
  stock?: number;
  status?: 'active' | 'inactive' | 'pending';
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

export type ResellerSection = 
  | 'overview' 
  | 'store' 
  | 'products' 
  | 'orders' 
  | 'customers' 
  | 'wallet' 
  | 'withdrawals' 
  | 'subscription' 
  | 'analytics' 
  | 'notifications' 
  | 'settings';

export interface ResellerNotification {
  id: string;
  resellerId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'alert' | string;
  isRead: boolean;
  createdAt: string;
  link?: string;
}

export interface ResellerCustomer {
  id: string;
  name: string;
  phone: string;
  email?: string;
  orderCount: number;
  totalSpentBDT: number;
  lastOrderDate: string;
  status: 'active' | 'inactive';
}

export type ResellerSalesChannel = 
  | 'Facebook Page / Group'
  | 'TikTok / Instagram Shop'
  | 'Website / E-commerce'
  | 'Daraz / Marketplace'
  | 'Offline Store';

export type ResellerMonthlyOrders = 
  | 'Just Starting (1-10 orders)'
  | 'Growing (10-50 orders)'
  | 'High Volume (50+ orders)';

export interface ResellerApplication {
  id: string;
  uid: string;
  userId?: string;
  name: string;
  email?: string;
  whatsapp: string;
  salesChannel: ResellerSalesChannel | string;
  pageUrl: string;
  estimatedVolume: ResellerMonthlyOrders | string;
  district: string;
  nidFront?: string;
  nidBack?: string;
  status: 'pending' | 'approved' | 'rejected';
  appliedAt?: any;
  createdAt?: any;
  updatedAt?: any;
  reviewedAt?: any;
  reviewedBy?: string;
  rejectionReason?: string;
}

