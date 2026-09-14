import React from 'react';

interface BrandLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'icon-only';
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
    sm: 'w-7 h-7 sm:w-8 sm:h-8',
    md: 'w-8 h-8 sm:w-9 sm:h-9 md:w-10 md:h-10',
    lg: 'w-11 h-11 sm:w-12 sm:h-12 md:w-14 md:h-14',
    xl: 'w-14 h-14 sm:w-16 sm:h-16 md:w-20 md:h-20',
    'icon-only': 'w-9 h-9 sm:w-10 sm:h-10'
  }[size];

  const textClasses = {
    sm: 'text-sm sm:text-base font-black',
    md: 'text-base sm:text-lg md:text-xl font-black',
    lg: 'text-xl sm:text-2xl md:text-3xl font-black',
    xl: 'text-3xl sm:text-4xl md:text-5xl font-black',
    'icon-only': 'hidden'
  }[size];

  const subtitleClasses = {
    sm: 'text-[8px] sm:text-[9px]',
    md: 'text-[9px] sm:text-[10px] md:text-[11px]',
    lg: 'text-[11px] sm:text-xs md:text-sm',
    xl: 'text-xs sm:text-sm md:text-base',
    'icon-only': 'hidden'
  }[size];

  const titleTextColor = variant === 'dark' 
    ? 'text-white' 
    : 'text-slate-900 dark:text-white';

  const subtitleTextColor = variant === 'dark'
    ? 'text-slate-300'
    : 'text-slate-500 dark:text-slate-400';

  return (
    <div className={`flex items-center gap-2 sm:gap-3 select-none ${className}`}>
      {/* Official High-Res Emblem / Badge */}
      <div className={`${iconDimensions} relative shrink-0 group`}>
        {customLogoUrl ? (
          <img
            src={customLogoUrl}
            alt="Amader Job Logo"
            className="w-full h-full object-contain rounded-2xl drop-shadow-xs"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
        ) : (
          <>
            {/* Ambient Glow */}
            <div className="absolute -inset-1 bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-300 rounded-2xl blur-xs opacity-40 group-hover:opacity-80 transition duration-300" />
            
            {/* Vector Badge */}
            <svg
              viewBox="0 0 120 120"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="relative w-full h-full drop-shadow-md transition-transform duration-200 group-hover:scale-105"
            >
              <defs>
                <linearGradient id="ajLogoBg" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#00E599"/>
                  <stop offset="50%" stopColor="#00C47E"/>
                  <stop offset="100%" stopColor="#008E5B"/>
                </linearGradient>
                <linearGradient id="ajLogoGold" x1="45" y1="50" x2="90" y2="90" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFDE43"/>
                  <stop offset="60%" stopColor="#F59E0B"/>
                  <stop offset="100%" stopColor="#D97706"/>
                </linearGradient>
                <radialGradient id="ajLogoHead" cx="60" cy="38" r="10" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#FFF275"/>
                  <stop offset="60%" stopColor="#FBBF24"/>
                  <stop offset="100%" stopColor="#D97706"/>
                </radialGradient>
                <filter id="ajLogoShadow" x="0" y="0" width="120" height="120" filterUnits="userSpaceOnUse">
                  <feDropShadow dx="0" dy="3" stdDeviation="4" floodColor="#005B39" floodOpacity="0.35"/>
                </filter>
              </defs>

              <g filter="url(#ajLogoShadow)">
                <rect x="8" y="8" width="104" height="104" rx="28" fill="url(#ajLogoBg)"/>
                <path d="M12 36C12 21 24 9 40 9H80C96 9 108 21 108 36C108 48 96 56 60 56C24 56 12 48 12 36Z" fill="white" fillOpacity="0.22"/>
              </g>

              {/* Swoosh Orbit Ring */}
              <path d="M22 76C18 64 24 50 40 44C58 37 84 46 95 62C101 71 98 83 88 88C78 93 54 89 36 82L22 76Z" stroke="#72FDC6" strokeWidth="4.5" strokeLinecap="round" fill="none" opacity="0.95"/>
              <path d="M20 74C16 82 25 88 35 91L40 92" stroke="#A7F3D0" strokeWidth="3.5" strokeLinecap="round" fill="none"/>

              {/* White Pen / Worker Figure */}
              <path d="M47 50L60 30L73 50L68 76L52 76L47 50Z" fill="white"/>
              <path d="M52 76L60 88L68 76H52Z" fill="white"/>

              {/* Golden Head */}
              <circle cx="60" cy="30" r="8" fill="url(#ajLogoHead)" stroke="#FFFFFF" strokeWidth="2"/>

              {/* Golden Checkmark */}
              <path d="M44 65L55 76L80 48L88 56L55 88L36 73L44 65Z" fill="url(#ajLogoGold)" stroke="#FFFFFF" strokeWidth="2.2" strokeLinejoin="round"/>
            </svg>
          </>
        )}
      </div>

      {/* Brand Name & Tagline */}
      {size !== 'icon-only' && (
        <div className="flex flex-col leading-none min-w-0">
          <span className={`tracking-tight ${titleTextColor} whitespace-nowrap ${textClasses}`}>
            {customSiteName ? (
              customSiteName
            ) : isBn ? (
              <span className="flex items-center gap-1">
                <span>আমাদের</span>
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent font-black">
                  জব
                </span>
              </span>
            ) : (
              <span className="flex items-center gap-1">
                <span>Amader</span>
                <span className="bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-700 dark:from-emerald-400 dark:to-teal-300 bg-clip-text text-transparent font-black">
                  Job
                </span>
              </span>
            )}
          </span>
          {showSubtitle && (
            <span className={`font-bold tracking-wider ${subtitleTextColor} mt-1 ${subtitleClasses}`}>
              {customSubtitle || (isBn ? 'কাজ • আয় • উন্নতি' : 'Work • Earn • Grow')}
            </span>
          )}
        </div>
      )}
    </div>
  );
};
