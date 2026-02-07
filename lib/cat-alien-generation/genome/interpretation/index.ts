// lib/genome/interpretation/index.ts

import type { IPhysicalTraits, IStats, IResistances, IBehavior } from '@/models/CatAliens';
import type { DebugInfo } from '../types';
import { interpretMorphology } from './morphology';
import { interpretMetabolism } from './metabolism';
import { interpretCognition } from './cognition';
import { interpretPower } from './power';
import { isValidGenome } from '../validation';

/**
 * Complete genome interpretation result
 * Contains all phenotypic traits derived from genome
 */
export interface GenomeInterpretationResult {
  physicalTraits: IPhysicalTraits;
  stats: IStats;
  resistances: IResistances;
  behavior: IBehavior;
  debugInfo?: {
    morphology?: DebugInfo;
    metabolism?: DebugInfo;
    cognition?: DebugInfo;
    power?: DebugInfo;
  };
}

/**
 * Main genome interpreter
 * Converts genome string → complete phenotype
 * 
 * This is the primary function that orchestrates all region interpreters
 * and assembles a complete phenotype from a 1000-base genome string.
 * 
 * @param genome - 1000-base genome string
 * @param options - Optional configuration (debug mode)
 * @returns Complete phenotype with all traits, stats, resistances, and behaviors
 * @throws Error if genome is invalid
 */
export function interpretGenome(
  genome: string,
  options?: { debug?: boolean }
): GenomeInterpretationResult {
  const debug = options?.debug ?? false;
  
  // Validate genome before interpretation
  if (!isValidGenome(genome)) {
    throw new Error('Invalid genome string provided to interpreter');
  }
  
  // Interpret each region
  const morphologyResult = interpretMorphology(genome, debug);
  const metabolismResult = interpretMetabolism(genome, debug);
  const cognitionResult = interpretCognition(genome, debug);
  const powerResult = interpretPower(genome, debug);
  
  // Assemble complete stats from multiple regions
  const stats: IStats = {
    strength: powerResult.value.strength,
    agility: morphologyResult.value.agility,
    endurance: morphologyResult.value.endurance,
    intelligence: cognitionResult.value.intelligence,
    perception: morphologyResult.value.perception,
    psychic: powerResult.value.psychic
  };
  
  // Merge resistances from metabolism (poison, acid, fire, cold) and power (psychic, radiation)
  const resistances: IResistances = {
    poison: metabolismResult.value.poison!,
    acid: metabolismResult.value.acid!,
    fire: metabolismResult.value.fire!,
    cold: metabolismResult.value.cold!,
    psychic: powerResult.value.psychicResistance,
    radiation: powerResult.value.radiationResistance
  };
  
  // Assemble complete result
  const result: GenomeInterpretationResult = {
    physicalTraits: morphologyResult.value.physicalTraits,
    stats,
    resistances,
    behavior: cognitionResult.value.behavior
  };
  
  // Add debug info if requested
  if (debug) {
    result.debugInfo = {
      morphology: morphologyResult.debugInfo,
      metabolism: metabolismResult.debugInfo,
      cognition: cognitionResult.debugInfo,
      power: powerResult.debugInfo
    };
  }
  
  return result;
}

// Re-export individual interpreters for convenience/testing
export { interpretMorphology } from './morphology';
export { interpretMetabolism } from './metabolism';
export { interpretCognition } from './cognition';
export { interpretPower } from './power';