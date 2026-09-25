import React, { useState } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { orderApi } from '@/services';
import { Search, Package, Truck, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { formatBDT, formatDate } from '@/lib/formatters';

export function OrderTrackingView() {
  const { orders } = useMarketplace();
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any | null>(null);
  const [searched, setSearched] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    setSearched(true);
    const found = orderApi.trackOrder(query.trim(), orders);
    setResult(found);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mx-auto mb-2 shadow-xs">
          <Truck className="w-6 h-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-neutral-900">Track Your Order</h1>
        <p className="text-xs sm:text-sm text-neutral-500 max-w-md mx-auto">
          Enter your Order Number or Courier Tracking ID (Pathao / Steadfast) to view live delivery updates.
        </p>
      </div>

      <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="e.g. ORD-17271829 or tracking code..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white border border-[#E6E4E0] rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-1 focus:ring-neutral-900"
          />
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
        >
          Track
        </button>
      </form>

      {searched && (
        <div className="mt-8">
          {result ? (
            <div className="p-6 bg-white border border-[#E6E4E0] rounded-2xl shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-neutral-100 pb-4 gap-2">
                <div>
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Order ID</span>
                  <div className="font-mono text-sm font-bold text-neutral-900">{result.order.orderNumber || result.order.id}</div>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-semibold text-neutral-400 uppercase tracking-wider">Status</span>
                  <div>
                    <span className="inline-block px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full border border-amber-200">
                      {result.order.status}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="text-neutral-400 text-[11px]">Placed On</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">{formatDate(result.order.createdAt)}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[11px]">Total Amount</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">{formatBDT(result.order.total)}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[11px]">Payment</span>
                  <div className="font-semibold text-neutral-800 mt-0.5 uppercase">{result.order.paymentMethod}</div>
                </div>
                <div>
                  <span className="text-neutral-400 text-[11px]">Carrier</span>
                  <div className="font-semibold text-neutral-800 mt-0.5">{result.order.carrier || 'Standard Courier'}</div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 text-center bg-[#FAF9F5] border border-[#E6E4E0] rounded-2xl space-y-2">
              <AlertCircle className="w-8 h-8 text-neutral-400 mx-auto" />
              <p className="text-xs font-semibold text-neutral-700">No matching order found</p>
              <p className="text-[11px] text-neutral-500">Please check your order number or tracking ID and try again.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
