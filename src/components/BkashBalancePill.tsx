import React, { useState, useEffect, useRef } from 'react';
import { Eye, EyeOff, Coins, Sparkles, ChevronRight, Lock } from 'lucide-react';
import { Language } from '../types';

interface BkashBalancePillProps {
  balanceBDT: number;
  balanceUSD: number;
  language: Language;
  darkMode?: boolean;
  label?: string;
  className?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  onTap?: () => void;
}

export const BkashBalancePill: React.FC<BkashBalancePillProps> = ({
  balanceBDT,
  balanceUSD,
  language,
  darkMode = false,
  label,
  className = '',
  size = 'sm',
  onTap
}) => {
  const isBn = language === 'bn';
  const [isRevealed, setIsRevealed] = useState<boolean>(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Play a gentle haptic sound using Web Audio API
  const playHapticAudio = () => {
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        const ctx = new AudioContextClass();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(isRevealed ? 440 : 880, ctx.currentTime);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.12);
      }
    } catch {
      // Audio autoplay policy fallback
    }
  };

  const clearTimers = () => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    playHapticAudio();
    if (onTap) onTap();

    if (isRevealed) {
      // Manual hide
      setIsRevealed(false);
      clearTimers();
    } else {
      // Reveal balance and begin auto-hide without showing seconds
      setIsRevealed(true);
      clearTimers();

      // 12 seconds auto-hide timeout
      timerRef.current = setTimeout(() => {
        setIsRevealed(false);
        clearTimers();
      }, 12000);
    }
  };

  useEffect(() => {
    return () => {
      clearTimers();
    };
  }, []);

  // Compact size styling
  const sizeClasses = {
    xs: 'h-7 px-2 text-[11px]',
    sm: 'h-7.5 sm:h-8 px-2 sm:px-2.5 text-xs',
    md: 'h-8.5 px-3 text-xs sm:text-sm',
    lg: 'h-10 px-3.5 text-sm'
  }[size];

  return (
    <button
      type="button"
      id="bkash-style-balance-pill"
      onClick={handleToggle}
      title={isRevealed ? (isBn ? 'লুকিয়ে রাখতে ট্যাপ করুন' : 'Tap to hide') : (isBn ? 'ব্যালেন্স দেখতে ট্যাপ করুন' : 'Tap to view balance')}
      className={`group relative inline-flex items-center gap-1.5 rounded-full font-bold transition-all duration-200 select-none cursor-pointer overflow-hidden shadow-2xs active:scale-95 border ${
        darkMode 
          ? 'bg-slate-900/90 hover:bg-slate-850 border-emerald-500/40 text-white' 
          : 'bg-white hover:bg-emerald-50/60 border-emerald-300/90 text-slate-900'
      } ${sizeClasses} ${className}`}
    >
      {/* bKash Icon Circle */}
      <div className={`w-4.5 h-4.5 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shrink-0 transition-transform duration-200 ${
        isRevealed 
          ? 'bg-emerald-600 text-white' 
          : 'bg-gradient-to-tr from-pink-600 to-emerald-600 text-white group-hover:scale-105'
      }`}>
        {isRevealed ? (
          <span className="text-[10px] font-black leading-none">৳</span>
        ) : (
          <Coins className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" />
        )}
      </div>

      {/* Content State: Hidden vs Revealed (Compact, no seconds display) */}
      <div className="flex items-center gap-1">
        {!isRevealed ? (
          <div className="flex items-center gap-1">
            <span className="text-emerald-700 dark:text-emerald-400 font-black tracking-tight whitespace-nowrap text-[11px] sm:text-xs">
              {label || (isBn ? 'ব্যালেন্স' : 'Balance')}
            </span>
            <span className="text-[9px] opacity-40 font-mono tracking-widest">•••</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 animate-in fade-in duration-150">
            <span className="font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-[11px] sm:text-xs">
              ৳{(balanceBDT ?? 0).toFixed(2)}
            </span>
            <span className="hidden md:inline text-[10px] text-slate-400 font-medium">
              (${(balanceUSD ?? 0).toFixed(2)})
            </span>
          </div>
        )}
      </div>

      {/* Eye indicator icon */}
      <div className="text-slate-400 group-hover:text-emerald-600 transition-colors shrink-0 ml-0.5">
        {isRevealed ? (
          <EyeOff className="w-3 h-3 text-emerald-600" />
        ) : (
          <Eye className="w-3 h-3" />
        )}
      </div>
    </button>
  );
};
