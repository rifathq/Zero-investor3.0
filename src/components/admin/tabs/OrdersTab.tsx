'use client';

import React, { useState, useMemo } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { Order, OrderStatus } from '@/types/marketplace';
import { formatBDT } from '@/lib/formatters';
import {
  StoreOrderSummary,
  getOrderStoreInfo,
  exportOrdersToCSV,
  exportStoreBreakdownToCSV
} from '@/lib/orderExportUtils';
import { 
  Search, 
  ShoppingBag, 
  CheckCircle2, 
  Truck, 
  Clock, 
  Eye, 
  FileText,
  AlertCircle,
  MapPin,
  Phone,
  User,
  X,
  ChevronLeft,
  ChevronRight,
  Filter,
  Store,
  Building2,
  ExternalLink,
  MessageSquare,
  ArrowRight,
  BarChart3,
  TrendingUp,
  Sparkles,
  Package,
  Layers,
  Check,
  Ban,
  Download,
  FileSpreadsheet,
  RotateCcw
} from 'lucide-react';
import { AdminPageHeader } from '../common/AdminPageHeader';
import { StatusBadge } from '../common/StatusBadge';
import { EmptyState } from '../common/EmptyState';

const COURIER_OPTIONS = [
  'Steadfast Courier',
  'Pathao Courier',
  'RedX Delivery',
  'Paperfly',
  'Sundarban Courier Service',
  'SA Paribahan',
  'eCourier',
  'Direct / In-House Delivery'
];

/**
 * Formats a clean WhatsApp click link for instant seller communication
 */
function getWhatsAppLink(phone?: string, text?: string): string {
  if (!phone) return 'https://wa.me/8801700000001';
  const clean = phone.replace(/\D/g, '');
  const normalized = clean.startsWith('880') 
    ? clean 
    : clean.startsWith('0') 
      ? '88' + clean 
      : '880' + clean;
  const query = text ? `?text=${encodeURIComponent(text)}` : '';
  return `https://wa.me/${normalized}${query}`;
}

