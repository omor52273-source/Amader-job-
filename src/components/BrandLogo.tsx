import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'icon-only';
  isBn?: boolean;
  className?: string;
  showSubtitle?: boolean;
  variant?: 'light' | 'dark' | 'auto';
  customLogoUrl?: string;
  customSiteName?: string;
  customSiteNameBn?: string;
  customSubtitle?: string;
  customSubtitleBn?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  size = 'md',
  isBn = true,
  className = '',
  showSubtitle = true,
  variant = 'light',
  customLogoUrl,
  customSiteName,
  customSiteNameBn,
  customSubtitle,
  customSubtitleBn
}) => {
  const iconDimensions = {
    sm: 'w-6 h-6 sm:w-7 sm:h-7',
    md: 'w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9',
    lg: 'w-10 h-10 sm:w-11 sm:h-11 md:w-12 md:h-12',
    'icon-only': 'w-8 h-8 sm:w-9 sm:h-9'
  }[size];

  const textClasses = {
    sm: 'text-xs sm:text-sm',
    md: 'text-sm sm:text-base md:text-lg',
    lg: 'text-lg sm:text-xl md:text-2xl',
    'icon-only': 'hidden'
  }[size];

  const subtitleClasses = {
    sm: 'text-[7px]',
    md: 'text-[8px] sm:text-[9px] md:text-[10px]',
    lg: 'text-[10px] sm:text-[11px] md:text-xs',
    'icon-only': 'hidden'
  }[size];

  const titleTextColor = variant === 'dark' 
    ? 'text-white' 
    : 'text-slate-900';

  const subtitleTextColor = variant === 'dark'
    ? 'text-slate-400'
    : 'text-slate-500';

  return (
    <div className={`flex items-center gap-1.5 sm:gap-2.5 select-none ${className}`}>
      {/* Official Emblem or Custom Logo */}
      <div className={`${iconDimensions} relative shrink-0 group`}>
        {customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt="Site Logo"
            className="w-full h-full object-contain rounded-xl drop-shadow-xs"
            onError={(e) => {
              // fallback if custom image fails
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <>
            {/* Glow effect */}
            <div className="absolute -inset-0.5 bg-gradient-to-r from-emerald-500 to-teal-400 rounded-xl blur-[2px] opacity-40 group-hover:opacity-75 transition duration-300" />
            
            {/* SVG Shield / Hex Emblem */}
            <svg
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative w-full h-full drop-shadow-xs"
            >
              <defs>
                <linearGradient id="ajoBgGrad" x1="0" y1="0" x2="44" y2="44" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#059669" />
                  <stop offset="0.5" stopColor="#10B981" />
                  <stop offset="1" stopColor="#0D9488" />
                </linearGradient>
                <linearGradient id="ajoAccentGrad" x1="12" y1="8" x2="32" y2="36" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#F59E0B" />
                  <stop offset="1" stopColor="#FBBF24" />
                </linearGradient>
                <filter id="ajoShadow" x="-2" y="-2" width="48" height="48" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#047857" floodOpacity="0.4" />
                </filter>
              </defs>

              <rect
                x="2"
                y="2"
                width="40"
                height="40"
                rx="12"
                fill="url(#ajoBgGrad)"
                stroke="rgba(255,255,255,0.25)"
                strokeWidth="1.5"
              />

              <path
                d="M12 30L22 11L25 17L17 31H12Z"
                fill="white"
                fillOpacity="0.95"
              />
              <path
                d="M32 30L22 11L26 11L33 26L32 30Z"
                fill="white"
                fillOpacity="0.6"
              />
              <path
                d="M16 23L22 29L33 16L30 14L21 25L17 21L16 23Z"
                fill="url(#ajoAccentGrad)"
                stroke="#FFFFFF"
                strokeWidth="0.75"
              />

              <circle cx="22" cy="9" r="2.2" fill="#FBBF24" stroke="#FFF" strokeWidth="0.75" />
            </svg>
          </>
        )}
      </div>

      {/* Brand Text */}
      {size !== 'icon-only' && (
        <div className="flex flex-col leading-tight min-w-0">
          <span className={`font-black tracking-tight ${titleTextColor} whitespace-nowrap ${textClasses}`}>
            {customSiteName ? (
              customSiteName
            ) : isBn ? (
              <>
                আমাদের <span className="text-emerald-600">জব</span>
              </>
            ) : (
              <>
                Amader <span className="text-emerald-600">Job</span>
              </>
            )}
          </span>
          {showSubtitle && (
            <span className={`font-bold tracking-wider ${subtitleTextColor} mt-0.5 ${subtitleClasses}`}>
              {customSubtitle || (isBn ? 'কাজ • আয় • উন্নতি' : 'Work • Earn • Grow')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
