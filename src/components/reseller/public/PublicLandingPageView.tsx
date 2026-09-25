'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { formatBDT } from '@/lib/formatters';
import { ResellerStore, ResellerProduct } from '@/types/reseller';
import { INITIAL_ADMIN_RESELLERS, INITIAL_ADMIN_PRODUCTS } from '@/lib/adminMockData';
import { PublicStoreHeader } from './PublicStoreHeader';
import { PublicOrderTrackingModal } from './PublicOrderTrackingModal';
import { StorePolicyModal, PolicyType } from './StorePolicyModal';
import { db, isFirebaseConfigured } from '@/lib/firebase';
import { doc, setDoc } from 'firebase/firestore';
import { 
  Star, 
  ShieldCheck, 
  Truck, 
  Check, 
  ShoppingBag, 
  Zap, 
  Plus, 
  Minus, 
  RotateCcw, 
  CheckCircle2, 
  Clock, 
  ChevronDown, 
  ChevronUp, 
  Phone, 
  Share2, 
  Maximize2, 
  X,
  CreditCard,
  Banknote,
  Smartphone,
  MapPin,
  PackageSearch,
  CheckCircle,
  Loader2,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PublicLandingPageViewProps {
  storeSlug?: string;
  productSlug?: string;
}

export function PublicLandingPageView({ storeSlug, productSlug }: PublicLandingPageViewProps) {
  const { products, navigate, addToCart, showToast } = useMarketplace();

  // 1. Resolve Store Profile
  const store = useMemo<ResellerStore | null>(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zero_invest_admin_resellers');
      if (stored) {
        try {
          const list: ResellerStore[] = JSON.parse(stored);
          const match = list.find(s => s.storeSlug === storeSlug || s.id === storeSlug);
          if (match) return match;
        } catch (e) {}
      }
    }
    const fallbackMatch = INITIAL_ADMIN_RESELLERS.find(s => s.storeSlug === storeSlug);
    return fallbackMatch || INITIAL_ADMIN_RESELLERS[0];
  }, [storeSlug]);

  const storeName = store?.storeName || storeSlug || 'Dhaka Trendz Collection';

  // Dynamic Browser Tab Title
  useEffect(() => {
    if (typeof document !== 'undefined') {
      const previousTitle = document.title;
      document.title = `${storeName} - Official Store`;
      return () => {
        document.title = previousTitle;
      };
    }
  }, [storeName]);

  // 2. Resolve Master Platform Product
  const product = useMemo(() => {
    if (!productSlug) return products[0];
    const match = products.find(p => 
      p.id === productSlug || 
      p.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') === productSlug.toLowerCase()
    );
    return match || products[0];
  }, [productSlug, products]);

  // 3. Resolve Reseller's Selling Price (strictly isolated per reseller)
  const resellerCustomPrice = useMemo(() => {
    if (!store || !product) return null;
    try {
      const adminProds: ResellerProduct[] = JSON.parse(localStorage.getItem('zero_invest_admin_products') || '[]');
      const config = adminProds.find(
        p => (p.resellerId === store.resellerId || p.storeId === store.id) &&
             (p.originalProductId === product.id || p.productId === product.id)
      );
      if (config) {
        return config.suggestedPrice || config.sellingPrice || config.sellingPriceBDT || null;
      }
    } catch {}
    
    // Check initial admin products
    const initialConfig = INITIAL_ADMIN_PRODUCTS.find(
      p => (p.resellerId === store.resellerId || p.storeId === store.id) &&
           (p.originalProductId === product.id || p.productId === product.id)
    );
    if (initialConfig) {
      return initialConfig.suggestedPrice || initialConfig.sellingPrice || initialConfig.sellingPriceBDT || null;
    }

    return null;
  }, [store, product]);

  const displayPrice = resellerCustomPrice || (product?.price ?? 990);
  const wholesaleCost = product ? (product.supplierPrice || Math.round(displayPrice * 0.65)) : 500;
  const unitResellerProfit = Math.max(0, displayPrice - wholesaleCost);

  const originalPrice = product?.originalPrice && product.originalPrice > displayPrice
    ? product.originalPrice
    : Math.round(displayPrice * 1.25);
  const discountAmount = Math.max(0, originalPrice - displayPrice);
  const discountPercent = originalPrice > displayPrice 
    ? Math.round((discountAmount / originalPrice) * 100) 
    : 0;

  // Gallery state
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list = [product.imageUrl];
    if (product.additionalImages && Array.isArray(product.additionalImages)) {
      list.push(...product.additionalImages.filter(img => img && img !== product.imageUrl));
    }
    return list;
  }, [product]);

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAddedToast, setIsAddedToast] = useState(false);
  const [activeTab, setActiveTab] = useState<'description' | 'features' | 'specifications'>('description');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(null);
  const [isTrackModalOpen, setIsTrackModalOpen] = useState(false);
  const [activePolicy, setActivePolicy] = useState<PolicyType>(null);

  // 4. Centralized Checkout & Direct Order Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [deliveryZone, setDeliveryZone] = useState<'dhaka' | 'outside'>('dhaka');
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'bkash' | 'nagad' | 'card'>('cod');
  const [onlineTransactionId, setOnlineTransactionId] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [placedOrderInfo, setPlacedOrderInfo] = useState<{
    orderNumber: string;
    totalAmount: number;
    paymentMethod: string;
    paymentStatus: string;
    deliveryFee: number;
    address: string;
    phone: string;
    trackingNumber: string;
  } | null>(null);

  const deliveryFee = deliveryZone === 'dhaka' ? 60 : 120;
  const itemTotal = displayPrice * quantity;
  const orderGrandTotal = itemTotal + deliveryFee;

  const handleAddToCart = () => {
    if (!product) return;
    const customProduct = {
      ...product,
      price: displayPrice,
      sellerId: store?.resellerId || product.sellerId,
      sellerName: store?.storeName || product.sellerName
    };
    addToCart(customProduct, quantity);
    setIsAddedToast(true);
    showToast('Added to Cart', `Added ${quantity}x "${product.name}" to your bag.`, 'success');
    setTimeout(() => setIsAddedToast(false), 2000);
  };

  const scrollToCheckout = () => {
    const el = document.getElementById('order-checkout-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Submit Centralized Express Order directly to platform backend & Firestore
  const handleDirectOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!customerName.trim()) {
      showToast('Name Required', 'Please enter your full recipient name.', 'error');
      return;
    }

    const cleanPhone = customerPhone.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 11 || (!cleanPhone.startsWith('01') && !cleanPhone.startsWith('8801'))) {
      showToast('Invalid Phone Number', 'Please enter a valid 11-digit Bangladeshi phone number (e.g. 017XXXXXXXX).', 'error');
      return;
    }

    if (!customerAddress.trim() || customerAddress.trim().length < 8) {
      showToast('Address Required', 'Please provide your full delivery address with House, Road, Area.', 'error');
      return;
    }

    if (paymentMethod !== 'cod' && !onlineTransactionId.trim()) {
      showToast('Transaction ID Required', 'Please enter your payment Transaction ID (TrxID) or reference.', 'error');
      return;
    }

    setIsSubmittingOrder(true);

    try {
      const generatedOrderNumber = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
      const generatedTrackingNumber = `STF-${Math.floor(100000 + Math.random() * 900000)}`;
      const effectivePaymentStatus = paymentMethod === 'cod' ? 'unpaid_cod' : 'paid';
      const resellerTotalProfit = unitResellerProfit * quantity;
      const totalWholesaleCost = wholesaleCost * quantity;

      const orderPayload = {
        id: `ord_${Date.now()}`,
        orderNumber: generatedOrderNumber,
        customerName: customerName.trim(),
        customerPhone: cleanPhone,
        customerAddress: customerAddress.trim(),
        customerCity: deliveryZone === 'dhaka' ? 'Dhaka' : 'Outside Dhaka',
        deliveryZone,
        deliveryFee,
        totalAmount: orderGrandTotal,
        totalAmountBDT: orderGrandTotal,
        wholesaleAmount: totalWholesaleCost,
        resellerProfit: resellerTotalProfit,
        estimatedProfitBDT: resellerTotalProfit,
        paymentMethod: paymentMethod.toUpperCase(),
        paymentStatus: effectivePaymentStatus,
        transactionId: onlineTransactionId.trim() || null,
        status: 'Pending',
        resellerId: store?.resellerId || 'seller-1',
        storeSlug: store?.storeSlug || storeSlug || null,
        storeName,
        items: [
          {
            productId: product.id,
            productName: product.name,
            quantity,
            price: displayPrice,
            wholesaleCost,
            profitBDT: resellerTotalProfit,
            subtotal: itemTotal,
            imageUrl: product.imageUrl,
            sellerId: store?.resellerId || 'seller-1'
          }
        ],
        courier: 'Steadfast Courier',
        trackingNumber: generatedTrackingNumber,
        estimatedDelivery: deliveryZone === 'dhaka' ? '24–48 Hours' : '2–4 Business Days',
        isSettled: false,
        createdAt: new Date().toISOString()
      };

      // 1. Write to Firestore if configured
      if (isFirebaseConfigured && db) {
        try {
          const orderRef = doc(db, 'orders', orderPayload.id);
          await setDoc(orderRef, orderPayload);
        } catch (fbErr) {
          console.warn('Firestore write warning:', fbErr);
        }
      }

      // 2. Write to local storage for instant query in tracking modal
      if (typeof window !== 'undefined') {
        try {
          const guestRaw = localStorage.getItem('zero_invest_orders_guest');
          const existing = guestRaw ? JSON.parse(guestRaw) : [];
          localStorage.setItem('zero_invest_orders_guest', JSON.stringify([orderPayload, ...existing]));
        } catch (e) {}
      }

      setPlacedOrderInfo({
        orderNumber: generatedOrderNumber,
        totalAmount: orderGrandTotal,
        paymentMethod: paymentMethod === 'cod' ? 'Cash on Delivery (COD)' : `Online Payment (${paymentMethod.toUpperCase()})`,
        paymentStatus: effectivePaymentStatus,
        deliveryFee,
        address: customerAddress.trim(),
        phone: cleanPhone,
        trackingNumber: generatedTrackingNumber
      });

      showToast('Order Confirmed!', `Order #${generatedOrderNumber} placed successfully.`, 'success');

    } catch (err) {
      console.error('Direct order placement error:', err);
      showToast('Order Placement Error', 'Could not process order. Please try again.', 'error');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  const handleShare = () => {
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      showToast('Link Copied', 'Product link copied to clipboard.', 'success');
    }
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] text-neutral-900 flex flex-col justify-between selection:bg-[#EAD7CA] selection:text-neutral-900">
      
      {/* 1. Dedicated Reseller Store Header (100% White-Labeled) */}
      <PublicStoreHeader
        store={store}
        storeSlug={storeSlug}
      />

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 sm:space-y-16">
        
        {/* Navigation Breadcrumb */}
        <div className="flex items-center gap-2 text-xs text-neutral-500">
          <button 
            type="button"
            onClick={() => navigate('reseller-public-store', { storeSlug: store?.storeSlug || storeSlug })}
            className="hover:text-neutral-900 font-semibold cursor-pointer"
          >
            {storeName}
          </button>
          <span>/</span>
          <span className="text-neutral-400 capitalize">{product?.category || 'Catalog'}</span>
          <span>/</span>
          <span className="text-neutral-900 font-bold truncate max-w-xs">{product?.name}</span>
        </div>

        {/* 2. Top Product Showcase & Direct Buying Box */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E6E4E0] shadow-sm grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          
          {/* Left Gallery Column (6 cols) */}
          <div className="lg:col-span-6 space-y-4">
            {/* Main Stage Image */}
            <div className="relative aspect-square rounded-2xl bg-[#FAF9F5] border border-neutral-200/70 p-6 flex items-center justify-center overflow-hidden group">
              <img
                src={galleryImages[activeImageIndex] || product?.imageUrl}
                alt={product?.name}
                className="max-h-full max-w-full object-contain mix-blend-multiply transition-transform duration-300 group-hover:scale-105"
              />

              {/* Discount Tag */}
              {discountPercent > 0 && (
                <div className="absolute top-4 left-4 bg-neutral-900 text-white text-xs font-black px-3 py-1.5 rounded-xl shadow-md">
                  SAVE {discountPercent}% OFF
                </div>
              )}

              {/* Lightbox / Zoom Action */}
              <button
                type="button"
                onClick={() => setIsLightboxOpen(true)}
                className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-white/90 hover:bg-white text-neutral-800 shadow-md backdrop-blur-xs transition-transform active:scale-95 cursor-pointer"
                title="View Fullscreen"
              >
                <Maximize2 className="w-4 h-4" />
              </button>
            </div>

            {/* Thumbnail Row */}
            {galleryImages.length > 1 && (
              <div className="flex items-center gap-3 overflow-x-auto pb-1">
                {galleryImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveImageIndex(idx)}
                    className={`w-16 h-16 sm:w-20 sm:h-20 rounded-xl p-2 bg-[#FAF9F5] border transition-all shrink-0 cursor-pointer ${
                      activeImageIndex === idx
                        ? 'border-neutral-900 ring-2 ring-neutral-900/10'
                        : 'border-neutral-200 hover:border-neutral-400 opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={img}
                      alt={`${product?.name} ${idx + 1}`}
                      className="w-full h-full object-contain mix-blend-multiply"
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Delivery & Assurance Pills */}
            <div className="grid grid-cols-3 gap-2.5 pt-2 text-center">
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
                <Truck className="w-4 h-4 text-emerald-600 mx-auto" />
                <div className="font-bold text-[11px] text-neutral-900">Cash on Delivery</div>
                <div className="text-[10px] text-neutral-500">Pay after parcel check</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
                <RotateCcw className="w-4 h-4 text-neutral-800 mx-auto" />
                <div className="font-bold text-[11px] text-neutral-900">7-Day Replacement</div>
                <div className="text-[10px] text-neutral-500">Hassle-free exchange</div>
              </div>
              <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100 space-y-1">
                <ShieldCheck className="w-4 h-4 text-emerald-600 mx-auto" />
                <div className="font-bold text-[11px] text-neutral-900">100% Genuine</div>
                <div className="text-[10px] text-neutral-500">Quality verified</div>
              </div>
            </div>
          </div>

          {/* Right Product Overview & Quick Actions (6 cols) */}
          <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              
              {/* Category & Ratings */}
              <div className="flex items-center justify-between gap-4">
                <span className="text-xs font-bold uppercase tracking-widest text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                  {product?.category || 'Special Edition'}
                </span>

                <div className="flex items-center gap-1.5 text-xs">
                  <div className="flex items-center text-amber-500">
                    <Star className="w-4 h-4 fill-amber-400" />
                  </div>
                  <span className="font-bold text-neutral-900">{product?.rating || 4.9}</span>
                  <span className="text-neutral-400">({product?.reviewCount || 48} reviews)</span>
                  <button
                    type="button"
                    onClick={handleShare}
                    className="ml-3 p-1.5 text-neutral-400 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
                    title="Share product link"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-neutral-950 tracking-tight leading-tight">
                {product?.name}
              </h1>

              {/* Pricing Box */}
              <div className="p-4 sm:p-5 bg-[#FAF9F5] rounded-2xl border border-neutral-200/80 space-y-2">
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl sm:text-4xl font-black text-neutral-950 font-mono tracking-tight">
                    {formatBDT(displayPrice)}
                  </span>
                  {originalPrice > displayPrice && (
                    <span className="text-base sm:text-lg text-neutral-400 line-through font-mono">
                      {formatBDT(originalPrice)}
                    </span>
                  )}
                  {discountPercent > 0 && (
                    <span className="text-xs font-extrabold text-emerald-700 bg-emerald-100/70 px-2.5 py-0.5 rounded-lg">
                      Save {formatBDT(discountAmount)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2 text-xs text-neutral-600 pt-1 border-t border-neutral-200/60 font-medium">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Nationwide Courier Dispatch inside 24 Hours</span>
                </div>
              </div>

              {/* Short Description */}
              <p className="text-xs sm:text-sm text-neutral-700 leading-relaxed">
                {product?.description || 'Authentic top-tier item with full manufacturer assurance, express doorstep delivery across all 64 districts.'}
              </p>

              {/* Key Features Bullet List */}
              {product?.features && product.features.length > 0 && (
                <div className="space-y-1.5 pt-1">
                  <div className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                    Key Highlights
                  </div>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-neutral-700">
                    {product.features.slice(0, 4).map((feat, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Quantity Selector */}
              <div className="pt-2 flex items-center gap-4">
                <span className="text-xs font-bold text-neutral-900">Quantity:</span>
                <div className="inline-flex items-center border border-neutral-300 rounded-xl bg-white overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2.5 hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-700"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 font-bold text-xs sm:text-sm text-neutral-900 font-mono">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() => setQuantity(quantity + 1)}
                    className="p-2.5 hover:bg-neutral-100 transition-colors cursor-pointer text-neutral-700"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={handleAddToCart}
                  disabled={!product.inStock}
                  className="w-full sm:flex-1 py-4 px-6 bg-white hover:bg-neutral-50 text-neutral-900 border-2 border-neutral-900 rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-xs flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Add to Shopping Bag</span>
                </button>

                <button
                  type="button"
                  onClick={scrollToCheckout}
                  disabled={!product.inStock}
                  className="w-full sm:flex-1 py-4 px-6 bg-neutral-900 hover:bg-neutral-800 text-white rounded-2xl text-xs sm:text-sm font-bold transition-all shadow-md flex items-center justify-center gap-2 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  <Zap className="w-4 h-4 text-amber-300 fill-amber-300" />
                  <span>Direct Order (Cash on Delivery)</span>
                </button>
              </div>

              {/* Helpline direct CTA */}
              {store?.contactPhone && (
                <div className="pt-2 text-center sm:text-left">
                  <a
                    href={`https://wa.me/${store.contactPhone.replace(/[^0-9]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 hover:text-emerald-800"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Have questions? Chat with our store agent on WhatsApp</span>
                  </a>
                </div>
              )}

            </div>
          </div>
        </section>

        {/* 3. Spacious, Premium Redesigned Express Checkout & Order Placement Card */}
        <section id="order-checkout-section" className="bg-white rounded-3xl p-6 sm:p-8 md:p-10 border border-slate-100 shadow-2xl shadow-slate-200/60 space-y-8 scroll-mt-24 max-w-4xl lg:max-w-5xl mx-auto">
          
          {/* Header */}
          <div className="text-center space-y-2.5 max-w-xl mx-auto">
            <div className="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200/60 px-3 py-1 text-xs font-semibold rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
              <span>DIRECT DOORSTEP DISPATCH</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">
              Express Checkout &amp; Order Placement
            </h2>
            <p className="text-sm text-slate-500">
              Complete your delivery details below to order with Cash on Delivery or centralized instant payment.
            </p>
          </div>

          {/* Success State */}
          {placedOrderInfo ? (
            <div className="max-w-lg mx-auto bg-slate-50/80 rounded-3xl p-6 sm:p-8 border border-slate-200 text-center space-y-6 animate-in zoom-in-95 duration-200">
              <div className="w-20 h-20 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <CheckCircle className="w-11 h-11" />
              </div>

              <div className="space-y-2">
                <span className="text-xs uppercase font-extrabold tracking-wider text-emerald-700 bg-emerald-50 px-3.5 py-1.5 rounded-full border border-emerald-200">
                  Transaction Confirmed
                </span>
                <h3 className="text-3xl font-black text-slate-900 mt-2">
                  Thank You for Your Order!
                </h3>
                <p className="text-sm text-slate-600">
                  Your order is registered with <strong>Steadfast Courier</strong>. Our rider will contact you prior to delivery.
                </p>
              </div>

              {/* Receipt Box */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 text-left space-y-3.5 text-sm shadow-sm">
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <span className="text-slate-500 font-medium">Order Number</span>
                  <span className="font-mono font-bold text-slate-900 text-base">#{placedOrderInfo.orderNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Consignment Tracking</span>
                  <span className="font-mono font-bold text-emerald-700">{placedOrderInfo.trackingNumber}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Option</span>
                  <span className="font-semibold text-slate-800">{placedOrderInfo.paymentMethod}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Payment Status</span>
                  <span className={`font-bold px-2.5 py-0.5 rounded-lg text-xs ${
                    placedOrderInfo.paymentStatus === 'paid' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {placedOrderInfo.paymentStatus === 'paid' ? 'Paid Online' : 'Pay on Delivery'}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500">Delivery Address</span>
                  <span className="font-medium text-slate-800 truncate max-w-xs">{placedOrderInfo.address}</span>
                </div>
                <div className="flex justify-between items-center pt-3 border-t border-slate-100 font-bold text-base">
                  <span className="text-slate-900">Grand Total</span>
                  <span className="font-mono text-2xl font-extrabold text-slate-900">
                    {formatBDT(placedOrderInfo.totalAmount)}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsTrackModalOpen(true)}
                  className="w-full sm:flex-1 h-12 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-sm font-semibold flex items-center justify-center gap-2 cursor-pointer shadow-sm transition-colors"
                >
                  <PackageSearch className="w-4 h-4" />
                  <span>Track Parcel Status</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPlacedOrderInfo(null)}
                  className="w-full sm:flex-1 h-12 bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 rounded-xl text-sm font-semibold cursor-pointer transition-colors"
                >
                  Place Another Order
                </button>
              </div>
            </div>
          ) : (
            /* Modern Redesigned Express Form */
            <form onSubmit={handleDirectOrderSubmit} className="space-y-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-start">
                
                {/* Column 1: Customer Info */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      1
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-900">
                      Delivery Information
                    </h3>
                  </div>

                  {/* Name Input */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Recipient Full Name <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Asif Mahmud"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      className="h-12 md:h-14 px-4 w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-800 text-base transition-all bg-white placeholder:text-slate-400"
                    />
                  </div>

                  {/* Phone Input */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      11-Digit Mobile Number <span className="text-rose-500">*</span>
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

                  {/* Address Input */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Full Street / House Address <span className="text-rose-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="House No., Road No., Area, Thana, District"
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      className="p-4 w-full rounded-xl border border-slate-200 focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-800 text-base transition-all bg-white placeholder:text-slate-400 resize-none"
                    />
                  </div>

                  {/* Delivery Location Cards */}
                  <div>
                    <label className="text-sm font-semibold text-slate-700 mb-2 block">
                      Delivery Location (Courier Charge)
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

                {/* Column 2: Payment Options & Summary */}
                <div className="space-y-6">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center font-bold text-sm">
                      2
                    </div>
                    <h3 className="text-base md:text-lg font-bold text-slate-900">
                      Payment &amp; Order Calculation
                    </h3>
                  </div>

                  {/* Payment Options Grid */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-slate-700 block">
                      Select Payment Option
                    </label>

                    <div className="grid grid-cols-2 gap-3">
                      {/* COD */}
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

                      {/* bKash */}
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

                      {/* Nagad */}
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

                    {/* Online Payment TrxID Input */}
                    {paymentMethod !== 'cod' && (
                      <div className="p-4 bg-slate-900 text-white rounded-2xl space-y-3 text-xs animate-in fade-in duration-150">
                        <div className="flex items-center justify-between text-slate-300">
                          <span>Central Merchant Account:</span>
                          <span className="font-mono font-bold text-emerald-400">01700-000000</span>
                        </div>
                        <p className="text-slate-300">
                          Please send <strong className="text-white font-mono">{formatBDT(orderGrandTotal)}</strong> via {paymentMethod.toUpperCase()} and enter your Transaction ID (TrxID) below:
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

                  {/* Pricing Breakdown Box */}
                  <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80 space-y-3">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                      Order Summary ({quantity} Item{quantity > 1 ? 's' : ''})
                    </div>
                    <div className="space-y-2 text-sm text-slate-600">
                      <div className="flex justify-between">
                        <span>Product Subtotal ({quantity}x)</span>
                        <span className="font-mono font-bold text-slate-900">{formatBDT(itemTotal)}</span>
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
                        {formatBDT(orderGrandTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Submit CTA Button */}
                  <button
                    type="submit"
                    disabled={isSubmittingOrder || !product.inStock}
                    className="h-14 w-full bg-slate-900 hover:bg-black text-white text-base md:text-lg font-semibold rounded-2xl shadow-lg shadow-slate-900/10 transition-all cursor-pointer flex items-center justify-center gap-2.5 active:scale-[0.99] disabled:opacity-50"
                  >
                    {isSubmittingOrder ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin text-emerald-400" />
                        <span>Confirming Direct Order...</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                        <span>
                          Confirm Order ({paymentMethod === 'cod' ? 'Cash on Delivery' : 'Pay Online'}) • {formatBDT(orderGrandTotal)}
                        </span>
                      </>
                    )}
                  </button>

                  <div className="text-xs text-slate-500 text-center flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    <span>No advance payment needed for Cash on Delivery. Pay upon parcel arrival.</span>
                  </div>

                </div>
              </div>
            </form>
          )}
        </section>

        {/* 4. Product Details, Specifications, and Warranty Tabs */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E6E4E0] shadow-sm space-y-6">
          <div className="flex items-center gap-2 border-b border-neutral-200 pb-3 overflow-x-auto">
            <button
              type="button"
              onClick={() => setActiveTab('description')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'description'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Product Description
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('features')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'features'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Key Features &amp; Materials
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('specifications')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                activeTab === 'specifications'
                  ? 'bg-neutral-900 text-white shadow-2xs'
                  : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
              }`}
            >
              Specifications &amp; Warranty
            </button>
          </div>

          <div className="text-xs sm:text-sm text-neutral-700 leading-relaxed min-h-[160px]">
            {activeTab === 'description' && (
              <div className="space-y-4">
                <p>{product?.description}</p>
                <p>
                  Every unit is hand-checked by quality assurance before courier packaging to ensure full customer satisfaction.
                </p>
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-3">
                <ul className="space-y-2">
                  {product?.features && product.features.length > 0 ? (
                    product.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))
                  ) : (
                    <li className="flex items-start gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                      <span>Premium Grade Materials engineered for longevity and everyday comfort.</span>
                    </li>
                  )}
                </ul>
              </div>
            )}

            {activeTab === 'specifications' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[11px] text-neutral-500 font-medium">Warranty Coverage</span>
                    <p className="font-bold text-neutral-900 mt-0.5">7-Day Free Replacement Warranty</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[11px] text-neutral-500 font-medium">Courier Partner</span>
                    <p className="font-bold text-neutral-900 mt-0.5">Steadfast / Pathao Express Dispatch</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[11px] text-neutral-500 font-medium">Authenticity</span>
                    <p className="font-bold text-neutral-900 mt-0.5">100% Genuine Certified Goods</p>
                  </div>
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-100">
                    <span className="text-[11px] text-neutral-500 font-medium">Payment Options</span>
                    <p className="font-bold text-neutral-900 mt-0.5">Cash on Delivery / bKash / Card</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* 5. Customer FAQs Section */}
        <section className="bg-white rounded-3xl p-6 sm:p-10 border border-[#E6E4E0] shadow-sm space-y-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-black text-neutral-900">
              Frequently Asked Questions
            </h3>
            <p className="text-xs text-neutral-500">
              Clear information regarding deliveries, payments, and replacement warranty.
            </p>
          </div>

          <div className="divide-y divide-neutral-100 border border-neutral-100 rounded-2xl overflow-hidden">
            {[
              {
                q: 'Can I check the parcel before paying cash?',
                a: 'Yes, our delivery partners (Steadfast and Pathao) allow you to inspect the outer packaging and ensure the consignment details match before handing over the payment.'
              },
              {
                q: 'How fast is nationwide delivery?',
                a: 'Within Dhaka, orders arrive within 24 to 48 hours. Outside Dhaka, delivery takes 2 to 4 business days to your designated home address.'
              },
              {
                q: 'How do I claim a replacement if something is wrong?',
                a: 'Contact our store support helpline via phone or WhatsApp with your order number. We will initiate a replacement parcel immediately under our 7-Day Guarantee.'
              }
            ].map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div key={index} className="transition-colors">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full py-4 px-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-neutral-900 hover:text-black cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4 text-neutral-400 shrink-0" /> : <ChevronDown className="w-4 h-4 text-neutral-400 shrink-0" />}
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-4 text-xs text-neutral-600 leading-relaxed animate-in fade-in duration-150">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

      </main>

      {/* 6. Full Resolution Lightbox Modal */}
      {isLightboxOpen && (
        <div 
          onClick={() => setIsLightboxOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/90 backdrop-blur-md animate-in fade-in duration-150"
        >
          <div className="relative max-w-3xl w-full flex flex-col items-center">
            <button
              onClick={() => setIsLightboxOpen(false)}
              className="absolute -top-12 right-0 p-2 text-white hover:text-neutral-300 rounded-full cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={galleryImages[activeImageIndex] || product?.imageUrl}
              alt={product?.name}
              className="max-h-[80vh] w-auto object-contain rounded-2xl shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
        </div>
      )}

      {/* 7. Sticky Mobile Bottom CTA */}
      <div className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-neutral-200 px-4 py-2.5 shadow-xl flex items-center justify-between gap-3 h-[66px]">
        <div className="leading-tight shrink-0">
          <div className="text-[10px] text-neutral-400 font-bold uppercase">Total Price</div>
          <div className="text-base font-black text-neutral-950 font-mono">
            {formatBDT(displayPrice * quantity)}
          </div>
        </div>

        <div className="flex items-center gap-2 flex-1 justify-end">
          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!product.inStock}
            className="px-3 py-2.5 bg-neutral-100 text-neutral-800 rounded-xl text-xs font-bold border border-neutral-200 flex items-center gap-1 active:scale-95 transition-transform"
          >
            <ShoppingBag className="w-3.5 h-3.5" />
            <span>Bag</span>
          </button>

          <button
            type="button"
            onClick={scrollToCheckout}
            disabled={!product.inStock}
            className="flex-1 py-2.5 px-3 bg-neutral-900 text-white rounded-xl text-xs font-bold shadow-md flex items-center justify-center gap-1.5 active:scale-95 transition-transform cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="truncate">Order Now (COD)</span>
          </button>
        </div>
      </div>

      {/* 8. Public Order Tracking Modal */}
      <PublicOrderTrackingModal
        isOpen={isTrackModalOpen}
        onClose={() => setIsTrackModalOpen(false)}
        storeName={storeName}
      />

      {/* 9. Store Policies Modal */}
      <StorePolicyModal
        policyType={activePolicy}
        onClose={() => setActivePolicy(null)}
        storeName={storeName}
      />

      {/* 10. 100% White-Labeled Dedicated Reseller Store Footer */}
      <footer className="bg-neutral-950 text-white border-t border-neutral-800 pt-10 pb-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{storeName}</span>
              <span>•</span>
              <span>Authorized Storefront</span>
            </div>
            <div className="flex flex-wrap items-center gap-4 sm:gap-6 text-xs text-neutral-400">
              <button 
                type="button"
                onClick={() => setActivePolicy('terms')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Terms of Service
              </button>
              <button 
                type="button"
                onClick={() => setActivePolicy('privacy')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Privacy Policy
              </button>
              <button 
                type="button"
                onClick={() => setActivePolicy('refund')}
                className="hover:text-white transition-colors cursor-pointer"
              >
                Return &amp; Refund Policy
              </button>
              <button 
                type="button"
                onClick={() => setIsTrackModalOpen(true)} 
                className="text-emerald-400 hover:text-emerald-300 font-semibold cursor-pointer flex items-center gap-1"
              >
                <PackageSearch className="w-3.5 h-3.5" /> Track Order
              </button>
            </div>
          </div>
          <div className="text-[11px] text-neutral-500 text-center sm:text-left border-t border-neutral-900 pt-4">
            &copy; {new Date().getFullYear()} {storeName}. All rights reserved. Nationwide Cash on Delivery via Steadfast &amp; Pathao. Centralized Secure Merchant Processing.
          </div>
        </div>
      </footer>

    </div>
  );
}
