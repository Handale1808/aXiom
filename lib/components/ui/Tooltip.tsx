"use client";

import { useState, useRef, useEffect } from "react";

interface TooltipProps {
  content: string;
  children: React.ReactNode;
}

export default function Tooltip({ content, children }: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const triggerRef = useRef<HTMLDivElement>(null!);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    setIsTouchDevice("ontouchstart" in window || navigator.maxTouchPoints > 0);
  }, []);

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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (!isTouchDevice) return;
    e.preventDefault();
    setIsVisible(true);

    const touch = e.touches[0];
    const offsetX = 10;
    const offsetY = 10;

    let newX = touch.clientX + offsetX;
    let newY = touch.clientY + offsetY;

    const tooltipWidth = 300;
    const tooltipHeight = 100;

    if (newX + tooltipWidth > window.innerWidth) {
      newX = touch.clientX - tooltipWidth - offsetX;
    }

    if (newY + tooltipHeight > window.innerHeight) {
      newY = touch.clientY - tooltipHeight - offsetY;
    }

    setPosition({ x: newX, y: newY });
  };

  const handleTouchEnd = () => {
    if (!isTouchDevice) return;
    setTimeout(() => setIsVisible(false), 2000);
  };

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="relative inline-block"
    >
      {children}

      {isVisible && (
        <div
          className="fixed z-[10000] pointer-events-none"
          style={{ left: position.x, top: position.y }}
        >
          <div className="bg-black border border-[#30D6D6] px-2.5 py-2 sm:px-3 sm:py-2 text-[10px] sm:text-xs text-cyan-100 shadow-[0_0_10px_rgba(48,214,214,0.5)] max-w-[280px] sm:max-w-xs leading-tight">
            {content}
          </div>
        </div>
      )}
    </div>
  );
}
