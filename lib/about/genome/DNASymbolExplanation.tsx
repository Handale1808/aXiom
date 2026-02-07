// lib/components/about/genome/DNASymbolExplanation.tsx

import { getSymbolColor } from "./utils";
import type { GenomeSymbol } from "@/lib/generation/genome/types";

const CAT_SYMBOLS: GenomeSymbol[] = ["A", "T", "C", "G"];
const ALIEN_SYMBOLS: GenomeSymbol[] = ["W", "X", "Y", "Z"];

export default function DNASymbolExplanation() {
  return (
    <div className="grid gap-6 md:grid-cols-2 mb-6">
      {/* Terrestrial DNA Panel */}
      <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
        <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

        <h3 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
          TERRESTRIAL_DNA [4_BASES]
        </h3>

        <div className="flex gap-2 mb-4">
          {CAT_SYMBOLS.map((symbol) => (
            <div
              key={symbol}
              className="flex h-12 w-12 items-center justify-center border-2 font-bold text-lg"
              style={{
                borderColor: getSymbolColor(symbol),
                backgroundColor: `${getSymbolColor(symbol)}20`,
                color: getSymbolColor(symbol),
                boxShadow: `0 0 10px ${getSymbolColor(symbol)}40`,
              }}
            >
              {symbol}
            </div>
          ))}
        </div>

        <p className="text-cyan-100/70 leading-relaxed text-sm">
          Standard feline genetic code. Limited to terrestrial biology and
          conventional evolutionary pathways. Adequate for house cats,
          insufficient for cosmic companions.
        </p>
      </div>

      {/* Hybrid DNA Panel */}
      <div className="relative border-2 border-[#30D6D6]/30 bg-black/50 p-6">
        <div className="absolute -left-px -top-px h-4 w-4 border-l-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -right-px -top-px h-4 w-4 border-r-2 border-t-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -left-px h-4 w-4 border-b-2 border-l-2 border-[#30D6D6]" />
        <div className="absolute -bottom-px -right-px h-4 w-4 border-b-2 border-r-2 border-[#30D6D6]" />

        <h3 className="mb-4 text-sm font-bold tracking-widest text-[#30D6D6]">
          HYBRID_DNA [8_SYMBOLS]
        </h3>

        <div className="space-y-3 mb-4">
          <div>
            <p className="text-xs text-cyan-100/50 mb-2 tracking-wider">
              ALIEN_DNA:
            </p>
            <div className="flex gap-2">
              {ALIEN_SYMBOLS.map((symbol) => (
                <div
                  key={symbol}
                  className="flex h-10 w-10 items-center justify-center border-2 font-bold text-base"
                  style={{
                    borderColor: getSymbolColor(symbol),
                    backgroundColor: `${getSymbolColor(symbol)}20`,
                    color: getSymbolColor(symbol),
                    boxShadow: `0 0 8px ${getSymbolColor(symbol)}40`,
                  }}
                >
                  {symbol}
                </div>
              ))}
            </div>
          </div>
        </div>

        <p className="text-cyan-100/70 leading-relaxed text-sm">
          Extended genetic alphabet. WXYZ symbols encode extraterrestrial traits
          impossible in Earth biology. Enables telepathy, phase-shifting, and
          other capabilities that conventional science refuses to acknowledge.
        </p>
      </div>
    </div>
  );
}
