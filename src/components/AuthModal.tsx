import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
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
  Smartphone
} from 'lucide-react';
import { Language, UserRole } from '../types';
import { BrandLogo } from './BrandLogo';
import { SmsOtpService } from '../lib/smsService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  mode: 'login' | 'signup' | 'forgot_password';
  language: Language;
  darkMode?: boolean;
  onLogin: (emailOrPhone: string, role: UserRole) => void;
  onSignup: (name: string, email: string, phone: string, role: UserRole) => void;
}

type AuthViewMode = 'login' | 'signup_details' | 'signup_otp' | 'forgot_phone' | 'forgot_otp' | 'forgot_new_password';

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  mode: initialMode,
  language,
  darkMode = false,
  onLogin,
  onSignup
}) => {
  const isBn = language === 'bn';

  // Navigation State
  const [viewMode, setViewMode] = useState<AuthViewMode>(
    initialMode === 'signup' ? 'signup_details' : 'login'
  );

  // Form Fields
  const [role, setRole] = useState<UserRole>('worker');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP State
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [maskedPhone, setMaskedPhone] = useState('');
  const [verificationToken, setVerificationToken] = useState('');
  
  // Timer & Cooldown State
  const [cooldown, setCooldown] = useState<number>(0);
  const [expirySeconds, setExpirySeconds] = useState<number>(300); // 5 minutes
  
  // Loading & Error/Success Messages
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [devOtpNotice, setDevOtpNotice] = useState('');

  // Refs for auto-focusing OTP inputs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset states when opening
  useEffect(() => {
    if (isOpen) {
      if (initialMode === 'signup') {
        setViewMode('signup_details');
      } else if (initialMode === 'forgot_password') {
        setViewMode('forgot_phone');
      } else {
        setViewMode('login');
      }
      setErrorMessage('');
      setSuccessMessage('');
      setDevOtpNotice('');
      setOtp(['', '', '', '', '', '']);
    }
  }, [isOpen, initialMode]);

  // Cooldown Countdown Effect (60s)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (cooldown > 0) {
      timer = setInterval(() => {
        setCooldown(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [cooldown]);

  // Expiry Countdown Effect (300s / 5m)
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (expirySeconds > 0 && (viewMode === 'signup_otp' || viewMode === 'forgot_otp')) {
      timer = setInterval(() => {
        setExpirySeconds(prev => Math.max(0, prev - 1));
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [expirySeconds, viewMode]);

  if (!isOpen) return null;

  // Format seconds to mm:ss
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Helper to normalize phone
  const cleanPhone = (val: string) => {
    return val.replace(/\D/g, '');
  };

  // OTP Box Key Handling
  const handleOtpChange = (index: number, val: string) => {
    if (!/^\d*$/.test(val)) return;

    const newOtp = [...otp];
    newOtp[index] = val.slice(-1); // Only take last digit
    setOtp(newOtp);

    // Auto-focus next box
    if (val && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // 1. Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    if (!phone && !email) {
      setErrorMessage(isBn ? 'ইমেইল বা মোবাইল নম্বর দিন' : 'Please enter your email or phone number');
      return;
    }
    if (!password) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড দিন' : 'Please enter your password');
      return;
    }

    onLogin(phone || email, role);
    onClose();
  };

  // 2. Request OTP for Signup
  const handleRequestSignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setDevOtpNotice('');

    const numericPhone = cleanPhone(phone);
    if (!phone || numericPhone.length < 11) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে সঠিক ১১-সংখ্যার বাংলাদেশি মোবাইল নম্বর দিন (01XXXXXXXXX)' : 'Please enter a valid 11-digit Bangladeshi mobile number');
      return;
    }
    if (password.length < 6) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    const res = await SmsOtpService.sendOtp(phone, 'register');
    setLoading(false);

    if (res.success) {
      setMaskedPhone(res.maskedPhone || phone);
      setCooldown(res.cooldown || 60);
      setExpirySeconds(res.expiresInSeconds || 300);
      setOtp(['', '', '', '', '', '']);
      if (res.devOtp) {
        setDevOtpNotice(`[Test Mode OTP]: ${res.devOtp}`);
      }
      setViewMode('signup_otp');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } else {
      setErrorMessage(res.error || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে' : 'Failed to send OTP'));
    }
  };

  // 3. Verify OTP for Signup & Complete Registration
  const handleVerifySignupOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMessage(isBn ? 'সম্পূর্ণ ৬-সংখ্যার ওটিপি কোড লিখুন' : 'Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    const res = await SmsOtpService.verifyOtp(phone, enteredOtp, 'register');
    setLoading(false);

    if (res.success) {
      setSuccessMessage(isBn ? 'মোবাইল নম্বর ভেরিফিকেশন সফল হয়েছে!' : 'Mobile verified successfully!');
      setTimeout(() => {
        onSignup(name || 'New Member', email || `${phone}@amaderjob.online`, phone, role);
        onClose();
      }, 700);
    } else {
      setErrorMessage(res.error || (isBn ? 'ভুল ওটিপি কোড' : 'Incorrect OTP code'));
    }
  };

  // 4. Request OTP for Forgot Password
  const handleRequestForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setDevOtpNotice('');

    const numericPhone = cleanPhone(phone);
    if (!phone || numericPhone.length < 11) {
      setErrorMessage(isBn ? 'অনুগ্রহ করে রেজিস্টার্ড মোবাইল নম্বর দিন (01XXXXXXXXX)' : 'Please enter your registered mobile number');
      return;
    }

    setLoading(true);
    const res = await SmsOtpService.sendOtp(phone, 'forgot_password');
    setLoading(false);

    if (res.success) {
      setMaskedPhone(res.maskedPhone || phone);
      setCooldown(res.cooldown || 60);
      setExpirySeconds(res.expiresInSeconds || 300);
      setOtp(['', '', '', '', '', '']);
      if (res.devOtp) {
        setDevOtpNotice(`[Test Mode OTP]: ${res.devOtp}`);
      }
      setViewMode('forgot_otp');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } else {
      setErrorMessage(res.error || (isBn ? 'ওটিপি পাঠাতে সমস্যা হয়েছে' : 'Failed to send OTP'));
    }
  };

  // 5. Verify OTP for Forgot Password
  const handleVerifyForgotOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    const enteredOtp = otp.join('');
    if (enteredOtp.length !== 6) {
      setErrorMessage(isBn ? 'সম্পূর্ণ ৬-সংখ্যার ওটিপি কোড লিখুন' : 'Please enter the complete 6-digit OTP code');
      return;
    }

    setLoading(true);
    const res = await SmsOtpService.verifyOtp(phone, enteredOtp, 'forgot_password');
    setLoading(false);

    if (res.success && res.verificationToken) {
      setVerificationToken(res.verificationToken);
      setViewMode('forgot_new_password');
    } else {
      setErrorMessage(res.error || (isBn ? 'ভুল ওটিপি কোড' : 'Incorrect OTP code'));
    }
  };

  // 6. Submit New Password
  const handleResetPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');

    if (password.length < 6) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে' : 'Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage(isBn ? 'পাসওয়ার্ড দুটি মিলছে না' : 'Passwords do not match');
      return;
    }

    setLoading(true);
    const res = await SmsOtpService.resetPassword(phone, verificationToken, password);
    setLoading(false);

    if (res.success) {
      setSuccessMessage(isBn ? 'পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে! এখন লগইন করুন।' : 'Password reset successfully! You can now login.');
      setTimeout(() => {
        setViewMode('login');
        setPassword('');
        setConfirmPassword('');
        setSuccessMessage(isBn ? 'নতুন পাসওয়ার্ড দিয়ে লগইন করুন' : 'Please login with your new password');
      }, 1500);
    } else {
      setErrorMessage(res.error || (isBn ? 'পাসওয়ার্ড পরিবর্তন সম্পন্ন করা যায়নি' : 'Failed to reset password'));
    }
  };

  // Resend OTP Helper
  const handleResendOtp = async (purpose: 'register' | 'forgot_password') => {
    if (cooldown > 0 || loading) return;
    setErrorMessage('');
    setSuccessMessage('');
    setDevOtpNotice('');

    setLoading(true);
    const res = await SmsOtpService.sendOtp(phone, purpose);
    setLoading(false);

    if (res.success) {
      setCooldown(res.cooldown || 60);
      setExpirySeconds(res.expiresInSeconds || 300);
      setOtp(['', '', '', '', '', '']);
      if (res.devOtp) {
        setDevOtpNotice(`[New Test OTP]: ${res.devOtp}`);
      }
      setSuccessMessage(isBn ? 'নতুন ওটিপি আপনার মোবাইলে পাঠানো হয়েছে' : 'New OTP has been sent to your phone');
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } else {
      setErrorMessage(res.error || (isBn ? 'পুনরায় ওটিপি পাঠাতে ব্যর্থ' : 'Failed to resend OTP'));
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div 
        className={`w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden p-5 sm:p-6 transition-colors ${
          darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            {viewMode !== 'login' && viewMode !== 'signup_details' && (
              <button
                type="button"
                onClick={() => {
                  if (viewMode === 'signup_otp') setViewMode('signup_details');
                  else if (viewMode === 'forgot_phone') setViewMode('login');
                  else if (viewMode === 'forgot_otp') setViewMode('forgot_phone');
                  else if (viewMode === 'forgot_new_password') setViewMode('forgot_phone');
                  setErrorMessage('');
                }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer mr-1"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}
            <BrandLogo size="sm" isBn={isBn} />
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Notifications inside Modal */}
        {errorMessage && (
          <div className="mt-3.5 p-3 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
            <span className="flex-1 leading-relaxed">{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="mt-3.5 p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 text-emerald-800 dark:text-emerald-300 text-xs font-semibold flex items-start gap-2 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span className="flex-1 leading-relaxed">{successMessage}</span>
          </div>
        )}

        {devOtpNotice && (
          <div className="mt-2 p-2 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900 text-amber-900 dark:text-amber-200 text-[11px] font-mono font-bold flex items-center justify-between">
            <span>{devOtpNotice}</span>
            <span className="text-[10px] uppercase px-1.5 py-0.5 bg-amber-200 dark:bg-amber-900 rounded font-sans">SMS Test</span>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 1: LOGIN MODE */}
        {/* ============================================================== */}
        {viewMode === 'login' && (
          <div className="space-y-4 pt-3">
            <div className="text-center pb-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isBn ? 'অ্যাকাউন্টে লগইন করুন' : 'Welcome Back'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn ? 'আপনার মোবাইল নম্বর ও পাসওয়ার্ড দিয়ে প্রবেশ করুন' : 'Sign in with your mobile number or email'}
              </p>
            </div>

            <form onSubmit={handleLoginSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isBn ? 'মোবাইল নম্বর অথবা ইমেইল' : 'Mobile Number or Email'}
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={`w-full pl-9.5 pr-3 py-2.5 rounded-xl border font-semibold outline-hidden transition ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 focus:border-emerald-600'
                    }`}
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">
                    {isBn ? 'পাসওয়ার্ড' : 'Password'}
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setViewMode('forgot_phone');
                      setErrorMessage('');
                    }}
                    className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    {isBn ? 'পাসওয়ার্ড ভুলে গেছেন?' : 'Forgot Password?'}
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className={`w-full pl-9.5 pr-10 py-2.5 rounded-xl border font-semibold outline-hidden transition ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white focus:border-emerald-500' : 'bg-white border-slate-300 focus:border-emerald-600'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer text-xs flex items-center justify-center gap-2 mt-2"
              >
                <LogIn className="w-4 h-4" />
                <span>{isBn ? 'লগইন করুন' : 'Sign In'}</span>
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <p>
                {isBn ? 'নতুন ব্যবহারকারী?' : "Don't have an account?"}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('signup_details');
                    setErrorMessage('');
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-black hover:underline cursor-pointer"
                >
                  {isBn ? 'নতুন অ্যাকাউন্ট খুলুন (রেজিস্টার)' : 'Create Account'}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 2: SIGNUP DETAILS STEP 1 */}
        {/* ============================================================== */}
        {viewMode === 'signup_details' && (
          <div className="space-y-4 pt-3">
            <div className="text-center pb-1">
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isBn ? 'নতুন অ্যাকাউন্ট রেজিস্টার করুন' : 'Create an Account'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn ? 'মোবাইল নম্বরে SMS OTP ভেরিফিকেশন কোড পাঠানো হবে' : 'Secure OTP will be sent to your mobile number'}
              </p>
            </div>

            <form onSubmit={handleRequestSignupOtp} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isBn ? 'আপনার পূর্ণ নাম' : 'Full Name'}
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Rafi Ahmed"
                    className={`w-full pl-9.5 pr-3 py-2.5 rounded-xl border font-semibold outline-hidden transition ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isBn ? 'মোবাইল নম্বর (SMS OTP ভেরিফিকেশনের জন্য)' : 'Mobile Number (for SMS OTP)'}
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={`w-full pl-9.5 pr-3 py-2.5 rounded-xl border font-semibold outline-hidden transition ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-600" />
                  {isBn ? 'SMS.net.bd গেটওয়ের মাধ্যমে ইনস্ট্যান্ট ৬-সংখ্যার OTP কোড যাবে' : 'Instant 6-digit OTP code sent via SMS.net.bd gateway'}
                </p>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isBn ? 'ইমেইল এড্রেস (ঐচ্ছিক)' : 'Email Address (Optional)'}
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@example.com"
                    className={`w-full pl-9.5 pr-3 py-2.5 rounded-xl border font-semibold outline-hidden transition ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isBn ? 'পাসওয়ার্ড' : 'Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর..."
                    className={`w-full pl-9.5 pr-10 py-2.5 rounded-xl border font-semibold outline-hidden transition ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer text-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <UserPlus className="w-4 h-4" />
                )}
                <span>
                  {loading 
                    ? (isBn ? 'OTP কোড পাঠানো হচ্ছে...' : 'Sending SMS OTP...') 
                    : (isBn ? 'SMS OTP পাঠান ও এগিয়ে যান' : 'Send SMS OTP & Continue')}
                </span>
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <p>
                {isBn ? 'ইতিমধ্যে অ্যাকাউন্ট আছে?' : 'Already registered?'}{' '}
                <button
                  type="button"
                  onClick={() => {
                    setViewMode('login');
                    setErrorMessage('');
                  }}
                  className="text-emerald-600 dark:text-emerald-400 font-black hover:underline cursor-pointer"
                >
                  {isBn ? 'লগইন করুন' : 'Sign In'}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 3: OTP VERIFICATION (FOR SIGNUP) */}
        {/* ============================================================== */}
        {viewMode === 'signup_otp' && (
          <div className="space-y-4 pt-3">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isBn ? 'মোবাইল OTP যাচাই করুন' : 'Verify Mobile OTP'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isBn ? (
                  <>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{maskedPhone || phone}</span> নম্বরে ৬-সংখ্যার ওটিপি কোড পাঠানো হয়েছে।
                  </>
                ) : (
                  <>
                    A 6-digit code was sent to <span className="font-bold text-slate-800 dark:text-slate-200">{maskedPhone || phone}</span>
                  </>
                )}
              </p>
            </div>

            <form onSubmit={handleVerifySignupOtp} className="space-y-4">
              {/* 6 Digit Input Boxes */}
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-2xl border transition outline-hidden ${
                      digit
                        ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 shadow-xs'
                        : darkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                ))}
              </div>

              {/* Expiry & Resend Bar */}
              <div className="flex items-center justify-between text-xs px-1">
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>{isBn ? 'মেয়াদ বাকি:' : 'Expires in:'}</span>
                  <span className="font-bold font-mono text-emerald-600 dark:text-emerald-400">
                    {formatTime(expirySeconds)}
                  </span>
                </div>

                {cooldown > 0 ? (
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {isBn ? `পুনরায় পাঠান (${cooldown}s)` : `Resend in ${cooldown}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleResendOtp('register')}
                    disabled={loading}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isBn ? 'পুনরায় OTP পাঠান' : 'Resend OTP'}</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{isBn ? 'যাচাই ও অ্যাকাউন্ট তৈরি করুন' : 'Verify & Complete Registration'}</span>
              </button>
            </form>

            <div className="text-center pt-1">
              <button
                type="button"
                onClick={() => {
                  setViewMode('signup_details');
                  setErrorMessage('');
                }}
                className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 font-semibold cursor-pointer"
              >
                {isBn ? '← নম্বর ভুল হয়েছে? নম্বর পরিবর্তন করুন' : '← Wrong number? Change phone'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 4: FORGOT PASSWORD - STEP 1 (PHONE) */}
        {/* ============================================================== */}
        {viewMode === 'forgot_phone' && (
          <div className="space-y-4 pt-3">
            <div className="text-center pb-1">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <KeyRound className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isBn ? 'পাসওয়ার্ড রিসেট করুন' : 'Reset Password'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn ? 'আপনার অ্যাকাউন্টের মোবাইল নম্বর দিন। একটি OTP কোড পাঠানো হবে।' : 'Enter your registered mobile number to receive a verification OTP.'}
              </p>
            </div>

            <form onSubmit={handleRequestForgotOtp} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isBn ? 'রেজিস্টার্ড মোবাইল নম্বর' : 'Registered Mobile Number'}
                </label>
                <div className="relative">
                  <Smartphone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className={`w-full pl-9.5 pr-3 py-2.5 rounded-xl border font-semibold outline-hidden transition ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer text-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <KeyRound className="w-4 h-4" />
                )}
                <span>{isBn ? 'রিসেট OTP পাঠান' : 'Send Reset OTP'}</span>
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => {
                  setViewMode('login');
                  setErrorMessage('');
                }}
                className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline cursor-pointer"
              >
                {isBn ? '← লগইনে ফিরে যান' : '← Back to Login'}
              </button>
            </div>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 5: FORGOT PASSWORD - STEP 2 (VERIFY OTP) */}
        {/* ============================================================== */}
        {viewMode === 'forgot_otp' && (
          <div className="space-y-4 pt-3">
            <div className="text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Smartphone className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isBn ? 'রিসেট OTP কোড যাচাই' : 'Verify Reset OTP'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                {isBn ? (
                  <>
                    <span className="font-bold text-slate-800 dark:text-slate-200">{maskedPhone || phone}</span> নম্বরে পাঠানো ৬-সংখ্যার কোডটি লিখুন
                  </>
                ) : (
                  <>
                    Enter the 6-digit code sent to <span className="font-bold text-slate-800 dark:text-slate-200">{maskedPhone || phone}</span>
                  </>
                )}
              </p>
            </div>

            <form onSubmit={handleVerifyForgotOtp} className="space-y-4">
              <div className="flex items-center justify-center gap-2 sm:gap-2.5">
                {otp.map((digit, idx) => (
                  <input
                    key={idx}
                    ref={(el) => { otpInputRefs.current[idx] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onPaste={handleOtpPaste}
                    className={`w-10 h-12 sm:w-12 sm:h-14 text-center text-lg sm:text-xl font-black rounded-2xl border transition outline-hidden ${
                      digit
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 shadow-xs'
                        : darkMode
                          ? 'bg-slate-800 border-slate-700 text-white'
                          : 'bg-white border-slate-300 text-slate-900'
                    }`}
                  />
                ))}
              </div>

              <div className="flex items-center justify-between text-xs px-1">
                <div className="text-slate-500 dark:text-slate-400 flex items-center gap-1">
                  <span>{isBn ? 'মেয়াদ বাকি:' : 'Expires in:'}</span>
                  <span className="font-bold font-mono text-amber-600 dark:text-amber-400">
                    {formatTime(expirySeconds)}
                  </span>
                </div>

                {cooldown > 0 ? (
                  <span className="text-[11px] text-slate-400 font-semibold">
                    {isBn ? `পুনরায় পাঠান (${cooldown}s)` : `Resend in ${cooldown}s`}
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleResendOtp('forgot_password')}
                    disabled={loading}
                    className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>{isBn ? 'পুনরায় OTP পাঠান' : 'Resend OTP'}</span>
                  </button>
                )}
              </div>

              <button
                type="submit"
                disabled={loading || otp.join('').length !== 6}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer text-xs flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{isBn ? 'কোড যাচাই করুন' : 'Verify Code'}</span>
              </button>
            </form>
          </div>
        )}

        {/* ============================================================== */}
        {/* VIEW 6: FORGOT PASSWORD - STEP 3 (NEW PASSWORD) */}
        {/* ============================================================== */}
        {viewMode === 'forgot_new_password' && (
          <div className="space-y-4 pt-3">
            <div className="text-center pb-1">
              <div className="w-12 h-12 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-2 shadow-xs">
                <Lock className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-black text-slate-900 dark:text-white">
                {isBn ? 'নতুন পাসওয়ার্ড সেট করুন' : 'Set New Password'}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                {isBn ? 'আপনার নতুন পাসওয়ার্ড দিন এবং নিশ্চিত করুন' : 'Enter your new password to secure your account'}
              </p>
            </div>

            <form onSubmit={handleResetPasswordSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isBn ? 'নতুন পাসওয়ার্ড' : 'New Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="কমপক্ষে ৬ অক্ষর..."
                    className={`w-full pl-9.5 pr-10 py-2.5 rounded-xl border font-semibold outline-hidden transition ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer p-1"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold mb-1 text-slate-700 dark:text-slate-300">
                  {isBn ? 'নতুন পাসওয়ার্ড নিশ্চিত করুন' : 'Confirm New Password'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="পাসওয়ার্ড পুনরায় লিখুন..."
                    className={`w-full pl-9.5 pr-10 py-2.5 rounded-xl border font-semibold outline-hidden transition ${
                      darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                    }`}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-98 text-white font-extrabold rounded-xl shadow-md transition cursor-pointer text-xs flex items-center justify-center gap-2 mt-2 disabled:opacity-50"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>{isBn ? 'পাসওয়ার্ড পরিবর্তন সম্পন্ন করুন' : 'Update & Reset Password'}</span>
              </button>
            </form>
          </div>
        )}

      </div>
    </div>
  );
};
