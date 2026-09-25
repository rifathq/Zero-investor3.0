'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { isFirebaseConfigured } from '@/lib/firebase';
import { AdminSection } from '@/types/admin';
import { 
  LayoutDashboard, 
  Store, 
  CreditCard, 
  Globe, 
  Package, 
  ShoppingBag, 
  Users, 
  Banknote, 
  Wallet, 
  History, 
  Bell, 
  ShieldCheck, 
  Settings, 
  LogOut, 
  ChevronRight, 
  Menu, 
  X, 
  RefreshCw, 
  ArrowLeft, 
  ChevronLeft, 
  Search, 
  Sparkles,
  Lock,
  User,
  ExternalLink,
  ChevronDown,
  FolderTree
} from 'lucide-react';

import { OverviewTab } from './tabs/OverviewTab';
import { ResellersTab } from './tabs/ResellersTab';
import { SubscriptionsTab } from './tabs/SubscriptionsTab';
import { StoresTab } from './tabs/StoresTab';
import { ProductsTab } from './tabs/ProductsTab';
import { CategoriesTab } from './tabs/CategoriesTab';
import { OrdersTab } from './tabs/OrdersTab';
import { CustomersTab } from './tabs/CustomersTab';
import { WithdrawalsTab } from './tabs/WithdrawalsTab';
import { WalletsTab } from './tabs/WalletsTab';
import { TransactionsTab } from './tabs/TransactionsTab';
import { NotificationsTab } from './tabs/NotificationsTab';
import { AuditLogTab } from './tabs/AuditLogTab';
import { SettingsTab } from './tabs/SettingsTab';

interface NavItem {
  id: AdminSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
}

