// lib/genome/interpretation/resistanceInterpreters.ts

import type { DebugInfo } from '../types';
import { MOTIFS } from '../regions';
import {
  calculateEntropy,
  countSymbolRuns,
  countRareSymbols,
  findMotifs,
  findDominantSymbol,
  countSymbols,
  countSymbolTransitions,
  calculateFrequencyVariance,
  countCatDNA,
  findOverlappingPatterns,
  countUniqueMotifs
} from './utils';

/**
 * Resistance interpretation result with debug info
 */
interface ResistanceResult {
  value: number;
  debugInfo?: {
    specializationScore: number;
    specializationComponents: Record<string, number>;
    chaosPenalty: number;
    chaosComponents: Record<string, number>;
    rawScore: number;
    mapping: string;
  };
}

/**
 * Clamp a value between min and max
 */
function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Convert raw score (-100 to +100) to final resistance (0 to 100)
 */
function rawScoreToResistance(rawScore: number): number {
  const normalized = 50 + (rawScore / 2);
  return Math.round(clamp(normalized, 0, 100));
}

// ============================================================================
// POISON RESISTANCE - THE ADAPTIVE
// ============================================================================

/**
 * Interpret Poison resistance using opposing forces
 * 
 * Philosophy: Resistance from repeated exposure and adaptation
 * Favors: Redundant motifs, repeated patterns, consistency
 * Penalized by: Rare symbols, high volatility, randomness
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Poison resistance (0-100) with optional debug info
 */
export function interpretPoisonResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Motif Redundancy (0-50 points)
  const allMotifMatches = findMotifs(segment, MOTIFS.POISON);
  const motifCounts = new Map<string, number>();
  for (const match of allMotifMatches) {
    motifCounts.set(match.motif, (motifCounts.get(match.motif) || 0) + 1);
  }
  const repeatedMotifs = Array.from(motifCounts.values()).filter(count => count >= 2).length;
  const totalMotifOccurrences = allMotifMatches.length;
  const motifRedundancy = Math.min(50, (repeatedMotifs * 15) + (totalMotifOccurrences * 2));
  
  // 2. Pattern Consistency (0-30 points)
  const variance = calculateFrequencyVariance(segment);
  const patternConsistency = Math.max(0, 30 - (variance / 3));
  
  // 3. Adaptation Score (0-20 points)
  const uniqueMotifs = countUniqueMotifs(segment, MOTIFS.POISON);
  const adaptationScore = Math.min(20, uniqueMotifs * 7);
  
  const specializationScore = motifRedundancy + patternConsistency + adaptationScore;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Rare Symbol Penalty (0-40 points)
  const rareCount = countRareSymbols(segment, 4);
  const rareSymbolPenalty = Math.min(40, rareCount * 8);
  
  // 2. Volatility Penalty (0-40 points)
  const transitions = countSymbolTransitions(segment);
  const volatilityPenalty = Math.min(40, (transitions / segment.length) * 50);
  
  // 3. Randomness Penalty (0-20 points)
  const entropy = calculateEntropy(segment);
  const randomnessPenalty = entropy > 2.6 ? Math.min(20, (entropy - 2.6) * 50) : 0;
  
  const chaosPenalty = rareSymbolPenalty + volatilityPenalty + randomnessPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalResistance = rawScoreToResistance(rawScore);
  
  const result: ResistanceResult = { value: finalResistance };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        motifRedundancy: Math.round(motifRedundancy),
        patternConsistency: Math.round(patternConsistency),
        adaptationScore: Math.round(adaptationScore)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        rareSymbolPenalty: Math.round(rareSymbolPenalty),
        volatilityPenalty: Math.round(volatilityPenalty),
        randomnessPenalty: Math.round(randomnessPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalResistance}/100`
    };
  }
  
  return result;
}

// ============================================================================
// ACID RESISTANCE - THE FORTIFIED
// ============================================================================

/**
 * Interpret Acid resistance using opposing forces
 * 
 * Philosophy: Resistance from thick protective coating
 * Favors: Symbol runs, homogeneity, dominant concentration
 * Penalized by: Diversity, fragmentation, scattered patterns
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Acid resistance (0-100) with optional debug info
 */
export function interpretAcidResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Protective Coating (0-40 points)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantCount = counts[dominantSymbol];
  const protectiveCoating = (dominantCount / segment.length) * 40;
  
  // 2. Structural Runs (0-40 points)
  const runs = countSymbolRuns(segment, 3);
  const structuralRuns = Math.min(40, runs * 5);
  
  // 3. Motif Presence (0-20 points)
  const motifMatches = findMotifs(segment, MOTIFS.ACID);
  const motifPresence = Math.min(20, motifMatches.length * 3);
  
  const specializationScore = protectiveCoating + structuralRuns + motifPresence;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Diversity Penalty (0-50 points)
  const entropy = calculateEntropy(segment);
  const diversityPenalty = (entropy / 3) * 50;
  
  // 2. Fragmentation Penalty (0-30 points)
  const transitions = countSymbolTransitions(segment);
  const fragmentationPenalty = Math.min(30, (transitions / segment.length) * 40);
  
  // 3. Weakness Penalty (0-20 points)
  const rareCount = countRareSymbols(segment, 3);
  const weaknessPenalty = Math.min(20, rareCount * 5);
  
  const chaosPenalty = diversityPenalty + fragmentationPenalty + weaknessPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalResistance = rawScoreToResistance(rawScore);
  
  const result: ResistanceResult = { value: finalResistance };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        protectiveCoating: Math.round(protectiveCoating),
        structuralRuns: Math.round(structuralRuns),
        motifPresence: Math.round(motifPresence)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        diversityPenalty: Math.round(diversityPenalty),
        fragmentationPenalty: Math.round(fragmentationPenalty),
        weaknessPenalty: Math.round(weaknessPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalResistance}/100`
    };
  }
  
  return result;
}

