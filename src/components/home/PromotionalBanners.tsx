'use client';

import React from 'react';
import Image from 'next/image';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ArrowRight, Sparkles } from 'lucide-react';

export function PromotionalBanners() {
  const { navigate } = useMarketplace();

  return (
    <section className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-4 sm:py-6 overflow-hidden">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 xl:gap-8">
        {/* Banner 1: Deal of the Day */}
        <div 
          onClick={() => navigate('deals')}
          className="relative bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] p-5 sm:p-7 xl:p-8 overflow-hidden flex items-center justify-between cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="relative z-10 max-w-[58%] flex flex-col justify-between h-full">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#C98F6B]">
                Deal of the Day
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] mt-1 leading-tight">
                Up to 60% Off
              </h3>
              <p className="text-xs text-[#666666] mt-1">
                On selected tech & audio items only
              </p>
            </div>

            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] group-hover:text-[#C98F6B] transition-colors">
                <span>Shop Deals</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=80"
              alt="Smart Watch Deal"
              fill
              sizes="160px"
              className="object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Banner 2: New Arrivals */}
        <div 
          onClick={() => navigate('new-arrivals')}
          className="relative bg-[#F2EEE7] rounded-3xl border border-[#E6E4E0] p-6 sm:p-7 overflow-hidden flex items-center justify-between cursor-pointer group transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
        >
          <div className="relative z-10 max-w-[58%] flex flex-col justify-between h-full">
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-[#111111]">
                New Arrivals
              </span>
              <h3 className="text-xl sm:text-2xl font-extrabold text-[#111111] mt-1 leading-tight">
                Fresh Finds
              </h3>
              <p className="text-xs text-[#666666] mt-1">
                Discover latest crafts from independent makers
              </p>
            </div>

            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#111111] group-hover:text-[#C98F6B] transition-colors">
                <span>Explore Now</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          <div className="relative w-36 h-36 sm:w-40 sm:h-40 shrink-0">
            <Image
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=80"
              alt="Fresh Footwear Finds"
              fill
              sizes="160px"
              className="object-contain drop-shadow-md transition-transform duration-300 group-hover:scale-105 -rotate-6"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>

        {/* Banner 3: Reseller Advantage (Dark Luxury treatment) */}
        <div 
          onClick={() => navigate('shop')}
          className="relative bg-[#111111] text-white rounded-3xl border border-neutral-800 p-6 sm:p-7 overflow-hidden flex items-center justify-between cursor-pointer group transition-all duration-300 hover:shadow-xl hover:-translate-y-1 md:col-span-2 lg:col-span-1"
        >
          {/* Subtle gold/bronze ambient glow */}
          <div className="absolute right-0 top-0 w-36 h-36 bg-[#C98F6B]/20 rounded-full blur-2xl pointer-events-none" />

          <div className="relative z-10 max-w-[58%] flex flex-col justify-between h-full">
            <div>
              <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wider text-[#EAD7CA]">
                <Sparkles className="w-3 h-3 text-[#C98F6B]" />
                <span>Reseller Advantage</span>
              </div>
              <h3 className="text-xl sm:text-2xl font-extrabold text-white mt-1 leading-tight">
                Extra 10% Off
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                Maximize your profit margin on verified wholesale dropship products
              </p>
            </div>

            <div className="mt-5">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#EAD7CA] group-hover:text-white transition-colors">
                <span>Explore Catalogs</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover:translate-x-1" />
              </span>
            </div>
          </div>

          {/* Golden Badge Illustration Graphic */}
          <div className="relative w-28 h-28 sm:w-32 sm:h-32 shrink-0 flex items-center justify-center">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl bg-gradient-to-br from-[#EAD7CA] via-[#C98F6B] to-[#996545] p-0.5 shadow-2xl transition-transform duration-300 group-hover:rotate-6">
              <div className="w-full h-full bg-[#181818] rounded-2xl flex flex-col items-center justify-center p-2 text-center">
                <span className="text-2xl sm:text-3xl font-extrabold text-[#EAD7CA] leading-none">%</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-neutral-300 mt-1">Zero Fee</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
