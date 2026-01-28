// lib/genome/interpretation/power.ts

import type { InterpretationResult, DebugInfo } from '../types';
import { SUBREGIONS, MOTIFS } from '../regions';
import {
  extractRegion,
  countUniqueMotifs,
  calculateEntropy,
  detectTandemRepeats,
  findMotifs,
  findDominantSymbol,
  countSymbols,
  createDebugInfo
} from './utils';

/**
 * Generic stat interpreter (used for strength and psychic stats)
 * 
 * Formula:
 * - Factor A: Motif presence (+1 per unique motif, cap at +3)
 * - Factor B: Symbol diversity (entropy score, 0-3)
 * - Factor C: Repeating patterns (+1 per unique repeat, cap at +2)
 * - Total: base 1 + bonuses, cap at 10
 */
function interpretStat(
  genome: string,
  start: number,
  end: number,
  motifs: string[],
  statName: string,
  debug: boolean
): { value: number; debugInfo?: DebugInfo } {
  const segment = extractRegion(genome, start, end);
  
  // Factor A: Motif presence (+1 per unique motif, cap at +3)
  const motifCount = countUniqueMotifs(segment, motifs);
  const motifBonus = Math.min(3, motifCount);
  
  // Factor B: Symbol diversity (entropy score, 0-3)
  const entropy = calculateEntropy(segment);
  const diversityBonus = entropy > 2.5 ? 3 : entropy > 2.0 ? 2 : entropy > 1.0 ? 1 : 0;
  
  // Factor C: Repeating patterns (+1 per unique repeat, cap at +2)
  const repeats = detectTandemRepeats(segment);
  const repeatBonus = Math.min(2, repeats.length);
  
  // Total stat: base 1 + bonuses, cap at 10
  const statValue = Math.min(10, 1 + motifBonus + diversityBonus + repeatBonus);
  
  const result: { value: number; debugInfo?: DebugInfo } = { value: statValue };
  
  if (debug) {
    result.debugInfo = createDebugInfo(statName, segment, {
      motifs,
      includeEntropy: true,
      includeRepeats: true
    });
    result.debugInfo.derivedValue = {
      stat: statValue,
      breakdown: { motifBonus, diversityBonus, repeatBonus }
    };
  }
  
  return result;
}

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
  const strength = interpretStat(
    genome,
    SUBREGIONS.PHYSICAL_POWER.start,
    SUBREGIONS.PHYSICAL_POWER.end,
    MOTIFS.STRENGTH,
    'Physical Power - Strength',
    debug
  );
  
  // Psychic Potential subregion (900-999) → psychic stat + resistances
  const psychicStat = interpretStat(
    genome,
    SUBREGIONS.PSYCHIC.start,
    SUBREGIONS.PSYCHIC.end,
    MOTIFS.PSYCHIC,
    'Psychic Potential - Psychic Stat',
    debug
  );
  
  // Psychic resistance (900-949)
  const psychicResistance = interpretResistance(
    genome,
    900,
    949,
    MOTIFS.PSYCHIC_RESISTANCE,
    'Psychic Potential - Psychic Resistance',
    debug
  );
  
  // Radiation resistance (950-999)
  const radiationResistance = interpretResistance(
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
      strength: strength.value,
      psychic: psychicStat.value,
      psychicResistance: psychicResistance.value,
      radiationResistance: radiationResistance.value
    }
  };
  
  if (debug) {
    result.debugInfo = {
      region: 'Power (complete)',
      foundMotifs: [],
      symbolFrequencies: {} as any,
      derivedValue: result.value
    };
  }
  
  return result;
}