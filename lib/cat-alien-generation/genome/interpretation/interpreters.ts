// lib/genome/interpretation/interpreters.ts

import type { DebugInfo } from '../types';
import { MOTIFS } from '../regions';
import {
  calculateEntropy,
  countSymbolRuns,
  countRareSymbols,
  findMotifs,
  findDominantSymbol,
  countSymbols,
  countAlternations,
  findPalindromes,
  calculateSymbolBalance,
  countSymbolTransitions,
  measureFragmentation,
  findOverlappingPatterns,
  countCatDNA,
  countAlienDNA,
  calculateFrequencyVariance,
  countUniqueMotifs,
  detectTandemRepeats
} from './utils';

// ============================================================================
// SHARED TYPES AND HELPERS
// ============================================================================

/**
 * Stat interpretation result with debug info
 */
interface StatResult {
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
 * Behavior interpretation result with debug info
 */
interface BehaviorResult {
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
 * Convert raw score (-100 to +100) to final stat (1 to 10)
 */
function rawScoreToStat(rawScore: number): number {
  const normalized = 1 + ((rawScore / 100) * 9);
  return Math.round(clamp(normalized, 1, 10));
}

/**
 * Convert raw score (-100 to +100) to final resistance (0 to 100)
 */
function rawScoreToResistance(rawScore: number): number {
  const normalized = 50 + (rawScore / 2);
  return Math.round(clamp(normalized, 0, 100));
}

/**
 * Convert raw score (-100 to +100) to final behavior (1 to 10)
 */
function rawScoreToBehavior(rawScore: number): number {
  const normalized = 1 + ((rawScore / 100) * 9);
  return Math.round(clamp(normalized, 1, 10));
}

// ============================================================================
// STAT INTERPRETERS
// ============================================================================

/**
 * Interpret Strength stat using opposing forces
 * 
 * Philosophy: Raw power from genetic dominance and repetition
 * Favors: Homogeneity, long runs, low entropy
 * Penalized by: Diversity, complexity, rare symbols
 */
export function interpretStrengthStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantCount = counts[dominantSymbol];
  const dominantConcentration = (dominantCount / segment.length) * 40;
  
  const runs = countSymbolRuns(segment, 4);
  const consecutiveRuns = Math.min(40, runs * 8);
  
  const motifMatches = findMotifs(segment, MOTIFS.STRENGTH);
  const motifDensity = Math.min(20, motifMatches.length * 2);
  
  const specializationScore = dominantConcentration + consecutiveRuns + motifDensity;
  
  // CHAOS PENALTY (0-100)
  const entropy = calculateEntropy(segment);
  const entropyPenalty = (entropy / 3) * 50;
  
  const rareCount = countRareSymbols(segment, 5);
  const rareSymbolPenalty = rareCount * 5;
  
  const dominantSymbols = dominantSymbol;
  const fragmentation = measureFragmentation(segment, dominantSymbols);
  const fragmentationPenalty = Math.min(20, fragmentation * 2);
  
  const chaosPenalty = entropyPenalty + rareSymbolPenalty + fragmentationPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalStat = rawScoreToStat(rawScore);
  
