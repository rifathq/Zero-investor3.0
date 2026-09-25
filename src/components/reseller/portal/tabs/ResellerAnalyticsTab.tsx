'use client';

import React, { useState, useMemo } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  PieChart, 
  Calendar, 
  Award,
  Truck,
  ArrowUpRight
} from 'lucide-react';
import { formatBDT } from '@/lib/formatters';

type TimePeriod = '7d' | '30d' | '90d' | '12m';

export function ResellerAnalyticsTab() {
  const { orders, products } = useReseller();
  const [timePeriod, setTimePeriod] = useState<TimePeriod>('30d');

  // Filter orders by time period
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

  // Derived aggregate metrics
  const totalSales = filteredOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  const totalProfit = filteredOrders.reduce((sum, o) => sum + (o.profitBDT || Math.round((o.total || 0) * 0.25)), 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? Math.round(totalSales / totalOrders) : 0;
  
  const deliveredOrders = filteredOrders.filter(o => o.status === 'Delivered').length;
  const deliverySuccessRate = totalOrders > 0 ? Math.round((deliveredOrders / totalOrders) * 100) : 0;

  // Chart data buckets
  const timeBuckets = useMemo(() => {
    const count = timePeriod === '7d' ? 7 : timePeriod === '30d' ? 6 : timePeriod === '90d' ? 6 : 12;
    const now = new Date();
    const buckets: { label: string; sales: number; profit: number; orders: number }[] = [];

    for (let i = count - 1; i >= 0; i--) {
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

      const inBucket = filteredOrders.filter(o => {
        const t = new Date(o.createdAt).getTime();
        return t >= bucketStart && t <= bucketEnd;
      });

      const bSales = inBucket.reduce((sum, o) => sum + (o.total || 0), 0);
      const bProfit = inBucket.reduce((sum, o) => sum + (o.profitBDT || Math.round((o.total || 0) * 0.25)), 0);
      const bOrders = inBucket.length;

      buckets.push({ label, sales: bSales, profit: bProfit, orders: bOrders });
    }

    return buckets;
  }, [filteredOrders, timePeriod]);

  const maxBucketSales = useMemo(() => {
    return Math.max(...timeBuckets.map(b => b.sales), 1000);
  }, [timeBuckets]);

  // Top selling products calculated from real order items
  const topProducts = useMemo(() => {
    const map = new Map<string, { name: string; unitsSold: number; revenue: number; profit: number; img: string }>();

    filteredOrders.forEach((o) => {
      o.items?.forEach((item) => {
        const key = item.productId || item.productName;
        const existing = map.get(key);
        const itemRevenue = item.price * item.quantity;
        const itemProfit = Math.round(itemRevenue * 0.25);

        if (!existing) {
          map.set(key, {
            name: item.productName,
            unitsSold: item.quantity,
            revenue: itemRevenue,
            profit: itemProfit,
            img: item.imageUrl
          });
        } else {
          existing.unitsSold += item.quantity;
          existing.revenue += itemRevenue;
          existing.profit += itemProfit;
        }
      });
    });

    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders]);

  // Order status breakdown
  const statusDistribution = useMemo(() => {
    const counts: Record<string, number> = {
      'Delivered': 0,
      'Shipped': 0,
      'Processing': 0,
      'Confirmed': 0,
      'Pending': 0,
      'Cancelled': 0
    };

    filteredOrders.forEach((o) => {
      const s = o.status || 'Pending';
      if (counts[s] !== undefined) {
        counts[s]++;
      } else {
        counts[s] = 1;
      }
    });

    return counts;
  }, [filteredOrders]);

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Top Header & Time Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Store Analytics &amp; Reports</h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            Performance metrics derived exclusively from your store sales
          </p>
        </div>

        <div className="flex bg-white border border-neutral-300 p-1.5 rounded-xl text-xs sm:text-sm font-semibold shadow-2xs self-start sm:self-auto">
          {(['7d', '30d', '90d', '12m'] as TimePeriod[]).map((period) => (
            <button
              key={period}
              onClick={() => setTimePeriod(period)}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer uppercase ${
                timePeriod === period
                  ? 'bg-neutral-900 text-white shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : period === '90d' ? '90 Days' : '12 Months'}
            </button>
          ))}
        </div>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Period Sales
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {formatBDT(totalSales)}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium">{totalOrders} orders in range</p>
        </div>

        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Net Profit Earned
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-emerald-600 tracking-tight leading-none">
              {formatBDT(totalProfit)}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-emerald-700 font-semibold">
            {totalSales > 0 ? `${Math.round((totalProfit / totalSales) * 100)}% margin` : '0% margin'}
          </p>
        </div>

        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Avg Order Value (AOV)
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {formatBDT(averageOrderValue)}
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium">Per customer checkout</p>
        </div>

        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 min-h-[155px] flex flex-col justify-between shadow-2xs hover:shadow-xs transition-all">
          <span className="text-sm sm:text-[15px] font-semibold text-neutral-600 block">
            Delivery Success Rate
          </span>
          <div className="my-2">
            <div className="text-2xl sm:text-3xl lg:text-[32px] font-extrabold text-neutral-900 tracking-tight leading-none">
              {deliverySuccessRate}%
            </div>
          </div>
          <p className="text-xs sm:text-[13px] text-neutral-500 font-medium">{deliveredOrders} delivered shipments</p>
        </div>
      </div>

      {/* Visual Sales & Profit Trend */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight">Sales &amp; Profit Trends Over Time</h2>
            <p className="text-sm text-neutral-500 mt-0.5">Comparing gross customer order volume and net profit margin</p>
          </div>

          <div className="flex items-center gap-5 text-xs sm:text-sm font-semibold">
            <span className="flex items-center gap-2 text-neutral-900">
              <span className="w-3 h-3 rounded-full bg-neutral-900" /> Gross Sales
            </span>
            <span className="flex items-center gap-2 text-emerald-600">
              <span className="w-3 h-3 rounded-full bg-emerald-600" /> Net Profit
            </span>
          </div>
        </div>

        {/* Dual Bar Chart */}
        <div className="pt-6">
          <div className="h-64 sm:h-72 lg:h-80 flex items-end gap-3 sm:gap-6 border-b border-neutral-100 pb-3">
            {timeBuckets.map((bucket, i) => {
              const salesPct = maxBucketSales > 0 ? Math.min(100, Math.round((bucket.sales / maxBucketSales) * 100)) : 0;
              const profitPct = maxBucketSales > 0 ? Math.min(100, Math.round((bucket.profit / maxBucketSales) * 100)) : 0;

              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity absolute -top-12 bg-neutral-900 text-white text-xs font-mono px-3 py-1.5 rounded-lg pointer-events-none whitespace-nowrap z-10 space-y-0.5 shadow-md">
                    <div>Sales: {formatBDT(bucket.sales)}</div>
                    <div className="text-emerald-400">Profit: {formatBDT(bucket.profit)}</div>
                  </div>

                  <div className="w-full flex items-end justify-center gap-1 sm:gap-2 h-full">
                    {/* Sales Bar */}
                    <div 
                      className="w-1/2 max-w-[24px] bg-neutral-900 rounded-t-md transition-all duration-200"
                      style={{ height: `${Math.max(salesPct, bucket.sales > 0 ? 8 : 2)}%` }}
                    />
                    {/* Profit Bar */}
                    <div 
                      className="w-1/2 max-w-[24px] bg-emerald-600 rounded-t-md transition-all duration-200"
                      style={{ height: `${Math.max(profitPct, bucket.profit > 0 ? 6 : 2)}%` }}
                    />
                  </div>
                  <span className="text-xs text-neutral-500 font-medium truncate w-full text-center mt-1">
                    {bucket.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Two Column Grid: Top Products & Status Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
        {/* Top Selling Products (2 cols) */}
        <div className="lg:col-span-2 bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
              <Award className="w-5 h-5 text-amber-500" /> Top Selling Products
            </h3>
            <span className="text-xs sm:text-sm text-neutral-400">Ranked by revenue</span>
          </div>

          {topProducts.length === 0 ? (
            <p className="text-sm text-neutral-400 py-10 text-center">No product sales in selected time period.</p>
          ) : (
            <div className="divide-y divide-neutral-100">
              {topProducts.slice(0, 5).map((p, idx) => (
                <div key={idx} className="py-4 flex items-center justify-between gap-4 text-sm">
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span className="w-6 text-center font-bold text-neutral-400 text-sm shrink-0">
                      #{idx + 1}
                    </span>
                    <img src={p.img} alt="" className="w-12 h-12 rounded-xl object-cover border border-neutral-200 shrink-0" />
                    <div className="min-w-0">
                      <h4 className="font-bold text-sm sm:text-base text-neutral-900 truncate">{p.name}</h4>
                      <p className="text-xs sm:text-[13px] text-neutral-500 mt-0.5">{p.unitsSold} units delivered</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <div className="font-extrabold text-sm sm:text-base text-neutral-900">{formatBDT(p.revenue)}</div>
                    <div className="text-xs sm:text-[13px] text-emerald-600 font-bold mt-0.5">
                      +{formatBDT(p.profit)} profit
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status Breakdown (1 col) */}
        <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-7 space-y-5 shadow-xs">
          <h3 className="text-lg sm:text-xl font-bold text-neutral-900 tracking-tight flex items-center gap-2">
            <PieChart className="w-5 h-5 text-neutral-600" /> Fulfillment Status
          </h3>

          <div className="space-y-4 pt-1">
            {Object.entries(statusDistribution).map(([status, count]) => {
              const pct = totalOrders > 0 ? Math.round((count / totalOrders) * 100) : 0;
              return (
                <div key={status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium text-neutral-700">{status}</span>
                    <span className="font-bold text-neutral-900">{count} ({pct}%)</span>
                  </div>
                  <div className="w-full h-2 bg-neutral-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full ${
                        status === 'Delivered'
                          ? 'bg-emerald-600'
                          : status === 'Shipped' || status === 'Processing'
                          ? 'bg-blue-600'
                          : status === 'Cancelled'
                          ? 'bg-rose-500'
                          : 'bg-amber-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
