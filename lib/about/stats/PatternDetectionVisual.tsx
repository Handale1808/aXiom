// lib/components/about/stats/PatternDetectionVisual.tsx

'use client';

import type { DetectedPattern } from './utils/statCalculations';
import { getPatternColor, getPatternTypeName } from './utils/visualHelpers';

interface PatternDetectionVisualProps {
  segment: string;
  patterns: DetectedPattern[];
  hoveredPattern: string | null;
  onPatternHover: (patternId: string | null) => void;
}

export default function PatternDetectionVisual({
  segment,
  patterns,
  hoveredPattern,
  onPatternHover,
}: PatternDetectionVisualProps) {
  // Group patterns by type
  const patternsByType = patterns.reduce((acc, pattern) => {
    if (!acc[pattern.type]) {
      acc[pattern.type] = [];
    }
    acc[pattern.type].push(pattern);
    return acc;
  }, {} as Record<string, DetectedPattern[]>);

  const patternTypes = Object.keys(patternsByType);

  if (patterns.length === 0) {
    return (
      <div className="border border-[#30D6D6]/30 bg-black/30 p-4">
        <h4 className="text-xs font-bold tracking-widest text-[#30D6D6] mb-3">
          DETECTED_PATTERNS
        </h4>
        <p className="text-xs text-cyan-100/50">
          No significant patterns detected in this segment.
        </p>
      </div>
    );
  }

  return (
    <div className="border border-[#30D6D6]/30 bg-black/30 p-4">
      <h4 className="text-xs font-bold tracking-widest text-[#30D6D6] mb-3">
        DETECTED_PATTERNS
      </h4>

      {/* Pattern Categories */}
      <div className="space-y-3">
        {patternTypes.map((type) => {
          const typePatterns = patternsByType[type];
          const typeColor = getPatternColor(type);
          
          return (
            <div
              key={type}
              className="border-l-2 pl-3"
              style={{ borderColor: `${typeColor}80` }}
            >
              <div
                className="text-xs font-bold mb-2"
                style={{ color: typeColor }}
              >
                {getPatternTypeName(type)}
              </div>
              
              <div className="space-y-1">
                {typePatterns.map((pattern) => {
                  const isHovered = hoveredPattern === pattern.id;
                  
                  return (
                    <div
                      key={pattern.id}
                      className={`
                        text-xs flex items-center justify-between
                        p-2 rounded cursor-pointer
                        transition-all duration-200
                        ${isHovered 
                          ? 'bg-[#30D6D6]/10 scale-105' 
                          : 'hover:bg-[#30D6D6]/5'
                        }
                      `}
                      onMouseEnter={() => onPatternHover(pattern.id)}
                      onMouseLeave={() => onPatternHover(null)}
                      style={{
                        borderLeft: isHovered ? `3px solid ${typeColor}` : 'none',
                        paddingLeft: isHovered ? '8px' : '0',
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <code
                          className="font-mono text-cyan-100/70 bg-black/50 px-2 py-0.5 rounded"
                          style={{
                            color: isHovered ? typeColor : undefined,
                          }}
                        >
                          {pattern.value}
                        </code>
                        <span className="text-cyan-100/40 text-[10px]">
                          {pattern.positions.length} position{pattern.positions.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      
                      <span className="text-cyan-100/50 font-bold tabular-nums">
                        {pattern.count}×
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary Stats */}
      <div className="mt-4 pt-3 border-t border-[#30D6D6]/20">
        <div className="grid grid-cols-3 gap-2 text-xs">
          <div className="text-center">
            <div
              className="font-bold text-lg"
              style={{ color: getPatternColor('motif') }}
            >
              {patternsByType['motif']?.length || 0}
            </div>
            <div className="text-cyan-100/50 text-[10px]">Motif Types</div>
          </div>
          
          <div className="text-center">
            <div
              className="font-bold text-lg"
              style={{ color: getPatternColor('run') }}
            >
              {patternsByType['run']?.length || 0}
            </div>
            <div className="text-cyan-100/50 text-[10px]">Runs</div>
          </div>
          
          <div className="text-center">
            <div className="font-bold text-lg text-[#30D6D6]">
              {patterns.length}
            </div>
            <div className="text-cyan-100/50 text-[10px]">Total Patterns</div>
          </div>
        </div>
      </div>

      {/* Coverage indicator */}
      <div className="mt-4 pt-3 border-t border-[#30D6D6]/20">
        <div className="text-[10px] text-cyan-100/40 mb-2">
          GENOME_COVERAGE
        </div>
        <div className="flex items-center gap-2">
          <div className="flex-1 h-2 bg-black/50 rounded overflow-hidden">
            <div
              className="h-full bg-[#30D6D6] transition-all duration-300"
              style={{
                width: `${calculateCoverage(patterns, segment.length)}%`,
                boxShadow: '0 0 10px rgba(48, 214, 214, 0.5)',
              }}
            />
          </div>
          <div className="text-xs font-mono text-cyan-100/50 tabular-nums">
            {calculateCoverage(patterns, segment.length)}%
          </div>
        </div>
        <div className="text-[10px] text-cyan-100/40 mt-1">
          {getUniquePositions(patterns).size} / {segment.length} bases covered
        </div>
      </div>
    </div>
  );
}

/**
 * Calculate percentage of segment covered by patterns
 */
function calculateCoverage(patterns: DetectedPattern[], segmentLength: number): number {
  const uniquePositions = getUniquePositions(patterns);
  return Math.round((uniquePositions.size / segmentLength) * 100);
}

/**
 * Get set of all unique positions covered by patterns
 */
function getUniquePositions(patterns: DetectedPattern[]): Set<number> {
  const positions = new Set<number>();
  
  patterns.forEach(pattern => {
    pattern.positions.forEach(pos => positions.add(pos));
  });
  
  return positions;
}