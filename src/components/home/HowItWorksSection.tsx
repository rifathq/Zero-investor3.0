'use client';

import React from 'react';
import { 
  Package, 
  Sparkles, 
  Share2, 
  PackageCheck, 
  Wallet, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { useMarketplace } from '@/context/MarketplaceContext';

export function HowItWorksSection() {
  const { navigate } = useMarketplace();

  const workflowSteps = [
    {
      num: '01',
      icon: <Package className="w-5 h-5 text-[#C98F6B]" />,
      title: 'Choose Winning Product',
      desc: 'Browse hundreds of tested, verified wholesale products in electronics, fashion, beauty, and home with high reseller profit potential.'
    },
    {
      num: '02',
      icon: <Sparkles className="w-5 h-5 text-[#C98F6B]" />,
      title: 'Generate 1-Click Landing Page',
      desc: 'Our system instantly builds an optimized, high-converting product landing page with your custom branding, images, and cash-on-delivery form.'
    },
    {
      num: '03',
      icon: <Share2 className="w-5 h-5 text-[#C98F6B]" />,
      title: 'Market on Your Channels',
      desc: 'Share your unique landing page link across Facebook, TikTok, Instagram, WhatsApp, or run targeted digital marketing ads.'
    },
    {
      num: '04',
      icon: <PackageCheck className="w-5 h-5 text-[#C98F6B]" />,
      title: 'Zero-Stress Fulfillment',
      desc: 'Customer orders are received in your portal. Zero Invest packages the items, dispatches via Pathao or Steadfast, and collects the cash.'
    },
    {
      num: '05',
      icon: <Wallet className="w-5 h-5 text-emerald-600" />,
      title: 'Earn & Receive Weekly Payouts',
      desc: 'Once orders are delivered and verified, your eligible profit is credited to your wallet and settled through weekly payouts via bKash, Nagad, or Bank.'
    }
  ];

  return (
    <section className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-10 sm:py-16 overflow-hidden">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14">
        <span className="text-[11px] sm:text-xs font-bold uppercase tracking-[0.25em] text-[#C98F6B]">
          Simple 5-Step Model
        </span>
        <h2 className="text-2xl sm:text-4xl font-extrabold text-[#111111] tracking-tight mt-1.5">
          How Zero Invest Reselling Works
        </h2>
        <p className="text-xs sm:text-sm text-neutral-600 mt-2">
          Start selling without buying inventory upfront. You focus on marketing—we manage wholesale sourcing, quality control, warehousing, and nationwide courier delivery.
        </p>
      </div>

      {/* Grid of Steps */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:gap-5">
        {workflowSteps.map((step, idx) => (
          <div
            key={idx}
            className="group relative bg-white rounded-2xl p-5 sm:p-6 border border-[#E6E4E0] flex flex-col justify-between hover:shadow-md transition-all duration-200"
          >
            <div>
              <div className="flex items-center justify-between mb-4">
                <span className="text-2xl sm:text-3xl font-black text-neutral-200 group-hover:text-[#C98F6B] transition-colors">
                  {step.num}
                </span>
                <div className="w-10 h-10 rounded-xl bg-[#F7F6F3] flex items-center justify-center shadow-xs">
                  {step.icon}
                </div>
              </div>

              <h3 className="text-base font-bold text-[#111111] leading-snug mb-2">
                {step.title}
              </h3>

              <p className="text-xs text-neutral-600 leading-relaxed">
                {step.desc}
              </p>
            </div>

            <div className="mt-4 pt-3 border-t border-neutral-100 flex items-center gap-1.5 text-[11px] font-semibold text-neutral-400">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
              <span>Automated system</span>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom CTA bar */}
      <div className="mt-10 p-6 sm:p-8 rounded-2xl bg-neutral-900 text-white flex flex-col sm:flex-row items-center justify-between gap-5">
        <div>
          <h3 className="text-lg sm:text-xl font-bold">
            Ready to start earning without buying stock?
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1">
            Join 3,200+ Bangladeshi entrepreneurs making ৳20,000 to ৳150,000+ monthly.
          </p>
        </div>

        <button
          onClick={() => navigate('reseller')}
          className="px-7 py-3 rounded-full bg-[#C98F6B] hover:bg-[#b57a56] text-white text-xs sm:text-sm font-bold flex items-center gap-2 transition-colors shrink-0 shadow-md cursor-pointer"
        >
          <span>Start Selling with Zero Invest</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
}
