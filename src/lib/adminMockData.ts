import { CustomerRecord, AdminAuditLog, AdminNotification } from '@/types/admin';
import { 
  ResellerSubscription, 
  ResellerWithdrawal, 
  ResellerWallet, 
  WalletTransaction, 
  ResellerStore, 
  ResellerProduct 
} from '@/types/reseller';

export const INITIAL_ADMIN_CUSTOMERS: CustomerRecord[] = [
  {
    id: 'cust-101',
    firebaseUid: 'cust-101',
    displayName: 'Tanvir Ahmed',
    firstName: 'Tanvir',
    lastName: 'Ahmed',
    email: 'tanvir.ahmed@example.com',
    phone: '+8801712345678',
    role: 'customer',
    status: 'active',
    createdAt: '2026-08-15T10:30:00Z',
    totalOrders: 6,
    totalSpentBDT: 14850,
    emailVerified: true,
    phoneVerified: true
  },
  {
    id: 'cust-102',
    firebaseUid: 'cust-102',
    displayName: 'Farhana Akter',
    firstName: 'Farhana',
    lastName: 'Akter',
    email: 'farhana.akter@example.com',
    phone: '+8801819876543',
    role: 'customer',
    status: 'active',
    createdAt: '2026-08-20T14:15:00Z',
    totalOrders: 3,
    totalSpentBDT: 6200,
    emailVerified: true,
    phoneVerified: true
  },
  {
    id: 'cust-103',
    firebaseUid: 'cust-103',
    displayName: 'Sabbir Hossain',
    firstName: 'Sabbir',
    lastName: 'Hossain',
    email: 'sabbir.h@example.com',
    phone: '+8801911223344',
    role: 'customer',
    status: 'active',
    createdAt: '2026-09-01T09:00:00Z',
    totalOrders: 8,
    totalSpentBDT: 23400,
    emailVerified: true,
    phoneVerified: true
  },
  {
    id: 'cust-104',
    firebaseUid: 'cust-104',
    displayName: 'Nusrat Jahan',
    firstName: 'Nusrat',
    lastName: 'Jahan',
    email: 'nusrat.j@example.com',
    phone: '+8801615556677',
    role: 'customer',
    status: 'active',
    createdAt: '2026-09-10T16:45:00Z',
    totalOrders: 2,
    totalSpentBDT: 3800,
    emailVerified: true,
    phoneVerified: false
  },
  {
    id: 'cust-105',
    firebaseUid: 'cust-105',
    displayName: 'Mahmudul Hasan',
    firstName: 'Mahmudul',
    lastName: 'Hasan',
    email: 'suspicious.user@example.com',
    phone: '+8801511002233',
    role: 'customer',
    status: 'suspended',
    createdAt: '2026-09-12T11:20:00Z',
    totalOrders: 0,
    totalSpentBDT: 0,
    emailVerified: false,
    phoneVerified: false
  }
];

export const INITIAL_ADMIN_RESELLERS: ResellerStore[] = [
  {
    id: 'res-store-01',
    resellerId: 'usr-res-01',
    storeName: 'Dhaka Trendz Collection',
    storeSlug: 'dhaka-trendz',
    tagline: 'Trendy Lifestyle, Apparel & Smart Accessories',
    description: 'Premier dropshipping retailer delivering viral fashion and smart lifestyle products with nationwide COD.',
    status: 'active',
    contactPhone: '+8801723456789',
    contactEmail: 'contact@dhakatrendz.com',
    totalSales: 48,
    totalProducts: 16,
    createdAt: '2026-07-10T08:00:00Z',
    updatedAt: '2026-09-20T12:00:00Z'
  },
  {
    id: 'res-store-02',
    resellerId: 'usr-res-02',
    storeName: 'Chittagong Smart Gadgets',
    storeSlug: 'ctg-gadgets',
    tagline: 'Smart Watches, TWS Earbuds & Mobile Gear',
    description: 'Specialized in authentic audio and wearable accessories with 7-day replacement warranty.',
    status: 'active',
    contactPhone: '+8801834567890',
    contactEmail: 'support@ctggadgets.com',
    totalSales: 112,
    totalProducts: 32,
    createdAt: '2026-06-18T10:00:00Z',
    updatedAt: '2026-09-22T15:30:00Z'
  },
  {
    id: 'res-store-03',
    resellerId: 'usr-res-03',
    storeName: 'Sylhet Artisan Crafts',
    storeSlug: 'sylhet-crafts',
    tagline: 'Handmade Home Decor & Traditional Weaves',
    description: 'Eco-friendly sustainable handcrafted goods directly sourced from rural artisans.',
    status: 'active',
    contactPhone: '+8801945678901',
    contactEmail: 'hello@sylhetcrafts.com',
    totalSales: 64,
    totalProducts: 24,
    createdAt: '2026-08-01T11:00:00Z',
    updatedAt: '2026-09-23T09:00:00Z'
  },
  {
    id: 'res-store-04',
    resellerId: 'usr-res-04',
    storeName: 'Apex Resell BD',
    storeSlug: 'apex-resell-bd',
    tagline: 'General Merchandise',
    description: 'Temporarily inactive reseller shop under review.',
    status: 'suspended',
    contactPhone: '+8801656789012',
    contactEmail: 'info@apexresell.com',
    totalSales: 5,
    totalProducts: 4,
    createdAt: '2026-08-25T14:00:00Z',
    updatedAt: '2026-09-18T16:00:00Z'
  }
];

