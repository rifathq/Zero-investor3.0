'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { 
  History, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CheckCircle2, 
  Clock, 
  XCircle,
  FileText
} from 'lucide-react';

export function TransactionsTab() {
  const { transactions, isLoadingTransactions } = useAdmin();
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');

  const filteredTransactions = useMemo(() => {
    return (transactions || []).filter(t => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const rId = (t.resellerId || '').toLowerCase();
        const id = (t.id || '').toLowerCase();
        const ref = (t.referenceId || '').toLowerCase();
        const desc = (t.description || '').toLowerCase();
        if (!rId.includes(q) && !id.includes(q) && !ref.includes(q) && !desc.includes(q)) return false;
      }
      if (typeFilter !== 'all') {
        if (t.type !== typeFilter) return false;
      }
      return true;
    });
  }, [transactions, searchQuery, typeFilter]);

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-4 sm:p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-[#111111]">Platform Financial Ledger &amp; Transactions</h2>
            <p className="text-xs text-neutral-500">
              Double-entry transaction audit records from reseller_transactions in Cloud Firestore.
            </p>
          </div>
          <div className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#F7F6F3] border border-[#E6E4E0] text-neutral-700 self-start sm:self-auto">
            {filteredTransactions.length} {filteredTransactions.length === 1 ? 'Record' : 'Records'}
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="relative">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search reseller UID, reference, TrxID..."
              className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-[#E6E4E0] bg-[#F7F6F3] focus:bg-white focus:outline-none focus:border-black transition-colors"
            />
          </div>

          <div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-[#E6E4E0] bg-[#F7F6F3] focus:bg-white focus:outline-none font-medium text-neutral-800"
            >
              <option value="all">All Transaction Types</option>
              <option value="order_profit">Order Profit Credit</option>
              <option value="withdrawal">Withdrawal Disbursement</option>
              <option value="subscription_fee">Subscription Upgrade</option>
              <option value="adjustment">System Adjustment</option>
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl shadow-xs overflow-hidden">
        {isLoadingTransactions ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            Loading platform ledger from Firestore...
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-16 text-center space-y-2">
            <History className="w-8 h-8 text-neutral-300 mx-auto" />
            <p className="text-xs font-semibold text-neutral-700">No ledger transactions recorded</p>
            <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
              Transactions are written when orders settle, withdrawals disburse, or subscription plans change.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#F7F6F3] border-b border-[#E6E4E0] text-neutral-600 font-semibold">
                <tr>
                  <th className="py-3 px-4">Transaction ID</th>
                  <th className="py-3 px-4">Reseller</th>
                  <th className="py-3 px-4">Type &amp; Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Reference</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredTransactions.map((tx) => {
                  const isCredit = tx.direction === 'credit';
                  return (
                    <tr key={tx.id} className="hover:bg-[#FAF9F5] transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-neutral-900 select-all">
                        #{tx.id?.substring(0, 10)}
                      </td>

                      <td className="py-3.5 px-4 font-mono text-neutral-700 select-all">
                        {tx.resellerId?.substring(0, 14)}...
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="font-semibold text-neutral-900 capitalize">
                          {tx.type}
                        </div>
                        {tx.description && (
                          <div className="text-[11px] text-neutral-500">{tx.description}</div>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 font-bold ${
                          isCredit ? 'text-emerald-700' : 'text-neutral-900'
                        }`}>
                          {isCredit ? '+' : '-'}৳{Number(tx.amountBDT || 0).toLocaleString()}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-mono text-[11px] text-neutral-600 select-all">
                        {tx.referenceId || 'N/A'}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          tx.status === 'completed' 
                            ? 'bg-emerald-100 text-emerald-800' 
                            : 'bg-amber-100 text-amber-800'
                        }`}>
                          {tx.status || 'completed'}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right text-neutral-500 text-[11px]">
                        {tx.createdAt ? new Date(tx.createdAt).toLocaleString() : 'Recent'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
