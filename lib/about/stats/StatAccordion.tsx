// lib/components/about/stats/StatAccordion.tsx

'use client';

import type { StatConfig } from './utils/statCalculations';
import StatCalculationView from './StatCalculationView';

interface StatAccordionProps {
  config: StatConfig;
  isExpanded: boolean;
  onToggle: () => void;
  genome: string;
  onGenomeChange: (newGenome: string) => void;
}

export default function StatAccordion({
  config,
  isExpanded,
  onToggle,
  genome,
  onGenomeChange,
}: StatAccordionProps) {
  return (
    <div className="border-2 border-[#30D6D6]/30 bg-black/30 transition-all duration-200">
      {/* Collapsed Header - Always Visible */}
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 hover:bg-[#30D6D6]/5 transition-colors"
        aria-expanded={isExpanded}
      >
        <div className="flex items-center gap-3">
          {/* Icon/Indicator */}
          <div
            className="w-8 h-8 border-2 border-[#30D6D6] flex items-center justify-center text-[#30D6D6] font-bold transition-transform duration-200"
            style={{
              transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
            }}
          >
            {isExpanded ? '−' : '+'}
          </div>

          {/* Stat Name */}
          <span className="text-lg font-bold tracking-wider text-[#30D6D6]">
            {config.name.toUpperCase()}
          </span>
        </div>

        {/* Quick Preview (when collapsed) */}
        {!isExpanded && (
          <div className="text-sm text-cyan-100/50">
            Region: [{config.subregion.start}-{config.subregion.end}]
          </div>
        )}
      </button>

      {/* Expanded Content */}
      {isExpanded && (
        <div
          className="border-t border-[#30D6D6]/30 p-6 animate-fadeIn"
          style={{
            animation: 'fadeIn 0.3s ease-out',
          }}
        >
          <StatCalculationView
            config={config}
            genome={genome}
            onGenomeChange={onGenomeChange}
          />
        </div>
      )}

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}