'use client';

import React, { useState } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ResellerPlan } from '@/types/reseller';
import { 
  Crown, 
  Check, 
  Calendar, 
  AlertCircle, 
  CreditCard, 
  ArrowRight, 
  ShieldCheck, 
  X,
  Loader2 
} from 'lucide-react';
import { formatBDT } from '@/lib/formatters';

export function ResellerSubscriptionTab() {
  const { subscription, plans, changeSubscription, isSubmitting } = useReseller();
  const { showToast } = useMarketplace();

  const [selectedPlanForUpgrade, setSelectedPlanForUpgrade] = useState<ResellerPlan | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<'bkash' | 'nagad' | 'bank'>('bkash');
  const [trxId, setTrxId] = useState('');

  const currentPlanId = subscription?.plan || 'pro';

  const daysRemaining = subscription?.expiryDate 
    ? Math.max(0, Math.ceil((new Date(subscription.expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : 30;

  const handleSelectPlan = (plan: ResellerPlan) => {
    if (plan.id === currentPlanId) {
      showToast('Current Plan', `You are already on the ${plan.name} plan.`, 'info');
      return;
    }

    if (plan.priceBDT === 0) {
      // Free downgrade immediately
      changeSubscription(plan.id, 'free');
    } else {
      setSelectedPlanForUpgrade(plan);
      setTrxId('');
    }
  };

  const handleUpgradeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPlanForUpgrade) return;

    if (!trxId.trim()) {
      showToast('Validation Error', 'Please enter your payment Transaction ID (TrxID)', 'error');
      return;
    }

    const success = await changeSubscription(selectedPlanForUpgrade.id, paymentMethod, trxId.trim());
    if (success) {
      setSelectedPlanForUpgrade(null);
    }
  };

  return (
    <div className="space-y-8 lg:space-y-10 w-full">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Reseller Membership &amp; Plans</h1>
        <p className="text-sm text-neutral-500 mt-1.5">
          Review your current active subscription and upgrade to access higher listing limits and wholesale perks
        </p>
      </div>

      {/* Current Active Plan Card */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold shadow-2xs">
              <Crown className="w-7 h-7" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-neutral-400">Current Membership</span>
                <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md capitalize">
                  {subscription?.status === 'active' ? 'Active' : 'Payment Verification Pending'}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-bold text-neutral-900 mt-1">
                {subscription?.planName || 'Pro Partner'}
              </h2>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <div className="text-2xl sm:text-3xl lg:text-4xl font-black text-neutral-900">
              {formatBDT(subscription?.priceBDT || 999)}
              <span className="text-xs sm:text-sm font-normal text-neutral-400"> / month</span>
            </div>
            <p className="text-xs sm:text-sm text-neutral-500 font-mono mt-0.5">
              Cycle: {subscription?.billingCycle || 'Monthly'}
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-neutral-100 text-sm">
          <div className="p-4 bg-neutral-50 rounded-xl">
            <span className="text-neutral-400 block text-xs">Valid Until</span>
            <span className="font-bold text-neutral-900 text-sm sm:text-base mt-0.5 block">
              {subscription?.expiryDate 
                ? new Date(subscription.expiryDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                : '30 Days Remaining'}
            </span>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl">
            <span className="text-neutral-400 block text-xs">Days Remaining</span>
            <span className="font-bold text-neutral-900 text-sm sm:text-base mt-0.5 block">{daysRemaining} Days</span>
          </div>

          <div className="p-4 bg-neutral-50 rounded-xl">
            <span className="text-neutral-400 block text-xs">Payment Reference</span>
            <span className="font-mono font-bold text-neutral-900 text-sm sm:text-base mt-0.5 block">{subscription?.transactionId || 'BK-SUB-994012'}</span>
          </div>
        </div>
      </div>

      {/* Available Plans Comparison */}
      <div className="space-y-5">
        <h3 className="text-lg sm:text-xl font-bold text-neutral-900">Select or Upgrade Membership Plan</h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {plans.map((plan) => {
            const isCurrent = plan.id === currentPlanId;

            return (
              <div
                key={plan.id}
                className={`bg-white rounded-2xl p-6 sm:p-7 border flex flex-col justify-between space-y-6 transition-all relative ${
                  isCurrent 
                    ? 'border-neutral-900 ring-2 ring-neutral-900/10 shadow-md' 
                    : 'border-[#E6E4E0] hover:border-neutral-400 shadow-xs'
                }`}
              >
                {/* Plan header */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-lg sm:text-xl font-bold text-neutral-900">{plan.name}</h4>
                    {plan.badge && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 bg-amber-50 px-2.5 py-1 rounded-md border border-amber-200/60">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs sm:text-sm text-neutral-500 leading-relaxed min-h-[40px]">
                    {plan.description}
                  </p>

                  <div className="pt-2">
                    <span className="text-3xl sm:text-4xl font-black text-neutral-900">
                      {plan.priceBDT === 0 ? 'Free' : formatBDT(plan.priceBDT)}
                    </span>
                    {plan.priceBDT > 0 && (
                      <span className="text-xs sm:text-sm text-neutral-400 font-normal"> / month</span>
                    )}
                  </div>

                  <ul className="space-y-2.5 pt-4 border-t border-neutral-100 text-xs sm:text-sm">
                    {plan.features.map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2.5 text-neutral-700">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Plan Action CTA */}
                <div>
                  <button
                    type="button"
                    onClick={() => handleSelectPlan(plan)}
                    disabled={isCurrent}
                    className={`w-full py-3 sm:py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                      isCurrent
                        ? 'bg-neutral-100 text-neutral-400 cursor-default'
                        : 'bg-neutral-900 text-white hover:bg-neutral-800 shadow-2xs'
                    }`}
                  >
                    {isCurrent ? 'Current Active Plan' : plan.ctaText || 'Select Plan'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Upgrade / Payment Modal */}
      {selectedPlanForUpgrade && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-lg w-full border border-neutral-200 shadow-xl overflow-hidden p-6 space-y-5 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-3">
              <div>
                <h3 className="text-base font-bold text-neutral-900">
                  Upgrade to {selectedPlanForUpgrade.name}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Subscription Fee: <span className="font-bold text-neutral-900">{formatBDT(selectedPlanForUpgrade.priceBDT)}</span> (30 Days)
                </p>
              </div>

              <button
                onClick={() => setSelectedPlanForUpgrade(null)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUpgradeSubmit} className="space-y-4 text-xs">
              {/* Payment Instructions */}
              <div className="p-3.5 bg-neutral-50 rounded-xl border border-neutral-200 space-y-2">
                <span className="font-bold text-neutral-800 uppercase text-[10px] tracking-wider block">
                  Official Merchant Payment Details
                </span>
                <p className="text-neutral-600 leading-relaxed">
                  Send payment of <span className="font-bold text-neutral-900">{formatBDT(selectedPlanForUpgrade.priceBDT)}</span> to our merchant gateway:
                </p>
                <div className="font-mono text-[11px] text-neutral-800 bg-white p-2.5 rounded-lg border border-neutral-200 space-y-0.5">
                  <div>bKash Merchant: <span className="font-bold">01800-000000</span></div>
                  <div>Nagad Merchant: <span className="font-bold">01700-000000</span></div>
                  <div>City Bank PLC: A/C <span className="font-bold">110293847501</span> (Banani Br.)</div>
                </div>
              </div>

              {/* Payment Method Selector */}
              <div className="space-y-1.5">
                <label className="font-semibold text-neutral-800">Payment Gateway *</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['bkash', 'nagad', 'bank'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      onClick={() => setPaymentMethod(m)}
                      className={`p-2.5 rounded-xl border text-center font-bold text-xs uppercase transition-all cursor-pointer ${
                        paymentMethod === m
                          ? 'border-neutral-900 bg-neutral-900 text-white shadow-xs'
                          : 'border-neutral-200 bg-neutral-50 text-neutral-700 hover:bg-neutral-100'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Transaction ID Input */}
              <div className="space-y-1">
                <label className="font-semibold text-neutral-800">
                  Transaction Reference ID (TrxID) *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 9J28A18K2M or BEFTN TrxID"
                  value={trxId}
                  onChange={(e) => setTrxId(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-neutral-300 rounded-xl font-mono focus:ring-1 focus:ring-neutral-900 focus:outline-none"
                />
                <span className="text-[10px] text-neutral-400 block">
                  Found in SMS confirmation after sending payment
                </span>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setSelectedPlanForUpgrade(null)}
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
                  Confirm Upgrade
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
