'use client';

import React, { useState } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ResellerSection } from '@/types/reseller';

// Icons
import { getResellerAccessStatus } from '@/lib/productVisibility';
import { 
  LayoutDashboard, 
  Store, 
  Package, 
  ShoppingBag, 
  Users, 
  Wallet, 
  ArrowUpRight, 
  Crown, 
  BarChart3, 
  Bell, 
  Settings, 
  ArrowLeft, 
  ExternalLink, 
  Menu, 
  X, 
  ShieldCheck,
  ShieldAlert,
  Lock,
  Clock,
  LogOut,
  ChevronRight,
  Sparkles
} from 'lucide-react';

// Tabs
import { ResellerOverviewTab } from './tabs/ResellerOverviewTab';
import { ResellerStoreTab } from './tabs/ResellerStoreTab';
import { ResellerProductsTab } from './tabs/ResellerProductsTab';
import { ResellerOrdersTab } from './tabs/ResellerOrdersTab';
import { ResellerCustomersTab } from './tabs/ResellerCustomersTab';
import { ResellerWalletTab } from './tabs/ResellerWalletTab';
import { ResellerWithdrawalsTab } from './tabs/ResellerWithdrawalsTab';
import { ResellerSubscriptionTab } from './tabs/ResellerSubscriptionTab';
import { ResellerAnalyticsTab } from './tabs/ResellerAnalyticsTab';
import { ResellerNotificationsTab } from './tabs/ResellerNotificationsTab';
import { ResellerSettingsTab } from './tabs/ResellerSettingsTab';

interface SidebarItem {
  id: ResellerSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number | string;
}