export const INITIAL_ADMIN_PRODUCTS: ResellerProduct[] = [
  {
    id: 'rp-admin-01',
    resellerId: 'usr-res-01',
    storeId: 'res-store-01',
    originalProductId: 'prod-earbuds-pro',
    productId: 'prod-earbuds-pro',
    productName: 'Wireless Earbuds Pro with Spatial Audio',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80',
    resellerPrice: 1600,
    baseCost: 1600,
    suggestedPrice: 2499,
    sellingPrice: 2499,
    sellingPriceBDT: 2499,
    potentialProfit: 899,
    description: 'Engineered with custom beryllium acoustic drivers and active noise cancellation.',
    isActive: true,
    status: 'active',
    createdAt: '2026-08-12T10:00:00Z',
    updatedAt: '2026-09-20T10:00:00Z'
  },
  {
    id: 'rp-admin-02',
    resellerId: 'usr-res-02',
    storeId: 'res-store-02',
    originalProductId: 'prod-smart-watch',
    productId: 'prod-smart-watch',
    productName: 'ChronoTrack AMOLED Smartwatch',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
    resellerPrice: 2100,
    baseCost: 2100,
    suggestedPrice: 3200,
    sellingPrice: 3200,
    sellingPriceBDT: 3200,
    potentialProfit: 1100,
    description: 'Waterproof smartwatch with continuous heart rate and SpO2 tracking.',
    isActive: true,
    status: 'active',
    createdAt: '2026-08-18T14:30:00Z',
    updatedAt: '2026-09-20T14:30:00Z'
  },
  {
    id: 'rp-admin-03',
    resellerId: 'usr-res-03',
    storeId: 'res-store-03',
    originalProductId: 'prod-minimalist-backpack',
    productId: 'prod-minimalist-backpack',
    productName: 'Minimalist Commuter Backpack 22L',
    category: 'Fashion',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80',
    resellerPrice: 1900,
    baseCost: 1900,
    suggestedPrice: 2850,
    sellingPrice: 2850,
    sellingPriceBDT: 2850,
    potentialProfit: 950,
    description: 'Water-resistant coated canvas with magnetic quick-snap closures.',
    isActive: true,
    status: 'active',
    createdAt: '2026-09-02T16:00:00Z',
    updatedAt: '2026-09-21T16:00:00Z'
  },
  {
    id: 'rp-admin-04',
    resellerId: 'usr-res-04',
    storeId: 'res-store-04',
    originalProductId: 'prod-bt-speaker',
    productId: 'prod-bt-speaker',
    productName: 'SonicBlast Submersible Bluetooth Speaker',
    category: 'Electronics',
    imageUrl: 'https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop&q=80',
    resellerPrice: 1350,
    baseCost: 1350,
    suggestedPrice: 2199,
    sellingPrice: 2199,
    sellingPriceBDT: 2199,
    potentialProfit: 849,
    description: 'Rugged IPX7 floating Bluetooth 5.3 speaker.',
    isActive: false,
    status: 'inactive',
    createdAt: '2026-09-14T11:00:00Z',
    updatedAt: '2026-09-22T11:00:00Z'
  }
];

