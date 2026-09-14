export type Currency = 'BDT' | 'USD';
export type Language = 'bn' | 'en';
export type UserRole = 'worker' | 'employer';

export type JobCategory = 
  | 'youtube'
  | 'facebook'
  | 'telegram'
  | 'app_install'
  | 'seo_visit'
  | 'reviews'
  | 'review'
  | 'signup'
  | 'survey'
  | 'content'
  | 'kyc'
  | 'tiktok'
  | 'toffee'
  | 'twitter'
  | 'other';

export interface JobProofRequirement {
  id: string;
  type: 'text' | 'screenshot' | 'url';
  description: string;
  descriptionBn: string;
  exampleImage?: string;
  isRequired?: boolean;
}

export interface JobBoost {
  isActive: boolean;
  dailyBudgetUSD: number;
  mode: 'daily' | 'overall';
  endsAt: string;
  startedAt: string;
  totalCostUSD: number;
  daysRemaining?: number;
  durationDays?: number;
}

export interface Job {
  id: string;
  title: string;
  titleBn: string;
  category: JobCategory;
  categoryName: string;
  categoryNameBn: string;
  subCategory?: string;
  subCategoryBn?: string;
  employerId: string;
  employerName: string;
  employerAvatar: string;
  employerRating: number;
  employerRatingsCount?: number;
  employerFollowers?: number;
  employerVerified: boolean;
  payPerTaskBDT: number;
  payPerTaskUSD: number;
  totalSlots: number;
  completedSlots: number;
  estimatedMinutes: number;
  targetCountry: string; // 'Bangladesh' | 'International' | 'Worldwide' | 'Asia'
  targetCountryBn: string;
  targetLink?: string;
  description?: string;
  descriptionBn?: string;
  attachments?: { name: string; url: string; size?: string }[];
  instructions: string[];
  instructionsBn: string[];
  rules: string[];
  rulesBn: string[];
  proofRequirements: JobProofRequirement[];
  createdAt: string;
  expiresAt?: string;
  durationDays?: number;
  tags: string[];
  featured?: boolean;
  boost?: JobBoost;
  autoApproveDays: number;
  status: 'active' | 'completed' | 'paused';
}

export interface TaskSubmission {
  id: string;
  jobId: string;
  jobTitle: string;
  jobTitleBn: string;
  category: JobCategory;
  workerId: string;
  workerName: string;
  workerAvatar: string;
  submittedAt: string;
  proofText?: string;
  proofUrl?: string;
  proofImageUrl?: string;
  proofImages?: { requirementId: string; imageUrl: string; description: string }[];
  status: 'pending' | 'approved' | 'rejected' | 'disputed';
  feedback?: string;
  earnedBDT: number;
  earnedUSD: number;
}

export interface WalletTransaction {
  id: string;
  userId?: string;
  type: 'deposit' | 'withdrawal' | 'task_earning' | 'job_post' | 'referral_bonus' | 'daily_streak' | 'campaign_spend' | 'earning';
  title: string;
  titleBn: string;
  amountBDT: number;
  amountUSD: number;
  currency?: 'BDT' | 'USD';
  method?: 'bkash' | 'nagad' | 'rocket' | 'bank' | 'crypto_usdt' | 'binance';
  accountNumber?: string;
  trxId?: string;
  status: 'completed' | 'pending' | 'rejected';
  timestamp: string;
  note?: string;
}

export interface KycVerificationData {
  documentType: 'nid' | 'passport' | 'driving_license';
  fullName: string;
  docNumber: string;
  dob?: string;
  nidFrontUrl?: string;
  nidBackUrl?: string;
  passportUrl?: string;
  facePicUrl?: string;
  submittedAt?: string;
}

export interface UserProfile {
  id: string;
  uid?: string; // 8-character unique alphanumeric profile ID (e.g. RT8X9K2M)
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: UserRole;
  earningBalanceBDT: number;
  earningBalanceUSD: number;
  depositBalanceBDT: number;
  depositBalanceUSD: number;
  completedTasksCount: number;
  postedJobsCount: number;
  satisfactionRate: number; // e.g. 98.5%
  level: 'Bronze' | 'Silver' | 'Gold' | 'Pro Worker';
  isVerified: boolean;
  hasBlueBadge?: boolean;
  blueBadgePlan?: 'monthly' | 'yearly';
  blueBadgePurchasedAt?: string;
  blueBadgeExpiresAt?: string;
  blueAutoRenew?: boolean;
  twoFactorEnabled?: boolean;
  twoFactorPhone?: string;
  twoFactorVerifiedAt?: string;
  nidNumber?: string;
  kycStatus?: 'unverified' | 'pending' | 'verified' | 'rejected';
  kycData?: KycVerificationData;
  referralCode: string;
  referralCount?: number;
  referralEarningsBDT: number;
  referralEarningsUSD?: number;
  referredUsersCount: number;
  dailyStreak: number;
  lastClaimDate?: string;
  status?: 'active' | 'warned' | 'banned';
  banReason?: string;
  warningCount?: number;
  warningMessage?: string;
  isAdmin?: boolean;
}

