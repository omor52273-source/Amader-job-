import { Job, TaskSubmission, WalletTransaction, UserProfile, TopEarner, NotificationItem, WeeklyTopReferrer, SupportTicket, SiteSettings } from '../types';
import { BLOCKBUSTER_EXAMPLE_1, BLOCKBUSTER_EXAMPLE_2, BLOCKBUSTER_EXAMPLE_3 } from './mockScreenshots';

export const INITIAL_USER: UserProfile = {
  id: '84920173',
  uid: '84920173',
  name: 'Rafi Ahmed',
  email: 'rafi2377a@amaderjob.com',
  phone: '+8801331119361',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'worker',
  earningBalanceBDT: 485.00,
  earningBalanceUSD: 4.85,
  depositBalanceBDT: 1250.00,
  depositBalanceUSD: 12.50,
  completedTasksCount: 42,
  postedJobsCount: 3,
  satisfactionRate: 99.2,
  level: 'Gold',
  isVerified: false,
  twoFactorEnabled: false,
  twoFactorPhone: '+8801331119361',
  kycStatus: 'unverified',
  kycData: undefined,
  nidNumber: undefined,
  referralCode: '84920173',
  referralEarningsBDT: 180.00,
  referredUsersCount: 14,
  dailyStreak: 4,
  lastClaimDate: '',
  status: 'active',
  warningCount: 0,
  isAdmin: true
};

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteName: 'Amader Job',
  siteNameBn: 'আমাদের জব',
  siteSubtitle: 'Work • Earn • Grow',
  siteSubtitleBn: 'কাজ • আয় • উন্নতি',
  logoUrl: '', // uses vector BrandLogo by default or custom image URL
  domain: 'https://microjob.bahubal.com/',
  supportEmail: 'support@bahubal.com',
  whatsappNumber: '+8801331119361',
  helplinePhone: '+8801331119361',
  minDepositBDT: 50,
  minWithdrawBDT: 100,
  usdToBdtRate: 120,
  noticeMarquee: '🔥 Welcome to microjob.bahubal.com! Complete micro tasks, watch videos, follow social channels and earn real BDT daily. Fast automated payouts via bKash, Nagad & Rocket!',
  noticeMarqueeBn: '🔥 স্বাগতম microjob.bahubal.com প্ল্যাটফর্মে! প্রতিদিন ছোট ছোট কাজ করে সরাসরি বিকাশ ও নগদে পেমেন্ট নিন। যেকোনো প্রয়োজনে হেল্পলাইনে যোগাযোগ করুন।',
  maintenanceMode: false,
  depositBonusPercent: 5
};

export const INITIAL_USERS: UserProfile[] = [
  INITIAL_USER,
  {
    id: '71938204',
    uid: '71938204',
    name: 'Tanvir Hasan',
    email: 'tanvir.freelancer@gmail.com',
    phone: '+8801712345678',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    role: 'worker',
    earningBalanceBDT: 850.00,
    earningBalanceUSD: 7.08,
    depositBalanceBDT: 250.00,
    depositBalanceUSD: 2.08,
    completedTasksCount: 112,
    postedJobsCount: 1,
    satisfactionRate: 98.8,
    level: 'Pro Worker',
    isVerified: true,
    hasBlueBadge: true,
    kycStatus: 'verified',
    nidNumber: '1998451293847',
    referralCode: '71938204',
    referralEarningsBDT: 340.00,
    referredUsersCount: 28,
    dailyStreak: 12,
    status: 'active',
    warningCount: 0
  },
  {
    id: '58204917',
    uid: '58204917',
    name: 'Sadia Sultana',
    email: 'sadia.pro@yahoo.com',
    phone: '+8801819283746',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    role: 'employer',
    earningBalanceBDT: 120.00,
    earningBalanceUSD: 1.00,
    depositBalanceBDT: 3450.00,
    depositBalanceUSD: 28.75,
    completedTasksCount: 15,
    postedJobsCount: 18,
    satisfactionRate: 99.5,
    level: 'Gold',
    isVerified: true,
    hasBlueBadge: true,
    kycStatus: 'verified',
    nidNumber: '1995837201948',
    referralCode: '58204917',
    referralEarningsBDT: 95.00,
    referredUsersCount: 8,
    dailyStreak: 2,
    status: 'active',
    warningCount: 0
  },
  {
    id: '39482015',
    uid: '39482015',
    name: 'Kamal Hossain',
    email: 'kamal.spammer@gmail.com',
    phone: '+8801912984756',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    role: 'worker',
    earningBalanceBDT: 45.00,
    earningBalanceUSD: 0.38,
    depositBalanceBDT: 0.00,
    depositBalanceUSD: 0.00,
    completedTasksCount: 8,
    postedJobsCount: 0,
    satisfactionRate: 62.5,
    level: 'Bronze',
    isVerified: false,
    hasBlueBadge: false,
    kycStatus: 'rejected',
    referralCode: '39482015',
    referralEarningsBDT: 0,
    referredUsersCount: 1,
    dailyStreak: 0,
    status: 'warned',
    warningCount: 2,
    warningMessage: 'Fake screenshot submitted multiple times. Next violation will lead to permanent suspension.'
  },
  {
    id: '62019483',
    uid: '62019483',
    name: 'Md. Faruk Bad Boy',
    email: 'faruk_bot99@gmail.com',
    phone: '+8801612398471',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: 'worker',
    earningBalanceBDT: 0.00,
    earningBalanceUSD: 0.00,
    depositBalanceBDT: 0.00,
    depositBalanceUSD: 0.00,
    completedTasksCount: 2,
    postedJobsCount: 0,
    satisfactionRate: 33.0,
    level: 'Bronze',
    isVerified: false,
    hasBlueBadge: false,
    kycStatus: 'unverified',
    referralCode: '62019483',
    referralEarningsBDT: 0,
    referredUsersCount: 0,
    dailyStreak: 0,
    status: 'banned',
    banReason: 'Bot script abuse and automated submissions violation.'
  },
  {
    id: '90184726',
    uid: '90184726',
    name: 'Nusrat Jahan',
    email: 'nusrat.jahan2026@gmail.com',
    phone: '+8801552398412',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    role: 'worker',
    earningBalanceBDT: 620.00,
    earningBalanceUSD: 5.17,
    depositBalanceBDT: 150.00,
    depositBalanceUSD: 1.25,
    completedTasksCount: 68,
    postedJobsCount: 2,
    satisfactionRate: 97.4,
    level: 'Silver',
    isVerified: false,
    hasBlueBadge: false,
    kycStatus: 'pending',
    referralCode: '90184726',
    referralEarningsBDT: 140.00,
    referredUsersCount: 11,
    dailyStreak: 6,
    status: 'active',
    warningCount: 0
  }
];

