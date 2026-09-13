import React, { useState } from 'react';
import { 
  X, 
  Bell, 
  CheckCircle2, 
  Clock, 
  DollarSign, 
  Briefcase, 
  Trash2, 
  Sparkles, 
  Wallet, 
  Check, 
  AlertCircle,
  Inbox
} from 'lucide-react';
import { NotificationItem, Language } from '../types';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: NotificationItem[];
  onMarkAllRead: () => void;
  onMarkSingleRead?: (id: string) => void;
  onClearAll?: () => void;
  language: Language;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAllRead,
  onMarkSingleRead,
  onClearAll,
  language
}) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'earnings' | 'deposit' | 'system'>('all');
  const isBn = language === 'bn';

  if (!isOpen) return null;

  const safeNotifications = notifications || [];
  const unreadCount = safeNotifications.filter(n => !n.isRead).length;

  const filteredNotifications = safeNotifications.filter(n => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'earnings') return n.type === 'submission_approved' || n.type === 'daily_bonus' || n.type === 'referral_bonus';
    if (activeFilter === 'deposit') return n.type === 'deposit_success' || n.type === 'withdrawal_processed';
    if (activeFilter === 'system') return n.type === 'system' || n.type === 'boost_activated' || n.type === 'submission_rejected';
    return true;
  });

  const getNotificationIcon = (type?: string) => {
    switch (type) {
      case 'deposit_success':
      case 'withdrawal_processed':
        return (
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Wallet className="w-4 h-4" />
          </div>
        );
      case 'submission_approved':
      case 'daily_bonus':
      case 'referral_bonus':
        return (
          <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <DollarSign className="w-4 h-4" />
          </div>
        );
      case 'boost_activated':
        return (
          <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Sparkles className="w-4 h-4" />
          </div>
        );
      case 'submission_rejected':
        return (
          <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertCircle className="w-4 h-4" />
          </div>
        );
      default:
        return (
          <div className="w-9 h-9 rounded-xl bg-slate-100 text-slate-600 flex items-center justify-center shrink-0">
            <Bell className="w-4 h-4" />
          </div>
        );
    }
  };

  const formatRelativeTime = (timestamp: string) => {
    const diffMs = Date.now() - new Date(timestamp).getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    if (diffMins < 1) return isBn ? 'এইমাত্র' : 'Just now';
    if (diffMins < 60) return isBn ? `${diffMins} মিনিট আগে` : `${diffMins}m ago`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return isBn ? `${diffHours} ঘণ্টা আগে` : `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    return isBn ? `${diffDays} দিন আগে` : `${diffDays}d ago`;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 bg-white text-slate-900 overflow-hidden flex flex-col max-h-[85vh]">
        
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg">
                  {isBn ? 'বিজ্ঞপ্তি ও নোটিফিকেশন' : 'Notifications'}
                </h3>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500 text-white text-[10px] font-black">
                    {unreadCount} {isBn ? 'নতুন' : 'new'}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-slate-400">
                {isBn ? 'আপনার সকল অ্যাকাউন্টের গুরুত্বপূর্ণ আপডেট' : 'Account and task updates'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={onClose}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Filter Pills & Action Buttons Bar */}
        <div className="px-4 py-2.5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-2 bg-white">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setActiveFilter('all')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {isBn ? 'সকল' : 'All'}
            </button>
            <button
              onClick={() => setActiveFilter('earnings')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'earnings'
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {isBn ? 'উপার্জন' : 'Earnings'}
            </button>
            <button
              onClick={() => setActiveFilter('deposit')}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                activeFilter === 'deposit'
                  ? 'bg-blue-600 text-white'
                  : 'text-slate-500 hover:bg-slate-100'
              }`}
            >
              {isBn ? 'পেমেন্ট' : 'Payments'}
            </button>
          </div>

          <div className="flex items-center gap-2">
            {unreadCount > 0 && (
              <button
                onClick={onMarkAllRead}
                className="text-xs text-emerald-600 font-extrabold hover:underline cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3.5 h-3.5" />
                <span>{isBn ? 'সব পঠিত করুন' : 'Mark all read'}</span>
              </button>
            )}
            {onClearAll && notifications.length > 0 && (
              <button
                onClick={onClearAll}
                className="text-xs text-slate-400 hover:text-rose-600 font-bold transition cursor-pointer"
              >
                {isBn ? 'মুছুন' : 'Clear'}
              </button>
            )}
          </div>
        </div>

        {/* Notifications Scroll Area */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2 sm:p-3 space-y-1">
          {filteredNotifications.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <div className="w-12 h-12 mx-auto rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-slate-700">
                {isBn ? 'কোনো নোটিফিকেশন নেই' : 'No notifications'}
              </p>
              <p className="text-xs text-slate-400">
                {isBn ? 'নতুন কোনো আপডেট এলে এখানে দেখতে পাবেন।' : 'New updates will appear here.'}
              </p>
            </div>
          ) : (
            filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => onMarkSingleRead && onMarkSingleRead(n.id)}
                className={`p-3.5 rounded-2xl transition flex items-start gap-3 cursor-pointer ${
                  !n.isRead
                    ? 'bg-emerald-50/60 border border-emerald-200/80 hover:bg-emerald-50'
                    : 'bg-white hover:bg-slate-50 border border-transparent'
                }`}
              >
                {getNotificationIcon(n.type)}
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 leading-snug">
                      {isBn ? n.titleBn : n.title}
                    </h4>
                    <span className="text-[10px] font-medium text-slate-400 shrink-0">
                      {formatRelativeTime(n.timestamp)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                    {isBn ? n.messageBn : n.message}
                  </p>
                </div>

                {!n.isRead && (
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shrink-0 mt-1.5" title="Unread" />
                )}
              </div>
            ))
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between">
          <span className="text-[11px] text-slate-400 font-semibold">
            {notifications.length} {isBn ? 'টি নোটিফিকেশন' : 'total'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold cursor-pointer transition shadow-xs"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
};