export function AdminPortalLayout() {
  const { 
    isAdminVerified, 
    isCheckingAdmin, 
    activeSection, 
    setActiveSection, 
    refreshAll,
    withdrawals,
    subscriptions,
    notifications,
    orders,
    resellers,
    loginAsDemoAdmin
  } = useAdmin();
  const { user, userProfile, logout } = useAuth();
  const { navigate } = useMarketplace();

  const [isMobileNavOpen, setIsMobileNavOpen] = useState<boolean>(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(false);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState<boolean>(false);
  const [globalSearchTerm, setGlobalSearchTerm] = useState<string>('');

  const pendingWithdrawalsCount = (withdrawals || []).filter(w => w.status === 'Pending').length;
  const pendingSubscriptionsCount = (subscriptions || []).filter(s => s.status === 'pending_payment').length;
  const unreadNotifsCount = (notifications || []).filter(n => !n.isRead).length;
  const pendingOrdersCount = (orders || []).filter(o => o.status === 'Pending').length;
  const pendingResellersCount = (resellers || []).filter(r => r.status === 'pending').length;

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshAll();
    setTimeout(() => setIsRefreshing(false), 500);
  };

  // Exactly the 13 navigation items requested in the brief
  const navItems: NavItem[] = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'resellers', label: 'Resellers', icon: Store, badge: pendingResellersCount },
    { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard, badge: pendingSubscriptionsCount },
    { id: 'stores', label: 'Stores', icon: Globe },
    { id: 'products', label: 'Products', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'orders', label: 'Orders', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'customers', label: 'Customers', icon: Users },
    { id: 'withdrawals', label: 'Withdrawals', icon: Banknote, badge: pendingWithdrawalsCount },
    { id: 'wallets', label: 'Wallets', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: History },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadNotifsCount },
    { id: 'audit-log', label: 'Activity Logs', icon: ShieldCheck },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  // Current page title mapping
  const currentNav = navItems.find(n => n.id === activeSection) || navItems[0];

  // Loading state
  if (isCheckingAdmin) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-14 h-14 rounded-2xl bg-neutral-900 text-white flex items-center justify-center mb-5 shadow-lg animate-pulse">
          <ShieldCheck className="w-7 h-7 text-emerald-400" />
        </div>
        <h2 className="text-xl font-bold text-neutral-900">Verifying Admin Authorization</h2>
        <p className="text-sm text-neutral-500 mt-1 max-w-sm">Checking administrator privileges and session security...</p>
      </div>
    );
  }

  // Access Denied Screen with Demo Admin bypass option
  if (!isAdminVerified) {
    return (
      <div className="min-h-screen bg-[#FDFCFB] flex flex-col items-center justify-center p-4">
        <div className="bg-white border border-neutral-200 rounded-3xl p-8 sm:p-10 max-w-md w-full text-center shadow-lg space-y-5">
          <div className="w-14 h-14 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto shadow-xs">
            <Lock className="w-7 h-7" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-neutral-900 tracking-tight">Administrator Access Required</h2>
            <p className="text-sm text-neutral-600 mt-2 leading-relaxed">
              This control center is restricted to authorized platform administrators and super admins.
            </p>
          </div>

          <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 text-xs text-neutral-600 font-mono text-left space-y-1">
            <div><strong className="text-neutral-900">Account:</strong> {user?.email || 'Unauthenticated'}</div>
            <div><strong className="text-neutral-900">Role:</strong> {userProfile?.role || 'Guest'}</div>
            <div><strong className="text-neutral-900">Status:</strong> Protected Route</div>
          </div>

          <div className="pt-2 flex flex-col gap-2.5">
            {/* Instant Demo Admin Button for local development / testing only */}
            {(!isFirebaseConfigured || import.meta.env.DEV || import.meta.env.VITE_DEV_MODE === 'true') && (
              <button
                onClick={() => loginAsDemoAdmin()}
                className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Enter as Demo Administrator (Dev Only)</span>
              </button>
            )}

            {!user ? (
              <button
                onClick={() => navigate('auth')}
                className="w-full py-3 px-4 rounded-xl bg-neutral-900 hover:bg-black text-white text-sm font-semibold transition-colors cursor-pointer shadow-xs"
              >
                Sign In with Admin Credentials
              </button>
            ) : (
              <button
                onClick={() => logout()}
                className="w-full py-3 px-4 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-sm font-semibold transition-colors cursor-pointer"
              >
                Sign Out Current Account
              </button>
            )}
            <button
              onClick={() => navigate('home')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-neutral-500 hover:text-black transition-colors cursor-pointer"
            >
              Return to Marketplace Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFCFB] text-neutral-900 flex flex-col font-sans antialiased">
      
      {/* Top Header Bar */}
      <header className="bg-white border-b border-neutral-200/90 sticky top-0 z-40 backdrop-blur-md bg-white/95">
        <div className="w-full max-w-[1900px] mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between gap-4">
          
          {/* Left Brand & Breadcrumb */}
          <div className="flex items-center gap-3 sm:gap-6">
            <button
              onClick={() => setIsMobileNavOpen(!isMobileNavOpen)}
              className="lg:hidden p-2 -ml-1.5 text-neutral-700 hover:text-black rounded-xl hover:bg-neutral-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation drawer"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neutral-900 text-white flex items-center justify-center shadow-xs">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-neutral-900">
                    Zero Invest
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[11px] font-bold uppercase tracking-wider bg-neutral-900 text-white shadow-2xs">
                    Admin
                  </span>
                </div>
                <div className="text-xs text-neutral-500 font-medium">
                  Multi-Vendor Control Center
                </div>
              </div>
            </div>

            {/* Breadcrumb & Current Title */}
            <div className="hidden md:flex items-center gap-2 pl-4 border-l border-neutral-200 text-xs">
              <span className="text-neutral-400 font-medium">Platform</span>
              <ChevronRight className="w-3.5 h-3.5 text-neutral-300" />
              <span className="font-bold text-neutral-900">{currentNav.label}</span>
            </div>
          </div>

          {/* Global Search Bar */}
          <div className="flex-1 max-w-md hidden md:block mx-4">
            <div className="relative">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={globalSearchTerm}
                onChange={(e) => setGlobalSearchTerm(e.target.value)}
                placeholder="Search orders, resellers, catalog items, or settings..."
                className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
              />
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Sync live data */}
            <button
              onClick={handleManualRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/80 transition-colors cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-neutral-900' : ''}`} />
            </button>

            {/* Notifications Button */}
            <button
              onClick={() => setActiveSection('notifications')}
              className="relative p-2.5 rounded-xl text-neutral-600 hover:text-neutral-900 hover:bg-neutral-100 border border-neutral-200/80 transition-colors cursor-pointer"
              title="Platform Alerts"
            >
              <Bell className="w-4 h-4" />
              {unreadNotifsCount > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>

            <div className="h-6 w-px bg-neutral-200 hidden sm:block mx-1" />

            {/* Admin Profile Dropdown Menu */}
            <div className="relative">
              <button
                onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 bg-neutral-50 hover:bg-neutral-100 border border-neutral-200 rounded-xl text-left cursor-pointer transition-colors"
              >
                <div className="w-7 h-7 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                  {(user?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
                </div>
                <div className="hidden sm:block text-xs">
                  <div className="font-semibold text-neutral-900 line-clamp-1 max-w-[120px]">
                    {user?.displayName || 'Super Admin'}
                  </div>
                  <div className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider">
                    Super Admin
                  </div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl border border-neutral-200 shadow-xl py-2 z-50 animate-in fade-in zoom-in-95 duration-100">
                  <div className="px-4 py-2 border-b border-neutral-100">
                    <p className="text-xs font-bold text-neutral-900">{user?.displayName || 'Administrator'}</p>
                    <p className="text-[11px] text-neutral-400 truncate">{user?.email || 'admin@zeroinvest.com'}</p>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => {
                        setActiveSection('settings');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                    >
                      <Settings className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Platform Settings</span>
                    </button>
                    <button
                      onClick={() => {
                        setActiveSection('audit-log');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Security &amp; Audit Logs</span>
                    </button>
                    <button
                      onClick={() => {
                        navigate('home');
                        setIsProfileMenuOpen(false);
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-neutral-700 hover:bg-neutral-100 flex items-center gap-2"
                    >
                      <ExternalLink className="w-3.5 h-3.5 text-neutral-500" />
                      <span>Marketplace Storefront</span>
                    </button>
                  </div>

                  <div className="border-t border-neutral-100 pt-1">
                    <button
                      onClick={() => {
                        setIsProfileMenuOpen(false);
                        logout();
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 flex items-center gap-2 font-semibold"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Back to Marketplace */}
            <button
              onClick={() => navigate('home')}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-neutral-200/90 bg-white hover:bg-neutral-100 text-xs sm:text-sm font-semibold text-neutral-800 transition-colors shadow-2xs cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4 text-neutral-500" />
              <span className="hidden md:inline">Storefront</span>
            </button>
          </div>

        </div>
      </header>

      {/* Main Workspace Layout */}
      <div className="flex-1 w-full max-w-[1900px] mx-auto flex">
        
        {/* Desktop Sidebar Navigation */}
        <aside className={`hidden lg:flex flex-col shrink-0 border-r border-neutral-200/90 bg-white transition-all duration-200 self-stretch ${
          isSidebarCollapsed ? 'w-20' : 'w-72'
        }`}>
          {/* 13 Navigation Items List */}
          <div className="flex-1 p-4 space-y-1.5 overflow-y-auto">
            {!isSidebarCollapsed && (
              <div className="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
                Admin Ecosystem
              </div>
            )}
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeSection === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveSection(item.id)}
                    title={isSidebarCollapsed ? item.label : undefined}
                    className={`w-full flex items-center ${
                      isSidebarCollapsed ? 'justify-center px-2 py-3' : 'justify-between px-3.5 py-2.5'
                    } rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                      isActive
                        ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                        : 'text-neutral-600 hover:bg-neutral-100 hover:text-neutral-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-5 h-5 shrink-0 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                      {!isSidebarCollapsed && <span>{item.label}</span>}
                    </div>
                    {!isSidebarCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                        isActive ? 'bg-white text-neutral-900' : 'bg-neutral-200 text-neutral-800'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Bottom of Sidebar: Admin profile, Admin email, Logout */}
          <div className="p-4 border-t border-neutral-200/80 space-y-3 bg-neutral-50/50">
            {/* Admin Profile Box */}
            {!isSidebarCollapsed ? (
              <div className="p-3 bg-white rounded-2xl border border-neutral-200/80 space-y-2">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-neutral-900 text-white flex items-center justify-center font-bold text-xs">
                    {(user?.displayName || user?.email || 'A').charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-bold text-xs text-neutral-900 truncate">
                      {user?.displayName || 'Administrator'}
                    </div>
                    <div className="text-[11px] text-neutral-400 truncate">
                      {user?.email || 'admin@zeroinvest.com'}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1 border-t border-neutral-100 text-[11px]">
                  <span className="font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    Super Admin
                  </span>
                  <button
                    onClick={() => logout()}
                    className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <LogOut className="w-3 h-3" />
                    <span>Logout</span>
                  </button>
                </div>
              </div>
            ) : (
              <button
                onClick={() => logout()}
                className="w-full flex items-center justify-center p-2 rounded-xl text-neutral-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title="Sign Out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            )}

            {/* Collapse Toggle */}
            <button
              onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
              className="w-full flex items-center justify-center gap-2 p-2 rounded-xl text-xs font-semibold text-neutral-600 hover:bg-neutral-200/70 transition-colors cursor-pointer"
            >
              <ChevronLeft className={`w-4 h-4 transition-transform duration-200 ${isSidebarCollapsed ? 'rotate-180' : ''}`} />
              {!isSidebarCollapsed && <span>Collapse Sidebar</span>}
            </button>
          </div>
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileNavOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex">
            <div 
              className="fixed inset-0 bg-neutral-900/40 backdrop-blur-xs transition-opacity" 
              onClick={() => setIsMobileNavOpen(false)}
            />
            <div className="relative w-80 max-w-[85vw] bg-white h-full flex flex-col z-50 shadow-2xl overflow-y-auto">
              <div className="p-5 border-b border-neutral-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-neutral-900 text-white flex items-center justify-center font-black text-sm">
                    ZI
                  </div>
                  <span className="font-bold text-base text-neutral-900">Admin Control</span>
                </div>
                <button
                  onClick={() => setIsMobileNavOpen(false)}
                  className="p-1.5 rounded-lg text-neutral-500 hover:bg-neutral-100"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="flex-1 p-4 space-y-1">
                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeSection === item.id;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveSection(item.id);
                          setIsMobileNavOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-sm font-medium transition-colors cursor-pointer ${
                          isActive
                            ? 'bg-neutral-900 text-white font-semibold shadow-xs'
                            : 'text-neutral-700 hover:bg-neutral-100'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-400' : 'text-neutral-500'}`} />
                          <span>{item.label}</span>
                        </div>
                        {item.badge !== undefined && item.badge > 0 && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${
                            isActive ? 'bg-white text-neutral-900' : 'bg-neutral-200 text-neutral-800'
                          }`}>
                            {item.badge}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </nav>
              </div>

              <div className="p-4 border-t border-neutral-200 space-y-2">
                <div className="px-2 py-1 text-xs">
                  <div className="font-bold text-neutral-900">{user?.displayName || 'Administrator'}</div>
                  <div className="text-[11px] text-neutral-500 truncate">{user?.email || 'admin@zeroinvest.com'}</div>
                </div>
                <button
                  onClick={() => logout()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700 hover:bg-neutral-100"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 p-5 sm:p-8 lg:p-10 space-y-8">
          {activeSection === 'overview' && <OverviewTab />}
          {activeSection === 'resellers' && <ResellersTab />}
          {activeSection === 'subscriptions' && <SubscriptionsTab />}
          {activeSection === 'stores' && <StoresTab />}
          {activeSection === 'products' && <ProductsTab />}
          {activeSection === 'categories' && <CategoriesTab />}
          {activeSection === 'orders' && <OrdersTab />}
          {activeSection === 'customers' && <CustomersTab />}
          {activeSection === 'withdrawals' && <WithdrawalsTab />}
          {activeSection === 'wallets' && <WalletsTab />}
          {activeSection === 'transactions' && <TransactionsTab />}
          {activeSection === 'notifications' && <NotificationsTab />}
          {activeSection === 'audit-log' && <AuditLogTab />}
          {activeSection === 'settings' && <SettingsTab />}
        </main>

      </div>
    </div>
  );
}
