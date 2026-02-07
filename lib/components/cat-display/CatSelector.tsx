"use client";

import { useState } from "react";
import { usePurchasedCats } from "@/lib/hooks/usePurchasedCats";

interface CatSelectorProps {
  selectedCatId: string | null;
  selectedCatName: string | null;
  onSelect: (catAlienId: string | null, catName: string | null) => void;
  disabled?: boolean;
}

export default function CatSelector({
  selectedCatId,
  selectedCatName,
  onSelect,
  disabled = false,
}: CatSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const { cats, isLoading } = usePurchasedCats();

  const handleSelectCat = (catAlienId: string, catName: string) => {
    onSelect(catAlienId, catName);
    setIsExpanded(false);
  };

  const handleClearSelection = () => {
    onSelect(null, null);
    setIsExpanded(false);
  };

  if (isLoading) {
    return (
      <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-4">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 animate-pulse bg-[#30D6D6] shadow-[0_0_10px_rgba(48,214,214,0.8)]" />
          <div className="text-sm tracking-widest text-[#30D6D6]">
            [LOADING_CATS...]
          </div>
        </div>
      </div>
    );
  }

  if (cats.length === 0) {
    return (
      <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-4">
        <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

        <div className="text-center py-2">
          <div className="text-sm text-[#006694] tracking-wider">
            [NO_CATS_PURCHASED]
          </div>
          <div className="text-xs text-[#006694]/70 mt-1">
            General feedback only
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="relative border-2 border-[#30D6D6]/30 bg-black/50">
        <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

        <div
  onClick={() => !disabled && setIsExpanded(!isExpanded)}
  className={`w-full p-4 text-left transition-all hover:bg-[#30D6D6]/5 cursor-pointer ${
    disabled ? "cursor-not-allowed opacity-50" : ""
  }`}
>
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs font-bold tracking-wider text-[#006694] mb-1">
                [SELECT_CAT_OPTIONAL]
              </div>
              {selectedCatId && selectedCatName ? (
                <div className="flex items-center gap-3">
                  <div className="text-sm text-[#30D6D6] font-bold tracking-wider">
                    {selectedCatName}
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleClearSelection();
                    }}
                    className="text-xs text-red-400 hover:text-red-300 transition-colors"
                  >
                    [CLEAR]
                  </button>
                </div>
              ) : (
                <div className="text-sm text-cyan-100/70">
                  Click to select a cat
                </div>
              )}
            </div>
            <div className="text-[#30D6D6]">{isExpanded ? "▲" : "▼"}</div>
          </div>
        </div>

        {isExpanded && (
          <div className="border-t-2 border-[#30D6D6]/30 p-4 bg-black/30">
            <div className="grid grid-cols-3 gap-4 max-h-64 overflow-y-auto">
              {cats.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleSelectCat(cat.id, cat.name)}
                  className={`border-2 transition-all p-3 ${
                    selectedCatId === cat.id
                      ? "border-[#30D6D6] bg-[#30D6D6]/10"
                      : "border-[#30D6D6]/30 hover:border-[#30D6D6] hover:bg-[#30D6D6]/5"
                  }`}
                >
                  <div
                    className="h-16 mb-2 flex items-center justify-center"
                    dangerouslySetInnerHTML={{ __html: cat.svgImage }}
                  />
                  <div className="text-xs text-[#30D6D6] truncate">
                    {cat.name}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
