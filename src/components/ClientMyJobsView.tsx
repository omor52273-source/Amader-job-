import React, { useState } from 'react';
import { 
  Briefcase, 
  MoreVertical, 
  Zap, 
  Globe, 
  Clock, 
  Users, 
  Filter, 
  PlusCircle, 
  CheckCircle2, 
  PauseCircle, 
  PlayCircle,
  Eye,
  SlidersHorizontal,
  ChevronRight
} from 'lucide-react';
import { Job, TaskSubmission, Language, Currency, UserProfile } from '../types';

interface ClientMyJobsViewProps {
  jobs: Job[];
  submissions: TaskSubmission[];
  user: UserProfile;
  language: Language;
  currency: Currency;
  darkMode: boolean;
  onOpenPostJob: () => void;
  onSelectJobForSubmissions: (job: Job) => void;
  onToggleJobStatus: (jobId: string) => void;
  onOpenManageBoost?: (job: Job) => void;
}

export const ClientMyJobsView: React.FC<ClientMyJobsViewProps> = ({
  jobs,
  submissions,
  user,
  language,
  currency,
  darkMode,
  onOpenPostJob,
  onSelectJobForSubmissions,
  onToggleJobStatus,
  onOpenManageBoost
}) => {
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'paused'>('all');
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [activeMenuJobId, setActiveMenuJobId] = useState<string | null>(null);

  const isBn = language === 'bn';
  const safeJobs = jobs || [];
  const safeSubmissions = submissions || [];
  const myJobs = safeJobs.filter(j => j && (j.employerId === user.id || (user.uid && j.employerId === user.uid) || j.id === 'job_01' || j.id === 'job_02' || j.id === 'job_06'));
  const filteredJobs = myJobs.filter(j => {
    if (filterStatus === 'all') return true;
    return j.status === filterStatus;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-4 pb-20 relative">
      
      {/* Top Bar */}
      <div className="flex items-center justify-between pb-1">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            {isBn ? 'আমার পোস্ট করা জবস' : 'My Jobs'}
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isBn ? 'ক্যাম্পেইন পর্যবেক্ষণ ও কর্মীদের জমা দেওয়া কাজ যাচাই করুন' : 'Track and review your posted worker campaigns'}
          </p>
        </div>
        <button
          onClick={onOpenPostJob}
          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-xs transition cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{isBn ? 'নতুন কাজ' : 'New Job'}</span>
        </button>
      </div>

      {/* Jobs List */}
      <div className="space-y-4">
        {filteredJobs.length === 0 ? (
          <div className={`p-10 text-center rounded-3xl border space-y-3 ${
            darkMode ? 'bg-slate-900/60 border-slate-800' : 'bg-white border-slate-200'
          }`}>
            <Briefcase className="w-10 h-10 mx-auto text-slate-400" />
            <p className="text-xs text-slate-500 font-semibold">
              {isBn ? 'কোনো পোস্ট করা জব ক্যাম্পেইন নেই' : 'No posted campaigns found.'}
            </p>
            <button
              onClick={onOpenPostJob}
              className="px-4 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold cursor-pointer"
            >
              {isBn ? '+ প্রথম কাজ পোস্ট করুন' : '+ Post Your First Job'}
            </button>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const jobSubs = safeSubmissions.filter(s => s && s.jobId === job.id);
            const totalSubs = jobSubs.length;
            const pendingSubs = jobSubs.filter(s => s.status === 'pending').length;
            const approvedSubs = jobSubs.filter(s => s.status === 'approved').length;
            const rejectedSubs = jobSubs.filter(s => s.status === 'rejected').length;
            const remainingSlots = Math.max(0, job.totalSlots - job.completedSlots);
            const pct = Math.min(100, Math.round((job.completedSlots / job.totalSlots) * 100));

            return (
              <div
                key={job.id}
                className={`rounded-2xl border p-4 sm:p-5 transition-all space-y-3.5 relative ${
                  job.boost?.isActive
                    ? 'border-amber-400 dark:border-amber-500/80 ring-1 ring-amber-400/40 shadow-md shadow-amber-500/10 bg-gradient-to-b from-amber-50/30 dark:from-amber-950/20 to-white dark:to-slate-900'
                    : darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
                }`}
              >
                {/* Title and top badges */}
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1.5 flex-1">
                    <h3 
                      onClick={() => onSelectJobForSubmissions(job)}
                      className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white leading-snug cursor-pointer hover:text-emerald-600 transition flex items-center gap-1.5"
                    >
                      {job.boost?.isActive && <Zap className="w-4 h-4 text-amber-500 fill-amber-500 shrink-0" />}
                      <span>{isBn ? job.titleBn : job.title}</span>
                    </h3>
                    
                    {/* Boost Tag & Status Badge */}
                    <div className="flex flex-wrap items-center gap-2">
                      {job.boost?.isActive ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-md bg-gradient-to-r from-amber-500 to-orange-500 text-white font-black text-[10px] tracking-wide shadow-xs animate-pulse">
                          <Zap className="w-3 h-3 fill-white" />
                          <span>🔥 BOOST ACTIVE ({job.boost.daysRemaining || job.boost.durationDays || 1}d)</span>
                        </span>
                      ) : (
                        <button
                          onClick={() => onOpenManageBoost && onOpenManageBoost(job)}
                          className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 text-[10px] font-bold hover:bg-amber-500/20 transition cursor-pointer"
                        >
                          <Zap className="w-3 h-3 text-amber-500" />
                          <span>+ BOOST CAMPAIGN</span>
                        </button>
                      )}
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase tracking-wider ${
                        job.status === 'active'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                          : 'bg-slate-200 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {job.status === 'active' ? 'ACTIVE' : 'PAUSED'}
                      </span>
                    </div>

                    {/* Category & Region */}
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 pt-0.5">
                      <span>📁 {job.categoryName}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1">
                        <Globe className="w-3 h-3" />
                        {job.targetCountry}
                      </span>
                    </p>
                  </div>

                  {/* Actions Dropdown */}
                  <div className="relative">
                    <button
                      onClick={() => setActiveMenuJobId(activeMenuJobId === job.id ? null : job.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                    >
                      <MoreVertical className="w-4 h-4" />
                    </button>

                    {activeMenuJobId === job.id && (
                      <div className={`absolute right-0 mt-1 w-44 rounded-xl shadow-xl border py-1.5 z-30 animate-in fade-in ${
                        darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}>
                        <button
                          onClick={() => {
                            setActiveMenuJobId(null);
                            onSelectJobForSubmissions(job);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>{isBn ? 'সাবমিশন দেখুন' : 'View Submissions'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuJobId(null);
                            if (onOpenManageBoost) onOpenManageBoost(job);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 flex items-center gap-2 cursor-pointer"
                        >
                          <Zap className="w-3.5 h-3.5 fill-emerald-600 dark:fill-emerald-400" />
                          <span>{isBn ? 'বুস্ট পরিচালনা' : 'Manage Boost'}</span>
                        </button>
                        <button
                          onClick={() => {
                            setActiveMenuJobId(null);
                            onToggleJobStatus(job.id);
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-2 cursor-pointer"
                        >
                          {job.status === 'active' ? <PauseCircle className="w-3.5 h-3.5" /> : <PlayCircle className="w-3.5 h-3.5" />}
                          <span>{job.status === 'active' ? (isBn ? 'পজ করুন' : 'Pause Job') : (isBn ? 'চালু করুন' : 'Resume Job')}</span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Middle Info: Payment, Expiry & Boost Status */}
                <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 pt-1">
                  <div>
                    <span className="text-slate-400">{isBn ? 'পারিশ্রমিক: ' : 'Payment '}</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400">${(job.payPerTaskUSD ?? 0).toFixed(2)}</span>
                    <span className="text-[11px] text-slate-400 ml-1">(৳ {(job.payPerTaskBDT ?? 0).toFixed(2)})</span>
                  </div>

                  {/* Boost Indicator / Button */}
                  <div className="flex items-center gap-2">
                    {job.boost?.isActive ? (
                      <button
                        onClick={() => onOpenManageBoost && onOpenManageBoost(job)}
                        className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-800 font-bold text-[11px] flex items-center gap-1 hover:scale-105 transition cursor-pointer"
                      >
                        <Zap className="w-3 h-3 fill-emerald-600 dark:fill-emerald-400" />
                        <span>${(job.boost?.dailyBudgetUSD ?? 0).toFixed(2)}/d Boosted</span>
                      </button>
                    ) : (
                      <button
                        onClick={() => onOpenManageBoost && onOpenManageBoost(job)}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 border border-slate-200 dark:border-slate-700 font-bold text-[11px] flex items-center gap-1 transition cursor-pointer"
                      >
                        <Zap className="w-3 h-3 text-amber-500" />
                        <span>{isBn ? 'বুস্ট করুন' : 'Boost Job'}</span>
                      </button>
                    )}
                    <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400 text-xs">
                      <Clock className="w-3.5 h-3.5" />
                      <span>
                        {job.boost?.isActive 
                          ? `${job.boost.daysRemaining || job.boost.durationDays || 1}d boost` 
                          : `${job.durationDays || 7}d left`}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Worker Slots Progress Bar */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-slate-700 dark:text-slate-300">
                      Workers: <b className="text-slate-900 dark:text-white">{job.completedSlots}/{job.totalSlots}</b>
                    </span>
                    <span className="text-amber-600 dark:text-amber-400 font-bold">
                      {remainingSlots} {isBn ? 'স্লট বাকি' : 'slots left'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className="bg-amber-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Bottom 4 Metric Badges */}
                <div 
                  onClick={() => onSelectJobForSubmissions(job)}
                  className="grid grid-cols-4 gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 cursor-pointer"
                >
                  <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-center">
                    <p className="text-xs sm:text-sm font-extrabold text-blue-600 dark:text-blue-400">{totalSubs}</p>
                    <p className="text-[10px] text-blue-700/80 dark:text-blue-300 font-bold">{isBn ? 'মোট' : 'Total'}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-center">
                    <p className="text-xs sm:text-sm font-extrabold text-amber-600 dark:text-amber-400">{pendingSubs}</p>
                    <p className="text-[10px] text-amber-700/80 dark:text-amber-300 font-bold">{isBn ? 'পেন্ডিং' : 'Pending'}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900/60 text-center">
                    <p className="text-xs sm:text-sm font-extrabold text-emerald-600 dark:text-emerald-400">{approvedSubs}</p>
                    <p className="text-[10px] text-emerald-700/80 dark:text-emerald-300 font-bold">{isBn ? 'অনুমোদিত' : 'Approved'}</p>
                  </div>
                  <div className="p-2 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 text-center">
                    <p className="text-xs sm:text-sm font-extrabold text-rose-600 dark:text-rose-400">{rejectedSubs}</p>
                    <p className="text-[10px] text-rose-700/80 dark:text-rose-300 font-bold">{isBn ? 'বাতিল' : 'Rejected'}</p>
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Floating Filter Button */}
      <button
        onClick={() => setShowFilterModal(true)}
        className="fixed bottom-20 right-5 sm:right-8 z-30 px-4 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-full font-bold text-xs flex items-center gap-2 shadow-xl hover:scale-105 transition-transform cursor-pointer"
      >
        <Filter className="w-4 h-4" />
        <span>{isBn ? 'ফিল্টার' : 'Filters'}</span>
      </button>

      {/* Filter Modal */}
      {showFilterModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className={`w-full max-w-sm rounded-3xl p-5 border space-y-4 shadow-2xl ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-sm">{isBn ? 'ক্যাম্পেইন ফিল্টার' : 'Filter Campaigns'}</h3>
              <button onClick={() => setShowFilterModal(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer">✕</button>
            </div>
            <div className="space-y-2 text-xs">
              <button
                onClick={() => { setFilterStatus('all'); setShowFilterModal(false); }}
                className={`w-full p-2.5 rounded-xl text-left font-bold cursor-pointer ${filterStatus === 'all' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                All Campaigns
              </button>
              <button
                onClick={() => { setFilterStatus('active'); setShowFilterModal(false); }}
                className={`w-full p-2.5 rounded-xl text-left font-bold cursor-pointer ${filterStatus === 'active' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                Active Campaigns Only
              </button>
              <button
                onClick={() => { setFilterStatus('paused'); setShowFilterModal(false); }}
                className={`w-full p-2.5 rounded-xl text-left font-bold cursor-pointer ${filterStatus === 'paused' ? 'bg-emerald-600 text-white' : 'bg-slate-100 dark:bg-slate-800'}`}
              >
                Paused Campaigns Only
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