export function ResellerPortalLayout() {
  const { 
    resellerProfile, 
    activeSection, 
    setActiveSection,
    unreadNotificationCount,
    currentResellerId,
    switchResellerAccount
  } = useReseller();
  const { user, userProfile, role, isAuthenticated, logout } = useAuth();
  const { navigate, showToast } = useMarketplace();

  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Evaluate RBAC access status safely
  const accessStatus = getResellerAccessStatus(userProfile, role, isAuthenticated);

  // Exit workspace back to main marketplace home
  const handleExitWorkspace = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    navigate('home');
  };

  // Sign out and smoothly navigate back to main marketplace home
  const handleLogout = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await logout();
      showToast('Signed Out', 'You have exited the reseller portal.', 'info');
    } catch (err) {
      console.warn('Error during logout:', err);
    }
    navigate('home');
  };

  // If user is not an active verified reseller, display the informative access guard card
  if (accessStatus !== 'verified') {
    return (
      <div className="min-h-screen bg-[#FAF9F5] flex flex-col justify-between antialiased">
        <header className="bg-white border-b border-[#E6E4E0] px-5 sm:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => navigate('home')}
            className="inline-flex items-center gap-2 text-xs sm:text-sm font-semibold text-neutral-700 hover:text-neutral-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Marketplace
          </button>
          <div className="flex items-center gap-2 text-xs font-bold text-neutral-800">
            <Store className="w-4 h-4 text-[#C98F6B]" />
            <span>Zero Invest Reseller Network</span>
          </div>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 sm:p-8">
          <div className="max-w-lg w-full bg-white rounded-3xl border border-[#E6E4E0] shadow-xl p-6 sm:p-10 text-center space-y-6">
            <div className={`w-16 h-16 rounded-3xl flex items-center justify-center mx-auto shadow-xs ${
              accessStatus === 'pending_verification' 
                ? 'bg-amber-50 text-amber-600 border border-amber-200' 
                : 'bg-rose-50 text-rose-600 border border-rose-200'
            }`}>
              {accessStatus === 'pending_verification' ? (
                <Clock className="w-8 h-8" />
              ) : (
                <Lock className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                accessStatus === 'pending_verification' 
                  ? 'bg-amber-100 text-amber-800' 
                  : 'bg-rose-100 text-rose-800'
              }`}>
                {accessStatus === 'pending_verification' ? 'Verification In Progress' : 'Reseller Account Required'}
              </span>

              <h1 className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight">
                {accessStatus === 'pending_verification'
                  ? 'Reseller Verification Under Review'
                  : 'Reseller Account Required'}
              </h1>

              <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed max-w-md mx-auto">
                {accessStatus === 'pending_verification' ? (
                  <>
                    Your application is currently being reviewed by our operations team. You will be notified via SMS or email once your account is approved.
                  </>
                ) : accessStatus === 'not_reseller' ? (
                  <>
                    Please submit your verification details to access the reseller dashboard, wholesale pricing, and automated fulfillment tools.
                  </>
                ) : (
                  <>
                    Sign in or register with a verified reseller account to access the Zero Invest Reseller Workspace.
                  </>
                )}
              </p>
            </div>

            {/* Session details */}
            <div className="p-3.5 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0] text-xs text-neutral-600 text-left space-y-1">
              <p className="font-bold text-neutral-800">Current Session Details:</p>
              <p className="truncate">Account: <span className="font-medium text-neutral-900">{user?.email || (user as any)?.phoneNumber || 'Not Signed In'}</span></p>
              <p>Role: <span className="font-bold uppercase text-neutral-900">{userProfile?.role || role || 'Guest'}</span></p>
              <p>Status: <span className="font-semibold text-amber-700 capitalize">{(userProfile as any)?.resellerStatus || userProfile?.status || 'Unregistered'}</span></p>
            </div>

            {/* Action buttons */}
            <div className="space-y-2.5 pt-2">
              {accessStatus === 'pending_verification' ? (
                <button
                  type="button"
                  onClick={() => {
                    showToast('Status Check', 'Your reseller application is in the verification queue.', 'info');
                  }}
                  className="w-full py-3.5 px-4 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer"
                >
                  Check Verification Status
                </button>
              ) : accessStatus === 'not_reseller' ? (
                <button
                  type="button"
                  onClick={() => navigate('reseller-register')}
                  className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Submit Reseller Verification Details</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => navigate('reseller')}
                  className="w-full py-3.5 px-4 bg-neutral-900 hover:bg-neutral-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-xs transition-colors cursor-pointer flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4 text-amber-300" />
                  <span>Start Selling &amp; Register</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => navigate('home')}
                className="w-full py-3 px-4 border border-neutral-300 hover:bg-neutral-50 text-neutral-700 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
              >
                Return to Marketplace
              </button>
            </div>
          </div>
        </main>

        <footer className="py-4 text-center text-xs text-neutral-400">
          Zero Invest Platform • Role-Based Access Control
        </footer>
      </div>
    );
  }

  const sidebarItems: SidebarItem[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'store', label: 'My Store', icon: Store },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'orders', label: 'Orders', icon: ShoppingBag },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'wallet', label: 'Wallet', icon: Wallet },
    { id: 'withdrawals', label: 'Withdrawals', icon: ArrowUpRight },
    { id: 'subscription', label: 'Subscription', icon: Crown },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotificationCount || undefined },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelectSection = (sec: ResellerSection) => {
    setActiveSection(sec);
    setIsMobileSidebarOpen(false);
  };

  const getSectionTitle = () => {
    const item = sidebarItems.find(i => i.id === activeSection);
    return item?.label || 'Reseller Workspace';
  };

  return (
    <div className="min-h-screen bg-[#FAF9F5] flex flex-col antialiased">
      {/* Top Header Bar */}
      <header className="bg-white border-b border-[#E6E4E0] sticky top-0 z-30 px-5 sm:px-8 lg:px-10 py-3.5 sm:py-4 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
            className="md:hidden p-2 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Toggle menu"
          >
            {isMobileSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Back to Marketplace */}
          <button
            type="button"
            onClick={() => navigate('home')}
            className="p-2 rounded-xl text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Return to Marketplace"
          >
            <ArrowLeft className="w-4.5 h-4.5" />
          </button>

          {/* Store Brand / Breadcrumb */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-2xs">
              <Store className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm sm:text-base font-bold text-neutral-900 line-clamp-1">
                  {resellerProfile?.storeName || 'Reseller Control Panel'}
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified
                </span>
              </div>
              <div className="text-xs text-neutral-400 font-mono hidden sm:block">
                Workspace ID: {currentResellerId}
              </div>
            </div>
          </div>
        </div>

        {/* Top Header Actions */}
        <div className="flex items-center gap-2.5 sm:gap-3.5">
          {/* Public Storefront Link Button */}
          <button
            type="button"
            onClick={() => navigate('reseller-public-store', { storeSlug: resellerProfile?.storeSlug })}
            className="hidden sm:inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            <ExternalLink className="w-4 h-4" /> View Storefront
          </button>

          {/* Notifications Bell */}
          <button
            type="button"
            onClick={() => setActiveSection('notifications')}
            className="relative p-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 transition-colors cursor-pointer"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadNotificationCount > 0 && (
              <span className="absolute top-2 right-2 w-2.5 h-2.5 rounded-full bg-neutral-900 ring-2 ring-white" />
            )}
          </button>

          {/* Marketplace Browse */}
          <button
            type="button"
            onClick={() => navigate('shop')}
            className="hidden md:inline-flex px-4 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
          >
            Wholesale Catalog
          </button>

          {/* Exit to Marketplace */}
          <button
            type="button"
            onClick={handleExitWorkspace}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            title="Return to Marketplace Storefront"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </button>

          {/* Sign Out */}
          <button
            type="button"
            onClick={handleLogout}
            className="p-2.5 sm:px-4 sm:py-2 rounded-xl bg-neutral-100 sm:bg-neutral-900 text-neutral-700 sm:text-white text-xs sm:text-sm font-semibold hover:bg-neutral-200 sm:hover:bg-neutral-800 transition-colors cursor-pointer flex items-center gap-1.5"
            title="Log Out & Exit"
          >
            <LogOut className="w-4 h-4 text-neutral-700 sm:text-white" />
            <span className="hidden sm:inline">Log Out</span>
          </button>
        </div>
      </header>

      {/* Main Workspace: Sidebar + Body */}
      <div className="flex-1 flex max-w-[1800px] w-full mx-auto">
        {/* Mobile Backdrop */}
        {isMobileSidebarOpen && (
          <div
            onClick={() => setIsMobileSidebarOpen(false)}
            className="fixed inset-0 bg-neutral-950/40 z-40 md:hidden backdrop-blur-2xs"
          />
        )}

        {/* Left Sidebar */}
        <aside
          className={`fixed md:sticky top-0 md:top-[65px] h-screen md:h-[calc(100vh-65px)] w-72 bg-white border-r border-[#E6E4E0] z-50 md:z-10 flex flex-col justify-between transition-transform duration-200 ease-in-out shrink-0 ${
            isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
          }`}
        >
          {/* Top of Sidebar: Navigation items */}
          <div className="p-3.5 sm:p-4 space-y-1.5 overflow-y-auto">
            <div className="px-3.5 py-2 text-xs font-bold uppercase tracking-wider text-neutral-400">
              Reseller Menu
            </div>

            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectSection(item.id)}
                  className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-neutral-900 text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <div className="flex items-center gap-3.5">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                    <span>{item.label}</span>
                  </div>

                  {item.badge !== undefined && (
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                        isActive 
                          ? 'bg-white text-neutral-900' 
                          : 'bg-neutral-200 text-neutral-800'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Bottom of Sidebar: Store Quick Card & Demo Switcher */}
          <div className="p-4 sm:p-5 border-t border-neutral-100 space-y-2.5 bg-[#FAF9F5]/70">
            <div className="text-xs text-neutral-500">
              <span className="font-bold text-sm text-neutral-800 block truncate">
                {resellerProfile?.storeName}
              </span>
              <span className="font-mono text-xs text-neutral-400 block truncate mt-0.5">
                /r/{resellerProfile?.storeSlug}
              </span>
            </div>

            {/* Demo Reseller Account Quick-Switcher (For testing different stores) */}
            <div className="pt-2.5 border-t border-neutral-200/60">
              <label className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider block mb-1.5">
                Active Merchant Workspace
              </label>
              <select
                value={currentResellerId}
                onChange={(e) => switchResellerAccount(e.target.value)}
                className="w-full text-xs bg-white border border-neutral-300 rounded-xl p-2 font-medium text-neutral-700 cursor-pointer focus:outline-none focus:ring-1 focus:ring-neutral-900 shadow-2xs"
              >
                <option value="usr-res-01">Dhaka Trendz Collection</option>
                <option value="usr-res-02">Chittagong Smart Gadgets</option>
                <option value="usr-res-03">Sylhet Artisan Crafts</option>
                <option value="usr-res-04">Apex Resell BD</option>
              </select>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full p-5 sm:p-8 lg:p-10 overflow-y-auto">
          {/* Breadcrumb Hierarchy */}
          <div className="flex items-center gap-2 text-sm text-neutral-400 mb-6 font-medium">
            <span>Workspace</span>
            <ChevronRight className="w-4 h-4 text-neutral-300" />
            <span className="text-neutral-800 font-semibold">{getSectionTitle()}</span>
          </div>

          {/* Active Tab View */}
          {activeSection === 'overview' && <ResellerOverviewTab />}
          {activeSection === 'store' && <ResellerStoreTab />}
          {activeSection === 'products' && <ResellerProductsTab />}
          {activeSection === 'orders' && <ResellerOrdersTab />}
          {activeSection === 'customers' && <ResellerCustomersTab />}
          {activeSection === 'wallet' && <ResellerWalletTab />}
          {activeSection === 'withdrawals' && <ResellerWithdrawalsTab />}
          {activeSection === 'subscription' && <ResellerSubscriptionTab />}
          {activeSection === 'analytics' && <ResellerAnalyticsTab />}
          {activeSection === 'notifications' && <ResellerNotificationsTab />}
          {activeSection === 'settings' && <ResellerSettingsTab />}
        </main>
      </div>
    </div>
  );
}
