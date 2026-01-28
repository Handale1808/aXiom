// lib/genome/interpretation/power.ts

import type { InterpretationResult, DebugInfo } from '../types';
import { SUBREGIONS } from '../regions';
import { extractRegion } from './utils';
import {
  interpretStrengthStat,
  interpretPsychicStat
} from './statInterpreters';
import {
  interpretPsychicResistance,
  interpretRadiationResistance
} from './resistanceInterpreters';

/**
 * Main power interpreter
 * Interprets entire Power region (800-999) → Strength, Psychic stats + Psychic/Radiation resistances
 */
export function interpretPower(
  genome: string,
  debug: boolean = false
): InterpretationResult<{
  strength: number;
  psychic: number;
  psychicResistance: number;
  radiationResistance: number;
}> {
  // Physical Power subregion (800-899) → strength stat
  const strengthSegment = extractRegion(
    genome,
    SUBREGIONS.PHYSICAL_POWER.start,
    SUBREGIONS.PHYSICAL_POWER.end
  );
  const strengthResult = interpretStrengthStat(strengthSegment, debug);
  const strength = strengthResult.value;
  
  // Psychic Potential subregion (900-999) → psychic stat + resistances
  const psychicSegment = extractRegion(
    genome,
    SUBREGIONS.PSYCHIC.start,
    SUBREGIONS.PSYCHIC.end
  );
  const psychicResult = interpretPsychicStat(psychicSegment, debug);
  const psychic = psychicResult.value;
  
  // Psychic resistance (900-949)
  const psychicResistanceSegment = extractRegion(genome, 900, 949);
  const psychicResistanceResult = interpretPsychicResistance(psychicResistanceSegment, debug);
  
  // Radiation resistance (950-999)
  const radiationResistanceSegment = extractRegion(genome, 950, 999);
  const radiationResistanceResult = interpretRadiationResistance(radiationResistanceSegment, debug);
  
  const result: InterpretationResult<{
    strength: number;
    psychic: number;
    psychicResistance: number;
    radiationResistance: number;
  }> = {
    value: {
      strength,
      psychic,
      psychicResistance: psychicResistanceResult.value,
      radiationResistance: radiationResistanceResult.value
    }
  };
  
  if (debug) {
    result.debugInfo = {
      region: 'Power (complete)',
      foundMotifs: [],
      symbolFrequencies: {} as any,
      derivedValue: {
        strength,
        strengthBreakdown: strengthResult.debugInfo,
        psychic,
        psychicBreakdown: psychicResult.debugInfo,
        psychicResistance: psychicResistanceResult.value,
        psychicResistanceBreakdown: psychicResistanceResult.debugInfo,
        radiationResistance: radiationResistanceResult.value,
        radiationResistanceBreakdown: radiationResistanceResult.debugInfo
      }
    };
  }
  
  return result;
}