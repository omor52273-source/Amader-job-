import React, { useState, useEffect } from 'react';
import { 
  Trophy, 
  Users, 
  Share2, 
  Copy, 
  Check, 
  ArrowLeft,
  Crown,
  Sparkles,
  Medal,
  Clock,
  Gift,
  Zap,
  Info
} from 'lucide-react';
import { UserProfile, Language, Currency } from '../types';
import { getReferralUrl } from '../lib/appConfig';

interface TopRankingsViewProps {
  user: UserProfile;
  language: Language;
  currency: Currency;
  onOpenDeposit?: () => void;
  onBack?: () => void;
}

interface ReferrerRank {
  rank: number;
  name: string;
  avatar: string;
  referrals: number;
  earningsBDT: number;
  rewardBDT: number;
  isCurrentUser?: boolean;
}

const WEEKLY_REFERRERS: ReferrerRank[] = [
  { 
    rank: 1, 
    name: 'তানভীর আহমেদ (Tanvir)', 
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', 
    referrals: 54, 
    earningsBDT: 2700, 
    rewardBDT: 80 
  },
  { 
    rank: 2, 
    name: 'মাহমুদুল হাসান (Mahmud)', 
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80', 
    referrals: 41, 
    earningsBDT: 2050, 
    rewardBDT: 40 
  },
  { 
    rank: 3, 
    name: 'সাব্বির হোসেন (Sabbir)', 
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80', 
    referrals: 32, 
    earningsBDT: 1600, 
    rewardBDT: 20 
  },
  { 
    rank: 4, 
    name: 'কামরুল ইসলাম (Kamrul)', 
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80', 
    referrals: 26, 
    earningsBDT: 1300, 
    rewardBDT: 0 
  },
  { 
    rank: 5, 
    name: 'নাঈমুর রহমান (Naimur)', 
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80', 
    referrals: 21, 
    earningsBDT: 1050, 
    rewardBDT: 0 
  },
  { 
    rank: 6, 
    name: 'রকিবুল ইসলাম (Rokib)', 
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=100&auto=format&fit=crop&q=80', 
    referrals: 18, 
    earningsBDT: 900, 
    rewardBDT: 0 
  },
  { 
    rank: 7, 
    name: 'মেহেদী হাসান (Mehedi)', 
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80', 
    referrals: 15, 
    earningsBDT: 750, 
    rewardBDT: 0 
  },
  { 
    rank: 8, 
    name: 'ফাহিম শাকিল (Fahim)', 
    avatar: 'https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=100&auto=format&fit=crop&q=80', 
    referrals: 12, 
    earningsBDT: 600, 
    rewardBDT: 0 
  }
];

