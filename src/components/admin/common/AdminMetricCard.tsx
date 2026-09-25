'use client';

import React from 'react';
import { LucideIcon } from 'lucide-react';

interface AdminMetricCardProps {
  label: string;
  value: string | number;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral' | 'warning';
  subtext?: string;
  icon: LucideIcon;
  iconColor?: string;
  onClick?: () => void;
}

export function AdminMetricCard({
  label,
  value,
  change,
  changeType = 'neutral',
  subtext,
  icon: Icon,
  iconColor = 'text-neutral-700',
  onClick
}: AdminMetricCardProps) {
  const changeColors = {
    positive: 'text-emerald-700 bg-emerald-50 border-emerald-200',
    negative: 'text-rose-700 bg-rose-50 border-rose-200',
    warning: 'text-amber-700 bg-amber-50 border-amber-200',
    neutral: 'text-neutral-600 bg-neutral-100 border-neutral-200'
  };

  return (
    <div 
      onClick={onClick}
      className={`bg-white border border-neutral-200/90 rounded-2xl p-5 sm:p-6 shadow-xs transition-all ${
        onClick ? 'cursor-pointer hover:border-neutral-400 hover:shadow-sm' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm font-semibold text-neutral-600 tracking-tight">
          {label}
        </span>
        <div className="w-10 h-10 rounded-xl bg-neutral-100/80 border border-neutral-200/60 flex items-center justify-center shrink-0">
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>

      <div className="mt-3 flex items-baseline gap-2.5">
        <span className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
          {value}
        </span>
        {change && (
          <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-md border ${changeColors[changeType]}`}>
            {change}
          </span>
        )}
      </div>

      {subtext && (
        <p className="mt-2 text-xs text-neutral-500 font-normal">
          {subtext}
        </p>
      )}
    </div>
  );
}
