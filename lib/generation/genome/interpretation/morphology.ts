// lib/genome/interpretation/morphology.ts

import type { IPhysicalTraits, SkinType, Size } from '@/models/CatAliens';
import type { InterpretationResult, DebugInfo } from '../types';
import { SUBREGIONS, MOTIFS, SYMBOL_MAPPINGS } from '../regions';
import {
  extractRegion,
  detectTandemRepeats,
  findDominantSymbol,
  countSymbols,
  findMotifs,
  rgbToHex,
  createDebugInfo,
  calculateEntropy,
  countSymbolRuns,
  countSymbolTransitions
} from './utils';
import {
  interpretPerceptionStat,
  interpretAgilityStat,
  interpretEnduranceStat
} from './interpreters';

/**
 * Interpret appendage count - hash-based for maximum variation
 */
function interpretAppendageCount(
  segment: string,
  debug: boolean = false
): { count: number; debugInfo?: any } {
  // Create a simple hash from the segment
  let hash = 0;
  for (let i = 0; i < Math.min(segment.length, 10); i++) {
    hash = ((hash << 5) - hash) + segment.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Use absolute value and modulo to get 0-10
  const count = Math.abs(hash) % 11;
  
  return { count };
}

/**
 * Interpret Body Plan subregion → legs, tails, size
 */
function interpretBodyPlan(
  genome: string,
  debug: boolean
): { legs: number; tails: number; size: Size; debugInfo?: DebugInfo } {
  const { start, end } = SUBREGIONS.BODY_PLAN;
  const segment = extractRegion(genome, start, end);
  
  // Legs: use appendage interpreter on first half
  const legsSegment = segment.substring(0, 50);
  const legs = interpretAppendageCount(legsSegment).count;
  
  // Tails: use appendage interpreter on second half
  const tailsSegment = segment.substring(50, 100);
  const tails = interpretAppendageCount(tailsSegment).count;
  
  // Size: based on dominant symbol frequency
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantCount = counts[dominantSymbol];
  
  let size: Size = 'medium';
  for (const threshold of SYMBOL_MAPPINGS.SIZE_THRESHOLDS) {
    if (dominantCount >= threshold.min && dominantCount <= threshold.max) {
      size = threshold.size as Size;
      break;
    }
  }
  
  const result: { legs: number; tails: number; size: Size; debugInfo?: DebugInfo } = {
    legs,
    tails,
    size
  };
  
  if (debug) {
    result.debugInfo = createDebugInfo('Body Plan', segment, {
      includeDominant: true,
      includeRepeats: true
    });
    result.debugInfo.derivedValue = { legs, tails, size };
  }
  
  return result;
}

/**
 * Interpret Sensory subregion → eyes, perception stat
 */
function interpretSensory(
  genome: string,
  debug: boolean
): { eyes: number; perception: number; debugInfo?: DebugInfo } {
  const { start, end } = SUBREGIONS.SENSORY;
  const segment = extractRegion(genome, start, end);
  
  // Eyes: use appendage interpreter
  const eyes = interpretAppendageCount(segment).count;
  
  // Perception stat: use new opposing forces interpreter
  const perceptionResult = interpretPerceptionStat(segment, debug);
  const perception = perceptionResult.value;
  
  const result: { eyes: number; perception: number; debugInfo?: DebugInfo } = { 
    eyes, 
    perception 
  };
  
  if (debug) {
    result.debugInfo = createDebugInfo('Sensory', segment, {
      motifs: MOTIFS.PERCEPTION,
      includeRepeats: true,
      includeEntropy: true
    });
    result.debugInfo.derivedValue = { 
      eyes, 
      perception,
      perceptionBreakdown: perceptionResult.debugInfo
    };
  }
  
  return result;
}

/**
 * Interpret Locomotion subregion → wings, agility stat
 */
function interpretLocomotion(
  genome: string,
  debug: boolean
): { wings: number; agility: number; debugInfo?: DebugInfo } {
  const { start, end } = SUBREGIONS.LOCOMOTION;
  const segment = extractRegion(genome, start, end);
  
  // Wings: use appendage interpreter
  const wings = interpretAppendageCount(segment).count;
  
  // Agility stat: use new opposing forces interpreter
  const agilityResult = interpretAgilityStat(segment, debug);
  const agility = agilityResult.value;
  
  const result: { wings: number; agility: number; debugInfo?: DebugInfo } = { 
    wings, 
    agility 
  };
  
  if (debug) {
    result.debugInfo = createDebugInfo('Locomotion', segment, {
      motifs: MOTIFS.AGILITY,
      includeRepeats: true,
      includeEntropy: true
    });
    result.debugInfo.derivedValue = { 
      wings, 
      agility,
      agilityBreakdown: agilityResult.debugInfo
    };
  }
  
  return result;
}

/**
 * Interpret Defense subregion → skinType, hasClaws, hasFangs, colour, endurance stat
 */
function interpretDefense(
  genome: string,
  debug: boolean
): { 
  skinType: SkinType; 
  hasClaws: boolean; 
  hasFangs: boolean; 
  colour: string;
  endurance: number;
  debugInfo?: DebugInfo 
} {
  const { start, end } = SUBREGIONS.DEFENSE;
  const segment = extractRegion(genome, start, end);
  
  // SkinType: based on dominant symbol
  const dominantSymbol = findDominantSymbol(segment);
  const skinType = SYMBOL_MAPPINGS.SKIN_TYPE[dominantSymbol] as SkinType;
  
  // Claws and Fangs: motif presence
  const clawMatches = findMotifs(segment, MOTIFS.CLAWS);
  const fangMatches = findMotifs(segment, MOTIFS.FANGS);
  const hasClaws = clawMatches.length > 0;
  const hasFangs = fangMatches.length > 0;
  
  // Colour: direct base mapping (first 3 bases of Defense region)
  const colorSegment = segment.substring(0, 3);
  const colorValues = SYMBOL_MAPPINGS.COLOR_VALUES;
  
  const red = colorValues[colorSegment[0] as keyof typeof colorValues] || 0;
  const green = colorValues[colorSegment[1] as keyof typeof colorValues] || 0;
  const blue = colorValues[colorSegment[2] as keyof typeof colorValues] || 0;
  
  const colour = rgbToHex(red, green, blue);
  
  // Endurance stat: use new opposing forces interpreter
  const enduranceResult = interpretEnduranceStat(segment, debug);
  const endurance = enduranceResult.value;
  
  const result: { 
    skinType: SkinType; 
    hasClaws: boolean; 
    hasFangs: boolean;
    colour: string;
    endurance: number;
    debugInfo?: DebugInfo 
  } = {
    skinType,
    hasClaws,
    hasFangs,
    colour,
    endurance
  };
  
  if (debug) {
    result.debugInfo = createDebugInfo('Defense', segment, {
      motifs: [...MOTIFS.CLAWS, ...MOTIFS.FANGS, ...MOTIFS.ENDURANCE],
      includeDominant: true,
      includeEntropy: true
    });
    result.debugInfo.derivedValue = { 
      skinType, 
      hasClaws, 
      hasFangs, 
      colour, 
      endurance,
      enduranceBreakdown: enduranceResult.debugInfo
    };
  }
  
  return result;
}

/**
 * Main morphology interpreter
 * Interprets entire Morphology region (0-399) → PhysicalTraits + partial Stats
 */
export function interpretMorphology(
  genome: string,
  debug: boolean = false
): InterpretationResult<{
  physicalTraits: IPhysicalTraits;
  perception: number;
  agility: number;
  endurance: number;
}> {
  const bodyPlan = interpretBodyPlan(genome, debug);
  const sensory = interpretSensory(genome, debug);
  const locomotion = interpretLocomotion(genome, debug);
  const defense = interpretDefense(genome, debug);
  
  const physicalTraits: IPhysicalTraits = {
    legs: bodyPlan.legs,
    tails: bodyPlan.tails,
    size: bodyPlan.size,
    eyes: sensory.eyes,
    wings: locomotion.wings,
    skinType: defense.skinType,
    hasClaws: defense.hasClaws,
    hasFangs: defense.hasFangs,
    colour: defense.colour
  };
  
  const result: InterpretationResult<{
    physicalTraits: IPhysicalTraits;
    perception: number;
    agility: number;
    endurance: number;
  }> = {
    value: {
      physicalTraits,
      perception: sensory.perception,
      agility: locomotion.agility,
      endurance: defense.endurance
    }
  };
  
  if (debug) {
    result.debugInfo = {
      region: 'Morphology (complete)',
      foundMotifs: [],
      symbolFrequencies: {} as any,
      derivedValue: result.value
    };
  }
  
  return result;
}