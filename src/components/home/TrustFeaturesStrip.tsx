import React from 'react';
import { Truck, ShieldCheck, RotateCcw, Headphones, Wallet } from 'lucide-react';

export function TrustFeaturesStrip() {
  const features = [
    {
      icon: Truck,
      title: 'Nationwide COD',
      desc: 'Cash on delivery via Pathao & Steadfast'
    },
    {
      icon: ShieldCheck,
      title: 'Verified Quality',
      desc: '100% genuine guaranteed products'
    },
    {
      icon: Wallet,
      title: 'Zero Capital Reselling',
      desc: 'Start with ৳0 upfront investment'
    },
    {
      icon: RotateCcw,
      title: '7-Day Return Policy',
      desc: 'Hassle-free replacement guarantee'
    },
    {
      icon: Headphones,
      title: 'Dedicated Support',
      desc: '24/7 seller and buyer assistance'
    }
  ];

  return (
    <div className="bg-[#FAF9F5] border-y border-[#E6E4E0] py-6 my-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 sm:gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div key={idx} className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E4E0] text-neutral-800 flex items-center justify-center shrink-0 shadow-xs">
                  <Icon className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs sm:text-sm font-bold text-neutral-900">{feat.title}</h4>
                  <p className="text-[11px] text-neutral-500 mt-0.5 leading-snug">{feat.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
