'use client';

import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from 'react';
import { 
  collection, 
  getDocs, 
  doc, 
  getDoc, 
  updateDoc, 
  setDoc, 
  addDoc, 
  query, 
  where,
  onSnapshot,
  serverTimestamp 
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { 
  ResellerStore, 
  ResellerProduct, 
  ResellerSection,
  ResellerNotification,
  ResellerCustomer,
  ResellerWallet,
  WalletTransaction,
  ResellerWithdrawal,
  ResellerSubscription,
  ResellerPlan,
  ResellerApplication
} from '@/types/reseller';
import { Product, Order, OrderStatus } from '@/types/marketplace';
import { 
  RESELLER_PLANS, 
  INITIAL_RESELLER_ORDERS, 
  INITIAL_RESELLER_NOTIFICATIONS 
} from '@/lib/resellerMockData';
import { 
  INITIAL_ADMIN_RESELLERS, 
  INITIAL_ADMIN_PRODUCTS, 
  INITIAL_ADMIN_WALLETS, 
  INITIAL_ADMIN_WITHDRAWALS, 
  INITIAL_ADMIN_TRANSACTIONS, 
  INITIAL_ADMIN_SUBSCRIPTIONS 
} from '@/lib/adminMockData';

interface ResellerContextType {
  isReseller: boolean;
  currentResellerId: string;
  resellerProfile: ResellerStore | null;
  activeSection: ResellerSection;
  setActiveSection: (sec: ResellerSection) => void;
  products: ResellerProduct[];
  orders: (Order & { profitBDT?: number; courier?: string })[];
  customers: ResellerCustomer[];
  wallet: ResellerWallet;
  transactions: WalletTransaction[];
  withdrawals: ResellerWithdrawal[];
  subscription: ResellerSubscription | null;
  plans: ResellerPlan[];
  notifications: ResellerNotification[];
  unreadNotificationCount: number;
  isLoading: boolean;
  isSubmitting: boolean;

  // Actions
  updateStoreProfile: (updates: Partial<ResellerStore>) => Promise<boolean>;
  addProduct: (product: Partial<ResellerProduct>) => Promise<ResellerProduct>;
  addCatalogProductToStore: (productId: string, sellingPrice: number) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updates: Partial<ResellerProduct>) => Promise<boolean>;
  deleteProduct: (id: string) => Promise<boolean>;
  toggleProductStatus: (id: string) => Promise<boolean>;
  updateOrderStatus: (orderId: string, status: OrderStatus, trackingNumber?: string, courier?: string) => Promise<boolean>;
  requestWithdrawal: (data: { amount: number; method: string; accountDetails: any }) => Promise<{ success: boolean; error?: string }>;
  changeSubscription: (planId: string, paymentMethod?: string, trxId?: string) => Promise<boolean>;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;
  switchResellerAccount: (resellerId: string) => void;

  // Verification Modal
  isVerificationModalOpen: boolean;
  openVerificationModal: () => void;
  closeVerificationModal: () => void;
  currentApplication: ResellerApplication | null;
  isSubmittingApplication: boolean;
  submitResellerApplication: (data: {
    name: string;
    whatsapp: string;
    salesChannel: string;
    pageUrl: string;
    estimatedVolume: string;
    district: string;
    nidFront?: string;
    nidBack?: string;
  }) => Promise<{ success: boolean; error?: string }>;

  // Legacy / Marketplace bridge actions
  addProductToCatalog: (product: Product, suggestedPrice: number, description?: string) => Promise<{ success: boolean }>;
  quickGenerateLandingPage: (product: Product) => Promise<{ storeSlug: string; productSlug: string }>;
  registerReseller: (data: any) => Promise<{ success: boolean; error?: string }>;
}

const ResellerContext = createContext<ResellerContextType | undefined>(undefined);

// Storage helper functions
function getLocalOrInitial<T>(key: string, initialData: T): T {
  if (typeof window === 'undefined') return initialData;
  try {
    const stored = localStorage.getItem(key);
    if (stored) {
      return JSON.parse(stored);
    }
    localStorage.setItem(key, JSON.stringify(initialData));
  } catch (e) {
    console.warn(`[ResellerContext] LocalStorage access failed for ${key}:`, e);
  }
  return initialData;
}

function saveLocal<T>(key: string, data: T) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.warn(`[ResellerContext] LocalStorage save failed for ${key}:`, e);
  }
}

