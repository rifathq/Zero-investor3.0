import React from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { RESELLER_PLANS } from '@/lib/resellerMockData';
import { CheckCircle2, ArrowLeft, Zap } from 'lucide-react';
import { formatBDT } from '@/lib/formatters';

export function ResellerPackagesView() {
  const { navigate } = useMarketplace();
  const { isAuthenticated } = useAuth();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <button 
        onClick={() => navigate('reseller')} 
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-neutral-900 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Reseller Hub
      </button>

      <div className="text-center max-w-2xl mx-auto space-y-2">
        <span className="text-[#C98F6B] text-xs font-bold uppercase tracking-wider">Subscription Tiers</span>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-neutral-900">Choose Your Partner Tier</h1>
        <p className="text-xs sm:text-sm text-neutral-500">
          Scale your earning potential with enhanced seller tooling, priority courier routing, and dedicated support.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch pt-4">
        {RESELLER_PLANS.map(plan => {
          const isPopular = plan.id === 'pro';
          return (
            <div 
              key={plan.id}
              className={`p-7 rounded-3xl border flex flex-col justify-between transition-all ${
                isPopular 
                  ? 'bg-neutral-900 text-white border-neutral-900 shadow-xl ring-2 ring-[#C98F6B]' 
                  : 'bg-white text-neutral-900 border-[#E6E4E0]'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold">{plan.name}</h3>
                  {plan.badge && (
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#C98F6B] text-white uppercase tracking-wider">
                      {plan.badge}
                    </span>
                  )}
                </div>

                <div className="mb-6">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold">{formatBDT(plan.priceBDT)}</span>
                    <span className={`text-xs ${isPopular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                      {plan.priceBDT === 0 ? ' / lifetime' : ' / month'}
                    </span>
                  </div>
                  <p className={`text-xs mt-2 ${isPopular ? 'text-neutral-300' : 'text-neutral-600'}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="pt-4 border-t border-neutral-200/20 space-y-2.5 mb-8">
                  {(plan.features || []).map((f, i) => (
                    <div key={i} className="flex items-start gap-2 text-xs">
                      <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-[#C98F6B]' : 'text-emerald-600'}`} />
                      <span className={isPopular ? 'text-neutral-200' : 'text-neutral-700'}>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => {
                  if (isAuthenticated) {
                    navigate('reseller-dashboard');
                  } else {
                    navigate('reseller-register');
                  }
                }}
                className={`w-full py-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isPopular 
                    ? 'bg-[#C98F6B] hover:bg-[#b87e5b] text-white shadow-md' 
                    : 'bg-neutral-900 hover:bg-neutral-800 text-white'
                }`}
              >
                {plan.priceBDT === 0 ? 'Get Started Free' : 'Upgrade to ' + plan.name}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