  const result: StatResult = { value: finalStat };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        dominantConcentration: Math.round(dominantConcentration),
        consecutiveRuns: Math.round(consecutiveRuns),
        motifDensity: Math.round(motifDensity)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        entropyPenalty: Math.round(entropyPenalty),
        rareSymbolPenalty: Math.round(rareSymbolPenalty),
        fragmentationPenalty: Math.round(fragmentationPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalStat}/10`
    };
  }
  
  return result;
}

/**
 * Interpret Agility stat using opposing forces
 * 
 * Philosophy: Coordination from rhythmic patterns and balance
 * Favors: Alternating patterns, palindromes, moderate entropy
 * Penalized by: Chaos, extreme homogeneity
 */
export function interpretAgilityStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  const longestAlternation = countAlternations(segment);
  const alternationScore = Math.min(50, longestAlternation * 5);
  
  const palindromes = findPalindromes(segment, 4);
  const palindromeBonus = Math.min(30, palindromes.length * 6);
  
  const balanceScore = calculateSymbolBalance(segment);
  
  const specializationScore = alternationScore + palindromeBonus + balanceScore;
  
  // CHAOS PENALTY (0-100)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const homogeneityPenalty = dominantPercent > 70 
    ? Math.min(40, (dominantPercent - 70) * 1.33)
    : 0;
  
  const entropy = calculateEntropy(segment);
  const diversityPenalty = entropy > 2.7
    ? Math.min(40, (entropy - 2.7) * 133)
    : 0;
  
  const alternations = countAlternations(segment);
  const palindromeCount = palindromes.length;
  const hasPattern = alternations > 5 || palindromeCount > 0;
  const noPatternLength = hasPattern ? 0 : segment.length;
  const randomPatternPenalty = Math.min(20, noPatternLength / 5);
  
  const chaosPenalty = homogeneityPenalty + diversityPenalty + randomPatternPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalStat = rawScoreToStat(rawScore);
  
  const result: StatResult = { value: finalStat };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        alternationScore: Math.round(alternationScore),
        palindromeBonus: Math.round(palindromeBonus),
        balanceScore: Math.round(balanceScore)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        homogeneityPenalty: Math.round(homogeneityPenalty),
        diversityPenalty: Math.round(diversityPenalty),
        randomPatternPenalty: Math.round(randomPatternPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalStat}/10`
    };
  }
  
  return result;
}

/**
 * Interpret Endurance stat using opposing forces
 * 
 * Philosophy: Resilience from redundancy and stability
 * Favors: Repeated motifs, medium-length runs, consistent symbols
 * Penalized by: Rare symbols, high chaos
 */
export function interpretEnduranceStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  const allMotifMatches = findMotifs(segment, MOTIFS.ENDURANCE);
  const motifCounts = new Map<string, number>();
  for (const match of allMotifMatches) {
    motifCounts.set(match.motif, (motifCounts.get(match.motif) || 0) + 1);
  }
  const repeatedMotifs = Array.from(motifCounts.values()).filter(count => count >= 2).length;
  const redundancyScore = Math.min(50, repeatedMotifs * 10);
  
  const mediumRuns = countSymbolRuns(segment, 3) - countSymbolRuns(segment, 6);
  const mediumRunBonus = Math.min(30, Math.max(0, mediumRuns) * 3);
  
  const variance = calculateFrequencyVariance(segment);
  const consistencyBonus = Math.max(0, 20 - (variance / 5));
  
  const specializationScore = redundancyScore + mediumRunBonus + consistencyBonus;
  
  // CHAOS PENALTY (0-100)
  const rareCount = countRareSymbols(segment, 3);
  const rareSymbolPenalty = Math.min(40, rareCount * 7);
  
  const transitions = countSymbolTransitions(segment);
  const volatilityPenalty = Math.min(40, (transitions / segment.length) * 40);
  
  const uniqueMotifs = countUniqueMotifs(segment, MOTIFS.ENDURANCE);
  const motifAbsencePenalty = uniqueMotifs < 2 ? (2 - uniqueMotifs) * 10 : 0;
  
  const chaosPenalty = rareSymbolPenalty + volatilityPenalty + motifAbsencePenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalStat = rawScoreToStat(rawScore);
  
  const result: StatResult = { value: finalStat };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        redundancyScore: Math.round(redundancyScore),
        mediumRunBonus: Math.round(mediumRunBonus),
        consistencyBonus: Math.round(consistencyBonus)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        rareSymbolPenalty: Math.round(rareSymbolPenalty),
        volatilityPenalty: Math.round(volatilityPenalty),
        motifAbsencePenalty: Math.round(motifAbsencePenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalStat}/10`
    };
  }
  
  return result;
}

/**
 * Interpret Intelligence stat using opposing forces
 * 
 * Philosophy: Problem-solving from complexity and pattern recognition
 * Favors: High entropy, motif diversity, complex patterns
 * Penalized by: Homogeneity, simple repeats
 */
export function interpretIntelligenceStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  const entropy = calculateEntropy(segment);
  const complexityScore = (entropy / 3) * 40;
  
  const uniqueMotifs = countUniqueMotifs(segment, MOTIFS.INTELLIGENCE);
  const motifVariety = Math.min(40, uniqueMotifs * 8);
  
  const overlappingPatterns = findOverlappingPatterns(segment);
  const patternLayering = Math.min(20, overlappingPatterns * 4);
  
  const specializationScore = complexityScore + motifVariety + patternLayering;
  
  // CHAOS PENALTY (0-100)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const homogeneityPenalty = dominantPercent > 60
    ? Math.min(50, (dominantPercent - 60) * 1.25)
    : 0;
  
  const longRuns = countSymbolRuns(segment, 6);
  const simpleRepetitionPenalty = Math.min(30, longRuns * 6);
  
  const motifPovertyPenalty = uniqueMotifs < 3 ? (3 - uniqueMotifs) * 7 : 0;
  
  const chaosPenalty = homogeneityPenalty + simpleRepetitionPenalty + motifPovertyPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalStat = rawScoreToStat(rawScore);
  
  const result: StatResult = { value: finalStat };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        complexityScore: Math.round(complexityScore),
        motifVariety: Math.round(motifVariety),
        patternLayering: Math.round(patternLayering)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        homogeneityPenalty: Math.round(homogeneityPenalty),
        simpleRepetitionPenalty: Math.round(simpleRepetitionPenalty),
        motifPovertyPenalty: Math.round(motifPovertyPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalStat}/10`
    };
  }
  
  return result;
}

