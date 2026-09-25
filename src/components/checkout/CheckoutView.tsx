'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { Order, SellerOrder } from '@/types/marketplace';
import { formatBDT } from '@/lib/formatters';
import { 
  CheckCircle2, 
  CreditCard, 
  Truck, 
  MapPin, 
  ShieldCheck, 
  ArrowLeft, 
  ArrowRight,
  PackageCheck,
  Banknote,
  Smartphone,
  Store,
  Layers,
  Clock
} from 'lucide-react';

export function CheckoutView() {
  const { 
    cart, 
    cartCount,
    cartSubtotal, 
    bulkSavingsTotal,
    shippingAmount, 
    discountAmount, 
    cartTotal, 
    sellerCartGroups,
    shippingMethod,
    setShippingMethod,
    placeOrder, 
    navigate 
  } = useMarketplace();

  const { user, userProfile, isAuthenticated } = useAuth();

  // Wizard step (1: Shipping Info, 2: Method, 3: Payment, 4: Confirmed)
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form states
  const [fullName, setFullName] = useState(
    userProfile?.firstName 
      ? `${userProfile.firstName} ${userProfile.lastName || ''}`.trim() 
      : (user?.displayName || '')
  );
  const [email, setEmail] = useState(user?.email || userProfile?.email || '');
  const [phone, setPhone] = useState(userProfile?.phone || user?.phoneNumber || '+880 1700-000000');
  const [street, setStreet] = useState('House 42, Road 11, Block D');
  const [city, setCity] = useState('Dhaka');
  const [state, setState] = useState('Dhaka Division');
  const [zipCode, setZipCode] = useState('1213');
  const [country, setCountry] = useState('Bangladesh');

  // Update pre-filled info when auth state resolves
  useEffect(() => {
    if (user || userProfile) {
      if (userProfile?.firstName) {
        setFullName(`${userProfile.firstName} ${userProfile.lastName || ''}`.trim());
      } else if (user?.displayName) {
        setFullName(user.displayName);
      }
      if (user?.email || userProfile?.email) {
        setEmail(user?.email || userProfile?.email || '');
      }
      if (userProfile?.phone || user?.phoneNumber) {
        setPhone(userProfile?.phone || user?.phoneNumber || '');
      }
    }
  }, [user, userProfile]);

  // Payment selection
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'cod' | 'mobile_money'>('card');
  const [mobileProvider, setMobileProvider] = useState<'bkash' | 'nagad' | 'rocket'>('bkash');
  const [cardNumber, setCardNumber] = useState('•••• •••• •••• 4242');
  const [cardExpiry, setCardExpiry] = useState('12/28');
  const [cardCvc, setCardCvc] = useState('888');

  // Placed order receipt
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  if (cart.length === 0 && !placedOrder) {
    return (
      <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-16 text-center">
        <h2 className="text-xl font-bold">Your cart is empty</h2>
        <p className="text-xs text-neutral-500 mt-1 mb-4">Add products from independent sellers to begin checkout.</p>
        <button
          onClick={() => navigate('shop')}
          className="px-6 py-2.5 bg-[#111111] text-white rounded-full text-xs font-bold hover:bg-neutral-800 transition-colors"
        >
          Return to Marketplace Catalog
        </button>
      </div>
    );
  }

  // Handle final order submission
  const handleFinalOrder = async () => {
    try {
      setIsSubmitting(true);
      const order = await placeOrder({
        customerName: fullName,
        customerEmail: email,
        paymentMethod,
        mobileProvider: paymentMethod === 'mobile_money' ? mobileProvider : undefined,
        shippingAddress: {
          fullName,
          street,
          city,
          state,
          zipCode,
          country,
          phone
        }
      });

      setPlacedOrder(order);
      setStep(4);
    } catch (err) {
      console.error('Order placement failed', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const sellerCount = Object.keys(sellerCartGroups).length;

  // Step 4: Multi-Vendor Order Confirmed Screen
  if (step === 4 && placedOrder) {
    return (
      <div className="w-full max-w-[1400px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-12 sm:py-16 text-center">
        <div className="bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] p-8 sm:p-12 shadow-sm flex flex-col items-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <span className="text-xs uppercase font-extrabold tracking-widest text-[#C98F6B]">
            Multi-Vendor Transaction Confirmed
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] mt-1">
            Thank you for supporting independent makers!
          </h1>
          <p className="text-xs sm:text-sm text-neutral-600 mt-2 max-w-lg">
            We sent full invoices and dispatch tracking to <span className="font-semibold text-neutral-900">{email}</span>. 
            Because you purchased from {placedOrder.subOrders?.length || 1} independent {placedOrder.subOrders?.length === 1 ? 'seller' : 'sellers'}, items will ship separately in custom parcels.
          </p>

          {/* Master Order Details */}
          <div className="w-full bg-white rounded-2xl border border-[#E6E4E0] p-6 my-6 text-left space-y-4 text-xs sm:text-sm">
            <div className="flex flex-col sm:flex-row justify-between pb-3 border-b border-neutral-100 gap-1">
              <div>
                <span className="text-neutral-500 font-medium">Master Order Reference:</span>
                <span className="ml-2 font-mono font-bold text-neutral-900">{placedOrder.orderNumber}</span>
              </div>
              <div>
                <span className="text-neutral-500 font-medium">Total Paid:</span>
                <span className="ml-2 font-bold text-neutral-900">{formatBDT(placedOrder.total)}</span>
              </div>
            </div>

            {/* Individual Seller Sub-Orders Breakdown */}
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-3 flex items-center gap-1.5">
                <Store className="w-3.5 h-3.5 text-[#C98F6B]" />
                Individual Seller Shipments ({placedOrder.subOrders?.length || 1})
              </h4>

              <div className="space-y-3">
                {placedOrder.subOrders?.map((sub: SellerOrder) => (
                  <div key={sub.id} className="bg-[#F7F6F3] rounded-xl p-4 border border-[#E6E4E0] flex flex-col sm:flex-row justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-neutral-900">{sub.sellerName}</span>
                        <span className="font-mono text-[11px] bg-white px-2 py-0.5 rounded border text-neutral-600">
                          {sub.subOrderNumber}
                        </span>
                        <span className="text-[11px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-semibold">
                          {sub.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-1">
                        Tracking Code: <span className="font-mono font-semibold text-neutral-700">{sub.trackingNumber}</span> · Est. Delivery: {sub.estimatedDelivery}
                      </p>
                      <div className="mt-2 text-[11px] text-neutral-600">
                        {(sub.items || []).map(it => `${it.productName} (x${it.quantity})`).join(', ')}
                      </div>
                    </div>

                    <div className="text-right sm:self-center">
                      <p className="font-bold text-sm text-neutral-900">{formatBDT(sub.subtotal)}</p>
                      <p className="text-[10px] text-neutral-500">Shipping: {sub.shippingFee === 0 ? 'Free' : formatBDT(sub.shippingFee)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="pt-2 border-t border-neutral-100 flex flex-col sm:flex-row justify-between text-neutral-500 text-xs gap-1">
              <span>Delivering to: <strong className="text-neutral-800">{street}, {city} {zipCode}</strong></span>
              <span>Method: <strong className="text-neutral-800 capitalize">{paymentMethod === 'card' ? 'Credit Card' : paymentMethod === 'cod' ? 'Cash on Delivery' : 'Mobile Wallet'}</strong></span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
            <button
              onClick={() => navigate('track-order')}
              className="flex-1 py-3.5 px-6 rounded-full bg-[#111111] text-white text-xs sm:text-sm font-bold hover:bg-neutral-800 transition-colors shadow-xs cursor-pointer"
            >
              Track Shipments Live
            </button>
            <button
              onClick={() => navigate('shop')}
              className="flex-1 py-3.5 px-6 rounded-full bg-white border border-[#E6E4E0] text-neutral-800 text-xs sm:text-sm font-bold hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Continue Shopping
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-6 sm:py-8">
      {/* Header & Step Tracker */}
      <div className="mb-8">
        <button
          onClick={() => navigate('shop')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black mb-4 cursor-pointer"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Return to Marketplace Catalog
        </button>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
              Secure Checkout
            </h1>
            <p className="text-xs text-neutral-500 mt-0.5">
              One seamless checkout for {cartCount} {cartCount === 1 ? 'item' : 'items'} with direct courier dispatch
            </p>
          </div>
        </div>

        {/* Step pills */}
        <div className="flex items-center gap-3 mt-4 text-xs font-bold">
          <button 
            onClick={() => setStep(1)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full cursor-pointer transition-colors ${step === 1 ? 'bg-[#111111] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            <span>1</span> <span>Shipping Address</span>
          </button>
          <button 
            onClick={() => setStep(2)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full cursor-pointer transition-colors ${step === 2 ? 'bg-[#111111] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            <span>2</span> <span>Delivery Speed</span>
          </button>
          <button 
            onClick={() => setStep(3)}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-full cursor-pointer transition-colors ${step === 3 ? 'bg-[#111111] text-white' : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'}`}
          >
            <span>3</span> <span>Payment & Authorization</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
        {/* Left Column: Form Steps (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* STEP 1: Address Info */}
          {step === 1 && (
            <div className="bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] p-6 sm:p-8">
              {/* Auth status notification banner */}
              {isAuthenticated ? (
                <div className="mb-6 p-3.5 bg-white rounded-2xl border border-[#E6E4E0] flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-2.5">
                    <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-neutral-900">
                        Signed in as {userProfile?.firstName ? `${userProfile.firstName} ${userProfile.lastName}` : (user?.displayName || user?.email)}
                      </p>
                      <p className="text-[11px] text-neutral-500">Express multi-vendor checkout with verified account security.</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-md border border-emerald-200">
                    Logged In
                  </span>
                </div>
              ) : (
                <div className="mb-6 p-3.5 bg-white rounded-2xl border border-[#E6E4E0] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div>
                    <p className="font-bold text-neutral-900">Guest Checkout</p>
                    <p className="text-[11px] text-neutral-500">You can checkout as guest, or sign in to save your order to your account.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => navigate('login', { returnUrl: 'checkout' })}
                      className="px-3 py-1.5 bg-[#111111] text-white font-bold rounded-lg text-xs hover:bg-neutral-800 transition-colors"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => navigate('signup', { returnUrl: 'checkout' })}
                      className="px-3 py-1.5 bg-[#F7F6F3] border border-[#E6E4E0] text-neutral-700 font-bold rounded-lg text-xs hover:bg-white transition-colors"
                    >
                      Register
                    </button>
                  </div>
                </div>
              )}

              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-[#C98F6B]" /> 1. Shipping Details
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs sm:text-sm">
                <div className="sm:col-span-2">
                  <label className="font-semibold text-neutral-700 block mb-1">Full Recipient Name</label>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full bg-white border border-[#E6E4E0] rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Email for Receipt & Tracking</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white border border-[#E6E4E0] rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">Phone Number</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-white border border-[#E6E4E0] rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="font-semibold text-neutral-700 block mb-1">Street Address</label>
                  <input
                    type="text"
                    value={street}
                    onChange={(e) => setStreet(e.target.value)}
                    className="w-full bg-white border border-[#E6E4E0] rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div>
                  <label className="font-semibold text-neutral-700 block mb-1">City</label>
                  <input
                    type="text"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full bg-white border border-[#E6E4E0] rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-black"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">State</label>
                    <input
                      type="text"
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      className="w-full bg-white border border-[#E6E4E0] rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                  <div>
                    <label className="font-semibold text-neutral-700 block mb-1">ZIP Code</label>
                    <input
                      type="text"
                      value={zipCode}
                      onChange={(e) => setZipCode(e.target.value)}
                      className="w-full bg-white border border-[#E6E4E0] rounded-xl p-3 text-xs sm:text-sm focus:outline-none focus:border-black"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={() => setStep(2)}
                className="mt-6 w-full py-3.5 rounded-full bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
              >
                <span>Continue to Delivery Speed</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {/* STEP 2: Delivery Method */}
          {step === 2 && (
            <div className="bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] p-6 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#C98F6B]" /> 2. Delivery Speed & Logistics
              </h2>

              <p className="text-xs text-neutral-600 mb-4">
                Orders are fulfilled swiftly from verified central and regional courier hubs. 
                Choose your shipping speed preference:
              </p>

              <div className="space-y-3">
                <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                  shippingMethod === 'standard' ? 'bg-white border-[#111111] shadow-xs' : 'bg-white/60 border-[#E6E4E0]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === 'standard'}
                        onChange={() => setShippingMethod('standard')}
                        className="accent-[#111111]"
                      />
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-neutral-900">Standard Delivery</p>
                        <p className="text-[11px] text-neutral-500">Delivered within 3 - 5 business days</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-neutral-900">
                      {shippingAmount === 0 ? 'FREE' : formatBDT(shippingAmount)}
                    </span>
                  </div>
                </label>

                <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                  shippingMethod === 'express' ? 'bg-white border-[#111111] shadow-xs' : 'bg-white/60 border-[#E6E4E0]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shippingMethod"
                        checked={shippingMethod === 'express'}
                        onChange={() => setShippingMethod('express')}
                        className="accent-[#111111]"
                      />
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-neutral-900">Priority Courier Express</p>
                        <p className="text-[11px] text-neutral-500">Priority courier delivery with live tracking (1-2 days)</p>
                      </div>
                    </div>
                    <span className="font-bold text-xs sm:text-sm text-neutral-900">
                      {formatBDT(shippingAmount)}
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setStep(1)}
                  className="py-3 px-5 rounded-full bg-white border border-[#E6E4E0] text-neutral-800 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 py-3.5 rounded-full bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>Continue to Payment</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Payment Method */}
          {step === 3 && (
            <div className="bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] p-6 sm:p-8">
              <h2 className="text-lg font-bold text-neutral-900 mb-4 flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-[#C98F6B]" /> 3. Select Payment Option
              </h2>

              <div className="space-y-3 mb-6">
                {/* Option 1: Card */}
                <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'card' ? 'bg-white border-[#111111] shadow-xs' : 'bg-white/60 border-[#E6E4E0]'
                }`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'card'}
                        onChange={() => setPaymentMethod('card')}
                        className="accent-[#111111]"
                      />
                      <span className="font-bold text-xs sm:text-sm text-neutral-900">Credit or Debit Card</span>
                    </div>
                    <CreditCard className="w-4 h-4 text-neutral-400" />
                  </div>

                  {paymentMethod === 'card' && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 grid grid-cols-2 gap-3 text-xs">
                      <div className="col-span-2">
                        <label className="text-[11px] font-semibold text-neutral-500">Card Number</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value)}
                          className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-2.5 mt-1 font-mono text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-500">Expiry (MM/YY)</label>
                        <input
                          type="text"
                          value={cardExpiry}
                          onChange={(e) => setCardExpiry(e.target.value)}
                          className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-2.5 mt-1 text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-semibold text-neutral-500">Security CVC</label>
                        <input
                          type="text"
                          value={cardCvc}
                          onChange={(e) => setCardCvc(e.target.value)}
                          className="w-full bg-[#F7F6F3] border border-[#E6E4E0] rounded-xl p-2.5 mt-1 text-xs focus:outline-none focus:border-black"
                        />
                      </div>
                    </div>
                  )}
                </label>

                {/* Option 2: Cash on Delivery */}
                <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'cod' ? 'bg-white border-[#111111] shadow-xs' : 'bg-white/60 border-[#E6E4E0]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="accent-[#111111]"
                      />
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-neutral-900">Cash on Delivery (COD)</p>
                        <p className="text-[11px] text-neutral-500">Pay physically upon receiving packages</p>
                      </div>
                    </div>
                    <Banknote className="w-4 h-4 text-emerald-600" />
                  </div>
                </label>

                {/* Option 3: Mobile Money */}
                <label className={`block p-4 rounded-2xl border cursor-pointer transition-all ${
                  paymentMethod === 'mobile_money' ? 'bg-white border-[#111111] shadow-xs' : 'bg-white/60 border-[#E6E4E0]'
                }`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'mobile_money'}
                        onChange={() => setPaymentMethod('mobile_money')}
                        className="accent-[#111111]"
                      />
                      <div>
                        <p className="font-bold text-xs sm:text-sm text-neutral-900">Mobile Wallet & Instant Transfer</p>
                        <p className="text-[11px] text-neutral-500">bKash, Nagad, Rocket, or Apple/Google Pay</p>
                      </div>
                    </div>
                    <Smartphone className="w-4 h-4 text-purple-600" />
                  </div>

                  {paymentMethod === 'mobile_money' && (
                    <div className="mt-3 pt-3 border-t border-neutral-100 flex gap-2">
                      {(['bkash', 'nagad', 'rocket'] as const).map(provider => (
                        <button
                          key={provider}
                          type="button"
                          onClick={() => setMobileProvider(provider)}
                          className={`px-3 py-1.5 rounded-lg border text-xs font-bold capitalize transition-colors ${
                            mobileProvider === provider 
                              ? 'border-[#111111] bg-black text-white' 
                              : 'border-neutral-200 bg-white text-neutral-700'
                          }`}
                        >
                          {provider}
                        </button>
                      ))}
                    </div>
                  )}
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(2)}
                  className="py-3 px-5 rounded-full bg-white border border-[#E6E4E0] text-neutral-800 text-xs font-bold hover:bg-neutral-50 cursor-pointer"
                >
                  Back
                </button>
                <button
                  disabled={isSubmitting}
                  onClick={handleFinalOrder}
                  className="flex-1 py-4 rounded-full bg-[#111111] hover:bg-neutral-800 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer disabled:opacity-60"
                >
                  <PackageCheck className="w-4 h-4" />
                  <span>{isSubmitting ? 'Processing Multi-Vendor Order...' : `Place Marketplace Order (${formatBDT(cartTotal)})`}</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Order Review Summary (5 cols) */}
        <div className="lg:col-span-5">
          <div className="bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] p-6 sticky top-28 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E6E4E0]">
              <h3 className="font-bold text-base text-[#111111]">
                Review Bag ({cartCount} units)
              </h3>
              <span className="text-[11px] font-semibold text-neutral-500">
                {sellerCount} {sellerCount === 1 ? 'Seller' : 'Sellers'}
              </span>
            </div>

            {/* Per-Seller Items breakdown */}
            <div className="space-y-4 max-h-80 overflow-y-auto pr-1">
              {Object.values(sellerCartGroups || {}).map((group) => (
                <div key={group.sellerId} className="bg-white rounded-2xl p-3 border border-[#E6E4E0]">
                  <div className="flex items-center justify-between pb-2 border-b border-neutral-100 text-[11px] font-bold text-neutral-700">
                    <span className="flex items-center gap-1.5">
                      <Store className="w-3 h-3 text-[#C98F6B]" /> {group.sellerName}
                    </span>
                    <span className="text-neutral-500 font-normal">
                      {group.qualifiesFreeShipping ? 'Free Shipping' : `+${formatBDT(group.estimatedShippingFee)}`}
                    </span>
                  </div>

                  <div className="divide-y divide-neutral-100 pt-1">
                    {(group?.items || []).map((item: any) => (
                      <div key={item.id} className="py-2 flex items-center gap-3">
                        <div className="relative w-10 h-10 rounded-lg bg-neutral-50 border border-neutral-200 overflow-hidden shrink-0">
                          <Image
                            src={item.imageUrl}
                            alt={item.name}
                            fill
                            sizes="40px"
                            className="object-cover"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        <div className="flex-1 text-xs">
                          <p className="font-semibold text-neutral-900 line-clamp-1">{item.name}</p>
                          <p className="text-[11px] text-neutral-500">
                            Qty: {item.quantity} · {formatBDT(item.price)} ea
                          </p>
                        </div>
                        <span className="font-bold text-xs text-neutral-900">
                          {formatBDT(item.price * item.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-[#E6E4E0] space-y-2 text-xs text-neutral-600">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-neutral-900">{formatBDT(cartSubtotal)}</span>
              </div>

              {bulkSavingsTotal > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Volume Bulk Discount</span>
                  <span>-{formatBDT(bulkSavingsTotal)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Multi-Vendor Shipping</span>
                <span className="font-bold text-neutral-900">
                  {shippingAmount === 0 ? <span className="text-emerald-700">FREE</span> : formatBDT(shippingAmount)}
                </span>
              </div>

              {discountAmount > 0 && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Promo Discount</span>
                  <span>-{formatBDT(discountAmount)}</span>
                </div>
              )}

              <div className="pt-2 border-t border-[#E6E4E0] flex justify-between text-base font-extrabold text-neutral-900">
                <span>Total Amount</span>
                <span>{formatBDT(cartTotal)}</span>
              </div>
            </div>

            <div className="pt-3 border-t border-[#E6E4E0] flex items-center gap-2 text-[11px] text-neutral-500">
              <ShieldCheck className="w-4 h-4 text-[#C98F6B] shrink-0" />
              <span>Zero Invest Buyer Guarantee. 100% money-back if items are not received as described.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

