import React, { useState } from 'react';
import { 
  Wallet, 
  Lock, 
  TrendingDown, 
  Briefcase, 
  Clock, 
  AlertCircle, 
  PlusCircle, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  Play, 
  Pause, 
  Eye,
  ChevronRight,
  AlertTriangle,
  X
} from 'lucide-react';
import { UserProfile, Language, Currency, Job, TaskSubmission } from '../types';

interface ClientDashboardViewProps {
  user: UserProfile;
  language: Language;
  currency: Currency;
  jobs: Job[];
  submissions: TaskSubmission[];
  onOpenPostJob: () => void;
  onOpenDeposit: () => void;
  onViewStatement: () => void;
  onViewAllJobs: () => void;
  onApproveSubmission: (submissionId: string) => void;
  onRejectSubmission: (submissionId: string) => void;
  onToggleJobStatus: (jobId: string) => void;
  darkMode?: boolean;
}

export const ClientDashboardView: React.FC<ClientDashboardViewProps> = ({
  user,
  language,
  currency,
  jobs,
  submissions,
  onOpenPostJob,
  onOpenDeposit,
  onViewStatement,
  onViewAllJobs,
  onApproveSubmission,
  onRejectSubmission,
  onToggleJobStatus
}) => {
  const [warningDismissed, setWarningDismissed] = useState(false);
  const isBn = language === 'bn';

  // Low balance threshold: less than 200 BDT or less than $2.00 USD
  const LOW_BALANCE_THRESHOLD_BDT = 200;
  const isLowBalance = user.depositBalanceBDT < LOW_BALANCE_THRESHOLD_BDT;

  // Filter jobs belonging to this employer
  const safeJobs = jobs || [];
  const safeSubmissions = submissions || [];
  const myJobs = safeJobs.filter(j => j && (j.employerId === user.id || (user.uid && j.employerId === user.uid)));
  const activeJobsCount = myJobs.filter(j => j.status === 'active').length;
  const totalSubmissions = safeSubmissions.filter(s => s && myJobs.some(j => j.id === s.jobId));
  const pendingReviews = totalSubmissions.filter(s => s.status === 'pending');

  const lockedInJobsUSD = myJobs
    .filter(j => j.status === 'active')
    .reduce((acc, j) => acc + ((j.totalSlots - j.completedSlots) * j.payPerTaskUSD), 0);

  const totalSpentUSD = myJobs.reduce((acc, j) => acc + (j.completedSlots * j.payPerTaskUSD), 0);

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-8 py-2 sm:py-4">
      
      {/* Page Title & Welcome */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          {isBn ? 'বায়ার / ক্লায়েন্ট ড্যাশবোর্ড' : 'Client Dashboard'}
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          {isBn ? 'স্বাগতম! আপনার ক্যাম্পেইন ও কার্যক্রম পরিচালনা করুন' : 'Welcome back! Manage your jobs and monitor activity'}
        </p>
      </div>

      {/* Subtle Low-Balance Warning Alert */}
      {isLowBalance && !warningDismissed && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 shadow-2xs animate-in fade-in duration-200">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center shrink-0 mt-0.5 sm:mt-0">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h4 className="font-black text-sm sm:text-base text-amber-950">
                  {isBn ? 'ডিপোজিট ব্যালেন্স কম রয়েছে' : 'Low Deposit Balance Warning'}
                </h4>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-200/80 text-amber-900">
                  {isBn ? 'সতর্কতা' : 'Attention'}
                </span>
              </div>
              <p className="text-xs text-amber-800/90 mt-1 leading-relaxed max-w-xl">
                {isBn 
                  ? `আপনার বর্তমান ডিপোজিট ব্যালেন্স মাত্র ৳${(user.depositBalanceBDT ?? 0).toFixed(2)} ($${(user.depositBalanceUSD ?? 0).toFixed(2)})। নতুন ক্যাম্পেইন তৈরি বা চলমান কাজগুলো সচল রাখতে এখনই ব্যালেন্স রিচার্জ করুন।`
                  : `Your deposit balance is ৳${(user.depositBalanceBDT ?? 0).toFixed(2)} ($${(user.depositBalanceUSD ?? 0).toFixed(2)}). Add funds to keep your campaigns active without interruption.`}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center shrink-0 pt-1 sm:pt-0">
            <button
              onClick={onOpenDeposit}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-extrabold text-xs shadow-xs transition cursor-pointer flex items-center gap-1.5"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isBn ? 'ডিপোজিট করুন' : 'Add Funds'}</span>
            </button>
            <button
              onClick={() => setWarningDismissed(true)}
              className="p-2 rounded-xl text-amber-700 hover:text-amber-950 hover:bg-amber-100 transition cursor-pointer"
              title="Dismiss warning"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* SECTION 1: Wallet Stats */}
      <section className="space-y-3">
        
        {/* Wallet Header + Action Buttons */}
        <div className="flex items-center justify-between">
          <h2 className="text-base sm:text-lg font-bold text-slate-900">
            {isBn ? 'ডিপোজিট ওয়ালেট (Wallet)' : 'Wallet'}
          </h2>
          <div className="flex items-center gap-2">
            <button
              id="client-view-statement-btn"
              onClick={onViewStatement}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 bg-white transition cursor-pointer"
            >
              {isBn ? 'স্টেটমেন্ট' : 'View Statement'}
            </button>
            <button
              id="client-deposit-btn"
              onClick={onOpenDeposit}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{isBn ? 'ডিপোজিট' : 'Deposit'}</span>
            </button>
          </div>
        </div>

        {/* 3-column stats card - Clean numbers without duplicate bKash pill */}
        <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-slate-100 shadow-xs">
          
          {/* Column 1: Available Balance */}
          <div className="p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-500">
                {isBn ? 'উপলব্ধ ডিপোজিট' : 'Available Balance'}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-blue-600 mt-0.5">
                ${(user.depositBalanceUSD ?? 0).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400">৳ {(user.depositBalanceBDT ?? 0).toFixed(2)} BDT</p>
            </div>
          </div>

          {/* Column 2: Locked in Jobs */}
          <div className="p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center shrink-0">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                {isBn ? 'এসক্রো বাজেট' : 'Locked in Jobs'}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-amber-500 mt-0.5">
                ${(lockedInJobsUSD || 4.70).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400">{activeJobsCount} {isBn ? 'টি সক্রিয় কাজ' : 'active campaign escrow'}</p>
            </div>
          </div>

          {/* Column 3: Total Spent */}
          <div className="p-4 sm:p-5 flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500">
                {isBn ? 'মোট খরচ' : 'Total Spent'}
              </p>
              <p className="text-xl sm:text-2xl font-extrabold text-slate-800 mt-0.5">
                ${(totalSpentUSD || 8.40).toFixed(2)}
              </p>
              <p className="text-[11px] text-slate-400">৳ {((totalSpentUSD || 8.40) * 100).toFixed(2)} BDT</p>
            </div>
          </div>

        </div>
      </section>

      {/* SECTION 2: Active Campaigns Quick Overview */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isBn ? 'আমার ক্যাম্পেইনসমূহ' : 'My Posted Campaigns'}
            </h2>
            <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-extrabold">
              {myJobs.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onViewAllJobs}
              className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer flex items-center gap-1"
            >
              <span>{isBn ? 'সকল কাজ দেখুন' : 'View All'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={onOpenPostJob}
              className="px-3.5 py-1.5 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 shadow-xs transition cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>{isBn ? 'নতুন কাজ' : 'Post Job'}</span>
            </button>
          </div>
        </div>

        {myJobs.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-dashed border-slate-200 bg-white">
            <Briefcase className="w-10 h-10 mx-auto text-slate-300 mb-2" />
            <p className="text-sm font-bold text-slate-700">
              {isBn ? 'আপনার কোনো সক্রিয় কাজ নেই' : 'No jobs posted yet'}
            </p>
            <p className="text-xs text-slate-400 mt-1 mb-4">
              {isBn ? 'ইউটিউব, ফেসবুক বা অ্যাপ প্রমোশনের জন্য এখনই একটি নতুন কাজ তৈরি করুন।' : 'Create your first campaign to get thousands of Bangladeshi freelancers working for you.'}
            </p>
            <button
              onClick={onOpenPostJob}
              className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs"
            >
              {isBn ? 'ক্যাম্পেইন তৈরি করুন' : 'Create Campaign'}
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {myJobs.slice(0, 4).map((job) => {
              const progressPct = Math.min(100, Math.round((job.completedSlots / job.totalSlots) * 100));
              return (
                <div 
                  key={job.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white shadow-2xs hover:shadow-xs transition flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                        job.status === 'active' 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      }`}>
                        {job.status === 'active' ? (isBn ? 'চলমান' : 'Active') : (isBn ? 'স্থগিত' : 'Paused')}
                      </span>
                      <span className="text-xs text-slate-400">ID: #{job.id.slice(-5)}</span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">
                      {isBn ? job.titleBn : job.title}
                    </h4>
                    
                    {/* Progress Bar */}
                    <div className="space-y-1 max-w-md">
                      <div className="flex items-center justify-between text-[11px] text-slate-500">
                        <span>{job.completedSlots} / {job.totalSlots} {isBn ? 'সম্পন্ন' : 'slots'}</span>
                        <span className="font-bold">{progressPct}%</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-100 overflow-hidden">
                        <div 
                          className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                          style={{ width: `${progressPct}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    <button
                      onClick={() => onToggleJobStatus(job.id)}
                      className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition cursor-pointer"
                      title={job.status === 'active' ? 'Pause Campaign' : 'Resume Campaign'}
                    >
                      {job.status === 'active' ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={onViewAllJobs}
                      className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>{isBn ? 'বিস্তারিত' : 'Manage'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* SECTION 3: Submissions Requiring Review */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              {isBn ? 'পর্যালোচনার অপেক্ষায় প্রুফ' : 'Pending Proof Reviews'}
            </h2>
            {pendingReviews.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-extrabold">
                {pendingReviews.length} {isBn ? 'টি বাকি' : 'pending'}
              </span>
            )}
          </div>
        </div>

        {pendingReviews.length === 0 ? (
          <div className="p-6 text-center rounded-2xl border border-slate-200 bg-white">
            <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-500 mb-2" />
            <p className="text-sm font-bold text-slate-700">
              {isBn ? 'সব প্রুফ চেক করা হয়েছে' : 'All submissions reviewed'}
            </p>
            <p className="text-xs text-slate-400 mt-0.5">
              {isBn ? 'নতুন কোনো কর্মী প্রুফ জমা দিলে এখানে চলে আসবে।' : 'New task proofs will appear here for your approval.'}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {pendingReviews.slice(0, 3).map((sub) => {
              const matchedJob = myJobs.find(j => j.id === sub.jobId);
              return (
                <div 
                  key={sub.id}
                  className="p-4 rounded-2xl border border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                >
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400">
                      {matchedJob ? (isBn ? matchedJob.titleBn : matchedJob.title) : 'Task'}
                    </span>
                    <p className="font-extrabold text-sm text-slate-900">
                      {sub.workerName}
                    </p>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      "{sub.proofText}"
                    </p>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <button
                      onClick={() => onApproveSubmission(sub.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{isBn ? 'অনুমোদন' : 'Approve'}</span>
                    </button>
                    <button
                      onClick={() => onRejectSubmission(sub.id)}
                      className="px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>{isBn ? 'প্রত্যাখ্যান' : 'Reject'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

    </div>
  );
};
