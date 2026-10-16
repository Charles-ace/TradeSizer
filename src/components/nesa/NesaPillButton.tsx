import React from 'react';

export interface NesaPillButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;
  target?: string;
  accentColor?: 'yellow' | 'purple' | 'terracotta' | 'black';
  icon?: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const NesaPillButton: React.FC<NesaPillButtonProps> = ({
  children,
  onClick,
  href,
  target,
  accentColor = 'yellow',
  icon,
  className = '',
  size = 'md',
}) => {
  const accentClasses = {
    yellow: {
      disc: 'bg-[#E2F952] text-black',
      hoverSlide: 'bg-[#E2F952]',
      textHover: 'group-hover:text-black',
    },
    purple: {
      disc: 'bg-[#8B5CF6] text-white',
      hoverSlide: 'bg-[#8B5CF6]',
      textHover: 'group-hover:text-white',
    },
    terracotta: {
      disc: 'bg-[#B8622F] text-white',
      hoverSlide: 'bg-[#B8622F]',
      textHover: 'group-hover:text-white',
    },
    black: {
      disc: 'bg-black text-white border border-white/20',
      hoverSlide: 'bg-black',
      textHover: 'group-hover:text-white',
    },
  }[accentColor];

  const sizeClasses = {
    sm: {
      container: 'h-9 py-1 px-3 pl-9 text-xs',
      disc: 'top-[3px] left-[3px] w-7 h-7',
      text: 'text-xs',
    },
    md: {
      container: 'h-11 py-2 px-5 pl-12 text-sm',
      disc: 'top-[4px] left-[4px] w-8 h-8',
      text: 'text-sm font-semibold',
    },
    lg: {
      container: 'h-14 py-3 px-7 pl-16 text-base',
      disc: 'top-[5px] left-[5px] w-11 h-11',
      text: 'text-base font-bold',
    },
  }[size];

  const defaultIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 19 19" className="w-3.5 h-3.5">
      <path
        fill="currentColor"
        d="M18.466 4.19 14.81.534A1.8 1.8 0 0 0 13.516 0H.739v4.93h9.84L0 15.508 3.492 19 14.07 8.422v9.839H19V5.484c0-.472-.185-.945-.534-1.294"
      />
    </svg>
  );

  const content = (
    <>
      {/* Left Icon Disc */}
      <div
        className={`absolute z-[2] flex justify-center items-center rounded-full transition-transform duration-300 ease-out group-hover:rotate-45 ${sizeClasses.disc} ${accentClasses.disc}`}
      >
        <div className="relative z-[3] flex items-center justify-center">
          {icon || defaultIcon}
        </div>
      </div>

      {/* Button Label */}
      <span
        className={`relative z-[2] font-medium tracking-tight whitespace-nowrap transition-colors duration-300 ease-in-out text-white ${sizeClasses.text} ${accentClasses.textHover}`}
      >
        {children}
      </span>

      {/* Sliding Hover Under-fill (Signature Nesa effect) */}
      <div
        className={`absolute rounded-full transition-all duration-300 ease-out opacity-0 group-hover:opacity-100 ${sizeClasses.disc} group-hover:w-[calc(100%-8px)] ${accentClasses.hoverSlide}`}
      />
    </>
  );

  const baseContainer = `relative inline-flex items-center group cursor-pointer rounded-full bg-[#16171d]/90 hover:bg-[#1f2129] border border-white/10 hover:border-white/25 backdrop-blur-md shadow-lg transition-all duration-200 active:scale-[0.97] select-none ${sizeClasses.container} ${className}`;

  if (href) {
    return (
      <a href={href} target={target} rel={target === '_blank' ? 'noopener noreferrer' : undefined} className={baseContainer}>
        {content}
      </a>
    );
  }

  return (
    <button type="button" onClick={onClick} className={baseContainer}>
      {content}
    </button>
  );
};