export const INITIAL_JOBS: Job[] = [
  {
    id: '4876647',
    title: 'Download Blockbuster App, Fast Payment Approval',
    titleBn: 'Blockbuster অ্যাপ ডাউনলোড করুন, দ্রুত পেমেন্ট অনুমোদন।',
    category: 'app_install',
    categoryName: 'Mobile Application',
    categoryNameBn: 'মোবাইল অ্যাপ্লিকেশন',
    subCategory: 'Download + Install',
    subCategoryBn: 'ডাউনলোড + ইনস্টল',
    employerId: 'emp_aabex',
    employerName: 'Aabex',
    employerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80',
    employerRating: 3.3,
    employerRatingsCount: 29,
    employerFollowers: 701,
    employerVerified: false,
    payPerTaskBDT: 14.40,
    payPerTaskUSD: 0.12,
    totalSlots: 775,
    completedSlots: 758,
    estimatedMinutes: 5,
    targetCountry: 'International',
    targetCountryBn: 'International',
    targetLink: 'https://microjob.com/app/freelancer',
    durationDays: 44,
    createdAt: '2026-07-18T04:40:00Z',
    expiresAt: '2026-10-01T23:59:59Z',
    description: 'Download the Blockbuster app, create a new account, complete your profile, and submit the required screenshots. For new users only.',
    descriptionBn: 'Blockbuster অ্যাপটি ডাউনলোড করুন, নতুন একটি অ্যাকাউন্ট তৈরি করুন, আপনার প্রোফাইল সম্পূর্ণ করুন এবং প্রয়োজনীয় স্ক্রিনশট জমা দিন। শুধুমাত্র নতুন ব্যবহারকারীদের জন্য।',
    attachments: [
      {
        name: 'Screenshot_20260717-221554.jpg',
        url: BLOCKBUSTER_EXAMPLE_1,
        size: '184 KB'
      }
    ],
    instructions: [
      'Download and install the Blockbuster app on your mobile device',
      'Create a new account with your real information',
      'Complete your profile with your Age, Gender, Nickname and ID Number',
      'Bind your Gmail and Device in the settings page',
      'Take screenshots of all 3 required screens as shown in the examples',
      'Do not uninstall or delete the app for at least 3 days after registration'
    ],
    instructionsBn: [
      'Blockbuster অ্যাপটি ডাউনলোড করে আপনার মোবাইলে ইনস্টল করুন',
      'সঠিক ও বাস্তব তথ্য দিয়ে নতুন একটি অ্যাকাউন্ট তৈরি করুন',
      'আপনার প্রোফাইলে গিয়ে Age, Gender, Nickname এবং ID Number সম্পূর্ণ করুন',
      'সেটিংস অপশন থেকে আপনার Gmail ও ডিভাইস বাউন্ড নিশ্চিত করুন',
      'প্রদত্ত উদাহরণের মতো ৩টি প্রয়োজনীয় পেজের পরিষ্কার স্ক্রিনশট নিন',
      'রেজিস্ট্রেশনের পর অন্তত ৩ দিন পর্যন্ত অ্যাপটি আনইনস্টল বা ডিলিট করবেন না।'
    ],
    rules: [
      'For new users only who have never installed Blockbuster before',
      'Do not uninstall or delete the app for at least 3 days after registration',
      'Submitting fake, cropped or duplicate screenshots will lead to instant account suspension',
      'Ensure all texts and IDs are clearly visible'
    ],
    rulesBn: [
      'শুধুমাত্র নতুন ব্যবহারকারীদের জন্য যারা আগে কখনও এই অ্যাপ ব্যবহার করেননি',
      'রেজিস্ট্রেশনের পর অন্তত ৩ দিন পর্যন্ত অ্যাপটি আনইনস্টল বা ডিলিট করবেন না।',
      'কোনো ভুল, নকল বা অস্পষ্ট স্ক্রিনশট দিলে অ্যাকাউন্ট স্থায়ীভাবে নিষিদ্ধ করা হবে',
      'স্ক্রিনশটে আইডি ও তথ্য পরিষ্কারভাবে দৃশ্যমান হতে হবে'
    ],
    proofRequirements: [
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
    ],
    tags: ['App Install', 'High Pay', 'Mobile App', 'Fast Approval'],
    featured: true,
    autoApproveDays: 1,
    status: 'active'
  },
  {
    id: '4876648',
    title: 'YouTube: Watch 3 Mins, Like, Comment & Subscribe (Fast Pay)',
    titleBn: 'YouTube: ৩ মিনিট ভিডিও দেখুন, লাইক ও সাবস্ক্রাইব করুন',
    category: 'youtube',
    categoryName: 'YouTube Marketing',
    categoryNameBn: 'ইউটিউব মার্কেটিং',
    subCategory: 'Watch, Like & Subscribe',
    subCategoryBn: 'ভিডিও দেখা ও সাবস্ক্রাইব',
    employerId: '12345678',
    employerName: 'Rafi Ahmed (You)',
    employerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100&auto=format&fit=crop&q=80',
    employerRating: 4.9,
    employerRatingsCount: 142,
    employerFollowers: 95,
    employerVerified: true,
    payPerTaskBDT: 5.00,
    payPerTaskUSD: 0.05,
    totalSlots: 150,
    completedSlots: 98,
    estimatedMinutes: 3,
    targetCountry: 'International',
    targetCountryBn: 'সারাবিশ্ব (International)',
    targetLink: 'https://youtube.com/results?search_query=Freelancing+Bangladesh+Tutorial',
    durationDays: 7,
    createdAt: '2026-09-01T04:00:00Z',
    expiresAt: '2026-09-08T04:00:00Z',
    boost: {
      isActive: true,
      dailyBudgetUSD: 0.50,
      mode: 'daily',
      endsAt: '2026-09-07T04:00:00Z',
      startedAt: '2026-09-02T04:00:00Z',
      totalCostUSD: 2.50,
      daysRemaining: 5
    },
    instructions: [
      'Search on YouTube: "Freelancing Bangladesh Tutorial"',
      'Watch video for at least 3 minutes continuously',
      'Like the video and leave a genuine comment',
      'Subscribe to the channel and turn on the bell icon'
    ],
    instructionsBn: [
      'ইউটিউবে সার্চ করুন: "Freelancing Bangladesh Tutorial"',
      'ভিডিওটি একটানা কমপক্ষে ৩ মিনিট দেখুন',
      'ভিডিওতে একটি সুন্দর মন্তব্য করুন ও লাইক দিন',
      'চ্যানেলটি সাবস্ক্রাইব করে বেল আইকন প্রেস করুন'
    ],
    rules: [
      'Do not fast-forward or skip the video',
      'Submitting fake screenshots will cause permanent account suspension',
      'Do not unsubscribe after approval'
    ],
    rulesBn: [
      'ভিডিও স্কিপ বা টেনে টেনে দেখলে পেমেন্ট বাতিল হবে',
      'ভুল বা নকল স্ক্রিনশট দিলে অ্যাকাউন্ট ব্যান হবে',
      'অনুমোদন পাওয়ার পর আনসাবস্ক্রাইব করবেন না'
    ],
    proofRequirements: [
      {
        id: 'p1',
        type: 'screenshot',
        description: 'Screenshot showing video watched, liked and subscribed with bell icon',
        descriptionBn: 'ভিডিও দেখা, লাইক এবং সাবস্ক্রাইব করা স্ক্রিনশট',
        exampleImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
        isRequired: true
      },
      {
        id: 'p2',
        type: 'text',
        description: 'Your YouTube channel/profile name used for commenting',
        descriptionBn: 'আপনার ইউটিউব চ্যানেলের নাম এবং কমেন্ট',
        isRequired: true
      }
    ],
    tags: ['YouTube', 'Instant Pay', 'Video Watch'],
    featured: true,
    autoApproveDays: 1,
    status: 'active'
  },
  {
    id: '4876649',
    title: 'Google Play Store: Download App & 5-Star Rating with Positive Review',
    titleBn: 'গুগল প্লে-স্টোর: অ্যাপ ইন্সটল করে ৫-স্টার রিভিউ দিন',
    category: 'app_install',
    categoryName: 'Mobile Application',
    categoryNameBn: 'মোবাইল অ্যাপস',
    subCategory: 'Download & 5-Star Review',
    subCategoryBn: 'ডাউনলোড ও রিভিউ',
    employerId: 'emp_102',
    employerName: 'DigitalAppLab',
    employerAvatar: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=100&auto=format&fit=crop&q=80',
    employerRating: 4.8,
    employerRatingsCount: 88,
    employerFollowers: 64,
    employerVerified: true,
    payPerTaskBDT: 25.00,
    payPerTaskUSD: 0.25,
    totalSlots: 80,
    completedSlots: 45,
    estimatedMinutes: 4,
    targetCountry: 'Bangladesh',
    targetCountryBn: 'বাংলাদেশ',
    targetLink: 'https://play.google.com/store',
    durationDays: 7,
    createdAt: '2026-09-01T08:00:00Z',
    expiresAt: '2026-09-08T08:00:00Z',
    instructions: [
      'Open Play Store and search for our app link',
      'Download and install the app on your Android device',
      'Open the app and stay 1 minute',
      'Leave a 5-star rating with a 2-line positive English review'
    ],
    instructionsBn: [
      'প্লে-স্টোর লিংক থেকে অ্যাপটি ডাউনলোড করুন',
      'অ্যাপটি ইনস্টল করে ওপেন করুন এবং ১ মিনিট চালান',
      '৫-স্টার রেটিং দিয়ে কমপক্ষে দুই লাইনের পজিটিভ রিভিউ লিখুন'
    ],
    rules: [
      'Review must remain for at least 30 days',
      'Must use a real Gmail/Google Play account'
    ],
    rulesBn: [
      'রিভিউটি কমপক্ষে ৩০ দিন বহাল রাখতে হবে',
      'আসল গুগল প্লে অ্যাকাউন্ট দিয়ে করতে হবে'
    ],
    proofRequirements: [
      {
        id: 'p1',
        type: 'screenshot',
        description: 'Screenshot showing your 5-star review visible on Google Play Store',
        descriptionBn: 'প্লে-স্টোরে আপনার দেওয়া রিভিউর স্ক্রিনশট',
        exampleImage: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
        isRequired: true
      },
      {
        id: 'p2',
        type: 'text',
        description: 'Your Google Play Profile Name',
        descriptionBn: 'আপনার গুগল প্লে প্রোফাইল নাম',
        isRequired: true
      }
    ],
    tags: ['Play Store', 'App Review', 'High Pay'],
    featured: false,
    autoApproveDays: 1,
    status: 'active'
  },
  {
    id: '4876650',
    title: 'Telegram: Join Crypto Airdrop Channel & Stay 7 Days',
    titleBn: 'টেলিগ্রাম: চ্যানেল জয়েন করুন এবং অ্যাক্টিভ থাকুন',
    category: 'telegram',
    categoryName: 'Telegram Community',
    categoryNameBn: 'টেলিগ্রাম কমিউনিটি',
    subCategory: 'Join Channel & Stay Active',
    subCategoryBn: 'চ্যানেল জয়েন',
    employerId: 'emp_103',
    employerName: 'CryptoMasterBD',
    employerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    employerRating: 4.9,
    employerRatingsCount: 120,
    employerFollowers: 210,
    employerVerified: true,
    payPerTaskBDT: 4.00,
    payPerTaskUSD: 0.04,
    totalSlots: 200,
    completedSlots: 142,
    estimatedMinutes: 1,
    targetCountry: 'International',
    targetCountryBn: 'সারাবিশ্ব',
    targetLink: 'https://t.me/CryptoMasterBD',
    durationDays: 6,
    createdAt: '2026-09-01T06:00:00Z',
    expiresAt: '2026-09-07T06:00:00Z',
    instructions: [
      'Click the Telegram channel link',
      'Click Join Channel',
      'Mute or keep notifications on'
    ],
    instructionsBn: [
      'টেলিগ্রাম লিংকে ক্লিক করে চ্যানেলে প্রবেশ করুন',
      'Join Channel বাটনে ক্লিক করুন',
      'কমপক্ষে ৭ দিন চ্যানেলে যুক্ত থাকুন'
    ],
    rules: [
      'Leaving channel before 7 days will disqualify payout',
      'Must have real profile picture on Telegram'
    ],
    rulesBn: [
      '৭ দিনের মধ্যে চ্যানেল ছেড়ে দিলে আইডি রিপোর্ট করা হবে',
      'টেলিগ্রামে আসল ছবি থাকা বাঞ্ছনীয়'
    ],
    proofRequirements: [
      {
        id: 'p1',
        type: 'screenshot',
        description: 'Screenshot showing you joined the channel',
        descriptionBn: 'চ্যানেলে জয়েন করা অবস্থার স্ক্রিনশট',
        exampleImage: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=600&auto=format&fit=crop&q=80',
        isRequired: true
      },
      {
        id: 'p2',
        type: 'text',
        description: 'Your Telegram @Username',
        descriptionBn: 'আপনার টেলিগ্রাম @Username দিন',
        isRequired: true
      }
    ],
    tags: ['Telegram', 'Instant Pay', '1 Minute'],
    featured: false,
    autoApproveDays: 1,
    status: 'active'
  },
  {
    id: '4876651',
    title: 'Facebook: Like Official Page, Follow and Share Pinned Post',
    titleBn: 'ফেসবুক: পেজ লাইক, ফলো এবং পিন পোস্ট শেয়ার করুন',
    category: 'facebook',
    categoryName: 'Facebook Marketing',
    categoryNameBn: 'ফেসবুক মার্কেটিং',
    subCategory: 'Like, Follow & Share',
    subCategoryBn: 'লাইক ও শেয়ার',
    employerId: 'emp_104',
    employerName: 'RifatHasan',
    employerAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    employerRating: 4.9,
    employerRatingsCount: 65,
    employerFollowers: 152,
    employerVerified: true,
    payPerTaskBDT: 3.00,
    payPerTaskUSD: 0.03,
    totalSlots: 300,
    completedSlots: 210,
    estimatedMinutes: 2,
    targetCountry: 'Bangladesh',
    targetCountryBn: 'বাংলাদেশ',
    targetLink: 'https://facebook.com',
    durationDays: 5,
    createdAt: '2026-09-01T10:00:00Z',
    expiresAt: '2026-09-06T10:00:00Z',
    instructions: [
      'Visit Facebook page and click Like & Follow',
      'Open the pinned post, like it and share to your timeline',
      'Keep the post share privacy Public'
    ],
    instructionsBn: [
      'ফেসবুক পেজে গিয়ে লাইক ও ফলো করুন',
      'পিন করা পোস্টে লাইক দিয়ে আপনার টাইমলাইনে পাবলিক শেয়ার করুন'
    ],
    rules: [
      'Timeline must be real with friends',
      'Share privacy must be Public'
    ],
    rulesBn: [
      'ফেসবুক প্রোফাইল পাবলিক ও ফ্রেন্ড থাকতে হবে',
      'শেয়ার অবশ্যই Public হতে হবে'
    ],
    proofRequirements: [
      {
        id: 'p1',
        type: 'screenshot',
        description: 'Screenshot of page followed and share on profile',
        descriptionBn: 'পেজ লাইক ও আপনার টাইমলাইনে শেয়ারের স্ক্রিনশট',
        exampleImage: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
        isRequired: true
      },
      {
        id: 'p2',
        type: 'text',
        description: 'Your Facebook profile URL/name',
        descriptionBn: 'আপনার ফেসবুক প্রোফাইল লিংক বা নাম',
        isRequired: true
      }
    ],
    tags: ['Facebook', 'Social Media', 'Easy'],
    featured: false,
    autoApproveDays: 1,
    status: 'active'
  },
  {
    id: '4876652',
    title: 'Website Sign Up: Register Free Account & Verify Email',
    titleBn: 'ওয়েবসাইট সাইন-আপ: ফ্রি অ্যাকাউন্ট খুলে ইমেইল ভেরিফাই করুন',
    category: 'signup',
    categoryName: 'Website Sign Up',
    categoryNameBn: 'ওয়েবসাইট সাইন-আপ',
    subCategory: 'Email Verification',
    subCategoryBn: 'ইমেইল ভেরিফিকেশন',
    employerId: 'emp_105',
    employerName: 'GlobalAffiliate',
    employerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=100&auto=format&fit=crop&q=80',
    employerRating: 4.8,
    employerRatingsCount: 45,
    employerFollowers: 76,
    employerVerified: true,
    payPerTaskBDT: 15.00,
    payPerTaskUSD: 0.15,
    totalSlots: 100,
    completedSlots: 62,
    estimatedMinutes: 3,
    targetCountry: 'International',
    targetCountryBn: 'সারাবিশ্ব',
    targetLink: 'https://example.com/signup',
    durationDays: 4,
    createdAt: '2026-09-01T12:00:00Z',
    expiresAt: '2026-09-05T12:00:00Z',
    instructions: [
      'Go to the registration URL',
      'Sign up using a valid email and password',
      'Check inbox and click confirmation link'
    ],
    instructionsBn: [
      'ওয়েবসাইটে গিয়ে সঠিক ইমেইল দিয়ে সাইন আপ করুন',
      'ইনবক্স থেকে কনফার্মেশন লিংকে ক্লিক করে ভেরিফাই করুন'
    ],
    rules: [
      'Temporary or disposable emails are strictly forbidden',
      'One account per IP'
    ],
    rulesBn: [
      'কোনো ফেইক বা টেম্প মেইল ব্যবহার করা যাবে না',
      'এক ডিভাইস থেকে একটিই রেজিস্টার গ্রহণযোগ্য'
    ],
    proofRequirements: [
      {
        id: 'p1',
        type: 'screenshot',
        description: 'Screenshot of dashboard logged in',
        descriptionBn: 'ড্যাশবোর্ডে লগইন করা অবস্থার স্ক্রিনশট',
        exampleImage: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        isRequired: true
      },
      {
        id: 'p2',
        type: 'text',
        description: 'Registered Email Address',
        descriptionBn: 'রেজিস্টার করা ইমেইল অ্যাড্রেস',
        isRequired: true
      }
    ],
    tags: ['Sign Up', 'Email Verify', 'High Pay'],
    featured: false,
    autoApproveDays: 1,
    status: 'active'
  }
];

