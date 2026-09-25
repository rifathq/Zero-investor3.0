import React, { useState } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { SELLERS } from '@/lib/mockData';
import { Store, Star, MapPin, CheckCircle2, Search, ArrowRight } from 'lucide-react';

export function SellersDirectoryView() {
  const { navigate } = useMarketplace();
  const [search, setSearch] = useState('');

  const filtered = SELLERS.filter(s => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return s.storeName.toLowerCase().includes(q) || s.category.toLowerCase().includes(q);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">Verified Seller Hub</h1>
          <p className="text-xs sm:text-sm text-neutral-500 mt-1">
            Browse verified wholesale suppliers and trusted marketplace merchants
          </p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sellers or categories..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-[#E6E4E0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(seller => (
          <div
            key={seller.id}
            onClick={() => navigate('seller-store', { sellerId: seller.id })}
            className="p-5 bg-white rounded-2xl border border-[#E6E4E0] hover:shadow-md transition-all cursor-pointer flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FAF9F5] border border-[#E6E4E0] overflow-hidden shrink-0">
                {seller.avatarUrl ? (
                  <img src={seller.avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-400">
                    <Store className="w-6 h-6" />
                  </div>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-bold text-neutral-900 text-sm truncate">{seller.storeName}</h3>
                  {seller.isVerified && (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  )}
                </div>
                <p className="text-xs text-neutral-500 line-clamp-1">{seller.tagline}</p>
                <div className="flex items-center gap-3 mt-2 text-[11px] text-neutral-500">
                  <span className="flex items-center gap-1 text-amber-500 font-semibold">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {seller.rating.toFixed(1)}
                  </span>
                  <span>•</span>
                  <span>{seller.productCount} Products</span>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs font-semibold text-neutral-700">
              <span className="flex items-center gap-1 text-neutral-400 font-normal">
                <MapPin className="w-3.5 h-3.5" />
                {seller.location}
              </span>
              <span className="text-[#C98F6B] flex items-center gap-1">
                Visit Store <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
