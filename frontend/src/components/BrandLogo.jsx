import React from 'react';
import './BrandLogo.css';

const BrandLogo = ({ size = 'medium', showText = true, className = '' }) => {
  return (
    <div className={`brand-logo brand-logo-${size} ${className}`}>
      {/* Precision Geometric Monogram Symbol */}
      <div className="brand-logo-mark">
        <svg
          viewBox="0 0 40 40"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="brand-logo-svg"
        >
          <defs>
            <linearGradient id="vibeGlowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#4cc9f0" />
              <stop offset="50%" stopColor="#38b2e8" />
              <stop offset="100%" stopColor="#0077b6" />
            </linearGradient>
            <linearGradient id="vibeFacetGrad" x1="100%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#ffffff" stopOpacity="0.9" />
              <stop offset="100%" stopColor="#4cc9f0" stopOpacity="0.3" />
            </linearGradient>
            <linearGradient id="vibeBoxGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="rgba(76, 201, 240, 0.16)" />
              <stop offset="100%" stopColor="rgba(10, 14, 26, 0.85)" />
            </linearGradient>
            <filter id="vibeNeonBloom" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="2.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Chamfered Modern Glass Hex-Box */}
          <rect
            x="1.5"
            y="1.5"
            width="37"
            height="37"
            rx="11"
            fill="url(#vibeBoxGrad)"
            stroke="rgba(76, 201, 240, 0.35)"
            strokeWidth="1.2"
            className="brand-box-border"
          />

          {/* Dynamic Cinema "V" Monogram with Play Chevron */}
          {/* Left Wing */}
          <path
            d="M9.5 11.5L18.2 28.5C18.8 29.7 20.2 29.7 20.8 28.5L29.5 11.5H24.8L20 21.5L15.2 11.5H9.5Z"
            fill="url(#vibeGlowGrad)"
            filter="url(#vibeNeonBloom)"
          />

          {/* Precision Light Catch / Facet on Right Wing */}
          <path
            d="M20 21.5L24.8 11.5H29.5L20.8 28.5L20 21.5Z"
            fill="url(#vibeFacetGrad)"
          />

          {/* Core Kinetic Pulse Dot */}
          <circle cx="20" cy="11.5" r="2" fill="#ffffff" filter="url(#vibeNeonBloom)" />
        </svg>
      </div>

      {showText && (
        <div className="brand-logo-typography">
          <span className="brand-text-vibe">VIBE</span>
          <span className="brand-text-flix">FLIX</span>
          <span className="brand-text-dot"></span>
        </div>
      )}
    </div>
  );
};

export default BrandLogo;
