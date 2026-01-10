import { useEffect, useRef } from "react";

interface FeedbackSearchProps {
  isOpen: boolean;
  onToggle: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onClearSearch: () => void;
}

export default function FeedbackSearch({
  isOpen,
  onToggle,
  searchQuery,
  onSearchChange,
  onClearSearch,
}: FeedbackSearchProps) {
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;

      if (searchRef.current && !searchRef.current.contains(target)) {
        const toolbar = document.querySelector('[ref="toolbarRef"]');
        if (toolbar && !toolbar.contains(target)) {
          onToggle();
        } else if (!toolbar) {
          onToggle();
        }
      }
    };

    setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside);
    }, 0);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen, onToggle]);

  return (
    <div ref={searchRef} className="relative">
      <button
        onClick={onToggle}
        className="relative border border-[#30D6D6]/50 bg-black px-3 py-2 sm:px-4 sm:py-2 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] min-h-[44px]"
      >
        SEARCH
        {searchQuery && (
          <span className="ml-2 inline-flex h-4 w-4 items-center justify-center rounded-full bg-[#30D6D6] text-[10px] font-bold text-black shadow-[0_0_8px_rgba(48,214,214,0.8)]">
            1
          </span>
        )}
      </button>
      {isOpen && (
        <div className="absolute left-[calc(-5rem+2px)] sm:left-auto sm:right-0 top-full mt-2 z-10 w-[calc(100vw-1rem)] sm:w-[400px] border-2 border-[#30D6D6]/30 bg-black/95 p-4 sm:p-5 md:p-6 backdrop-blur-sm">
          <div className="absolute -left-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-l-2 border-t-2 border-[#30D6D6]" />
          <div className="absolute -right-px -top-px h-3 w-3 sm:h-4 sm:w-4 border-r-2 border-t-2 border-[#30D6D6]" />
          <div className="absolute -bottom-px -left-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-l-2 border-[#30D6D6]" />
          <div className="absolute -bottom-px -right-px h-3 w-3 sm:h-4 sm:w-4 border-b-2 border-r-2 border-[#30D6D6]" />
          <h3 className="mb-3 sm:mb-4 text-xs sm:text-sm font-bold tracking-widest text-[#30D6D6]">
            [SEARCH_DATABASE]
          </h3>
          <div className="mb-3 sm:mb-4">
            <label className="block mb-2 text-[10px] sm:text-xs font-bold tracking-wider text-[#006694]">
              SEARCH_QUERY
            </label>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Search feedback text and tags..."
              className="w-full bg-black border border-[#30D6D6]/50 px-3 py-2.5 sm:py-2 text-sm sm:text-base text-cyan-100 placeholder-[#006694] focus:outline-none focus:border-[#30D6D6] transition-colors min-h-[44px]"
            />
          </div>
          <button
            onClick={onClearSearch}
            disabled={!searchQuery}
            className="w-full border border-[#30D6D6]/50 bg-black px-4 py-2.5 sm:py-2 text-xs font-bold tracking-wider text-[#30D6D6] transition-all hover:bg-[#30D6D6]/10 hover:border-[#30D6D6] disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-black disabled:hover:border-[#30D6D6]/50 min-h-[44px]"
          >
            CLEAR_SEARCH
          </button>
        </div>
      )}
    </div>
  );
}
