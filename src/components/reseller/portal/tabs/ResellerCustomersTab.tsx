'use client';

import React, { useState, useMemo } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { ResellerCustomer } from '@/types/reseller';
import { Order } from '@/types/marketplace';
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  ShoppingBag, 
  Calendar, 
  Eye, 
  X, 
  Clock,
  CheckCircle,
  Truck
} from 'lucide-react';
import { formatBDT } from '@/lib/formatters';

export function ResellerCustomersTab() {
  const { customers, orders } = useReseller();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState<ResellerCustomer | null>(null);

  const filteredCustomers = useMemo(() => {
    return customers.filter((c) => {
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        c.phone.includes(q) ||
        (c.email && c.email.toLowerCase().includes(q))
      );
    });
  }, [customers, searchQuery]);

  // Orders placed by selected customer for this reseller
  const customerOrders = useMemo(() => {
    if (!selectedCustomer) return [];
    return orders.filter(
      o => o.customerPhone === selectedCustomer.phone ||
           o.customerName === selectedCustomer.name ||
           (selectedCustomer.email && o.customerEmail === selectedCustomer.email)
    );
  }, [selectedCustomer, orders]);

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">My Store Customers</h1>
        <p className="text-sm text-neutral-500 mt-1.5">
          Customers who have purchased from your storefront ({customers.length} total shoppers)
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-5 sm:p-6 shadow-xs">
        <div className="relative max-w-lg">
          <Search className="w-4.5 h-4.5 absolute left-3.5 top-3 text-neutral-400" />
          <input
            type="text"
            placeholder="Search customers by name, phone, or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-700"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Customers Table */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl overflow-hidden shadow-xs">
        {filteredCustomers.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Users className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-base font-semibold text-neutral-700">No customers found</p>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
              Customers who place orders for your products will automatically appear in this directory.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9F5] border-b border-[#E6E4E0] text-neutral-500 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="py-4 px-5">Customer Name</th>
                  <th className="py-4 px-5">Phone Number</th>
                  <th className="py-4 px-5">Email</th>
                  <th className="py-4 px-5 text-center">Orders Placed</th>
                  <th className="py-4 px-5 text-right">Total Spent</th>
                  <th className="py-4 px-5">Last Order Date</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredCustomers.map((cust) => (
                  <tr key={cust.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* Name */}
                    <td className="py-4.5 sm:py-5 px-5 font-bold text-sm sm:text-base text-neutral-900">
                      {cust.name}
                    </td>

                    {/* Phone */}
                    <td className="py-4.5 sm:py-5 px-5 text-neutral-700 font-mono text-sm">
                      {cust.phone}
                    </td>

                    {/* Email */}
                    <td className="py-4.5 sm:py-5 px-5 text-neutral-500 text-sm">
                      {cust.email || '—'}
                    </td>

                    {/* Orders Placed */}
                    <td className="py-4.5 sm:py-5 px-5 text-center font-bold text-sm sm:text-base text-neutral-900">
                      {cust.orderCount}
                    </td>

                    {/* Total Spent */}
                    <td className="py-4.5 sm:py-5 px-5 text-right font-extrabold text-sm sm:text-base text-neutral-900">
                      {formatBDT(cust.totalSpentBDT)}
                    </td>

                    {/* Last Order Date */}
                    <td className="py-4.5 sm:py-5 px-5 text-neutral-500 text-xs sm:text-[13px]">
                      {new Date(cust.lastOrderDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>

                    {/* Status */}
                    <td className="py-4.5 sm:py-5 px-5 text-center">
                      <span className="inline-block px-3 py-1 rounded-md text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 capitalize">
                        {cust.status}
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-4.5 sm:py-5 px-5 text-right">
                      <button
                        onClick={() => setSelectedCustomer(cust)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors font-semibold text-xs sm:text-sm cursor-pointer shadow-2xs"
                      >
                        <Eye className="w-4 h-4" /> Order History
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Customer Order History Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-xl w-full border border-neutral-200 shadow-xl overflow-hidden p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  {selectedCustomer.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  {selectedCustomer.phone} {selectedCustomer.email && `· ${selectedCustomer.email}`}
                </p>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Quick Summary */}
            <div className="grid grid-cols-2 gap-3 text-xs bg-neutral-50 p-3 rounded-xl border border-neutral-200">
              <div>
                <span className="text-neutral-500 block text-[11px]">Lifetime Value:</span>
                <span className="text-base font-bold text-neutral-900">{formatBDT(selectedCustomer.totalSpentBDT)}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-[11px]">Total Purchases:</span>
                <span className="text-base font-bold text-neutral-900">{customerOrders.length} orders</span>
              </div>
            </div>

            {/* Orders List */}
            <div className="space-y-2">
              <span className="font-bold text-neutral-900 text-xs uppercase tracking-wider text-neutral-400 block">
                Orders with Your Storefront
              </span>

              <div className="border border-neutral-200 rounded-xl divide-y divide-neutral-100 overflow-hidden text-xs">
                {customerOrders.map((ord) => (
                  <div key={ord.id} className="p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="font-bold text-neutral-900">{ord.orderNumber || ord.id}</div>
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-neutral-100 text-neutral-700">
                        {ord.status}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-neutral-500 text-[11px]">
                      <span>{new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                      <span className="font-bold text-neutral-900">{formatBDT(ord.total)}</span>
                    </div>

                    <div className="text-[11px] text-neutral-600 truncate">
                      {ord.items?.map(i => `${i.productName} (x${i.quantity})`).join(', ')}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
