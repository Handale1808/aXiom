"use client";

interface MobileMenuButtonProps {
  isOpen: boolean;
  onToggle: () => void;
}

export default function MobileMenuButton({
  isOpen,
  onToggle,
}: MobileMenuButtonProps) {
  return (
    <button
      onClick={onToggle}
      className="md:hidden h-11 w-11 flex flex-col items-center justify-center gap-1.5 border-2 border-[#30D6D6] bg-black text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10"
      aria-label="Toggle menu"
      aria-expanded={isOpen}
    >
      <div
        className={`h-0.5 w-6 bg-[#30D6D6] transition-all duration-300 ${
          isOpen ? "rotate-45 translate-y-2" : ""
        }`}
      />
      <div
        className={`h-0.5 w-6 bg-[#30D6D6] transition-all duration-300 ${
          isOpen ? "opacity-0" : ""
        }`}
      />
      <div
        className={`h-0.5 w-6 bg-[#30D6D6] transition-all duration-300 ${
          isOpen ? "-rotate-45 -translate-y-2" : ""
        }`}
      />
    </button>
  );
}