export const INITIAL_SUBMISSIONS: TaskSubmission[] = [
  // Submissions submitted by workers for 4876648 (Current user's client campaign)
  {
    id: 'sub_w01',
    jobId: '4876648',
    jobTitle: 'YouTube: Watch 3 Mins, Like, Comment & Subscribe (Fast Pay)',
    jobTitleBn: 'YouTube: ৩ মিনিট ভিডিও দেখুন, লাইক ও সাবস্ক্রাইব করুন',
    category: 'youtube',
    workerId: 'worker_sakib_01',
    workerName: 'সাকিব হাসান (Sakib Hasan)',
    workerAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-09-02T10:15:00Z',
    proofText: 'My YouTube name: Sakib Tech BD. Comment: "অসাধারণ টিউটোরিয়াল, অনেক কিছু শিখতে পারলাম। ধন্যবাদ ভাই!"',
    proofImageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    earnedBDT: 5.00,
    earnedUSD: 0.05,
  },
  {
    id: 'sub_w02',
    jobId: '4876648',
    jobTitle: 'YouTube: Watch 3 Mins, Like, Comment & Subscribe (Fast Pay)',
    jobTitleBn: 'YouTube: ৩ মিনিট ভিডিও দেখুন, লাইক ও সাবস্ক্রাইব করুন',
    category: 'youtube',
    workerId: 'worker_fatema_02',
    workerName: 'ফাতেমা আক্তার (Fatema Akter)',
    workerAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-09-02T11:45:00Z',
    proofText: 'Channel name: Fatema Creative. Watched full 4 mins, liked and pressed bell icon.',
    proofImageUrl: 'https://images.unsplash.com/photo-1579208575657-c595a05383b7?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    earnedBDT: 5.00,
    earnedUSD: 0.05,
  },
  {
    id: 'sub_w03',
    jobId: '4876648',
    jobTitle: 'YouTube: Watch 3 Mins, Like, Comment & Subscribe (Fast Pay)',
    jobTitleBn: 'YouTube: ৩ মিনিট ভিডিও দেখুন, লাইক ও সাবস্ক্রাইব করুন',
    category: 'youtube',
    workerId: 'worker_rakib_03',
    workerName: 'রাকিব ইসলাম (Rakib Islam)',
    workerAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-09-01T14:30:00Z',
    proofText: 'Channel: Rakib Official. Like #45, Comment posted.',
    proofImageUrl: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    feedback: 'সঠিকভাবে কাজ সম্পন্ন হয়েছে। ধন্যবাদ!',
    earnedBDT: 5.00,
    earnedUSD: 0.05,
  },
  {
    id: 'sub_w04',
    jobId: '4876648',
    jobTitle: 'YouTube: Watch 3 Mins, Like, Comment & Subscribe (Fast Pay)',
    jobTitleBn: 'YouTube: ৩ মিনিট ভিডিও দেখুন, লাইক ও সাবস্ক্রাইব করুন',
    category: 'youtube',
    workerId: 'worker_imran_04',
    workerName: 'ইমরান হোসেন (Imran Hossain)',
    workerAvatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-09-01T09:20:00Z',
    proofText: 'done sir check it',
    proofImageUrl: 'https://images.unsplash.com/photo-1581291518857-4e27b48ff24e?w=600&auto=format&fit=crop&q=80',
    status: 'rejected',
    feedback: 'স্ক্রিনশটে সাবস্ক্রাইব দেখা যাচ্ছে না এবং ভিডিও ৩ মিনিট দেখা হয়নি।',
    earnedBDT: 5.00,
    earnedUSD: 0.05,
  },
  // Submissions submitted by current user (Freelancer mode)
  {
    id: 'sub_101',
    jobId: '4876649',
    jobTitle: 'Google Play Store: Download App & 5-Star Rating',
    jobTitleBn: 'গুগল প্লে-স্টোর: অ্যাপ ইন্সটল করে ৫-স্টার রিভিউ দিন',
    category: 'app_install',
    workerId: '12345678',
    workerName: 'Rafi Ahmed',
    workerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-09-01T12:15:00Z',
    proofText: 'Play store review: 5 star with positive feedback as requested.',
    proofImageUrl: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=600&auto=format&fit=crop&q=80',
    status: 'approved',
    feedback: 'Excellent review! Thank you.',
    earnedBDT: 25.00,
    earnedUSD: 0.25,
  },
  {
    id: 'sub_102',
    jobId: '4876650',
    jobTitle: 'Facebook Page: Follow, Like & Share Recent Post to 3 Groups',
    jobTitleBn: 'ফেসবুক পেজ: ফলো দিন ও ৩টি গ্রুপে পোস্ট শেয়ার করুন',
    category: 'facebook',
    workerId: '12345678',
    workerName: 'Rafi Ahmed',
    workerAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    submittedAt: '2026-09-01T13:40:00Z',
    proofText: 'Facebook Profile: Rafi Ahmed BD. Shared to 3 public groups.',
    proofImageUrl: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
    status: 'pending',
    earnedBDT: 10.00,
    earnedUSD: 0.10,
  }
];

