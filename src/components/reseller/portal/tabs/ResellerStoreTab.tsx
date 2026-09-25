'use client';

import React, { useState } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { 
  Store, 
  ExternalLink, 
  Copy, 
  Edit3, 
  Check, 
  ShieldCheck, 
  Phone, 
  Mail, 
  Globe, 
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

export function ResellerStoreTab() {
  const { resellerProfile, updateStoreProfile, isSubmitting } = useReseller();
  const { navigate, showToast } = useMarketplace();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    storeName: resellerProfile?.storeName || '',
    storeSlug: resellerProfile?.storeSlug || '',
    tagline: resellerProfile?.tagline || '',
    description: resellerProfile?.description || '',
    contactPhone: resellerProfile?.contactPhone || '',
    contactEmail: resellerProfile?.contactEmail || '',
    logoUrl: resellerProfile?.logoUrl || '',
    bannerUrl: resellerProfile?.bannerUrl || ''
  });

  const publicUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}/r/${resellerProfile?.storeSlug || 'store'}`
    : `/r/${resellerProfile?.storeSlug || 'store'}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicUrl);
    showToast('Store Link Copied', publicUrl, 'success');
  };

  const handlePreviewStore = () => {
    navigate('reseller-public-store', { storeSlug: resellerProfile?.storeSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.storeName.trim()) {
      showToast('Validation Error', 'Store name cannot be empty', 'error');
      return;
    }

    const cleanSlug = formData.storeSlug.trim()
      ? formData.storeSlug.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')
      : formData.storeName.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-');

    const success = await updateStoreProfile({
      storeName: formData.storeName.trim(),
      storeSlug: cleanSlug,
      tagline: formData.tagline.trim(),
      description: formData.description.trim(),
      contactPhone: formData.contactPhone.trim(),
      contactEmail: formData.contactEmail.trim(),
      logoUrl: formData.logoUrl.trim() || undefined,
      bannerUrl: formData.bannerUrl.trim() || undefined
    });

    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="space-y-8 lg:space-y-10 w-full">
      {/* Top Header Card */}
      <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="w-20 h-20 rounded-2xl bg-neutral-900 text-white flex items-center justify-center font-bold text-2xl overflow-hidden shrink-0 shadow-xs">
              {resellerProfile?.logoUrl ? (
                <img src={resellerProfile.logoUrl} alt={resellerProfile.storeName} className="w-full h-full object-cover" />
              ) : (
                <Store className="w-10 h-10 text-neutral-300" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">{resellerProfile?.storeName || 'Official Store'}</h1>
                <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-1 rounded-md">
                  <ShieldCheck className="w-4 h-4" /> Verified Reseller
                </span>
              </div>
              <p className="text-sm text-neutral-500 mt-1">{resellerProfile?.tagline || 'Nationwide COD Online Store'}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-neutral-300 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              <Edit3 className="w-4 h-4" /> {isEditing ? 'Cancel Editing' : 'Edit Store'}
            </button>
            <button
              onClick={handlePreviewStore}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-neutral-900 text-white text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors cursor-pointer shadow-2xs"
            >
              <ExternalLink className="w-4 h-4" /> Preview Store
            </button>
          </div>
        </div>

        {/* Public Storefront Link Bar */}
        <div className="p-5 bg-neutral-50 rounded-2xl border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3 text-sm">
            <Globe className="w-5 h-5 text-neutral-500 shrink-0" />
            <span className="text-neutral-500 font-medium">Public Storefront URL:</span>
            <span className="font-mono font-bold text-neutral-900 select-all text-sm sm:text-base">{publicUrl}</span>
          </div>
          <button
            onClick={handleCopyLink}
            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-neutral-300 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-100 transition-colors cursor-pointer self-start sm:self-auto shadow-2xs"
          >
            <Copy className="w-4 h-4" /> Copy Link
          </button>
        </div>
      </div>

      {/* Edit Form or Read-Only View */}
      {isEditing ? (
        <form onSubmit={handleSubmit} className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-8 space-y-6 shadow-xs">
          <h2 className="text-lg sm:text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-3">
            Edit Store Details
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-800">Store Name *</label>
              <input
                type="text"
                required
                value={formData.storeName}
                onChange={(e) => setFormData({ ...formData, storeName: e.target.value })}
                className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-800">Store Slug (URL Handle) *</label>
              <input
                type="text"
                required
                value={formData.storeSlug}
                onChange={(e) => setFormData({ ...formData, storeSlug: e.target.value })}
                className="w-full px-4 py-2.5 sm:py-3 text-sm font-mono bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              />
              <span className="text-xs text-neutral-400">e.g. /r/{formData.storeSlug || 'your-slug'}</span>
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-neutral-800">Tagline</label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                placeholder="Short tagline displayed under your store name"
                className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-neutral-800">About / Description</label>
              <textarea
                rows={3}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Tell customers about your brand and services..."
                className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none leading-relaxed"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-800">Support Phone</label>
              <input
                type="text"
                value={formData.contactPhone}
                onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-neutral-800">Support Email</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => setFormData({ ...formData, contactEmail: e.target.value })}
                className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-neutral-800">Store Logo URL</label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://example.com/logo.png"
                className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              />
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label className="text-sm font-semibold text-neutral-800">Store Banner URL</label>
              <input
                type="url"
                value={formData.bannerUrl}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                placeholder="https://images.unsplash.com/... (Header banner)"
                className="w-full px-4 py-2.5 sm:py-3 text-sm bg-white border border-neutral-300 rounded-xl focus:ring-1 focus:ring-neutral-900 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="px-5 py-2.5 border border-neutral-300 rounded-xl text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-2.5 bg-neutral-900 text-white rounded-xl text-xs sm:text-sm font-semibold hover:bg-neutral-800 transition-colors flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-2xs"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 sm:gap-8">
          {/* Store Information */}
          <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Store Profile
            </h3>
            <div className="space-y-4 text-sm">
              <div>
                <span className="text-neutral-500 block text-xs">Store Name</span>
                <span className="font-bold text-base text-neutral-900">{resellerProfile?.storeName}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-xs">URL Handle</span>
                <span className="font-mono text-neutral-900 font-semibold text-sm">/r/{resellerProfile?.storeSlug}</span>
              </div>
              <div>
                <span className="text-neutral-500 block text-xs">Description</span>
                <p className="text-neutral-700 mt-1 leading-relaxed">
                  {resellerProfile?.description || 'No description provided.'}
                </p>
              </div>
              <div>
                <span className="text-neutral-500 block text-xs">Status</span>
                <span className="inline-block mt-1 font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded text-xs uppercase">
                  {resellerProfile?.status || 'active'}
                </span>
              </div>
            </div>
          </div>

          {/* Contact & Dispatch */}
          <div className="bg-white border border-[#E6E4E0] rounded-2xl p-6 sm:p-8 space-y-5 shadow-xs">
            <h3 className="text-lg sm:text-xl font-bold text-neutral-900 border-b border-neutral-100 pb-3">
              Customer Contact &amp; Support
            </h3>
            <div className="space-y-4 text-sm">
              <div className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-neutral-400" />
                <div>
                  <span className="text-neutral-500 block text-xs">Contact Phone</span>
                  <span className="font-semibold text-neutral-900">{resellerProfile?.contactPhone || 'Not set'}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-neutral-400" />
                <div>
                  <span className="text-neutral-500 block text-xs">Contact Email</span>
                  <span className="font-semibold text-neutral-900">{resellerProfile?.contactEmail || 'Not set'}</span>
                </div>
              </div>
              <div className="pt-3 border-t border-neutral-100 space-y-1.5">
                <span className="text-neutral-500 block text-xs">Logistics Partner</span>
                <p className="text-neutral-800 font-bold text-sm">Steadfast Courier / Pathao Express COD</p>
                <p className="text-xs text-neutral-400">Automated order routing and delivery status sync enabled.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
