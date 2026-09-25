'use client';

import React, { useState } from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { Store, ShieldCheck, Heart, ChevronDown } from 'lucide-react';

export function AboutView() {
  const { navigate, setUserRole } = useMarketplace();

  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What is the "Zero Invest" philosophy?',
      a: 'Traditional e-commerce requires heavy upfront inventory purchase, warehousing, and shipping management. Zero Invest allows anyone to become a successful reseller: browse tested wholesale products, set your desired selling price, launch customized product landing pages, and earn profit per sale with ৳0 upfront inventory investment.'
    },
    {
      q: 'How does shipping and order fulfillment work?',
      a: 'When your customer places an order on your shared landing page or store, Zero Invest handles fulfillment and dispatches the item through premier couriers across Bangladesh with end-to-end live tracking.'
    },
    {
      q: 'How does Zero Invest protect shoppers?',
      a: 'We provide customer order verification, cash-on-delivery inspection, and full customer service support.'
    },
    {
      q: 'When and how do resellers receive payouts?',
      a: 'Profit from successfully delivered orders is credited to your reseller wallet and paid out on a weekly schedule directly to your bKash, Nagad, Rocket, or bank account.'
    }
  ];

  return (
    <div className="w-full max-w-[1400px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10 py-8 sm:py-12 space-y-12">
      {/* Hero Story */}
      <div className="text-center max-w-2xl mx-auto">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#C98F6B]">
          Our Purpose &amp; Mission
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-[#111111] tracking-tight mt-1">
          Empowering Resellers with Zero Upfront Capital
        </h1>
        <p className="text-sm text-neutral-600 mt-3 leading-relaxed">
          Zero Invest is built to democratize e-commerce. We empower ambitious resellers and creators to launch product landing pages, reach customers, and build profitable digital businesses without holding inventory.
        </p>
      </div>

      {/* Values Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] text-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 text-[#C98F6B] shadow-2xs">
            <Store className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#111111] mb-1">Zero Upfront Inventory</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Sell tested wholesale products without buying inventory upfront or worrying about dead stock.
          </p>
        </div>

        <div className="p-6 bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] text-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 text-[#C98F6B] shadow-2xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#111111] mb-1">Automated Fulfillment</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            From warehousing to doorstep courier delivery, Zero Invest takes care of the operational heavy lifting.
          </p>
        </div>

        <div className="p-6 bg-[#F7F6F3] rounded-3xl border border-[#E6E4E0] text-center">
          <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center mx-auto mb-4 text-[#C98F6B] shadow-2xs">
            <Heart className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-base text-[#111111] mb-1">Weekly Payouts</h3>
          <p className="text-xs text-neutral-600 leading-relaxed">
            Fast, transparent weekly payouts directly to your bKash, Nagad, Rocket, or bank account.
          </p>
        </div>
      </div>

      {/* FAQ Accordion */}
      <div className="bg-white rounded-3xl border border-[#E6E4E0] p-6 sm:p-8 shadow-2xs">
        <h2 className="text-xl font-bold text-[#111111] mb-6">Frequently Asked Questions</h2>
        <div className="divide-y divide-neutral-100">
          {faqs.map((faq, i) => (
            <div key={i} className="py-4 first:pt-0 last:pb-0">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between text-left font-bold text-sm text-[#111111] gap-4"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`w-4 h-4 text-neutral-400 transition-transform ${openFaq === i ? 'rotate-180 text-black' : ''}`} />
              </button>
              {openFaq === i && (
                <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Reseller Onboarding Call to Action */}
      <div className="bg-[#111111] text-white rounded-3xl p-8 text-center flex flex-col items-center">
        <h3 className="text-2xl font-bold mb-2">Ready to Start Selling?</h3>
        <p className="text-xs sm:text-sm text-neutral-400 max-w-md mb-6">
          Join thousands of active resellers across Bangladesh earning with Zero Invest. Setup takes less than 2 minutes.
        </p>
        <button
          onClick={() => navigate('reseller')}
          className="px-7 py-3.5 bg-[#C98F6B] hover:bg-[#b87d59] text-white rounded-full text-xs sm:text-sm font-bold transition-colors shadow-md cursor-pointer"
        >
          Start Selling Now
        </button>
      </div>
    </div>
  );
}
