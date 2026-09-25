'use client';

import React, { useState, useMemo } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { ProductCard } from '@/components/common/ProductCard';
import { formatBDT } from '@/lib/formatters';
import { getProductResellerPricing } from '@/lib/productVisibility';
import { 
  Filter, 
  SlidersHorizontal, 
  ArrowUpDown, 
  X, 
  Star, 
  Check, 
  Search,
  TrendingUp,
  Lock,
  Sparkles,
  Zap,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';

export function ShopView() {
  const { 
    activeView,
    products, 
    categories, 
    selectedCategory, 
    setSelectedCategory, 
    searchQuery, 
    setSearchQuery,
    navigate
  } = useMarketplace();

  const { isAuthenticated, userProfile, role } = useAuth();
  const isVerifiedReseller = useMemo(() => {
    return isAuthenticated && (
      userProfile?.role === 'reseller' || 
      userProfile?.role === 'seller' || 
      userProfile?.role === 'admin' ||
      role === 'reseller' || 
      role === 'seller' || 
      role === 'admin'
    ) && (
      userProfile?.isVerified === true ||
      (userProfile as any)?.resellerStatus === 'verified' ||
      (userProfile as any)?.resellerStatus === 'active' ||
      (userProfile?.status === 'active' && (userProfile as any)?.resellerStatus !== 'pending')
    );
  }, [isAuthenticated, userProfile, role]);

  // Reseller Filters state
  const [minProfitFilter, setMinProfitFilter] = useState<number>(0);
  const [priceRange, setPriceRange] = useState<number>(15000);
  const [inStockOnly, setInStockOnly] = useState<boolean>(true);
  const [sortBy, setSortBy] = useState<'profit-desc' | 'popular' | 'newest' | 'price-low' | 'price-high'>('popular');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Automatically default to newest sorting when viewing New Arrivals
  React.useEffect(() => {
    if (activeView === 'new-arrivals') {
      setSortBy('newest');
    }
  }, [activeView]);

  // Filtered & sorted products
  const filteredProducts = useMemo(() => {
    return products.filter((prod) => {
      // Must be active
      if (prod.isActive === false) return false;

      // Category match
      if (selectedCategory && selectedCategory !== 'all' && prod.category !== selectedCategory) {
        return false;
      }
      
      // Search query match
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = (prod.name || '').toLowerCase().includes(q);
        const matchesCat = (prod.category || '').toLowerCase().includes(q);
        const matchesDesc = (prod.description || '').toLowerCase().includes(q);
        if (!matchesName && !matchesCat && !matchesDesc) return false;
      }

      // Price range
      const retailPrice = prod.suggestedPrice || prod.price;
      if (retailPrice > priceRange) return false;

      // In stock
      if (inStockOnly && !prod.inStock) return false;

      // Profit filter (only applies if verified reseller)
      if (isVerifiedReseller && minProfitFilter > 0) {
        const pricing = getProductResellerPricing(prod, true);
        if (pricing.potentialProfit < minProfitFilter) return false;
      }

      return true;
    }).sort((a, b) => {
      const pricingA = getProductResellerPricing(a, isVerifiedReseller);
      const pricingB = getProductResellerPricing(b, isVerifiedReseller);

      if (isVerifiedReseller && sortBy === 'profit-desc') {
        return pricingB.potentialProfit - pricingA.potentialProfit;
      }
      if (sortBy === 'price-low') return pricingA.suggestedPrice - pricingB.suggestedPrice;
      if (sortBy === 'price-high') return pricingB.suggestedPrice - pricingA.suggestedPrice;
      if (sortBy === 'newest') return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
      // default: popular (review count & rating)
      return b.reviewCount - a.reviewCount;
    });
  }, [products, selectedCategory, searchQuery, priceRange, inStockOnly, minProfitFilter, sortBy, isVerifiedReseller]);

  const clearFilters = () => {
    setSelectedCategory(null);
    setPriceRange(15000);
    setMinProfitFilter(0);
    setInStockOnly(false);
    setSearchQuery('');
  };

  const hasActiveFilters = 
    selectedCategory !== null || 
    priceRange < 15000 || 
    minProfitFilter > 0 || 
    inStockOnly || 
    searchQuery.trim() !== '';

  return (
    <div className="w-full max-w-full overflow-hidden bg-[#FAFAF9]">
      <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-6 sm:py-8">
        
        {/* Reseller Banner / Catalog Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-[#E6E4E0]">
          <div>
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAD7CA]/60 text-neutral-800 text-[11px] font-bold uppercase tracking-wider">
                Wholesale Dropship &amp; Reseller Catalog
              </span>
              {!isVerifiedReseller && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200 text-[11px] font-semibold flex items-center gap-1">
                  <Lock className="w-3 h-3 text-amber-600" />
                  Prices Visible to Verified Resellers Only
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#111111] tracking-tight">
              {searchQuery.trim()
                ? `Search Results for "${searchQuery.trim()}"`
                : activeView === 'new-arrivals'
                  ? 'New High-Margin Products'
                  : selectedCategory 
                    ? `${selectedCategory} Products to Sell` 
                    : 'Products You Can Sell'}
            </h1>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 max-w-2xl">
              Select verified wholesale products, generate automated high-converting landing pages, and start earning without holding any inventory. We handle packaging, nationwide delivery, and cash-on-delivery collection.
            </p>
          </div>

          {/* Sort & Mobile filter trigger */}
          <div className="flex items-center gap-3 self-end sm:self-auto shrink-0">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2.5 bg-[#F7F6F3] rounded-full text-xs sm:text-sm font-semibold border border-[#E6E4E0] text-neutral-800"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters {hasActiveFilters && '(Active)'}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 hidden sm:inline">Sort:</span>
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  aria-label="Sort products by"
                  className="bg-white border border-[#E6E4E0] rounded-xl py-2 pl-3 pr-8 text-xs sm:text-sm font-semibold text-[#111111] focus:outline-none focus:border-black appearance-none cursor-pointer shadow-xs"
                >
                  <option value="profit-desc">Highest Profit Margin</option>
                  <option value="popular">Most Popular &amp; Trending</option>
                  <option value="newest">Newest Releases</option>
                  <option value="price-low">Selling Price: Low to High</option>
                  <option value="price-high">Selling Price: High to Low</option>
                </select>
                <ArrowUpDown className="w-3.5 h-3.5 text-neutral-500 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Notice for unauthenticated users */}
        {!isAuthenticated && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-amber-50 via-orange-50 to-amber-50 border border-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-neutral-900">
                  Wholesale Supplier Costs &amp; Net Profit Margins are Locked
                </h2>
                <p className="text-xs text-neutral-600">
                  Sign in to your free reseller account to view base wholesale prices, profit per sale, and generate 1-click landing pages.
                </p>
              </div>
            </div>
            <button
              onClick={() => navigate('reseller')}
              className="px-5 py-2.5 rounded-xl bg-[#111111] hover:bg-neutral-800 text-white text-xs font-bold shrink-0 transition-colors shadow-xs cursor-pointer"
            >
              Start Selling / Learn More
            </button>
          </div>
        )}

        {/* Active Filter Chips */}
        {hasActiveFilters && (
          <div className="flex flex-wrap items-center gap-2 mb-6 text-xs">
            <span className="text-neutral-500 font-semibold">Active filters:</span>
            {selectedCategory && (
              <span className="px-3 py-1 rounded-full bg-[#EAD7CA]/50 text-neutral-900 flex items-center gap-1.5 font-medium border border-[#EAD7CA]">
                Category: {selectedCategory}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-black" onClick={() => setSelectedCategory(null)} />
              </span>
            )}
            {searchQuery && (
              <span className="px-3 py-1 rounded-full bg-[#EAD7CA]/50 text-neutral-900 flex items-center gap-1.5 font-medium border border-[#EAD7CA]">
                &ldquo;{searchQuery}&rdquo;
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-black" onClick={() => setSearchQuery('')} />
              </span>
            )}
            {minProfitFilter > 0 && (
              <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 flex items-center gap-1.5 font-semibold border border-emerald-200">
                Min Profit: ৳{minProfitFilter}+
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-black" onClick={() => setMinProfitFilter(0)} />
              </span>
            )}
            {priceRange < 15000 && (
              <span className="px-3 py-1 rounded-full bg-[#EAD7CA]/50 text-neutral-900 flex items-center gap-1.5 font-medium border border-[#EAD7CA]">
                Under {formatBDT(priceRange)}
                <X className="w-3.5 h-3.5 cursor-pointer hover:text-black" onClick={() => setPriceRange(15000)} />
              </span>
            )}
            <button
              onClick={clearFilters}
              className="text-xs text-[#C98F6B] font-bold hover:underline ml-2"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Main Layout: Desktop Sidebar (Left) + Product Grid (Right) */}
        <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 items-start">
          {/* Desktop Sidebar Filters */}
          <aside className="hidden lg:block w-64 xl:w-72 shrink-0 space-y-6 bg-white p-5 rounded-2xl border border-[#E6E4E0] shadow-2xs h-fit">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E4E0]">
              <h3 className="font-bold text-sm sm:text-base text-[#111111] flex items-center gap-2">
                <Filter className="w-4 h-4 text-[#C98F6B]" /> Reseller Filters
              </h3>
              {hasActiveFilters && (
                <button onClick={clearFilters} className="text-xs font-semibold text-[#C98F6B] hover:underline">
                  Reset
                </button>
              )}
            </div>

            {/* Search within catalog */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 block">
                Search Products
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Earbuds, watches, hoodies..."
                  className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl py-2 pl-3 pr-8 text-xs focus:bg-white focus:outline-none focus:border-black transition-colors"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-black">
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Profit Margin Range (if authenticated) */}
            {isAuthenticated ? (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                    Minimum Net Profit
                  </label>
                  <span className="text-xs font-bold text-emerald-600">
                    {minProfitFilter > 0 ? `৳${minProfitFilter}+` : 'Any'}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-1.5">
                  {[
                    { label: 'All Margins', val: 0 },
                    { label: '৳300+', val: 300 },
                    { label: '৳500+', val: 500 },
                    { label: '৳800+', val: 800 },
                    { label: '৳1,200+', val: 1200 },
                    { label: '৳1,500+', val: 1500 }
                  ].map(tier => (
                    <button
                      key={tier.val}
                      type="button"
                      onClick={() => setMinProfitFilter(tier.val)}
                      className={`py-1.5 px-2 rounded-lg text-xs font-semibold text-center border transition-all ${
                        minProfitFilter === tier.val 
                          ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs' 
                          : 'bg-[#F7F6F3] hover:bg-neutral-100 text-neutral-700 border-[#E6E4E0]'
                      }`}
                    >
                      {tier.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-3 bg-[#F7F6F3] rounded-xl border border-neutral-200 text-center space-y-1.5">
                <Lock className="w-4 h-4 text-neutral-400 mx-auto" />
                <p className="text-[11px] font-semibold text-neutral-600">
                  Login to filter by net profit margin per sale.
                </p>
              </div>
            )}

            {/* Category Filter */}
            <div>
              <label className="text-xs font-bold uppercase tracking-wider text-neutral-700 mb-2 block">
                Category
              </label>
              <div className="space-y-1 max-h-52 overflow-y-auto pr-1">
                <button
                  onClick={() => setSelectedCategory(null)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                    selectedCategory === null 
                      ? 'bg-[#111111] text-white font-bold' 
                      : 'hover:bg-[#F7F6F3] text-neutral-700'
                  }`}
                >
                  <span>All Categories</span>
                  <span>{products.filter(p => p.isActive !== false).length}</span>
                </button>
                {categories.map((cat) => {
                  const count = products.filter(p => p.isActive !== false && p.category === cat.name).length;
                  const isSelected = selectedCategory === cat.name;
                  return (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCategory(isSelected ? null : cat.name)}
                      className={`w-full text-left px-3 py-1.5 rounded-lg text-xs font-medium flex items-center justify-between transition-colors ${
                        isSelected 
                          ? 'bg-[#111111] text-white font-bold' 
                          : 'hover:bg-[#F7F6F3] text-neutral-700'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[11px] opacity-75">{count}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Selling Price Range Slider */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider text-neutral-700">
                  Max Retail Price
                </label>
                <span className="text-xs font-bold text-neutral-900">{formatBDT(priceRange)}</span>
              </div>
              <input
                type="range"
                min="500"
                max="15000"
                step="500"
                value={priceRange}
                onChange={(e) => setPriceRange(Number(e.target.value))}
                className="w-full accent-[#111111] cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-neutral-400 mt-1">
                <span>৳500</span>
                <span>৳15,000</span>
              </div>
            </div>

            {/* In Stock Only Checkbox */}
            <div className="pt-2 border-t border-[#E6E4E0]">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={inStockOnly}
                  onChange={(e) => setInStockOnly(e.target.checked)}
                  className="w-4 h-4 rounded-md border-[#E6E4E0] text-[#111111] focus:ring-black"
                />
                <span className="text-xs font-semibold text-neutral-800">
                  Ready to Ship (In Stock)
                </span>
              </label>
            </div>
          </aside>

          {/* Product Grid Area */}
          <main className="flex-1 w-full min-w-0">
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-[#E6E4E0] p-12 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#F7F6F3] flex items-center justify-center mx-auto text-neutral-400">
                  <Search className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-bold text-[#111111]">No wholesale products matched your filters</h3>
                <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
                  Try clearing some filter criteria or adjusting your profit margin requirement.
                </p>
                <button
                  onClick={clearFilters}
                  className="px-6 py-2.5 bg-[#111111] text-white text-xs font-bold rounded-full hover:bg-neutral-800 transition-colors"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-4 sm:gap-5">
                {filteredProducts.map((product, idx) => (
                  <ProductCard 
                    key={product.id} 
                    product={product} 
                    priority={idx < 4}
                  />
                ))}
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
