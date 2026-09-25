'use client';

import React, { useState } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { 
  Settings, 
  Store, 
  User, 
  Wallet, 
  Bell, 
  Check, 
  Loader2,
  ShieldCheck
} from 'lucide-react';

export function ResellerSettingsTab() {
  const { resellerProfile, updateStoreProfile, isSubmitting } = useReseller();
  const { user, userProfile } = useAuth();
  const { showToast } = useMarketplace();

  // Local settings state
  const [storeSettings, setStoreSettings] = useState({
    storeName: resellerProfile?.storeName || '',
    storeSlug: resellerProfile?.storeSlug || '',
    tagline: resellerProfile?.tagline || '',
    contactPhone: resellerProfile?.contactPhone || '',
    contactEmail: resellerProfile?.contactEmail || ''
  });

  const [payoutSettings, setPayoutSettings] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zero_invest_reseller_payout_settings');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return {
      preferredMethod: 'bkash',
      bkashNumber: '01712-345678',
      nagadNumber: '',
      bankName: 'City Bank PLC',
      accountNumber: '110293847501',
      accountHolder: 'Dhaka Trendz Enterprise'
    };
  });

  const [notificationPrefs, setNotificationPrefs] = useState(() => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('zero_invest_reseller_notif_prefs');
      if (stored) {
        try {
          return JSON.parse(stored);
        } catch (e) {}
      }
    }
    return {
      smsOnNewOrder: true,
      emailOnPayoutDispatch: true,
      dailyDigest: false,
      productModerationAlerts: true
    };
  });

  const handleSaveStore = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateStoreProfile(storeSettings);
  };

  const handleSavePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('zero_invest_reseller_payout_settings', JSON.stringify(payoutSettings));
    }
    showToast('Payout Settings Saved', 'Your default withdrawal details have been updated.', 'success');
  };

  const handleSavePrefs = (e: React.FormEvent) => {
    e.preventDefault();
    if (typeof window !== 'undefined') {
      localStorage.setItem('zero_invest_reseller_notif_prefs', JSON.stringify(notificationPrefs));
    }
    showToast('Preferences Saved', 'Notification alert preferences updated.', 'success');
  };

  return (
    <div className="space-y-8 lg:space-y-10 w-full">
      {/* Top Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Reseller Workspace Settings</h1>
        <p className="text-sm text-neutral-500 mt-1.5">
          Configure storefront branding, automated payout credentials, and notification channels
        </p>
      </div>

      {/* 1. Store Branding & Identity */}
      <form onSubmit={handleSaveStore} className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-4">
          <Store className="w-5 h-5 text-neutral-700" />
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Store Profile &amp; Contact</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-800">Store Name</label>
            <input
              type="text"
              required
              value={storeSettings.storeName}
              onChange={(e) => setStoreSettings({ ...storeSettings, storeName: e.target.value })}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-800">Storefront URL Slug</label>
            <input
              type="text"
              required
              value={storeSettings.storeSlug}
              onChange={(e) => setStoreSettings({ ...storeSettings, storeSlug: e.target.value })}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl font-mono focus:ring-1 focus:ring-neutral-900 focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-semibold text-neutral-800">Tagline / Motto</label>
            <input
              type="text"
              value={storeSettings.tagline}
              onChange={(e) => setStoreSettings({ ...storeSettings, tagline: e.target.value })}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-800">Contact Phone</label>
            <input
              type="text"
              value={storeSettings.contactPhone}
              onChange={(e) => setStoreSettings({ ...storeSettings, contactPhone: e.target.value })}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-800">Contact Email</label>
            <input
              type="email"
              value={storeSettings.contactEmail}
              onChange={(e) => setStoreSettings({ ...storeSettings, contactEmail: e.target.value })}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-neutral-100">
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs"
          >
            {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
            Save Store Details
          </button>
        </div>
      </form>

      {/* 2. Default Payout Preferences */}
      <form onSubmit={handleSavePayout} className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-4">
          <Wallet className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Default Payout Gateway &amp; Accounts</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-sm">
          <div className="space-y-2 sm:col-span-2">
            <label className="font-semibold text-neutral-800">Preferred Disbursal Method</label>
            <div className="flex gap-5 pt-1">
              {(['bkash', 'nagad', 'bank'] as const).map((m) => (
                <label key={m} className="flex items-center gap-2 cursor-pointer text-neutral-800 uppercase font-semibold text-sm">
                  <input
                    type="radio"
                    name="defaultMethod"
                    checked={payoutSettings.preferredMethod === m}
                    onChange={() => setPayoutSettings({ ...payoutSettings, preferredMethod: m })}
                    className="w-4 h-4 text-neutral-900 focus:ring-neutral-900"
                  />
                  {m}
                </label>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-800">bKash Account Number</label>
            <input
              type="text"
              placeholder="e.g. 01712-345678"
              value={payoutSettings.bkashNumber}
              onChange={(e) => setPayoutSettings({ ...payoutSettings, bkashNumber: e.target.value })}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl font-mono focus:ring-1 focus:ring-neutral-900 focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-800">Nagad Account Number</label>
            <input
              type="text"
              placeholder="e.g. 01819-876543"
              value={payoutSettings.nagadNumber}
              onChange={(e) => setPayoutSettings({ ...payoutSettings, nagadNumber: e.target.value })}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl font-mono focus:ring-1 focus:ring-neutral-900 focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2 pt-3 border-t border-neutral-100">
            <span className="font-bold text-neutral-900 block text-xs uppercase tracking-wider text-neutral-400">
              Commercial Bank Account (For large batch payouts)
            </span>
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-800">Bank Name</label>
            <input
              type="text"
              value={payoutSettings.bankName}
              onChange={(e) => setPayoutSettings({ ...payoutSettings, bankName: e.target.value })}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5">
            <label className="font-semibold text-neutral-800">Account Number</label>
            <input
              type="text"
              value={payoutSettings.accountNumber}
              onChange={(e) => setPayoutSettings({ ...payoutSettings, accountNumber: e.target.value })}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl font-mono focus:ring-1 focus:ring-neutral-900 focus:outline-none text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:col-span-2">
            <label className="font-semibold text-neutral-800">Account Holder Name</label>
            <input
              type="text"
              value={payoutSettings.accountHolder}
              onChange={(e) => setPayoutSettings({ ...payoutSettings, accountHolder: e.target.value })}
              className="w-full px-4 py-2.5 sm:py-3 bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none text-sm"
            />
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-neutral-100">
          <button
            type="submit"
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
          >
            Save Payout Preferences
          </button>
        </div>
      </form>

      {/* 3. Notification Preferences */}
      <form onSubmit={handleSavePrefs} className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex items-center gap-2.5 border-b border-neutral-100 pb-4">
          <Bell className="w-5 h-5 text-amber-500" />
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900">Communication &amp; Alerts</h2>
        </div>

        <div className="space-y-3.5 text-sm">
          <label className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:bg-neutral-100/60 transition-colors">
            <div>
              <span className="font-bold text-neutral-900 block text-sm sm:text-base">Instant SMS on New Customer Order</span>
              <span className="text-xs sm:text-sm text-neutral-500 mt-0.5 block">Receive immediate SMS alert when an order is placed on your store</span>
            </div>
            <input
              type="checkbox"
              checked={notificationPrefs.smsOnNewOrder}
              onChange={(e) => setNotificationPrefs({ ...notificationPrefs, smsOnNewOrder: e.target.checked })}
              className="w-5 h-5 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:bg-neutral-100/60 transition-colors">
            <div>
              <span className="font-bold text-neutral-900 block text-sm sm:text-base">Payout Dispatch Notification</span>
              <span className="text-xs sm:text-sm text-neutral-500 mt-0.5 block">Email and push notification with TrxID when money is sent to your account</span>
            </div>
            <input
              type="checkbox"
              checked={notificationPrefs.emailOnPayoutDispatch}
              onChange={(e) => setNotificationPrefs({ ...notificationPrefs, emailOnPayoutDispatch: e.target.checked })}
              className="w-5 h-5 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between p-4 sm:p-5 rounded-2xl bg-neutral-50 border border-neutral-200 cursor-pointer hover:bg-neutral-100/60 transition-colors">
            <div>
              <span className="font-bold text-neutral-900 block text-sm sm:text-base">Product Status &amp; Wholesale Alerts</span>
              <span className="text-xs sm:text-sm text-neutral-500 mt-0.5 block">Notices about wholesale supplier restocks and wholesale price drops</span>
            </div>
            <input
              type="checkbox"
              checked={notificationPrefs.productModerationAlerts}
              onChange={(e) => setNotificationPrefs({ ...notificationPrefs, productModerationAlerts: e.target.checked })}
              className="w-5 h-5 rounded text-neutral-900 focus:ring-neutral-900 cursor-pointer"
            />
          </label>
        </div>

        <div className="flex justify-end pt-3 border-t border-neutral-100">
          <button
            type="submit"
            className="px-5 py-2.5 bg-neutral-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
          >
            Save Alert Preferences
          </button>
        </div>
      </form>
    </div>
  );
}