/**
 * Interpret Perception stat using opposing forces
 * 
 * Philosophy: Awareness from rare symbol detection and sensitivity
 * Favors: Rare symbols, scattered patterns, symbol variety
 * Penalized by: Homogeneity, dominant symbols
 */
export function interpretPerceptionStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  const rareCount = countRareSymbols(segment, 8);
  const rareSymbolDetection = Math.min(50, rareCount * 10);
  
  const counts = countSymbols(segment);
  const symbolsPresent = Object.values(counts).filter(c => c > 0).length;
  const symbolVariety = symbolsPresent * 3.75;
  
  const transitions = countSymbolTransitions(segment);
  const edgeDetection = Math.min(20, transitions / 5);
  
  const specializationScore = rareSymbolDetection + symbolVariety + edgeDetection;
  
  // CHAOS PENALTY (0-100)
  const dominantSymbol = findDominantSymbol(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const dominantSymbolPenalty = dominantPercent > 40
    ? Math.min(50, (dominantPercent - 40) * 0.83)
    : 0;
  
  const repeats = detectTandemRepeats(segment);
  const patternRepetitionPenalty = Math.min(30, repeats.length * 6);
  
  const uniqueMotifs = countUniqueMotifs(segment, MOTIFS.PERCEPTION);
  const motifAbsencePenalty = uniqueMotifs < 2 ? (2 - uniqueMotifs) * 10 : 0;
  
  const chaosPenalty = dominantSymbolPenalty + patternRepetitionPenalty + motifAbsencePenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalStat = rawScoreToStat(rawScore);
  
  const result: StatResult = { value: finalStat };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        rareSymbolDetection: Math.round(rareSymbolDetection),
        symbolVariety: Math.round(symbolVariety),
        edgeDetection: Math.round(edgeDetection)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        dominantSymbolPenalty: Math.round(dominantSymbolPenalty),
        patternRepetitionPenalty: Math.round(patternRepetitionPenalty),
        motifAbsencePenalty: Math.round(motifAbsencePenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalStat}/10`
    };
  }
  
  return result;
}

/**
 * Interpret Psychic stat using opposing forces
 * 
 * Philosophy: Mental power from specific esoteric patterns
 * Favors: Alien DNA (WXYZ) concentration, specific motif sequences
 * Penalized by: Cat DNA (ATCG) dominance, disorder
 */
export function interpretPsychicStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  const alienCount = countAlienDNA(segment);
  const alienConcentration = (alienCount / segment.length) * 50;
  
  const motifMatches = findMotifs(segment, MOTIFS.PSYCHIC);
  const esotericMotifDensity = Math.min(30, motifMatches.length * 5);
  
  const alienSymbols = 'WXYZ';
  const alienFragments = measureFragmentation(segment, alienSymbols);
  const alienRuns = Math.max(1, Math.ceil(alienCount / Math.max(1, alienFragments)));
  const alienRunBonus = Math.min(20, alienRuns * 4);
  
  const specializationScore = alienConcentration + esotericMotifDensity + alienRunBonus;
  
  // CHAOS PENALTY (0-100)
  const catCount = countCatDNA(segment);
  const catDNAInterference = (catCount / segment.length) * 50;
  
  const alienFragmentation = measureFragmentation(segment, alienSymbols);
  const disorderPenalty = alienCount > 0 
    ? Math.min(30, (alienFragmentation / Math.max(1, alienCount)) * 100)
    : 0;
  
  const uniqueMotifs = countUniqueMotifs(segment, MOTIFS.PSYCHIC);
  const motifPovertyPenalty = uniqueMotifs < 2 ? (2 - uniqueMotifs) * 10 : 0;
  
  const chaosPenalty = catDNAInterference + disorderPenalty + motifPovertyPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalStat = rawScoreToStat(rawScore);
  
  const result: StatResult = { value: finalStat };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        alienConcentration: Math.round(alienConcentration),
        esotericMotifDensity: Math.round(esotericMotifDensity),
        alienRunBonus: Math.round(alienRunBonus)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        catDNAInterference: Math.round(catDNAInterference),
        disorderPenalty: Math.round(disorderPenalty),
        motifPovertyPenalty: Math.round(motifPovertyPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalStat}/10`
    };
  }
  
  return result;
}

