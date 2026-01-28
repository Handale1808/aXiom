// lib/genome/interpretation/morphology.ts

import type { IPhysicalTraits, SkinType, Size } from '@/models/Cats';
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
  countUniqueMotifs,
  calculateEntropy
} from './utils';

/**
 * Interpret stat value using standard stat formula
 * Used for perception, agility, and endurance stats
 * 
 * Factor A: Motif presence (+1 per unique motif, cap at +3)
 * Factor B: Symbol diversity (entropy score, 0-3)
 * Factor C: Repeating patterns (+1 per unique repeat, cap at +2)
 * Total: base 1 + bonuses, cap at 10
 */
function interpretStat(
  segment: string,
  motifs: string[],
  statName: string,
  debug: boolean
): { value: number; debugInfo?: DebugInfo } {
  // Factor A: Motif presence
  const motifCount = countUniqueMotifs(segment, motifs);
  const motifBonus = Math.min(3, motifCount);
  
  // Factor B: Symbol diversity (entropy)
  const entropy = calculateEntropy(segment);
  const diversityBonus = entropy > 2.5 ? 3 : entropy > 2.0 ? 2 : entropy > 1.0 ? 1 : 0;
  
  // Factor C: Repeating patterns
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
 * Interpret Body Plan subregion → legs, tails, size
 */
function interpretBodyPlan(
  genome: string,
  debug: boolean
): { legs: number; tails: number; size: Size; debugInfo?: DebugInfo } {
  const { start, end } = SUBREGIONS.BODY_PLAN;
  const segment = extractRegion(genome, start, end);
  
  // Legs: count tandem repeats in first half
  const legsSegment = segment.substring(0, 50);
  const legsRepeats = detectTandemRepeats(legsSegment);
  const legs = Math.min(10, legsRepeats.length);
  
  // Tails: count tandem repeats in second half
  const tailsSegment = segment.substring(50, 100);
  const tailsRepeats = detectTandemRepeats(tailsSegment);
  const tails = Math.min(10, tailsRepeats.length);
  
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
  
  // Eyes: count tandem repeats
  const repeats = detectTandemRepeats(segment);
  const eyes = Math.min(10, repeats.length);
  
  // Perception stat: use standard stat formula
  const perceptionResult = interpretStat(segment, MOTIFS.PERCEPTION, 'Sensory - Perception', debug);
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
    result.debugInfo.derivedValue = { eyes, perception };
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
  
  // Wings: count tandem repeats
  const repeats = detectTandemRepeats(segment);
  const wings = Math.min(10, repeats.length);
  
  // Agility stat: use standard stat formula
  const agilityResult = interpretStat(segment, MOTIFS.AGILITY, 'Locomotion - Agility', debug);
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
    result.debugInfo.derivedValue = { wings, agility };
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
  
  // Colour: direct base mapping (first 24 bases of Defense region)
  const colorSegment = segment.substring(0, 24);
  const colorValues = SYMBOL_MAPPINGS.COLOR_VALUES;
  
  // Red component (bases 0-7)
  let redSum = 0;
  for (let i = 0; i < 8; i++) {
    const symbol = colorSegment[i];
    redSum += colorValues[symbol as keyof typeof colorValues] || 0;
  }
  const red = redSum / 8;
  
  // Green component (bases 8-15)
  let greenSum = 0;
  for (let i = 8; i < 16; i++) {
    const symbol = colorSegment[i];
    greenSum += colorValues[symbol as keyof typeof colorValues] || 0;
  }
  const green = greenSum / 8;
  
  // Blue component (bases 16-23)
  let blueSum = 0;
  for (let i = 16; i < 24; i++) {
    const symbol = colorSegment[i];
    blueSum += colorValues[symbol as keyof typeof colorValues] || 0;
  }
  const blue = blueSum / 8;
  
  const colour = rgbToHex(red, green, blue);
  
  // Endurance stat: use standard stat formula
  const enduranceResult = interpretStat(segment, MOTIFS.ENDURANCE, 'Defense - Endurance', debug);
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
    result.debugInfo.derivedValue = { skinType, hasClaws, hasFangs, colour, endurance };
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