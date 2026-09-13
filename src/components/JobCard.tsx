import React, { useState } from 'react';
import { 
  Clock, 
  Users, 
  MapPin, 
  Star, 
  ShieldCheck, 
  ArrowUpRight, 
  Youtube, 
  Share2, 
  Send, 
  Download, 
  Globe, 
  ClipboardCheck, 
  UserPlus, 
  Sparkles,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { Job, Language, Currency } from '../types';
import { FacebookVerifiedBadge } from './FacebookVerifiedBadge';

interface JobCardProps {
  job: Job;
  language: Language;
  currency: Currency;
  onSelect: (job: Job) => void;
  isApplied?: boolean;
}

export const JobCard: React.FC<JobCardProps> = ({
  job,
  language,
  currency,
  onSelect,
  isApplied = false
}) => {
  const [copiedId, setCopiedId] = useState(false);
  const isBn = language === 'bn';
  const percentage = Math.round((job.completedSlots / job.totalSlots) * 100);
  const slotsLeft = job.totalSlots - job.completedSlots;

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'youtube':
        return <Youtube className="w-4 h-4 text-rose-500" />;
      case 'facebook':
        return <Share2 className="w-4 h-4 text-blue-500" />;
      case 'telegram':
        return <Send className="w-4 h-4 text-sky-500" />;
      case 'app_install':
        return <Download className="w-4 h-4 text-emerald-500" />;
      case 'seo_visit':
        return <Globe className="w-4 h-4 text-indigo-500" />;
      case 'reviews':
        return <Star className="w-4 h-4 text-amber-500 fill-amber-500" />;
      case 'survey':
        return <ClipboardCheck className="w-4 h-4 text-purple-500" />;
      case 'signup':
        return <UserPlus className="w-4 h-4 text-teal-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-emerald-500" />;
    }
  };

  const getStatusBadge = () => {
    const status = job.status || 'active';
    if (status === 'active') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span>{isBn ? 'সক্রিয়' : 'Active'}</span>
        </span>
      );
    }
    if (status === 'paused') {
      return (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
          <span className="inline-block h-2 w-2 rounded-full bg-amber-500"></span>
          <span>{isBn ? 'পজ' : 'Paused'}</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
        <span className="inline-block h-2 w-2 rounded-full bg-slate-400"></span>
        <span>{isBn ? 'বন্ধ' : 'Closed'}</span>
      </span>
    );
  };

  const formattedPay = currency === 'BDT' 
    ? `৳ ${(job.payPerTaskBDT ?? 0).toFixed(2)}` 
    : `$ ${(job.payPerTaskUSD ?? 0).toFixed(2)}`;

  return (
    <div 
      id={`job-card-${job.id}`}
      onClick={() => onSelect(job)}
      className={`group relative bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-200 cursor-pointer p-4 sm:p-5 flex flex-col justify-between hover:shadow-xl hover:-translate-y-0.5 ${
        job.boost?.isActive
          ? 'border-amber-400 dark:border-amber-500 ring-2 ring-amber-400/40 shadow-lg shadow-amber-500/10 bg-gradient-to-b from-amber-50/40 dark:from-amber-950/25 via-white dark:via-slate-900 to-white dark:to-slate-900'
          : job.featured 
            ? 'border-emerald-300 dark:border-emerald-700/70 ring-1 ring-emerald-400/30 bg-gradient-to-b from-emerald-50/30 dark:from-emerald-950/20 to-white dark:to-slate-900' 
            : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top row: Category badge, Status Dot, Target Country & Pay */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700">
              {getCategoryIcon(job.category)}
              <span>{isBn ? job.categoryNameBn : job.categoryName}</span>
            </span>

            {/* 1-Tap Copy Job ID */}
            <button
              type="button"
              id={`copy-job-id-${job.id}`}
              onClick={(e) => {
                e.stopPropagation();
                navigator.clipboard.writeText(job.id);
                setCopiedId(true);
                setTimeout(() => setCopiedId(false), 2000);
              }}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg text-[11px] font-mono font-bold bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-950/60 text-slate-700 hover:text-emerald-700 dark:text-slate-300 dark:hover:text-emerald-300 border border-slate-200 hover:border-emerald-300 dark:border-slate-700 transition cursor-pointer active:scale-95 shadow-2xs"
              title={isBn ? 'কাজের আইডি কপি করতে ট্যাপ করুন' : 'Tap to copy Job ID'}
            >
              <span className="text-slate-400 font-sans text-[10px]">ID:</span>
              <span>#{job.id}</span>
              {copiedId ? (
                <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400 shrink-0" />
              ) : (
                <Copy className="w-3 h-3 text-slate-400 shrink-0" />
              )}
              {copiedId && (
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-sans font-extrabold">
                  {isBn ? 'কপি!' : 'Copied!'}
                </span>
              )}
            </button>
            
            {/* Status indicator dot badge */}
            {getStatusBadge()}

            {job.boost?.isActive && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white font-black text-[10px] tracking-wide shadow-sm animate-pulse">
                <Zap className="w-3 h-3 fill-white" />
                <span>👑 {isBn ? 'ভিআইপি বুস্টেড' : 'VIP BOOSTED'}</span>
              </span>
            )}

            {job.featured && !job.boost?.isActive && (
              <span className="px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 font-bold text-[10px] tracking-wide border border-amber-200 dark:border-amber-800">
                {isBn ? 'ফিচার্ড' : 'FEATURED'}
              </span>
            )}
          </div>

          {/* Pay Tag */}
          <div className="text-right shrink-0">
            <span className="inline-block px-2.5 sm:px-3 py-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-extrabold text-sm sm:text-base tracking-tight border border-emerald-200/80 dark:border-emerald-800 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
              {formattedPay}
            </span>
          </div>
        </div>

        {/* Title */}
        <h3 className="font-bold text-slate-900 dark:text-white text-sm sm:text-base leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-2 mb-2.5">
          {isBn ? job.titleBn : job.title}
        </h3>

        {/* Employer mini info */}
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300 mb-4">
          <img 
            src={job.employerAvatar} 
            alt={job.employerName} 
            className="w-5 h-5 rounded-full object-cover"
          />
          <span className="truncate max-w-[140px] font-medium text-slate-700 dark:text-slate-200">
            {job.employerName}
          </span>
          {job.employerVerified && (
            <FacebookVerifiedBadge size="sm" title={isBn ? 'এনআইডি ভেরিফাইড বায়ার' : 'NID Verified Employer'} />
          )}
          <span className="flex items-center gap-0.5 text-amber-500 font-semibold ml-auto">
            <Star className="w-3 h-3 fill-amber-400" />
            {job.employerRating}
          </span>
        </div>
      </div>

      {/* Bottom meta & action */}
      <div>
        {/* Progress bar for slots */}
        <div className="space-y-1.5 mb-3.5">
          <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-300">
            <span className="flex items-center gap-1 font-medium">
              <Users className="w-3 h-3 text-slate-400" />
              <span>{isBn ? 'সম্পন্ন:' : 'Completed:'} {job.completedSlots}/{job.totalSlots}</span>
            </span>
            <span className="font-semibold text-slate-700 dark:text-slate-200">
              {isBn ? `${slotsLeft} বাকি` : `${slotsLeft} left`}
            </span>
          </div>
          <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
            <div 
              className={`h-full rounded-full transition-all duration-500 ${
                percentage > 80 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${percentage}%` }}
            />
          </div>
        </div>

        {/* Footer meta badges and Apply button */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 gap-2">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-300 font-medium">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              <span>{job.estimatedMinutes} {isBn ? 'মি.' : 'min'}</span>
            </span>
            <span className="flex items-center gap-1 text-[11px] bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded text-slate-700 dark:text-slate-300">
              <MapPin className="w-3 h-3 text-slate-400" />
              <span>{isBn ? job.targetCountryBn : job.targetCountry}</span>
            </span>
          </div>

          <button
            id={`apply-btn-${job.id}`}
            onClick={(e) => {
              e.stopPropagation();
              onSelect(job);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
              isApplied 
                ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300' 
                : 'bg-slate-900 dark:bg-emerald-600 hover:bg-emerald-600 dark:hover:bg-emerald-500 text-white shadow-xs'
            }`}
          >
            <span>
              {isApplied 
                ? (isBn ? 'জমা দেওয়া হয়েছে' : 'Submitted') 
                : (isBn ? 'আবেদন' : 'Apply')}
            </span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
