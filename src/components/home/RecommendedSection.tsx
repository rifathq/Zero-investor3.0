import React from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ProductCard } from '@/components/common/ProductCard';
import { Sparkles, ArrowRight } from 'lucide-react';

export function RecommendedSection() {
  const { products, navigate } = useMarketplace();
  const recommended = products.filter(p => p.isRecommended || p.isTrending).slice(0, 4);

  if (recommended.length === 0) return null;

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900">Recommended for You</h2>
              <p className="text-xs sm:text-sm text-neutral-500">Hand-picked viral products with high profit margins</p>
            </div>
          </div>
          <button 
            onClick={() => navigate('shop')}
            className="text-xs sm:text-sm font-semibold text-neutral-800 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
          >
            View More <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {(recommended || []).map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </section>
  );
}
