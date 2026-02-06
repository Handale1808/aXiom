// lib/components/about/stats/FinalResultDisplay.tsx

"use client";

import type { StatCategory } from "./utils/statCalculations";
import {
  getMappingFormula,
  getStatLabel,
  getStatInterpretation,
  getScoreSign,
} from "./utils/visualHelpers";

interface FinalResultDisplayProps {
  rawScore: number;
  finalStat: number;
  category: StatCategory;
  statName: string;
  isAnimating: boolean;
}

export default function FinalResultDisplay({
  rawScore,
  finalStat,
  category,
  statName,
  isAnimating,
}: FinalResultDisplayProps) {
  const maxValue = category === "resistances" ? 100 : 10;
  const percentage = (finalStat / maxValue) * 100;
  const sign = getScoreSign(rawScore);
  const label = getStatLabel(finalStat, category);
  const interpretation = getStatInterpretation(finalStat, category, statName);

  return (
    <div className="border-2 border-[#30D6D6]/50 bg-[#30D6D6]/10 p-6">
      <h4 className="text-xs font-bold tracking-widest text-[#30D6D6] mb-4">
        FINAL_RESULT
      </h4>

      {/* Formula Display */}
      <div className="border border-[#30D6D6]/30 bg-black/50 p-4 mb-4">
        <div className="text-sm text-cyan-100/70 mb-2">
          RAW_SCORE = SPECIALIZATION − CHAOS
        </div>
        <div className="text-lg font-bold text-[#30D6D6] tabular-nums mb-3">
          {sign}
          {Math.abs(rawScore)} / 100
        </div>

        <div className="border-t border-[#30D6D6]/20 pt-3 mt-3">
          <div className="text-sm text-cyan-100/70 mb-2">
            {getMappingFormula(category)}
          </div>

          {/* ADD THIS - Show the actual calculation */}
          <div className="text-xs font-mono text-cyan-100/50 mb-2">
            = 1 + (({rawScore} / 100) × 9)
          </div>
          <div className="text-xs font-mono text-cyan-100/50 mb-2">
            = 1 + ({(rawScore / 100).toFixed(2)} × 9)
          </div>
          <div className="text-xs font-mono text-cyan-100/50 mb-3">
            = 1 + {((rawScore / 100) * 9).toFixed(2)} →{" "}
            {Math.round(1 + (rawScore / 100) * 9)} (before clamp) → {finalStat}{" "}
            (after clamp to 1-10)
          </div>

          <div className="text-3xl font-bold text-[#30D6D6] tabular-nums">
            {finalStat} / {maxValue}
          </div>
        </div>
      </div>

      {/* Visual Gauge */}
      <div className="relative mb-4">
        <div className="text-xs text-center text-cyan-100/50 mb-2">
          STAT_GAUGE
        </div>

        {/* Gauge visualization */}
        <div className="h-12 border-2 border-[#30D6D6] bg-black relative overflow-hidden">
          {/* Fill */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#30D6D6] transition-all duration-1000 ease-out"
            style={{
              width: isAnimating ? "0%" : `${percentage}%`,
              boxShadow: isAnimating
                ? "none"
                : "0 0 20px rgba(48, 214, 214, 0.6)",
            }}
          />

          {/* Tick marks */}
          <div className="absolute inset-0 flex">
            {Array.from({ length: 11 }).map((_, i) => (
              <div
                key={i}
                className="flex-1 border-r border-white/10 flex items-center justify-center last:border-r-0"
              >
                {i % 2 === 0 && (
                  <span className="text-[10px] text-white/30 font-mono">
                    {Math.round((i / 10) * maxValue)}
                  </span>
                )}
              </div>
            ))}
          </div>

          {/* Current value indicator */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-white transition-all duration-1000 ease-out"
            style={{
              left: isAnimating ? "0%" : `${percentage}%`,
              boxShadow: isAnimating ? "none" : "0 0 10px white",
            }}
          >
            {/* Value label on indicator */}
            {!isAnimating && (
              <div className="absolute -top-6 left-1/2 -translate-x-1/2 whitespace-nowrap">
                <div className="text-xs font-bold text-white bg-black/80 px-2 py-1 rounded border border-[#30D6D6]/50">
                  {finalStat}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between mt-2 text-xs text-cyan-100/50">
          <span>MIN</span>
          <span className="text-[#30D6D6] font-bold">{label}</span>
          <span>MAX</span>
        </div>
      </div>

      {/* Interpretation */}
      <div className="border-t border-[#30D6D6]/20 pt-4">
        <div className="text-xs font-bold tracking-widest text-[#30D6D6] mb-2">
          PHENOTYPE_EXPRESSION
        </div>
        <p className="text-sm text-cyan-100/70 leading-relaxed">
          {interpretation}
        </p>
      </div>

      {/* Performance Indicator */}
      <div className="mt-4 flex items-center gap-2">
        <div className="flex-1 h-1 bg-black/50 rounded overflow-hidden">
          <div
            className="h-full transition-all duration-1000 ease-out"
            style={{
              width: isAnimating ? "0%" : `${percentage}%`,
              backgroundColor:
                percentage >= 80
                  ? "#76FF03"
                  : percentage >= 60
                    ? "#30D6D6"
                    : percentage >= 40
                      ? "#FFE66D"
                      : percentage >= 20
                        ? "#FF6E40"
                        : "#FF0000",
            }}
          />
        </div>
        <div className="text-xs font-mono text-cyan-100/50 tabular-nums">
          {Math.round(percentage)}%
        </div>
      </div>
    </div>
  );
}
