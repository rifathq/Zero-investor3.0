'use client';

import React from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { useAuth } from '@/context/AuthContext';
import { useReseller } from '@/context/ResellerContext';
import { BrandLogo } from '@/components/common/BrandLogo';
import { 
  Instagram, 
  Twitter, 
  Facebook, 
  Linkedin, 
  Youtube, 
  ArrowUpRight,
  ShieldCheck,
  CreditCard,
  Lock,
  Sparkles
} from 'lucide-react';

export function Footer() {
  const { navigate } = useMarketplace();
  const { role } = useAuth();
  const { isReseller } = useReseller();
  const isUserReseller = Boolean(isReseller || role === 'seller' || role === 'reseller');

  return (
    <footer className="w-full max-w-full overflow-hidden bg-[#111111] text-white pt-12 sm:pt-16 pb-12 border-t border-neutral-800">
      <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-5 lg:px-8 xl:px-10">
        {/* Main Grid Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-10 lg:gap-8 pb-14 border-b border-neutral-800">
          {/* Brand Col (2 cols wide) */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            <BrandLogo variant="light" size="lg" />
            <p className="text-neutral-400 text-sm leading-relaxed max-w-sm mt-1">
              Bangladesh&apos;s leading dropshipping and reselling platform. Find winning wholesale products, launch 1-click landing pages, and receive weekly profit payouts.
            </p>

            <div className="flex items-center gap-3 mt-3">
              <a 
                href="#social-instagram" 
                aria-label="Instagram"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#C98F6B] hover:bg-[#C98F6B]/10 transition-all"
              >
                <Instagram className="w-4 h-4" />
              </a>
              <a 
                href="#social-twitter" 
                aria-label="Twitter / X"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#C98F6B] hover:bg-[#C98F6B]/10 transition-all"
              >
                <Twitter className="w-4 h-4" />
              </a>
              <a 
                href="#social-facebook" 
                aria-label="Facebook"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#C98F6B] hover:bg-[#C98F6B]/10 transition-all"
              >
                <Facebook className="w-4 h-4" />
              </a>
              <a 
                href="#social-linkedin" 
                aria-label="LinkedIn"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#C98F6B] hover:bg-[#C98F6B]/10 transition-all"
              >
                <Linkedin className="w-4 h-4" />
              </a>
              <a 
                href="#social-youtube" 
                aria-label="YouTube"
                onClick={(e) => e.preventDefault()}
                className="w-9 h-9 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-400 hover:text-white hover:border-[#C98F6B] hover:bg-[#C98F6B]/10 transition-all"
              >
                <Youtube className="w-4 h-4" />
              </a>
            </div>

            {/* Platform Trust Highlights */}
            <div className="flex flex-wrap items-center gap-3 text-xs text-neutral-400 mt-3 pt-3 border-t border-neutral-800/80">
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-[#C98F6B]" /> 256-Bit SSL
              </span>
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-[#C98F6B]" /> Buyer Protection
              </span>
              <span className="flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5 text-[#C98F6B]" /> Zero Setup Fees
              </span>
            </div>
          </div>

          {/* Col 2: Products You Can Sell */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#EAD7CA]">Products to Sell</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigate('categories')} className="hover:text-white transition-colors text-left">
                  All Categories
                </button>
              </li>
              <li>
                <button onClick={() => navigate('new-arrivals')} className="hover:text-white transition-colors text-left">
                  New Arrivals
                </button>
              </li>
              <li>
                <button onClick={() => navigate('deals')} className="hover:text-white transition-colors text-left flex items-center gap-1">
                  <span>Top Deals</span>
                  <span className="text-[10px] text-[#C98F6B] font-bold">HOT</span>
                </button>
              </li>
              <li>
                <button onClick={() => navigate('shop')} className="hover:text-white transition-colors text-left">
                  Best Sellers
                </button>
              </li>
              <li>
                <button onClick={() => navigate('shop')} className="hover:text-white transition-colors text-left">
                  Wholesale Catalogs
                </button>
              </li>
            </ul>
          </div>

          {/* Col 3: For Resellers */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#EAD7CA]">For Resellers</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
              <li>
                <button 
                  onClick={() => navigate('reseller')} 
                  className="hover:text-white transition-colors text-left font-medium text-white flex items-center gap-1"
                >
                  <span>Start Selling</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#C98F6B]" />
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate(isUserReseller ? 'reseller-dashboard' : 'reseller')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Reseller Portal
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('about')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Reseller Guidelines
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('help')} 
                  className="hover:text-white transition-colors text-left"
                >
                  Shipping &amp; Weekly Payouts
                </button>
              </li>
            </ul>
          </div>

          {/* Col 4: Customer Support */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#EAD7CA]">Customer Support</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigate('help')} className="hover:text-white transition-colors text-left">
                  Help Center
                </button>
              </li>
              <li>
                <button onClick={() => navigate('track-order')} className="hover:text-white transition-colors text-left">
                  Track Order
                </button>
              </li>
              <li>
                <button onClick={() => navigate('help')} className="hover:text-white transition-colors text-left">
                  Returns & Refunds
                </button>
              </li>
              <li>
                <button onClick={() => navigate('help')} className="hover:text-white transition-colors text-left">
                  Shipping Information
                </button>
              </li>
              <li>
                <button onClick={() => navigate('help')} className="hover:text-white transition-colors text-left">
                  Contact Support
                </button>
              </li>
            </ul>
          </div>

          {/* Col 5: Company & App */}
          <div className="flex flex-col gap-3">
            <h4 className="text-xs uppercase font-bold tracking-widest text-[#EAD7CA]">About & Mobile</h4>
            <ul className="flex flex-col gap-2.5 text-sm text-neutral-400">
              <li>
                <button onClick={() => navigate('about')} className="hover:text-white transition-colors text-left">
                  About Zero Invest
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about')} className="hover:text-white transition-colors text-left">
                  Our Mission
                </button>
              </li>
              <li>
                <button onClick={() => navigate('about')} className="hover:text-white transition-colors text-left">
                  Sustainability
                </button>
              </li>
              <li>
                <button 
                  onClick={() => navigate('admin-dashboard')} 
                  className="hover:text-white transition-colors text-left text-neutral-300 font-medium flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-[#C98F6B]" />
                  <span>Admin Operations Hub</span>
                </button>
              </li>
            </ul>

            <div className="mt-2 flex flex-col gap-2">
              <span className="text-xs text-neutral-400">Shop on the go:</span>
              <div className="flex flex-col gap-1.5">
                <div className="border border-neutral-700 bg-neutral-900 rounded-lg p-2 text-xs flex items-center justify-between text-neutral-300">
                  <span>Google Play</span>
                  <span className="text-[10px] text-neutral-500">Demo App</span>
                </div>
                <div className="border border-neutral-700 bg-neutral-900 rounded-lg p-2 text-xs flex items-center justify-between text-neutral-300">
                  <span>Apple App Store</span>
                  <span className="text-[10px] text-neutral-500">Demo App</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom copyright and legal */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-neutral-500 text-center sm:text-left">
          <p>© 2026 Zero Invest Marketplace. All rights reserved.</p>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            <button onClick={() => navigate('about')} className="hover:text-neutral-300 transition-colors">
              Privacy Policy
            </button>
            <button onClick={() => navigate('about')} className="hover:text-neutral-300 transition-colors">
              Terms of Service
            </button>
            <button onClick={() => navigate('about')} className="hover:text-neutral-300 transition-colors">
              Cookie Policy
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
