'use client';

import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { useReseller } from '@/context/ResellerContext';
import { BrandLogo } from '@/components/common/BrandLogo';
import { formatBDT } from '@/lib/formatters';
import { isVerifiedResellerUser } from '@/lib/productVisibility';
import { 
  Search, 
  Heart, 
  User, 
  Menu, 
  X, 
  Truck, 
  HelpCircle, 
  Store, 
  ShieldCheck, 
  ChevronDown,
  Flame,
  ArrowRight,
  Tag,
  Star,
  Clock,
  Sparkles,
  Package,
  LogOut,
  Lock,
  Smartphone,
  Zap
} from 'lucide-react';

export function Header() {
  const { 
    navigate, 
    activeView,
    selectedCategory,
    wishlist, 
    userRole, 
    setUserRole, 
    products, 
    sellers,
    categories,
    searchQuery, 
    setSearchQuery,
    setSelectedCategory 
  } = useMarketplace();

  const { user, userProfile, isAuthenticated, role: authRole, logout } = useAuth();
  const { isReseller } = useReseller();

  const isUserReseller = Boolean(
    isVerifiedResellerUser(userProfile, authRole, isAuthenticated)
  );

  const isUserAdmin = authRole === 'admin' || 
    userProfile?.role === 'admin' || 
    user?.email?.toLowerCase() === 'moonlit4637@gmail.com' || 
    user?.email?.toLowerCase() === 'admin@zeroinvest.com';

  // Navigation tab state - dynamically track active tab and sync with router/view state
  const getDerivedActiveTab = (): string => {
    if (activeView === 'home') return 'home';
    if (activeView === 'shop' || activeView === 'search') return 'products';
    if (activeView === 'how-it-works') return 'how-it-works';
    if (activeView === 'track-order' || activeView === 'order-tracking') return 'track-order';
    if (activeView === 'categories') return 'categories';
    if (activeView === 'new-arrivals') return 'new-arrivals';
    if (activeView === 'deals') return 'deals';
    if (activeView === 'reseller' || activeView === 'start-selling' || activeView === 'reseller-register') return 'start-selling';
    if (activeView === 'reseller-portal' || activeView === 'reseller-dashboard') return 'reseller-portal';
    return '';
  };

  const [activeNavTab, setActiveNavTab] = useState<string>(getDerivedActiveTab);

  useEffect(() => {
    setActiveNavTab(getDerivedActiveTab());
  }, [activeView, selectedCategory]);

  const handleNavTabClick = (tabKey: string, action: () => void) => {
    setActiveNavTab(tabKey);
    action();
  };

  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAccountMenuOpen, setIsAccountMenuOpen] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const accountRef = useRef<HTMLDivElement>(null);

  // Recent searches state loaded from localStorage
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    if (typeof window !== 'undefined') {
      try {
        const stored = localStorage.getItem('zero_invest_recent_searches');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed)) {
            return parsed.slice(0, 8);
          }
        }
      } catch (err) {
        console.warn('Failed to parse recent searches:', err);
      }
    }
    return [];
  });

  const saveRecentSearch = (term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 8);
      try {
        localStorage.setItem('zero_invest_recent_searches', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save recent search:', err);
      }
      return updated;
    });
  };

  const removeRecentSearch = (termToRemove: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecentSearches(prev => {
      const updated = prev.filter(item => item !== termToRemove);
      try {
        localStorage.setItem('zero_invest_recent_searches', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to update recent searches:', err);
      }
      return updated;
    });
  };

  const clearAllRecentSearches = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setRecentSearches([]);
    try {
      localStorage.removeItem('zero_invest_recent_searches');
    } catch (err) {
      console.warn('Failed to clear recent searches:', err);
    }
  };

  const handleSelectRecentSearch = (term: string) => {
    setSearchQuery(term);
    saveRecentSearch(term);
    setIsSearchOpen(false);
    navigate('search', { query: term });
  };

  // Popular search suggestions when query is empty
  const popularSearches = [
    'Ceramic Tableware',
    'Linen Apparel',
    'Noise Cancelling',
    'Organic Skincare',
    'Ergonomic Desk',
    'Handmade Leather'
  ];

  // Live matching categories (up to 3)
  const matchingCategories = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return categories.filter(c => c.name.toLowerCase().includes(q)).slice(0, 3);
  }, [categories, searchQuery]);

  // Live matching sellers (up to 2)
  const matchingSellers = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return sellers.filter(s => 
      s.storeName.toLowerCase().includes(q) || 
      s.category.toLowerCase().includes(q)
    ).slice(0, 2);
  }, [sellers, searchQuery]);

  // Live matching products (up to 4)
  const matchingProducts = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return products.filter(p => 
      p.isActive !== false && (
        p.name.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.sellerName.toLowerCase().includes(q)
      )
    ).slice(0, 4);
  }, [products, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const q = searchQuery.trim();
      saveRecentSearch(q);
      setIsSearchOpen(false);
      navigate('search', { query: q });
    }
  };

  const handleSelectSuggestion = (type: 'product' | 'category' | 'seller' | 'keyword', value: string, extraId?: string) => {
    setIsSearchOpen(false);
    if (type === 'product' && extraId) {
      navigate('product-detail', { productId: extraId });
    } else if (type === 'category') {
      setSelectedCategory(value);
      navigate('shop', { category: value });
    } else if (type === 'seller' && extraId) {
      navigate('seller-store', { sellerId: extraId });
    } else {
      setSearchQuery(value);
      saveRecentSearch(value);
      navigate('search', { query: value });
    }
  };

  // Close menus on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (accountRef.current && !accountRef.current.contains(event.target as Node)) {
        setIsAccountMenuOpen(false);
      }
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsSearchOpen(false);
        setIsAccountMenuOpen(false);
        searchInputRef.current?.blur();
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header className="w-full max-w-full bg-white border-b border-[#E6E4E0] sticky top-0 z-50">
      {/* Main Navigation Header */}
      <div className="w-full max-w-full mx-auto px-3 sm:px-5 lg:px-8 xl:px-10 py-2 sm:py-3.5 relative z-20">
        <div className="w-full max-w-full flex items-center justify-between gap-1 sm:gap-3 lg:gap-8 min-w-0">
          {/* Left: Brand Logo & Mobile Menu Toggle */}
          <div className="flex items-center gap-1 sm:gap-2.5 shrink-0 min-w-0">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="lg:hidden p-1 sm:p-1.5 -ml-1 text-neutral-700 hover:text-black rounded-lg hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5 sm:w-6 sm:h-6" />
            </button>

            <button 
              onClick={() => navigate('home')} 
              className="text-left focus:outline-none shrink-0 cursor-pointer"
            >
              <BrandLogo size="md" className="hidden sm:flex" />
              <BrandLogo size="sm" className="flex sm:hidden" />
            </button>
          </div>

          {/* Center: Large Prominent Search Bar with Suggestions */}
          <div className="hidden md:flex flex-1 max-w-4xl lg:max-w-5xl xl:max-w-6xl relative z-50" ref={searchContainerRef}>
            <form onSubmit={handleSearchSubmit} className="w-full relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchOpen(true);
                }}
                onFocus={() => setIsSearchOpen(true)}
                onKeyDown={(e) => {
                  if (e.key === 'Escape') {
                    setIsSearchOpen(false);
                    searchInputRef.current?.blur();
                  }
                }}
                placeholder="Search products, brands, sellers, and more..."
                className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-full py-3 pl-5 pr-14 text-sm sm:text-[15px] text-[#111111] placeholder:text-[#767676] focus:outline-none focus:border-[#111111] focus:bg-white transition-all shadow-xs font-normal"
              />
              <button
                type="submit"
                className="absolute right-1.5 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-[#111111] text-white flex items-center justify-center hover:bg-neutral-800 transition-colors shadow-2xs"
                aria-label="Submit search"
              >
                <Search className="w-4 h-4" />
              </button>
            </form>

            {/* Polished Live Search Suggestions Panel */}
            {isSearchOpen && (
              <div 
                className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl border border-zinc-200 shadow-xl overflow-hidden z-50 p-3 sm:p-4 animate-in fade-in slide-in-from-top-2 duration-150"
              >
                {searchQuery.trim() === '' ? (
                  /* Empty state: Recent Searches, Popular Searches & Categories */
                  <div className="space-y-4">
                    {/* 1. Recent Searches Section (when history exists) */}
                    {recentSearches.length > 0 && (
                      <div>
                        <div className="flex items-center justify-between mb-2 px-1">
                          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-zinc-600">
                            <Clock className="w-3.5 h-3.5 text-zinc-500" />
                            <span>Recent Searches</span>
                          </div>
                          <button
                            type="button"
                            onClick={clearAllRecentSearches}
                            className="text-xs font-semibold text-zinc-500 hover:text-rose-600 transition-colors cursor-pointer"
                          >
                            Clear all
                          </button>
                        </div>

                        <div className="space-y-1">
                          {recentSearches.map((term) => (
                            <div
                              key={term}
                              onClick={() => handleSelectRecentSearch(term)}
                              className="group flex items-center justify-between px-3 py-2 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer text-xs sm:text-sm text-zinc-800"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 flex-1">
                                <Clock className="w-3.5 h-3.5 text-zinc-400 group-hover:text-zinc-600 shrink-0" />
                                <span className="font-medium text-zinc-900 truncate">{term}</span>
                              </div>
                              <button
                                type="button"
                                onClick={(e) => removeRecentSearch(term, e)}
                                className="p-1 rounded-md text-zinc-400 hover:text-zinc-700 hover:bg-zinc-200 transition-colors opacity-80 hover:opacity-100 ml-2 shrink-0 cursor-pointer"
                                title="Remove from history"
                                aria-label={`Remove ${term} from history`}
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Popular Right Now */}
                    <div className={recentSearches.length > 0 ? "pt-3 border-t border-zinc-200" : ""}>
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2.5 px-1">
                        <span>Popular Right Now</span>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        {popularSearches.map((term) => (
                          <button
                            key={term}
                            type="button"
                            onClick={() => handleSelectSuggestion('keyword', term)}
                            className="px-3 py-1.5 rounded-full bg-zinc-100 hover:bg-zinc-200 text-zinc-800 border border-zinc-200 text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <Search className="w-3 h-3 text-zinc-400" />
                            <span>{term}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* 3. Browse by Category */}
                    <div className="pt-3 border-t border-zinc-200">
                      <div className="text-xs font-bold uppercase tracking-wider text-zinc-600 mb-2 px-1">
                        Browse by Category
                      </div>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {categories.slice(0, 6).map((cat) => (
                          <button
                            key={cat.id}
                            type="button"
                            onClick={() => handleSelectSuggestion('category', cat.name)}
                            className="text-left p-2 rounded-xl hover:bg-zinc-100 transition-colors cursor-pointer"
                          >
                            <p className="text-xs sm:text-sm font-semibold text-zinc-900">{cat.name}</p>
                            <p className="text-[11px] text-zinc-500">{cat.productCount} items</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  /* Live Matches: Categories, Sellers, Products */
                  <div className="space-y-3.5">
                    {/* Matching Categories */}
                    {matchingCategories.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1 px-2">
                          Categories
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {matchingCategories.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => handleSelectSuggestion('category', c.name)}
                              className="px-3 py-1.5 rounded-xl bg-zinc-100 hover:bg-zinc-200 text-xs font-semibold text-zinc-800 border border-zinc-200 flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Tag className="w-3 h-3 text-[#C98F6B]" />
                              <span>{c.name}</span>
                              <span className="text-zinc-500 font-normal">({c.productCount})</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Sellers */}
                    {matchingSellers.length > 0 && (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1 px-2">
                          Independent Sellers &amp; Brands
                        </div>
                        <div className="space-y-1">
                          {matchingSellers.map((s) => (
                            <button
                              key={s.id}
                              type="button"
                              onClick={() => handleSelectSuggestion('seller', s.storeName, s.id)}
                              className="w-full text-left p-2 rounded-xl hover:bg-zinc-100 transition-colors flex items-center justify-between cursor-pointer"
                            >
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-zinc-200 overflow-hidden shrink-0 border border-zinc-200">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={s.avatarUrl} alt={s.storeName} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-bold text-zinc-900">{s.storeName}</p>
                                  <p className="text-[11px] text-zinc-500">{s.category} · Verified Merchant</p>
                                </div>
                              </div>
                              <div className="flex items-center gap-1 text-xs font-bold text-zinc-800">
                                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                                <span>{s.rating}</span>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Matching Products */}
                    {matchingProducts.length > 0 ? (
                      <div>
                        <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 mb-1 px-2">
                          Products
                        </div>
                        <div className="space-y-1">
                          {matchingProducts.map((item) => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleSelectSuggestion('product', item.name, item.id)}
                              className="w-full text-left p-2 rounded-xl flex items-center justify-between hover:bg-zinc-100 transition-colors cursor-pointer"
                            >
                              <div className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl bg-zinc-100 overflow-hidden shrink-0 border border-zinc-200">
                                  {/* eslint-disable-next-line @next/next/no-img-element */}
                                  <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                                </div>
                                <div>
                                  <p className="text-xs sm:text-sm font-semibold text-zinc-900 line-clamp-1">{item.name}</p>
                                  <p className="text-[12px] text-zinc-500">
                                    by <span className="text-zinc-700 font-medium">{item.sellerName}</span> · <span className="font-extrabold text-zinc-900">{formatBDT(item.price)}</span>
                                  </p>
                                </div>
                              </div>
                              <ArrowRight className="w-4 h-4 text-zinc-400 shrink-0" />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      matchingCategories.length === 0 && matchingSellers.length === 0 && (
                        <div className="p-4 text-center text-sm text-zinc-500">
                          No exact title matches. Press enter or search button to browse full catalog.
                        </div>
                      )
                    )}

                    {/* View all results button */}
                    <div className="pt-2 border-t border-zinc-200 px-2">
                      <button
                        type="button"
                        onClick={() => {
                          saveRecentSearch(searchQuery);
                          setIsSearchOpen(false);
                          navigate('search', { query: searchQuery });
                        }}
                        className="text-xs sm:text-sm font-bold text-[#C98F6B] hover:text-[#B57C58] flex items-center gap-1.5 py-1 cursor-pointer"
                      >
                        <span>View all matching marketplace results for &quot;{searchQuery}&quot;</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Actions (Account, Wishlist, Cart) */}
          {/* Right: Actions (Search, Account with Dropdown, Wishlist) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Mobile Search Button */}
            <button
              onClick={() => {
                setIsMobileMenuOpen(true);
                setTimeout(() => {
                  const mobileInput = document.getElementById('mobile-drawer-search');
                  mobileInput?.focus();
                }, 100);
              }}
              className="md:hidden p-1.5 sm:p-2 text-neutral-700 hover:text-black rounded-full hover:bg-neutral-100 transition-colors shrink-0 cursor-pointer"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Account Avatar & Dropdown Menu */}
            <div className="relative shrink-0" ref={accountRef}>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  if (isAuthenticated) {
                    setIsAccountMenuOpen(prev => !prev);
                  } else {
                    navigate('auth');
                  }
                }}
                className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-full hover:bg-[#F7F6F3] active:bg-[#EFECE6] transition-all text-neutral-800 cursor-pointer select-none"
                aria-label="Account menu"
                aria-expanded={isAccountMenuOpen}
              >
                {isAuthenticated && (user?.photoURL || userProfile?.photoURL) ? (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full overflow-hidden border border-[#E6E4E0] shrink-0 shadow-2xs">
                    <img 
                      src={user?.photoURL || userProfile?.photoURL} 
                      alt="User avatar" 
                      className="w-full h-full object-cover" 
                    />
                  </div>
                ) : (
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#111111] text-white flex items-center justify-center font-bold text-xs sm:text-sm shadow-2xs shrink-0">
                    {isAuthenticated ? (
                      <span>{(userProfile?.firstName || user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}</span>
                    ) : (
                      <User className="w-4 h-4 text-white" />
                    )}
                  </div>
                )}
                
                <div className="hidden xl:flex flex-col text-left leading-tight">
                  <span className="text-[11px] font-medium text-neutral-400">
                    {isAuthenticated ? 'My Account' : 'Welcome'}
                  </span>
                  <span className="text-[13px] font-bold text-neutral-900 capitalize truncate max-w-[110px]">
                    {isAuthenticated ? (userProfile?.firstName || user?.displayName?.split(' ')[0] || 'Member') : 'Sign In'}
                  </span>
                </div>
                <ChevronDown className={`hidden xl:block w-3.5 h-3.5 text-neutral-400 transition-transform duration-150 ${isAccountMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Polished User Avatar Dropdown Menu (PC & Desktop Version) */}
              {isAccountMenuOpen && (
                <div 
                  onClick={(e) => e.stopPropagation()}
                  className="absolute right-0 top-full mt-2 w-56 sm:w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150"
                >
                  {isAuthenticated ? (
                    <>
                      {/* Header Section: Name, Email & Role Badge */}
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900 truncate">
                          {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() : (user?.displayName || 'User Profile')}
                        </p>
                        <p className="text-xs text-slate-500 truncate mt-0.5">
                          {user?.email || userProfile?.email || user?.phoneNumber || 'Zero Invest Member'}
                        </p>
                        <div className="mt-2.5 flex items-center gap-1.5 flex-wrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-800 uppercase tracking-wider">
                            {isUserAdmin ? 'Admin' : isUserReseller ? 'Reseller' : (authRole || userRole || 'Customer')}
                          </span>
                          {(user?.emailVerified || userProfile?.emailVerified || isAuthenticated) && (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                              <ShieldCheck className="w-3 h-3 text-emerald-600" />
                              Verified
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Navigation Quick Links */}
                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            navigate('account', { accountTab: 'orders' });
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          <span>My Account &amp; Orders</span>
                        </button>

                        {(isUserReseller || isUserAdmin) ? (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAccountMenuOpen(false);
                              navigate(isUserAdmin ? 'admin-dashboard' : 'reseller-dashboard');
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Store className="w-4 h-4 text-emerald-600" />
                            <span>{isUserAdmin ? 'Admin Operations Hub' : 'Reseller Dashboard'}</span>
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => {
                              setIsAccountMenuOpen(false);
                              navigate('reseller');
                            }}
                            className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-amber-500" />
                            <span>Start Selling (Reseller)</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            navigate('account', { accountTab: 'security' });
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-slate-900 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <Lock className="w-4 h-4 text-slate-400" />
                          <span>Account Settings &amp; Security</span>
                        </button>
                      </div>

                      {/* Danger / Log Out Section */}
                      <div className="border-t border-slate-100 pt-1 mt-1">
                        <button
                          type="button"
                          onClick={async () => {
                            setIsAccountMenuOpen(false);
                            try {
                              await logout();
                            } catch (err) {
                              console.error('Logout error:', err);
                            }
                            navigate('home');
                          }}
                          className="w-full text-left px-4 py-2.5 text-xs sm:text-sm font-semibold text-rose-600 hover:bg-rose-50 flex items-center gap-2.5 transition-colors cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-500" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="px-4 py-3 border-b border-slate-100">
                        <p className="text-sm font-bold text-slate-900">Zero Invest Member</p>
                        <p className="text-xs text-slate-500 mt-0.5">Sign in to access your orders and workspace.</p>
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setIsAccountMenuOpen(false);
                              navigate('auth', { authTab: 'signin' });
                            }}
                            className="flex-1 py-2 px-3 bg-[#111111] hover:bg-neutral-800 text-white rounded-xl text-xs font-bold text-center transition-colors shadow-2xs cursor-pointer"
                          >
                            Sign In
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setIsAccountMenuOpen(false);
                              navigate('auth', { authTab: 'register' });
                            }}
                            className="flex-1 py-2 px-3 bg-white border border-[#E6E4E0] hover:bg-[#F7F6F3] text-neutral-800 rounded-xl text-xs font-bold text-center transition-colors cursor-pointer"
                          >
                            Register
                          </button>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            navigate('phone-auth');
                          }}
                          className="w-full text-left px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Smartphone className="w-4 h-4 text-slate-400" />
                          <span>Sign In with Phone OTP (+880)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            navigate('track-order');
                          }}
                          className="w-full text-left px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <Truck className="w-4 h-4 text-slate-400" />
                          <span>Track Parcel as Guest</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setIsAccountMenuOpen(false);
                            navigate('help');
                          }}
                          className="w-full text-left px-4 py-2 text-xs sm:text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2.5 cursor-pointer"
                        >
                          <HelpCircle className="w-4 h-4 text-slate-400" />
                          <span>Help Center</span>
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Wishlist Button */}
            <button
              onClick={() => navigate('account', { accountTab: 'wishlist' })}
              className="relative p-1.5 sm:p-2 text-neutral-800 hover:text-black rounded-full hover:bg-[#F7F6F3] transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer"
              aria-label="Wishlist"
              title="View Wishlist"
            >
              <Heart className="w-5 h-5 text-neutral-800" />
              <span className="text-[13.5px] font-semibold text-neutral-800 hidden lg:inline">Wishlist</span>
              {wishlist.length > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-[#111111] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                  {wishlist.length}
                </span>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* 3. Main Navigation Row (Reseller-First Structure) */}
      <div className="border-t border-[#E6E4E0] bg-white w-full max-w-full relative z-0 overflow-hidden">
        <div className="w-full max-w-full mx-auto px-3 sm:px-5 lg:px-8 xl:px-10">
          <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth py-2 sm:py-2.5 text-xs sm:text-[14px] font-semibold text-[#555555] whitespace-nowrap min-w-0">
            {/* Home */}
            <button
              onClick={() => handleNavTabClick('home', () => navigate('home'))}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 shrink-0 cursor-pointer ${
                activeNavTab === 'home'
                  ? 'bg-[#111111] text-white font-bold shadow-xs'
                  : 'text-[#555555] hover:text-neutral-900 hover:bg-[#F7F6F3]'
              }`}
            >
              Home
            </button>

            {/* Products */}
            <button
              onClick={() => handleNavTabClick('products', () => navigate('shop'))}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 shrink-0 cursor-pointer ${
                activeNavTab === 'products'
                  ? 'bg-[#111111] text-white font-bold shadow-xs'
                  : 'text-[#555555] hover:text-neutral-900 hover:bg-[#F7F6F3]'
              }`}
            >
              Products
            </button>

            {/* How It Works */}
            <button
              onClick={() => handleNavTabClick('how-it-works', () => navigate('how-it-works'))}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 shrink-0 cursor-pointer ${
                activeNavTab === 'how-it-works'
                  ? 'bg-[#111111] text-white font-bold shadow-xs'
                  : 'text-[#555555] hover:text-neutral-900 hover:bg-[#F7F6F3]'
              }`}
            >
              How It Works
            </button>

            {/* Track Order */}
            <button
              onClick={() => handleNavTabClick('track-order', () => navigate('track-order'))}
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 shrink-0 cursor-pointer ${
                activeNavTab === 'track-order'
                  ? 'bg-[#111111] text-white font-bold shadow-xs'
                  : 'text-[#555555] hover:text-neutral-900 hover:bg-[#F7F6F3]'
              }`}
            >
              Track Order
            </button>

            <div className="w-px h-4 bg-[#E6E4E0] mx-1 shrink-0" />

            {/* Categories */}
            <button
              onClick={() => handleNavTabClick('categories', () => { setSelectedCategory(null); navigate('categories'); })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full transition-all duration-200 shrink-0 cursor-pointer ${
                activeNavTab === 'categories'
                  ? 'bg-[#111111] text-white font-bold shadow-xs'
                  : 'text-[#666666] hover:text-[#111111] hover:bg-[#F7F6F3]'
              }`}
            >
              <Menu className={`w-3.5 h-3.5 ${activeNavTab === 'categories' ? 'text-white' : 'text-neutral-500'}`} />
              <span>Categories</span>
            </button>

            {/* Start Selling / Reseller Portal Nav Link */}
            <div className="ml-auto shrink-0 pl-2">
              {isUserReseller ? (
                <button
                  onClick={() => handleNavTabClick('reseller-portal', () => navigate('reseller-dashboard'))}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-200 shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeNavTab === 'reseller-portal'
                      ? 'bg-[#111111] text-white font-bold shadow-xs'
                      : 'text-[#C98F6B] hover:text-[#b07855] hover:bg-[#F7F6F3] font-bold'
                  }`}
                >
                  <Store className="w-3.5 h-3.5" />
                  <span>Reseller Portal</span>
                </button>
              ) : (
                <button
                  onClick={() => handleNavTabClick('start-selling', () => navigate('reseller'))}
                  className={`px-3.5 py-1.5 rounded-full transition-all duration-200 shrink-0 flex items-center gap-1.5 cursor-pointer ${
                    activeNavTab === 'start-selling' || activeView === 'reseller' || activeView === 'start-selling'
                      ? 'bg-[#111111] text-white font-bold shadow-xs'
                      : 'text-[#C98F6B] hover:text-[#b07855] hover:bg-[#F7F6F3] font-bold'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Start Selling</span>
                </button>
              )}
            </div>
          </nav>
        </div>
      </div>

      {/* 4. Mobile Slide-Out Drawer / Navigation Modal */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          {/* Backdrop overlay */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
            onClick={() => setIsMobileMenuOpen(false)}
            aria-hidden="true"
          />

          {/* Slide-out drawer panel */}
          <div 
            className="relative w-[320px] max-w-[85vw] h-full bg-white shadow-2xl flex flex-col z-10 overflow-hidden animate-in slide-in-from-left duration-200"
            role="dialog"
            aria-modal="true"
            aria-label="Site Navigation"
          >
            {/* Drawer Header */}
            <div className="p-4 border-b border-[#E6E4E0] flex items-center justify-between bg-[#F7F6F3]">
              <BrandLogo size="sm" />
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white border border-[#E6E4E0] flex items-center justify-center text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors"
                aria-label="Close navigation"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Body (Scrollable) */}
            <div className="flex-1 overflow-y-auto p-4 space-y-5">
              {/* Quick Search Bar */}
              <form 
                onSubmit={(e) => {
                  handleSearchSubmit(e);
                  setIsMobileMenuOpen(false);
                }} 
                className="relative"
              >
                <input
                  id="mobile-drawer-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products & stores..."
                  className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl py-2.5 pl-3.5 pr-10 text-xs sm:text-sm focus:outline-none focus:border-black"
                />
                <button type="submit" className="absolute right-3 top-2.5 text-neutral-500 hover:text-black cursor-pointer">
                  <Search className="w-4 h-4" />
                </button>
              </form>

              {/* Mobile Recent Searches chips */}
              {recentSearches.length > 0 && (
                <div className="space-y-2 pt-1 pb-1 border-b border-zinc-100">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider text-zinc-600">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-zinc-500" />
                      <span>Recent Searches</span>
                    </div>
                    <button
                      type="button"
                      onClick={clearAllRecentSearches}
                      className="text-[11px] font-semibold text-zinc-500 hover:text-rose-600 cursor-pointer"
                    >
                      Clear all
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {recentSearches.map((term) => (
                      <span
                        key={term}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs text-zinc-800 transition-colors"
                      >
                        <span 
                          onClick={() => {
                            handleSelectRecentSearch(term);
                            setIsMobileMenuOpen(false);
                          }}
                          className="cursor-pointer font-medium hover:text-black"
                        >
                          {term}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => removeRecentSearch(term, e)}
                          className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
                          aria-label={`Remove ${term}`}
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* Auth Banner in Mobile Drawer */}
              {isAuthenticated ? (
                <div className="bg-[#111111] text-white p-3.5 rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#C98F6B] text-white flex items-center justify-center font-bold text-sm shrink-0">
                      {(userProfile?.firstName || user?.displayName || user?.email || 'U').charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-bold text-white truncate">
                        {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : (user?.displayName || 'Member')}
                      </p>
                      <p className="text-[11px] text-neutral-400 truncate">{user?.email || userProfile?.email}</p>
                    </div>
                  </div>
                  <div className="mt-2.5 pt-2.5 border-t border-neutral-800 flex items-center justify-between text-[11px]">
                    <span className="text-neutral-400 capitalize">Role: <strong className="text-white">{authRole || userRole}</strong></span>
                    <button
                      onClick={async () => {
                        setIsMobileMenuOpen(false);
                        await logout();
                        navigate('home');
                      }}
                      className="text-[#C98F6B] hover:text-white font-semibold transition-colors"
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              ) : (
                <div className="bg-[#F7F6F3] p-3 rounded-2xl border border-[#E6E4E0]">
                  <p className="text-xs font-bold text-neutral-900 mb-1">Zero Invest Account</p>
                  <p className="text-[11px] text-neutral-500 mb-2.5">Sign in to track orders and save your wishlist.</p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('auth', { authTab: 'signin' });
                      }}
                      className="flex-1 py-2 bg-[#111111] text-white rounded-xl text-xs font-bold text-center"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        navigate('auth', { authTab: 'register' });
                      }}
                      className="flex-1 py-2 bg-white border border-[#E6E4E0] text-neutral-800 rounded-xl text-xs font-bold text-center"
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}

              {/* Primary Shortcuts Grid */}
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Marketplace Hub
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('shop'); }}
                    className="p-3 bg-[#F7F6F3] hover:bg-neutral-200 rounded-xl text-left flex items-center justify-between text-neutral-800 transition-colors"
                  >
                    <span>All Products</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('categories'); }}
                    className="p-3 bg-[#F7F6F3] hover:bg-neutral-200 rounded-xl text-left flex items-center justify-between text-neutral-800 transition-colors"
                  >
                    <span>Categories</span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('deals'); }}
                    className="p-3 bg-rose-50 hover:bg-rose-100 text-rose-700 rounded-xl text-left flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-1.5">
                      <Flame className="w-3.5 h-3.5 fill-current" /> Top Deals
                    </span>
                    <span className="text-[10px] bg-rose-600 text-white font-bold px-1.5 py-0.5 rounded-full">Hot</span>
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('how-it-works'); }}
                    className="p-3 bg-[#EAD7CA]/30 hover:bg-[#EAD7CA]/50 text-neutral-900 rounded-xl text-left flex items-center justify-between transition-colors"
                  >
                    <span>How It Works</span>
                    <Sparkles className="w-3.5 h-3.5 text-[#C98F6B]" />
                  </button>
                </div>
              </div>

              {/* Account & Orders Section */}
              <div className="border-t border-[#E6E4E0] pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  My Profile &amp; Orders
                </p>
                <div className="space-y-1 text-xs sm:text-sm font-medium">
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('account', { accountTab: 'orders' }); }}
                    className="w-full py-2.5 px-3 text-left hover:bg-[#F7F6F3] rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Package className="w-4 h-4 text-neutral-500" />
                      Orders &amp; Account
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('account', { accountTab: 'wishlist' }); }}
                    className="w-full py-2.5 px-3 text-left hover:bg-[#F7F6F3] rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Heart className="w-4 h-4 text-[#C98F6B]" />
                      Saved Wishlist
                    </span>
                    {wishlist.length > 0 && (
                      <span className="text-[11px] font-bold bg-[#111111] text-white px-2 py-0.5 rounded-full">
                        {wishlist.length}
                      </span>
                    )}
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('account', { accountTab: 'security' }); }}
                    className="w-full py-2.5 px-3 text-left hover:bg-[#F7F6F3] rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-neutral-500" />
                      Security &amp; Linked Logins
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('track-order'); }}
                    className="w-full py-2.5 px-3 text-left hover:bg-[#F7F6F3] rounded-xl flex items-center justify-between transition-colors"
                  >
                    <span className="flex items-center gap-2">
                      <Truck className="w-4 h-4 text-neutral-500" />
                      Track Active Delivery
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                  </button>
                </div>
              </div>

              {/* Reseller Platform Section */}
              <div className="border-t border-[#E6E4E0] pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Reseller Platform
                </p>
                <div className="space-y-1 text-xs sm:text-sm font-medium">
                  {isUserReseller ? (
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); navigate('reseller-dashboard'); }}
                      className="w-full py-2.5 px-3 text-left hover:bg-[#F7F6F3] rounded-xl flex items-center justify-between text-[#C98F6B] font-semibold transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Store className="w-4 h-4 text-[#C98F6B]" />
                        Reseller Portal Dashboard
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C98F6B]" />
                    </button>
                  ) : (
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); navigate('reseller'); }}
                      className="w-full py-2.5 px-3 text-left hover:bg-[#F7F6F3] rounded-xl flex items-center justify-between text-[#C98F6B] font-semibold transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#C98F6B]" />
                        Start Selling (Reseller Program)
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-[#C98F6B]" />
                    </button>
                  )}
                  {isUserAdmin && (
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); navigate('admin-dashboard'); }}
                      className="w-full py-2.5 px-3 text-left hover:bg-[#F7F6F3] rounded-xl flex items-center justify-between text-neutral-800 transition-colors cursor-pointer"
                    >
                      <span className="flex items-center gap-2 font-semibold">
                        <ShieldCheck className="w-4 h-4 text-neutral-900" />
                        Admin Control Hub
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-neutral-400" />
                    </button>
                  )}
                </div>
              </div>

              {/* Help & Support */}
              <div className="border-t border-[#E6E4E0] pt-4">
                <p className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 mb-2">
                  Support &amp; Guarantees
                </p>
                <div className="space-y-1 text-xs font-medium text-neutral-600">
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('help'); }}
                    className="w-full py-2 px-3 text-left hover:bg-[#F7F6F3] rounded-xl flex items-center gap-2 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5 text-neutral-400" />
                    Help Center &amp; Buyer Protection
                  </button>
                  <button 
                    onClick={() => { setIsMobileMenuOpen(false); navigate('about'); }}
                    className="w-full py-2 px-3 text-left hover:bg-[#F7F6F3] rounded-xl flex items-center gap-2 transition-colors"
                  >
                    About Zero Invest Platform
                  </button>
                </div>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 border-t border-[#E6E4E0] bg-[#F7F6F3] text-[11px] text-neutral-500 flex items-center justify-between">
              <span>Dropshipping &amp; Reseller Platform</span>
              <span className="font-semibold text-neutral-700">100% Secure</span>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