export function OrdersTab() {
  const { orders = [], isLoadingOrders, updateOrderStatus, isSubmitting, resellers = [] } = useAdmin();
  const { showToast } = useMarketplace();

  // Sub-tab view: Master Orders Feed vs Store Breakdown
  const [activeSubTab, setActiveSubTab] = useState<'orders' | 'breakdown'>('orders');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [storeFilter, setStoreFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courierFilter, setCourierFilter] = useState<string>('all');

  // Selected order for inspection & status update modal
  const [selectedOrder, setSelectedOrder] = useState<Order | any | null>(null);
  const [modalStatus, setModalStatus] = useState<OrderStatus>('Pending');
  const [modalCourier, setModalCourier] = useState<string>('');
  const [modalTracking, setModalTracking] = useState<string>('');
  const [modalNotes, setModalNotes] = useState<string>('');

  // Pagination
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const openOrderModal = (order: any) => {
    setSelectedOrder(order);
    setModalStatus(order.status || 'Pending');
    setModalCourier(order.courier || order.carrier || 'Steadfast Courier');
    setModalTracking(order.trackingNumber || '');
    setModalNotes('');
  };

  const handleStatusUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrder) return;
    await updateOrderStatus(selectedOrder.id, modalStatus, modalCourier, modalTracking, modalNotes);
    setSelectedOrder(null);
  };

  // Dynamic Store Breakdown calculation
  const storeBreakdownList = useMemo<StoreOrderSummary[]>(() => {
    const map = new Map<string, StoreOrderSummary>();

    (orders || []).forEach(o => {
      const info = getOrderStoreInfo(o, resellers);
      const key = info.storeSlug || 'central-feed';

      if (!map.has(key)) {
        map.set(key, {
          storeSlug: key,
          storeName: info.storeName,
          resellerId: o.resellerId,
          resellerName: info.resellerName,
          contactPhone: info.contactPhone,
          totalOrders: 0,
          pendingCount: 0,
          processingCount: 0,
          shippedCount: 0,
          deliveredCount: 0,
          cancelledCount: 0,
          totalSalesVolume: 0,
          totalProfit: 0,
          isResellerStore: info.isResellerStore
        });
      }

      const item = map.get(key)!;
      item.totalOrders += 1;
      const status = (o.status || 'Pending').toLowerCase();
      if (status === 'pending') item.pendingCount += 1;
      else if (status === 'processing') item.processingCount += 1;
      else if (status === 'shipped') item.shippedCount += 1;
      else if (status === 'delivered') item.deliveredCount += 1;
      else if (status === 'cancelled') item.cancelledCount += 1;

      const amount = Number(o.total || (o as any).totalAmountBDT || 0);
      item.totalSalesVolume += amount;

      // Reseller profit
      const profit = Number((o as any).profitBDT || (o as any).resellerProfit || Math.round(amount * 0.25));
      item.totalProfit += profit;
    });

    return Array.from(map.values()).sort((a, b) => b.totalOrders - a.totalOrders);
  }, [orders, resellers]);

  // Overall store analytics KPIs
  const storeKPIs = useMemo(() => {
    const resellerStoresOnly = storeBreakdownList.filter(s => s.isResellerStore);
    const totalResellerOrders = resellerStoresOnly.reduce((acc, s) => acc + s.totalOrders, 0);
    const totalResellerSales = resellerStoresOnly.reduce((acc, s) => acc + s.totalSalesVolume, 0);
    const totalResellerProfit = resellerStoresOnly.reduce((acc, s) => acc + s.totalProfit, 0);
    return {
      activeStoresCount: resellerStoresOnly.length,
      totalResellerOrders,
      totalResellerSales,
      totalResellerProfit,
      topStore: resellerStoresOnly[0] || null
    };
  }, [storeBreakdownList]);

  // Filtered orders list for master table
  const filteredOrders = useMemo(() => {
    return (orders || []).filter(o => {
      const info = getOrderStoreInfo(o, resellers);

      // Store filter
      if (storeFilter !== 'all') {
        if (storeFilter === 'central-feed') {
          if (info.isResellerStore) return false;
        } else {
          if (info.storeSlug !== storeFilter && o.resellerId !== storeFilter) {
            return false;
          }
        }
      }

      // Search query (Order #, Customer, Phone, Tracking, Store Name, Reseller Name, Store Slug)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const idMatch = (o.id || '').toLowerCase().includes(q) || (o.orderNumber || '').toLowerCase().includes(q);
        const custMatch = (o.customerName || '').toLowerCase().includes(q) || (o.customerEmail || '').toLowerCase().includes(q);
        const phoneMatch = (o.shippingAddress?.phone || (o as any).customerPhone || '').includes(q);
        const trackMatch = (o.trackingNumber || '').toLowerCase().includes(q);
        const storeMatch = info.storeName.toLowerCase().includes(q) || 
                           info.storeSlug.toLowerCase().includes(q) || 
                           info.resellerName.toLowerCase().includes(q);

        if (!idMatch && !custMatch && !phoneMatch && !trackMatch && !storeMatch) {
          return false;
        }
      }

      // Status filter
      if (statusFilter !== 'all') {
        if (o.status !== statusFilter) return false;
      }

      // Courier filter
      if (courierFilter !== 'all') {
        const courier = o.courier || o.carrier || '';
        if (courier !== courierFilter) return false;
      }

      return true;
    });
  }, [orders, resellers, storeFilter, searchQuery, statusFilter, courierFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredOrders.length / itemsPerPage));
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const pendingCount = (orders || []).filter(o => o.status === 'Pending').length;
  const processingCount = (orders || []).filter(o => o.status === 'Processing').length;
  const shippedCount = (orders || []).filter(o => o.status === 'Shipped').length;
  const deliveredCount = (orders || []).filter(o => o.status === 'Delivered').length;

  const currentFilteredStoreInfo = useMemo(() => {
    if (storeFilter === 'all') return null;
    return storeBreakdownList.find(s => s.storeSlug === storeFilter);
  }, [storeFilter, storeBreakdownList]);

  // Export handlers
  const handleExportOrdersCSV = () => {
    if (filteredOrders.length === 0) {
      showToast('No Orders to Export', 'There are no orders matching your current filter criteria.', 'info');
      return;
    }
    const success = exportOrdersToCSV(filteredOrders, resellers, {
      storeFilter,
      storeName: currentFilteredStoreInfo?.storeName,
      statusFilter
    });
    if (success) {
      showToast(
        'Export Completed',
        `Exported ${filteredOrders.length} order(s) to CSV for record-keeping and inventory reconciliation.`,
        'success'
      );
    }
  };

  const handleExportStoreBreakdownCSV = () => {
    if (storeBreakdownList.length === 0) {
      showToast('No Data', 'No store breakdown records found to export.', 'info');
      return;
    }
    const success = exportStoreBreakdownToCSV(storeBreakdownList);
    if (success) {
      showToast(
        'Breakdown Exported',
        `Exported performance summary for ${storeBreakdownList.length} store(s) to CSV.`,
        'success'
      );
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <AdminPageHeader
          title="Orders &amp; Store Fulfillment"
          description="Track orders by reseller storefront, inspect per-store performance, assign nationwide couriers (Steadfast & Pathao), and manage COD disbursements."
        />

        {/* View Switcher Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-neutral-100 border border-neutral-200/80 shrink-0 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('orders')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'orders'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-neutral-700" />
            <span>Master Orders Feed</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeSubTab === 'orders' ? 'bg-neutral-100 text-neutral-800' : 'bg-neutral-200/60 text-neutral-600'
            }`}>
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSubTab('breakdown')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition-all cursor-pointer ${
              activeSubTab === 'breakdown'
                ? 'bg-white text-neutral-900 shadow-xs'
                : 'text-neutral-500 hover:text-neutral-800'
            }`}
          >
            <Building2 className="w-4 h-4 text-emerald-600" />
            <span>Store Breakdown &amp; Analytics</span>
            <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
              activeSubTab === 'breakdown' ? 'bg-emerald-100 text-emerald-800' : 'bg-neutral-200/60 text-neutral-600'
            }`}>
              {storeBreakdownList.length}
            </span>
          </button>
        </div>
      </div>

      {/* =========================================================================
          VIEW 1: STORE PERFORMANCE & ORDER BREAKDOWN ANALYTICS
         ========================================================================= */}
      {activeSubTab === 'breakdown' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Top KPI Cards for Stores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Active Reseller Stores</span>
                <Store className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-neutral-900 mt-1">
                {storeKPIs.activeStoresCount} Stores
              </div>
              <p className="text-[11.5px] text-neutral-400 mt-1">
                Generating dropshipping orders
              </p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Reseller Order Volume</span>
                <ShoppingBag className="w-4 h-4 text-blue-600" />
              </div>
              <div className="text-2xl font-bold text-blue-700 mt-1">
                {storeKPIs.totalResellerOrders} Orders
              </div>
              <p className="text-[11.5px] text-neutral-400 mt-1">
                Across custom landing pages &amp; stores
              </p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Total Retail Volume</span>
                <TrendingUp className="w-4 h-4 text-amber-600" />
              </div>
              <div className="text-2xl font-bold text-neutral-900 font-mono mt-1">
                {formatBDT(storeKPIs.totalResellerSales)}
              </div>
              <p className="text-[11.5px] text-neutral-400 mt-1">
                Gross customer GMV collected
              </p>
            </div>

            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs">
              <div className="flex items-center justify-between text-neutral-500">
                <span className="text-xs font-semibold uppercase tracking-wider">Reseller Profit Accrued</span>
                <Sparkles className="w-4 h-4 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold text-emerald-600 font-mono mt-1">
                +{formatBDT(storeKPIs.totalResellerProfit)}
              </div>
              <p className="text-[11.5px] text-neutral-400 mt-1">
                Net earnings ready for bKash/Nagad payout
              </p>
            </div>
          </div>

          {/* Store Breakdown Table */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs">
            <div className="p-5 border-b border-neutral-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-neutral-50/50">
              <div>
                <h3 className="text-base font-bold text-neutral-900 flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-emerald-600" />
                  <span>Store Performance &amp; Order Breakdown</span>
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Dynamic breakdown calculated from real-time customer checkouts and dropshipping orders.
                </p>
              </div>

              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <span className="text-xs font-semibold text-neutral-500 bg-white px-3 py-1.5 rounded-xl border border-neutral-200 shrink-0">
                  {storeBreakdownList.length} Total Channels
                </span>
                <button
                  type="button"
                  onClick={handleExportStoreBreakdownCSV}
                  className="px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-800 border border-neutral-300 font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  title="Export Store Breakdown analytics as a CSV file"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Export Breakdown CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const ok = exportOrdersToCSV(orders, resellers, { storeFilter: 'all' });
                    if (ok) {
                      showToast('Export Completed', `Exported all ${orders.length} orders to CSV.`, 'success');
                    }
                  }}
                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
                  title="Export all system orders to CSV"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export All Orders CSV ({orders.length})</span>
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold uppercase tracking-wider text-neutral-500">
                    <th className="py-4 pl-6 pr-4">Store &amp; Channel</th>
                    <th className="py-4 px-4">Reseller Merchant</th>
                    <th className="py-4 px-4">Direct WhatsApp</th>
                    <th className="py-4 px-4 text-center">Total Orders</th>
                    <th className="py-4 px-4">Order Status Breakdown</th>
                    <th className="py-4 px-4">Sales Volume</th>
                    <th className="py-4 px-4">Reseller Margin</th>
                    <th className="py-4 pr-6 pl-4 text-right">Quick Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-100 text-sm">
                  {storeBreakdownList.map((store) => {
                    const waLink = getWhatsAppLink(
                      store.contactPhone,
                      `Hello ${store.resellerName}, admin update regarding your store "${store.storeName}" on Zero Invest.`
                    );

                    return (
                      <tr key={store.storeSlug} className="hover:bg-neutral-50/70 transition-colors">
                        {/* Store & Channel */}
                        <td className="py-4 pl-6 pr-4">
                          <div className="flex items-center gap-2">
                            <div className="w-9 h-9 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 shrink-0">
                              {store.isResellerStore ? <Store className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                            </div>
                            <div>
                              <div className="font-bold text-neutral-900 text-sm">{store.storeName}</div>
                              <div className="text-[11px] font-mono text-emerald-700 font-semibold flex items-center gap-1 mt-0.5">
                                <span>/r/{store.storeSlug}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        {/* Merchant Name */}
                        <td className="py-4 px-4">
                          <div className="font-semibold text-neutral-900 text-xs flex items-center gap-1.5">
                            <User className="w-3.5 h-3.5 text-neutral-400" />
                            <span>{store.resellerName}</span>
                          </div>
                          {store.resellerId && (
                            <span className="text-[10px] font-mono text-neutral-400 block mt-0.5">
                              UID: {store.resellerId.slice(0, 10)}
                            </span>
                          )}
                        </td>

                        {/* WhatsApp Contact */}
                        <td className="py-4 px-4">
                          <a
                            href={waLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 hover:bg-emerald-100 border border-emerald-300 font-bold text-xs transition-colors shadow-2xs cursor-pointer"
                            title={`Chat with ${store.resellerName} on WhatsApp`}
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span className="font-mono">{store.contactPhone || 'WhatsApp'}</span>
                            <ExternalLink className="w-2.5 h-2.5 text-emerald-600" />
                          </a>
                        </td>

                        {/* Total Orders */}
                        <td className="py-4 px-4 text-center">
                          <span className="inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-black bg-neutral-900 text-white font-mono">
                            {store.totalOrders} {store.totalOrders === 1 ? 'order' : 'orders'}
                          </span>
                        </td>

                        {/* Status Breakdown */}
                        <td className="py-4 px-4">
                          <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                            {store.pendingCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 border border-amber-300 font-bold" title="Pending Fulfillment">
                                <Clock className="w-3 h-3 text-amber-600" />
                                <span>{store.pendingCount} Pending</span>
                              </span>
                            )}
                            {store.processingCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-blue-50 text-blue-800 border border-blue-300 font-bold" title="Processing / Packed">
                                <span>{store.processingCount} Processing</span>
                              </span>
                            )}
                            {store.shippedCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-purple-50 text-purple-800 border border-purple-300 font-bold" title="Out for Delivery">
                                <Truck className="w-3 h-3 text-purple-600" />
                                <span>{store.shippedCount} In Transit</span>
                              </span>
                            )}
                            {store.deliveredCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-300 font-bold" title="Delivered">
                                <Check className="w-3 h-3 text-emerald-600" />
                                <span>{store.deliveredCount} Delivered</span>
                              </span>
                            )}
                            {store.cancelledCount > 0 && (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-rose-50 text-rose-800 border border-rose-300 font-bold" title="Cancelled">
                                <Ban className="w-3 h-3 text-rose-600" />
                                <span>{store.cancelledCount} Cancelled</span>
                              </span>
                            )}
                            {store.totalOrders === 0 && (
                              <span className="text-neutral-400 text-xs">No orders yet</span>
                            )}
                          </div>
                        </td>

                        {/* Total Sales Volume */}
                        <td className="py-4 px-4 font-mono font-bold text-neutral-900 text-xs sm:text-sm">
                          {formatBDT(store.totalSalesVolume)}
                        </td>

                        {/* Reseller Profit Margin */}
                        <td className="py-4 px-4 font-mono font-bold text-emerald-600 text-xs sm:text-sm">
                          +{formatBDT(store.totalProfit)}
                        </td>

                        {/* Action: Inspect Orders & Download CSV */}
                        <td className="py-4 pr-6 pl-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => {
                                setStoreFilter(store.storeSlug);
                                setActiveSubTab('orders');
                                setCurrentPage(1);
                              }}
                              className="px-3 py-1.5 rounded-xl bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs inline-flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                              title={`Filter and view all ${store.totalOrders} orders for ${store.storeName}`}
                            >
                              <Eye className="w-3.5 h-3.5 text-amber-300" />
                              <span>Inspect</span>
                              <ArrowRight className="w-3 h-3" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                const storeOrders = orders.filter(o => {
                                  const s = getOrderStoreInfo(o, resellers);
                                  return s.storeSlug === store.storeSlug || o.resellerId === store.storeSlug;
                                });
                                const ok = exportOrdersToCSV(storeOrders, resellers, {
                                  storeFilter: store.storeSlug,
                                  storeName: store.storeName
                                });
                                if (ok) {
                                  showToast('Export Completed', `Exported ${storeOrders.length} order(s) for "${store.storeName}" to CSV.`, 'success');
                                }
                              }}
                              className="p-1.5 rounded-xl border border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 text-neutral-700 transition-colors cursor-pointer shadow-2xs"
                              title={`Export ${store.storeName} orders as CSV`}
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-600" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* =========================================================================
          VIEW 2: MASTER ORDERS FEED TABLE WITH PROMINENT STORE IDENTIFICATION
         ========================================================================= */}
      {activeSubTab === 'orders' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          
          {/* Summary KPI Pills */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Pending Orders</span>
              <div className="text-2xl font-bold text-amber-700 mt-1">{pendingCount}</div>
            </div>
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">In Processing</span>
              <div className="text-2xl font-bold text-blue-700 mt-1">{processingCount}</div>
            </div>
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Out for Delivery</span>
              <div className="text-2xl font-bold text-purple-700 mt-1">{shippedCount}</div>
            </div>
            <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">Delivered</span>
              <div className="text-2xl font-bold text-emerald-700 mt-1">{deliveredCount}</div>
            </div>
          </div>

          {/* Active Store Filter Alert Banner (if filtered) */}
          {storeFilter !== 'all' && currentFilteredStoreInfo && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-300/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 text-emerald-950">
                <Store className="w-4 h-4 text-emerald-700 shrink-0" />
                <span>
                  Filtering orders for store: <strong>{currentFilteredStoreInfo.storeName}</strong> ({currentFilteredStoreInfo.totalOrders} total orders) · Reseller: <strong>{currentFilteredStoreInfo.resellerName}</strong>
                </span>
              </div>
              <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
                <button
                  type="button"
                  onClick={handleExportOrdersCSV}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold transition-colors cursor-pointer shadow-2xs"
                  title={`Download CSV for ${currentFilteredStoreInfo.storeName}`}
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Export {currentFilteredStoreInfo.storeName} CSV</span>
                </button>
                <button
                  type="button"
                  onClick={() => { setStoreFilter('all'); setCurrentPage(1); }}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-neutral-100 text-neutral-700 border border-neutral-300 font-bold transition-colors cursor-pointer shadow-2xs"
                >
                  <X className="w-3.5 h-3.5 text-neutral-500" />
                  <span>Clear Store Filter</span>
                </button>
              </div>
            </div>
          )}

          {/* Filters Bar: Search + Store Filter + Status Filter + Courier Filter */}
          <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* 1. Search */}
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  placeholder="Search Order #, customer, store, slug..."
                  className="w-full pl-9.5 pr-4 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
                />
              </div>

              {/* 2. Quick Store / Reseller Filter Dropdown */}
              <div>
                <select
                  value={storeFilter}
                  onChange={(e) => { setStoreFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm font-semibold rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="all">🏪 All Stores / Central Feed ({orders.length} orders)</option>
                  {storeBreakdownList.map(s => (
                    <option key={s.storeSlug} value={s.storeSlug}>
                      {s.storeName} ({s.totalOrders} {s.totalOrders === 1 ? 'order' : 'orders'})
                    </option>
                  ))}
                </select>
              </div>

              {/* 3. Status Filter */}
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="all">All Fulfillment Statuses</option>
                  <option value="Pending">Pending ({pendingCount})</option>
                  <option value="Processing">Processing ({processingCount})</option>
                  <option value="Shipped">Shipped / In Transit ({shippedCount})</option>
                  <option value="Delivered">Delivered ({deliveredCount})</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              {/* 4. Courier Filter */}
              <div>
                <select
                  value={courierFilter}
                  onChange={(e) => { setCourierFilter(e.target.value); setCurrentPage(1); }}
                  className="w-full px-3.5 py-2.5 text-xs sm:text-sm rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors cursor-pointer"
                >
                  <option value="all">All Couriers</option>
                  {COURIER_OPTIONS.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Action & Metric Toolbar Strip */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-3 border-t border-neutral-100 text-xs">
              <div className="flex items-center gap-2 flex-wrap text-neutral-600">
                <span>
                  Showing <strong className="text-neutral-900 font-bold">{filteredOrders.length}</strong> of{' '}
                  <strong className="text-neutral-900 font-bold">{orders.length}</strong> orders
                </span>

                {(searchQuery.trim() || storeFilter !== 'all' || statusFilter !== 'all' || courierFilter !== 'all') && (
                  <span className="inline-flex items-center gap-1.5 bg-neutral-100 px-2.5 py-1 rounded-lg text-[11px] font-medium text-neutral-700 ml-1">
                    <span>Filters active</span>
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery('');
                        setStoreFilter('all');
                        setStatusFilter('all');
                        setCourierFilter('all');
                        setCurrentPage(1);
                      }}
                      className="text-emerald-700 hover:text-emerald-900 font-bold inline-flex items-center gap-0.5 cursor-pointer hover:underline ml-1"
                      title="Clear all active filters"
                    >
                      <RotateCcw className="w-3 h-3" />
                      <span>Reset</span>
                    </button>
                  </span>
                )}
              </div>

              {/* Prominent Export Filtered Orders CSV Button */}
              <button
                type="button"
                onClick={handleExportOrdersCSV}
                disabled={filteredOrders.length === 0}
                className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm inline-flex items-center justify-center gap-2 transition-all shadow-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
                title="Export currently filtered order list as CSV for record-keeping and inventory reconciliation"
              >
                <Download className="w-4 h-4" />
                <span>Export Filtered Orders (CSV)</span>
                <span className="px-1.5 py-0.5 rounded-md bg-emerald-700/80 text-[11px] font-mono">
                  {filteredOrders.length}
                </span>
              </button>
            </div>
          </div>

          {/* Orders Table */}
          <div className="bg-white border border-neutral-200/90 rounded-3xl overflow-hidden shadow-xs">
            {paginatedOrders.length === 0 ? (
              <EmptyState
                icon={ShoppingBag}
                title="No orders found"
                description={
                  storeFilter !== 'all'
                    ? `No orders match this filter for store "${currentFilteredStoreInfo?.storeName || storeFilter}".`
                    : "No customer orders match your search query or filter selection."
                }
              />
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-neutral-200 bg-neutral-50/70 text-xs font-bold uppercase tracking-wider text-neutral-500">
                      <th className="py-4 pl-6 pr-3">Order #</th>
                      <th className="py-4 px-3">Store / Reseller Source</th>
                      <th className="py-4 px-3">Customer &amp; Phone</th>
                      <th className="py-4 px-3">Delivery Area</th>
                      <th className="py-4 px-3">Amount</th>
                      <th className="py-4 px-3">Courier Details</th>
                      <th className="py-4 px-3">Status</th>
                      <th className="py-4 pr-6 pl-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-100 text-sm">
                    {paginatedOrders.map((order) => {
                      const itemsCount = (order.items || []).length;
                      const courier = order.courier || order.carrier;
                      const tracking = order.trackingNumber;
                      const storeInfo = getOrderStoreInfo(order, resellers);
                      const isStoreActiveFilter = storeFilter === storeInfo.storeSlug;

                      return (
                        <tr key={order.id} className="hover:bg-neutral-50/70 transition-colors">
                          {/* Order Number & Items */}
                          <td className="py-4 pl-6 pr-3">
                            <div className="font-mono font-bold text-neutral-900">
                              #{order.orderNumber || order.id?.substring(0, 8)}
                            </div>
                            <div className="text-xs text-neutral-500 mt-0.5">
                              {itemsCount} {itemsCount === 1 ? 'item' : 'items'} · {order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'Recent'}
                            </div>
                          </td>

                          {/* 1. Store Identification on Master Order Row (Prominent Badge) */}
                          <td className="py-4 px-3">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setStoreFilter(storeInfo.storeSlug);
                                setCurrentPage(1);
                              }}
                              className={`text-left p-2.5 rounded-2xl border transition-all cursor-pointer group max-w-[210px] w-full block shadow-2xs ${
                                isStoreActiveFilter
                                  ? 'bg-emerald-50/90 border-emerald-400 ring-2 ring-emerald-500/20'
                                  : 'bg-neutral-50/80 hover:bg-emerald-50/60 border-neutral-200 hover:border-emerald-300'
                              }`}
                              title={`Click to filter orders from ${storeInfo.storeName}`}
                            >
                              <div className="flex items-center gap-1.5 font-bold text-xs text-neutral-900 group-hover:text-emerald-800">
                                {storeInfo.isResellerStore ? (
                                  <Store className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                                ) : (
                                  <Building2 className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                                )}
                                <span className="truncate">{storeInfo.storeName}</span>
                              </div>
                              <div className="text-[11px] text-neutral-500 flex items-center gap-1 mt-0.5">
                                <User className="w-3 h-3 text-neutral-400 shrink-0" />
                                <span className="truncate">{storeInfo.resellerName}</span>
                              </div>
                              <div className="text-[10px] font-mono text-emerald-700/90 font-medium truncate mt-0.5">
                                /r/{storeInfo.storeSlug}
                              </div>
                            </button>
                          </td>

                          {/* Customer */}
                          <td className="py-4 px-3">
                            <div className="font-semibold text-neutral-900">
                              {order.customerName || 'Customer'}
                            </div>
                            <div className="text-xs text-neutral-500 font-mono">
                              {order.shippingAddress?.phone || (order as any).customerPhone || order.customerEmail || 'Direct Buyer'}
                            </div>
                          </td>

                          {/* Destination */}
                          <td className="py-4 px-3 text-neutral-600 text-xs">
                            <div className="font-medium text-neutral-800 line-clamp-1">
                              {order.shippingAddress?.city || (order.shippingAddress as any)?.district || 'Dhaka Metro'}
                            </div>
                            <div className="text-neutral-400 line-clamp-1">
                              {order.shippingAddress?.street || (order.shippingAddress as any)?.address || 'Standard Delivery'}
                            </div>
                          </td>

                          {/* Total */}
                          <td className="py-4 px-4">
                            <div className="font-bold text-neutral-900 font-mono">
                              {formatBDT(order.total || (order as any).totalAmountBDT || 0)}
                            </div>
                            <div className="text-[11px] text-neutral-400 font-semibold uppercase">
                              {order.paymentMethod || 'COD'}
                            </div>
                          </td>

                          {/* Courier & Tracking */}
                          <td className="py-4 px-3">
                            {courier ? (
                              <div>
                                <div className="text-xs font-semibold text-neutral-800 flex items-center gap-1">
                                  <Truck className="w-3.5 h-3.5 text-neutral-500" />
                                  <span>{courier}</span>
                                </div>
                                {tracking && (
                                  <span className="text-[11px] font-mono text-neutral-500 mt-0.5 block select-all">
                                    {tracking}
                                  </span>
                                )}
                              </div>
                            ) : (
                              <span className="text-xs text-neutral-400">Unassigned</span>
                            )}
                          </td>

                          {/* Status */}
                          <td className="py-4 px-3">
                            <StatusBadge status={order.status} />
                          </td>

                          {/* Action */}
                          <td className="py-4 pr-6 pl-3 text-right">
                            <button
                              type="button"
                              onClick={() => openOrderModal(order)}
                              className="px-3 py-1.5 rounded-xl border border-neutral-300 hover:border-black bg-white hover:bg-neutral-50 text-xs font-semibold text-neutral-800 transition-colors shadow-2xs cursor-pointer inline-flex items-center gap-1.5"
                            >
                              <Eye className="w-3.5 h-3.5 text-neutral-600" />
                              <span>Fulfill</span>
                            </button>
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
                  Showing {Math.min(filteredOrders.length, (currentPage - 1) * itemsPerPage + 1)} to{' '}
                  {Math.min(filteredOrders.length, currentPage * itemsPerPage)} of {filteredOrders.length} orders
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
        </div>
      )}

      {/* =========================================================================
          ORDER FULFILLMENT & INSPECTION MODAL (With Store Attribution)
         ========================================================================= */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-150">
          <div 
            className="bg-white rounded-3xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden my-8 animate-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col"
            role="dialog"
            aria-modal="true"
          >
            <div className="p-6 border-b border-neutral-200 flex items-center justify-between bg-neutral-50/50">
              <div>
                <h3 className="text-xl font-bold text-neutral-900">
                  Fulfill Order #{selectedOrder.orderNumber || selectedOrder.id?.substring(0, 8)}
                </h3>
                <p className="text-xs text-neutral-500 mt-0.5">
                  Update fulfillment status, assign courier delivery, and log tracking notes.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-800 hover:bg-neutral-100 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleStatusUpdate} className="flex-1 overflow-y-auto p-6 space-y-6">
              
              {/* Store Attribution Card */}
              {(() => {
                const sInfo = getOrderStoreInfo(selectedOrder, resellers);
                const sWa = getWhatsAppLink(sInfo.contactPhone, `Hello, update on Order #${selectedOrder.orderNumber || selectedOrder.id}`);
                return (
                  <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5">
                      <div className="w-9 h-9 rounded-xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-800 shrink-0">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-neutral-900 text-sm">{sInfo.storeName}</div>
                        <div className="text-neutral-500">
                          Reseller: <span className="font-semibold text-neutral-800">{sInfo.resellerName}</span> · <span className="font-mono text-emerald-700">/r/{sInfo.storeSlug}</span>
                        </div>
                      </div>
                    </div>

                    <a
                      href={sWa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold inline-flex items-center gap-1.5 transition-colors self-start sm:self-auto shrink-0 shadow-2xs cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>WhatsApp Merchant</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                );
              })()}

              {/* Customer & Shipping Details */}
              <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-200/80 space-y-3">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Delivery Destination
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="flex items-start gap-2">
                    <User className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <div>
                      <div className="font-bold text-neutral-900">{selectedOrder.customerName || 'Customer'}</div>
                      <div className="text-neutral-500">{selectedOrder.customerEmail}</div>
                    </div>
                  </div>
                  <div className="flex items-start gap-2">
                    <Phone className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <div className="font-mono font-bold text-neutral-900">
                      {selectedOrder.shippingAddress?.phone || (selectedOrder as any).customerPhone || 'No phone provided'}
                    </div>
                  </div>
                  <div className="sm:col-span-2 flex items-start gap-2 border-t border-neutral-200/60 pt-2">
                    <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                    <div className="text-neutral-700">
                      {selectedOrder.shippingAddress?.address || selectedOrder.shippingAddress?.street || 'Standard Address'},{' '}
                      {selectedOrder.shippingAddress?.city || selectedOrder.shippingAddress?.district || 'Bangladesh'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-neutral-500 block">
                  Order Items ({selectedOrder.items?.length || 0})
                </span>
                <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-100 overflow-hidden">
                  {(selectedOrder.items || []).map((it: any, idx: number) => (
                    <div key={idx} className="p-3 flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold text-neutral-900">{it.productName || it.name}</div>
                        <div className="text-neutral-400">Qty: {it.quantity || 1} · Unit: {formatBDT(it.price || 0)}</div>
                      </div>
                      <div className="font-bold text-neutral-900 font-mono">
                        {formatBDT((it.price || 0) * (it.quantity || 1))}
                      </div>
                    </div>
                  ))}
                  <div className="p-3 bg-neutral-50 flex items-center justify-between text-xs font-bold text-neutral-900">
                    <span>Total Payable (COD):</span>
                    <span className="font-mono">{formatBDT(selectedOrder.total || (selectedOrder as any).totalAmountBDT || 0)}</span>
                  </div>
                </div>
              </div>

              {/* Courier & Status Controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Fulfillment Status *
                  </label>
                  <select
                    value={modalStatus}
                    onChange={(e) => setModalStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm font-semibold focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Processing">Processing / Packed</option>
                    <option value="Shipped">Shipped / In Transit</option>
                    <option value="Delivered">Delivered (Funds Cleared)</option>
                    <option value="Cancelled">Cancelled / Returned</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Assigned Courier Service
                  </label>
                  <select
                    value={modalCourier}
                    onChange={(e) => setModalCourier(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm focus:outline-none focus:border-black cursor-pointer"
                  >
                    {COURIER_OPTIONS.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Courier Consignment / Tracking Code
                  </label>
                  <input
                    type="text"
                    value={modalTracking}
                    onChange={(e) => setModalTracking(e.target.value)}
                    placeholder="e.g. PTH-884920 or STEAD-991823"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-sm font-mono focus:outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2 space-y-1.5">
                  <label className="block text-xs font-bold text-neutral-800">
                    Internal Fulfillment Notes (Optional)
                  </label>
                  <textarea
                    rows={2}
                    value={modalNotes}
                    onChange={(e) => setModalNotes(e.target.value)}
                    placeholder="e.g. Handed to Steadfast rider at Motijheel hub."
                    className="w-full px-3.5 py-2 rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white text-xs focus:outline-none focus:border-black"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 border-t border-neutral-200 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 text-xs sm:text-sm font-bold rounded-xl bg-neutral-900 hover:bg-black text-white shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {isSubmitting ? 'Updating...' : 'Save Fulfillment Changes'}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
