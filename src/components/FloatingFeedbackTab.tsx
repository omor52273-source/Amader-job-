import React from 'react';

interface FloatingFeedbackTabProps {
  onOpen: () => void;
}

export const FloatingFeedbackTab: React.FC<FloatingFeedbackTabProps> = ({ onOpen }) => {
  return (
    <button
      id="floating-feedback-btn"
      onClick={onOpen}
      style={{ writingMode: 'vertical-rl', textOrientation: 'mixed' }}
      className="hidden sm:flex fixed right-0 top-1/2 -translate-y-1/2 z-40 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3 px-2 rounded-l-xl shadow-lg items-center justify-center gap-1.5 transition-all hover:pr-3 cursor-pointer select-none"
      title="Leave Feedback"
    >
      <span className="tracking-wide">Feedback</span>
      <span className="text-sm -rotate-90">💬</span>
    </button>
  );
};
