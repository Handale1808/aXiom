import { useEffect } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative mx-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto border-2 border-[#30D6D6] bg-black font-mono shadow-[0_0_30px_rgba(48,214,214,0.3)]"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        <div className="absolute -left-px -top-px h-6 w-6 border-l-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -right-px -top-px h-6 w-6 border-r-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -left-px h-6 w-6 border-b-2 border-l-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -right-px h-6 w-6 border-b-2 border-r-2 border-[#30D6D6]" />
        {children}
      </div>
    </div>,
    document.body
  );
}