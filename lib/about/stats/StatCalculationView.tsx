// lib/components/about/stats/StatCalculationView.tsx

'use client';

import { useState } from 'react';
import type { StatConfig } from './utils/statCalculations';
import { useStatCalculation } from './hooks/useStatCalculation';
import GenomeSegmentDisplay from './GenomeSegmentDisplay';
import ScenarioButtons from './ScenarioButtons';
import PatternDetectionVisual from './PatternDetectionVisual';
import CalculationBreakdown from './CalculationBreakdown';
import FinalResultDisplay from './FinalResultDisplay';
import { getImplementationCode } from './utils/visualHelpers';

interface StatCalculationViewProps {
  config: StatConfig;
  genome: string;
  onGenomeChange: (newGenome: string) => void;
}

export default function StatCalculationView({
  config,
  genome,
  onGenomeChange,
}: StatCalculationViewProps) {
  const [hoveredPattern, setHoveredPattern] = useState<string | null>(null);

  const { result, isCalculating } = useStatCalculation(genome, config, {
    animationDelay: 300,
  });

  return (
    <div className="space-y-6">
      {/* Stat-Specific Philosophy */}
      <div className="border border-[#30D6D6]/30 bg-[#30D6D6]/5 p-4">
        <h4 className="text-xs font-bold tracking-widest text-[#30D6D6] mb-2">
          PHILOSOPHY
        </h4>
        <p className="text-sm text-cyan-100/70 mb-3 leading-relaxed">
          {config.philosophy}
        </p>

        <div className="grid md:grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-[#30D6D6] font-bold">FAVORS:</span>
            <ul className="ml-4 mt-1 text-cyan-100/60 space-y-1">
              {config.favors.map((f) => (
                <li key={f} className="flex items-start">
                  <span className="text-[#30D6D6] mr-2">•</span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <span className="text-[#FF6E40] font-bold">PENALIZED_BY:</span>
            <ul className="ml-4 mt-1 text-cyan-100/60 space-y-1">
              {config.penalizedBy.map((p) => (
                <li key={p} className="flex items-start">
                  <span className="text-[#FF6E40] mr-2">•</span>
                  <span>{p}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Genome Segment Display */}
      <GenomeSegmentDisplay
        genome={genome}
        subregion={config.subregion}
        detectedPatterns={result?.patterns}
        onPatternHover={setHoveredPattern}
        hoveredPattern={hoveredPattern}
      />

      {/* Scenario Buttons */}
      <ScenarioButtons
        statId={config.id}
        subregion={config.subregion}
        onApplyScenario={onGenomeChange}
        currentGenome={genome}
      />

      {/* Pattern Detection Visual */}
      {result && (
        <PatternDetectionVisual
          segment={result.segment}
          patterns={result.patterns}
          hoveredPattern={hoveredPattern}
          onPatternHover={setHoveredPattern}
        />
      )}

      {/* Calculation Breakdown */}
      <CalculationBreakdown result={result} isAnimating={isCalculating} />

      {/* Final Result Display */}
      {result && (
        <FinalResultDisplay
          rawScore={result.rawScore}
          finalStat={result.finalValue}
          category={config.category}
          statName={config.name}
          isAnimating={isCalculating}
        />
      )}

      {/* Code/Formula Display */}
      <div className="border border-[#30D6D6]/30 bg-black/30 p-4">
        <h4 className="text-xs font-bold tracking-widest text-[#30D6D6] mb-3">
          IMPLEMENTATION
        </h4>
        <pre className="text-xs text-cyan-100/70 overflow-x-auto leading-relaxed">
          <code>{getImplementationCode(config.id)}</code>
        </pre>
      </div>
    </div>
  );
}