"use client";

import { useState, useRef } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null);

  const handleMouseEnter = () => {
    setIsVisible(true);
  };

  const handleMouseLeave = () => {
    setIsVisible(false);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    const offsetX = 10;
    const offsetY = 10;
    
    let newX = e.clientX + offsetX;
    let newY = e.clientY + offsetY;

    const tooltipWidth = 300;
    const tooltipHeight = 100;

    if (newX + tooltipWidth > window.innerWidth) {
      newX = e.clientX - tooltipWidth - offsetX;
    }

    if (newY + tooltipHeight > window.innerHeight) {
      newY = e.clientY - tooltipHeight - offsetY;
    }

    setPosition({ x: newX, y: newY });
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      className="relative inline-block"
    >
      {children}

      {isVisible && (
        <div
          className="fixed z-[10000] pointer-events-none"
          style={{ left: position.x, top: position.y }}
        >
          <div className="bg-black border border-[#30D6D6] px-3 py-2 text-xs text-cyan-100 shadow-[0_0_10px_rgba(48,214,214,0.5)] max-w-xs">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}