export const INITIAL_ADMIN_WITHDRAWALS: ResellerWithdrawal[] = [
  {
    id: 'WTH-8821',
    resellerId: 'usr-res-01',
    resellerName: 'Dhaka Trendz Collection',
    resellerEmail: 'contact@dhakatrendz.com',
    amount: 3450,
    amountBDT: 3450,
    method: 'bkash',
    accountDetails: {
      accountNumber: '01712-345678',
      accountType: 'personal'
    },
    status: 'Pending',
    requestedAt: '2026-09-24T06:30:00Z'
  },
  {
    id: 'WTH-8820',
    resellerId: 'usr-res-02',
    resellerName: 'Chittagong Smart Gadgets',
    resellerEmail: 'support@ctggadgets.com',
    amount: 8200,
    amountBDT: 8200,
    method: 'nagad',
    accountDetails: {
      accountNumber: '01819-876543',
      accountType: 'agent'
    },
    status: 'Approved',
    requestedAt: '2026-09-23T14:10:00Z',
    processedAt: '2026-09-23T18:00:00Z',
    adminNotes: 'Cleared by finance team. Scheduled for batch payout.'
  },
  {
    id: 'WTH-8819',
    resellerId: 'usr-res-03',
    resellerName: 'Sylhet Artisan Crafts',
    resellerEmail: 'hello@sylhetcrafts.com',
    amount: 15000,
    amountBDT: 15000,
    method: 'bank',
    accountDetails: {
      bankName: 'City Bank PLC',
      branchName: 'Zindabazar Branch, Sylhet',
      accountNumber: '110293847501',
      routingNumber: '090272183',
      accountHolderName: 'Sylhet Crafts Enterprise'
    },
    status: 'Completed',
    requestedAt: '2026-09-21T09:00:00Z',
    processedAt: '2026-09-22T11:45:00Z',
    transactionId: 'CB-BEFTN-9988231',
    adminNotes: 'Dispatched via BEFTN network clearance.'
  },
  {
    id: 'WTH-8818',
    resellerId: 'usr-res-01',
    resellerName: 'Dhaka Trendz Collection',
    resellerEmail: 'contact@dhakatrendz.com',
    amount: 4500,
    amountBDT: 4500,
    method: 'bkash',
    accountDetails: {
      accountNumber: '01712-345678',
      accountType: 'personal'
    },
    status: 'Completed',
    requestedAt: '2026-09-17T12:00:00Z',
    processedAt: '2026-09-18T10:15:00Z',
    transactionId: 'BK-TRX-4491029'
  },
  {
    id: 'WTH-8817',
    resellerId: 'usr-res-04',
    resellerName: 'Apex Resell BD',
    resellerEmail: 'info@apexresell.com',
    amount: 1200,
    amountBDT: 1200,
    method: 'nagad',
    accountDetails: {
      accountNumber: '01656-789012',
      accountType: 'personal'
    },
    status: 'Rejected',
    requestedAt: '2026-09-15T15:20:00Z',
    processedAt: '2026-09-16T08:30:00Z',
    rejectionReason: 'Account details mismatch with National ID documentation.'
  }
];

export const INITIAL_ADMIN_SUBSCRIPTIONS: ResellerSubscription[] = [
  {
    id: 'SUB-901',
    resellerId: 'usr-res-02',
    resellerName: 'Chittagong Smart Gadgets',
    resellerEmail: 'support@ctggadgets.com',
    plan: 'pro',
    planName: 'Pro Partner',
    priceBDT: 999,
    billingCycle: 'monthly',
    startDate: '2026-09-01T00:00:00Z',
    expiryDate: '2026-10-01T00:00:00Z',
    durationDays: 30,
    status: 'active',
    paymentMethod: 'bkash',
    transactionId: 'BK-SUB-994012',
    createdAt: '2026-09-01T00:00:00Z'
  },
  {
    id: 'SUB-902',
    resellerId: 'usr-res-03',
    resellerName: 'Sylhet Artisan Crafts',
    resellerEmail: 'hello@sylhetcrafts.com',
    plan: 'enterprise',
    planName: 'Enterprise VIP',
    priceBDT: 2499,
    billingCycle: 'monthly',
    startDate: '2026-08-15T00:00:00Z',
    expiryDate: '2026-10-15T00:00:00Z',
    durationDays: 60,
    status: 'active',
    paymentMethod: 'bank',
    transactionId: 'CITY-SUB-88190',
    createdAt: '2026-08-15T00:00:00Z'
  },
  {
    id: 'SUB-903',
    resellerId: 'usr-res-01',
    resellerName: 'Dhaka Trendz Collection',
    resellerEmail: 'contact@dhakatrendz.com',
    plan: 'pro',
    planName: 'Pro Partner',
    priceBDT: 999,
    billingCycle: 'monthly',
    startDate: '2026-09-24T00:00:00Z',
    expiryDate: '2026-10-24T00:00:00Z',
    durationDays: 30,
    status: 'pending_payment',
    paymentMethod: 'nagad',
    transactionId: 'NG-PEND-19283',
    createdAt: '2026-09-24T00:00:00Z'
  }
];

