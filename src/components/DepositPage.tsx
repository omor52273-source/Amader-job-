import React, { useState } from 'react';
import { 
  ArrowLeft, 
  Copy, 
  Check, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  DollarSign, 
  History, 
  Sparkles, 
  Info,
  Clock,
  ArrowDownLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { UserProfile, Language, Currency, WalletTransaction } from '../types';

interface DepositPageProps {
  user: UserProfile;
  language: Language;
  currency: Currency;
  darkMode: boolean;
  transactions: WalletTransaction[];
  onDepositSuccess: (amountBDT: number, method: string, trxId: string) => void;
  onTransferEarningsToDeposit?: (amountBDT: number) => void;
  onBack: () => void;
}

export const DepositPage: React.FC<DepositPageProps> = ({
  user,
  language,
  currency,
  darkMode,
  transactions,
  onDepositSuccess,
  onTransferEarningsToDeposit,
  onBack
}) => {
  const [method, setMethod] = useState<'bkash' | 'nagad'>('bkash');
  const [amountUSD, setAmountUSD] = useState('5');
  const [senderNumber, setSenderNumber] = useState('');
  const [trxId, setTrxId] = useState('');
  const [copiedNumber, setCopiedNumber] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isBn = language === 'bn';
  const USD_TO_BDT = 100.00;
  const OFFICIAL_PAYMENT_NUMBER = '01331119361';

  const handleCopy = (num: string) => {
    navigator.clipboard.writeText(num);
    setCopiedNumber(num);
    setTimeout(() => setCopiedNumber(null), 2000);
  };

  const parsedUSD = parseFloat(amountUSD) || 0;
  const calculatedBDT = parsedUSD * USD_TO_BDT;
  const quickAmounts = ['1', '2', '5', '10', '20', '50'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (parsedUSD < 1 || parsedUSD > 500) {
      setErrorMsg(isBn ? 'ডিপোজিটের পরিমাণ ন্যূনতম $১.০০ এবং সর্বোচ্চ $৫০০.০০ হতে হবে' : 'Deposit amount must be between $1.00 and $500.00');
      return;
    }
    if (!senderNumber.trim() || senderNumber.length < 10) {
      setErrorMsg(isBn ? 'সঠিক প্রেরক মোবাইল নম্বর লিখুন' : 'Please enter valid sender phone number');
      return;
    }
    if (!trxId.trim() || trxId.length < 6) {
      setErrorMsg(isBn ? 'সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন' : 'Please enter valid Transaction ID (TrxID)');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      onDepositSuccess(calculatedBDT, method, trxId.trim().toUpperCase());
      try {
        confetti({ particleCount: 80, spread: 60 });
      } catch (err) {}
      setSuccessMsg(
        isBn 
          ? `৳${calculatedBDT.toFixed(2)} (${method === 'bkash' ? 'বিকাশ' : 'নগদ'}) ডিপোজিট রিকোয়েস্ট সফলভাবে সম্পন্ন হয়েছে!` 
          : `Deposit of $${parsedUSD.toFixed(2)} (৳${calculatedBDT.toFixed(2)}) via ${method.toUpperCase()} submitted successfully!`
      );
      setTrxId('');
      setSenderNumber('');
    }, 700);
  };

  const depositTransactions = transactions.filter(t => t.type === 'deposit');

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
        <div className="flex items-center gap-2">
          <span className="text-xs px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold">
            Rate: $1.00 = ৳100 BDT
          </span>
        </div>
      </div>

      {/* Balance Summary Header Card */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className={`p-5 rounded-3xl border shadow-xs ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
              {isBn ? 'বর্তমান ডিপোজিট ব্যালেন্স' : 'Current Deposit Balance'}
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300">
              {isBn ? 'জব ক্যাম্পেইনের জন্য' : 'For Job Campaigns'}
            </span>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white">
              ৳ {(user.depositBalanceBDT ?? 0).toFixed(2)}
            </span>
            <span className="text-xs sm:text-sm font-bold text-slate-400">
              ($ {(user.depositBalanceUSD ?? 0).toFixed(2)})
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1">
            {isBn ? 'এই ব্যালেন্স দিয়ে আপনি নতুন মাইক্রো-জব ক্যাম্পেইন পোস্ট করতে পারবেন।' : 'Use this balance to post micro jobs and campaigns.'}
          </p>
        </div>

        <div className={`p-5 rounded-3xl border shadow-xs ${
          darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
        }`}>
          <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
            {isBn ? 'অফিসিয়াল লেনদেন নম্বর' : 'Official Payment Methods'}
          </span>
          <div className="mt-2 flex items-center gap-2">
            <span className="px-3 py-1 bg-pink-600 text-white rounded-lg font-black text-xs">
              bKash
            </span>
            <span className="px-3 py-1 bg-orange-600 text-white rounded-lg font-black text-xs">
              Nagad
            </span>
            <span className="text-xs font-bold text-slate-600 dark:text-slate-300 ml-1">
              {OFFICIAL_PAYMENT_NUMBER}
            </span>
          </div>
          <p className="text-[11px] text-slate-500 mt-1.5 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>{isBn ? 'সেন্ড মানি করার পর ১-৫ মিনিটের মধ্যে ব্যালেন্স যুক্ত হয়' : 'Automatic verification with 24/7 instant crediting'}</span>
          </p>
        </div>
      </div>

      {/* Main Deposit Form Card */}
      <div className={`rounded-3xl border shadow-md overflow-hidden ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        
        {/* Method Switch Tabs */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-3">
            {isBn ? '১. পেমেন্ট মেথড বেছে নিন' : '1. Select Payment Method'}
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
                  Personal (Send Money)
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
                  Personal (Send Money)
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Step 2: Number Box & Instructions */}
        <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white mb-3">
            {isBn ? '২. টাকা পাঠানোর নিয়মাবলী' : '2. How to Send Money'}
          </h2>
          <div className={`p-4 rounded-2xl border ${
            method === 'bkash' 
              ? 'bg-pink-50/70 dark:bg-pink-950/30 border-pink-200 dark:border-pink-900/50' 
              : 'bg-orange-50/70 dark:bg-orange-950/30 border-orange-200 dark:border-orange-900/50'
          }`}>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">
                  {method === 'bkash' ? 'বিকাশ পার্সোনাল নম্বর (Send Money):' : 'নগদ পার্সোনাল নম্বর (Send Money):'}
                </span>
                <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white tracking-wider mt-0.5 font-mono">
                  {OFFICIAL_PAYMENT_NUMBER}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(OFFICIAL_PAYMENT_NUMBER)}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer text-white shadow-xs ${
                  method === 'bkash' ? 'bg-pink-600 hover:bg-pink-700' : 'bg-orange-600 hover:bg-orange-700'
                }`}
              >
                {copiedNumber === OFFICIAL_PAYMENT_NUMBER ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>{isBn ? 'কপি হয়েছে!' : 'Copied!'}</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>{isBn ? 'নম্বর কপি করুন' : 'Copy Number'}</span>
                  </>
                )}
              </button>
            </div>

            <ol className="mt-4 space-y-1.5 text-xs text-slate-700 dark:text-slate-300 list-decimal list-inside">
              <li>
                {isBn 
                  ? `আপনার ${method === 'bkash' ? 'বিকাশ' : 'নগদ'} অ্যাপে প্রবেশ করে "Send Money" (সেন্ড মানি) অপশনে যান।` 
                  : `Open your ${method.toUpperCase()} app and select "Send Money".`}
              </li>
              <li>
                {isBn 
                  ? `প্রাপক নম্বর হিসেবে ${OFFICIAL_PAYMENT_NUMBER} দিন এবং কাঙ্ক্ষিত পরিমাণ পাঠান।` 
                  : `Enter recipient number ${OFFICIAL_PAYMENT_NUMBER} and send your desired amount.`}
              </li>
              <li>
                {isBn 
                  ? `লেনদেন সফল হলে ফিরতি মেসেজ থেকে Transaction ID (TrxID) কপি করে নিচের ফর্মে বসান।` 
                  : `After sending, copy the Transaction ID (TrxID) and submit the form below.`}
              </li>
            </ol>
          </div>
        </div>

        {/* Step 3: Form Inputs */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
          <h2 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white">
            {isBn ? '৩. ডিপোজিট তথ্য জমা দিন' : '3. Submit Deposit Confirmation'}
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

          {/* Amount Selector */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isBn ? 'ডিপোজিটের পরিমাণ (USD):' : 'Deposit Amount (USD):'}
            </label>

            <div className="flex flex-wrap gap-2">
              {quickAmounts.map(val => (
                <button
                  type="button"
                  key={val}
                  onClick={() => setAmountUSD(val)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                    amountUSD === val
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200'
                  }`}
                >
                  ${val} (৳{parseFloat(val) * USD_TO_BDT})
                </button>
              ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 font-bold text-xs">$</span>
                <input
                  type="number"
                  min="1"
                  max="500"
                  step="0.5"
                  value={amountUSD}
                  onChange={(e) => setAmountUSD(e.target.value)}
                  className={`w-full pl-8 pr-4 py-2.5 rounded-xl border text-xs sm:text-sm font-bold outline-hidden ${
                    darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
                  }`}
                  placeholder="Amount in USD"
                />
              </div>

              <div className="p-2.5 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center justify-between text-xs">
                <span className="text-slate-500 dark:text-slate-400 font-medium">
                  {isBn ? 'সমপরিমাণ টাকা:' : 'Equivalent BDT:'}
                </span>
                <span className="font-extrabold text-sm text-emerald-600 dark:text-emerald-400">
                  ৳ {calculatedBDT.toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Sender Phone Number */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isBn 
                ? `আপনার প্রেরক নম্বর (${method === 'bkash' ? 'বিকাশ' : 'নগদ'} মোবাইল নম্বর):` 
                : `Sender ${method.toUpperCase()} Mobile Number:`}
            </label>
            <input
              type="tel"
              required
              value={senderNumber}
              onChange={(e) => setSenderNumber(e.target.value)}
              placeholder="017XXXXXXXX"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm outline-hidden ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Transaction ID */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
              {isBn ? 'ট্রানজেকশন আইডি (TrxID):' : 'Transaction ID (TrxID):'}
            </label>
            <input
              type="text"
              required
              value={trxId}
              onChange={(e) => setTrxId(e.target.value.toUpperCase())}
              placeholder="e.g. 9J8K7L6M5N"
              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs sm:text-sm uppercase font-mono font-bold outline-hidden ${
                darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className={`w-full py-3 px-4 text-white font-extrabold text-sm rounded-xl shadow-lg transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 mt-4 ${
              method === 'bkash' 
                ? 'bg-pink-600 hover:bg-pink-700 shadow-pink-600/30' 
                : 'bg-orange-600 hover:bg-orange-700 shadow-orange-600/30'
            }`}
          >
            {isSubmitting ? (
              <span>{isBn ? 'যাচাই করা হচ্ছে...' : 'Processing Deposit...'}</span>
            ) : (
              <>
                <ArrowDownLeft className="w-4 h-4" />
                <span>
                  {isBn 
                    ? `৳${calculatedBDT.toFixed(2)} ডিপোজিট সম্পন্ন করুন` 
                    : `Submit $${parsedUSD.toFixed(2)} Deposit`}
                </span>
              </>
            )}
          </button>
        </form>
      </div>

      {/* Recent Deposit History */}
      <div className={`p-5 rounded-3xl border ${
        darkMode ? 'bg-slate-900 border-slate-800' : 'bg-white border-slate-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-emerald-600" />
            <h3 className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white">
              {isBn ? 'সাম্প্রতিক ডিপোজিট হিস্ট্রি' : 'Recent Deposit History'}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">
            {depositTransactions.length} {isBn ? 'টি রেকর্ড' : 'records'}
          </span>
        </div>

        {depositTransactions.length === 0 ? (
          <p className="text-center py-6 text-xs text-slate-400">
            {isBn ? 'এখনও কোনো ডিপোজিট করা হয়নি।' : 'No deposit transactions yet.'}
          </p>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {depositTransactions.slice(0, 5).map(trx => (
              <div key={trx.id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <span className="font-bold text-slate-800 dark:text-slate-200 block">
                    {isBn ? trx.titleBn : trx.title}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {trx.trxId ? `TrxID: ${trx.trxId} • ` : ''}{new Date(trx.timestamp).toLocaleDateString()}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-extrabold text-emerald-600 dark:text-emerald-400 text-sm block">
                    + ৳{(trx.amountBDT ?? 0).toFixed(2)}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300">
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
