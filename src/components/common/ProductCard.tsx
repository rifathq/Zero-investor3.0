'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Product } from '@/types/marketplace';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { useReseller } from '@/context/ResellerContext';
import { getProductResellerPricing } from '@/lib/productVisibility';
import { 
  Heart, 
  Star, 
  Flame, 
  TrendingUp, 
  Lock, 
  Check, 
  Sparkles,
  ArrowRight, 
  Plus,
  Clock
} from 'lucide-react';
import { formatBDT } from '@/lib/formatters';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { navigate, toggleWishlist, isInWishlist, showToast } = useMarketplace();
  const { isAuthenticated, userProfile, role } = useAuth();
  const { isReseller, products: resellerProducts, addProductToCatalog, quickGenerateLandingPage, openVerificationModal } = useReseller();

  const isSaved = isInWishlist(product.id);
  const pricing = getProductResellerPricing(product, { userProfile, role, isAuthenticated });

  // Check if reseller has already added this product to their inventory
  const existingResellerProduct = resellerProducts.find(
    rp => rp.originalProductId === product.id || rp.productName === product.name
  );

  const [isAdding, setIsAdding] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleWishlist(product.id);
  };

  const handleCardClick = () => {
    navigate('product-detail', { productId: product.id });
  };

  const handleSellAction = async (e: React.MouseEvent) => {
    e.stopPropagation();
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
      navigate('product-detail', { productId: product.id });
      return;
    }

    try {
      setIsAdding(true);
      const res = await addProductToCatalog(
        product, 
        pricing.suggestedPrice, 
        product.description
      );
      if (res.success) {
        setJustAdded(true);
        showToast('Product Added!', `"${product.name}" added to your reseller inventory.`, 'success');
        setTimeout(() => setJustAdded(false), 2000);
      }
    } catch (err) {
      showToast('Error', 'Failed to add product to inventory. Please try again.', 'error');
    } finally {
      setIsAdding(false);
    }
  };

  const handleQuickLandingPage = async (e: React.MouseEvent) => {
    e.stopPropagation();
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

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl border border-[#E6E4E0] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_32px_-10px_rgba(0,0,0,0.09)] cursor-pointer h-full"
    >
      {/* 1. Product Image Container */}
      <div className="relative w-full aspect-square bg-[#F7F6F3] p-3 sm:p-4 flex items-center justify-center overflow-hidden">
        <div className="relative w-full h-full flex items-center justify-center">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-contain object-center transition-transform duration-300 ease-out group-hover:scale-105"
            referrerPolicy="no-referrer"
            priority={priority}
          />
        </div>

        {/* Wishlist Heart Button */}
        <button
          type="button"
          onClick={handleWishlist}
          aria-label={isSaved ? 'Remove from wishlist' : 'Add to wishlist'}
          className={`absolute top-3 right-3 z-10 w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center transition-all duration-200 backdrop-blur-md ${
            isSaved 
              ? 'bg-rose-50 text-rose-600 shadow-sm scale-105' 
              : 'bg-white/90 text-neutral-600 hover:text-black hover:bg-white shadow-xs hover:scale-105'
          }`}
        >
          <Heart 
            className={`w-3.5 h-3.5 sm:w-4 sm:h-4 transition-transform duration-200 ${isSaved ? 'fill-rose-500 text-rose-500' : ''}`} 
          />
        </button>

        {/* Badges: Potential Profit or Lock Badge */}
        <div className="absolute top-3 left-3 z-10 flex flex-col gap-1.5 items-start">
          {pricing.isVerifiedReseller ? (
            <div className="px-2.5 py-1 rounded-lg bg-emerald-600 text-white text-[11px] sm:text-xs font-bold tracking-wide shadow-sm flex items-center gap-1 font-mono">
              <TrendingUp className="w-3 h-3 text-emerald-200" />
              <span>৳{pricing.potentialProfit} Profit</span>
            </div>
          ) : (
            <div className="px-2.5 py-1 rounded-full bg-neutral-900/85 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wide flex items-center gap-1 shadow-xs">
              <Lock className="w-2.5 h-2.5 text-amber-300" />
              <span>
                {pricing.accessStatus === 'pending_verification' 
                  ? 'Verification Pending' 
                  : 'Verified Resellers Only'}
              </span>
            </div>
          )}

          {product.inStock && product.stockCount > 0 && product.stockCount <= 10 && (
            <div className="px-2 py-0.5 rounded-full bg-amber-600/95 backdrop-blur-xs text-white text-[10px] font-bold tracking-wide flex items-center gap-1 shadow-xs">
              <Flame className="w-3 h-3 fill-amber-300 text-amber-300" />
              <span>Fast Selling</span>
            </div>
          )}
        </div>

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] flex items-center justify-center z-10">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-800 bg-white px-3.5 py-1.5 rounded-full border border-neutral-200 shadow-sm">
              Currently Unavailable
            </span>
          </div>
        )}
      </div>

      {/* 2. Product Information Hierarchy */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Category Label */}
          <div className="text-[11px] sm:text-[12px] font-bold uppercase tracking-wider text-[#C98F6B]">
            {product.category}
          </div>

          {/* Product Title */}
          <h3 className="font-bold text-sm sm:text-base text-[#111111] line-clamp-2 leading-snug min-h-[2.4rem] sm:min-h-[2.6rem] group-hover:text-[#C98F6B] transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-0.5 text-neutral-800">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            </div>
            <span className="font-bold text-xs">{product.rating.toFixed(1)}</span>
            <span className="text-[11px] text-neutral-400">
              ({product.reviewCount} orders)
            </span>
          </div>
        </div>

        {/* 3. Pricing & Reseller Action Box */}
        <div className="pt-2.5 border-t border-neutral-100 flex flex-col gap-2.5">
          {/* Price Breakdown or Locked State */}
          {pricing.isVerifiedReseller ? (
            <div className="flex items-center justify-between text-xs">
              <div>
                <span className="text-neutral-400 text-[10px] uppercase font-bold block">Selling Price</span>
                <span className="text-base sm:text-lg font-black text-[#111111] font-mono">
                  {formatBDT(pricing.suggestedPrice)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 text-[10px] uppercase font-bold block">Your Net Profit</span>
                <span className="text-base sm:text-lg font-black text-emerald-600 font-mono">
                  +{formatBDT(pricing.potentialProfit)}
                </span>
              </div>
            </div>
          ) : (
            <div 
              onClick={(e) => {
                e.stopPropagation();
                openVerificationModal();
              }}
              className="p-2.5 rounded-xl bg-neutral-50 hover:bg-amber-50/60 border border-neutral-200/80 hover:border-amber-300 text-center space-y-0.5 transition-colors cursor-pointer group/lock"
              title="Click to apply for verified reseller wholesale pricing"
            >
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-neutral-800 group-hover/lock:text-amber-800 transition-colors">
                <Lock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span className="truncate">Price visible to verified resellers only</span>
              </div>
              <p className="text-[10.5px] text-neutral-500 truncate">
                {pricing.accessStatus === 'pending_verification'
                  ? 'Verification under review (2-6 hrs)'
                  : 'Click to submit reseller verification'}
              </p>
            </div>
          )}

          {/* Reseller Action Button */}
          {pricing.isVerifiedReseller ? (
            <div className="grid grid-cols-2 gap-1.5 pt-1">
              <button
                type="button"
                onClick={handleSellAction}
                disabled={isAdding}
                className={`py-2 px-1.5 rounded-xl text-[11.5px] sm:text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  existingResellerProduct || justAdded
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                    : 'bg-[#111111] hover:bg-neutral-800 text-white shadow-xs'
                }`}
                title={existingResellerProduct || justAdded ? 'In My Products' : 'Add to My Products'}
              >
                {justAdded || existingResellerProduct ? (
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

              <button
                type="button"
                onClick={handleQuickLandingPage}
                className="py-2 px-1.5 rounded-xl text-[11.5px] sm:text-xs font-bold bg-[#F7F6F3] hover:bg-[#EAD7CA]/40 text-[#111111] border border-[#E6E4E0] flex items-center justify-center gap-1 transition-colors"
                title="Create 1-Click Landing Page"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#C98F6B]" />
                <span>Create Landing Page</span>
              </button>
            </div>
          ) : pricing.accessStatus === 'pending_verification' ? (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openVerificationModal();
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300 hover:bg-amber-100 flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
            >
              <Clock className="w-3.5 h-3.5 text-amber-600 animate-pulse" />
              <span>Verification Pending (Review)</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                openVerificationModal();
              }}
              className="w-full py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold bg-[#111111] hover:bg-neutral-800 text-white flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
            >
              <span>Apply as Reseller</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
