import React, { useState, useEffect, useRef } from 'react';
import { 
  LogIn, 
  UserPlus, 
  ShieldCheck, 
  Mail, 
  Lock, 
  Phone, 
  CheckCircle2, 
  ArrowLeft, 
  RefreshCw, 
  KeyRound, 
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  Headphones
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import { EmailOtpService } from '../lib/smsService';

interface LoginPageProps {
  language: Language;
  onLogin: (emailOrPhone: string, role: UserRole) => void;
  onNavigateToSignup: () => void;
  onBack: () => void;
  onOpenSupport?: () => void;
}

type LoginSubView = 'credentials' | 'forgot_phone' | 'forgot_otp' | 'forgot_new_password';

export const LoginPage: React.FC<LoginPageProps> = ({
  language,
  onLogin,
  onNavigateToSignup,
  onBack,
  onOpenSupport
}) => {
  const isBn = language === 'bn';

  // Sub-view for login or forgot password flow
  const [subView, setSubView] = useState<LoginSubView>('credentials');

  // Form Fields
  const [role, setRole] = useState<UserRole>('worker');
  const [emailOrPhone, setEmailOrPhone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Forgot Password States
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotOtp, setForgotOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [verificationToken, setVerificationToken] = useState('');
  const [maskedEmail, setMaskedEmail] = useState('');
  const [cooldown, setCooldown] = useState<number>(0);
  const [expirySeconds, setExpirySeconds] = useState<number>(300);

  // Status & Feedback
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devOtpNotice, setDevOtpNotice] = useState('');
  const [isLocked, setIsLocked] = useState(false);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Expiry countdown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (expirySeconds > 0 && subView === 'forgot_otp') {
      timer = setInterval(() => {
        setExpirySeconds(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [expirySeconds, subView]);

  const cleanPhone = (val: string) => val.replace(/\D/g, '');

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Handle Standard Login Submit
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!emailOrPhone.trim()) {
      setErrorMessage(isBn ? 'ইমেইল অথবা মোবাইল নম্বর লিখুন' : 'Please enter your email or phone number');
      return;
    }

    if (!password) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড প্রদান করুন' : 'Please enter your password');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      onLogin(emailOrPhone.trim(), role);
    }, 600);
  };

  // Request OTP for Password Reset
  const handleSendForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setDevOtpNotice('');

    const raw = forgotEmail.trim().toLowerCase();
    if (!raw || (!raw.includes('@') && raw.length < 10)) {
      setErrorMessage(isBn ? 'সঠিক ইমেইল ঠিকানা অথবা মোবাইল নম্বর দিন' : 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    const res = await EmailOtpService.sendOtp(raw, 'forgot_password');
    setLoading(false);

    if (res.isLocked) {
      setIsLocked(true);
      setErrorMessage(res.error || (isBn ? 'অতিরিক্ত ভুলের কারণে আপনার একাউন্ট ১৫ মিনিটের জন্য সাময়িক লক রয়েছে।' : 'Account locked for 15 minutes due to too many failed attempts.'));
      return;
    }

    if (res.success) {
      setMaskedEmail(res.maskedEmail || res.maskedPhone || raw);
      setCooldown(res.cooldown || 60);
      setExpirySeconds(res.expiresInSeconds || 300);
      setSuccessMessage(isBn ? 'আপনার ইমেইলে ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।' : '6-digit OTP has been sent to your email.');
      if (res.devOtp) {
        setDevOtpNotice(`[টেস্ট ওটিপি]: ${res.devOtp}`);
      }
      setSubView('forgot_otp');
    } else {
      setErrorMessage(res.error || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।' : 'Failed to send OTP'));
    }
  };

  // Verify OTP for Password Reset
  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const enteredOtp = forgotOtp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMessage(isBn ? 'সম্পূর্ণ ৬ ডিজিটের ওটিপি কোড লিখুন' : 'Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    const raw = forgotEmail.trim().toLowerCase();
    const res = await EmailOtpService.verifyOtp(raw, enteredOtp, 'forgot_password');
    setLoading(false);

    if (res.isLocked) {
      setIsLocked(true);
      setErrorMessage(res.error || (isBn ? '৩ বার ভুল ওটিপি দেওয়ায় ইনপুট ১৫ মিনিটের জন্য লক করা হয়েছে।' : 'Input locked for 15 minutes due to 3 failed attempts.'));
      return;
    }

    if (res.success && res.verificationToken) {
      setVerificationToken(res.verificationToken);
      setSuccessMessage(isBn ? 'ইমেইল যাচাই সম্পন্ন হয়েছে। নতুন পাসওয়ার্ড সেট করুন।' : 'Email verified. Set a new password.');
      setSubView('forgot_new_password');
    } else {
      setErrorMessage(res.error || (isBn ? 'ভুল ওটিপি কোড। পুনরায় চেষ্টা করুন।' : 'Invalid OTP code'));
    }
  };

  // Save New Password
  const handleSaveNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (newPassword.length < 6) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড দুটি মিলছে না' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    const raw = forgotEmail.trim().toLowerCase();
    const res = await EmailOtpService.resetPassword(raw, verificationToken, newPassword);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে! এখন লগইন করুন।' : 'Password reset successful! Please log in with your new password.');
      setTimeout(() => {
        setSubView('credentials');
        setPassword('');
        setEmailOrPhone(raw);
        setSuccessMessage(isBn ? 'পাসওয়ার্ড সফলভাবে রিসেট হয়েছে। লগইন করুন।' : 'Password reset successful. Please log in.');
      }, 1200);
    } else {
      setErrorMessage(res.error || (isBn ? 'পাসওয়ার্ড পরিবর্তন সম্পন্ন করা যায়নি।' : 'Failed to reset password.'));
    }
  };

  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;
    const newArr = [...forgotOtp];
    newArr[index] = val.slice(-1);
    setForgotOtp(newArr);

    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !forgotOtp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  return (
    <div className="min-h-[85vh] py-8 sm:py-12 px-3 sm:px-6 lg:px-8 flex flex-col justify-center items-center">
      
      {/* Top Back Navigation */}
      <div className="w-full max-w-md flex items-center justify-between mb-4">
        <button
          id="login-page-back-btn"
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

      {/* Main Login Card */}
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-3xl p-6 sm:p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        
        {/* Top Decorative Glow Line */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600" />

        {/* Brand Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex justify-center mb-2">
            <BrandLogo size="md" isBn={isBn} />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight mt-1">
            {subView === 'credentials' 
              ? (isBn ? 'আপনার অ্যাকাউন্টে লগইন করুন' : 'Welcome Back! Log In')
              : (isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Your Password')
            }
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            {subView === 'credentials'
              ? (isBn ? 'টাস্ক সম্পন্ন করে আয় করুন অথবা জব পোস্ট করুন' : 'Log in to complete micro-tasks or manage your campaigns')
              : (isBn ? 'নিরাপদ SMS OTP এর মাধ্যমে নতুন পাসওয়ার্ড সেট করুন' : 'Reset via verified 6-digit SMS OTP')
            }
          </p>
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

        {/* 1. CREDENTIALS VIEW */}
        {subView === 'credentials' && (
          <form onSubmit={handleLoginSubmit} className="space-y-4">
            
            {/* Role Tab Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'অ্যাকাউন্টের ধরন নির্বাচন করুন' : 'Account Type'}
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
                  <span>{isBn ? 'ফ্রিল্যান্সার (কর্মী)' : 'Freelancer'}</span>
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
                  <LogIn className="w-3.5 h-3.5 text-teal-600" />
                  <span>{isBn ? 'ক্লায়েন্ট (নিয়োগকারী)' : 'Employer'}</span>
                </button>
              </div>
            </div>

            {/* Email or Phone Input */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'ইমেইল অথবা মোবাইল নম্বর' : 'Email or Mobile Number'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={emailOrPhone}
                  onChange={e => setEmailOrPhone(e.target.value)}
                  placeholder={isBn ? '017xxxxxxxx অথবা example@mail.com' : '017xxxxxxxx or your email'}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900 placeholder:text-slate-400"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-slate-700">
                  {isBn ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setSuccessMessage('');
                    setSubView('forgot_phone');
                  }}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 cursor-pointer"
                >
                  {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-10 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-slate-600 font-medium">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                  className="rounded border-slate-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4"
                />
                <span>{isBn ? 'আমাকে মনে রাখুন' : 'Remember me'}</span>
              </label>

              <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" />
                {isBn ? 'SSL এনক্রিপ্টেড' : 'Secure SSL'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit-btn"
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-[0.99] text-white font-black text-sm shadow-md shadow-emerald-600/20 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'লগইন হচ্ছে...' : 'Logging In...'}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>{isBn ? 'লগইন করুন' : 'Sign In to Account'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* 2. FORGOT PASSWORD: ENTER EMAIL */}
        {subView === 'forgot_phone' && (
          <form onSubmit={handleSendForgotOtp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'রেজিস্টার্ড ইমেইল ঠিকানা' : 'Registered Email Address'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={e => setForgotEmail(e.target.value)}
                  placeholder="yourname@gmail.com"
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {isBn ? 'এই ইমেইলে SMTP সার্ভারের মাধ্যমে ৬ ডিজিটের ওটিপি কোড পাঠানো হবে।' : 'A 6-digit OTP code will be sent to your email address.'}
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'ইমেইল পাঠানো হচ্ছে...' : 'Sending Email...'}</span>
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4" />
                  <span>{isBn ? 'ইমেইলে ভেরিফিকেশন কোড পাঠান' : 'Send OTP to Email'}</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setErrorMessage('');
                setSubView('credentials');
              }}
              className="w-full py-2 text-center text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
            >
              {isBn ? 'লগইনে ফিরে যান' : 'Back to Login'}
            </button>
          </form>
        )}

        {/* 3. FORGOT PASSWORD: ENTER OTP */}
        {subView === 'forgot_otp' && (
          <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
            <div className="text-center p-3.5 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white mx-auto flex items-center justify-center shadow-xs mb-1.5">
                <Mail className="w-4 h-4" />
              </div>
              <p className="text-xs text-slate-600">
                {isBn ? 'ওটিপি কোড পাঠানো হয়েছে এই ইমেইলে:' : 'OTP Sent to email:'} <span className="font-bold text-slate-900 font-mono">{maskedEmail}</span>
              </p>
              <div className="flex items-center justify-center gap-2 mt-1 text-[11px] text-slate-500 font-semibold">
                <span>{isBn ? 'মেয়াদ:' : 'Expires:'} <strong className="text-emerald-700 font-mono">{formatTime(expirySeconds)}</strong></span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2 text-center">
                {isBn ? '৬ ডিজিটের কোডটি লিখুন' : 'Enter 6-Digit Code'}
              </label>
              <div className="flex justify-center gap-2 sm:gap-2.5">
                {forgotOtp.map((digit, idx) => (
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
                    className="w-10 h-12 text-center text-lg font-black rounded-xl border-2 border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20 focus:outline-none text-slate-900 transition"
                  />
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || isLocked}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Verifying...'}</span>
                </>
              ) : (
                <>
                  <KeyRound className="w-4 h-4" />
                  <span>{isBn ? 'ওটিপি যাচাই করুন' : 'Verify OTP'}</span>
                </>
              )}
            </button>

            {/* Resend Action */}
            <div className="text-center pt-1">
              {cooldown > 0 ? (
                <p className="text-xs text-slate-500 font-medium">
                  {isBn ? 'পুনরায় পাঠাতে অপেক্ষা করুন:' : 'Resend available in:'} <span className="font-bold text-emerald-700 font-mono">{cooldown}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  onClick={handleSendForgotOtp}
                  className="text-xs font-bold text-emerald-600 hover:text-emerald-700 underline cursor-pointer"
                >
                  {isBn ? 'আবার ওটিপি কোড পাঠান' : 'Resend OTP Code'}
                </button>
              )}
            </div>
          </form>
        )}

        {/* 4. FORGOT PASSWORD: NEW PASSWORD */}
        {subView === 'forgot_new_password' && (
          <form onSubmit={handleSaveNewPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
              </label>
              <div className="relative">
                <input
                  type={showNewPassword ? 'text' : 'password'}
                  required
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder={isBn ? 'কমপক্ষে ৬ অক্ষরের পাসওয়ার্ড' : 'Minimum 6 characters'}
                  className="w-full pl-3.5 pr-10 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                {isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
              </label>
              <input
                type="password"
                required
                value={confirmNewPassword}
                onChange={e => setConfirmNewPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 text-sm font-medium text-slate-900"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-xs transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>{isBn ? 'সংরক্ষণ হচ্ছে...' : 'Saving...'}</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন করুন' : 'Update Password'}</span>
                </>
              )}
            </button>
          </form>
        )}

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-white px-3 text-slate-400 font-bold tracking-wider">
              {isBn ? 'নতুন অ্যাকাউন্ট?' : 'Need an Account?'}
            </span>
          </div>
        </div>

        {/* Bottom Action: Navigate to Dedicated Signup Page */}
        <div className="text-center">
          <button
            id="login-page-to-signup-btn"
            type="button"
            onClick={onNavigateToSignup}
            className="w-full py-2.5 px-4 rounded-2xl border-2 border-emerald-600/30 hover:border-emerald-600 bg-emerald-50/60 hover:bg-emerald-100/70 text-emerald-800 font-bold text-xs sm:text-sm transition cursor-pointer flex items-center justify-center gap-2 active:scale-95 shadow-2xs"
          >
            <UserPlus className="w-4 h-4 text-emerald-600" />
            <span>{isBn ? 'নতুন অ্যাকাউন্ট তৈরি করুন (২ টাকা বোনাস)' : 'Create Free Account (৳2 Bonus)'}</span>
          </button>
        </div>

      </div>

      {/* Security & Support Note */}
      <div className="w-full max-w-md mt-6 text-center text-xs text-slate-500 flex items-center justify-center gap-4">
        <span className="flex items-center gap-1">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>{isBn ? 'নিরাপদ ডেটা সুরক্ষা' : 'Data Protected'}</span>
        </span>
        <span>•</span>
        <span className="flex items-center gap-1">
          <Mail className="w-4 h-4 text-teal-600" />
          <span>{isBn ? 'ইমেইল ওটিপি ভেরিফাইড' : 'Email OTP Verified'}</span>
        </span>
      </div>

    </div>
  );
};
