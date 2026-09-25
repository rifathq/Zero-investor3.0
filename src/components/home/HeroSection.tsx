'use client';

import React from 'react';
import Image from 'next/image';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { useReseller } from '@/context/ResellerContext';
import { 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  Wallet,
  Truck
} from 'lucide-react';

export function HeroSection() {
  const { navigate } = useMarketplace();
  const { isAuthenticated, role, userProfile } = useAuth();
  const { isReseller } = useReseller();

  const isUserReseller = Boolean(
    isReseller || 
    role === 'seller' || 
    role === 'reseller' || 
    userProfile?.role === 'seller' || 
    userProfile?.role === 'reseller'
  );

  const handleStartSelling = () => {
    if (isAuthenticated && isUserReseller) {
      navigate('reseller-dashboard');
    } else {
      navigate('reseller');
    }
  };

  return (
    <section className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 pt-3 sm:pt-4 pb-8 sm:pb-12 overflow-hidden">
      {/* Rounded wide hero banner container */}
      <div className="relative w-full rounded-2xl sm:rounded-3xl bg-gradient-to-br from-[#F7F6F3] via-[#F2EEE7] to-[#EAD7CA]/40 border border-[#E6E4E0] overflow-hidden p-5 sm:p-10 lg:p-12 xl:p-14 shadow-xs">
        {/* Subtle background ambient blur */}
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-[#C98F6B]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-center">
          {/* Left Column (Content & CTAs) */}
          <div className="lg:col-span-6 xl:col-span-6 flex flex-col justify-center">
            {/* Eyebrow */}
            <div className="flex items-center gap-2 mb-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-neutral-900 text-white text-[11px] font-bold uppercase tracking-wider shadow-xs">
                <Sparkles className="w-3 h-3 text-[#C98F6B]" />
                No Upfront Inventory Dropshipping &amp; Reselling
              </span>
            </div>

            {/* Primary Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-5xl xl:text-[54px] font-black text-[#111111] leading-[1.12] tracking-tight">
              Find Products.<br />
              <span className="text-[#C98F6B]">Start Selling.</span><br />
              Earn.
            </h1>

            {/* Supporting Copy */}
            <p className="mt-4 sm:mt-5 text-[#555555] text-sm sm:text-base leading-relaxed max-w-xl font-normal">
              Select verified wholesale products, generate 1-click automated landing pages, and start selling. Zero Invest handles warehousing, nationwide express delivery via Pathao &amp; Steadfast, and cash-on-delivery collection. You keep the net profit.
            </p>

            {/* Workflow Step Bar */}
            <div className="mt-6 p-3 sm:p-4 rounded-2xl bg-white/90 backdrop-blur-sm border border-[#E6E4E0] shadow-xs">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-neutral-400 block mb-2">
                How Zero Invest Works
              </span>
              <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-neutral-800">
                <span className="flex items-center gap-1 text-[#111111]">
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center">1</span>
                  Choose Product
                </span>
                <span className="text-neutral-400">→</span>
                <span className="flex items-center gap-1 text-[#111111]">
                  <span className="w-4 h-4 rounded-full bg-[#C98F6B] text-white text-[10px] flex items-center justify-center">2</span>
                  Generate Landing Page
                </span>
                <span className="text-neutral-400">→</span>
                <span className="flex items-center gap-1 text-[#111111]">
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center">3</span>
                  Market
                </span>
                <span className="text-neutral-400">→</span>
                <span className="flex items-center gap-1 text-[#111111]">
                  <span className="w-4 h-4 rounded-full bg-neutral-900 text-white text-[10px] flex items-center justify-center">4</span>
                  Receive Orders
                </span>
                <span className="text-neutral-400">→</span>
                <span className="flex items-center gap-1 text-emerald-700 font-extrabold">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white text-[10px] flex items-center justify-center">5</span>
                  Earn
                </span>
              </div>
            </div>

            {/* Primary CTA Buttons */}
            <div className="mt-7 flex flex-wrap items-center gap-3.5">
              <button
                onClick={handleStartSelling}
                className="bg-[#111111] hover:bg-neutral-800 text-white font-bold text-sm sm:text-base px-8 py-3.5 rounded-full flex items-center gap-2.5 transition-all duration-200 shadow-md hover:shadow-lg group cursor-pointer"
              >
                <span>Start Selling</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </button>

              <button
                onClick={() => navigate('shop')}
                className="bg-white hover:bg-neutral-50 text-[#111111] font-bold text-sm sm:text-base px-7 py-3.5 rounded-full border border-[#E6E4E0] flex items-center gap-2 transition-all duration-200 hover:border-neutral-400 cursor-pointer shadow-xs"
              >
                <Layers className="w-4 h-4 text-[#C98F6B]" />
                <span>Browse Products</span>
              </button>
            </div>

            {/* Trust Indicators */}
            <div className="mt-8 pt-5 border-t border-[#E6E4E0]/80 flex flex-wrap items-center gap-5 sm:gap-7 text-xs text-[#666666]">
              <div className="flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>No Upfront Inventory Purchase</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Truck className="w-4 h-4 text-[#C98F6B]" />
                <span>Nationwide COD (64 Districts)</span>
              </div>
              <div className="flex items-center gap-2 font-medium">
                <Wallet className="w-4 h-4 text-neutral-800" />
                <span>Weekly Payouts (bKash/Nagad)</span>
              </div>
            </div>
          </div>

          {/* Right Column: Visual Showcase of Reseller Platform */}
          <div className="lg:col-span-6 xl:col-span-6 relative flex items-center justify-center">
            <div className="relative w-full aspect-[4/3] sm:aspect-[16/11] rounded-2xl overflow-hidden shadow-xl border border-white/80 bg-white p-4 flex flex-col justify-between">
              {/* Product Preview Card */}
              <div className="relative w-full h-44 sm:h-52 rounded-xl overflow-hidden bg-neutral-100">
                <Image
                  src="https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=1000&auto=format&fit=crop&q=80"
                  alt="High margin product preview"
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-3 left-3 bg-emerald-600 text-white text-xs font-extrabold px-3 py-1 rounded-lg shadow-sm flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-200" />
                  <span>৳849 Net Profit / Sale</span>
                </div>
                <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-neutral-900 text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm">
                  1-Click Landing Page Ready
                </div>
              </div>

              {/* Realtime Economics Simulation */}
              <div className="pt-4 grid grid-cols-3 gap-2.5 text-center">
                <div className="p-3 bg-[#F7F6F3] rounded-xl border border-neutral-200">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Wholesale Cost</span>
                  <span className="text-sm sm:text-base font-black text-neutral-800">৳1,650</span>
                </div>
                <div className="p-3 bg-[#F7F6F3] rounded-xl border border-neutral-200">
                  <span className="text-[10px] uppercase font-bold text-neutral-500 block">Selling Price</span>
                  <span className="text-sm sm:text-base font-black text-neutral-900">৳2,499</span>
                </div>
                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                  <span className="text-[10px] uppercase font-bold text-emerald-700 block">Your Profit</span>
                  <span className="text-sm sm:text-base font-black text-emerald-600">+৳849</span>
                </div>
              </div>

              <div className="pt-2 text-[11px] text-neutral-500 flex items-center justify-between">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Fulfillment by Pathao &amp; Steadfast
                </span>
                <span className="font-semibold text-neutral-800">
                  3,200+ Active Resellers in BD
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
