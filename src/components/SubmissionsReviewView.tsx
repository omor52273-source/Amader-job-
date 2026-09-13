import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  ChevronRight, 
  SlidersHorizontal, 
  FileText, 
  Edit3, 
  Star,
  ExternalLink,
  ShieldCheck,
  Eye,
  Check,
  X
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { TaskSubmission, Job, Language, Currency } from '../types';

interface SubmissionsReviewViewProps {
  job: Job;
  submissions: TaskSubmission[];
  language: Language;
  currency: Currency;
  darkMode: boolean;
  onBack: () => void;
  onApprove: (submissionId: string) => void;
  onReject: (submissionId: string, feedback: string) => void;
  onViewJobDetails: (job: Job) => void;
  onEditJob: (job: Job) => void;
}

export const SubmissionsReviewView: React.FC<SubmissionsReviewViewProps> = ({
  job,
  submissions,
  language,
  currency,
  darkMode,
  onBack,
  onApprove,
  onReject,
  onViewJobDetails,
  onEditJob
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [inspectingSub, setInspectingSub] = useState<TaskSubmission | null>(null);
  
  // VIP Confirm Approve dialog state
  const [confirmingApproveSub, setConfirmingApproveSub] = useState<TaskSubmission | null>(null);
  
  // Reject reason dialog state
  const [rejectingSub, setRejectingSub] = useState<TaskSubmission | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  const isBn = language === 'bn';
  // Strictly filter by this specific job's ID
  const safeSubmissions = submissions || [];
  const jobSubs = safeSubmissions.filter(s => s && s.jobId === job.id);
  const allCount = jobSubs.length;
  const pendingCount = jobSubs.filter(s => s.status === 'pending').length;
  const approvedCount = jobSubs.filter(s => s.status === 'approved').length;
  const rejectedCount = jobSubs.filter(s => s.status === 'rejected').length;

  const filteredSubs = jobSubs.filter(s => {
    if (activeTab === 'all') return true;
    return s.status === activeTab;
  });

  const handleConfirmApprove = () => {
    if (!confirmingApproveSub) return;
    try {
      confetti({ particleCount: 70, spread: 70 });
    } catch (e) {}
    onApprove(confirmingApproveSub.id);
    setConfirmingApproveSub(null);
    setInspectingSub(null);
  };

  const handleConfirmReject = () => {
    if (!rejectingSub) return;
    if (!rejectReason.trim()) {
      setRejectError(isBn ? 'অনুগ্রহ করে বাতিলের সুনির্দিষ্ট কারণ লিখুন' : 'Please provide a valid rejection reason');
      return;
    }
    onReject(rejectingSub.id, rejectReason.trim());
    setRejectReason('');
    setRejectError('');
    setRejectingSub(null);
    setInspectingSub(null);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-24">
      
      {/* Top Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 hover:bg-slate-200 transition cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div className="truncate">
            <h1 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white truncate">
              {isBn ? `সাবমিশন: ${job.titleBn}` : `Submissions: ${job.title}`}
            </h1>
            <p className="text-[11px] text-slate-400">
              {allCount} {isBn ? 'টি মোট কাজ জমা' : 'total submissions'}
            </p>
          </div>
        </div>
      </div>

      {/* Boost Banner */}
      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-xs text-amber-800 dark:text-amber-300">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <span className="font-extrabold mr-1.5 uppercase text-[10px] bg-amber-500/20 px-1.5 py-0.5 rounded">
              BOOST ENDED
            </span>
            <span className="font-semibold text-xs">
              {isBn ? 'আরও বেশি কর্মীর কাছে পৌঁছাতে বুস্ট করুন' : 'Boost to get more visibility'}
            </span>
          </div>
        </div>
        <button
          onClick={() => alert(isBn ? 'ক্যাম্পেইন বুস্ট সক্রিয় হয়েছে!' : 'Campaign boost activated!')}
          className="font-bold text-amber-700 dark:text-amber-400 hover:underline flex items-center gap-0.5 text-xs cursor-pointer"
        >
          <span>{isBn ? 'বুস্ট' : 'Boost'}</span>
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
          }`}
        >
          <span>{isBn ? 'সবগুলো' : 'All'}</span>
          <span className="text-[10px] opacity-80">{allCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('pending')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'pending'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500"></span>
          <span>{isBn ? 'পেন্ডিং' : 'Pending'}</span>
          <span className="text-[10px]">{pendingCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('approved')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'approved'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>{isBn ? 'অনুমোদিত' : 'Approved'}</span>
          <span className="text-[10px]">{approvedCount}</span>
        </button>

        <button
          onClick={() => setActiveTab('rejected')}
          className={`px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'rejected'
              ? 'bg-rose-600 text-white shadow-xs'
              : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
          <span>{isBn ? 'বাতিল' : 'Rejected'}</span>
          <span className="text-[10px]">{rejectedCount}</span>
        </button>
      </div>

      {/* Submissions List Stream */}
      <div className="space-y-3">
        {filteredSubs.map((sub, idx) => (
          <div
            key={sub.id || idx}
            className={`p-4 rounded-2xl border transition-all space-y-3 ${
              darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200 shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <img
                  src={sub.workerAvatar}
                  alt={sub.workerName}
                  className="w-10 h-10 rounded-full object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                      @{sub.workerName.toLowerCase().replace(/\s+/g, '_')}
                    </span>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 font-bold px-1 rounded flex items-center gap-0.5">
                      <ShieldCheck className="w-2.5 h-2.5" />
                      VERIFIED
                    </span>
                    <span className="text-[10px] font-bold text-amber-500 flex items-center">
                      <Star className="w-2.5 h-2.5 fill-amber-500 mr-0.5" />
                      5.0
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    {new Date(sub.submittedAt).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </p>
                </div>
              </div>

              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                sub.status === 'approved'
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : sub.status === 'pending'
                  ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                  : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
              }`}>
                {sub.status}
              </span>
            </div>

            <div className={`p-3 rounded-xl text-xs space-y-2 ${
              darkMode ? 'bg-slate-800/70 border border-slate-700' : 'bg-slate-50 border border-slate-100'
            }`}>
              <div className="flex items-center justify-between text-[11px] text-slate-400">
                <span>{isBn ? 'জমা দেওয়া প্রুফ:' : 'Submitted Proof:'}</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  +${(sub.earnedUSD ?? job.payPerTaskUSD ?? 0).toFixed(2)} (৳{(sub.earnedBDT ?? job.payPerTaskBDT ?? 0).toFixed(2)})
                </span>
              </div>
              <p className="font-mono text-slate-800 dark:text-slate-200 text-xs">
                {sub.proofText || 'Attached photo proof verified from device.'}
              </p>
              {sub.proofImageUrl && (
                <button
                  onClick={() => setInspectingSub(sub)}
                  className="flex items-center gap-1.5 text-xs text-indigo-600 dark:text-indigo-400 hover:underline font-semibold pt-1 cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>{isBn ? 'স্ক্রিনশট প্রুফ দেখুন' : 'View Submitted Screenshot Proof'}</span>
                </button>
              )}
            </div>

            {sub.status === 'pending' && (
              <div className="flex items-center justify-end gap-2 pt-1">
                <button
                  onClick={() => {
                    setRejectingSub(sub);
                    setRejectReason('');
                    setRejectError('');
                  }}
                  className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border border-rose-200 dark:border-rose-900"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isBn ? 'বাতিল' : 'Reject'}</span>
                </button>
                <button
                  onClick={() => setConfirmingApproveSub(sub)}
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer active:scale-95"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isBn ? 'অনুমোদন' : 'Approve'}</span>
                </button>
              </div>
            )}

            {sub.status === 'rejected' && sub.feedback && (
              <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-[11px] text-rose-700 dark:text-rose-300">
                <span className="font-bold mr-1">{isBn ? 'বাতিলের কারণ:' : 'Rejection Reason:'}</span>
                <span>"{sub.feedback}"</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Floating Bottom Bar */}
      <div className={`fixed bottom-0 left-0 right-0 z-30 p-3 sm:p-4 border-t backdrop-blur-lg transition-colors ${
        darkMode ? 'bg-slate-900/90 border-slate-800' : 'bg-white/90 border-slate-200'
      }`}>
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => onViewJobDetails(job)}
            className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-md transition cursor-pointer"
          >
            <FileText className="w-4 h-4" />
            <span>{isBn ? 'সম্পূর্ণ বিবরণ দেখুন' : 'View Full Details'}</span>
          </button>
          <button
            onClick={() => onEditJob(job)}
            className={`p-3 rounded-xl border flex items-center justify-center transition cursor-pointer ${
              darkMode ? 'border-slate-700 bg-slate-800 text-slate-300 hover:bg-slate-700' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
            }`}
            title="Edit Job"
          >
            <Edit3 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 1. Inspect Proof Modal */}
      {inspectingSub && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden my-6 transition-colors ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <h3 className="font-extrabold text-sm">
                {isBn ? 'কাজের প্রমাণপত্র নিরীক্ষণ' : 'Worker Submission Proof'}
              </h3>
              <button
                onClick={() => setInspectingSub(null)}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="flex items-center gap-3">
                <img
                  src={inspectingSub.workerAvatar}
                  alt={inspectingSub.workerName}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-sm">{inspectingSub.workerName}</p>
                  <p className="text-slate-400 text-[11px]">{new Date(inspectingSub.submittedAt).toLocaleString()}</p>
                </div>
              </div>

              {inspectingSub.proofText && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/80 rounded-xl font-mono text-xs border border-slate-200 dark:border-slate-700">
                  {inspectingSub.proofText}
                </div>
              )}

              {inspectingSub.proofImageUrl && (
                <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-slate-950">
                  <img
                    src={inspectingSub.proofImageUrl}
                    alt="Proof screenshot"
                    className="w-full h-auto max-h-80 object-contain mx-auto"
                  />
                </div>
              )}
            </div>

            {inspectingSub.status === 'pending' && (
              <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex justify-end gap-2">
                <button
                  onClick={() => {
                    const target = inspectingSub;
                    setInspectingSub(null);
                    setRejectingSub(target);
                    setRejectReason('');
                    setRejectError('');
                  }}
                  className="px-4 py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-xl font-bold text-xs cursor-pointer border border-rose-200"
                >
                  {isBn ? 'বাতিল' : 'Reject'}
                </button>
                <button
                  onClick={() => {
                    const target = inspectingSub;
                    setInspectingSub(null);
                    setConfirmingApproveSub(target);
                  }}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>{isBn ? 'অনুমোদন করুন' : 'Approve Work'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. VIP CONFIRM APPROVED DIALOG */}
      {confirmingApproveSub && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className={`w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden transition-colors ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="p-5 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-9 h-9" />
              </div>

              <div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300">
                  VIP APPROVAL CONFIRMATION
                </span>
                <h3 className="text-lg font-black text-slate-900 dark:text-white mt-1.5">
                  {isBn ? 'কাজটি অনুমোদন নিশ্চিত করবেন?' : 'Confirm Job Approval?'}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
                  {isBn 
                    ? `অনুমোদন করার সাথে সাথে ${confirmingApproveSub.workerName}-এর ব্যালেন্সে পারিশ্রমিক যোগ হবে।`
                    : `Approving will immediately release the payment reward directly to ${confirmingApproveSub.workerName}'s wallet.`}
                </p>
              </div>

              {/* Worker & Payment Details Card */}
              <div className="p-3.5 bg-slate-50 dark:bg-slate-800/80 rounded-2xl border border-slate-200 dark:border-slate-700 text-left flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <img
                    src={confirmingApproveSub.workerAvatar}
                    alt={confirmingApproveSub.workerName}
                    className="w-9 h-9 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-extrabold text-slate-900 dark:text-white">{confirmingApproveSub.workerName}</p>
                    <p className="text-[11px] text-slate-400 font-mono">Job #{job.id}</p>
                  </div>
                </div>

                <div className="text-right">
                  <p className="font-mono font-black text-emerald-600 dark:text-emerald-400 text-sm">
                    {currency === 'BDT' 
                      ? `৳${(job.payPerTaskBDT ?? confirmingApproveSub.earnedBDT ?? 0).toFixed(2)}` 
                      : `$${(job.payPerTaskUSD ?? confirmingApproveSub.earnedUSD ?? 0).toFixed(3)}`}
                  </p>
                  <p className="text-[10px] text-slate-400 font-semibold">{isBn ? 'ইনস্ট্যান্ট রিলিজ' : 'Direct payout'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmingApproveSub(null)}
                  className="py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  {isBn ? 'না, বাতিল' : 'Cancel'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmApprove}
                  className="py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs shadow-md shadow-emerald-600/30 transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <Check className="w-4 h-4" />
                  <span>{isBn ? 'হ্যাঁ, অনুমোদন করুন' : 'Confirm Approve'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. VIP REJECT REASON BOX DIALOG */}
      {rejectingSub && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
          <div className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden transition-colors ${
            darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950 text-rose-600 flex items-center justify-center font-bold">
                  <X className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
                    {isBn ? 'কাজ বাতিলের সুনির্দিষ্ট কারণ' : 'Reason for Rejecting Job'}
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    {isBn ? 'কর্মীকে স্পষ্টভাবে বাতিলের কারণ জানিয়ে দিন' : 'Specify clearly why this submission is rejected'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => { setRejectingSub(null); setRejectError(''); }}
                className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 flex items-center justify-center cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="p-5 space-y-4 text-xs">
              {/* Target Worker Info */}
              <div className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700">
                <img
                  src={rejectingSub.workerAvatar}
                  alt={rejectingSub.workerName}
                  className="w-8 h-8 rounded-full object-cover"
                />
                <div>
                  <p className="font-bold text-slate-900 dark:text-white">{rejectingSub.workerName}</p>
                  <p className="text-[10px] text-slate-400">ID: {rejectingSub.workerId || 'Worker'}</p>
                </div>
              </div>

              {/* Quick Template Reasons */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 block">
                  {isBn ? 'দ্রুত কারণ বাছাই করুন:' : 'Quick Common Reasons:'}
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    isBn ? 'সম্পূর্ণ ভিডিও দেখা হয়নি' : 'Incomplete watch time',
                    isBn ? 'ভুল স্ক্রিনশট বা ফেক প্রুফ' : 'Wrong screenshot or fake proof',
                    isBn ? 'চ্যানেল সাবস্ক্রাইব করা হয়নি' : 'Did not subscribe channel',
                    isBn ? 'লাইক ও কমেন্ট পাওয়া যায়নি' : 'Missing like and comment',
                    isBn ? 'কাজের নিয়ম মানা হয়নি' : 'Did not follow task rules'
                  ].map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setRejectReason(preset);
                        setRejectError('');
                      }}
                      className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 dark:bg-rose-950/40 dark:text-rose-300 border border-rose-200 dark:border-rose-800 text-[11px] font-medium transition cursor-pointer"
                    >
                      + {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reason Text Box */}
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center justify-between">
                  <span>{isBn ? 'বাতিলের কারণ বক্স (আবশ্যক):' : 'Rejection Reason Box (Required):'}</span>
                  <span className="text-[10px] text-rose-500 font-bold">*Required</span>
                </label>
                <textarea
                  rows={3}
                  required
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (rejectError) setRejectError('');
                  }}
                  placeholder={isBn ? 'এখানে বিস্তারিত লিখুন কেন কাজটি বাতিল করছেন...' : 'Write detailed explanation for why this work is rejected...'}
                  className={`w-full p-3 rounded-xl border text-xs outline-hidden transition ${
                    rejectError 
                      ? 'border-rose-500 ring-1 ring-rose-500 bg-rose-50/20' 
                      : (darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900')
                  }`}
                />
                {rejectError && (
                  <p className="text-[11px] font-bold text-rose-500">
                    {rejectError}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => { setRejectingSub(null); setRejectError(''); }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs hover:bg-slate-50 transition cursor-pointer"
                >
                  {isBn ? 'ফিরে যান' : 'Back'}
                </button>
                <button
                  type="button"
                  onClick={handleConfirmReject}
                  className="px-5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs shadow-md shadow-rose-600/30 transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>{isBn ? 'বাতিল নিশ্চিত করুন' : 'Confirm Rejection'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
