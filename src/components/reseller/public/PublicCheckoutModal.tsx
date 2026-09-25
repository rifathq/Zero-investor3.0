'use client';

import React, { useState } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { formatBDT } from '@/lib/formatters';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  X, 
  ShoppingBag, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  MapPin, 
  CreditCard, 
  Banknote, 
  Smartphone, 
  Loader2, 
  CheckCircle,
  Clock,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { Product } from '@/types/marketplace';

interface PublicCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeName?: string;
  storeSlug?: string;
  resellerId?: string;
  singleProduct?: {
    product: Product;
    quantity: number;
    price: number;
  };
  onOrderSuccess?: (orderNumber: string) => void;
}

export function PublicCheckoutModal({
  isOpen,
  onClose,
  storeName = 'Dhaka Trendz Collection',
  storeSlug,
  resellerId,
  singleProduct,
  onOrderSuccess
}: PublicCheckoutModalProps) {
  const { 
    cart, 
    cartTotal, 
    products: platformCatalog, 
    clearCart, 
    showToast 
  } = useMarketplace();

  // Form states
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'dhaka' | 'outside'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod');
  const [onlineTransactionId, setOnlineTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<{
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    deliveryFee: number;
    trackingNumber: string;
    address: string;
    phone: string;
  } | null>(null);

  if (!isOpen) return null;

  // Compute items & pricing
  const checkoutItems = singleProduct 
    ? [{
        productId: singleProduct.product.id,
        productName: singleProduct.product.name,
        price: singleProduct.price,
        quantity: singleProduct.quantity,
        imageUrl: singleProduct.product.imageUrl,
        sellerId: singleProduct.product.sellerId || resellerId || 'seller-1'
      }]
    : cart.map(item => ({
        productId: item.productId,
        productName: item.name,
        price: item.price,
        quantity: item.quantity,
        imageUrl: item.imageUrl,
        sellerId: item.sellerId || resellerId || 'seller-1'
      }));

  const subtotal = singleProduct 
    ? singleProduct.price * singleProduct.quantity 
    : cartTotal;

  const deliveryFee = deliveryZone === 'dhaka' ? 60 : 120;
  const finalTotal = subtotal + deliveryFee;

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('Name Required', 'Please enter your full recipient name.', 'error');
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11 || (!cleanPhone.startsWith('01') && !cleanPhone.startsWith('8801'))) {
      showToast('Invalid Phone Number', 'Please enter an 11-digit Bangladeshi mobile number (e.g. 01712345678).', 'error');
      return;
    }

    if (!customerAddress.trim() || customerAddress.trim().length < 8) {
      showToast('Address Required', 'Please enter your complete street/home delivery address.', 'error');
      return;
    }

    if (paymentMethod !== 'cod' && !onlineTransactionId.trim()) {
      showToast('Transaction ID Required', 'Please enter your payment Transaction ID (TrxID) or Reference.', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      let totalWholesale = 0;
      let totalResellerProfit = 0;

      const orderItems = checkoutItems.map(it => {
        const platformProd = platformCatalog.find(p => p.id === it.productId);
        const wholesaleCost = platformProd ? (platformProd.supplierPrice || Math.round(it.price * 0.65)) : Math.round(it.price * 0.65);
        const profit = Math.max(0, it.price - wholesaleCost) * it.quantity;
        totalWholesale += wholesaleCost * it.quantity;
        totalResellerProfit += profit;

        return {
          productId: it.productId,
          productName: it.productName,
          quantity: it.quantity,
          price: it.price,
          wholesaleCost,
          profitBDT: profit,
          subtotal: it.price * it.quantity,
          imageUrl: it.imageUrl,
          sellerId: it.sellerId
        };
      });

      const uniqueNum = Math.floor(100000 + Math.random() * 900000);
      const generatedOrderNumber = `ORD-${uniqueNum}`;
      const generatedTrackingNumber = `STF-${uniqueNum}`;
      const effectivePaymentStatus = paymentMethod === 'cod' ? 'unpaid_cod' : 'paid';

      const orderDocData = {
        id: `ord_${Date.now()}`,
        orderNumber: generatedOrderNumber,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerAddress: customerAddress.trim(),
        customerCity: deliveryZone === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
        deliveryZone,
        deliveryFee,
        totalAmount: finalTotal,
        totalAmountBDT: finalTotal,
        wholesaleAmount: totalWholesale,
        resellerProfit: totalResellerProfit,
        estimatedProfitBDT: totalResellerProfit,
        paymentMethod: paymentMethod.toUpperCase(),
        paymentStatus: effectivePaymentStatus,
        transactionId: onlineTransactionId.trim() || null,
        status: 'Pending',
        resellerId: resellerId || checkoutItems[0]?.sellerId || 'seller-1',
        storeSlug: storeSlug || null,
        storeName,
        items: orderItems,
        courier: 'Steadfast Courier',
        trackingNumber: generatedTrackingNumber,
        estimatedDelivery: deliveryZone === 'dhaka' ? '24–48 Hours' : '2–4 Business Days',
        isSettled: false,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore
      if (isFirebaseConfigured && db) {
        try {
          const orderRef = doc(db, 'orders', orderDocData.id);
          await setDoc(orderRef, orderDocData);
        } catch (fbErr) {
          console.warn('Firestore direct write warning:', fbErr);
        }
      }

      // Save to local guest storage for instant tracking
      if (typeof window !== 'undefined') {
        try {
          const guestRaw = localStorage.getItem('zero_invest_orders_guest');
          const existing = guestRaw ? JSON.parse(guestRaw) : [];
          localStorage.setItem('zero_invest_orders_guest', JSON.stringify([orderDocData, ...existing]));
        } catch (e) {}
      }

      if (!singleProduct) {
        clearCart();
      }

      setConfirmedOrder({
        orderNumber: generatedOrderNumber,
        totalAmount: finalTotal,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : `Online Payment (${paymentMethod.toUpperCase()})`,
        paymentStatus: effectivePaymentStatus,
        deliveryFee,
        trackingNumber: generatedTrackingNumber,
        address: customerAddress.trim(),
        phone: cleanPhone
      });

      onOrderSuccess?.(generatedOrderNumber);
      showToast('Order Placed Successfully!', `Order #${generatedOrderNumber} is being packaged for dispatch.`, 'success');

    } catch (err) {
      console.error('Checkout error:', err);
      showToast('Order Placement Error', 'Could not process order. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetAndClose = () => {
    setConfirmedOrder(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 md:p-8 bg-neutral-950/75 backdrop-blur-md animate-in fade-in duration-200 overflow-y-auto">
      <div 
        className="fixed inset-0"
        onClick={handleResetAndClose}
      />

      <div className="relative bg-white rounded-3xl max-w-4xl lg:max-w-5xl w-full border border-slate-100 shadow-2xl shadow-slate-200/60 overflow-hidden p-6 sm:p-8 md:p-10 max-h-[92vh] flex flex-col z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-5 shrink-0">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 text-xs font-semibold rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>DIRECT DOORSTEP DISPATCH</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              {confirmedOrder ? 'Order Confirmed' : 'Express Checkout & Order Placement'}
            </h2>
            <p className="text-sm text-slate-500">
              {storeName} • 100% Genuine Guaranteed • Fast Nationwide Delivery
            </p>
          </div>
          <button
            onClick={handleResetAndClose}
            className="p-2.5 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-2xl transition-colors cursor-pointer"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Confirmation Screen */}
        {confirmedOrder ? (
          <div className="flex-1 overflow-y-auto py-8 space-y-6 text-center animate-in zoom-in-95 duration-200">
            <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle className="w-11 h-11" />
            </div>

            <div className="space-y-2">
              <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                Order Placed Successfully
              </span>
              <h3 className="text-3xl font-black text-slate-900 mt-2">
                Thank You for Your Order!
              </h3>
              <p className="text-sm text-slate-600 max-w-md mx-auto">
                We have received your order details and our fulfillment team is packaging your parcel for courier dispatch.
              </p>
            </div>

            {/* Receipt Summary Card */}
            <div className="bg-slate-50/80 rounded-3xl p-6 md:p-8 border border-slate-200 text-left space-y-3.5 max-w-lg mx-auto">
              <div className="flex justify-between items-center text-sm pb-3 border-b border-slate-200 font-medium">
                <span className="text-slate-500">Order ID</span>
                <span className="font-mono font-bold text-slate-900 text-base">#{confirmedOrder.orderNumber}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Consignment Tracking</span>
                <span className="font-mono font-bold text-emerald-700">{confirmedOrder.trackingNumber}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Payment Option</span>
                <span className="font-semibold text-slate-800">{confirmedOrder.paymentMethod}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Payment Status</span>
                <span className={`font-bold px-2.5 py-0.5 rounded-lg text-xs ${
                  confirmedOrder.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                }`}>
                  {confirmedOrder.paymentStatus === 'paid' ? 'Paid Online' : 'Pay on Delivery'}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500">Recipient Phone</span>
                <span className="font-mono font-semibold text-slate-900">{confirmedOrder.phone}</span>
              </div>
              <div className="flex justify-between items-center text-sm pt-3 border-t border-slate-200 font-bold">
                <span className="text-slate-900 text-base">Total Payable</span>
                <span className="font-mono text-2xl text-slate-900 font-extrabold">
                  {formatBDT(confirmedOrder.totalAmount)}
                </span>
              </div>
            </div>

            {/* Next Step Notice */}
            <div className="p-4 bg-emerald-50/80 rounded-2xl border border-emerald-100 text-sm text-emerald-900 text-left flex items-start gap-3 max-w-lg mx-auto">
              <Clock className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                Our delivery partner <strong>Steadfast / Pathao</strong> will call you at <strong>{confirmedOrder.phone}</strong> before parcel handover. Please keep cash ready.
              </span>
            </div>

            <button
              type="button"
              onClick={handleResetAndClose}
              className="w-full max-w-lg mx-auto h-14 bg-slate-900 hover:bg-black text-white rounded-2xl text-base font-semibold shadow-lg shadow-slate-900/10 transition-all cursor-pointer"
            >
              Continue Shopping in Store
            </button>
          </div>
        ) : (
          /* Main Two-Column Express Form */
          <form onSubmit={handlePlaceOrder} className="flex-1 overflow-y-auto pt-6 pb-2 pr-1">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
              
              {/* Left Column: Delivery Information */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    1
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    Delivery Information
                  </h3>
                </div>

                {/* Recipient Full Name */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Recipient Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tanvir Ahmed"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="h-12 md:h-14 px-4 w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-800 text-base transition-all bg-white placeholder:text-slate-400"
                  />
                </div>

                {/* Mobile Number */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Mobile Number (11-digit) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    placeholder="017XXXXXXXX"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    className="h-12 md:h-14 px-4 w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-800 text-base transition-all bg-white placeholder:text-slate-400 font-mono"
                  />
                </div>

                {/* Street Address */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Full Delivery Address (House/Road/Area/District) <span className="text-rose-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. House 14, Road 5, Block B, Dhanmondi, Dhaka"
                    value={customerAddress}
                    onChange={(e) => setCustomerAddress(e.target.value)}
                    className="p-4 w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-800 text-base transition-all bg-white placeholder:text-slate-400 resize-none"
                  />
                </div>

                {/* Delivery Zone Selector Cards */}
                <div>
                  <label className="text-sm font-semibold text-slate-700 mb-2 block">
                    Delivery Region (Courier Fee)
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setDeliveryZone('dhaka')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        deliveryZone === 'dhaka'
                          ? 'border-2 border-slate-900 bg-slate-50/80 shadow-sm'
                          : 'border border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">Inside Dhaka</span>
                        {deliveryZone === 'dhaka' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-xs text-slate-500">24–48 Hours</span>
                        <span className="font-mono font-extrabold text-slate-900 text-base">৳60</span>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setDeliveryZone('outside')}
                      className={`p-4 rounded-2xl border text-left transition-all cursor-pointer flex flex-col justify-between gap-1.5 ${
                        deliveryZone === 'outside'
                          ? 'border-2 border-slate-900 bg-slate-50/80 shadow-sm'
                          : 'border border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-sm text-slate-900">Outside Dhaka</span>
                        {deliveryZone === 'outside' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </div>
                      <div className="flex items-baseline justify-between pt-1 border-t border-slate-200/60">
                        <span className="text-xs text-slate-500">2–4 Days</span>
                        <span className="font-mono font-extrabold text-slate-900 text-base">৳120</span>
                      </div>
                    </button>
                  </div>
                </div>

              </div>

              {/* Right Column: Payment Options & Order Summary */}
              <div className="space-y-6">
                <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                    2
                  </div>
                  <h3 className="text-base md:text-lg font-bold text-slate-900">
                    Payment Method &amp; Order Summary
                  </h3>
                </div>

                {/* Payment Option Cards */}
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-700 block">
                    Select Payment Option
                  </label>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {/* COD Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 md:p-5 rounded-2xl text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-2 border-slate-900 bg-slate-50/80 shadow-sm'
                          : 'border border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center">
                          <Banknote className="w-5 h-5" />
                        </div>
                        {paymentMethod === 'cod' && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">Cash on Delivery</div>
                        <div className="text-xs text-slate-500">Pay cash upon parcel delivery</div>
                      </div>
                    </button>

                    {/* bKash Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('bkash')}
                      className={`p-4 md:p-5 rounded-2xl text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'bkash'
                          ? 'border-2 border-slate-900 bg-slate-50/80 shadow-sm'
                          : 'border border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-pink-100/80 text-pink-700 flex items-center justify-center">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        {paymentMethod === 'bkash' && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">bKash Direct</div>
                        <div className="text-xs text-slate-500">Central Platform Gateway</div>
                      </div>
                    </button>

                    {/* Nagad Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('nagad')}
                      className={`p-4 md:p-5 rounded-2xl text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'nagad'
                          ? 'border-2 border-slate-900 bg-slate-50/80 shadow-sm'
                          : 'border border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-orange-100/80 text-orange-700 flex items-center justify-center">
                          <Smartphone className="w-5 h-5" />
                        </div>
                        {paymentMethod === 'nagad' && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">Nagad Direct</div>
                        <div className="text-xs text-slate-500">Central Platform Gateway</div>
                      </div>
                    </button>

                    {/* Card */}
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('card')}
                      className={`p-4 md:p-5 rounded-2xl text-left flex flex-col justify-between gap-2 transition-all cursor-pointer ${
                        paymentMethod === 'card'
                          ? 'border-2 border-slate-900 bg-slate-50/80 shadow-sm'
                          : 'border border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="w-9 h-9 rounded-xl bg-blue-100/80 text-blue-700 flex items-center justify-center">
                          <CreditCard className="w-5 h-5" />
                        </div>
                        {paymentMethod === 'card' && <CheckCircle2 className="w-5 h-5 text-slate-900" />}
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900">Visa / Card</div>
                        <div className="text-xs text-slate-500">256-Bit Encrypted Gateway</div>
                      </div>
                    </button>
                  </div>

                  {/* Online TrxID Panel */}
                  {paymentMethod !== 'cod' && (
                    <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 text-xs animate-in fade-in duration-150">
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Central Merchant Account:</span>
                        <span className="font-mono font-bold text-emerald-400">01700-000000</span>
                      </div>
                      <p className="text-slate-300">
                        Please send <strong className="text-white font-mono">{formatBDT(finalTotal)}</strong> via {paymentMethod.toUpperCase()} and enter your Transaction ID (TrxID) below:
                      </p>
                      <input
                        type="text"
                        required
                        placeholder="e.g. 9J4K8L7M"
                        value={onlineTransactionId}
                        onChange={(e) => setOnlineTransactionId(e.target.value.toUpperCase())}
                        className="w-full h-12 px-4 text-sm bg-slate-800 border border-slate-700 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 font-mono uppercase"
                      />
                    </div>
                  )}
                </div>

                {/* Items & Price Breakdown */}
                <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Order Calculation ({checkoutItems.reduce((s, i) => s + i.quantity, 0)} Items)
                  </div>
                  <div className="space-y-2 text-sm text-slate-600">
                    <div className="flex justify-between">
                      <span>Product Subtotal</span>
                      <span className="font-mono font-bold text-slate-900">{formatBDT(subtotal)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Courier Shipping ({deliveryZone === 'dhaka' ? 'Inside Dhaka' : 'Outside Dhaka'})</span>
                      <span className="font-mono font-bold text-slate-900">{formatBDT(deliveryFee)}</span>
                    </div>
                  </div>

                  {/* Highlighted Total */}
                  <div className="border-t border-slate-200 pt-4 flex justify-between items-center">
                    <span className="text-base font-bold text-slate-900">Total Payable</span>
                    <span className="text-2xl md:text-3xl font-extrabold text-slate-900 font-mono">
                      {formatBDT(finalTotal)}
                    </span>
                  </div>
                </div>

                {/* Confirm Order CTA Button */}
                <button
                  type="submit"
                  disabled={isSubmitting || checkoutItems.length === 0}
                  className="h-14 w-full bg-slate-900 hover:bg-black text-white text-base md:text-lg font-semibold rounded-2xl shadow-lg shadow-slate-900/10 transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                      <span>Processing Your Order...</span>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>
                        Confirm Order ({paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay Online'}) • {formatBDT(finalTotal)}
                      </span>
                    </>
                  )}
                </button>

                <div className="text-xs text-center text-slate-500 font-medium flex items-center justify-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>7-Day Replacement Warranty • Inspect Before Cash Payment</span>
                </div>

              </div>

            </div>
          </form>
        )}

      </div>
    </div>
  );
}
