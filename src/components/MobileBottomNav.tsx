import React from 'react';
import { 
  Home, 
  ClipboardList, 
  Plus, 
  User as UserIcon,
  MessageSquare
} from 'lucide-react';
import { Language, UserRole } from '../types';

interface MobileBottomNavProps {
  currentView: string;
  setCurrentView: (view: any) => void;
  onOpenPostJob: () => void;
  onOpenDeposit: () => void;
  onOpenNotifications?: () => void;
  language: Language;
  userRole?: UserRole;
  darkMode?: boolean;
  unreadNotificationsCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  setCurrentView,
  onOpenPostJob,
  onOpenNotifications,
  language,
  userRole = 'worker',
  unreadNotificationsCount = 2
}) => {
  const isBn = language === 'bn';
  const isEmployer = userRole === 'employer';
  const isHome = currentView === 'freelancer' || currentView === 'client' || currentView === 'landing';
  const isMyTasks = currentView === 'my_jobs' || currentView === 'my_submissions';
  const isMessages = currentView === 'support' || currentView === 'notifications';
  const isAccount = currentView === 'account';

  const handleNav = (view: string) => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
  };

  const handlePostJob = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    onOpenPostJob();
  };

  return (
    <nav 
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t transition-all backdrop-blur-2xl bg-white/95 border-slate-200/90 text-slate-600 shadow-[0_-6px_25px_rgba(0,0,0,0.08)]"
      style={{ paddingBottom: 'max(env(safe-area-inset-bottom, 0px), 6px)' }}
    >
      <div className="grid grid-cols-5 h-15 items-center px-2">
        
        {/* 1: Home */}
        <button
          id="mobile-nav-home-btn"
          onClick={() => handleNav(isEmployer ? 'client' : 'freelancer')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-90 select-none ${
            isHome
              ? 'text-emerald-600 font-bold'
              : 'hover:text-slate-900 text-slate-500 font-medium'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-tight">{isBn ? 'হোম' : 'Home'}</span>
          {isHome && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />}
        </button>

        {/* 2: My Tasks */}
        <button
          id="mobile-nav-my-tasks-btn"
          onClick={() => handleNav(isEmployer ? 'my_jobs' : 'my_submissions')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-90 select-none ${
            isMyTasks
              ? 'text-emerald-600 font-bold'
              : 'hover:text-slate-900 text-slate-500 font-medium'
          }`}
        >
          <ClipboardList className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-tight">
            {isBn ? 'আমার কাজ' : 'My Tasks'}
          </span>
          {isMyTasks && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />}
        </button>

        {/* 3: Post Job (Prominent floating center button) */}
        <button
          id="mobile-nav-post-job-btn"
          onClick={handlePostJob}
          className="flex flex-col items-center justify-center -mt-5 group cursor-pointer active:scale-95 select-none"
        >
          <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-lg shadow-emerald-600/35 group-hover:scale-105 transition-transform border-2 border-white">
            <Plus className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-bold text-slate-700 mt-0.5 leading-tight">
            {isBn ? 'পোস্ট জব' : 'Post Job'}
          </span>
        </button>

        {/* 4: Messages with Badge 2 */}
        <button
          id="mobile-nav-messages-btn"
          onClick={() => handleNav('support')}
          className={`relative flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-90 select-none ${
            isMessages
              ? 'text-emerald-600 font-bold'
              : 'hover:text-slate-900 text-slate-500 font-medium'
          }`}
        >
          <div className="relative">
            <MessageSquare className="w-5 h-5" />
            <span className="absolute -top-1 -right-2 w-4 h-4 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center ring-1 ring-white">
              2
            </span>
          </div>
          <span className="text-[10px] mt-0.5 leading-tight">{isBn ? 'মেসেজ' : 'Messages'}</span>
          {isMessages && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />}
        </button>

        {/* 5: Account */}
        <button
          id="mobile-nav-account-btn"
          onClick={() => handleNav('account')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer active:scale-90 select-none ${
            isAccount
              ? 'text-emerald-600 font-bold'
              : 'hover:text-slate-900 text-slate-500 font-medium'
          }`}
        >
          <UserIcon className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 leading-tight">{isBn ? 'অ্যাকাউন্ট' : 'Account'}</span>
          {isAccount && <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 mt-0.5" />}
        </button>

      </div>
    </nav>
  );
};