export const INITIAL_ADMIN_WALLETS: ResellerWallet[] = [
  {
    resellerId: 'usr-res-01',
    resellerName: 'Dhaka Trendz Collection',
    availableBalanceBDT: 4250,
    pendingBalanceBDT: 3450,
    totalEarningsBDT: 28400,
    totalWithdrawnBDT: 20700,
    updatedAt: '2026-09-24T08:00:00Z'
  },
  {
    resellerId: 'usr-res-02',
    resellerName: 'Chittagong Smart Gadgets',
    availableBalanceBDT: 12400,
    pendingBalanceBDT: 8200,
    totalEarningsBDT: 64800,
    totalWithdrawnBDT: 44200,
    updatedAt: '2026-09-24T09:30:00Z'
  },
  {
    resellerId: 'usr-res-03',
    resellerName: 'Sylhet Artisan Crafts',
    availableBalanceBDT: 8900,
    pendingBalanceBDT: 5600,
    totalEarningsBDT: 42300,
    totalWithdrawnBDT: 27800,
    updatedAt: '2026-09-23T16:00:00Z'
  }
];

export const INITIAL_ADMIN_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'TRX-5501',
    resellerId: 'usr-res-01',
    type: 'sale_commission',
    amountBDT: 800,
    direction: 'credit',
    description: 'Commission profit for Order #ORD-10492 (Delivered via Pathao)',
    referenceId: 'ORD-10492',
    status: 'completed',
    createdAt: '2026-09-24T08:15:00Z'
  },
  {
    id: 'TRX-5502',
    resellerId: 'usr-res-02',
    type: 'sale_commission',
    amountBDT: 1300,
    direction: 'credit',
    description: 'Commission profit for Order #ORD-10488 (Delivered via Steadfast)',
    referenceId: 'ORD-10488',
    status: 'completed',
    createdAt: '2026-09-23T17:40:00Z'
  },
  {
    id: 'TRX-5503',
    resellerId: 'usr-res-03',
    type: 'withdrawal',
    amountBDT: 15000,
    direction: 'debit',
    description: 'Disbursement to City Bank A/C (Ref: CB-BEFTN-9988231)',
    referenceId: 'WTH-8819',
    status: 'completed',
    createdAt: '2026-09-22T11:45:00Z'
  }
];

export const INITIAL_ADMIN_NOTIFICATIONS: AdminNotification[] = [
  {
    id: 'notif-01',
    title: 'New Withdrawal Payout Request',
    message: 'Dhaka Trendz Collection requested ৳3,450 payout to bKash (01712-345678).',
    type: 'alert',
    createdAt: '2026-09-24T06:30:00Z',
    isRead: false,
    link: 'withdrawals'
  },
  {
    id: 'notif-02',
    title: 'New Subscription Payment Pending',
    message: 'Dhaka Trendz Collection submitted Pro Partner renewal via Nagad.',
    type: 'warning',
    createdAt: '2026-09-24T00:15:00Z',
    isRead: false,
    link: 'subscriptions'
  },
  {
    id: 'notif-03',
    title: 'Steadfast Courier Delivery Batch Completed',
    message: '14 COD shipments marked as Delivered and funds cleared into escrow.',
    type: 'success',
    createdAt: '2026-09-23T19:00:00Z',
    isRead: true,
    link: 'orders'
  }
];

export const INITIAL_ADMIN_AUDIT_LOGS: AdminAuditLog[] = [
  {
    id: 'log-101',
    action: 'DISPATCH_PAYOUT',
    adminEmail: 'admin@zeroinvest.com',
    description: 'Dispatched ৳15,000 via City Bank BEFTN for request #WTH-8819.',
    targetId: 'WTH-8819',
    targetType: 'withdrawal',
    timestamp: '2026-09-22T11:45:00Z'
  },
  {
    id: 'log-102',
    action: 'ACTIVATE_SUBSCRIPTION',
    adminEmail: 'admin@zeroinvest.com',
    description: 'Activated 30-day Pro Partner subscription for Chittagong Smart Gadgets.',
    targetId: 'SUB-901',
    targetType: 'subscription',
    timestamp: '2026-09-01T00:05:00Z'
  }
];