// ============================================================================
// RESISTANCE INTERPRETERS
// ============================================================================

/**
 * Interpret Poison resistance using opposing forces
 * 
 * Philosophy: Resistance from repeated exposure and adaptation
 * Favors: Redundant motifs, repeated patterns, consistency
 * Penalized by: Rare symbols, high volatility, randomness
 */
export function interpretPoisonResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  const allMotifMatches = findMotifs(segment, MOTIFS.POISON);
  const motifCounts = new Map<string, number>();
  for (const match of allMotifMatches) {
    motifCounts.set(match.motif, (motifCounts.get(match.motif) || 0) + 1);
  }
  const repeatedMotifs = Array.from(motifCounts.values()).filter(count => count >= 2).length;
  const totalMotifOccurrences = allMotifMatches.length;
  const motifRedundancy = Math.min(50, (repeatedMotifs * 15) + (totalMotifOccurrences * 2));
  
  const variance = calculateFrequencyVariance(segment);
  const patternConsistency = Math.max(0, 30 - (variance / 3));
  
  const uniqueMotifs = countUniqueMotifs(segment, MOTIFS.POISON);
  const adaptationScore = Math.min(20, uniqueMotifs * 7);
  
  const specializationScore = motifRedundancy + patternConsistency + adaptationScore;
  
  // CHAOS PENALTY (0-100)
  const rareCount = countRareSymbols(segment, 4);
  const rareSymbolPenalty = Math.min(40, rareCount * 8);
  
  const transitions = countSymbolTransitions(segment);
  const volatilityPenalty = Math.min(40, (transitions / segment.length) * 50);
  
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

/**
 * Interpret Acid resistance using opposing forces
 * 
 * Philosophy: Resistance from thick protective coating
 * Favors: Symbol runs, homogeneity, dominant concentration
 * Penalized by: Diversity, fragmentation, scattered patterns
 */
export function interpretAcidResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantCount = counts[dominantSymbol];
  const protectiveCoating = (dominantCount / segment.length) * 40;
  
  const runs = countSymbolRuns(segment, 3);
  const structuralRuns = Math.min(40, runs * 5);
  
  const motifMatches = findMotifs(segment, MOTIFS.ACID);
  const motifPresence = Math.min(20, motifMatches.length * 3);
  
  const specializationScore = protectiveCoating + structuralRuns + motifPresence;
  
  // CHAOS PENALTY (0-100)
  const entropy = calculateEntropy(segment);
  const diversityPenalty = (entropy / 3) * 50;
  
  const transitions = countSymbolTransitions(segment);
  const fragmentationPenalty = Math.min(30, (transitions / segment.length) * 40);
  
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

/**
 * Interpret Fire resistance using opposing forces
 * 
 * Philosophy: Resistance from heat-resistant proteins
 * Favors: Low entropy, dominance, long runs
 * Penalized by: High diversity, complexity, scattered motifs
 */
