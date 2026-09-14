import React, { useState } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  Sparkles, 
  Plus, 
  Star, 
  Check, 
  Zap, 
  Crown, 
  UserCheck,
  Award,
  Clock,
  RefreshCw,
  Info
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Language, Currency, getBlueBadgeStatus } from '../types';
import { FacebookVerifiedBadge } from './FacebookVerifiedBadge';

interface BlueBadgePageProps {
  user: UserProfile;
  language: Language;
  currency: Currency;
  onBuyBlueBadge: (plan: 'monthly' | 'yearly', balanceSource: 'deposit' | 'earning', autoRenew: boolean) => void;
  onOpenDeposit: () => void;
  onOpenKyc: () => void;
  onBack: () => void;
}

export const BlueBadgePage: React.FC<BlueBadgePageProps> = ({
  user,
  language,
  currency,
  onBuyBlueBadge,
  onOpenDeposit,
  onOpenKyc,
  onBack
}) => {
  const isBn = language === 'bn';
  const badgeStatus = getBlueBadgeStatus(user);

  const [activeTab, setActiveTab] = useState<'buy' | 'nid'>('buy');
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [balanceSource, setBalanceSource] = useState<'deposit' | 'earning'>('deposit');
  const [autoRenew, setAutoRenew] = useState<boolean>(user.blueAutoRenew ?? true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const depositBDT = user.depositBalanceBDT ?? 0;
  const earningBDT = user.earningBalanceBDT ?? 0;
  
  const planCostBDT = selectedPlan === 'yearly' ? 800 : 50;
  const planCostUSD = planCostBDT / 100;

  const currentSelectedBalance = balanceSource === 'deposit' ? depositBDT : earningBDT;
  const isBalanceSufficient = currentSelectedBalance >= planCostBDT;

  // Expiration and Days Remaining calculation
  const expiresDate = user.blueBadgeExpiresAt ? new Date(user.blueBadgeExpiresAt) : null;
  const daysRemaining = expiresDate ? Math.ceil((expiresDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)) : 0;

  const handlePurchase = () => {
    if (!isBalanceSufficient) return;

    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      onBuyBlueBadge(selectedPlan, balanceSource, autoRenew);
      
      try {
        confetti({
          particleCount: 90,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}

      setSuccessMessage(
        isBn 
          ? `অভিনন্দন! আপনার ${selectedPlan === 'yearly' ? 'বাৎসরিক' : 'মাসিক'} ব্লু ভেরিফাইড ব্যাজ সফলভাবে সক্রিয় হয়েছে।` 
          : `Congratulations! Your ${selectedPlan === 'yearly' ? 'Yearly' : 'Monthly'} Blue Verified Badge is now active.`
      );

      setTimeout(() => {
        setSuccessMessage('');
      }, 3500);
    }, 700);
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 pb-16 animate-in fade-in duration-200">
      
      {/* Top Navigation Bar */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition cursor-pointer p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <ArrowLeft className="w-4 h-4 stroke-[2.5]" />
          <span>{isBn ? 'একাউন্টে ফিরুন' : 'Back to Account'}</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 text-xs font-bold border border-blue-200/60 dark:border-blue-800">
            {isBn ? 'অফিসিয়াল ভেরিফিকেশন' : 'Official Verification'}
          </span>
        </div>
      </div>

      {/* Success Notification Banner */}
      {successMessage && (
        <div className="p-4 rounded-2xl bg-emerald-500 text-white font-bold text-sm sm:text-base flex items-center gap-3 shadow-lg shadow-emerald-500/20 animate-in slide-in-from-top duration-300">
          <CheckCircle2 className="w-6 h-6 shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      {/* Hero Badge Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-indigo-600 to-blue-800 text-white p-6 sm:p-8 shadow-xl shadow-blue-600/15">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          <div className="relative shrink-0">
            <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-2xl">
              <FacebookVerifiedBadge size="xl" className="w-14 h-14 text-white fill-white drop-shadow-md" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-amber-400 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-md uppercase tracking-wider flex items-center gap-0.5">
              <Crown className="w-3 h-3 fill-slate-950" />
              <span>VIP</span>
            </div>
          </div>

          <div className="flex-1 space-y-1.5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-sm">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>{isBn ? 'মেটা-স্টাইল ব্লু ভেরিফাইড ব্যাজ' : 'Meta-Style Blue Verified Badge'}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              {badgeStatus.isActive 
                ? (isBn ? 'আপনার ব্লু ব্যাজ সফলভাবে সক্রিয় আছে' : 'Your Blue Badge is Active & Verified')
                : (isBn ? 'প্রোফাইলে যুক্ত করুন অফিসিয়াল ব্লু টিক' : 'Get Meta-Verified Blue Badge')}
            </h1>
            <p className="text-xs sm:text-sm text-blue-100 max-w-xl font-medium leading-relaxed">
              {badgeStatus.isActive
                ? (isBn ? 'আপনার প্রোফাইলে অফিসিয়াল ব্লু টিক যুক্ত আছে। আপনার ব্যাজটি উপভোগ করুন!' : 'Your profile has the official verified checkmark. Enjoy your blue badge!')
                : (isBn ? 'আপনার নামের পাশে অফিসিয়াল ব্লু ব্যাজ যুক্ত করে ১০০% ট্রাস্ট অর্জন করুন।' : 'Build 100% trust with buyers and clients with an official blue checkmark badge.')}
            </p>
          </div>
        </div>

        {/* Current Active Status & Expiry Indicator */}
        {badgeStatus.isActive && (
          <div className="mt-6 pt-4 border-t border-white/20 flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2 text-emerald-300 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>
                {isBn ? 'ব্লু ব্যাজ স্ট্যাটাস: সচল ও ভেরিফাইড' : 'Blue Badge Status: Active & Verified'}
              </span>
            </div>

            <div className="flex items-center gap-3">
              {user.blueBadgeExpiresAt && (
                <div className="flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-blue-100 font-mono">
                  <Clock className="w-3.5 h-3.5 text-amber-300" />
                  <span>
                    {isBn ? 'মেয়াদ শেষ:' : 'Expires:'} {expiresDate?.toLocaleDateString()} ({daysRemaining} {isBn ? 'দিন বাকি' : 'days left'})
                  </span>
                </div>
              )}
              <span className={`px-2.5 py-1 rounded-full font-bold text-[10px] uppercase ${user.blueAutoRenew ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'}`}>
                {user.blueAutoRenew ? (isBn ? 'অটো-রিনিউ: অন' : 'Auto-Renew: ON') : (isBn ? 'অটো-রিনিউ: অফ' : 'Auto-Renew: OFF')}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Main Tab Selector: Buy Instant Badge vs Free NID */}
      <div className="flex items-center p-1.5 rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
        <button
          type="button"
          onClick={() => setActiveTab('buy')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'buy'
              ? 'bg-white dark:bg-slate-900 text-blue-600 dark:text-blue-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <Zap className="w-4 h-4 text-blue-500 fill-blue-500" />
          <span>{isBn ? (badgeStatus.isActive ? 'ব্যাজ স্ট্যাটাস ও তথ্য' : 'তাৎক্ষণিক কিনুন') : (badgeStatus.isActive ? 'Badge Status & Info' : 'Buy Blue Badge')}</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('nid')}
          className={`flex-1 py-3 px-4 rounded-xl text-xs sm:text-sm font-black transition cursor-pointer flex items-center justify-center gap-2 ${
            activeTab === 'nid'
              ? 'bg-white dark:bg-slate-900 text-emerald-600 dark:text-emerald-400 shadow-md'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? 'এনআইডি দিয়ে ফ্রি ভেরিফিকেশন' : 'Free with NID Card'}</span>
        </button>
      </div>

      {/* TAB 1: BUY WITH WALLET BALANCE OR ALREADY PURCHASED (ENJOY VIEW) */}
      {activeTab === 'buy' && (
        <div className="space-y-6">
          
          {badgeStatus.isActive ? (
            /* IF ALREADY PURCHASED & ACTIVE: DO NOT SHOW PURCHASE OPTIONS, SHOW ENJOY & EXPIRY CARD */
            <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6 text-center animate-in fade-in duration-200">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-blue-50 dark:bg-blue-950/60 border border-blue-200/60 dark:border-blue-800 flex items-center justify-center shadow-xl">
                <FacebookVerifiedBadge size="xl" className="w-12 h-12 text-blue-600 fill-blue-600" />
              </div>

              <div className="space-y-2">
                <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                  {isBn ? '🎉 অভিনন্দন! আপনার ব্লু ভেরিফাইড ব্যাজ সক্রিয় রয়েছে' : '🎉 Congratulations! Your Blue Badge is Active'}
                </h3>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-md mx-auto leading-relaxed font-medium">
                  {isBn 
                    ? 'আপনি ইতিমধ্যে সফলভাবে ব্লু ভেরিফাইড ব্যাজ সাবস্ক্রিপশন সম্পন্ন করেছেন। আপনার প্রোফাইল এখন ১০০% ভেরিফাইড এবং বিশ্বস্ত। আপনার ব্লু ব্যাজ উপভোগ করুন!' 
                    : 'You have already purchased and activated your official Blue Verified Badge. Enjoy your verified status and exclusive platform perks!'}
                </p>
              </div>

              {/* Expiry & Status Card */}
              <div className="max-w-md mx-auto p-4 sm:p-5 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/80 space-y-3 text-left">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{isBn ? 'প্যাকেজ প্রকার:' : 'Plan Type:'}</span>
                  <span className="text-blue-600 dark:text-blue-400 uppercase font-black">
                    {user.blueBadgePlan === 'yearly' ? (isBn ? '১ বছরের ভিআইপি' : '1 Year VIP') : (isBn ? '১ মাসের প্যাকেজ' : '1 Month Plan')}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300">
                  <span>{isBn ? 'মেয়াদ শেষ হবে:' : 'Expires On:'}</span>
                  <span className="font-mono text-slate-900 dark:text-white">
                    {user.blueBadgeExpiresAt ? new Date(user.blueBadgeExpiresAt).toLocaleDateString() : 'N/A'} ({daysRemaining} {isBn ? 'দিন বাকি' : 'days remaining'})
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-300 pt-2 border-t border-blue-200/60 dark:border-blue-800/60">
                  <span>{isBn ? 'অটো-রিনিউয়াল স্ট্যাটাস:' : 'Auto-Renewal:'}</span>
                  <span className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${user.blueAutoRenew ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-slate-950'}`}>
                    {user.blueAutoRenew ? (isBn ? 'অন (চালু)' : 'ON') : (isBn ? 'অফ (বন্ধ)' : 'OFF')}
                  </span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={onBack}
                  className="px-8 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs sm:text-sm transition cursor-pointer shadow-lg shadow-blue-600/20 active:scale-95"
                >
                  {isBn ? 'ব্যাজ উপভোগ করুন (একাউন্টে ফিরুন)' : 'Enjoy Your Badge (Back to Account)'}
                </button>
              </div>
            </div>
          ) : (
            /* IF NOT BOUGHT OR EXPIRED: SHOW PURCHASE FORM */
            <div className="space-y-6">
              
              {/* STEP 1: Plan Selection Cards */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs flex items-center justify-center font-bold">1</span>
                      <span>{isBn ? 'প্যাকেজ বেছে নিন (Select Plan)' : 'Select Subscription Plan'}</span>
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                      {isBn ? 'আপনার সুবিধামতো মাসিক অথবা বাৎসরিক মেয়াদে বেছে নিন' : 'Choose monthly or yearly validity'}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Plan 1: 1 Month (৳50) */}
                  <div
                    onClick={() => setSelectedPlan('monthly')}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition cursor-pointer relative ${
                      selectedPlan === 'monthly'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FacebookVerifiedBadge size="md" />
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {isBn ? '১ মাসের প্যাকেজ' : '1 Month Plan'}
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="plan"
                        checked={selectedPlan === 'monthly'}
                        onChange={() => setSelectedPlan('monthly')}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="mt-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">৳50</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">BDT ($0.50 USD) / {isBn ? 'মাস' : 'month'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {isBn ? '৩০ দিনের জন্য ব্লু টিক সক্রিয় থাকবে' : 'Active for 30 consecutive days'}
                      </p>
                    </div>
                  </div>

                  {/* Plan 2: 1 Year (৳800) */}
                  <div
                    onClick={() => setSelectedPlan('yearly')}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition cursor-pointer relative ${
                      selectedPlan === 'yearly'
                        ? 'border-blue-600 bg-blue-50/50 dark:bg-blue-950/20 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-4 bg-emerald-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full shadow-xs uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>{isBn ? '৳২০০ সেভ (Best Value)' : 'Save ৳200'}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <FacebookVerifiedBadge size="md" />
                        <span className="text-sm font-black text-slate-900 dark:text-white">
                          {isBn ? '১ বছরের ভিআইপি প্যাকেজ' : '1 Year VIP Plan'}
                        </span>
                      </div>
                      <input
                        type="radio"
                        name="plan"
                        checked={selectedPlan === 'yearly'}
                        onChange={() => setSelectedPlan('yearly')}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="mt-3">
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-2xl font-black text-slate-900 dark:text-white font-mono">৳800</span>
                        <span className="text-xs text-slate-500 dark:text-slate-400">BDT ($8.00 USD) / {isBn ? 'বছর' : 'year'}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                        {isBn ? '৩৬৫ দিনের জন্য ব্লু টিক + ভিআইপি ব্যাজ' : 'Active for 365 full days + VIP support'}
                      </p>
                    </div>
                  </div>

                </div>
              </div>

              {/* STEP 2: Balance Source Selection (Deposit vs Earning) */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <div>
                  <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs flex items-center justify-center font-bold">2</span>
                    <span>{isBn ? 'পেমেন্ট ব্যালেন্স উৎস বেছে নিন (Select Balance Source)' : 'Choose Balance Source'}</span>
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {isBn 
                      ? 'আপনি ডিপোজিট ব্যালেন্স অথবা আর্নিং ব্যালেন্স দিয়ে ব্লু ব্যাজ কিনতে পারবেন' 
                      : 'You can buy using your Deposit Balance or Earning Balance'}
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Option A: Deposit Balance */}
                  <div
                    onClick={() => setBalanceSource('deposit')}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      balanceSource === 'deposit'
                        ? 'border-emerald-600 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 flex items-center justify-center font-bold">
                          <Wallet className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                            {isBn ? 'ডিপোজিট ব্যালেন্স' : 'Deposit Balance'}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isBn ? 'রিচার্জকৃত ফান্ড' : 'Funded Balance'}
                          </span>
                        </div>
                      </div>

                      <input
                        type="radio"
                        name="balanceSource"
                        checked={balanceSource === 'deposit'}
                        onChange={() => setBalanceSource('deposit')}
                        className="w-4 h-4 text-emerald-600 cursor-pointer"
                      />
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBn ? 'উপলব্ধ ব্যালেন্স' : 'Available:'}</span>
                        <span className="text-base font-black text-emerald-600 dark:text-emerald-400 font-mono">
                          ৳{depositBDT.toFixed(2)}
                        </span>
                      </div>

                      {depositBDT >= planCostBDT ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>{isBn ? 'পর্যাপ্ত' : 'Sufficient'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          {isBn ? 'অপর্যাপ্ত' : 'Low Funds'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Option B: Earning Balance */}
                  <div
                    onClick={() => setBalanceSource('earning')}
                    className={`p-4 sm:p-5 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between ${
                      balanceSource === 'earning'
                        ? 'border-blue-600 bg-blue-50/40 dark:bg-blue-950/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className="w-9 h-9 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold">
                          <Star className="w-5 h-5" />
                        </div>
                        <div>
                          <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                            {isBn ? 'আর্নিং ব্যালেন্স' : 'Earning Balance'}
                          </span>
                          <span className="text-[11px] text-slate-500 dark:text-slate-400">
                            {isBn ? 'কাজের মাধ্যমে অর্জিত' : 'Work Earnings'}
                          </span>
                        </div>
                      </div>

                      <input
                        type="radio"
                        name="balanceSource"
                        checked={balanceSource === 'earning'}
                        onChange={() => setBalanceSource('earning')}
                        className="w-4 h-4 text-blue-600 cursor-pointer"
                      />
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase font-bold block">{isBn ? 'উপলব্ধ ব্যালেন্স' : 'Available:'}</span>
                        <span className="text-base font-black text-blue-600 dark:text-blue-400 font-mono">
                          ৳{earningBDT.toFixed(2)}
                        </span>
                      </div>

                      {earningBDT >= planCostBDT ? (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                          <span>{isBn ? 'পর্যাপ্ত' : 'Sufficient'}</span>
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2.5 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                          {isBn ? 'অপর্যাপ্ত' : 'Low Funds'}
                        </span>
                      )}
                    </div>
                  </div>

                </div>

                {/* Insufficient balance alert if needed */}
                {!isBalanceSufficient && (
                  <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 space-y-3">
                    <div className="flex items-start gap-2.5 text-amber-800 dark:text-amber-300 text-xs">
                      <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                      <div className="space-y-1">
                        <p className="font-bold">
                          {isBn 
                            ? `আপনার নির্বাচিত ${balanceSource === 'deposit' ? 'ডিপোজিট' : 'আর্নিং'} ব্যালেন্সে অপর্যাপ্ত ফান্ড!` 
                            : `Insufficient funds in selected ${balanceSource === 'deposit' ? 'Deposit' : 'Earning'} Balance!`}
                        </p>
                        <p className="text-amber-700 dark:text-amber-400">
                          {isBn 
                            ? `নির্বাচিত ব্যালেন্সে আছে ৳${currentSelectedBalance.toFixed(2)} (প্রয়োজন ৳${planCostBDT})। আপনি চাইলে অন্য ব্যালেন্স অপশন সিলেক্ট করতে পারেন অথবা নতুন ডিপোজিট করতে পারেন।` 
                            : `Available: ৳${currentSelectedBalance.toFixed(2)} (Required: ৳${planCostBDT}). Select another balance or add funds.`}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {balanceSource === 'deposit' && (
                        <button
                          type="button"
                          onClick={onOpenDeposit}
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs active:scale-95"
                        >
                          <Plus className="w-4 h-4 stroke-[3]" />
                          <span>{isBn ? 'ডিপোজিট করুন' : 'Deposit Funds Now'}</span>
                        </button>
                      )}
                      {balanceSource === 'deposit' && earningBDT >= planCostBDT && (
                        <button
                          type="button"
                          onClick={() => setBalanceSource('earning')}
                          className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <Star className="w-4 h-4" />
                          <span>{isBn ? 'আর্নিং ব্যালেন্স দিয়ে কিনুন' : 'Pay from Earning Balance'}</span>
                        </button>
                      )}
                      {balanceSource === 'earning' && depositBDT >= planCostBDT && (
                        <button
                          type="button"
                          onClick={() => setBalanceSource('deposit')}
                          className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1.5 transition cursor-pointer shadow-xs"
                        >
                          <Wallet className="w-4 h-4" />
                          <span>{isBn ? 'ডিপোজিট ব্যালেন্স দিয়ে কিনুন' : 'Pay from Deposit Balance'}</span>
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: Auto-Renew Toggle & Summary */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h3 className="text-sm sm:text-base font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <span className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-600 text-xs flex items-center justify-center font-bold">3</span>
                  <span>{isBn ? 'অটো-রিনিউয়াল অপশন (Auto-Renewal)' : 'Auto-Renewal Settings'}</span>
                </h3>

                <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-950 text-blue-600 flex items-center justify-center shrink-0">
                      <RefreshCw className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs sm:text-sm font-black text-slate-900 dark:text-white block">
                        {isBn ? 'স্বয়ংক্রিয় রিনিউ (Auto-Renew Subscription)' : 'Auto-Renew Subscription'}
                      </span>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {isBn 
                          ? 'অন থাকলে মেয়াদ শেষের দিনে স্বয়ংক্রিয়ভাবে ওয়ালেট থেকে টাকা কেটে রিনিউ হবে। অফ থাকলে ২৮ বা ২৯ তারিখে নোটিফিকেশন দেওয়া হবে।' 
                          : 'If ON, auto-deducts and renews on expiration. If OFF, you receive a renewal alert 2 days prior.'}
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setAutoRenew(!autoRenew)}
                    className={`w-14 h-8 flex items-center rounded-full p-1 transition cursor-pointer shrink-0 ${
                      autoRenew ? 'bg-blue-600 justify-end' : 'bg-slate-300 dark:bg-slate-700 justify-start'
                    }`}
                  >
                    <div className="bg-white w-6 h-6 rounded-full shadow-md transition-all" />
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300">
                  <span>{isBn ? 'মোট প্রদেয় ফি:' : 'Total Payable Amount:'}</span>
                  <div className="text-right">
                    <span className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-mono">
                      ৳{planCostBDT} BDT
                    </span>
                    <span className="text-xs text-slate-400 block">(${planCostUSD.toFixed(2)} USD)</span>
                  </div>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 flex items-center justify-between text-xs">
                  <span className="text-slate-600 dark:text-slate-400 font-medium">
                    {isBn ? 'কর্তন করা হবে:' : 'Deducted from:'}
                  </span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {balanceSource === 'deposit' 
                      ? (isBn ? 'ডিপোজিট ব্যালেন্স' : 'Deposit Balance') 
                      : (isBn ? 'আর্নিং ব্যালেন্স' : 'Earning Balance')}
                  </span>
                </div>

                <button
                  type="button"
                  disabled={isProcessing || !isBalanceSufficient}
                  onClick={handlePurchase}
                  className="w-full py-3.5 px-6 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm sm:text-base transition cursor-pointer shadow-lg shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isProcessing ? (
                    <span>{isBn ? 'প্রসেসিং হচ্ছে...' : 'Processing...'}</span>
                  ) : (
                    <>
                      <FacebookVerifiedBadge size="md" className="text-white fill-white" />
                      <span>
                        {isBn 
                          ? `৳${planCostBDT} ${balanceSource === 'deposit' ? 'ডিপোজিট' : 'আর্নিং'} ব্যালেন্স দিয়ে ব্লু ব্যাজ সক্রিয় করুন` 
                          : `Pay ৳${planCostBDT} from ${balanceSource === 'deposit' ? 'Deposit' : 'Earning'} Balance & Activate`}
                      </span>
                    </>
                  )}
                </button>
              </div>

              {/* Feature Benefits List */}
              <div className="bg-white dark:bg-slate-900 rounded-3xl p-5 sm:p-6 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
                <h4 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
                  <Award className="w-5 h-5 text-blue-600" />
                  <span>{isBn ? 'ব্লু ভেরিফাইড ব্যাজের বিশেষ সুবিধাসমূহ' : 'Blue Verified Badge Benefits'}</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-700 dark:text-slate-300">
                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">{isBn ? '১০০% অথেনটিক প্রোফাইল' : '100% Authentic Profile'}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">{isBn ? 'ক্লায়েন্ট ও বায়ারদের কাছে সর্বোচ্চ বিশ্বাসযোগ্যতা।' : 'Highest credibility across the marketplace.'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">{isBn ? '৩ গুণ দ্রুত টাস্ক অ্যাপ্রুভাল' : '3X Faster Task Approvals'}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">{isBn ? 'ভেরিফাইড ফ্রিল্যান্সারদের জমা কাজ অগ্রাধিকার পায়।' : 'Submissions get high-priority employer review.'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">{isBn ? 'টপ র‍্যাংকিং ও লিডারবোর্ড বুস্ট' : 'Top Rankings Priority'}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">{isBn ? 'লিডারবোর্ড এবং বায়ার সার্চে আপনার প্রোফাইল আগে দেখাবে।' : 'Stand out on top ranks and worker search.'}</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40">
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">{isBn ? '২৪/৭ ভিআইপি সাপোর্ট' : '24/7 VIP Customer Support'}</span>
                      <span className="text-slate-500 dark:text-slate-400 text-[11px]">{isBn ? 'যেকোনো সমস্যায় সাপোর্ট টিকিটে ফার্স্ট রেসপন্স।' : 'Instant high-priority ticket support response.'}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      )}

      {/* TAB 2: FREE NID VERIFICATION */}
      {activeTab === 'nid' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 sm:p-8 border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 shadow-xs">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white">
                {isBn ? 'জাতীয় পরিচয়পত্র (NID) দিয়ে ফ্রি ব্লু ব্যাজ' : 'Free Verification with National ID (NID)'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                {isBn 
                  ? 'কোনো ফি ছাড়াই আপনার এনআইডি ফ্রন্ট ও ব্যাক ছবি সাবমিট করে ব্লু টিক নিন।' 
                  : 'Submit your NID card front and back photo to get verified for 100% free.'}
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 space-y-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>{isBn ? '১০০% ফ্রি ভেরিফিকেশন সুবিধা' : '100% Free Verification Process'}</span>
            </div>
            <ul className="text-xs text-emerald-900 dark:text-emerald-300 space-y-1.5 list-disc list-inside">
              <li>{isBn ? 'স্মার্ট এনআইডি বা জাতীয় পরিচয়পত্রের স্পষ্ট ছবি লাগবে।' : 'Clear photo of National ID card (Front & Back).'}</li>
              <li>{isBn ? 'অ্যাডমিন ২৪ ঘণ্টার মধ্যে ম্যানুয়ালি যাচাই করে ভেরিফাইড ব্যাজ সক্রিয় করবেন।' : 'Admin manually reviews and approves within 24 hours.'}</li>
              <li>{isBn ? 'আজীবন মেয়াদে ব্লু ব্যাজ চালু থাকবে।' : 'Lifetime verified blue checkmark.'}</li>
            </ul>
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="text-xs text-slate-500">
              <span>{isBn ? 'স্ট্যাটাস:' : 'Status:'} </span>
              <span className="font-bold text-slate-800 dark:text-white">
                {user.kycVerified ? (isBn ? 'ভেরিফাইড' : 'Verified') : (isBn ? 'সাবমিট করা হয়নি' : 'Not Verified')}
              </span>
            </div>

            <button
              type="button"
              onClick={onOpenKyc}
              className="px-6 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm transition cursor-pointer shadow-md shadow-emerald-600/20 flex items-center gap-2 active:scale-95"
            >
              <UserCheck className="w-4 h-4" />
              <span>{isBn ? 'এনআইডি সাবমিট করুন' : 'Submit NID Card'}</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
};
