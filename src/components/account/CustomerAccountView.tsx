'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { useReseller } from '@/context/ResellerContext';
import { getProductResellerPricing, isVerifiedResellerUser, getResellerAccessStatus } from '@/lib/productVisibility';
import { ProductCard } from '@/components/common/ProductCard';
import { Product } from '@/types/marketplace';
import { formatBDT } from '@/lib/formatters';
import { 
  Package, 
  Heart, 
  MapPin, 
  User, 
  Truck, 
  Clock, 
  CheckCircle2, 
  Store,
  ChevronRight,
  Plus,
  Trash2,
  LayoutGrid,
  List,
  ArrowUpDown,
  Check,
  Sparkles,
  AlertCircle,
  ArrowRight,
  Tag,
  Star,
  ShieldCheck,
  Lock,
  Phone,
  Mail,
  LogOut,
  ExternalLink,
  Key
} from 'lucide-react';

export function CustomerAccountView() {
  const { 
    currentUser, 
    orders, 
    wishlist, 
    products, 
    navigate, 
    setUserRole,
    showToast,
    accountTab,
    setAccountTab,
    removeFromWishlist,
    clearWishlist,
    toggleWishlist
  } = useMarketplace();

  const { products: resellerProducts, addProductToCatalog, quickGenerateLandingPage, openVerificationModal } = useReseller();

  const { 
    user, 
    userProfile, 
    role, 
    isAuthenticated,
    emailVerified, 
    phoneVerified, 
    authProvider,
    resetPassword,
    sendVerificationEmail,
    linkGoogleAccount,
    logout,
    updateProfileData
  } = useAuth();

  const isVerifiedReseller = isVerifiedResellerUser(userProfile, role, isAuthenticated);
  const accessStatus = getResellerAccessStatus(userProfile, role, isAuthenticated);

  const activeTab = accountTab;
  const setActiveTab = setAccountTab;

  // Filter orders for the active authenticated user
  const customerOrders = orders.filter(ord => {
    if (user?.uid) {
      return ord.customerId === user.uid || 
        (user.email && ord.customerEmail.toLowerCase() === user.email.toLowerCase());
    }
    return ord.customerId === currentUser.id || 
      (currentUser.email && ord.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
      ord.customerId.startsWith('guest-');
  });

  // Profile form state
  const [profileName, setProfileName] = useState(() => 
    userProfile?.firstName 
      ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() 
      : (user?.displayName || currentUser.name || '')
  );
  const [profilePhone, setProfilePhone] = useState(() => 
    userProfile?.phone || user?.phoneNumber || '+880 1700-000000'
  );

  // Address list - loaded per user
  const [addresses, setAddresses] = useState(() => {
    if (typeof window !== 'undefined') {
      const userKey = user?.uid ? `zero_invest_addresses_${user.uid}` : 'zero_invest_addresses_guest';
      try {
        const stored = localStorage.getItem(userKey);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) return parsed;
        }
      } catch {
        // ignore
      }
    }
    const defaultName = (userProfile?.firstName 
      ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() 
      : '') || user?.displayName || currentUser.name || 'Account Holder';
    return [
      {
        id: 'addr-1',
        title: 'Primary Residence',
        fullName: defaultName,
        street: 'House 42, Road 11, Block D, Banani',
        city: 'Dhaka',
        state: 'Dhaka Division',
        zipCode: '1213',
        phone: userProfile?.phone || user?.phoneNumber || '+880 1700-000000',
        isDefault: true
      }
    ];
  });

  const saveAddresses = (newAddrs: typeof addresses) => {
    setAddresses(newAddrs);
    if (typeof window !== 'undefined') {
      const userKey = user?.uid ? `zero_invest_addresses_${user.uid}` : 'zero_invest_addresses_guest';
      try {
        localStorage.setItem(userKey, JSON.stringify(newAddrs));
      } catch {
        // ignore
      }
    }
  };

  const handleSaveProfile = async () => {
    try {
      const nameParts = profileName.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      await updateProfileData({
        firstName,
        lastName,
        displayName: profileName.trim(),
        phone: profilePhone.trim()
      });
      showToast('Profile Updated', 'Your profile details have been saved to your account.', 'success');
    } catch {
      showToast('Update Failed', 'Could not save profile changes.', 'error');
    }
  };

  // Wishlist management states
  const [wishlistCategory, setWishlistCategory] = useState<string>('All');
  const [wishlistSort, setWishlistSort] = useState<'recent' | 'price-asc' | 'price-desc' | 'rating'>('recent');
  const [wishlistViewMode, setWishlistViewMode] = useState<'management' | 'grid'>('management');
  const [addedItems, setAddedItems] = useState<Record<string, boolean>>({});
  const [securityLoading, setSecurityLoading] = useState<string | null>(null);

  // Wishlist products
  const wishlistProducts = (products || []).filter(p => (wishlist || []).includes(p?.id));

  // Unique categories in wishlist
  const availableCategories = ['All', ...Array.from(new Set(wishlistProducts.map(p => p?.category).filter(Boolean)))];

  // Filtered & sorted wishlist items
  const filteredWishlistProducts = [...wishlistProducts]
    .filter(p => wishlistCategory === 'All' || p.category === wishlistCategory)
    .sort((a, b) => {
      if (wishlistSort === 'price-asc') return a.price - b.price;
      if (wishlistSort === 'price-desc') return b.price - a.price;
      if (wishlistSort === 'rating') return b.rating - a.rating;
      return 0;
    });

  // Financial and stock summary
  const totalValue = wishlistProducts.reduce((sum, p) => sum + p.price, 0);
  const totalSavings = wishlistProducts.reduce(
    (sum, p) => sum + (p.originalPrice && p.originalPrice > p.price ? p.originalPrice - p.price : 0),
    0
  );
  const inStockCount = wishlistProducts.filter(p => p.inStock).length;

  // Recommended products for empty state
  const recommendedPicks = products.filter(p => !wishlist.includes(p.id)).slice(0, 4);

  const handleAddToMyProducts = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      navigate('reseller');
      return;
    }
    if (!isVerifiedReseller) {
      if (accessStatus === 'pending_verification') {
        showToast('Verification Pending', 'Your reseller account is awaiting admin approval.', 'info');
      } else {
        navigate('reseller-register');
      }
      return;
    }
    const pricing = getProductResellerPricing(product, true);
    const res = await addProductToCatalog(product, pricing.suggestedPrice, product.description);
    if (res.success) {
      setAddedItems(prev => ({ ...prev, [product.id]: true }));
      showToast('Added to Products!', `"${product.name}" added to your reseller inventory.`, 'success');
      setTimeout(() => {
        setAddedItems(prev => ({ ...prev, [product.id]: false }));
      }, 2500);
    }
  };

  const handleCreateLandingPage = async (product: Product, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!isAuthenticated) {
      navigate('reseller');
      return;
    }
    if (!isVerifiedReseller) {
      if (accessStatus === 'pending_verification') {
        showToast('Verification Pending', 'Your reseller account is awaiting admin approval.', 'info');
      } else {
        navigate('reseller-register');
      }
      return;
    }
    if (quickGenerateLandingPage) {
      const page = await quickGenerateLandingPage(product);
      if (page) {
        navigate('reseller-public-landing', {
          storeSlug: page.storeSlug,
          productSlug: page.productSlug
        });
      }
    } else {
      navigate('product-detail', { productId: product.id });
    }
  };

  const handleAddAllToCatalog = async () => {
    if (!isAuthenticated) {
      navigate('reseller');
      return;
    }
    if (!isVerifiedReseller) {
      if (accessStatus === 'pending_verification') {
        showToast('Verification Pending', 'Your reseller account is awaiting admin approval.', 'info');
      } else {
        navigate('reseller-register');
      }
      return;
    }
    const inStockItems = wishlistProducts.filter(p => p.inStock);
    let addedCount = 0;
    for (const p of inStockItems) {
      const pricing = getProductResellerPricing(p, true);
      const res = await addProductToCatalog(p, pricing.suggestedPrice, p.description);
      if (res.success) addedCount++;
    }
    showToast('Catalog Updated', `${addedCount} product${addedCount === 1 ? '' : 's'} added to your reseller inventory.`, 'success');
  };

  const [showAddAddressModal, setShowAddAddressModal] = useState(false);
  const [newAddress, setNewAddress] = useState({
    title: 'Work',
    fullName: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    phone: ''
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAddress.fullName || !newAddress.street) return;

    saveAddresses([
      ...addresses,
      {
        id: `addr-${Date.now()}`,
        ...newAddress,
        isDefault: false
      }
    ]);
    setShowAddAddressModal(false);
    showToast('Address Saved', 'New delivery address added to your account.', 'success');
  };

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-6 sm:py-8">
      {/* Account Profile Header */}
      <div className="bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] p-6 sm:p-8 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            {user?.photoURL || userProfile?.photoURL ? (
              <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white shadow-sm shrink-0">
                <img 
                  src={user?.photoURL || userProfile?.photoURL} 
                  alt="User avatar" 
                  className="w-full h-full object-cover" 
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-full bg-[#111111] text-white flex items-center justify-center text-xl font-bold border-2 border-white shadow-sm shrink-0">
                {(userProfile?.firstName || user?.displayName || user?.email || currentUser.name).charAt(0).toUpperCase()}
              </div>
            )}
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-xl sm:text-2xl font-bold text-[#111111]">
                  {userProfile?.firstName 
                    ? `${userProfile.firstName} ${userProfile.lastName}` 
                    : (user?.displayName || currentUser.name)}
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider bg-[#EAD7CA]/50 text-[#111111] px-2.5 py-0.5 rounded-full">
                  {role || 'Customer'}
                </span>
                {(emailVerified || userProfile?.emailVerified) && (
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Verified
                  </span>
                )}
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">
                {user?.email || userProfile?.email || currentUser.email}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('reseller')}
              className="px-5 py-2.5 rounded-full bg-white border border-[#E6E4E0] text-xs font-bold text-neutral-800 hover:border-black flex items-center gap-2 transition-colors shadow-2xs"
            >
              <Store className="w-4 h-4 text-[#C98F6B]" />
              <span>Reseller Program</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex items-center gap-3 mt-6 pt-6 border-t border-[#E6E4E0] overflow-x-auto pb-1">
          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'orders'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>My Orders ({customerOrders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'wishlist'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white'
            }`}
          >
            <Heart className="w-3.5 h-3.5" />
            <span>Saved Wishlist ({wishlist.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('addresses')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'addresses'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white'
            }`}
          >
            <MapPin className="w-3.5 h-3.5" />
            <span>Addresses ({addresses.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'profile'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white'
            }`}
          >
            <User className="w-3.5 h-3.5" />
            <span>Account Details</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
              activeTab === 'security'
                ? 'bg-[#111111] text-white shadow-xs'
                : 'text-neutral-600 hover:bg-white'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Security &amp; Logins</span>
          </button>
        </div>
      </div>

      {/* TAB 1: Orders */}
      {activeTab === 'orders' && (
        <div className="space-y-4">
          {customerOrders.length === 0 ? (
            <div className="bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] p-12 text-center">
              <Package className="w-10 h-10 text-neutral-400 mx-auto mb-3" />
              <h3 className="font-bold text-base text-neutral-800">No orders placed yet</h3>
              <p className="text-xs text-neutral-500 mt-1">Discover handcrafted goods and place your first order.</p>
              <button
                onClick={() => navigate('shop')}
                className="mt-4 px-5 py-2.5 bg-[#111111] text-white rounded-full text-xs font-bold"
              >
                Start Shopping
              </button>
            </div>
          ) : (
            customerOrders.map((ord) => (
              <div key={ord.id} className="bg-white rounded-3xl border border-[#E6E4E0] overflow-hidden shadow-2xs">
                {/* Order Top Bar */}
                <div className="bg-[#F7F6F3] px-6 py-4 border-b border-[#E6E4E0] flex flex-wrap items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-6">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Order Placed</span>
                      <span className="font-semibold text-neutral-900">{ord.createdAt}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Total</span>
                      <span className="font-bold text-neutral-900">{formatBDT(ord.total)}</span>
                    </div>
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase font-bold">Ship To</span>
                      <span className="font-semibold text-neutral-900">{ord.shippingAddress.fullName}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="font-mono font-bold text-neutral-800">#{ord.orderNumber}</span>
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
                      ord.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                      ord.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {ord.status}
                    </span>
                  </div>
                </div>

                {/* Items in this order */}
                <div className="p-6 divide-y divide-neutral-100">
                  {(ord.items || []).map((item, idx) => (
                    <div key={item.id || item.productId || idx} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                      <div className="flex items-center gap-3.5">
                        <div className="relative w-14 h-14 rounded-xl bg-[#F7F6F3] border border-[#E6E4E0] overflow-hidden shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.productName || item.name || 'Product'}
                            fill
                            sizes="56px"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div>
                          <p className="font-bold text-xs sm:text-sm text-neutral-900">{item.productName || item.name}</p>
                          <p className="text-[11px] text-neutral-500">
                            Dispatched by <span className="font-medium text-neutral-800">{item.sellerName}</span> · Qty: {item.quantity}
                          </p>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className="font-bold text-xs sm:text-sm text-neutral-900">
                          {formatBDT(item.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Actions bottom */}
                <div className="px-6 py-3 bg-[#F7F6F3]/50 border-t border-[#E6E4E0] flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Truck className="w-4 h-4 text-[#C98F6B]" />
                    <span>Estimated arrival: 3 - 4 business days</span>
                  </div>
                  <button
                    onClick={() => navigate('track-order')}
                    className="font-bold text-xs text-[#111111] hover:text-[#C98F6B] underline flex items-center gap-1"
                  >
                    Track Shipment Live →
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: Wishlist (Dedicated Management Tab) */}
      {activeTab === 'wishlist' && (
        <div id="wishlist-management-panel" className="space-y-6">
          {wishlistProducts.length === 0 ? (
            /* Empty State */
            <div id="wishlist-empty-state" className="space-y-8">
              <div className="bg-white rounded-3xl border border-[#E6E4E0] p-10 sm:p-14 text-center max-w-2xl mx-auto shadow-2xs">
                <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto mb-4 flex items-center justify-center">
                  <Heart className="w-8 h-8" />
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">Your saved wishlist is empty</h2>
                <p className="text-xs sm:text-sm text-neutral-500 mt-2 leading-relaxed">
                  Discover handcrafted pieces and bespoke essentials from independent makers. Tap the heart icon on any product to save it here for later.
                </p>
                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <button
                    id="btn-wishlist-explore"
                    onClick={() => navigate('shop')}
                    className="px-6 py-3 bg-[#111111] hover:bg-neutral-800 text-white rounded-full text-xs font-bold transition-all shadow-xs"
                  >
                    Explore Marketplace Catalog
                  </button>
                  <button
                    id="btn-wishlist-deals"
                    onClick={() => navigate('deals')}
                    className="px-6 py-3 bg-white border border-[#E6E4E0] text-neutral-800 hover:border-black rounded-full text-xs font-bold transition-all"
                  >
                    View Limited Deals
                  </button>
                </div>
              </div>

              {/* Recommended Items to Save */}
              {recommendedPicks.length > 0 && (
                <div id="wishlist-recommended-section" className="bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] p-6 sm:p-8">
                  <div className="flex items-center justify-between mb-5">
                    <div>
                      <h3 className="font-bold text-base text-[#111111]">Recommended for You</h3>
                      <p className="text-xs text-neutral-500">Popular customer favorites to inspire your collection</p>
                    </div>
                    <button
                      onClick={() => navigate('shop')}
                      className="text-xs font-bold text-[#111111] hover:text-[#C98F6B] flex items-center gap-1"
                    >
                      <span>View all catalog</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    {recommendedPicks.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Active Wishlist Management Dashboard */
            <div id="wishlist-active-container" className="space-y-6">
              {/* 1. Header Overview & Summary Bar */}
              <div className="bg-white rounded-3xl border border-[#E6E4E0] p-6 sm:p-7 shadow-2xs">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                  {/* Left: Summary Metrics */}
                  <div>
                    <div className="flex items-center gap-2.5">
                      <h2 className="text-lg sm:text-xl font-bold text-[#111111]">Saved Products</h2>
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#111111] text-white">
                        {wishlistProducts.length} {wishlistProducts.length === 1 ? 'item' : 'items'}
                      </span>
                    </div>
                    <p className="text-xs sm:text-sm text-neutral-500 mt-1">
                      Manage, organize, or transfer your saved pieces directly to your checkout bag.
                    </p>

                    {/* Stats pills */}
                    <div className="flex flex-wrap items-center gap-2 mt-4 text-xs font-medium">
                      {isVerifiedReseller ? (
                        <>
                          <div className="px-3 py-1.5 rounded-xl bg-[#F7F6F3] border border-[#E6E4E0] text-neutral-800">
                            <span className="text-neutral-500 text-[11px] block uppercase font-bold">Estimated Total</span>
                            <span className="font-bold text-sm text-[#111111]">{formatBDT(totalValue)}</span>
                          </div>

                          {totalSavings > 0 && (
                            <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                              <span className="text-emerald-600 text-[11px] block uppercase font-bold">Current Discounts</span>
                              <span className="font-bold text-sm text-emerald-800">Save {formatBDT(totalSavings)}</span>
                            </div>
                          )}
                        </>
                      ) : (
                        <div className="px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 text-neutral-800 flex items-center gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-amber-600" />
                          <span className="text-xs font-semibold">Wholesale prices visible to verified resellers</span>
                        </div>
                      )}

                      <div className="px-3 py-1.5 rounded-xl bg-[#F7F6F3] border border-[#E6E4E0] text-neutral-800">
                        <span className="text-neutral-500 text-[11px] block uppercase font-bold">Availability</span>
                        <span className="font-bold text-sm text-neutral-900">
                          {inStockCount} of {wishlistProducts.length} Ready to Ship
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Primary Batch Actions */}
                  <div className="flex flex-wrap items-center gap-3 lg:self-center shrink-0">
                    <button
                      id="btn-wishlist-add-all-products"
                      onClick={handleAddAllToCatalog}
                      disabled={inStockCount === 0}
                      className="px-5 py-2.5 rounded-full bg-[#111111] hover:bg-neutral-800 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-xs flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5 text-amber-300" />
                      <span>Add All to My Products ({inStockCount})</span>
                    </button>

                    <button
                      id="btn-wishlist-clear-all"
                      onClick={clearWishlist}
                      className="px-4 py-2.5 rounded-full bg-white border border-[#E6E4E0] hover:border-rose-300 hover:text-rose-600 text-xs font-bold text-neutral-700 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-neutral-400 hover:text-rose-600" />
                      <span>Clear Wishlist</span>
                    </button>
                  </div>
                </div>

                {/* 2. Filter & Controls Toolbar */}
                <div className="mt-6 pt-5 border-t border-[#E6E4E0] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Category Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-xl">
                    {availableCategories.map((cat) => {
                      const count = cat === 'All' 
                        ? wishlistProducts.length 
                        : wishlistProducts.filter(p => p.category === cat).length;
                      return (
                        <button
                          key={cat}
                          onClick={() => setWishlistCategory(cat)}
                          className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                            wishlistCategory === cat
                              ? 'bg-[#111111] text-white shadow-2xs'
                              : 'bg-[#F7F6F3] text-neutral-700 hover:bg-[#EAE8E4]'
                          }`}
                        >
                          <span>{cat}</span>
                          <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                            wishlistCategory === cat ? 'bg-white/20 text-white' : 'bg-white text-neutral-600'
                          }`}>
                            {count}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  {/* Sort Selector & Layout Switcher */}
                  <div className="flex items-center gap-3 shrink-0">
                    <div className="flex items-center gap-1.5 bg-[#F7F6F3] rounded-full border border-[#E6E4E0] px-3 py-1">
                      <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500" />
                      <select
                        id="select-wishlist-sort"
                        value={wishlistSort}
                        onChange={(e) => setWishlistSort(e.target.value as any)}
                        className="bg-transparent text-xs font-semibold text-neutral-800 focus:outline-none cursor-pointer pr-1"
                      >
                        <option value="recent">Recently Added</option>
                        <option value="price-asc">Price: Low to High</option>
                        <option value="price-desc">Price: High to Low</option>
                        <option value="rating">Top Rated</option>
                      </select>
                    </div>

                    <div className="flex items-center bg-[#F7F6F3] rounded-full border border-[#E6E4E0] p-0.5">
                      <button
                        onClick={() => setWishlistViewMode('management')}
                        title="Detailed Management List"
                        className={`p-1.5 rounded-full transition-colors ${
                          wishlistViewMode === 'management' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setWishlistViewMode('grid')}
                        title="Grid View"
                        className={`p-1.5 rounded-full transition-colors ${
                          wishlistViewMode === 'grid' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-500 hover:text-neutral-800'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Items View */}
              {filteredWishlistProducts.length === 0 ? (
                <div className="bg-white rounded-3xl border border-[#E6E4E0] p-8 text-center">
                  <p className="text-xs text-neutral-500">No items match the selected &quot;{wishlistCategory}&quot; category filter.</p>
                  <button
                    onClick={() => setWishlistCategory('All')}
                    className="mt-2 text-xs font-bold text-[#111111] underline hover:text-[#C98F6B]"
                  >
                    Reset Filter
                  </button>
                </div>
              ) : wishlistViewMode === 'management' ? (
                /* Management List View */
                <div id="wishlist-management-list" className="space-y-3">
                  {filteredWishlistProducts.map((prod) => {
                    const isAdded = !!addedItems[prod.id];
                    return (
                      <div
                        key={prod.id}
                        id={`wishlist-item-${prod.id}`}
                        className="bg-white rounded-3xl border border-[#E6E4E0] p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-5 transition-all hover:border-neutral-300 hover:shadow-2xs"
                      >
                        {/* Left: Thumbnail & Details */}
                        <div className="flex items-start gap-4">
                          {/* Image Thumbnail */}
                          <div 
                            onClick={() => navigate('product-detail', { productId: prod.id })}
                            className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0] overflow-hidden shrink-0 cursor-pointer group"
                          >
                            <Image
                              src={prod.imageUrl}
                              alt={prod.name}
                              fill
                              sizes="(max-width: 640px) 96px, 112px"
                              className="object-cover transition-transform duration-300 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            {prod.discountPercent && prod.discountPercent > 0 && (
                              <span className="absolute top-1.5 left-1.5 px-1.5 py-0.5 rounded-md bg-[#111111] text-white text-[10px] font-bold">
                                -{prod.discountPercent}%
                              </span>
                            )}
                          </div>

                          {/* Product Details */}
                          <div className="space-y-1.5 flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-600 bg-[#F7F6F3] px-2 py-0.5 rounded-full border border-[#E6E4E0]">
                                {prod.category}
                              </span>

                              <button
                                onClick={() => navigate('seller-store', { sellerId: prod.sellerId })}
                                className="text-[11px] text-neutral-600 hover:text-black flex items-center gap-1 font-medium"
                              >
                                <Store className="w-3 h-3 text-[#C98F6B]" />
                                <span>{prod.sellerName}</span>
                                <span className="text-amber-500 font-bold">★ {prod.sellerRating}</span>
                              </button>
                            </div>

                            <h3 
                              onClick={() => navigate('product-detail', { productId: prod.id })}
                              className="font-bold text-sm sm:text-base text-neutral-900 cursor-pointer hover:text-[#C98F6B] transition-colors leading-snug"
                            >
                              {prod.name}
                            </h3>

                            <p className="text-xs text-neutral-500 line-clamp-1 max-w-xl">
                              {prod.description}
                            </p>

                            {/* Stock Indicator */}
                            <div className="pt-1">
                              {prod.inStock ? (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                                  <CheckCircle2 className="w-3.5 h-3.5" />
                                  <span>In Stock ({prod.stockCount} ready to dispatch)</span>
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-full">
                                  <AlertCircle className="w-3.5 h-3.5" />
                                  <span>Temporarily Out of Stock</span>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Right: Pricing & Item Actions */}
                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 pt-3 md:pt-0 border-t md:border-t-0 border-neutral-100">
                          {/* Price or Masked Lock State */}
                          {isVerifiedReseller ? (
                            <div className="text-left md:text-right">
                              <div className="flex items-baseline gap-2 md:justify-end">
                                <span className="text-base sm:text-lg font-black text-[#111111]">
                                  {formatBDT(prod.price)}
                                </span>
                                {prod.originalPrice && prod.originalPrice > prod.price && (
                                  <span className="text-xs text-neutral-400 line-through">
                                    {formatBDT(prod.originalPrice)}
                                  </span>
                                )}
                              </div>
                              {prod.originalPrice && prod.originalPrice > prod.price && (
                                <span className="text-[11px] font-semibold text-emerald-700 block">
                                  Save {formatBDT(prod.originalPrice - prod.price)}
                                </span>
                              )}
                            </div>
                          ) : (
                            <div className="text-left md:text-right">
                              <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200/80 text-xs font-semibold text-neutral-800">
                                <Lock className="w-3.5 h-3.5 text-amber-600" />
                                <span>Price visible to verified resellers only</span>
                              </div>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex items-center gap-2">
                            {isVerifiedReseller ? (
                              <>
                                {(() => {
                                  const inCatalog = resellerProducts.some(rp => rp.originalProductId === prod.id || rp.productName.toLowerCase() === prod.name.toLowerCase());
                                  return (
                                    <button
                                      onClick={(e) => handleAddToMyProducts(prod, e)}
                                      disabled={!prod.inStock}
                                      title="Add to your reseller inventory"
                                      className={`px-3.5 py-2 rounded-full text-xs font-bold transition-all shadow-2xs flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
                                        inCatalog || isAdded
                                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                                          : 'bg-[#111111] hover:bg-neutral-800 text-white'
                                      }`}
                                    >
                                      {inCatalog || isAdded ? (
                                        <>
                                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                                          <span>In My Products</span>
                                        </>
                                      ) : (
                                        <>
                                          <Plus className="w-3.5 h-3.5 text-amber-300" />
                                          <span>Add to My Products</span>
                                        </>
                                      )}
                                    </button>
                                  );
                                })()}

                                <button
                                  onClick={(e) => handleCreateLandingPage(prod, e)}
                                  disabled={!prod.inStock}
                                  title="Create a dedicated landing page for customer orders"
                                  className="px-3 py-2 rounded-full border border-[#E6E4E0] hover:border-black bg-white text-xs font-bold text-neutral-800 transition-all flex items-center gap-1.5 whitespace-nowrap cursor-pointer"
                                >
                                  <Sparkles className="w-3.5 h-3.5 text-[#C98F6B]" />
                                  <span>Create Landing Page</span>
                                </button>
                              </>
                            ) : accessStatus === 'pending_verification' ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openVerificationModal();
                                }}
                                className="px-3.5 py-2 rounded-full bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer hover:bg-amber-100"
                              >
                                <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
                                <span>Verification Pending</span>
                              </button>
                            ) : (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openVerificationModal();
                                }}
                                className="px-3.5 py-2 rounded-full bg-[#111111] hover:bg-neutral-800 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                              >
                                <span>Apply as Reseller</span>
                                <ArrowRight className="w-3.5 h-3.5" />
                              </button>
                            )}

                            <button
                              onClick={() => removeFromWishlist(prod.id)}
                              title="Remove item from saved wishlist"
                              className="p-2 rounded-full text-neutral-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                              aria-label="Remove from wishlist"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                /* Grid View (Multi-Column Desktop with Enhanced Typography, 2 Columns Mobile) */
                <div id="wishlist-grid-view" className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5 xl:gap-6">
                  {filteredWishlistProducts.map((prod) => (
                    <ProductCard key={prod.id} product={prod} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Addresses */}
      {activeTab === 'addresses' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-base text-neutral-900">Saved Delivery Addresses</h3>
            <button
              onClick={() => setShowAddAddressModal(true)}
              className="px-4 py-2 bg-[#111111] text-white text-xs font-bold rounded-full flex items-center gap-1.5"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add New Address</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {addresses.map((addr) => (
              <div key={addr.id} className="p-5 rounded-2xl bg-white border border-[#E6E4E0] relative flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-sm text-neutral-900">{addr.title}</span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold uppercase bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full">
                        Default
                      </span>
                    )}
                  </div>
                  <p className="text-xs font-semibold text-neutral-800">{addr.fullName}</p>
                  <p className="text-xs text-neutral-600 mt-0.5">{addr.street}</p>
                  <p className="text-xs text-neutral-600">{addr.city}, {addr.state} {addr.zipCode}</p>
                  <p className="text-xs text-neutral-500 mt-2">{addr.phone}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Modal */}
          {showAddAddressModal && (
            <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
              <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl">
                <h3 className="font-bold text-lg text-neutral-900 mb-4">Add New Address</h3>
                <form onSubmit={handleAddAddress} className="space-y-3 text-xs">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={newAddress.fullName}
                      onChange={(e) => setNewAddress({ ...newAddress, fullName: e.target.value })}
                      className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-2.5 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Street Address</label>
                    <input
                      type="text"
                      required
                      value={newAddress.street}
                      onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                      className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-2.5 focus:outline-none focus:border-black"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">City</label>
                      <input
                        type="text"
                        required
                        value={newAddress.city}
                        onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                        className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-2.5 focus:outline-none focus:border-black"
                      />
                    </div>
                    <div>
                      <label className="font-semibold text-neutral-700 block mb-1">ZIP</label>
                      <input
                        type="text"
                        required
                        value={newAddress.zipCode}
                        onChange={(e) => setNewAddress({ ...newAddress, zipCode: e.target.value })}
                        className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-2.5 focus:outline-none focus:border-black"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">Phone</label>
                    <input
                      type="tel"
                      required
                      value={newAddress.phone}
                      onChange={(e) => setNewAddress({ ...newAddress, phone: e.target.value })}
                      className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-2.5 focus:outline-none focus:border-black"
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <button
                      type="button"
                      onClick={() => setShowAddAddressModal(false)}
                      className="flex-1 py-2.5 bg-neutral-100 rounded-xl text-neutral-800 font-bold"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2.5 bg-[#111111] text-white rounded-xl font-bold"
                    >
                      Save Address
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 4: Profile Details */}
      {activeTab === 'profile' && (
        <div className="max-w-xl bg-white rounded-3xl border border-[#E6E4E0] p-6 sm:p-8">
          <h3 className="font-bold text-base text-neutral-900 mb-4">Personal Information</h3>
          <div className="space-y-4 text-xs sm:text-sm">
            <div>
              <label className="font-semibold text-neutral-600 block mb-1">Full Name</label>
              <input
                type="text"
                value={profileName}
                onChange={(e) => setProfileName(e.target.value)}
                className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-3 focus:outline-none focus:border-black"
              />
            </div>
            <div>
              <label className="font-semibold text-neutral-600 block mb-1">Email Address</label>
              <input
                type="email"
                value={user?.email || userProfile?.email || currentUser.email}
                className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-3 focus:outline-none focus:border-black"
                readOnly
              />
              <p className="text-[11px] text-neutral-400 mt-1">To change or re-verify your primary email, visit the Security tab.</p>
            </div>
            <div>
              <label className="font-semibold text-neutral-600 block mb-1">Contact Phone</label>
              <input
                type="tel"
                value={profilePhone}
                onChange={(e) => setProfilePhone(e.target.value)}
                className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-3 focus:outline-none focus:border-black"
              />
            </div>
            <button
              onClick={handleSaveProfile}
              className="mt-2 px-6 py-3 bg-[#111111] text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors"
            >
              Save Profile Changes
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: Security & Logins */}
      {activeTab === 'security' && (
        <div className="space-y-6 max-w-3xl">
          {/* Security Overview Banner */}
          <div className="bg-white rounded-3xl border border-[#E6E4E0] p-6 sm:p-8 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E6E4E0]">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-bold text-neutral-900">Security &amp; Authentication</h3>
                  <p className="text-xs text-neutral-500">Manage your linked sign-in methods, sessions, and recovery settings.</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-neutral-500">Account Status:</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                  Protected
                </span>
              </div>
            </div>

            {/* Linked Sign-In Methods */}
            <div className="mt-6 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400">
                Connected Sign-In Methods
              </h4>

              {/* 1. Google Account */}
              <div className="p-4 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E4E0] flex items-center justify-center shadow-2xs shrink-0">
                    <svg className="w-5 h-5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                    </svg>
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-neutral-900">Google Sign-In</p>
                      {authProvider === 'google' || (Array.isArray(user?.providerData) && user.providerData.some(p => p?.providerId === 'google.com')) ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Connected
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
                          Not Linked
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {authProvider === 'google' || (Array.isArray(user?.providerData) && user.providerData.some(p => p?.providerId === 'google.com'))
                        ? 'Your Google account is linked for instant 1-click access.'
                        : 'Connect Google for instant sign-in without typing credentials.'}
                    </p>
                  </div>
                </div>

                {authProvider === 'google' || (Array.isArray(user?.providerData) && user.providerData.some(p => p?.providerId === 'google.com')) ? (
                  <button
                    disabled
                    className="px-4 py-2 bg-white border border-[#E6E4E0] text-neutral-500 text-xs font-semibold rounded-xl cursor-default"
                  >
                    Active Method
                  </button>
                ) : (
                  <button
                    onClick={async () => {
                      setSecurityLoading('google');
                      try {
                        await linkGoogleAccount();
                        showToast('Google Linked', 'Your Google account was successfully connected.', 'success');
                      } catch (err: any) {
                        showToast('Linking Failed', err.message || 'Could not link Google account.', 'error');
                      } finally {
                        setSecurityLoading(null);
                      }
                    }}
                    disabled={securityLoading === 'google'}
                    className="px-4 py-2 bg-[#111111] hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                  >
                    {securityLoading === 'google' ? 'Connecting...' : 'Connect Google'}
                  </button>
                )}
              </div>

              {/* 2. Email & Password */}
              <div className="p-4 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E4E0] flex items-center justify-center shadow-2xs shrink-0 text-neutral-700">
                    <Mail className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-neutral-900">Email &amp; Password</p>
                      {emailVerified || user?.emailVerified ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">
                          Unverified
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {user?.email || userProfile?.email || 'email@example.com'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {!(emailVerified || user?.emailVerified) && (
                    <button
                      onClick={async () => {
                        setSecurityLoading('verify-email');
                        try {
                          await sendVerificationEmail();
                          showToast('Email Sent', 'Verification link dispatched to your inbox.', 'success');
                        } catch (err: any) {
                          showToast('Failed', err.message || 'Could not send verification email.', 'error');
                        } finally {
                          setSecurityLoading(null);
                        }
                      }}
                      disabled={securityLoading === 'verify-email'}
                      className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl transition-colors"
                    >
                      {securityLoading === 'verify-email' ? 'Sending...' : 'Verify Email'}
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      const targetEmail = user?.email || userProfile?.email;
                      if (!targetEmail) {
                        showToast('No Email Found', 'Please add an email address first.', 'error');
                        return;
                      }
                      setSecurityLoading('reset-pw');
                      try {
                        await resetPassword(targetEmail);
                        showToast('Reset Link Sent', `Password recovery link dispatched to ${targetEmail}.`, 'success');
                      } catch (err: any) {
                        showToast('Reset Failed', err.message || 'Could not send password reset email.', 'error');
                      } finally {
                        setSecurityLoading(null);
                      }
                    }}
                    disabled={securityLoading === 'reset-pw'}
                    className="px-3.5 py-2 bg-white border border-[#E6E4E0] hover:border-black text-neutral-800 text-xs font-bold rounded-xl transition-colors"
                  >
                    {securityLoading === 'reset-pw' ? 'Sending...' : 'Reset Password'}
                  </button>
                </div>
              </div>

              {/* 3. Phone Number Authentication (+880) */}
              <div className="p-4 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3.5">
                  <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E4E0] flex items-center justify-center shadow-2xs shrink-0 text-neutral-700">
                    <Phone className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-neutral-900">Phone Authentication (SMS OTP)</p>
                      {phoneVerified || userProfile?.phoneVerified ? (
                        <span className="text-[10px] font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <Check className="w-3 h-3" /> Verified
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold bg-neutral-200 text-neutral-700 px-2 py-0.5 rounded-full">
                          {userProfile?.phone ? 'Linked' : 'Not Configured'}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-neutral-500 mt-0.5">
                      {userProfile?.phone || user?.phoneNumber || 'Bangladesh (+880) OTP Authentication'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate('phone-auth')}
                  className="px-4 py-2 bg-[#111111] hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shrink-0"
                >
                  {phoneVerified ? 'Update Phone' : 'Verify Phone OTP'}
                </button>
              </div>
            </div>

            {/* Sessions & Credentials Box */}
            <div className="mt-8 pt-6 border-t border-[#E6E4E0]">
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-3">
                Active Session &amp; Environment
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0]">
                  <p className="text-neutral-500 text-[11px] font-semibold">Session Persistence</p>
                  <p className="font-bold text-neutral-800 mt-0.5">Browser Local Storage</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Keeps you securely signed in across browser tabs &amp; restarts.</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0]">
                  <p className="text-neutral-500 text-[11px] font-semibold">Assigned Marketplace Role</p>
                  <p className="font-bold text-neutral-800 mt-0.5 capitalize">{role || 'Customer'}</p>
                  <p className="text-[11px] text-neutral-400 mt-1">Authenticated via Firebase Security Rules &amp; App Check.</p>
                </div>
              </div>
            </div>

            {/* Sign Out Action Button */}
            <div className="mt-8 pt-6 border-t border-[#E6E4E0] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-neutral-800">Sign Out of All Devices</p>
                <p className="text-[11px] text-neutral-500">End your active authenticated session safely on this browser.</p>
              </div>
              <button
                onClick={async () => {
                  await logout();
                  showToast('Signed Out', 'You have been safely signed out.', 'info');
                  navigate('home');
                }}
                className="w-full sm:w-auto px-6 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl border border-rose-200 transition-colors flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out Now</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
