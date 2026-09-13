import React from 'react';
import { 
  Wallet, 
  Clock, 
  TrendingUp, 
  Briefcase, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  FileText, 
  ArrowRight, 
  PlusCircle, 
  ShieldCheck, 
  Gift, 
  Users,
  Search,
  ChevronRight
} from 'lucide-react';
import { UserProfile, Language, Currency, TaskSubmission, Job } from '../types';

interface FreelancerDashboardViewProps {
  user: UserProfile;
  language: Language;
  currency: Currency;
  submissions: TaskSubmission[];
  availableJobsCount: number;
  onBrowseJobs: () => void;
  onViewStatement: () => void;
  onWithdraw: () => void;
  onOpenDailyBonus: () => void;
  onOpenKyc: () => void;
  onOpenReferral: () => void;
  onViewMySubmissions: () => void;
  darkMode: boolean;
}

export const FreelancerDashboardView: React.FC<FreelancerDashboardViewProps> = ({
  user,
  language,
  currency,
  submissions,
  availableJobsCount,
  onBrowseJobs,
  onViewStatement,
  onWithdraw,
  onOpenDailyBonus,
  onOpenKyc,
  onOpenReferral,
  onViewMySubmissions,
  darkMode
}) => {
  const isBn = language === 'bn';

  const mySubmissions = submissions.filter(s => s.workerId === user.id);
  const pendingCount = mySubmissions.filter(s => s.status === 'pending').length;
  const approvedCount = mySubmissions.filter(s => s.status === 'approved').length;
  const rejectedCount = mySubmissions.filter(s => s.status === 'rejected').length;

  const pendingAmountUSD = mySubmissions
    .filter(s => s.status === 'pending')
    .reduce((acc, s) => acc + (s.earnedUSD ?? 0), 0);

  const totalEarnedUSD = (user.earningBalanceUSD ?? 0) + mySubmissions
    .filter(s => s.status === 'approved')
    .reduce((acc, s) => acc + (s.earnedUSD ?? 0), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 py-2 sm:py-4">
      
      {/* Page Title & Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {isBn ? 'ফ্রিল্যান্সার ড্যাশবোর্ড' : 'Freelancer Dashboard'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          {isBn ? 'স্বাগতম! আপনার ব্যালেন্স ও আয়ের সংক্ষিপ্ত বিবরণ' : "Welcome back! Here's your overview"}
        </p>
      </div>

      {/* SECTION 1: Earnings */}
      <section className="space-y-3">
        
        {/* Earnings Header + Action Buttons */}
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isBn ? 'উপার্জন (Earnings)' : 'Earnings'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              id="freelancer-view-statement-btn"
              onClick={onViewStatement}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition cursor-pointer ${
                darkMode 
                  ? 'border-slate-700 text-slate-300 hover:bg-slate-800' 
                  : 'border-slate-200 text-slate-700 hover:bg-slate-50 bg-white'
              }`}
            >
              {isBn ? 'স্টেটমেন্ট' : 'View Statement'}
            </button>
            <button
              id="freelancer-withdraw-btn"
              onClick={onWithdraw}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <span>{isBn ? 'উইথড্র করুন' : 'Withdraw'}</span>
            </button>
          </div>
        </div>

        {/* 3-column stats card */}
        <div className={`rounded-2xl border overflow-hidden grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x ${
          darkMode 
            ? 'bg-slate-800/90 border-slate-700 divide-slate-700' 
            : 'bg-white border-slate-200 divide-slate-100 shadow-xs'
        }`}>
          
          {/* Column 1: Available Balance */}
          <div className="p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                {isBn ? 'বর্তমান ব্যালেন্স' : 'Available Balance'}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-emerald-600 mt-0.5">
                ${(user.earningBalanceUSD ?? 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400">৳ {(user.earningBalanceBDT ?? 0).toFixed(2)} BDT</p>
            </div>
          </div>

          {/* Column 2: Pending Earnings */}
          <div className="p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 dark:bg-amber-950/60 text-amber-500 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isBn ? 'অপেক্ষমাণ আয়' : 'Pending Earnings'}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-500 dark:text-amber-400 mt-0.5">
                ${(pendingAmountUSD ?? 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400">{pendingCount} {isBn ? 'টি টাস্ক রিভিউতে আছে' : 'tasks under review'}</p>
            </div>
          </div>

          {/* Column 3: Total Earned */}
          <div className="p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">
                {isBn ? 'সর্বমোট আয়' : 'Total Earned'}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-600 dark:text-blue-400 mt-0.5">
                ${(totalEarnedUSD ?? 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400">৳ {((totalEarnedUSD ?? 0) * 100).toFixed(2)} BDT</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: Available Jobs Card */}
      <section>
        <div className={`p-5 rounded-2xl border flex items-center justify-between gap-4 ${
          darkMode ? 'bg-slate-800/90 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
        }`}>
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
              <Briefcase className="w-5 h-5" />
            </div>
            <div>
              <p className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white leading-none">
                {availableJobsCount}
              </p>
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mt-1">
                {isBn ? 'উপলব্ধ মাইক্রো জবস' : 'Available Jobs'}
              </p>
            </div>
          </div>

          <button
            id="freelancer-browse-jobs-btn"
            onClick={onBrowseJobs}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center gap-1.5 shadow-xs transition cursor-pointer"
          >
            <span>{isBn ? 'কাজ খুঁজুন' : 'Browse Jobs'}</span>
          </button>
        </div>
      </section>

      {/* SECTION 3: My Submissions Card */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
            {isBn ? 'আমার জমা দেওয়া কাজসমূহ' : 'My Submissions'}
          </h2>
          <button
            onClick={onViewMySubmissions}
            className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isBn ? 'সম্পূর্ণ তালিকা' : 'View Full List'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className={`rounded-2xl border divide-y overflow-hidden ${
          darkMode 
            ? 'bg-slate-800/90 border-slate-700 divide-slate-700' 
            : 'bg-white border-slate-200 divide-slate-100 shadow-xs'
        }`}>
          
          {/* Row 1: Pending Review */}
          <div 
            onClick={onViewMySubmissions}
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-500 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {isBn ? 'রিভিউ পেন্ডিং' : 'Pending Review'}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-extrabold text-xs">
              {pendingCount}
            </span>
          </div>

          {/* Row 2: Approved */}
          <div 
            onClick={onViewMySubmissions}
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {isBn ? 'অনুমোদিত' : 'Approved'}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 font-extrabold text-xs">
              {approvedCount}
            </span>
          </div>

          {/* Row 3: Rejected */}
          <div 
            onClick={onViewMySubmissions}
            className="p-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-700/40 transition cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-rose-50 dark:bg-rose-950/60 text-rose-500 flex items-center justify-center">
                <XCircle className="w-4 h-4" />
              </div>
              <span className="font-semibold text-sm text-slate-800 dark:text-slate-200">
                {isBn ? 'বাতিল' : 'Rejected'}
              </span>
            </div>
            <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 font-extrabold text-xs">
              {rejectedCount}
            </span>
          </div>

        </div>
      </section>

      {/* Bonus, KYC & Referral Quick Links */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={onOpenDailyBonus}
          className={`p-4 rounded-2xl border text-left transition hover:border-amber-400 cursor-pointer ${
            darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Gift className="w-5 h-5 text-amber-500" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300">
              {isBn ? `দিন ${user.dailyStreak}` : `Day ${user.dailyStreak}`}
            </span>
          </div>
          <p className="font-bold text-xs text-slate-900 dark:text-white">
            {isBn ? 'দৈনিক বোনাস' : 'Daily Streak Bonus'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isBn ? 'প্রতিদিন ফ্রি রিওয়ার্ড নিন' : 'Free daily login cash'}
          </p>
        </button>

        <button
          onClick={onOpenKyc}
          className={`p-4 rounded-2xl border text-left transition hover:border-blue-400 cursor-pointer ${
            darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <ShieldCheck className="w-5 h-5 text-blue-500" />
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
              user.isVerified 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300' 
                : 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300'
            }`}>
              {user.isVerified ? (isBn ? 'ভেরিফাইড' : 'Verified') : (isBn ? 'আনভেরিফাইড' : 'Unverified')}
            </span>
          </div>
          <p className="font-bold text-xs text-slate-900 dark:text-white">
            {isBn ? 'কেওয়াইসি ভেরিফিকেশন' : 'KYC Verification'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isBn ? 'এনআইডি ও ফেস ভেরিফাই' : 'Verify ID for higher limits'}
          </p>
        </button>

        <button
          onClick={onOpenReferral}
          className={`p-4 rounded-2xl border text-left transition hover:border-cyan-400 cursor-pointer ${
            darkMode ? 'bg-slate-800/80 border-slate-700' : 'bg-white border-slate-200 shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between mb-1">
            <Users className="w-5 h-5 text-cyan-500" />
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950/80 text-cyan-800 dark:text-cyan-300">
              5% Lifetime
            </span>
          </div>
          <p className="font-bold text-xs text-slate-900 dark:text-white">
            {isBn ? 'রেফারেল ইনকাম' : 'Referral Earnings'}
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            {isBn ? 'প্রতি কাজে ৫% কমিশন আজীবন' : 'Earn 5% on every friend task'}
          </p>
        </button>
      </section>

    </div>
  );
};
