'use client';

import React, { useState } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ResellerStore } from '@/types/reseller';
import { formatBDT } from '@/lib/formatters';
import { PublicOrderTrackingModal } from './PublicOrderTrackingModal';
import { PublicCheckoutModal } from './PublicCheckoutModal';
import { 
  ShoppingBag, 
  Search, 
  Menu, 
  X, 
  ShieldCheck, 
  Store as StoreIcon, 
  Trash2, 
  Plus, 
  Minus, 
  CheckCircle2, 
  Truck,
  Phone,
  PackageSearch
} from 'lucide-react';

interface PublicStoreHeaderProps {
  store: ResellerStore | null;
  storeSlug?: string;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  categories?: string[];
  activeCategory?: string;
  onSelectCategory?: (category: string) => void;
}

export function PublicStoreHeader({
  store,
  storeSlug,
  searchQuery = '',
  onSearchChange,
  categories = [],
  activeCategory = 'all',
  onSelectCategory
}: PublicStoreHeaderProps) {
  const { cart, cartCount, cartTotal, removeFromCart, updateCartQuantity, navigate, showToast } = useMarketplace();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);

  const storeName = store?.storeName || storeSlug || 'Official Storefront';

  const handleProceedToCheckout = () => {
    setIsCartOpen(false);
    if (cart.length === 0) {
      showToast('Cart is Empty', 'Please add products to your cart before checkout.', 'info');
      return;
    }
    setIsCheckoutModalOpen(true);
  };

  return (
    <>
      {/* Top Trust Notice Strip */}
      <div className="bg-neutral-900 text-white text-[11px] sm:text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 shrink-0 animate-pulse" />
            <span className="font-medium text-neutral-200">
              Cash on Delivery Available Across Bangladesh • 7-Day Replacement Guarantee
            </span>
          </div>
          {store?.contactPhone && (
            <a 
              href={`tel:${store.contactPhone}`} 
              className="hidden md:inline-flex items-center gap-1.5 text-neutral-300 hover:text-white transition-colors shrink-0 font-medium"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>Helpline: {store.contactPhone}</span>
            </a>
          )}
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="w-full max-w-full sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-[#E6E4E0] shadow-xs transition-all overflow-hidden">
        <div className="w-full max-w-full mx-auto px-3 sm:px-6 lg:px-8">
          <div className="h-14 sm:h-20 flex items-center justify-between gap-2 sm:gap-4 min-w-0">
            
            {/* Left: Mobile Menu Button & Store Brand */}
            <div className="flex items-center gap-1.5 sm:gap-3 shrink-0 min-w-0">
              <button
                type="button"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-1.5 rounded-xl text-neutral-700 hover:bg-neutral-100 cursor-pointer shrink-0"
                aria-label="Toggle Navigation Menu"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>

              <div 
                onClick={() => navigate('reseller-public-store', { storeSlug: store?.storeSlug || storeSlug })}
                className="flex items-center gap-2 sm:gap-3 cursor-pointer group select-none min-w-0"
              >
                <div className="w-9 h-9 sm:w-12 sm:h-12 rounded-xl sm:rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-extrabold text-sm sm:text-lg overflow-hidden shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                  {store?.logoUrl ? (
                    <img 
                      src={store.logoUrl} 
                      alt={storeName} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                      }}
                    />
                  ) : (
                    <span>{storeName.charAt(0).toUpperCase()}</span>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <h1 className="text-sm sm:text-lg font-extrabold text-neutral-900 tracking-tight leading-tight group-hover:text-emerald-700 transition-colors truncate max-w-[130px] xs:max-w-[180px] sm:max-w-none">
                      {storeName}
                    </h1>
                    <span 
                      title="Verified Storefront" 
                      className="inline-flex items-center text-emerald-600 shrink-0"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-emerald-50 text-emerald-600" />
                    </span>
                  </div>
                  <p className="hidden sm:block text-[11px] text-neutral-500 font-medium truncate max-w-xs">
                    {store?.tagline || 'Curated Quality • Fast Nationwide Delivery'}
                  </p>
                </div>
              </div>
            </div>

            {/* Middle: Desktop Search Bar (If handler provided) */}
            {onSearchChange && (
              <div className="hidden md:flex flex-1 max-w-md mx-4">
                <div className="relative w-full">
                  <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                  <input
                    type="text"
                    placeholder={`Search items in ${storeName}...`}
                    value={searchQuery}
                    onChange={(e) => onSearchChange(e.target.value)}
                    className="w-full pl-10 pr-9 py-2.5 text-xs sm:text-sm bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-colors"
                  />
                  {searchQuery && (
                    <button
                      onClick={() => onSearchChange('')}
                      className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Right: Actions (Track Order, Search Toggle, Cart Button) */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Search Toggle */}
              {onSearchChange && (
                <button
                  type="button"
                  onClick={() => setIsSearchExpanded(!isSearchExpanded)}
                  className="md:hidden p-2 rounded-xl text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                  aria-label="Search"
                >
                  <Search className="w-5 h-5" />
                </button>
              )}

              {/* Track Order Button */}
              <button
                type="button"
                onClick={() => setIsTrackModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-neutral-700 hover:text-neutral-950 bg-neutral-100 hover:bg-neutral-200/80 rounded-xl transition-colors cursor-pointer"
                title="Track your order status"
              >
                <PackageSearch className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span className="hidden xs:inline">Track Order</span>
              </button>

              {/* Cart Drawer Trigger */}
              <button
                type="button"
                onClick={() => setIsCartOpen(true)}
                className="relative inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 sm:py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-2xs transition-all active:scale-95 cursor-pointer"
                aria-label={`View Cart with ${cartCount} items`}
              >
                <div className="relative">
                  <ShoppingBag className="w-4.5 h-4.5" />
                  {cartCount > 0 && (
                    <span className="absolute -top-2 -right-2 bg-emerald-500 text-neutral-950 font-black text-[10px] w-4.5 h-4.5 rounded-full flex items-center justify-center shadow-xs">
                      {cartCount}
                    </span>
                  )}
                </div>
                <span className="hidden sm:inline font-mono">
                  {cartTotal > 0 ? formatBDT(cartTotal) : 'Cart'}
                </span>
              </button>
            </div>
          </div>

          {/* Mobile Search Bar Expanded */}
          {onSearchChange && isSearchExpanded && (
            <div className="md:hidden py-3 border-t border-neutral-100 animate-in fade-in slide-in-from-top-1 duration-150">
              <div className="relative w-full">
                <Search className="w-4 h-4 absolute left-3.5 top-3 text-neutral-400" />
                <input
                  type="text"
                  placeholder={`Search in ${storeName}...`}
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-full pl-10 pr-9 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => onSearchChange('')}
                    className="absolute right-3 top-2.5 text-neutral-400 hover:text-neutral-700"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Desktop Category Navigation Strip */}
          {categories.length > 0 && onSelectCategory && (
            <nav className="hidden lg:flex items-center gap-1 py-2.5 border-t border-neutral-100 overflow-x-auto scrollbar-none text-xs font-semibold">
              <button
                type="button"
                onClick={() => onSelectCategory('all')}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                  activeCategory === 'all'
                    ? 'bg-neutral-900 text-white'
                    : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                }`}
              >
                All Products
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => onSelectCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer shrink-0 ${
                    activeCategory === cat
                      ? 'bg-neutral-900 text-white'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </nav>
          )}
        </div>
      </header>

      {/* Mobile Drawer Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div 
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          <div className="relative w-4/5 max-w-xs bg-white h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto animate-in slide-in-from-left duration-200">
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm">
                    {storeName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-neutral-900 truncate max-w-[150px]">{storeName}</h3>
                    <p className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" /> Verified Store
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Links */}
              <div className="space-y-1">
                <div className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider px-2 mb-1.5">
                  Explore Catalog
                </div>
                <button
                  onClick={() => {
                    onSelectCategory?.('all');
                    setIsMobileMenuOpen(false);
                    navigate('reseller-public-store', { storeSlug: store?.storeSlug || storeSlug });
                  }}
                  className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between ${
                    activeCategory === 'all' ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                  }`}
                >
                  <span>All Products</span>
                  <span className="text-[10px] opacity-70">Catalog</span>
                </button>

                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => {
                      onSelectCategory?.(cat);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold ${
                      activeCategory === cat ? 'bg-neutral-900 text-white' : 'text-neutral-700 hover:bg-neutral-100'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Trust badges strip */}
              <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-100 space-y-2.5 text-xs text-neutral-600">
                <div className="flex items-center gap-2 font-medium text-neutral-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Cash on Delivery (COD)</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-neutral-800">
                  <Truck className="w-4 h-4 text-neutral-700 shrink-0" />
                  <span>2–4 Days Nationwide Courier</span>
                </div>
                <div className="flex items-center gap-2 font-medium text-neutral-800">
                  <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>7-Day Replacement Warranty</span>
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-neutral-100 space-y-2">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  setIsTrackModalOpen(true);
                }}
                className="w-full py-2.5 px-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-emerald-100"
              >
                <PackageSearch className="w-4 h-4 text-emerald-700" /> Track My Order
              </button>

              {store?.contactPhone && (
                <a
                  href={`tel:${store.contactPhone}`}
                  className="w-full py-2.5 px-3 bg-neutral-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2"
                >
                  <Phone className="w-3.5 h-3.5" /> Call Store Support
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Slide-over Mini Cart Drawer */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div 
            className="fixed inset-0 bg-neutral-950/50 backdrop-blur-xs animate-in fade-in duration-200"
            onClick={() => setIsCartOpen(false)}
          />

          <div className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-200">
            {/* Cart Header */}
            <div className="p-5 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-neutral-900" />
                <h3 className="font-bold text-base text-neutral-900">Your Shopping Bag</h3>
                <span className="text-xs font-bold text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full">
                  {cartCount} item{cartCount === 1 ? '' : 's'}
                </span>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4">
              {cart.length === 0 ? (
                <div className="py-20 text-center space-y-3">
                  <ShoppingBag className="w-12 h-12 text-neutral-200 mx-auto" />
                  <p className="text-base font-bold text-neutral-800">Your bag is currently empty</p>
                  <p className="text-xs text-neutral-500 max-w-xs mx-auto">
                    Explore available items in {storeName} and add them to your cart.
                  </p>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="mt-3 px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
                  >
                    Start Shopping
                  </button>
                </div>
              ) : (
                <div className="divide-y divide-neutral-100">
                  {cart.map((item) => (
                    <div key={item.id} className="py-3.5 flex gap-3.5 items-center">
                      <img 
                        src={item.imageUrl} 
                        alt={item.name} 
                        className="w-16 h-16 rounded-xl object-cover border border-neutral-100 bg-neutral-50 shrink-0" 
                      />

                      <div className="flex-1 min-w-0">
                        <h4 className="text-xs sm:text-sm font-bold text-neutral-900 truncate">
                          {item.name}
                        </h4>
                        <div className="text-xs font-extrabold text-neutral-900 mt-0.5 font-mono">
                          {formatBDT(item.price)}
                        </div>

                        {/* Quantity and remove */}
                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center border border-neutral-200 rounded-lg overflow-hidden bg-neutral-50">
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, Math.max(1, item.quantity - 1))}
                              className="p-1 hover:bg-neutral-200 transition-colors cursor-pointer"
                            >
                              <Minus className="w-3 h-3 text-neutral-600" />
                            </button>
                            <span className="px-2 text-xs font-bold text-neutral-800">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => updateCartQuantity(item.id, item.quantity + 1)}
                              className="p-1 hover:bg-neutral-200 transition-colors cursor-pointer"
                            >
                              <Plus className="w-3 h-3 text-neutral-600" />
                            </button>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeFromCart(item.id)}
                            className="text-neutral-400 hover:text-rose-600 p-1 cursor-pointer"
                            title="Remove"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {cart.length > 0 && (
              <div className="p-5 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Subtotal</span>
                    <span className="font-extrabold text-neutral-900 text-sm font-mono">
                      {formatBDT(cartTotal)}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Shipping</span>
                    <span className="text-emerald-700 font-medium">Calculated at checkout (৳60 / ৳120)</span>
                  </div>
                  <div className="flex justify-between text-neutral-900 font-bold pt-2 border-t border-neutral-200">
                    <span>Estimated Total</span>
                    <span className="text-base text-neutral-900 font-mono">
                      {formatBDT(cartTotal)}
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleProceedToCheckout}
                  className="w-full py-3.5 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-sm font-bold shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4 text-emerald-400" /> Proceed to Express Checkout
                </button>

                <p className="text-[11px] text-center text-neutral-500 font-medium">
                  ✓ Cash on Delivery &amp; Central Secure Online Payment
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Public Order Tracking Modal */}
      <PublicOrderTrackingModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        storeName={storeName}
      />

      {/* Centralized Express Checkout Modal */}
      <PublicCheckoutModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        storeName={storeName}
        storeSlug={store?.storeSlug || storeSlug}
        resellerId={store?.resellerId}
      />
    </>
  );
}
