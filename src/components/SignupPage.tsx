import React, { useState, useEffect, useRef } from 'react';
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Lock, 
  User, 
  Phone, 
  CheckCircle2, 
  ArrowLeft, 
  RefreshCw, 
  KeyRound, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Gift,
  Share2,
  Headphones
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import { EmailOtpService } from '../lib/smsService';

interface SignupPageProps {
  language: Language;
  onSignup: (name: string, email: string, phone: string, role: UserRole) => void;
  onNavigateToLogin: () => void;
  onBack: () => void;
  onOpenSupport?: () => void;
}

type SignupStep = 'details' | 'otp' | 'success';

export const SignupPage: React.FC<SignupPageProps> = ({
  language,
  onSignup,
  onNavigateToLogin,
  onBack,
  onOpenSupport
}) => {
  const isBn = language === 'bn';

  // Wizard Step
  const [step, setStep] = useState<SignupStep>('details');

  // Form Fields
  const [role, setRole] = useState<UserRole>('worker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [referralCode, setReferralCode] = useState(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const urlRef = params.get('ref');
      if (urlRef) return urlRef.trim();
      const savedRef = localStorage.getItem('amader_job_pending_ref');
      if (savedRef) return savedRef.trim();
    } catch (e) {}
    return '';
  });
  const [agreeTerms, setAgreeTerms] = useState(true);

  // OTP Verification States (Email SMTP)
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [maskedEmail, setMaskedEmail] = useState('');
  const [cooldown, setCooldown] = useState<number>(0);
  const [expirySeconds, setExpirySeconds] = useState<number>(300);
  const [isLocked, setIsLocked] = useState(false);

  // Feedback & Status
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devOtpNotice, setDevOtpNotice] = useState('');

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer (60s)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Expiry timer (300s / 5 min)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (expirySeconds > 0 && step === 'otp') {
      timer = setInterval(() => {
        setExpirySeconds(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [expirySeconds, step]);

  const cleanPhone = (val: string) => val.replace(/\D/g, '');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Step 1: Request Email OTP via SMTP
  const handleProceedToOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setDevOtpNotice('');

    if (!name.trim()) {
      setErrorMessage(isBn ? 'আপনার পূর্ণ নাম লিখুন' : 'Please enter your full name');
      return;
    }

    const cleanEmailVal = email.trim().toLowerCase();
    if (!cleanEmailVal || !cleanEmailVal.includes('@')) {
      setErrorMessage(isBn ? 'একটি সঠিক ইমেইল ঠিকানা দিন' : 'Please enter a valid email address');
      return;
    }

    if (password.length < 6) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড দুটি মিলছে না' : 'Passwords do not match');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage(isBn ? 'শর্তাবলী ও গোপনীয়তা নীতি মেনে টিক দিন' : 'You must accept Terms of Service to proceed');
      return;
    }

    setLoading(true);
    const res = await EmailOtpService.sendOtp(cleanEmailVal, 'register');
    setLoading(false);

    if (res.isLocked) {
      setIsLocked(true);
      setErrorMessage(res.error || (isBn ? 'অতিরিক্ত ভুলের কারণে আপনার ইনপুট ১৫ মিনিটের জন্য সাময়িক লক রয়েছে।' : 'Input locked for 15 minutes due to too many failed attempts.'));
      return;
    }

    if (res.success) {
      setMaskedEmail(res.maskedEmail || cleanEmailVal);
      setCooldown(res.cooldown || 60);
      setExpirySeconds(res.expiresInSeconds || 300);
      setSuccessMessage(isBn ? 'আপনার ইমেইলে ৬ ডিজিটের ওটিপি ভেরিফিকেশন কোড পাঠানো হয়েছে।' : 'A 6-digit OTP code has been sent to your email.');
      if (res.devOtp) {
        setDevOtpNotice(`[টেস্ট মোড ওটিপি]: ${res.devOtp}`);
      }
      setStep('otp');
    } else {
      setErrorMessage(res.error || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to send OTP Email.'));
    }
  };

  // Step 2: Verify Email OTP and Finish Signup
  const handleVerifyAndComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMessage(isBn ? 'সম্পূর্ণ ৬ ডিজিটের ওটিপি কোড লিখুন' : 'Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    const cleanEmailVal = email.trim().toLowerCase();
    const res = await EmailOtpService.verifyOtp(cleanEmailVal, enteredOtp, 'register');
    setLoading(false);

    if (res.isLocked) {
      setIsLocked(true);
      setErrorMessage(res.error || (isBn ? '৩ বার ভুল ওটিপি দেওয়ায় ইনপুট ১৫ মিনিটের জন্য লক করা হয়েছে।' : 'Input locked for 15 minutes due to 3 failed attempts.'));
      return;
    }

    if (res.success) {
      setStep('success');
      setSuccessMessage(isBn ? 'অভিনন্দন! আপনার অ্যাকাউন্ট সফলভাবে ভেরিফাই ও তৈরি হয়েছে এবং ২.০০ টাকা সাইনআপ বোনাস যুক্ত হয়েছে!' : 'Congratulations! Account verified and created with ৳2.00 signup bonus!');

      // Complete registration in application
      setTimeout(() => {
        onSignup(name.trim(), cleanEmailVal, phone.trim(), role);
      }, 1500);
    } else {
      setErrorMessage(res.error || (isBn ? 'ভুল ওটিপি কোড। পুনরায় চেষ্টা করুন।' : 'Invalid OTP code'));
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newOtp = [...otp];
    newOtp[index] = val.slice(-1);
    setOtp(newOtp);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-[85vh] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      
      {/* Top Back Navigation */}
      <div className="w-full max-w-lg flex items-center justify-between mb-4">
        <button
          id="signup-page-back-btn"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold transition shadow-2xs cursor-pointer active:scale-95"
        >
          <ArrowLeft className="w-4 h-4 text-slate-500" />
          <span>{isBn ? 'হোম পেজে ফিরে যান' : 'Back to Home'}</span>
        </button>

        {onOpenSupport && (
          <button
            onClick={onOpenSupport}
            className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-700 hover:text-emerald-800 transition cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5" />
            <span>{isBn ? 'হেল্প ডেস্ক' : 'Support'}</span>
          </button>
        )}
      </div>

      {/* Main Signup Card */}
      <div className="w-full max-w-lg bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        
        {/* Top Decorative Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* Brand Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex justify-center mb-2">
            <BrandLogo size="md" isBn={isBn} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {isBn ? 'নতুন অ্যাকাউন্ট তৈরি করুন' : 'Create Your Free Account'}
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {isBn ? 'রেজিস্ট্রেশন সম্পূর্ণ করলেই পেয়ে যাবেন ২.০০ টাকা ইনস্ট্যান্ট বোনাস' : 'Get instant ৳2.00 bonus upon completing your profile'}
          </p>

          {/* 2-Step Progress Indicator */}
          <div className="flex items-center justify-center gap-3 mt-4">
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
              step === 'details' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : 'bg-emerald-100 text-emerald-800'
            }`}>
              <span>১</span>
              <span>{isBn ? 'তথ্য দিন' : 'Details'}</span>
            </div>
            <div className="w-6 h-0.5 bg-slate-200" />
            <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition ${
              step === 'otp' 
                ? 'bg-emerald-600 text-white shadow-xs' 
                : step === 'success'
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-slate-100 text-slate-500'
            }`}>
              <span>২</span>
              <span>{isBn ? 'SMS ওটিপি' : 'SMS OTP'}</span>
            </div>
          </div>
        </div>

        {/* Global Feedback Messages */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
            <div className="flex-1">
              <span>{errorMessage}</span>
              {isLocked && onOpenSupport && (
                <div className="mt-1.5">
                  <button
                    type="button"
                    onClick={onOpenSupport}
                    className="font-bold text-rose-800 underline hover:text-rose-900 cursor-pointer"
                  >
                    {isBn ? 'সাপোর্টে যোগাযোগ করুন (হেল্প ডেস্ক)' : 'Contact Support Desk'}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {successMessage && (
          <div className="mb-4 p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {devOtpNotice && (
          <div className="mb-4 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-mono flex items-center justify-between">
            <span>{devOtpNotice}</span>
            <span className="text-[10px] bg-amber-200 px-1.5 py-0.5 rounded font-sans font-bold">টেস্ট মোড</span>
          </div>
        )}

        {/* STEP 1: REGISTRATION DETAILS */}
        {step === 'details' && (
          <form onSubmit={handleProceedToOtp} className="space-y-4">
            
            {/* Account Type Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'অ্যাকাউন্টের ধরন নির্বাচন করুন' : 'Select Account Purpose'}
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
                <button
                  type="button"
                  onClick={() => setRole('worker')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'worker'
                      ? 'bg-white text-emerald-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                  <span>{isBn ? 'ফ্রিল্যান্সার (কাজ করব)' : 'Freelancer'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setRole('employer')}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    role === 'employer'
                      ? 'bg-white text-teal-800 shadow-xs border border-slate-200'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <UserPlus className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isBn ? 'ক্লায়েন্ট (কাজ দেব)' : 'Employer'}</span>
                </button>
              </div>
            </div>

            {/* Full Name */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder={isBn ? 'যেমন: মোঃ রাফি তালুকদার' : 'e.g. John Doe'}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Email Address (Receives OTP via SMTP) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'ইমেইল ঠিকানা (এখানে ভেরিফিকেশন ওটিপি যাবে)' : 'Email Address (Verification OTP sent here)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-emerald-700 font-semibold mt-1 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isBn ? 'ইমেইল SMTP এর মাধ্যমে ওটিপি যাবে (মোবাইল ওটিপি বন্ধ করা হয়েছে)' : 'Verified via Email SMTP (SMS OTP disabled)'}</span>
              </p>
            </div>

            {/* Mobile Number (Optional profile / payout field) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'মোবাইল নম্বর (বিকাশ / নগদ উত্তোলনের জন্য)' : 'Mobile Number (for bKash / Nagad cashout)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-4 h-4" />
                </div>
                <input
                  type="tel"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isBn ? 'পেমেন্ট গ্রহণের জন্য আপনার মোবাইল ওয়ালেট নম্বর দিন।' : 'Enter your mobile wallet number for receiving payout withdrawals.'}
              </p>
            </div>

            {/* Password & Confirm Password */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isBn ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-3.5 pr-9 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  {isBn ? 'পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm Password'}
                </label>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900"
                />
              </div>
            </div>

            {/* Referral Code (Optional) */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'রেফারেল কোড (ঐচ্ছিক)' : 'Referral Code (Optional)'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Share2 className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={referralCode}
                  onChange={e => setReferralCode(e.target.value.toUpperCase())}
                  placeholder={isBn ? 'যেমন: REF80863' : 'e.g. REF80863'}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900 uppercase placeholder:normal-case placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Terms Agreement */}
            <div className="pt-1">
              <label className="flex items-start gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  required
                  checked={agreeTerms}
                  onChange={e => setAgreeTerms(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 mt-0.5"
                />
                <span>
                  {isBn ? 'আমি আমদের জব অনলাইন-এর সকল ' : 'I agree to the '}
                  <span className="text-emerald-700 font-bold underline">{isBn ? 'শর্তাবলী ও নীতিমালা' : 'Terms & Privacy Policy'}</span>
                  {isBn ? ' মেনে নিচ্ছি।' : '.'}
                </span>
              </label>
            </div>

            {/* Signup Bonus Highlight */}
            <div className="p-3 bg-emerald-50/80 border border-emerald-200/80 rounded-2xl flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
                <Gift className="w-4 h-4" />
              </div>
              <div className="text-xs text-emerald-900">
                <p className="font-extrabold">{isBn ? '৳২.০০ সাইনআপ বোনাস' : '৳2.00 Welcome Bonus'}</p>
                <p className="text-[11px] text-emerald-700">{isBn ? 'একাউন্ট খোলার সাথে সাথে আর্নিং ব্যালেন্সে যোগ হবে।' : 'Credited instantly upon SMS verification.'}</p>
              </div>
            </div>

            {/* Continue to OTP Button */}
            <button
              id="signup-step1-btn"
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'ইমেইলে ওটিপি পাঠানো হচ্ছে...' : 'Sending Email OTP...'}</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>{isBn ? 'পরবর্তী ধাপ (ইমেইলে ওটিপি পাঠান)' : 'Send Verification OTP to Email'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* STEP 2: EMAIL OTP VERIFICATION */}
        {step === 'otp' && (
          <form onSubmit={handleVerifyAndComplete} className="space-y-4">
            
            <div className="text-center p-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-xs mb-2">
                <Mail className="w-5 h-5" />
              </div>
              <p className="text-xs text-slate-600">
                {isBn ? 'ভেরিফিকেশন কোড পাঠানো হয়েছে এই ইমেইলে:' : 'Verification OTP sent to email:'}
              </p>
              <p className="text-base font-black text-slate-900 font-mono mt-0.5">
                {maskedEmail}
              </p>
              <p className="text-[11px] text-slate-500 mt-1">
                {isBn ? 'ইনবক্স অথবা স্প্যাম (Spam) ফোল্ডার চেক করুন' : 'Check your inbox or spam folder'}
              </p>
              <button
                type="button"
                onClick={() => {
                  setErrorMessage('');
                  setStep('details');
                }}
                className="text-[11px] font-bold text-emerald-700 hover:underline mt-2 inline-block cursor-pointer"
              >
                {isBn ? 'ইমেইল পরিবর্তন করতে ক্লিক করুন' : 'Change Email Address'}
              </button>
            </div>

            {/* OTP Input Boxes */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-slate-700">
                  {isBn ? 'ইমেইল থেকে পাওয়া ৬ ডিজিটের কোডটি লিখুন' : 'Enter 6-Digit Code from Email'}
                </label>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {isBn ? 'মেয়াদ:' : 'Expires:'} <strong className="text-emerald-700 font-mono">{formatTime(expirySeconds)}</strong>
                </span>
              </div>

              <div className="flex justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={el => (otpInputRefs.current[idx] = el)}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    disabled={isLocked}
                    onChange={e => handleOtpChange(idx, e.target.value)}
                    onKeyDown={e => handleOtpKeyDown(idx, e)}
                    className="w-10 sm:w-11 h-12 text-center text-lg font-black rounded-xl border-2 border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-slate-900 transition"
                  />
                ))}
              </div>
            </div>

            {/* Verify Button */}
            <button
              id="signup-verify-btn"
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 text-white font-black text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'ইমেইল যাচাই করা হচ্ছে...' : 'Verifying Email...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBn ? 'ইমেইল যাচাই করুন ও একাউন্ট খুলুন' : 'Verify Email & Complete Signup'}</span>
                </>
              )}
            </button>

            {/* Resend Action */}
            <div className="text-center pt-1">
              {cooldown > 0 ? (
                <p className="text-xs text-slate-500 font-medium">
                  {isBn ? 'পুনরায় ইমেইলে ওটিপি পাঠাতে অপেক্ষা করুন:' : 'Resend Email OTP in:'} <span className="font-bold text-emerald-700 font-mono">{cooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleProceedToOtp}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  {isBn ? 'আবার ইমেইলে ওটিপি পাঠান' : 'Resend Email OTP'}
                </button>
              )}
            </div>
          </form>
        )}

        {/* STEP 3: SUCCESS CELEBRATION */}
        {step === 'success' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mx-auto flex items-center justify-center animate-bounce">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <div>
              <h3 className="text-lg font-black text-slate-900">
                {isBn ? 'অভিনন্দন! একাউন্ট সফলভাবে তৈরি হয়েছে!' : 'Account Created Successfully!'}
              </h3>
              <p className="text-xs text-emerald-700 font-bold mt-1">
                {isBn ? '৳২.০০ সাইনআপ বোনাস আপনার ওয়ালেটে জমা করা হয়েছে।' : '৳2.00 signup bonus has been credited.'}
              </p>
            </div>
            <div className="p-3 bg-emerald-50 rounded-2xl text-xs text-slate-600 flex items-center justify-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-600" />
              <span>{isBn ? 'ড্যাশবোর্ডে প্রবেশ করানো হচ্ছে...' : 'Redirecting to your dashboard...'}</span>
            </div>
          </div>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
              {isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already Registered?'}
            </span>
          </div>
        </div>

        {/* Bottom Action: Navigate to Dedicated Login Page */}
        <div className="text-center">
          <button
            id="signup-page-to-login-btn"
            type="button"
            onClick={onNavigateToLogin}
            className="w-full py-2.5 px-4 rounded-2xl border-2 border-slate-300 hover:border-slate-400 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-2xs"
          >
            <LogIn className="w-4 h-4 text-slate-600" />
            <span>{isBn ? 'লগইন পেজে যান (লগইন করুন)' : 'Go to Login Page'}</span>
          </button>
        </div>

      </div>

      {/* Security & Support Note */}
      <div className="w-full max-w-lg mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? 'নিরাপদ অ্যাকাউন্ট ভেরিফিকেশন' : 'Verified Secure Registration'}</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Gift className="w-4 h-4 text-teal-600" />
          <span>{isBn ? '২ টাকা ফ্রি বোনাস' : '৳2 Free Bonus'}</span>
        </span>
      </div>

    </div>
  );
};