export function ResellerProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile, role, updateProfileData } = useAuth();
  const { showToast, orders: marketplaceOrders, products: marketplaceProducts = [] } = useMarketplace();

  const [activeSection, setActiveSection] = useState<ResellerSection>('overview');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  // Verification Modal State
  const [isVerificationModalOpen, setIsVerificationModalOpen] = useState(false);
  const [currentApplication, setCurrentApplication] = useState<ResellerApplication | null>(null);
  const [isSubmittingApplication, setIsSubmittingApplication] = useState(false);

  const openVerificationModal = useCallback(() => {
    setIsVerificationModalOpen(true);
  }, []);

  const closeVerificationModal = useCallback(() => {
    setIsVerificationModalOpen(false);
  }, []);

  // Listen to user's application from Firestore or localStorage
  useEffect(() => {
    if (!user?.uid) {
      setCurrentApplication(null);
      return;
    }

    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(`zero_invest_reseller_app_${user.uid}`);
      if (stored) {
        try {
          setCurrentApplication(JSON.parse(stored));
        } catch (e) {
          // ignore
        }
      }
    }

    if (isFirebaseConfigured && db) {
      const appRef = doc(db, 'reseller_applications', user.uid);
      const unsubscribe = onSnapshot(appRef, (snap) => {
        if (snap.exists()) {
          const data = { ...snap.data(), id: snap.id } as ResellerApplication;
          setCurrentApplication(data);
          if (typeof window !== 'undefined') {
            localStorage.setItem(`zero_invest_reseller_app_${user.uid}`, JSON.stringify(data));
          }
        }
      }, (err) => {
        console.warn('reseller_applications snapshot error:', err);
      });

      return () => unsubscribe();
    }
  }, [user?.uid]);

  const submitResellerApplication = async (data: {
    name: string;
    whatsapp: string;
    salesChannel: string;
    pageUrl: string;
    estimatedVolume: string;
    district: string;
    nidFront?: string;
    nidBack?: string;
  }): Promise<{ success: boolean; error?: string }> => {
    if (!user?.uid) {
      return { success: false, error: 'Please sign in to submit your verification application.' };
    }

    setIsSubmittingApplication(true);
    try {
      const nowIso = new Date().toISOString();
      const docId = user.uid;
      const firestorePayload = {
        userId: user.uid,
        uid: user.uid,
        id: user.uid,
        name: data.name.trim(),
        email: user.email || '',
        whatsapp: data.whatsapp.trim(),
        salesChannel: data.salesChannel.trim(),
        pageUrl: data.pageUrl.trim(),
        estimatedVolume: data.estimatedVolume.trim(),
        district: data.district.trim(),
        nidFront: data.nidFront || null,
        nidBack: data.nidBack || null,
        status: 'pending', // exact lowercase string
        createdAt: isFirebaseConfigured && db ? serverTimestamp() : nowIso,
        appliedAt: isFirebaseConfigured && db ? serverTimestamp() : nowIso,
        updatedAt: isFirebaseConfigured && db ? serverTimestamp() : nowIso
      };

      if (isFirebaseConfigured && db) {
        // 1. Create or update document in reseller_applications
        try {
          await setDoc(doc(db, 'reseller_applications', docId), firestorePayload, { merge: true });
          console.log('Application submitted successfully:', docId);
        } catch (dbErr) {
          console.error('[ResellerContext] Firestore setDoc error on reseller_applications:', dbErr);
          throw dbErr;
        }

        // 2. Update user doc with resellerStatus: 'pending'
        try {
          await setDoc(doc(db, 'users', user.uid), {
            resellerStatus: 'pending',
            updatedAt: nowIso
          }, { merge: true });
        } catch (uErr) {
          console.error('[ResellerContext] Firestore update user doc error:', uErr);
        }
      } else {
        console.log('Application submitted successfully:', docId);
      }

      // Update local profile & storage
      if (updateProfileData) {
        updateProfileData({ resellerStatus: 'pending' });
      }

      if (typeof window !== 'undefined') {
        const localSave = { 
          ...firestorePayload, 
          createdAt: nowIso, 
          appliedAt: nowIso, 
          updatedAt: nowIso 
        } as ResellerApplication;
        localStorage.setItem(`zero_invest_reseller_app_${user.uid}`, JSON.stringify(localSave));
        setCurrentApplication(localSave);
      }

      showToast('Application Submitted', 'Your reseller verification is now under review.', 'success');
      return { success: true };
    } catch (err: any) {
      console.error('Error submitting reseller application:', err);
      return { success: false, error: err.message || 'Failed to submit application. Please try again.' };
    } finally {
      setIsSubmittingApplication(false);
    }
  };

  // Determine current active reseller ID
  // If user is authenticated with a specific UID, check if store exists or use UID.
  // In demo / preview mode, allow switching or fallback to 'usr-res-01' (Dhaka Trendz)
  const [selectedDemoResellerId, setSelectedDemoResellerId] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zero_invest_active_reseller_id');
      if (stored) return stored;
    }
    return 'usr-res-01';
  });

  const currentResellerId = useMemo(() => {
    if (user?.uid && userProfile?.role === 'seller') {
      return user.uid;
    }
    if (user?.uid && (role === 'seller' || role === 'reseller')) {
      return user.uid;
    }
    return selectedDemoResellerId || 'usr-res-01';
  }, [user, userProfile, role, selectedDemoResellerId]);

  const isReseller = true; // Enabled in portal

  // 1. Reseller Stores (All Stores / Current Store)
  const [allStores, setAllStores] = useState<ResellerStore[]>(() =>
    getLocalOrInitial('zero_invest_admin_resellers', INITIAL_ADMIN_RESELLERS)
  );

  const resellerProfile = useMemo(() => {
    const found = allStores.find(s => s.resellerId === currentResellerId || s.id === currentResellerId);
    if (found) return found;
    // Default fallback store for current user
    return {
      id: `store-${currentResellerId}`,
      resellerId: currentResellerId,
      storeName: userProfile?.displayName ? `${userProfile.displayName}'s Store` : 'Dhaka Trendz Collection',
      storeSlug: (userProfile?.displayName || 'dhaka-trendz').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      tagline: 'Quality Lifestyle & Trend Essentials',
      description: 'Official verified online retail storefront with nationwide Cash on Delivery.',
      status: 'active',
      contactPhone: userProfile?.phone || '+8801723456789',
      contactEmail: user?.email || 'contact@dhakatrendz.com',
      totalSales: 48,
      totalProducts: 6,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }, [allStores, currentResellerId, user, userProfile]);

  // 2. Products (Filtered by current reseller ID, joined with Master Platform Catalog)
  const [allProducts, setAllProducts] = useState<ResellerProduct[]>(() =>
    getLocalOrInitial('zero_invest_admin_products', INITIAL_ADMIN_PRODUCTS)
  );

  const products = useMemo(() => {
    const list = allProducts.filter(p => p.resellerId === currentResellerId);
    const sourceList = list.length > 0 ? list : allProducts;

    // Strict Rule: Reseller products are linked to the master platform catalog.
    // Images, names, categories, descriptions, specifications, and base costs are always sourced from the master platform catalog.
    // Reseller ONLY controls sellingPrice and isActive status.
    return sourceList.map(rp => {
      const platformProd = marketplaceProducts.find(
        mp => mp.id === rp.originalProductId || mp.id === rp.productId
      );

      const baseCost = platformProd ? (platformProd.supplierPrice || platformProd.price) : (rp.resellerPrice || rp.baseCost || 500);
      const sellingPrice = rp.suggestedPrice || rp.sellingPrice || rp.sellingPriceBDT || (platformProd ? (platformProd.suggestedPrice || platformProd.price) : 800);
      const profit = Math.max(0, sellingPrice - baseCost);

      return {
        ...rp,
        originalProductId: platformProd ? platformProd.id : rp.originalProductId,
        productId: platformProd ? platformProd.id : (rp.productId || rp.originalProductId),
        productName: platformProd ? platformProd.name : rp.productName,
        category: platformProd ? platformProd.category : rp.category,
        imageUrl: platformProd ? platformProd.imageUrl : rp.imageUrl,
        images: platformProd ? (platformProd.additionalImages?.length ? [platformProd.imageUrl, ...platformProd.additionalImages] : [platformProd.imageUrl]) : (rp.images || [rp.imageUrl]),
        resellerPrice: baseCost,
        baseCost: baseCost,
        suggestedPrice: sellingPrice,
        sellingPrice: sellingPrice,
        sellingPriceBDT: sellingPrice,
        potentialProfit: profit,
        description: platformProd ? platformProd.description : rp.description,
        stock: platformProd ? platformProd.stockCount : (rp.stock ?? 25),
        isActive: rp.isActive !== false,
        status: (rp.isActive !== false ? 'active' : 'inactive') as 'active' | 'inactive'
      };
    });
  }, [allProducts, currentResellerId, marketplaceProducts]);

  // 3. Orders (Filtered by current reseller ID)
  const [allResellerOrders, setAllResellerOrders] = useState<(Order & { profitBDT?: number; courier?: string })[]>(() =>
    getLocalOrInitial('zero_invest_reseller_orders', INITIAL_RESELLER_ORDERS)
  );

  // Sync any newly placed marketplace orders that belong to this reseller
  useEffect(() => {
    if (marketplaceOrders && marketplaceOrders.length > 0) {
      const relevant = marketplaceOrders.filter(
        o => o.resellerId === currentResellerId || o.items?.some(i => i.sellerId === currentResellerId)
      );
      if (relevant.length > 0) {
        setAllResellerOrders(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const toAdd = relevant.filter(r => !existingIds.has(r.id)).map(r => {
            const calculatedProfit = r.items?.reduce((acc, it) => {
              if (it.profitBDT !== undefined) return acc + it.profitBDT;
              const baseCost = it.baseCost !== undefined ? it.baseCost : 0;
              return acc + Math.max(0, it.price - baseCost) * it.quantity;
            }, 0) || Math.round(r.total * 0.25);

            return {
              ...r,
              resellerId: currentResellerId,
              profitBDT: calculatedProfit,
              courier: r.courier || 'Steadfast Courier'
            };
          });
          if (toAdd.length === 0) return prev;
          const merged = [...toAdd, ...prev];
          saveLocal('zero_invest_reseller_orders', merged);
          return merged;
        });
      }
    }
  }, [marketplaceOrders, currentResellerId]);

  const orders = useMemo(() => {
    const list = allResellerOrders.filter(o => o.resellerId === currentResellerId);
    if (list.length > 0) return list;
    return allResellerOrders;
  }, [allResellerOrders, currentResellerId]);

  // 4. Customers (Derived dynamically from reseller's real orders)
  const customers = useMemo<ResellerCustomer[]>(() => {
    const map = new Map<string, ResellerCustomer>();

    orders.forEach(ord => {
      const key = ord.customerId || ord.customerPhone || ord.customerEmail || ord.customerName;
      if (!key) return;

      const existing = map.get(key);
      const orderDate = ord.createdAt || new Date().toISOString();

      if (!existing) {
        map.set(key, {
          id: `cust-${key.replace(/[^a-zA-Z0-9]/g, '')}`,
          name: ord.customerName || 'Customer',
          phone: ord.customerPhone || ord.shippingAddress?.phone || '+8801700000000',
          email: ord.customerEmail || undefined,
          orderCount: 1,
          totalSpentBDT: ord.total || 0,
          lastOrderDate: orderDate,
          status: 'active'
        });
      } else {
        existing.orderCount += 1;
        existing.totalSpentBDT += (ord.total || 0);
        if (new Date(orderDate).getTime() > new Date(existing.lastOrderDate).getTime()) {
          existing.lastOrderDate = orderDate;
        }
      }
    });

    return Array.from(map.values()).sort((a, b) => b.totalSpentBDT - a.totalSpentBDT);
  }, [orders]);

  // 5. Wallets
  const [allWallets, setAllWallets] = useState<ResellerWallet[]>(() =>
    getLocalOrInitial('zero_invest_admin_wallets', INITIAL_ADMIN_WALLETS)
  );

  const wallet = useMemo<ResellerWallet>(() => {
    const found = allWallets.find(w => w.resellerId === currentResellerId);
    if (found) return found;
    return {
      resellerId: currentResellerId,
      resellerName: resellerProfile?.storeName || 'My Reseller Store',
      availableBalanceBDT: 4250,
      pendingBalanceBDT: 3450,
      totalEarningsBDT: 28400,
      totalWithdrawnBDT: 20700,
      updatedAt: new Date().toISOString()
    };
  }, [allWallets, currentResellerId, resellerProfile]);

  // 6. Transactions
  const [allTransactions, setAllTransactions] = useState<WalletTransaction[]>(() =>
    getLocalOrInitial('zero_invest_admin_transactions', INITIAL_ADMIN_TRANSACTIONS)
  );

  const transactions = useMemo(() => {
    const list = allTransactions.filter(t => t.resellerId === currentResellerId);
    if (list.length > 0) return list;
    return allTransactions;
  }, [allTransactions, currentResellerId]);

  // 7. Withdrawals
  const [allWithdrawals, setAllWithdrawals] = useState<ResellerWithdrawal[]>(() =>
    getLocalOrInitial('zero_invest_admin_withdrawals', INITIAL_ADMIN_WITHDRAWALS)
  );

  const withdrawals = useMemo(() => {
    const list = allWithdrawals.filter(w => w.resellerId === currentResellerId);
    if (list.length > 0) return list;
    return allWithdrawals;
  }, [allWithdrawals, currentResellerId]);

  // 8. Subscriptions & Plans
  const [allSubscriptions, setAllSubscriptions] = useState<ResellerSubscription[]>(() =>
    getLocalOrInitial('zero_invest_admin_subscriptions', INITIAL_ADMIN_SUBSCRIPTIONS)
  );

  const plans = RESELLER_PLANS;

  const subscription = useMemo<ResellerSubscription | null>(() => {
    const found = allSubscriptions.find(s => s.resellerId === currentResellerId);
    if (found) return found;
    // Default Pro active plan for demo
    return {
      id: `SUB-${currentResellerId}`,
      resellerId: currentResellerId,
      resellerName: resellerProfile.storeName,
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
    };
  }, [allSubscriptions, currentResellerId, resellerProfile]);

  // 9. Notifications
  const [allNotifications, setAllNotifications] = useState<ResellerNotification[]>(() =>
    getLocalOrInitial('zero_invest_reseller_notifications', INITIAL_RESELLER_NOTIFICATIONS)
  );

  const notifications = useMemo(() => {
    const list = allNotifications.filter(n => n.resellerId === currentResellerId);
    if (list.length > 0) return list;
    return allNotifications;
  }, [allNotifications, currentResellerId]);

  const unreadNotificationCount = useMemo(() => {
    return notifications.filter(n => !n.isRead).length;
  }, [notifications]);

  // Sync from Firestore if available
  useEffect(() => {
    if (!isFirebaseConfigured || !db) return;
    const firestore = db;

    let isMounted = true;
    const fetchRemoteData = async () => {
      try {
        setIsLoading(true);

        // Fetch store
        const storeDoc = await getDoc(doc(firestore, 'reseller_stores', currentResellerId));
        if (storeDoc.exists() && isMounted) {
          const remoteStore = storeDoc.data() as ResellerStore;
          setAllStores(prev => {
            const updated = prev.map(s => s.resellerId === currentResellerId ? remoteStore : s);
            if (!prev.some(s => s.resellerId === currentResellerId)) {
              updated.push(remoteStore);
            }
            saveLocal('zero_invest_admin_resellers', updated);
            return updated;
          });
        }

        // Fetch products
        const prodQuery = query(collection(firestore, 'reseller_products'), where('resellerId', '==', currentResellerId));
        const prodSnap = await getDocs(prodQuery);
        if (!prodSnap.empty && isMounted) {
          const remoteProds = prodSnap.docs.map(d => ({ id: d.id, ...d.data() } as ResellerProduct));
          setAllProducts(prev => {
            const others = prev.filter(p => p.resellerId !== currentResellerId);
            const merged = [...remoteProds, ...others];
            saveLocal('zero_invest_admin_products', merged);
            return merged;
          });
        }

        // Fetch wallet
        const walletDoc = await getDoc(doc(firestore, 'reseller_wallets', currentResellerId));
        if (walletDoc.exists() && isMounted) {
          const remoteWallet = walletDoc.data() as ResellerWallet;
          setAllWallets(prev => {
            const updated = prev.map(w => w.resellerId === currentResellerId ? remoteWallet : w);
            saveLocal('zero_invest_admin_wallets', updated);
            return updated;
          });
        }

        // Fetch notifications
        const notifQuery = query(collection(firestore, 'reseller_notifications'), where('resellerId', '==', currentResellerId));
        const notifSnap = await getDocs(notifQuery);
        if (!notifSnap.empty && isMounted) {
          const remoteNotifs = notifSnap.docs.map(d => ({ id: d.id, ...d.data() } as ResellerNotification));
          setAllNotifications(prev => {
            const others = prev.filter(n => n.resellerId !== currentResellerId);
            const merged = [...remoteNotifs, ...others];
            saveLocal('zero_invest_reseller_notifications', merged);
            return merged;
          });
        }
      } catch (err) {
        console.warn('[ResellerContext] Error syncing remote data:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    fetchRemoteData();

    // Attach real-time onSnapshot listener for orders
    let unsubOrders: (() => void) | null = null;
    try {
      unsubOrders = onSnapshot(collection(firestore, 'orders'), (snapshot) => {
        if (!isMounted || snapshot.empty) return;
        const remoteOrders: (Order & { profitBDT?: number; courier?: string })[] = [];

        snapshot.docs.forEach((docSnap) => {
          const data = docSnap.data();
          // Include order if it belongs to this reseller or has item for this reseller or is in demo mode
          const belongsToReseller = 
            data.resellerId === currentResellerId || 
            data.storeSlug === resellerProfile.storeSlug ||
            (data.items && Array.isArray(data.items) && data.items.some((it: any) => it.sellerId === currentResellerId)) ||
            currentResellerId === 'usr-res-01';

          if (belongsToReseller) {
            const rawTotal = Number(data.totalAmountBDT || data.totalAmount || data.total || 0);
            const rawProfit = data.profitBDT !== undefined 
              ? Number(data.profitBDT)
              : (data.resellerProfitBDT !== undefined 
                  ? Number(data.resellerProfitBDT) 
                  : Math.round(rawTotal * 0.25));

            remoteOrders.push({
              id: data.id || docSnap.id,
              orderNumber: data.orderNumber || docSnap.id,
              customerId: data.customerId || 'guest',
              customerName: data.customerName || 'Customer',
              customerPhone: data.customerPhone,
              customerEmail: data.customerEmail || '',
              items: (data.items || []).map((it: any) => ({
                productId: it.productId,
                productName: it.productName || it.name || 'Product',
                price: Number(it.price || it.sellingPriceBDT || 0),
                quantity: Number(it.quantity || 1),
                subtotal: Number(it.price || it.sellingPriceBDT || 0) * Number(it.quantity || 1),
                sellerId: it.sellerId || currentResellerId,
                imageUrl: it.imageUrl || ''
              })),
              shippingAddress: {
                fullName: data.customerName || 'Customer',
                street: data.customerAddress || data.shippingAddress?.street || 'Delivery Address',
                city: data.customerCity || data.shippingAddress?.city || 'Bangladesh',
                state: data.customerCity || data.shippingAddress?.state || 'BD',
                zipCode: data.shippingAddress?.zipCode || '1200',
                country: data.shippingAddress?.country || 'Bangladesh',
                phone: data.customerPhone || data.shippingAddress?.phone || ''
              },
              subtotal: Number(data.subtotal || rawTotal),
              shipping: Number(data.deliveryFeeBDT || data.deliveryFee || data.shipping || 70),
              discount: Number(data.discount || 0),
              total: rawTotal,
              paymentMethod: data.paymentMethod || 'cod',
              paymentStatus: data.paymentStatus || (data.paymentMethod === 'cod' ? 'unpaid_cod' : 'paid'),
              status: (data.status as OrderStatus) || 'Pending',
              courier: data.courier || data.carrier || 'Steadfast Courier',
              trackingNumber: data.trackingNumber || '',
              resellerId: data.resellerId || currentResellerId,
              profitBDT: rawProfit,
              createdAt: data.createdAt || new Date().toISOString()
            });
          }
        });

        if (remoteOrders.length > 0) {
          setAllResellerOrders((prev) => {
            const remoteMap = new Map(remoteOrders.map(o => [o.id, o]));
            const merged = [
              ...remoteOrders,
              ...prev.filter(p => !remoteMap.has(p.id) && p.resellerId !== currentResellerId)
            ];
            saveLocal('zero_invest_reseller_orders', merged);
            return merged;
          });
        }
      }, (err) => {
        console.warn('[ResellerContext] Real-time orders listener note:', err);
      });
    } catch (e) {
      console.warn('[ResellerContext] Failed to setup onSnapshot for orders:', e);
    }

    return () => {
      isMounted = false;
      if (unsubOrders) unsubOrders();
    };
  }, [currentResellerId, resellerProfile.storeSlug]);

  // ===================== ACTIONS =====================

  const switchResellerAccount = (resellerId: string) => {
    setSelectedDemoResellerId(resellerId);
    if (typeof window !== 'undefined') {
      localStorage.setItem('zero_invest_active_reseller_id', resellerId);
    }
    showToast('Account Switched', `Now managing workspace for ${resellerId}`, 'info');
  };

  const updateStoreProfile = async (updates: Partial<ResellerStore>): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const updatedProfile = {
        ...resellerProfile,
        ...updates,
        updatedAt: new Date().toISOString()
      };

      setAllStores(prev => {
        const updated = prev.map(s => (s.resellerId === currentResellerId || s.id === resellerProfile.id) ? updatedProfile : s);
        if (!prev.some(s => s.resellerId === currentResellerId || s.id === resellerProfile.id)) {
          updated.push(updatedProfile);
        }
        saveLocal('zero_invest_admin_resellers', updated);
        return updated;
      });

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'reseller_stores', resellerProfile.id), updatedProfile, { merge: true });
        } catch (e) {
          console.warn('[ResellerContext] updateStoreProfile Firebase error:', e);
        }
      }

      showToast('Store Updated', 'Store details saved successfully.', 'success');
      return true;
    } catch (err: any) {
      showToast('Update Failed', err.message || 'Could not update store', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const addCatalogProductToStore = async (
    productId: string, 
    sellingPrice: number
  ): Promise<{ success: boolean; error?: string }> => {
    setIsSubmitting(true);
    try {
      const platformProd = marketplaceProducts.find(p => p.id === productId);
      if (!platformProd) {
        showToast('Invalid Product', 'Product does not exist in the platform catalog.', 'error');
        return { success: false, error: 'Product not found in catalog' };
      }

      const baseCost = platformProd.supplierPrice || platformProd.price;
      const cleanSellingPrice = Math.max(0, Number(sellingPrice) || platformProd.suggestedPrice || platformProd.price);

      if (cleanSellingPrice < baseCost) {
        showToast('Pricing Notice', `Selling price is below wholesale base cost (৳${baseCost}).`, 'info');
      }

      const existingDocId = `rp-${currentResellerId}-${platformProd.id}`;
      const existing = allProducts.find(
        p => p.id === existingDocId || 
             (p.resellerId === currentResellerId && (p.originalProductId === platformProd.id || p.productId === platformProd.id))
      );

      const profit = Math.max(0, cleanSellingPrice - baseCost);

      const newProd: ResellerProduct = {
        id: existing ? existing.id : existingDocId,
        resellerId: currentResellerId,
        storeId: resellerProfile?.id || `store-${currentResellerId}`,
        originalProductId: platformProd.id,
        productId: platformProd.id,
        productName: platformProd.name,
        category: platformProd.category,
        imageUrl: platformProd.imageUrl,
        images: platformProd.additionalImages ? [platformProd.imageUrl, ...platformProd.additionalImages] : [platformProd.imageUrl],
        resellerPrice: baseCost,
        baseCost: baseCost,
        suggestedPrice: cleanSellingPrice,
        sellingPrice: cleanSellingPrice,
        sellingPriceBDT: cleanSellingPrice,
        potentialProfit: profit,
        description: platformProd.description,
        stock: platformProd.stockCount,
        status: 'active',
        isActive: true,
        createdAt: existing ? existing.createdAt : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      setAllProducts(prev => {
        const filtered = prev.filter(p => p.id !== newProd.id);
        const updated = [newProd, ...filtered];
        saveLocal('zero_invest_admin_products', updated);
        return updated;
      });

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'reseller_products', newProd.id), {
            id: newProd.id,
            resellerId: currentResellerId,
            storeId: newProd.storeId,
            originalProductId: platformProd.id,
            productName: platformProd.name,
            category: platformProd.category,
            imageUrl: platformProd.imageUrl,
            supplierPriceBDT: baseCost,
            resellerPrice: baseCost,
            sellingPriceBDT: cleanSellingPrice,
            suggestedPrice: cleanSellingPrice,
            sellingPrice: cleanSellingPrice,
            potentialProfit: profit,
            status: 'active',
            isActive: true,
            createdAt: newProd.createdAt,
            updatedAt: new Date().toISOString()
          });
        } catch (e) {
          console.warn('[ResellerContext] addCatalogProductToStore Firebase error:', e);
        }
      }

      showToast('Added from Catalog', `"${platformProd.name}" added to your store at ৳${cleanSellingPrice}.`, 'success');
      return { success: true };
    } catch (err: any) {
      showToast('Error', err.message || 'Could not add product from catalog', 'error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const addProduct = async (productData: Partial<ResellerProduct>): Promise<ResellerProduct> => {
    const targetProductId = productData.originalProductId || productData.productId;
    const platformProd = marketplaceProducts.find(p => p.id === targetProductId);

    if (!platformProd) {
      showToast('Action Blocked', 'Resellers can only add products that exist in the platform catalog.', 'error');
      throw new Error('Custom products are not allowed. Please select an approved catalog product.');
    }

    const price = productData.suggestedPrice || productData.sellingPrice || platformProd.suggestedPrice || platformProd.price;
    await addCatalogProductToStore(platformProd.id, price);

    const docId = `rp-${currentResellerId}-${platformProd.id}`;
    const baseCost = platformProd.supplierPrice || platformProd.price;
    return {
      id: docId,
      resellerId: currentResellerId,
      storeId: resellerProfile.id,
      originalProductId: platformProd.id,
      productId: platformProd.id,
      productName: platformProd.name,
      category: platformProd.category,
      imageUrl: platformProd.imageUrl,
      images: platformProd.additionalImages ? [platformProd.imageUrl, ...platformProd.additionalImages] : [platformProd.imageUrl],
      resellerPrice: baseCost,
      baseCost: baseCost,
      suggestedPrice: price,
      sellingPrice: price,
      sellingPriceBDT: price,
      potentialProfit: Math.max(0, price - baseCost),
      description: platformProd.description,
      stock: platformProd.stockCount,
      status: 'active',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  };

  const updateProduct = async (id: string, updates: Partial<ResellerProduct>): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      let updatedSellingPrice: number | undefined;
      let updatedIsActive: boolean | undefined;

      setAllProducts(prev => {
        const updated = prev.map(p => {
          if (p.id === id) {
            // Strict Rule: Resellers can ONLY update selling price and active status.
            // Title, images, category, base cost, stock, and descriptions are strictly immutable.
            const newSellingPrice = updates.sellingPrice !== undefined ? Number(updates.sellingPrice) 
              : (updates.suggestedPrice !== undefined ? Number(updates.suggestedPrice) 
              : (updates.sellingPriceBDT !== undefined ? Number(updates.sellingPriceBDT) : p.suggestedPrice));

            const baseCost = p.resellerPrice || p.baseCost || 0;
            const newIsActive = updates.isActive !== undefined ? updates.isActive : p.isActive;
            const newStatus = updates.status !== undefined ? updates.status : (newIsActive ? 'active' : 'inactive');

            updatedSellingPrice = newSellingPrice;
            updatedIsActive = newIsActive;

            return {
              ...p,
              suggestedPrice: newSellingPrice,
              sellingPrice: newSellingPrice,
              sellingPriceBDT: newSellingPrice,
              potentialProfit: Math.max(0, newSellingPrice - baseCost),
              isActive: newIsActive,
              status: newStatus,
              updatedAt: new Date().toISOString()
            };
          }
          return p;
        });
        saveLocal('zero_invest_admin_products', updated);
        return updated;
      });

      if (isFirebaseConfigured && db && updatedSellingPrice !== undefined) {
        try {
          const payload: any = {
            sellingPriceBDT: updatedSellingPrice,
            suggestedPrice: updatedSellingPrice,
            sellingPrice: updatedSellingPrice,
            updatedAt: serverTimestamp()
          };
          if (updatedIsActive !== undefined) {
            payload.isActive = updatedIsActive;
            payload.status = updatedIsActive ? 'active' : 'inactive';
          }
          await updateDoc(doc(db, 'reseller_products', id), payload);
        } catch (e) {
          console.warn('[ResellerContext] updateProduct Firebase error:', e);
        }
      }

      showToast('Selling Price Updated', 'Your storefront retail price has been updated.', 'success');
      return true;
    } catch (err: any) {
      showToast('Error', err.message || 'Could not update selling price', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteProduct = async (id: string): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      setAllProducts(prev => {
        const updated = prev.filter(p => p.id !== id);
        saveLocal('zero_invest_admin_products', updated);
        return updated;
      });

      showToast('Product Removed', 'Product has been removed from your catalog.', 'info');
      return true;
    } finally {
      setIsSubmitting(false);
    }
  };

  const toggleProductStatus = async (id: string): Promise<boolean> => {
    const target = allProducts.find(p => p.id === id);
    if (!target) return false;
    const nextState = !target.isActive;
    return await updateProduct(id, { isActive: nextState, status: nextState ? 'active' : 'inactive' });
  };

  const updateOrderStatus = async (
    orderId: string, 
    status: OrderStatus, 
    trackingNumber?: string, 
    courier?: string
  ): Promise<boolean> => {
    // Restrict edits to Admin only (resellers are read-only)
    if (role !== 'admin' && userProfile?.role !== 'admin') {
      showToast('Admin Only Action', 'Order status & courier dispatch are managed exclusively by Central Logistics Admins.', 'error');
      return false;
    }

    setIsSubmitting(true);
    try {
      setAllResellerOrders(prev => {
        const updated = prev.map(o => {
          if (o.id === orderId || o.orderNumber === orderId) {
            return {
              ...o,
              status,
              ...(trackingNumber ? { trackingNumber } : {}),
              ...(courier ? { courier } : {})
            };
          }
          return o;
        });
        saveLocal('zero_invest_reseller_orders', updated);
        return updated;
      });

      if (isFirebaseConfigured && db) {
        await updateDoc(doc(db, 'orders', orderId), {
          status,
          ...(trackingNumber ? { trackingNumber } : {}),
          ...(courier ? { courier, carrier: courier } : {}),
          updatedAt: new Date().toISOString()
        });
      }

      showToast('Order Updated', `Order status updated to ${status}.`, 'success');
      return true;
    } catch (e: any) {
      showToast('Error', e.message || 'Could not update order status', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const requestWithdrawal = async (data: {
    amount: number;
    method: string;
    accountDetails: any;
  }): Promise<{ success: boolean; error?: string }> => {
    setIsSubmitting(true);
    try {
      const amount = Number(data.amount);
      if (isNaN(amount) || amount <= 0) {
        showToast('Invalid Amount', 'Please enter a valid payout amount.', 'error');
        return { success: false, error: 'Invalid amount' };
      }

      if (amount < 500) {
        showToast('Minimum Withdrawal', 'Minimum payout request is ৳500.', 'error');
        return { success: false, error: 'Minimum payout request is ৳500' };
      }

      if (amount > wallet.availableBalanceBDT) {
        showToast('Insufficient Balance', `Available balance is ৳${wallet.availableBalanceBDT}.`, 'error');
        return { success: false, error: 'Insufficient available balance' };
      }

      // Create withdrawal request
      const withdrawalId = `WTH-${Math.floor(1000 + Math.random() * 9000)}`;
      const newWithdrawal: ResellerWithdrawal = {
        id: withdrawalId,
        resellerId: currentResellerId,
        resellerName: resellerProfile.storeName,
        resellerEmail: resellerProfile.contactEmail,
        amount,
        amountBDT: amount,
        method: data.method as any,
        accountDetails: data.accountDetails,
        status: 'Pending',
        requestedAt: new Date().toISOString()
      };

      // Add to withdrawals list
      setAllWithdrawals(prev => {
        const updated = [newWithdrawal, ...prev];
        saveLocal('zero_invest_admin_withdrawals', updated);
        return updated;
      });

      // Deduct from available balance, add to pending balance
      const newAvail = wallet.availableBalanceBDT - amount;
      const newPending = wallet.pendingBalanceBDT + amount;

      setAllWallets(prev => {
        const updated = prev.map(w => {
          if (w.resellerId === currentResellerId) {
            return {
              ...w,
              availableBalanceBDT: newAvail,
              pendingBalanceBDT: newPending,
              updatedAt: new Date().toISOString()
            };
          }
          return w;
        });
        saveLocal('zero_invest_admin_wallets', updated);
        return updated;
      });

      // Add debit transaction to ledger
      const newTx: WalletTransaction = {
        id: `tx-wth-${Date.now()}`,
        resellerId: currentResellerId,
        type: 'withdrawal',
        amountBDT: amount,
        direction: 'debit',
        description: `Payout request #${withdrawalId} (${data.method.toUpperCase()} to ${data.accountDetails?.accountNumber || data.accountDetails?.bankName || 'account'})`,
        referenceId: withdrawalId,
        status: 'pending',
        createdAt: new Date().toISOString()
      };

      setAllTransactions(prev => {
        const updated = [newTx, ...prev];
        saveLocal('zero_invest_admin_transactions', updated);
        return updated;
      });

      // Notify reseller
      const resNotif: ResellerNotification = {
        id: `rn-${Date.now()}`,
        resellerId: currentResellerId,
        title: 'Withdrawal Request Submitted',
        message: `Your request #${withdrawalId} for ৳${amount.toLocaleString()} via ${data.method.toUpperCase()} is under review by finance.`,
        type: 'info',
        isRead: false,
        createdAt: new Date().toISOString(),
        link: 'withdrawals'
      };

      setAllNotifications(prev => {
        const updated = [resNotif, ...prev];
        saveLocal('zero_invest_reseller_notifications', updated);
        return updated;
      });

      // Fan-out to Firestore if configured
      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'reseller_withdrawals', withdrawalId), newWithdrawal);
          await updateDoc(doc(db, 'reseller_wallets', currentResellerId), {
            availableBalanceBDT: newAvail,
            pendingBalanceBDT: newPending,
            updatedAt: serverTimestamp()
          });
          await addDoc(collection(db, 'reseller_transactions'), newTx);
          // Notify admin
          await addDoc(collection(db, 'admin_notifications'), {
            id: `notif-${Date.now()}`,
            title: 'New Withdrawal Payout Request',
            message: `${resellerProfile.storeName} requested ৳${amount} payout to ${data.method.toUpperCase()}.`,
            type: 'alert',
            createdAt: new Date().toISOString(),
            isRead: false,
            link: 'withdrawals'
          });
        } catch (e) {
          console.warn('[ResellerContext] requestWithdrawal Firebase error:', e);
        }
      }

      showToast('Payout Requested', `Payout #${withdrawalId} of ৳${amount} submitted for processing.`, 'success');
      return { success: true };
    } catch (err: any) {
      showToast('Request Failed', err.message || 'Could not submit withdrawal request', 'error');
      return { success: false, error: err.message };
    } finally {
      setIsSubmitting(false);
    }
  };

  const changeSubscription = async (
    planId: string, 
    paymentMethod: string = 'bkash', 
    trxId?: string
  ): Promise<boolean> => {
    setIsSubmitting(true);
    try {
      const selectedPlan = plans.find(p => p.id === planId);
      if (!selectedPlan) throw new Error('Selected plan not found');

      const isFree = selectedPlan.priceBDT === 0;
      const subId = `SUB-${Math.floor(100 + Math.random() * 900)}`;

      const newSub: ResellerSubscription = {
        id: subId,
        resellerId: currentResellerId,
        resellerName: resellerProfile.storeName,
        resellerEmail: resellerProfile.contactEmail,
        plan: selectedPlan.id,
        planName: selectedPlan.name,
        priceBDT: selectedPlan.priceBDT,
        billingCycle: 'monthly',
        startDate: new Date().toISOString(),
        expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        durationDays: 30,
        status: isFree ? 'active' : 'pending_payment',
        paymentMethod,
        transactionId: trxId || (isFree ? 'FREE' : `BK-${Date.now().toString().slice(-6)}`),
        createdAt: new Date().toISOString()
      };

      setAllSubscriptions(prev => {
        const filtered = prev.filter(s => s.resellerId !== currentResellerId);
        const updated = [newSub, ...filtered];
        saveLocal('zero_invest_admin_subscriptions', updated);
        return updated;
      });

      if (isFirebaseConfigured && db) {
        try {
          await setDoc(doc(db, 'reseller_subscriptions', subId), newSub);
        } catch (e) {
          console.warn('[ResellerContext] changeSubscription Firebase error:', e);
        }
      }

      showToast(
        isFree ? 'Plan Activated' : 'Subscription Submitted',
        isFree 
          ? `You are now on the ${selectedPlan.name} plan.` 
          : `Plan ${selectedPlan.name} renewal submitted. Verifying payment transaction.`,
        'success'
      );
      return true;
    } catch (err: any) {
      showToast('Subscription Error', err.message || 'Failed to update plan', 'error');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const markNotificationRead = async (id: string) => {
    setAllNotifications(prev => {
      const updated = prev.map(n => n.id === id ? { ...n, isRead: true } : n);
      saveLocal('zero_invest_reseller_notifications', updated);
      return updated;
    });

    if (isFirebaseConfigured && db) {
      try {
        await updateDoc(doc(db, 'reseller_notifications', id), { isRead: true });
      } catch (e) {
        console.warn('[ResellerContext] markNotificationRead Firebase error:', e);
      }
    }
  };

  const markAllNotificationsRead = async () => {
    setAllNotifications(prev => {
      const updated = prev.map(n => n.resellerId === currentResellerId ? { ...n, isRead: true } : n);
      saveLocal('zero_invest_reseller_notifications', updated);
      return updated;
    });
    showToast('Notifications Cleared', 'All notifications marked as read.', 'info');
  };

  // Marketplace helper bridges
  const addProductToCatalog = async (product: Product, suggestedPrice: number, _description?: string) => {
    return await addCatalogProductToStore(product.id, suggestedPrice);
  };

  const quickGenerateLandingPage = async (product: Product) => {
    const storeSlug = resellerProfile?.storeSlug || 'store';
    const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    return { storeSlug, productSlug };
  };

  const registerReseller = async (data: any) => {
    const newStore: ResellerStore = {
      id: `store-${Date.now()}`,
      resellerId: user?.uid || `reseller-${Date.now()}`,
      storeName: data.storeName || 'My Store',
      storeSlug: (data.storeName || 'store').toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await updateStoreProfile(newStore);
    return { success: true };
  };

  return (
    <ResellerContext.Provider value={{
      isReseller,
      currentResellerId,
      resellerProfile,
      activeSection,
      setActiveSection,
      products,
      orders,
      customers,
      wallet,
      transactions,
      withdrawals,
      subscription,
      plans,
      notifications,
      unreadNotificationCount,
      isLoading,
      isSubmitting,
      updateStoreProfile,
      addProduct,
      addCatalogProductToStore,
      updateProduct,
      deleteProduct,
      toggleProductStatus,
      updateOrderStatus,
      requestWithdrawal,
      changeSubscription,
      markNotificationRead,
      markAllNotificationsRead,
      switchResellerAccount,
      isVerificationModalOpen,
      openVerificationModal,
      closeVerificationModal,
      currentApplication,
      isSubmittingApplication,
      submitResellerApplication,
      addProductToCatalog,
      quickGenerateLandingPage,
      registerReseller
    }}>
      {children}
    </ResellerContext.Provider>
  );
}

export function useReseller() {
  const context = useContext(ResellerContext);
  if (!context) {
    throw new Error('useReseller must be used within a ResellerProvider');
  }
  return context;
}
