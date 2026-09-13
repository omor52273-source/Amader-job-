import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Wallet, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ShieldAlert, 
  History, 
  Clock, 
  Info,
  ArrowUpRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Language, Currency, WalletTransaction } from '../types';

interface WithdrawPageProps {
  user: UserProfile;
  language: Language;
  currency: Currency;
  darkMode: boolean;
  transactions: WalletTransaction[];
  onWithdrawSuccess: (amountBDT: number, method: string, accountNo: string) => void;
  onOpenKyc: () => void;
  onBack: () => void;
}

export const WithdrawPage: React.FC<WithdrawPageProps> = ({
  user,
  language,
  currency,
  darkMode,
  transactions,
  onWithdrawSuccess,
  onOpenKyc,
  onBack
}) => {
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [amountBDT, setAmountBDT] = useState('100');
  const [accountNumber, setAccountNumber] = useState(user.phone || '');
  const [accountType, setAccountType] = useState<'personal' | 'agent'>('personal');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBn = language === 'bn';
  const MIN_WITHDRAW_BDT = 100.00;
  const OPERATOR_FEE_PCT = 0.015; // 1.5%

  const parsedBDT = parseFloat(amountBDT) || 0;
  const feeBDT = Math.round(parsedBDT * OPERATOR_FEE_PCT * 100) / 100;
  const receivableBDT = Math.max(0, parsedBDT - feeBDT);
  const receivableUSD = receivableBDT / 100;

  const quickAmounts = ['100', '200', '500', '1000', '2000'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (parsedBDT < MIN_WITHDRAW_BDT) {
      setErrorMsg(isBn ? `ন্যূনতম উত্তোলনের পরিমাণ ৳${MIN_WITHDRAW_BDT} টাকা` : `Minimum withdrawal amount is ৳${MIN_WITHDRAW_BDT} BDT`);
      return;
    }

    if (parsedBDT > user.earningBalanceBDT) {
      setErrorMsg(
        isBn 
          ? `অপর্যাপ্ত উপার্জন ব্যালেন্স! আপনার আর্নিং ব্যালেন্স ৳${user.earningBalanceBDT.toFixed(2)}` 
          : `Insufficient earnings! Your balance is ৳${user.earningBalanceBDT.toFixed(2)}`
      );
      return;
    }

    if (!accountNumber.trim() || accountNumber.length < 11) {
      setErrorMsg(isBn ? 'সঠিক ১১ ডিজিটের মোবাইল ব্যাংকিং নম্বর লিখুন' : 'Please enter valid 11-digit mobile number');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onWithdrawSuccess(parsedBDT, method, accountNumber.trim());
      try {
        confetti({ particleCount: 70, spread: 60 });
      } catch (err) {}
      setSuccessMsg(
        isBn 
          ? `৳${parsedBDT} (${method === 'bkash' ? 'বিকাশ' : 'নগদ'}) উইথড্রয়াল রিকোয়েস্ট সফলভাবে গৃহীত হয়েছে! ১৫-৪৫ মিনিটের মধ্যে টাকা পাবেন।` 
          : `Withdrawal request for ৳${parsedBDT} via ${method.toUpperCase()} submitted! Processing in 15-45 mins.`
      );
    }, 700);
  };

  const withdrawTransactions = transactions.filter(t => t.type === 'withdrawal');

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-12">
      
      {/* Top Header & Breadcrumb */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{isBn ? 'ড্যাশবোর্ডে ফিরুন' : 'Back to Dashboard'}</span>
        </button>
        <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
          {isBn ? 'মিনিমাম ক্যাশআউট: ১০০ টাকা' : 'Min Cashout: ৳100 BDT'}
        </span>
      </div>

      {/* Balance Summary Header Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-5 rounded-3xl border shadow-xs ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isBn ? 'উত্তোলনযোগ্য আর্নিং ব্যালেন্স' : 'Withdrawable Earning Balance'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {isBn ? 'ফ্রিল্যান্সার ইনকাম' : 'Worker Earnings'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-emerald-600 dark:text-emerald-400">
              ৳ {user.earningBalanceBDT.toFixed(2)}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">
              ($ {user.earningBalanceUSD.toFixed(2)})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isBn ? 'টাস্ক সম্পন্ন করে অর্জিত পারিশ্রমিক সরাসরি ক্যাশআউট করুন।' : 'Directly withdraw micro-task payouts to your wallet.'}
          </p>
        </div>

        {/* KYC Card status */}
        <div className={`p-5 rounded-3xl border shadow-xs flex items-center justify-between ${
          user.isVerified 
            ? (darkMode ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-emerald-50/60 border-emerald-200')
            : (darkMode ? 'bg-amber-950/20 border-amber-800/50' : 'bg-amber-50/60 border-amber-200')
        }`}>
          <div className="space-y-1">
            <div className="flex items-center gap-1.5">
              {user.isVerified ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600" />
              )}
              <span className="text-sm font-extrabold text-slate-900 dark:text-white">
                {user.isVerified ? (isBn ? 'কেওয়াইসি ভেরিফাইড' : 'KYC Verified') : (isBn ? 'কেওয়াইসি অসম্পূর্ণ' : 'KYC Pending')}
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {user.isVerified 
                ? (isBn ? 'আপনার প্রোফাইল ইনস্ট্যান্ট উইথড্রয়ালের জন্য অনুমোদিত।' : 'Instant withdrawal limit unlocked.')
                : (isBn ? 'বড় অংকের উত্তোলনের জন্য আইডি যাচাই সম্পূর্ণ করুন।' : 'Verify NID/Passport for faster processing.')}
            </p>
          </div>
          {!user.isVerified && (
            <button
              onClick={onOpenKyc}
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition shrink-0 cursor-pointer"
            >
              {isBn ? 'ভেরিফাই' : 'Verify'}
            </button>
          )}
        </div>
      </div>

      {/* Main Withdrawal Form Card */}
      <div className={`rounded-3xl border shadow-md overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* Method Switch Tabs */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-3">
            {isBn ? '১. উত্তোলনের মাধ্যম নির্বাচন' : '1. Choose Payout Channel'}
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {/* bKash */}
            <button
              type="button"
              onClick={() => setMethod('bkash')}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start gap-3 transition cursor-pointer text-left ${
                method === 'bkash'
                  ? 'bg-pink-50 dark:bg-pink-950/40 border-pink-500 ring-2 ring-pink-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-pink-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-pink-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                bK
              </div>
              <div className="text-center sm:text-left">
                <span className="font-extrabold text-sm text-pink-600 dark:text-pink-400 block">
                  bKash (বিকাশ)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Instant Mobile Payout
                </span>
              </div>
            </button>

            {/* Nagad */}
            <button
              type="button"
              onClick={() => setMethod('nagad')}
              className={`p-4 rounded-2xl border flex flex-col sm:flex-row items-center sm:items-start gap-3 transition cursor-pointer text-left ${
                method === 'nagad'
                  ? 'bg-orange-50 dark:bg-orange-950/40 border-orange-500 ring-2 ring-orange-500/20 shadow-xs'
                  : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-orange-300'
              }`}
            >
              <div className="w-10 h-10 rounded-xl bg-orange-600 text-white flex items-center justify-center font-black text-sm shrink-0 shadow-sm">
                NG
              </div>
              <div className="text-center sm:text-left">
                <span className="font-extrabold text-sm text-orange-600 dark:text-orange-400 block">
                  Nagad (নগদ)
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block mt-0.5">
                  Instant Mobile Payout
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Form Inputs */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {isBn ? '২. উত্তোলনের পরিমাণ ও একাউন্ট নম্বর' : '2. Withdrawal Amount & Details'}
          </h2>

          {errorMsg && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900 rounded-xl text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-900 rounded-xl text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          {/* Quick Amounts */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isBn ? 'টাকার পরিমাণ (BDT):' : 'Amount in BDT (৳):'}
            </label>

            <div className="flex flex-wrap gap-2">
              {quickAmounts.map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmountBDT(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    amountBDT === val
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  ৳{val}
                </button>
              ))}
            </div>

            <div className="relative pt-1">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-sm">৳</span>
              <input
                type="number"
                min="100"
                step="10"
                value={amountBDT}
                onChange={(e) => setAmountBDT(e.target.value)}
                className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold outline-hidden ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
                placeholder="Amount in BDT"
              />
            </div>
          </div>

          {/* Account Type */}
          <div className="grid grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={() => setAccountType('personal')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                accountType === 'personal'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              Personal Account
            </button>
            <button
              type="button"
              onClick={() => setAccountType('agent')}
              className={`p-2.5 rounded-xl border text-xs font-bold transition cursor-pointer ${
                accountType === 'agent'
                  ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500 text-emerald-700 dark:text-emerald-300'
                  : 'bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600'
              }`}
            >
              Agent Account
            </button>
          </div>

          {/* Mobile Account Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isBn 
                ? `প্রাপক ${method === 'bkash' ? 'বিকাশ' : 'নগদ'} একাউন্ট নম্বর:` 
                : `Receiving ${method.toUpperCase()} Account Number:`}
            </label>
            <input
              type="tel"
              required
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="01XXXXXXXXX"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm font-mono font-bold outline-hidden ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Fee & Net Breakdown */}
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-2 text-xs">
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{isBn ? 'উত্তোলনের আবেদন:' : 'Gross Amount:'}</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">৳{parsedBDT.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-slate-500 dark:text-slate-400">
              <span>{isBn ? 'অপারেটর ফি (১.৫%):' : 'Operator Fee (1.5%):'}</span>
              <span className="font-bold text-rose-500">- ৳{feeBDT.toFixed(2)}</span>
            </div>
            <div className="border-t border-slate-200 dark:border-slate-700 pt-2 flex justify-between items-center text-sm font-black">
              <span className="text-slate-900 dark:text-white">{isBn ? 'আপনি পাবেন:' : 'Net Payout:'}</span>
              <span className="text-emerald-600 dark:text-emerald-400 text-base">
                ৳{receivableBDT.toFixed(2)} <span className="text-xs font-normal text-slate-400">($ {receivableUSD.toFixed(2)})</span>
              </span>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3.5 px-4 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 ${
              method === 'bkash' 
                ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/30' 
                : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
            }`}
          >
            {isSubmitting ? (
              <span>{isBn ? 'অনুরোধ পাঠানো হচ্ছে...' : 'Processing Request...'}</span>
            ) : (
              <>
                <ArrowUpRight className="w-4 h-4" />
                <span>
                  {isBn 
                    ? `৳${receivableBDT.toFixed(2)} ক্যাশআউট রিকোয়েস্ট পাঠান` 
                    : `Submit ৳${receivableBDT.toFixed(2)} Cashout Request`}
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Recent Withdrawals History */}
      <div className={`p-5 rounded-3xl border ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {isBn ? 'উইথড্রয়াল রেকর্ডসমূহ' : 'Withdrawal History'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">
            {withdrawTransactions.length} {isBn ? 'টি রেকর্ড' : 'records'}
          </span>
        </div>

        {withdrawTransactions.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">
            {isBn ? 'এখনও কোনো উইথড্রয়াল রেকর্ড নেই।' : 'No withdrawal records yet.'}
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {withdrawTransactions.slice(0, 5).map(trx => (
              <div key={trx.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {isBn ? trx.titleBn : trx.title}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {new Date(trx.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-rose-600 dark:text-rose-400 text-sm block">
                    - ৳{trx.amountBDT.toFixed(2)}
                  </span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    trx.status === 'completed' 
                      ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                      : 'bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300'
                  }`}>
                    {trx.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