export function interpretFireResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const thermalStability = Math.min(50, dominantPercent / 2);
  
  const motifMatches = findMotifs(segment, MOTIFS.FIRE);
  const heatResistanceMotifs = Math.min(30, motifMatches.length * 4);
  
  const longRuns = countSymbolRuns(segment, 5);
  const structuralIntegrity = Math.min(20, longRuns * 5);
  
  const specializationScore = thermalStability + heatResistanceMotifs + structuralIntegrity;
  
  // CHAOS PENALTY (0-100)
  const entropy = calculateEntropy(segment);
  const complexityPenalty = (entropy / 3) * 50;
  
  const transitions = countSymbolTransitions(segment);
  const instabilityPenalty = Math.min(30, (transitions / segment.length) * 35);
  
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

/**
 * Interpret Cold resistance using opposing forces
 * 
 * Philosophy: Resistance from insulation layers
 * Favors: Medium runs, consistency, repeated patterns
 * Penalized by: Extreme transitions, high volatility, gaps
 */
export function interpretColdResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  const mediumRuns = countSymbolRuns(segment, 3) - countSymbolRuns(segment, 7);
  const insulationLayers = Math.min(40, Math.max(0, mediumRuns) * 4);
  
  const motifMatches = findMotifs(segment, MOTIFS.COLD);
  const coldResistanceMotifs = Math.min(40, motifMatches.length * 5);
  
  const variance = calculateFrequencyVariance(segment);
  const thermalConsistency = Math.max(0, 20 - (variance / 4));
  
  const specializationScore = insulationLayers + coldResistanceMotifs + thermalConsistency;
  
  // CHAOS PENALTY (0-100)
  const transitions = countSymbolTransitions(segment);
  const transitionPenalty = Math.min(40, (transitions / segment.length) * 45);
  
  const entropy = calculateEntropy(segment);
  const volatilityPenalty = entropy > 2.5 ? Math.min(40, (entropy - 2.5) * 80) : 0;
  
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

/**
 * Interpret Psychic resistance using opposing forces
 * 
 * Philosophy: Resistance from being grounded in physical reality
 * Favors: Cat DNA concentration, simplicity, earthiness
 * Penalized by: Alien DNA, complexity, mystical patterns
 */
export function interpretPsychicResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  const catCount = countCatDNA(segment);
  const grounding = (catCount / segment.length) * 50;
  
  const motifMatches = findMotifs(segment, MOTIFS.PSYCHIC_RESISTANCE);
  const mentalFortitude = Math.min(30, motifMatches.length * 4);
  
  const entropy = calculateEntropy(segment);
  const simplicityBonus = entropy < 2.0 ? Math.min(20, (2.0 - entropy) * 10) : 0;
  
  const specializationScore = grounding + mentalFortitude + simplicityBonus;
  
  // CHAOS PENALTY (0-100)
  const alienCount = segment.length - catCount;
  const alienInterference = (alienCount / segment.length) * 50;
  
  const complexityPenalty = entropy > 2.3 ? Math.min(30, (entropy - 2.3) * 43) : 0;
  
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

/**
 * Interpret Radiation resistance using opposing forces
 * 
 * Philosophy: Resistance from DNA repair mechanisms
 * Favors: Complex patterns, motif variety, repair sequences
 * Penalized by: Homogeneity, simple patterns, lack of redundancy
 */
