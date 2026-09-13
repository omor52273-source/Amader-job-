import React, { useState, useId } from 'react';
import { 
  X, 
  Plus, 
  Trash2, 
  DollarSign, 
  Users, 
  HelpCircle, 
  CheckCircle2, 
  AlertCircle,
  Globe,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  FileText,
  Image as ImageIcon,
  Paperclip,
  Calendar,
  ChevronDown,
  Info,
  Lightbulb,
  Rocket
} from 'lucide-react';
import { Job, Language, Currency, JobCategory, UserProfile } from '../types';

interface PostJobModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitJob: (jobData: Omit<Job, 'id' | 'createdAt' | 'completedSlots' | 'status'>) => void;
  user: UserProfile;
  language: Language;
  currency: Currency;
  darkMode?: boolean;
}

interface CategoryItem {
  id: string;
  name: string;
  nameBn: string;
  count: number;
  minPayUSD: number;
  minPayBDT: number;
  subcategories: string[];
}

const CATEGORIES_DATA: CategoryItem[] = [
  {
    id: 'ads_click_seo',
    name: 'Ads Click, SEO, Visit, Search, Engage',
    nameBn: 'অ্যাডস ক্লিক, এসইও, ভিজিট, সার্চ ও এঙ্গেজ',
    count: 15,
    minPayUSD: 0.03,
    minPayBDT: 3.0,
    subcategories: [
      'Google Search & Visit Website',
      'Visit Website & Click 2 Ads',
      'Browse 3 Pages (Stay 2 Min)',
      'SEO Keyword Search & Engage',
      'Organic Traffic & 60s Stay'
    ]
  },
  {
    id: 'airdrop_offer',
    name: 'Airdrop/Offer Join',
    nameBn: 'এয়ারড্রপ ও অফার জয়েন',
    count: 7,
    minPayUSD: 0.05,
    minPayBDT: 5.0,
    subcategories: [
      'Crypto Airdrop Bot Registration',
      'Complete KYC & Claim Reward',
      'Testnet Task Completion',
      'Telegram Airdrop Task'
    ]
  },
  {
    id: 'answers',
    name: 'Answers',
    nameBn: 'প্রশ্নের উত্তর প্রদান',
    count: 3,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'Yahoo Answers / Brainly Solution',
      'StackOverflow / Forum Answer',
      'Community Q&A Participation'
    ]
  },
  {
    id: 'comment_blogs',
    name: 'Comment on other blogs',
    nameBn: 'অন্যান্য ব্লগে কমেন্ট',
    count: 4,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'WordPress / Blogger Post Comment',
      'Tech Blog Discussion Comment',
      'News Portal Positive Feedback'
    ]
  },
  {
    id: 'computer_programs',
    name: 'Computer Programs',
    nameBn: 'কম্পিউটার প্রোগ্রাম ও সফটওয়্যার',
    count: 2,
    minPayUSD: 0.10,
    minPayBDT: 10.0,
    subcategories: [
      'Software Download & Install (.exe)',
      'Browser Extension Install & Pin',
      'GitHub Repository Star & Fork'
    ]
  },
  {
    id: 'data_entry',
    name: 'Data Entry',
    nameBn: 'ডাটা এন্ট্রি',
    count: 16,
    minPayUSD: 0.06,
    minPayBDT: 6.0,
    subcategories: [
      'Copy Paste 50 Records in Excel',
      'Business Card Contact Entry',
      'Web Scraping & Clean Data',
      'Form Filling (Google Form)'
    ]
  },
  {
    id: 'discord',
    name: 'Discord',
    nameBn: 'ডিসকর্ড',
    count: 4,
    minPayUSD: 0.05,
    minPayBDT: 5.0,
    subcategories: [
      'Server Join & Verify (#rules)',
      'Chat 20 Messages in General',
      'Invite 3 Friends to Discord'
    ]
  },
  {
    id: 'facebook',
    name: 'Facebook',
    nameBn: 'ফেসবুক',
    count: 49,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'Page Like & Follow',
      'Post Share to Group/Timeline',
      'Post Comment & Reaction (❤️ / 👍)',
      'Group Join & Answer Questions',
      'Watch Video + Like + Share'
    ]
  },
  {
    id: 'forums',
    name: 'Forums',
    nameBn: 'ফোরাম ও কমিউনিটি',
    count: 5,
    minPayUSD: 0.05,
    minPayBDT: 5.0,
    subcategories: [
      'Register Forum Account',
      'Create New Discussion Thread',
      'Reply to 3 Threads with Link'
    ]
  },
  {
    id: 'gmail_account',
    name: 'Gmail Account',
    nameBn: 'জিমেইল একাউন্ট তৈরি',
    count: 7,
    minPayUSD: 0.12,
    minPayBDT: 12.0,
    subcategories: [
      'Create New Gmail Account (With Recovery)',
      'Fresh Gmail with Bangla Name',
      'USA IP Gmail Account'
    ]
  },
  {
    id: 'identity_verification',
    name: 'Identity Verification',
    nameBn: 'আইডেন্টিটি ভেরিফিকেশন',
    count: 3,
    minPayUSD: 0.20,
    minPayBDT: 20.0,
    subcategories: [
      'Email & Phone KYC Verification',
      'App KYC Submission'
    ]
  },
  {
    id: 'instagram',
    name: 'Instagram',
    nameBn: 'ইনস্টাগ্রাম',
    count: 8,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'Follow Instagram Profile',
      'Like & Save Recent 5 Posts',
      'Leave Relevant Comment',
      'Reels Full Watch & Like'
    ]
  },
  {
    id: 'linkedin',
    name: 'Linkedin',
    nameBn: 'লিঙ্কডইন',
    count: 4,
    minPayUSD: 0.06,
    minPayBDT: 6.0,
    subcategories: [
      'Follow Company Page',
      'Connect with Profile',
      'Like & Repost Article'
    ]
  },
  {
    id: 'medium',
    name: 'Medium',
    nameBn: 'মিডিয়াম',
    count: 4,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'Follow Medium Author',
      'Clap 50 Times on Article',
      'Highlight & Leave Response'
    ]
  },
  {
    id: 'mobile_application',
    name: 'Mobile Application',
    nameBn: 'মোবাইল অ্যাপ্লিকেশন',
    count: 5,
    minPayUSD: 0.09,
    minPayBDT: 9.0,
    subcategories: [
      'Download & Create Account',
      'Download & Visit',
      'Download + Install',
      'Download + Install + Review',
      'Download only'
    ]
  },
  {
    id: 'other',
    name: 'Other',
    nameBn: 'অন্যান্য',
    count: 1,
    minPayUSD: 0.03,
    minPayBDT: 3.0,
    subcategories: [
      'Custom Task',
      'Special Instructions Task'
    ]
  },
  {
    id: 'promotion',
    name: 'Promotion',
    nameBn: 'প্রমোশন ও প্রচার',
    count: 4,
    minPayUSD: 0.05,
    minPayBDT: 5.0,
    subcategories: [
      'WhatsApp Status Promotion',
      'Facebook Story Banner Share',
      'Share Referral Link in 5 Groups'
    ]
  },
  {
    id: 'quora',
    name: 'Quora',
    nameBn: 'কোওরা',
    count: 3,
    minPayUSD: 0.05,
    minPayBDT: 5.0,
    subcategories: [
      'Upvote Answer',
      'Post Answer with Link'
    ]
  },
  {
    id: 'reddit',
    name: 'Reddit',
    nameBn: 'রেডিট',
    count: 3,
    minPayUSD: 0.05,
    minPayBDT: 5.0,
    subcategories: [
      'Upvote Post & Comment',
      'Join Subreddit & Comment'
    ]
  },
  {
    id: 'review',
    name: 'Review',
    nameBn: 'রিভিউ ও রেটিং',
    count: 5,
    minPayUSD: 0.08,
    minPayBDT: 8.0,
    subcategories: [
      'Google Maps 5-Star Review & Photo',
      'Trustpilot Positive Review',
      'Play Store App 5-Star Review'
    ]
  },
  {
    id: 'sign_up',
    name: 'Sign Up',
    nameBn: 'সাইনআপ ও রেজিস্ট্রেশন',
    count: 3,
    minPayUSD: 0.06,
    minPayBDT: 6.0,
    subcategories: [
      'Website Simple Registration',
      'Email Confirmation Sign Up',
      'App Registration & OTP Verify'
    ]
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    nameBn: 'স্ন্যাপচ্যাট',
    count: 1,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'Add Friend / Subscribe',
      'View Story & Screenshot'
    ]
  },
  {
    id: 'survey',
    name: 'Survey',
    nameBn: 'সার্ভে ও প্রশ্নাবলী',
    count: 4,
    minPayUSD: 0.08,
    minPayBDT: 8.0,
    subcategories: [
      'Complete 5-Minute Survey',
      'Consumer Feedback Form'
    ]
  },
  {
    id: 'telegram',
    name: 'Telegram',
    nameBn: 'টেলিগ্রাম',
    count: 7,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'Channel / Group Join',
      'Bot Start & Verification',
      'Forward Message to 5 Chats'
    ]
  },
  {
    id: 'tiktok',
    name: 'Tiktok',
    nameBn: 'টিকটক',
    count: 9,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'Follow Account',
      'Watch Full Video + Like',
      'Comment & Favorite'
    ]
  },
  {
    id: 'toffee',
    name: 'Toffee',
    nameBn: 'টফি',
    count: 10,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'Install & Subscribe Channel',
      'Watch Video on Toffee (3 Mins)'
    ]
  },
  {
    id: 'twitter',
    name: 'Twitter',
    nameBn: 'টুইটার (X)',
    count: 11,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'Follow Twitter / X Account',
      'Retweet (RT) & Like Pin Post',
      'Quote Tweet with Hashtags'
    ]
  },
  {
    id: 'whats_app',
    name: 'Whats-App',
    nameBn: 'হোয়াটসঅ্যাপ',
    count: 2,
    minPayUSD: 0.04,
    minPayBDT: 4.0,
    subcategories: [
      'Join WhatsApp Community / Group',
      'Save Contact & Send Message'
    ]
  },
  {
    id: 'youtube',
    name: 'Youtube',
    nameBn: 'ইউটিউব',
    count: 49,
    minPayUSD: 0.05,
    minPayBDT: 5.0,
    subcategories: [
      'Subscribe + Full Watch + Like',
      'Watch (3-5 Minutes) + Like',
      'Video Comment & Share',
      'Shorts Watch & Like',
      'Channel Subscribe + Bell Icon'
    ]
  }
];

