'use client';

import React from 'react';

export type BadgeVariant = 
  | 'success' 
  | 'warning' 
  | 'danger' 
  | 'info' 
  | 'neutral' 
  | 'primary';

interface StatusBadgeProps {
  status: string;
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  dotOnly?: boolean;
}

export function StatusBadge({ status, variant, size = 'md', dotOnly = false }: StatusBadgeProps) {
  // Auto-infer variant if not explicitly provided
  const inferVariant = (s: string): BadgeVariant => {
    const lower = s.toLowerCase();
    if (['delivered', 'completed', 'active', 'approved', 'verified', 'paid', 'success'].includes(lower)) {
      return 'success';
    }
    if (['pending', 'pending_payment', 'processing', 'in_review', 'waiting'].includes(lower)) {
      return 'warning';
    }
    if (['cancelled', 'rejected', 'suspended', 'failed', 'expired'].includes(lower)) {
      return 'danger';
    }
    if (['shipped', 'in_transit', 'dispatched'].includes(lower)) {
      return 'info';
    }
    return 'neutral';
  };

  const actualVariant = variant || inferVariant(status);

  const styleMap: Record<BadgeVariant, { bg: string; text: string; dot: string; border: string }> = {
    success: {
      bg: 'bg-emerald-50/80',
      text: 'text-emerald-800',
      dot: 'bg-emerald-600',
      border: 'border-emerald-200'
    },
    warning: {
      bg: 'bg-amber-50/80',
      text: 'text-amber-800',
      dot: 'bg-amber-500',
      border: 'border-amber-200'
    },
    danger: {
      bg: 'bg-rose-50/80',
      text: 'text-rose-800',
      dot: 'bg-rose-600',
      border: 'border-rose-200'
    },
    info: {
      bg: 'bg-blue-50/80',
      text: 'text-blue-800',
      dot: 'bg-blue-600',
      border: 'border-blue-200'
    },
    primary: {
      bg: 'bg-neutral-100',
      text: 'text-neutral-900',
      dot: 'bg-neutral-900',
      border: 'border-neutral-200'
    },
    neutral: {
      bg: 'bg-neutral-100/70',
      text: 'text-neutral-700',
      dot: 'bg-neutral-400',
      border: 'border-neutral-200'
    }
  };

  const conf = styleMap[actualVariant];

  const formatText = (s: string) => {
    if (s === 'pending_payment') return 'Pending Payment';
    return s.charAt(0).toUpperCase() + s.slice(1);
  };

  if (dotOnly) {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-neutral-600">
        <span className={`w-2 h-2 rounded-full ${conf.dot}`} />
        <span>{formatText(status)}</span>
      </span>
    );
  }

  const sizeClasses = size === 'sm' 
    ? 'px-2 py-0.5 text-xs' 
    : 'px-2.5 py-1 text-xs sm:text-xs font-semibold';

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-lg border ${conf.bg} ${conf.text} ${conf.border} ${sizeClasses}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${conf.dot} shrink-0`} />
      <span className="capitalize">{formatText(status)}</span>
    </span>
  );
}
