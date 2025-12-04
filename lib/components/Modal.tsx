"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Modal({ isOpen, onClose, children }: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    // Store the element that had focus before modal opened
    previousFocusRef.current = document.activeElement as HTMLElement;

    // Focus the modal container
    const focusModal = () => {
      if (modalRef.current) {
        modalRef.current.focus();
      }
    };

    // Small delay to ensure modal is rendered
    const timeoutId = setTimeout(focusModal, 10);

    // Cleanup
    return () => {
      clearTimeout(timeoutId);
      // Restore focus to the element that opened the modal
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Close on Escape key
      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Trap focus with Tab key
      if (e.key === "Tab") {
        if (!modalRef.current) return;

        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );

        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (focusableElements.length === 0) return;

        // Shift + Tab (backwards)
        if (e.shiftKey) {
          if (document.activeElement === firstElement) {
            e.preventDefault();
            lastElement.focus();
          }
        }
        // Tab (forwards)
        else {
          if (document.activeElement === lastElement) {
            e.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/10 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        ref={modalRef}
        className="relative mx-4 max-h-[90vh] w-full max-w-3xl overflow-y-auto overflow-x-auto border-2 border-[#30D6D6] bg-black font-mono shadow-[0_0_30px_rgba(48,214,214,0.3)] [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-black [&::-webkit-scrollbar-thumb]:bg-[#30D6D6]/50 [&::-webkit-scrollbar-thumb]:border [&::-webkit-scrollbar-thumb]:border-[#30D6D6] [&::-webkit-scrollbar-thumb]:hover:bg-[#30D6D6] [&::-webkit-scrollbar-thumb]:hover:shadow-[0_0_10px_rgba(48,214,214,0.8)]"
        onClick={(e) => e.stopPropagation()}
        tabIndex={-1}
      >
        {children}
      </div>
    </div>,
    document.body
  );
}