// lib/components/ui/Toast.tsx

"use client";

import { useEffect } from "react";

interface ToastProps {
  message: string;
  type: "success" | "error" | "info";
  isVisible: boolean;
  onClose: () => void;
}

export default function Toast({
  message,
  type,
  isVisible,
  onClose,
}: ToastProps) {
  useEffect(() => {
    if (!isVisible) return;

    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [isVisible, onClose]);

  if (!isVisible) return null;

  const typeStyles = {
    success: "text-[#30D6D6] border-[#30D6D6]",
    error: "text-[#FF4444] border-[#FF4444]",
    info: "text-[#30D6D6] border-[#30D6D6]",
  };

  return (
    <div
      className={`fixed top-4 sm:top-8 left-1/2 -translate-x-1/2 z-[100] 
      animate-slideDown
      border-2 ${typeStyles[type]} 
      bg-black/90 
      px-4 py-3 sm:px-6 sm:py-4 
      max-w-[calc(100vw-32px)] sm:max-w-md
      text-xs sm:text-sm
      font-mono font-bold tracking-widest
      shadow-[0_0_20px_rgba(48,214,214,0.3)]
      backdrop-blur-sm`}
      role="alert"
    >
      {message}
    </div>
  );
}