interface ProofSlot {
  id: string;
  type: 'screenshot' | 'text';
  label: string;
}

export const PostJobModal: React.FC<PostJobModalProps> = ({
  isOpen,
  onClose,
  onSubmitJob,
  user,
  language,
  currency,
  darkMode = false
}) => {
  const isBn = language === 'bn';
  const modalAutoVerifyId = useId();

  // Wizard Step State (1: Location, 2: Category, 3: Job Details, 4: Budget & Publish)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Location
  const [locationType, setLocationType] = useState<'international' | 'specific'>('international');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['Bangladesh']);

  // Step 2: Category & Subcategory
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('mobile_application');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Download & Create Account');

  // Step 3: Job Details
  const [jobTitle, setJobTitle] = useState('');
  const [description, setDescription] = useState('');
  const [instructions, setInstructions] = useState(
    '1. Go to Google Play Store\n2. Search the app name\n3. Install the app & register\n4. Take a clear screenshot of profile'
  );
  const [attachments, setAttachments] = useState<string[]>([]);
  const [proofs, setProofs] = useState<ProofSlot[]>([
    { id: '1', type: 'screenshot', label: 'App home screen screenshot' }
  ]);
  const [autoVerification, setAutoVerification] = useState(false);

  // Step 4: Budget & Publish
  const [workersCount, setWorkersCount] = useState<number>(68);
  const selectedCategoryObj = CATEGORIES_DATA.find(c => c.id === selectedCategoryId) || CATEGORIES_DATA[0];
  const minRateUSD = selectedCategoryObj.minPayUSD || 0.09;
  const [paymentPerWorkerUSD, setPaymentPerWorkerUSD] = useState<number>(0.10);

  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  const [expiryDate] = useState<string>(
    defaultDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  // Financial Calculations
  const workersCostUSD = workersCount * paymentPerWorkerUSD;
  const serviceFeeUSD = Math.round(workersCostUSD * 0.08 * 100) / 100;
  const totalRequiredUSD = Math.round((workersCostUSD + serviceFeeUSD) * 100) / 100;
  const userBalanceUSD = user.depositBalanceUSD || 0.08;
  const balanceAfterUSD = userBalanceUSD - totalRequiredUSD;

  const handleAddProofSlot = () => {
    if (proofs.length >= 5) return;
    setProofs([
      ...proofs,
      {
        id: (proofs.length + 1).toString(),
        type: 'screenshot',
        label: ''
      }
    ]);
  };

  const handleRemoveProofSlot = (idx: number) => {
    if (proofs.length <= 1) return;
    setProofs(proofs.filter((_, i) => i !== idx).map((p, i) => ({ ...p, id: (i + 1).toString() })));
  };

  const validateAndNext = () => {
    setFormError(null);
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedCategoryId || !selectedSubcategory) {
        setFormError('Please select both a category and subcategory.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!jobTitle.trim() || !description.trim() || !instructions.trim()) {
        setFormError('Please complete all required fields.');
        return;
      }
      if (proofs.some(p => !p.label.trim())) {
        setFormError('Please provide a label for each proof slot.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePublishJob = () => {
    setFormError(null);
    if (workersCount < 1) {
      setFormError('Minimum 1 worker required.');
      return;
    }
    if (paymentPerWorkerUSD < minRateUSD) {
      setFormError(`Minimum pay for this category is $${minRateUSD.toFixed(2)}.`);
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      onSubmitJob({
        title: jobTitle.trim(),
        titleBn: jobTitle.trim(),
        category: (selectedCategoryObj.id || 'other') as JobCategory,
        categoryName: selectedCategoryObj.name,
        categoryNameBn: selectedCategoryObj.nameBn,
        employerId: user.uid || user.id,
        employerName: user.name,
        employerAvatar: user.avatar,
        employerRating: 5.0,
        employerRatingsCount: 1,
        employerFollowers: 0,
        employerVerified: user.isVerified || false,
        payPerTaskUSD: paymentPerWorkerUSD,
        payPerTaskBDT: Math.round(paymentPerWorkerUSD * 120 * 100) / 100,
        totalSlots: workersCount,
        estimatedMinutes: 3,
        targetCountry: locationType === 'international' ? 'International (Worldwide)' : selectedCountries.join(', '),
        targetCountryBn: locationType === 'international' ? 'আন্তর্জাতিক (বিশ্বব্যাপী)' : selectedCountries.join(', '),
        instructions: instructions.split('\n').filter(s => s.trim().length > 0),
        instructionsBn: instructions.split('\n').filter(s => s.trim().length > 0),
        rules: [description.trim(), 'Submit genuine proof only'],
        rulesBn: [description.trim(), 'শুধুমাত্র আসল প্রমাণ জমা দিন'],
        proofRequirements: proofs.map((p, idx) => ({
          id: `proof-${idx + 1}`,
          type: p.type,
          description: p.label.trim(),
          descriptionBn: p.label.trim(),
          isRequired: true
        })),
        durationDays: 7,
        tags: [selectedCategoryObj.name, selectedSubcategory]
      });
      setIsSubmitting(false);
      onClose();
    }, 600);
  };

  const stepLabels = ['Location', 'Category', 'Job Details', 'Budget & Publish'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl my-auto p-4 sm:p-6 space-y-4 max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-start justify-between gap-3 shrink-0">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Create New Job - MicroJob
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Create a new job posting for freelancers
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Stepper Header */}
        <div className="flex flex-col items-center justify-center pt-1 pb-1 shrink-0">
          <div className="flex items-center justify-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 1 ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-100' : currentStep > 1 ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-400'
            }`}>
              {currentStep > 1 ? <Check className="w-3.5 h-3.5" /> : '1'}
            </div>
            <div className={`h-0.5 w-6 sm:w-10 ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 2 ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-100' : currentStep > 2 ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-400'
            }`}>
              {currentStep > 2 ? <Check className="w-3.5 h-3.5" /> : '2'}
            </div>
            <div className={`h-0.5 w-6 sm:w-10 ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 3 ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-100' : currentStep > 3 ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-400'
            }`}>
              {currentStep > 3 ? <Check className="w-3.5 h-3.5" /> : '3'}
            </div>
            <div className={`h-0.5 w-6 sm:w-10 ${currentStep >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${
              currentStep === 4 ? 'bg-blue-600 text-white shadow-xs ring-2 ring-blue-100' : 'bg-emerald-600 text-white'
            }`}>
              {currentStep === 4 ? '4' : <Check className="w-3.5 h-3.5" />}
            </div>
          </div>
          <span className="text-blue-600 font-semibold text-xs mt-1.5">{stepLabels[currentStep - 1]}</span>
        </div>

        {/* Scrollable Form Content */}
        <div className="flex-1 overflow-y-auto space-y-4 pr-1 custom-scrollbar">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{formError}</span>
            </div>
          )}

          {/* STEP 1: Location */}
          {currentStep === 1 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Location Targeting</h3>
                <p className="text-xs text-slate-500">Choose where you want to target workers for this job</p>
              </div>
              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => setLocationType('international')}
                  className={`w-full p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    locationType === 'international' ? 'border-2 border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-sm">
                    <Globe className="w-4 h-4 text-emerald-600" />
                    <span>International</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Available to all countries</span>
                </button>

                <button
                  type="button"
                  onClick={() => setLocationType('specific')}
                  className={`w-full p-3.5 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                    locationType === 'specific' ? 'border-2 border-emerald-500 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-sm">
                    <MapPin className="w-4 h-4 text-emerald-600" />
                    <span>Specific Countries</span>
                  </div>
                  <span className="text-[11px] text-slate-500">Select specific zones/countries</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 2: Category */}
          {currentStep === 2 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Category Selection</h3>
                <p className="text-xs text-slate-500">Choose a category and subcategory for your job</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">Category</label>
                <div className="max-h-[220px] overflow-y-auto space-y-1.5 pr-1 border border-slate-100 rounded-xl p-1">
                  {CATEGORIES_DATA.map((cat) => (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        if (cat.subcategories.length > 0) setSelectedSubcategory(cat.subcategories[0]);
                      }}
                      className={`w-full px-3 py-2 rounded-lg border text-left text-xs transition flex items-center justify-between cursor-pointer ${
                        selectedCategoryId === cat.id ? 'border-2 border-emerald-500 bg-emerald-50/20 font-bold text-slate-900' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      <span>{cat.name}</span>
                      <span className="text-[10px] text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-sm">{cat.count}</span>
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">Subcategory</label>
                <div className="border border-slate-200 rounded-xl p-2 space-y-1.5 bg-slate-50/40">
                  {(selectedCategoryObj?.subcategories || []).map((sub) => (
                    <button
                      type="button"
                      key={sub}
                      onClick={() => setSelectedSubcategory(sub)}
                      className={`w-full px-3 py-2 rounded-lg border text-left text-xs transition cursor-pointer ${
                        selectedSubcategory === sub ? 'border-2 border-emerald-500 bg-emerald-50/30 text-slate-900 font-bold' : 'border-slate-200 bg-white text-slate-700'
                      }`}
                    >
                      {sub}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* STEP 3: Job Details */}
          {currentStep === 3 && (
            <div className="space-y-3.5">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Job Details</h3>
                <p className="text-xs text-slate-500">Provide detailed information about the job</p>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 block">Job Title *</label>
                <input
                  type="text"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  placeholder="Enter a clear and descriptive job title"
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-emerald-500"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 block">Description *</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={2}
                  placeholder="Describe what the job is about..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-900 block">Instructions *</label>
                <textarea
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  rows={3}
                  placeholder="Provide step-by-step instructions..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-200 text-xs outline-none focus:border-emerald-500 resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 block">Proof Requirements *</label>
                {proofs.map((proof, idx) => (
                  <div key={proof.id} className="p-2.5 rounded-lg border border-slate-200 bg-slate-50 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-bold flex items-center justify-center">{idx + 1}</span>
                        <div className="flex items-center bg-white rounded border border-slate-200 p-0.5">
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...proofs];
                              updated[idx].type = 'screenshot';
                              setProofs(updated);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${proof.type === 'screenshot' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                          >
                            Screenshot
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...proofs];
                              updated[idx].type = 'text';
                              setProofs(updated);
                            }}
                            className={`px-2 py-0.5 rounded text-[10px] font-semibold ${proof.type === 'text' ? 'bg-emerald-600 text-white' : 'text-slate-600'}`}
                          >
                            Text
                          </button>
                        </div>
                      </div>
                      {proofs.length > 1 && (
                        <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600 cursor-pointer" onClick={() => handleRemoveProofSlot(idx)} />
                      )}
                    </div>
                    <input
                      type="text"
                      value={proof.label}
                      onChange={(e) => {
                        const updated = [...proofs];
                        updated[idx].label = e.target.value;
                        setProofs(updated);
                      }}
                      placeholder="Label (e.g. Profile screenshot)"
                      className="w-full px-2.5 py-1.5 rounded border border-slate-200 bg-white text-xs outline-none"
                    />
                  </div>
                ))}
                {proofs.length < 5 && (
                  <button type="button" onClick={handleAddProofSlot} className="text-xs font-semibold text-emerald-600 hover:underline flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Proof ({proofs.length}/5)</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* STEP 4: Budget & Publish */}
          {currentStep === 4 && (
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Budget & Publish</h3>
                <p className="text-xs text-slate-500">Set your budget and publish your job</p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">Number of Workers Needed *</label>
                <input
                  type="number"
                  min={1}
                  value={workersCount}
                  onChange={(e) => setWorkersCount(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[10, 25, 50, 100, 500].map(c => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setWorkersCount(c)}
                      className="px-2.5 py-1 rounded-md border border-slate-200 text-[11px] font-semibold hover:bg-slate-50"
                    >
                      +{c} Workers
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 block">Payment Per Worker ($) *</label>
                <input
                  type="number"
                  step="0.01"
                  min={minRateUSD}
                  value={paymentPerWorkerUSD}
                  onChange={(e) => setPaymentPerWorkerUSD(parseFloat(e.target.value) || minRateUSD)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold"
                />
                <span className="text-[10px] text-slate-400">Minimum: ${minRateUSD.toFixed(2)} per worker</span>
              </div>

              {/* Cost Breakdown */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
                <div className="font-bold text-slate-900">Cost Breakdown</div>
                <div className="flex justify-between text-slate-600">
                  <span>Workers Cost ({workersCount} × ${paymentPerWorkerUSD.toFixed(4)})</span>
                  <span className="font-bold text-slate-900">${workersCostUSD.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Service Fee (8%)</span>
                  <span className="font-bold text-slate-900">${serviceFeeUSD.toFixed(2)}</span>
                </div>
                <div className="border-t border-slate-200 pt-1.5 flex justify-between font-bold">
                  <span>Balance After</span>
                  <span className={balanceAfterUSD >= 0 ? 'text-emerald-600' : 'text-rose-600'}>
                    ${balanceAfterUSD.toFixed(2)}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between shrink-0">
          {currentStep > 1 ? (
            <button
              type="button"
              onClick={() => setCurrentStep(currentStep - 1)}
              className="px-4 py-2 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Previous</span>
            </button>
          ) : (
            <div />
          )}

          {currentStep < 4 ? (
            <button
              type="button"
              onClick={validateAndNext}
              className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <span>Next</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              disabled={isSubmitting}
              onClick={handlePublishJob}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Rocket className="w-4 h-4" />
              <span>{isSubmitting ? 'Publishing...' : 'Publish Now'}</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
