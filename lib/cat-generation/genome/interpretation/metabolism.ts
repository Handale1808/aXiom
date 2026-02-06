// lib/genome/interpretation/metabolism.ts

import type { IResistances } from '@/models/Cats';
import type { InterpretationResult, DebugInfo } from '../types';
import { SUBREGIONS } from '../regions';
import { extractRegion } from './utils';
import {
  interpretPoisonResistance,
  interpretAcidResistance,
  interpretFireResistance,
  interpretColdResistance
} from './interpreters';

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
  const poisonSegment = extractRegion(genome, 400, 449);
  const acidSegment = extractRegion(genome, 450, 499);
  
  const poisonResult = interpretPoisonResistance(poisonSegment, debug);
  const acidResult = interpretAcidResistance(acidSegment, debug);
  
  // Thermal Regulation subregion (500-599)
  // Split into fire (500-549) and cold (550-599)
  const fireSegment = extractRegion(genome, 500, 549);
  const coldSegment = extractRegion(genome, 550, 599);
  
  const fireResult = interpretFireResistance(fireSegment, debug);
  const coldResult = interpretColdResistance(coldSegment, debug);
  
  // Create partial resistances object
  // psychic and radiation will be filled by power.ts
  const resistances: Partial<IResistances> = {
    poison: poisonResult.value,
    acid: acidResult.value,
    fire: fireResult.value,
    cold: coldResult.value
  };
  
  const result: InterpretationResult<Partial<IResistances>> = {
    value: resistances
  };
  
  if (debug) {
    result.debugInfo = {
      region: 'Metabolism (complete)',
      foundMotifs: [],
      symbolFrequencies: {} as any,
      derivedValue: {
        poison: poisonResult.value,
        poisonBreakdown: poisonResult.debugInfo,
        acid: acidResult.value,
        acidBreakdown: acidResult.debugInfo,
        fire: fireResult.value,
        fireBreakdown: fireResult.debugInfo,
        cold: coldResult.value,
        coldBreakdown: coldResult.debugInfo
      }
    };
  }
  
  return result;
}