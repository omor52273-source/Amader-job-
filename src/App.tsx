import React, { useState, useEffect } from 'react';
import { 
  HeaderNav 
} from './components/HeaderNav';
import { 
  MobileBottomNav 
} from './components/MobileBottomNav';
import { 
  FloatingFeedbackTab 
} from './components/FloatingFeedbackTab';
import { 
  LandingHeroView 
} from './components/LandingHeroView';
import { 
  FreelancerDashboardView 
} from './components/FreelancerDashboardView';
import { 
  ClientDashboardView 
} from './components/ClientDashboardView';
import { 
  ClientMyJobsView 
} from './components/ClientMyJobsView';
import { 
  SubmissionsReviewView 
} from './components/SubmissionsReviewView';
import { 
  ManageBoostPage 
} from './components/ManageBoostPage';
import { 
  JobCard 
} from './components/JobCard';
import { 
  JobDetailPage 
} from './components/JobDetailPage';
import { 
  CreateJobPage 
} from './components/CreateJobPage';
import { 
  SupportTicketPage 
} from './components/SupportTicketPage';
import { 
  LoginPage 
} from './components/LoginPage';
import { 
  SignupPage 
} from './components/SignupPage';
import { 
  DepositPage 
} from './components/DepositPage';
import { 
  WithdrawPage 
} from './components/WithdrawPage';
import { 
  AccountView 
} from './components/AccountView';
import { 
  PostJobModal 
} from './components/PostJobModal';
import { 
  KycModal 
} from './components/KycModal';
import { 
  StatementModal 
} from './components/StatementModal';
import { 
  FeedbackModal 
} from './components/FeedbackModal';
import { 
  DownloadApkModal 
} from './components/DownloadApkModal';
import { 
  AuthModal 
} from './components/AuthModal';
import { 
  NotificationsModal 
} from './components/NotificationsModal';
import { 
  ReferralModal 
} from './components/ReferralModal';
import { 
  DailyBonusModal 
} from './components/DailyBonusModal';
import { 
  PoliciesModal, 
  PolicyType 
} from './components/PoliciesModal';
import { 
  Footer 
} from './components/Footer';
import { 
  TopRankingsView 
} from './components/TopRankingsView';

import { 
  UserProfile, 
  Language, 
  Currency, 
  Job, 
  TaskSubmission, 
  WalletTransaction, 
  NotificationItem, 
  UserRole,
  KycVerificationData
} from './types';
import { 
  INITIAL_USER, 
  INITIAL_JOBS, 
  INITIAL_SUBMISSIONS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_NOTIFICATIONS 
} from './data/initialData';
import { 
  StorageService 
} from './lib/storage';

import { 
  Search, 
  Filter, 
  Briefcase, 
  Sparkles, 
  PlusCircle, 
  ArrowLeft,
  Bell,
  Trophy
} from 'lucide-react';

