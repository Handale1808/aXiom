// lib/components/about/stats/CalculationBreakdown.tsx

'use client';

import type { CalculationResult } from './utils/statCalculations';
import { formatComponentName, getComponentExplanation, getStaggerDelay } from './utils/visualHelpers';
import DebugTooltip from './DebugTooltip';

interface CalculationBreakdownProps {
  result: CalculationResult | null;
  isAnimating: boolean;
}

export default function CalculationBreakdown({
  result,
  isAnimating,
}: CalculationBreakdownProps) {
  if (!result) {
    return (
      <div className="border-2 border-[#30D6D6]/50 bg-black/50 p-6">
        <h4 className="text-xs font-bold tracking-widest text-[#30D6D6] mb-4">
          CALCULATION_BREAKDOWN
        </h4>
        <p className="text-sm text-cyan-100/50">Calculating...</p>
      </div>
    );
  }

  const specializationComponents = Object.entries(result.specializationComponents);
  const chaosComponents = Object.entries(result.chaosComponents);

  return (
    <div className="border-2 border-[#30D6D6]/50 bg-black/50 p-6">
      <h4 className="text-xs font-bold tracking-widest text-[#30D6D6] mb-4">
        CALCULATION_BREAKDOWN
      </h4>

      {/* Two-Column Layout */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* SPECIALIZATION SCORE */}
        <div className="border border-[#30D6D6]/30 bg-[#30D6D6]/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-bold text-[#30D6D6]">
              SPECIALIZATION
            </h5>
            <span className="text-xl font-bold text-[#30D6D6] tabular-nums">
              +{result.specializationScore}
            </span>
          </div>

          {/* Component Bars */}
          <div className="space-y-2">
            {specializationComponents.map(([key, value], index) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-cyan-100/70">
                      {formatComponentName(key)}
                    </span>
                    <DebugTooltip
                      content={getComponentExplanation(key, value)}
                      side="top"
                    />
                  </div>
                  <span className="text-[#30D6D6] font-bold tabular-nums">
                    +{value}
                  </span>
                </div>

                {/* Animated Bar */}
                <div className="h-2 bg-black border border-[#30D6D6]/30 overflow-hidden">
                  <div
                    className="h-full bg-[#30D6D6] transition-all duration-500 ease-out"
                    style={{
                      width: isAnimating ? '0%' : `${(value / 100) * 100}%`,
                      boxShadow: isAnimating ? 'none' : '0 0 10px rgba(48, 214, 214, 0.5)',
                      transitionDelay: isAnimating ? '0ms' : `${getStaggerDelay(index)}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total indicator */}
          <div className="mt-3 pt-3 border-t border-[#30D6D6]/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-100/50">TOTAL</span>
              <span className="text-[#30D6D6] font-bold text-lg tabular-nums">
                +{result.specializationScore}
              </span>
            </div>
          </div>
        </div>

        {/* CHAOS PENALTY */}
        <div className="border border-[#FF6E40]/30 bg-[#FF6E40]/5 p-4">
          <div className="flex items-center justify-between mb-3">
            <h5 className="text-sm font-bold text-[#FF6E40]">
              CHAOS_PENALTY
            </h5>
            <span className="text-xl font-bold text-[#FF6E40] tabular-nums">
              −{result.chaosPenalty}
            </span>
          </div>

          {/* Component Bars */}
          <div className="space-y-2">
            {chaosComponents.map(([key, value], index) => (
              <div key={key}>
                <div className="flex items-center justify-between mb-1 text-xs">
                  <div className="flex items-center gap-1">
                    <span className="text-cyan-100/70">
                      {formatComponentName(key)}
                    </span>
                    <DebugTooltip
                      content={getComponentExplanation(key, value)}
                      side="top"
                    />
                  </div>
                  <span className="text-[#FF6E40] font-bold tabular-nums">
                    −{value}
                  </span>
                </div>

                {/* Animated Bar */}
                <div className="h-2 bg-black border border-[#FF6E40]/30 overflow-hidden">
                  <div
                    className="h-full bg-[#FF6E40] transition-all duration-500 ease-out"
                    style={{
                      width: isAnimating ? '0%' : `${(value / 100) * 100}%`,
                      boxShadow: isAnimating ? 'none' : '0 0 10px rgba(255, 110, 64, 0.5)',
                      transitionDelay: isAnimating ? '0ms' : `${getStaggerDelay(index)}ms`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Total indicator */}
          <div className="mt-3 pt-3 border-t border-[#FF6E40]/20">
            <div className="flex items-center justify-between text-xs">
              <span className="text-cyan-100/50">TOTAL</span>
              <span className="text-[#FF6E40] font-bold text-lg tabular-nums">
                −{result.chaosPenalty}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Balance Visualization */}
      <div className="mt-6 border-t border-[#30D6D6]/20 pt-4">
        <div className="text-xs text-center text-cyan-100/50 mb-2">
          NET_BALANCE
        </div>

        {/* Horizontal bar showing specialization vs chaos */}
        <div className="relative h-8 border-2 border-[#30D6D6]/30 bg-black overflow-hidden">
          {/* Specialization side (left, cyan) */}
          <div
            className="absolute left-0 top-0 bottom-0 bg-[#30D6D6] transition-all duration-500 ease-out"
            style={{
              width: isAnimating
                ? '0%'
                : `${(result.specializationScore / 200) * 100}%`,
              boxShadow: isAnimating ? 'none' : '0 0 10px rgba(48, 214, 214, 0.5)',
            }}
          />

          {/* Chaos side (right, orange) */}
          <div
            className="absolute right-0 top-0 bottom-0 bg-[#FF6E40] transition-all duration-500 ease-out"
            style={{
              width: isAnimating
                ? '0%'
                : `${(result.chaosPenalty / 200) * 100}%`,
              boxShadow: isAnimating ? 'none' : '0 0 10px rgba(255, 110, 64, 0.5)',
            }}
          />

          {/* Center line */}
          <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-white/50 z-10" />

          {/* Winning side indicator */}
          <div className="absolute inset-0 flex items-center justify-center z-10">
            <div
              className="text-xs font-bold text-white px-3 py-1 rounded"
              style={{
                textShadow: '0 0 4px black, 0 0 8px black',
                backgroundColor: result.rawScore > 0 
                  ? 'rgba(48, 214, 214, 0.2)' 
                  : result.rawScore < 0
                  ? 'rgba(255, 110, 64, 0.2)'
                  : 'rgba(255, 255, 255, 0.1)',
              }}
            >
              {result.rawScore > 0 
                ? 'SPECIALIZED' 
                : result.rawScore < 0 
                ? 'CHAOTIC' 
                : 'BALANCED'}
            </div>
          </div>
        </div>

        {/* Score labels */}
        <div className="flex items-center justify-between mt-2 text-xs">
          <span className="text-[#30D6D6] font-bold tabular-nums">
            +{result.specializationScore}
          </span>
          <span className="text-cyan-100/50">vs</span>
          <span className="text-[#FF6E40] font-bold tabular-nums">
            −{result.chaosPenalty}
          </span>
        </div>

        {/* Raw score result */}
        <div className="mt-3 text-center">
          <div className="text-xs text-cyan-100/50 mb-1">RAW_SCORE</div>
          <div className="text-2xl font-bold tabular-nums" style={{
            color: result.rawScore > 0 
              ? '#30D6D6' 
              : result.rawScore < 0 
              ? '#FF6E40' 
              : '#FFFFFF',
          }}>
            {result.rawScore > 0 ? '+' : ''}{result.rawScore}
          </div>
        </div>
      </div>
    </div>
  );
}