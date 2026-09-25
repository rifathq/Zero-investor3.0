'use client';

import React, { useState, useMemo } from 'react';
import { useReseller } from '@/context/ResellerContext';
import { ResellerSection } from '@/types/reseller';
import { 
  Bell, 
  CheckCheck, 
  Check, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Filter
} from 'lucide-react';

export function ResellerNotificationsTab() {
  const { 
    notifications, 
    unreadNotificationCount, 
    markNotificationRead, 
    markAllNotificationsRead,
    setActiveSection 
  } = useReseller();

  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = useMemo(() => {
    if (filter === 'unread') {
      return notifications.filter(n => !n.isRead);
    }
    return notifications;
  }, [notifications, filter]);

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />;
      case 'alert':
        return <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-neutral-600 shrink-0" />;
    }
  };

  const handleNotificationClick = async (notifId: string, isRead: boolean, link?: string) => {
    if (!isRead) {
      await markNotificationRead(notifId);
    }
    if (link) {
      setActiveSection(link as ResellerSection);
    }
  };

  return (
    <div className="space-y-8 lg:space-y-10 w-full">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl sm:text-3xl font-bold text-neutral-900 tracking-tight">Notifications &amp; Broadcasts</h1>
            {unreadNotificationCount > 0 && (
              <span className="text-xs font-bold text-neutral-900 bg-neutral-200/80 px-2.5 py-0.5 rounded-full">
                {unreadNotificationCount} new
              </span>
            )}
          </div>
          <p className="text-sm text-neutral-500 mt-1.5">
            System announcements, courier delivery updates, and payout alerts
          </p>
        </div>

        <div className="flex items-center gap-3">
          {unreadNotificationCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-neutral-300 text-xs sm:text-sm font-semibold text-neutral-700 hover:bg-neutral-50 transition-colors cursor-pointer shadow-2xs"
            >
              <CheckCheck className="w-4 h-4" /> Mark All as Read
            </button>
          )}

          <div className="flex bg-neutral-100 p-1 rounded-xl text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'all' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer ${
                filter === 'unread' ? 'bg-white text-neutral-900 shadow-2xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Unread
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-4">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white border border-[#E6E4E0] rounded-2xl py-20 text-center space-y-3 shadow-xs">
            <Bell className="w-12 h-12 text-neutral-300 mx-auto" />
            <p className="text-base font-bold text-neutral-700">No notifications</p>
            <p className="text-sm text-neutral-400 max-w-sm mx-auto">
              You are completely caught up with all order updates and payouts.
            </p>
          </div>
        ) : (
          filteredNotifications.map((notif) => (
            <div
              key={notif.id}
              onClick={() => handleNotificationClick(notif.id, notif.isRead, notif.link)}
              className={`bg-white border rounded-2xl p-5 sm:p-6 transition-all flex items-start gap-4 sm:gap-5 cursor-pointer hover:shadow-xs ${
                notif.isRead 
                  ? 'border-[#E6E4E0] opacity-85' 
                  : 'border-neutral-400 bg-neutral-50/50 shadow-2xs ring-1 ring-neutral-900/5'
              }`}
            >
              <div className="shrink-0 mt-0.5">
                {getIcon(notif.type)}
              </div>

              <div className="flex-1 space-y-1.5">
                <div className="flex items-center justify-between gap-3">
                  <h4 className={`text-sm sm:text-base font-bold ${notif.isRead ? 'text-neutral-800' : 'text-neutral-900'}`}>
                    {notif.title}
                  </h4>
                  <span className="text-xs text-neutral-400 shrink-0 font-mono">
                    {new Date(notif.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  {notif.message}
                </p>

                {notif.link && (
                  <div className="pt-2 flex items-center gap-1.5 text-xs font-bold text-neutral-900 hover:underline">
                    View in {notif.link.toUpperCase()} <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>

              {!notif.isRead && (
                <span className="w-2.5 h-2.5 rounded-full bg-neutral-900 shrink-0 mt-2" />
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