export const INITIAL_TRANSACTIONS: WalletTransaction[] = [
  {
    id: 'trx_001',
    type: 'task_earning',
    title: 'Task Approved: YouTube Watch & Like',
    titleBn: 'টাস্ক অনুমোদন: ইউটিউব ভিডিও ও লাইক',
    amountBDT: 8.50,
    amountUSD: 0.07,
    status: 'completed',
    timestamp: '2026-09-01T12:20:00Z',
    note: 'Job ID: #job_01'
  },
  {
    id: 'trx_002',
    type: 'withdrawal',
    title: 'Withdrawal to bKash Personal',
    titleBn: 'বিকাশ পার্সোনালে ক্যাশআউট সম্পন্ন',
    amountBDT: 300.00,
    amountUSD: 2.50,
    method: 'bkash',
    accountNumber: '01712-345678',
    trxId: 'BK9A87X21',
    status: 'completed',
    timestamp: '2026-08-30T15:10:00Z',
    note: 'Cash out fee: ৳4.50'
  },
  {
    id: 'trx_003',
    type: 'deposit',
    title: 'Deposit via Nagad Personal',
    titleBn: 'নগদ পার্সোনাল থেকে ডিপোজিট সফল',
    amountBDT: 1000.00,
    amountUSD: 8.33,
    method: 'nagad',
    accountNumber: '01890-112233',
    trxId: 'NG88234KL',
    status: 'completed',
    timestamp: '2026-08-28T11:00:00Z',
    note: 'Added to Employer Job Budget'
  },
  {
    id: 'trx_004',
    type: 'referral_bonus',
    title: 'Referral Bonus (3 new workers active)',
    titleBn: 'রেফারেল বোনাস (৩ জন অ্যাক্টিভ কর্মী)',
    amountBDT: 45.00,
    amountUSD: 0.38,
    status: 'completed',
    timestamp: '2026-08-27T09:30:00Z',
    note: '5% lifetime bonus credited'
  },
  {
    id: 'trx_005',
    type: 'daily_streak',
    title: 'Day 4 Streak Bonus',
    titleBn: '৪র্থ দিনের দৈনিক স্ট্রিক বোনাস',
    amountBDT: 15.00,
    amountUSD: 0.12,
    status: 'completed',
    timestamp: '2026-09-01T06:10:00Z'
  }
];

