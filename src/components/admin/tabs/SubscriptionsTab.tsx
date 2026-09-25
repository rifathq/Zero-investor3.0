'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { ResellerSubscription, ResellerPlan } from '@/types/reseller';
import { formatBDT } from '@/lib/formatters';
import { 
  CreditCard, 
  Search, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  Calendar,
  Clock,
  ShieldCheck,
  Zap,
  Info,
  Plus,
  Edit3,
  Trash2,
  Check,
  Sparkles,
  Layers,
  HelpCircle,
  X
} from 'lucide-react';
import { AdminPageHeader } from '../common/AdminPageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

export function SubscriptionsTab() {
  const { 
    subscriptions, 
    isLoadingSubscriptions, 
    verifySubscription, 
    cancelSubscription, 
    plans,
    updatePlan,
    addPlan,
    deletePlan,
    isSubmitting 
  } = useAdmin();

  const [activeSubTab, setActiveSubTab] = useState<'plans' | 'subscribers'>('plans');

  // Subscriber Requests State
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedSub, setSelectedSub] = useState<ResellerSubscription | null>(null);
  const [durationDays, setDurationDays] = useState<number>(30);
  const [cancelReason, setCancelReason] = useState<string>('');
  const [isCancelModalOpen, setIsCancelModalOpen] = useState<boolean>(false);
  const [isVerifyModalOpen, setIsVerifyModalOpen] = useState<boolean>(false);

  // Plans Management State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState<boolean>(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [planFormName, setPlanFormName] = useState<string>('');
  const [planFormPrice, setPlanFormPrice] = useState<number>(999);
  const [planFormBilling, setPlanFormBilling] = useState<string>('Monthly');
  const [planFormDuration, setPlanFormDuration] = useState<number>(30);
  const [planFormDescription, setPlanFormDescription] = useState<string>('');
  const [planFormFeatures, setPlanFormFeatures] = useState<string>('');
  const [planFormBadge, setPlanFormBadge] = useState<string>('');
  const [planFormIsActive, setPlanFormIsActive] = useState<boolean>(true);

  // Plan Price Change Confirmation Modal
  const [isPriceConfirmOpen, setIsPriceConfirmOpen] = useState<boolean>(false);
  const [pendingPlanPayload, setPendingPlanPayload] = useState<any>(null);

  // Filtered Subscribers
  const filteredSubs = useMemo(() => {
    return (subscriptions || []).filter(s => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const rId = (s.resellerId || '').toLowerCase();
        const rName = (s.resellerName || '').toLowerCase();
        const plan = (s.plan || s.planName || '').toLowerCase();
        const trx = (s.paymentTrxId || s.transactionId || '').toLowerCase();
        if (!rId.includes(q) && !rName.includes(q) && !plan.includes(q) && !trx.includes(q)) return false;
      }
      if (statusFilter !== 'all') {
        if (s.status !== statusFilter) return false;
      }
      return true;
    });
  }, [subscriptions, searchQuery, statusFilter]);

  // Open Plan Modal
  const openAddPlanModal = () => {
    setEditingPlanId(null);
    setPlanFormName('Pro Plus');
    setPlanFormPrice(1499);
    setPlanFormBilling('Monthly');
    setPlanFormDuration(30);
    setPlanFormDescription('Advanced features for high-volume dropshipping operations.');
    setPlanFormFeatures('Custom Domain Support\nPriority Logistics Dispatch\nDedicated Support Hotline\nUnlimited Landing Pages');
    setPlanFormBadge('New');
    setPlanFormIsActive(true);
    setIsPlanModalOpen(true);
  };

  const openEditPlanModal = (p: ResellerPlan) => {
    setEditingPlanId(p.id);
    setPlanFormName(p.name);
    setPlanFormPrice(p.priceBDT);
    setPlanFormBilling(p.billingPeriod || 'Monthly');
    setPlanFormDuration(p.durationDays || 30);
    setPlanFormDescription(p.description);
    setPlanFormFeatures((p.features || []).join('\n'));
    setPlanFormBadge(p.badge || '');
    setPlanFormIsActive(p.isActive !== false);
    setIsPlanModalOpen(true);
  };

  // Submit Plan Form
  const handleSavePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const featureArray = planFormFeatures
      .split('\n')
      .map(s => s.trim())
      .filter(Boolean);

    const payload: Partial<ResellerPlan> = {
      name: planFormName.trim(),
      priceBDT: planFormPrice,
      billingPeriod: planFormBilling.trim(),
      durationDays: planFormDuration,
      description: planFormDescription.trim(),
      features: featureArray,
      badge: planFormBadge.trim() || undefined,
      isActive: planFormIsActive
    };

    // Check if price changed on an existing plan to prompt confirmation
    if (editingPlanId) {
      const existing = (plans || []).find(p => p.id === editingPlanId);
      if (existing && existing.priceBDT !== planFormPrice) {
        setPendingPlanPayload(payload);
        setIsPriceConfirmOpen(true);
        return;
      }
      updatePlan(editingPlanId, payload);
    } else {
      const newPlan: ResellerPlan = {
        id: `plan-${Date.now()}`,
        name: payload.name || 'New Tier',
        priceBDT: payload.priceBDT || 0,
        billingPeriod: payload.billingPeriod || 'Monthly',
        durationDays: payload.durationDays || 30,
        description: payload.description || '',
        features: payload.features || [],
        badge: payload.badge,
        isActive: payload.isActive
      };
      addPlan(newPlan);
    }

    setIsPlanModalOpen(false);
  };

  const confirmPriceChange = () => {
    if (editingPlanId && pendingPlanPayload) {
      updatePlan(editingPlanId, pendingPlanPayload);
      setIsPriceConfirmOpen(false);
      setIsPlanModalOpen(false);
      setPendingPlanPayload(null);
    }
  };

  const handleOpenVerifyModal = (sub: ResellerSubscription) => {
    setSelectedSub(sub);
    setDurationDays(sub.durationDays || 30);
    setIsVerifyModalOpen(true);
  };

  const handleConfirmVerify = async () => {
    if (!selectedSub) return;
    await verifySubscription(selectedSub.id, durationDays);
    setIsVerifyModalOpen(false);
    setSelectedSub(null);
  };

  const handleOpenCancelModal = (sub: ResellerSubscription) => {
    setSelectedSub(sub);
    setCancelReason('');
    setIsCancelModalOpen(true);
  };

  const handleConfirmCancel = async () => {
    if (!selectedSub) return;
    await cancelSubscription(selectedSub.id, cancelReason.trim() || 'Payment not verified by administrator.');
    setIsCancelModalOpen(false);
    setSelectedSub(null);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <AdminPageHeader
        title="Subscriptions &amp; Reseller Membership"
        description="Configure reseller partner tiers, pricing, privileges, and audit manual bKash/Nagad subscription upgrade requests."
        actions={
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={openAddPlanModal}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-sm font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Plan</span>
            </button>
          </div>
        }
      />

      {/* Tabs Switcher: Plans vs Subscribers */}
      <div className="flex items-center gap-2 border-b border-neutral-200">
        <button
          onClick={() => setActiveSubTab('plans')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'plans'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <Zap className="w-4 h-4" />
          <span>Membership Tiers &amp; Pricing ({plans?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('subscribers')}
          className={`pb-3 text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeSubTab === 'subscribers'
              ? 'border-neutral-900 text-neutral-900'
              : 'border-transparent text-neutral-500 hover:text-neutral-800'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Subscriber Upgrades &amp; History ({subscriptions?.length || 0})</span>
        </button>
      </div>

      {activeSubTab === 'plans' ? (
        /* TAB 1: MEMBERSHIP PLANS MANAGEMENT */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-neutral-900">
                Reseller Membership Tiers
              </h2>
              <p className="text-sm text-neutral-500 mt-0.5">
                Manage features, pricing, and benefits offered to resellers on Zero Invest.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {(plans || []).map((plan) => (
              <div 
                key={plan.id}
                className="bg-white border border-neutral-200/90 rounded-3xl p-6 sm:p-7 shadow-xs hover:shadow-sm transition-all flex flex-col justify-between space-y-6 relative"
              >
                <div>
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-xl font-bold text-neutral-900">
                      {plan.name}
                    </h3>
                    {plan.badge && (
                      <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-neutral-900 text-white shadow-2xs">
                        {plan.badge}
                      </span>
                    )}
                  </div>

                  <p className="text-xs text-neutral-500 mt-2 leading-relaxed min-h-[36px]">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="mt-5 pb-5 border-b border-neutral-100 flex items-baseline gap-1.5">
                    <span className="text-3xl font-black text-neutral-900">
                      {plan.priceBDT === 0 ? 'Free' : formatBDT(plan.priceBDT)}
                    </span>
                    <span className="text-xs font-semibold text-neutral-500">
                      /{plan.billingPeriod || 'Monthly'}
                    </span>
                  </div>

                  {/* Features list */}
                  <div className="mt-5 space-y-2.5">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-neutral-400 block">
                      Included Privileges:
                    </span>
                    {(plan.features || []).map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2.5 text-xs text-neutral-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Plan Controls */}
                <div className="pt-4 border-t border-neutral-100 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2 h-2 rounded-full ${plan.isActive !== false ? 'bg-emerald-500' : 'bg-neutral-400'}`} />
                    <span className="text-xs text-neutral-500">
                      {plan.isActive !== false ? 'Active on Storefront' : 'Hidden'}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => openEditPlanModal(plan)}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition-colors cursor-pointer shadow-2xs"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-neutral-600" />
                    <span>Edit Tier</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* TAB 2: SUBSCRIBER UPGRADES & AUDIT */
        <div className="space-y-6">
          
          {/* Security Banner */}
          <div className="p-4 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex items-start gap-3.5 text-xs text-blue-900 leading-relaxed">
            <Info className="w-5 h-5 text-blue-700 shrink-0 mt-0.5" />
            <div>
              <strong className="font-bold">Manual Payout &amp; Upgrade Verification:</strong> Resellers who upgrade to Pro or Enterprise VIP submit bKash / Nagad Transaction IDs (TrxID). Once you verify receipt of funds in your merchant statements, click <strong>Verify &amp; Activate</strong> to immediately unlock their tier privileges.
            </div>
          </div>

          {/* Search & Status Filters */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by reseller UID, name, plan, or TrxID..."
                className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
              />
            </div>

            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
              >
                <option value="all">All Subscription Statuses</option>
                <option value="active">Active Tiers</option>
                <option value="pending_payment">Pending Payment Verification</option>
                <option value="cancelled">Cancelled</option>
                <option value="expired">Expired</option>
              </select>
            </div>
          </div>

          {/* Subscribers Table */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs">
            {filteredSubs.length === 0 ? (
              <EmptyState
                icon={CreditCard}
                title="No subscription records found"
                description="No reseller subscription records match the selected query or filter."
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold uppercase tracking-wider text-neutral-500">
                      <th className="py-4 pl-6 pr-4">Reseller</th>
                      <th className="py-4 px-4">Membership Plan</th>
                      <th className="py-4 px-4">Price</th>
                      <th className="py-4 px-4">Payment TrxID</th>
                      <th className="py-4 px-4">Valid Through</th>
                      <th className="py-4 px-4">Status</th>
                      <th className="py-4 pr-6 pl-4 text-right">Verification Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {filteredSubs.map((sub) => (
                      <tr key={sub.id} className="hover:bg-neutral-50/70 transition-colors">
                        <td className="py-4 pl-6 pr-4">
                          <div className="font-bold text-neutral-900">
                            {sub.resellerName || sub.resellerId}
                          </div>
                          <div className="text-xs text-neutral-400">
                            {sub.resellerEmail || `ID: ${sub.resellerId?.slice(0, 12)}...`}
                          </div>
                        </td>

                        <td className="py-4 px-4 font-semibold text-neutral-800">
                          {sub.planName || sub.plan}
                        </td>

                        <td className="py-4 px-4 font-bold text-neutral-900">
                          {formatBDT(sub.priceBDT || 0)}
                        </td>

                        <td className="py-4 px-4">
                          {sub.transactionId || sub.paymentTrxId ? (
                            <span className="font-mono text-xs font-bold text-neutral-800 bg-neutral-100 px-2 py-1 rounded border border-neutral-200 select-all">
                              {sub.transactionId || sub.paymentTrxId}
                            </span>
                          ) : (
                            <span className="text-xs text-neutral-400">N/A (Free tier)</span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-xs text-neutral-600">
                          {sub.expiryDate ? new Date(sub.expiryDate).toLocaleDateString() : 'Lifetime'}
                        </td>

                        <td className="py-4 px-4">
                          <StatusBadge status={sub.status} />
                        </td>

                        <td className="py-4 pr-6 pl-4 text-right">
                          {sub.status === 'pending_payment' ? (
                            <div className="flex items-center justify-end gap-2">
                              <button
                                type="button"
                                onClick={() => handleOpenVerifyModal(sub)}
                                className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                              >
                                Verify &amp; Activate
                              </button>
                              <button
                                type="button"
                                onClick={() => handleOpenCancelModal(sub)}
                                className="px-2.5 py-1.5 rounded-lg border border-neutral-200 hover:bg-rose-50 hover:text-rose-700 text-neutral-600 text-xs font-semibold transition-colors cursor-pointer"
                              >
                                Reject
                              </button>
                            </div>
                          ) : (
                            <span className="text-xs text-neutral-400 font-medium">
                              Verified
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* =========================================================================
          MODAL: ADD / EDIT SUBSCRIPTION PLAN
         ========================================================================= */}
      {isPlanModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl max-w-xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="text-xl font-bold text-neutral-900 tracking-tight">
                  {editingPlanId ? 'Edit Membership Plan' : 'Add New Membership Plan'}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Configure reseller tier pricing, duration, and feature privileges.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsPlanModalOpen(false)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePlanSubmit} className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Plan Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Plan Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={planFormName}
                    onChange={(e) => setPlanFormName(e.target.value)}
                    placeholder="e.g. Pro Partner, Elite VIP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Price */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Price in BDT (৳) *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-500 text-sm font-bold">৳</span>
                    <input
                      type="number"
                      min="0"
                      required
                      value={planFormPrice}
                      onChange={(e) => setPlanFormPrice(Number(e.target.value))}
                      className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm font-bold focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>

                {/* Billing Cycle */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Billing Cycle
                  </label>
                  <select
                    value={planFormBilling}
                    onChange={(e) => setPlanFormBilling(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors cursor-pointer"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly (90 Days)</option>
                    <option value="Yearly">Yearly (365 Days)</option>
                    <option value="Lifetime">Lifetime Access</option>
                  </select>
                </div>

                {/* Duration in Days */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Duration in Days
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={planFormDuration}
                    onChange={(e) => setPlanFormDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Badge/Label */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Badge / Tag (Optional)
                  </label>
                  <input
                    type="text"
                    value={planFormBadge}
                    onChange={(e) => setPlanFormBadge(e.target.value)}
                    placeholder="e.g. Most Popular, Recommended, Enterprise"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Description */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Short Description
                  </label>
                  <input
                    type="text"
                    value={planFormDescription}
                    onChange={(e) => setPlanFormDescription(e.target.value)}
                    placeholder="Brief summary of who this plan is tailored for..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                {/* Features */}
                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Plan Privileges &amp; Features (One per line)
                  </label>
                  <textarea
                    rows={4}
                    value={planFormFeatures}
                    onChange={(e) => setPlanFormFeatures(e.target.value)}
                    placeholder="Unlimited Storefront Landing Pages\nCustom Domain Connection\nPriority Payouts within 24h"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              {/* Active Toggle */}
              <div className="flex items-center gap-3 p-3.5 bg-neutral-50 border border-neutral-200 rounded-xl">
                <input
                  type="checkbox"
                  id="planIsActive"
                  checked={planFormIsActive}
                  onChange={(e) => setPlanFormIsActive(e.target.checked)}
                  className="w-4 h-4 rounded text-neutral-900 focus:ring-black cursor-pointer"
                />
                <label htmlFor="planIsActive" className="text-xs font-semibold text-neutral-800 cursor-pointer">
                  Plan is Active and Visible to Resellers for Upgrade
                </label>
              </div>

              {/* Controls */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setIsPlanModalOpen(false)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-neutral-300 hover:bg-neutral-100 text-neutral-700 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-neutral-900 hover:bg-black text-white shadow-xs transition-colors cursor-pointer"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Pricing Change Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isPriceConfirmOpen}
        title="Confirm Plan Pricing Change"
        message={`You are modifying the price of "${planFormName}" to ${formatBDT(planFormPrice)}. This will affect all new subscribers upon renewal. Do you wish to proceed?`}
        confirmText="Confirm Price Update"
        variant="warning"
        onConfirm={confirmPriceChange}
        onCancel={() => setIsPriceConfirmOpen(false)}
      />

      {/* Verify Subscription Modal */}
      {isVerifyModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Verify Reseller Subscription</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Confirm receipt of ৳{selectedSub.priceBDT} via mobile banking.
                </p>
              </div>
              <button onClick={() => setIsVerifyModalOpen(false)} className="p-1 text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200 space-y-2 text-xs">
              <div className="flex justify-between">
                <span className="text-neutral-500">Reseller:</span>
                <span className="font-bold text-neutral-900">{selectedSub.resellerName || selectedSub.resellerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Plan:</span>
                <span className="font-bold text-neutral-900">{selectedSub.planName || selectedSub.plan}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">Amount:</span>
                <span className="font-bold text-neutral-900">{formatBDT(selectedSub.priceBDT)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-neutral-500">TrxID:</span>
                <span className="font-mono font-bold text-neutral-900 bg-neutral-200/80 px-1.5 py-0.5 rounded">{selectedSub.transactionId || selectedSub.paymentTrxId || 'N/A'}</span>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800">
                Grant Membership Duration (Days)
              </label>
              <input
                type="number"
                min="1"
                value={durationDays}
                onChange={(e) => setDurationDays(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50 text-sm font-bold focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsVerifyModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 text-neutral-700"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmVerify}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs"
              >
                Activate Membership
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Subscription Modal */}
      {isCancelModalOpen && selectedSub && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl max-w-md w-full border border-neutral-200 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Reject / Cancel Subscription</h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  State the reason for not verifying this upgrade payment.
                </p>
              </div>
              <button onClick={() => setIsCancelModalOpen(false)} className="p-1 text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-bold text-neutral-800">
                Cancellation Reason
              </label>
              <textarea
                rows={3}
                value={cancelReason}
                onChange={(e) => setCancelReason(e.target.value)}
                placeholder="e.g. Transaction ID could not be verified on bKash merchant statement."
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 text-xs focus:outline-none focus:border-black"
              />
            </div>

            <div className="flex justify-end gap-2.5 pt-2 border-t border-neutral-100">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold rounded-xl border border-neutral-300 text-neutral-700"
              >
                Back
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="px-5 py-2 text-xs font-bold rounded-xl bg-rose-600 hover:bg-rose-700 text-white shadow-xs"
              >
                Confirm Cancellation
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