export function interpretRadiationResistance(
  segment: string,
  debug: boolean = false
): ResistanceResult {
  // SPECIALIZATION SCORE (0-100)
  const uniqueMotifs = countUniqueMotifs(segment, MOTIFS.RADIATION);
  const repairMechanisms = Math.min(40, uniqueMotifs * 10);
  
  const entropy = calculateEntropy(segment);
  const complexityScore = (entropy / 3) * 40;
  
  const allMotifMatches = findMotifs(segment, MOTIFS.RADIATION);
  const totalMotifs = allMotifMatches.length;
  const redundancyBackup = Math.min(20, totalMotifs * 2);
  
  const specializationScore = repairMechanisms + complexityScore + redundancyBackup;
  
  // CHAOS PENALTY (0-100)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const homogeneityPenalty = dominantPercent > 50
    ? Math.min(50, (dominantPercent - 50) * 1.0)
    : 0;
  
  const simplicityPenalty = entropy < 2.0 ? Math.min(30, (2.0 - entropy) * 15) : 0;
  
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

// ============================================================================
// BEHAVIOR INTERPRETERS
// ============================================================================

/**
 * Interpret Aggression behavior using opposing forces
 * 
 * Philosophy: Aggression from genetic dominance and focus
 * Favors: Homogeneity, long runs, low entropy (single-minded fury)
 * Penalized by: Diversity, scattered patterns, complexity (indecisive, weak)
 */
export function interpretAggression(
  segment: string,
  debug: boolean = false
): BehaviorResult {
  // SPECIALIZATION SCORE (0-100)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantCount = counts[dominantSymbol];
  const dominantFocus = (dominantCount / segment.length) * 50;
  
  const longRuns = countSymbolRuns(segment, 4);
  const aggressiveRuns = Math.min(30, longRuns * 6);
  
  const entropy = calculateEntropy(segment);
  const singleMindedness = entropy < 2.0 ? Math.min(20, (2.0 - entropy) * 10) : 0;
  
  const specializationScore = dominantFocus + aggressiveRuns + singleMindedness;
  
  // CHAOS PENALTY (0-100)
  const diversityPenalty = (entropy / 3) * 40;
  
  const transitions = countSymbolTransitions(segment);
  const scatteredPatternPenalty = Math.min(40, (transitions / segment.length) * 50);
  
  const rareCount = countRareSymbols(segment, 5);
  const weaknessPenalty = Math.min(20, rareCount * 4);
  
  const chaosPenalty = diversityPenalty + scatteredPatternPenalty + weaknessPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalBehavior = rawScoreToBehavior(rawScore);
  
  const result: BehaviorResult = { value: finalBehavior };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        dominantFocus: Math.round(dominantFocus),
        aggressiveRuns: Math.round(aggressiveRuns),
        singleMindedness: Math.round(singleMindedness)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        diversityPenalty: Math.round(diversityPenalty),
        scatteredPatternPenalty: Math.round(scatteredPatternPenalty),
        weaknessPenalty: Math.round(weaknessPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalBehavior}/10`
    };
  }
  
  return result;
}

/**
 * Interpret Curiosity behavior using opposing forces
 * 
 * Philosophy: Curiosity from diversity and novelty-seeking
 * Favors: Rare symbols, high diversity, scattered patterns (exploring everything)
 * Penalized by: Homogeneity, repetition, predictability (boring, incurious)
 */
export function interpretCuriosity(
  segment: string,
  debug: boolean = false
): BehaviorResult {
  // SPECIALIZATION SCORE (0-100)
  const rareCount = countRareSymbols(segment, 8);
  const noveltySeeking = Math.min(50, rareCount * 10);
  
  const entropy = calculateEntropy(segment);
  const exploratoryDiversity = (entropy / 3) * 30;
  
  const symbolsPresent = Object.values(countSymbols(segment)).filter(c => c > 0).length;
  const patternVariety = symbolsPresent * 2.5;
  
  const specializationScore = noveltySeeking + exploratoryDiversity + patternVariety;
  
  // CHAOS PENALTY (0-100)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const homogeneityPenalty = dominantPercent > 40
    ? Math.min(50, (dominantPercent - 40) * 0.83)
    : 0;
  
  const repeats = detectTandemRepeats(segment);
  const repetitionPenalty = Math.min(30, repeats.length * 6);
  
  const variance = calculateFrequencyVariance(segment);
  const predictabilityPenalty = variance < 20 ? Math.min(20, (20 - variance)) : 0;
  
  const chaosPenalty = homogeneityPenalty + repetitionPenalty + predictabilityPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalBehavior = rawScoreToBehavior(rawScore);
  
  const result: BehaviorResult = { value: finalBehavior };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        noveltySeeking: Math.round(noveltySeeking),
        exploratoryDiversity: Math.round(exploratoryDiversity),
        patternVariety: Math.round(patternVariety)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        homogeneityPenalty: Math.round(homogeneityPenalty),
        repetitionPenalty: Math.round(repetitionPenalty),
        predictabilityPenalty: Math.round(predictabilityPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalBehavior}/10`
    };
  }
  
  return result;
}

/**
 * Interpret Loyalty behavior using opposing forces
 * 
 * Philosophy: Loyalty from consistency and repeated patterns
 * Favors: Tandem repeats, consistency, stable patterns (reliable, steadfast)
 * Penalized by: Volatility, rare symbols, instability (unreliable, fickle)
 */
