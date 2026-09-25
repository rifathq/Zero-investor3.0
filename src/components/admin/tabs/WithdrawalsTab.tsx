'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { ResellerWithdrawal } from '@/types/reseller';
import { formatBDT } from '@/lib/formatters';
import { 
  Banknote, 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertCircle, 
  Send, 
  Building, 
  Smartphone,
  CreditCard,
  X,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';
import { AdminPageHeader } from '../common/AdminPageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

export function WithdrawalsTab() {
  const { 
    withdrawals, 
    isLoadingWithdrawals, 
    approveWithdrawal, 
    completeWithdrawal, 
    rejectWithdrawal, 
    isSubmitting 
  } = useAdmin();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Modal states
  const [activeModal, setActiveModal] = useState<{
    type: 'approve' | 'complete' | 'reject';
    withdrawal: ResellerWithdrawal;
  } | null>(null);
  const [modalInput, setModalInput] = useState('');

  const openActionModal = (type: 'approve' | 'complete' | 'reject', withdrawal: ResellerWithdrawal) => {
    setActiveModal({ type, withdrawal });
    setModalInput('');
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalInput('');
  };

  const handleConfirmAction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeModal) return;
    const { type, withdrawal } = activeModal;

    if (type === 'approve') {
      await approveWithdrawal(withdrawal.id, modalInput.trim() || undefined);
    } else if (type === 'complete') {
      if (!modalInput.trim()) return;
      await completeWithdrawal(withdrawal.id, modalInput.trim());
    } else if (type === 'reject') {
      if (!modalInput.trim()) return;
      await rejectWithdrawal(withdrawal.id, modalInput.trim());
    }

    closeModal();
  };

  const filteredWithdrawals = useMemo(() => {
    return (withdrawals || []).filter(w => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = (w.id || '').toLowerCase().includes(q);
        const nameMatch = (w.resellerName || '').toLowerCase().includes(q) || (w.resellerEmail || '').toLowerCase().includes(q);
        const accMatch = (w.accountDetails?.accountNumber || '').toLowerCase().includes(q);
        const trxMatch = (w.transactionId || '').toLowerCase().includes(q);
        if (!idMatch && !nameMatch && !accMatch && !trxMatch) return false;
      }
      if (statusFilter !== 'all') {
        if (w.status !== statusFilter) return false;
      }
      if (methodFilter !== 'all') {
        if (w.method !== methodFilter) return false;
      }
      return true;
    });
  }, [withdrawals, searchQuery, statusFilter, methodFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredWithdrawals.length / itemsPerPage));
  const paginatedWithdrawals = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredWithdrawals.slice(start, start + itemsPerPage);
  }, [filteredWithdrawals, currentPage, itemsPerPage]);

  const pendingTotalBDT = (withdrawals || [])
    .filter(w => w.status === 'Pending')
    .reduce((sum, w) => sum + (w.amountBDT || w.amount || 0), 0);

  const approvedTotalBDT = (withdrawals || [])
    .filter(w => w.status === 'Approved')
    .reduce((sum, w) => sum + (w.amountBDT || w.amount || 0), 0);

  const completedTotalBDT = (withdrawals || [])
    .filter(w => w.status === 'Completed')
    .reduce((sum, w) => sum + (w.amountBDT || w.amount || 0), 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <AdminPageHeader
        title="Payout Queue &amp; Reseller Withdrawals"
        description="Audit reseller wallet profit withdrawal requests, disburse mobile payments via bKash / Nagad / Bank, and log payment reference IDs."
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pending Payout Requests</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{formatBDT(pendingTotalBDT)}</div>
          <div className="text-xs text-neutral-400 mt-0.5">
            {(withdrawals || []).filter(w => w.status === 'Pending').length} requests awaiting clearance
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Approved (Ready for Batch)</span>
          <div className="text-2xl font-bold text-blue-700 mt-1">{formatBDT(approvedTotalBDT)}</div>
          <div className="text-xs text-neutral-400 mt-0.5">
            {(withdrawals || []).filter(w => w.status === 'Approved').length} requests cleared by audit
          </div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Total Disbursed to Date</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{formatBDT(completedTotalBDT)}</div>
          <div className="text-xs text-neutral-400 mt-0.5">
            All successful bKash &amp; BEFTN bank transfers
          </div>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search request #, reseller, phone, TrxID..."
            className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
          >
            <option value="all">All Statuses</option>
            <option value="Pending">Pending Audit</option>
            <option value="Approved">Approved (Ready to Send)</option>
            <option value="Completed">Completed (Disbursed)</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>

        <div>
          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
          >
            <option value="all">All Payment Channels</option>
            <option value="bkash">bKash Mobile Banking</option>
            <option value="nagad">Nagad Mobile Banking</option>
            <option value="bank">Bank Wire / BEFTN</option>
          </select>
        </div>
      </div>

      {/* Withdrawals Table */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs">
        {paginatedWithdrawals.length === 0 ? (
          <EmptyState
            icon={Banknote}
            title="No withdrawal requests found"
            description="No reseller payout requests match the selected search or filters."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-4 pl-6 pr-4">Request #</th>
                  <th className="py-4 px-4">Reseller Store</th>
                  <th className="py-4 px-4">Payout Method</th>
                  <th className="py-4 px-4">Amount (BDT)</th>
                  <th className="py-4 px-4">Account Details</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 pr-6 pl-4 text-right">Disbursement Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {paginatedWithdrawals.map((w) => {
                  const isBkash = w.method === 'bkash';
                  const isNagad = w.method === 'nagad';
                  const isBank = w.method === 'bank';

                  return (
                    <tr key={w.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Request ID & Date */}
                      <td className="py-4 pl-6 pr-4 font-mono font-bold text-neutral-900">
                        <div>#{w.id}</div>
                        <div className="text-xs font-normal text-neutral-400 font-sans">
                          {w.requestedAt ? new Date(w.requestedAt).toLocaleDateString() : 'Recent'}
                        </div>
                      </td>

                      {/* Reseller Name */}
                      <td className="py-4 px-4 font-semibold text-neutral-900">
                        <div>{w.resellerName || w.resellerId}</div>
                        <div className="text-xs text-neutral-400 font-normal">{w.resellerEmail}</div>
                      </td>

                      {/* Channel Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold ${
                          isBkash 
                            ? 'bg-pink-50 text-pink-700 border border-pink-200' 
                            : isNagad 
                            ? 'bg-orange-50 text-orange-700 border border-orange-200' 
                            : 'bg-neutral-100 text-neutral-800 border border-neutral-200'
                        }`}>
                          {isBank ? <Building className="w-3 h-3" /> : <Smartphone className="w-3 h-3" />}
                          <span className="capitalize">{w.method}</span>
                        </span>
                      </td>

                      {/* Amount */}
                      <td className="py-4 px-4 font-bold text-base text-neutral-900">
                        {formatBDT(w.amountBDT || w.amount || 0)}
                      </td>

                      {/* Account Details */}
                      <td className="py-4 px-4 text-xs font-mono">
                        {isBank ? (
                          <div>
                            <div className="font-bold text-neutral-900 font-sans">{w.accountDetails?.bankName || 'Bank'}</div>
                            <div className="text-neutral-500">A/C: {w.accountDetails?.accountNumber}</div>
                          </div>
                        ) : (
                          <div>
                            <div className="font-bold text-neutral-900 select-all">{w.accountDetails?.accountNumber || 'N/A'}</div>
                            <div className="text-neutral-400 uppercase text-[10px] font-sans font-semibold">
                              {w.accountDetails?.accountType || 'Personal'} Wallet
                            </div>
                          </div>
                        )}
                        {w.transactionId && (
                          <div className="text-[10px] text-emerald-700 font-bold mt-0.5">
                            TRX: {w.transactionId}
                          </div>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={w.status} />
                      </td>

                      {/* Action buttons */}
                      <td className="py-4 pr-6 pl-4 text-right">
                        {w.status === 'Pending' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openActionModal('approve', w)}
                              className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                            >
                              Approve
                            </button>
                            <button
                              type="button"
                              onClick={() => openActionModal('reject', w)}
                              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {w.status === 'Approved' && (
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => openActionModal('complete', w)}
                              className="px-3.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                            >
                              <Send className="w-3 h-3" />
                              <span>Disburse (Log TRX)</span>
                            </button>
                            <button
                              type="button"
                              onClick={() => openActionModal('reject', w)}
                              className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 text-xs font-semibold transition-colors cursor-pointer"
                            >
                              Reject
                            </button>
                          </div>
                        )}

                        {w.status === 'Completed' && (
                          <span className="text-xs text-neutral-400 font-medium">
                            Disbursed
                          </span>
                        )}

                        {w.status === 'Rejected' && (
                          <span className="text-xs text-rose-600 font-medium">
                            {w.rejectionReason ? `Reason: ${w.rejectionReason.slice(0, 20)}...` : 'Rejected'}
                          </span>
                        )}
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
              Showing {Math.min(filteredWithdrawals.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
              {Math.min(filteredWithdrawals.length, currentPage * itemsPerPage)} of {filteredWithdrawals.length} payouts
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

      {/* =========================================================================
          ACTION MODAL: APPROVE / DISBURSE / REJECT
         ========================================================================= */}
      {activeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">
                  {activeModal.type === 'approve' && 'Approve Payout Request'}
                  {activeModal.type === 'complete' && 'Complete Disbursement'}
                  {activeModal.type === 'reject' && 'Reject Payout Request'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Request #{activeModal.withdrawal.id} · {formatBDT(activeModal.withdrawal.amountBDT || activeModal.withdrawal.amount || 0)}
                </p>
              </div>
              <button onClick={closeModal} className="p-1 text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Reseller:</span>
                <span className="font-bold text-neutral-900">{activeModal.withdrawal.resellerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Channel:</span>
                <span className="font-bold capitalize text-neutral-900">{activeModal.withdrawal.method}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Account:</span>
                <span className="font-mono font-bold text-neutral-900 select-all">
                  {activeModal.withdrawal.accountDetails?.accountNumber || 'N/A'}
                </span>
              </div>
            </div>

            <form onSubmit={handleConfirmAction} className="space-y-4">
              {activeModal.type === 'complete' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Mobile Banking Transaction ID (TrxID) *
                  </label>
                  <input
                    type="text"
                    required
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    placeholder="e.g. BK-TRX-9988231"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-mono focus:outline-none focus:border-black"
                  />
                </div>
              )}

              {activeModal.type === 'approve' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Audit Notes (Optional)
                  </label>
                  <input
                    type="text"
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    placeholder="e.g. Verified against delivered COD orders."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              )}

              {activeModal.type === 'reject' && (
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Reason for Rejection *
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={modalInput}
                    onChange={(e) => setModalInput(e.target.value)}
                    placeholder="e.g. Incorrect bKash personal wallet number provided."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-black"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2.5 pt-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 text-neutral-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className={`px-5 py-2 text-xs font-bold rounded-xl text-white shadow-xs cursor-pointer ${
                    activeModal.type === 'reject' 
                      ? 'bg-rose-600 hover:bg-rose-700' 
                      : activeModal.type === 'approve' 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-emerald-600 hover:bg-emerald-700'
                  }`}
                >
                  {isSubmitting ? 'Processing...' : 'Confirm Action'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
