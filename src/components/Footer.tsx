import React from 'react';
import { 
  ShieldCheck, 
  Phone, 
  Send, 
  CheckCircle2, 
  Trophy, 
  Zap, 
  Clock, 
  ChevronRight,
  ExternalLink,
  Sparkles,
  Lock,
  Headphones
} from 'lucide-react';
import { Language } from '../types';
import { BrandLogo } from './BrandLogo';

interface FooterProps {
  language: Language;
  darkMode?: boolean;
  onOpenPolicies: (tab?: 'terms' | 'privacy' | 'refund' | 'freelancer') => void;
  onOpenDeposit: () => void;
  onOpenWithdraw: () => void;
  onOpenPostJob: () => void;
  onBrowseJobs: () => void;
  onOpenTopRankings?: () => void;
  onOpenSupport?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  language,
  onOpenPolicies,
  onOpenDeposit,
  onOpenWithdraw,
  onOpenPostJob,
  onBrowseJobs,
  onOpenTopRankings,
  onOpenSupport
}) => {
  const isBn = language === 'bn';

  return (
    <footer 
      id="app-main-footer"
      className="mt-14 border-t border-slate-200 bg-white text-slate-700 transition-colors relative z-10"
    >
      {/* 1. Top Trust & Key Features Value Bar */}
      <div className="border-b border-slate-100 bg-gradient-to-b from-slate-50/90 to-slate-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            
            {/* Feature 1: Top Referrer Bonus */}
            <div 
              onClick={onOpenTopRankings}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-amber-100 shadow-xs hover:border-amber-300 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-200 group-hover:scale-105 transition-transform">
                <Trophy className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                    {isBn ? 'সাপ্তাহিক টপ রেফারেল' : 'Weekly Top Referrers'}
                  </p>
                  <span className="text-[9px] font-black px-1.5 py-0.2 rounded-full bg-amber-100 text-amber-700">
                    ৳৮০
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {isBn ? '১ম ৳৮০, ২য় ৳৪০, ৩য় ৳২০ বোনাস' : '1st 80 Tk, 2nd 40 Tk, 3rd 20 Tk'}
                </p>
              </div>
            </div>

            {/* Feature 2: Escrow Protection */}
            <div 
              onClick={() => onOpenPolicies('terms')}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-emerald-100 shadow-xs hover:border-emerald-300 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0 border border-emerald-200 group-hover:scale-105 transition-transform">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {isBn ? '১০০% নিরাপদ এসক্রো পেমেন্ট' : '100% Escrow Protection'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {isBn ? 'কাজের প্রমাণ যাচাইয়ের পর নিশ্চিত পেমেন্ট' : 'Funds released after verification'}
                </p>
              </div>
            </div>

            {/* Feature 3: Fast Mobile Payouts */}
            <div 
              onClick={onOpenWithdraw}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-blue-100 shadow-xs hover:border-blue-300 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0 border border-blue-200 group-hover:scale-105 transition-transform">
                <Zap className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {isBn ? 'বিকাশ ও নগদ তাৎক্ষণিক ক্যাশআউট' : 'Instant bKash & Nagad'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {isBn ? '১$ = ১০০ টাকা ফিক্সড রেট' : '$1 = 100 BDT Fixed Rate'}
                </p>
              </div>
            </div>

            {/* Feature 4: Live Support */}
            <div 
              onClick={onOpenSupport}
              className="flex items-center gap-3.5 p-3 rounded-2xl bg-white border border-purple-100 shadow-xs hover:border-purple-300 transition-all cursor-pointer group"
            >
              <div className="w-11 h-11 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 border border-purple-200 group-hover:scale-105 transition-transform">
                <Clock className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {isBn ? '২৪/৭ সাপোর্ট ও লাইভ টিকিট' : '24/7 Priority Support'}
                </p>
                <p className="text-[11px] text-slate-500 truncate mt-0.5">
                  {isBn ? 'দ্রুত অ্যাডমিন রিপ্লাই ও সমাধান' : 'Fast admin reply & resolution'}
                </p>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* 2. Main Footer Links & Directory */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8 sm:gap-10">
          
          {/* Brand & About Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <BrandLogo size="md" isBn={isBn} variant="light" />
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-extrabold border border-emerald-300">
                OFFICIAL
              </span>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-sm">
              {isBn 
                ? 'আমাদের জব অনলাইন — বাংলাদেশের বিশ্বস্ত ও নির্ভরযোগ্য মাইক্রো-টাস্ক প্ল্যাটফর্ম। ঘরে বসে মোবাইল দিয়ে ছোট ছোট কাজ সম্পন্ন করে সরাসরি বিকাশ, নগদ বা রকেটে আয় করুন।'
                : "Amader Job Online is Bangladesh's leading micro-task platform connecting skilled freelance workers with trusted employers for verified jobs and guaranteed mobile payouts."}
            </p>

            {/* Helpline & Telegram Contact Cards */}
            <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-w-md">
              <a 
                href="tel:+8801331119361" 
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Phone className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    {isBn ? 'হটলাইন নম্বর' : 'Helpline Support'}
                  </span>
                  <span className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition">
                    +880 1331-119361
                  </span>
                </div>
              </a>

              <a 
                href="https://t.me/amaderjob_official" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2.5 p-2.5 rounded-xl bg-slate-50 hover:bg-sky-50 border border-slate-200 hover:border-sky-300 transition group"
              >
                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 group-hover:scale-105 transition">
                  <Send className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-wider">
                    {isBn ? 'টেলিগ্রাম চ্যানেল' : 'Official Telegram'}
                  </span>
                  <span className="font-extrabold text-xs text-slate-900 group-hover:text-sky-700 transition truncate block">
                    @amaderjob_official
                  </span>
                </div>
              </a>
            </div>

            {/* Accepted Gateways */}
            <div className="pt-3">
              <p className="text-[11px] font-extrabold text-slate-700 mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                {isBn ? 'অনুমোদিত পেমেন্ট মেথড (১$ = ১০০ ৳ ফিক্সড রেট):' : 'Supported Payment Methods ($1 = 100 BDT):'}
              </p>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="px-2.5 py-1 rounded-lg bg-pink-50 text-pink-700 border border-pink-200 text-[11px] font-black shadow-2xs">
                  bKash বিকাশ
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-200 text-[11px] font-black shadow-2xs">
                  Nagad নগদ
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-purple-50 text-purple-700 border border-purple-200 text-[11px] font-black shadow-2xs">
                  Rocket রকেট
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200 text-[11px] font-black shadow-2xs">
                  Upay উপায়
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-black shadow-2xs">
                  Binance / USDT
                </span>
              </div>
            </div>
          </div>

          {/* Quick Links Column */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-emerald-600 rounded-full inline-block"></span>
              {isBn ? 'প্রয়োজনীয় লিঙ্ক' : 'Platform Links'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={onBrowseJobs}
                  className="hover:text-emerald-700 text-slate-600 transition cursor-pointer flex items-center gap-1.5 hover:translate-x-1 duration-200 font-medium"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? 'সকল কাজের তালিকা (Jobs)' : 'Browse All Tasks'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenPostJob}
                  className="hover:text-emerald-700 text-slate-600 transition cursor-pointer flex items-center gap-1.5 hover:translate-x-1 duration-200 font-medium"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? 'নতুন কাজ পোস্ট করুন (Post Job)' : 'Post New Job'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenDeposit}
                  className="hover:text-emerald-700 text-slate-600 transition cursor-pointer flex items-center gap-1.5 hover:translate-x-1 duration-200 font-medium"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? 'ডিপোজিট ওয়ালেট (Deposit)' : 'Deposit Wallet'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={onOpenWithdraw}
                  className="hover:text-emerald-700 text-slate-600 transition cursor-pointer flex items-center gap-1.5 hover:translate-x-1 duration-200 font-medium"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? 'উত্তোলন করুন (Withdraw)' : 'Instant Withdraw'}</span>
                </button>
              </li>
              {onOpenTopRankings && (
                <li>
                  <button 
                    onClick={onOpenTopRankings}
                    className="text-amber-700 font-bold hover:text-amber-800 transition cursor-pointer flex items-center gap-1.5 hover:translate-x-1 duration-200"
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isBn ? 'টপ রেফার লিডারবোর্ড (৳৮০ বোনাস)' : 'Top Referrers (80 Tk Bonus)'}</span>
                  </button>
                </li>
              )}
              {onOpenSupport && (
                <li>
                  <button 
                    onClick={onOpenSupport}
                    className="text-emerald-700 font-bold hover:text-emerald-800 transition cursor-pointer flex items-center gap-1.5 hover:translate-x-1 duration-200"
                  >
                    <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isBn ? 'সাপোর্ট টিকিট (Live Support)' : 'Support Tickets'}</span>
                  </button>
                </li>
              )}
            </ul>
          </div>

          {/* Popular Categories */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-blue-600 rounded-full inline-block"></span>
              {isBn ? 'জনপ্রিয় ক্যাটাগরি' : 'Top Categories'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li 
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 cursor-pointer hover:translate-x-1 duration-200 font-medium" 
                onClick={onBrowseJobs}
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span>YouTube Watch & Subscribe</span>
              </li>
              <li 
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 cursor-pointer hover:translate-x-1 duration-200 font-medium" 
                onClick={onBrowseJobs}
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span>Facebook Like, Share & Follow</span>
              </li>
              <li 
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 cursor-pointer hover:translate-x-1 duration-200 font-medium" 
                onClick={onBrowseJobs}
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span>Telegram Channel & Bot Tasks</span>
              </li>
              <li 
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 cursor-pointer hover:translate-x-1 duration-200 font-medium" 
                onClick={onBrowseJobs}
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span>Mobile App Download & Sign Up</span>
              </li>
              <li 
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 cursor-pointer hover:translate-x-1 duration-200 font-medium" 
                onClick={onBrowseJobs}
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span>Google Maps 5-Star Reviews</span>
              </li>
              <li 
                className="flex items-center gap-1.5 text-slate-600 hover:text-emerald-700 cursor-pointer hover:translate-x-1 duration-200 font-medium" 
                onClick={onBrowseJobs}
              >
                <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                <span>Data Entry & Form Submit</span>
              </li>
            </ul>
          </div>

          {/* Legal, Security & Policies */}
          <div className="space-y-3">
            <h4 className="font-extrabold text-xs sm:text-sm uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
              <span className="w-1.5 h-3.5 bg-purple-600 rounded-full inline-block"></span>
              {isBn ? 'পলিসি ও নিরাপত্তা' : 'Trust & Policies'}
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button 
                  onClick={() => onOpenPolicies('terms')}
                  className="hover:text-emerald-700 text-slate-600 transition cursor-pointer flex items-center gap-1.5 hover:translate-x-1 duration-200 font-medium"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? 'ব্যবহারের নীতিমালা (Terms)' : 'Terms of Service'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicies('privacy')}
                  className="hover:text-emerald-700 text-slate-600 transition cursor-pointer flex items-center gap-1.5 hover:translate-x-1 duration-200 font-medium"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? 'গোপনীয়তা নীতি (Privacy Policy)' : 'Privacy Policy'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicies('refund')}
                  className="hover:text-emerald-700 text-slate-600 transition cursor-pointer flex items-center gap-1.5 hover:translate-x-1 duration-200 font-medium"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? 'রিফান্ড ও পেমেন্ট পলিসি' : 'Refund Policy'}</span>
                </button>
              </li>
              <li>
                <button 
                  onClick={() => onOpenPolicies('freelancer')}
                  className="hover:text-emerald-700 text-slate-600 transition cursor-pointer flex items-center gap-1.5 hover:translate-x-1 duration-200 font-medium"
                >
                  <ChevronRight className="w-3.5 h-3.5 text-slate-400" />
                  <span>{isBn ? 'ফ্রিল্যান্সার নির্দেশিকা (Rules)' : 'Freelancer Guidelines'}</span>
                </button>
              </li>
              <li className="pt-1.5">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 border border-emerald-200 text-[11px] font-bold shadow-2xs">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                  {isBn ? 'জাতীয় পরিচয়পত্র (NID) ভেরিফাইড' : 'Govt NID Verified Escrow'}
                </div>
              </li>
            </ul>
          </div>

        </div>
      </div>

      {/* 3. Bottom Copyright & Server Health Status Bar */}
      <div className="border-t border-slate-200 bg-slate-50/90 py-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left text-xs">
          <div>
            <p className="text-slate-800 font-medium">
              © {new Date().getFullYear()} <span className="font-extrabold text-slate-950">আমাদের জব অনলাইন (Amader Job Online)</span>. {isBn ? 'সর্বস্বত্ব সংরক্ষিত।' : 'All rights reserved.'} • Developed by{' '}
              <a 
                href="https://www.facebook.com/share/1FFt1uPbYj/" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-black text-emerald-700 hover:text-emerald-900 underline underline-offset-4 decoration-emerald-500 hover:decoration-emerald-700 transition"
              >
                Rafi Talukder
              </a>
            </p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              {isBn ? 'বাংলাদেশি ফ্রিল্যান্সার ও উদ্যোক্তাদের বিশ্বস্ত ও নিরাপদ প্ল্যাটফর্ম 🇧🇩' : 'The Most Trusted Platform for Bangladeshi Freelancers & Employers 🇧🇩'}
            </p>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <span className="flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300 shadow-2xs">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse"></span>
              {isBn ? 'সার্ভার সচল (৯৯.৯% আপটাইম)' : 'System 99.9% Operational'}
            </span>
            <span className="text-slate-300">|</span>
            <span className="inline-flex items-center gap-1 text-slate-600 font-semibold">
              <Lock className="w-3 h-3 text-emerald-600" />
              256-bit SSL Secure
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
