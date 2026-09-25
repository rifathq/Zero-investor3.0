'use client';

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { useMarketplace } from '@/context/MarketplaceContext';
import { ShieldAlert, Home } from 'lucide-react';

export function AccessDeniedView({ requiredRole }: { requiredRole?: 'seller' | 'admin' }) {
  const { role, user, logout } = useAuth();
  const { navigate } = useMarketplace();

  return (
    <div className="w-full max-w-[1800px] mx-auto px-3.5 sm:px-6 lg:px-12 py-16 sm:py-24 text-center">
      <div className="max-w-md mx-auto bg-white rounded-3xl border border-[#E6E4E0] shadow-xl p-8 sm:p-10">
        
        {/* Shield Alert Icon */}
        <div className="w-16 h-16 rounded-full bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto mb-5 shadow-xs">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <span className="inline-block px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-bold uppercase tracking-wider mb-2">
          {requiredRole === 'admin' ? 'Admin Portal Access' : 'Reseller Portal Access'}
        </span>

        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#111111] tracking-tight">
          {requiredRole === 'admin' ? 'Admin Access Restricted' : 'Access Restricted'}
        </h1>

        <p className="text-xs sm:text-sm text-neutral-600 mt-2 leading-relaxed">
          {requiredRole === 'admin' ? (
            <>
              This administrative control panel is restricted to verified platform administrators. Your authenticated account does not have administrative clearance in Cloud Firestore.
            </>
          ) : role === 'admin' ? (
            <>
              Administrator accounts cannot access the Zero Invest Reseller Dashboard. This view is reserved exclusively for Resellers to manage their products and landing pages.
            </>
          ) : (
            <>
              You need an active Reseller account to access the Zero Invest Reseller Portal.
            </>
          )}
        </p>

        <div className="p-3.5 rounded-2xl bg-[#F7F6F3] border border-[#E6E4E0] text-xs text-neutral-600 mt-5 text-left space-y-1">
          <p className="font-bold text-neutral-800">Current Session:</p>
          <p className="truncate">Email: {user?.email || 'Authenticated User'}</p>
          <p>Active Role: <span className="font-bold uppercase text-[#111111]">{role}</span></p>
        </div>

        <div className="mt-6 space-y-2.5">
          <button
            onClick={() => navigate('home')}
            className="w-full py-3.5 px-4 rounded-2xl bg-[#111111] hover:bg-neutral-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer"
          >
            <Home className="w-4 h-4" />
            <span>Return to Marketplace</span>
          </button>

          <button
            onClick={async () => {
              await logout();
              navigate('login');
            }}
            className="w-full py-2.5 px-4 text-xs font-bold text-neutral-600 hover:text-neutral-900 transition-colors cursor-pointer"
          >
            {requiredRole === 'admin' ? 'Sign In with Admin Account' : 'Sign In with a Reseller Account'}
          </button>
        </div>

      </div>
    </div>
  );
}
