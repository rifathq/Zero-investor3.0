'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { PlatformSettings } from '@/types/admin';
import { formatBDT } from '@/lib/formatters';
import { 
  Settings, 
  Sliders, 
  Truck, 
  CreditCard, 
  Store, 
  Bell, 
  ShieldCheck, 
  Save, 
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Lock,
  Globe,
  Mail,
  Phone
} from 'lucide-react';
import { AdminPageHeader } from '../common/AdminPageHeader';

export function SettingsTab() {
  const { settings, updateSettings, isSubmitting } = useAdmin();

  // Local working copy of settings
  const [form, setForm] = useState<PlatformSettings>({ ...settings });
  const [activeCategory, setActiveCategory] = useState<
    'platform' | 'subscriptions' | 'delivery' | 'payments' | 'reseller_rules' | 'notifications' | 'security'
  >('platform');

  const [hasChanges, setHasChanges] = useState<boolean>(false);

  const handleChange = <K extends keyof PlatformSettings>(key: K, value: PlatformSettings[K]) => {
    setForm(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateSettings(form);
    setHasChanges(false);
  };

  const handleReset = () => {
    setForm({ ...settings });
    setHasChanges(false);
  };

  const categories = [
    { id: 'platform', label: 'Platform & Branding', icon: Globe },
    { id: 'subscriptions', label: 'Subscription Rules', icon: CreditCard },
    { id: 'delivery', label: 'Delivery & Logistics', icon: Truck },
    { id: 'payments', label: 'Payouts & Gateways', icon: Sliders },
    { id: 'reseller_rules', label: 'Reseller Policies', icon: Store },
    { id: 'notifications', label: 'Notification Alerts', icon: Bell },
    { id: 'security', label: 'Admin Security', icon: ShieldCheck }
  ];

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <AdminPageHeader
        title="Platform Configuration &amp; Governance"
        description="Configure multi-vendor marketplace parameters, logistics fulfillment fees, merchant withdrawal rules, and subscription enforcement."
        actions={
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleReset}
              disabled={!hasChanges || isSubmitting}
              className="inline-flex items-center gap-2 px-3.5 py-2.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-100 text-xs font-semibold text-neutral-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!hasChanges || isSubmitting}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-xs disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{isSubmitting ? 'Saving...' : 'Save Settings'}</span>
            </button>
          </div>
        }
      />

      {/* Main Settings Container */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl shadow-xs overflow-hidden flex flex-col md:flex-row">
        
        {/* Settings Navigation Tabs */}
        <aside className="w-full md:w-64 border-b md:border-b-0 md:border-r border-neutral-200/80 bg-neutral-50/50 p-3 sm:p-4 space-y-1 shrink-0">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-neutral-400">
            Settings Modules
          </div>
          {categories.map(cat => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as any)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-colors text-left cursor-pointer ${
                  isActive 
                    ? 'bg-neutral-900 text-white font-semibold shadow-xs' 
                    : 'text-neutral-600 hover:bg-neutral-200/60 hover:text-neutral-900'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-neutral-500'}`} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </aside>

        {/* Settings Form Body */}
        <div className="flex-1 p-6 sm:p-8 md:p-10">
          <form onSubmit={handleSave} className="space-y-6">
            
            {/* 1. Platform & Branding */}
            {activeCategory === 'platform' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Platform Identity &amp; Support</h3>
                  <p className="text-xs text-neutral-500 mt-1">Global platform labels, customer support contacts, and system availability.</p>
                </div>

                <div className="space-y-4 pt-2">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Platform Brand Title
                    </label>
                    <input
                      type="text"
                      value={form.platformName}
                      onChange={(e) => handleChange('platformName', e.target.value)}
                      className="w-full max-w-lg px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Official Support Email
                      </label>
                      <input
                        type="email"
                        value={form.supportEmail}
                        onChange={(e) => handleChange('supportEmail', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Support Helpline
                      </label>
                      <input
                        type="text"
                        value={form.supportPhone}
                        onChange={(e) => handleChange('supportPhone', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Currency Symbol
                    </label>
                    <input
                      type="text"
                      value={form.currencySymbol}
                      onChange={(e) => handleChange('currencySymbol', e.target.value)}
                      className="w-24 px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 font-bold focus:outline-none focus:border-black text-center transition-colors"
                    />
                  </div>

                  <div className="pt-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.maintenanceMode}
                        onChange={(e) => handleChange('maintenanceMode', e.target.checked)}
                        className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-black"
                      />
                      <span className="text-xs font-semibold text-neutral-800">
                        Enable Marketplace Maintenance Mode (Suspend customer checkout temporarily)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Subscriptions */}
            {activeCategory === 'subscriptions' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Subscription Policies &amp; Grace Periods</h3>
                  <p className="text-xs text-neutral-500 mt-1">Configure automated plan expiration, free trials, and catalog limits.</p>
                </div>

                <div className="space-y-4 pt-2 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Free Trial Duration (Days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="90"
                        value={form.trialPeriodDays}
                        onChange={(e) => handleChange('trialPeriodDays', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Payment Grace Period (Days)
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="30"
                        value={form.gracePeriodDays}
                        onChange={(e) => handleChange('gracePeriodDays', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={form.enforceProductLimits}
                        onChange={(e) => handleChange('enforceProductLimits', e.target.checked)}
                        className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-black"
                      />
                      <span className="text-xs font-semibold text-neutral-800">
                        Strictly enforce tier product limits (e.g. Starter: 20 items, Pro: 100 items)
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 3. Delivery */}
            {activeCategory === 'delivery' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Delivery Fees &amp; Courier Logistics</h3>
                  <p className="text-xs text-neutral-500 mt-1">Configure standard flat delivery charges and preferred courier dispatch service.</p>
                </div>

                <div className="space-y-4 pt-2 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Inside Dhaka Delivery Fee (BDT)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.insideDhakaDeliveryFeeBDT}
                        onChange={(e) => handleChange('insideDhakaDeliveryFeeBDT', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Outside Dhaka Delivery Fee (BDT)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={form.outsideDhakaDeliveryFeeBDT}
                        onChange={(e) => handleChange('outsideDhakaDeliveryFeeBDT', Number(e.target.value))}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Default Courier Partner
                    </label>
                    <select
                      value={form.defaultCourier}
                      onChange={(e) => handleChange('defaultCourier', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors cursor-pointer"
                    >
                      <option value="Steadfast Courier">Steadfast Courier (Recommended for COD)</option>
                      <option value="Pathao Courier">Pathao Courier</option>
                      <option value="RedX Delivery">RedX Delivery</option>
                      <option value="Paperfly">Paperfly</option>
                      <option value="Sundarban Courier Service">Sundarban Courier Service</option>
                    </select>
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={form.autoFulfillCOD}
                        onChange={(e) => handleChange('autoFulfillCOD', e.target.checked)}
                        className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-black"
                      />
                      <span className="text-xs font-semibold text-neutral-800">
                        Auto-dispatch confirmed COD orders to courier partner API
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Payments */}
            {activeCategory === 'payments' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Reseller Payouts &amp; Mobile Banking</h3>
                  <p className="text-xs text-neutral-500 mt-1">Configure bKash, Nagad merchant payment endpoints and minimum withdrawal thresholds.</p>
                </div>

                <div className="space-y-4 pt-2 max-w-lg">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        bKash Merchant Account Number
                      </label>
                      <input
                        type="text"
                        value={form.bkashMerchantNumber}
                        onChange={(e) => handleChange('bkashMerchantNumber', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 font-mono focus:outline-none focus:border-black transition-colors"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                        Nagad Merchant Account Number
                      </label>
                      <input
                        type="text"
                        value={form.nagadMerchantNumber}
                        onChange={(e) => handleChange('nagadMerchantNumber', e.target.value)}
                        className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 font-mono focus:outline-none focus:border-black transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Minimum Withdrawal Threshold (BDT)
                    </label>
                    <input
                      type="number"
                      min="100"
                      step="50"
                      value={form.minWithdrawalBDT}
                      onChange={(e) => handleChange('minWithdrawalBDT', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">Resellers cannot request payout below this balance.</p>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Payout Disbursement Schedule
                    </label>
                    <input
                      type="text"
                      value={form.payoutSchedule}
                      onChange={(e) => handleChange('payoutSchedule', e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* 5. Reseller Rules */}
            {activeCategory === 'reseller_rules' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Reseller Onboarding &amp; Catalog Rules</h3>
                  <p className="text-xs text-neutral-500 mt-1">Set merchant approval policies, default catalog sizes, and price markup guidelines.</p>
                </div>

                <div className="space-y-4 pt-2 max-w-lg">
                  <div>
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.autoApproveResellers}
                        onChange={(e) => handleChange('autoApproveResellers', e.target.checked)}
                        className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-black"
                      />
                      <span className="text-xs font-semibold text-neutral-800">
                        Automatically approve newly registered reseller storefronts
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Default Catalog Max Items (Starter Tier)
                    </label>
                    <input
                      type="number"
                      min="5"
                      value={form.defaultMaxCatalogItems}
                      onChange={(e) => handleChange('defaultMaxCatalogItems', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Minimum Reseller Profit Markup (BDT)
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={form.minProfitMarkupBDT}
                      onChange={(e) => handleChange('minProfitMarkupBDT', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                    />
                    <p className="text-[11px] text-neutral-400 mt-1">Guarantees resellers earn at least this minimum margin per item.</p>
                  </div>
                </div>
              </div>
            )}

            {/* 6. Notifications */}
            {activeCategory === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">System Notification Triggers</h3>
                  <p className="text-xs text-neutral-500 mt-1">Configure which operational events trigger alerts for platform managers.</p>
                </div>

                <div className="space-y-3 pt-2 max-w-lg">
                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                    <input
                      type="checkbox"
                      checked={form.emailAlertsOnHighOrder}
                      onChange={(e) => handleChange('emailAlertsOnHighOrder', e.target.checked)}
                      className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-black"
                    />
                    <div>
                      <span className="text-xs font-semibold text-neutral-900 block">High-Value Order Alerts</span>
                      <span className="text-[11px] text-neutral-500">Send instant admin alert when an order exceeds ৳10,000</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                    <input
                      type="checkbox"
                      checked={form.payoutThresholdAlert}
                      onChange={(e) => handleChange('payoutThresholdAlert', e.target.checked)}
                      className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-black"
                    />
                    <div>
                      <span className="text-xs font-semibold text-neutral-900 block">Payout Queue Alerts</span>
                      <span className="text-[11px] text-neutral-500">Alert admin when pending withdrawal requests reach 5 or more</span>
                    </div>
                  </label>

                  <label className="flex items-center gap-3 cursor-pointer p-3 bg-neutral-50 rounded-xl border border-neutral-200/80">
                    <input
                      type="checkbox"
                      checked={form.smsNotificationsEnabled}
                      onChange={(e) => handleChange('smsNotificationsEnabled', e.target.checked)}
                      className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-black"
                    />
                    <div>
                      <span className="text-xs font-semibold text-neutral-900 block">SMS Gateway Integration</span>
                      <span className="text-[11px] text-neutral-500">Dispatch SMS dispatch updates to Bangladesh buyers via Banglalink / GP SMS Gateway</span>
                    </div>
                  </label>
                </div>
              </div>
            )}

            {/* 7. Security */}
            {activeCategory === 'security' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Administrator Security &amp; Authorization</h3>
                  <p className="text-xs text-neutral-500 mt-1">Manage session timeouts and Super Admin two-factor enforcement.</p>
                </div>

                <div className="space-y-4 pt-2 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1.5">
                      Session Expiration (Hours)
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="72"
                      value={form.sessionTimeoutHours}
                      onChange={(e) => handleChange('sessionTimeoutHours', Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 text-sm rounded-xl border border-neutral-200 focus:outline-none focus:border-black transition-colors"
                    />
                  </div>

                  <div>
                    <label className="flex items-center gap-3 cursor-pointer pt-2">
                      <input
                        type="checkbox"
                        checked={form.superAdmin2FA}
                        onChange={(e) => handleChange('superAdmin2FA', e.target.checked)}
                        className="w-4 h-4 rounded text-neutral-900 border-neutral-300 focus:ring-black"
                      />
                      <span className="text-xs font-semibold text-neutral-800">
                        Require Two-Factor Authentication (2FA) for destructive operations
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Actions */}
            <div className="pt-6 border-t border-neutral-200 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={handleReset}
                disabled={!hasChanges || isSubmitting}
                className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700 hover:bg-neutral-100 disabled:opacity-40 transition-colors"
              >
                Discard Changes
              </button>
              <button
                type="submit"
                disabled={!hasChanges || isSubmitting}
                className="px-5 py-2.5 rounded-xl bg-neutral-900 hover:bg-black text-white text-xs font-semibold shadow-xs disabled:opacity-40 transition-colors"
              >
                {isSubmitting ? 'Saving...' : 'Save Changes'}
              </button>
            </div>

          </form>
        </div>

      </div>

    </div>
  );
}
