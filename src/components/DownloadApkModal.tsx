import React from 'react';
import { X, Smartphone, Download, ShieldCheck, CheckCircle2, QrCode } from 'lucide-react';
import { Language } from '../types';

interface DownloadApkModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  darkMode: boolean;
}

export const DownloadApkModal: React.FC<DownloadApkModalProps> = ({
  isOpen,
  onClose,
  language,
  darkMode
}) => {
  const isBn = language === 'bn';
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className={`w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden p-6 text-center space-y-4 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <Smartphone className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-extrabold text-sm sm:text-base">
              {isBn ? 'অ্যান্ড্রয়েড অ্যাপ ডাউনলোড' : 'Download Android App (APK)'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="w-16 h-16 rounded-3xl bg-emerald-600 text-white flex items-center justify-center mx-auto shadow-lg shadow-emerald-600/30">
          <Smartphone className="w-9 h-9" />
        </div>

        <div>
          <h4 className="font-black text-lg text-slate-900 dark:text-white">
            Amader Job Online APK v2.4.1
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {isBn 
              ? 'মোবাইল থেকে সহজে টাস্ক করতে ও ইনস্ট্যান্ট নোটিফিকেশন পেতে অ্যাপটি ডাউনলোড করুন।' 
              : 'Complete micro tasks seamlessly on mobile with instant push notifications.'}
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-left text-xs space-y-2">
          <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-bold">
            <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>Google Play Protect Verified & Safe</span>
          </div>
          <p className="text-slate-500 dark:text-slate-400 text-[11px]">
            Size: 8.4 MB • Android 7.0+ • Instant mobile cashout support
          </p>
        </div>

        <div className="pt-2 space-y-2">
          <a
            href="#download"
            onClick={(e) => {
              e.preventDefault();
              alert(isBn ? 'অ্যাপ ডাউনলোড শুরু হচ্ছে...' : 'Starting download of AmaderJobOnline.apk...');
              onClose();
            }}
            className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 cursor-pointer transition"
          >
            <Download className="w-4 h-4" />
            <span>{isBn ? 'ডাউনলোড করুন (৮.৪ মেগাবাইট)' : 'Download APK Now (8.4 MB)'}</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-xs font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
          >
            {isBn ? 'পরে করব' : 'Maybe Later'}
          </button>
        </div>
      </div>
    </div>
  );
};