// ============================================================================
// FIRE RESISTANCE - THE HEAT-RESISTANT
// ============================================================================

/**
 * Interpret Fire resistance using opposing forces
 * 
 * Philosophy: Resistance from heat-resistant proteins
 * Favors: Low entropy, dominance, long runs
 * Penalized by: High diversity, complexity, scattered motifs
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Fire resistance (0-100) with optional debug info
 */
export function interpretFireResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Thermal Stability (0-50 points)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const thermalStability = Math.min(50, dominantPercent / 2);
  
  // 2. Heat Resistance Motifs (0-30 points)
  const motifMatches = findMotifs(segment, MOTIFS.FIRE);
  const heatResistanceMotifs = Math.min(30, motifMatches.length * 4);
  
  // 3. Structural Integrity (0-20 points)
  const longRuns = countSymbolRuns(segment, 5);
  const structuralIntegrity = Math.min(20, longRuns * 5);
  
  const specializationScore = thermalStability + heatResistanceMotifs + structuralIntegrity;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Complexity Penalty (0-50 points)
  const entropy = calculateEntropy(segment);
  const complexityPenalty = (entropy / 3) * 50;
  
  // 2. Instability Penalty (0-30 points)
  const transitions = countSymbolTransitions(segment);
  const instabilityPenalty = Math.min(30, (transitions / segment.length) * 35);
  
  // 3. Vulnerability Penalty (0-20 points)
  const rareCount = countRareSymbols(segment, 5);
  const vulnerabilityPenalty = Math.min(20, rareCount * 4);
  
  const chaosPenalty = complexityPenalty + instabilityPenalty + vulnerabilityPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalResistance = rawScoreToResistance(rawScore);
  
  const result: ResistanceResult = { value: finalResistance };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        thermalStability: Math.round(thermalStability),
        heatResistanceMotifs: Math.round(heatResistanceMotifs),
        structuralIntegrity: Math.round(structuralIntegrity)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        complexityPenalty: Math.round(complexityPenalty),
        instabilityPenalty: Math.round(instabilityPenalty),
        vulnerabilityPenalty: Math.round(vulnerabilityPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalResistance}/100`
    };
  }
  
  return result;
}

// ============================================================================
// COLD RESISTANCE - THE INSULATED
// ============================================================================

/**
 * Interpret Cold resistance using opposing forces
 * 
 * Philosophy: Resistance from insulation layers
 * Favors: Medium runs, consistency, repeated patterns
 * Penalized by: Extreme transitions, high volatility, gaps
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Cold resistance (0-100) with optional debug info
 */
export function interpretColdResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Insulation Layers (0-40 points)
  const mediumRuns = countSymbolRuns(segment, 3) - countSymbolRuns(segment, 7);
  const insulationLayers = Math.min(40, Math.max(0, mediumRuns) * 4);
  
  // 2. Cold Resistance Motifs (0-40 points)
  const motifMatches = findMotifs(segment, MOTIFS.COLD);
  const coldResistanceMotifs = Math.min(40, motifMatches.length * 5);
  
  // 3. Thermal Consistency (0-20 points)
  const variance = calculateFrequencyVariance(segment);
  const thermalConsistency = Math.max(0, 20 - (variance / 4));
  
  const specializationScore = insulationLayers + coldResistanceMotifs + thermalConsistency;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Transition Penalty (0-40 points)
  const transitions = countSymbolTransitions(segment);
  const transitionPenalty = Math.min(40, (transitions / segment.length) * 45);
  
  // 2. Volatility Penalty (0-40 points)
  const entropy = calculateEntropy(segment);
  const volatilityPenalty = entropy > 2.5 ? Math.min(40, (entropy - 2.5) * 80) : 0;
  
  // 3. Gap Penalty (0-20 points)
  const rareCount = countRareSymbols(segment, 4);
  const gapPenalty = Math.min(20, rareCount * 5);
  
  const chaosPenalty = transitionPenalty + volatilityPenalty + gapPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalResistance = rawScoreToResistance(rawScore);
  
  const result: ResistanceResult = { value: finalResistance };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        insulationLayers: Math.round(insulationLayers),
        coldResistanceMotifs: Math.round(coldResistanceMotifs),
        thermalConsistency: Math.round(thermalConsistency)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        transitionPenalty: Math.round(transitionPenalty),
        volatilityPenalty: Math.round(volatilityPenalty),
        gapPenalty: Math.round(gapPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalResistance}/100`
    };
  }
  
  return result;
}

