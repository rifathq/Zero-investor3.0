'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { useReseller } from '@/context/ResellerContext';
import { getProductResellerPricing } from '@/lib/productVisibility';
import { ProductCard } from '@/components/common/ProductCard';
import { StarRating } from '@/components/common/StarRating';
import { ProductReviewsSection } from '@/components/product/ProductReviewsSection';
import { formatBDT } from '@/lib/formatters';
import { 
  Star, 
  Heart, 
  Truck, 
  ShieldCheck, 
  ArrowLeft, 
  Check, 
  Share2, 
  Flame, 
  TrendingUp,
  Lock,
  Zap,
  Sparkles,
  ExternalLink,
  Copy,
  CheckCircle2,
  PackageCheck,
  Plus,
  Clock
} from 'lucide-react';

export function ProductDetailView() {
  const { 
    selectedProduct, 
    products, 
    reviews,
    navigate, 
    toggleWishlist, 
    isInWishlist, 
    showToast 
  } = useMarketplace();

  const { isAuthenticated, userProfile, role } = useAuth();
  const { 
    isReseller,
    products: resellerProducts, 
    addProductToCatalog, 
    quickGenerateLandingPage,
    openVerificationModal
  } = useReseller();

  // If no product is selected, fall back to first active product
  const product = selectedProduct || (products || []).find(p => p.isActive !== false) || (products || [])[0];

  const allImages = product ? [
    product.imageUrl,
    ...(product.additionalImages || [])
  ].filter(Boolean) : [];

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'selling-points' | 'specs' | 'reviews'>('selling-points');
  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const isSaved = product ? isInWishlist(product.id) : false;
  const productReviewsCount = product ? (reviews || []).filter(r => r.productId === product.id).length : 0;
  const pricing = product ? getProductResellerPricing(product, { userProfile, role, isAuthenticated }) : {
    supplierPrice: 0,
    suggestedPrice: 0,
    potentialProfit: 0,
    profitMarginPercent: 0,
    isAvailable: false,
    isVerifiedReseller: false,
    accessStatus: 'unauthenticated' as const
  };

  const existingResellerProduct = product ? (resellerProducts || []).find(
    rp => rp.originalProductId === product.id || rp.productName === product.name
  ) : undefined;

  const LOW_STOCK_THRESHOLD = 5;
  const isOutOfStock = !product?.inStock || (product?.stockCount ?? 0) <= 0;
  const isLowStock = !!product?.inStock && (product?.stockCount ?? 0) > 0 && (product?.stockCount ?? 0) <= LOW_STOCK_THRESHOLD;

  const handleSellProduct = async () => {
    if (!isAuthenticated) {
      navigate('reseller');
      return;
    }

    if (!pricing.isVerifiedReseller) {
      if (pricing.accessStatus === 'pending_verification') {
        showToast('Verification Pending', 'Your reseller account is awaiting admin approval.', 'info');
      } else {
        navigate('reseller-register');
      }
      return;
    }

    if (existingResellerProduct) {
      showToast('Already in Inventory', 'This product is already in your reseller inventory.', 'info');
      return;
    }

    try {
      setIsAdding(true);
      const res = await addProductToCatalog(product, pricing.suggestedPrice, product.description);
      if (res.success) {
        setJustAdded(true);
        showToast('Product Added!', `"${product.name}" is now in your reseller catalog.`, 'success');
        setTimeout(() => setJustAdded(false), 2000);
      }
    } catch (err) {
      showToast('Error', 'Failed to add product to catalog.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleGenerateLandingPage = async () => {
    if (!isAuthenticated) {
      navigate('reseller');
      return;
    }

    if (!pricing.isVerifiedReseller) {
      if (pricing.accessStatus === 'pending_verification') {
        showToast('Verification Pending', 'Your reseller account is awaiting admin approval.', 'info');
      } else {
        navigate('reseller-register');
      }
      return;
    }

    try {
      showToast('Generating...', 'Creating your custom landing page...', 'info');
      const page = await quickGenerateLandingPage(product);
      if (page) {
        navigate('reseller-public-landing', {
          storeSlug: page.storeSlug,
          productSlug: page.productSlug
        });
      }
    } catch (err) {
      showToast('Error', 'Failed to generate landing page.', 'error');
    }
  };

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      showToast('Link Copied!', 'Product URL copied to clipboard.', 'info');
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  // Related high-margin products from same category
  const relatedProducts = (products || [])
    .filter(p => product && p.isActive !== false && p.id !== product.id && p.category === product.category)
    .slice(0, 4);

  if (!product) {
    return (
      <div className="w-full max-w-[1200px] mx-auto px-4 py-16 text-center">
        <h2 className="text-xl font-bold text-neutral-800">Product Not Found</h2>
        <p className="text-sm text-neutral-500 mt-2">The selected product is currently unavailable or has been removed.</p>
        <button
          onClick={() => navigate('shop')}
          className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-xs font-bold rounded-xl hover:bg-neutral-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Marketplace</span>
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-6 sm:py-8 overflow-hidden bg-[#FAFAF9]">
      {/* Back Button & Breadcrumbs */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <button
          onClick={() => navigate('shop')}
          className="flex items-center gap-2 text-xs sm:text-sm font-bold text-neutral-600 hover:text-black transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Products You Can Sell</span>
        </button>

        <span className="text-xs font-semibold text-neutral-400">
          Catalog ID: {product.sku || product.id}
        </span>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 pb-14 border-b border-[#E6E4E0]">
        {/* Left Column: Image Gallery (7 cols on lg) */}
        <div className="lg:col-span-7 flex flex-col-reverse sm:flex-row gap-4">
          {/* Thumbnails list */}
          {allImages.length > 1 && (
            <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto max-h-[500px] shrink-0">
              {allImages.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImageIndex === idx 
                      ? 'border-[#111111] shadow-xs' 
                      : 'border-transparent hover:border-neutral-300 opacity-75 hover:opacity-100'
                  }`}
                >
                  <Image
                    src={img}
                    alt={`Thumbnail ${idx + 1}`}
                    fill
                    sizes="80px"
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </button>
              ))}
            </div>
          )}

          {/* Main Large Display Image */}
          <div className="relative flex-1 aspect-square rounded-3xl bg-white overflow-hidden border border-[#E6E4E0] shadow-xs flex items-center justify-center">
            <Image
              src={allImages[activeImageIndex] || product.imageUrl}
              alt={product.name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain p-4"
              referrerPolicy="no-referrer"
            />
            
            {pricing.isVerifiedReseller ? (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-emerald-600 text-white text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1.5 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>৳{pricing.potentialProfit} Profit Per Sale</span>
              </div>
            ) : (
              <div className="absolute top-4 left-4 px-3 py-1.5 rounded-xl bg-neutral-900/85 backdrop-blur-xs text-white text-xs font-semibold tracking-wide shadow-sm flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-300" />
                <span>
                  {pricing.accessStatus === 'pending_verification' 
                    ? 'Verification Pending' 
                    : 'Verified Resellers Only'}
                </span>
              </div>
            )}

            <button
              onClick={() => toggleWishlist(product.id)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur-md flex items-center justify-center text-neutral-700 hover:text-black shadow-xs transition-transform hover:scale-105"
              aria-label="Wishlist toggle"
            >
              <Heart className={`w-5 h-5 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Right Column: Reseller Selling Breakdown & Actions (5 cols on lg) */}
        <div className="lg:col-span-5 flex flex-col justify-between">
          <div className="space-y-4">
            {/* Category & Availability */}
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-[#C98F6B]">
                {product.category}
              </span>
              {isOutOfStock ? (
                <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
                  Sold Out
                </span>
              ) : isLowStock ? (
                <span className="inline-flex items-center gap-1.5 text-[11px] font-extrabold px-3 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-300">
                  <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-600" />
                  <span>High Demand: {product.stockCount} left</span>
                </span>
              ) : (
                <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Ready to Dispatch ({product.stockCount} in stock)
                </span>
              )}
            </div>

            {/* Product Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] leading-snug tracking-tight">
              {product.name}
            </h1>

            {/* Social Proof & Rating */}
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-2">
                <StarRating value={product.rating} readOnly size="sm" />
                <span className="font-bold text-sm text-neutral-900">{product.rating.toFixed(1)}</span>
                <span className="text-xs text-neutral-500">
                  ({product.reviewCount} customer reviews)
                </span>
              </div>

              <button
                onClick={handleShare}
                className="text-xs text-neutral-500 hover:text-black flex items-center gap-1 p-1"
              >
                <Share2 className="w-3.5 h-3.5" />
                <span>{copiedLink ? 'Copied!' : 'Share'}</span>
              </button>
            </div>

            {/* Reseller Profit Breakdown Card */}
            {pricing.isVerifiedReseller ? (
              <div className="bg-white border-2 border-emerald-200 rounded-2xl p-5 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    Reseller Profit Economics
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold font-mono">
                    {pricing.profitMarginPercent}% Net Margin
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Supplier Cost</span>
                    <span className="text-base sm:text-lg font-black text-neutral-800 font-mono">
                      {formatBDT(pricing.supplierPrice)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="text-[10px] uppercase font-bold text-neutral-500 block">Selling Price</span>
                    <span className="text-base sm:text-lg font-black text-neutral-900 font-mono">
                      {formatBDT(pricing.suggestedPrice)}
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">Your Profit</span>
                    <span className="text-base sm:text-lg font-black text-emerald-600 font-mono">
                      +{formatBDT(pricing.potentialProfit)}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 text-center">
                  Zero inventory risk. You market the product, we fulfill and deliver via Pathao/Steadfast, collect COD, and deposit ৳{pricing.potentialProfit} into your wallet.
                </p>
              </div>
            ) : (
              <div className="bg-gradient-to-br from-amber-50/70 to-orange-50/70 border border-amber-200/80 rounded-2xl p-5 shadow-xs space-y-3 text-center">
                <div className="w-10 h-10 rounded-full bg-amber-500 text-white flex items-center justify-center mx-auto shadow-xs">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-neutral-900">
                    {pricing.accessStatus === 'pending_verification' 
                      ? 'Reseller Verification Under Review' 
                      : 'Wholesale Supplier Cost & Profit Margins Locked'}
                  </h3>
                  <p className="text-xs text-neutral-600 mt-1 max-w-sm mx-auto leading-relaxed">
                    {pricing.accessStatus === 'pending_verification'
                      ? 'Your reseller account has been submitted and is currently being verified. Wholesale pricing and profit economics will automatically unlock once approved by admin.'
                      : 'Wholesale supplier prices, suggested retail margins, and direct fulfillment tools are visible to verified resellers only.'}
                  </p>
                </div>
                <div className="pt-1">
                  {pricing.accessStatus === 'pending_verification' ? (
                    <button
                      onClick={openVerificationModal}
                      className="px-6 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      Check Review Status
                    </button>
                  ) : (
                    <button
                      onClick={openVerificationModal}
                      className="px-6 py-2.5 rounded-xl bg-[#111111] hover:bg-neutral-800 text-white text-xs font-bold transition-colors shadow-xs cursor-pointer"
                    >
                      Apply as Reseller
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* Primary Action Buttons */}
            {pricing.isVerifiedReseller ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={handleSellProduct}
                  disabled={isAdding}
                  className={`py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    existingResellerProduct || justAdded
                      ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                      : 'bg-[#111111] hover:bg-neutral-800 text-white shadow-md'
                  }`}
                >
                  {existingResellerProduct || justAdded ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-600" />
                      <span>Added to My Products</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 text-amber-300" />
                      <span>Add to My Products</span>
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleGenerateLandingPage}
                  className="py-3.5 px-4 rounded-xl text-xs sm:text-sm font-bold bg-[#C98F6B] hover:bg-[#b57a56] text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>Create Landing Page</span>
                </button>
              </div>
            ) : pricing.accessStatus === 'pending_verification' ? (
              <button
                type="button"
                onClick={openVerificationModal}
                className="w-full py-4 px-6 rounded-xl text-sm font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center justify-center gap-2 transition-all shadow-2xs cursor-pointer"
              >
                <Clock className="w-4 h-4 text-amber-600 animate-pulse" />
                <span>Reseller Verification In Progress (Check Status)</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={openVerificationModal}
                className="w-full py-4 px-6 rounded-xl text-sm font-bold bg-[#111111] hover:bg-neutral-800 text-white flex items-center justify-center gap-2 transition-all shadow-md cursor-pointer"
              >
                <span>Start Selling This Product (Apply as Reseller)</span>
                <Sparkles className="w-4 h-4 text-amber-300" />
              </button>
            )}

            {/* Fulfillment & Courier Trust Badge */}
            <div className="p-4 rounded-xl bg-white border border-neutral-200 text-xs space-y-2">
              <div className="flex items-center gap-2 font-bold text-neutral-900">
                <ShieldCheck className="w-4 h-4 text-[#C98F6B]" />
                <span>Zero Invest Automated Fulfillment Guarantee</span>
              </div>
              <ul className="text-neutral-500 space-y-1 pl-6 list-disc">
                <li>Nationwide Cash on Delivery available across all 64 districts</li>
                <li>Shipped directly through Pathao, Steadfast, and REDX Express</li>
                <li>Delivery charge: ৳70 Inside Dhaka / ৳130 Outside Dhaka</li>
                <li>Profits credited immediately to your wallet upon confirmed delivery</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Product Information Tabs */}
      <div className="pt-10 max-w-4xl">
        <div className="flex items-center gap-4 border-b border-[#E6E4E0] pb-3 mb-6">
          <button
            onClick={() => setActiveTab('selling-points')}
            className={`text-sm sm:text-base font-bold transition-colors pb-2 border-b-2 ${
              activeTab === 'selling-points'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Selling Points &amp; Description
          </button>
          <button
            onClick={() => setActiveTab('specs')}
            className={`text-sm sm:text-base font-bold transition-colors pb-2 border-b-2 ${
              activeTab === 'specs'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Specifications
          </button>
          <button
            onClick={() => setActiveTab('reviews')}
            className={`text-sm sm:text-base font-bold transition-colors pb-2 border-b-2 ${
              activeTab === 'reviews'
                ? 'border-[#111111] text-[#111111]'
                : 'border-transparent text-neutral-400 hover:text-neutral-700'
            }`}
          >
            Customer Reviews ({productReviewsCount})
          </button>
        </div>

        {activeTab === 'selling-points' && (
          <div className="space-y-6">
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-2">About This Product</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Key Benefits (Ready for Reseller Marketing Copy) */}
            <div>
              <h3 className="text-base font-bold text-neutral-900 mb-3 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                Key Benefits for Reseller Marketing
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {(product.benefits || [
                  'High margin wholesale product with tested 35%+ net return',
                  'Proven winning item with high viral demand and conversion',
                  'Cash on delivery enabled nationwide across all 64 districts',
                  '7-day replacement and customer inspection guaranteed'
                ]).map((benefit, bIdx) => (
                  <div key={bIdx} className="p-3 bg-white border border-neutral-200 rounded-xl flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      ✓
                    </span>
                    <span className="text-xs font-medium text-neutral-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Features */}
            {product.features && product.features.length > 0 && (
              <div>
                <h3 className="text-base font-bold text-neutral-900 mb-2">Product Features</h3>
                <ul className="list-disc pl-5 space-y-1.5 text-xs text-neutral-600">
                  {product.features.map((feat, fIdx) => (
                    <li key={fIdx}>{feat}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {activeTab === 'specs' && (
          <div className="bg-white border border-[#E6E4E0] rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <tbody>
                {product.specifications && Object.entries(product.specifications).map(([key, val], sIdx) => (
                  <tr key={sIdx} className="border-b border-neutral-100 last:border-b-0">
                    <td className="px-4 py-3 font-bold text-neutral-700 bg-neutral-50 w-1/3">{key}</td>
                    <td className="px-4 py-3 text-neutral-600">{val}</td>
                  </tr>
                ))}
                <tr className="border-b border-neutral-100">
                  <td className="px-4 py-3 font-bold text-neutral-700 bg-neutral-50">Category</td>
                  <td className="px-4 py-3 text-neutral-600">{product.category}</td>
                </tr>
                <tr className="border-b border-neutral-100">
                  <td className="px-4 py-3 font-bold text-neutral-700 bg-neutral-50">Fulfillment Method</td>
                  <td className="px-4 py-3 text-neutral-600">Nationwide Express Courier (Pathao / Steadfast / REDX)</td>
                </tr>
                <tr>
                  <td className="px-4 py-3 font-bold text-neutral-700 bg-neutral-50">Payment Support</td>
                  <td className="px-4 py-3 text-neutral-600">Cash on Delivery, bKash, Nagad</td>
                </tr>
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'reviews' && (
          <div id="product-reviews-tab">
            <ProductReviewsSection product={product} />
          </div>
        )}
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <div className="mt-16 pt-10 border-t border-[#E6E4E0]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-[#111111]">
                Other High-Margin Products in {product.category}
              </h2>
              <p className="text-xs text-neutral-500">
                Explore more profitable inventory to add to your selling catalog
              </p>
            </div>
            <button
              onClick={() => navigate('shop')}
              className="text-xs font-bold text-[#C98F6B] hover:underline"
            >
              View Full Catalog →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {relatedProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
