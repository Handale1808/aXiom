// lib/components/about/stats/hooks/useGenomeScenarios.ts

'use client';

import { useMemo } from 'react';
import { generateScenarios } from '../utils/scenarioGenerators';
import type { Scenario } from '../utils/scenarioGenerators';

interface UseGenomeScenariosOptions {
  statId: string;
  segmentLength?: number;
}

interface UseGenomeScenariosReturn {
  scenarios: Scenario[];
  applyScenario: (scenarioId: string, genome: string, subregion: { start: number; end: number }) => string;
}

/**
 * Custom hook to generate and apply genome scenarios
 * 
 * Handles:
 * - Generating test patterns for a specific stat
 * - Applying scenarios to replace genome segments
 * - Memoizing scenarios to avoid regeneration
 * 
 * @param options - statId and optional segment length
 * @returns scenarios array and applyScenario function
 */
export function useGenomeScenarios(options: UseGenomeScenariosOptions): UseGenomeScenariosReturn {
  const { statId, segmentLength = 100 } = options;

  // Memoize scenarios to avoid regeneration on every render
  const scenarios = useMemo(() => {
    return generateScenarios(statId, segmentLength);
  }, [statId, segmentLength]);

  /**
   * Apply a scenario to replace a genome segment
   * 
   * @param scenarioId - ID of the scenario to apply
   * @param genome - Full 1000-base genome string
   * @param subregion - Start/end coordinates of segment to replace
   * @returns New genome string with scenario pattern applied
   */
  const applyScenario = (
    scenarioId: string,
    genome: string,
    subregion: { start: number; end: number }
  ): string => {
    // Find the scenario
    const scenario = scenarios.find(s => s.id === scenarioId);
    
    if (!scenario) {
      console.error(`Scenario not found: ${scenarioId}`);
      return genome;
    }

    // Ensure pattern matches segment length
    const segmentLength = subregion.end - subregion.start + 1;
    let pattern = scenario.pattern;
    
    // If pattern is shorter than segment, pad it
    if (pattern.length < segmentLength) {
      console.warn(`Pattern length (${pattern.length}) is shorter than segment (${segmentLength}). Padding with original bases.`);
      const originalSegment = genome.substring(subregion.start, subregion.end + 1);
      pattern = pattern + originalSegment.substring(pattern.length);
    }
    
    // If pattern is longer than segment, truncate it
    if (pattern.length > segmentLength) {
      pattern = pattern.substring(0, segmentLength);
    }

    // Replace the segment in the genome
    const before = genome.substring(0, subregion.start);
    const after = genome.substring(subregion.end + 1);
    
    return before + pattern + after;
  };

  return {
    scenarios,
    applyScenario,
  };
}