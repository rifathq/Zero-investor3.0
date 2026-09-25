'use client';

import React from 'react';
import Image from 'next/image';
import { useMarketplace } from '@/context/MarketplaceContext';
import { Star, MapPin, Package, ArrowRight } from 'lucide-react';

export function FeaturedSellersSection() {
  const { sellers, navigate } = useMarketplace();

  return (
    <section className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-8 sm:py-12 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between mb-6 sm:mb-8">
        <div>
          <h2 className="text-xl sm:text-2xl lg:text-[28px] font-bold text-[#111111] tracking-tight">
            Featured Suppliers &amp; Brands
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-0.5">
            Verified wholesale inventory ready for zero-investment dropshipping and reselling
          </p>
        </div>

        <button
          onClick={() => navigate('sellers')}
          className="text-xs sm:text-sm font-semibold text-[#111111] hover:text-[#C98F6B] flex items-center gap-1.5 transition-colors group shrink-0"
        >
          <span className="hidden sm:inline">View all suppliers</span>
          <span className="sm:hidden">All</span>
          <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
        </button>
      </div>

      {/* Grid of Sellers */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
        {(sellers || []).slice(0, 4).map((seller) => (
          <div
            key={seller.id}
            onClick={() => navigate('seller-store', { sellerId: seller.id })}
            className="group bg-white rounded-2xl border border-[#E6E4E0] overflow-hidden flex flex-col justify-between transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-pointer"
          >
            {/* Store Cover Image Banner */}
            <div className="relative h-28 w-full bg-[#F7F6F3] overflow-hidden">
              <Image
                src={seller.bannerUrl}
                alt={seller.storeName}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-0 bg-black/25" />
            </div>

            {/* Store Info Details */}
            <div className="p-5 relative pt-0 flex-1 flex flex-col justify-between">
              {/* Floating Avatar */}
              <div className="-mt-8 mb-3 flex items-end justify-between">
                <div className="relative w-16 h-16 rounded-xl overflow-hidden border-2 border-white shadow-md bg-white">
                  <Image
                    src={seller.avatarUrl}
                    alt={seller.storeName}
                    fill
                    className="object-cover"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex items-center gap-1 text-xs text-amber-500 font-semibold bg-[#F7F6F3] px-2 py-1 rounded-lg border border-[#E6E4E0]">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{seller.rating}</span>
                  <span className="text-neutral-400 font-normal">({seller.reviewCount})</span>
                </div>
              </div>

              <div>
                <h3 className="font-bold text-base text-[#111111] group-hover:text-[#C98F6B] transition-colors leading-tight">
                  {seller.storeName}
                </h3>
                <p className="text-xs text-[#666666] line-clamp-2 mt-1 leading-relaxed">
                  {seller.tagline}
                </p>

                <div className="flex items-center gap-4 mt-3 text-xs text-[#8A8A8A]">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-neutral-400" /> {seller.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Package className="w-3.5 h-3.5 text-neutral-400" /> {seller.productCount} products
                  </span>
                </div>
              </div>

              {/* Action row */}
              <div className="mt-5 pt-3 border-t border-neutral-100 flex items-center justify-between">
                <span className="text-xs text-[#666666] font-medium">
                  {seller.salesCount}+ verified orders
                </span>
                <span className="text-xs font-semibold text-[#111111] group-hover:text-[#C98F6B] flex items-center gap-1">
                  View Products <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
