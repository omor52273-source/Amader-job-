import React, { useState } from 'react';
import { X, Sparkles, Gift, CheckCircle2, Clock } from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language } from '../types';

interface DailyBonusModalProps {
  isOpen: boolean;
  onClose: () => void;
  onClaimBonus: (amountBDT: number) => void;
  language: Language;
  darkMode: boolean;
}

export const DailyBonusModal: React.FC<DailyBonusModalProps> = ({
  isOpen,
  onClose,
  onClaimBonus,
  language,
  darkMode
}) => {
  const isBn = language === 'bn';
  const [claimed, setClaimed] = useState(false);

  if (!isOpen) return null;

  const handleClaim = () => {
    setClaimed(true);
    onClaimBonus(5.00); // 5 BDT daily bonus
    try {
      confetti({ particleCount: 90, spread: 70 });
    } catch (e) {}
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className={`w-full max-w-sm rounded-3xl shadow-2xl border overflow-hidden p-6 text-center space-y-4 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-amber-500 fill-amber-500" />
            <h3 className="font-black text-base">
              {isBn ? 'প্রতিদিনের বোনাস' : 'Daily Check-in Bonus'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-20 h-20 rounded-3xl bg-amber-500 text-white flex items-center justify-center mx-auto shadow-xl shadow-amber-500/30">
          <Gift className="w-10 h-10" />
        </div>

        <div>
          <h4 className="font-black text-xl text-slate-900 dark:text-white">
            {isBn ? '৳৫.০০ টাকা ফ্রি বোনাস!' : '৳5.00 Free Daily Bonus!'}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn 
              ? 'প্রতিদিন লগইন করে ক্লেইম করুন এবং আপনার উপার্জন ব্যালেন্সে যোগ করুন।' 
              : 'Log in daily to collect free reward added directly to your withdrawable earnings.'}
          </p>
        </div>

        {claimed ? (
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-2xl text-emerald-700 dark:text-emerald-300 text-xs font-bold flex items-center justify-center gap-2 animate-in zoom-in-95">
            <CheckCircle2 className="w-4 h-4" />
            <span>{isBn ? 'আজকের বোনাস সফলভাবে গৃহীত হয়েছে!' : 'Bonus claimed! Credited to your wallet.'}</span>
          </div>
        ) : (
          <button
            onClick={handleClaim}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-600/30 transition cursor-pointer flex items-center justify-center gap-2"
          >
            <Sparkles className="w-4 h-4 fill-white" />
            <span>{isBn ? 'এখনই ক্লেইম করুন' : 'Claim ৳5.00 Now'}</span>
          </button>
        )}

        <button
          onClick={onClose}
          className="text-xs font-bold text-slate-400 hover:text-slate-600 transition cursor-pointer"
        >
          {isBn ? 'বন্ধ করুন' : 'Close'}
        </button>
      </div>
    </div>
  );
};
