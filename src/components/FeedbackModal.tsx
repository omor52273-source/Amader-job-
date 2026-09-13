import React, { useState } from 'react';
import { X, Send, Star, CheckCircle2, MessageSquare } from 'lucide-react';
import { Language } from '../types';

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
  darkMode: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  language,
  darkMode
}) => {
  const isBn = language === 'bn';
  const [rating, setRating] = useState(5);
  const [category, setCategory] = useState('general');
  const [feedback, setFeedback] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!feedback.trim()) return;
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setFeedback('');
      onClose();
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/75 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
      <div className={`w-full max-w-md rounded-3xl shadow-2xl border overflow-hidden p-6 transition-colors ${
        darkMode ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
      }`}>
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <h3 className="font-black text-base">
              {isBn ? 'আপনার মতামত ও প্রতিক্রিয়া' : 'Feedback & Suggestions'}
            </h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2">
            <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto animate-bounce" />
            <p className="font-extrabold text-sm">{isBn ? 'মতামত প্রদানের জন্য ধন্যবাদ!' : 'Thank you for your feedback!'}</p>
            <p className="text-xs text-slate-400">{isBn ? 'আমাদের টিম এটি গুরুত্ব সহকারে পর্যালোচনা করবে।' : 'Our team will review your suggestions.'}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-4 text-xs">
            <div>
              <label className="block font-bold mb-1.5">{isBn ? 'রেটিং দিন:' : 'Rate Experience:'}</label>
              <div className="flex items-center gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="p-1 cursor-pointer transition hover:scale-110"
                  >
                    <Star className={`w-6 h-6 ${star <= rating ? 'text-amber-500 fill-amber-500' : 'text-slate-300 dark:text-slate-700'}`} />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block font-bold mb-1">{isBn ? 'বিষয়ের ধরন:' : 'Topic Category:'}</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className={`w-full p-2.5 rounded-xl border font-semibold outline-hidden ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                }`}
              >
                <option value="general">{isBn ? 'সাধারণ প্রতিক্রিয়া' : 'General Platform Feedback'}</option>
                <option value="payment">{isBn ? 'পেমেন্ট ও উইথড্রয়াল' : 'Payment / Withdrawal Inquiry'}</option>
                <option value="task">{isBn ? 'টাস্ক ও জব রিলেটেড' : 'Tasks & Verification'}</option>
                <option value="bug">{isBn ? 'বাগ রিপোর্ট' : 'Report Bug / Error'}</option>
              </select>
            </div>

            <div>
              <label className="block font-bold mb-1">{isBn ? 'আপনার বিস্তারিত মতামত:' : 'Your Feedback:'}</label>
              <textarea
                required
                rows={4}
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder={isBn ? 'প্ল্যাটফর্মের উন্নতিতে আপনার পরামর্শ লিখুন...' : 'Write your suggestions to improve Amader Job Online...'}
                className={`w-full p-3 rounded-xl border outline-hidden ${
                  darkMode ? 'bg-slate-800 border-slate-700 text-white' : 'bg-white border-slate-300'
                }`}
              />
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{isBn ? 'মতামত পাঠান' : 'Submit Feedback'}</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
