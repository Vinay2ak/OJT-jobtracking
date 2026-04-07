import React from 'react';

interface LogoProps {
  compact?: boolean;
  className?: string;
}

export function Logo({ compact = false, className = '' }: LogoProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 320 48"
      preserveAspectRatio="xMinYMid meet"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      role="img"
      aria-label="JobTracker logo"
      style={{ display: 'block' }}
    >
      <defs>
        <linearGradient id="logoGrad" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0%" stopColor="#3b82f6" />
          <stop offset="100%" stopColor="#8b5cf6" />
        </linearGradient>
      </defs>

      <g transform="translate(6,8)">
        <rect x="0" y="0" width="36" height="30" rx="5" fill="url(#logoGrad)" />
        <rect x="4" y="4" width="28" height="22" rx="4" fill="rgba(255,255,255,0.06)" />
        <path d="M11 16 L18 9 L25 16" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </g>

      {!compact && (
        <g transform="translate(56,30)">
          <text x="0" y="0" fontFamily="Inter, Roboto, Arial, sans-serif" fontWeight={900} fontSize={26} fill="currentColor">Job</text>
          <text x="52" y="0" fontFamily="Inter, Roboto, Arial, sans-serif" fontWeight={900} fontSize={26} fill="url(#logoGrad)">Tracker</text>
        </g>
      )}
    </svg>
  );
}
export default Logo;