// ============================================================================
// PSYCHIC RESISTANCE - THE GROUNDED
// ============================================================================

/**
 * Interpret Psychic resistance using opposing forces
 * 
 * Philosophy: Resistance from being grounded in physical reality
 * Favors: Cat DNA concentration, simplicity, earthiness
 * Penalized by: Alien DNA, complexity, mystical patterns
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Psychic resistance (0-100) with optional debug info
 */
export function interpretPsychicResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Grounding (Cat DNA Concentration) (0-50 points)
  const catCount = countCatDNA(segment);
  const grounding = (catCount / segment.length) * 50;
  
  // 2. Mental Fortitude Motifs (0-30 points)
  const motifMatches = findMotifs(segment, MOTIFS.PSYCHIC_RESISTANCE);
  const mentalFortitude = Math.min(30, motifMatches.length * 4);
  
  // 3. Simplicity Bonus (0-20 points)
  const entropy = calculateEntropy(segment);
  const simplicityBonus = entropy < 2.0 ? Math.min(20, (2.0 - entropy) * 10) : 0;
  
  const specializationScore = grounding + mentalFortitude + simplicityBonus;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Alien DNA Interference (0-50 points)
  const alienCount = segment.length - catCount;
  const alienInterference = (alienCount / segment.length) * 50;
  
  // 2. Complexity Penalty (0-30 points)
  const complexityPenalty = entropy > 2.3 ? Math.min(30, (entropy - 2.3) * 43) : 0;
  
  // 3. Mystical Pattern Penalty (0-20 points)
  const overlappingPatterns = findOverlappingPatterns(segment);
  const mysticalPatternPenalty = Math.min(20, overlappingPatterns * 3);
  
  const chaosPenalty = alienInterference + complexityPenalty + mysticalPatternPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalResistance = rawScoreToResistance(rawScore);
  
  const result: ResistanceResult = { value: finalResistance };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        grounding: Math.round(grounding),
        mentalFortitude: Math.round(mentalFortitude),
        simplicityBonus: Math.round(simplicityBonus)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        alienInterference: Math.round(alienInterference),
        complexityPenalty: Math.round(complexityPenalty),
        mysticalPatternPenalty: Math.round(mysticalPatternPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalResistance}/100`
    };
  }
  
  return result;
}

// ============================================================================
// RADIATION RESISTANCE - THE REPAIRER
// ============================================================================

/**
 * Interpret Radiation resistance using opposing forces
 * 
 * Philosophy: Resistance from DNA repair mechanisms
 * Favors: Complex patterns, motif variety, repair sequences
 * Penalized by: Homogeneity, simple patterns, lack of redundancy
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Radiation resistance (0-100) with optional debug info
 */
export function interpretRadiationResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Repair Mechanisms (0-40 points)
  const uniqueMotifs = countUniqueMotifs(segment, MOTIFS.RADIATION);
  const repairMechanisms = Math.min(40, uniqueMotifs * 10);
  
  // 2. Complexity Score (0-40 points)
  const entropy = calculateEntropy(segment);
  const complexityScore = (entropy / 3) * 40;
  
  // 3. Redundancy Backup (0-20 points)
  const allMotifMatches = findMotifs(segment, MOTIFS.RADIATION);
  const totalMotifs = allMotifMatches.length;
  const redundancyBackup = Math.min(20, totalMotifs * 2);
  
  const specializationScore = repairMechanisms + complexityScore + redundancyBackup;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Homogeneity Penalty (0-50 points)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const homogeneityPenalty = dominantPercent > 50
    ? Math.min(50, (dominantPercent - 50) * 1.0)
    : 0;
  
  // 2. Simplicity Penalty (0-30 points)
  const simplicityPenalty = entropy < 2.0 ? Math.min(30, (2.0 - entropy) * 15) : 0;
  
  // 3. Motif Poverty Penalty (0-20 points)
  const motifPovertyPenalty = uniqueMotifs < 2 ? (2 - uniqueMotifs) * 10 : 0;
  
  const chaosPenalty = homogeneityPenalty + simplicityPenalty + motifPovertyPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalResistance = rawScoreToResistance(rawScore);
  
  const result: ResistanceResult = { value: finalResistance };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        repairMechanisms: Math.round(repairMechanisms),
        complexityScore: Math.round(complexityScore),
        redundancyBackup: Math.round(redundancyBackup)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        homogeneityPenalty: Math.round(homogeneityPenalty),
        simplicityPenalty: Math.round(simplicityPenalty),
        motifPovertyPenalty: Math.round(motifPovertyPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalResistance}/100`
    };
  }
  
  return result;
}