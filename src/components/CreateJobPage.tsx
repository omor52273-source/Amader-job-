import React, { useState, useId } from 'react';
import { 
  Globe, 
  MapPin, 
  ArrowLeft, 
  ArrowRight, 
  Check, 
  AlertCircle, 
  Info, 
  Calendar, 
  FileText, 
  Image as ImageIcon, 
  Plus, 
  Trash2, 
  Rocket, 
  Paperclip, 
  X, 
  ChevronDown,
  Lightbulb,
  CheckCircle2,
  DollarSign
} from 'lucide-react';
import { UserProfile, Language, Currency, Job, JobCategory } from '../types';

interface CreateJobPageProps {
  user: UserProfile;
  language: Language;
  currency: Currency;
  onJobCreated: (job: Job) => void;
  onOpenDeposit: () => void;
  onBack: () => void;
  initialJobData?: Job | null;
  isEditing?: boolean;
}

// 29 Specific Categories matching the screenshot exactly
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
      'Organic Traffic & 60s Stay',
      'Scroll & Internal Link Click'
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
      'Wallet Connection & Claim',
      'Telegram Airdrop Task',
      'Zealy / Galxe Quest Complete'
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
      'Community Q&A Participation',
      'Educational Question Answer'
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
      'News Portal Positive Feedback',
      'Guest Post Comment with Backlink'
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
      'GitHub Repository Star & Fork',
      'Run Desktop Benchmark'
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
      'Form Filling (Google Form)',
      'Product Upload to Shopify/WooCommerce',
      'Image to Text Typing'
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
      'Invite 3 Friends to Discord',
      'Claim Server Role & React'
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
      'Watch Video + Like + Share',
      'Write 5-Star Facebook Page Review'
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
      'Reply to 3 Threads with Link',
      'Forum Signature Link Placement',
      'Profile Backlink Creation'
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
      'USA IP Gmail Account',
      'Create Google Workspace Account'
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
      'App KYC Submission',
      'ID Document Verification'
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
      'Reels Full Watch & Like',
      'Story Mention & Share'
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
      'Like & Repost Article',
      'Endorse 3 Skills'
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
      'Highlight & Leave Response',
      'Share Article to Twitter'
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
      'Share Referral Link in 5 Groups',
      'Flyer / Banner Post'
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
      'Post Answer with Link',
      'Follow Space / Topic'
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
      'Join Subreddit & Comment',
      'Post Link to Subreddit'
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
      'SiteJabber Review',
      'Play Store App 5-Star Review',
      'Product Review with Text'
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
      'Sign Up with Referral Code',
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
      'Consumer Feedback Form',
      'Google Form Questionnaire',
      'Product Opinion Survey'
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
      'Forward Message to 5 Chats',
      'Stay 7 Days in Channel'
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
      'Comment & Favorite',
      'Duet / Stitch Video'
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
      'Watch Video on Toffee (3 Mins)',
      'Like & Share to Social Media'
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
      'Quote Tweet with Hashtags',
      'Comment on Tweet'
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
      'Save Contact & Send Message',
      'Share Link to 5 Statuses'
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
  exampleImage?: string;
}

