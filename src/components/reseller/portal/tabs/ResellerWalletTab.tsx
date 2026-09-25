'use client';

import React, { useState, useMemo } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { 
  Wallet, 
  TrendingUp, 
  ArrowDownLeft, 
  ArrowUpRight, 
  Clock, 
  Search, 
  Filter, 
  CheckCircle, 
  AlertCircle,
  X
} from 'lucide-react';
import { formatBDT } from '@/lib/formatters';

export function ResellerWalletTab() {
  const { wallet, transactions, setActiveSection } = useReseller();

  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchDesc = t.description.toLowerCase().includes(q);
        const matchRef = (t.referenceId || '').toLowerCase().includes(q);
        const matchId = t.id.toLowerCase().includes(q);
        if (!matchDesc && !matchRef && !matchId) return false;
      }

      if (typeFilter !== 'all') {
        if (t.type !== typeFilter) return false;
      }

      return true;
    });
  }, [transactions, searchQuery, typeFilter]);

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Reseller Wallet &amp; Ledger</h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            Real-time balance, earnings escrow, and double-entry financial ledger
          </p>
        </div>

        <button
          onClick={() => setActiveSection('withdrawals')}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-emerald-600 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
        >
          <Wallet className="w-4 h-4" /> Request Payout
        </button>
      </div>

      {/* 5 KPI Wallet Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-5 sm:gap-6">
        {/* Available Balance */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Available Balance
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[30px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {formatBDT(wallet.availableBalanceBDT)}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-emerald-600 font-semibold">Ready for instant payout</p>
        </div>

        {/* Pending COD */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Pending COD Funds
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[30px] font-extrabold text-amber-600 tracking-tight leading-none">
              {formatBDT(wallet.pendingBalanceBDT)}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium">In courier delivery transit</p>
        </div>

        {/* Total Earnings */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Total Earnings
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[30px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {formatBDT(wallet.totalEarningsBDT)}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium">Gross markup accrued</p>
        </div>

        {/* Total Withdrawn */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Total Withdrawn
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[30px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {formatBDT(wallet.totalWithdrawnBDT)}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium">Successfully disbursed</p>
        </div>

        {/* Transaction Count */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Transactions
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[30px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {transactions.length}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium">Recorded ledger entries</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search transactions by reference or description..."
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

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-700 font-medium cursor-pointer"
          >
            <option value="all">All Transaction Types</option>
            <option value="sale_commission">Sale / Profit Commission</option>
            <option value="withdrawal">Withdrawals</option>
            <option value="subscription_fee">Subscription Fee</option>
            <option value="bonus">Bonus Credit</option>
            <option value="adjustment">Manual Adjustment</option>
          </select>
        </div>
      </div>

      {/* Transactions Ledger Table */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl overflow-hidden shadow-xs">
        {filteredTransactions.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Wallet className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-base font-semibold text-neutral-700">No transactions found</p>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
              Earnings from customer orders and withdrawal debits will appear here in the double-entry financial ledger.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9F5] border-b border-[#E6E4E0] text-neutral-500 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="py-4 px-5">Transaction ID &amp; Date</th>
                  <th className="py-4 px-5">Type</th>
                  <th className="py-4 px-5">Description</th>
                  <th className="py-4 px-5">Reference</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Amount (BDT)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* ID & Date */}
                    <td className="py-4.5 sm:py-5 px-5">
                      <div className="font-mono font-bold text-sm sm:text-base text-neutral-900">{tx.id}</div>
                      <div className="text-xs sm:text-[13px] text-neutral-500 mt-0.5">
                        {new Date(tx.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>

                    {/* Type */}
                    <td className="py-4.5 sm:py-5 px-5">
                      <span className="capitalize font-semibold text-sm text-neutral-800">
                        {tx.type.replace('_', ' ')}
                      </span>
                    </td>

                    {/* Description */}
                    <td className="py-4.5 sm:py-5 px-5 text-neutral-800 font-medium text-sm max-w-sm">
                      {tx.description}
                    </td>

                    {/* Reference */}
                    <td className="py-4.5 sm:py-5 px-5 font-mono text-xs sm:text-[13px] text-neutral-500">
                      {tx.referenceId || '—'}
                    </td>

                    {/* Status */}
                    <td className="py-4.5 sm:py-5 px-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold capitalize ${
                        tx.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                          : tx.status === 'pending'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200/60'
                          : 'bg-rose-50 text-rose-700 border border-rose-200/60'
                      }`}>
                        {tx.status}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4.5 sm:py-5 px-5 text-right">
                      <div className={`font-extrabold font-mono text-sm sm:text-base ${
                        tx.direction === 'credit' ? 'text-emerald-600' : 'text-neutral-900'
                      }`}>
                        {tx.direction === 'credit' ? '+' : '-'}{formatBDT(tx.amountBDT)}
                      </div>
                      <span className="text-xs text-neutral-400 uppercase font-mono mt-0.5 inline-block">
                        {tx.direction}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
