import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Menu, 
  X, 
  LayoutGrid, 
  Bell, 
  User as UserIcon, 
  Briefcase, 
  ArrowRight,
  ShieldCheck, 
  Download, 
  HelpCircle, 
  Trophy, 
  Users, 
  Wallet, 
  FileText, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles, 
  LogIn, 
  UserPlus, 
  Smile, 
  ArrowLeftRight, 
  Play, 
  Shield, 
  Headphones, 
  Gift, 
  Settings, 
  LogOut, 
  ChevronRight,
  CheckCircle,
  Search,
  Database,
  MessageSquare,
  Home,
  ArrowUpRight,
  ClipboardList,
  Copy,
  Check
} from 'lucide-react';
import { UserProfile, Language, Currency, NotificationItem, UserRole, isUserBlueBadgeVerified } from '../types';
import { BrandLogo } from './BrandLogo';
import { BkashBalancePill } from './BkashBalancePill';
import { FacebookVerifiedBadge } from './FacebookVerifiedBadge';

interface HeaderNavProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  language: Language;
  setLanguage: (lang: Language) => void;
  darkMode?: boolean;
  setDarkMode?: (val: boolean) => void;
  user: UserProfile;
  notifications: NotificationItem[];
  onOpenWallet: (tab?: 'deposit' | 'withdraw' | 'history') => void;
  onOpenPostJob: () => void;
  onOpenApkModal: () => void;
  onOpenFeedback: () => void;
  onOpenKyc: () => void;
  onOpenAuth: (mode?: 'login' | 'signup') => void;
  onOpenStatement?: () => void;
  onOpenNotifications?: () => void;
  onSwitchRole?: (role: UserRole) => void;
  isLoggedIn?: boolean;
  onLogout?: () => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  currentView,
  setCurrentView,
  language,
  setLanguage,
  user,
  notifications,
  onOpenWallet,
  onOpenPostJob,
  onOpenApkModal,
  onOpenFeedback,
  onOpenKyc,
  onOpenAuth,
  onOpenStatement,
  onOpenNotifications,
  onSwitchRole,
  isLoggedIn = true,
  onLogout
}) => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [copiedDrawerUid, setCopiedDrawerUid] = useState(false);

  // Prevent background scroll and page shifting when side menu is open
  useEffect(() => {
    if (drawerOpen) {
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
  }, [drawerOpen]);

  const numericUid = (user.uid && /^\d{8}$/.test(user.uid))
    ? user.uid
    : ((user.id && /^\d{8}$/.test(user.id)) ? user.id : '84920173');

  const handleCopyDrawerUid = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(numericUid);
    setCopiedDrawerUid(true);
    setTimeout(() => setCopiedDrawerUid(false), 2000);
  };

  const isBn = language === 'bn';
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const hasBlueBadge = isUserBlueBadgeVerified(user);

  // Mutually exclusive active state calculation for Client vs Freelancer
  const isClientActive = currentView === 'client' || currentView === 'my_jobs' || currentView === 'submissions_review' || currentView === 'post_job' || (user.role === 'employer' && currentView !== 'freelancer' && currentView !== 'jobs' && currentView !== 'job_detail' && currentView !== 'my_submissions');
  const isFreelancerActive = !isClientActive;

  const isClientView = currentView === 'client' || currentView === 'my_jobs' || currentView === 'submissions_review' || currentView === 'post_job';
  const isFreelancerView = currentView === 'freelancer' || currentView === 'my_submissions' || currentView === 'jobs' || currentView === 'job_detail';
  const isDashboardView = currentView === 'freelancer' || currentView === 'client';

  const handleRoleChange = (role: UserRole) => {
    if (onSwitchRole) {
      onSwitchRole(role);
    } else {
      user.role = role;
      setCurrentView(role === 'employer' ? 'client' : 'freelancer');
    }
  };

  const activeBalanceBDT = user.role === 'employer' ? user.depositBalanceBDT : user.earningBalanceBDT;
  const activeBalanceUSD = user.role === 'employer' ? user.depositBalanceUSD : user.earningBalanceUSD;

  const handleNotificationClick = () => {
    if (onOpenNotifications) {
      onOpenNotifications();
    } else {
      setCurrentView('notifications');
    }
  };

  return (
    <>
      {/* 
        GLASSMORPHIC FROSTED GLASS HEADER:
        Backdrop-blur-2xl with translucent background for real frosted glass effect on scroll
      */}
      <header className="sticky top-0 z-40 backdrop-blur-2xl bg-white/75 backdrop-saturate-150 border-b border-slate-200/60 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] transition-all duration-200 w-full max-w-full overflow-x-clip">
        
        {/* VIP International Top Status Bar */}
        <div className="bg-slate-950/90 backdrop-blur-md text-slate-300 py-1 px-3 sm:px-6 lg:px-8 border-b border-slate-800/80 text-[11px] hidden md:block">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 font-black text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 text-[10px] tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-400" />
                VIP INTL NETWORK
              </span>
              <span className="text-slate-400 text-[11px]">
                {isBn ? '১০০% এসক্রো সুরক্ষিত ও নিশ্চিত পেমেন্ট প্ল্যাটফর্ম' : '100% Escrow Protection • Instant bKash, Nagad & Crypto Gateways'}
              </span>
            </div>
            <div className="flex items-center gap-3.5 text-slate-400 text-[11px]">
              <span className="font-mono text-emerald-400 font-extrabold">$1.00 USD = ৳120.00 BDT</span>
              <span className="text-slate-700">•</span>
              <span className="flex items-center gap-1 text-emerald-400 font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                99.9% Uptime
              </span>
              <span className="text-slate-700">•</span>
              <a 
                href="https://wa.me/8801331119361" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="hover:text-emerald-400 transition font-medium"
              >
                Helpline: +880 1331-119361
              </a>
            </div>
          </div>
        </div>

        {/* Top subtle reflection hairline */}
        <div className="h-0.5 bg-gradient-to-r from-emerald-500/30 via-teal-500/50 to-emerald-500/30 w-full" />

        <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8 w-full overflow-hidden">
          <div className="flex items-center justify-between h-14 sm:h-16 gap-1 sm:gap-4 w-full">
            
            {/* LEFT: Official Brand Logo + Freelancer/Client Switcher */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink min-w-0">
              <button
                id="header-logo-btn"
                onClick={() => setCurrentView(isLoggedIn ? (user.role === 'employer' ? 'client' : 'freelancer') : 'landing')}
                className="flex items-center text-left cursor-pointer transition-transform hover:scale-[1.02] active:scale-[0.98] shrink-0"
                aria-label="Amader Job Online Home"
              >
                <BrandLogo size="icon-only" isBn={isBn} />
              </button>

              {/* Freelancer / Client Switcher (Placed directly on the right side of the logo) */}
              {isLoggedIn && (
                <div className="inline-flex p-0.5 bg-slate-100 rounded-full border border-slate-200/90 shadow-2xs shrink-0">
                  <button
                    type="button"
                    id="header-mode-freelancer-btn"
                    onClick={() => handleRoleChange('worker')}
                    className={`px-1.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                      isFreelancerActive
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={isBn ? 'ফ্রিল্যান্সার মোড' : 'Freelancer Mode'}
                  >
                    <Briefcase className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                    <span>{isBn ? 'ফ্রিল্যান্সার' : 'Freelancer'}</span>
                  </button>
                  <button
                    type="button"
                    id="header-mode-client-btn"
                    onClick={() => handleRoleChange('employer')}
                    className={`px-1.5 sm:px-3 py-1 rounded-full text-[10px] sm:text-xs font-black transition-all flex items-center gap-1 cursor-pointer active:scale-95 ${
                      isClientActive
                        ? 'bg-emerald-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                    title={isBn ? 'ক্লায়েন্ট মোড' : 'Client Mode'}
                  >
                    <UserIcon className="w-2.5 h-2.5 sm:w-3 sm:h-3 shrink-0" />
                    <span>{isBn ? 'ক্লায়েন্ট' : 'Client'}</span>
                  </button>
                </div>
              )}
            </div>

            {/* CENTER: Navigation Links (Desktop) */}
            <nav className="hidden xl:flex items-center gap-1.5 font-bold text-xs text-slate-700">
              
              {/* Home / Landing */}
              <button
                id="nav-home-btn"
                onClick={() => setCurrentView('landing')}
                className={`px-3 py-1.5 rounded-xl transition cursor-pointer ${
                  currentView === 'landing'
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold shadow-2xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {isBn ? 'হোম' : 'Home'}
              </button>

              {/* Freelancer Marketplace / Jobs */}
              <button
                id="nav-jobs-btn"
                onClick={() => {
                  if (user.role !== 'worker' && isLoggedIn) {
                    user.role = 'worker';
                  }
                  setCurrentView('freelancer');
                }}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                  isFreelancerView
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold shadow-2xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? 'মাইক্রো-জব মার্কেট' : 'Micro Tasks'}</span>
              </button>

              {/* Client Dashboard / Post Job */}
              <button
                id="nav-post-job-btn"
                onClick={() => {
                  if (user.role !== 'employer' && isLoggedIn) {
                    user.role = 'employer';
                  }
                  setCurrentView('client');
                }}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                  isClientView
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold shadow-2xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <PlusCircle className="w-3.5 h-3.5 text-blue-600" />
                <span>{isBn ? 'বায়ার / কাজ দিন' : 'Employers'}</span>
              </button>

              {/* Top Refer & Top Deposit Leaderboard */}
              <button
                id="nav-top-rankings-btn"
                onClick={() => setCurrentView('top_rankings')}
                className={`px-3 py-1.5 rounded-xl transition flex items-center gap-1.5 cursor-pointer ${
                  currentView === 'top_rankings'
                    ? 'bg-amber-50 text-amber-800 font-extrabold shadow-2xs'
                    : 'hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                <span>{isBn ? 'টপ র‍্যাংকিং' : 'Top Rankings'}</span>
              </button>

              {/* Android APK Download */}
              <button
                id="nav-apk-btn"
                onClick={onOpenApkModal}
                className="px-3 py-1.5 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? 'অ্যাপ' : 'App'}</span>
              </button>

              {/* WhatsApp Help */}
              <a
                href="https://wa.me/8801331119361"
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1.5 rounded-xl hover:bg-slate-100 transition flex items-center gap-1.5 text-slate-600 hover:text-slate-900 cursor-pointer"
              >
                <Headphones className="w-3.5 h-3.5 text-emerald-600" />
                <span>{isBn ? 'হেল্পলাইন' : 'Support'}</span>
              </a>
            </nav>

            {/* RIGHT: Actions, Balance Pill, Notifications & Profile */}
            <div className="flex items-center gap-1 sm:gap-2.5 shrink-0">
              
              {!isLoggedIn ? (
                /* If Not Logged In: Clean, Ultra-Mobile-Friendly Language Switch + Login & Sign Up */
                <div className="flex items-center gap-1 sm:gap-2 shrink-0">
                  {/* Language switch */}
                  <button
                    id="header-language-toggle-btn"
                    onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                    title={isBn ? 'Switch to English' : 'বাংলায় পরিবর্তন করুন'}
                    className="px-1.5 sm:px-2.5 py-1.5 rounded-lg sm:rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[11px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                    aria-label="Language switch"
                  >
                    <Globe className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-emerald-600 shrink-0" />
                    <span>{language === 'bn' ? 'বাংলা' : 'EN'}</span>
                  </button>

                  {/* Login Button */}
                  <button
                    id="header-login-btn"
                    onClick={() => onOpenAuth('login')}
                    className="inline-flex items-center justify-center gap-1 px-2 sm:px-3.5 py-1.5 rounded-lg sm:rounded-xl text-[11px] sm:text-xs font-bold border border-slate-300/90 text-slate-700 bg-white hover:bg-slate-50 active:scale-95 transition cursor-pointer shadow-2xs shrink-0 whitespace-nowrap"
                  >
                    <LogIn className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-slate-600" />
                    <span>{isBn ? 'লগইন' : 'Login'}</span>
                  </button>

                  {/* Sign Up / Registration Button */}
                  <button
                    id="header-signup-btn"
                    onClick={() => onOpenAuth('signup')}
                    className="inline-flex items-center justify-center gap-1 px-2.5 sm:px-4 py-1.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-700 hover:to-teal-800 active:scale-95 text-white font-extrabold text-[11px] sm:text-xs shadow-xs shadow-emerald-600/25 transition cursor-pointer shrink-0 whitespace-nowrap"
                  >
                    <UserPlus className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-white" />
                    <span>{isBn ? 'নিবন্ধন' : 'Sign Up'}</span>
                  </button>

                  {/* Side Menu Toggle Button for Guests */}
                  <button
                    id="header-guest-side-menu-toggle-btn"
                    onClick={() => setDrawerOpen(true)}
                    className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-700 flex items-center justify-center transition cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                    title={isBn ? 'মেনু' : 'Menu'}
                    aria-label="Open Menu"
                  >
                    <Menu className="w-4 h-4 text-slate-700" />
                  </button>
                </div>
              ) : (
                /* If Logged In: Notifications + Language + Profile Avatar (Opens Side Menu Drawer) */
                <div className="flex items-center gap-1.5 sm:gap-2.5">
                  {/* bKash Balance Pill (Desktop only) */}
                  <div className="hidden lg:block">
                    <BkashBalancePill
                      balanceBDT={activeBalanceBDT}
                      balanceUSD={activeBalanceUSD}
                      language={language}
                      darkMode={false}
                      size="sm"
                    />
                  </div>

                  {/* Top Rankings Button (Desktop) */}
                  <button
                    id="header-top-rankings-pill-btn"
                    onClick={() => setCurrentView('top_rankings')}
                    className="hidden xl:flex px-2.5 py-1.5 rounded-xl bg-amber-50 border border-amber-300/80 text-amber-800 font-extrabold text-xs items-center gap-1.5 hover:scale-105 transition cursor-pointer shadow-2xs"
                    title={isBn ? 'টপ রেফার ও টপ ডিপোজিট লিডারবোর্ড' : 'Top Community Rankings'}
                  >
                    <Trophy className="w-3.5 h-3.5 text-amber-600" />
                    <span>{isBn ? 'টপ র‍্যাংকিং' : 'Top Rankings'}</span>
                  </button>

                  {/* Quick Deposit Button (Desktop) */}
                  <button
                    id="header-deposit-btn"
                    onClick={() => setCurrentView('deposit')}
                    className="hidden xl:flex px-2.5 py-1.5 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-700 font-bold text-xs items-center gap-1.5 hover:bg-emerald-100 transition cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5 text-emerald-600" />
                    <span>{isBn ? 'ডিপোজিট' : 'Deposit'}</span>
                  </button>

                  {/* Notification Bell with working click handler */}
                  <div className="relative">
                    <button
                      id="header-notifications-btn"
                      onClick={handleNotificationClick}
                      className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-xl border border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100 flex items-center justify-center relative transition cursor-pointer shrink-0"
                      title={isBn ? 'বিজ্ঞপ্তি' : 'Notifications'}
                      aria-label="Notifications"
                    >
                      <Bell className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                      {unreadCount > 0 && (
                        <span className="absolute -top-1 -right-1 min-w-[16px] sm:min-w-[18px] h-[16px] sm:h-[18px] px-1 rounded-full bg-rose-500 text-white text-[9px] sm:text-[10px] font-black flex items-center justify-center ring-2 ring-white animate-pulse">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Language toggle: বাংলা / English */}
                  <button
                    id="header-language-toggle-btn"
                    onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
                    title={language === 'en' ? 'Switch to Bangla (বাংলায় পরিবর্তন করুন)' : 'Switch to English (ইংরেজিতে পরিবর্তন করুন)'}
                    className="px-1.5 sm:px-2.5 py-1 sm:py-1.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-[10px] sm:text-xs font-bold transition flex items-center gap-1 cursor-pointer shrink-0 active:scale-95 shadow-2xs"
                    aria-label="Language switch"
                  >
                    <Globe className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-600 shrink-0" />
                    <span>{language === 'en' ? 'বাংলা' : 'EN'}</span>
                  </button>

                  {/* Profile Side Menu Trigger (Avatar with online indicator) */}
                  <button
                    id="header-user-avatar-drawer-btn"
                    onClick={() => setDrawerOpen(true)}
                    className="relative cursor-pointer transition-transform hover:scale-105 active:scale-95 shrink-0 focus:outline-hidden ring-2 ring-emerald-500/20 rounded-full"
                    title={user.name ? `${user.name} - Profile Menu` : 'Profile Menu'}
                    aria-label="Open Profile Side Menu"
                  >
                    <img
                      src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                      alt={user.name}
                      className="w-7.5 h-7.5 sm:w-9 sm:h-9 rounded-full object-cover border border-slate-200 shadow-2xs"
                    />
                    <span className="absolute bottom-0 right-0 w-2 h-2 sm:w-2.5 sm:h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      </header>

      {/* 
        BEAUTIFUL SIDE MENU (DRAWER):
        Clean, modern light layout with user profile, 
        Top Rankings, direct notifications, and grouped navigation.
      */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop Overlay */}
          <div 
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 animate-in fade-in"
            onClick={() => setDrawerOpen(false)}
          />

          {/* Drawer Panel: overflow-hidden so the panel never creates double scrollbars or pushes buttons offscreen */}
          <div className="relative w-full max-w-xs sm:max-w-sm h-full flex flex-col shadow-2xl overflow-hidden transition-transform duration-300 border-l border-slate-200 bg-white text-slate-900 animate-in slide-in-from-right z-10">
            
            {/* Top Close Button */}
            <div className="flex items-center justify-between px-3.5 py-2.5 border-b border-slate-100 shrink-0">
              <BrandLogo size="sm" isBn={isBn} showSubtitle={false} />
              <button
                onClick={() => setDrawerOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                aria-label="Close Menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoggedIn ? (
              <>
                {/* Profile Header Card */}
                <div className="px-3.5 py-2.5 border-b border-slate-100 shrink-0">
              <div 
                onClick={() => { setCurrentView('account'); setDrawerOpen(false); }}
                className="flex items-center justify-between cursor-pointer hover:opacity-95 transition"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="relative shrink-0">
                    <img
                      src={user.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80"}
                      alt="Account Avatar"
                      className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-xs"
                    />
                    <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="min-w-0 space-y-0.5">
                    {/* Line 1: User Name + Blue Badge (if active) */}
                    <div className="flex items-center gap-1 min-w-0">
                      <h3 className="font-extrabold text-slate-900 text-sm leading-tight truncate" title={user.name}>
                        {user.name || 'Rafi Ahmed'}
                      </h3>
                      {hasBlueBadge && (
                        <FacebookVerifiedBadge size="sm" title={isBn ? "ব্লু ব্যাজ ভেরিফাইড প্রোফাইল" : "Blue Verified Profile"} />
                      )}
                    </div>

                    {/* Line 2: UID + Copy + Role Pill */}
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-[10px] font-bold text-slate-400">UID:</span>
                      <span className="font-mono font-bold text-slate-700 text-xs">
                        {numericUid}
                      </span>
                      <button
                        type="button"
                        id="side-menu-copy-uid-btn"
                        onClick={handleCopyDrawerUid}
                        className="p-0.5 rounded bg-slate-100 hover:bg-emerald-50 text-slate-500 hover:text-emerald-600 transition cursor-pointer active:scale-90 shrink-0"
                        title={isBn ? "ইউআইডি কপি করুন" : "Copy UID"}
                        aria-label="Copy UID"
                      >
                        {copiedDrawerUid ? (
                          <Check className="w-3 h-3 text-emerald-600 stroke-[3]" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </button>

                      <span className={`inline-flex items-center px-1.5 py-0.2 rounded text-[9.5px] font-bold ${
                        user.role === 'employer' 
                          ? 'bg-blue-50 text-blue-700 border border-blue-200/60' 
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                      }`}>
                        {user.role === 'employer' ? (isBn ? 'ক্লায়েন্ট' : 'Client') : (isBn ? 'ফ্রিল্যান্সার' : 'Freelancer')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-1 text-slate-400 hover:text-slate-600 transition shrink-0">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Balance Card & Action Buttons */}
            <div className="px-3.5 py-2 shrink-0">
              <div className="bg-slate-50 rounded-xl p-2 sm:p-2.5 border border-slate-100 space-y-2">
                <div className="grid grid-cols-2 gap-2">
                  {/* Available Balance */}
                  <div className="bg-white rounded-lg p-2 border border-slate-100 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-medium">
                      <Wallet className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="truncate">Available</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 mt-0.5 leading-none">
                      ${(user.earningBalanceUSD ?? 4.85).toFixed(2)}
                    </div>
                  </div>

                  {/* Deposited Balance */}
                  <div className="bg-white rounded-lg p-2 border border-slate-100 shadow-2xs">
                    <div className="flex items-center gap-1.5 text-[10.5px] text-slate-500 font-medium">
                      <Database className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                      <span className="truncate">Deposited</span>
                    </div>
                    <div className="text-sm font-black text-slate-900 mt-0.5 leading-none">
                      ${(user.depositBalanceUSD ?? 8.10).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Deposit & Withdraw Buttons */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => { setCurrentView('deposit'); setDrawerOpen(false); }}
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-2xs transition cursor-pointer"
                  >
                    <Wallet className="w-3.5 h-3.5" />
                    <span>Deposit</span>
                  </button>

                  <button
                    onClick={() => { setCurrentView('withdraw'); setDrawerOpen(false); }}
                    className="w-full py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200/80 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <ArrowUpRight className="w-3.5 h-3.5" />
                    <span>Withdraw</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Blue Badge VIP Drawer Promo - Only shown if NOT active, so it never hides buttons when active */}
            {!hasBlueBadge && (
              <div className="px-3.5 py-1 shrink-0">
                <button
                  onClick={() => {
                    setCurrentView('account');
                    setDrawerOpen(false);
                  }}
                  className="w-full text-left p-2 rounded-xl bg-gradient-to-r from-blue-50/80 to-indigo-50/50 hover:from-blue-100/70 hover:to-indigo-100/60 border border-blue-200/70 transition cursor-pointer flex items-center justify-between group shadow-2xs"
                >
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-blue-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                      <FacebookVerifiedBadge size="sm" className="text-white fill-white" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-900 truncate">
                          {isBn ? 'ব্লু ভেরিফাইড ব্যাজ' : 'Blue Verified Badge'}
                        </span>
                        <span className="text-[9px] bg-amber-500 text-white px-1.5 py-0.2 rounded font-bold">VIP</span>
                      </div>
                      <p className="text-[10px] text-blue-700 font-semibold truncate mt-0.5">
                        {isBn ? '৫০ টাকা/মাস বা এনআইডি দিয়ে ফ্রি' : '৳50/mo or Free with NID'}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-blue-500 group-hover:translate-x-0.5 transition shrink-0" />
                </button>
              </div>
            )}

            {/* Scrollable Navigation Menu List: min-h-0 prevents flex children from overflowing bounds */}
            <div className="flex-1 min-h-0 px-3.5 py-2 space-y-1 overflow-y-auto">
              
              {/* 1. Dashboard (Active Highlight) */}
              <button
                id="side-menu-dashboard-btn"
                onClick={() => {
                  setCurrentView(user.role === 'employer' ? 'client' : 'freelancer');
                  setDrawerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                  currentView === 'freelancer' || currentView === 'client'
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200/50'
                    : 'text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Home className={`w-4 h-4 shrink-0 ${currentView === 'freelancer' || currentView === 'client' ? 'text-emerald-600' : 'text-slate-500'}`} />
                  <span>{isBn ? 'ড্যাশবোর্ড' : 'Dashboard'}</span>
                </div>
                <ChevronRight className={`w-3.5 h-3.5 shrink-0 ${currentView === 'freelancer' || currentView === 'client' ? 'text-emerald-600' : 'text-slate-300'}`} />
              </button>

              {/* 2. Find Jobs */}
              <button
                id="side-menu-find-jobs-btn"
                onClick={() => {
                  setCurrentView('freelancer');
                  setDrawerOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'কাজ খুঁজুন' : 'Find Jobs'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              {/* 3. Browse Tasks */}
              <button
                id="side-menu-browse-tasks-btn"
                onClick={() => {
                  setCurrentView('freelancer');
                  setDrawerOpen(false);
                  const el = document.getElementById('marketplace-jobs-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'টাস্ক ব্রাউজ করুন' : 'Browse Tasks'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              {/* 4. Post a New Job */}
              <button
                id="side-menu-post-job-btn"
                onClick={() => {
                  onOpenPostJob();
                  setDrawerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                  currentView === 'post_job'
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200/50'
                    : 'text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <PlusCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'নতুন কাজ দিন' : 'Post a New Job'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              {/* 5. My Jobs */}
              <button
                id="side-menu-my-jobs-btn"
                onClick={() => {
                  setCurrentView('my_jobs');
                  setDrawerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                  currentView === 'my_jobs'
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200/50'
                    : 'text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Briefcase className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'আমার কাজ সমূহ' : 'My Jobs'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              {/* 6. My Orders */}
              <button
                id="side-menu-my-orders-btn"
                onClick={() => {
                  setCurrentView('my_submissions');
                  setDrawerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                  currentView === 'my_submissions'
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200/50'
                    : 'text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <ClipboardList className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'আমার সাবমিশন/অর্ডার' : 'My Orders'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              {/* 7. Top Rankings */}
              <button
                id="side-menu-top-rankings-btn"
                onClick={() => {
                  setCurrentView('top_rankings');
                  setDrawerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                  currentView === 'top_rankings'
                    ? 'bg-amber-50 text-amber-800 font-extrabold border border-amber-200/60'
                    : 'text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>{isBn ? 'টপ র‍্যাংকিং' : 'Top Rankings'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              {/* 8. Messages (with Red Badge 2) */}
              <button
                id="side-menu-messages-btn"
                onClick={() => {
                  setCurrentView('support');
                  setDrawerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                  currentView === 'support'
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200/50'
                    : 'text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <MessageSquare className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'মেসেজ ও সাপোর্ট' : 'Messages'}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-4.5 h-4.5 rounded-full bg-rose-500 text-white text-[10px] font-black flex items-center justify-center">
                    2
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                </div>
              </button>

              {/* 9. Wallet */}
              <button
                id="side-menu-wallet-btn"
                onClick={() => {
                  setCurrentView('deposit');
                  setDrawerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                  currentView === 'deposit' || currentView === 'withdraw'
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200/50'
                    : 'text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Wallet className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'ওয়ালেট' : 'Wallet'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              {/* 10. My Profile */}
              <button
                id="side-menu-profile-btn"
                onClick={() => {
                  setCurrentView('account');
                  setDrawerOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs transition cursor-pointer ${
                  currentView === 'account'
                    ? 'bg-emerald-50 text-emerald-700 font-extrabold border border-emerald-200/50'
                    : 'text-slate-700 font-bold hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <UserIcon className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'আমার প্রোফাইল' : 'My Profile'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              {/* 11. Settings */}
              <button
                id="side-menu-settings-btn"
                onClick={() => {
                  setCurrentView('account');
                  setDrawerOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Settings className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'সেটিংস' : 'Settings'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              {/* 12. Help & Support */}
              <button
                id="side-menu-help-btn"
                onClick={() => {
                  setCurrentView('support');
                  setDrawerOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'হেল্প ও সাপোর্ট' : 'Help & Support'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

            </div>

            {/* Slim Bottom Bar: Language & Log Out */}
            <div className="px-3.5 py-2.5 border-t border-slate-100 shrink-0 bg-slate-50/70 flex items-center justify-between gap-2">
              <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    language === 'en'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    language === 'bn'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  বাংলা
                </button>
              </div>

              {/* Log Out Button */}
              {isLoggedIn && (
                <button
                  id="side-menu-logout-btn"
                  onClick={() => {
                    if (onLogout) onLogout();
                    setDrawerOpen(false);
                  }}
                  className="py-1 px-2.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs flex items-center gap-1.5 border border-rose-100 transition cursor-pointer shrink-0"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{isBn ? 'লগআউট' : 'Log Out'}</span>
                </button>
              )}
            </div>
          </>
        ) : (
          <>
            {/* Guest Header & Action Card */}
            <div className="p-4 border-b border-slate-100 shrink-0 bg-slate-50/60 space-y-3">
              <div>
                <h3 className="text-sm font-black text-slate-900">
                  {isBn ? 'স্বাগতম!' : 'Welcome!'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isBn ? 'মাইক্রোজব ও ফ্রিল্যান্সিং প্ল্যাটফর্মে যুক্ত হোন' : 'Join Bangladesh’s trusted micro-task marketplace'}
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <button
                  id="side-menu-guest-login-btn"
                  onClick={() => {
                    onOpenAuth('login');
                    setDrawerOpen(false);
                  }}
                  className="py-2 px-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 text-xs font-bold transition cursor-pointer text-center"
                >
                  {isBn ? 'লগইন' : 'Login'}
                </button>
                <button
                  id="side-menu-guest-signup-btn"
                  onClick={() => {
                    onOpenAuth('signup');
                    setDrawerOpen(false);
                  }}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black transition cursor-pointer text-center shadow-xs"
                >
                  {isBn ? 'নিবন্ধন' : 'Sign Up'}
                </button>
              </div>
            </div>

            {/* Guest Navigation Links */}
            <div className="flex-1 min-h-0 px-3.5 py-2 space-y-1 overflow-y-auto">
              <button
                id="side-menu-guest-home-btn"
                onClick={() => {
                  setCurrentView('freelancer');
                  setDrawerOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Home className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'হোম ও মার্কেটপ্লেস' : 'Home & Marketplace'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              <button
                id="side-menu-guest-browse-btn"
                onClick={() => {
                  setCurrentView('freelancer');
                  setDrawerOpen(false);
                  const el = document.getElementById('marketplace-jobs-section');
                  el?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Search className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'কাজ খুঁজুন' : 'Browse Tasks'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              <button
                id="side-menu-guest-rankings-btn"
                onClick={() => {
                  setCurrentView('top_rankings');
                  setDrawerOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Trophy className="w-4 h-4 text-amber-500 shrink-0" />
                  <span>{isBn ? 'টপ র‍্যাংকিং' : 'Top Rankings'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>

              <button
                id="side-menu-guest-support-btn"
                onClick={() => {
                  setCurrentView('support');
                  setDrawerOpen(false);
                }}
                className="w-full text-left px-3 py-2 rounded-lg flex items-center justify-between text-xs font-bold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <HelpCircle className="w-4 h-4 text-slate-500 shrink-0" />
                  <span>{isBn ? 'সাহায্য ও যোগাযোগ' : 'Help & Support'}</span>
                </div>
                <ChevronRight className="w-3.5 h-3.5 text-slate-300 shrink-0" />
              </button>
            </div>

            {/* Guest Bottom Language Switcher */}
            <div className="px-3.5 py-2.5 border-t border-slate-100 shrink-0 bg-slate-50/70 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">{isBn ? 'ভাষা:' : 'Language:'}</span>
              <div className="inline-flex p-0.5 bg-slate-200/70 rounded-lg border border-slate-200">
                <button
                  type="button"
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    language === 'en'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  English
                </button>
                <button
                  type="button"
                  onClick={() => setLanguage('bn')}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                    language === 'bn'
                      ? 'bg-white text-emerald-700 shadow-2xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  বাংলা
                </button>
              </div>
            </div>
          </>
        )}

          </div>
        </div>
      )}
    </>
  );
};
