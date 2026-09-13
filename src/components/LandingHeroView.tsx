import React, { useState } from 'react';
import { 
  ArrowRight, 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Briefcase, 
  Users, 
  DollarSign, 
  Sparkles, 
  ShieldCheck, 
  TrendingUp, 
  Flame, 
  Zap,
  Globe,
  Clock,
  Layers,
  Award,
  Lock,
  Wallet,
  Star,
  Trophy,
  ChevronDown,
  ChevronUp,
  Youtube,
  Facebook,
  Send,
  Headphones,
  Check
} from 'lucide-react';
import { Language, Currency, Job } from '../types';
import { BrandLogo } from './BrandLogo';

interface LandingHeroViewProps {
  language: Language;
  currency: Currency;
  onStartWorking: () => void;
  onPostJob: () => void;
  onDownloadApk: () => void;
  onExploreJobs: () => void;
  onViewTopRankings?: () => void;
  recentJobs: Job[];
  darkMode?: boolean;
}

export const LandingHeroView: React.FC<LandingHeroViewProps> = ({
  language,
  currency,
  onStartWorking,
  onPostJob,
  onDownloadApk,
  onExploreJobs,
  onViewTopRankings,
  recentJobs
}) => {
  const isBn = language === 'bn';
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const FAQS = [
    {
      qBn: 'আমি কিভাবে কাজ করে টাকা উইথড্র করব?',
      qEn: 'How do I withdraw my earnings?',
      aBn: 'আপনার অ্যাকাউন্টে সর্বনিম্ন ১০০ টাকা উপার্জন হলেই সরাসরি বিকাশ, নগদ বা রকেট নম্বরে ক্যাশআউট করতে পারবেন। টাকা সাধারণত ৫ থেকে ৩০ মিনিটের মধ্যে আপনার ওয়ালেটে চলে যাবে।',
      aEn: 'Once your earning balance reaches ৳100 BDT ($1), request a payout directly to your personal bKash, Nagad, or Rocket account. Processing takes 5 to 30 minutes.'
    },
    {
      qBn: 'কাজের পেমেন্ট কে দেয় এবং কীভাবে নিশ্চিত হব?',
      qEn: 'Who pays for the tasks and is it guaranteed?',
      aBn: 'বায়ার যখন কাজ তৈরি করেন তখন সম্পূর্ণ টাকা আমাদের এসক্রো সিস্টেমে জমা থাকে। আপনি সঠিক প্রুফ দিলেই এসক্রো থেকে নিশ্চিত টাকা সরাসরি আপনার ব্যালেন্সে জমা হয়ে যায়।',
      aEn: 'All task budgets are secured in escrow before publication. Once you submit valid proof, funds are automatically and safely released to your balance.'
    },
    {
      qBn: 'রেফার করে প্রতি রেফারে ৫০৳ বোনাস কিভাবে পাব?',
      qEn: 'How do I earn ৳50 referral bonus?',
      aBn: 'আপনার ইউনিক রেফারেল লিংক বন্ধুদের শেয়ার করুন। তারা সাইনআপ করে প্রথম কাজ সম্পন্ন করলেই আপনার ওয়ালেটে ৫০ টাকা ইনস্ট্যান্ট রেফারেল বোনাস যোগ হবে।',
      aEn: 'Share your personal referral link. When your invited friend completes tasks, ৳50 is instantly credited to your wallet.'
    },
    {
      qBn: 'বায়ার হিসেবে আমি কিভাবে ফেসবুক বা ইউটিউব ক্যাম্পেইন দিব?',
      qEn: 'How can employers start campaigns?',
      aBn: 'বায়ার মোডে গিয়ে "নতুন কাজ" বাটনে ক্লিক করুন। কাজের বিবরণ, কাজের সংখ্যা এবং প্রতি কাজের রেট দিয়ে বিকাশ বা নগদে ডিপোজিট করে তাৎক্ষণিক প্রচার শুরু করুন।',
      aEn: 'Switch to employer view, click "Post Job", describe your task requirement, set your budget, and activate campaigns with fast bKash/Nagad deposit.'
    }
  ];

  return (
    <div className="space-y-12 sm:space-y-16 py-4 sm:py-8">
      
      {/* 1. Live Platform Activity Ticker */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="p-2.5 sm:p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-2.5 overflow-hidden text-xs font-bold shadow-2xs">
          <span className="flex h-2.5 w-2.5 relative shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-600"></span>
          </span>
          <span className="font-extrabold text-emerald-700 uppercase tracking-wide text-[10px] shrink-0 bg-emerald-200/70 px-2 py-0.5 rounded-md">
            {isBn ? 'লাইভ অ্যাক্টিভিটি' : 'Live Activity'}
          </span>
          <div className="truncate text-slate-700 text-xs">
            {isBn 
              ? 'সুমন মাত্র ৳২৫০ উইথড্র করেছেন (বিকাশ) • Digital Growth BD ৳৫,০০০ ডিপোজিট করেছেন • তানভীর ৩৩তম রেফারেল বোনাস পেয়েছেন • আকাশ ইউটিউব টাস্ক সম্পন্ন করেছেন'
              : 'Sumon cashed out ৳250 via bKash • Digital Growth deposited ৳5,000 • Tanvir earned ৳50 referral bonus • Akash completed task'}
          </div>
        </div>
      </div>

      {/* 2. Top Hero Section */}
      <section className="text-center max-w-4xl mx-auto px-4 space-y-6 pt-1">
        
        {/* Brand Logo & Trust Tag */}
        <div className="flex flex-col items-center justify-center gap-3">
          <BrandLogo size="lg" isBn={isBn} />
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-emerald-50 border border-emerald-300/80 text-emerald-800 font-bold text-xs shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{isBn ? 'বাংলাদেশের ১ নম্বর মাইক্রো-টাস্ক প্ল্যাটফর্ম' : 'Top Micro-Task Platform in Bangladesh'}</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            <span className="text-emerald-700 font-extrabold">{isBn ? '১০০% নিশ্চিত পেমেন্ট' : 'Verified Payouts'}</span>
          </div>
        </div>

        {/* Main Display Headline */}
        <div className="space-y-1.5">
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-none">
            {isBn ? 'সহজ টাস্ক।' : 'Micro Tasks.'}
          </h1>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 bg-clip-text text-transparent leading-none">
            {isBn ? 'সরাসরি পেমেন্ট।' : 'Instant Payouts.'}
          </h1>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tight text-slate-900 leading-none">
            {isBn ? 'বিকাশ ও নগদে।' : 'bKash & Nagad.'}
          </h1>
        </div>

        {/* Subtitle */}
        <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed">
          {isBn 
            ? 'মোবাইল বা কম্পিউটার দিয়ে ইউটিউব সাবস্ক্রাইব, ফেসবুক লাইক, অ্যাপ ডাউনলোড ও রিভিউ টাস্ক সম্পন্ন করে সরাসরি বিকাশ ও নগদে টাকা নিন।' 
            : 'Complete quick digital tasks on your phone or laptop. Fast approvals and daily guaranteed payouts to your bKash & Nagad account.'}
        </p>

        {/* Action Buttons Stack */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 max-w-lg mx-auto pt-2">
          
          {/* Start Working */}
          <button
            id="hero-start-working-btn"
            onClick={onStartWorking}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-base shadow-lg shadow-emerald-600/25 hover:shadow-emerald-600/35 transition active:scale-98 cursor-pointer text-center flex items-center justify-center gap-2"
          >
            <span>{isBn ? 'কাজ শুরু করুন' : 'Start Working'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          {/* Post a Job */}
          <button
            id="hero-post-job-btn"
            onClick={onPostJob}
            className="w-full sm:flex-1 py-3.5 px-6 rounded-2xl font-extrabold text-base transition active:scale-98 cursor-pointer text-center border bg-white hover:bg-slate-50 text-slate-900 border-slate-200/90 shadow-xs"
          >
            {isBn ? 'জব পোস্ট করুন (বায়ার)' : 'Post a Job (Employer)'}
          </button>
        </div>

        {/* Android App Download APK */}
        <div className="max-w-xs mx-auto pt-1">
          <button
            id="hero-download-apk-btn"
            onClick={onDownloadApk}
            className="w-full py-3 px-5 rounded-2xl bg-slate-950 hover:bg-slate-900 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-3 shadow-md hover:shadow-xl transition cursor-pointer border border-slate-800"
          >
            <Smartphone className="w-5 h-5 text-emerald-400" />
            <div className="text-left">
              <span className="text-[10px] text-slate-400 block leading-tight">Android Mobile App</span>
              <span className="font-extrabold tracking-wide text-emerald-400">Download APK v2.4</span>
            </div>
          </button>
        </div>

        {/* Platform Key Stats */}
        <div className="pt-8 grid grid-cols-3 gap-2 sm:gap-6 border-t border-slate-200">
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-xl sm:text-3xl font-black text-slate-900">25,000+</p>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              {isBn ? 'মোট জব সম্পন্ন' : 'Tasks Completed'}
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-xl sm:text-3xl font-black text-emerald-600">45,000+</p>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              {isBn ? 'সক্রিয় কর্মী' : 'Active Workers'}
            </p>
          </div>
          <div className="p-3.5 sm:p-4 rounded-2xl bg-white border border-slate-200 shadow-xs">
            <p className="text-xl sm:text-3xl font-black text-teal-600">৳ ১২.৫ লক্ষ+</p>
            <p className="text-xs sm:text-sm text-slate-500 font-semibold mt-0.5">
              {isBn ? 'পরিশোধিত পেমেন্ট' : 'Paid Out'}
            </p>
          </div>
        </div>

      </section>

      {/* 3. Popular Micro-Task Categories Grid */}
      <section className="max-w-5xl mx-auto px-4 space-y-5">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            {isBn ? 'কোন কোন কাজ করে আয় করা যায়?' : 'Available Task Categories'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isBn ? 'সহজ সব কাজের ক্যাটাগরি, যা যেকোনো ফোন থেকেই করা সম্ভব' : 'Diverse online tasks you can easily do from home'}
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-red-300 hover:shadow-xs transition text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-red-50 text-red-600 flex items-center justify-center">
              <Youtube className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">{isBn ? 'ইউটিউব' : 'YouTube'}</h4>
            <p className="text-[11px] text-slate-400">{isBn ? 'সাবস্ক্রাইব ও ওয়াচ' : 'Watch & Sub'}</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-blue-300 hover:shadow-xs transition text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Facebook className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">{isBn ? 'ফেসবুক' : 'Facebook'}</h4>
            <p className="text-[11px] text-slate-400">{isBn ? 'ফলো, লাইক ও শেয়ার' : 'Like & Follow'}</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-xs transition text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Send className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">{isBn ? 'টেলিগ্রাম' : 'Telegram'}</h4>
            <p className="text-[11px] text-slate-400">{isBn ? 'চ্যানেল জয়েন' : 'Join Channels'}</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 hover:shadow-xs transition text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Smartphone className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">{isBn ? 'অ্যাপ ডাউনলোড' : 'App Install'}</h4>
            <p className="text-[11px] text-slate-400">{isBn ? 'অ্যাপ ইনস্টল ও টেস্ট' : 'Install & Review'}</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-amber-300 hover:shadow-xs transition text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Star className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">{isBn ? 'রিভিউ ও রেটিং' : 'Review & Rate'}</h4>
            <p className="text-[11px] text-slate-400">{isBn ? 'গুগল ম্যাপ রিভিউ' : '5-Star Reviews'}</p>
          </div>

          <div className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-purple-300 hover:shadow-xs transition text-center space-y-2">
            <div className="w-10 h-10 mx-auto rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Globe className="w-5 h-5" />
            </div>
            <h4 className="font-extrabold text-xs text-slate-900">{isBn ? 'ওয়েবসাইট ভিজিট' : 'Web Visit'}</h4>
            <p className="text-[11px] text-slate-400">{isBn ? 'ভিজিট ও স্ক্রিনশট' : 'Signups & Proof'}</p>
          </div>
        </div>
      </section>

      {/* 4. Top Referrers & Top Depositors Showcase */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100 text-amber-900 font-extrabold text-xs mb-2">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              <span>{isBn ? 'কমিউনিটি লিডারবোর্ড' : 'Top Community Rankings'}</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
              {isBn ? 'টপ রেফার ও টপ ডিপোজিটর' : 'Top Referrers & Top Depositors'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isBn ? 'আমাদের প্ল্যাটফর্মে সর্বোচ্চ আয়কারী রেফারার এবং বায়ারদের তালিকা' : 'Recognizing our leading affiliates and top agency clients'}
            </p>
          </div>

          {onViewTopRankings && (
            <button
              onClick={onViewTopRankings}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition cursor-pointer self-start sm:self-auto"
            >
              <span>{isBn ? 'সম্পূর্ণ র‍্যাংকিং দেখুন' : 'View Full Rankings'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* 2-Column Split: Top Refer vs Top Deposit Preview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
          
          {/* Top Refer Card */}
          <div className="p-5 sm:p-6 rounded-3xl border border-emerald-200 bg-emerald-50/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {isBn ? 'টপ রেফারার (Top Refer)' : 'Top Referrers'}
                  </h3>
                  <p className="text-[11px] text-emerald-700 font-semibold">
                    {isBn ? 'প্রতি রেফারে ৫০৳ বোনাস' : '৳50 bonus per referral'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                {isBn ? 'সাপ্তাহিক লিডার' : 'Weekly Leaders'}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">1</span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Tanvir Ahmed</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-emerald-700">342 Referrals</p>
                  <p className="text-[10px] text-slate-400">৳17,100 BDT</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">2</span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Mahmudul Hasan</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-emerald-700">289 Referrals</p>
                  <p className="text-[10px] text-slate-400">৳14,450 BDT</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-emerald-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-black text-xs flex items-center justify-center">3</span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Sabbir Hossain</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-emerald-700">215 Referrals</p>
                  <p className="text-[10px] text-slate-400">৳10,750 BDT</p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Deposit Card */}
          <div className="p-5 sm:p-6 rounded-3xl border border-blue-200 bg-blue-50/40 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-xl bg-blue-600 text-white flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                    {isBn ? 'টপ ডিপোজিটর (Top Deposit)' : 'Top Depositors'}
                  </h3>
                  <p className="text-[11px] text-blue-700 font-semibold">
                    {isBn ? 'শীর্ষ বায়ার ও এজেন্সিসমূহ' : 'Leading Employers'}
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2.5 py-1 rounded-full">
                {isBn ? 'ভেরিফাইড বায়ার' : 'Verified Buyers'}
              </span>
            </div>

            <div className="space-y-2.5">
              <div className="p-3 rounded-2xl bg-white border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-amber-100 text-amber-800 font-black text-xs flex items-center justify-center">1</span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Digital Growth BD</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-blue-700">৳185,000 BDT</p>
                  <p className="text-[10px] text-slate-400">164 Campaigns</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-black text-xs flex items-center justify-center">2</span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900">Apex Media Agency</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-blue-700">৳142,000 BDT</p>
                  <p className="text-[10px] text-slate-400">118 Campaigns</p>
                </div>
              </div>

              <div className="p-3 rounded-2xl bg-white border border-blue-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-orange-100 text-orange-800 font-black text-xs flex items-center justify-center">3</span>
                  <span className="font-bold text-xs sm:text-sm text-slate-900">TechSolutions Hub</span>
                </div>
                <div className="text-right">
                  <p className="font-black text-xs text-blue-700">৳98,000 BDT</p>
                  <p className="text-[10px] text-slate-400">87 Campaigns</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* 5. Payment Gateways Supported */}
      <section className="max-w-4xl mx-auto px-4 text-center">
        <p className="text-[11px] font-black uppercase tracking-wider text-slate-400 mb-3">
          {isBn ? 'ইনস্ট্যান্ট অটো পেমেন্ট পার্টনারস' : 'Instant Automated Payout Gateways'}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-2.5 sm:gap-3">
          <div className="px-4 py-2 rounded-xl bg-pink-50 border border-pink-200 font-black text-xs text-pink-700 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-pink-600" />
            <span>bKash (বিকাশ)</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-amber-50 border border-amber-200 font-black text-xs text-amber-700 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-amber-600" />
            <span>Nagad (নগদ)</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-purple-50 border border-purple-200 font-black text-xs text-purple-700 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-purple-600" />
            <span>Rocket (রকেট)</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-blue-50 border border-blue-200 font-black text-xs text-blue-700 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-blue-600" />
            <span>Upay (উপায়)</span>
          </div>
          <div className="px-4 py-2 rounded-xl bg-emerald-50 border border-emerald-200 font-black text-xs text-emerald-700 flex items-center gap-1.5 shadow-2xs">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            <span>USDT (TRC-20)</span>
          </div>
        </div>
      </section>

      {/* 6. Simple 3-Step "How It Works" Section */}
      <section className="max-w-5xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isBn ? 'কিভাবে কাজ করে?' : 'How It Works'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isBn ? 'সহজ ৩টি ধাপে ঘরে বসে আয় শুরু করুন' : 'Start earning in 3 simple steps from home'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          
          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs relative">
            <span className="absolute top-4 right-4 text-3xl font-black text-emerald-500/20">01</span>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              {isBn ? '১. ফ্রি অ্যাকাউন্ট খুলুন' : '1. Sign Up Free'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {isBn 
                ? 'নাম, ইমেইল ও ফোন নম্বর দিয়ে মাত্র ৩০ সেকেন্ডে অ্যাকাউন্ট চালু করুন। কোনো রেজিস্ট্রেশন ফি নেই।'
                : 'Create your free account in 30 seconds. No membership fee required to start working.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs relative">
            <span className="absolute top-4 right-4 text-3xl font-black text-blue-500/20">02</span>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              {isBn ? '২. কাজ করুন ও প্রুফ দিন' : '2. Complete Tasks'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {isBn 
                ? 'ইউটিউব সাবস্ক্রাইব, অ্যাপ ইনস্টল বা ফেসবুক ফলো করে কাজের স্ক্রিনশট বা প্রুফ জমা দিন।'
                : 'Browse verified tasks, follow simple instructions, and submit proof screenshots.'}
            </p>
          </div>

          <div className="p-6 rounded-3xl border border-slate-200 bg-white shadow-xs relative">
            <span className="absolute top-4 right-4 text-3xl font-black text-amber-500/20">03</span>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <Wallet className="w-6 h-6" />
            </div>
            <h3 className="font-extrabold text-base text-slate-900">
              {isBn ? '৩. বিকাশ ও নগদে টাকা নিন' : '3. Instant Payout'}
            </h3>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              {isBn 
                ? 'কাজ অনুমোদন হলেই অ্যাকাউন্টে টাকা যোগ হবে। সর্বনিম্ন ১০০ টাকা হলে সরাসরি উইথড্র করুন।'
                : 'Earn real cash. Withdraw anytime directly to your personal bKash or Nagad number.'}
            </p>
          </div>

        </div>
      </section>

      {/* 7. Live Tasks Preview */}
      <section className="max-w-5xl mx-auto px-4 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-2xl font-black text-slate-900 tracking-tight">
              {isBn ? 'উপলব্ধ জনপ্রিয় কাজ সমূহ' : 'Featured Available Tasks'}
            </h2>
            <p className="text-xs text-slate-500">
              {isBn ? 'এখনই করে সরাসরি আয় করার মতো লাইভ কাজ' : 'Real active jobs waiting for you right now'}
            </p>
          </div>
          <button
            onClick={onExploreJobs}
            className="text-xs font-bold text-emerald-600 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>{isBn ? 'সকল কাজ দেখুন' : 'Explore All'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {(recentJobs || []).slice(0, 3).map(job => (
            <div
              key={job.id}
              onClick={onExploreJobs}
              className="p-4 rounded-2xl border border-slate-200 bg-white hover:border-emerald-300 shadow-2xs hover:shadow-xs transition cursor-pointer"
            >
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 font-bold text-[11px]">
                  {isBn ? job.categoryNameBn : job.categoryName}
                </span>
                <span className="font-black text-emerald-600 text-sm">
                  ${job.payPerTaskUSD.toFixed(2)} <span className="text-[11px] font-normal text-slate-400">(৳{job.payPerTaskBDT})</span>
                </span>
              </div>
              <h4 className="font-extrabold text-slate-900 text-sm line-clamp-2">
                {isBn ? job.titleBn : job.title}
              </h4>
              <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {job.estimatedMinutes}m
                </span>
                <span>{job.completedSlots}/{job.totalSlots} {isBn ? 'সম্পন্ন' : 'done'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 8. Frequently Asked Questions (FAQ) Accordion */}
      <section className="max-w-4xl mx-auto px-4 space-y-4">
        <div className="text-center space-y-1">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900">
            {isBn ? 'সাধারণ প্রশ্নোত্তর (FAQ)' : 'Frequently Asked Questions'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            {isBn ? 'আপনার মনে থাকা প্রশ্নগুলোর তাৎক্ষণিক উত্তর' : 'Common questions answered clearly'}
          </p>
        </div>

        <div className="space-y-2.5 pt-2">
          {FAQS.map((faq, index) => (
            <div
              key={index}
              className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition"
            >
              <button
                onClick={() => toggleFaq(index)}
                className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50"
              >
                <span className="font-extrabold text-sm text-slate-900">
                  {isBn ? faq.qBn : faq.qEn}
                </span>
                {openFaq === index ? (
                  <ChevronUp className="w-4 h-4 text-emerald-600 shrink-0" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                )}
              </button>
              {openFaq === index && (
                <div className="px-4 pb-4 pt-1 border-t border-slate-100 text-xs text-slate-600 leading-relaxed bg-slate-50/50">
                  {isBn ? faq.aBn : faq.aEn}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 9. 24/7 Official WhatsApp Support */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-5 sm:p-6 rounded-3xl border border-emerald-200 bg-emerald-50/80 text-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5 text-center sm:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Headphones className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-extrabold text-sm sm:text-base text-slate-900">
                {isBn ? '২৪/৭ অফিসিয়াল হোয়াটসঅ্যাপ সাপোর্ট' : 'Official 24/7 WhatsApp Helpline'}
              </h4>
              <p className="text-xs text-slate-600 mt-0.5">
                {isBn ? 'যেকোনো সমস্যা, ডিপোজিট বা উইথড্রয়ালের সহায়তার জন্য সরাসরি যোগাযোগ করুন' : 'Instant live chat for payments, task issues and account help'}
              </p>
            </div>
          </div>
          <a
            href="https://wa.me/8801331119361"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-xs transition shrink-0"
          >
            <span>+8801331119361</span>
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </section>

      {/* 10. Pre-login Bottom Call to Action */}
      <section className="max-w-5xl mx-auto px-4">
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-800 text-white shadow-xl text-center space-y-4">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">
            {isBn ? 'আজই প্রথম আয় করতে প্রস্তুত?' : 'Ready to Earn Your First Income Today?'}
          </h2>
          <p className="text-xs sm:text-sm text-emerald-100 max-w-lg mx-auto font-medium">
            {isBn ? 'কোনো প্রাথমিক ফি বা ডিপোজিট ছাড়াই অ্যাকাউন্ট খুলুন এবং যেকোনো মোবাইল দিয়ে কাজ শুরু করুন।' : 'Join thousands of Bangladeshi freelancers earning real daily income from home.'}
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={onStartWorking}
              className="w-full sm:w-auto px-6 py-3 bg-white text-emerald-700 hover:bg-emerald-50 rounded-xl font-bold text-sm shadow-md transition cursor-pointer"
            >
              {isBn ? 'ফ্রি অ্যাকাউন্ট তৈরি করুন' : 'Create Free Account'}
            </button>
            <button
              onClick={onPostJob}
              className="w-full sm:w-auto px-6 py-3 bg-emerald-800/60 hover:bg-emerald-800 text-white rounded-xl font-bold text-sm border border-emerald-400/40 transition cursor-pointer"
            >
              {isBn ? 'ক্যাম্পেইন পোস্ট করুন (বায়ার)' : 'Post a Campaign (Buyer)'}
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
