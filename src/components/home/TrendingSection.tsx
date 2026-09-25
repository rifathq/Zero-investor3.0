'use client';

import React from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ProductCard } from '@/components/common/ProductCard';
import { ArrowRight, TrendingUp } from 'lucide-react';

export function TrendingSection() {
  const { products, navigate } = useMarketplace();

  // Get active published products only
  const activeProducts = products.filter(p => p.isActive !== false);
  const trendingProducts = activeProducts.filter(p => p.isTrending);
  const displayList = trendingProducts.length >= 8 
    ? trendingProducts.slice(0, 12) 
    : (trendingProducts.length > 0 ? trendingProducts : activeProducts.slice(0, 12));

  if (activeProducts.length === 0) return null;

  return (
    <section className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-6 sm:py-10 overflow-hidden">
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1.5">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>High-Demand Winning Products</span>
          </div>
          <h2 className="text-2xl sm:text-[28px] lg:text-3xl font-extrabold text-[#111111] tracking-tight">
            Top Profitable Products to Sell
          </h2>
          <p className="text-xs sm:text-sm text-[#666666] mt-1">
            Proven viral demand, high customer retention, and high-margin products ready for nationwide marketing
          </p>
        </div>

        <button
          onClick={() => navigate('shop')}
          className="text-xs sm:text-sm font-bold text-[#111111] hover:text-[#C98F6B] flex items-center gap-1.5 transition-colors group shrink-0 cursor-pointer"
        >
          <span>View All Products You Can Sell</span>
          <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
        </button>
      </div>

      {/* Multi-Column Responsive Product Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-4 sm:gap-5">
        {(displayList || []).map((product, idx) => (
          <ProductCard key={product.id} product={product} priority={idx < 2} />
        ))}
      </div>
    </section>
  );
}
