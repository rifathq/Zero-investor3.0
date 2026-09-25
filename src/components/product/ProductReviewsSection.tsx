import React from 'react';
import { Product } from '@/types/marketplace';
import { useMarketplace } from '@/context/MarketplaceContext';
import { Star, ThumbsUp, CheckCircle2 } from 'lucide-react';

interface ProductReviewsSectionProps {
  product: Product;
}

export function ProductReviewsSection({ product }: ProductReviewsSectionProps) {
  const { reviews } = useMarketplace();
  const productReviews = (reviews || []).filter(r => r.productId === product.id);

  return (
    <div className="mt-12 pt-8 border-t border-[#E6E4E0] space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-bold text-neutral-900">Verified Customer Reviews</h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Real customer feedback and verified ratings
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#FAF9F5] border border-[#E6E4E0] px-3.5 py-1.5 rounded-full">
          <div className="flex items-center gap-1 text-amber-500 font-bold text-sm">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{product.rating.toFixed(1)}</span>
          </div>
          <span className="text-xs text-neutral-500">({productReviews.length || product.reviewCount} reviews)</span>
        </div>
      </div>

      {productReviews.length === 0 ? (
        <div className="text-center py-8 bg-[#FAF9F5] rounded-2xl border border-[#E6E4E0] text-xs text-neutral-500">
          No reviews yet for this product. Be the first to purchase and review!
        </div>
      ) : (
        <div className="space-y-4">
          {productReviews.map(rev => (
            <div key={rev.id} className="p-4 bg-white rounded-xl border border-[#E6E4E0] space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-neutral-900">{rev.author}</span>
                  {rev.verifiedPurchase && (
                    <span className="flex items-center gap-1 text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full font-semibold">
                      <CheckCircle2 className="w-3 h-3" />
                      Verified
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-neutral-400">{rev.date}</span>
              </div>
              <div className="flex items-center gap-1 text-amber-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    className={`w-3.5 h-3.5 ${i < rev.rating ? 'fill-amber-400 text-amber-400' : 'text-neutral-200'}`} 
                  />
                ))}
              </div>
              <p className="text-xs text-neutral-700 font-semibold">{rev.title}</p>
              <p className="text-xs text-neutral-600">{rev.comment}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
