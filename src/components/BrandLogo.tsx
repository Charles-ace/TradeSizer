import React from 'react';

interface BrandLogoProps {
  variant?: 'mark' | 'full';
  size?: 'sm' | 'md' | 'lg';
  showSubtitle?: boolean;
  className?: string;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'mark',
  size = 'md',
  showSubtitle = false,
  className = '',
}) => {
  const sizeMap = {
    sm: { box: 'w-6 h-6', text: 'text-sm', sub: 'text-[9px]', scale: 24 },
    md: { box: 'w-8 h-8', text: 'text-base', sub: 'text-[10px]', scale: 32 },
    lg: { box: 'w-10 h-10', text: 'text-lg', sub: 'text-xs', scale: 40 },
  };

  const currentSize = sizeMap[size];

  // SVG Mark component (vector scalable)
  const SvgMark = (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 512 512"
      className={`${currentSize.box} drop-shadow-[0_2px_8px_rgba(16,185,129,0.25)] select-none shrink-0 transition-transform duration-200 group-hover:scale-105`}
    >
      <defs>
        <radialGradient id="reactTsBg" cx="30%" cy="25%" r="85%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="55%" stopColor="#070a12" />
          <stop offset="100%" stopColor="#020408" />
        </radialGradient>
        <linearGradient id="reactTsEmerald" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#34d399" />
          <stop offset="45%" stopColor="#10b981" />
          <stop offset="100%" stopColor="#059669" />
        </linearGradient>
        <linearGradient id="reactTsCyan" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#0284c7" />
          <stop offset="50%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#7dd3fc" />
        </linearGradient>
        <linearGradient id="reactTsBorder" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
          <stop offset="40%" stopColor="#38bdf8" stopOpacity="0.5" />
          <stop offset="100%" stopColor="#1e293b" stopOpacity="0.85" />
        </linearGradient>
      </defs>

      <rect x="20" y="20" width="472" height="472" rx="112" fill="url(#reactTsBg)" stroke="url(#reactTsBorder)" strokeWidth="8" />

      {/* Grid */}
      <g opacity="0.12" stroke="#94a3b8" strokeWidth="2.5" strokeDasharray="6 8">
        <line x1="80" y1="256" x2="432" y2="256" />
        <line x1="256" y1="80" x2="256" y2="432" />
        <circle cx="256" cy="256" r="140" fill="none" />
      </g>

      {/* T Caliper Jaw (Cyan) */}
      <path
        d="M 120 138 L 392 138 A 16 16 0 0 1 408 154 L 408 194 A 16 16 0 0 1 392 210 L 306 210 L 306 244 A 14 14 0 0 1 292 258 L 262 258 L 262 210 L 180 210 L 180 264 A 14 14 0 0 1 166 278 L 134 278 A 14 14 0 0 1 120 264 L 120 154 A 16 16 0 0 1 120 138 Z"
        fill="url(#reactTsCyan)"
      />

      {/* S Growth Wave (Emerald) */}
      <path
        d="M 392 374 L 120 374 A 16 16 0 0 1 104 358 L 104 318 A 16 16 0 0 1 120 302 L 206 302 L 206 268 A 14 14 0 0 1 220 254 L 250 254 L 250 302 L 332 302 L 332 248 A 14 14 0 0 1 346 234 L 378 234 A 14 14 0 0 1 392 248 L 392 358 A 16 16 0 0 1 392 374 Z"
        fill="url(#reactTsEmerald)"
      />

      {/* Nexus Diamond & Reticle */}
      <polygon points="256,232 278,256 256,280 234,256" fill="#ffffff" opacity="0.95" />
      <circle cx="256" cy="256" r="7" fill="#10b981" />
      <circle cx="256" cy="256" r="2.5" fill="#ffffff" />
    </svg>
  );

  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center group ${className}`}>
        {SvgMark}
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center space-x-2.5 group select-none ${className}`}>
      {SvgMark}
      <div className="flex flex-col">
        <div className={`font-mono font-extrabold tracking-tight ${currentSize.text} text-[var(--color-ink)] leading-none`}>
          TRADE<span className="text-emerald-400">SIZER</span>
        </div>
        {showSubtitle && (
          <span className={`font-mono text-[var(--color-ink-muted)] ${currentSize.sub} tracking-widest uppercase mt-0.5`}>
            Position Sizing Engine
          </span>
        )}
      </div>
    </div>
  );
};
