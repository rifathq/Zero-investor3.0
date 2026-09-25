'use client';

import React from 'react';
import { LucideIcon, Inbox } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionText?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon = Inbox,
  title,
  description,
  actionText,
  onAction
}: EmptyStateProps) {
  return (
    <div className="py-12 sm:py-16 px-4 text-center flex flex-col items-center justify-center max-w-md mx-auto">
      <div className="w-14 h-14 rounded-2xl bg-neutral-100 border border-neutral-200 flex items-center justify-center text-neutral-400 mb-4 shadow-2xs">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-neutral-900 tracking-tight">
        {title}
      </h3>
      <p className="text-sm text-neutral-500 mt-1 max-w-sm leading-relaxed">
        {description}
      </p>
      {actionText && onAction && (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 px-4 py-2 bg-neutral-900 hover:bg-black text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors shadow-xs cursor-pointer"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}

export function LoadingSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="w-full space-y-3 p-6 animate-pulse">
      <div className="h-6 bg-neutral-200/60 rounded-md w-1/4 mb-4" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 py-3">
          <div className="w-10 h-10 bg-neutral-200/60 rounded-lg shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-neutral-200/60 rounded-md w-3/4" />
            <div className="h-3 bg-neutral-100 rounded-md w-1/2" />
          </div>
          <div className="w-20 h-6 bg-neutral-200/60 rounded-md" />
        </div>
      ))}
    </div>
  );
}
