import React, { useState, useEffect } from 'react';
import { 
  X,
  Languages,
  Folder,
  MapPin,
  Star,
  ExternalLink,
  FileText,
  Download,
  Image as ImageIcon,
  Send,
  Flag,
  Share2,
  AlertTriangle,
  BookOpen,
  Upload,
  Trash2,
  CheckCircle2,
  Check,
  UserPlus,
  Maximize2
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Job, Language, Currency, TaskSubmission, UserProfile, JobProofRequirement } from '../types';
import { FacebookVerifiedBadge } from './FacebookVerifiedBadge';
import { BLOCKBUSTER_EXAMPLE_1, BLOCKBUSTER_EXAMPLE_2, BLOCKBUSTER_EXAMPLE_3 } from '../data/mockScreenshots';

interface JobDetailPageProps {
  job: Job;
  user: UserProfile;
  language: Language;
  currency: Currency;
  darkMode: boolean;
  onBack: () => void;
  onSubmitTask: (submission: Omit<TaskSubmission, 'id' | 'submittedAt' | 'status'>) => void;
  alreadyApplied?: boolean;
}

export const JobDetailPage: React.FC<JobDetailPageProps> = ({
  job,
  user,
  language: initialLanguage,
  currency,
  darkMode,
  onBack,
  onSubmitTask,
  alreadyApplied = false
}) => {
  // Toggle between Job Detail page (Screenshots 1-3) and Submit Your Work page (Screenshots 4-5)
  const [isSubmitMode, setIsSubmitMode] = useState(false);

  // Automatically scroll to the very top whenever toggling between Job Details and Submit Mode
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    if (typeof document !== 'undefined') {
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      const mainContent = document.querySelector('main');
      if (mainContent) mainContent.scrollTop = 0;
    }
  }, [isSubmitMode]);

  // Translation toggle
  const [isTranslated, setIsTranslated] = useState(false);
  const isBn = isTranslated ? false : initialLanguage === 'bn';

  // Follow client state
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(job.employerFollowers || 701);

  // Modals state
  const [isRateModalOpen, setIsRateModalOpen] = useState(false);
  const [rateStars, setRateStars] = useState(5);
  const [rateFeedback, setRateFeedback] = useState('');
  const [rateSuccess, setRateSuccess] = useState(false);

  const [isRulesModalOpen, setIsRulesModalOpen] = useState(false);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState('scam');
  const [reportSuccess, setReportSuccess] = useState(false);

  const [shareToast, setShareToast] = useState(false);
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // Submit Work Form State
  const [uploadedProofs, setUploadedProofs] = useState<{ [key: string]: { url: string; name: string; size?: string } }>({});
  const [proofText, setProofText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccessSubmitted, setIsSuccessSubmitted] = useState(false);

  // Job data helpers
  const paymentFormatted = currency === 'BDT'
    ? `৳ ${(job.payPerTaskBDT ?? 14.40).toFixed(2)}`
    : `$ ${(job.payPerTaskUSD ?? 0.12).toFixed(2)}`;

  const totalWorkers = job.totalSlots || 775;
  const completedWorkers = job.completedSlots || 758;
  const progressPercent = Math.min(100, Math.round((completedWorkers / totalWorkers) * 100));

  // Requirements list (Fallback to the 3 exact Blockbuster requirements if needed)
  const requirements: JobProofRequirement[] = (job.proofRequirements && job.proofRequirements.length > 0)
    ? job.proofRequirements
    : [
        {
          id: 'p_screen_1',
          type: 'screenshot',
          description: 'Send a screenshot of the page showing Age, Gender, Nickname and ID Number.',
          descriptionBn: 'Age, Gender, Nickname ও ID Number দেখা যায় এমন পেজের একটি স্ক্রিনশট পাঠান।',
          exampleImage: BLOCKBUSTER_EXAMPLE_1,
          isRequired: true
        },
        {
          id: 'p_screen_2',
          type: 'screenshot',
          description: 'Send a screenshot of the page showing your Gmail, Email and Device Bound.',
          descriptionBn: 'আপনার Gmail, Email এবং Device Bound দেখানো পেজের একটি স্ক্রিনশট পাঠান।',
          exampleImage: BLOCKBUSTER_EXAMPLE_2,
          isRequired: true
        },
        {
          id: 'p_screen_3',
          type: 'screenshot',
          description: 'Take a screenshot of this wallet/referral page.',
          descriptionBn: 'এই পেজটির স্ক্রিনশট নিন।',
          exampleImage: BLOCKBUSTER_EXAMPLE_3,
          isRequired: true
        }
      ];

  const screenshotReqs = requirements.filter(r => r.type === 'screenshot');
  const totalScreenshots = screenshotReqs.length;

  const defaultRulesEn = [
    'For new users only who have never installed or used this app before.',
    'Do not uninstall or delete the application for at least 3 days after registration.',
    'Submitting fake, cropped, edited or duplicate screenshots will lead to instant account suspension.',
    'Ensure all texts, user IDs and account details are clearly visible.'
  ];
  const defaultRulesBn = [
    'শুধুমাত্র নতুন ব্যবহারকারীদের জন্য যারা পূর্বে এই অ্যাপ ইনস্টল করেননি।',
    'রেজিস্ট্রেশনের পর অন্তত ৩ দিন পর্যন্ত অ্যাপটি আনইনস্টল বা ডিলিট করবেন না।',
    'ভুয়া, এডিটেড বা ডুপ্লিকেট স্ক্রিনশট জমা দিলে তাৎক্ষণিক অ্যাকাউন্ট স্থগিত করা হবে।',
    'সকল টেক্সট, ইউজার আইডি এবং অ্যাকাউন্টের বিবরণ পরিষ্কারভাবে দৃশ্যমান হতে হবে।'
  ];

  const rulesList: string[] = isBn
    ? ((job.rulesBn && Array.isArray(job.rulesBn) && job.rulesBn.length > 0)
        ? job.rulesBn
        : (job.rules && Array.isArray(job.rules) && job.rules.length > 0 ? job.rules : defaultRulesBn))
    : ((job.rules && Array.isArray(job.rules) && job.rules.length > 0)
        ? job.rules
        : (job.rulesBn && Array.isArray(job.rulesBn) && job.rulesBn.length > 0 ? job.rulesBn : defaultRulesEn));

  const handleToggleFollow = () => {
    if (isFollowing) {
      setIsFollowing(false);
      setFollowerCount(prev => Math.max(0, prev - 1));
    } else {
      setIsFollowing(true);
      setFollowerCount(prev => prev + 1);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setShareToast(true);
    setTimeout(() => setShareToast(false), 2500);
  };

  const handleFileUpload = (reqId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadedProofs(prev => ({
          ...prev,
          [reqId]: {
            url: reader.result as string,
            name: file.name,
            size: `${(file.size / 1024).toFixed(0)} KB`
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSetSampleProof = (reqId: string, exampleImg?: string) => {
    const fallback = exampleImg || BLOCKBUSTER_EXAMPLE_1;
    setUploadedProofs(prev => ({
      ...prev,
      [reqId]: {
        url: fallback,
        name: `Screenshot_Proof_${reqId}.jpg`,
        size: '184 KB'
      }
    }));
  };

  const handleRemoveProof = (reqId: string) => {
    setUploadedProofs(prev => {
      const copy = { ...prev };
      delete copy[reqId];
      return copy;
    });
  };

  const handleSubmitWork = (e: React.FormEvent) => {
    e.preventDefault();
    if (alreadyApplied || isSuccessSubmitted) return;

    // Auto-fill missing proofs with demo samples if user didn't select files for testing
    screenshotReqs.forEach(req => {
      if (!uploadedProofs[req.id]) {
        handleSetSampleProof(req.id, req.exampleImage);
      }
    });

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      try {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      } catch (err) {}

      const proofItems = Object.values(uploadedProofs) as { url: string; name: string; size?: string }[];
      const firstProof = proofItems[0]?.url || BLOCKBUSTER_EXAMPLE_1;

      onSubmitTask({
        jobId: job.id,
        jobTitle: job.title,
        jobTitleBn: job.titleBn,
        category: job.category,
        workerId: user.id || 'user_worker',
        workerName: user.name || 'Freelancer',
        workerAvatar: user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
        proofText: proofText.trim() || undefined,
        proofImageUrl: firstProof,
        earnedBDT: job.payPerTaskBDT || 14.40,
        earnedUSD: job.payPerTaskUSD || 0.12
      });

      setIsSuccessSubmitted(true);
    }, 800);
  };

  return (
    <div className={`min-h-screen pb-24 ${darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-50 text-slate-900'}`}>
      
      {/* Toast Alert */}
      {shareToast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-60 bg-slate-900 text-white px-4 py-2 rounded-xl shadow-xl text-xs font-bold flex items-center gap-2 border border-slate-700 animate-fade-in">
          <Check className="w-4 h-4 text-emerald-400" />
          <span>{isBn ? 'কাজের লিংক কপি করা হয়েছে!' : 'Job link copied to clipboard!'}</span>
        </div>
      )}

      {/* ========================================================= */}
      {/* VIEW 1: JOB DETAIL PAGE (Matching Screenshots 1, 2, 3)     */}
      {/* ========================================================= */}
      {!isSubmitMode ? (
        <div className="max-w-xl mx-auto px-4 pt-2 space-y-4">
          
          {/* Top Title Bar */}
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white truncate flex-1 pr-3">
              {isBn ? job.titleBn : job.title}
            </h1>
            <button
              type="button"
              onClick={onBack}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Translate Banner */}
          <div className="bg-sky-50 dark:bg-sky-950/40 border border-sky-100 dark:border-sky-900/50 rounded-xl p-3 flex items-center justify-between">
            <div className="flex items-center gap-2 text-blue-600 dark:text-blue-400 font-medium text-xs sm:text-sm">
              <Languages className="w-4 h-4" />
              <span>{isBn ? 'Translate this job' : 'এই কাজটি অনুবাদ করুন'}</span>
            </div>
            <button
              type="button"
              onClick={() => setIsTranslated(prev => !prev)}
              className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm hover:underline cursor-pointer"
            >
              <Languages className="w-4 h-4" />
              <span>{isBn ? 'Translate' : 'বাংলায় দেখুন'}</span>
            </button>
          </div>

          {/* Category & Target Country */}
          <div className="flex items-center justify-between text-xs sm:text-sm text-slate-600 dark:text-slate-400 px-0.5">
            <div className="flex items-center gap-1.5 truncate">
              <Folder className="w-4 h-4 text-slate-400 shrink-0" />
              <span className="truncate">
                {job.categoryName} • {job.subCategory || 'Download + Install'}
              </span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
              <MapPin className="w-4 h-4 text-slate-400" />
              <span>{job.targetCountry || 'International'}</span>
            </div>
          </div>

          {/* 4 Stat Metric Cards (2x2 Grid) */}
          <div className="grid grid-cols-2 gap-3">
            {/* Payment */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Payment</div>
              <div className="text-xl sm:text-2xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-1">
                {paymentFormatted}
              </div>
            </div>

            {/* Workers */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Workers</div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {completedWorkers} / {totalWorkers}
              </div>
            </div>

            {/* Time Left */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Time Left</div>
              <div className="text-xl sm:text-2xl font-extrabold text-orange-600 dark:text-orange-500 mt-1">
                18 days
              </div>
            </div>

            {/* Duration */}
            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
              <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Duration</div>
              <div className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1">
                {job.durationDays || 44} days
              </div>
            </div>
          </div>

          {/* Submission Progress */}
          <div className="space-y-1.5 px-0.5">
            <div className="flex items-center justify-between text-xs sm:text-sm">
              <span className="text-slate-600 dark:text-slate-400 font-medium">
                Submission Progress
              </span>
              <span className="font-bold text-slate-900 dark:text-white">
                {progressPercent}%
              </span>
            </div>
            <div className="w-full h-2 bg-slate-200 dark:bg-slate-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Divider */}
          <hr className="border-slate-200 dark:border-slate-800 my-2" />

          {/* Client Information */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Client Information
            </h2>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs">
              <div className="flex items-start gap-3.5">
                {/* Green Circle Avatar */}
                <div className="w-12 h-12 rounded-full bg-emerald-500 text-white font-extrabold text-xl flex items-center justify-center shrink-0 shadow-xs">
                  {job.employerName ? job.employerName.charAt(0).toUpperCase() : 'A'}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-base text-slate-900 dark:text-white truncate">
                      {job.employerName || 'Aabex'}
                    </span>
                    <a 
                      href="#view-profile"
                      onClick={(e) => e.preventDefault()}
                      className="text-emerald-500 hover:text-emerald-600 inline-flex items-center"
                      title="Client Profile"
                    >
                      <ExternalLink className="w-4 h-4" />
                    </a>
                    {job.employerVerified && <FacebookVerifiedBadge size="sm" />}
                  </div>

                  {/* Rating Stars */}
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="flex items-center text-amber-400">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star 
                          key={star} 
                          className={`w-3.5 h-3.5 ${star <= Math.round(job.employerRating || 3.3) ? 'fill-amber-400' : 'text-slate-300 dark:text-slate-600'}`} 
                        />
                      ))}
                    </div>
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                      {job.employerRating || 3.3}
                    </span>
                    <span className="text-xs text-slate-400">
                      ({job.employerRatingsCount || 29})
                    </span>
                  </div>

                  {/* Followers */}
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    {followerCount} followers
                  </div>

                  {/* Buttons: Rate User & Follow */}
                  <div className="flex items-center gap-2.5 mt-3">
                    <button
                      type="button"
                      onClick={() => setIsRateModalOpen(true)}
                      className="px-3.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center gap-1.5 transition cursor-pointer active:scale-95"
                    >
                      <Star className="w-3.5 h-3.5 text-slate-400" />
                      <span>Rate User</span>
                    </button>

                    <button
                      type="button"
                      onClick={handleToggleFollow}
                      className={`px-3.5 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer active:scale-95 ${
                        isFollowing 
                          ? 'bg-emerald-50 border-emerald-300 text-emerald-700 dark:bg-emerald-950/60 dark:border-emerald-800 dark:text-emerald-300'
                          : 'border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Following</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-3.5 h-3.5 text-slate-400" />
                          <span>Follow</span>
                        </>
                      )}
                    </button>
                  </div>

                </div>
              </div>
            </div>
          </div>

          {/* Job Description */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Job Description
            </h2>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed">
              <p>
                {isBn 
                  ? (job.descriptionBn || 'Blockbuster অ্যাপটি ডাউনলোড করুন, নতুন একটি অ্যাকাউন্ট তৈরি করুন, আপনার প্রোফাইল সম্পূর্ণ করুন এবং প্রয়োজনীয় স্ক্রিনশট জমা দিন। শুধুমাত্র নতুন ব্যবহারকারীদের জন্য।')
                  : (job.description || 'Download the Blockbuster app, create a new account, complete your profile, and submit the required screenshots. For new users only.')}
              </p>
            </div>
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Attachments
            </h2>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-3.5 border border-slate-100 dark:border-slate-800 shadow-2xs flex items-center justify-between">
              <div className="flex items-center gap-2.5 min-w-0">
                <FileText className="w-4 h-4 text-slate-400 shrink-0" />
                <span className="text-xs sm:text-sm text-slate-800 dark:text-slate-200 font-medium truncate">
                  {job.attachments?.[0]?.name || 'Screenshot_20260717-221554.jpg'}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setLightboxImage({
                    url: job.attachments?.[0]?.url || BLOCKBUSTER_EXAMPLE_1,
                    title: job.attachments?.[0]?.name || 'Screenshot_20260717-221554.jpg'
                  });
                }}
                className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 transition cursor-pointer"
                title="Download Attachment"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Notice Text Before Requirements */}
          <div className="bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 rounded-xl p-3 text-xs text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
            রেজিস্ট্রেশনের পর অন্তত ৩ দিন পর্যন্ত অ্যাপটি আনইনস্টল বা ডিলিট করবেন না।
          </div>

          {/* Requirements */}
          <div className="space-y-2">
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Requirements
            </h2>

            <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-4">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold text-xs sm:text-sm">
                <ImageIcon className="w-4 h-4" />
                <span>Screenshots Required</span>
              </div>

              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400">
                You must upload {totalScreenshots} screenshot(s) as proof of work
              </p>

              {/* List of Screenshot Requirements with Expected Example Images */}
              <div className="space-y-4 pt-1">
                {(requirements || []).map((req, index) => (
                  <div key={req.id || index} className="space-y-2">
                    <div className="flex items-start gap-2 text-xs sm:text-sm text-slate-800 dark:text-slate-200">
                      <span className="text-slate-400 font-bold">•</span>
                      <span className="leading-snug">
                        {isBn ? (req.descriptionBn || req.description) : req.description}
                      </span>
                    </div>

                    {/* Example Image Thumbnail */}
                    {req.exampleImage && (
                      <div 
                        onClick={() => setLightboxImage({
                          url: req.exampleImage!,
                          title: isBn ? (req.descriptionBn || req.description) : req.description
                        })}
                        className="group relative inline-block cursor-pointer overflow-hidden rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs hover:border-emerald-500 transition"
                      >
                        <img 
                          src={req.exampleImage} 
                          alt="Expected proof thumbnail" 
                          className="w-44 sm:w-52 h-24 sm:h-28 object-cover rounded-lg transition duration-200 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 transition flex items-center justify-center text-white text-xs font-bold gap-1 rounded-lg">
                          <Maximize2 className="w-3.5 h-3.5" />
                          <span>Zoom</span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>

            </div>
          </div>

          {/* Posted & Expires metadata */}
          <div className="flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 pb-8 px-1">
            <div>
              <span className="font-semibold">Posted:</span> Jul 18, 2026
            </div>
            <div>
              <span className="font-semibold">Expires:</span> Oct 1, 2026
            </div>
          </div>

        </div>
      ) : (
        /* ========================================================= */
        /* VIEW 2: SUBMIT YOUR WORK (Matching Screenshots 4 & 5)      */
        /* ========================================================= */
        <div className="max-w-xl mx-auto px-4 pt-2 space-y-4">
          
          {/* Top Title Bar */}
          <div className="flex items-center justify-between py-2 border-b border-slate-200 dark:border-slate-800">
            <h1 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              Submit Your Work
            </h1>
            <button
              type="button"
              onClick={() => setIsSubmitMode(false)}
              className="p-1 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Amber Notice Banner: Please read the submission rules */}
          <div className="bg-[#FEF9C3] dark:bg-amber-950/40 border border-[#FDE047] dark:border-amber-900/60 rounded-2xl p-3 flex items-center justify-between gap-2.5 shadow-2xs">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-7 h-7 rounded-full bg-amber-200/80 dark:bg-amber-900/80 flex items-center justify-center text-amber-800 dark:text-amber-200 shrink-0">
                <AlertTriangle className="w-4 h-4" />
              </div>
              <span className="text-xs font-semibold text-amber-950 dark:text-amber-100 truncate">
                Please read the submission rules before submitting
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsRulesModalOpen(true)}
              className="px-2.5 py-1.5 rounded-xl bg-amber-100 hover:bg-amber-200 dark:bg-amber-900/80 dark:hover:bg-amber-800 text-amber-900 dark:text-amber-100 border border-amber-300 dark:border-amber-700 text-xs font-bold whitespace-nowrap flex items-center gap-1 transition cursor-pointer shrink-0"
            >
              <BookOpen className="w-3.5 h-3.5 text-amber-800 dark:text-amber-200" />
              <span>Read Rules</span>
            </button>
          </div>

          {/* Job Info Summary Box */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-100 dark:border-slate-800 shadow-2xs space-y-1.5">
            <h2 className="font-bold text-base text-slate-900 dark:text-white leading-snug">
              {job.titleBn || job.title}
            </h2>
            <div className="flex items-center gap-2 text-xs sm:text-sm">
              <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                {paymentFormatted}
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-slate-500 dark:text-slate-400">
                {job.categoryName} / {job.subCategory || 'Download + Install'}
              </span>
            </div>
          </div>

          {/* Success Submitted View */}
          {(alreadyApplied || isSuccessSubmitted) ? (
            <div className="bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 rounded-2xl p-6 text-center space-y-3">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
              <h3 className="font-extrabold text-base text-emerald-900 dark:text-emerald-200">
                {isBn ? 'টাস্ক সফলভাবে জমা হয়েছে!' : 'Task Submitted Successfully!'}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 max-w-sm mx-auto">
                {isBn 
                  ? 'বায়ার আপনার প্রুফগুলো যাচাই করে দ্রুত পেমেন্ট অনুমোদন করবেন।' 
                  : 'The client will review your submitted proof and approve the payment.'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setIsSubmitMode(false);
                  onBack();
                }}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                {isBn ? 'অন্যান্য কাজ দেখুন' : 'Back to Jobs'}
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmitWork} className="space-y-4">
              
              {/* Proof of Work * Heading */}
              <div className="space-y-0.5">
                <div className="flex items-center gap-1 font-bold text-base text-slate-900 dark:text-white">
                  <span>Proof of Work</span>
                  <span className="text-rose-500">*</span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Click the choose file button to submit your screenshots/proof.
                </p>
              </div>

              {/* Requirement Items */}
              <div className="space-y-5">
                {(requirements || []).map((req, idx) => {
                  const uploaded = uploadedProofs[req.id];

                  return (
                    <div key={req.id || idx} className="space-y-2 pt-2">
                      
                      {/* Item Header & Screenshot Badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-start gap-1.5 flex-1 min-w-0">
                          <ImageIcon className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                          <span className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                            {isBn ? (req.descriptionBn || req.description) : req.description}
                            <span className="text-rose-500 ml-0.5">*</span>
                          </span>
                        </div>

                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-50 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                          Screenshot
                        </span>
                      </div>

                      {/* Click to see expected example blue box */}
                      <div 
                        onClick={() => setLightboxImage({
                          url: req.exampleImage || BLOCKBUSTER_EXAMPLE_1,
                          title: isBn ? (req.descriptionBn || req.description) : req.description
                        })}
                        className="bg-sky-50/70 hover:bg-sky-100/70 dark:bg-sky-950/30 dark:hover:bg-sky-900/40 border border-sky-200 dark:border-sky-900/60 rounded-xl p-2.5 flex items-center gap-3 cursor-pointer transition shadow-2xs"
                      >
                        <img 
                          src={req.exampleImage || BLOCKBUSTER_EXAMPLE_1} 
                          alt="Expected example" 
                          className="w-12 h-9 object-cover rounded-md border border-sky-200 dark:border-sky-800 shrink-0"
                        />
                        <span className="text-xs font-semibold text-blue-600 dark:text-blue-400">
                          Click to see expected example
                        </span>
                      </div>

                      {/* Choose File Button or Uploaded File status */}
                      <div>
                        {uploaded ? (
                          <div className="p-2.5 rounded-xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50/70 dark:bg-emerald-950/50 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <img 
                                src={uploaded.url} 
                                alt="Proof preview" 
                                className="w-10 h-8 object-cover rounded-md border border-emerald-200 shrink-0"
                              />
                              <div className="truncate">
                                <span className="text-xs font-bold text-emerald-900 dark:text-emerald-200 block truncate">
                                  {uploaded.name}
                                </span>
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400">
                                  {uploaded.size} • Attached ✓
                                </span>
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleRemoveProof(req.id)}
                              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-100 dark:hover:bg-rose-950 transition cursor-pointer"
                              title="Remove file"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-3">
                            <label 
                              htmlFor={`submit-file-${req.id}`}
                              className="bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-2xs cursor-pointer transition active:scale-95"
                            >
                              <Upload className="w-3.5 h-3.5 text-slate-500" />
                              <span>Choose File</span>
                            </label>
                            <input 
                              type="file"
                              id={`submit-file-${req.id}`}
                              accept="image/*"
                              onChange={(e) => handleFileUpload(req.id, e)}
                              className="hidden"
                            />

                            {/* Demo Sample button for instant fast verification */}
                            <button
                              type="button"
                              onClick={() => handleSetSampleProof(req.id, req.exampleImage)}
                              className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                            >
                              + Use Demo
                            </button>
                          </div>
                        )}
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* Optional Notes */}
              <div className="pt-2">
                <textarea
                  rows={2}
                  value={proofText}
                  onChange={(e) => setProofText(e.target.value)}
                  placeholder={isBn ? 'অতিরিক্ত কোনো মন্তব্য বা আইডি থাকলে লিখুন (ঐচ্ছিক)...' : 'Optional notes or username...'}
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white outline-hidden"
                />
              </div>

              {/* Spacing for bottom sticky bar */}
              <div className="h-10" />

            </form>
          )}

        </div>
      )}

      {/* ========================================================= */}
      {/* FIXED BOTTOM ACTION BAR                                   */}
      {/* ========================================================= */}
      <div 
        className={`fixed bottom-0 left-0 right-0 z-50 p-3 border-t backdrop-blur-md shadow-2xl ${
          darkMode ? 'bg-slate-900/98 border-slate-800' : 'bg-white/98 border-slate-200'
        }`}
        style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 12px)' }}
      >
        <div className="max-w-xl mx-auto flex items-center gap-2">
          
          {!isSubmitMode ? (
            /* Buttons for Job Detail View (Screenshots 1-3) */
            <>
              {/* Submit Now Primary Button */}
              <button
                type="button"
                id="job-submit-now-btn"
                disabled={alreadyApplied}
                onClick={() => {
                  setIsSubmitMode(true);
                  window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
                  if (typeof document !== 'undefined') {
                    document.documentElement.scrollTop = 0;
                    document.body.scrollTop = 0;
                  }
                }}
                className={`flex-1 py-3 px-4 rounded-xl text-white font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md active:scale-98 ${
                  alreadyApplied
                    ? 'bg-slate-400 dark:bg-slate-700 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
                }`}
              >
                <Send className="w-4 h-4" />
                <span>
                  {alreadyApplied
                    ? (isBn ? 'ইতিপূর্বে জমা দেওয়া হয়েছে' : 'Already Submitted')
                    : (isBn ? 'Submit Now (জমা দিন)' : 'Submit Now')}
                </span>
              </button>

              {/* Report Button */}
              <button
                type="button"
                onClick={() => setIsReportModalOpen(true)}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-rose-500 transition cursor-pointer"
                title="Report"
              >
                <Flag className="w-4 h-4" />
              </button>

              {/* Share Button */}
              <button
                type="button"
                onClick={handleShare}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Share"
              >
                <Share2 className="w-4 h-4" />
              </button>

              {/* Close Button */}
              <button
                type="button"
                onClick={onBack}
                className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 transition cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            </>
          ) : (
            /* Buttons for Submit Work View (Screenshots 4-5) */
            <>
              <button
                type="button"
                id="submit-work-action-btn"
                disabled={isSubmitting || isSuccessSubmitted}
                onClick={handleSubmitWork}
                className="flex-1 py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 transition cursor-pointer shadow-md shadow-emerald-600/20 active:scale-98 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Submitting...</span>
                ) : (
                  <span>Submit Work</span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsSubmitMode(false)}
                className="px-6 py-3 rounded-xl border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm transition cursor-pointer"
              >
                Cancel
              </button>
            </>
          )}

        </div>
      </div>

      {/* ========================================================= */}
      {/* MODAL 1: LIGHTBOX EXAMPLE IMAGE PREVIEW                   */}
      {/* ========================================================= */}
      {lightboxImage && (
        <div className="fixed inset-0 z-60 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative max-w-lg w-full bg-slate-900 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl p-4 space-y-3">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h4 className="text-xs sm:text-sm font-bold text-white truncate pr-2">
                {lightboxImage.title}
              </h4>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center p-1">
              <img 
                src={lightboxImage.url} 
                alt="Enlarged screenshot proof" 
                className="max-h-[65vh] w-auto object-contain rounded-lg"
              />
            </div>

            <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
              <span>Expected screenshot proof example</span>
              <button
                type="button"
                onClick={() => setLightboxImage(null)}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-bold text-xs cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 2: RULES & GUIDELINES                               */}
      {/* ========================================================= */}
      {isRulesModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-md w-full rounded-2xl border shadow-2xl p-5 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-bold text-sm">
                <BookOpen className="w-4 h-4" />
                <span>Job Rules & Guidelines</span>
              </div>
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed max-h-72 overflow-y-auto">
              {(rulesList || []).map((rule, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <span className="text-emerald-500 font-bold">✓</span>
                  <span>{rule}</span>
                </div>
              ))}
              <div className="flex items-start gap-2 text-amber-700 dark:text-amber-300 font-medium pt-1">
                <span className="font-bold">⚠️</span>
                <span>
                  Do not uninstall or delete the application for at least 3 days after registration. Submitting fake or edited proofs will lead to account suspension.
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-right">
              <button
                type="button"
                onClick={() => setIsRulesModalOpen(false)}
                className="px-4 py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl hover:bg-emerald-700 transition cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 3: RATE CLIENT                                      */}
      {/* ========================================================= */}
      {isRateModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border shadow-2xl p-5 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm">
                Rate Client ({job.employerName || 'Aabex'})
              </h3>
              <button
                type="button"
                onClick={() => setIsRateModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {rateSuccess ? (
              <div className="py-6 text-center space-y-2 text-emerald-600">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="font-bold text-xs">Rating submitted successfully!</p>
              </div>
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-center gap-2 py-2">
                  {[1, 2, 3, 4, 5].map(star => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRateStars(star)}
                      className="p-1 transition cursor-pointer hover:scale-110"
                    >
                      <Star className={`w-6 h-6 ${star <= rateStars ? 'text-amber-400 fill-amber-400' : 'text-slate-300'}`} />
                    </button>
                  ))}
                </div>

                <textarea
                  rows={2}
                  value={rateFeedback}
                  onChange={(e) => setRateFeedback(e.target.value)}
                  placeholder="Write feedback..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs outline-hidden"
                />

                <button
                  type="button"
                  onClick={() => {
                    setRateSuccess(true);
                    setTimeout(() => {
                      setIsRateModalOpen(false);
                      setRateSuccess(false);
                    }, 1000);
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  Submit Rating
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL 4: REPORT JOB                                       */}
      {/* ========================================================= */}
      {isReportModalOpen && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="max-w-sm w-full rounded-2xl border shadow-2xl p-5 space-y-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <h3 className="font-bold text-sm text-rose-500 flex items-center gap-1.5">
                <Flag className="w-4 h-4" />
                <span>Report Job</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2 text-emerald-600">
                <CheckCircle2 className="w-10 h-10 mx-auto" />
                <p className="font-bold text-xs">Report submitted. Moderation team will investigate.</p>
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <p className="text-slate-500">Select reason for reporting:</p>
                <div className="space-y-1.5">
                  {[
                    { id: 'scam', label: 'Fake / Scam job' },
                    { id: 'broken_link', label: 'Broken link or app not found' },
                    { id: 'unreasonable', label: 'Unreasonable requirements' },
                    { id: 'offensive', label: 'Offensive content' }
                  ].map(item => (
                    <label key={item.id} className="flex items-center gap-2 cursor-pointer p-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                      <input 
                        type="radio" 
                        name="reportReason" 
                        checked={reportReason === item.id} 
                        onChange={() => setReportReason(item.id)} 
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setReportSuccess(true);
                    setTimeout(() => {
                      setIsReportModalOpen(false);
                      setReportSuccess(false);
                    }, 1200);
                  }}
                  className="w-full py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl transition cursor-pointer mt-2"
                >
                  Confirm Report
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
};