export const INITIAL_LEADERBOARD: TopEarner[] = [
  {
    rank: 1,
    name: 'রাকিবুল ইসলাম (Rakib)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    tasksCompleted: 428,
    earningsBDT: 14850.00,
    country: 'Bangladesh',
    badge: '🏆 Top Earner'
  },
  {
    rank: 2,
    name: 'ফারজানা আক্তার (Farzana)',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
    tasksCompleted: 390,
    earningsBDT: 12420.50,
    country: 'Bangladesh',
    badge: '🥈 Master Worker'
  },
  {
    rank: 3,
    name: 'আরিফ হোসেন (Arif)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    tasksCompleted: 315,
    earningsBDT: 9840.00,
    country: 'Bangladesh',
    badge: '🥉 Elite Pro'
  },
  {
    rank: 4,
    name: 'মাহমুদ হাসান (Mahmud)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    tasksCompleted: 278,
    earningsBDT: 8250.00,
    country: 'Bangladesh',
    badge: 'Star Worker'
  },
  {
    rank: 5,
    name: 'নাসরিন জাহান (Nasrin)',
    avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=100&auto=format&fit=crop&q=80',
    tasksCompleted: 240,
    earningsBDT: 7100.00,
    country: 'Bangladesh',
    badge: 'Fast Finisher'
  }
];

