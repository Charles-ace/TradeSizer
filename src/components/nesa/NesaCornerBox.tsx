import React from 'react';

export interface NesaCornerBoxProps {
  children: React.ReactNode;
  className?: string;
  strokeColor?: string;
  badge?: string;
  showAllCorners?: boolean;
}

export const NesaCornerBox: React.FC<NesaCornerBoxProps> = ({
  children,
  className = '',
  strokeColor = '#9A9A9A',
  badge,
  showAllCorners = true,
}) => {
  return (
    <div className={`relative px-5 py-5 sm:px-6 sm:py-6 ${className}`}>
      {/* Top Left Bracket */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="45"
        height="45"
        fill="none"
        className="pointer-events-none absolute -top-[1px] -left-[1px] h-7 w-7 sm:h-9 sm:w-9"
      >
        <path
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          d="M1 45V27.084a15 15 0 0 1 4.393-10.606L16.478 5.393A15 15 0 0 1 27.084 1H45"
        />
      </svg>

      {/* Top Right Bracket */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="45"
        height="45"
        fill="none"
        className="pointer-events-none absolute -top-[1px] -right-[1px] h-7 w-7 sm:h-9 sm:w-9 rotate-90"
      >
        <path
          stroke={strokeColor}
          strokeWidth="1.5"
          strokeLinejoin="round"
          d="M1 45V27.084a15 15 0 0 1 4.393-10.606L16.478 5.393A15 15 0 0 1 27.084 1H45"
        />
      </svg>

      {showAllCorners && (
        <>
          {/* Bottom Left Bracket */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="45"
            height="45"
            fill="none"
            className="pointer-events-none absolute -bottom-[1px] -left-[1px] h-7 w-7 sm:h-9 sm:w-9 -rotate-90"
          >
            <path
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
              d="M1 45V27.084a15 15 0 0 1 4.393-10.606L16.478 5.393A15 15 0 0 1 27.084 1H45"
            />
          </svg>

          {/* Bottom Right Bracket */}
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="45"
            height="45"
            fill="none"
            className="pointer-events-none absolute -bottom-[1px] -right-[1px] h-7 w-7 sm:h-9 sm:w-9 rotate-180"
          >
            <path
              stroke={strokeColor}
              strokeWidth="1.5"
              strokeLinejoin="round"
              d="M1 45V27.084a15 15 0 0 1 4.393-10.606L16.478 5.393A15 15 0 0 1 27.084 1H45"
            />
          </svg>
        </>
      )}

      {badge && (
        <div className="absolute -top-3 left-6 px-2 py-0.5 bg-[#030407] border border-white/20 rounded text-[10px] font-mono tracking-widest uppercase text-white/70">
          {badge}
        </div>
      )}

      {children}
    </div>
  );
};
