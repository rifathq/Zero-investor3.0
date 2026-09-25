/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { MarketplaceProvider, useMarketplace } from '@/context/MarketplaceContext';
import { AuthProvider } from '@/context/AuthContext';
import { ResellerProvider } from '@/context/ResellerContext';
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { Toast } from '@/components/common/Toast';

// Home components
import { HeroSection } from '@/components/home/HeroSection';
import { ShopByCategory } from '@/components/home/ShopByCategory';
import { TrendingSection } from '@/components/home/TrendingSection';
import { PromotionalBanners } from '@/components/home/PromotionalBanners';
import { TrustFeaturesStrip } from '@/components/home/TrustFeaturesStrip';
import { RecommendedSection } from '@/components/home/RecommendedSection';
import { HowItWorksSection } from '@/components/home/HowItWorksSection';
import { NewsletterSection } from '@/components/home/NewsletterSection';

// Secondary Views
import { ShopView } from '@/components/shop/ShopView';
import { CategoriesView } from '@/components/category/CategoriesView';
import { ProductDetailView } from '@/components/product/ProductDetailView';
import { CheckoutView } from '@/components/checkout/CheckoutView';
import { SellersDirectoryView } from '@/components/seller/SellersDirectoryView';
import { SellerStoreView } from '@/components/seller/SellerStoreView';
import { CustomerAccountView } from '@/components/account/CustomerAccountView';
import { DealsView } from '@/components/deals/DealsView';
import { OrderTrackingView } from '@/components/orders/OrderTrackingView';
import { AboutView } from '@/components/info/AboutView';
import { HelpView } from '@/components/info/HelpView';

// Auth Views
import { AuthView } from '@/components/auth/AuthView';
import { ForgotPasswordView } from '@/components/auth/ForgotPasswordView';
import { EmailVerificationView } from '@/components/auth/EmailVerificationView';
import { PhoneAuthView } from '@/components/auth/PhoneAuthView';
import { AccessDeniedView } from '@/components/auth/AccessDeniedView';

// Reseller Views
import { ResellerLandingPage } from '@/components/reseller/ResellerLandingPage';
import { ResellerLoginView } from '@/components/reseller/auth/ResellerLoginView';
import { ResellerRegisterView } from '@/components/reseller/auth/ResellerRegisterView';
import { ResellerPackagesView } from '@/components/reseller/packages/ResellerPackagesView';
import { ResellerPortalLayout } from '@/components/reseller/portal/ResellerPortalLayout';
import { PublicStorefrontView } from '@/components/reseller/public/PublicStorefrontView';
import { PublicLandingPageView } from '@/components/reseller/public/PublicLandingPageView';
import { ResellerVerificationModal } from '@/components/reseller/ResellerVerificationModal';
import { AdminProvider } from '@/context/AdminContext';
import { AdminPortalLayout } from '@/components/admin/AdminPortalLayout';

function MarketplaceContent() {
  const { activeView, activeStoreSlug, activeProductSlug } = useMarketplace();

  // If in dedicated admin portal, render standalone admin portal layout
  if (activeView === 'admin-dashboard') {
    return (
      <div className="min-h-screen bg-[#F7F6F3] text-[#111111] antialiased">
        <AdminPortalLayout />
        <Toast />
      </div>
    );
  }

  // If in dedicated reseller portal, render standalone portal layout
  if (activeView === 'reseller-dashboard' || activeView === 'reseller-portal') {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-[#111111] antialiased">
        <ResellerPortalLayout />
        <Toast />
      </div>
    );
  }

  // If in customer-facing reseller public store or landing page
  if (activeView === 'reseller-public-store') {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-[#111111] antialiased">
        <PublicStorefrontView storeSlug={activeStoreSlug} />
        <Toast />
      </div>
    );
  }

  if (activeView === 'reseller-public-landing') {
    return (
      <div className="min-h-screen bg-[#FAF9F5] text-[#111111] antialiased">
        <PublicLandingPageView storeSlug={activeStoreSlug} productSlug={activeProductSlug} />
        <Toast />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111111] antialiased selection:bg-[#EAD7CA] selection:text-[#111111] overflow-x-hidden w-full max-w-full">
      {/* Global Navigation Header */}
      <Header />

      {/* Dynamic View Router */}
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        {activeView === 'home' && (
          <div className="space-y-4 sm:space-y-6">
            <HeroSection />
            <ShopByCategory />
            <TrendingSection />
            <PromotionalBanners />
            <TrustFeaturesStrip />
            <RecommendedSection />
            <HowItWorksSection />
            <NewsletterSection />
          </div>
        )}
        {(activeView === 'shop' || activeView === 'search') && <ShopView />}
        {activeView === 'categories' && <CategoriesView />}
        {activeView === 'new-arrivals' && <ShopView />}
        {activeView === 'product-detail' && <ProductDetailView />}
        {activeView === 'cart' && <ShopView />}
        {activeView === 'checkout' && <CheckoutView />}
        {activeView === 'sellers' && <SellersDirectoryView />}
        {activeView === 'seller-store' && <SellerStoreView />}
        {(activeView === 'account' || activeView === 'customer-account') && <CustomerAccountView />}
        {activeView === 'deals' && <DealsView />}
        {activeView === 'track-order' && <OrderTrackingView />}
        {activeView === 'how-it-works' && (
          <div className="py-6 sm:py-10">
            <HowItWorksSection />
          </div>
        )}
        {activeView === 'about' && <AboutView />}
        {(activeView === 'help' || activeView === 'contact') && <HelpView />}
        {activeView === 'auth' && <AuthView />}
        {activeView === 'login' && <AuthView />}
        {activeView === 'signup' && <AuthView />}
        {activeView === 'forgot-password' && <ForgotPasswordView />}
        {activeView === 'email-verification' && <EmailVerificationView />}
        {activeView === 'phone-auth' && <PhoneAuthView />}
        {activeView === 'access-denied' && <AccessDeniedView />}

        {/* Reseller Routes */}
        {(activeView === 'reseller' || activeView === 'start-selling') && <ResellerLandingPage />}
        {activeView === 'reseller-login' && <ResellerLoginView />}
        {activeView === 'reseller-register' && <ResellerRegisterView />}
        {activeView === 'reseller-packages' && <ResellerPackagesView />}
      </main>

      {/* Global Footer */}
      <Footer />

      {/* Global Notification Toast & Modals */}
      <Toast />
      <ResellerVerificationModal />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MarketplaceProvider>
        <AdminProvider>
          <ResellerProvider>
            <MarketplaceContent />
          </ResellerProvider>
        </AdminProvider>
      </MarketplaceProvider>
    </AuthProvider>
  );
}
