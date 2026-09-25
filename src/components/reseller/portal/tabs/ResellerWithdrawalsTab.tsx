'use client';

import React, { useState } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ResellerWithdrawal, WithdrawalStatus } from '@/types/reseller';
import { 
  Wallet, 
  ArrowUpRight, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Plus, 
  X, 
  CreditCard,
  Building,
  Smartphone,
  Loader2,
  FileText
} from 'lucide-react';
import { formatBDT } from '@/lib/formatters';

export function ResellerWithdrawalsTab() {
  const { wallet, withdrawals, requestWithdrawal, isSubmitting } = useReseller();
  const { showToast } = useMarketplace();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<ResellerWithdrawal | null>(null);

  // Form State
  const [amount, setAmount] = useState<number>(1000);
  const [method, setMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [accountType, setAccountType] = useState<'personal' | 'agent'>('personal');
  const [accountNumber, setAccountNumber] = useState('');
  
  // Bank details
  const [bankName, setBankName] = useState('');
  const [branchName, setBranchName] = useState('');
  const [accountHolderName, setAccountHolderName] = useState('');
  const [routingNumber, setRoutingNumber] = useState('');

  const minWithdrawalLimit = 500;

  const handleOpenModal = () => {
    setAmount(Math.min(wallet.availableBalanceBDT, 2000) || 500);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (amount < minWithdrawalLimit) {
      showToast('Validation Error', `Minimum withdrawal amount is ৳${minWithdrawalLimit}`, 'error');
      return;
    }

    if (amount > wallet.availableBalanceBDT) {
      showToast('Insufficient Balance', `Available balance is ৳${wallet.availableBalanceBDT}`, 'error');
      return;
    }

    if (method === 'bank') {
      if (!bankName.trim() || !accountNumber.trim() || !accountHolderName.trim()) {
        showToast('Missing Bank Details', 'Bank name, account number, and holder name are required.', 'error');
        return;
      }
    } else {
      if (!accountNumber.trim()) {
        showToast('Missing Mobile Number', 'Please enter your bKash or Nagad wallet number.', 'error');
        return;
      }
    }

    const accountDetails = method === 'bank' ? {
      bankName: bankName.trim(),
      branchName: branchName.trim(),
      accountHolderName: accountHolderName.trim(),
      accountNumber: accountNumber.trim(),
      routingNumber: routingNumber.trim()
    } : {
      accountNumber: accountNumber.trim(),
      accountType
    };

    const res = await requestWithdrawal({
      amount: Number(amount),
      method,
      accountDetails
    });

    if (res.success) {
      setIsModalOpen(false);
      setAccountNumber('');
      setBankName('');
      setBranchName('');
      setAccountHolderName('');
      setRoutingNumber('');
    }
  };

  const getStatusBadge = (status: WithdrawalStatus | string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'approved':
      case 'processing':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'rejected':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Profit Withdrawals &amp; Payouts</h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            Request earnings payout to your bKash, Nagad, or Bangladeshi commercial bank account
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          disabled={wallet.availableBalanceBDT < minWithdrawalLimit}
          className="inline-flex items-center gap-2 px-4.5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed self-start sm:self-auto shadow-2xs"
        >
          <Plus className="w-4.5 h-4.5" /> Request Payout
        </button>
      </div>

      {/* 3 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
        {/* Available Balance */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Available For Payout
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {formatBDT(wallet.availableBalanceBDT)}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-emerald-600 font-semibold">Cleared profit ready to withdraw</p>
        </div>

        {/* Minimum Withdrawal Limit */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Minimum Withdrawal Limit
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {formatBDT(minWithdrawalLimit)}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium">Standard platform threshold per transaction</p>
        </div>

        {/* Pending Withdrawal */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Pending Disbursal Amount
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-amber-600 tracking-tight leading-none">
              {formatBDT(wallet.pendingBalanceBDT)}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium">Processing via finance network</p>
        </div>
      </div>

      {/* Withdrawals History Table */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl overflow-hidden shadow-xs">
        <div className="p-5 sm:p-6 border-b border-neutral-100 flex items-center justify-between">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">Payout Request History</h2>
          <span className="text-xs sm:text-sm text-neutral-500 font-medium">{withdrawals.length} total records</span>
        </div>

        {withdrawals.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Wallet className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-base font-semibold text-neutral-700">No withdrawal requests submitted</p>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
              Once you have at least ৳500 in your available balance, you can submit a payout request.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9F5] border-b border-[#E6E4E0] text-neutral-500 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="py-4 px-5">Request ID &amp; Date</th>
                  <th className="py-4 px-5 text-right">Amount (BDT)</th>
                  <th className="py-4 px-5">Method</th>
                  <th className="py-4 px-5">Account Destination</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5">Notes &amp; Reference</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {withdrawals.map((wth) => (
                  <tr key={wth.id} className="hover:bg-neutral-50/80 transition-colors">
                    {/* ID & Date */}
                    <td className="py-4.5 sm:py-5 px-5">
                      <div className="font-bold text-sm sm:text-base text-neutral-900 font-mono">{wth.id}</div>
                      <div className="text-xs sm:text-[13px] text-neutral-500 mt-0.5">
                        {new Date(wth.requestedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </div>
                    </td>

                    {/* Amount */}
                    <td className="py-4.5 sm:py-5 px-5 text-right font-extrabold text-sm sm:text-base text-neutral-900">
                      {formatBDT(wth.amountBDT || wth.amount)}
                    </td>

                    {/* Method */}
                    <td className="py-4.5 sm:py-5 px-5">
                      <span className="uppercase font-bold text-neutral-900 text-xs sm:text-sm">
                        {wth.method}
                      </span>
                    </td>

                    {/* Account */}
                    <td className="py-4.5 sm:py-5 px-5 text-neutral-800">
                      {wth.method === 'bank' ? (
                        <div>
                          <div className="font-semibold text-sm text-neutral-900">{wth.accountDetails?.bankName}</div>
                          <div className="text-xs sm:text-[13px] text-neutral-500 font-mono mt-0.5">
                            A/C: {wth.accountDetails?.accountNumber} ({wth.accountDetails?.branchName})
                          </div>
                        </div>
                      ) : (
                        <div>
                          <span className="font-mono font-semibold text-sm text-neutral-900">{wth.accountDetails?.accountNumber}</span>
                          <span className="text-xs text-neutral-400 block capitalize mt-0.5">
                            {wth.accountDetails?.accountType || 'personal'} account
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Status */}
                    <td className="py-4.5 sm:py-5 px-5 text-center">
                      <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border capitalize ${getStatusBadge(wth.status)}`}>
                        {wth.status}
                      </span>
                    </td>

                    {/* Notes & Reference */}
                    <td className="py-4.5 sm:py-5 px-5 text-xs sm:text-[13px] max-w-xs">
                      {wth.transactionId && (
                        <div className="font-mono text-neutral-900 font-bold">
                          TrxID: {wth.transactionId}
                        </div>
                      )}
                      {wth.adminNotes && (
                        <p className="text-neutral-700 line-clamp-1 mt-0.5">{wth.adminNotes}</p>
                      )}
                      {wth.rejectionReason && (
                        <p className="text-rose-600 font-semibold line-clamp-1 mt-0.5">Reason: {wth.rejectionReason}</p>
                      )}
                      {!wth.transactionId && !wth.adminNotes && !wth.rejectionReason && (
                        <span className="text-neutral-400">Under review</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Payout Request Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-xl overflow-hidden p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Request Earnings Payout</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Available: <span className="font-bold text-neutral-900">{formatBDT(wallet.availableBalanceBDT)}</span>
                </p>
              </div>

              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4 text-xs">
              {/* Amount */}
              <div className="space-y-1">
                <label className="font-semibold text-neutral-800">
                  Withdrawal Amount (BDT) *
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 font-bold text-neutral-400">৳</span>
                  <input
                    type="number"
                    min={minWithdrawalLimit}
                    max={wallet.availableBalanceBDT}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full pl-8 pr-3 py-2 bg-white border border-neutral-300 rounded-xl font-bold text-sm focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                  />
                </div>
                <div className="flex justify-between text-[11px] text-neutral-400 pt-0.5">
                  <span>Minimum: ৳{minWithdrawalLimit}</span>
                  <button
                    type="button"
                    onClick={() => setAmount(wallet.availableBalanceBDT)}
                    className="text-neutral-900 font-semibold underline cursor-pointer"
                  >
                    Withdraw All
                  </button>
                </div>
              </div>

              {/* Method Selection */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-800">Payout Method *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bkash', 'nagad', 'bank'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setMethod(m)}
                      className={`p-3 rounded-xl border text-center font-bold text-xs uppercase transition-all cursor-pointer ${
                        method === m
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Method-Specific Fields */}
              {method !== 'bank' ? (
                <div className="space-y-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-800">
                      {method.toUpperCase()} Mobile Wallet Number *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. 01712-345678"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-mono focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-semibold text-neutral-800">Account Type</label>
                    <div className="flex gap-4 pt-1">
                      <label className="flex items-center gap-1.5 text-neutral-700 cursor-pointer">
                        <input
                          type="radio"
                          name="accType"
                          checked={accountType === 'personal'}
                          onChange={() => setAccountType('personal')}
                          className="text-neutral-900 focus:ring-neutral-900"
                        />
                        Personal
                      </label>
                      <label className="flex items-center gap-1.5 text-neutral-700 cursor-pointer">
                        <input
                          type="radio"
                          name="accType"
                          checked={accountType === 'agent'}
                          onChange={() => setAccountType('agent')}
                          className="text-neutral-900 focus:ring-neutral-900"
                        />
                        Agent / Merchant
                      </label>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1 sm:col-span-2">
                      <label className="font-semibold text-neutral-800">Bank Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="e.g. City Bank PLC, BRAC Bank, Dutch-Bangla..."
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-800">Account Holder Name *</label>
                      <input
                        type="text"
                        required
                        placeholder="Name as registered on account"
                        value={accountHolderName}
                        onChange={(e) => setAccountHolderName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-800">Account Number *</label>
                      <input
                        type="text"
                        required
                        placeholder="Commercial A/C Number"
                        value={accountNumber}
                        onChange={(e) => setAccountNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-mono focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-800">Branch Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Banani Branch, Dhaka"
                        value={branchName}
                        onChange={(e) => setBranchName(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="font-semibold text-neutral-800">Routing Number</label>
                      <input
                        type="text"
                        placeholder="9-digit BEFTN Routing No."
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-mono focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-neutral-300 rounded-xl font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-neutral-900 text-white rounded-xl font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  Submit Payout Request
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
