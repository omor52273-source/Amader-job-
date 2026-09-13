import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ShieldCheck, 
  CheckCircle2, 
  Copy, 
  Check, 
  Camera, 
  Edit3, 
  Mail, 
  Phone, 
  Globe, 
  Shield, 
  Smartphone, 
  Key, 
  Laptop, 
  LogOut, 
  ChevronRight, 
  ExternalLink, 
  Star, 
  CreditCard, 
  Wallet, 
  ArrowUpRight, 
  Bell, 
  ShieldAlert, 
  X,
  Share2,
  Clock,
  Zap,
  Info,
  Lock,
  Eye,
  EyeOff,
  Upload,
  UserCheck,
  UserX,
  Sparkles,
  AlertCircle,
  Briefcase,
  Users,
  FileText,
  User as UserIcon,
  HelpCircle,
  Headphones,
  Send,
  MessageSquare,
  DollarSign,
  Home,
  PlusCircle,
  ClipboardList,
  Search,
  Settings
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Language, Currency, KycVerificationData, isUserBlueBadgeVerified } from '../types';
import { FacebookVerifiedBadge } from './FacebookVerifiedBadge';

interface AccountViewProps {
  user: UserProfile;
  language: Language;
  currency: Currency;
  darkMode?: boolean;
  onBack: () => void;
  onLogout: () => void;
  onOpenKyc: () => void;
  onOpenWallet: (tab?: 'deposit' | 'withdraw') => void;
  onNavigate?: (view: string) => void;
  onOpenPostJob?: () => void;
  onToggleLanguage?: () => void;
  onUpdateProfile?: (name: string, avatar: string) => void;
  onSubmitKyc?: (kycData: KycVerificationData) => void;
  onAdminApproveKyc?: () => void;
  onAdminRejectKyc?: (reason?: string) => void;
  onChangePassword?: (oldPass: string, newPass: string) => { success: boolean; message?: string };
  onBuyBlueBadge?: (plan: 'monthly' | 'yearly', method: 'wallet' | 'bkash' | 'nagad' | 'rocket') => void;
}

type ModalType = 'personal_info' | 'verification' | 'payment_settings' | 'security' | 'help_support' | 'edit_profile' | 'blue_badge' | null;

