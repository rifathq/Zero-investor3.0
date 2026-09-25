import React from 'react';

interface BrandLogoProps {
  variant?: 'light' | 'dark';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function BrandLogo({ variant = 'dark', size = 'md', className = '' }: BrandLogoProps) {
  const isLight = variant === 'light';
  
  const iconSizes = {
    sm: 'w-6 h-6 shrink-0',
    md: 'w-7 h-7 sm:w-8 sm:h-8 shrink-0',
    lg: 'w-8 h-8 sm:w-10 sm:h-10 shrink-0',
  };

  const textSizes = {
    sm: 'text-sm sm:text-base tracking-widest',
    md: 'text-base sm:text-xl tracking-[0.14em] sm:tracking-[0.2em]',
    lg: 'text-xl sm:text-2xl tracking-[0.18em] sm:tracking-[0.22em]',
  };

  return (
    <div className={`flex items-center gap-2.5 font-bold select-none ${className}`}>
      {/* Original Zero Invest Minimal Geometric Emblem */}
      <div 
        className={`${iconSizes[size]} relative flex items-center justify-center rounded-lg transition-transform duration-300 hover:rotate-45`}
        style={{
          background: isLight ? '#FFFFFF' : '#111111',
          color: isLight ? '#111111' : '#FFFFFF'
        }}
      >
        <svg 
          viewBox="0 0 32 32" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="w-5 h-5"
        >
          {/* Outer geometric zero ring */}
          <rect 
            x="4" 
            y="4" 
            width="24" 
            height="24" 
            rx="6" 
            stroke="currentColor" 
            strokeWidth="2.5" 
          />
          {/* Inner dynamic commerce nodes & diagonal nexus */}
          <circle cx="11" cy="11" r="2.2" fill={isLight ? '#111111' : '#C98F6B'} />
          <circle cx="21" cy="21" r="2.2" fill="currentColor" />
          <path 
            d="M19 13L13 19" 
            stroke={isLight ? '#111111' : '#C98F6B'} 
            strokeWidth="2" 
            strokeLinecap="round" 
          />
        </svg>
      </div>

      <div className="flex flex-col leading-none">
        <span 
          className={`font-extrabold uppercase font-sans ${textSizes[size]} ${isLight ? 'text-white' : 'text-neutral-900'}`}
        >
          ZERO<span className="font-light ml-1.5 opacity-90">INVEST</span>
        </span>
        {size !== 'sm' && (
          <span 
            className={`text-[8.5px] font-semibold tracking-[0.28em] uppercase mt-0.5 ${
              isLight ? 'text-neutral-400' : 'text-[#C98F6B]'
            }`}
          >
            Marketplace
          </span>
        )}
      </div>
    </div>
  );
}
