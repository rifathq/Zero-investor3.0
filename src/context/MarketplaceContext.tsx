'use client';

import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import { 
  Product, 
  Category, 
  Seller, 
  CartItem, 
  Order, 
  SellerOrder,
  Coupon, 
  ActiveView, 
  UserRole,
  OrderStatus,
  BulkPricingTier,
  Review
} from '@/types/marketplace';
import { 
  PRODUCTS as INITIAL_PRODUCTS, 
  CATEGORIES as INITIAL_CATEGORIES, 
  SELLERS as INITIAL_SELLERS, 
  DEMO_ORDERS as INITIAL_ORDERS,
  DEMO_COUPONS,
  DEMO_REVIEWS
} from '@/lib/mockData';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, setDoc, collection, getDocs, query, where, getDoc, updateDoc, deleteField } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import { 
  cartApi, 
  orderApi, 
  productApi, 
  inventoryApi, 
  shippingApi, 
  paymentApi,
  SellerCartGroup,
  CartCalculationResult
} from '@/services';
import { categoryService } from '@/services/categoryService';

export interface ToastMessage {
  id: string;
  title: string;
  message: string;
  type: 'success' | 'info' | 'error';
}

interface MarketplaceContextType {
  // Navigation & view
  activeView: ActiveView;
  navigate: (view: ActiveView, options?: { 
    productId?: string; 
    sellerId?: string; 
    category?: string; 
    subcategory?: string; 
    query?: string; 
    accountTab?: 'orders' | 'wishlist' | 'addresses' | 'profile' | 'security'; 
    authTab?: 'signin' | 'register';
    returnUrl?: string; 
    storeSlug?: string; 
    productSlug?: string 
  }) => void;
  activeStoreSlug?: string;
  activeProductSlug?: string;
  accountTab: 'orders' | 'wishlist' | 'addresses' | 'profile' | 'security';
  setAccountTab: (tab: 'orders' | 'wishlist' | 'addresses' | 'profile' | 'security') => void;
  authTab: 'signin' | 'register';
  setAuthTab: (tab: 'signin' | 'register') => void;
  selectedProduct: Product | null;
  setSelectedProduct: (product: Product | null) => void;
  selectedSeller: Seller | null;
  setSelectedSeller: (seller: Seller | null) => void;
  selectedCategory: string | null;
  setSelectedCategory: (cat: string | null) => void;
  selectedSubcategory: string | null;
  setSelectedSubcategory: (subcat: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Products & entities
  products: Product[];
  categories: Category[];
  isLoadingCategories: boolean;
  categoryError: string | null;
  addCategory: (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Category>;
  updateCategory: (id: string, updates: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string, moveProductsToCategoryId?: string) => Promise<void>;
  reorderCategories: (orderedIds: string[]) => Promise<void>;
  toggleCategoryStatus: (id: string) => Promise<void>;
  toggleCategoryFeatured: (id: string) => Promise<void>;
  sellers: Seller[];
  orders: Order[];
  
  // Multi-vendor Cart
  cart: CartItem[];
  cartCount: number;
  cartSubtotal: number;
  bulkSavingsTotal: number;
  appliedCoupon: Coupon | null;
  discountAmount: number;
  shippingAmount: number;
  cartTotal: number;
  sellerCartGroups: Record<string, SellerCartGroup>;
  shippingMethod: 'standard' | 'express';
  setShippingMethod: (method: 'standard' | 'express') => void;
  addToCart: (product: Product, quantity?: number, options?: { color?: string; size?: string; variantId?: string; variantName?: string }) => void;
  updateCartQuantity: (cartItemId: string, delta: number) => void;
  setCartItemQuantity: (cartItemId: string, quantity: number) => void;
  removeFromCart: (cartItemId: string) => void;
  clearCart: () => void;
  applyCoupon: (code: string) => Promise<boolean>;
  removeCoupon: () => void;
  
  // Wishlist
  wishlist: string[];
  toggleWishlist: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  removeFromWishlist: (productId: string) => void;
  clearWishlist: () => void;
  moveAllWishlistToCart: () => void;
  
  // Orders & Multi-vendor Checkout
  placeOrder: (orderData: {
    customerName: string;
    customerEmail: string;
    shippingAddress: {
      fullName: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone: string;
    };
    paymentMethod: 'card' | 'cod' | 'mobile_money';
    mobileProvider?: 'bkash' | 'nagad' | 'rocket';
  }) => Promise<Order>;
  trackOrderById: (orderNumber: string) => Promise<{ order: Order; matchedSubOrder?: SellerOrder } | null>;
  
  // Seller / Admin actions
  addProduct: (product: Partial<Product>) => void;
  updateProduct: (productId: string, updates: Partial<Product>) => void;
  deleteProduct: (productId: string) => void;
  updateProductStock: (productId: string, inStock: boolean, newCount?: number) => void;
  updateSubOrderStatus: (subOrderId: string, status: OrderStatus, trackingNumber?: string) => void;
  approveSeller: (sellerId: string) => void;
  rejectSeller: (sellerId: string) => void;
  
  // User persona
  currentUser: { 
    id: string; 
    name: string; 
    email: string;
    isAuthenticated: boolean;
    role: UserRole;
    avatarUrl?: string;
  };
  userRole: UserRole;
  setUserRole: (role: UserRole) => void;
  
  // Reviews
  reviews: Review[];
  getProductReviews: (productId: string) => Review[];
  addReview: (reviewData: {
    productId: string;
    author: string;
    rating: number;
    title: string;
    comment: string;
    orderNumber?: string;
    recommended?: boolean;
  }) => Promise<{ success: boolean; error?: string }>;
  markReviewHelpful: (reviewId: string) => void;
  checkVerifiedPurchase: (productId: string, orderNumberOrEmail?: string) => {
    isVerified: boolean;
    orderNumber?: string;
    orderDate?: string;
    matchedOrder?: Order;
  };
  
  // Toasts
  toasts: ToastMessage[];
  showToast: (title: string, message: string, type?: 'success' | 'info' | 'error') => void;
  dismissToast: (id: string) => void;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export function MarketplaceProvider({ children }: { children: React.ReactNode }) {
  const { user, userProfile, role, updateRole } = useAuth();

  const [activeView, setActiveView] = useState<ActiveView>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path === '/auth' || path.startsWith('/auth')) {
        return 'auth';
      }
      if (path === '/admin' || path.startsWith('/admin')) {
        return 'admin-dashboard';
      }
      if (path === '/reseller' || path.startsWith('/reseller') || path === '/start-selling' || path.startsWith('/start-selling')) {
        return 'reseller';
      }
      if (path === '/search' || path.startsWith('/search')) {
        return 'search';
      }
      if (path.startsWith('/r/') || path.startsWith('/store/')) {
        const parts = path.replace(/^\/(r|store)\//, '').split('/').filter(Boolean);
        if (parts.length >= 2) {
          return 'reseller-public-landing';
        }
        if (parts.length === 1) {
          return 'reseller-public-store';
        }
      }
      if (path === '/artisan-seller' || path.startsWith('/artisan-seller')) {
        return 'reseller-public-store';
      }
    }
    return 'home';
  });
  const [accountTab, setAccountTab] = useState<'orders' | 'wishlist' | 'addresses' | 'profile' | 'security'>('orders');
  const [authTab, setAuthTab] = useState<'signin' | 'register'>('signin');
  const [products, setProducts] = useState<Product[]>(INITIAL_PRODUCTS);
  const [rawCategories, setRawCategories] = useState<Category[]>(() => INITIAL_CATEGORIES);
  const [isLoadingCategories, setIsLoadingCategories] = useState<boolean>(true);
  const [categoryError, setCategoryError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoadingCategories(true);
    const unsubscribe = categoryService.subscribe(
      (updated) => {
        setRawCategories(updated);
        setIsLoadingCategories(false);
        setCategoryError(null);
      },
      (err) => {
        setCategoryError(err.message || 'Unable to load categories.');
        setIsLoadingCategories(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Dynamically computed categories with live accurate productCount from current products
  const categories = useMemo(() => {
    return rawCategories.map((cat) => {
      const count = products.filter((p) => {
        if (p.isActive === false) return false;
        if (p.categoryId && p.categoryId === cat.id) return true;
        if (p.category && (
          p.category.toLowerCase() === cat.name.toLowerCase() ||
          p.category.toLowerCase() === cat.slug.toLowerCase() ||
          p.category.toLowerCase() === cat.id.toLowerCase()
        )) return true;
        return false;
      }).length;
      return {
        ...cat,
        productCount: count
      };
    });
  }, [rawCategories, products]);
  const [sellers, setSellers] = useState<Seller[]>(INITIAL_SELLERS);
  
  const [orders, setOrders] = useState<Order[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('zero_invest_orders_guest');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Fall back to default
      }
    }
    return INITIAL_ORDERS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  
  // Storage Keys & Purge Utility for Wishlist Persistence
  const WISHLIST_CLEANUP_VERSION_KEY = 'zero_invest_wishlist_clean_v2026';
  const LEGACY_WISHLIST_MOCK_ITEMS = useMemo(() => new Set(['prod-earbuds-pro', 'prod-scented-candle']), []);

  const getWishlistStorageKey = (uid?: string | null): string => {
    if (uid && uid.trim().length > 0) {
      return `zero_invest_wishlist_${uid.trim()}`;
    }
    return 'zero_invest_wishlist_guest';
  };

  const purgeStaleWishlistStorage = (currentUid?: string | null): void => {
    if (typeof window === 'undefined') return;
    try {
      const hasPurged = localStorage.getItem(WISHLIST_CLEANUP_VERSION_KEY);
      if (!hasPurged) {
        // 1. Remove legacy global and guest keys
        const legacyKeys = [
          'wishlist',
          'zero_invest_wishlist',
          'zero_invest_wishlist_guest',
          'savedProducts',
          'saved_products',
          'wishlistItems'
        ];
        legacyKeys.forEach(key => {
          try {
            localStorage.removeItem(key);
            sessionStorage.removeItem(key);
          } catch { /* ignore */ }
        });

        // 2. Clear any old user-specific wishlist keys from localStorage & sessionStorage
        const keysToRemove: string[] = [];
        for (let i = 0; i < localStorage.length; i++) {
          const k = localStorage.key(i);
          if (k && (k.startsWith('zero_invest_wishlist_') || k.includes('wishlist'))) {
            keysToRemove.push(k);
          }
        }
        keysToRemove.forEach(k => {
          try { localStorage.removeItem(k); } catch { /* ignore */ }
        });

        const sessionKeysToRemove: string[] = [];
        for (let i = 0; i < sessionStorage.length; i++) {
          const k = sessionStorage.key(i);
          if (k && (k.startsWith('zero_invest_wishlist_') || k.includes('wishlist'))) {
            sessionKeysToRemove.push(k);
          }
        }
        sessionKeysToRemove.forEach(k => {
          try { sessionStorage.removeItem(k); } catch { /* ignore */ }
        });

        // Mark migration complete so future user additions are preserved
        localStorage.setItem(WISHLIST_CLEANUP_VERSION_KEY, 'true');
      }
    } catch (err) {
      console.warn('[Wishlist] Storage purge warning:', err);
    }
  };

  const [wishlist, setWishlist] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const hasPurged = localStorage.getItem('zero_invest_wishlist_clean_v2026');
        if (!hasPurged) {
          // Immediately purge old stale mock data on initial load
          const legacyKeys = [
            'wishlist',
            'zero_invest_wishlist',
            'zero_invest_wishlist_guest',
            'savedProducts',
            'saved_products',
            'wishlistItems'
          ];
          legacyKeys.forEach(k => {
            try {
              localStorage.removeItem(k);
              sessionStorage.removeItem(k);
            } catch { /* ignore */ }
          });
          for (let i = localStorage.length - 1; i >= 0; i--) {
            const k = localStorage.key(i);
            if (k && (k.startsWith('zero_invest_wishlist_') || k.includes('wishlist'))) {
              localStorage.removeItem(k);
            }
          }
          localStorage.setItem('zero_invest_wishlist_clean_v2026', 'true');
        } else {
          const stored = localStorage.getItem('zero_invest_wishlist_guest');
          if (stored) {
            const parsed = JSON.parse(stored);
            if (Array.isArray(parsed)) {
              // Strip out any legacy mock items
              return parsed.filter((id: any) => typeof id === 'string' && id !== 'prod-earbuds-pro' && id !== 'prod-scented-candle');
            }
          }
        }
      } catch {
        // Fall back to empty array
      }
    }
    // Always start with a clean empty array if no valid wishlist data exists - NEVER mock data
    return [];
  });

  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [shippingMethod, setShippingMethod] = useState<'standard' | 'express'>('standard');
  
  const [reviews, setReviews] = useState<Review[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('zero_invest_reviews');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            return parsed;
          }
        }
      } catch {
        // Fall back to default
      }
    }
    return DEMO_REVIEWS;
  });
  
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(INITIAL_PRODUCTS[0]);
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(INITIAL_SELLERS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  const [userRoleState, setUserRoleState] = useState<UserRole>('customer');

  useEffect(() => {
    if (role) {
      setUserRoleState(role);
    }
  }, [role]);

  const userRole = (userProfile?.role || role || userRoleState) as UserRole;

  const setUserRole = (newRole: UserRole) => {
    setUserRoleState(newRole);
    updateRole(newRole);
  };

  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [activeStoreSlug, setActiveStoreSlug] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/r/') || path.startsWith('/store/')) {
        const parts = path.replace(/^\/(r|store)\//, '').split('/').filter(Boolean);
        if (parts.length > 0) return parts[0];
      }
      if (path === '/artisan-seller' || path.startsWith('/artisan-seller')) {
        return 'artisan-seller';
      }
    }
    return undefined;
  });
  const [activeProductSlug, setActiveProductSlug] = useState<string | undefined>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname.toLowerCase();
      if (path.startsWith('/r/') || path.startsWith('/store/')) {
        const parts = path.replace(/^\/(r|store)\//, '').split('/').filter(Boolean);
        if (parts.length >= 2) return parts[1];
      }
    }
    return undefined;
  });

  // Sync user-specific orders from Firestore and cache when authenticated user changes
  useEffect(() => {
    let isMounted = true;
    if (typeof window !== 'undefined' && user?.uid) {
      // 1. Check local cache
      try {
        const userOrdersKey = `zero_invest_orders_${user.uid}`;
        const stored = localStorage.getItem(userOrdersKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setOrders(prev => {
              const existingIds = new Set(prev.map(o => o.id));
              const newOrders = parsed.filter((o: Order) => !existingIds.has(o.id));
              return [...newOrders, ...prev];
            });
          }
        }
      } catch {
        // ignore
      }

      // 2. Fetch remote orders from Firestore
      if (isFirebaseConfigured && db) {
        const ordersRef = collection(db, 'orders');
        const q = query(ordersRef, where('customerId', '==', user.uid));
        getDocs(q).then(snapshot => {
          if (!isMounted || snapshot.empty) return;
          const remoteOrders: Order[] = snapshot.docs.map(docSnap => {
            const data = docSnap.data();
            const totalVal = Number(data.totalAmountBDT || data.total || 0);
            const shippingVal = Number(data.deliveryFeeBDT || data.shipping || 0);
            return {
              id: data.id || docSnap.id,
              orderNumber: data.orderNumber || docSnap.id,
              customerId: data.customerId || user.uid,
              customerName: data.customerName || 'Customer',
              customerEmail: data.customerEmail || user.email || '',
              items: (data.items || []).map((it: any) => ({
                productId: it.productId,
                productName: it.productName || it.name || '',
                name: it.productName || it.name || '',
                price: it.price || it.sellingPriceBDT || 0,
                quantity: it.quantity || 1,
                subtotal: (it.price || it.sellingPriceBDT || 0) * (it.quantity || 1),
                sellerId: it.sellerId || 'seller-1',
                sellerName: it.sellerName || 'Marketplace Seller',
                imageUrl: it.imageUrl || ''
              })),
              subtotal: Math.max(0, totalVal - shippingVal),
              shipping: shippingVal,
              discount: Number(data.discount || 0),
              total: totalVal,
              status: data.status || 'Pending',
              paymentMethod: data.paymentMethod || 'Cash on Delivery',
              paymentStatus: (data.status === 'Delivered' ? 'paid' : 'pending') as 'pending' | 'paid',
              shippingAddress: {
                fullName: data.customerName || 'Customer',
                phone: data.customerPhone || '',
                street: data.customerAddress || '',
                city: data.customerCity || 'Dhaka',
                state: 'Dhaka',
                zipCode: '1200',
                country: 'Bangladesh'
              },
              trackingNumber: `TRACK-${data.orderNumber || docSnap.id}`,
              createdAt: data.createdAt || new Date().toISOString()
            };
          });

          setOrders(prev => {
            const existingIds = new Set(prev.map(o => o.id));
            const fresh = remoteOrders.filter(o => !existingIds.has(o.id));
            const merged = [...fresh, ...prev];
            try {
              localStorage.setItem(`zero_invest_orders_${user.uid}`, JSON.stringify(merged));
            } catch {
              // ignore
            }
            return merged;
          });
        }).catch(err => {
          console.warn('Could not query customer orders from Firestore:', err);
        });
      }
    }
    return () => { isMounted = false; };
  }, [user?.uid]);

  // Sync user-specific wishlist when authenticated user changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    // Purge stale storage once if not yet done
    purgeStaleWishlistStorage(user?.uid);

    const storageKey = getWishlistStorageKey(user?.uid);
    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          // Sanitize to guarantee no legacy mock items reappear
          const sanitized = parsed.filter((id: any) => typeof id === 'string' && !LEGACY_WISHLIST_MOCK_ITEMS.has(id));
          setWishlist(sanitized);
          return;
        }
      }
    } catch (err) {
      console.warn('[Wishlist] Error loading user wishlist from localStorage:', err);
    }

    // Explicitly set to empty array if no saved items exist - NEVER fallback to mock data
    setWishlist([]);

    // Check if Firestore user document has any legacy wishlist field and remove it safely
    if (isFirebaseConfigured && db && user?.uid) {
      const userRef = doc(db, 'users', user.uid);
      getDoc(userRef).then(snap => {
        if (snap.exists()) {
          const data = snap.data();
          if (data && 'wishlist' in data) {
            updateDoc(userRef, { wishlist: deleteField() }).catch(() => {
              // Ignore if security rules restrict field deletion
            });
          }
        }
      }).catch(() => {
        // Ignore permission checks
      });
    }
  }, [user?.uid]);

  // Persist wishlist whenever state or user changes
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const storageKey = getWishlistStorageKey(user?.uid);
    try {
      localStorage.setItem(storageKey, JSON.stringify(wishlist));
    } catch (err) {
      console.warn('[Wishlist] Failed to persist wishlist to localStorage:', err);
    }
  }, [wishlist, user?.uid]);

  // Load reviews from Firestore on mount to ensure persistent retrieval across browser refreshes
  useEffect(() => {
    let isMounted = true;
    async function loadFirestoreReviews() {
      if (!isFirebaseConfigured || !db) return;
      try {
        const reviewsRef = collection(db, 'reviews');
        const snap = await getDocs(reviewsRef);
        if (!snap.empty && isMounted) {
          const remoteReviews: Review[] = [];
          snap.forEach(docSnap => {
            const data = docSnap.data() as Review;
            remoteReviews.push({
              ...data,
              id: docSnap.id
            });
          });
          setReviews(prev => {
            const map = new Map<string, Review>();
            DEMO_REVIEWS.forEach(r => map.set(r.id, r));
            prev.forEach(r => map.set(r.id, r));
            remoteReviews.forEach(r => map.set(r.id, r));
            const merged = Array.from(map.values());
            if (typeof window !== 'undefined') {
              try {
                localStorage.setItem('zero_invest_reviews', JSON.stringify(merged));
              } catch {
                // ignore
              }
            }
            return merged;
          });
        }
      } catch (err) {
        console.warn('Could not fetch reviews from Firestore:', err);
      }
    }
    loadFirestoreReviews();
    return () => { isMounted = false; };
  }, []);

  // Sync browser back/forward buttons with routes
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const searchParams = new URLSearchParams(window.location.search);
      const q = searchParams.get('q');
      if (q) {
        setSearchQuery(q);
      }

      const handlePopState = () => {
        const path = window.location.pathname.toLowerCase();
        const params = new URLSearchParams(window.location.search);
        const popQ = params.get('q');
        if (path === '/auth' || path.startsWith('/auth')) {
          setActiveView('auth');
        } else if (path === '/admin' || path.startsWith('/admin')) {
          setActiveView('admin-dashboard');
        } else if (path === '/reseller' || path.startsWith('/reseller') || path === '/start-selling' || path.startsWith('/start-selling')) {
          setActiveView('reseller');
        } else if (path === '/search' || path.startsWith('/search')) {
          if (popQ !== null) setSearchQuery(popQ);
          setActiveView('search');
        } else if (path.startsWith('/r/') || path.startsWith('/store/')) {
          const parts = path.replace(/^\/(r|store)\//, '').split('/').filter(Boolean);
          if (parts.length >= 2) {
            setActiveStoreSlug(parts[0]);
            setActiveProductSlug(parts[1]);
            setActiveView('reseller-public-landing');
          } else if (parts.length === 1) {
            setActiveStoreSlug(parts[0]);
            setActiveView('reseller-public-store');
          }
        } else if (path === '/artisan-seller' || path.startsWith('/artisan-seller')) {
          setActiveStoreSlug('artisan-seller');
          setActiveView('reseller-public-store');
        } else if (path === '/' || path === '') {
          setActiveView('home');
        }
      };

      window.addEventListener('popstate', handlePopState);
      return () => window.removeEventListener('popstate', handlePopState);
    }
  }, []);

  // Navigation handler
  const navigate = (view: ActiveView, options?: { 
    productId?: string; 
    sellerId?: string; 
    category?: string; 
    subcategory?: string; 
    query?: string; 
    accountTab?: 'orders' | 'wishlist' | 'addresses' | 'profile' | 'security';
    authTab?: 'signin' | 'register';
    returnUrl?: string; 
    storeSlug?: string; 
    productSlug?: string;
  }) => {
    if (options?.authTab) {
      setAuthTab(options.authTab);
    }
    if (options?.storeSlug !== undefined) {
      setActiveStoreSlug(options.storeSlug);
    }
    if (options?.productSlug !== undefined) {
      setActiveProductSlug(options.productSlug);
    }
    if (options?.accountTab) {
      setAccountTab(options.accountTab);
    }
    if (options?.productId) {
      const prod = products.find(p => p.id === options.productId);
      if (prod) setSelectedProduct(prod);
    }
    if (options?.sellerId) {
      const seller = sellers.find(s => s.id === options.sellerId);
      if (seller) setSelectedSeller(seller);
    }
    if (options?.category !== undefined) {
      setSelectedCategory(options.category);
    }
    if (options?.subcategory !== undefined) {
      setSelectedSubcategory(options.subcategory);
    }
    if (options?.query !== undefined) {
      setSearchQuery(options.query);
    }

    const targetView: ActiveView = view === 'seller-dashboard' ? 'reseller' : view === 'start-selling' ? 'reseller' : view;

    if (typeof window !== 'undefined') {
      if (targetView === 'auth') {
        if (window.location.pathname !== '/auth') {
          window.history.pushState({}, '', '/auth');
        }
      } else if (targetView === 'admin-dashboard') {
        if (window.location.pathname !== '/admin') {
          window.history.pushState({}, '', '/admin');
        }
      } else if (targetView === 'reseller') {
        if (window.location.pathname !== '/reseller') {
          window.history.pushState({}, '', '/reseller');
        }
      } else if (targetView === 'search') {
        const queryParam = options?.query !== undefined ? options.query : searchQuery;
        const searchUrl = `/search${queryParam.trim() ? `?q=${encodeURIComponent(queryParam.trim())}` : ''}`;
        if (window.location.pathname + window.location.search !== searchUrl) {
          window.history.pushState({}, '', searchUrl);
        }
      } else if (targetView === 'reseller-public-store') {
        const sSlug = options?.storeSlug || activeStoreSlug || 'store';
        const targetUrl = `/r/${sSlug}`;
        if (window.location.pathname !== targetUrl) {
          window.history.pushState({}, '', targetUrl);
        }
      } else if (targetView === 'reseller-public-landing') {
        const sSlug = options?.storeSlug || activeStoreSlug || 'store';
        const pSlug = options?.productSlug || activeProductSlug || 'offer';
        const targetUrl = `/r/${sSlug}/${pSlug}`;
        if (window.location.pathname !== targetUrl) {
          window.history.pushState({}, '', targetUrl);
        }
      } else if (targetView === 'home') {
        if (window.location.pathname === '/auth' || window.location.pathname === '/admin' || window.location.pathname === '/reseller' || window.location.pathname === '/start-selling' || window.location.pathname === '/search' || window.location.pathname.startsWith('/r/')) {
          window.history.pushState({}, '', '/');
        }
      }
    }

    setActiveView(targetView);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Toast handlers
  const showToast = (title: string, message: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString() + Math.random().toString(36).substring(2, 6);
    setToasts(prev => [...prev, { id, title, message, type }]);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        setToasts(prev => prev.slice(1));
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Dynamic Multi-Vendor Cart Calculations using Cart API
  const cartCalculation: CartCalculationResult = useMemo(() => {
    return cartApi.calculateMarketplaceTotals(cart, sellers, appliedCoupon, shippingMethod);
  }, [cart, sellers, appliedCoupon, shippingMethod]);

  const {
    sellerGroups: sellerCartGroups,
    grossSubtotal: cartSubtotal,
    bulkSavingsTotal,
    totalShipping: shippingAmount,
    discountAmount,
    finalTotal: cartTotal,
    totalItemsCount: cartCount
  } = cartCalculation;

  // Cart operations with Volume / Bulk Pricing and Stock Validation
  const addToCart = (
    product: Product, 
    quantity = 1, 
    options?: { color?: string; size?: string; variantId?: string; variantName?: string }
  ) => {
    if (!product.inStock || product.stockCount <= 0) {
      showToast('Out of Stock', `Sorry, "${product.name}" is currently out of stock.`, 'error');
      return;
    }

    const availableStock = product.stockCount;
    const requestedQty = Math.max(1, quantity);

    setCart(prev => {
      const existingIndex = prev.findIndex(item => 
        item.productId === product.id && 
        item.selectedColor === options?.color && 
        item.selectedSize === options?.size &&
        item.variantId === options?.variantId
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        const newTotalQty = updated[existingIndex].quantity + requestedQty;
        const finalQty = Math.min(newTotalQty, availableStock);

        // Recalculate price considering bulk volume tiers
        const pricing = cartApi.calculateEffectiveUnitPrice(product, finalQty);

        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: finalQty,
          price: pricing.unitPrice,
          baseCost: product.supplierPrice || product.price,
          bulkTierApplied: pricing.bulkTierApplied,
          maxStock: availableStock
        };
        return updated;
      } else {
        const finalQty = Math.min(requestedQty, availableStock);
        const pricing = cartApi.calculateEffectiveUnitPrice(product, finalQty);

        const newItem: CartItem = {
          id: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
          productId: product.id,
          variantId: options?.variantId,
          variantName: options?.variantName,
          name: product.name,
          category: product.category,
          price: pricing.unitPrice,
          baseCost: product.supplierPrice || product.price,
          standardPrice: product.price,
          originalPrice: product.originalPrice,
          bulkTierApplied: pricing.bulkTierApplied,
          imageUrl: product.imageUrl,
          sellerId: product.sellerId,
          sellerName: product.sellerName,
          quantity: finalQty,
          maxStock: availableStock,
          selectedColor: options?.color || product.colors?.[0],
          selectedSize: options?.size || product.sizes?.[0],
          sku: product.sku
        };
        return [...prev, newItem];
      }
    });

    const isBulk = product.bulkPricingEnabled && requestedQty >= 4;
    showToast(
      'Added to Cart', 
      `${product.name} (x${requestedQty}) added${isBulk ? ' with bulk discount applied!' : '.'}`, 
      'success'
    );
  };

  const updateCartQuantity = (cartItemId: string, delta: number) => {
    setCart(prev => {
      return prev.map(item => {
        if (item.id === cartItemId) {
          const newQty = item.quantity + delta;
          if (newQty <= 0) return null;
          
          const maxStock = item.maxStock || 999;
          const clampedQty = Math.min(newQty, maxStock);

          const product = products.find(p => p.id === item.productId);
          let unitPrice = item.price;
          let bulkTier = item.bulkTierApplied;

          if (product) {
            const pricing = cartApi.calculateEffectiveUnitPrice(product, clampedQty);
            unitPrice = pricing.unitPrice;
            bulkTier = pricing.bulkTierApplied;
          }

          return {
            ...item,
            quantity: clampedQty,
            price: unitPrice,
            bulkTierApplied: bulkTier
          };
        }
        return item;
      }).filter(Boolean) as CartItem[];
    });
  };

  const setCartItemQuantity = (cartItemId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }

    setCart(prev => {
      return prev.map(item => {
        if (item.id === cartItemId) {
          const maxStock = item.maxStock || 999;
          const clampedQty = Math.min(quantity, maxStock);

          const product = products.find(p => p.id === item.productId);
          let unitPrice = item.price;
          let bulkTier = item.bulkTierApplied;

          if (product) {
            const pricing = cartApi.calculateEffectiveUnitPrice(product, clampedQty);
            unitPrice = pricing.unitPrice;
            bulkTier = pricing.bulkTierApplied;
          }

          return {
            ...item,
            quantity: clampedQty,
            price: unitPrice,
            bulkTierApplied: bulkTier
          };
        }
        return item;
      });
    });
  };

  const removeFromCart = (cartItemId: string) => {
    setCart(prev => prev.filter(item => item.id !== cartItemId));
    showToast('Removed from Cart', 'The item was removed from your bag.', 'info');
  };

  const clearCart = () => {
    setCart([]);
  };

  const applyCoupon = async (code: string): Promise<boolean> => {
    const result = await cartApi.validateCoupon(code, cartSubtotal, DEMO_COUPONS);
    if (result.valid && result.coupon) {
      setAppliedCoupon(result.coupon);
      showToast('Coupon Applied', `Code "${result.coupon.code}" applied: ${result.coupon.discountPercent}% off!`, 'success');
      return true;
    } else {
      showToast('Invalid Coupon', result.error || 'Coupon could not be applied.', 'error');
      return false;
    }
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    showToast('Coupon Removed', 'Discount was cleared.', 'info');
  };

  // Wishlist operations
  const toggleWishlist = (productId: string) => {
    if (!productId) return;
    const isSaved = wishlist.includes(productId);
    const storageKey = typeof window !== 'undefined' ? getWishlistStorageKey(user?.uid) : null;

    if (isSaved) {
      const next = wishlist.filter(id => id !== productId);
      setWishlist(next);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch { /* ignore */ }
      }
      showToast('Wishlist Updated', 'Item removed from your wishlist.', 'info');
    } else {
      const next = [...wishlist, productId];
      setWishlist(next);
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch { /* ignore */ }
      }
      showToast('Saved to Wishlist', 'Item added to your saved favorites.', 'success');
    }
  };

  const isInWishlist = (productId: string) => wishlist.includes(productId);

  const removeFromWishlist = (productId: string) => {
    if (!productId) return;
    const next = wishlist.filter(id => id !== productId);
    setWishlist(next);
    if (typeof window !== 'undefined') {
      try {
        const storageKey = getWishlistStorageKey(user?.uid);
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch { /* ignore */ }
    }
    showToast('Removed from Wishlist', 'Item removed from your saved list.', 'info');
  };

  const clearWishlist = () => {
    setWishlist([]);
    if (typeof window !== 'undefined') {
      try {
        const storageKey = getWishlistStorageKey(user?.uid);
        localStorage.setItem(storageKey, JSON.stringify([]));
      } catch { /* ignore */ }
    }
    showToast('Wishlist Cleared', 'All items removed from your wishlist.', 'info');
  };

  const moveAllWishlistToCart = () => {
    const itemsToAdd = products.filter(p => wishlist.includes(p.id) && p.inStock);
    if (itemsToAdd.length === 0) {
      showToast('No In-Stock Items', 'None of your wishlist items are currently in stock.', 'error');
      return;
    }
    itemsToAdd.forEach(p => {
      addToCart(p, 1);
    });
    showToast('Moved to Bag', `${itemsToAdd.length} item${itemsToAdd.length > 1 ? 's' : ''} added to your cart!`, 'success');
  };

  // Unified Multi-Vendor Checkout via Order API
  const placeOrder = async (orderData: {
    customerName: string;
    customerEmail: string;
    shippingAddress: {
      fullName: string;
      street: string;
      city: string;
      state: string;
      zipCode: string;
      country: string;
      phone: string;
    };
    paymentMethod: 'card' | 'cod' | 'mobile_money';
    mobileProvider?: 'bkash' | 'nagad' | 'rocket';
  }): Promise<Order> => {
    // 1. Backend-driven inventory reservation to lock stock during high concurrency
    const stockMap: Record<string, number> = {};
    products.forEach(p => { stockMap[p.id] = p.stockCount; });

    const reservationItems = cart.map(c => ({
      productId: c.productId,
      variantId: c.variantId,
      quantity: c.quantity
    }));

    const reservation = await inventoryApi.reserveStock(reservationItems, stockMap);
    if (!reservation.success) {
      showToast('Inventory Issue', 'Some items in your cart exceed available stock. Quantities have been adjusted.', 'error');
      throw new Error('Stock reservation failed');
    }

    const activeCustomerId = user?.uid || (currentUser.isAuthenticated ? currentUser.id : `guest-${Date.now()}`);

    let newOrder: Order;
    try {
      // 2. Process Payment Authorization with BDT
      await paymentApi.createPaymentIntent({
        orderNumber: `PRE-${Date.now()}`,
        amount: cartTotal,
        currency: 'BDT',
        method: orderData.paymentMethod,
        mobileProvider: orderData.mobileProvider,
        customerEmail: orderData.customerEmail
      });

      // 3. Create Master Order + Sub-Orders
      newOrder = await orderApi.createMarketplaceOrder({
        customerId: activeCustomerId,
        customerName: orderData.customerName,
        customerEmail: orderData.customerEmail,
        cartItems: cart,
        sellers,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        discountAmount,
        appliedCouponCode: appliedCoupon?.code,
        shippingMethod
      });
    } catch (orderError) {
      // Release reserved stock on transaction abort/failure
      if (reservation.reservationId) {
        await inventoryApi.releaseStock(reservation.reservationId);
      }
      showToast('Checkout Failed', 'Transaction could not be processed. Reserved stock has been released.', 'error');
      throw orderError;
    }

    // 4. Deduct real inventory
    setProducts(prev => {
      return prev.map(p => {
        const cartItem = cart.find(c => c.productId === p.id);
        if (cartItem) {
          const newCount = Math.max(0, p.stockCount - cartItem.quantity);
          return {
            ...p,
            stockCount: newCount,
            inStock: newCount > 0
          };
        }
        return p;
      });
    });

    // 5. Update state & persist orders
    if (isFirebaseConfigured && db) {
      try {
        const orderRef = doc(db, 'orders', newOrder.id);
        const addr = orderData.shippingAddress;
        
        let totalWholesale = 0;
        let totalProfit = 0;
        
        const mappedItems = newOrder.items.map(item => {
          const platformProd = products.find(p => p.id === item.productId);
          const baseCost = item.baseCost !== undefined ? item.baseCost : (platformProd ? (platformProd.supplierPrice || platformProd.price) : item.price);
          const profit = Math.max(0, item.price - baseCost) * item.quantity;
          totalWholesale += baseCost * item.quantity;
          totalProfit += profit;
          return {
            productId: item.productId,
            productName: item.productName,
            imageUrl: item.imageUrl,
            quantity: item.quantity,
            price: item.price,
            baseCost,
            profitBDT: profit,
            subtotal: item.subtotal || item.price * item.quantity,
            sellerId: item.sellerId
          };
        });

        const effectivePaymentMethod = orderData.paymentMethod === 'mobile_money' ? (orderData.mobileProvider || 'bkash') : orderData.paymentMethod;
        const effectivePaymentStatus = orderData.paymentMethod === 'cod' ? 'unpaid_cod' : 'paid';

        const orderPayload = {
          id: newOrder.id,
          orderNumber: newOrder.orderNumber,
          customerId: activeCustomerId,
          customerName: orderData.customerName,
          customerEmail: orderData.customerEmail,
          customerPhone: addr.phone || '01700000000',
          customerAddress: addr.street,
          customerCity: addr.city || 'Dhaka',
          resellerId: newOrder.items[0]?.sellerId || null,
          storeSlug: activeStoreSlug || null,
          items: mappedItems,
          totalAmount: Math.round(newOrder.total),
          totalAmountBDT: Math.round(newOrder.total),
          wholesaleAmount: totalWholesale,
          resellerProfit: totalProfit,
          estimatedProfitBDT: totalProfit,
          status: 'Pending',
          paymentMethod: effectivePaymentMethod,
          paymentStatus: effectivePaymentStatus,
          courier: 'Steadfast Courier',
          trackingNumber: newOrder.trackingNumber || `STF-${newOrder.orderNumber}`,
          isSettled: false,
          createdAt: new Date().toISOString()
        };
        setDoc(orderRef, orderPayload).catch(err => console.warn('Firestore order persistence error:', err));
      } catch (err) {
        console.warn('Could not write order to Firestore:', err);
      }
    }

    setOrders(prev => {
      const next = [newOrder, ...prev];
      if (typeof window !== 'undefined') {
        if (user?.uid) {
          const userKey = `zero_invest_orders_${user.uid}`;
          try {
            const existing = JSON.parse(localStorage.getItem(userKey) || '[]');
            localStorage.setItem(userKey, JSON.stringify([newOrder, ...existing]));
          } catch {
            // ignore
          }
        } else {
          try {
            localStorage.setItem('zero_invest_orders_guest', JSON.stringify(next));
          } catch {
            // ignore
          }
        }
      }
      return next;
    });
    clearCart();
    setAppliedCoupon(null);

    const subOrderCount = newOrder.subOrders?.length || 1;
    showToast(
      'Order Confirmed!', 
      `Order #${newOrder.orderNumber} placed across ${subOrderCount} seller shipment${subOrderCount > 1 ? 's' : ''}.`, 
      'success'
    );

    return newOrder;
  };

  const trackOrderById = async (query: string): Promise<{ order: Order; matchedSubOrder?: SellerOrder } | null> => {
    return orderApi.trackOrder(query, orders);
  };

  // Seller / Admin operations
  const addProduct = (productData: Partial<Product>) => {
    const newProd: Product = {
      id: `prod-${Date.now()}`,
      name: productData.name || 'New Artisan Product',
      category: productData.category || 'Home & Living',
      subcategory: productData.subcategory,
      brand: productData.brand || 'Artisan Direct',
      sku: productData.sku || `SKU-${Date.now().toString().slice(-6)}`,
      price: productData.price || 29.99,
      originalPrice: productData.originalPrice,
      discountPercent: productData.discountPercent || 0,
      rating: 5.0,
      reviewCount: 1,
      imageUrl: productData.imageUrl || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80',
      additionalImages: productData.additionalImages || [],
      sellerId: productData.sellerId || 'seller-1',
      sellerName: productData.sellerName || 'Urban Thread Studio',
      sellerRating: 4.9,
      sellerLocation: 'Portland, OR',
      inStock: true,
      stockCount: productData.stockCount || 50,
      bulkPricingEnabled: productData.bulkPricingEnabled ?? false,
      bulkPricingTiers: productData.bulkPricingTiers || [],
      description: productData.description || 'Handcrafted premium product created with mindful materials.',
      features: productData.features || ['Premium certified materials', 'Sustainably packed', 'Small batch artisan release'],
      specifications: productData.specifications || { 'Craft': 'Artisan Handcrafted', 'Origin': 'USA' },
      createdAt: new Date().toISOString().split('T')[0]
    };

    setProducts(prev => [newProd, ...prev]);
    showToast('Product Published!', `"${newProd.name}" is now live in the marketplace catalog.`, 'success');
  };

  const updateProduct = (productId: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, ...updates } : p));
    showToast('Product Updated', 'Product changes have been saved to catalog.', 'success');
  };

  const deleteProduct = (productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    showToast('Product Removed', 'Product has been removed from wholesale catalog.', 'info');
  };

  const updateProductStock = (productId: string, inStock: boolean, newCount?: number) => {
    setProducts(prev => prev.map(p => {
      if (p.id === productId) {
        const count = newCount !== undefined ? newCount : (inStock ? Math.max(1, p.stockCount) : 0);
        return {
          ...p,
          inStock,
          stockCount: count
        };
      }
      return p;
    }));
    showToast('Inventory Updated', `Stock status updated.`, 'info');
  };

  const updateSubOrderStatus = (subOrderId: string, status: OrderStatus, trackingNumber?: string) => {
    setOrders(prev => prev.map(order => {
      if (order.subOrders) {
        const updatedSubOrders = order.subOrders.map(sub => {
          if (sub.id === subOrderId || sub.subOrderNumber === subOrderId) {
            return {
              ...sub,
              status,
              trackingNumber: trackingNumber || sub.trackingNumber,
              updatedAt: new Date().toISOString()
            };
          }
          return sub;
        });

        // Determine if all sub-orders are delivered or shipped
        const allDelivered = updatedSubOrders.every(s => s.status === 'Delivered');
        const anyShipped = updatedSubOrders.some(s => s.status === 'Shipped');
        const parentStatus = allDelivered ? 'Delivered' : anyShipped ? 'Shipped' : order.status;

        return {
          ...order,
          subOrders: updatedSubOrders,
          status: parentStatus
        };
      }
      return order;
    }));

    showToast('Fulfillment Updated', `Sub-order status updated to "${status}".`, 'success');
  };

  const approveSeller = (sellerId: string) => {
    setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status: 'active' as const } : s));
    showToast('Seller Approved', `Store has been verified and approved for marketplace sales.`, 'success');
  };

  const rejectSeller = (sellerId: string) => {
    setSellers(prev => prev.map(s => s.id === sellerId ? { ...s, status: 'suspended' as const } : s));
    showToast('Seller Suspended', `Store status changed to suspended.`, 'info');
  };

  const currentUser = useMemo(() => {
    if (user) {
      const fullName = (userProfile?.firstName 
        ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() 
        : '') ||
        userProfile?.displayName || 
        user.displayName || 
        user.email?.split('@')[0] || 
        'Member';
      return {
        id: user.uid,
        name: fullName,
        email: user.email || userProfile?.email || '',
        isAuthenticated: true,
        role: (userProfile?.role || role || 'customer') as UserRole,
        avatarUrl: userProfile?.avatarUrl || user.photoURL || undefined
      };
    }
    return {
      id: '',
      name: 'Guest Shopper',
      email: '',
      isAuthenticated: false,
      role: 'customer' as UserRole,
      avatarUrl: undefined
    };
  }, [user, userProfile, role]);

  // Review operations
  const getProductReviews = (productId: string): Review[] => {
    return reviews.filter(r => r.productId === productId);
  };

  const checkVerifiedPurchase = (productId: string, orderNumberOrEmail?: string) => {
    const trimmedInput = orderNumberOrEmail?.trim().toLowerCase();
    
    // 1. If user supplied an order number or email
    if (trimmedInput) {
      const matched = orders.find(ord => {
        const numMatches = ord.orderNumber.toLowerCase() === trimmedInput;
        const emailMatches = ord.customerEmail.toLowerCase() === trimmedInput;
        const hasProduct = ord.items.some(it => it.productId === productId);
        return (numMatches || emailMatches) && hasProduct;
      });

      if (matched) {
        return {
          isVerified: true,
          orderNumber: matched.orderNumber,
          orderDate: matched.createdAt,
          matchedOrder: matched
        };
      }
    }

    // 2. Check current authenticated user orders
    if (user?.uid) {
      const matchedUserOrder = orders.find(ord => {
        const isUser = ord.customerId === user.uid || 
          (user.email && ord.customerEmail.toLowerCase() === user.email.toLowerCase());
        const hasProduct = ord.items.some(it => it.productId === productId);
        return isUser && hasProduct;
      });

      if (matchedUserOrder) {
        return {
          isVerified: true,
          orderNumber: matchedUserOrder.orderNumber,
          orderDate: matchedUserOrder.createdAt,
          matchedOrder: matchedUserOrder
        };
      }
    }

    return { isVerified: false };
  };

  const addReview = async (reviewData: {
    productId: string;
    author: string;
    rating: number;
    title: string;
    comment: string;
    orderNumber?: string;
    recommended?: boolean;
  }): Promise<{ success: boolean; error?: string }> => {
    // Verify user is authenticated
    if (!user) {
      return { 
        success: false, 
        error: 'Please sign in to your account before submitting a review.' 
      };
    }
    if (!reviewData.productId) {
      return { success: false, error: 'Product is required.' };
    }
    if (!reviewData.title.trim()) {
      return { success: false, error: 'Please provide a review headline.' };
    }
    if (!reviewData.comment.trim() || reviewData.comment.trim().length < 10) {
      return { success: false, error: 'Please provide detailed review feedback (minimum 10 characters).' };
    }
    if (reviewData.rating < 1 || reviewData.rating > 5) {
      return { success: false, error: 'Please choose a rating between 1 and 5 stars.' };
    }

    const verification = checkVerifiedPurchase(reviewData.productId, reviewData.orderNumber);
    if (!verification.isVerified && !reviewData.orderNumber) {
      return { 
        success: false, 
        error: 'Only verified purchasers can submit a review. Please enter your Order Number (e.g. ZI-8942) or order this item first.' 
      };
    }

    const assignedOrderNumber = (verification.orderNumber || reviewData.orderNumber || 'ZI-VERIFIED').slice(0, 64);
    const reviewId = `rev-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const nowIso = new Date().toISOString();
    const authorName = reviewData.author.trim() || currentUser.name || user.displayName || 'Verified Customer';

    const newRev: Review = {
      id: reviewId,
      productId: reviewData.productId,
      author: authorName.slice(0, 100),
      rating: Math.round(reviewData.rating),
      title: reviewData.title.trim().slice(0, 200),
      comment: reviewData.comment.trim().slice(0, 2000),
      date: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      verifiedPurchase: true,
      orderNumber: assignedOrderNumber,
      helpfulCount: 0,
      recommended: reviewData.recommended !== false,
      userId: user.uid,
      userEmail: user.email || ''
    };

    const nextReviews = [newRev, ...reviews];
    setReviews(nextReviews);

    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem('zero_invest_reviews', JSON.stringify(nextReviews));
      } catch {
        // ignore
      }
    }

    // Recalculate product rating & count
    const productReviews = nextReviews.filter(r => r.productId === reviewData.productId);
    const avgRating = Number((productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1));
    const newCount = productReviews.length;

    setProducts(prev => prev.map(p => {
      if (p.id === reviewData.productId) {
        return {
          ...p,
          rating: avgRating,
          reviewCount: Math.max(p.reviewCount + 1, newCount)
        };
      }
      return p;
    }));

    if (selectedProduct && selectedProduct.id === reviewData.productId) {
      setSelectedProduct(prev => prev ? {
        ...prev,
        rating: avgRating,
        reviewCount: Math.max(prev.reviewCount + 1, newCount)
      } : null);
    }

    // Strictly match firestore.rules isValidProductReview schema
    if (isFirebaseConfigured && db) {
      try {
        const firestoreReview = {
          id: newRev.id,
          productId: newRev.productId,
          author: newRev.author,
          rating: newRev.rating,
          title: newRev.title,
          comment: newRev.comment,
          verifiedPurchase: true,
          createdAt: nowIso,
          userId: user.uid,
          userEmail: user.email || '',
          orderNumber: assignedOrderNumber,
          helpfulCount: 0,
          recommended: newRev.recommended !== false
        };

        await setDoc(doc(db, 'reviews', newRev.id), firestoreReview);
      } catch (err) {
        console.warn('Notice writing review to Firestore:', err);
      }
    }

    showToast('Review Published!', 'Thank you! Your verified review has been published.', 'success');
    return { success: true };
  };

  const markReviewHelpful = (reviewId: string) => {
    setReviews(prev => {
      const next = prev.map(r => {
        if (r.id === reviewId) {
          return { ...r, helpfulCount: (r.helpfulCount || 0) + 1 };
        }
        return r;
      });
      if (typeof window !== 'undefined') {
        try {
          localStorage.setItem('zero_invest_reviews', JSON.stringify(next));
        } catch {
          // ignore
        }
      }
      return next;
    });
    showToast('Feedback Received', 'Thank you for your feedback.', 'info');
  };

  // Category Actions
  const addCategory = async (categoryData: Omit<Category, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const created = await categoryService.createCategory(categoryData);
      showToast(`Category "${created.name}" created successfully`, 'success');
      return created;
    } catch (err: any) {
      showToast(err.message || 'Failed to create category', 'error');
      throw err;
    }
  };

  const updateCategory = async (id: string, updates: Partial<Category>) => {
    try {
      await categoryService.updateCategory(id, updates);
      showToast('Category updated successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to update category', 'error');
      throw err;
    }
  };

  const deleteCategory = async (id: string, moveProductsToCategoryId?: string) => {
    try {
      if (moveProductsToCategoryId) {
        const targetCategory = rawCategories.find(c => c.id === moveProductsToCategoryId);
        setProducts(prev => prev.map(p => {
          if (p.categoryId === id || (p.category && p.category.toLowerCase() === id.toLowerCase())) {
            return {
              ...p,
              categoryId: moveProductsToCategoryId,
              category: targetCategory ? targetCategory.name : p.category
            };
          }
          return p;
        }));
      }
      await categoryService.deleteCategory(id);
      showToast('Category removed successfully', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to delete category', 'error');
      throw err;
    }
  };

  const reorderCategories = async (orderedIds: string[]) => {
    try {
      await categoryService.reorderCategories(orderedIds);
      showToast('Category display order updated', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to reorder categories', 'error');
      throw err;
    }
  };

  const toggleCategoryStatus = async (id: string) => {
    const cat = rawCategories.find(c => c.id === id);
    if (!cat) return;
    const newStatus = await categoryService.toggleCategoryStatus(id, cat.status);
    showToast(`Category is now ${newStatus}`, 'info');
  };

  const toggleCategoryFeatured = async (id: string) => {
    const cat = rawCategories.find(c => c.id === id);
    if (!cat) return;
    const nextFeatured = await categoryService.toggleCategoryFeatured(id, cat.isFeatured);
    showToast(nextFeatured ? 'Category marked as Featured' : 'Category removed from Featured', 'info');
  };

  return (
    <MarketplaceContext.Provider value={{
      activeView,
      navigate,
      activeStoreSlug,
      activeProductSlug,
      accountTab,
      setAccountTab,
      authTab,
      setAuthTab,
      selectedProduct,
      setSelectedProduct,
      selectedSeller,
      setSelectedSeller,
      selectedCategory,
      setSelectedCategory,
      selectedSubcategory,
      setSelectedSubcategory,
      searchQuery,
      setSearchQuery,
      products,
      categories,
      isLoadingCategories,
      categoryError,
      addCategory,
      updateCategory,
      deleteCategory,
      reorderCategories,
      toggleCategoryStatus,
      toggleCategoryFeatured,
      sellers,
      orders,
      reviews,
      getProductReviews,
      addReview,
      markReviewHelpful,
      checkVerifiedPurchase,
      cart,
      cartCount,
      cartSubtotal,
      bulkSavingsTotal,
      appliedCoupon,
      discountAmount,
      shippingAmount,
      cartTotal,
      sellerCartGroups,
      shippingMethod,
      setShippingMethod,
      addToCart,
      updateCartQuantity,
      setCartItemQuantity,
      removeFromCart,
      clearCart,
      applyCoupon,
      removeCoupon,
      wishlist,
      toggleWishlist,
      isInWishlist,
      removeFromWishlist,
      clearWishlist,
      moveAllWishlistToCart,
      placeOrder,
      trackOrderById,
      addProduct,
      updateProduct,
      deleteProduct,
      updateProductStock,
      updateSubOrderStatus,
      approveSeller,
      rejectSeller,
      currentUser,
      userRole,
      setUserRole,
      toasts,
      showToast,
      dismissToast
    }}>
      {children}
    </MarketplaceContext.Provider>
  );
}

export function useMarketplace() {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
}