export const AccountView: React.FC<AccountViewProps> = ({
  user,
  language,
  currency,
  onBack,
  onLogout,
  onOpenKyc,
  onOpenWallet,
  onNavigate,
  onOpenPostJob,
  onToggleLanguage,
  onUpdateProfile,
  onSubmitKyc,
  onAdminApproveKyc,
  onAdminRejectKyc,
  onChangePassword,
  onBuyBlueBadge
}) => {
  const isBn = language === 'bn';
  const hasBlueBadge = isUserBlueBadgeVerified(user);

  // Modals state for each menu option
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  // Prevent background scroll and page shifting when modal is open
  useEffect(() => {
    if (activeModal) {
      const originalOverflow = document.body.style.overflow;
      const originalPaddingRight = document.body.style.paddingRight;
      const scrollBarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      if (scrollBarWidth > 0) {
        document.body.style.paddingRight = `${scrollBarWidth}px`;
      }
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [activeModal]);

  // Profile Edit Modal state
  const [editName, setEditName] = useState(user.name);
  const [editAvatar, setEditAvatar] = useState(user.avatar);
  const [editPhone, setEditPhone] = useState(user.phone || '01733-492811');
  const [editBio, setEditBio] = useState('Digital Freelancer & Micro-Task Specialist');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Security Toggles state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState(user.twoFactorEnabled || false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  // Change Password Form State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPass, setShowCurrentPass] = useState(false);
  const [showNewPass, setShowNewPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [passLoading, setPassLoading] = useState(false);
  const [passError, setPassError] = useState('');
  const [passSuccess, setPassSuccess] = useState('');

  // Support Ticket state
  const [supportSubject, setSupportSubject] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [supportSubmitted, setSupportSubmitted] = useState(false);

  // Payout Gateways
  const [bkashNumber, setBkashNumber] = useState(user.phone || '01733-492811');
  const [nagadNumber, setNagadNumber] = useState(user.phone || '01733-492811');
  const [usdtAddress, setUsdtAddress] = useState('0x71C...39B2');
  const [paymentSaved, setPaymentSaved] = useState(false);

  // Copy UID & Ref state
  const [copiedUid, setCopiedUid] = useState(false);

  // Blue Badge Modal State
  const [selectedPlan, setSelectedPlan] = useState<'monthly' | 'yearly'>('monthly');
  const [blueBadgeTab, setBlueBadgeTab] = useState<'buy' | 'nid'>('buy');
  const [paymentMethod, setPaymentMethod] = useState<'wallet' | 'bkash' | 'nagad' | 'rocket'>('wallet');
  const [mfsNumber, setMfsNumber] = useState(user.phone || '01733-492811');
  const [isProcessingBadge, setIsProcessingBadge] = useState(false);
  const [badgeSuccessMessage, setBadgeSuccessMessage] = useState('');

  const uid = (user.uid && /^\d{8}$/.test(user.uid))
    ? user.uid
    : ((user.id && /^\d{8}$/.test(user.id)) ? user.id : '84920173');
  
  // Rate calculation
  const usdEarning = user.earningBalanceUSD || (user.earningBalanceBDT ? user.earningBalanceBDT / 100 : 4.85);
  const bdtEarning = user.earningBalanceBDT || (usdEarning * 100);
  
  const usdDeposit = user.depositBalanceUSD || (user.depositBalanceBDT ? user.depositBalanceBDT / 100 : 8.10);
  const bdtDeposit = user.depositBalanceBDT || (usdDeposit * 100);

  const completedJobsCount = user.completedTasksCount || 12;
  const userRating = 4.9;
  const totalReviewsCount = 36;

  const handlePurchaseBadge = (plan: 'monthly' | 'yearly', method: 'wallet' | 'bkash' | 'nagad' | 'rocket') => {
    setIsProcessingBadge(true);
    setTimeout(() => {
      setIsProcessingBadge(false);
      if (onBuyBlueBadge) {
        onBuyBlueBadge(plan, method);
      }
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {}
      setBadgeSuccessMessage(isBn ? 'অভিনন্দন! আপনার ব্লু ভেরিফাইড ব্যাজ সফলভাবে সক্রিয় হয়েছে।' : 'Congratulations! Your Blue Verified Badge is now active.');
      setTimeout(() => {
        setBadgeSuccessMessage('');
        setActiveModal(null);
      }, 2200);
    }, 800);
  };

  const handleCopyUid = () => {
    navigator.clipboard.writeText(uid);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleAvatarFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result) {
          const newAvatar = reader.result as string;
          setEditAvatar(newAvatar);
          if (onUpdateProfile) {
            onUpdateProfile(user.name, newAvatar);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdateProfile && editName.trim()) {
      onUpdateProfile(editName.trim(), editAvatar);
      setSaveSuccess(true);
      setTimeout(() => {
        setSaveSuccess(false);
        setActiveModal(null);
      }, 1000);
    }
  };

  const handleChangePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');
    setPassSuccess('');

    if (!currentPassword) {
      setPassError(isBn ? 'আপনার বর্তমান পাসওয়ার্ড দিন' : 'Please enter your current password');
      return;
    }

    if (newPassword.length < 6) {
      setPassError(isBn ? 'নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'New password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPassError(isBn ? 'নতুন পাসওয়ার্ড দুটি মিলছে না' : 'New passwords do not match');
      return;
    }

    setPassLoading(true);
    setTimeout(() => {
      setPassLoading(false);
      if (onChangePassword) {
        const res = onChangePassword(currentPassword, newPassword);
        if (!res.success) {
          setPassError(res.message || (isBn ? 'বর্তমান পাসওয়ার্ডটি সঠিক নয়!' : 'Current password is incorrect!'));
          return;
        }
      }

      setPassSuccess(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!' : 'Password updated successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      try {
        confetti({ particleCount: 60, spread: 60, origin: { y: 0.6 } });
      } catch (err) {}
    }, 600);
  };

  const isNidPending = user.kycStatus === 'pending';
  const isNidVerified = user.isVerified || user.kycStatus === 'verified';
  const isNidRejected = user.kycStatus === 'rejected';

  const AVATAR_PRESETS = [
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
  ];

  return (
    <div className="max-w-xl mx-auto space-y-4 pb-4 font-sans">
      
      {/* 1. TOP USER PROFILE CARD */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100/80 relative">
        <div className="flex items-start justify-between gap-3">
          
          {/* Left: Avatar + Details */}
          <div className="flex items-center gap-4">
            {/* Avatar with Camera Overlay */}
            <div className="relative shrink-0">
              <div className="w-20 h-20 rounded-full p-1 border-2 border-emerald-500/30 overflow-hidden bg-slate-50">
                <img 
                  src={user.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                  alt={user.name} 
                  className="w-full h-full rounded-full object-cover"
                />
              </div>

              {/* Green Camera Button */}
              <label 
                htmlFor="avatar-file-input"
                className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center ring-2 ring-white shadow-xs cursor-pointer hover:bg-emerald-700 transition"
                title={isBn ? 'ছবি আপলোড করুন' : 'Upload photo'}
              >
                <Camera className="w-3.5 h-3.5" />
                <input 
                  id="avatar-file-input"
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleAvatarFileUpload}
                />
              </label>
            </div>

            {/* User Meta Info */}
            <div className="space-y-1.5 min-w-0">
              {/* 1st Line: User Name + Blue Badge (if NID submitted or subscribed) */}
              <div className="flex items-center gap-1.5 min-w-0">
                <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight truncate" title={user.name}>
                  {user.name}
                </h2>
                {hasBlueBadge && (
                  <FacebookVerifiedBadge size="md" title={isBn ? "ব্লু ব্যাজ ভেরিফাইড প্রোফাইল" : "Blue Verified Profile"} />
                )}
              </div>

              {/* 2nd Line: UID (choto kore) + Copy Button */}
              <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold flex-wrap">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">UID:</span>
                <span className="font-mono font-bold text-slate-700 tracking-wider text-xs">{uid}</span>
                {/* Copy UID Button */}
                <button 
                  id="account-copy-uid-btn"
                  onClick={handleCopyUid}
                  className="p-1 rounded-md bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition cursor-pointer active:scale-90 shrink-0"
                  title={isBn ? "ইউআইডি কপি করুন" : "Copy UID"}
                >
                  {copiedUid ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                </button>
                {copiedUid && (
                  <span className="text-[9.5px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.2 rounded shrink-0 animate-in fade-in">
                    {isBn ? 'কপি হয়েছে!' : 'Copied!'}
                  </span>
                )}
              </div>

              {/* 3rd Line: Badges */}
              <div className="flex items-center gap-1.5 pt-0.5 flex-wrap">
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10.5px] font-bold ${
                  user.role === 'employer' 
                    ? 'bg-blue-50 text-blue-700 border border-blue-200/60' 
                    : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                }`}>
                  {user.role === 'employer' ? (isBn ? 'ক্লায়েন্ট' : 'Client') : (isBn ? 'ফ্রিল্যান্সার' : 'Freelancer')}
                </span>
                {hasBlueBadge ? (
                  <div className="inline-flex items-center gap-1 text-[10.5px] font-bold text-blue-700 bg-blue-50 border border-blue-200/60 px-2 py-0.5 rounded-md">
                    <FacebookVerifiedBadge size="sm" />
                    <span>{isBn ? 'ব্লু ভেরিফাইড' : 'Blue Verified'}</span>
                  </div>
                ) : (
                  <button
                    onClick={() => setActiveModal('blue_badge')}
                    className="inline-flex items-center gap-1 text-[10.5px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200/60 px-2 py-0.5 rounded-md transition cursor-pointer"
                  >
                    <FacebookVerifiedBadge size="sm" />
                    <span>{isBn ? 'ব্লু ব্যাজ পান (৫০ ৳)' : 'Get Blue Badge (৳50)'}</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Right: Edit Profile Icon Button */}
          <button
            onClick={() => setActiveModal('edit_profile')}
            className="w-8 h-8 rounded-xl bg-emerald-50/90 hover:bg-emerald-100 text-emerald-700 flex items-center justify-center border border-emerald-200/60 shadow-2xs transition cursor-pointer active:scale-95 shrink-0"
            title={isBn ? 'প্রোফাইল এডিট করুন' : 'Edit Profile'}
          >
            <Edit3 className="w-4 h-4" />
          </button>

        </div>
      </div>

      {/* 2. THREE STATS CARDS ROW */}
      <div className="grid grid-cols-3 gap-2.5">
        {/* Jobs Completed */}
        <div className="bg-[#E6F4EA]/60 border border-emerald-100 rounded-2xl p-3 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-emerald-100/80 text-emerald-700 flex items-center justify-center mb-1.5">
            <Briefcase className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 leading-none">{completedJobsCount}</div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5 whitespace-nowrap">
              {isBn ? 'সম্পন্ন কাজ' : 'Jobs Completed'}
            </div>
          </div>
        </div>

        {/* Rating */}
        <div className="bg-[#FEF3C7]/50 border border-amber-100 rounded-2xl p-3 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-amber-100/80 text-amber-600 flex items-center justify-center mb-1.5">
            <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 leading-none">{userRating}</div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5 whitespace-nowrap">
              {isBn ? 'রেটিং' : 'Rating'}
            </div>
          </div>
        </div>

        {/* Total Reviews */}
        <div className="bg-[#EEF2FF]/60 border border-blue-100 rounded-2xl p-3 flex flex-col justify-between">
          <div className="w-8 h-8 rounded-xl bg-blue-100/80 text-blue-600 flex items-center justify-center mb-1.5">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="text-lg font-black text-slate-900 leading-none">{totalReviewsCount}</div>
            <div className="text-[10px] text-slate-500 font-bold mt-0.5 whitespace-nowrap">
              {isBn ? 'মোট রিভিউ' : 'Total Reviews'}
            </div>
          </div>
        </div>
      </div>

      {/* 3. AVAILABLE BALANCE CARD WITH WITHDRAW BUTTON */}
      <div className="bg-white rounded-3xl p-5 shadow-xs border border-slate-100 relative overflow-hidden">
        {/* Soft decorative background curve */}
        <div className="absolute right-0 bottom-0 w-48 h-32 bg-gradient-to-tl from-emerald-500/10 via-emerald-400/5 to-transparent rounded-tl-full pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 shrink-0">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <p className="text-xs text-slate-500 font-bold">
                {isBn ? 'উত্তোলনযোগ্য ব্যালেন্স' : 'Available Balance'}
              </p>
              <h3 className="text-2xl font-black text-slate-900 tracking-tight">
                ${usdEarning.toFixed(2)}
              </h3>
              <p className="text-[11px] text-slate-400 font-semibold">
                ≈ ৳{bdtEarning.toFixed(2)} BDT
              </p>
            </div>
          </div>

          <button
            onClick={() => onOpenWallet('withdraw')}
            className="px-6 py-2.5 rounded-xl bg-[#059669] hover:bg-[#047857] text-white font-black text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer active:scale-95 shrink-0"
          >
            {isBn ? 'উইথড্র' : 'Withdraw'}
          </button>
        </div>
      </div>

      {/* 4. SECONDARY BALANCES ROW (Deposited & Pending Clearance) */}
      <div className="grid grid-cols-2 gap-3">
        {/* Deposited Balance */}
        <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold leading-tight">
              {isBn ? 'ডিপোজিট ব্যালেন্স' : 'Deposited Balance'}
            </p>
            <div className="text-base font-black text-slate-900 mt-0.5">
              ${usdDeposit.toFixed(2)}
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">
              ≈ ৳{bdtDeposit.toFixed(2)} BDT
            </p>
          </div>
        </div>

        {/* Pending Clearance */}
        <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center border border-purple-100 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[11px] text-slate-500 font-bold leading-tight">
              {isBn ? 'পেন্ডিং ক্লিয়ারেন্স' : 'Pending Clearance'}
            </p>
            <div className="text-base font-black text-slate-900 mt-0.5">
              $0.00
            </div>
            <p className="text-[10px] text-slate-400 font-semibold">
              {isBn ? 'কোন পেন্ডিং নেই' : 'No pending amount'}
            </p>
          </div>
        </div>
      </div>

      {/* SEPARATE BLUE BADGE SECTION ("ar nid chara Blue badge dam rakho 50 tk monthly year 800 tk eta alada rakho") */}
      <div className="bg-gradient-to-br from-blue-600 via-[#1D9BF0] to-sky-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-500/20 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute -right-6 -bottom-6 w-36 h-36 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute right-4 top-3 opacity-15 pointer-events-none">
          <FacebookVerifiedBadge size="xl" className="w-24 h-24 text-white fill-white" />
        </div>

        <div className="relative z-10 space-y-3.5">
          <div className="flex items-start justify-between gap-3">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-black text-white uppercase tracking-wider">
                <FacebookVerifiedBadge size="sm" className="text-white fill-white" />
                <span>{isBn ? 'অফিসিয়াল ব্লু ব্যাজ' : 'Official Blue Badge'}</span>
              </div>
              <h3 className="text-lg font-black tracking-tight text-white">
                {hasBlueBadge 
                  ? (isBn ? 'আপনার ব্লু ভেরিফাইড ব্যাজ সক্রিয় রয়েছে!' : 'Your Blue Badge is Active!') 
                  : (isBn ? 'নামের পাশে ব্লু ভেরিফাইড ব্যাজ নিন' : 'Get Verified Blue Badge on Name')}
              </h3>
              <p className="text-xs text-blue-100/90 leading-relaxed font-medium">
                {hasBlueBadge 
                  ? (isBn ? 'আপনার প্রোফাইলে ব্লু টিক দৃশ্যমান। ক্লায়েন্ট ও অন্য মেম্বারদের কাছে আপনি এখন ১০০% বিশ্বস্ত।' : 'Verified blue badge is active on your profile. You are recognized as 100% authentic.') 
                  : (isBn ? 'জাতীয় পরিচয়পত্র (NID) সাবমিট করে ফ্রিতে নিন অথবা এনআইডি ছাড়া ৫০ টাকা/মাস বা ৮০০ টাকা/বছরে সরাসরি চালু করুন।' : 'Get free with NID card, or activate instantly without NID for ৳50/month or ৳800/year.')}
              </p>
            </div>
          </div>

          {/* If already has badge */}
          {hasBlueBadge ? (
            <div className="p-3 bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 flex items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-white text-blue-600 flex items-center justify-center shadow-xs">
                  <Check className="w-5 h-5 stroke-[3]" />
                </div>
                <div>
                  <p className="text-xs font-black text-white">
                    {user.blueBadgePlan === 'yearly' 
                      ? (isBn ? 'বাৎসরিক VIP সাবস্ক্রিপশন' : 'Yearly VIP Subscription') 
                      : user.blueBadgePlan === 'monthly' 
                        ? (isBn ? 'মাসিক সাবস্ক্রিপশন (৳৫০/মাস)' : 'Monthly Plan (৳50/mo)') 
                        : (isBn ? 'NID কার্ড দিয়ে ভেরিফাইড (ফ্রি)' : 'NID Verified (Free)')}
                  </p>
                  <p className="text-[10.5px] text-blue-100 font-medium">
                    {isBn ? 'প্রোফাইল স্ট্যাটাস: ব্লু টিক সক্রিয়' : 'Profile Status: Verified Check Active'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setActiveModal('blue_badge')}
                className="px-3.5 py-1.5 rounded-xl bg-white text-blue-700 hover:bg-blue-50 font-black text-xs transition cursor-pointer shadow-xs"
              >
                {isBn ? 'বিস্তারিত' : 'Details'}
              </button>
            </div>
          ) : (
            /* 2 Distinct Options Grid */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-0.5">
              {/* Option 1: Free with NID card */}
              <div className="p-3.5 bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl border border-white/20 flex flex-col justify-between transition">
                <div className="space-y-1 mb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-300 bg-emerald-950/40 px-2 py-0.5 rounded">
                      {isBn ? '১০০% ফ্রি' : '100% Free'}
                    </span>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  </div>
                  <h4 className="text-xs font-black text-white">
                    {isBn ? 'এনআইডি দিয়ে ফ্রি নিন' : 'Free with NID Card'}
                  </h4>
                  <p className="text-[10.5px] text-blue-100/80 leading-snug">
                    {isBn ? 'জাতীয় পরিচয়পত্র সাবমিট করে বিনামূল্যে ব্লু ব্যাজ পান।' : 'Submit your NID card to get verified without any payment.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onOpenKyc}
                  className="w-full py-2 px-3 rounded-xl bg-white text-blue-800 hover:bg-blue-50 font-black text-xs transition cursor-pointer text-center shadow-xs"
                >
                  {isBn ? 'এনআইডি সাবমিট করুন' : 'Submit NID Card'}
                </button>
              </div>

              {/* Option 2: Without NID (৳50 monthly / ৳800 yearly) */}
              <div className="p-3.5 bg-white/15 hover:bg-white/20 backdrop-blur-md rounded-2xl border border-white/30 flex flex-col justify-between transition relative overflow-hidden">
                <div className="space-y-1 mb-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-black uppercase tracking-wider text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded">
                      {isBn ? 'এনআইডি ছাড়া' : 'No NID Needed'}
                    </span>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                  </div>
                  <h4 className="text-xs font-black text-white">
                    {isBn ? 'সরাসরি কিনুন (৳৫০ বা ৳৮০০)' : 'Buy Blue Badge Direct'}
                  </h4>
                  <p className="text-[10.5px] text-blue-100/80 leading-snug">
                    {isBn ? 'মাসিক ৳৫০ অথবা বাৎসরিক ৳৮০০ টাকায় তাৎক্ষণিক ব্লু ব্যাজ।' : '৳50/month or ৳800/year for instant blue verified badge.'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveModal('blue_badge')}
                  className="w-full py-2 px-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs transition cursor-pointer text-center shadow-xs"
                >
                  {isBn ? 'প্ল্যান দেখুন ও কিনুন' : 'View Plans & Buy'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 5. MENU LIST OPTIONS */}
      <div className="bg-white rounded-3xl shadow-xs border border-slate-100 overflow-hidden divide-y divide-slate-100">
        
        {/* 1. Dashboard */}
        <button
          onClick={() => {
            if (onNavigate) {
              onNavigate(user.role === 'employer' ? 'client' : 'freelancer');
            } else {
              onBack();
            }
          }}
          className="w-full p-4.5 flex items-center justify-between bg-emerald-50/50 hover:bg-emerald-50 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100/80 text-emerald-600 flex items-center justify-center">
              <Home className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-emerald-800">
              {isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-emerald-600 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 2. Blue Badge Option */}
        <button
          onClick={() => setActiveModal('blue_badge')}
          className="w-full p-4.5 flex items-center justify-between bg-gradient-to-r from-blue-50/50 via-sky-50/30 to-transparent hover:bg-blue-50 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center shadow-xs">
              <FacebookVerifiedBadge size="sm" className="text-white fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-black text-slate-900">
                  {isBn ? 'ব্লু ভেরিফাইড ব্যাজ' : 'Blue Verified Badge'}
                </span>
                {hasBlueBadge ? (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white">
                    {isBn ? 'সক্রিয়' : 'Active'}
                  </span>
                ) : (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white">
                    {isBn ? '৫০ ৳/মাস' : '৳50/mo'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-500 font-medium">
                {hasBlueBadge 
                  ? (isBn ? 'আপনার প্রোফাইলে ব্লু ব্যাজ সক্রিয় রয়েছে' : 'Blue checkmark active on profile') 
                  : (isBn ? 'এনআইডি দিয়ে ফ্রি অথবা ৫০ টাকা/মাস বা ৮০০ টাকা/বছরে কিনুন' : 'Free with NID or buy at ৳50/mo, ৳800/yr')}
              </p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-blue-500 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 2. Find Jobs */}
        <button
          onClick={() => {
            if (onNavigate) {
              onNavigate('freelancer');
            } else {
              onBack();
            }
          }}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
              <Search className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-slate-900">
              {isBn ? 'চাকরি খুঁজুন' : 'Find Jobs'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 3. Browse Tasks */}
        <button
          onClick={() => {
            if (onNavigate) {
              onNavigate('freelancer');
            } else {
              onBack();
            }
          }}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
              <FileText className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-slate-900">
              {isBn ? 'টাস্ক ব্রাউজ করুন' : 'Browse Tasks'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 4. Post a New Job */}
        <button
          onClick={() => {
            if (onOpenPostJob) {
              onOpenPostJob();
            } else if (onNavigate) {
              onNavigate('create_job');
            }
          }}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
              <PlusCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-slate-900">
              {isBn ? 'নতুন জব পোস্ট করুন' : 'Post a New Job'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 5. My Jobs */}
        <button
          onClick={() => {
            if (onNavigate) {
              onNavigate(user.role === 'employer' ? 'my_jobs' : 'my_submissions');
            }
          }}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
              <Briefcase className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-slate-900">
              {isBn ? 'আমার জবসমূহ' : 'My Jobs'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 6. My Orders */}
        <button
          onClick={() => {
            if (onNavigate) {
              onNavigate('my_submissions');
            }
          }}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
              <ClipboardList className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-slate-900">
              {isBn ? 'আমার অর্ডারসমূহ' : 'My Orders'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 7. Messages */}
        <button
          onClick={() => {
            if (onNavigate) {
              onNavigate('support');
            } else {
              setActiveModal('help_support');
            }
          }}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition relative">
              <MessageSquare className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                2
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-black text-slate-900">
                {isBn ? 'মেসেজেস' : 'Messages'}
              </span>
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500 text-white text-[10px] font-black">
                2
              </span>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 8. Wallet */}
        <button
          onClick={() => onOpenWallet('deposit')}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
              <Wallet className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-slate-900">
              {isBn ? 'ওয়ালেট' : 'Wallet'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 9. My Profile */}
        <button
          onClick={() => setActiveModal('personal_info')}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
              <UserIcon className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-slate-900">
              {isBn ? 'আমার প্রোফাইল' : 'My Profile'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 10. Settings */}
        <button
          onClick={() => setActiveModal('security')}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
              <Settings className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-slate-900">
              {isBn ? 'সেটিংস' : 'Settings'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

        {/* 11. Help & Support */}
        <button
          onClick={() => setActiveModal('help_support')}
          className="w-full p-4.5 flex items-center justify-between hover:bg-slate-50/80 transition cursor-pointer text-left group"
        >
          <div className="flex items-center gap-3.5">
            <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-emerald-50 group-hover:text-emerald-600 transition">
              <HelpCircle className="w-5 h-5" />
            </div>
            <span className="text-sm font-black text-slate-900">
              {isBn ? 'হেল্প ও সাপোর্ট' : 'Help & Support'}
            </span>
          </div>
          <ChevronRight className="w-5 h-5 text-slate-400 group-hover:translate-x-0.5 transition" />
        </button>

      </div>

      {/* Language Selector Row */}
      <div className="bg-white rounded-3xl p-4 shadow-xs border border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <span className="text-sm font-black text-slate-900">
            {isBn ? 'ভাষা (Language)' : 'Language'}
          </span>
        </div>
        <select
          value={isBn ? 'bn' : 'en'}
          onChange={(e) => onToggleLanguage && onToggleLanguage()}
          className="px-4 py-2 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs font-black text-slate-800 cursor-pointer transition focus:outline-none focus:ring-2 focus:ring-emerald-500"
        >
          <option value="en">English</option>
          <option value="bn">বাংলা (Bengali)</option>
        </select>
      </div>

      {/* Logout Action Button */}
      <div className="pt-1">
        <button
          onClick={() => setShowLogoutConfirm(true)}
          className="w-full py-3.5 px-4 rounded-2xl bg-rose-50/90 hover:bg-rose-100 text-rose-600 font-black text-sm border border-rose-200/80 shadow-2xs transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] group"
        >
          <div className="w-6 h-6 rounded-lg bg-rose-100 group-hover:bg-rose-200 text-rose-600 flex items-center justify-center transition">
            <LogOut className="w-4 h-4" />
          </div>
          <span>{isBn ? 'লগ আউট' : 'Log Out'}</span>
        </button>
      </div>

      {/* Footer Version info */}
      <div className="flex items-center justify-between px-2 pt-2 pb-4 text-[11px] text-slate-400 font-bold">
        <span>Amader Job v1.0.0</span>
        <span>© 2026 All Rights Reserved</span>
      </div>

      {/* ======================================================== */}
      {/* MODAL 1: Personal Information */}
      {/* ======================================================== */}
      {activeModal === 'personal_info' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <UserIcon className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-slate-900">
                  {isBn ? 'ব্যক্তিগত তথ্য' : 'Personal Information'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'ইউআইডি (UID)' : 'Account UID'}</span>
                <div className="flex items-center justify-between">
                  <p className="font-mono font-black text-slate-900 text-sm tracking-wider">{uid}</p>
                  <button 
                    type="button"
                    onClick={handleCopyUid}
                    className="flex items-center gap-1 text-[11px] font-bold text-emerald-600 hover:text-emerald-700 bg-emerald-50 px-2 py-1 rounded-md cursor-pointer active:scale-95"
                  >
                    {copiedUid ? <Check className="w-3 h-3 text-emerald-600 stroke-[3]" /> : <Copy className="w-3 h-3" />}
                    <span>{copiedUid ? (isBn ? 'কপি হয়েছে' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
                  </button>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'পূর্ণ নাম' : 'Full Name'}</span>
                <p className="font-black text-slate-900 text-sm">{user.name}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'ইমেইল এড্রেস' : 'Email Address'}</span>
                <p className="font-bold text-slate-900">{user.email}</p>
              </div>

              <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'ফোন নম্বর' : 'Phone Number'}</span>
                <p className="font-bold text-slate-900 font-mono">{user.phone || '01733-492811'}</p>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'দেশ' : 'Country'}</span>
                  <p className="font-bold text-slate-900">Bangladesh 🇧🇩</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-2xl space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'টাইমজোন' : 'Timezone'}</span>
                  <p className="font-bold text-slate-900">Asia/Dhaka</p>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setActiveModal('edit_profile');
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-md"
              >
                {isBn ? 'তথ্য পরিবর্তন করুন' : 'Edit Information'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: Payment Settings */}
      {/* ======================================================== */}
      {activeModal === 'payment_settings' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <CreditCard className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-slate-900">
                  {isBn ? 'পেমেন্ট ও উইথড্র সেটিংস' : 'Payment & Payout Settings'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {paymentSaved && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>{isBn ? 'পেমেন্ট তথ্য সফলভাবে সংরক্ষিত হয়েছে!' : 'Payment settings saved successfully!'}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* bKash */}
              <div className="space-y-1">
                <label className="font-black text-slate-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-pink-600 text-white flex items-center justify-center text-[9px] font-black">bK</span>
                  <span>bKash Personal (বিকাশ নম্বর)</span>
                </label>
                <input 
                  type="text"
                  value={bkashNumber}
                  onChange={(e) => setBkashNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              {/* Nagad */}
              <div className="space-y-1">
                <label className="font-black text-slate-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-amber-600 text-white flex items-center justify-center text-[9px] font-black">Ng</span>
                  <span>Nagad Personal (নগদ নম্বর)</span>
                </label>
                <input 
                  type="text"
                  value={nagadNumber}
                  onChange={(e) => setNagadNumber(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>

              {/* USDT (BEP20 / TRC20) */}
              <div className="space-y-1">
                <label className="font-black text-slate-700 flex items-center gap-1.5">
                  <span className="w-4 h-4 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[9px] font-black">₮</span>
                  <span>Binance USDT (TRC20 / BEP20)</span>
                </label>
                <input 
                  type="text"
                  value={usdtAddress}
                  onChange={(e) => setUsdtAddress(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold text-xs bg-slate-50 focus:bg-white focus:border-emerald-500 outline-hidden"
                />
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => {
                  setPaymentSaved(true);
                  setTimeout(() => {
                    setPaymentSaved(false);
                    setActiveModal(null);
                  }, 1000);
                }}
                className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-md"
              >
                {isBn ? 'সংরক্ষণ করুন' : 'Save Gateways'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: Security & Password */}
      {/* ======================================================== */}
      {activeModal === 'security' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                  <Lock className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-slate-900">
                  {isBn ? 'পাসওয়ার্ড ও সিকিউরিটি' : 'Security & Password'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Change Password Form */}
            <form onSubmit={handleChangePasswordSubmit} className="space-y-3 text-xs">
              <h4 className="font-black text-slate-900 text-xs pb-1 border-b border-slate-100">
                {isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Change Password'}
              </h4>

              {passError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-bold text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 font-bold text-xs flex items-center gap-2">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isBn ? 'বর্তমান পাসওয়ার্ড' : 'Current Password'}</label>
                <div className="relative">
                  <input
                    type={showCurrentPass ? 'text' : 'password'}
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:border-purple-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPass(!showCurrentPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showCurrentPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isBn ? 'নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)' : 'New Password (min 6 chars)'}</label>
                <div className="relative">
                  <input
                    type={showNewPass ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:border-purple-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPass(!showNewPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNewPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="font-bold text-slate-700">{isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}</label>
                <div className="relative">
                  <input
                    type={showConfirmPass ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-slate-200 bg-slate-50 text-xs font-semibold focus:bg-white focus:border-purple-500 outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPass(!showConfirmPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={passLoading}
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
              >
                {passLoading ? (isBn ? 'সংরক্ষণ করা হচ্ছে...' : 'Updating...') : (isBn ? 'পাসওয়ার্ড আপডেট করুন' : 'Update Password')}
              </button>
            </form>

            {/* 2FA Toggle */}
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs pt-3">
              <div>
                <p className="font-black text-slate-900">{isBn ? '২-স্টেপ ভেরিফিকেশন (2FA)' : 'Two-Factor Authentication'}</p>
                <p className="text-[10px] text-slate-500">{isBn ? 'উইথড্র করার সময় ওটিপি কোড লাগবে' : 'OTP verification on cashout'}</p>
              </div>
              <button
                type="button"
                onClick={() => setTwoFactorEnabled(!twoFactorEnabled)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out ${
                  twoFactorEnabled ? 'bg-emerald-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition duration-200 ease-in-out ${
                    twoFactorEnabled ? 'translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 4: Help & Support */}
      {/* ======================================================== */}
      {activeModal === 'help_support' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                  <Headphones className="w-4 h-4" />
                </div>
                <h3 className="font-black text-base text-slate-900">
                  {isBn ? '২৪/৭ হেল্প ও সাপোর্ট' : '24/7 Help & Support'}
                </h3>
              </div>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {supportSubmitted && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isBn ? 'আপনার মেসেজ সাপোর্ট টিমের কাছে পাঠানো হয়েছে! আমরা শীঘ্রই যোগাযোগ করব।' : 'Support ticket submitted successfully!'}</span>
              </div>
            )}

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <a
                  href="https://telegram.org"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl bg-blue-50 border border-blue-100 hover:bg-blue-100 transition text-center space-y-1 block"
                >
                  <Send className="w-5 h-5 text-blue-600 mx-auto" />
                  <p className="font-black text-blue-900">Telegram</p>
                  <p className="text-[10px] text-blue-600">@MicrojobSupport</p>
                </a>

                <a
                  href="https://wa.me/8801733492811"
                  target="_blank"
                  rel="noreferrer"
                  className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100 hover:bg-emerald-100 transition text-center space-y-1 block"
                >
                  <MessageSquare className="w-5 h-5 text-emerald-600 mx-auto" />
                  <p className="font-black text-emerald-900">WhatsApp</p>
                  <p className="text-[10px] text-emerald-600">Live Support</p>
                </a>
              </div>

              {/* Submit Ticket Form */}
              <div className="space-y-2 pt-2 border-t border-slate-100">
                <h4 className="font-black text-slate-900">{isBn ? 'সরাসরি মেসেজ পাঠান' : 'Send us a message'}</h4>
                <input 
                  type="text"
                  placeholder={isBn ? 'বিষয় / Subject' : 'Subject'}
                  value={supportSubject}
                  onChange={(e) => setSupportSubject(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-hidden focus:bg-white focus:border-emerald-500"
                />
                <textarea 
                  rows={3}
                  placeholder={isBn ? 'আপনার সমস্যার বিস্তারিত লিখুন...' : 'Describe your issue in detail...'}
                  value={supportMessage}
                  onChange={(e) => setSupportMessage(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs bg-slate-50 outline-hidden focus:bg-white focus:border-emerald-500 resize-none"
                />
                <button
                  onClick={() => {
                    if (supportMessage.trim()) {
                      setSupportSubmitted(true);
                      setSupportSubject('');
                      setSupportMessage('');
                      setTimeout(() => setSupportSubmitted(false), 3000);
                    }
                  }}
                  className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-md"
                >
                  {isBn ? 'মেসেজ পাঠান' : 'Submit Ticket'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 5: Edit Profile */}
      {/* ======================================================== */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-black text-base text-slate-900">
                {isBn ? 'প্রোফাইল সম্পাদনা' : 'Edit Profile'}
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {saveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{isBn ? 'প্রোফাইল সফলভাবে আপডেট হয়েছে!' : 'Profile updated successfully!'}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-slate-700">{isBn ? 'আপনার পূর্ণ নাম:' : 'Full Name:'}</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold outline-hidden text-xs bg-slate-50 focus:bg-white focus:border-emerald-500"
                />
              </div>

              {/* Avatar Selector & Custom Upload */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-slate-700">{isBn ? 'প্রোফাইল ছবি পরিবর্তন:' : 'Profile Picture:'}</label>
                  <label
                    htmlFor="modal-avatar-upload"
                    className="text-[11px] font-black text-emerald-600 hover:text-emerald-700 cursor-pointer flex items-center gap-1 hover:underline"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>{isBn ? 'গ্যালারি থেকে ছবি আপলোড' : 'Upload from Device'}</span>
                  </label>
                  <input
                    id="modal-avatar-upload"
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = () => {
                          if (reader.result) {
                            setEditAvatar(reader.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                </div>

                {/* Current Selected Avatar Preview & Upload Trigger */}
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200/80 rounded-2xl">
                  <div className="relative">
                    <img 
                      src={editAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'} 
                      alt="Selected Avatar" 
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-emerald-500 shadow-xs"
                    />
                    <label
                      htmlFor="modal-avatar-upload"
                      className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center cursor-pointer shadow-xs hover:bg-emerald-700 transition"
                      title={isBn ? 'ছবি পরিবর্তন করুন' : 'Change Photo'}
                    >
                      <Camera className="w-3 h-3" />
                    </label>
                  </div>

                  <div className="space-y-1 flex-1">
                    <p className="text-xs font-black text-slate-900">{isBn ? 'কাস্টম ছবি ব্যবহার করুন' : 'Selected Avatar Preview'}</p>
                    <label
                      htmlFor="modal-avatar-upload"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100/70 hover:bg-emerald-100 text-emerald-800 text-[11px] font-bold cursor-pointer transition border border-emerald-200"
                    >
                      <Upload className="w-3 h-3" />
                      <span>{isBn ? 'ফাইল সিলেক্ট করুন' : 'Select New Photo'}</span>
                    </label>
                  </div>
                </div>

                {/* Preset Avatars */}
                <div className="space-y-1 pt-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{isBn ? 'অথবা ডিফল্ট অবতার বাছুন' : 'Or choose preset avatar:'}</span>
                  <div className="flex items-center gap-2">
                    {AVATAR_PRESETS.map((av, idx) => (
                      <button
                        type="button"
                        key={idx}
                        onClick={() => setEditAvatar(av)}
                        className={`w-10 h-10 rounded-xl overflow-hidden ring-2 transition cursor-pointer ${
                          editAvatar === av ? 'ring-emerald-600 scale-105 shadow-sm' : 'ring-transparent hover:ring-slate-300'
                        }`}
                      >
                        <img src={av} alt="Avatar" className="w-full h-full object-cover" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-2 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="w-1/2 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-50 cursor-pointer"
                >
                  {isBn ? 'বাতিল' : 'Cancel'}
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black cursor-pointer shadow-md"
                >
                  {isBn ? 'সংরক্ষণ করুন' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Blue Badge Subscription & Verification Modal */}
      {activeModal === 'blue_badge' && (
        <div 
          className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in overflow-y-auto"
          onClick={(e) => { if (e.target === e.currentTarget) { setActiveModal(null); setBadgeSuccessMessage(''); } }}
        >
          <div 
            className="w-full max-w-lg rounded-3xl bg-white border border-slate-100 shadow-2xl overflow-hidden my-6 animate-in zoom-in-95"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="p-5 bg-gradient-to-r from-blue-600 via-[#1877F2] to-sky-600 text-white relative">
              <button
                type="button"
                onClick={() => { setActiveModal(null); setBadgeSuccessMessage(''); }}
                className="absolute top-4 right-4 p-2 rounded-full bg-white/15 hover:bg-white/25 text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-2xl bg-white text-blue-600 flex items-center justify-center shadow-md shrink-0">
                  <FacebookVerifiedBadge size="lg" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-black tracking-tight text-white">
                      {isBn ? 'ব্লু ভেরিফাইড ব্যাজ' : 'Blue Verified Badge'}
                    </h3>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-white/20 uppercase tracking-wider text-white">
                      Official
                    </span>
                  </div>
                  <p className="text-xs text-blue-100 font-medium">
                    {isBn ? 'এনআইডি দিয়ে ফ্রি অথবা এনআইডি ছাড়া মাসিক/বার্ষিক সাবস্ক্রিপশন' : 'Free with NID or instant subscription without NID'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">

              {/* Live Preview Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
                <div className="text-[10.5px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                  {isBn ? 'আপনার প্রোফাইলে যেভাবে দেখাবে:' : 'How it appears on your profile:'}
                </div>
                <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-slate-100 shadow-2xs">
                  <img
                    src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                    alt="Preview"
                    className="w-11 h-11 rounded-full object-cover border-2 border-white shadow-2xs shrink-0"
                  />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 min-w-0">
                      <span className="font-extrabold text-slate-900 text-sm truncate">
                        {user.name}
                      </span>
                      <FacebookVerifiedBadge size="sm" />
                    </div>
                    <div className="flex items-center gap-1.5 text-slate-500 text-[11px] font-mono">
                      <span className="text-[10px] font-bold text-slate-400">UID:</span>
                      <span className="font-bold text-slate-700">{uid}</span>
                      <span className="text-[9.5px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.2 rounded">
                        {isBn ? 'ব্লু ভেরিফাইড' : 'Verified'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Active Badge Status Banner if already verified */}
              {hasBlueBadge && (
                <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 space-y-1.5 animate-in fade-in">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 font-black text-xs text-blue-800">
                      <FacebookVerifiedBadge size="sm" />
                      <span>{isBn ? 'আপনার ব্লু ভেরিফাইড ব্যাজ বর্তমানে সক্রিয় রয়েছে!' : 'Your Blue Verified Badge is Currently Active!'}</span>
                    </div>
                    <span className="px-2 py-0.5 rounded-full bg-blue-600 text-white text-[10px] font-bold">
                      {isBn ? 'সক্রিয়' : 'Active'}
                    </span>
                  </div>
                  <p className="text-[11px] text-blue-700/90 leading-relaxed font-medium">
                    {user.blueBadgePlan === 'yearly'
                      ? (isBn ? 'প্যাকেজ: বাৎসরিক ভিআইপি (১ বছর)। আপনি প্ল্যাটফর্মের প্রিমিয়াম সুবিধা উপভোগ করছেন।' : 'Plan: 1-Year VIP. You enjoy premium verified perks and priority ranking.')
                      : user.blueBadgePlan === 'monthly'
                      ? (isBn ? 'প্যাকেজ: মাসিক (৩০ দিন)। মেয়াদ শেষ হওয়ার আগে পুনরায় রিনিউ করতে পারেন।' : 'Plan: Monthly (30 Days). You can extend or renew at any time.')
                      : (isBn ? 'ভেরিফিকেশন মাধ্যম: জাতীয় পরিচয়পত্র (NID) অনুমোদিত।' : 'Verification Method: Government ID / NID Approved.')}
                  </p>
                </div>
              )}

              {badgeSuccessMessage && (
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-in zoom-in-95">
                  <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                  <span>{badgeSuccessMessage}</span>
                </div>
              )}

              {/* 2 Tabs: 1. No NID (Paid) vs 2. Free with NID */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl gap-1">
                <button
                  type="button"
                  onClick={() => setBlueBadgeTab('buy')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    blueBadgeTab === 'buy'
                      ? 'bg-white text-blue-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>{isBn ? 'এনআইডি ছাড়া কিনুন' : 'Buy Without NID'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setBlueBadgeTab('nid')}
                  className={`py-2 px-3 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center gap-1.5 ${
                    blueBadgeTab === 'nid'
                      ? 'bg-white text-emerald-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBn ? 'এনআইডি দিয়ে ফ্রি (৳০)' : 'Free with NID (৳0)'}</span>
                </button>
              </div>

              {/* TAB 1: BUY WITHOUT NID */}
              {blueBadgeTab === 'buy' && (
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block mb-2">
                      {isBn ? 'সাবস্ক্রিপশন প্ল্যান নির্বাচন করুন' : 'Select Subscription Plan'}
                    </label>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Monthly: 50 BDT */}
                      <div
                        onClick={() => setSelectedPlan('monthly')}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between relative ${
                          selectedPlan === 'monthly'
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">
                              {isBn ? 'মাসিক প্যাকেজ' : 'Monthly Plan'}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedPlan === 'monthly' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                            }`}>
                              {selectedPlan === 'monthly' && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                          <div className="flex items-baseline gap-1 pt-1">
                            <span className="text-2xl font-black text-blue-700 font-mono">৳৫০</span>
                            <span className="text-xs text-slate-500 font-medium">/ {isBn ? 'মাস' : 'month'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug pt-1">
                            {isBn ? '১ মাসের জন্য নামের পাশে ব্লু টিক সক্রিয় থাকবে।' : 'Active verified checkmark for 30 days.'}
                          </p>
                        </div>
                      </div>

                      {/* Yearly: 800 BDT */}
                      <div
                        onClick={() => setSelectedPlan('yearly')}
                        className={`p-4 rounded-2xl border-2 transition cursor-pointer flex flex-col justify-between relative ${
                          selectedPlan === 'yearly'
                            ? 'border-blue-600 bg-blue-50/50 shadow-xs'
                            : 'border-slate-200 hover:border-slate-300 bg-white'
                        }`}
                      >
                        <span className="absolute -top-2.5 right-3 px-2 py-0.5 rounded-full bg-amber-500 text-white text-[9.5px] font-black uppercase tracking-wider shadow-xs">
                          {isBn ? 'সেরা অফার' : 'Best Value'}
                        </span>
                        <div className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-black text-slate-900">
                              {isBn ? 'বাৎসরিক প্যাকেজ' : 'Yearly Plan'}
                            </span>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                              selectedPlan === 'yearly' ? 'border-blue-600 bg-blue-600 text-white' : 'border-slate-300'
                            }`}>
                              {selectedPlan === 'yearly' && <Check className="w-3 h-3 stroke-[3]" />}
                            </div>
                          </div>
                          <div className="flex items-baseline gap-1 pt-1">
                            <span className="text-2xl font-black text-blue-700 font-mono">৳৮০০</span>
                            <span className="text-xs text-slate-500 font-medium">/ {isBn ? 'বছর' : 'year'}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 leading-snug pt-1">
                            {isBn ? '৩৬৫ দিন ব্লু টিক + VIP প্রোফাইল ব্যাজ।' : 'Full 365 days verified status + VIP status.'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Payment Method */}
                  <div className="space-y-2">
                    <label className="text-xs font-black text-slate-800 uppercase tracking-wider block">
                      {isBn ? 'পেমেন্ট মাধ্যম বেছে নিন' : 'Select Payment Method'}
                    </label>

                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {/* Wallet Balance */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('wallet')}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          paymentMethod === 'wallet'
                            ? 'border-blue-600 bg-blue-50 text-blue-700 font-black'
                            : 'border-slate-200 bg-white text-slate-700 font-semibold hover:border-slate-300'
                        }`}
                      >
                        <Wallet className="w-4 h-4 text-emerald-600" />
                        <span className="text-[11px]">{isBn ? 'ওয়ালেট' : 'Wallet'}</span>
                        <span className="text-[9.5px] text-slate-400 font-mono">৳{(bdtEarning + bdtDeposit).toFixed(0)}</span>
                      </button>

                      {/* bKash */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('bkash')}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          paymentMethod === 'bkash'
                            ? 'border-[#E2136E] bg-pink-50 text-[#E2136E] font-black'
                            : 'border-slate-200 bg-white text-slate-700 font-semibold hover:border-slate-300'
                        }`}
                      >
                        <div className="w-4 h-4 rounded bg-[#E2136E] text-white text-[9px] font-black flex items-center justify-center">৳</div>
                        <span className="text-[11px]">bKash</span>
                        <span className="text-[9.5px] text-slate-400">{isBn ? 'বিকাশ' : 'Instant'}</span>
                      </button>

                      {/* Nagad */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('nagad')}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          paymentMethod === 'nagad'
                            ? 'border-[#F7941D] bg-orange-50 text-[#F7941D] font-black'
                            : 'border-slate-200 bg-white text-slate-700 font-semibold hover:border-slate-300'
                        }`}
                      >
                        <div className="w-4 h-4 rounded bg-[#F7941D] text-white text-[9px] font-black flex items-center justify-center">৳</div>
                        <span className="text-[11px]">Nagad</span>
                        <span className="text-[9.5px] text-slate-400">{isBn ? 'নগদ' : 'Instant'}</span>
                      </button>

                      {/* Rocket */}
                      <button
                        type="button"
                        onClick={() => setPaymentMethod('rocket')}
                        className={`p-2.5 rounded-xl border text-center transition cursor-pointer flex flex-col items-center justify-center gap-1 ${
                          paymentMethod === 'rocket'
                            ? 'border-[#8C3494] bg-purple-50 text-[#8C3494] font-black'
                            : 'border-slate-200 bg-white text-slate-700 font-semibold hover:border-slate-300'
                        }`}
                      >
                        <div className="w-4 h-4 rounded bg-[#8C3494] text-white text-[9px] font-black flex items-center justify-center">৳</div>
                        <span className="text-[11px]">Rocket</span>
                        <span className="text-[9.5px] text-slate-400">{isBn ? 'রকেট' : 'Instant'}</span>
                      </button>
                    </div>

                    {/* MFS Phone Number Input if bKash/Nagad/Rocket */}
                    {paymentMethod !== 'wallet' && (
                      <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2.5 mt-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-700">
                            {paymentMethod === 'bkash' ? 'bKash Account' : paymentMethod === 'nagad' ? 'Nagad Account' : 'Rocket Account'}
                          </span>
                          <span className="text-slate-400 font-medium">{isBn ? 'পার্সোনাল নম্বর' : 'Personal No.'}</span>
                        </div>
                        <input
                          type="text"
                          value={mfsNumber}
                          onChange={(e) => setMfsNumber(e.target.value)}
                          placeholder="017XXXXXXXX"
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs font-mono font-bold text-slate-800 focus:outline-hidden focus:border-blue-500"
                        />
                        <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500">
                          <Info className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                          <span>
                            {isBn ? 'পেমেন্ট সম্পন্ন হওয়ার সাথে সাথেই স্বয়ংক্রিয়ভাবে নামের পাশে ব্লু ব্যাজ যুক্ত হয়ে যাবে।' : 'Badge will be automatically activated on confirmation.'}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Summary & Pay Action Button */}
                  <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-3 text-xs font-bold text-slate-700">
                      <span>{isBn ? 'মোট প্রদেয় বিল:' : 'Total Payable:'}</span>
                      <span className="text-lg font-black text-blue-700 font-mono">
                        {selectedPlan === 'yearly' ? '৳৮০০ BDT' : '৳৫০ BDT'}
                      </span>
                    </div>

                    <button
                      type="button"
                      disabled={isProcessingBadge}
                      onClick={() => handlePurchaseBadge(selectedPlan, paymentMethod)}
                      className="w-full py-3 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-black text-sm transition cursor-pointer shadow-md shadow-blue-600/25 flex items-center justify-center gap-2 active:scale-98 disabled:opacity-50"
                    >
                      {isProcessingBadge ? (
                        <span>{isBn ? 'প্রসেসিং হচ্ছে...' : 'Processing...'}</span>
                      ) : (
                        <>
                          <FacebookVerifiedBadge size="sm" className="text-white fill-white" />
                          <span>
                            {selectedPlan === 'yearly' 
                              ? (isBn ? '৳৮০০ দিয়ে ১ বছরের জন্য সক্রিয় করুন' : 'Pay ৳800 & Activate 1 Year') 
                              : (isBn ? '৳৫০ দিয়ে ১ মাসের জন্য সক্রিয় করুন' : 'Pay ৳50 & Activate 1 Month')}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* TAB 2: FREE WITH NID CARD */}
              {blueBadgeTab === 'nid' && (
                <div className="p-4 bg-emerald-50/70 border border-emerald-200/80 rounded-2xl space-y-3.5">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-emerald-950">
                        {isBn ? 'এনআইডি কার্ড দিয়ে ভেরিফিকেশন (১০০% ফ্রি)' : 'Verify with NID Card (100% Free)'}
                      </h4>
                      <p className="text-[11px] text-emerald-800 font-medium">
                        {isBn ? 'কোনো ফি ছাড়াই আপনার জাতীয় পরিচয়পত্র দিয়ে ব্লু ব্যাজ পান।' : 'Submit your NID card to get verified without paying any fee.'}
                      </p>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-xs text-emerald-900 bg-white/80 p-3 rounded-xl border border-emerald-100 font-medium">
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                      <span>{isBn ? 'জাতীয় পরিচয়পত্র (NID) নম্বর ও ছবি' : 'NID Card Front & Back photo'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                      <span>{isBn ? 'আজীবন মেয়াদের ব্লু ভেরিফাইড ব্যাজ' : 'Lifetime verified blue checkmark'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-emerald-600 stroke-[3] shrink-0" />
                      <span>{isBn ? 'সম্পূর্ণ বিনামূল্যে (৳০ খরচ)' : 'Completely Free (৳0 cost)'}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveModal(null);
                      onOpenKyc();
                    }}
                    className="w-full py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition cursor-pointer shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2"
                  >
                    <Upload className="w-4 h-4" />
                    <span>{isBn ? 'এনআইডি কার্ড সাবমিট ফর্ম খুলুন' : 'Open NID Submission Form'}</span>
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-sm rounded-3xl bg-white border border-slate-100 p-6 shadow-2xl text-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
              <LogOut className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-black text-base text-slate-900">
                {isBn ? 'লগআউট নিশ্চিতকরণ' : 'Confirm Logout'}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {isBn ? 'আপনি কি নিশ্চিত যে আপনি আপনার অ্যাকাউন্ট থেকে লগআউট করতে চান?' : 'Are you sure you want to sign out from your account?'}
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 pt-2 text-xs font-bold">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="py-2.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                {isBn ? 'না, থাক' : 'Cancel'}
              </button>
              <button
                onClick={() => {
                  setShowLogoutConfirm(false);
                  onLogout();
                }}
                className="py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white cursor-pointer shadow-md font-black"
              >
                {isBn ? 'হ্যাঁ, লগআউট' : 'Yes, Logout'}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
