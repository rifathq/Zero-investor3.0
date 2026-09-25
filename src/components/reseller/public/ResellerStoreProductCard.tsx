'use client';

import React, { useState } from 'react';
import { Product } from '@/types/marketplace';
import { useMarketplace } from '@/context/MarketplaceContext';
import { formatBDT } from '@/lib/formatters';
import { Star, ShoppingBag, Check, Zap, ArrowRight, Eye } from 'lucide-react';

interface ResellerStoreProductCardProps {
  product: Product;
  storeSlug?: string;
  onQuickView?: (product: Product) => void;
}

export function ResellerStoreProductCard({
  product,
  storeSlug,
  onQuickView
}: ResellerStoreProductCardProps) {
  const { addToCart, navigate, showToast } = useMarketplace();
  const [isAdded, setIsAdded] = useState(false);

  // Compute discount percentage if original price is higher
  const originalPrice = product.originalPrice && product.originalPrice > product.price 
    ? product.originalPrice 
    : Math.round(product.price * 1.25);
  
  const discountPct = originalPrice > product.price 
    ? Math.round(((originalPrice - product.price) / originalPrice) * 100) 
    : 0;

  const handleCardClick = () => {
    navigate('reseller-public-landing', {
      storeSlug,
      productSlug: product.id
    });
  };

  const handleAddToCart = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    showToast('Added to Cart', `"${product.name}" added to your bag.`, 'success');
    setTimeout(() => setIsAdded(false), 1800);
  };

  const handleOrderNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigate('reseller-public-landing', {
      storeSlug,
      productSlug: product.id
    });
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-white rounded-2xl sm:rounded-3xl border border-[#E6E4E0] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:border-neutral-300 cursor-pointer h-full"
    >
      {/* Product Image Area */}
      <div className="relative w-full aspect-square bg-[#FAF9F5] p-3 sm:p-5 flex items-center justify-center overflow-hidden">
        {/* Product Image */}
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full h-full object-contain mix-blend-multiply transition-transform duration-300 ease-out group-hover:scale-105"
          loading="lazy"
        />

        {/* Top Badges (Discount, In Stock) */}
        <div className="absolute top-2.5 left-2.5 sm:top-3 sm:left-3 flex flex-col gap-1.5 items-start z-10">
          {discountPct > 0 && (
            <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-md sm:rounded-lg bg-neutral-900 text-white font-extrabold text-[10px] sm:text-xs tracking-tight shadow-xs">
              {discountPct}% OFF
            </span>
          )}
          {product.inStock && product.stockCount <= 5 && (
            <span className="px-2 py-0.5 rounded-md bg-amber-500 text-white font-bold text-[9px] sm:text-[10px] tracking-tight uppercase shadow-xs">
              Low Stock
            </span>
          )}
        </div>

        {/* Quick View Button on Hover */}
        {onQuickView && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="absolute bottom-2.5 right-2.5 opacity-0 group-hover:opacity-100 transition-opacity p-2 rounded-xl bg-white/90 hover:bg-white text-neutral-800 shadow-md backdrop-blur-xs cursor-pointer hidden sm:flex items-center gap-1 text-xs font-semibold"
            title="Quick View"
          >
            <Eye className="w-3.5 h-3.5" />
            <span className="text-[11px]">Quick View</span>
          </button>
        )}

        {/* Out of Stock Overlay */}
        {!product.inStock && (
          <div className="absolute inset-0 bg-white/85 backdrop-blur-[2px] flex items-center justify-center z-20">
            <span className="text-xs sm:text-sm font-bold uppercase tracking-wider text-neutral-700 bg-white px-3 py-1.5 rounded-full border border-neutral-200 shadow-xs">
              Out of Stock
            </span>
          </div>
        )}
      </div>

      {/* Product Content */}
      <div className="p-3.5 sm:p-5 flex flex-col flex-1 justify-between gap-3">
        <div className="space-y-1.5">
          {/* Category kicker */}
          <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-neutral-400 block truncate">
            {product.category}
          </span>

          {/* Title */}
          <h3 className="font-bold text-xs sm:text-sm md:text-base text-neutral-900 line-clamp-2 leading-snug group-hover:text-neutral-700 transition-colors">
            {product.name}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1.5 pt-0.5">
            <div className="flex items-center text-amber-500">
              <Star className="w-3.5 h-3.5 fill-amber-400" />
            </div>
            <span className="font-bold text-xs text-neutral-800">
              {product.rating ? product.rating.toFixed(1) : '4.9'}
            </span>
            <span className="text-[11px] text-neutral-400 font-medium">
              ({product.reviewCount || 38})
            </span>
          </div>
        </div>

        {/* Pricing and Action Buttons */}
        <div className="pt-2 sm:pt-3 border-t border-neutral-100 space-y-3">
          {/* Price display (Reseller's customer selling price only) */}
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-base sm:text-xl font-black text-neutral-950 font-mono tracking-tight">
              {formatBDT(product.price)}
            </span>
            {originalPrice > product.price && (
              <span className="text-xs sm:text-sm text-neutral-400 line-through font-mono">
                {formatBDT(originalPrice)}
              </span>
            )}
          </div>

          {/* Action CTAs: Add to Cart & Order Now */}
          <div className="grid grid-cols-2 gap-2 pt-1">
            <button
              type="button"
              onClick={handleAddToCart}
              disabled={!product.inStock}
              className={`py-2 px-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border ${
                isAdded 
                  ? 'bg-emerald-600 text-white border-emerald-600' 
                  : 'bg-white text-neutral-800 border-neutral-300 hover:bg-neutral-50 active:scale-[0.98]'
              }`}
            >
              {isAdded ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span className="truncate">Added</span>
                </>
              ) : (
                <>
                  <ShoppingBag className="w-3.5 h-3.5 text-neutral-600" />
                  <span className="truncate">Add to Cart</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={handleOrderNow}
              disabled={!product.inStock}
              className="py-2 px-2.5 rounded-xl text-xs font-bold bg-neutral-900 text-white hover:bg-neutral-800 active:scale-[0.98] transition-all flex items-center justify-center gap-1 shadow-2xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-3 h-3 text-amber-300 fill-amber-300" />
              <span className="truncate">Buy Now</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
