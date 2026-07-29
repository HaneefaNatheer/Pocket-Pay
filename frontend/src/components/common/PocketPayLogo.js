import React from 'react';

const PocketPayLogo = ({ size = 32, className = '' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 48 48"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
  >
    {/* Wallet body */}
    <rect x="4" y="12" width="36" height="28" rx="4" fill="#2563eb" />
    {/* Wallet flap */}
    <path d="M4 16C4 13.7909 5.79086 12 8 12H36L40 16V12C40 9.79086 38.2091 8 36 8H8C5.79086 8 4 9.79086 4 12V16Z" fill="#1d4ed8" />
    {/* Wallet fold line */}
    <path d="M4 16H44" stroke="#1e40af" strokeWidth="1" />
    {/* Coin slot / clasp */}
    <circle cx="36" cy="26" r="4" fill="#fbbf24" />
    <circle cx="36" cy="26" r="2" fill="#f59e0b" />
    {/* Dollar sign */}
    <text x="20" y="31" textAnchor="middle" fill="white" fontSize="12" fontWeight="bold" fontFamily="Arial, sans-serif">$</text>
    {/* Sparkle */}
    <path d="M38 8L39 5L40 8L43 9L40 10L39 13L38 10L35 9L38 8Z" fill="#fbbf24" opacity="0.8" />
  </svg>
);

export default PocketPayLogo;