export const TopRankingsView: React.FC<TopRankingsViewProps> = ({
  user,
  language,
  onBack
}) => {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 14, mins: 28, secs: 45 });
  const isBn = language === 'bn';

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.secs > 0) return { ...prev, secs: prev.secs - 1 };
        if (prev.mins > 0) return { ...prev, mins: 59, secs: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, mins: 59, secs: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, mins: 59, secs: 59 };
        return { days: 7, hours: 0, mins: 0, secs: 0 };
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const referralCode = (user.uid && /^\d{8}$/.test(user.uid))
    ? user.uid
    : ((user.id && /^\d{8}$/.test(user.id)) ? user.id : '84920173');
  const referralLink = getReferralUrl(referralCode);

  const handleCopyLink = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Header with Back Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer shadow-xs"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight flex items-center gap-2">
              <Trophy className="w-7 h-7 text-amber-500" />
              <span>{isBn ? 'সাপ্তাহিক টপ রেফার প্রতিযোগিতা' : 'Weekly Top Referrer Challenge'}</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {isBn 
                ? 'প্রতি ৭ দিন পর পর লিডারবোর্ড আপডেট হবে। শীর্ষ ৩ জন পাবেন সরাসরি ক্যাশ প্রাইজ!' 
                : 'Rotates every 7 days. Top 3 referrers receive instant cash rewards directly!'}
            </p>
          </div>
        </div>

        {/* 7-Day Timer Pill */}
        <div className="bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-2 flex items-center gap-3 self-start sm:self-auto">
          <Clock className="w-5 h-5 text-amber-600 animate-spin-slow" />
          <div>
            <span className="text-[10px] font-bold text-amber-800 uppercase tracking-wider block">
              {isBn ? 'রাউন্ড শেষ হতে বাকি' : 'Round Reset In'}
            </span>
            <span className="font-mono font-black text-xs sm:text-sm text-amber-900">
              {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.mins}m : {timeLeft.secs}s
            </span>
          </div>
        </div>
      </div>

      {/* Rewards Overview Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1st Place */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-amber-400 bg-gradient-to-b from-amber-500/10 via-white to-amber-500/5 p-5 text-center shadow-md">
          <div className="absolute top-2 right-2">
            <span className="text-xl">👑</span>
          </div>
          <div className="w-12 h-12 mx-auto rounded-full bg-amber-100 text-amber-600 flex items-center justify-center font-black text-lg border-2 border-amber-300">
            🥇 1st
          </div>
          <h3 className="font-black text-slate-900 text-base mt-2">
            {isBn ? '১ম স্থান পুরস্কার' : '1st Place Prize'}
          </h3>
          <div className="text-2xl font-black text-amber-600 mt-1">৳৮০ টাকা</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isBn ? 'সরাসরি উইথড্র ওয়ালেটে যোগ হবে' : 'Instant withdraw balance'}
          </p>
        </div>

        {/* 2nd Place */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-slate-300 bg-gradient-to-b from-slate-200/40 via-white to-slate-100/30 p-5 text-center shadow-md">
          <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-black text-lg border-2 border-slate-300">
            🥈 2nd
          </div>
          <h3 className="font-black text-slate-900 text-base mt-2">
            {isBn ? '২য় স্থান পুরস্কার' : '2nd Place Prize'}
          </h3>
          <div className="text-2xl font-black text-slate-700 mt-1">৳৪০ টাকা</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isBn ? 'সরাসরি উইথড্র ওয়ালেটে যোগ হবে' : 'Instant withdraw balance'}
          </p>
        </div>

        {/* 3rd Place */}
        <div className="relative overflow-hidden rounded-2xl border-2 border-orange-300 bg-gradient-to-b from-orange-200/40 via-white to-orange-100/30 p-5 text-center shadow-md">
          <div className="w-12 h-12 mx-auto rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-black text-lg border-2 border-orange-300">
            🥉 3rd
          </div>
          <h3 className="font-black text-slate-900 text-base mt-2">
            {isBn ? '৩য় স্থান পুরস্কার' : '3rd Place Prize'}
          </h3>
          <div className="text-2xl font-black text-orange-600 mt-1">৳২০ টাকা</div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isBn ? 'সরাসরি উইথড্র ওয়ালেটে যোগ হবে' : 'Instant withdraw balance'}
          </p>
        </div>
      </div>

      {/* Referral Program Info Box (2 TK bonus & 5% commission) */}
      <div className="rounded-2xl bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 shadow-lg">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-lg">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[10px] font-black uppercase">
                {isBn ? 'লাইফটাইম রেফারেল প্রোগ্রাম' : 'Lifetime Referral Program'}
              </span>
              <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[10px] font-black">
                {isBn ? 'ফ্রি ৳২ সাইনআপ বোনাস' : '৳2 Free Signup Bonus'}
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-white">
              {isBn ? 'রেফার করুন এবং ৫% আজীবন কমিশন পান' : 'Invite Friends & Earn 5% Lifetime Commission'}
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              {isBn 
                ? 'যাকে রেফার করবেন সে একাউন্ট করলেই ফ্রি ৳২ পাবেন, এবং সে যত কাজ করবে বা জব পোস্ট করবে তার আয়ের ৫% সারাজীবন আপনার একাউন্টে যুক্ত হবে!' 
                : 'Earn ৳2 instant bonus per signup plus 5% lifetime recurring commission on all tasks & job posts made by your referred users!'}
            </p>
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <div className="flex items-center gap-2 bg-white/10 p-2 rounded-xl border border-white/20">
              <span className="font-mono text-xs text-emerald-300 px-2 select-all truncate max-w-[200px]">
                {referralCode}
              </span>
              <button
                onClick={handleCopyLink}
                className="px-3 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black transition flex items-center gap-1.5 cursor-pointer shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'লিংক কপি' : 'Copy Link')}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* User's Own Referral Ranking Card */}
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/70 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <img 
            src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80'} 
            alt={user.name} 
            className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500 shadow-xs"
          />
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-slate-900 text-sm sm:text-base">{user.name}</span>
              <span className="px-2 py-0.5 rounded-md bg-emerald-200/80 text-emerald-800 text-[10px] font-black">
                {isBn ? 'আপনার প্রোফাইল' : 'You'}
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              UID: <span className="font-mono font-bold text-slate-900">{user.uid || user.id}</span> • {isBn ? 'মোট রেফারেল' : 'Total Referrals'}: <strong className="text-emerald-700">{user.referredUsersCount || 14} জন</strong>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-right">
          <div className="bg-white px-3.5 py-2 rounded-xl border border-emerald-200 shadow-xs">
            <span className="text-[10px] text-slate-500 block uppercase font-bold">{isBn ? 'রেফার আয়' : 'Referral Earned'}</span>
            <span className="text-base font-black text-emerald-700">৳{(user.referralEarningsBDT || 180).toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Leaderboard Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-emerald-600" />
            <h3 className="font-black text-slate-900 text-sm sm:text-base">
              {isBn ? 'এই সপ্তাহের টপ রেফারার তালিকা' : 'This Week\'s Top Referrers'}
            </h3>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {isBn ? 'র‍্যাংক ও পুরস্কার' : 'Rank & Rewards'}
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {WEEKLY_REFERRERS.map((ranker) => (
            <div 
              key={ranker.rank}
              className={`p-4 flex items-center justify-between gap-3 hover:bg-slate-50/80 transition ${
                ranker.rank <= 3 ? 'bg-amber-50/30' : ''
              }`}
            >
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Rank Badge */}
                <div className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center font-black text-xs sm:text-sm shrink-0 ${
                  ranker.rank === 1 ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                  ranker.rank === 2 ? 'bg-slate-200 text-slate-800 border border-slate-300' :
                  ranker.rank === 3 ? 'bg-orange-100 text-orange-800 border border-orange-300' :
                  'bg-slate-100 text-slate-600'
                }`}>
                  {ranker.rank === 1 ? '🥇' : ranker.rank === 2 ? '🥈' : ranker.rank === 3 ? '🥉' : `#${ranker.rank}`}
                </div>

                {/* Avatar */}
                <img 
                  src={ranker.avatar} 
                  alt={ranker.name} 
                  className="w-10 h-10 rounded-xl object-cover border border-slate-200 shrink-0"
                />

                {/* Name and Referrals */}
                <div>
                  <h4 className="font-bold text-slate-900 text-xs sm:text-sm">
                    {ranker.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {isBn ? 'সফল রেফার' : 'Successful Referrals'}: <span className="font-bold text-slate-800">{ranker.referrals} জন</span>
                  </p>
                </div>
              </div>

              {/* Reward & Earnings */}
              <div className="text-right">
                {ranker.rewardBDT > 0 ? (
                  <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 font-black text-xs border border-amber-300">
                    <Gift className="w-3 h-3 text-amber-600" />
                    <span>+৳{ranker.rewardBDT} {isBn ? 'পুরস্কার' : 'Bonus'}</span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400">
                    ৳{ranker.earningsBDT}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
