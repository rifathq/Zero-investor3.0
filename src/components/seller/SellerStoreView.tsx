import React from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { SELLERS } from '@/lib/mockData';
import { ProductCard } from '@/components/common/ProductCard';
import { Store, Star, MapPin, CheckCircle2, ArrowLeft } from 'lucide-react';

export function SellerStoreView() {
  const { selectedSeller, sellers, products, navigate } = useMarketplace();
  const seller = selectedSeller || (sellers && sellers[0]);
  const sellerProducts = (products || []).filter(p => p.sellerId === seller?.id);

  if (!seller) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 text-center">
        <Store className="w-12 h-12 text-neutral-300 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-neutral-800">Store Not Found</h2>
        <button onClick={() => navigate('sellers')} className="mt-4 px-4 py-2 bg-neutral-900 text-white rounded-xl text-xs font-semibold">
          Back to Sellers Directory
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      <button 
        onClick={() => navigate('sellers')} 
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Sellers
      </button>

      {/* Seller Header Banner */}
      <div className="bg-white rounded-3xl border border-[#E6E4E0] overflow-hidden shadow-xs">
        <div className="h-32 sm:h-48 bg-gradient-to-r from-neutral-900 to-neutral-800 relative">
          {seller.bannerUrl && (
            <img src={seller.bannerUrl} alt="" className="w-full h-full object-cover opacity-60" />
          )}
        </div>
        <div className="p-6 sm:p-8 -mt-12 sm:-mt-16 flex flex-col sm:flex-row sm:items-end justify-between gap-6 relative">
          <div className="flex items-end gap-4">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-white border-2 border-white shadow-md overflow-hidden shrink-0">
              {seller.avatarUrl ? (
                <img src={seller.avatarUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-neutral-100 flex items-center justify-center">
                  <Store className="w-8 h-8 text-neutral-400" />
                </div>
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-neutral-900">{seller.storeName}</h1>
                {seller.isVerified && <CheckCircle2 className="w-5 h-5 text-emerald-600" />}
              </div>
              <p className="text-xs sm:text-sm text-neutral-500 mt-0.5">{seller.tagline}</p>
              <div className="flex items-center gap-4 mt-2 text-xs text-neutral-500">
                <span className="flex items-center gap-1 text-amber-500 font-bold">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  {seller.rating.toFixed(1)} ({seller.reviewCount} reviews)
                </span>
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                  {seller.location}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Seller Products */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-neutral-900">
          Products from {seller.storeName} ({sellerProducts.length})
        </h2>
        {sellerProducts.length === 0 ? (
          <div className="py-12 text-center text-xs text-neutral-400">
            No products currently listed for this store.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {sellerProducts.map(p => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