export const CATEGORIES_CONFIG = [
  { id: 'all', name: 'All Categories', nameBn: 'সকল ক্যাটাগরি', icon: 'Sparkles' },
  { id: 'youtube', name: 'YouTube Marketing', nameBn: 'ইউটিউব মার্কেটিং', icon: 'Youtube' },
  { id: 'facebook', name: 'Facebook & Social', nameBn: 'ফেসবুক ও সোশ্যাল', icon: 'Share2' },
  { id: 'telegram', name: 'Telegram Channels', nameBn: 'টেলিগ্রাম গ্রুপ', icon: 'Send' },
  { id: 'app_install', name: 'App Downloads', nameBn: 'অ্যাপ ইন্সটল', icon: 'Download' },
  { id: 'seo_visit', name: 'SEO & Web Traffic', nameBn: 'ওয়েবসাইট ভিজিট', icon: 'Globe' },
  { id: 'reviews', name: 'Reviews & Ratings', nameBn: 'রিভিউ ও রেটিং', icon: 'Star' },
  { id: 'survey', name: 'Surveys & Forms', nameBn: 'জরিপ ও ফর্ম', icon: 'ClipboardCheck' },
  { id: 'signup', name: 'Sign Up & KYC', nameBn: 'রেজিস্ট্রেশন ও সাইন-আপ', icon: 'UserPlus' }
];

