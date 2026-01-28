// lib/genome/interpretation/metabolism.ts

import type { IResistances } from '@/models/Cats';
import type { InterpretationResult, DebugInfo } from '../types';
import { SUBREGIONS, MOTIFS } from '../regions';
import {
  extractRegion,
  countSymbols,
  findDominantSymbol,
  findMotifs,
  calculateEntropy,
  createDebugInfo
} from './utils';

/**
 * Generic resistance interpreter
 * Used for all resistance types
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
 * Main metabolism interpreter
 * Interprets entire Metabolism region (400-599) → Partial Resistances
 * 
 * Note: This only fills poison, acid, fire, cold resistances.
 * Psychic and radiation resistances are filled by power.ts
 */
export function interpretMetabolism(
  genome: string,
  debug: boolean = false
): InterpretationResult<Partial<IResistances>> {
  // Toxin Processing subregion (400-499)
  // Split into poison (400-449) and acid (450-499)
  const poisonStart = 400;
  const poisonEnd = 449;
  const acidStart = 450;
  const acidEnd = 499;
  
  const poison = interpretResistance(
    genome,
    poisonStart,
    poisonEnd,
    MOTIFS.POISON,
    'Toxin - Poison',
    debug
  );
  
  const acid = interpretResistance(
    genome,
    acidStart,
    acidEnd,
    MOTIFS.ACID,
    'Toxin - Acid',
    debug
  );
  
  // Thermal Regulation subregion (500-599)
  // Split into fire (500-549) and cold (550-599)
  const fireStart = 500;
  const fireEnd = 549;
  const coldStart = 550;
  const coldEnd = 599;
  
  const fire = interpretResistance(
    genome,
    fireStart,
    fireEnd,
    MOTIFS.FIRE,
    'Thermal - Fire',
    debug
  );
  
  const cold = interpretResistance(
    genome,
    coldStart,
    coldEnd,
    MOTIFS.COLD,
    'Thermal - Cold',
    debug
  );
  
  // Create partial resistances object
  // psychic and radiation will be filled by power.ts
  const resistances: Partial<IResistances> = {
    poison: poison.value,
    acid: acid.value,
    fire: fire.value,
    cold: cold.value
  };
  
  const result: InterpretationResult<Partial<IResistances>> = {
    value: resistances
  };
  
  if (debug) {
    result.debugInfo = {
      region: 'Metabolism (complete)',
      foundMotifs: [],
      symbolFrequencies: {} as any,
      derivedValue: resistances
    };
  }
  
  return result;
}