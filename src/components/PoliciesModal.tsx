import React from 'react';
import { X, ShieldCheck, FileText, Scale, AlertOctagon, HelpCircle, ArrowUpRight } from 'lucide-react';
import { Language } from '../types';

export type PolicyType = 
  | 'contact'
  | 'payment'
  | 'refund'
  | 'escrow'
  | 'withdrawal'
  | 'terms'
  | 'privacy'
  | 'disclaimer'
  | 'kyc'
  | 'prohibited';

interface PoliciesModalProps {
  policyType: PolicyType | null;
  onClose: () => void;
  language: Language;
  darkMode: boolean;
}

export const PoliciesModal: React.FC<PoliciesModalProps> = ({
  policyType,
  onClose,
  language,
  darkMode
}) => {
  const isBn = language === 'bn';
  if (!policyType) return null;

  const getPolicyContent = () => {
    switch (policyType) {
      case 'contact':
        return {
          title: isBn ? 'অফিসিয়াল সাপোর্ট (হোয়াটসঅ্যাপ)' : 'Official Support (WhatsApp Only)',
          content: isBn ? (
            <div className="space-y-4">
              <p>আমাদের অফিসিয়াল কাস্টমার সাপোর্ট বর্তমানে শুধুমাত্র হোয়াটসঅ্যাপের মাধ্যমে ২৪ ঘণ্টা সরাসরি পরিচালিত হয়।</p>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 text-xs">
                <p className="flex items-center gap-2">
                  <strong>সরাসরি হোয়াটসঅ্যাপ:</strong>
                  <a href="https://wa.me/8801331119361" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-bold underline">
                    +8801331119361
                  </a>
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  (ইমেইল বা টেলিগ্রাম সাপোর্ট বন্ধ আছে। যেকোনো তথ্যের জন্য সরাসরি হোয়াটসঅ্যাপে মেসেজ দিন)
                </p>
                <a
                  href="https://wa.me/8801331119361"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition mt-2 cursor-pointer"
                >
                  <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p>Our official support is exclusively available via WhatsApp 24/7 for instant assistance with tasks, deposits, and payouts.</p>
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 space-y-3 text-xs">
                <p className="flex items-center gap-2">
                  <strong>Official WhatsApp Support:</strong>
                  <a href="https://wa.me/8801331119361" target="_blank" rel="noopener noreferrer" className="text-emerald-600 dark:text-emerald-400 font-bold underline">
                    +8801331119361
                  </a>
                </p>
                <p className="text-slate-500 dark:text-slate-400">
                  (Email support has been retired. Please use WhatsApp for all inquiries.)
                </p>
                <a
                  href="https://wa.me/8801331119361"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition mt-2 cursor-pointer"
                >
                  <span>Chat on WhatsApp</span>
                  <ArrowUpRight className="w-4 h-4" />
                </a>
              </div>
            </div>
          )
        };
      case 'payment':
        return {
          title: isBn ? 'পেমেন্ট পলিসি (Payment Policies)' : 'Payment Policies',
          content: isBn ? (
            <div className="space-y-3">
              <p>১. <strong>অনুমোদিত মাধ্যম:</strong> বিকাশ (bKash), নগদ (Nagad) এবং বাইন্যান্স ইউএসডিটি (USDT TRC20/BEP20)।</p>
              <p>২. <strong>ডিপোজিট প্রসেসিং:</strong> ট্রানজেকশন আইডি (TrxID) সাবমিট করার ১ থেকে ৫ মিনিটের মধ্যে স্বয়ংক্রিয়ভাবে ব্যালেন্সে যোগ হয়।</p>
              <p>৩. <strong>মুদ্রা হার:</strong> $১.০০ USD = ১০০.০০ BDT (টাকা)।</p>
              <p>৪. <strong>ক্যাম্পেইন এসক্রো:</strong> পোস্ট করা কাজের সমস্ত পারিশ্রমিক এসক্রো অ্যাকাউন্টে নিরাপদে সংরক্ষিত থাকে।</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>1. <strong>Accepted Methods:</strong> bKash, Nagad, and Binance USDT.</p>
              <p>2. <strong>Deposit Speed:</strong> Funds are automatically credited within 1-15 minutes of TrxID confirmation.</p>
              <p>3. <strong>Currency Conversion:</strong> Fixed rate of $1.00 USD = 100.00 BDT for all operations.</p>
              <p>4. <strong>Campaign Budget:</strong> Total cost of jobs posted is securely placed into Escrow until workers fulfill tasks.</p>
            </div>
          )
        };
      case 'refund':
        return {
          title: isBn ? 'রিফান্ড পলিসি (Refund Policy)' : 'Refund Policy',
          content: isBn ? (
            <div className="space-y-3">
              <p>১. ক্যাম্পেইনে কোনো অবিক্রীত বা অবশিষ্ট স্লট থাকলে বায়ার যেকোনো সময় ক্যাম্পেইন বাতিল বা পজ করে টাকা ফেরত নিতে পারেন।</p>
              <p>২. ভুল ট্রানজেকশন বা ডাবল ডিপোজিট ২৪ ঘণ্টার মধ্যে হোয়াটসঅ্যাপ সাপোর্টে যাচাইয়ের মাধ্যমে সমাধান করা হয়।</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>1. Whenever an employer pauses or deletes a campaign, all remaining unfulfilled slot budgets are instantly returned to their Deposit balance.</p>
              <p>2. Accidental double deposits are eligible for refund upon dispute verification within 24 hours.</p>
            </div>
          )
        };
      case 'escrow':
        return {
          title: isBn ? 'এসক্রো পলিসি (Escrow Policy)' : 'Escrow Policy',
          content: isBn ? (
            <div className="space-y-3">
              <p>১. <strong>নিরাপদ এসক্রো:</strong> ফ্রিল্যান্সারদের কাজের নিরাপত্তার স্বার্থে বায়ারের পুরো বাজেট সিস্টেমের এসক্রোতে লক করা হয়।</p>
              <p>২. বায়ার প্রুফ অ্যাপ্রুভ করলে সাথে সাথেই কর্মীর ব্যালেন্সে টাকা যুক্ত হয়।</p>
              <p>৩. বায়ার যদি ৭২ ঘণ্টার মধ্যে প্রুফ রিভিউ না করেন, সিস্টেম স্বয়ংক্রিয়ভাবে প্রুফ অ্যাপ্রুভ করে কর্মীর একাউন্টে টাকা যোগ করে দেয়।</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>1. <strong>Automated Escrow:</strong> 100% of worker payouts are locked in automated smart escrow the moment a job goes live.</p>
              <p>2. Funds are released immediately when the employer approves genuine proofs.</p>
              <p>3. If an employer remains inactive for 72 hours, the platform auto-approves compliant proofs to ensure workers are paid fairly.</p>
            </div>
          )
        };
      case 'withdrawal':
        return {
          title: isBn ? 'উইথড্রয়াল পলিসি (Withdrawal Policy)' : 'Withdrawal Policy',
          content: isBn ? (
            <div className="space-y-3">
              <p>১. <strong>সর্বনিম্ন উত্তোলনের পরিমাণ:</strong> ১০০ টাকা ($১.০০ USD)।</p>
              <p>২. <strong>গেটওয়ে ফি:</strong> মোবাইল ব্যাংকিং অপারেটর চার্জ বাবদ ১.৫% কর্তন প্রযোজ্য।</p>
              <p>৩. <strong>প্রসেসিং সময়:</strong> সাধারণত ১৫ থেকে ৪৫ মিনিটের মধ্যে ক্যাশআউট সম্পন্ন হয়।</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>1. <strong>Minimum Payout:</strong> 100 BDT (~$1.00 USD).</p>
              <p>2. <strong>Withdrawal Fees:</strong> Standard mobile banking operator fee of 1.5% applies.</p>
              <p>3. <strong>Speed:</strong> Payouts are reviewed and dispatched within 15 to 45 minutes.</p>
            </div>
          )
        };
      case 'terms':
        return {
          title: isBn ? 'ব্যবহারের শর্তাবলি (Terms of Service)' : 'Terms of Service',
          content: isBn ? (
            <div className="space-y-3">
              <p>১. <strong>এক ব্যক্তি এক অ্যাকাউন্ট:</strong> একজনের একাধিক অ্যাকাউন্ট তৈরি করা সম্পূর্ণ নিষিদ্ধ।</p>
              <p>২. ভিপিএন (VPN), প্রক্সি বা অটোমেটেড বটের ব্যবহার আইডি সম্পূর্ণ নিষিদ্ধ করবে।</p>
              <p>৩. আসল প্রুফ এবং নির্দেশনা অনুযায়ী সঠিক কাজ জমা দেওয়া বাধ্যতামূলক।</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>1. <strong>Single Account Rule:</strong> Strictly one active account per individual user and device.</p>
              <p>2. <strong>Fair Play:</strong> Use of bots, auto-clickers, proxy servers or multiple accounts results in immediate suspension.</p>
            </div>
          )
        };
      case 'privacy':
        return {
          title: isBn ? 'প্রাইভেসি পলিসি (Privacy Policy)' : 'Privacy Policy',
          content: isBn ? (
            <div className="space-y-3">
              <p>১. আপনার ব্যক্তিগত তথ্য, মোবাইল নম্বর এবং পাসওয়ার্ড সুরক্ষিত ও এনক্রিপ্টেড থাকে।</p>
              <p>২. আমরা কখনোই ব্যবহারকারীর তথ্য কোনো তৃতীয় পক্ষের কাছে হস্তান্তর করি না।</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>1. Your personal data, email, and mobile credentials are encrypted with bank-grade security protocols.</p>
              <p>2. We never sell, lease, or monetize user data to third-party ad networks.</p>
            </div>
          )
        };
      case 'kyc':
        return {
          title: isBn ? 'কেওয়াইসি পলিসি (KYC Policies)' : 'KYC & Verification Policies',
          content: isBn ? (
            <div className="space-y-3">
              <p>১. জাতীয় পরিচয়পত্র (NID) অথবা পাসপোর্টের স্পষ্ট ছবি এবং সেলফি আপলোড করে ভেরিফাই করুন।</p>
              <p>২. ভেরিফাইড আইডি দ্রুত উইথড্রয়াল অনুমোদন পায়।</p>
            </div>
          ) : (
            <div className="space-y-3">
              <p>1. Verification requires government-issued National ID (NID) or Passport.</p>
              <p>2. Verified members unlock prioritized fast withdrawals.</p>
            </div>
          )
        };
      case 'prohibited':
        return {
          title: isBn ? 'নিষিদ্ধ কার্যক্রমসমূহ (Prohibited Activities)' : 'Prohibited Activities',
          content: isBn ? (
            <div className="space-y-3 text-rose-600 dark:text-rose-400">
              <p>১. নকল বা জাল ট্রানজেকশন আইডি (TrxID) দেওয়া।</p>
              <p>২. অন্যের স্ক্রিনশট বা পূর্ববর্তী কাজের স্ক্রিনশট জমা দেওয়া।</p>
              <p>৩. একাধিক অ্যাকাউন্ট বা ভুয়া রেফারেল তৈরি করা।</p>
            </div>
          ) : (
            <div className="space-y-3 text-rose-600 dark:text-rose-400">
              <p>1. Submitting fraudulent transaction IDs or forged proof screenshots.</p>
              <p>2. Attempting phishing attacks or harvesting private credentials.</p>
              <p>3. Multiple automated accounts and bot abuse.</p>
            </div>
          )
        };
      default:
        return { title: 'Policy', content: null };
    }
  };

  const { title, content } = getPolicyContent();

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className={`w-full max-w-lg rounded-3xl shadow-2xl border overflow-hidden my-6 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-800/50">
          <h3 className="font-extrabold text-sm sm:text-base tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{title}</span>
          </h3>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-400 hover:text-slate-700 dark:hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 text-xs sm:text-sm text-slate-600 dark:text-slate-300 space-y-4 max-h-[70vh] overflow-y-auto leading-relaxed">
          {content}
        </div>

        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition cursor-pointer"
          >
            {isBn ? 'বন্ধ করুন' : 'Close'}
          </button>
        </div>
      </div>
    </div>
  );
};
