'use client';

import React, { useState, useMemo } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { Order } from '@/types/marketplace';
import { 
  Search, 
  Eye, 
  Truck, 
  MapPin, 
  Phone, 
  Mail, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Package, 
  X,
  Copy,
  Check,
  ExternalLink,
  ShieldCheck,
  AlertCircle,
  Building2
} from 'lucide-react';
import { formatBDT } from '@/lib/formatters';

export function ResellerOrdersTab() {
  const { orders } = useReseller();

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [courierFilter, setCourierFilter] = useState<string>('all');

  // Selected Order for Modal
  const [selectedOrder, setSelectedOrder] = useState<(Order & { profitBDT?: number; courier?: string }) | null>(null);

  // Copy tracking feedback state
  const [copiedTracking, setCopiedTracking] = useState(false);

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchNum = (o.orderNumber || o.id).toLowerCase().includes(q);
        const matchCust = (o.customerName || '').toLowerCase().includes(q);
        const matchPhone = (o.customerPhone || o.shippingAddress?.phone || '').includes(q);
        const matchTrack = (o.trackingNumber || '').toLowerCase().includes(q);
        if (!matchNum && !matchCust && !matchPhone && !matchTrack) return false;
      }

      if (statusFilter !== 'all' && (o.status || '').toLowerCase() !== statusFilter.toLowerCase()) {
        return false;
      }

      if (courierFilter !== 'all' && (o.courier || (o as any).carrier || '').toLowerCase() !== courierFilter.toLowerCase()) {
        return false;
      }

      return true;
    });
  }, [orders, searchQuery, statusFilter, courierFilter]);

  const openOrderModal = (ord: Order & { profitBDT?: number; courier?: string }) => {
    setSelectedOrder(ord);
    setCopiedTracking(false);
  };

  const handleCopyTracking = (code: string) => {
    if (!code) return;
    navigator.clipboard.writeText(code);
    setCopiedTracking(true);
    setTimeout(() => {
      setCopiedTracking(false);
    }, 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'shipped':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'processing':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'confirmed':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'pending':
        return 'bg-yellow-50 text-yellow-700 border-yellow-200';
      case 'cancelled':
      case 'returned':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      default:
        return 'bg-neutral-50 text-neutral-700 border-neutral-200';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'delivered':
        return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
      case 'shipped':
        return <Truck className="w-4 h-4 text-blue-600" />;
      case 'processing':
      case 'confirmed':
      case 'pending':
        return <Clock className="w-4 h-4 text-amber-600" />;
      case 'cancelled':
      case 'returned':
        return <XCircle className="w-4 h-4 text-rose-600" />;
      default:
        return <Package className="w-4 h-4 text-neutral-500" />;
    }
  };

  const getCourierLink = (courier: string, trackingNumber: string) => {
    const c = (courier || '').toLowerCase();
    if (c.includes('pathao')) {
      return `https://pathao.com/courier/`;
    }
    if (c.includes('steadfast')) {
      return `https://steadfast.com.bd/tracking?consignment_id=${encodeURIComponent(trackingNumber)}`;
    }
    if (c.includes('redx')) {
      return `https://redx.com.bd/track`;
    }
    return `https://steadfast.com.bd/tracking`;
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Customer Orders</h1>
          <p className="text-sm text-neutral-500 mt-1.5">
            Orders placed on your storefront ({orders.length} total shipments) • Nationwide fulfillment by Central Logistics
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-5 sm:p-6 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row gap-3 sm:gap-4">
          <div className="relative flex-1">
            <Search className="w-4.5 h-4.5 absolute left-3.5 top-3 text-neutral-400" />
            <input
              type="text"
              placeholder="Search by Order #, customer name, phone, or tracking code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-11 pr-4 py-2.5 sm:py-3 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-3 text-neutral-400 hover:text-neutral-700 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap gap-2.5">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-700 font-medium cursor-pointer"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="processing">Processing</option>
              <option value="shipped">Shipped</option>
              <option value="delivered">Delivered</option>
              <option value="cancelled">Cancelled</option>
              <option value="returned">Returned</option>
            </select>

            <select
              value={courierFilter}
              onChange={(e) => setCourierFilter(e.target.value)}
              className="px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-neutral-900 text-neutral-700 font-medium cursor-pointer"
            >
              <option value="all">All Couriers</option>
              <option value="steadfast courier">Steadfast Courier</option>
              <option value="pathao courier">Pathao Courier</option>
              <option value="redx delivery">RedX Delivery</option>
            </select>
          </div>
        </div>
      </div>

      {/* Orders Table */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl overflow-hidden shadow-xs">
        {filteredOrders.length === 0 ? (
          <div className="py-20 text-center space-y-3">
            <Package className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-base font-semibold text-neutral-700">No matching orders</p>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
              Orders placed by customers browsing your store will appear here in real-time.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#FAF9F5] border-b border-[#E6E4E0] text-neutral-500 uppercase tracking-wider text-xs font-bold">
                <tr>
                  <th className="py-4 px-5">Order ID &amp; Date</th>
                  <th className="py-4 px-5">Customer</th>
                  <th className="py-4 px-5">Items Summary</th>
                  <th className="py-4 px-5 text-right">Total (BDT)</th>
                  <th className="py-4 px-5 text-right">Delivery Fee</th>
                  <th className="py-4 px-5 text-right">Profit</th>
                  <th className="py-4 px-5">Payment</th>
                  <th className="py-4 px-5">Assigned Courier</th>
                  <th className="py-4 px-5 text-center">Status</th>
                  <th className="py-4 px-5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredOrders.map((ord) => {
                  const profit = ord.profitBDT || Math.round((ord.total || 0) * 0.25);
                  const itemCount = ord.items?.reduce((sum, i) => sum + i.quantity, 0) || 1;
                  const courierName = ord.courier || (ord as any).carrier || 'Steadfast Courier';

                  return (
                    <tr key={ord.id} className="hover:bg-neutral-50/80 transition-colors">
                      {/* Order ID & Date */}
                      <td className="py-4.5 sm:py-5 px-5">
                        <div className="font-bold text-sm sm:text-base text-neutral-900">{ord.orderNumber || ord.id}</div>
                        <div className="text-xs sm:text-[13px] text-neutral-500 mt-0.5">
                          {new Date(ord.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </div>
                      </td>

                      {/* Customer */}
                      <td className="py-4.5 sm:py-5 px-5">
                        <div className="font-semibold text-sm sm:text-base text-neutral-900">{ord.customerName}</div>
                        <div className="text-xs sm:text-[13px] text-neutral-500 font-mono mt-0.5">{ord.customerPhone || ord.shippingAddress?.phone}</div>
                      </td>

                      {/* Items */}
                      <td className="py-4.5 sm:py-5 px-5">
                        <div className="text-neutral-800 font-medium text-sm truncate max-w-[200px]">
                          {ord.items?.[0]?.productName || (ord.items?.[0] as any)?.name || 'Catalog Product'}
                        </div>
                        <div className="text-xs text-neutral-400 mt-0.5">
                          {itemCount} item{itemCount > 1 ? 's' : ''} total
                        </div>
                      </td>

                      {/* Total */}
                      <td className="py-4.5 sm:py-5 px-5 text-right font-extrabold text-sm sm:text-base text-neutral-900 font-mono">
                        {formatBDT(ord.total || (ord as any).totalAmount || 0)}
                      </td>

                      {/* Delivery Fee */}
                      <td className="py-4.5 sm:py-5 px-5 text-right text-neutral-500 font-medium text-sm font-mono">
                        {formatBDT(ord.shipping || (ord as any).deliveryFee || 70)}
                      </td>

                      {/* Profit */}
                      <td className="py-4.5 sm:py-5 px-5 text-right font-extrabold text-sm sm:text-base text-emerald-600 font-mono">
                        +{formatBDT(profit)}
                      </td>

                      {/* Payment */}
                      <td className="py-4.5 sm:py-5 px-5">
                        <span className="uppercase text-xs sm:text-[13px] font-mono font-semibold text-neutral-700">
                          {ord.paymentMethod === 'cod' ? 'Cash on Delivery' : ord.paymentMethod}
                        </span>
                      </td>

                      {/* Courier */}
                      <td className="py-4.5 sm:py-5 px-5 text-neutral-700 font-medium text-sm">
                        <div className="flex items-center gap-1.5">
                          <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                          <span className="truncate max-w-[130px]">{courierName}</span>
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-4.5 sm:py-5 px-5 text-center">
                        <span className={`inline-block px-3 py-1 rounded-md text-xs font-semibold border ${getStatusBadge(ord.status)}`}>
                          {ord.status}
                        </span>
                      </td>

                      {/* Action */}
                      <td className="py-4.5 sm:py-5 px-5 text-right">
                        <button
                          onClick={() => openOrderModal(ord)}
                          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border border-neutral-300 text-neutral-700 hover:bg-neutral-100 transition-colors font-semibold text-xs sm:text-sm cursor-pointer shadow-2xs"
                        >
                          <Eye className="w-4 h-4" /> Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Read-Only Order Details & Logistics Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/60 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 my-8">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <div>
                <div className="flex items-center gap-2.5">
                  <h3 className="text-lg sm:text-xl font-bold text-neutral-900 font-mono">
                    Order #{selectedOrder.orderNumber || selectedOrder.id}
                  </h3>
                  <span className={`px-2.5 py-0.5 rounded text-xs font-semibold border ${getStatusBadge(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-neutral-400 mt-1">
                  Placed on {new Date(selectedOrder.createdAt).toLocaleString()}
                </p>
              </div>

              <button
                onClick={() => setSelectedOrder(null)}
                className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Customer & Shipping Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm bg-neutral-50 p-5 rounded-2xl border border-neutral-200">
              <div className="space-y-2">
                <span className="font-bold text-neutral-400 uppercase text-xs tracking-wider block">
                  Customer Information
                </span>
                <p className="font-bold text-base text-neutral-900">{selectedOrder.customerName}</p>
                <div className="flex items-center gap-2 text-neutral-600">
                  <Phone className="w-4 h-4 text-neutral-400" />
                  <span className="font-mono text-sm">{selectedOrder.customerPhone || selectedOrder.shippingAddress?.phone}</span>
                </div>
                {selectedOrder.customerEmail && (
                  <div className="flex items-center gap-2 text-neutral-600">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <span>{selectedOrder.customerEmail}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <span className="font-bold text-neutral-400 uppercase text-xs tracking-wider block">
                  Delivery Destination
                </span>
                <div className="flex items-start gap-2 text-neutral-700 leading-relaxed">
                  <MapPin className="w-4.5 h-4.5 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">{selectedOrder.shippingAddress?.street || (selectedOrder as any).customerAddress || 'Delivery Address'}</p>
                    <p className="text-xs sm:text-sm text-neutral-600">{selectedOrder.shippingAddress?.city || (selectedOrder as any).customerCity || 'Bangladesh'}</p>
                    <p className="text-xs text-neutral-400 mt-0.5">{selectedOrder.shippingAddress?.country || 'Bangladesh'}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Products Ordered */}
            <div className="space-y-3">
              <span className="font-bold text-neutral-400 uppercase text-xs tracking-wider">
                Products &amp; Pricing
              </span>
              <div className="border border-neutral-200 rounded-2xl divide-y divide-neutral-100 overflow-hidden text-sm">
                {selectedOrder.items?.map((item, idx) => (
                  <div key={idx} className="p-4 flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3.5">
                      <img
                        src={item.imageUrl || (item as any).image}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-neutral-200"
                      />
                      <div>
                        <h5 className="font-bold text-sm sm:text-base text-neutral-900">{item.productName || (item as any).name}</h5>
                        <p className="text-xs text-neutral-500 mt-0.5 font-mono">
                          Qty: {item.quantity} × {formatBDT(item.price)}
                        </p>
                      </div>
                    </div>
                    <div className="font-extrabold text-sm sm:text-base text-neutral-900 font-mono">
                      {formatBDT(item.price * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Breakdown */}
            <div className="p-5 bg-[#FAF9F5] rounded-2xl border border-[#E6E4E0] space-y-2 text-sm">
              <div className="flex justify-between text-neutral-600">
                <span>Subtotal:</span>
                <span className="font-medium font-mono">{formatBDT(selectedOrder.subtotal || selectedOrder.total || (selectedOrder as any).totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-neutral-600">
                <span>Delivery Charge:</span>
                <span className="font-medium font-mono">{formatBDT(selectedOrder.shipping || (selectedOrder as any).deliveryFee || 70)}</span>
              </div>
              <div className="flex justify-between text-base sm:text-lg font-bold text-neutral-900 pt-2 border-t border-neutral-200">
                <span>Grand Total ({selectedOrder.paymentMethod === 'cod' ? 'COD' : 'Online'}):</span>
                <span className="font-mono">{formatBDT(selectedOrder.total || (selectedOrder as any).totalAmount || 0)}</span>
              </div>
              <div className="flex justify-between text-sm sm:text-base font-bold text-emerald-600 pt-1">
                <span>Your Reseller Profit:</span>
                <span className="font-mono">+{formatBDT(selectedOrder.profitBDT || Math.round((selectedOrder.total || 0) * 0.25))}</span>
              </div>
            </div>

            {/* Read-Only Delivery & Logistics Info Card */}
            <div className="p-5 rounded-2xl border border-neutral-200 bg-neutral-50/80 space-y-4 text-sm">
              <div className="flex items-center justify-between border-b border-neutral-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-neutral-700" />
                  <span className="font-bold text-neutral-800 text-xs sm:text-sm uppercase tracking-wider">
                    Delivery &amp; Logistics Info
                  </span>
                </div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                  Central Warehouse Managed
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                {/* Order Status Badge */}
                <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Order Status
                  </span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(selectedOrder.status)}
                    <span className={`px-2.5 py-0.5 rounded-md text-xs font-bold border ${getStatusBadge(selectedOrder.status)}`}>
                      {selectedOrder.status}
                    </span>
                  </div>
                </div>

                {/* Assigned Courier */}
                <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Assigned Courier
                  </span>
                  <div className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span className="font-bold text-neutral-900 text-sm truncate">
                      {selectedOrder.courier || (selectedOrder as any).carrier || 'Steadfast Courier'}
                    </span>
                  </div>
                </div>

                {/* Tracking Code with 1-Click Copy & Track Link */}
                <div className="bg-white p-3.5 rounded-xl border border-neutral-200 shadow-2xs space-y-1.5">
                  <span className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Tracking Code
                  </span>
                  {selectedOrder.trackingNumber ? (
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="font-mono font-bold text-neutral-900 text-xs sm:text-sm truncate">
                        {selectedOrder.trackingNumber}
                      </span>
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(selectedOrder.trackingNumber!)}
                          title="Copy Tracking Code"
                          className="p-1 rounded-md text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
                        >
                          {copiedTracking ? (
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                        </button>
                        <a
                          href={getCourierLink(
                            selectedOrder.courier || (selectedOrder as any).carrier || 'Steadfast Courier',
                            selectedOrder.trackingNumber
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          title="Track on Courier Portal"
                          className="p-1 rounded-md text-neutral-500 hover:text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  ) : (
                    <div className="text-xs text-neutral-400 font-medium">
                      Generated upon packaging
                    </div>
                  )}
                </div>
              </div>

              {/* Helper note */}
              <div className="p-3 bg-neutral-100/80 rounded-xl flex items-start gap-2.5 text-xs text-neutral-600 border border-neutral-200/60">
                <AlertCircle className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                <p>
                  Managed by Central Logistics Warehouse. Status updates automatically in real-time.
                </p>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