export function interpretLoyalty(
  segment: string,
  debug: boolean = false
): BehaviorResult {
  // SPECIALIZATION SCORE (0-100)
  const repeats = detectTandemRepeats(segment);
  const patternConsistency = Math.min(50, repeats.length * 10);
  
  const variance = calculateFrequencyVariance(segment);
  const steadfastStability = Math.max(0, 30 - (variance / 3));
  
  const mediumRuns = countSymbolRuns(segment, 3);
  const commitmentScore = Math.min(20, mediumRuns * 2);
  
  const specializationScore = patternConsistency + steadfastStability + commitmentScore;
  
  // CHAOS PENALTY (0-100)
  const transitions = countSymbolTransitions(segment);
  const volatilityPenalty = Math.min(40, (transitions / segment.length) * 50);
  
  const rareCount = countRareSymbols(segment, 4);
  const rareSymbolPenalty = Math.min(40, rareCount * 8);
  
  const entropy = calculateEntropy(segment);
  const instabilityPenalty = entropy > 2.6 ? Math.min(20, (entropy - 2.6) * 50) : 0;
  
  const chaosPenalty = volatilityPenalty + rareSymbolPenalty + instabilityPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalBehavior = rawScoreToBehavior(rawScore);
  
  const result: BehaviorResult = { value: finalBehavior };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        patternConsistency: Math.round(patternConsistency),
        steadfastStability: Math.round(steadfastStability),
        commitmentScore: Math.round(commitmentScore)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        volatilityPenalty: Math.round(volatilityPenalty),
        rareSymbolPenalty: Math.round(rareSymbolPenalty),
        instabilityPenalty: Math.round(instabilityPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalBehavior}/10`
    };
  }
  
  return result;
}

/**
 * Interpret Chaos behavior using opposing forces
 * 
 * Philosophy: Chaos from entropy and unpredictability
 * Favors: High entropy, complexity, overlapping patterns (wild, erratic)
 * Penalized by: Homogeneity, simplicity, predictable patterns (boring, orderly)
 */
export function interpretChaos(
  segment: string,
  debug: boolean = false
): BehaviorResult {
  // SPECIALIZATION SCORE (0-100)
  const entropy = calculateEntropy(segment);
  const entropyScore = (entropy / 3) * 50;
  
  const overlappingPatterns = findOverlappingPatterns(segment);
  const complexityBonus = Math.min(30, overlappingPatterns * 5);
  
  const transitions = countSymbolTransitions(segment);
  const unpredictabilityScore = Math.min(20, (transitions / segment.length) * 25);
  
  const specializationScore = entropyScore + complexityBonus + unpredictabilityScore;
  
  // CHAOS PENALTY (0-100)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const homogeneityPenalty = dominantPercent > 50
    ? Math.min(50, (dominantPercent - 50) * 1.0)
    : 0;
  
  const simplicityPenalty = entropy < 2.0 ? Math.min(30, (2.0 - entropy) * 15) : 0;
  
  const repeats = detectTandemRepeats(segment);
  const orderPenalty = Math.min(20, repeats.length * 4);
  
  const chaosPenalty = homogeneityPenalty + simplicityPenalty + orderPenalty;
  
  // FINAL CALCULATION
  const rawScore = specializationScore - chaosPenalty;
  const finalBehavior = rawScoreToBehavior(rawScore);
  
  const result: BehaviorResult = { value: finalBehavior };
  
  if (debug) {
    result.debugInfo = {
      specializationScore: Math.round(specializationScore),
      specializationComponents: {
        entropyScore: Math.round(entropyScore),
        complexityBonus: Math.round(complexityBonus),
        unpredictabilityScore: Math.round(unpredictabilityScore)
      },
      chaosPenalty: Math.round(chaosPenalty),
      chaosComponents: {
        homogeneityPenalty: Math.round(homogeneityPenalty),
        simplicityPenalty: Math.round(simplicityPenalty),
        orderPenalty: Math.round(orderPenalty)
      },
      rawScore: Math.round(rawScore),
      mapping: `${Math.round(rawScore)}/100 → ${finalBehavior}/10`
    };
  }
  
  return result;
}