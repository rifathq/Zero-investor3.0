'use client';

import React, { useState, useMemo } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { Search, ArrowRight, Layers, ShoppingBag, FolderTree, ArrowLeft, ChevronRight, X } from 'lucide-react';
import { Category } from '@/types/marketplace';

export function CategoriesView() {
  const { categories, isLoadingCategories, navigate } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'top-level' | 'subcategories' | 'featured'>('all');

  // Active categories only
  const activeCategories = useMemo(() => {
    return categories.filter(c => c.status !== 'hidden');
  }, [categories]);

  // Filtered categories
  const filteredCategories = useMemo(() => {
    return activeCategories.filter(cat => {
      // Type filter
      if (selectedFilter === 'top-level' && cat.parentId) return false;
      if (selectedFilter === 'subcategories' && !cat.parentId) return false;
      if (selectedFilter === 'featured' && !cat.isFeatured) return false;

      // Search query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchName = cat.name.toLowerCase().includes(q);
        const matchSlug = cat.slug.toLowerCase().includes(q);
        const matchDesc = (cat.description || '').toLowerCase().includes(q);
        if (!matchName && !matchSlug && !matchDesc) return false;
      }
      return true;
    }).sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));
  }, [activeCategories, selectedFilter, searchQuery]);

  return (
    <div className="min-h-screen bg-[#FAF9F5] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        
        {/* Navigation Breadcrumbs & Back */}
        <div className="flex items-center justify-between">
          <nav className="flex items-center gap-2 text-xs font-medium text-neutral-500">
            <button 
              type="button" 
              onClick={() => navigate('home')} 
              className="hover:text-neutral-900 transition-colors cursor-pointer"
            >
              Home
            </button>
            <ChevronRight className="w-3.5 h-3.5 text-neutral-400" />
            <span className="text-neutral-900 font-semibold">Categories</span>
          </nav>

          <button
            type="button"
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </button>
        </div>

        {/* Hero Banner Header */}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-neutral-200/90 shadow-2xs space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neutral-100 text-neutral-800 text-xs font-bold border border-neutral-200">
            <Layers className="w-3.5 h-3.5 text-neutral-600" />
            <span>{activeCategories.length} Active Departments</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black text-neutral-900 tracking-tight">
            Explore All Categories
          </h1>

          <p className="text-xs sm:text-sm text-neutral-500 max-w-2xl leading-relaxed">
            Discover verified wholesale supplier merchandise, trending dropshipping catalogs, and artisan crafted products across all catalog categories.
          </p>

          {/* Search bar & filter pills */}
          <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search categories by keyword..."
                className="w-full pl-9.5 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-xs sm:text-sm focus:outline-none focus:border-neutral-900 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1.5 flex-wrap text-xs">
              <button
                type="button"
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                  selectedFilter === 'all'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                All ({activeCategories.length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('top-level')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                  selectedFilter === 'top-level'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Primary ({activeCategories.filter(c => !c.parentId).length})
              </button>

              <button
                type="button"
                onClick={() => setSelectedFilter('featured')}
                className={`px-3 py-1.5 rounded-xl font-semibold transition-colors cursor-pointer ${
                  selectedFilter === 'featured'
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-white border border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                }`}
              >
                Featured ({activeCategories.filter(c => c.isFeatured).length})
              </button>
            </div>
          </div>
        </div>

        {/* Categories Grid */}
        {isLoadingCategories ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="bg-white rounded-3xl p-5 border border-neutral-200 animate-pulse space-y-4">
                <div className="w-full aspect-square rounded-2xl bg-neutral-200" />
                <div className="h-5 bg-neutral-200 rounded w-1/2" />
                <div className="h-3 bg-neutral-200 rounded w-3/4" />
              </div>
            ))}
          </div>
        ) : filteredCategories.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-neutral-200 space-y-3">
            <Layers className="w-10 h-10 text-neutral-300 mx-auto" />
            <h3 className="text-base font-bold text-neutral-900">No categories found</h3>
            <p className="text-xs text-neutral-500 max-w-sm mx-auto">
              No categories match your search keyword &quot;{searchQuery}&quot;. Try a different search term or view all categories.
            </p>
            <button
              type="button"
              onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }}
              className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold hover:bg-black transition-colors cursor-pointer"
            >
              Clear Filter
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
            {filteredCategories.map((cat: Category) => {
              // Find subcategories belonging to this category if any
              const children = activeCategories.filter(c => c.parentId === cat.id);
              const parentCat = cat.parentId ? activeCategories.find(c => c.id === cat.parentId) : null;

              return (
                <div
                  key={cat.id}
                  onClick={() => navigate('shop', { category: cat.name })}
                  className="group bg-white rounded-3xl border border-neutral-200/90 hover:border-neutral-900 hover:shadow-lg transition-all duration-300 cursor-pointer overflow-hidden flex flex-col p-4 sm:p-5"
                >
                  {/* Category Image */}
                  <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-neutral-100 border border-neutral-100 mb-4">
                    {cat.imageUrl ? (
                      <img
                        src={cat.imageUrl}
                        alt={cat.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        loading="lazy"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-neutral-400">
                        <FolderTree className="w-10 h-10" />
                      </div>
                    )}

                    {/* Product count pill */}
                    <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-[11px] font-bold text-neutral-900 shadow-2xs border border-neutral-200/60 flex items-center gap-1">
                      <ShoppingBag className="w-3 h-3 text-neutral-500" />
                      <span>{cat.productCount ?? 0}</span>
                    </div>

                    {cat.isFeatured && (
                      <div className="absolute top-3 left-3 px-2 py-0.5 rounded-full bg-amber-500 text-[10px] font-bold text-white shadow-2xs">
                        Featured
                      </div>
                    )}
                  </div>

                  {/* Body */}
                  <div className="flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      {parentCat && (
                        <span className="text-[10px] font-semibold text-neutral-400 uppercase tracking-wider block mb-1">
                          Subcategory of {parentCat.name}
                        </span>
                      )}

                      <h3 className="text-base font-bold text-neutral-900 group-hover:text-black transition-colors line-clamp-1">
                        {cat.name}
                      </h3>

                      {cat.description && (
                        <p className="text-xs text-neutral-500 line-clamp-2 mt-1 leading-relaxed">
                          {cat.description}
                        </p>
                      )}
                    </div>

                    {/* Subcategories list pills if available */}
                    {children.length > 0 && (
                      <div className="pt-2 border-t border-neutral-100">
                        <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                          Subcategories ({children.length})
                        </span>
                        <div className="flex flex-wrap gap-1">
                          {children.slice(0, 3).map(ch => (
                            <span 
                              key={ch.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                navigate('shop', { category: ch.name });
                              }}
                              className="px-2 py-0.5 rounded-md bg-neutral-100 hover:bg-neutral-200 text-[10px] font-semibold text-neutral-700 transition-colors"
                            >
                              {ch.name}
                            </span>
                          ))}
                          {children.length > 3 && (
                            <span className="text-[10px] text-neutral-400 font-semibold self-center">
                              +{children.length - 3} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Footer Button */}
                    <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-bold text-neutral-900 group-hover:text-black">
                      <span>Browse Products</span>
                      <div className="w-7 h-7 rounded-full bg-neutral-100 group-hover:bg-neutral-900 group-hover:text-white flex items-center justify-center transition-colors">
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>
    </div>
  );
}
