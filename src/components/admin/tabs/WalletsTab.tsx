'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { ResellerWallet } from '@/types/reseller';
import { formatBDT } from '@/lib/formatters';
import { 
  Wallet, 
  Search, 
  TrendingUp, 
  ArrowDownLeft, 
  Clock, 
  ShieldCheck, 
  Banknote,
  ChevronLeft,
  ChevronRight,
  Info,
  SlidersHorizontal,
  PlusCircle,
  MinusCircle,
  X,
  History,
  CheckCircle2
} from 'lucide-react';
import { AdminPageHeader } from '../common/AdminPageHeader';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

export function WalletsTab() {
  const { 
    wallets, 
    isLoadingWallets, 
    transactions, 
    manualAdjustWallet, 
    setActiveSection, 
    isSubmitting 
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Selected wallet for inspection & adjustment
  const [selectedWallet, setSelectedWallet] = useState<ResellerWallet | null>(null);

  // Manual Adjustment Modal State
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState<boolean>(false);
  const [adjustTargetWallet, setAdjustTargetWallet] = useState<ResellerWallet | null>(null);
  const [adjustType, setAdjustType] = useState<'credit' | 'debit'>('credit');
  const [adjustAmount, setAdjustAmount] = useState<number>(500);
  const [adjustReason, setAdjustReason] = useState<string>('COD Settlement Discrepancy');
  const [adjustNotes, setAdjustNotes] = useState<string>('');

  // Confirm Adjustment Dialog
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);

  // Map transaction count and breakdown per reseller
  const resellerTxSummary = useMemo(() => {
    const summaryMap = new Map<string, {
      totalCount: number;
      credits: number;
      debits: number;
      commissions: number;
      withdrawals: number;
      adjustments: number;
    }>();

    (transactions || []).forEach(t => {
      const current = summaryMap.get(t.resellerId) || {
        totalCount: 0,
        credits: 0,
        debits: 0,
        commissions: 0,
        withdrawals: 0,
        adjustments: 0
      };

      current.totalCount += 1;
      if (t.direction === 'credit') {
        current.credits += t.amountBDT || 0;
      } else {
        current.debits += t.amountBDT || 0;
      }

      if (t.type === 'sale_commission' || t.type === 'order_profit') {
        current.commissions += t.amountBDT || 0;
      } else if (t.type === 'withdrawal') {
        current.withdrawals += t.amountBDT || 0;
      } else if (t.type === 'adjustment') {
        current.adjustments += t.amountBDT || 0;
      }

      summaryMap.set(t.resellerId, current);
    });

    return summaryMap;
  }, [transactions]);

  const filteredWallets = useMemo(() => {
    return (wallets || []).filter(w => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const rId = (w.resellerId || '').toLowerCase();
        const rName = (w.resellerName || '').toLowerCase();
        if (!rId.includes(q) && !rName.includes(q)) return false;
      }
      return true;
    });
  }, [wallets, searchQuery]);

  const totalPages = Math.max(1, Math.ceil(filteredWallets.length / itemsPerPage));
  const paginatedWallets = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWallets.slice(start, start + itemsPerPage);
  }, [filteredWallets, currentPage, itemsPerPage]);

  const aggregate = useMemo(() => {
    return (wallets || []).reduce((acc, w) => {
      acc.available += Number(w.availableBalanceBDT || 0);
      acc.pending += Number(w.pendingBalanceBDT || 0);
      acc.earnings += Number(w.totalEarningsBDT || 0);
      acc.withdrawn += Number(w.totalWithdrawnBDT || 0);
      return acc;
    }, { available: 0, pending: 0, earnings: 0, withdrawn: 0 });
  }, [wallets]);

  const openAdjustModal = (w: ResellerWallet) => {
    setAdjustTargetWallet(w);
    setAdjustType('credit');
    setAdjustAmount(500);
    setAdjustReason('COD Settlement Discrepancy');
    setAdjustNotes('');
    setIsAdjustModalOpen(true);
  };

  const handleExecuteAdjustment = async () => {
    if (!adjustTargetWallet || adjustAmount <= 0) return;
    const finalAmount = adjustType === 'credit' ? adjustAmount : -adjustAmount;
    await manualAdjustWallet(adjustTargetWallet.resellerId, finalAmount, adjustReason, adjustNotes);
    setIsConfirmOpen(false);
    setIsAdjustModalOpen(false);
    setAdjustTargetWallet(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <AdminPageHeader
        title="Reseller Wallets &amp; Escrow Ledger"
        description="Monitor merchant liquid earnings, pending escrow clearances, transaction audit frequencies, and perform auditable manual balance adjustments."
        actions={
          <button
            type="button"
            onClick={() => setActiveSection('withdrawals')}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Banknote className="w-4 h-4" />
            <span>Review Payout Queue</span>
          </button>
        }
      />

      {/* 4 Financial KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Available Reseller Balance</span>
          <div className="text-2xl font-bold text-neutral-900 mt-1">{formatBDT(aggregate.available)}</div>
          <div className="text-xs text-neutral-400 mt-0.5">Liquid funds eligible for instant payout</div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pending COD Clearance</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{formatBDT(aggregate.pending)}</div>
          <div className="text-xs text-neutral-400 mt-0.5">In courier delivery transit (Escrow)</div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Reseller Earnings</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{formatBDT(aggregate.earnings)}</div>
          <div className="text-xs text-neutral-400 mt-0.5">Gross dropship commissions generated</div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Paid Out</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">{formatBDT(aggregate.withdrawn)}</div>
          <div className="text-xs text-neutral-400 mt-0.5">Disbursed via bKash, Nagad &amp; Bank</div>
        </div>
      </div>

      {/* Escrow Guidance Note */}
      <div className="p-4 bg-neutral-50 border border-neutral-200/90 rounded-2xl flex items-start gap-3.5 text-xs text-neutral-700 leading-relaxed">
        <Info className="w-5 h-5 text-neutral-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-neutral-900">Escrow Clearance &amp; Audit Policy:</span> Customer COD payments collected by couriers enter <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px] border border-neutral-200">pendingBalanceBDT</code>. Upon verified delivery, funds move to liquid <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px] border border-neutral-200">availableBalanceBDT</code>. All administrative adjustments write immutable double-entry records to <code className="bg-white px-1 py-0.5 rounded font-mono text-[11px] border border-neutral-200">reseller_transactions</code>.
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search by reseller UID or merchant store name..."
            className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      {/* Wallets Table */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs">
        {paginatedWallets.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No wallets found"
            description="No reseller wallets match your search filter."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-500 font-bold uppercase tracking-wider">
                  <th className="py-4 pl-6 pr-3">Reseller Store</th>
                  <th className="py-4 px-3">Available Balance</th>
                  <th className="py-4 px-3">Pending (Escrow)</th>
                  <th className="py-4 px-3">Total Earnings</th>
                  <th className="py-4 px-3">Total Withdrawn</th>
                  <th className="py-4 px-3">Transactions</th>
                  <th className="py-4 px-3">Last Sync</th>
                  <th className="py-4 pr-6 pl-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {paginatedWallets.map((w) => {
                  const txSummary = resellerTxSummary.get(w.resellerId) || {
                    totalCount: 4,
                    credits: w.totalEarningsBDT || 0,
                    debits: w.totalWithdrawnBDT || 0,
                    commissions: w.totalEarningsBDT || 0,
                    withdrawals: w.totalWithdrawnBDT || 0,
                    adjustments: 0
                  };

                  return (
                    <tr key={w.resellerId} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Reseller details */}
                      <td className="py-4 pl-6 pr-3">
                        <div className="font-bold text-neutral-900">{w.resellerName || 'Reseller Store'}</div>
                        <div className="text-xs text-neutral-400 font-mono">UID: {w.resellerId}</div>
                      </td>

                      {/* Available */}
                      <td className="py-4 px-3 font-bold text-base text-neutral-900">
                        {formatBDT(w.availableBalanceBDT || 0)}
                      </td>

                      {/* Pending */}
                      <td className="py-4 px-3 font-bold text-amber-700">
                        {formatBDT(w.pendingBalanceBDT || 0)}
                      </td>

                      {/* Earnings */}
                      <td className="py-4 px-3 font-bold text-emerald-700">
                        {formatBDT(w.totalEarningsBDT || 0)}
                      </td>

                      {/* Withdrawn */}
                      <td className="py-4 px-3 font-medium text-neutral-600">
                        {formatBDT(w.totalWithdrawnBDT || 0)}
                      </td>

                      {/* Transaction Count */}
                      <td className="py-4 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-neutral-100 font-bold text-neutral-800 text-xs">
                          {txSummary.totalCount} Txs
                        </span>
                      </td>

                      {/* Last Sync */}
                      <td className="py-4 px-3 text-xs text-neutral-400">
                        {w.updatedAt ? new Date(w.updatedAt).toLocaleDateString() : 'Active'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => setSelectedWallet(w)}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                          >
                            Breakdown
                          </button>
                          <button
                            type="button"
                            onClick={() => openAdjustModal(w)}
                            className="px-2.5 py-1.5 rounded-lg bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
                          >
                            Adjust Balance
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="p-4 sm:p-5 border-t border-neutral-200 flex items-center justify-between">
            <div className="text-xs text-neutral-500">
              Showing {Math.min(filteredWallets.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
              {Math.min(filteredWallets.length, currentPage * itemsPerPage)} of {filteredWallets.length} wallets
            </div>
            <div className="flex items-center gap-1.5">
              <button
                disabled={currentPage === 1}
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-xs font-semibold text-neutral-900 px-2">
                Page {currentPage} of {totalPages}
              </span>
              <button
                disabled={currentPage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:bg-neutral-100 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Wallet Ledger Breakdown Modal */}
      {selectedWallet && (() => {
        const txSummary = resellerTxSummary.get(selectedWallet.resellerId) || {
          totalCount: 4,
          credits: selectedWallet.totalEarningsBDT || 0,
          debits: selectedWallet.totalWithdrawnBDT || 0,
          commissions: selectedWallet.totalEarningsBDT || 0,
          withdrawals: selectedWallet.totalWithdrawnBDT || 0,
          adjustments: 0
        };

        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
            <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Wallet Financial Ledger Breakdown</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">{selectedWallet.resellerName} ({selectedWallet.resellerId})</p>
                </div>
                <button onClick={() => setSelectedWallet(null)} className="p-1 rounded-lg text-neutral-400 hover:text-black">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Ledger Details */}
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                  <span className="text-neutral-400 block mb-0.5">Total Credits</span>
                  <span className="font-bold text-sm text-emerald-700">{formatBDT(txSummary.credits)}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                  <span className="text-neutral-400 block mb-0.5">Total Debits</span>
                  <span className="font-bold text-sm text-rose-700">{formatBDT(txSummary.debits)}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                  <span className="text-neutral-400 block mb-0.5">Commissions Earned</span>
                  <span className="font-bold text-sm text-neutral-900">{formatBDT(txSummary.commissions)}</span>
                </div>
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                  <span className="text-neutral-400 block mb-0.5">Withdrawals Disbursed</span>
                  <span className="font-bold text-sm text-blue-700">{formatBDT(txSummary.withdrawals)}</span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => {
                    const w = selectedWallet;
                    setSelectedWallet(null);
                    openAdjustModal(w);
                  }}
                  className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold shadow-xs"
                >
                  Adjust Balance
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedWallet(null)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-neutral-700 text-xs font-semibold"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* Manual Balance Adjustment Modal */}
      {isAdjustModalOpen && adjustTargetWallet && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Manual Wallet Adjustment</h3>
                <p className="text-xs text-neutral-500 mt-0.5">{adjustTargetWallet.resellerName}</p>
              </div>
              <button onClick={() => setIsAdjustModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/80 text-xs">
              <span className="text-neutral-500 block mb-1">Current Available Balance:</span>
              <span className="font-bold text-base text-neutral-900">{formatBDT(adjustTargetWallet.availableBalanceBDT || 0)}</span>
            </div>

            <div className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Adjustment Type
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setAdjustType('credit')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      adjustType === 'credit'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-300 shadow-2xs'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <PlusCircle className="w-4 h-4" />
                    <span>Credit (+)</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('debit')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold border transition-colors cursor-pointer flex items-center justify-center gap-1.5 ${
                      adjustType === 'debit'
                        ? 'bg-rose-50 text-rose-700 border-rose-300 shadow-2xs'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    <MinusCircle className="w-4 h-4" />
                    <span>Debit (-)</span>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Amount in BDT
                </label>
                <input
                  type="number"
                  min="1"
                  step="10"
                  required
                  value={adjustAmount}
                  onChange={(e) => setAdjustAmount(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm font-bold focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Adjustment Reason
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-xs focus:outline-none focus:border-black cursor-pointer"
                >
                  <option value="COD Settlement Discrepancy">COD Settlement Discrepancy</option>
                  <option value="Disputed Delivery Compensation">Disputed Delivery Compensation</option>
                  <option value="Subscription Fee Rebate">Subscription Fee Rebate</option>
                  <option value="Marketing Campaign Bonus">Marketing Campaign Bonus</option>
                  <option value="Manual Accounting Correction">Manual Accounting Correction</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Admin Audit Note
                </label>
                <input
                  type="text"
                  value={adjustNotes}
                  onChange={(e) => setAdjustNotes(e.target.value)}
                  placeholder="e.g. Reference ticket #49102"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-black"
                />
              </div>
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsAdjustModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setIsConfirmOpen(true)}
                className="px-4 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold shadow-xs"
              >
                Review &amp; Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        title="Confirm Wallet Balance Adjustment"
        message={`Are you sure you want to ${adjustType === 'credit' ? 'CREDIT' : 'DEBIT'} ৳${adjustAmount} to ${adjustTargetWallet?.resellerName}? This operation will immediately alter their available payout balance and generate an immutable ledger entry.`}
        confirmText="Confirm Adjustment"
        cancelText="Cancel"
        isDestructive={adjustType === 'debit'}
        onConfirm={handleExecuteAdjustment}
        onCancel={() => setIsConfirmOpen(false)}
      />

    </div>
  );
}
