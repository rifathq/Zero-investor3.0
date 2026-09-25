'use client';

import React, { useState, useMemo } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { 
  ShoppingBag, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  TrendingUp, 
  Wallet, 
  Package, 
  Crown,
  ExternalLink,
  Copy,
  Plus,
  Layers,
  ArrowUpRight,
  Truck,
  Bell,
  Calendar
} from 'lucide-react';
import { formatBDT } from '@/lib/formatters';

type TimePeriod = '7d' | '30d' | '90d' | '12m';

export function ResellerOverviewTab() {
  const { 
    resellerProfile, 
    products, 
    orders, 
    wallet, 
    transactions, 
    notifications, 
    subscription,
    setActiveSection 
  } = useReseller();
  const { navigate, showToast } = useMarketplace();

  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');
  const [activeChart, setActiveChart] = useState<'sales' | 'profit' | 'orders'>('sales');

  // Filter orders by selected time period
  const filteredOrders = useMemo(() => {
    const now = Date.now();
    const periodDays = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
      '12m': 365
    }[timePeriod];

    const cutoff = now - periodDays * 24 * 60 * 60 * 1000;
    return orders.filter(o => new Date(o.createdAt).getTime() >= cutoff);
  }, [orders, timePeriod]);

  // Derived metrics for the reseller
  const totalOrdersCount = orders.length;
  const pendingOrdersCount = orders.filter(o => o.status === 'Pending' || o.status === 'Processing' || o.status === 'Confirmed').length;
  const completedOrdersCount = orders.filter(o => o.status === 'Delivered').length;
  
  const totalSalesBDT = orders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalProfitBDT = orders.reduce((sum, o) => sum + (o.profitBDT || Math.round((o.total || 0) * 0.25)), 0);
  
  const availableBalanceBDT = wallet.availableBalanceBDT;
  const pendingCODBDT = wallet.pendingBalanceBDT;
  const activeProductsCount = products.filter(p => p.isActive).length;

  // Chart data buckets
  const chartData = useMemo(() => {
    const bucketsCount = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 6 : timePeriod === '90d' ? 6 : 12;
    const now = new Date();
    const buckets: { label: string; sales: number; profit: number; orders: number }[] = [];

    for (let i = bucketsCount - 1; i >= 0; i--) {
      let bucketStart: number;
      let bucketEnd: number;
      let label = '';

      if (timePeriod === '7d') {
        const d = new Date(now);
        d.setDate(d.getDate() - i);
        bucketStart = new Date(d.setHours(0, 0, 0, 0)).getTime();
        bucketEnd = new Date(d.setHours(23, 59, 59, 999)).getTime();
        label = d.toLocaleDateString('en-US', { weekday: 'short' });
      } else if (timePeriod === '30d') {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 5);
        bucketStart = d.getTime() - 5 * 24 * 60 * 60 * 1000;
        bucketEnd = d.getTime();
        label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else if (timePeriod === '90d') {
        const d = new Date(now);
        d.setDate(d.getDate() - i * 15);
        bucketStart = d.getTime() - 15 * 24 * 60 * 60 * 1000;
        bucketEnd = d.getTime();
        label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      } else {
        const d = new Date(now);
        d.setMonth(d.getMonth() - i);
        bucketStart = new Date(d.getFullYear(), d.getMonth(), 1).getTime();
        bucketEnd = new Date(d.getFullYear(), d.getMonth() + 1, 0).getTime();
        label = d.toLocaleDateString('en-US', { month: 'short' });
      }

      const inBucket = orders.filter(o => {
        const t = new Date(o.createdAt).getTime();
        return t >= bucketStart && t <= bucketEnd;
      });

      const bSales = inBucket.reduce((sum, o) => sum + (o.total || 0), 0);
      const bProfit = inBucket.reduce((sum, o) => sum + (o.profitBDT || Math.round((o.total || 0) * 0.25)), 0);
      const bOrders = inBucket.length;

      buckets.push({ label, sales: bSales, profit: bProfit, orders: bOrders });
    }

    return buckets;
  }, [orders, timePeriod]);

  const maxChartValue = useMemo(() => {
    if (activeChart === 'orders') {
      return Math.max(...chartData.map(b => b.orders), 5);
    }
    const key = activeChart === 'sales' ? 'sales' : 'profit';
    return Math.max(...chartData.map(b => b[key]), 1000);
  }, [chartData, activeChart]);

  const handleCopyLink = () => {
    const slug = resellerProfile?.storeSlug || 'store';
    const url = `${window.location.origin}/r/${slug}`;
    navigator.clipboard.writeText(url);
    showToast('Store Link Copied', url, 'success');
  };

  const handlePreviewStore = () => {
    const slug = resellerProfile?.storeSlug || 'store';
    navigate('reseller-public-store', { storeSlug: slug });
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Welcome Banner & Quick Actions */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 lg:p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6 shadow-xs">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">
              {resellerProfile?.storeName || 'My Reseller Store'}
            </h1>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
              Verified Merchant
            </span>
          </div>
          <p className="text-sm text-neutral-500 mt-1.5">
            Storefront link: <span className="font-mono text-neutral-800 font-medium">/r/{resellerProfile?.storeSlug}</span> · Plan: <span className="font-bold text-neutral-900">{subscription?.planName || 'Pro Partner'}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <Copy className="w-4 h-4" /> Copy Link
          </button>
          <button
            onClick={handlePreviewStore}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" /> Preview Store
          </button>
          <button
            onClick={() => setActiveSection('products')}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-neutral-900 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
          >
            <Layers className="w-4 h-4" /> Add from Catalog
          </button>
          <button
            onClick={() => setActiveSection('withdrawals')}
            className="inline-flex items-center gap-2 px-4.5 py-2.5 rounded-xl bg-emerald-600 text-white text-xs sm:text-sm font-semibold hover:bg-emerald-700 transition-colors cursor-pointer shadow-2xs"
          >
            <Wallet className="w-4 h-4" /> Request Payout
          </button>
        </div>
      </div>

      {/* 9 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
        {/* Total Orders */}
        <div 
          onClick={() => setActiveSection('orders')}
          className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between cursor-pointer hover:border-neutral-400 hover:shadow-xs transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-neutral-600">
            <span className="text-sm sm:text-[15px] font-semibold">Total Orders</span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
              <ShoppingBag className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-[32px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {totalOrdersCount}
            </div>
          </div>
          <div className="text-xs sm:text-[13px] text-neutral-500 font-medium">All customer orders</div>
        </div>

        {/* Pending Orders */}
        <div 
          onClick={() => setActiveSection('orders')}
          className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between cursor-pointer hover:border-amber-400 hover:shadow-xs transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-amber-700">
            <span className="text-sm sm:text-[15px] font-semibold">Pending Orders</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-[32px] font-extrabold text-amber-600 tracking-tight leading-none">
              {pendingOrdersCount}
            </div>
          </div>
          <div className="text-xs sm:text-[13px] text-neutral-500 font-medium">Awaiting processing or delivery</div>
        </div>

        {/* Completed Orders */}
        <div 
          onClick={() => setActiveSection('orders')}
          className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:shadow-xs transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-sm sm:text-[15px] font-semibold">Delivered Orders</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-[32px] font-extrabold text-emerald-600 tracking-tight leading-none">
              {completedOrdersCount}
            </div>
          </div>
          <div className="text-xs sm:text-[13px] text-neutral-500 font-medium">Successfully completed COD</div>
        </div>

        {/* Total Sales ৳ */}
        <div 
          onClick={() => setActiveSection('analytics')}
          className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between cursor-pointer hover:border-neutral-400 hover:shadow-xs transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-neutral-600">
            <span className="text-sm sm:text-[15px] font-semibold">Total Sales</span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {formatBDT(totalSalesBDT)}
            </div>
          </div>
          <div className="text-xs sm:text-[13px] text-neutral-500 font-medium">Gross customer volume</div>
        </div>

        {/* Total Profit ৳ */}
        <div 
          onClick={() => setActiveSection('analytics')}
          className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between cursor-pointer hover:border-emerald-400 hover:shadow-xs transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-emerald-700">
            <span className="text-sm sm:text-[15px] font-semibold">Total Profit</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 flex items-center justify-center text-emerald-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-emerald-600 tracking-tight leading-none">
              {formatBDT(totalProfitBDT)}
            </div>
          </div>
          <div className="text-xs sm:text-[13px] text-neutral-500 font-medium">Net markup earned</div>
        </div>

        {/* Available Balance ৳ */}
        <div 
          onClick={() => setActiveSection('wallet')}
          className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between cursor-pointer hover:border-neutral-400 hover:shadow-xs transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-neutral-600">
            <span className="text-sm sm:text-[15px] font-semibold">Available Balance</span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
              <Wallet className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {formatBDT(availableBalanceBDT)}
            </div>
          </div>
          <div className="text-xs sm:text-[13px] text-neutral-500 font-medium">Ready for instant payout</div>
        </div>

        {/* Pending COD ৳ */}
        <div 
          onClick={() => setActiveSection('wallet')}
          className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between cursor-pointer hover:border-neutral-400 hover:shadow-xs transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-neutral-600">
            <span className="text-sm sm:text-[15px] font-semibold">Pending COD</span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {formatBDT(pendingCODBDT)}
            </div>
          </div>
          <div className="text-xs sm:text-[13px] text-neutral-500 font-medium">In escrow / pending clearance</div>
        </div>

        {/* Active Products */}
        <div 
          onClick={() => setActiveSection('products')}
          className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between cursor-pointer hover:border-neutral-400 hover:shadow-xs transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-neutral-600">
            <span className="text-sm sm:text-[15px] font-semibold">Active Products</span>
            <div className="w-9 h-9 rounded-xl bg-neutral-100 flex items-center justify-center text-neutral-500">
              <Package className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-3xl sm:text-[32px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {activeProductsCount}
            </div>
          </div>
          <div className="text-xs sm:text-[13px] text-neutral-500 font-medium">Published in your storefront</div>
        </div>

        {/* Current Subscription */}
        <div 
          onClick={() => setActiveSection('subscription')}
          className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between cursor-pointer hover:border-neutral-400 hover:shadow-xs transition-all shadow-2xs"
        >
          <div className="flex items-center justify-between text-neutral-600">
            <span className="text-sm sm:text-[15px] font-semibold">Subscription</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500">
              <Crown className="w-5 h-5" />
            </div>
          </div>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-neutral-900 capitalize tracking-tight leading-none">
              {subscription?.planName || 'Pro Partner'}
            </div>
          </div>
          <div className="text-xs sm:text-[13px] text-emerald-600 font-semibold">
            {subscription?.status === 'active' ? 'Active Membership' : 'Renewal Pending'}
          </div>
        </div>
      </div>

      {/* Interactive Reseller Performance Chart */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">Performance Trends</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Real performance metrics calculated from your orders</p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Metric Selector */}
            <div className="flex bg-neutral-100 p-1 rounded-xl text-xs sm:text-sm font-semibold">
              <button
                onClick={() => setActiveChart('sales')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeChart === 'sales' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Sales
              </button>
              <button
                onClick={() => setActiveChart('profit')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeChart === 'profit' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Profit
              </button>
              <button
                onClick={() => setActiveChart('orders')}
                className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  activeChart === 'orders' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Orders
              </button>
            </div>

            {/* Time Period Filter */}
            <div className="flex bg-neutral-100 p-1 rounded-xl text-xs sm:text-sm font-semibold">
              {(['7d', '30d', '90d', '12m'] as TimePeriod[]).map((period) => (
                <button
                  key={period}
                  onClick={() => setTimePeriod(period)}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase ${
                    timePeriod === period ? 'bg-neutral-900 text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '12 Mo'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Visual Bar Chart */}
        <div className="pt-6">
          <div className="h-64 sm:h-72 lg:h-80 flex items-end gap-3 sm:gap-6 border-b border-neutral-100 pb-3">
            {chartData.map((bucket, i) => {
              const val = activeChart === 'orders' ? bucket.orders : activeChart === 'sales' ? bucket.sales : bucket.profit;
              const percent = maxChartValue > 0 ? Math.min(100, Math.round((val / maxChartValue) * 100)) : 0;
              const barHeight = Math.max(percent, val > 0 ? 8 : 2);

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  {/* Tooltip on Hover */}
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-11 bg-neutral-900 text-white text-xs font-mono px-2.5 py-1 rounded-lg pointer-events-none whitespace-nowrap z-10 shadow-md">
                    {activeChart === 'orders' ? `${val} orders` : formatBDT(val)}
                  </div>

                  <div 
                    className={`w-full max-w-[48px] rounded-t-xl transition-all duration-300 ${
                      activeChart === 'sales' 
                        ? 'bg-neutral-900 group-hover:bg-neutral-800' 
                        : activeChart === 'profit'
                        ? 'bg-emerald-600 group-hover:bg-emerald-700'
                        : 'bg-amber-500 group-hover:bg-amber-600'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                  <span className="text-xs text-neutral-500 font-medium truncate w-full text-center mt-1">
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between pt-4 text-xs sm:text-sm text-neutral-500 font-mono">
            <span>Range: {timePeriod.toUpperCase()}</span>
            <span className="font-semibold text-neutral-800">
              Period Total: {activeChart === 'orders' 
                ? `${filteredOrders.length} orders` 
                : formatBDT(filteredOrders.reduce((sum, o) => sum + (activeChart === 'sales' ? (o.total || 0) : (o.profitBDT || Math.round((o.total || 0) * 0.25))), 0))
              }
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Recent Orders & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
        {/* Recent Orders */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">Recent Customer Orders</h3>
            <button
              onClick={() => setActiveSection('orders')}
              className="text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              View All <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No orders received yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {orders.slice(0, 5).map((ord) => (
                <div key={ord.id} className="py-4 flex items-center justify-between gap-4 text-sm">
                  <div>
                    <div className="font-bold text-neutral-900 flex items-center gap-2 text-sm sm:text-base">
                      <span>{ord.orderNumber}</span>
                      <span className="text-neutral-300 font-normal">·</span>
                      <span className="text-neutral-700 font-semibold">{ord.customerName}</span>
                    </div>
                    <div className="text-xs sm:text-[13px] text-neutral-500 mt-1">
                      {new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {ord.courier || 'Steadfast Courier'}
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-extrabold text-neutral-900 text-sm sm:text-base">{formatBDT(ord.total)}</div>
                    <div className="text-xs sm:text-[13px] text-emerald-600 font-bold mt-0.5">
                      +{formatBDT(ord.profitBDT || Math.round(ord.total * 0.25))} profit
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Wallet Transactions */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">Recent Ledger Transactions</h3>
            <button
              onClick={() => setActiveSection('wallet')}
              className="text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 flex items-center gap-1 cursor-pointer"
            >
              View Wallet <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>

          {transactions.length === 0 ? (
            <p className="text-sm text-neutral-400 py-8 text-center">No transactions recorded yet.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {transactions.slice(0, 5).map((tx) => (
                <div key={tx.id} className="py-4 flex items-center justify-between gap-4 text-sm">
                  <div>
                    <div className="font-semibold text-neutral-900 text-sm sm:text-base line-clamp-1">{tx.description}</div>
                    <div className="text-xs sm:text-[13px] text-neutral-500 mt-1">
                      {new Date(tx.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · Ref: {tx.referenceId}
                    </div>
                  </div>

                  <div className="text-right whitespace-nowrap">
                    <div className={`font-extrabold text-sm sm:text-base ${tx.direction === 'credit' ? 'text-emerald-600' : 'text-neutral-900'}`}>
                      {tx.direction === 'credit' ? '+' : '-'}{formatBDT(tx.amountBDT)}
                    </div>
                    <span className="text-xs text-neutral-400 uppercase font-mono mt-0.5 inline-block">{tx.status}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Notifications Strip */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Bell className="w-5 h-5 text-neutral-700" />
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">Reseller Workspace Alerts</h3>
          </div>
          <button
            onClick={() => setActiveSection('notifications')}
            className="text-xs sm:text-sm font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
          >
            All Alerts
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {notifications.slice(0, 2).map((n) => (
            <div key={n.id} className="p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 text-sm space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-900 text-sm sm:text-base">{n.title}</span>
                <span className="text-xs text-neutral-400">
                  {new Date(n.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
              </div>
              <p className="text-neutral-600 text-xs sm:text-sm line-clamp-2 leading-relaxed">{n.message}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
