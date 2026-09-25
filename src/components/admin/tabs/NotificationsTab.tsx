'use client';

import React, { useState } from 'react';
import { useAdmin } from '@/context/AdminContext';
import { AdminNotification } from '@/types/admin';
import { 
  Bell, 
  CheckCheck, 
  ShoppingBag, 
  Banknote, 
  CreditCard, 
  Store, 
  Info,
  Clock,
  Send,
  Plus,
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  X,
  Users,
  Search
} from 'lucide-react';
import { AdminPageHeader } from '../common/AdminPageHeader';
import { EmptyState } from '../common/EmptyState';

export function NotificationsTab() {
  const { 
    notifications, 
    isLoadingNotifications, 
    markNotificationRead, 
    sendNotification, 
    resellers, 
    isSubmitting 
  } = useAdmin();

  const [filterUnread, setFilterUnread] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Dispatch Notification Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastType, setBroadcastType] = useState<'info' | 'success' | 'warning' | 'alert'>('info');
  const [recipientType, setRecipientType] = useState<'all' | 'specific' | 'plan'>('all');
  const [recipientTarget, setRecipientTarget] = useState<string>('');

  const safeNotifications = notifications || [];
  const displayedNotifications = safeNotifications.filter(n => {
    if (filterUnread && n.isRead) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const title = (n.title || '').toLowerCase();
      const msg = (n.message || '').toLowerCase();
      if (!title.includes(q) && !msg.includes(q)) return false;
    }
    return true;
  });

  const handleSendBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim() || !broadcastMessage.trim()) return;

    await sendNotification({
      title: broadcastTitle.trim(),
      message: broadcastMessage.trim(),
      type: broadcastType,
      recipientType: recipientType === 'all' ? 'All Resellers' : recipientType === 'plan' ? `Plan: ${recipientTarget || 'Pro'}` : `Reseller: ${recipientTarget}`,
      recipientTarget
    });

    setIsModalOpen(false);
    setBroadcastTitle('');
    setBroadcastMessage('');
    setRecipientType('all');
    setRecipientTarget('');
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      
      {/* Header */}
      <AdminPageHeader
        title="Platform Alerts &amp; Reseller Broadcasts"
        description="Monitor system events, orders, payout requests, and dispatch targeted broadcast alerts to merchants across subscription tiers."
        actions={
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-black text-white text-xs font-semibold rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Send New Broadcast</span>
          </button>
        }
      />

      {/* Filter and Search Bar */}
      <div className="bg-white border border-neutral-200/90 rounded-2xl p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notification title or message..."
            className="w-full pl-9.5 pr-4 py-2 text-xs rounded-xl border border-neutral-200 bg-neutral-50 focus:bg-white focus:outline-none focus:border-black transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
          <button
            onClick={() => setFilterUnread(!filterUnread)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors cursor-pointer ${
              filterUnread 
                ? 'bg-neutral-900 text-white border-neutral-900' 
                : 'bg-neutral-50 text-neutral-700 border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            {filterUnread ? 'Showing Unread' : 'Show All'}
          </button>
          <span className="text-xs text-neutral-400 font-medium">
            {displayedNotifications.length} items
          </span>
        </div>
      </div>

      {/* Notifications List */}
      <div className="bg-white border border-neutral-200/90 rounded-3xl shadow-xs overflow-hidden">
        {isLoadingNotifications ? (
          <div className="py-16 text-center text-xs text-neutral-500">
            Loading notifications from Firestore...
          </div>
        ) : displayedNotifications.length === 0 ? (
          <EmptyState
            icon={Bell}
            title="No notifications to display"
            description="You are all caught up. New operational events or outgoing broadcasts will appear here."
          />
        ) : (
          <div className="divide-y divide-neutral-100">
            {displayedNotifications.map((notif) => {
              const isAlert = notif.type === 'alert' || notif.type === 'warning';
              const isSuccess = notif.type === 'success';

              return (
                <div 
                  key={notif.id} 
                  className={`p-4 sm:p-5 flex items-start justify-between gap-4 transition-colors ${
                    notif.isRead ? 'bg-white' : 'bg-neutral-50/60'
                  }`}
                >
                  <div className="flex items-start gap-3.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                      isAlert ? 'bg-amber-50 text-amber-700 border border-amber-200' :
                      isSuccess ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                      notif.type === 'order' ? 'bg-blue-50 text-blue-700 border border-blue-200' :
                      notif.type === 'withdrawal' ? 'bg-rose-50 text-rose-700 border border-rose-200' :
                      'bg-neutral-100 text-neutral-700 border border-neutral-200'
                    }`}>
                      {isAlert && <AlertTriangle className="w-4 h-4" />}
                      {isSuccess && <CheckCircle2 className="w-4 h-4" />}
                      {notif.type === 'order' && <ShoppingBag className="w-4 h-4" />}
                      {notif.type === 'withdrawal' && <Banknote className="w-4 h-4" />}
                      {!isAlert && !isSuccess && notif.type !== 'order' && notif.type !== 'withdrawal' && (
                        <Info className="w-4 h-4" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-neutral-900 text-xs sm:text-sm">
                          {notif.title}
                        </h4>
                        {!notif.isRead && (
                          <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        )}
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-neutral-100 text-neutral-600">
                          {notif.type || 'info'}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1 leading-relaxed max-w-2xl">
                        {notif.message}
                      </p>
                      <div className="flex items-center gap-3 text-[11px] text-neutral-400 mt-2">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {notif.createdAt ? new Date(notif.createdAt).toLocaleString() : 'Just now'}
                        </span>
                        {notif.metadata?.recipientType && (
                          <span className="flex items-center gap-1 font-semibold text-neutral-500">
                            <Users className="w-3 h-3" />
                            Target: {notif.metadata.recipientType}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {!notif.isRead && (
                    <button
                      onClick={() => markNotificationRead(notif.id)}
                      className="p-1.5 rounded-lg border border-neutral-200 text-neutral-500 hover:text-black hover:bg-neutral-100 text-xs shrink-0 cursor-pointer"
                      title="Mark Read"
                    >
                      <CheckCheck className="w-4 h-4" />
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Broadcast Dispatch Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white border border-neutral-200 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-200">
              <div>
                <h3 className="text-base font-bold text-neutral-900">Send Notification Broadcast</h3>
                <p className="text-xs text-neutral-500 mt-0.5">Publish alerts to resellers across the marketplace</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-1 rounded-lg text-neutral-400 hover:text-black">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendBroadcast} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Recipient Audience
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRecipientType('all')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                      recipientType === 'all'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    All Resellers
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientType('plan')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                      recipientType === 'plan'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    By Plan Tier
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecipientType('specific')}
                    className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer text-center ${
                      recipientType === 'specific'
                        ? 'bg-neutral-900 text-white border-neutral-900 shadow-2xs'
                        : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                    }`}
                  >
                    Specific Store
                  </button>
                </div>
              </div>

              {recipientType === 'plan' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Select Target Plan
                  </label>
                  <select
                    value={recipientTarget}
                    onChange={(e) => setRecipientTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="Starter">Starter Tier (৳0)</option>
                    <option value="Pro">Pro Merchant (৳999)</option>
                    <option value="Elite">Elite Enterprise (৳2,499)</option>
                  </select>
                </div>
              )}

              {recipientType === 'specific' && (
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                    Select Target Reseller Store
                  </label>
                  <select
                    value={recipientTarget}
                    onChange={(e) => setRecipientTarget(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-black cursor-pointer"
                  >
                    <option value="">Choose a reseller...</option>
                    {(resellers || []).map(r => (
                      <option key={r.id} value={r.storeName}>
                        {r.storeName} ({r.ownerName || 'Merchant'})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Alert Severity Type
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {(['info', 'success', 'warning', 'alert'] as const).map(type => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setBroadcastType(type)}
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold uppercase tracking-wider border transition-colors cursor-pointer text-center ${
                        broadcastType === type
                          ? 'bg-neutral-900 text-white border-neutral-900'
                          : 'border-neutral-200 text-neutral-600 hover:bg-neutral-50'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Notification Title
                </label>
                <input
                  type="text"
                  required
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  placeholder="e.g. Eid Logistics Courier Cutoff Announcement"
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-black"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">
                  Broadcast Message
                </label>
                <textarea
                  rows={3}
                  required
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  placeholder="Type the message body that will appear in merchant notification centers..."
                  className="w-full px-3.5 py-2 text-xs rounded-xl border border-neutral-200 focus:outline-none focus:border-black"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-2 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-neutral-200 text-xs font-semibold text-neutral-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 rounded-xl bg-neutral-900 text-white text-xs font-semibold shadow-xs"
                >
                  Publish Broadcast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