export interface SiteSettings {
  siteName: string;
  siteNameBn: string;
  siteSubtitle: string;
  siteSubtitleBn: string;
  logoUrl: string;
  domain: string;
  supportEmail: string;
  whatsappNumber: string;
  helplinePhone: string;
  minDepositBDT: number;
  minWithdrawBDT: number;
  usdToBdtRate: number;
  noticeMarquee: string;
  noticeMarqueeBn: string;
  maintenanceMode: boolean;
  depositBonusPercent: number;
}

export interface SupportTicketMessage {
  id: string;
  sender: 'user' | 'admin';
  senderName: string;
  senderAvatar?: string;
  message: string;
  timestamp: string;
  attachments?: string[];
}

export interface SupportTicket {
  id: string; // e.g. TKT-9824
  userId: string;
  userName: string;
  userEmail: string;
  userPhone?: string;
  subject: string;
  category: 'deposit' | 'withdrawal' | 'task_approval' | 'account_2fa' | 'job_issue' | 'other';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  createdAt: string;
  updatedAt: string;
  messages: SupportTicketMessage[];
  unreadByAdmin?: boolean;
  unreadByUser?: boolean;
}

export interface WeeklyTopReferrer {
  rank: number;
  name: string;
  avatar: string;
  referralCount: number;
  earningsBDT: number;
  rewardBDT: number; // 1st: 80, 2nd: 40, 3rd: 20
  badge: string;
}

export interface NotificationItem {
  id: string;
  userId?: string;
  title: string;
  titleBn: string;
  message: string;
  messageBn: string;
  time?: string;
  timestamp?: string;
  read?: boolean;
  isRead?: boolean;
  type?: 'earning' | 'job' | 'system' | 'withdrawal' | 'deposit_success' | 'task_submitted' | 'task_approved' | string;
}

export interface TopEarner {
  rank: number;
  name: string;
  avatar: string;
  tasksCompleted: number;
  earningsBDT: number;
  country: string;
  badge: string;
}

export interface BlueBadgeStatus {
  isActive: boolean;
  isExpired: boolean;
  isAboutToExpire: boolean;
  daysRemaining: number;
}

export const getBlueBadgeStatus = (user?: Partial<UserProfile> | null): BlueBadgeStatus => {
  if (!user) return { isActive: false, isExpired: false, isAboutToExpire: false, daysRemaining: 0 };
  
  // If verified by NID (KYC) or permanent verification without expiry
  if (user.kycStatus === 'verified' && !user.blueBadgeExpiresAt) {
    return { isActive: true, isExpired: false, isAboutToExpire: false, daysRemaining: 999 };
  }

  if (!user.hasBlueBadge && !user.isVerified) {
    return { isActive: false, isExpired: false, isAboutToExpire: false, daysRemaining: 0 };
  }

  if (!user.blueBadgeExpiresAt) {
    return { isActive: true, isExpired: false, isAboutToExpire: false, daysRemaining: 30 };
  }

  const now = new Date();
  const expiry = new Date(user.blueBadgeExpiresAt);
  const diffTime = expiry.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (daysRemaining < 0) {
    return { isActive: false, isExpired: true, isAboutToExpire: false, daysRemaining: 0 };
  }
  if (daysRemaining <= 2) {
    return { isActive: true, isExpired: false, isAboutToExpire: true, daysRemaining };
  }
  return { isActive: true, isExpired: false, isAboutToExpire: false, daysRemaining };
};

/**
 * Check if a user qualifies for the Blue Verified Badge:
 * Strictly backed by MySQL database status and valid expiry
 */
export const isUserBlueBadgeVerified = (user?: Partial<UserProfile> | null): boolean => {
  if (!user) return false;
  const status = getBlueBadgeStatus(user);
  return status.isActive;
};