export const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif_01',
    userId: '84920173',
    title: 'Task Approved! ৳8.50 credited',
    titleBn: 'টাস্ক অনুমোদিত! ৳৮.৫০ যোগ হয়েছে',
    message: 'Your proof for "YouTube: Watch 3 Minutes, Like & Subscribe" was approved by employer.',
    messageBn: 'আপনার জমা দেওয়া ইউটিউব টাস্কের প্রুফ অনুমোদন পেয়েছে। টাকা ওয়ালেটে জমা হয়েছে।',
    timestamp: '2026-09-02T10:30:00Z',
    isRead: false,
    type: 'task_approved'
  },
  {
    id: 'notif_02',
    userId: '84920173',
    title: 'Daily Check-in Bonus Ready',
    titleBn: 'দৈনিক বোনাস প্রস্তুত',
    message: 'Claim your ৳5.00 free daily login reward today.',
    messageBn: 'আজকের ৫ টাকা ফ্রি দৈনিক লগইন বোনাস ক্লেইম করুন।',
    timestamp: '2026-09-02T08:00:00Z',
    isRead: true,
    type: 'system'
  },
  {
    id: 'notif_03',
    userId: '84920173',
    title: 'Withdrawal Processed',
    titleBn: 'ক্যাশআউট সম্পন্ন হয়েছে',
    message: '৳300.00 cashout to bKash 01712-345678 was successfully paid.',
    messageBn: 'বিকাশ নম্বরে ৳৩০০ ক্যাশআউট সফলভাবে প্রদান করা হয়েছে।',
    timestamp: '2026-09-01T14:15:00Z',
    isRead: true,
    type: 'system'
  }
];

export const WEEKLY_TOP_REFERRERS: WeeklyTopReferrer[] = [
  {
    rank: 1,
    name: 'তানভীর আহমেদ (Tanvir)',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
    referralCount: 48,
    earningsBDT: 2400.00,
    rewardBDT: 80,
    badge: '🥇 ১ম স্থান (৳৮০ বোনাস)'
  },
  {
    rank: 2,
    name: 'মাহমুদুল হাসান (Mahmud)',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=80',
    referralCount: 36,
    earningsBDT: 1800.00,
    rewardBDT: 40,
    badge: '🥈 ২য় স্থান (৳৪০ বোনাস)'
  },
  {
    rank: 3,
    name: 'সাব্বির হোসেন (Sabbir)',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=80',
    referralCount: 29,
    earningsBDT: 1450.00,
    rewardBDT: 20,
    badge: '🥉 ৩য় স্থান (৳২০ বোনাস)'
  },
  {
    rank: 4,
    name: 'কামরুল ইসলাম (Kamrul)',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
    referralCount: 22,
    earningsBDT: 1100.00,
    rewardBDT: 0,
    badge: '⭐ Star Referrer'
  },
  {
    rank: 5,
    name: 'নাঈমুর রহমান (Naimur)',
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=100&auto=format&fit=crop&q=80',
    referralCount: 19,
    earningsBDT: 950.00,
    rewardBDT: 0,
    badge: 'Pro Referrer'
  }
];

