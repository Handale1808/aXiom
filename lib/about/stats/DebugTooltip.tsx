// lib/components/about/stats/DebugTooltip.tsx

'use client';

import { useState } from 'react';

interface DebugTooltipProps {
  content: string | React.ReactNode;
  side?: 'top' | 'bottom' | 'left' | 'right';
}

export default function DebugTooltip({ content, side = 'top' }: DebugTooltipProps) {
  const [isVisible, setIsVisible] = useState(false);

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-8 border-transparent border-t-[#30D6D6]/50',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-8 border-transparent border-b-[#30D6D6]/50',
    left: 'left-full top-1/2 -translate-y-1/2 border-8 border-transparent border-l-[#30D6D6]/50',
    right: 'right-full top-1/2 -translate-y-1/2 border-8 border-transparent border-r-[#30D6D6]/50',
  };

  return (
    <div className="relative inline-block">
      {/* Trigger icon */}
      <button
        className="ml-1 text-cyan-100/30 hover:text-cyan-100/70 transition-colors cursor-help"
        onMouseEnter={() => setIsVisible(true)}
        onMouseLeave={() => setIsVisible(false)}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setIsVisible(false)}
        aria-label="Show debug information"
        type="button"
      >
        <svg
          className="w-3 h-3"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="16" x2="12" y2="12" />
          <line x1="12" y1="8" x2="12.01" y2="8" />
        </svg>
      </button>

      {/* Tooltip */}
      <div
        className={`
          absolute ${positionClasses[side]}
          transition-all duration-200
          z-50
          ${isVisible ? 'opacity-100 visible' : 'opacity-0 invisible'}
        `}
      >
        <div
          className="
            border-2 border-[#30D6D6]/50 bg-black p-3
            min-w-[200px] max-w-[300px]
            text-xs text-cyan-100/70 leading-relaxed
            shadow-[0_0_20px_rgba(48,214,214,0.3)]
          "
        >
          {content}

          {/* Arrow */}
          <div className={`absolute ${arrowClasses[side]}`} />
        </div>
      </div>
    </div>
  );
}