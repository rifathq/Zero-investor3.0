'use client';

import React, { useState, useEffect } from 'react';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useMarketplace } from '@/context/MarketplaceContext';
import { formatBDT } from '@/lib/formatters';
import { 
  Search, 
  Package, 
  Truck, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  X, 
  ShieldCheck, 
  MapPin, 
  Phone, 
  ExternalLink,
  Loader2,
  Copy,
  Check
} from 'lucide-react';

interface PublicOrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
  initialQuery?: string;
}

export interface CustomerSafeOrder {
  id: string;
  orderNumber: string;
  customerName: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  items: Array<{
    productName: string;
    quantity: number;
    price: number;
    imageUrl?: string;
  }>;
  totalAmount: number;
  deliveryFee?: number;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  courier?: string;
  trackingNumber?: string;
  createdAt: string;
  estimatedDelivery?: string;
}

export function PublicOrderTrackingModal({
  isOpen,
  onClose,
  storeName = 'Official Storefront',
  initialQuery = ''
}: PublicOrderTrackingModalProps) {
  const { orders: localOrders } = useMarketplace();
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [isLoading, setIsLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [foundOrder, setFoundOrder] = useState<CustomerSafeOrder | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  // Real-time Firestore subscription for the tracked order
  useEffect(() => {
    if (!foundOrder?.id || !isFirebaseConfigured || !db) return;

    const unsub = onSnapshot(
      doc(db, 'orders', foundOrder.id),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setFoundOrder(prev => {
            if (!prev) return null;
            return {
              ...prev,
              status: data.status || prev.status,
              courier: data.courier || data.carrier || prev.courier,
              trackingNumber: data.trackingNumber || prev.trackingNumber,
              paymentStatus: data.paymentStatus || prev.paymentStatus,
              estimatedDelivery: data.estimatedDelivery || prev.estimatedDelivery
            };
          });
        }
      },
      (err) => {
        console.warn('[PublicOrderTrackingModal] Real-time tracking subscription notice:', err);
      }
    );

    return () => {
      unsub();
    };
  }, [foundOrder?.id]);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getCourierPortalLink = (courierName: string, trackingNumber?: string) => {
    const c = (courierName || '').toLowerCase();
    if (c.includes('pathao')) {
      return `https://pathao.com/courier/`;
    }
    if (c.includes('steadfast')) {
      return trackingNumber 
        ? `https://steadfast.com.bd/tracking?consignment_id=${encodeURIComponent(trackingNumber)}`
        : `https://steadfast.com.bd/tracking`;
    }
    if (c.includes('redx')) {
      return `https://redx.com.bd/track`;
    }
    return `https://steadfast.com.bd/tracking`;
  };

  const handleTrack = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanQ = searchQuery.trim();
    if (!cleanQ) {
      setErrorMessage('Please enter a valid Order ID (e.g., #ORD-1024) or Phone Number.');
      return;
    }

    setIsLoading(true);
    setSearched(true);
    setErrorMessage(null);
    setFoundOrder(null);
    setCopiedCode(false);

    const normQ = cleanQ.toLowerCase().replace(/[^a-z0-9]/g, '');
    const phoneDigits = cleanQ.replace(/[^0-9]/g, '');

    try {
      // 1. Search in local context / localStorage first
      let matched: CustomerSafeOrder | null = null;

      // Check local context orders
      for (const ord of localOrders) {
        const ordNumClean = (ord.orderNumber || ord.id).toLowerCase().replace(/[^a-z0-9]/g, '');
        const ordPhoneClean = (ord.customerPhone || ord.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
        const ordTrackingClean = (ord.trackingNumber || '').toLowerCase().replace(/[^a-z0-9]/g, '');

        if (
          ordNumClean.includes(normQ) || 
          normQ.includes(ordNumClean) || 
          (phoneDigits.length >= 10 && ordPhoneClean.endsWith(phoneDigits.slice(-10))) ||
          (ordTrackingClean && (ordTrackingClean.includes(normQ) || normQ.includes(ordTrackingClean)))
        ) {
          matched = {
            id: ord.id,
            orderNumber: ord.orderNumber || ord.id,
            customerName: ord.customerName || 'Customer',
            customerPhone: ord.customerPhone || ord.shippingAddress?.phone,
            customerAddress: ord.shippingAddress?.street,
            customerCity: ord.shippingAddress?.city,
            items: (ord.items || []).map(it => ({
              productName: it.productName || (it as any).name || 'Store Product',
              quantity: it.quantity || 1,
              price: it.price || 0,
              imageUrl: it.imageUrl
            })),
            totalAmount: ord.total || (ord as any).totalAmount || 0,
            deliveryFee: ord.shipping || 60,
            status: ord.status || 'Pending',
            paymentMethod: ord.paymentMethod || 'Cash on Delivery',
            paymentStatus: ord.paymentStatus || 'unpaid_cod',
            courier: ord.courier || (ord as any).carrier || 'Steadfast Courier',
            trackingNumber: ord.trackingNumber || `STF-${ord.orderNumber || ord.id}`,
            createdAt: ord.createdAt || new Date().toISOString(),
            estimatedDelivery: ord.estimatedDelivery || '2–3 Business Days'
          };
          break;
        }
      }

      // Check localStorage for any guest orders stored on this device
      if (!matched && typeof window !== 'undefined') {
        const guestOrdersRaw = localStorage.getItem('zero_invest_orders_guest');
        if (guestOrdersRaw) {
          try {
            const guestOrders = JSON.parse(guestOrdersRaw);
            if (Array.isArray(guestOrders)) {
              for (const ord of guestOrders) {
                const ordNumClean = (ord.orderNumber || ord.id || '').toLowerCase().replace(/[^a-z0-9]/g, '');
                const ordPhoneClean = (ord.customerPhone || ord.shippingAddress?.phone || '').replace(/[^0-9]/g, '');
                if (
                  ordNumClean.includes(normQ) || 
                  normQ.includes(ordNumClean) ||
                  (phoneDigits.length >= 10 && ordPhoneClean.endsWith(phoneDigits.slice(-10)))
                ) {
                  matched = {
                    id: ord.id,
                    orderNumber: ord.orderNumber || ord.id,
                    customerName: ord.customerName || 'Customer',
                    customerPhone: ord.customerPhone || ord.shippingAddress?.phone,
                    customerAddress: ord.customerAddress || ord.shippingAddress?.street,
                    customerCity: ord.customerCity || ord.shippingAddress?.city,
                    items: (ord.items || []).map((it: any) => ({
                      productName: it.productName || it.name || 'Store Product',
                      quantity: it.quantity || 1,
                      price: it.price || 0,
                      imageUrl: it.imageUrl
                    })),
                    totalAmount: ord.totalAmount || ord.totalAmountBDT || ord.total || 0,
                    deliveryFee: ord.shipping || 60,
                    status: ord.status || 'Pending',
                    paymentMethod: ord.paymentMethod || 'Cash on Delivery',
                    paymentStatus: ord.paymentStatus || 'unpaid_cod',
                    courier: ord.courier || (ord as any).carrier || 'Steadfast Courier',
                    trackingNumber: ord.trackingNumber || `STF-${ord.orderNumber || ord.id}`,
                    createdAt: ord.createdAt || new Date().toISOString(),
                    estimatedDelivery: ord.estimatedDelivery || '2–3 Business Days'
                  };
                  break;
                }
              }
            }
          } catch (e) {}
        }
      }

      // 2. Query Firestore directly if configured
      if (!matched && isFirebaseConfigured && db) {
        const ordersRef = collection(db, 'orders');

        // Query by orderNumber
        try {
          const qOrderNum = query(ordersRef, where('orderNumber', '==', cleanQ));
          const snapOrderNum = await getDocs(qOrderNum);
          if (!snapOrderNum.empty) {
            const docData = snapOrderNum.docs[0].data();
            matched = formatFirestoreOrder(snapOrderNum.docs[0].id, docData);
          }
        } catch (e) {}

        // Query by direct document ID if still not found
        if (!matched) {
          try {
            const docRef = doc(db, 'orders', cleanQ);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
              matched = formatFirestoreOrder(docSnap.id, docSnap.data());
            }
          } catch (e) {}
        }

        // Query by customer phone
        if (!matched && phoneDigits.length >= 10) {
          try {
            const qPhone = query(ordersRef, where('customerPhone', '==', cleanQ));
            const snapPhone = await getDocs(qPhone);
            if (!snapPhone.empty) {
              const docData = snapPhone.docs[0].data();
              matched = formatFirestoreOrder(snapPhone.docs[0].id, docData);
            }
          } catch (e) {}
        }
      }

      if (matched) {
        setFoundOrder(matched);
      } else {
        setErrorMessage(
          `No order found matching "${cleanQ}". Please verify your Order Number or Bangladeshi 11-digit phone number and try again.`
        );
      }
    } catch (err) {
      console.error('Order tracking search error:', err);
      setErrorMessage('Could not complete order lookup. Please try again in a moment.');
    } finally {
      setIsLoading(false);
    }
  };

  const formatFirestoreOrder = (id: string, data: any): CustomerSafeOrder => {
    return {
      id,
      orderNumber: data.orderNumber || id,
      customerName: data.customerName || 'Customer',
      customerPhone: data.customerPhone,
      customerAddress: data.customerAddress,
      customerCity: data.customerCity,
      items: (data.items || []).map((it: any) => ({
        productName: it.productName || it.name || 'Product',
        quantity: it.quantity || 1,
        price: it.price || it.sellingPriceBDT || 0,
        imageUrl: it.imageUrl
      })),
      totalAmount: data.totalAmount || data.totalAmountBDT || data.total || 0,
      deliveryFee: data.deliveryFee || data.deliveryFeeBDT || data.shipping || 60,
      status: data.status || 'Pending',
      paymentMethod: data.paymentMethod || 'Cash on Delivery',
      paymentStatus: data.paymentStatus || (data.paymentMethod === 'cod' ? 'unpaid_cod' : 'paid'),
      courier: data.courier || data.carrier || 'Steadfast Courier',
      trackingNumber: data.trackingNumber || `STF-${data.orderNumber || id}`,
      createdAt: data.createdAt || new Date().toISOString(),
      estimatedDelivery: data.estimatedDelivery || '2–3 Business Days'
    };
  };

  // Helper for tracking progress steps
  const getProgressStepIndex = (status: string): number => {
    const s = status.toLowerCase();
    if (s === 'delivered') return 4;
    if (s === 'shipped' || s === 'in transit' || s === 'out for delivery' || s === 'handed over to courier') return 3;
    if (s === 'processing' || s === 'packaging' || s === 'packed' || s === 'confirmed') return 2;
    return 1; // Order Placed / Pending
  };

  const currentStep = foundOrder ? getProgressStepIndex(foundOrder.status) : 1;

  const steps = [
    { num: 1, title: 'Order Placed', desc: 'Received & verified' },
    { num: 2, title: 'Packaging Hub', desc: 'Quality checked & packed' },
    { num: 3, title: 'With Courier', desc: 'Handed to Steadfast/Pathao' },
    { num: 4, title: 'Delivered', desc: 'Completed successfully' }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-neutral-950/70 backdrop-blur-sm animate-in fade-in duration-200 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-neutral-200 overflow-hidden my-6 animate-in zoom-in-95 duration-200">
        
        {/* Header Strip */}
        <div className="bg-neutral-900 text-white p-5 sm:p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/15">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-white">Track Your Order</h3>
              <p className="text-xs text-neutral-400">{storeName} • Live Logistics Consignment</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-neutral-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Search Input Form */}
          <form onSubmit={handleTrack} className="space-y-3">
            <label className="text-xs font-bold text-neutral-700 uppercase tracking-wider block">
              Enter Order ID or Mobile Number
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="e.g. ORD-1024 or 017XXXXXXXX"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-neutral-50 hover:bg-white focus:bg-white border border-neutral-300 rounded-2xl text-xs sm:text-sm font-medium focus:outline-none focus:ring-2 focus:ring-neutral-900 transition-colors font-mono"
                />
              </div>
              <button
                type="submit"
                disabled={isLoading}
                className="px-6 py-3 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-98 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Searching...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Track Order</span>
                  </>
                )}
              </button>
            </div>
            <p className="text-[11px] text-neutral-500">
              💡 Tip: Enter the 11-digit mobile number you provided during checkout or your Order # (from SMS).
            </p>
          </form>

          {/* Error Message */}
          {errorMessage && (
            <div className="p-4 bg-rose-50 border border-rose-200/80 rounded-2xl text-rose-800 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">{errorMessage}</p>
                <p className="text-[11px] text-rose-600 mt-1">
                  Need help? Contact {storeName} customer support or helpline directly.
                </p>
              </div>
            </div>
          )}

          {/* Found Order Card */}
          {foundOrder && (
            <div className="space-y-6 pt-2 animate-in fade-in slide-in-from-bottom-2 duration-200">
              
              {/* Status Header Badge Card */}
              <div className="bg-[#FAF9F5] border border-[#E6E4E0] rounded-2xl p-4 sm:p-5 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-neutral-200/60 pb-3">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Order Reference</span>
                    <h4 className="text-base sm:text-lg font-black text-neutral-900 font-mono">
                      #{foundOrder.orderNumber}
                    </h4>
                  </div>
                  <div className="sm:text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block">Current Status</span>
                    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold border ${
                      foundOrder.status.toLowerCase() === 'delivered'
                        ? 'bg-emerald-100 text-emerald-800 border-emerald-300'
                        : foundOrder.status.toLowerCase() === 'shipped' || foundOrder.status.toLowerCase() === 'in transit'
                        ? 'bg-blue-100 text-blue-800 border-blue-300'
                        : 'bg-amber-100 text-amber-800 border-amber-300'
                    }`}>
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      {foundOrder.status}
                    </span>
                  </div>
                </div>

                {/* 4-Step Progress Bar */}
                <div className="py-2">
                  <div className="relative">
                    {/* Background connector line */}
                    <div className="absolute top-4 left-6 right-6 h-1 bg-neutral-200 -z-0 rounded-full" />
                    {/* Active connector line */}
                    <div 
                      className="absolute top-4 left-6 h-1 bg-emerald-600 -z-0 rounded-full transition-all duration-500" 
                      style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 88}%` }}
                    />

                    <div className="grid grid-cols-4 gap-2 relative z-10">
                      {steps.map((step) => {
                        const isCompleted = currentStep >= step.num;
                        const isCurrent = currentStep === step.num;

                        return (
                          <div key={step.num} className="text-center flex flex-col items-center">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-all shadow-xs ${
                              isCompleted
                                ? 'bg-emerald-600 text-white ring-4 ring-emerald-100'
                                : 'bg-white border-2 border-neutral-300 text-neutral-400'
                            }`}>
                              {isCompleted ? <CheckCircle2 className="w-4 h-4" /> : step.num}
                            </div>
                            <span className={`text-[11px] font-bold mt-2 truncate max-w-full ${
                              isCurrent ? 'text-emerald-800' : isCompleted ? 'text-neutral-900' : 'text-neutral-400'
                            }`}>
                              {step.title}
                            </span>
                            <span className="hidden sm:block text-[10px] text-neutral-500 mt-0.5 leading-tight">
                              {step.desc}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Courier Details Strip */}
                <div className="pt-3 border-t border-neutral-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs bg-white p-3.5 rounded-xl border border-neutral-200">
                  <div className="space-y-0.5">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                      Assigned Courier &amp; Consignment ID
                    </span>
                    <div className="flex flex-wrap items-center gap-2">
                      <Truck className="w-4 h-4 text-emerald-600 shrink-0" />
                      <span className="font-bold text-neutral-900">{foundOrder.courier || 'Steadfast Courier'}</span>
                      {foundOrder.trackingNumber && (
                        <div className="inline-flex items-center gap-1 bg-neutral-100 px-2 py-0.5 rounded-md border border-neutral-200">
                          <span className="font-mono font-bold text-neutral-800 text-[11px]">
                            {foundOrder.trackingNumber}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleCopy(foundOrder.trackingNumber!)}
                            title="Copy Consignment ID"
                            className="p-0.5 text-neutral-500 hover:text-neutral-900 cursor-pointer"
                          >
                            {copiedCode ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={getCourierPortalLink(foundOrder.courier || 'Steadfast Courier', foundOrder.trackingNumber)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-900 hover:underline"
                    >
                      <span>Track on Courier Portal</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

              </div>

              {/* Items & Payment Details */}
              <div className="border border-neutral-200 rounded-2xl overflow-hidden divide-y divide-neutral-100 text-xs">
                <div className="p-3.5 bg-neutral-50 font-bold text-neutral-800 flex items-center justify-between">
                  <span>Ordered Items ({foundOrder.items.length})</span>
                  <span>Amount</span>
                </div>
                
                {foundOrder.items.map((item, idx) => (
                  <div key={idx} className="p-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {item.imageUrl ? (
                        <img 
                          src={item.imageUrl} 
                          alt="" 
                          className="w-10 h-10 rounded-lg object-contain bg-neutral-50 border border-neutral-200 shrink-0" 
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-neutral-100 flex items-center justify-center shrink-0">
                          <Package className="w-5 h-5 text-neutral-400" />
                        </div>
                      )}
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 truncate">{item.productName}</p>
                        <p className="text-[11px] text-neutral-500 font-mono">Qty: {item.quantity} × {formatBDT(item.price)}</p>
                      </div>
                    </div>
                    <span className="font-extrabold text-neutral-900 font-mono text-sm shrink-0">
                      {formatBDT(item.price * item.quantity)}
                    </span>
                  </div>
                ))}

                <div className="p-3.5 bg-neutral-50/50 space-y-1.5">
                  <div className="flex justify-between text-neutral-600">
                    <span>Payment Method:</span>
                    <span className="font-semibold text-neutral-900 uppercase">
                      {foundOrder.paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : foundOrder.paymentMethod}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Payment Status:</span>
                    <span className={`font-bold capitalize ${foundOrder.paymentStatus === 'paid' ? 'text-emerald-700' : 'text-amber-700'}`}>
                      {foundOrder.paymentStatus === 'paid' ? 'Paid Online ✓' : 'Payable upon Delivery (COD)'}
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-900 font-extrabold text-sm pt-1 border-t border-neutral-200">
                    <span>Total Bill:</span>
                    <span className="font-mono text-base">{formatBDT(foundOrder.totalAmount)}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Address Summary (Customer Safe) */}
              {foundOrder.customerAddress && (
                <div className="p-3.5 bg-neutral-50 rounded-2xl border border-neutral-200 flex items-start gap-2.5 text-xs text-neutral-700">
                  <MapPin className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-neutral-900">Destination: </span>
                    <span>{foundOrder.customerAddress}, {foundOrder.customerCity || 'Bangladesh'}</span>
                  </div>
                </div>
              )}

            </div>
          )}

          {/* Quick Help Strip */}
          <div className="p-4 bg-emerald-50/70 border border-emerald-200/60 rounded-2xl flex items-center justify-between gap-3 text-xs text-emerald-900">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>100% Genuine Products • 7-Day Replacement Warranty</span>
            </div>
            <button
              onClick={() => {
                setFoundOrder(null);
                setSearchQuery('');
                setSearched(false);
              }}
              className="font-bold text-emerald-800 underline hover:text-emerald-950 cursor-pointer shrink-0"
            >
              Track Another
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}