export const INITIAL_TICKETS: SupportTicket[] = [
  {
    id: 'TKT-8492',
    userId: '84920173',
    userName: 'Rafi Ahmed',
    userEmail: 'rafi2377a@amaderjob.com',
    userPhone: '+8801331119361',
    subject: 'বিকাশ ডিপোজিট ট্রানজেকশন ব্যালেন্স আপডেট',
    category: 'deposit',
    priority: 'high',
    status: 'in_progress',
    createdAt: '2026-09-09T10:30:00Z',
    updatedAt: '2026-09-09T11:15:00Z',
    messages: [
      {
        id: 'msg_1',
        sender: 'user',
        senderName: 'Rafi Ahmed',
        message: 'আমি বিকাশ থেকে ৳৫০০ ডিপোজিট করেছি, ট্রানজেকশন আইডি: 9K8L2M3P4Q। অনুগ্রহ করে ওয়ালেট ব্যালেন্স চেক করে যোগ করে দিবেন।',
        timestamp: '2026-09-09T10:30:00Z'
      },
      {
        id: 'msg_2',
        sender: 'admin',
        senderName: 'Support Team (Admin)',
        senderAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80',
        message: 'হ্যালো Rafi Ahmed, আপনার ট্রানজেকশন আইডিটি আমরা বিকাশ মার্চেন্ট পোর্টালে ভেরিফাই করছি। ৫-১০ মিনিটের মধ্যে আপনার ডিপোজিট ওয়ালেটে ক্রেডিট হয়ে যাবে। সাথে থাকার জন্য ধন্যবাদ!',
        timestamp: '2026-09-09T11:15:00Z'
      }
    ]
  },
  {
    id: 'TKT-8301',
    userId: '84920173',
    userName: 'Rafi Ahmed',
    userEmail: 'rafi2377a@amaderjob.com',
    userPhone: '+8801331119361',
    subject: 'জব প্রুফ সাবমিশন বিষয়ে সহযোগিতা',
    category: 'task_approval',
    priority: 'medium',
    status: 'resolved',
    createdAt: '2026-09-07T14:20:00Z',
    updatedAt: '2026-09-07T16:00:00Z',
    messages: [
      {
        id: 'msg_10',
        sender: 'user',
        senderName: 'Rafi Ahmed',
        message: 'একটি ইউটিউব টাস্কে স্ক্রিনশট দিতে গিয়ে এরর আসছিল। সমাধান চাই।',
        timestamp: '2026-09-07T14:20:00Z'
      },
      {
        id: 'msg_11',
        sender: 'admin',
        senderName: 'Technical Support (Admin)',
        message: 'ইমেজ সাইজ ৫ মেগাবাইটের মধ্যে রেখে PNG বা JPG ফরম্যাটে আপলোড করুন। আপনার টাস্কটি অটো-অ্যাপ্রুভ করে দেওয়া হয়েছে।',
        timestamp: '2026-09-07T16:00:00Z'
      }
    ]
  }
];

export const FAQ_LIST = [
  {
    q: 'Amader Job থেকে কীভাবে টাকা তুলবেন (Withdrawal)?',
    qEn: 'How to withdraw earnings from Amader Job?',
    a: 'আপনার Worker Wallet-এ ন্যূনতম ১০০ টাকা জমা হলে বিকাশ (bKash), নগদ (Nagad), রকেট (Rocket) অথবা বাইন্যান্স অ্যাকাউন্টে উইথড্র রিকোয়েস্ট পাঠাতে পারবেন। সাধারণত ৫-৩০ মিনিটের মধ্যে পেমেন্ট পাঠিয়ে দেওয়া হয়।',
    aEn: 'Once your earning balance reaches ৳100 ($1), you can withdraw directly to your personal bKash, Nagad, Rocket or Bank account. Payouts are processed within 5-30 minutes.'
  },
  {
    q: 'জব জমা দেওয়ার পর কখন পেমেন্ট পাবো?',
    qEn: 'When do I receive payment after submitting a job?',
    a: 'বায়ার বা এমপ্লয়ার সাধারণত ২৪ থেকে ৪৮ ঘণ্টার মধ্যে আপনার প্রুফ রিভিউ করে অনুমোদন দেন। ৭২ ঘণ্টার মধ্যে বায়ার রিভিউ না করলে আমাদের সিস্টেম স্বয়ংক্রিয়ভাবে প্রুফ অ্যাপ্রুভ করে আপনার একাউন্টে টাকা যোগ করে দেয়।',
    aEn: 'Employers review and approve within 24-48 hours. If the employer does not review within 72 hours, our automated system auto-approves and credits your earnings.'
  },
  {
    q: 'বায়ার হিসেবে কীভাবে কাজ পোস্ট করবেন (Post a Job as Employer)?',
    qEn: 'How can I post jobs as an Employer / Buyer?',
    a: '"জব পোস্ট করুন" (Post Job) বাটনে ক্লিক করে কাজের বিভাগ, নির্দেশনাবলি এবং প্রয়োজনীয় প্রুফ সিলেক্ট করুন। ডিপোজিট ওয়ালেট থেকে বাজেট লক করে ক্যাম্পেইন চালু করুন।',
    aEn: 'Click the "Post Job" button, select category, write task instructions, set required proofs and worker count with reward. After funding from your Deposit wallet, your campaign goes live.'
  },
  {
    q: 'রেফারেল প্রোগ্রামে কীভাবে আয় করা যায়?',
    qEn: 'How does the Referral & Affiliate program work?',
    a: 'আপনার প্রোফাইল থেকে ইউনিক রেফারেল লিংক বন্ধুদের সাথে শেয়ার করুন। আপনার রেফারলে যারা কাজ সম্পূর্ণ করবে, তাদের প্রতিটি কাজের আয়ের ৫% কমিশন আজীবন আপনার ওয়ালেটে জমা হবে।',
    aEn: 'Share your unique referral link with friends. Whenever they complete tasks, you get an instant 5% lifetime commission added to your wallet.'
  }
];
