'use client';

import React, { useRef, useState, useEffect, useMemo } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ArrowRight, ChevronLeft, ChevronRight, Layers, RefreshCw } from 'lucide-react';
import { Category } from '@/types/marketplace';

export function ShopByCategory() {
  const { categories, isLoadingCategories, categoryError, navigate } = useMarketplace();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  // Active categories sorted by sortOrder, prioritizing featured
  const displayCategories = useMemo(() => {
    // Only active categories
    const active = categories
      .filter((c) => c.status !== 'hidden')
      .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

    // If there are featured categories, display featured first or only featured
    const featured = active.filter((c) => c.isFeatured);
    if (featured.length >= 4) {
      return featured;
    }
    return active;
  }, [categories]);

  // Check scroll bounds
  const updateScrollButtons = () => {
    if (!scrollContainerRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setCanScrollLeft(scrollLeft > 10);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 10);
  };

  useEffect(() => {
    updateScrollButtons();
    const container = scrollContainerRef.current;
    if (!container) return;

    container.addEventListener('scroll', updateScrollButtons, { passive: true });
    window.addEventListener('resize', updateScrollButtons);

    return () => {
      container.removeEventListener('scroll', updateScrollButtons);
      window.removeEventListener('resize', updateScrollButtons);
    };
  }, [displayCategories]);

  const handleScroll = (direction: 'left' | 'right') => {
    if (!scrollContainerRef.current) return;
    const offset = scrollContainerRef.current.clientWidth * 0.75;
    scrollContainerRef.current.scrollBy({
      left: direction === 'left' ? -offset : offset,
      behavior: 'smooth'
    });
  };

  return (
    <section className="py-10 bg-white border-b border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header Strip */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-6 gap-3">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 tracking-tight">
              Explore by Category
            </h2>
            <p className="text-xs sm:text-sm text-neutral-500 mt-1">
              Find top wholesale and retail products across popular categories.
            </p>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* View All Button */}
            <button 
              type="button"
              onClick={() => navigate('categories')}
              className="text-xs sm:text-sm font-semibold text-neutral-900 hover:text-black inline-flex items-center gap-1 group cursor-pointer transition-colors"
            >
              <span>View All</span>
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
            </button>

            {/* Carousel Arrow Controls (Desktop / Tablet) */}
            {displayCategories.length > 3 && (
              <div className="hidden sm:flex items-center gap-1.5 ml-2">
                <button
                  type="button"
                  onClick={() => handleScroll('left')}
                  disabled={!canScrollLeft}
                  className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-neutral-700 transition-all cursor-pointer shadow-2xs"
                  aria-label="Scroll left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => handleScroll('right')}
                  disabled={!canScrollRight}
                  className="w-8 h-8 rounded-full border border-neutral-200 bg-white hover:bg-neutral-50 disabled:opacity-30 disabled:cursor-not-allowed flex items-center justify-center text-neutral-700 transition-all cursor-pointer shadow-2xs"
                  aria-label="Scroll right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Carousel Content */}
        {isLoadingCategories ? (
          /* Skeletons */
          <div className="flex gap-4 overflow-hidden">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div 
                key={i} 
                className="w-[42vw] min-w-[145px] sm:w-[28vw] sm:min-w-[170px] lg:w-[15.5%] lg:min-w-[180px] p-3.5 rounded-2xl border border-neutral-200 bg-neutral-50/50 animate-pulse space-y-3 shrink-0"
              >
                <div className="w-full aspect-square rounded-xl bg-neutral-200" />
                <div className="h-4 bg-neutral-200 rounded w-3/4 mx-auto" />
                <div className="h-3 bg-neutral-200 rounded w-1/2 mx-auto" />
              </div>
            ))}
          </div>
        ) : categoryError ? (
          /* Error State */
          <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-3">
            <p className="text-sm font-semibold text-neutral-700">Unable to load categories.</p>
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer hover:bg-black"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Try Again</span>
            </button>
          </div>
        ) : displayCategories.length === 0 ? (
          /* Empty State */
          <div className="p-8 rounded-2xl bg-neutral-50 border border-neutral-200 text-center space-y-2">
            <Layers className="w-8 h-8 text-neutral-400 mx-auto" />
            <p className="text-sm font-medium text-neutral-600">No categories available yet.</p>
          </div>
        ) : (
          /* Horizontal Carousel */
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex gap-3 sm:gap-4 overflow-x-auto scroll-smooth py-2 px-1 -mx-1 no-scrollbar touch-pan-x"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {displayCategories.map((cat: Category) => (
                <div
                  key={cat.id}
                  onClick={() => navigate('shop', { category: cat.name })}
                  className="group relative flex-none w-[42vw] min-w-[145px] max-w-[170px] sm:w-[28vw] sm:min-w-[170px] sm:max-w-[200px] lg:w-[15.5%] lg:min-w-[185px] lg:max-w-[210px] p-3 sm:p-4 bg-white rounded-2xl border border-neutral-200/90 hover:border-neutral-900 hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col text-center"
                >
                  {/* Category Image (1:1 Ratio, Cover, Subtle Zoom) */}
                  <div className="w-full aspect-square rounded-xl overflow-hidden bg-neutral-100 border border-neutral-100 mb-3 relative">
                    {cat.imageUrl ? (
                      <img 
                        src={cat.imageUrl} 
                        alt={cat.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <Layers className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  {/* Category Details */}
                  <div className="space-y-1">
                    <h3 className="text-xs sm:text-sm font-bold text-neutral-900 group-hover:text-black line-clamp-1 transition-colors">
                      {cat.name}
                    </h3>
                    <p className="text-[11px] text-neutral-400 font-medium">
                      {cat.productCount ?? 0} {cat.productCount === 1 ? 'item' : 'items'}
                    </p>
                  </div>

                  {/* Subtle Explore Arrow Indicator on Hover */}
                  <div className="mt-2 pt-2 border-t border-neutral-100 flex items-center justify-center gap-1 text-[11px] font-semibold text-neutral-900 opacity-0 group-hover:opacity-100 transition-opacity">
                    <span>Explore</span>
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
