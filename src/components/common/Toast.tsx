'use client';

import React from 'react';
import { useMarketplace } from '@/context/MarketplaceContext';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function ToastContainer() {
  const { toasts, dismissToast } = useMarketplace();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
          info: <Info className="w-5 h-5 text-blue-600 shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
        };

        const borders = {
          success: 'border-emerald-200 bg-white shadow-lg',
          info: 'border-blue-200 bg-white shadow-lg',
          error: 'border-rose-200 bg-white shadow-lg',
        };

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${borders[toast.type]} transition-all duration-300 transform translate-y-0`}
          >
            {icons[toast.type]}
            <div className="flex-1 text-sm">
              <p className="font-semibold text-neutral-900 leading-tight">{toast.title}</p>
              <p className="text-neutral-600 text-xs mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => dismissToast(toast.id)}
              className="text-neutral-400 hover:text-neutral-700 transition-colors p-0.5"
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

export const Toast = ToastContainer;
