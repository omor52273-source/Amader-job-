import { Job, TaskSubmission, WalletTransaction, UserProfile, TopEarner, NotificationItem, WeeklyTopReferrer, SupportTicket, SiteSettings } from '../types';

export const INITIAL_USER: UserProfile = {
  id: '',
  uid: '',
  name: '',
  email: '',
  phone: '',
  avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
  role: 'worker',
  earningBalanceBDT: 0.00,
  earningBalanceUSD: 0.00,
  depositBalanceBDT: 0.00,
  depositBalanceUSD: 0.00,
  completedTasksCount: 0,
  postedJobsCount: 0,
  satisfactionRate: 100,
  level: 'Bronze',
  isVerified: false,
  hasBlueBadge: false,
  twoFactorEnabled: false,
  twoFactorPhone: '',
  kycStatus: 'unverified',
  kycData: undefined,
  nidNumber: undefined,
  referralCode: '',
  referralEarningsBDT: 0.00,
  referredUsersCount: 0,
  dailyStreak: 0,
  lastClaimDate: '',
  status: 'active',
  warningCount: 0
};

export const INITIAL_SITE_SETTINGS: SiteSettings = {
  siteName: 'Amader Job',
  siteNameBn: 'আমাদের জব',
  siteSubtitle: 'Work • Earn • Grow',
  siteSubtitleBn: 'কাজ • আয় • উন্নতি',
  logoUrl: '',
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

// No demo user profiles
export const INITIAL_USERS: UserProfile[] = [];

// No demo jobs
export const INITIAL_JOBS: Job[] = [];

// No demo submissions
export const INITIAL_SUBMISSIONS: TaskSubmission[] = [];

// No demo wallet transactions
export const INITIAL_TRANSACTIONS: WalletTransaction[] = [];

// No demo notifications
export const INITIAL_NOTIFICATIONS: NotificationItem[] = [];

// No demo leaderboard
export const INITIAL_LEADERBOARD: TopEarner[] = [];

// No demo weekly referrers
export const WEEKLY_TOP_REFERRERS: WeeklyTopReferrer[] = [];

// No demo support tickets
export const INITIAL_TICKETS: SupportTicket[] = [];

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
