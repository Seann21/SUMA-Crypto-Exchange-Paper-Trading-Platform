import React from 'react';

interface TigerLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function TigerLogo({ className = '', size = 'md', showText = true }: TigerLogoProps) {
  const iconSize = size === 'sm' ? 28 : size === 'lg' ? 44 : 36;

  return (
    <div className={`flex items-center gap-3 select-none ${className}`}>
      {/* Hexagonal Tiger Emblem */}
      <div 
        className="relative flex items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 via-orange-600/20 to-transparent p-1.5 border border-amber-500/30 shadow-[0_0_15px_rgba(245,158,11,0.25)]"
        style={{ width: iconSize, height: iconSize }}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-full h-full drop-shadow-[0_2px_8px_rgba(245,158,11,0.6)]"
        >
          {/* Stylized Sumatran Tiger Geometric Crest */}
          <path
            d="M12 2L4 6V12C4 16.5 7.5 20.6 12 22C16.5 20.6 20 16.5 20 12V6L12 2Z"
            stroke="url(#tiger-gold-grad)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Tiger Ears & Crown */}
          <path
            d="M7 8L9.5 10M17 8L14.5 10"
            stroke="#fb923c"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Tiger Stripes */}
          <path
            d="M12 5V8M9 7L10.5 8.5M15 7L13.5 8.5"
            stroke="#f59e0b"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
          {/* Tiger Eyes */}
          <circle cx="9" cy="12" r="1.25" fill="#fef08a" />
          <circle cx="15" cy="12" r="1.25" fill="#fef08a" />
          {/* Tiger Nose & Whiskers */}
          <path
            d="M12 13.5L10.5 15.5H13.5L12 13.5Z"
            fill="#ea580c"
          />
          <path
            d="M12 15.5V17.5M8 16H6M16 16H18M8.5 18L6.5 19M15.5 18L17.5 19"
            stroke="#fb923c"
            strokeWidth="1.2"
            strokeLinecap="round"
          />
          <defs>
            <linearGradient id="tiger-gold-grad" x1="4" y1="2" x2="20" y2="22" gradientUnits="userSpaceOnUse">
              <stop stopColor="#fbbf24" />
              <stop offset="0.5" stopColor="#f97316" />
              <stop offset="1" stopColor="#ea580c" />
            </linearGradient>
          </defs>
        </svg>
      </div>

      {showText && (
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-wider text-white text-lg leading-none font-sans">
              SUMA
            </span>
          </div>
          <span className="text-[10px] tracking-widest font-semibold text-amber-500/90 uppercase leading-tight">
            Crypto Platform
          </span>
        </div>
      )}
    </div>
  );
}