export const CreateJobPage: React.FC<CreateJobPageProps> = ({
  user,
  language,
  currency,
  onJobCreated,
  onOpenDeposit,
  onBack,
  initialJobData,
  isEditing = false
}) => {
  const isBn = language === 'bn';
  const autoVerifyId = useId();

  // Wizard Step State (1: Location, 2: Category, 3: Job Details, 4: Budget & Publish)
  const [currentStep, setCurrentStep] = useState<number>(1);

  // Step 1: Location
  const [locationType, setLocationType] = useState<'international' | 'specific'>('international');
  const [selectedCountries, setSelectedCountries] = useState<string[]>(['Bangladesh']);

  // Step 2: Category & Subcategory
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>('mobile_application');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('Download & Create Account');

  // Step 3: Job Details
  const [jobTitle, setJobTitle] = useState(initialJobData?.title || '');
  const [description, setDescription] = useState(initialJobData?.rules?.[0] || '');
  const [instructions, setInstructions] = useState(
    initialJobData?.instructions?.join('\n') || 
    '1. Go to Google Play Store\n2. Search the app name\n3. Install the app & register\n4. Take a clear screenshot of profile'
  );
  const [attachments, setAttachments] = useState<string[]>([]);
  const [proofs, setProofs] = useState<ProofSlot[]>([
    { id: '1', type: 'screenshot', label: 'App home screen screenshot', exampleImage: '' }
  ]);
  const [autoVerification, setAutoVerification] = useState(false);
  const [autoQuestions, setAutoQuestions] = useState([
    { question: 'What is your registered username/phone?', expectedAnswer: '' }
  ]);

  // Step 4: Budget & Publish
  const [workersCount, setWorkersCount] = useState<number>(initialJobData?.totalSlots || 68);
  const selectedCategoryObj = CATEGORIES_DATA.find(c => c.id === selectedCategoryId) || CATEGORIES_DATA[0];
  
  const minRateUSD = selectedCategoryObj.minPayUSD || 0.09;
  const minRateBDT = selectedCategoryObj.minPayBDT || 9.0;
  
  const [paymentPerWorkerUSD, setPaymentPerWorkerUSD] = useState<number>(
    initialJobData ? initialJobData.payPerTaskUSD : 0.10
  );

  // Expiry Date (default 7 days from now)
  const defaultDate = new Date();
  defaultDate.setDate(defaultDate.getDate() + 7);
  const [expiryDate, setExpiryDate] = useState<string>(
    defaultDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  );

  const [formError, setFormError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Financial Calculations
  const workersCostUSD = workersCount * paymentPerWorkerUSD;
  const serviceFeeRate = 0.08; // 8% standard micro-service fee
  const serviceFeeUSD = Math.round(workersCostUSD * serviceFeeRate * 100) / 100;
  const totalRequiredUSD = Math.round((workersCostUSD + serviceFeeUSD) * 100) / 100;
  const userBalanceUSD = user.depositBalanceUSD || 0.08;
  const balanceAfterUSD = userBalanceUSD - totalRequiredUSD;
  const hasSufficientDeposit = userBalanceUSD >= totalRequiredUSD;

  // Handlers for Proofs
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
    const updated = proofs.filter((_, i) => i !== idx).map((p, i) => ({ ...p, id: (i + 1).toString() }));
    setProofs(updated);
  };

  const handleUpdateProof = (index: number, field: keyof ProofSlot, value: any) => {
    const updated = [...proofs];
    updated[index] = { ...updated[index], [field]: value };
    setProofs(updated);
  };

  // Step Validation
  const validateAndNext = () => {
    setFormError(null);
    if (currentStep === 1) {
      setCurrentStep(2);
    } else if (currentStep === 2) {
      if (!selectedCategoryId) {
        setFormError(isBn ? 'একটি ক্যাটেগরি নির্বাচন করুন।' : 'Please select a category.');
        return;
      }
      if (!selectedSubcategory) {
        setFormError(isBn ? 'একটি সাবক্যাটেগরি নির্বাচন করুন।' : 'Please select a subcategory.');
        return;
      }
      setCurrentStep(3);
    } else if (currentStep === 3) {
      if (!jobTitle.trim()) {
        setFormError(isBn ? 'কাজের শিরোনাম লিখুন।' : 'Please enter a clear job title.');
        return;
      }
      if (!description.trim()) {
        setFormError(isBn ? 'কাজের বিবরণ লিখুন।' : 'Please describe what the job is about.');
        return;
      }
      if (!instructions.trim()) {
        setFormError(isBn ? 'কাজের নির্দেশনাবলী প্রদান করুন।' : 'Please provide step-by-step instructions.');
        return;
      }
      const emptyProof = proofs.some(p => !p.label.trim());
      if (emptyProof) {
        setFormError(isBn ? 'সকল প্রুফের লেবেল পূরণ করুন।' : 'Please fill in label for all proof requirements.');
        return;
      }
      setCurrentStep(4);
    }
  };

  const handlePublishJob = () => {
    setFormError(null);

    if (workersCount < 1) {
      setFormError(isBn ? 'সর্বনিম্ন ১ জন কর্মী প্রয়োজন।' : 'Minimum 1 worker required.');
      return;
    }

    if (paymentPerWorkerUSD < minRateUSD) {
      setFormError(
        isBn 
          ? `এই ক্যাটাগরির সর্বনিম্ন পারিশ্রমিক $${minRateUSD.toFixed(2)} / ৳${minRateBDT.toFixed(2)}` 
          : `Minimum payment for this category is $${minRateUSD.toFixed(2)} per worker.`
      );
      return;
    }

    if (!hasSufficientDeposit) {
      setFormError(
        isBn
          ? `পর্যাপ্ত ডিপোজিট ব্যালেন্স নেই। প্রয়োজন: $${totalRequiredUSD.toFixed(2)} (৳${(totalRequiredUSD * 120).toFixed(2)})`
          : `Insufficient deposit balance. Required: $${totalRequiredUSD.toFixed(2)}, available: $${userBalanceUSD.toFixed(2)}`
      );
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Map to Job model
      const newJob: Job = {
        id: initialJobData ? initialJobData.id : Math.floor(1000000 + Math.random() * 9000000).toString(),
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
        completedSlots: initialJobData ? initialJobData.completedSlots : 0,
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
        autoApproveDays: 3,
        createdAt: new Date().toISOString(),
        durationDays: 7,
        tags: [selectedCategoryObj.name, selectedSubcategory],
        status: 'active'
      };

      // Deduct deposit balance
      user.depositBalanceUSD = Math.max(0, user.depositBalanceUSD - totalRequiredUSD);
      user.depositBalanceBDT = user.depositBalanceUSD * 120;
      user.postedJobsCount = (user.postedJobsCount || 0) + 1;

      setIsSubmitting(false);
      onJobCreated(newJob);
    }, 600);
  };

  // Step Indicator Label Text
  const stepLabels = ['Location', 'Category', 'Job Details', 'Budget & Publish'];

  return (
    <div className="max-w-2xl mx-auto py-2 sm:py-6 px-3 sm:px-4 space-y-5">
      
      {/* 1. Header Title & Subtitle matching Screenshot 1, 2, 8, 11 */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {isEditing ? 'Edit Job - MicroJob' : 'Create New Job - MicroJob'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            {isEditing ? 'Update your job posting' : 'Create a new job posting for freelancers'}
          </p>
        </div>

        {isEditing && (
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-300 text-rose-600 hover:bg-rose-50 text-xs font-bold transition cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
            <span>Close Job</span>
          </button>
        )}
      </div>

      {/* 2. Stepper Header matching screenshots exactly */}
      <div className="flex flex-col items-center justify-center pt-1 pb-3">
        <div className="flex items-center justify-center gap-2 sm:gap-3">
          {/* Step 1 Circle */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === 1
                ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-100'
                : currentStep > 1
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border-2 border-slate-200 text-slate-400'
            }`}
          >
            {currentStep > 1 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '1'}
          </div>

          {/* Line 1-2 */}
          <div className={`h-0.5 w-7 sm:w-12 transition-colors ${currentStep >= 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          {/* Step 2 Circle */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === 2
                ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-100'
                : currentStep > 2
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border-2 border-slate-200 text-slate-400'
            }`}
          >
            {currentStep > 2 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '2'}
          </div>

          {/* Line 2-3 */}
          <div className={`h-0.5 w-7 sm:w-12 transition-colors ${currentStep >= 3 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          {/* Step 3 Circle */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === 3
                ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-100'
                : currentStep > 3
                  ? 'bg-emerald-600 text-white'
                  : 'bg-white border-2 border-slate-200 text-slate-400'
            }`}
          >
            {currentStep > 3 ? <Check className="w-4 h-4 stroke-[2.5]" /> : '3'}
          </div>

          {/* Line 3-4 */}
          <div className={`h-0.5 w-7 sm:w-12 transition-colors ${currentStep >= 4 ? 'bg-emerald-500' : 'bg-slate-200'}`} />

          {/* Step 4 Circle */}
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
              currentStep === 4
                ? 'bg-blue-600 text-white shadow-sm ring-4 ring-blue-100'
                : 'bg-emerald-600 text-white'
            }`}
          >
            {currentStep === 4 ? '4' : <Check className="w-4 h-4 stroke-[2.5]" />}
          </div>
        </div>

        {/* Active Step Label below stepper in blue */}
        <span className="text-blue-600 font-semibold text-xs sm:text-sm mt-2.5">
          {stepLabels[currentStep - 1]}
        </span>
      </div>

      {/* Error Alert if any */}
      {formError && (
        <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs sm:text-sm flex items-start gap-2.5">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <span>{formError}</span>
        </div>
      )}

      {/* 3. Main Form Card Container */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 sm:p-6 space-y-5">
        
        {/* ================= STEP 1: LOCATION TARGETING (Screenshot 1) ================= */}
        {currentStep === 1 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Location Targeting</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Choose where you want to target workers for this job
              </p>
            </div>

            <div className="space-y-3">
              {/* Option 1: International */}
              <button
                type="button"
                onClick={() => setLocationType('international')}
                className={`w-full p-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  locationType === 'international'
                    ? 'border-2 border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                  <Globe className="w-4 h-4 text-emerald-600" />
                  <span>International</span>
                </div>
                <span className="text-xs text-slate-500">Available to all countries</span>
              </button>

              {/* Option 2: Specific Countries */}
              <button
                type="button"
                onClick={() => setLocationType('specific')}
                className={`w-full p-4 rounded-xl border text-center transition flex flex-col items-center justify-center gap-1 cursor-pointer ${
                  locationType === 'specific'
                    ? 'border-2 border-emerald-500 bg-emerald-50/20'
                    : 'border-slate-200 hover:border-slate-300 bg-white'
                }`}
              >
                <div className="flex items-center justify-center gap-2 text-slate-900 font-bold text-sm sm:text-base">
                  <MapPin className="w-4 h-4 text-emerald-600" />
                  <span>Specific Countries</span>
                </div>
                <span className="text-xs text-slate-500">Select specific zones/countries</span>
              </button>
            </div>

            {/* Sub-selector if Specific Countries selected */}
            {locationType === 'specific' && (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <label className="text-xs font-bold text-slate-700 block">Target Regions / Countries:</label>
                <div className="flex flex-wrap gap-2">
                  {['Bangladesh', 'India', 'Pakistan', 'United States', 'United Kingdom', 'Canada', 'Nigeria', 'Philippines'].map(country => (
                    <button
                      type="button"
                      key={country}
                      onClick={() => {
                        if (selectedCountries.includes(country)) {
                          setSelectedCountries(selectedCountries.filter(c => c !== country));
                        } else {
                          setSelectedCountries([...selectedCountries, country]);
                        }
                      }}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition cursor-pointer ${
                        selectedCountries.includes(country)
                          ? 'bg-emerald-600 text-white border-emerald-600'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      {country}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ================= STEP 2: CATEGORY SELECTION (Screenshots 2-7) ================= */}
        {currentStep === 2 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Category Selection</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Choose a category and subcategory for your job
              </p>
            </div>

            {/* Category Section */}
            <div className="space-y-2">
              <label className="text-xs sm:text-sm font-bold text-slate-900 block">Category</label>
              
              <div className="max-h-[340px] overflow-y-auto space-y-2 pr-1 custom-scrollbar border border-slate-100 rounded-xl p-1.5">
                {CATEGORIES_DATA.map((cat) => {
                  const isSelected = selectedCategoryId === cat.id;
                  return (
                    <button
                      type="button"
                      key={cat.id}
                      onClick={() => {
                        setSelectedCategoryId(cat.id);
                        if (cat.subcategories.length > 0) {
                          setSelectedSubcategory(cat.subcategories[0]);
                        } else {
                          setSelectedSubcategory('');
                        }
                      }}
                      className={`w-full px-3.5 py-2.5 rounded-xl border text-left transition flex items-center justify-between cursor-pointer ${
                        isSelected
                          ? 'border-2 border-emerald-500 bg-emerald-50/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <span className={`text-xs sm:text-sm font-medium ${isSelected ? 'text-slate-950 font-bold' : 'text-slate-800'}`}>
                        {cat.name}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200/80">
                        {cat.count}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Subcategory Section */}
            <div className="space-y-2 pt-2">
              <label className="text-xs sm:text-sm font-bold text-slate-900 block">Subcategory</label>
              
              {!selectedCategoryId ? (
                /* Empty state matching screenshots 5 & 6 */
                <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-slate-400 gap-2">
                  <ArrowLeft className="w-5 h-5 text-slate-400" />
                  <span className="text-xs font-medium">Select a category first</span>
                </div>
              ) : (
                /* Subcategories list matching screenshot 7 */
                <div className="border border-slate-200 rounded-xl p-2 space-y-2 bg-slate-50/40">
                  {(selectedCategoryObj?.subcategories || []).map((sub) => {
                    const isSubSelected = selectedSubcategory === sub;
                    return (
                      <button
                        type="button"
                        key={sub}
                        onClick={() => setSelectedSubcategory(sub)}
                        className={`w-full px-4 py-2.5 rounded-xl border text-left text-xs sm:text-sm transition cursor-pointer ${
                          isSubSelected
                            ? 'border-2 border-emerald-500 bg-emerald-50/30 text-slate-900 font-bold'
                            : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700 font-medium'
                        }`}
                      >
                        {sub}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ================= STEP 3: JOB DETAILS (Screenshots 8, 9, 10) ================= */}
        {currentStep === 3 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Job Details</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Provide detailed information about the job
              </p>
            </div>

            {/* Field 1: Job Title */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>Job Title</span>
                <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                placeholder="Enter a clear and descriptive job title"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-xs sm:text-sm bg-slate-50/30"
              />
            </div>

            {/* Field 2: Description */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>Description</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">{description.length}/5000 characters</span>
              </div>
              <textarea
                value={description}
                maxLength={5000}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Describe what the job is about, what workers will do, and any important context"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-xs sm:text-sm bg-slate-50/30 resize-y"
              />
            </div>

            {/* Field 3: Attachments (Optional) */}
            <div className="space-y-1.5">
              <div>
                <label className="text-xs font-bold text-slate-900 block">Attachments (Optional)</label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Attach supporting files to help freelancers understand the job better. Max 10 files, 10MB each.
                </p>
              </div>

              <div className="pt-1">
                <label className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold cursor-pointer transition">
                  <Paperclip className="w-3.5 h-3.5 text-slate-500" />
                  <span>Add Files ({attachments.length}/10)</span>
                  <input
                    type="file"
                    className="hidden"
                    multiple
                    onChange={(e) => {
                      if (e.target.files && e.target.files.length > 0) {
                        const newFiles = Array.from(e.target.files).map((f: File) => f.name);
                        setAttachments(prev => [...prev, ...newFiles].slice(0, 10));
                      }
                    }}
                  />
                </label>
              </div>

              {attachments.length > 0 && (
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {attachments.map((file, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1 text-[11px] bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                      <span>{file}</span>
                      <X className="w-3 h-3 text-slate-400 hover:text-rose-500 cursor-pointer" onClick={() => setAttachments(attachments.filter((_, i) => i !== idx))} />
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Field 4: Instructions */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>Instructions</span>
                  <span className="text-rose-500">*</span>
                </label>
                <span className="text-[11px] text-slate-400">{instructions.length}/3000 characters</span>
              </div>
              <textarea
                value={instructions}
                maxLength={3000}
                onChange={(e) => setInstructions(e.target.value)}
                rows={3}
                placeholder="Provide step-by-step instructions for completing the job"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none text-xs sm:text-sm bg-slate-50/30 resize-y font-sans"
              />
            </div>

            {/* Field 5: Proof Requirements */}
            <div className="space-y-2.5">
              <div>
                <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                  <span>Proof Requirements</span>
                  <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Define what proof workers need to submit. Each slot can be a screenshot or text proof.
                </p>
              </div>

              {/* Proof Slots */}
              <div className="space-y-2.5">
                {proofs.map((proof, idx) => (
                  <div key={proof.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 space-y-2.5">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-700 text-xs font-bold flex items-center justify-center">
                          {idx + 1}
                        </span>
                        
                        {/* Toggle Screenshot vs Text */}
                        <div className="flex items-center bg-white rounded-lg border border-slate-200 p-0.5">
                          <button
                            type="button"
                            onClick={() => handleUpdateProof(idx, 'type', 'screenshot')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                              proof.type === 'screenshot'
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <ImageIcon className="w-3.5 h-3.5" />
                            <span>Screenshot</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => handleUpdateProof(idx, 'type', 'text')}
                            className={`flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                              proof.type === 'text'
                                ? 'bg-emerald-600 text-white'
                                : 'text-slate-600 hover:text-slate-900'
                            }`}
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Text</span>
                          </button>
                        </div>
                      </div>

                      {proofs.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveProofSlot(idx)}
                          className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Proof Label Input */}
                    <div>
                      <input
                        type="text"
                        value={proof.label}
                        onChange={(e) => handleUpdateProof(idx, 'label', e.target.value)}
                        placeholder="Label (e.g., 'Homepage screenshot')"
                        className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs outline-none focus:border-emerald-500"
                      />
                    </div>

                    {/* Example Screenshot (Optional) */}
                    {proof.type === 'screenshot' && (
                      <div className="flex items-center justify-between text-[11px] text-slate-500 pt-0.5">
                        <span>Example Screenshot (Optional)</span>
                        <label className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-[11px] font-medium cursor-pointer">
                          <ImageIcon className="w-3 h-3 text-slate-400" />
                          <span>Add Example</span>
                          <input
                            type="file"
                            className="hidden"
                            accept="image/*"
                            onChange={(e) => {
                              if (e.target.files && e.target.files[0]) {
                                handleUpdateProof(idx, 'exampleImage', e.target.files[0].name);
                              }
                            }}
                          />
                        </label>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Add Proof Button */}
              {proofs.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddProofSlot}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-semibold transition cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Proof ({proofs.length}/5)</span>
                </button>
              )}

              {/* Example Labels Callout (Screenshot 10) */}
              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200/80 text-amber-900 text-xs space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Lightbulb className="w-3.5 h-3.5 text-amber-600" />
                  <span>Example labels:</span>
                </div>
                <ul className="list-disc list-inside space-y-0.5 pl-1 text-[11px] text-amber-800">
                  <li>&quot;Before screenshot&quot;, &quot;After screenshot&quot;</li>
                  <li>&quot;Homepage screenshot&quot;, &quot;Profile URL&quot;</li>
                  <li>&quot;Your username&quot;, &quot;Review text&quot;</li>
                </ul>
              </div>
            </div>

            {/* Field 6: Auto-Verification Questions */}
            <div className="pt-2 border-t border-slate-100 space-y-2">
              <div className="flex items-center justify-between">
                <div>
                  <label htmlFor={autoVerifyId} className="text-xs sm:text-sm font-bold text-slate-900 block cursor-pointer">Auto-Verification Questions</label>
                  <p className="text-[11px] text-slate-500">
                    Automatically approve submissions that answer your questions correctly
                  </p>
                </div>
                <input
                  id={autoVerifyId}
                  type="checkbox"
                  checked={autoVerification}
                  onChange={(e) => setAutoVerification(e.target.checked)}
                  className="w-4 h-4 text-emerald-600 rounded-sm border-slate-300 focus:ring-emerald-500 cursor-pointer"
                />
              </div>

              {autoVerification && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2 mt-2">
                  <input
                    type="text"
                    value={autoQuestions[0].question}
                    onChange={(e) => setAutoQuestions([{ ...autoQuestions[0], question: e.target.value }])}
                    placeholder="Enter validation question (e.g., What was the secret code in video?)"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                  />
                  <input
                    type="text"
                    value={autoQuestions[0].expectedAnswer}
                    onChange={(e) => setAutoQuestions([{ ...autoQuestions[0], expectedAnswer: e.target.value }])}
                    placeholder="Expected exact answer"
                    className="w-full px-3 py-2 rounded-lg border border-slate-200 bg-white text-xs outline-none"
                  />
                </div>
              )}
            </div>

          </div>
        )}

        {/* ================= STEP 4: BUDGET & PUBLISH (Screenshots 11, 12, 13) ================= */}
        {currentStep === 4 && (
          <div className="space-y-5">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">Budget & Publish</h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
                Set your budget and publish your job
              </p>
            </div>

            {/* Field 1: Number of Workers Needed */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>Number of Workers Needed</span>
                <span className="text-rose-500">*</span>
              </label>
              
              <input
                type="number"
                min={1}
                value={workersCount}
                onChange={(e) => setWorkersCount(Math.max(1, parseInt(e.target.value) || 1))}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-xs sm:text-sm bg-slate-50/30 font-medium"
              />

              {/* Quick Worker Chips matching Screenshot 11 */}
              <div className="flex flex-wrap gap-2 pt-1">
                {[10, 25, 50, 100, 500].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setWorkersCount(count)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer ${
                      workersCount === count
                        ? 'bg-emerald-50 border-emerald-500 text-emerald-700'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    +{count} Workers
                  </button>
                ))}
              </div>
            </div>

            {/* Field 2: Payment Per Worker */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>Payment Per Worker</span>
                <span className="text-rose-500">*</span>
              </label>
              
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 text-sm font-medium">
                  $
                </div>
                <input
                  type="number"
                  step="0.01"
                  min={minRateUSD}
                  value={paymentPerWorkerUSD}
                  onChange={(e) => setPaymentPerWorkerUSD(parseFloat(e.target.value) || minRateUSD)}
                  className="w-full pl-8 pr-3.5 py-2.5 rounded-xl border border-slate-200 focus:border-emerald-500 outline-none text-xs sm:text-sm bg-slate-50/30 font-medium"
                />
              </div>

              <p className="text-[11px] text-slate-500">
                Minimum: ${minRateUSD.toFixed(2)} per worker for this category
              </p>
            </div>

            {/* Field 3: Job Expiry Date */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-900 flex items-center gap-1">
                <span>Job Expiry Date</span>
                <span className="text-rose-500">*</span>
              </label>

              <div className="relative">
                <div className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-slate-50/30 flex items-center justify-between text-xs sm:text-sm font-medium text-slate-800">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-slate-500" />
                    <span>{expiryDate}</span>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </div>
              </div>

              <p className="text-[11px] text-slate-500">
                Jobs expire between 3-30 days from today. Approved submissions remain valid after expiry.
              </p>
            </div>

            {/* Cost Breakdown Card matching Screenshot 13 */}
            <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 space-y-3">
              <h3 className="text-sm font-bold text-slate-900">Cost Breakdown</h3>

              {/* Workers Cost */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div>
                  <div className="flex items-center gap-1 text-slate-700 font-medium">
                    <span>Workers Cost</span>
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                  </div>
                  <span className="text-[11px] text-slate-400">
                    {workersCount} × ${paymentPerWorkerUSD.toFixed(4)}
                  </span>
                </div>
                <span className="font-bold text-slate-900">${workersCostUSD.toFixed(2)}</span>
              </div>

              {/* Service Fee */}
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <div className="flex items-center gap-1 text-slate-700 font-medium">
                  <span>Service Fee</span>
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                </div>
                <span className="font-bold text-slate-900">${serviceFeeUSD.toFixed(2)}</span>
              </div>

              <div className="border-t border-slate-200/80 pt-2 space-y-2">
                {/* Your Balance */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 font-medium">Your Balance</span>
                  <span className="font-bold text-slate-900">${userBalanceUSD.toFixed(2)}</span>
                </div>

                {/* Balance After */}
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-slate-600 font-medium">Balance After</span>
                  <span className={`font-bold ${balanceAfterUSD >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                    ${balanceAfterUSD.toFixed(2)}
                  </span>
                </div>
              </div>

              {/* Insufficient deposit warning with quick deposit button */}
              {!hasSufficientDeposit && (
                <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-rose-600">
                    {isBn ? 'ব্যালেন্স অপর্যাপ্ত। রিচার্জ প্রয়োজন।' : 'Insufficient balance to publish.'}
                  </span>
                  <button
                    type="button"
                    onClick={onOpenDeposit}
                    className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition cursor-pointer"
                  >
                    + Deposit Now
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Large Green Button (Screenshot 13) */}
            <div className="pt-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={handlePublishJob}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 shadow-sm transition cursor-pointer disabled:opacity-50"
              >
                <Rocket className="w-4 h-4" />
                <span>{isSubmitting ? (isBn ? 'পোস্ট করা হচ্ছে...' : 'Publishing...') : (isEditing ? 'Update Job' : 'Publish Now')}</span>
              </button>
            </div>

          </div>
        )}

      </div>

      {/* 4. Bottom Stepper Navigation (Previous & Next) matching screenshots */}
      {currentStep < 4 && (
        <div className="flex items-center justify-between pt-2">
          {/* Previous Button */}
          <button
            type="button"
            disabled={currentStep === 1}
            onClick={() => {
              if (currentStep > 1) {
                setFormError(null);
                setCurrentStep(currentStep - 1);
              }
            }}
            className="px-4 py-2 rounded-lg border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-2xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Previous</span>
          </button>

          {/* Next Button */}
          <button
            type="button"
            onClick={validateAndNext}
            className="px-5 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white font-semibold text-xs sm:text-sm flex items-center gap-1.5 transition cursor-pointer shadow-xs"
          >
            <span>Next</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
};