export default function App() {
  // App Global State
  const [currentView, setCurrentView] = useState<string>('landing');
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem('amader_job_lang');
      if (saved === 'bn' || saved === 'en') return saved as Language;
    } catch (e) {}
    return 'en'; // Default primary website language is English
  });

  const setLanguage = (newLang: Language | ((prev: Language) => Language)) => {
    setLanguageState(prev => {
      const resolved = typeof newLang === 'function' ? newLang(prev) : newLang;
      try {
        localStorage.setItem('amader_job_lang', resolved);
      } catch (e) {}
      return resolved;
    });
  };

  const [currency, setCurrency] = useState<Currency>('BDT');
  const [darkMode, setDarkMode] = useState<boolean>(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(true);

  // Entities State with LocalStorage Persistence
  const [user, setUser] = useState<UserProfile>(() => StorageService.getUser() || INITIAL_USER);
  const [jobs, setJobs] = useState<Job[]>(() => StorageService.getJobs() || INITIAL_JOBS);
  const [submissions, setSubmissions] = useState<TaskSubmission[]>(() => StorageService.getSubmissions() || INITIAL_SUBMISSIONS);
  const [transactions, setTransactions] = useState<WalletTransaction[]>(() => StorageService.getTransactions() || INITIAL_TRANSACTIONS);
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => StorageService.getNotifications() || INITIAL_NOTIFICATIONS);

  // Detail & Selection States
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [selectedJobForSubmissions, setSelectedJobForSubmissions] = useState<Job | null>(null);
  const [selectedJobForBoost, setSelectedJobForBoost] = useState<Job | null>(null);

  // Modals visibility
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState<boolean>(false);
  const [isKycModalOpen, setIsKycModalOpen] = useState<boolean>(false);
  const [isStatementModalOpen, setIsStatementModalOpen] = useState<boolean>(false);
  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState<boolean>(false);
  const [isApkModalOpen, setIsApkModalOpen] = useState<boolean>(false);
  const [authModalState, setAuthModalState] = useState<{ isOpen: boolean; mode: 'login' | 'signup' }>({
    isOpen: false,
    mode: 'login'
  });
  const [isNotificationsModalOpen, setIsNotificationsModalOpen] = useState<boolean>(false);
  const [isReferralModalOpen, setIsReferralModalOpen] = useState<boolean>(false);
  const [isDailyBonusModalOpen, setIsDailyBonusModalOpen] = useState<boolean>(false);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyType | null>(null);

  // Job Search / Filter State for Marketplace
  const [jobSearchQuery, setJobSearchQuery] = useState('');
  const [jobCategoryFilter, setJobCategoryFilter] = useState<string>('all');

  // Sync Dark Mode class with <html> element
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  // Persist State to LocalStorage on changes
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const refCode = params.get('ref');
      if (refCode) {
        localStorage.setItem('amader_job_pending_ref', refCode.trim());
      }
      const resetToken = params.get('reset_token');
      if (resetToken) {
        setCurrentView('login');
      }
    } catch (e) {}
  }, []);

  // Sync latest user profile from MySQL database on initial load
  useEffect(() => {
    const fetchFreshUser = async () => {
      try {
        const uid = user?.uid || user?.id || '84920173';
        const res = await fetch(`/api/user?uid=${encodeURIComponent(uid)}`);
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.user) {
            setUser(prev => ({
              ...prev,
              ...data.user,
              hasBlueBadge: Boolean(data.user.hasBlueBadge),
              isVerified: Boolean(data.user.isVerified)
            }));
          }
        }
      } catch (e) {}
    };
    fetchFreshUser();
  }, []);

  useEffect(() => {
    StorageService.saveUser(user);
  }, [user]);

  useEffect(() => {
    StorageService.saveJobs(jobs);
  }, [jobs]);

  useEffect(() => {
    StorageService.saveSubmissions(submissions);
  }, [submissions]);

  useEffect(() => {
    StorageService.saveTransactions(transactions);
  }, [transactions]);

  useEffect(() => {
    StorageService.saveNotifications(notifications);
  }, [notifications]);

  // Handlers
  const handleOpenWallet = (tab?: 'deposit' | 'withdraw' | 'history') => {
    if (tab === 'deposit') {
      setCurrentView('deposit');
    } else if (tab === 'withdraw') {
      setCurrentView('withdraw');
    } else {
      setIsStatementModalOpen(true);
    }
  };

  const handleDepositSuccess = (amountBDT: number, method: string, trxId: string) => {
    const amountUSD = amountBDT / 100;
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'deposit',
      amountBDT,
      amountUSD,
      currency: 'BDT',
      method: method as any,
      status: 'completed',
      trxId,
      timestamp: new Date().toISOString(),
      title: `Deposit via ${method.toUpperCase()}`,
      titleBn: `${method === 'bkash' ? 'বিকাশ' : 'নগদ'} ডিপোজিট`
    };

    const newNotification: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Deposit Successful',
      titleBn: 'ডিপোজিট সফল হয়েছে',
      message: `৳${amountBDT.toFixed(2)} (${amountUSD.toFixed(2)} USD) credited to your deposit wallet.`,
      messageBn: `আপনার ডিপোজিট ব্যালেন্সে ৳${amountBDT.toFixed(2)} ($${amountUSD.toFixed(2)}) যোগ হয়েছে।`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'deposit_success'
    };

    setUser(prev => ({
      ...prev,
      depositBalanceBDT: prev.depositBalanceBDT + amountBDT,
      depositBalanceUSD: prev.depositBalanceUSD + amountUSD
    }));
    setTransactions(prev => [newTx, ...prev]);
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handleWithdrawSuccess = (amountBDT: number, method: string, accountNo: string) => {
    const amountUSD = amountBDT / 100;
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'withdrawal',
      amountBDT,
      amountUSD,
      currency: 'BDT',
      method: method as any,
      status: 'pending',
      accountNumber: accountNo,
      timestamp: new Date().toISOString(),
      title: `Withdrawal via ${method.toUpperCase()}`,
      titleBn: `${method === 'bkash' ? 'বিকাশ' : 'নগদ'} উইথড্রয়াল (পেন্ডিং)`
    };

    const newNotification: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Withdrawal Processing',
      titleBn: 'উইথড্রয়াল প্রসেসিং হচ্ছে',
      message: `৳${amountBDT.toFixed(2)} cashout request sent to ${accountNo}.`,
      messageBn: `৳${amountBDT.toFixed(2)} ক্যাশআউট রিকোয়েস্ট পাঠানো হয়েছে।`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'system'
    };

    setUser(prev => ({
      ...prev,
      earningBalanceBDT: Math.max(0, prev.earningBalanceBDT - amountBDT),
      earningBalanceUSD: Math.max(0, prev.earningBalanceUSD - amountUSD)
    }));
    setTransactions(prev => [newTx, ...prev]);
    setNotifications(prev => [newNotification, ...prev]);
  };

  const handlePostJob = (jobData: Omit<Job, 'id' | 'createdAt' | 'completedSlots' | 'status'>) => {
    const totalCostUSD = (jobData.totalSlots * jobData.payPerTaskUSD) + (jobData.boost?.isActive ? 1.00 : 0);
    const totalCostBDT = totalCostUSD * 100;

    // Calculate 7-digit numeric Job ID starting from 4876648
    const existingNumericIds = jobs
      .map(j => parseInt(j.id.replace(/[^0-9]/g, ''), 10))
      .filter(n => !isNaN(n) && n >= 4876640);
    const maxId = existingNumericIds.length > 0 ? Math.max(...existingNumericIds) : 4876648;
    const newJobId = (maxId + 1).toString();

    const newJob: Job = {
      ...jobData,
      id: newJobId,
      completedSlots: 0,
      status: 'active',
      createdAt: new Date().toISOString()
    };

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'campaign_spend',
      amountBDT: totalCostBDT,
      amountUSD: totalCostUSD,
      currency: 'USD',
      status: 'completed',
      timestamp: new Date().toISOString(),
      title: `Posted Job: ${jobData.title} (#${newJobId})`,
      titleBn: `জব পোস্ট: ${jobData.titleBn || jobData.title} (#${newJobId})`
    };

    setUser(prev => ({
      ...prev,
      depositBalanceUSD: Math.max(0, prev.depositBalanceUSD - totalCostUSD),
      depositBalanceBDT: Math.max(0, prev.depositBalanceBDT - totalCostBDT)
    }));
    setJobs(prev => [newJob, ...prev]);
    setTransactions(prev => [newTx, ...prev]);
    setCurrentView('my_jobs');
  };

  const handleSubmitTask = (submissionData: Omit<TaskSubmission, 'id' | 'submittedAt' | 'status'>) => {
    const newSubmission: TaskSubmission = {
      ...submissionData,
      id: `sub_${Date.now()}`,
      submittedAt: new Date().toISOString(),
      status: 'pending'
    };

    setSubmissions(prev => [newSubmission, ...prev]);

    // increment completed slots in job
    setJobs(prev => prev.map(j => {
      if (j.id === submissionData.jobId) {
        return { ...j, completedSlots: Math.min(j.totalSlots, j.completedSlots + 1) };
      }
      return j;
    }));

    // notification
    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Proof Submitted',
      titleBn: 'কাজের প্রুফ জমা হয়েছে',
      message: `Your proof for "${selectedJob?.title || 'Micro Task'}" was submitted for employer review.`,
      messageBn: `"${selectedJob?.titleBn || 'মাইক্রো টাস্ক'}" এর প্রুফ সফলভাবে জমা হয়েছে।`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'task_submitted'
    };
    setNotifications(prev => [newNotif, ...prev]);
  };

  const handleApproveSubmission = (subId: string) => {
    const targetSub = submissions.find(s => s.id === subId);
    if (!targetSub) return;

    setSubmissions(prev => prev.map(s => {
      if (s.id === subId) {
        return { ...s, status: 'approved' };
      }
      return s;
    }));

    // credit worker earnings if current user is the worker
    if (targetSub.workerId === user.id) {
      setUser(prev => ({
        ...prev,
        earningBalanceUSD: prev.earningBalanceUSD + targetSub.earnedUSD,
        earningBalanceBDT: prev.earningBalanceBDT + targetSub.earnedBDT,
        completedTasksCount: prev.completedTasksCount + 1
      }));
    }

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: targetSub.workerId,
      type: 'earning',
      amountBDT: targetSub.earnedBDT,
      amountUSD: targetSub.earnedUSD,
      currency: 'USD',
      status: 'completed',
      timestamp: new Date().toISOString(),
      title: `Earned from Task: ${targetSub.jobTitle}`,
      titleBn: `টাস্ক থেকে উপার্জন: ${targetSub.jobTitle}`
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleRejectSubmission = (subId: string, feedback: string) => {
    setSubmissions(prev => prev.map(s => {
      if (s.id === subId) {
        return { ...s, status: 'rejected', feedback };
      }
      return s;
    }));
  };

  const handleToggleJobStatus = (jobId: string) => {
    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          status: j.status === 'active' ? 'paused' : 'active'
        };
      }
      return j;
    }));
  };

  const handleUpdateBoost = (
    jobId: string,
    isActive: boolean,
    dailyBudgetUSD: number,
    mode: 'daily' | 'overall',
    durationDays?: number
  ) => {
    const days = durationDays || 1;
    const totalCostUSD = +(dailyBudgetUSD * days).toFixed(2);
    const totalCostBDT = Math.round(totalCostUSD * 100);

    const updatedBoost = {
      isActive,
      dailyBudgetUSD,
      mode,
      durationDays: days,
      daysRemaining: days
    };

    setJobs(prev => prev.map(j => {
      if (j.id === jobId) {
        return {
          ...j,
          boost: updatedBoost
        };
      }
      return j;
    }));

    setSelectedJobForBoost(prev => {
      if (prev && prev.id === jobId) {
        return {
          ...prev,
          boost: updatedBoost
        };
      }
      return prev;
    });

    if (isActive) {
      setUser(prev => ({
        ...prev,
        depositBalanceUSD: Math.max(0, +(prev.depositBalanceUSD - totalCostUSD).toFixed(2)),
        depositBalanceBDT: Math.max(0, prev.depositBalanceBDT - totalCostBDT)
      }));

      const newTx: WalletTransaction = {
        id: `tx_${Date.now()}`,
        userId: user.id,
        type: 'campaign_spend',
        amountBDT: totalCostBDT,
        amountUSD: totalCostUSD,
        currency: 'USD',
        status: 'completed',
        timestamp: new Date().toISOString(),
        title: `VIP Campaign Boost (${days} Days)`,
        titleBn: `ভিআইপি ক্যাম্পেইন বুস্ট (${days} দিন)`
      };
      setTransactions(prev => [newTx, ...prev]);

      const notif: NotificationItem = {
        id: `notif_${Date.now()}`,
        userId: user.id,
        title: 'Job Boost Activated',
        titleBn: 'জব বুস্ট চালু হয়েছে',
        message: `Your campaign boost is active for ${days} days at $${dailyBudgetUSD.toFixed(2)}/day.`,
        messageBn: `আপনার ক্যাম্পেইন ${days} দিনের জন্য $${dailyBudgetUSD.toFixed(2)}/দিন হিসেবে বুস্ট করা হয়েছে।`,
        timestamp: new Date().toISOString(),
        isRead: false,
        type: 'system'
      };
      setNotifications(prev => [notif, ...prev]);
    }
  };

  // Security password state
  const [userPassword, setUserPassword] = useState<string>('123456');

  const handleKycSubmit = (kycData: KycVerificationData) => {
    setUser(prev => ({
      ...prev,
      isVerified: false,
      kycStatus: 'pending',
      kycData,
      nidNumber: kycData.docNumber
    }));

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'NID Verification Submitted',
      titleBn: 'এনআইডি ভেরিফিকেশন জমা হয়েছে',
      message: 'Your NID card has been submitted. Admin will review and verify your identity within 1-24 hours.',
      messageBn: 'আপনার জাতীয় পরিচয়পত্র সফলভাবে জমা হয়েছে। অ্যাডমিন টিম ১-২৪ ঘণ্টার মধ্যে যাচাই করে অনুমোদন করবে।',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleAdminApproveKyc = () => {
    setUser(prev => ({
      ...prev,
      isVerified: true,
      kycStatus: 'verified'
    }));

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'VIP NID Verification Approved!',
      titleBn: 'জাতীয় পরিচয়পত্র অনুমোদিত হয়েছে!',
      message: 'Congratulations! Your NID verification has been approved by admin. The Blue Verified Badge is now active.',
      messageBn: 'অভিনন্দন! আপনার জাতীয় পরিচয়পত্র অ্যাডমিন কর্তৃক অনুমোদিত হয়েছে এবং প্রোফাইলে ব্লু ব্যাজ যুক্ত হয়েছে।',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleAdminRejectKyc = (reason?: string) => {
    setUser(prev => ({
      ...prev,
      isVerified: false,
      kycStatus: 'rejected'
    }));

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'NID Verification Action Required',
      titleBn: 'এনআইডি ভেরিফিকেশন বাতিল হয়েছে',
      message: `Your NID submission was rejected: ${reason || 'Unclear photos'}. Please re-upload with clear photos.`,
      messageBn: `আপনার এনআইডি সাবমিশন বাতিল হয়েছে: ${reason || 'অস্পষ্ট ছবি'}। অনুগ্রহ করে পরিষ্কার ছবি সহ পুনরায় জমা দিন।`,
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
  };

  const handleChangePassword = (oldPass: string, newPass: string) => {
    if (oldPass !== userPassword) {
      return { success: false, message: language === 'bn' ? 'বর্তমান পাসওয়ার্ডটি সঠিক নয়!' : 'Current password is incorrect!' };
    }
    setUserPassword(newPass);
    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Password Changed Successfully',
      titleBn: 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে',
      message: 'Your account login password has been updated securely.',
      messageBn: 'আপনার অ্যাকাউন্টের লগইন পাসওয়ার্ড সফলভাবে আপডেট করা হয়েছে।',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [notif, ...prev]);
    return { success: true };
  };

  const handleBuyBlueBadge = (plan: 'monthly' | 'yearly', paymentMethod: 'wallet' | 'bkash' | 'nagad' | 'rocket') => {
    const costBDT = plan === 'yearly' ? 800 : 50;
    const costUSD = +(costBDT / 100).toFixed(2);
    const now = new Date();
    const expiry = new Date();
    if (plan === 'yearly') {
      expiry.setFullYear(expiry.getFullYear() + 1);
    } else {
      expiry.setDate(expiry.getDate() + 30);
    }

    setUser(prev => {
      let newEarningBDT = prev.earningBalanceBDT;
      let newEarningUSD = prev.earningBalanceUSD;
      let newDepositBDT = prev.depositBalanceBDT;
      let newDepositUSD = prev.depositBalanceUSD;

      if (paymentMethod === 'wallet') {
        if (newDepositBDT >= costBDT) {
          newDepositBDT -= costBDT;
          newDepositUSD = Math.max(0, newDepositUSD - costUSD);
        } else {
          const remaining = costBDT - newDepositBDT;
          newDepositBDT = 0;
          newDepositUSD = 0;
          newEarningBDT = Math.max(0, newEarningBDT - remaining);
          newEarningUSD = Math.max(0, newEarningUSD - (remaining / 100));
        }
      }

      return {
        ...prev,
        hasBlueBadge: true,
        blueBadgePlan: plan,
        blueBadgePurchasedAt: now.toISOString(),
        blueBadgeExpiresAt: expiry.toISOString(),
        earningBalanceBDT: newEarningBDT,
        earningBalanceUSD: newEarningUSD,
        depositBalanceBDT: newDepositBDT,
        depositBalanceUSD: newDepositUSD,
      };
    });

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'campaign_spend',
      amountBDT: costBDT,
      amountUSD: costUSD,
      currency: 'BDT',
      status: 'completed',
      timestamp: now.toISOString(),
      title: `Blue Badge Subscription (${plan === 'yearly' ? 'Yearly - ৳800' : 'Monthly - ৳50'})`,
      titleBn: `ব্লু ভেরিফাইড ব্যাজ সাবস্ক্রিপশন (${plan === 'yearly' ? 'বাৎসরিক - ৳৮০০' : 'মাসিক - ৳৫০'})`
    };
    setTransactions(prev => [newTx, ...prev]);

    const notif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Blue Badge Activated!',
      titleBn: 'ব্লু ভেরিফাইড ব্যাজ সক্রিয় হয়েছে!',
      message: `Congratulations! Your ${plan === 'yearly' ? '1-Year VIP' : '1-Month'} Blue Verified Badge is now active on your profile.`,
      messageBn: `অভিনন্দন! আপনার ${plan === 'yearly' ? '১ বছরের ভিআইপি' : '১ মাসের'} ব্লু ভেরিফাইড ব্যাজ প্রোফাইলে সফলভাবে যুক্ত হয়েছে।`,
      timestamp: now.toISOString(),
      isRead: false,
      type: 'system'
    };
    setNotifications(prev => [notif, ...prev]);

    // Persist to MySQL backend
    try {
      fetch('/api/user/buy-blue-badge', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ uid: user.uid || user.id, plan })
      });
    } catch (e) {}
  };

  const handleClaimDailyBonus = (amountBDT: number) => {
    const amountUSD = amountBDT / 100;
    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'earning',
      amountBDT,
      amountUSD,
      currency: 'BDT',
      status: 'completed',
      timestamp: new Date().toISOString(),
      title: 'Daily Check-in Bonus',
      titleBn: 'প্রতিদিনের ফ্রি বোনাস'
    };

    setUser(prev => ({
      ...prev,
      earningBalanceBDT: prev.earningBalanceBDT + amountBDT,
      earningBalanceUSD: prev.earningBalanceUSD + amountUSD
    }));
    setTransactions(prev => [newTx, ...prev]);
  };

  const handleLogin = (email: string, role: UserRole) => {
    setIsLoggedIn(true);
    setUser(prev => ({
      ...prev,
      email,
      role
    }));
    if (role === 'employer') {
      setCurrentView('client');
    } else {
      setCurrentView('freelancer');
    }
  };

  const handleSignup = (name: string, email: string, phone: string, role: UserRole) => {
    setIsLoggedIn(true);
    const signupBonusBDT = 2.00;
    const signupBonusUSD = 0.02;

    const newTx: WalletTransaction = {
      id: `tx_${Date.now()}`,
      userId: user.id,
      type: 'earning',
      amountBDT: signupBonusBDT,
      amountUSD: signupBonusUSD,
      currency: 'BDT',
      status: 'completed',
      timestamp: new Date().toISOString(),
      title: 'Sign Up Registration Bonus',
      titleBn: 'নতুন একাউন্ট সাইনআপ বোনাস'
    };

    const newNotif: NotificationItem = {
      id: `notif_${Date.now()}`,
      userId: user.id,
      title: 'Welcome Bonus Credited!',
      titleBn: 'সাইনআপ বোনাস যুক্ত হয়েছে!',
      message: '৳2.00 free signup bonus has been added to your earning balance.',
      messageBn: 'আপনার অ্যাকাউন্টে ৳২.০০ সাইনআপ বোনাস সফলভাবে জমা হয়েছে।',
      timestamp: new Date().toISOString(),
      isRead: false,
      type: 'system'
    };

    setUser(prev => ({
      ...prev,
      name,
      email,
      phone,
      role,
      isVerified: false,
      kycStatus: 'unverified',
      kycData: undefined,
      nidNumber: undefined,
      earningBalanceBDT: prev.earningBalanceBDT + signupBonusBDT,
      earningBalanceUSD: prev.earningBalanceUSD + signupBonusUSD
    }));
    setTransactions(prev => [newTx, ...prev]);
    setNotifications(prev => [newNotif, ...prev]);

    if (role === 'employer') {
      setCurrentView('client');
    } else {
      setCurrentView('freelancer');
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setCurrentView('landing');
  };

  const handleUpdateProfile = (name: string, avatar: string) => {
    setUser(prev => ({
      ...prev,
      name,
      avatar
    }));
  };

  // Filtered jobs list for browsing (VIP boosted jobs featured at the top)
  const filteredJobs = (jobs || [])
    .filter(job => {
      if (!job) return false;
      if (jobCategoryFilter !== 'all' && job.category !== jobCategoryFilter) return false;
      if (jobSearchQuery.trim()) {
        const q = jobSearchQuery.toLowerCase();
        return (
          (job.title && job.title.toLowerCase().includes(q)) ||
          (job.titleBn && job.titleBn.toLowerCase().includes(q)) ||
          (job.categoryName && job.categoryName.toLowerCase().includes(q))
        );
      }
      return true;
    })
    .sort((a, b) => {
      const aBoost = a.boost?.isActive ? 1 : 0;
      const bBoost = b.boost?.isActive ? 1 : 0;
      if (bBoost !== aBoost) return bBoost - aBoost;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;

  const handleSwitchRole = (role: UserRole) => {
    setUser(prev => ({ ...prev, role }));
    if (role === 'employer') {
      setCurrentView('client');
    } else {
      setCurrentView('freelancer');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden w-full max-w-full">
      
      {/* 1. Universal Top Navigation Bar */}
      <HeaderNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        language={language}
        setLanguage={setLanguage}
        user={user}
        notifications={notifications}
        onOpenWallet={handleOpenWallet}
        onOpenPostJob={() => setCurrentView('create_job')}
        onOpenApkModal={() => setIsApkModalOpen(true)}
        onOpenFeedback={() => setIsFeedbackModalOpen(true)}
        onOpenKyc={() => setIsKycModalOpen(true)}
        onOpenAuth={(mode = 'login') => setCurrentView(mode === 'signup' ? 'signup' : 'login')}
        onOpenStatement={() => setIsStatementModalOpen(true)}
        onOpenNotifications={() => setCurrentView('notifications')}
        onSwitchRole={handleSwitchRole}
        isLoggedIn={isLoggedIn}
        onLogout={handleLogout}
      />

      {/* 2. Main Page Container */}
      <main className={currentView === 'support' ? "w-full max-w-7xl mx-auto px-1 sm:px-3 lg:px-4 pt-1 sm:pt-2 pb-20 md:pb-2 overflow-x-hidden" : "max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 pb-28 md:pb-12 overflow-x-hidden w-full"}>
        
        {/* VIEW: Dedicated Login Page */}
        {currentView === 'login' && (
          <LoginPage
            language={language}
            onLogin={handleLogin}
            onNavigateToSignup={() => setCurrentView('signup')}
            onBack={() => setCurrentView('landing')}
            onOpenSupport={() => setCurrentView('support')}
          />
        )}

        {/* VIEW: Dedicated Signup Page */}
        {currentView === 'signup' && (
          <SignupPage
            language={language}
            onSignup={handleSignup}
            onNavigateToLogin={() => setCurrentView('login')}
            onBack={() => setCurrentView('landing')}
            onOpenSupport={() => setCurrentView('support')}
          />
        )}

        {/* VIEW: Landing Hero */}
        {currentView === 'landing' && (
          <LandingHeroView
            language={language}
            currency={currency}
            onStartWorking={() => {
              if (isLoggedIn) {
                setCurrentView('freelancer');
              } else {
                setCurrentView('signup');
              }
            }}
            onPostJob={() => {
              if (isLoggedIn) {
                if (user.role !== 'employer') {
                  setUser(prev => ({ ...prev, role: 'employer' }));
                }
                setCurrentView('create_job');
              } else {
                setCurrentView('signup');
              }
            }}
            onDownloadApk={() => setIsApkModalOpen(true)}
            onExploreJobs={() => {
              if (isLoggedIn) {
                setCurrentView('freelancer');
              } else {
                setCurrentView('signup');
              }
            }}
            onViewTopRankings={() => setCurrentView('top_rankings')}
            recentJobs={jobs.slice(0, 6)}
          />
        )}

        {/* VIEW: Freelancer Dashboard */}
        {currentView === 'freelancer' && (
          <div className="space-y-6">
            <FreelancerDashboardView
              user={user}
              language={language}
              currency={currency}
              submissions={submissions}
              availableJobsCount={jobs.filter(j => j.status === 'active').length}
              onBrowseJobs={() => {
                const el = document.getElementById('marketplace-jobs-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              onViewStatement={() => setIsStatementModalOpen(true)}
              onWithdraw={() => setCurrentView('withdraw')}
              onOpenDailyBonus={() => setIsDailyBonusModalOpen(true)}
              onOpenKyc={() => setIsKycModalOpen(true)}
              onOpenReferral={() => setIsReferralModalOpen(true)}
              onViewMySubmissions={() => {
                const el = document.getElementById('marketplace-jobs-section');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              darkMode={darkMode}
            />

            {/* Micro Tasks Marketplace Grid Section */}
            <section id="marketplace-jobs-section" className="space-y-4 pt-4 border-t border-slate-200 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    <span>{language === 'bn' ? 'উপলব্ধ মাইক্রো-জব ও টাস্ক' : 'Available Micro Tasks'}</span>
                  </h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {language === 'bn' ? 'সহজ কাজ সম্পন্ন করে সরাসরি পেমেন্ট নিন' : 'Complete tasks, submit proof, and receive instant payouts'}
                  </p>
                </div>

                {/* Search and Category Filters */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 w-full sm:w-auto">
                  <div className="relative flex-1 sm:w-60">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="text"
                      value={jobSearchQuery}
                      onChange={(e) => setJobSearchQuery(e.target.value)}
                      placeholder={language === 'bn' ? 'কাজ খুঁজুন...' : 'Search tasks...'}
                      className={`w-full pl-9 pr-8 py-2 sm:py-1.5 rounded-xl border text-xs font-semibold outline-hidden transition ${
                        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                      }`}
                    />
                    {jobSearchQuery && (
                      <button 
                        type="button"
                        onClick={() => setJobSearchQuery('')}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs p-1 cursor-pointer"
                        aria-label="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <select
                    value={jobCategoryFilter}
                    onChange={(e) => setJobCategoryFilter(e.target.value)}
                    className={`px-3 py-2 sm:py-1.5 rounded-xl border text-xs font-semibold outline-hidden cursor-pointer ${
                      darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                    }`}
                  >
                    <option value="all">{language === 'bn' ? 'সকল ক্যাটেগরি' : 'All Categories'}</option>
                    <option value="youtube">YouTube</option>
                    <option value="facebook">Facebook</option>
                    <option value="telegram">Telegram</option>
                    <option value="tiktok">TikTok</option>
                    <option value="app_install">App Install</option>
                    <option value="review">Review</option>
                  </select>
                </div>
              </div>

              {/* Mobile Quick Horizontal Category Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 w-full no-scrollbar sm:hidden">
                {[
                  { id: 'all', label: language === 'bn' ? 'সব কাজ' : 'All' },
                  { id: 'youtube', label: 'YouTube' },
                  { id: 'facebook', label: 'Facebook' },
                  { id: 'telegram', label: 'Telegram' },
                  { id: 'app_install', label: language === 'bn' ? 'অ্যাপ ডাউনলোড' : 'App Install' },
                  { id: 'review', label: language === 'bn' ? 'রিভিউ' : 'Review' }
                ].map(cat => (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setJobCategoryFilter(cat.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all active:scale-95 shrink-0 cursor-pointer ${
                      jobCategoryFilter === cat.id
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : darkMode 
                          ? 'bg-slate-800 text-slate-300 border border-slate-700' 
                          : 'bg-white text-slate-700 border border-slate-200'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Grid of Job Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4">
                {filteredJobs.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400 text-xs">
                    {language === 'bn' ? 'কোনো কাজ পাওয়া যায়নি।' : 'No tasks match your search.'}
                  </div>
                ) : (
                  (filteredJobs || []).map(job => (
                    <JobCard
                      key={job.id}
                      job={job}
                      language={language}
                      currency={currency}
                      onSelect={(j) => {
                        setSelectedJob(j);
                        setCurrentView('job_detail');
                      }}
                      isApplied={submissions.some(s => s.jobId === job.id && s.workerId === user.id)}
                    />
                  ))
                )}
              </div>
            </section>
          </div>
        )}

        {/* VIEW: Client Dashboard */}
        {currentView === 'client' && (
          <ClientDashboardView
            user={user}
            language={language}
            currency={currency}
            jobs={jobs}
            submissions={submissions}
            onOpenPostJob={() => setIsPostJobModalOpen(true)}
            onOpenDeposit={() => setCurrentView('deposit')}
            onViewStatement={() => setIsStatementModalOpen(true)}
            onViewAllJobs={() => setCurrentView('my_jobs')}
            onApproveSubmission={handleApproveSubmission}
            onRejectSubmission={handleRejectSubmission}
            onToggleJobStatus={handleToggleJobStatus}
            darkMode={darkMode}
          />
        )}

        {/* VIEW: Client My Jobs */}
        {currentView === 'my_jobs' && (
          <ClientMyJobsView
            jobs={jobs}
            submissions={submissions}
            user={user}
            language={language}
            currency={currency}
            darkMode={darkMode}
            onOpenPostJob={() => setIsPostJobModalOpen(true)}
            onSelectJobForSubmissions={(job) => {
              setSelectedJobForSubmissions(job);
              setCurrentView('submissions_review');
            }}
            onToggleJobStatus={handleToggleJobStatus}
            onOpenManageBoost={(job) => {
              setSelectedJobForBoost(job);
              setCurrentView('manage_boost');
            }}
          />
        )}

        {/* VIEW: Submissions Review */}
        {currentView === 'submissions_review' && selectedJobForSubmissions && (
          <SubmissionsReviewView
            job={selectedJobForSubmissions}
            submissions={submissions}
            language={language}
            currency={currency}
            darkMode={darkMode}
            onBack={() => setCurrentView('my_jobs')}
            onApprove={handleApproveSubmission}
            onReject={handleRejectSubmission}
            onViewJobDetails={(job) => {
              setSelectedJob(job);
              setCurrentView('job_detail');
            }}
            onEditJob={(job) => {
              setSelectedJobForBoost(job);
              setCurrentView('manage_boost');
            }}
          />
        )}

        {/* VIEW: Manage Boost */}
        {currentView === 'manage_boost' && selectedJobForBoost && (
          <ManageBoostPage
            job={selectedJobForBoost}
            user={user}
            language={language}
            currency={currency}
            darkMode={darkMode}
            onBack={() => setCurrentView('my_jobs')}
            onUpdateBoost={handleUpdateBoost}
          />
        )}

        {/* VIEW: Job Detail Page */}
        {currentView === 'job_detail' && selectedJob && (
          <JobDetailPage
            job={selectedJob}
            user={user}
            language={language}
            currency={currency}
            darkMode={darkMode}
            onBack={() => {
              if (user.role === 'employer') {
                setCurrentView('my_jobs');
              } else {
                setCurrentView('freelancer');
              }
            }}
            onSubmitTask={handleSubmitTask}
            alreadyApplied={submissions.some(s => s.jobId === selectedJob.id && s.workerId === user.id)}
          />
        )}

        {/* VIEW: Create Job (Dedicated Full Page View) */}
        {currentView === 'create_job' && (
          <CreateJobPage
            user={user}
            language={language}
            currency={currency}
            onJobCreated={(newJob) => {
              setJobs(prev => [newJob, ...prev]);
              setNotifications(prev => [
                {
                  id: `NOTIF-${Date.now()}`,
                  userId: user.uid || user.id,
                  title: 'Job Published Successfully!',
                  titleBn: 'আপনার নতুন কাজ সফলভাবে লাইভ হয়েছে!',
                  message: `Job "${newJob.title}" with ${newJob.totalSlots} slots is now available for workers.`,
                  messageBn: `"${newJob.titleBn || newJob.title}" কাজটি সফলভাবে পাবলিশ হয়েছে এবং কর্মীরা কাজ শুরু করতে পারবে।`,
                  type: 'system',
                  timestamp: new Date().toISOString(),
                  isRead: false
                },
                ...prev
              ]);
              setCurrentView('my_jobs');
            }}
            onOpenDeposit={() => setCurrentView('deposit')}
            onBack={() => {
              if (user.role === 'employer') {
                setCurrentView('client');
              } else {
                setCurrentView('freelancer');
              }
            }}
          />
        )}

        {/* VIEW: Support Tickets (Dedicated 24/7 Desk Page) */}
        {currentView === 'support' && (
          <SupportTicketPage
            user={user}
            language={language}
            onBack={() => {
              if (isLoggedIn) {
                setCurrentView(user.role === 'employer' ? 'client' : 'freelancer');
              } else {
                setCurrentView('landing');
              }
            }}
            onAddNotification={(notif) => {
              setNotifications(prev => [notif, ...prev]);
            }}
          />
        )}

        {/* VIEW: Deposit Page */}
        {currentView === 'deposit' && (
          <DepositPage
            user={user}
            language={language}
            currency={currency}
            darkMode={darkMode}
            transactions={transactions}
            onDepositSuccess={handleDepositSuccess}
            onBack={() => {
              if (user.role === 'employer') {
                setCurrentView('client');
              } else {
                setCurrentView('freelancer');
              }
            }}
          />
        )}

        {/* VIEW: Withdraw Page */}
        {currentView === 'withdraw' && (
          <WithdrawPage
            user={user}
            language={language}
            currency={currency}
            darkMode={darkMode}
            transactions={transactions}
            onWithdrawSuccess={handleWithdrawSuccess}
            onOpenKyc={() => setIsKycModalOpen(true)}
            onBack={() => setCurrentView('freelancer')}
          />
        )}

        {/* VIEW: Account & Settings */}
        {currentView === 'account' && (
          <AccountView
            user={user}
            language={language}
            currency={currency}
            darkMode={darkMode}
            onBack={() => {
              if (user.role === 'employer') {
                setCurrentView('client');
              } else {
                setCurrentView('freelancer');
              }
            }}
            onNavigate={(view) => setCurrentView(view)}
            onOpenPostJob={() => setIsPostJobModalOpen(true)}
            onToggleLanguage={() => setLanguage(prev => prev === 'bn' ? 'en' : 'bn')}
            onLogout={handleLogout}
            onOpenKyc={() => setIsKycModalOpen(true)}
            onOpenWallet={handleOpenWallet}
            onUpdateProfile={handleUpdateProfile}
            onSubmitKyc={handleKycSubmit}
            onAdminApproveKyc={handleAdminApproveKyc}
            onAdminRejectKyc={handleAdminRejectKyc}
            onChangePassword={handleChangePassword}
            onBuyBlueBadge={handleBuyBlueBadge}
          />
        )}

        {/* VIEW: Top Rankings (Top Referrers & Top Depositors) */}
        {currentView === 'top_rankings' && (
          <TopRankingsView
            user={user}
            language={language}
            currency={currency}
            onOpenDeposit={() => setCurrentView('deposit')}
            onBack={() => {
              if (isLoggedIn) {
                setCurrentView(user.role === 'employer' ? 'client' : 'freelancer');
              } else {
                setCurrentView('landing');
              }
            }}
          />
        )}

        {/* VIEW: Notifications (Dedicated Full Page View) */}
        {currentView === 'notifications' && (
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    if (isLoggedIn) {
                      setCurrentView(user.role === 'employer' ? 'client' : 'freelancer');
                    } else {
                      setCurrentView('landing');
                    }
                  }}
                  className="p-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 transition cursor-pointer"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
                    <Bell className="w-6 h-6 text-emerald-600" />
                    <span>{language === 'bn' ? 'বিজ্ঞপ্তি ও নোটিফিকেশন' : 'Notifications'}</span>
                  </h1>
                  <p className="text-xs text-slate-500">
                    {language === 'bn' ? 'আপনার অ্যাকাউন্টের সাম্প্রতিক সকল আপডেট' : 'All your latest activity and system alerts'}
                  </p>
                </div>
              </div>

              {notifications.some(n => !n.isRead) && (
                <button
                  onClick={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
                  className="text-xs font-bold text-emerald-600 hover:underline cursor-pointer"
                >
                  {language === 'bn' ? 'সব পড়া হয়েছে' : 'Mark all read'}
                </button>
              )}
            </div>

            {/* Notification items list */}
            <div className="space-y-2.5">
              {notifications.length === 0 ? (
                <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-400 text-xs">
                  {language === 'bn' ? 'কোনো বিজ্ঞপ্তি নেই' : 'No notifications yet.'}
                </div>
              ) : (
                (notifications || []).map(notif => (
                  <div
                    key={notif.id}
                    onClick={() => setNotifications(prev => prev.map(n => n.id === notif.id ? { ...n, isRead: true } : n))}
                    className={`p-4 rounded-2xl border transition cursor-pointer flex items-start gap-3.5 ${
                      notif.isRead
                        ? 'bg-white border-slate-200 opacity-80'
                        : 'bg-emerald-50/60 border-emerald-300 shadow-2xs'
                    }`}
                  >
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                          {language === 'bn' ? notif.titleBn : notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400 shrink-0">
                          {new Date(notif.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                        {language === 'bn' ? notif.messageBn : notif.message}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

      </main>

      {/* 3. Professional Clean Footer - Only shown before login and on the Home page (freelancer/client/landing) */}
      {(!isLoggedIn || currentView === 'freelancer' || currentView === 'client' || currentView === 'landing') && (
        <Footer
          language={language}
          onOpenPolicies={(tab) => setSelectedPolicy(tab || 'terms')}
          onOpenDeposit={() => setCurrentView('deposit')}
          onOpenWithdraw={() => setCurrentView('withdraw')}
          onOpenPostJob={() => setCurrentView('create_job')}
          onBrowseJobs={() => setCurrentView('freelancer')}
          onOpenTopRankings={() => setCurrentView('top_rankings')}
          onOpenSupport={() => setCurrentView('support')}
        />
      )}

      {/* 4. Floating Right Feedback Tab (Desktop) */}
      <FloatingFeedbackTab onOpen={() => setIsFeedbackModalOpen(true)} />

      {/* 4. Mobile Bottom Navigation Bar (Mobile View - Authenticated only, hidden on job_detail) */}
      {isLoggedIn && currentView !== 'job_detail' && (
        <MobileBottomNav
          currentView={currentView}
          setCurrentView={setCurrentView}
          onOpenPostJob={() => setCurrentView('create_job')}
          onOpenDeposit={() => setCurrentView('deposit')}
          onOpenNotifications={() => setCurrentView('notifications')}
          language={language}
          userRole={user.role}
          unreadNotificationsCount={unreadNotificationsCount}
        />
      )}

      {/* 5. Application Modals */}
      <PostJobModal
        isOpen={isPostJobModalOpen}
        onClose={() => setIsPostJobModalOpen(false)}
        onSubmitJob={handlePostJob}
        user={user}
        language={language}
        currency={currency}
      />

      <KycModal
        isOpen={isKycModalOpen}
        onClose={() => setIsKycModalOpen(false)}
        user={user}
        language={language}
        onSubmitKyc={handleKycSubmit}
        onAdminApproveKyc={handleAdminApproveKyc}
        onAdminRejectKyc={handleAdminRejectKyc}
      />

      <StatementModal
        isOpen={isStatementModalOpen}
        onClose={() => setIsStatementModalOpen(false)}
        transactions={transactions}
        language={language}
        currency={currency}
      />

      <FeedbackModal
        isOpen={isFeedbackModalOpen}
        onClose={() => setIsFeedbackModalOpen(false)}
        language={language}
      />

      <DownloadApkModal
        isOpen={isApkModalOpen}
        onClose={() => setIsApkModalOpen(false)}
        language={language}
      />

      <AuthModal
        isOpen={authModalState.isOpen}
        mode={authModalState.mode}
        onClose={() => setAuthModalState({ isOpen: false, mode: 'login' })}
        language={language}
        onLogin={handleLogin}
        onSignup={handleSignup}
      />

      <NotificationsModal
        isOpen={isNotificationsModalOpen}
        onClose={() => setIsNotificationsModalOpen(false)}
        notifications={notifications}
        onMarkAllRead={() => setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))}
        language={language}
      />

      <ReferralModal
        isOpen={isReferralModalOpen}
        onClose={() => setIsReferralModalOpen(false)}
        user={user}
        language={language}
      />

      <DailyBonusModal
        isOpen={isDailyBonusModalOpen}
        onClose={() => setIsDailyBonusModalOpen(false)}
        onClaimBonus={handleClaimDailyBonus}
        language={language}
      />

      <PoliciesModal
        policyType={selectedPolicy}
        onClose={() => setSelectedPolicy(null)}
        language={language}
      />

    </div>
  );
}
