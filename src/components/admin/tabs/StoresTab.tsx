'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ResellerStore } from '@/types/reseller';
import { formatBDT } from '@/lib/formatters';
import { 
  Store, 
  Search, 
  ExternalLink, 
  Edit3, 
  Ban, 
  CheckCircle, 
  Package, 
  ShoppingBag, 
  TrendingUp, 
  Calendar,
  X,
  Globe,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { AdminPageHeader } from '../common/AdminPageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { EmptyState } from '../common/EmptyState';

export function StoresTab() {
  const { resellers, isLoadingResellers, updateResellerStatus, updateStore, subscriptions, isSubmitting } = useAdmin();
  const { navigate } = useMarketplace();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  // Edit Store Modal
  const [editingStore, setEditingStore] = useState<ResellerStore | any | null>(null);
  const [formStoreName, setFormStoreName] = useState('');
  const [formTagline, setFormTagline] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formStatus, setFormStatus] = useState<string>('active');

  // Confirm Status Action Dialog
  const [confirmStatusAction, setConfirmStatusAction] = useState<{
    storeId: string;
    storeName: string;
    currentStatus: string;
    targetStatus: string;
  } | null>(null);

  // Store Details Preview Modal
  const [inspectStore, setInspectStore] = useState<ResellerStore | any | null>(null);

  // Helper map for subscriptions
  const storeSubscriptionMap = useMemo(() => {
    const map = new Map<string, string>();
    (subscriptions || []).forEach(s => {
      if (s.resellerId) {
        map.set(s.resellerId, s.plan || s.planName || 'Starter');
      }
    });
    return map;
  }, [subscriptions]);

  const filteredStores = useMemo(() => {
    return (resellers || []).filter(s => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const name = (s.storeName || '').toLowerCase();
        const slug = (s.storeSlug || '').toLowerCase();
        const owner = (s.ownerName || s.resellerId || '').toLowerCase();
        const phone = (s.contactPhone || '').toLowerCase();
        if (!name.includes(q) && !slug.includes(q) && !owner.includes(q) && !phone.includes(q)) {
          return false;
        }
      }
      if (statusFilter !== 'all') {
        const status = s.status || 'active';
        if (status !== statusFilter) return false;
      }
      if (planFilter !== 'all') {
        const plan = storeSubscriptionMap.get(s.resellerId) || 'Starter';
        if (plan.toLowerCase() !== planFilter.toLowerCase()) return false;
      }
      return true;
    });
  }, [resellers, searchQuery, statusFilter, planFilter, storeSubscriptionMap]);

  const totalPages = Math.max(1, Math.ceil(filteredStores.length / itemsPerPage));
  const paginatedStores = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredStores.slice(start, start + itemsPerPage);
  }, [filteredStores, currentPage, itemsPerPage]);

  const openEditModal = (store: any) => {
    setEditingStore(store);
    setFormStoreName(store.storeName || '');
    setFormTagline(store.tagline || '');
    setFormPhone(store.contactPhone || '');
    setFormEmail(store.contactEmail || '');
    setFormStatus(store.status || 'active');
  };

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStore) return;
    await updateStore(editingStore.id, {
      storeName: formStoreName.trim(),
      tagline: formTagline.trim(),
      contactPhone: formPhone.trim(),
      contactEmail: formEmail.trim(),
      status: formStatus
    });
    setEditingStore(null);
  };

  const handleConfirmStatusToggle = async () => {
    if (!confirmStatusAction) return;
    await updateResellerStatus(confirmStatusAction.storeId, confirmStatusAction.targetStatus);
    setConfirmStatusAction(null);
  };

  const activeCount = (resellers || []).filter(s => (s.status || 'active') === 'active').length;
  const suspendedCount = (resellers || []).filter(s => s.status === 'suspended').length;
  const pendingCount = (resellers || []).filter(s => s.status === 'pending').length;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <AdminPageHeader
        title="Reseller Storefront Management"
        description="Monitor, audit, and configure custom multi-vendor storefronts operated by independent Zero Invest merchants."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-neutral-200/90 text-neutral-700 shadow-2xs">
              {resellers.length} Registered Storefronts
            </span>
          </div>
        }
      />

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Live &amp; Active Stores</span>
          <div className="text-2xl font-bold text-emerald-700 mt-1">{activeCount} Stores</div>
          <div className="text-xs text-neutral-400 mt-0.5">Publicly accessible with active checkout checkout</div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Suspended Stores</span>
          <div className="text-2xl font-bold text-rose-700 mt-1">{suspendedCount} Stores</div>
          <div className="text-xs text-neutral-400 mt-0.5">Purchases disabled pending compliance review</div>
        </div>

        <div className="bg-white border border-neutral-200/90 rounded-2xl p-5 shadow-xs">
          <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Under Approval</span>
          <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount} Stores</div>
          <div className="text-xs text-neutral-400 mt-0.5">Awaiting initial onboarding verification</div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="relative">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
            placeholder="Search store name, slug, merchant, or phone..."
            className="w-full pl-9.5 pr-4 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
          >
            <option value="all">All Store Statuses</option>
            <option value="active">Active &amp; Operational</option>
            <option value="suspended">Suspended / Frozen</option>
            <option value="pending">Pending Approval</option>
          </select>
        </div>

        <div>
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
            className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
          >
            <option value="all">All Subscription Tiers</option>
            <option value="starter">Starter Plan</option>
            <option value="pro">Pro Plan</option>
            <option value="elite">Elite Plan</option>
          </select>
        </div>
      </div>

      {/* Stores Table */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs">
        {paginatedStores.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No storefronts found"
            description="No reseller stores match your search query or filter criteria."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold uppercase tracking-wider text-neutral-500">
                  <th className="py-4 pl-6 pr-4">Storefront Details</th>
                  <th className="py-4 px-4">Merchant / Reseller</th>
                  <th className="py-4 px-4">Subscription</th>
                  <th className="py-4 px-4">Catalog / Orders</th>
                  <th className="py-4 px-4">Gross Sales</th>
                  <th className="py-4 px-4">Status</th>
                  <th className="py-4 px-4">Created Date</th>
                  <th className="py-4 pr-6 pl-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100 text-sm">
                {paginatedStores.map((s) => {
                  const status = s.status || 'active';
                  const isSuspended = status === 'suspended';
                  const plan = storeSubscriptionMap.get(s.resellerId) || 'Starter';
                  const grossSales = (s.totalSales || 0) * 1450; // realistic BDT value estimate

                  return (
                    <tr key={s.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Store Details */}
                      <td className="py-4 pl-6 pr-4">
                        <div className="font-bold text-neutral-900">{s.storeName}</div>
                        <div className="text-xs text-neutral-500 flex items-center gap-1.5 mt-0.5">
                          <span className="font-mono text-neutral-400">/r/{s.storeSlug}</span>
                          {s.tagline && (
                            <>
                              <span>·</span>
                              <span className="line-clamp-1 text-neutral-400 max-w-[140px]">{s.tagline}</span>
                            </>
                          )}
                        </div>
                      </td>

                      {/* Merchant */}
                      <td className="py-4 px-4 text-xs">
                        <div className="font-semibold text-neutral-800">{s.ownerName || 'Merchant'}</div>
                        <div className="text-neutral-400 font-mono">UID: {s.resellerId?.slice(0, 8) || 'RS-001'}</div>
                      </td>

                      {/* Subscription */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-xs font-bold ${
                          plan.toLowerCase().includes('elite') ? 'bg-purple-50 text-purple-700 border border-purple-200' :
                          plan.toLowerCase().includes('pro') ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                          'bg-neutral-100 text-neutral-700 border border-neutral-200'
                        }`}>
                          {plan}
                        </span>
                      </td>

                      {/* Products & Orders */}
                      <td className="py-4 px-4 text-xs">
                        <div className="font-medium text-neutral-900">{s.totalProducts || 0} products</div>
                        <div className="text-neutral-400">{s.totalSales || 0} orders placed</div>
                      </td>

                      {/* Sales */}
                      <td className="py-4 px-4 font-bold text-emerald-700 text-sm">
                        {formatBDT(grossSales)}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-4">
                        <StatusBadge status={status === 'suspended' ? 'Suspended' : status === 'pending' ? 'Pending' : 'Active'} />
                      </td>

                      {/* Created */}
                      <td className="py-4 px-4 text-xs text-neutral-500">
                        {s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Recent'}
                      </td>

                      {/* Actions */}
                      <td className="py-4 pr-6 pl-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* View public store */}
                          <button
                            type="button"
                            onClick={() => navigate('reseller-public-store', { storeSlug: s.storeSlug })}
                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Open Public Storefront"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </button>

                          {/* Edit store */}
                          <button
                            type="button"
                            onClick={() => openEditModal(s)}
                            className="p-1.5 rounded-lg border border-neutral-200 text-neutral-600 hover:text-black hover:bg-neutral-100 transition-colors cursor-pointer"
                            title="Edit Storefront"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>

                          {/* Inspect details */}
                          <button
                            type="button"
                            onClick={() => setInspectStore(s)}
                            className="px-2.5 py-1.5 rounded-lg border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer"
                          >
                            Details
                          </button>

                          {/* Toggle status */}
                          <button
                            type="button"
                            onClick={() => setConfirmStatusAction({
                              storeId: s.id,
                              storeName: s.storeName,
                              currentStatus: status,
                              targetStatus: isSuspended ? 'active' : 'suspended'
                            })}
                            className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                              isSuspended
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs'
                                : 'border border-neutral-200 text-rose-600 hover:bg-rose-50'
                            }`}
                          >
                            {isSuspended ? 'Activate' : 'Suspend'}
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
              Showing {Math.min(filteredStores.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
              {Math.min(filteredStores.length, currentPage * itemsPerPage)} of {filteredStores.length} stores
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

      {/* Edit Store Modal */}
      {editingStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl animate-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div>
                <h3 className="text-lg font-bold text-neutral-900">Edit Storefront Profile</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Modify public branding and merchant contact details</p>
              </div>
              <button
                onClick={() => setEditingStore(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStore} className="space-y-4 pt-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Storefront Name
                </label>
                <input
                  type="text"
                  required
                  value={formStoreName}
                  onChange={(e) => setFormStoreName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Marketing Tagline
                </label>
                <input
                  type="text"
                  value={formTagline}
                  onChange={(e) => setFormTagline(e.target.value)}
                  placeholder="e.g. Premium Gadgets & Lifestyle Accessories"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Contact Phone
                  </label>
                  <input
                    type="text"
                    value={formPhone}
                    onChange={(e) => setFormPhone(e.target.value)}
                    placeholder="+880 1..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                    Contact Email
                  </label>
                  <input
                    type="email"
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="merchant@example.com"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                  Operational Status
                </label>
                <select
                  value={formStatus}
                  onChange={(e) => setFormStatus(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 text-sm focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="active">Active (Full Checkout Enabled)</option>
                  <option value="suspended">Suspended (Store Locked)</option>
                  <option value="pending">Pending Verification</option>
                </select>
              </div>

              <div className="pt-4 flex items-center justify-end gap-2.5 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setEditingStore(null)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs disabled:opacity-50"
                >
                  Save Store Details
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Inspect Store Details Modal */}
      {inspectStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl animate-in zoom-in-95 duration-150 space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold">
                  <Store className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">{inspectStore.storeName}</h3>
                  <p className="text-xs text-neutral-500 font-mono">Slug: /r/{inspectStore.storeSlug}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectStore(null)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-black hover:bg-neutral-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-neutral-400 block mb-0.5">Status</span>
                <StatusBadge status={inspectStore.status || 'Active'} />
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-neutral-400 block mb-0.5">Subscription Tier</span>
                <span className="font-bold text-neutral-900">{storeSubscriptionMap.get(inspectStore.resellerId) || 'Starter'}</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-neutral-400 block mb-0.5">Contact Phone</span>
                <span className="font-semibold text-neutral-800">{inspectStore.contactPhone || 'Not provided'}</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-neutral-400 block mb-0.5">Contact Email</span>
                <span className="font-semibold text-neutral-800">{inspectStore.contactEmail || 'Not provided'}</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-neutral-400 block mb-0.5">Total Products</span>
                <span className="font-bold text-base text-neutral-900">{inspectStore.totalProducts || 0} Listed</span>
              </div>

              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200/70">
                <span className="text-neutral-400 block mb-0.5">Orders Dispatched</span>
                <span className="font-bold text-base text-emerald-700">{inspectStore.totalSales || 0} Orders</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => {
                  setInspectStore(null);
                  navigate('reseller-public-store', { storeSlug: inspectStore.storeSlug });
                }}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
                <span>Open Public Storefront</span>
              </button>

              <button
                type="button"
                onClick={() => setInspectStore(null)}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold transition-colors"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog for Suspend / Activate */}
      <ConfirmDialog
        isOpen={!!confirmStatusAction}
        title={confirmStatusAction?.targetStatus === 'suspended' ? 'Suspend Storefront?' : 'Reactivate Storefront?'}
        message={confirmStatusAction?.targetStatus === 'suspended'
          ? `Are you sure you want to suspend "${confirmStatusAction?.storeName}"? Customers will no longer be able to place orders through this storefront URL until reactivated.`
          : `Reactivate "${confirmStatusAction?.storeName}" and allow customers to place orders again?`
        }
        confirmText={confirmStatusAction?.targetStatus === 'suspended' ? 'Confirm Suspension' : 'Confirm Reactivation'}
        cancelText="Cancel"
        isDestructive={confirmStatusAction?.targetStatus === 'suspended'}
        onConfirm={handleConfirmStatusToggle}
        onCancel={() => setConfirmStatusAction(null)}
      />

    </div>
  );
}
