import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Package, 
  Smartphone, 
  ArrowRight, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Store, 
  Truck,
  Sparkles,
  Award,
  Layers,
  Share2,
  CheckCircle2,
  PlusCircle,
  Layout,
  Users,
  Wallet,
  ShieldCheck,
  Zap,
  Check
} from 'lucide-react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { useReseller } from '@/context/ResellerContext';
import { RESELLER_PLANS } from '@/lib/resellerMockData';

export const ResellerLandingPage: React.FC = () => {
  const { navigate } = useMarketplace();
  const { user, userProfile, isAuthenticated, role } = useAuth();
  const { isReseller, resellerProfile } = useReseller();

  const isUserReseller = Boolean(
    isReseller || 
    role === 'seller' || 
    role === 'reseller' || 
    userProfile?.role === 'seller' || 
    userProfile?.role === 'reseller'
  );

  const isCustomerOnly = isAuthenticated && !isUserReseller;

  // Profit Calculator State
  const [calculatorSales, setCalculatorSales] = useState<number>(5);
  const [avgProfitPerOrder, setAvgProfitPerOrder] = useState<number>(850);
  const estimatedMonthlyProfit = calculatorSales * avgProfitPerOrder * 30;

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'Do I need upfront investment or capital to become a reseller?',
      a: 'No upfront inventory purchase required. You never buy inventory upfront or carry warehouse stock. You simply pick products, share landing pages, and earn when orders are delivered.'
    },
    {
      q: 'How does Cash on Delivery (COD) collection work?',
      a: 'When your customer places an order on your landing page, our partner couriers (Steadfast, Pathao, REDX) deliver the parcel to their doorstep anywhere in Bangladesh and collect the cash.'
    },
    {
      q: 'When and how do I receive my profits?',
      a: 'Once the delivery is verified, your net profit margin is credited to your Reseller Wallet. We process weekly payouts directly to your bKash, Nagad, or Bangladeshi bank account.'
    },
    {
      q: 'How do custom landing pages work?',
      a: 'With 1 click, you generate a fast, conversion-optimized landing page with high-res photos, bullet points, and an integrated COD checkout form tailored for Facebook & TikTok traffic.'
    },
    {
      q: 'What happens if a customer returns or cancels an order?',
      a: 'Our fulfillment hub manages return inspection and restocking. You can track all return statuses in real time in your reseller dashboard.'
    },
    {
      q: 'Can I sell across all 64 districts in Bangladesh?',
      a: 'Yes! Our integrated courier network covers every district, thana, and union with fast home delivery and Cash on Delivery service.'
    }
  ];

  // The 8-Step Reseller Journey required by specifications
  const resellerJourneySteps = [
    {
      step: 1,
      icon: Package,
      title: 'Choose products from the Zero Invest catalog',
      desc: 'Browse hundreds of high-demand, pre-tested gadgets, electronics, fashion, and lifestyle items sourced directly at genuine wholesale rates.'
    },
    {
      step: 2,
      icon: PlusCircle,
      title: 'Add products to your reseller business',
      desc: 'Select the products you want to sell with 1-click, configure your own retail selling price, and set your desired profit margin per unit.'
    },
    {
      step: 3,
      icon: Layout,
      title: 'Create a professional product landing page',
      desc: 'Generate lightning-fast, high-converting product landing pages in seconds with zero coding, zero hosting fees, and built-in COD checkout.'
    },
    {
      step: 4,
      icon: Share2,
      title: 'Share the landing page on Facebook, WhatsApp, TikTok, etc.',
      desc: 'Promote your branded link across social media feeds, reels, groups, paid Facebook ads, and direct chat to attract buyers nationwide.'
    },
    {
      step: 5,
      icon: Users,
      title: 'Customers place orders through the reseller landing page',
      desc: 'Buyers place orders quickly via Cash on Delivery by entering their address and phone number—no upfront payment needed from them.'
    },
    {
      step: 6,
      icon: Truck,
      title: 'Zero Invest handles fulfillment and courier processing',
      desc: 'Our central warehouse picks, inspects, packs, and dispatches parcels via Steadfast, Pathao, and REDX to all 64 districts.'
    },
    {
      step: 7,
      icon: CheckCircle2,
      title: 'Eligible reseller profit is credited after successful delivery/verification',
      desc: 'When the customer receives the parcel and pays the courier, your profit margin is verified and automatically credited to your Reseller Wallet.'
    },
    {
      step: 8,
      icon: Wallet,
      title: 'Weekly payouts through supported payout methods',
      desc: 'Receive your accumulated profits every week directly into your bKash, Nagad, or Bangladeshi bank account with complete transparency.'
    }
  ];

  const handlePrimaryCTA = () => {
    if (isUserReseller) {
      navigate('reseller-dashboard');
    } else {
      navigate('reseller-register');
    }
  };

  const getPrimaryButtonText = () => {
    if (isUserReseller) return 'Go to Reseller Portal';
    if (isCustomerOnly) return 'Complete Reseller Onboarding';
    return 'Create Your Reseller Account';
  };

  return (
    <div className="w-full bg-[#FAF9F5] text-neutral-900 min-h-screen">
      {/* 1. HERO SECTION */}
      <section className="relative overflow-hidden pt-10 pb-16 md:pt-16 md:pb-24 border-b border-[#E6E4E0] bg-gradient-to-b from-[#FAF9F5] via-white to-[#F7F6F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* User status alert if already logged in */}
          {isUserReseller && (
            <div className="max-w-3xl mx-auto mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-between gap-3 text-xs sm:text-sm text-emerald-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  You are logged in as an active reseller <strong>({resellerProfile?.storeName || 'My Store'})</strong>.
                </span>
              </div>
              <button
                onClick={() => navigate('reseller-dashboard')}
                className="px-3 py-1.5 rounded-lg bg-emerald-800 text-white font-bold text-xs hover:bg-emerald-900 transition-colors shrink-0 cursor-pointer"
              >
                Open Dashboard
              </button>
            </div>
          )}

          {isCustomerOnly && (
            <div className="max-w-3xl mx-auto mb-6 p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-between gap-3 text-xs sm:text-sm text-amber-900 shadow-xs">
              <div className="flex items-center gap-2.5">
                <Store className="w-4 h-4 text-[#C98F6B] shrink-0" />
                <span>
                  Logged in as <strong>{user?.displayName || userProfile?.displayName || user?.email}</strong>. Complete your 1-minute reseller setup to start selling.
                </span>
              </div>
              <button
                onClick={() => navigate('reseller-register')}
                className="px-3 py-1.5 rounded-lg bg-[#C98F6B] text-white font-bold text-xs hover:bg-[#b07855] transition-colors shrink-0 cursor-pointer"
              >
                Complete Setup
              </button>
            </div>
          )}

          <div className="text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#C98F6B]/10 border border-[#C98F6B]/30 text-[#8C5835] text-xs sm:text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-[#C98F6B]" />
              <span>#1 Zero-Inventory Reseller Platform in Bangladesh</span>
            </div>

            {/* Exact Required Headline */}
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-neutral-900 leading-[1.15]">
              Launch Your Online Reselling Business
            </h1>

            {/* Exact Required Supporting Text */}
            <p className="mt-6 text-base sm:text-lg text-neutral-600 leading-relaxed max-w-2xl mx-auto font-normal">
              Start selling products without buying inventory upfront. Choose products, create your landing page, share it with customers, and earn from successful deliveries.
            </p>

            {/* Required Primary & Secondary CTAs */}
            <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4">
              <button
                onClick={handlePrimaryCTA}
                className="w-full sm:w-auto px-8 py-4 rounded-xl bg-[#111111] hover:bg-neutral-800 text-white font-bold text-base shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>{getPrimaryButtonText()}</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform text-[#C98F6B]" />
              </button>

              <button
                onClick={() => navigate('shop')}
                className="w-full sm:w-auto px-7 py-4 rounded-xl bg-white border border-[#E6E4E0] hover:border-neutral-900 text-neutral-800 font-bold text-base shadow-xs hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Layers className="w-4 h-4 text-[#C98F6B]" />
                <span>Browse Products</span>
              </button>
            </div>

            {/* Helper link for existing users */}
            {!isAuthenticated && (
              <div className="mt-4 text-xs text-neutral-500">
                Already registered as a reseller?{' '}
                <button
                  onClick={() => navigate('reseller-login')}
                  className="font-bold text-[#8C5835] hover:underline cursor-pointer"
                >
                  Sign In to Reseller Portal
                </button>
              </div>
            )}

            {/* Trust metrics */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-[#E6E4E0]/80">
              <div className="text-center p-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900">৳0</p>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">Upfront Investment</p>
              </div>
              <div className="text-center p-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#C98F6B]">64 Districts</p>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">Cash on Delivery</p>
              </div>
              <div className="text-center p-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-neutral-900">৳850+</p>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">Average Profit / Order</p>
              </div>
              <div className="text-center p-3">
                <p className="text-2xl sm:text-3xl font-extrabold text-[#C98F6B]">Weekly</p>
                <p className="text-xs sm:text-sm text-neutral-500 font-medium">bKash, Nagad & Bank Payouts</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. THE RESELLER JOURNEY: HOW IT WORKS (8 DETAILED STEPS) */}
      <section className="py-16 md:py-24 bg-white border-b border-[#E6E4E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-14">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F7F6F3] border border-[#E6E4E0] text-neutral-700 text-xs font-bold uppercase tracking-wider mb-3">
              <TrendingUp className="w-3.5 h-3.5 text-[#C98F6B]" />
              <span>The Reseller Journey</span>
            </div>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 tracking-tight">
              How Zero Invest Powers Your Business
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-3">
              A simple, profitable, 8-step journey built specifically for online sellers in Bangladesh.
            </p>
          </div>

          {/* 8 Steps Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {resellerJourneySteps.map((step) => {
              const StepIcon = step.icon;
              return (
                <div
                  key={step.step}
                  className="relative bg-[#FAF9F5] border border-[#E6E4E0] rounded-2xl p-6 flex flex-col justify-between hover:border-[#C98F6B]/60 hover:shadow-md transition-all group"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-xl bg-white border border-[#E6E4E0] text-[#C98F6B] flex items-center justify-center group-hover:scale-110 group-hover:bg-[#111111] group-hover:text-white transition-all shadow-xs">
                        <StepIcon className="w-5 h-5" />
                      </div>
                      <span className="text-xs font-black text-neutral-400 bg-white px-2 py-0.5 rounded-full border border-neutral-200">
                        STEP {step.step}
                      </span>
                    </div>

                    <h3 className="font-bold text-neutral-900 text-base mb-2 group-hover:text-[#8C5835] transition-colors leading-snug">
                      {step.title}
                    </h3>

                    <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                      {step.desc}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-[#E6E4E0]/60 flex items-center text-[11px] font-bold text-[#C98F6B]">
                    <span>Step {step.step} of 8</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* CTA below journey */}
          <div className="mt-12 text-center">
            <button
              onClick={handlePrimaryCTA}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#111111] hover:bg-neutral-800 text-white font-bold text-sm shadow-md transition-all cursor-pointer"
            >
              <span>{getPrimaryButtonText()}</span>
              <ArrowRight className="w-4 h-4 text-[#C98F6B]" />
            </button>
          </div>
        </div>
      </section>

      {/* 3. INTERACTIVE PROFIT CALCULATOR */}
      <section className="py-16 md:py-24 bg-[#FAF9F5] border-b border-[#E6E4E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Column: Why Reselling Works */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-white border border-[#E6E4E0] text-neutral-700 text-xs font-bold uppercase tracking-wider">
                <DollarSign className="w-3.5 h-3.5 text-[#C98F6B]" />
                Transparent Profit Margins
              </div>

              <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 leading-tight">
                You Set the Selling Price, You Keep 100% of the Profit
              </h2>

              <p className="text-neutral-600 leading-relaxed text-sm sm:text-base">
                Zero Invest sources directly from verified suppliers and master importers at wholesale factory rates. You add your desired profit margin (for example: Wholesale Price ৳1,450 + Your Margin ৳900 = Retail Price ৳2,350) and collect your margin upon delivery.
              </p>

              <div className="space-y-3.5 pt-2">
                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#E6E4E0]">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">Zero Inventory Loss Risk</h4>
                    <p className="text-xs text-neutral-500">Unsold goods stay in our warehouse. You only profit when an item is successfully delivered.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#E6E4E0]">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">Automated Courier Dispatch</h4>
                    <p className="text-xs text-neutral-500">No need to negotiate courier contracts or visit delivery hubs. We handle Steadfast, Pathao, and REDX integration.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 bg-white p-3.5 rounded-xl border border-[#E6E4E0]">
                  <Check className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-sm text-neutral-900">Reliable Weekly Settlements</h4>
                    <p className="text-xs text-neutral-500">Earnings automatically settle to your wallet and withdraw via bKash, Nagad, or Bank every week.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Interactive Profit Calculator */}
            <div className="lg:col-span-6 bg-white border border-[#E6E4E0] rounded-3xl p-6 sm:p-8 shadow-sm">
              <div className="flex items-center justify-between pb-5 border-b border-[#E6E4E0]">
                <div>
                  <h3 className="text-lg font-bold text-neutral-900">Monthly Earnings Calculator</h3>
                  <p className="text-xs text-neutral-500">Estimate your potential earnings in Bangladeshi Taka (৳)</p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-[#C98F6B]/15 text-[#C98F6B] flex items-center justify-center font-bold">
                  ৳
                </div>
              </div>

              <div className="space-y-6 pt-6">
                <div>
                  <div className="flex justify-between items-center text-sm font-semibold text-neutral-800 mb-2">
                    <span>Average Daily Delivered Orders:</span>
                    <span className="text-[#C98F6B] font-bold text-base">{calculatorSales} orders / day</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={calculatorSales}
                    onChange={(e) => setCalculatorSales(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C98F6B]"
                  />
                  <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                    <span>1 order</span>
                    <span>25 orders</span>
                    <span>50 orders</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center text-sm font-semibold text-neutral-800 mb-2">
                    <span>Your Profit Margin Per Order:</span>
                    <span className="text-[#C98F6B] font-bold text-base">৳{avgProfitPerOrder.toLocaleString()}</span>
                  </div>
                  <input
                    type="range"
                    min="300"
                    max="2500"
                    step="50"
                    value={avgProfitPerOrder}
                    onChange={(e) => setAvgProfitPerOrder(Number(e.target.value))}
                    className="w-full h-2 bg-neutral-200 rounded-lg appearance-none cursor-pointer accent-[#C98F6B]"
                  />
                  <div className="flex justify-between text-[11px] text-neutral-400 mt-1">
                    <span>৳300</span>
                    <span>৳1,400</span>
                    <span>৳2,500</span>
                  </div>
                </div>

                {/* Calculation Output Box */}
                <div className="bg-[#111111] text-white rounded-2xl p-5 sm:p-6 text-center space-y-2">
                  <span className="text-xs uppercase font-semibold tracking-wider text-[#C98F6B]">
                    Projected Monthly Earnings
                  </span>
                  <div className="text-3xl sm:text-5xl font-extrabold text-white">
                    ৳{estimatedMonthlyProfit.toLocaleString()}
                  </div>
                  <p className="text-xs text-neutral-400">
                    Calculated on {calculatorSales * 30} successful monthly deliveries with no upfront inventory purchase needed
                  </p>
                </div>

                <button
                  onClick={handlePrimaryCTA}
                  className="w-full py-3.5 bg-[#C98F6B] hover:bg-[#B57C58] text-white font-bold rounded-xl shadow-md transition-colors text-sm sm:text-base flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span>{getPrimaryButtonText()}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 4. PLATFORM ADVANTAGES */}
      <section className="py-16 md:py-24 bg-white border-b border-[#E6E4E0]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#C98F6B] text-xs font-bold uppercase tracking-wider">Zero Invest Advantages</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 mt-2">
              Everything You Need to Scale
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-3">
              We provide the supplier network, courier infrastructure, and technology so you can focus on marketing and sales.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#FAF9F5] p-6 sm:p-7 rounded-2xl border border-[#E6E4E0] hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E6E4E0] flex items-center justify-center text-[#C98F6B] mb-5">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">High-Demand Wholesale Catalog</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Direct wholesale access to trending gadgets, electronics, lifestyle accessories, and beauty products with verified high margins.
              </p>
            </div>

            <div className="bg-[#FAF9F5] p-6 sm:p-7 rounded-2xl border border-[#E6E4E0] hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E6E4E0] flex items-center justify-center text-[#C98F6B] mb-5">
                <Smartphone className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">1-Click Landing Page Builder</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Instant, mobile-optimized landing pages ready for Facebook and TikTok campaigns. Includes built-in Cash on Delivery order forms.
              </p>
            </div>

            <div className="bg-[#FAF9F5] p-6 sm:p-7 rounded-2xl border border-[#E6E4E0] hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E6E4E0] flex items-center justify-center text-[#C98F6B] mb-5">
                <Truck className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Nationwide Courier Integration</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Automated shipping across all 64 districts in Bangladesh with Steadfast, Pathao, and REDX with real-time parcel tracking.
              </p>
            </div>

            <div className="bg-[#FAF9F5] p-6 sm:p-7 rounded-2xl border border-[#E6E4E0] hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E6E4E0] flex items-center justify-center text-[#C98F6B] mb-5">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Live Order Status Tracking</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Track pending, confirmed, shipped, delivered, and returned orders directly from your dedicated reseller control portal.
              </p>
            </div>

            <div className="bg-[#FAF9F5] p-6 sm:p-7 rounded-2xl border border-[#E6E4E0] hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E6E4E0] flex items-center justify-center text-[#C98F6B] mb-5">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Transparent Wallet & Weekly Payouts</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Complete transparency on profits with zero hidden costs. Withdraw your earnings weekly via bKash, Nagad, or Bank.
              </p>
            </div>

            <div className="bg-[#FAF9F5] p-6 sm:p-7 rounded-2xl border border-[#E6E4E0] hover:shadow-md transition-all">
              <div className="w-12 h-12 rounded-xl bg-white border border-[#E6E4E0] flex items-center justify-center text-[#C98F6B] mb-5">
                <Award className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-neutral-900 mb-2">Dedicated Reseller Support</h3>
              <p className="text-neutral-600 text-xs sm:text-sm leading-relaxed">
                Our support team is available to assist with product guidance, marketing strategies, courier escalations, and payout assistance.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. PRICING PLANS (BDT ONLY) */}
      <section className="py-16 md:py-24 bg-[#FAF9F5] border-b border-[#E6E4E0]" id="packages">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-[#C98F6B] text-xs font-bold uppercase tracking-wider">Pricing Plans</span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-neutral-900 mt-2">
              Simple, Transparent Pricing
            </h2>
            <p className="text-neutral-600 text-sm sm:text-base mt-3">
              Start completely free with zero risk. Upgrade whenever you need advanced landing page limits and priority processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch">
            {RESELLER_PLANS.map((plan) => {
              const isPopular = plan.id === 'pro';
              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-7 sm:p-8 flex flex-col justify-between transition-all duration-200 ${
                    isPopular 
                      ? 'bg-[#111111] text-white shadow-2xl ring-2 ring-[#C98F6B] -translate-y-2' 
                      : 'bg-white text-neutral-900 border border-[#E6E4E0] hover:shadow-lg'
                  }`}
                >
                  {isPopular && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#C98F6B] text-white text-[11px] font-bold px-4 py-1 rounded-full uppercase tracking-wider shadow">
                      {plan.badge}
                    </div>
                  )}

                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-xl font-bold">{plan.name}</h3>
                      <span className={`text-xs px-2.5 py-1 rounded-md font-medium ${isPopular ? 'bg-white/10 text-neutral-200' : 'bg-neutral-100 text-neutral-700'}`}>
                        {plan.billingPeriod}
                      </span>
                    </div>

                    <div className="mb-6">
                      <div className="flex items-baseline gap-1">
                        <span className={`text-4xl sm:text-5xl font-extrabold ${isPopular ? 'text-white' : 'text-neutral-900'}`}>
                          ৳{plan.priceBDT.toLocaleString()}
                        </span>
                        <span className={`text-xs ${isPopular ? 'text-neutral-400' : 'text-neutral-500'}`}>
                          {plan.priceBDT === 0 ? ' / forever' : ' / month'}
                        </span>
                      </div>
                      <p className={`text-xs mt-2.5 ${isPopular ? 'text-neutral-300' : 'text-neutral-600'}`}>
                        {plan.description}
                      </p>
                    </div>

                    <div className="pt-6 border-t border-neutral-200/20 mb-8 space-y-3">
                      {(plan.features || []).map((feat, idx) => (
                        <div key={idx} className="flex items-start gap-2.5 text-xs sm:text-sm">
                          <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 ${isPopular ? 'text-[#C98F6B]' : 'text-emerald-600'}`} />
                          <span className={isPopular ? 'text-neutral-200' : 'text-neutral-700'}>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      if (isUserReseller) {
                        navigate('reseller-dashboard');
                      } else {
                        navigate('reseller-register');
                      }
                    }}
                    className={`w-full py-3.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer ${
                      isPopular
                        ? 'bg-[#C98F6B] hover:bg-[#B57C58] text-white shadow-lg'
                        : 'bg-[#111111] hover:bg-neutral-800 text-white'
                    }`}
                  >
                    <span>{isUserReseller ? 'Manage in Portal' : plan.ctaText}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 6. FAQ SECTION */}
      <section className="py-16 md:py-24 bg-white border-b border-[#E6E4E0]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[#C98F6B] text-xs font-bold uppercase tracking-wider">Frequently Asked Questions</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-neutral-900 mt-2">
              Everything You Need to Know
            </h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#FAF9F5] rounded-2xl border border-[#E6E4E0] overflow-hidden transition-all shadow-xs"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full text-left p-5 sm:p-6 flex items-center justify-between gap-4 font-bold text-neutral-900 text-sm sm:text-base hover:text-[#C98F6B] transition-colors cursor-pointer"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? <ChevronUp className="w-5 h-5 text-neutral-400 shrink-0" /> : <ChevronDown className="w-5 h-5 text-neutral-400 shrink-0" />}
                  </button>

                  {isOpen && (
                    <div className="px-5 pb-5 sm:px-6 sm:pb-6 text-xs sm:text-sm text-neutral-600 leading-relaxed border-t border-neutral-200/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. BOTTOM CTA BANNER */}
      <section className="py-16 bg-[#111111] text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Launch Your Online Reselling Business Today
          </h2>
          <p className="text-neutral-400 max-w-2xl mx-auto text-sm sm:text-base">
            Start selling products without buying inventory upfront. Choose products, create your landing page, share it with customers, and earn from successful deliveries.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <button
              onClick={handlePrimaryCTA}
              className="w-full sm:w-auto px-8 py-4 bg-[#C98F6B] hover:bg-[#B57C58] text-white font-bold rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 text-base cursor-pointer"
            >
              <span>{getPrimaryButtonText()}</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={() => navigate('shop')}
              className="w-full sm:w-auto px-8 py-4 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-xl transition-all text-base border border-white/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Layers className="w-4 h-4 text-[#C98F6B]" />
              <span>Browse Products</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
