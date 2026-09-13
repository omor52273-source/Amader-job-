import React from 'react';

interface FacebookVerifiedBadgeProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  title?: string;
}

export const FacebookVerifiedBadge: React.FC<FacebookVerifiedBadgeProps> = ({
  size = 'md',
  className = '',
  title = 'Verified Profile'
}) => {
  const sizeMap = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
    xl: 'w-6 h-6'
  };

  return (
    <span
      className={`inline-flex items-center justify-center shrink-0 text-[#20A4F3] select-none ${className}`}
      title={title}
      aria-label={title}
    >
      <svg
        className={sizeMap[size]}
        viewBox="0 0 24 24"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* 16-point scalloped rosette matching images.png */}
        <path d="M 12.00 0.80 C 12.61 0.80, 13.12 2.64, 13.83 2.78 C 14.55 2.92, 15.72 1.42, 16.29 1.65 C 16.85 1.89, 16.62 3.78, 17.22 4.18 C 17.83 4.59, 19.49 3.65, 19.92 4.08 C 20.35 4.51, 19.41 6.17, 19.82 6.78 C 20.22 7.38, 22.11 7.15, 22.35 7.71 C 22.58 8.28, 21.08 9.45, 21.22 10.17 C 21.36 10.88, 23.20 11.39, 23.20 12.00 C 23.20 12.61, 21.36 13.12, 21.22 13.83 C 21.08 14.55, 22.58 15.72, 22.35 16.29 C 22.11 16.85, 20.22 16.62, 19.82 17.22 C 19.41 17.83, 20.35 19.49, 19.92 19.92 C 19.49 20.35, 17.83 19.41, 17.22 19.82 C 16.62 20.22, 16.85 22.11, 16.29 22.35 C 15.72 22.58, 14.55 21.08, 13.83 21.22 C 13.12 21.36, 12.61 23.20, 12.00 23.20 C 11.39 23.20, 10.88 21.36, 10.17 21.22 C 9.45 21.08, 8.28 22.58, 7.71 22.35 C 7.15 22.11, 7.38 20.22, 6.78 19.82 C 6.17 19.41, 4.51 20.35, 4.08 19.92 C 3.65 19.49, 4.59 17.83, 4.18 17.22 C 3.78 16.62, 1.89 16.85, 1.65 16.29 C 1.42 15.72, 2.92 14.55, 2.78 13.83 C 2.64 13.12, 0.80 12.61, 0.80 12.00 C 0.80 11.39, 2.64 10.88, 2.78 10.17 C 2.92 9.45, 1.42 8.28, 1.65 7.71 C 1.89 7.15, 3.78 7.38, 4.18 6.78 C 4.59 6.17, 3.65 4.51, 4.08 4.08 C 4.51 3.65, 6.17 4.59, 6.78 4.18 C 7.38 3.78, 7.15 1.89, 7.71 1.65 C 8.28 1.42, 9.45 2.92, 10.17 2.78 C 10.88 2.64, 11.39 0.80, 12.00 0.80 Z" />
        {/* Crisp rounded white checkmark in center */}
        <path
          d="M8.5 12.4 L11.1 15.0 L16.1 9.6"
          fill="none"
          stroke="#ffffff"
          strokeWidth="2.7"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
};

