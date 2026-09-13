import React, { useState } from 'react';
import { 
  ArrowLeft, 
  PauseCircle, 
  PlayCircle, 
  DollarSign, 
  Calendar, 
  Info, 
  Eye, 
  TrendingUp, 
  CreditCard, 
  Sliders, 
  CheckCircle2,
  Sparkles,
  Zap,
  Clock,
  AlertCircle,
  Plus,
  Minus,
  Check,
  Crown,
  Wallet
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Job, Language, Currency, UserProfile } from '../types';

interface ManageBoostPageProps {
  job: Job;
  user: UserProfile;
  language: Language;
  currency: Currency;
  darkMode: boolean;
  onBack: () => void;
  onUpdateBoost: (
    jobId: string, 
    isActive: boolean, 
    dailyBudgetUSD: number, 
    mode: 'daily' | 'overall',
    durationDays?: number
  ) => void;
  onOpenDeposit?: () => void;
}

export const ManageBoostPage: React.FC<ManageBoostPageProps> = ({
  job,
  user,
  language,
  currency,
  darkMode,
  onBack,
  onUpdateBoost,
  onOpenDeposit
}) => {
  const isBn = language === 'bn';
  const initialIsActive = job.boost?.isActive ?? false;
  const initialBudget = Math.max(0.20, job.boost?.dailyBudgetUSD ?? 0.20);
  const initialMode = job.boost?.mode ?? 'daily';
  const initialDays = job.boost?.durationDays || job.boost?.daysRemaining || 1;

  const [isActive, setIsActive] = useState<boolean>(initialIsActive);
  const [budgetMode, setBudgetMode] = useState<'daily' | 'overall'>(initialMode);
  const [dailyBudget, setDailyBudget] = useState<number>(initialBudget);
  const [selectedDays, setSelectedDays] = useState<number>(initialDays);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  // Minimum boost daily budget is strictly $0.20 (20 cents)
  const isBudgetValid = dailyBudget >= 0.20;
  
  // Specific day options: 1 Day, 2 Days, 3 Days, 4 Days, 5 Days, 7 Days, 15 Days, 30 Days
  const dayOptions = [1, 2, 3, 4, 5, 7, 15, 30];
  
  // Quick budget presets
  const budgetPresets = [0.20, 0.35, 0.50, 0.75, 1.00, 2.00, 5.00];

  const totalCostUSD = +(dailyBudget * selectedDays).toFixed(2);
  const totalCostFormatted = totalCostUSD.toFixed(2);
  const totalCostBDT = Math.round(totalCostUSD * 100);

  const hasSufficientBalance = (user.depositBalanceUSD ?? 0) >= totalCostUSD;

  const targetEndDate = new Date(Date.now() + selectedDays * 86400000);
  const expiryDateString = targetEndDate.toLocaleDateString(isBn ? 'bn-BD' : 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const handleSave = () => {
    if (!isBudgetValid) return;
    setIsSaving(true);
    setTimeout(() => {
      onUpdateBoost(job.id, true, dailyBudget, budgetMode, selectedDays);
      setIsActive(true);
      setIsSaving(false);
      setShowSuccessToast(true);
      try {
        confetti({ particleCount: 75, spread: 65, origin: { y: 0.75 } });
      } catch (e) {}
      setTimeout(() => setShowSuccessToast(false), 3500);
    }, 350);
  };

  const handleToggleStatus = () => {
    const nextState = !isActive;
    setIsActive(nextState);
    onUpdateBoost(job.id, nextState, dailyBudget, budgetMode, selectedDays);
  };

  const handleDayChange = (days: number) => {
    const clamped = Math.max(1, Math.min(90, days));
    setSelectedDays(clamped);
  };

  const handleAdjustBudget = (delta: number) => {
    const next = +(Math.max(0.20, dailyBudget + delta)).toFixed(2);
    setDailyBudget(next);
  };

  return (
    <div className="max-w-xl mx-auto pb-32 animate-in fade-in duration-200">
      
      {/* Top Header */}
      <div className="flex items-center gap-3 py-3 mb-3">
        <button
          onClick={onBack}
          className={`p-2 rounded-xl border transition cursor-pointer ${
            darkMode ? 'bg-slate-800/80 border-slate-700 text-white hover:bg-slate-700' : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-100'
          }`}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>{isBn ? 'জব বুস্ট ব্যবস্থাপনা' : 'Manage Job Boost'}</span>
            <span className="text-xs px-2 py-0.5 rounded-md bg-amber-500/15 text-amber-600 dark:text-amber-400 font-extrabold border border-amber-500/30 flex items-center gap-1">
              <Crown className="w-3 h-3" />
              VIP BOOST
            </span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1">
            {isBn ? job.titleBn : job.title}
          </p>
        </div>
      </div>

      {showSuccessToast && (
        <div className="mb-4 p-4 rounded-2xl bg-emerald-600 text-white flex items-center gap-3 shadow-lg shadow-emerald-600/30 animate-in slide-in-from-top-2">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <div>
            <p className="text-xs font-black">
              {isBn ? 'বুস্ট সফলভাবে সক্রিয় হয়েছে!' : 'Boost successfully activated!'}
            </p>
            <p className="text-[11px] text-emerald-100 mt-0.5">
              {isBn 
                ? `${selectedDays} দিনের জন্য প্রতিদিন $${dailyBudget.toFixed(2)} (৳${(dailyBudget*100).toFixed(0)}) হারে চালু হয়েছে। মার্কেটপ্লেসের সবার শীর্ষে শো করবে।` 
                : `Active for ${selectedDays} days at $${dailyBudget.toFixed(2)}/day. Promoted to top of marketplace.`}
            </p>
          </div>
        </div>
      )}

      {/* Boost Status Banner */}
      <div className={`p-4 sm:p-5 rounded-3xl border mb-4 flex items-center justify-between ${
        isActive 
          ? (darkMode ? 'bg-gradient-to-r from-amber-950/40 via-yellow-950/20 to-amber-900/30 border-amber-500/50' : 'bg-gradient-to-r from-amber-50 via-yellow-50 to-amber-100/60 border-amber-300 shadow-sm')
          : (darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200 shadow-xs')
      }`}>
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${
            isActive ? 'bg-gradient-to-tr from-amber-500 to-orange-500 text-white' : 'bg-slate-200 dark:bg-slate-800 text-slate-400'
          }`}>
            {isActive ? <Zap className="w-6 h-6 fill-white animate-pulse" /> : <PauseCircle className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className={`font-black text-base ${
                isActive ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-300'
              }`}>
                {isActive 
                  ? (isBn ? '🔥 বুস্ট সক্রিয় আছে (VIP Boosted)' : '🔥 VIP Boost Active')
                  : (isBn ? 'বুস্ট নিষ্ক্রিয় আছে' : 'Boost Inactive / Paused')}
              </h2>
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide ${
                isActive ? 'bg-amber-500 text-slate-950' : 'bg-slate-300 dark:bg-slate-700 text-slate-700 dark:text-slate-300'
              }`}>
                {isActive ? 'ACTIVE' : 'INACTIVE'}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              {isActive 
                ? (isBn ? `আপনার জবটি তালিকার সবার উপরে বিশেষ হাইলাইটে দেখানো হচ্ছে (${selectedDays} দিন বাকি)` : `Job is receiving #1 priority ranking on marketplace (${selectedDays}d remaining)`)
                : (isBn ? 'দিন ও বাজেট নির্ধারণ করে বুস্ট চালু করুন' : 'Choose days and rate below to launch boost')}
            </p>
          </div>
        </div>

        {isActive && (
          <button
            onClick={handleToggleStatus}
            className={`px-3 py-1.5 rounded-xl font-bold text-xs border transition cursor-pointer shrink-0 ${
              darkMode ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-100'
            }`}
          >
            {isBn ? 'পজ করুন' : 'Pause'}
          </button>
        )}
      </div>

      {/* Wallet Balance Info */}
      <div className={`p-3.5 rounded-2xl border mb-4 flex items-center justify-between text-xs ${
        darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-emerald-50/60 border-emerald-200'
      }`}>
        <div className="flex items-center gap-2">
          <Wallet className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          <span className="text-slate-600 dark:text-slate-300">
            {isBn ? 'আপনার ডিপোজিট ব্যালেন্স:' : 'Your Deposit Balance:'}
          </span>
          <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
            ${(user.depositBalanceUSD ?? 0).toFixed(2)} USD (৳{(user.depositBalanceBDT ?? 0).toFixed(0)})
          </span>
        </div>
        {onOpenDeposit && (
          <button
            onClick={onOpenDeposit}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
          >
            {isBn ? '+ ডিপোজিট করুন' : '+ Add Funds'}
          </button>
        )}
      </div>

      {/* Row with Current Daily Budget & Expiry Date Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className={`p-4 rounded-2xl border ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-1">
            <DollarSign className="w-4 h-4" />
            <span>{isBn ? 'দৈনিক বুস্ট বাজেট (Daily Rate)' : 'Daily Boost Rate'}</span>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white">
            ${dailyBudget.toFixed(2)} <span className="text-xs font-normal text-slate-400">USD / দিন</span>
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            ৳ {(dailyBudget * 100).toFixed(0)} BDT / দিন
          </p>
        </div>

        <div className={`p-4 rounded-2xl border ${
          darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 text-xs font-bold mb-1">
            <Calendar className="w-4 h-4" />
            <span>{isBn ? 'বুস্টের সময়কাল ও মেয়াদ' : 'Boost Expiry Date'}</span>
          </div>
          <p className="text-xl font-black text-slate-900 dark:text-white">
            {expiryDateString}
          </p>
          <p className="text-[11px] text-indigo-500 dark:text-indigo-400 font-semibold mt-0.5 flex items-center gap-1">
            <Clock className="w-3 h-3" />
            <span>{selectedDays} {isBn ? 'দিন নির্বাচিত' : 'days selected'}</span>
          </p>
        </div>
      </div>

      {/* SECTION 1: DURATION SELECTION (1 day, 2 day, 3 day, 4 day, 5 day, etc.) */}
      <div className={`p-5 rounded-3xl border mb-4 space-y-4 ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 flex items-center justify-center font-black text-xs">
              ১
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isBn ? 'বুস্টের সময়কাল নির্বাচন (Days Selection)' : 'Select Boost Duration'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBn ? '১ দিন, ২ দিন, ৩ দিন, ৪ দিন, ৫ দিন বা তার বেশি দিন বেছে নিন' : 'Choose 1 day, 2 days, 3 days, 4 days, 5 days or more'}
              </p>
            </div>
          </div>
          <span className="px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 text-xs font-extrabold border border-indigo-200 dark:border-indigo-800">
            {selectedDays} {isBn ? 'দিন' : 'Days'}
          </span>
        </div>

        {/* 1 day, 2 day, 3 day, 4 day, 5 day chips */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
          {dayOptions.map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setSelectedDays(d)}
              className={`py-2.5 px-1.5 rounded-2xl text-xs font-black border transition flex flex-col items-center justify-center gap-0.5 cursor-pointer ${
                selectedDays === d
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm shadow-indigo-600/30 ring-2 ring-indigo-400/40'
                  : (darkMode 
                      ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white' 
                      : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100 hover:border-slate-300')
              }`}
            >
              <span className="text-sm font-black">{d}</span>
              <span className="text-[10px] font-medium opacity-80">{isBn ? 'দিন' : 'Day'}</span>
            </button>
          ))}
        </div>

        {/* Custom Days Input & Stepper */}
        <div className={`p-3.5 rounded-2xl border flex items-center justify-between gap-3 ${
          darkMode ? 'bg-slate-800/60 border-slate-700' : 'bg-slate-50 border-slate-200'
        }`}>
          <div className="text-xs">
            <span className="font-bold text-slate-700 dark:text-slate-200 block">
              {isBn ? 'নির্দিষ্ট দিন বাড়ান / কমান:' : 'Custom Days Adjust:'}
            </span>
            <span className="text-[11px] text-slate-400">
              {isBn ? '১ থেকে ৯০ দিন পর্যন্ত' : '1 to 90 days'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleDayChange(selectedDays - 1)}
              disabled={selectedDays <= 1}
              className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <div className="relative">
              <input
                type="number"
                min="1"
                max="90"
                value={selectedDays}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val)) handleDayChange(val);
                }}
                className={`w-16 text-center py-1.5 px-2 rounded-xl border font-black text-sm transition outline-hidden ${
                  darkMode 
                    ? 'bg-slate-900 border-slate-700 text-white focus:border-indigo-500' 
                    : 'bg-white border-slate-300 text-slate-900 focus:border-indigo-600'
                }`}
              />
            </div>
            <button
              type="button"
              onClick={() => handleDayChange(selectedDays + 1)}
              disabled={selectedDays >= 90}
              className="w-8 h-8 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-white flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-600 disabled:opacity-40 cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* SECTION 2: DAILY BUDGET / TAKA BARANUR OPTION */}
      <div className={`p-5 rounded-3xl border mb-4 space-y-4 ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-emerald-100 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-black text-xs">
              ২
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isBn ? 'টাকা নির্ধারণ ও বাড়ানোর অপশন (Min $0.20)' : 'Budget Rate & Increase Options (Min $0.20)'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBn ? 'ন্যূনতম ২০ সেন্ট ($0.20 = ৳২০)। যত বেশি রেট, তত বেশি অগ্রাধিকার।' : 'Minimum rate is $0.20 (20 cents = ৳20). Higher rate gets more impressions.'}
              </p>
            </div>
          </div>
          <span className={`text-xs font-black px-2.5 py-1 rounded-full border ${
            isBudgetValid 
              ? 'bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800'
              : 'bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 border-rose-200 dark:border-rose-800 animate-pulse'
          }`}>
            {isBn ? 'মিনিমাম: $0.20' : 'Min: $0.20'}
          </span>
        </div>

        {/* Amount Input with Stepper */}
        <div className="space-y-2">
          <div className="relative flex items-center">
            <span className="absolute left-4 text-xl font-black text-slate-400 pointer-events-none">
              $
            </span>
            <input
              type="number"
              min="0.20"
              max="10.00"
              step="0.05"
              value={dailyBudget}
              onChange={(e) => {
                const val = parseFloat(e.target.value);
                if (!isNaN(val)) setDailyBudget(val);
                else setDailyBudget(0);
              }}
              className={`w-full pl-9 pr-28 py-3.5 rounded-2xl border text-xl font-black transition outline-hidden ${
                !isBudgetValid
                  ? 'border-rose-500 bg-rose-50/20 text-rose-600 dark:text-rose-400'
                  : darkMode 
                    ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' 
                    : 'bg-slate-50 border-slate-300 text-slate-900 focus:border-emerald-600'
              }`}
            />
            <div className="absolute right-3 text-right pointer-events-none">
              <span className="text-xs font-black text-emerald-600 dark:text-emerald-400 block">
                ৳ {(dailyBudget * 100).toFixed(0)} BDT
              </span>
              <span className="text-[10px] text-slate-400">
                {isBn ? '/ প্রতিদিন' : '/ day'}
              </span>
            </div>
          </div>

          {!isBudgetValid && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 text-xs font-bold flex items-center gap-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>
                {isBn 
                  ? 'সতর্কতা: বুস্টের জন্য ন্যূনতম দৈনিক বাজেট $0.20 (২০ সেন্ট / ২০ টাকা) হতে হবে।' 
                  : 'Minimum boost rate is $0.20 (20 cents). Please increase the amount.'}
              </span>
            </div>
          )}
        </div>

        {/* Quick Taka Baranur (+ / -) Buttons */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between text-xs">
            <span className="font-bold text-slate-600 dark:text-slate-300">
              {isBn ? 'টাকা দ্রুত বাড়ানোর অপশন:' : 'Quick Increase Buttons:'}
            </span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => handleAdjustBudget(0.10)}
                className="px-2.5 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 font-extrabold text-xs hover:bg-emerald-100 transition cursor-pointer"
              >
                + $0.10 (৳১০)
              </button>
              <button
                type="button"
                onClick={() => handleAdjustBudget(0.50)}
                className="px-2.5 py-1 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800 font-extrabold text-xs hover:bg-amber-100 transition cursor-pointer"
              >
                + $0.50 (৳৫০)
              </button>
              <button
                type="button"
                onClick={() => handleAdjustBudget(1.00)}
                className="px-2.5 py-1 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-800 font-extrabold text-xs hover:bg-purple-100 transition cursor-pointer"
              >
                + $1.00 (৳১০০)
              </button>
            </div>
          </div>

          {/* Slider for interactive adjustments */}
          <div>
            <input
              type="range"
              min="0.20"
              max="5.00"
              step="0.05"
              value={dailyBudget < 0.20 ? 0.20 : dailyBudget}
              onChange={(e) => setDailyBudget(parseFloat(e.target.value))}
              className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold px-0.5 mt-1">
              <span>$0.20 (Min ৳20)</span>
              <span>$1.00 (৳100)</span>
              <span>$2.50 (৳250)</span>
              <span>$5.00 (৳500)</span>
            </div>
          </div>

          {/* Preset Buttons */}
          <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5 pt-1">
            {budgetPresets.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setDailyBudget(amt)}
                className={`py-1.5 px-2 rounded-xl text-xs font-black border transition cursor-pointer ${
                  dailyBudget === amt
                    ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                    : (darkMode 
                        ? 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700' 
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:bg-slate-200')
                }`}
              >
                ${amt.toFixed(2)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* SECTION 3: SUBMIT OPTION WITH TOTAL CALCULATION */}
      <div className={`p-5 rounded-3xl border mb-5 space-y-4 shadow-sm ${
        darkMode ? 'bg-gradient-to-b from-slate-900 to-slate-950 border-slate-800' : 'bg-gradient-to-b from-white to-slate-50 border-slate-200'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-teal-100 dark:bg-teal-950/70 text-teal-600 dark:text-teal-400 flex items-center justify-center font-black text-xs">
              ৩
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {isBn ? 'বাজেট হিসাব ও নিশ্চিতকরণ' : 'Budget Summary & Confirmation'}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                {isBn ? 'নির্বাচিত মেয়াদের মোট খরচের বিবরণ' : 'Total cost breakdown for your chosen days'}
              </p>
            </div>
          </div>
          <span className="text-[11px] font-bold text-slate-400">
            $1 = 100 BDT
          </span>
        </div>

        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">{isBn ? 'দৈনিক রেট:' : 'Daily Boost Rate:'}</span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              ${dailyBudget.toFixed(2)} USD (৳{(dailyBudget * 100).toFixed(0)} BDT)
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">{isBn ? 'বুস্টের সময়কাল:' : 'Boost Duration:'}</span>
            <span className="font-extrabold text-indigo-600 dark:text-indigo-400">
              {selectedDays} {isBn ? 'দিন' : 'Days'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500 dark:text-slate-400">{isBn ? 'মেয়াদ শেষ হবে:' : 'Valid Until:'}</span>
            <span className="font-extrabold text-slate-900 dark:text-white">
              {expiryDateString}
            </span>
          </div>
          
          <div className="border-t border-slate-200 dark:border-slate-800 pt-2.5 flex justify-between items-center text-sm">
            <span className="font-black text-slate-900 dark:text-white">
              {isBn ? 'মোট খরচ (Total Cost):' : 'Total Boost Cost:'}
            </span>
            <div className="text-right">
              <span className="font-black text-lg text-emerald-600 dark:text-emerald-400 block">
                ${totalCostFormatted} USD
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                ৳ {totalCostBDT} BDT
              </span>
            </div>
          </div>
        </div>

        {/* Insufficient Deposit Warning */}
        {!hasSufficientBalance && (
          <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-amber-700 dark:text-amber-300 font-semibold">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-500" />
              <span>
                {isBn ? `ব্যালেন্স অপর্যাপ্ত। আপনার ব্যালেন্স: $${(user.depositBalanceUSD || 0).toFixed(2)}` : `Insufficient balance. Available: $${(user.depositBalanceUSD || 0).toFixed(2)}`}
              </span>
            </div>
            {onOpenDeposit && (
              <button
                onClick={onOpenDeposit}
                className="px-3 py-1 rounded-xl bg-amber-500 text-slate-950 font-bold text-[11px] shrink-0 hover:bg-amber-600 cursor-pointer"
              >
                {isBn ? 'রিচার্জ করুন' : 'Deposit'}
              </button>
            )}
          </div>
        )}

        <div className="pt-2">
          <button
            id="submit-boost-main-btn"
            type="button"
            onClick={handleSave}
            disabled={isSaving || !isBudgetValid}
            className={`w-full py-4 px-6 rounded-2xl font-black text-sm shadow-md transition flex items-center justify-center gap-2.5 cursor-pointer ${
              !isBudgetValid
                ? 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-300 dark:border-slate-700'
                : 'bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 active:scale-[0.99] text-slate-950 shadow-amber-500/25'
            }`}
          >
            <Zap className="w-5 h-5 fill-slate-950 shrink-0" />
            <span>
              {isSaving ? (
                isBn ? 'প্রক্রিয়াকরণ হচ্ছে...' : 'Processing Boost...'
              ) : !isBudgetValid ? (
                isBn ? 'সর্বনিম্ন $0.20 দৈনিক বাজেট প্রয়োজন' : 'Minimum $0.20 Rate Required'
              ) : isActive ? (
                isBn 
                  ? `বাজেট আপডেট করুন ($${totalCostFormatted} / ৳${totalCostBDT})` 
                  : `Update Boost Settings ($${totalCostFormatted})`
              ) : (
                isBn 
                  ? `বুস্ট চালু করুন (${selectedDays} দিন - $${totalCostFormatted} / ৳${totalCostBDT})` 
                  : `Submit & Activate Boost (${selectedDays} Days - $${totalCostFormatted})`
              )}
            </span>
          </button>
          
          <p className="text-[11px] text-center text-slate-400 mt-2">
            {isBn 
              ? 'বুস্টের ফি আপনার ডিপোজিট ব্যালেন্স থেকে কাটা হবে ও ক্যাম্পেইনটি ১ নম্বর স্থানে যাবে।' 
              : 'Boost fees are deducted from your deposit balance and job ranks #1 instantly.'}
          </p>
        </div>
      </div>

    </div>
  );
};
