// lib/components/about/stats/GenomeSegmentDisplay.tsx

'use client';

import { getSymbolColor } from '@/lib/about/genome/utils';
import type { GenomeSymbol } from '@/lib/generation/genome/types';
import type { DetectedPattern } from '@/lib/about/stats/utils/statCalculations';
import { formatPosition } from '@/lib/about/stats/utils/visualHelpers';

interface GenomeSegmentDisplayProps {
  genome: string;
  subregion: { start: number; end: number };
  detectedPatterns?: DetectedPattern[];
  onPatternHover: (patternId: string | null) => void;
  hoveredPattern: string | null;
}

export default function GenomeSegmentDisplay({
  genome,
  subregion,
  detectedPatterns = [],
  onPatternHover,
  hoveredPattern,
}: GenomeSegmentDisplayProps) {
  const segment = genome.substring(subregion.start, subregion.end + 1);
  const segmentLength = segment.length;

  /**
   * Get all patterns that include a specific position
   */
  function getPatternsAtPosition(position: number): DetectedPattern[] {
    return detectedPatterns.filter(pattern =>
      pattern.positions.includes(position)
    );
  }

  /**
   * Check if a position should be highlighted
   */
  function isPositionHighlighted(position: number): boolean {
    const patterns = getPatternsAtPosition(position);
    
    if (patterns.length === 0) return false;
    
    // If no pattern is hovered, highlight all pattern positions
    if (hoveredPattern === null) return true;
    
    // If a pattern is hovered, only highlight positions in that pattern
    return patterns.some(p => p.id === hoveredPattern);
  }

  return (
    <div className="border-2 border-[#30D6D6]/30 bg-black/50 p-4">
      {/* Header */}
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-bold tracking-widest text-[#30D6D6]">
          GENOME_SEGMENT [{subregion.start}-{subregion.end}]
        </span>
        <span className="text-xs text-cyan-100/50">
          {segmentLength} BASES
        </span>
      </div>

      {/* Position markers (every 10 bases) */}
      <div className="flex text-[10px] text-cyan-100/30 mb-1 font-mono">
        {Array.from({ length: 10 }).map((_, i) => (
          <span key={i} className="flex-1 text-center">
            {i * 10}
          </span>
        ))}
      </div>

      {/* Base display grid */}
      <div 
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: 'repeat(10, minmax(0, 1fr))',
        }}
        onMouseLeave={() => onPatternHover(null)}
      >
        {segment.split('').map((base, idx) => {
          const absolutePos = subregion.start + idx;
          const patterns = getPatternsAtPosition(idx);
          const isHighlighted = isPositionHighlighted(idx);
          const hasPatterns = patterns.length > 0;

          return (
            <div
              key={idx}
              className={`
                aspect-square flex items-center justify-center 
                border-2 text-xs font-bold font-mono
                transition-all duration-200
                ${hasPatterns ? 'cursor-pointer' : ''}
                ${isHighlighted ? 'scale-110 z-10' : 'scale-100'}
              `}
              style={{
                borderColor: getSymbolColor(base as GenomeSymbol),
                backgroundColor: isHighlighted
                  ? `${getSymbolColor(base as GenomeSymbol)}40`
                  : `${getSymbolColor(base as GenomeSymbol)}20`,
                color: getSymbolColor(base as GenomeSymbol),
                boxShadow: isHighlighted
                  ? `0 0 10px ${getSymbolColor(base as GenomeSymbol)}`
                  : 'none',
              }}
              onMouseEnter={() => {
                if (patterns.length > 0) {
                  onPatternHover(patterns[0].id);
                }
              }}
              title={
                hasPatterns
                  ? `Position ${formatPosition(absolutePos)}: ${base} (${patterns.length} pattern${patterns.length > 1 ? 's' : ''})`
                  : `Position ${formatPosition(absolutePos)}: ${base}`
              }
            >
              {base}
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="mt-3 flex items-center justify-between text-xs">
        <span className="text-cyan-100/50">
          Hover over bases to highlight detected patterns
        </span>
        {detectedPatterns.length > 0 && (
          <span className="text-[#30D6D6] font-bold">
            {detectedPatterns.length} pattern{detectedPatterns.length !== 1 ? 's' : ''} detected
          </span>
        )}
      </div>

      {/* Pattern indicator dots (optional visual hint) */}
      {detectedPatterns.length > 0 && (
        <div className="mt-3 pt-3 border-t border-[#30D6D6]/20">
          <div className="text-[10px] text-cyan-100/40 mb-2">PATTERN_COVERAGE</div>
          <div className="flex gap-px">
            {segment.split('').map((_, idx) => {
              const patterns = getPatternsAtPosition(idx);
              const isInPattern = patterns.length > 0;
              const isHovered = isPositionHighlighted(idx);

              return (
                <div
                  key={idx}
                  className="flex-1 h-1 transition-all duration-200"
                  style={{
                    backgroundColor: isInPattern
                      ? isHovered
                        ? '#30D6D6'
                        : 'rgba(48, 214, 214, 0.3)'
                      : 'rgba(0, 0, 0, 0.3)',
                  }}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}