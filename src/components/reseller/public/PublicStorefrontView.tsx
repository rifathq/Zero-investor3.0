'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ResellerStore, ResellerProduct } from '@/types/reseller';
import { Product } from '@/types/marketplace';
import { INITIAL_ADMIN_RESELLERS, INITIAL_ADMIN_PRODUCTS } from '@/lib/adminMockData';
import { PublicStoreHeader } from './PublicStoreHeader';
import { ResellerStoreProductCard } from './ResellerStoreProductCard';
import { PublicOrderTrackingModal } from './PublicOrderTrackingModal';
import { PublicCheckoutModal } from './PublicCheckoutModal';
import { StorePolicyModal, PolicyType } from './StorePolicyModal';
import { formatBDT } from '@/lib/formatters';
import { 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  RotateCcw, 
  Phone, 
  Mail, 
  MapPin, 
  ArrowRight, 
  ShoppingBag, 
  Search, 
  Filter, 
  Star, 
  Sparkles, 
  X, 
  MessageCircle, 
  Package, 
  HelpCircle,
  ChevronDown,
  ChevronUp,
  PackageSearch,
  CheckCircle
} from 'lucide-react';

interface PublicStorefrontViewProps {
  storeSlug?: string;
}

export function PublicStorefrontView({ storeSlug }: PublicStorefrontViewProps) {
  const { products: marketplaceProducts, navigate, addToCart, showToast } = useMarketplace();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState<'featured' | 'price-asc' | 'price-desc' | 'rating'>('featured');
  const [quickViewProduct, setQuickViewProduct] = useState<Product | null>(null);
  const [quickViewQty, setQuickViewQty] = useState(1);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);
  const [checkoutProduct, setCheckoutProduct] = useState<{ product: Product; quantity: number; price: number } | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // 1. Resolve Store Profile
  const store = useMemo<ResellerStore | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zero_invest_admin_resellers');
      if (stored) {
        try {
          const list: ResellerStore[] = JSON.parse(stored);
          const match = list.find(s => s.storeSlug === storeSlug || s.id === storeSlug);
          if (match) return match;
        } catch (e) {}
      }
    }
    const fallbackMatch = INITIAL_ADMIN_RESELLERS.find(s => s.storeSlug === storeSlug);
    return fallbackMatch || INITIAL_ADMIN_RESELLERS[0];
  }, [storeSlug]);

  const storeName = store?.storeName || storeSlug || 'Dhaka Trendz Collection';

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const previousTitle = document.title;
      document.title = `${storeName} - Official Store`;
      return () => {
        document.title = previousTitle;
      };
    }
  }, [storeName]);

  // 2. Resolve Store Products joined dynamically with platform catalog
  const storeProducts = useMemo(() => {
    if (!store) return [];

    let resellerProductConfigs: ResellerProduct[] = [];
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zero_invest_admin_products');
      if (stored) {
        try {
          const list: ResellerProduct[] = JSON.parse(stored);
          resellerProductConfigs = list.filter(p => p.resellerId === store.resellerId || p.storeId === store.id);
        } catch (e) {}
      }
    }

    if (resellerProductConfigs.length === 0) {
      resellerProductConfigs = INITIAL_ADMIN_PRODUCTS.filter(p => p.resellerId === store.resellerId || p.storeId === store.id);
    }

    if (resellerProductConfigs.length > 0) {
      return resellerProductConfigs
        .filter(mp => mp.isActive !== false)
        .map(mp => {
          const baseProd = marketplaceProducts.find(
            p => p.id === mp.originalProductId || p.id === mp.productId
          );

          const customerSellingPrice = mp.suggestedPrice || mp.sellingPrice || mp.sellingPriceBDT || (baseProd?.price ?? 999);
          const baseWholesale = baseProd ? (baseProd.supplierPrice || baseProd.price) : (mp.resellerPrice || 500);

          const mapped: Product = {
            id: baseProd ? baseProd.id : (mp.originalProductId || mp.id),
            name: baseProd ? baseProd.name : mp.productName,
            category: baseProd ? baseProd.category : mp.category,
            subcategory: baseProd?.subcategory,
            price: customerSellingPrice,
            originalPrice: baseProd?.originalPrice || Math.round(customerSellingPrice * 1.25),
            discountPercent: Math.round(((Math.round(customerSellingPrice * 1.25) - customerSellingPrice) / Math.round(customerSellingPrice * 1.25)) * 100),
            imageUrl: baseProd ? baseProd.imageUrl : mp.imageUrl,
            additionalImages: baseProd?.additionalImages,
            sellerId: store.resellerId,
            sellerName: store.storeName,
            supplierPrice: baseWholesale,
            resellerProfit: Math.max(0, customerSellingPrice - baseWholesale),
            rating: baseProd?.rating || 4.9,
            reviewCount: baseProd?.reviewCount || 42,
            inStock: baseProd ? (baseProd.inStock && baseProd.stockCount > 0) : true,
            stockCount: baseProd ? baseProd.stockCount : 25,
            description: baseProd?.description || mp.description || 'Verified curated quality item with nationwide Cash on Delivery.',
            features: baseProd?.features,
            benefits: baseProd?.benefits,
            specifications: baseProd?.specifications
          };
          return mapped;
        });
    }

    // Fallback: If no store products yet, sample first few platform products
    return marketplaceProducts.slice(0, 6).map(p => ({
      ...p,
      sellerId: store.resellerId,
      sellerName: store.storeName
    }));
  }, [store, marketplaceProducts]);

  // 3. Extract unique categories present in this store
  const storeCategories = useMemo(() => {
    const set = new Set(storeProducts.map(p => p.category).filter(Boolean));
    return Array.from(set);
  }, [storeProducts]);

  // 4. Filter & Sort products
  const filteredProducts = useMemo(() => {
    let result = [...storeProducts];

    // Category filter
    if (selectedCategory !== 'all') {
      result = result.filter(p => p.category.toLowerCase() === selectedCategory.toLowerCase());
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(p => 
        p.name.toLowerCase().includes(q) || 
        p.category.toLowerCase().includes(q) ||
        (p.description && p.description.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortBy === 'price-asc') {
      result.sort((a, b) => a.price - b.price);
    } else if (sortBy === 'price-desc') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [storeProducts, selectedCategory, searchQuery, sortBy]);

  const scrollToProducts = () => {
    const el = document.getElementById('store-products-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleQuickViewAdd = () => {
    if (!quickViewProduct) return;
    addToCart(quickViewProduct, quickViewQty);
    showToast('Added to Cart', `"${quickViewProduct.name}" added to your bag.`, 'success');
    setQuickViewProduct(null);
    setQuickViewQty(1);
  };

  const handleQuickViewBuyNow = () => {
    if (!quickViewProduct) return;
    setCheckoutProduct({
      product: quickViewProduct,
      quantity: quickViewQty,
      price: quickViewProduct.price
    });
    setQuickViewProduct(null);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-neutral-900 flex flex-col justify-between selection:bg-[#EAD7CA] selection:text-neutral-900">
      
      {/* 1. Dedicated Reseller Store Header (100% White-Labeled) */}
      <PublicStoreHeader
        store={store}
        storeSlug={storeSlug}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        categories={storeCategories}
        activeCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 sm:space-y-12">
        
        {/* 2. Hero Store Banner Section */}
        <section className="relative rounded-3xl overflow-hidden bg-neutral-950 text-white shadow-xl min-h-[300px] sm:min-h-[380px] flex items-center">
          {store?.bannerUrl ? (
            <div className="absolute inset-0 z-0">
              <img
                src={store.bannerUrl}
                alt={storeName}
                className="w-full h-full object-cover opacity-35"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-neutral-950 via-neutral-950/80 to-transparent" />
            </div>
          ) : (
            <div className="absolute inset-0 z-0 bg-gradient-to-tr from-neutral-950 via-neutral-900 to-neutral-800">
              <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute left-1/3 top-0 w-80 h-80 bg-neutral-500/10 rounded-full blur-2xl" />
            </div>
          )}

          <div className="relative z-10 max-w-2xl p-6 sm:p-12 space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-emerald-400 text-xs font-semibold border border-white/10">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Verified Authentic Collection</span>
            </div>

            <h2 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-tight text-white">
              {store?.storeName || storeName}
            </h2>

            <p className="text-xs sm:text-sm md:text-base text-neutral-300 leading-relaxed max-w-xl">
              {store?.description || store?.tagline || 'Explore verified lifestyle and fashion products delivered straight to your door with nationwide Cash on Delivery.'}
            </p>

            <div className="pt-2 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={scrollToProducts}
                className="px-6 py-3 bg-white text-neutral-950 hover:bg-neutral-100 rounded-xl text-xs sm:text-sm font-bold shadow-lg transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <span>Browse Products ({storeProducts.length})</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => setIsTrackModalOpen(true)}
                className="px-5 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs sm:text-sm font-semibold backdrop-blur-xs transition-colors flex items-center gap-2 cursor-pointer"
              >
                <PackageSearch className="w-4 h-4 text-emerald-400" />
                <span>Track My Parcel</span>
              </button>
            </div>
          </div>
        </section>

        {/* 3. Value Props & Trust Badges Strip */}
        <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E4E0] flex items-center gap-3 sm:gap-4 shadow-2xs">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-neutral-900">Cash on Delivery</h4>
              <p className="text-[11px] text-neutral-500">Pay after checking parcel</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E4E0] flex items-center gap-3 sm:gap-4 shadow-2xs">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-neutral-900">2–4 Days Delivery</h4>
              <p className="text-[11px] text-neutral-500">Fast Steadfast &amp; Pathao</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E4E0] flex items-center gap-3 sm:gap-4 shadow-2xs">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-neutral-900">7-Day Replacement</h4>
              <p className="text-[11px] text-neutral-500">Guaranteed instant exchange</p>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#E6E4E0] flex items-center gap-3 sm:gap-4 shadow-2xs">
            <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-xl bg-neutral-100 text-neutral-800 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <h4 className="font-bold text-xs sm:text-sm text-neutral-900">Live Support</h4>
              <p className="text-[11px] text-neutral-500">Call &amp; WhatsApp helpline</p>
            </div>
          </div>
        </section>

        {/* 4. Products Catalog Section */}
        <section id="store-products-section" className="space-y-6 pt-2">
          
          {/* Controls Bar: Search, Category Filters, Sort */}
          <div className="bg-white rounded-2xl p-4 border border-[#E6E4E0] flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
            
            {/* Category Chips */}
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-none pb-1 md:pb-0">
              <button
                type="button"
                onClick={() => setSelectedCategory('all')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                  selectedCategory === 'all'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                }`}
              >
                All Items ({storeProducts.length})
              </button>
              {storeCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-neutral-900 text-white shadow-2xs'
                      : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900 hover:bg-neutral-200/70'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Sort Dropdown */}
            <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
              <span className="text-xs text-neutral-400 font-medium hidden sm:inline">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="px-3 py-2 text-xs font-semibold bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-900 cursor-pointer text-neutral-800"
              >
                <option value="featured">Featured Products</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Top Customer Rated</option>
              </select>
            </div>
          </div>

          {/* Active Filter Tags */}
          {(selectedCategory !== 'all' || searchQuery) && (
            <div className="flex items-center gap-2 flex-wrap text-xs">
              <span className="text-neutral-500">Active Filters:</span>
              {selectedCategory !== 'all' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-200/80 rounded-full font-semibold text-neutral-800">
                  Category: {selectedCategory}
                  <button onClick={() => setSelectedCategory('all')} className="hover:text-black">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-neutral-200/80 rounded-full font-semibold text-neutral-800">
                  Search: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-black">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}
              <button
                onClick={() => {
                  setSelectedCategory('all');
                  setSearchQuery('');
                }}
                className="text-xs text-neutral-500 hover:text-neutral-900 underline font-semibold ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-[#E6E4E0] space-y-4">
              <Package className="w-12 h-12 text-neutral-300 mx-auto" />
              <div className="space-y-1">
                <h3 className="font-bold text-base text-neutral-800">No products match your search</h3>
                <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                  Try adjusting your search query or selecting a different category from {storeName}.
                </p>
              </div>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('all');
                }}
                className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-semibold hover:bg-neutral-800 cursor-pointer"
              >
                Reset Catalog Filter
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
              {filteredProducts.map((product) => (
                <ResellerStoreProductCard
                  key={product.id}
                  product={product}
                  storeSlug={storeSlug}
                  onQuickView={(p) => {
                    setQuickViewProduct(p);
                    setQuickViewQty(1);
                  }}
                />
              ))}
            </div>
          )}
        </section>

        {/* 5. Customer Review & Trust Endorsement */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E6E4E0] space-y-6 shadow-2xs">
          <div className="text-center space-y-2 max-w-lg mx-auto">
            <span className="text-xs uppercase font-extrabold tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              Verified Shopper Experience
            </span>
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900">
              Trusted by 10,000+ Happy Customers
            </h3>
            <p className="text-xs text-neutral-500">
              Real feedback from shoppers who placed Cash on Delivery orders at {storeName}.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 pt-2">
            {[
              {
                name: 'Farhana Akhter',
                city: 'Uttara, Dhaka',
                comment: 'Parcel reached me within 24 hours. The packaging was top-notch, and the delivery rider let me inspect before making the COD payment.',
                rating: 5,
                product: 'Quality Premium Saree'
              },
              {
                name: 'Kazi Mahbub',
                city: 'Chittagong',
                comment: 'Excellent customer service on WhatsApp. I had a question regarding the size specifications, and they responded immediately. Genuine product.',
                rating: 5,
                product: 'Cotton Panjabi Collection'
              },
              {
                name: 'Rashedul Karim',
                city: 'Sylhet',
                comment: '100% authentic item. Tracking via Steadfast courier was updated in real-time. Highly recommended storefront!',
                rating: 5,
                product: 'Wireless Bluetooth Earbuds'
              }
            ].map((rev, i) => (
              <div key={i} className="bg-neutral-50 rounded-2xl p-5 border border-neutral-200/80 space-y-3 flex flex-col justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-1 text-amber-500">
                    {Array.from({ length: rev.rating }).map((_, idx) => (
                      <Star key={idx} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <p className="text-xs text-neutral-700 leading-relaxed italic">
                    "{rev.comment}"
                  </p>
                </div>
                <div className="pt-3 border-t border-neutral-200 flex items-center justify-between text-xs">
                  <div>
                    <h5 className="font-bold text-neutral-900">{rev.name}</h5>
                    <span className="text-[11px] text-neutral-400">{rev.city}</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100/60 px-2 py-0.5 rounded-full">
                    Verified Buyer
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. FAQ Accordion Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E6E4E0] space-y-6 shadow-2xs">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-neutral-500">
              Everything you need to know about placing an order with {storeName}.
            </p>
          </div>

          <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
            {[
              {
                q: 'How does Cash on Delivery (COD) work?',
                a: 'You do not pay anything in advance. When the delivery rider from Steadfast Courier or Pathao arrives at your doorstep, you inspect the parcel exterior and pay the cash directly.'
              },
              {
                q: 'How long will it take to receive my order?',
                a: 'Deliveries inside Dhaka typically take 24–48 hours. Deliveries outside Dhaka to any district or upazila take 2–4 business days.'
              },
              {
                q: 'Can I track my order online?',
                a: 'Yes! Use the "Track Order" button in the top menu bar or footer. Enter your Order ID (e.g., #ORD-1024) or phone number to view live courier consignment status.'
              },
              {
                q: 'What if I receive a damaged or incorrect product?',
                a: 'We offer a 7-day easy replacement warranty. If your package arrives damaged or defective, contact our store helpline or WhatsApp with your order number for an immediate replacement.'
              }
            ].map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full py-4.5 px-6 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-neutral-900 hover:text-black cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-4 text-xs text-neutral-600 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* 7. Quick View Lightbox Modal */}
      {quickViewProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setQuickViewProduct(null)}
              className="absolute top-4 right-4 p-2 text-neutral-400 hover:text-neutral-900 rounded-xl hover:bg-neutral-100 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
              <div className="aspect-square rounded-2xl bg-[#FAF9F5] p-4 flex items-center justify-center border border-neutral-100">
                <img
                  src={quickViewProduct.imageUrl}
                  alt={quickViewProduct.name}
                  className="max-h-full object-contain"
                />
              </div>

              <div className="space-y-4">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">
                    {quickViewProduct.category}
                  </span>
                  <h3 className="text-lg font-bold text-neutral-900 mt-0.5">
                    {quickViewProduct.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-1 text-xs">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span className="font-bold">{quickViewProduct.rating.toFixed(1)}</span>
                    <span className="text-neutral-400">({quickViewProduct.reviewCount} reviews)</span>
                  </div>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl space-y-1">
                  <div className="text-xl font-extrabold text-neutral-900 font-mono">
                    {formatBDT(quickViewProduct.price)}
                  </div>
                  <div className="text-[11px] text-emerald-700 font-semibold">
                    ✓ Cash on Delivery Available Nationwide
                  </div>
                </div>

                <p className="text-xs text-neutral-600 line-clamp-3 leading-relaxed">
                  {quickViewProduct.description}
                </p>

                <div className="space-y-2 pt-2">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleQuickViewAdd}
                      className="flex-1 py-3 bg-white border border-neutral-300 text-neutral-900 rounded-xl text-xs font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
                    >
                      Add to Cart
                    </button>
                    <button
                      type="button"
                      onClick={handleQuickViewBuyNow}
                      className="flex-1 py-3 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
                    >
                      Buy Now (COD)
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      const id = quickViewProduct.id;
                      setQuickViewProduct(null);
                      navigate('reseller-public-landing', { storeSlug, productSlug: id });
                    }}
                    className="w-full py-2 text-center text-xs text-neutral-500 hover:text-neutral-900 font-semibold underline cursor-pointer"
                  >
                    View Full Product Details &amp; Warranty
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 8. 100% White-Labeled Dedicated Reseller Store Footer */}
      <footer className="bg-neutral-950 text-white border-t border-neutral-800 pt-12 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Store Brand Info */}
            <div className="md:col-span-2 space-y-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-white text-neutral-900 flex items-center justify-center font-bold text-sm">
                  {storeName.charAt(0).toUpperCase()}
                </div>
                <h4 className="font-extrabold text-base tracking-tight text-white">{storeName}</h4>
              </div>
              <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                {store?.tagline || 'Curated online storefront providing genuine products with nationwide Cash on Delivery and prompt customer support.'}
              </p>
              <div className="text-[11px] text-neutral-500">
                Operating in full compliance with Bangladesh Consumer Protection &amp; E-Commerce Guidelines.
              </div>
            </div>

            {/* Col 2: Customer Care */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Customer Care</h5>
              <ul className="text-xs text-neutral-400 space-y-2">
                <li>• Cash on Delivery across 64 Districts</li>
                <li>
                  <button
                    type="button"
                    onClick={() => setActivePolicy('refund')}
                    className="hover:text-emerald-400 transition-colors cursor-pointer text-left"
                  >
                    • 7-Day Replacement Policy →
                  </button>
                </li>
                <li>• Fast Steadfast Courier Dispatch</li>
                <li>
                  <button 
                    type="button"
                    onClick={() => setIsTrackModalOpen(true)}
                    className="hover:text-emerald-400 underline font-semibold transition-colors cursor-pointer text-left"
                  >
                    • Track Orders Online →
                  </button>
                </li>
              </ul>
            </div>

            {/* Col 3: Logistics & Payment Partners */}
            <div className="space-y-2.5">
              <h5 className="text-xs font-bold text-neutral-200 uppercase tracking-wider">Logistics &amp; Payment</h5>
              <div className="flex flex-wrap gap-2 text-[11px] text-neutral-400">
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">Cash on Delivery</span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">Steadfast Courier</span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">Pathao Courier</span>
                <span className="px-2.5 py-1 rounded-lg bg-neutral-900 border border-neutral-800">bKash / Nagad</span>
              </div>
            </div>

          </div>

          {/* Bottom Bar: Copyright & Essential Customer-Facing Links */}
          <div className="border-t border-neutral-900 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div>
              &copy; {new Date().getFullYear()} {storeName}. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-400">
              <button 
                type="button" 
                onClick={() => setActivePolicy('terms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button 
                type="button" 
                onClick={() => setActivePolicy('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                type="button" 
                onClick={() => setActivePolicy('refund')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Return &amp; Refund Policy
              </button>
              <button 
                type="button" 
                onClick={() => setIsTrackModalOpen(true)}
                className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors cursor-pointer"
              >
                Track Order
              </button>
            </div>
          </div>
        </div>
      </footer>

      {/* Public Order Tracking Modal */}
      <PublicOrderTrackingModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        storeName={storeName}
      />

      {/* Store Policies Modal */}
      <StorePolicyModal
        policyType={activePolicy}
        onClose={() => setActivePolicy(null)}
        storeName={storeName}
      />

      {/* Express Checkout Modal for Buy Now */}
      <PublicCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => {
          setIsCheckoutOpen(false);
          setCheckoutProduct(null);
        }}
        storeName={storeName}
        storeSlug={store?.storeSlug || storeSlug}
        resellerId={store?.resellerId}
        singleProduct={checkoutProduct || undefined}
      />

    </div>
  );
}
