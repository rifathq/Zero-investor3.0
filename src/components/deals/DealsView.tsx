'use client';

import React, { useState, useEffect } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ProductCard } from '@/components/common/ProductCard';
import { Flame, Clock } from 'lucide-react';

export function DealsView() {
  const { products, categories } = useMarketplace();

  // Active filter category
  const [selectedCat, setSelectedCat] = useState<string>('all');

  // Countdown timer state (hours, minutes, seconds)
  const [timeLeft, setTimeLeft] = useState({
    hours: 8,
    minutes: 42,
    seconds: 15
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: 59, seconds: 59 };
        } else if (prev.hours > 0) {
          return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
        }
        return { hours: 12, minutes: 0, seconds: 0 };
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Filter products with discounts (or discountPercent > 0)
  const dealProducts = products.filter(p => {
    if (p.isActive === false) return false;
    const hasDiscount = (p.discountPercent && p.discountPercent > 0) || (p.originalPrice && p.originalPrice > p.price);
    const matchesCat = selectedCat === 'all' || p.category === selectedCat;
    return hasDiscount && matchesCat;
  });

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-6 sm:py-8">
      {/* Deals Hero Banner with live timer */}
      <div className="relative rounded-3xl bg-radial from-[#1A1A1A] to-[#111111] text-white p-7 sm:p-10 mb-8 border border-neutral-800 shadow-xl overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-bold mb-3">
              <Flame className="w-4 h-4 text-rose-400" />
              <span>Limited-Time Marketplace Markdowns</span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
              Flash Deals &amp; Daily Steals
            </h1>
            <p className="text-xs sm:text-sm text-neutral-300 mt-1 max-w-lg">
              Special promotional prices direct from our independent vendors. Once inventory clears, prices return to standard retail.
            </p>
          </div>

          {/* Countdown Clock Box */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl border border-white/15 p-4 sm:p-5 flex flex-col items-center shrink-0">
            <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-300 flex items-center gap-1.5 mb-2">
              <Clock className="w-3.5 h-3.5 text-[#C98F6B]" /> Deal Window Closes In:
            </span>
            <div className="flex items-center gap-2 font-mono text-2xl sm:text-3xl font-extrabold text-white">
              <div className="bg-black/50 px-3 py-2 rounded-xl border border-white/10">
                {String(timeLeft.hours).padStart(2, '0')}
                <span className="block text-[9px] font-sans font-normal text-neutral-400 text-center uppercase tracking-normal">Hrs</span>
              </div>
              <span>:</span>
              <div className="bg-black/50 px-3 py-2 rounded-xl border border-white/10">
                {String(timeLeft.minutes).padStart(2, '0')}
                <span className="block text-[9px] font-sans font-normal text-neutral-400 text-center uppercase tracking-normal">Min</span>
              </div>
              <span>:</span>
              <div className="bg-black/50 px-3 py-2 rounded-xl border border-white/10">
                {String(timeLeft.seconds).padStart(2, '0')}
                <span className="block text-[9px] font-sans font-normal text-neutral-400 text-center uppercase tracking-normal">Sec</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8">
        <button
          onClick={() => setSelectedCat('all')}
          className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
            selectedCat === 'all'
              ? 'bg-[#111111] text-white'
              : 'bg-[#F7F6F3] text-neutral-700 hover:bg-neutral-200'
          }`}
        >
          All Deals ({products.filter(p => p.discountPercent && p.discountPercent > 0).length})
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.name)}
            className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-colors ${
              selectedCat === cat.name
                ? 'bg-[#111111] text-white'
                : 'bg-[#F7F6F3] text-neutral-700 hover:bg-neutral-200'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Grid of Deals (Multi-Column Desktop, 2 Columns Mobile) */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3.5 sm:gap-4 lg:gap-5 xl:gap-6">
        {dealProducts.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
