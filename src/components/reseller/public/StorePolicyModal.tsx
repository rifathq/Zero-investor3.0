'use client';

import React from 'react';
import { X, ShieldCheck, RotateCcw, FileText, Lock, CheckCircle2 } from 'lucide-react';

export type PolicyType = 'terms' | 'privacy' | 'refund' | null;

interface StorePolicyModalProps {
  policyType: PolicyType;
  onClose: () => void;
  storeName?: string;
}

export function StorePolicyModal({
  policyType,
  onClose,
  storeName = 'Dhaka Trendz Collection'
}: StorePolicyModalProps) {
  if (!policyType) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-950/70 backdrop-blur-xs animate-in fade-in duration-150">
      <div 
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative bg-white rounded-3xl max-w-2xl w-full border border-neutral-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 max-h-[85vh] flex flex-col z-10 animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-100 pb-4 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-neutral-900 text-white flex items-center justify-center">
              {policyType === 'terms' && <FileText className="w-5 h-5 text-emerald-400" />}
              {policyType === 'privacy' && <Lock className="w-5 h-5 text-emerald-400" />}
              {policyType === 'refund' && <RotateCcw className="w-5 h-5 text-emerald-400" />}
            </div>
            <div>
              <h3 className="font-extrabold text-base sm:text-lg text-neutral-900">
                {policyType === 'terms' && 'Terms of Service'}
                {policyType === 'privacy' && 'Privacy Policy'}
                {policyType === 'refund' && 'Return & Refund Policy'}
              </h3>
              <p className="text-xs text-neutral-500">
                {storeName} • Customer Protection Standard
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-neutral-400 hover:text-neutral-900 hover:bg-neutral-100 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto space-y-5 text-xs sm:text-sm text-neutral-700 leading-relaxed pr-1">
          {policyType === 'terms' && (
            <>
              <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-100 space-y-1">
                <span className="text-xs font-bold text-neutral-900">Order Verification & Delivery</span>
                <p className="text-xs text-neutral-600">
                  All customer orders placed through {storeName} are verified and processed through our centralized courier and fulfillment network (Steadfast / Pathao Courier) across all 64 districts of Bangladesh.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm">1. Cash on Delivery (COD) Rules</h4>
                <p className="text-xs text-neutral-600">
                  Customers may inspect the parcel exterior upon arrival. If the parcel appears damaged or tampered with before opening, you may request the delivery rider to note it or return it immediately without charge.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm">2. Online Payments & Security</h4>
                <p className="text-xs text-neutral-600">
                  Online payments via bKash, Nagad, Visa, or Mastercard are handled via 256-bit encrypted merchant payment processing. You will receive an instant digital receipt and automated consignment tracking number.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm">3. Pricing & Product Accuracy</h4>
                <p className="text-xs text-neutral-600">
                  All prices listed on {storeName} are final customer prices in Bangladeshi Taka (BDT) including all applicable standard taxes.
                </p>
              </div>
            </>
          )}

          {policyType === 'privacy' && (
            <>
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 space-y-1 text-emerald-950">
                <span className="text-xs font-bold flex items-center gap-1.5 text-emerald-900">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  Zero Spam & 100% Data Protection
                </span>
                <p className="text-xs text-emerald-800">
                  Your phone number, shipping address, and order details are strictly used for delivery coordination and dispatch SMS notifications. We never sell or share your data with third parties.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm">1. Information We Collect</h4>
                <p className="text-xs text-neutral-600">
                  When you place an order with {storeName}, we collect your name, delivery address, and active 11-digit phone number strictly to deliver your parcel and provide courier tracking updates.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm">2. Courier Sharing for Dispatch</h4>
                <p className="text-xs text-neutral-600">
                  Your shipping address and contact number are transmitted securely to authorized courier services (Steadfast Courier or Pathao) solely for parcel drop-off and delivery OTP verification.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm">3. Financial Information Protection</h4>
                <p className="text-xs text-neutral-600">
                  We never store debit/credit card numbers or mobile wallet PINs on our servers. All transactions are securely encrypted via certified payment gateways.
                </p>
              </div>
            </>
          )}

          {policyType === 'refund' && (
            <>
              <div className="p-4 bg-neutral-900 text-white rounded-2xl space-y-1">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="text-xs font-bold">7-Day Free Replacement Guarantee</span>
                </div>
                <p className="text-xs text-neutral-300">
                  If your ordered item is damaged during transit, has manufacturing defects, or is incorrect, you are eligible for an immediate hassle-free replacement within 7 days of delivery.
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm">1. Eligibility Criteria</h4>
                <ul className="text-xs text-neutral-600 space-y-1.5 list-disc pl-4">
                  <li>Item must be in its original packaging with tags and warranty cards intact.</li>
                  <li>Request must be submitted within 7 days of parcel reception.</li>
                  <li>Unboxing video or photo evidence is recommended for swift replacement dispatch.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-neutral-900 text-sm">2. How to Request Replacement / Refund</h4>
                <p className="text-xs text-neutral-600">
                  Simply use the <strong>Track Order</strong> portal with your Order ID, or contact our helpline via WhatsApp with your order receipt. Our customer support team will arrange a free courier pick-up or fast replacement dispatch within 24–48 hours.
                </p>
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-neutral-100 pt-4 flex items-center justify-between shrink-0">
          <span className="text-xs text-neutral-500">
            &copy; {new Date().getFullYear()} {storeName}
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs font-bold hover:bg-neutral-800 transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
