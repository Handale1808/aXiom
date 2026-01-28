// lib/genome/interpretation/power.ts

import type { InterpretationResult, DebugInfo } from '../types';
import { SUBREGIONS, MOTIFS } from '../regions';
import {
  extractRegion,
  findMotifs,
  findDominantSymbol,
  countSymbols,
  calculateEntropy,
  createDebugInfo
} from './utils';
import {
  interpretStrengthStat,
  interpretPsychicStat
} from './statInterpreters';

/**
 * Generic resistance interpreter (same as metabolism.ts implementation)
 * 
 * Formula:
 * - Motif bonus: +10 per motif found, cap at +50
 * - Symbol frequency bonus: dominant symbol percentage * 30 (0-30 points)
 * - Entropy bonus: high diversity = bonus (0-20 points)
 * - Total: sum of bonuses, cap at 100
 */
function interpretResistance(
  genome: string,
  start: number,
  end: number,
  motifs: string[],
  regionName: string,
  debug: boolean
): { value: number; debugInfo?: DebugInfo } {
  const segment = extractRegion(genome, start, end);
  
  // Motif bonus: +10 per motif found, cap at +50
  const motifMatches = findMotifs(segment, motifs);
  const motifBonus = Math.min(50, motifMatches.length * 10);
  
  // Symbol frequency bonus: dominant symbol percentage (0-30 points)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const segmentLength = segment.length;
  const dominantPercentage = counts[dominantSymbol] / segmentLength;
  const frequencyBonus = Math.round(dominantPercentage * 30);
  
  // Entropy bonus: high diversity = bonus (0-20 points)
  const entropy = calculateEntropy(segment);
  const entropyBonus = entropy > 2.5 ? 20 : entropy > 2.0 ? 10 : 0;
  
  // Total resistance
  const resistance = Math.min(100, motifBonus + frequencyBonus + entropyBonus);
  
  const result: { value: number; debugInfo?: DebugInfo } = { value: resistance };
  
  if (debug) {
    result.debugInfo = createDebugInfo(regionName, segment, {
      motifs,
      includeEntropy: true,
      includeDominant: true
    });
    result.debugInfo.derivedValue = {
      resistance,
      breakdown: { motifBonus, frequencyBonus, entropyBonus }
    };
  }
  
  return result;
}

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
  const psychicResistanceResult = interpretResistance(
    genome,
    900,
    949,
    MOTIFS.PSYCHIC_RESISTANCE,
    'Psychic Potential - Psychic Resistance',
    debug
  );
  
  // Radiation resistance (950-999)
  const radiationResistanceResult = interpretResistance(
    genome,
    950,
    999,
    MOTIFS.RADIATION,
    'Psychic Potential - Radiation Resistance',
    debug
  );
  
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
        radiationResistance: radiationResistanceResult.value
      }
    };
  }
  
  return result;
}