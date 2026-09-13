import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  Upload, 
  Camera, 
  CheckCircle2, 
  AlertCircle, 
  FileText,
  Clock,
  Sparkles,
  Award,
  Crown,
  Check,
  RotateCcw,
  Eye,
  ShieldAlert,
  UserCheck,
  UserX
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { Language, UserProfile, KycVerificationData } from '../types';
import { FacebookVerifiedBadge } from './FacebookVerifiedBadge';

interface KycModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  language: Language;
  darkMode?: boolean;
  onSubmitKyc: (kycData: KycVerificationData) => void;
  onAdminApproveKyc?: () => void;
  onAdminRejectKyc?: (reason?: string) => void;
}

export const KycModal: React.FC<KycModalProps> = ({
  isOpen,
  onClose,
  user,
  language,
  darkMode = false,
  onSubmitKyc,
  onAdminApproveKyc,
  onAdminRejectKyc
}) => {
  const isBn = language === 'bn';
  
  const [fullName, setFullName] = useState(user.kycData?.fullName || user.name || '');
  const [docNumber, setDocNumber] = useState(user.kycData?.docNumber || user.nidNumber || '');
  const [dob, setDob] = useState(user.kycData?.dob || '2000-01-01');
  const [frontImage, setFrontImage] = useState<string | null>(
    user.kycData?.nidFrontUrl || null
  );
  const [backImage, setBackImage] = useState<string | null>(
    user.kycData?.nidBackUrl || null
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleFrontUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setFrontImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleBackUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setBackImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!fullName.trim()) {
      setErrorMsg(isBn ? 'এনআইডি অনুযায়ী আপনার পূর্ণ নাম লিখুন' : 'Please enter your full name as on NID');
      return;
    }

    if (!docNumber.trim() || docNumber.trim().length < 10) {
      setErrorMsg(isBn ? 'সঠিক ১০ অথবা ১৭ ডিজিটের এনআইডি নম্বর দিন' : 'Please enter a valid 10 or 17 digit NID number');
      return;
    }

    if (!frontImage || !backImage) {
      setErrorMsg(isBn ? 'এনআইডির উভয় পাশের (সামনে ও পেছনে) ছবি আপলোড করুন' : 'Please upload both front and back photos of your NID');
      return;
    }

    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      const data: KycVerificationData = {
        documentType: 'nid',
        fullName: fullName.trim(),
        docNumber: docNumber.trim(),
        dob,
        nidFrontUrl: frontImage,
        nidBackUrl: backImage,
        submittedAt: new Date().toISOString()
      };
      onSubmitKyc(data);
    }, 800);
  };

  const handleApprove = () => {
    if (onAdminApproveKyc) {
      onAdminApproveKyc();
      try {
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 } });
      } catch (e) {}
    }
  };

  const handleReject = () => {
    if (onAdminRejectKyc) {
      onAdminRejectKyc(isBn ? 'অস্পষ্ট ছবি বা তথ্যের গরমিল' : 'Unclear photo or mismatched information');
    }
  };

  const isPending = user.kycStatus === 'pending';
  const isVerified = user.isVerified || user.kycStatus === 'verified';
  const isRejected = user.kycStatus === 'rejected';

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in">
      <div className="w-full max-w-lg rounded-3xl shadow-2xl border border-slate-200 bg-white text-slate-900 overflow-hidden my-6">
        
        {/* VIP Top Banner */}
        <div className="bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 text-white p-5 border-b border-blue-900/50 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#1877F2]/15 rounded-full blur-2xl pointer-events-none"></div>
          
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-[#1877F2] text-white flex items-center justify-center shadow-lg shadow-[#1877F2]/30 shrink-0">
                <FacebookVerifiedBadge size="lg" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950">
                    VIP BADGE
                  </span>
                  <span className="text-blue-300 text-xs font-bold">NID Escrow</span>
                </div>
                <h3 className="font-black text-base sm:text-lg text-white mt-0.5">
                  {isBn ? 'জাতীয় পরিচয়পত্র (NID) ভেরিফিকেশন' : 'National ID Verification'}
                </h3>
              </div>
            </div>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <p className="text-xs text-blue-200/80 mt-2.5">
            {isBn 
              ? 'এনআইডি কার্ড আপলোড করার পর অ্যাডমিন যাচাই করে ব্লু ভেরিফাইড ব্যাজ ও আনলিমিটেড উইথড্রয়াল সক্রিয় করবে।' 
              : 'Submit both sides of your Govt. NID. Admin reviews within 1-24h to activate the Facebook Blue Badge.'}
          </p>
        </div>

        {/* Content Body based on KYC State */}
        {isVerified ? (
          /* STATE 1: VERIFIED */
          <div className="p-6 sm:p-8 text-center space-y-5">
            <div className="w-20 h-20 rounded-full bg-blue-50 border-2 border-blue-200 text-[#1877F2] flex items-center justify-center mx-auto shadow-xl shadow-blue-500/10">
              <FacebookVerifiedBadge size="xl" />
            </div>

            <div>
              <div className="inline-flex items-center gap-2 text-xl font-black text-slate-900">
                <span>{user.kycData?.fullName || user.name}</span>
                <FacebookVerifiedBadge size="md" />
              </div>
              <h4 className="text-base font-black text-emerald-600 mt-1">
                {isBn ? 'জাতীয় পরিচয়পত্র অনুমোদিত (Verified)' : 'Govt. NID Approved & Active'}
              </h4>
              <p className="text-xs text-slate-500 mt-2 max-w-sm mx-auto leading-relaxed">
                {isBn 
                  ? 'আপনার জাতীয় পরিচয়পত্র সফলভাবে অ্যাডমিন কর্তৃক যাচাই ও অনুমোদন করা হয়েছে। আপনার প্রোফাইলে ব্লু ভেরিফাইড ব্যাজ সক্রিয় রয়েছে।' 
                  : 'Your identity documents have been approved by Admin. You now enjoy Tier-1 privileges and instant withdrawals.'}
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-center gap-3 text-xs font-mono font-bold text-slate-700">
              <span>NID: {user.nidNumber || user.kycData?.docNumber || '1998541298412'}</span>
              <span className="text-emerald-600 flex items-center gap-1 font-sans">
                <Check className="w-3.5 h-3.5" /> {isBn ? 'অ্যাডমিন অনুমোদিত' : 'Admin Approved'}
              </span>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-[#1877F2] hover:bg-blue-700 text-white rounded-xl text-xs font-black shadow-md transition cursor-pointer"
            >
              {isBn ? 'ঠিক আছে' : 'Close Window'}
            </button>
          </div>
        ) : isPending ? (
          /* STATE 2: PENDING ADMIN APPROVAL */
          <div className="p-6 sm:p-7 space-y-5">
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-center space-y-2">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6 animate-spin" style={{ animationDuration: '8s' }} />
              </div>
              <h4 className="text-sm font-black text-amber-900">
                {isBn ? 'অ্যাডমিন যাচাইকরণ প্রক্রিয়াধীন রয়েছে' : 'Pending Admin Verification'}
              </h4>
              <p className="text-xs text-amber-800/90 leading-relaxed">
                {isBn 
                  ? 'আপনার এনআইডি কার্ড সফলভাবে জমা হয়েছে। অ্যাডমিন টিম আপনার তথ্য ও ছবি যাচাই করে খুব শীঘ্রই অনুমোদন করবে।' 
                  : 'Your NID has been submitted for review. Admin will inspect the uploaded card photos and approve your profile.'}
              </p>
            </div>

            {/* Submitted Information Preview */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-bold">{isBn ? 'নাম' : 'Name'}:</span>
                <span className="font-extrabold text-slate-900">{user.kycData?.fullName || fullName}</span>
              </div>
              <div className="flex justify-between items-center pb-2 border-b border-slate-200">
                <span className="text-slate-500 font-bold">{isBn ? 'এনআইডি নম্বর' : 'NID No'}:</span>
                <span className="font-mono font-extrabold text-slate-900">{user.kycData?.docNumber || docNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-500 font-bold">{isBn ? 'জমার সময়' : 'Submitted'}:</span>
                <span className="font-semibold text-slate-600">{user.kycData?.submittedAt ? new Date(user.kycData.submittedAt).toLocaleString() : 'Just now'}</span>
              </div>
            </div>

            {/* Uploaded Card Thumbnails */}
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-bold text-slate-600">{isBn ? 'সামনের পাশ' : 'Front Side'}</span>
                <img 
                  src={user.kycData?.nidFrontUrl || frontImage || 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=300&auto=format&fit=crop&q=80'} 
                  alt="NID Front" 
                  className="w-full h-20 object-cover rounded-xl border border-slate-200 shadow-2xs"
                />
              </div>
              <div className="space-y-1 text-center">
                <span className="text-[11px] font-bold text-slate-600">{isBn ? 'পেছনের পাশ' : 'Back Side'}</span>
                <img 
                  src={user.kycData?.nidBackUrl || backImage || 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=300&auto=format&fit=crop&q=80'} 
                  alt="NID Back" 
                  className="w-full h-20 object-cover rounded-xl border border-slate-200 shadow-2xs"
                />
              </div>
            </div>

            {/* Admin Quick-Review Controls */}
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-200 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-indigo-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-600" />
                  {isBn ? 'অ্যাডমিন ভেরিফিকেশন একশন (Admin Action)' : 'Admin Review Simulation'}
                </span>
                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-800">ADMIN</span>
              </div>
              <div className="grid grid-cols-2 gap-2 pt-1">
                <button
                  type="button"
                  onClick={handleApprove}
                  className="py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>{isBn ? 'অনুমোদন করুন (Approve)' : 'Approve NID'}</span>
                </button>
                <button
                  type="button"
                  onClick={handleReject}
                  className="py-2 px-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <UserX className="w-3.5 h-3.5" />
                  <span>{isBn ? 'বাতিল করুন (Reject)' : 'Reject NID'}</span>
                </button>
              </div>
            </div>

            <button
              onClick={onClose}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
            >
              {isBn ? 'বন্ধ করুন' : 'Close'}
            </button>
          </div>
        ) : (
          /* STATE 3: FORM TO UPLOAD NID */
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-4 text-xs">
            
            {/* Rejection Notice if applicable */}
            {isRejected && (
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-rose-800 flex items-start gap-2.5">
                <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <p className="font-extrabold">{isBn ? 'পূর্ববর্তী সাবমিশন বাতিল হয়েছে' : 'Previous Submission Rejected'}</p>
                  <p className="text-[11px] text-rose-700 mt-0.5">{isBn ? 'দয়া করে পরিষ্কার ছবি ও সঠিক এনআইডি নম্বর দিয়ে পুনরায় সাবমিট করুন।' : 'Please re-upload with clear high-resolution card photos.'}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* 1. Full Name (as per NID) */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>{isBn ? 'এনআইডি কার্ড অনুযায়ী পূর্ণ নাম:' : 'Full Name (as per NID):'}</span>
                <span className="text-[10px] text-rose-500 font-bold">*Required</span>
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Md. Rafi Ahmed"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-semibold outline-hidden text-xs bg-slate-50 focus:bg-white focus:border-blue-500 transition"
              />
            </div>

            {/* 2. NID Number */}
            <div className="space-y-1.5">
              <label className="font-bold text-slate-700 flex items-center justify-between">
                <span>{isBn ? 'জাতীয় পরিচয়পত্র (NID) নম্বর:' : 'National ID (NID) Number:'}</span>
                <span className="text-[10px] text-rose-500 font-bold">*10 or 17 digits</span>
              </label>
              <input
                type="text"
                required
                value={docNumber}
                onChange={(e) => setDocNumber(e.target.value.replace(/\D/g, ''))}
                placeholder="e.g. 5521948291"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 font-mono font-bold outline-hidden text-xs tracking-wider bg-slate-50 focus:bg-white focus:border-blue-500 transition"
              />
            </div>

            {/* 3. NID 2-Side Photo Uploads */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              {/* NID Front Side */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 flex items-center justify-between">
                  <span>{isBn ? 'এনআইডি সামনের ছবি:' : 'NID Front Side:'}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Front</span>
                </span>
                <label className={`p-3 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  frontImage 
                    ? 'border-[#1877F2] bg-blue-50/20' 
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
                }`}>
                  {frontImage ? (
                    <div className="w-full relative group">
                      <img src={frontImage} alt="NID Front" className="w-full h-24 object-cover rounded-xl shadow-xs" />
                      <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded font-bold">
                        {isBn ? 'পরিবর্তন' : 'Change'}
                      </span>
                    </div>
                  ) : (
                    <div className="py-3">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-600 font-bold block">
                        {isBn ? 'সামনের ছবি নির্বাচন করুন' : 'Upload front side'}
                      </span>
                      <span className="text-[10px] text-slate-400">JPG, PNG (Max 5MB)</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleFrontUpload} />
                </label>
              </div>

              {/* NID Back Side */}
              <div className="space-y-1.5">
                <span className="font-bold text-slate-700 flex items-center justify-between">
                  <span>{isBn ? 'এনআইডি পেছনের ছবি:' : 'NID Back Side:'}</span>
                  <span className="text-[10px] text-emerald-600 font-bold">Back</span>
                </span>
                <label className={`p-3 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                  backImage 
                    ? 'border-[#1877F2] bg-blue-50/20' 
                    : 'border-slate-300 hover:border-blue-500 bg-slate-50/50'
                }`}>
                  {backImage ? (
                    <div className="w-full relative group">
                      <img src={backImage} alt="NID Back" className="w-full h-24 object-cover rounded-xl shadow-xs" />
                      <span className="absolute bottom-1 right-1 bg-slate-900/80 text-white text-[9px] px-2 py-0.5 rounded font-bold">
                        {isBn ? 'পরিবর্তন' : 'Change'}
                      </span>
                    </div>
                  ) : (
                    <div className="py-3">
                      <Upload className="w-6 h-6 text-slate-400 mx-auto mb-1" />
                      <span className="text-[11px] text-slate-600 font-bold block">
                        {isBn ? 'পেছনের ছবি নির্বাচন করুন' : 'Upload back side'}
                      </span>
                      <span className="text-[10px] text-slate-400">JPG, PNG (Max 5MB)</span>
                    </div>
                  )}
                  <input type="file" accept="image/*" className="hidden" onChange={handleBackUpload} />
                </label>
              </div>
            </div>

            {/* Security Guarantee Note */}
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <span>
                {isBn 
                  ? 'আপনার পরিচয়পত্রের তথ্য এনক্রিপ্ট করে সুরক্ষিত রাখা হয়। অ্যাডমিন যাচাই করে ব্লু ভেরিফাইড ব্যাজ সক্রিয় করবেন।' 
                  : 'Your information is 256-bit encrypted. Admin will review the submission to activate your Blue Badge.'}
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-[#1877F2] hover:bg-blue-700 text-white rounded-xl font-black text-xs shadow-md shadow-blue-600/25 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 active:scale-98"
            >
              {isSubmitting ? (
                <span>{isBn ? 'জমা দেওয়া হচ্ছে...' : 'Submitting NID for Review...'}</span>
              ) : (
                <>
                  <Upload className="w-4 h-4" />
                  <span>{isBn ? 'এনআইডি সাবমিট করুন (Submit for Admin Review)' : 'Submit NID for Admin Verification'}</span>
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
