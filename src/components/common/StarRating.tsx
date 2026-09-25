'use client';

import React, { useState } from 'react';
import { Star } from 'lucide-react';

interface StarRatingProps {
  value: number;
  onChange?: (rating: number) => void;
  max?: number;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  readOnly?: boolean;
  showValue?: boolean;
  showLabel?: boolean;
  className?: string;
}

const RATING_LABELS: Record<number, string> = {
  1: 'Poor',
  2: 'Fair',
  3: 'Good',
  4: 'Very Good',
  5: 'Excellent'
};

export function StarRating({
  value,
  onChange,
  max = 5,
  size = 'md',
  readOnly = false,
  showValue = false,
  showLabel = false,
  className = ''
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);

  const isInteractive = !readOnly && !!onChange;
  const currentRating = hoverRating !== null ? hoverRating : value;

  const sizeClasses = {
    xs: 'w-3 h-3',
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-7 h-7'
  };

  const handleStarClick = (ratingIndex: number) => {
    if (isInteractive && onChange) {
      onChange(ratingIndex);
    }
  };

  return (
    <div className={`inline-flex items-center gap-1.5 ${className}`}>
      <div 
        className="inline-flex items-center gap-1"
        role={isInteractive ? 'radiogroup' : 'img'}
        aria-label={isInteractive ? 'Select a star rating' : `Rated ${value} out of ${max} stars`}
      >
        {Array.from({ length: max }, (_, index) => {
          const starNumber = index + 1;
          const isFull = currentRating >= starNumber;
          const isPartial = !isInteractive && currentRating > index && currentRating < starNumber;
          const fillPercentage = isPartial ? Math.round((currentRating - index) * 100) : 0;

          if (isInteractive) {
            return (
              <button
                key={index}
                type="button"
                onClick={() => handleStarClick(starNumber)}
                onMouseEnter={() => setHoverRating(starNumber)}
                onMouseLeave={() => setHoverRating(null)}
                className="group relative p-0.5 rounded-sm transition-transform hover:scale-115 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 cursor-pointer"
                role="radio"
                aria-checked={value === starNumber}
                aria-label={`${starNumber} star${starNumber > 1 ? 's' : ''} - ${RATING_LABELS[starNumber] || ''}`}
              >
                <Star
                  className={`${sizeClasses[size]} transition-colors duration-150 ${
                    isFull
                      ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                      : 'fill-transparent text-neutral-300 group-hover:text-amber-300'
                  }`}
                />
              </button>
            );
          }

          // Read-only display (handles partial stars)
          if (isPartial) {
            const gradId = `star-grad-${starNumber}-${Math.round(value * 10)}`;
            return (
              <div key={index} className="relative inline-block" title={`${value} out of ${max}`}>
                <svg className={sizeClasses[size]} viewBox="0 0 24 24">
                  <defs>
                    <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset={`${fillPercentage}%`} stopColor="#F59E0B" />
                      <stop offset={`${fillPercentage}%`} stopColor="#E5E7EB" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#${gradId})`}
                    stroke="#D1D5DB"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                  />
                </svg>
              </div>
            );
          }

          return (
            <div key={index} className="inline-block" title={`${value} out of ${max}`}>
              <Star
                className={`${sizeClasses[size]} ${
                  isFull
                    ? 'fill-amber-400 text-amber-400'
                    : 'fill-neutral-200 text-neutral-300'
                }`}
              />
            </div>
          );
        })}
      </div>

      {showValue && (
        <span className="text-xs sm:text-sm font-bold text-neutral-800 ml-0.5">
          {value.toFixed(1)}
        </span>
      )}

      {showLabel && (
        <span className="text-xs sm:text-sm font-semibold text-neutral-600 transition-colors">
          {RATING_LABELS[currentRating] || ''}
        </span>
      )}
    </div>
  );
}
