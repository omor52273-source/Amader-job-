import React, { useState } from 'react';
import { X, Users, Copy, Check, Gift, Share2, Sparkles } from 'lucide-react';
import { UserProfile, Language } from '../types';
import { getReferralUrl } from '../lib/appConfig';

interface ReferralModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  language: Language;
  darkMode: boolean;
}

export const ReferralModal: React.FC<ReferralModalProps> = ({
  isOpen,
  onClose,
  user,
  language,
  darkMode
}) => {
  const isBn = language === 'bn';
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const referralCode = user.referralCode || 'AJ7892';
  const referralLink = getReferralUrl(referralCode);

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className={`w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden p-6 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-black text-base">
              {isBn ? 'রেফারেল প্রোগ্রাম ও বোনাস' : 'Referral & Bonus Program'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 pt-4 text-xs text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-inner">
            <Users className="w-8 h-8" />
          </div>

          <div>
            <h4 className="font-black text-base text-slate-900 dark:text-white">
              {isBn ? 'প্রতি রেফারে ১০% আজীবন কমিশন!' : 'Earn 10% Lifetime Commission!'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              {isBn 
                ? 'আপনার রেফারেল লিংক দিয়ে বন্ধুবান্ধব যুক্ত হলে তাদের প্রতিটি সম্পন্ন কাজের পারিশ্রমিক থেকে বোনাস পাবেন।' 
                : 'Invite friends and earn 10% bonus on every completed task they deliver.'}
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 space-y-2 text-left">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              {isBn ? 'আপনার রেফারেল লিংক:' : 'Your Unique Referral Link:'}
            </span>
            <div className="flex items-center gap-2">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="flex-1 bg-white dark:bg-slate-900 px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 font-mono text-xs outline-hidden select-all"
              />
              <button
                onClick={handleCopy}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold flex items-center gap-1 cursor-pointer transition shadow-xs"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? (isBn ? 'কপি!' : 'Copied') : (isBn ? 'কপি' : 'Copy')}</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 pt-1 text-center">
            <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800">
              <span className="text-xl font-black text-emerald-600 dark:text-emerald-400 block">{user.referralCount || 4}</span>
              <span className="text-[11px] text-slate-500 font-semibold">{isBn ? 'মোট রেফারেল' : 'Total Referred'}</span>
            </div>
            <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800">
              <span className="text-xl font-black text-blue-600 dark:text-blue-400 block">${(user.referralEarningsUSD || 0.85).toFixed(2)}</span>
              <span className="text-[11px] text-slate-500 font-semibold">{isBn ? 'রেফারেল আয়' : 'Referral Earnings'}</span>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex justify-end mt-4">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-xs cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
