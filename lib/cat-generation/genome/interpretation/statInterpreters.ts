// lib/genome/interpretation/statInterpreters.ts

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

// ============================================================================
// STRENGTH STAT - THE BRUTE
// ============================================================================

/**
 * Interpret Strength stat using opposing forces
 * 
 * Philosophy: Raw power from genetic dominance and repetition
 * Favors: Homogeneity, long runs, low entropy
 * Penalized by: Diversity, complexity, rare symbols
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Strength stat (1-10) with optional debug info
 */
export function interpretStrengthStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Dominant Symbol Concentration (0-40 points)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantCount = counts[dominantSymbol];
  const dominantConcentration = (dominantCount / segment.length) * 40;
  
  // 2. Consecutive Run Bonus (0-40 points)
  const runs = countSymbolRuns(segment, 4);
  const consecutiveRuns = Math.min(40, runs * 8);
  
  // 3. Motif Density (0-20 points)
  const motifMatches = findMotifs(segment, MOTIFS.STRENGTH);
  const motifDensity = Math.min(20, motifMatches.length * 2);
  
  const specializationScore = dominantConcentration + consecutiveRuns + motifDensity;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Entropy Penalty (0-50 points)
  const entropy = calculateEntropy(segment);
  const entropyPenalty = (entropy / 3) * 50;
  
  // 2. Rare Symbol Penalty (0-30 points)
  const rareCount = countRareSymbols(segment, 5);
  const rareSymbolPenalty = rareCount * 5;
  
  // 3. Fragmentation Penalty (0-20 points)
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

// ============================================================================
// AGILITY STAT - THE DANCER
// ============================================================================

/**
 * Interpret Agility stat using opposing forces
 * 
 * Philosophy: Coordination from rhythmic patterns and balance
 * Favors: Alternating patterns, palindromes, moderate entropy
 * Penalized by: Chaos, extreme homogeneity
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Agility stat (1-10) with optional debug info
 */
export function interpretAgilityStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Alternation Score (0-50 points)
  const longestAlternation = countAlternations(segment);
  const alternationScore = Math.min(50, longestAlternation * 5);
  
  // 2. Palindrome Bonus (0-30 points)
  const palindromes = findPalindromes(segment, 4);
  const palindromeBonus = Math.min(30, palindromes.length * 6);
  
  // 3. Balance Score (0-20 points)
  const balanceScore = calculateSymbolBalance(segment);
  
  const specializationScore = alternationScore + palindromeBonus + balanceScore;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Extreme Homogeneity Penalty (0-40 points)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const homogeneityPenalty = dominantPercent > 70 
    ? Math.min(40, (dominantPercent - 70) * 1.33)
    : 0;
  
  // 2. Extreme Diversity Penalty (0-40 points)
  const entropy = calculateEntropy(segment);
  const diversityPenalty = entropy > 2.7
    ? Math.min(40, (entropy - 2.7) * 133)
    : 0;
  
  // 3. Random Pattern Penalty (0-20 points)
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

// ============================================================================
// ENDURANCE STAT - THE TANK
// ============================================================================

/**
 * Interpret Endurance stat using opposing forces
 * 
 * Philosophy: Resilience from redundancy and stability
 * Favors: Repeated motifs, medium-length runs, consistent symbols
 * Penalized by: Rare symbols, high chaos
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Endurance stat (1-10) with optional debug info
 */
export function interpretEnduranceStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Redundancy Score (0-50 points)
  const allMotifMatches = findMotifs(segment, MOTIFS.ENDURANCE);
  const motifCounts = new Map<string, number>();
  for (const match of allMotifMatches) {
    motifCounts.set(match.motif, (motifCounts.get(match.motif) || 0) + 1);
  }
  const repeatedMotifs = Array.from(motifCounts.values()).filter(count => count >= 2).length;
  const redundancyScore = Math.min(50, repeatedMotifs * 10);
  
  // 2. Medium Run Bonus (0-30 points)
  const mediumRuns = countSymbolRuns(segment, 3) - countSymbolRuns(segment, 6);
  const mediumRunBonus = Math.min(30, Math.max(0, mediumRuns) * 3);
  
  // 3. Consistency Bonus (0-20 points)
  const variance = calculateFrequencyVariance(segment);
  const consistencyBonus = Math.max(0, 20 - (variance / 5));
  
  const specializationScore = redundancyScore + mediumRunBonus + consistencyBonus;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Rare Symbol Penalty (0-40 points)
  const rareCount = countRareSymbols(segment, 3);
  const rareSymbolPenalty = Math.min(40, rareCount * 7);
  
  // 2. Volatility Penalty (0-40 points)
  const transitions = countSymbolTransitions(segment);
  const volatilityPenalty = Math.min(40, (transitions / segment.length) * 40);
  
  // 3. Motif Absence Penalty (0-20 points)
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

// ============================================================================
// INTELLIGENCE STAT - THE STRATEGIST
// ============================================================================

/**
 * Interpret Intelligence stat using opposing forces
 * 
 * Philosophy: Problem-solving from complexity and pattern recognition
 * Favors: High entropy, motif diversity, complex patterns
 * Penalized by: Homogeneity, simple repeats
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Intelligence stat (1-10) with optional debug info
 */
export function interpretIntelligenceStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Complexity Score (0-40 points)
  const entropy = calculateEntropy(segment);
  const complexityScore = (entropy / 3) * 40;
  
  // 2. Motif Variety (0-40 points)
  const uniqueMotifs = countUniqueMotifs(segment, MOTIFS.INTELLIGENCE);
  const motifVariety = Math.min(40, uniqueMotifs * 8);
  
  // 3. Pattern Layering (0-20 points)
  const overlappingPatterns = findOverlappingPatterns(segment);
  const patternLayering = Math.min(20, overlappingPatterns * 4);
  
  const specializationScore = complexityScore + motifVariety + patternLayering;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Homogeneity Penalty (0-50 points)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const homogeneityPenalty = dominantPercent > 60
    ? Math.min(50, (dominantPercent - 60) * 1.25)
    : 0;
  
  // 2. Simple Repetition Penalty (0-30 points)
  const longRuns = countSymbolRuns(segment, 6);
  const simpleRepetitionPenalty = Math.min(30, longRuns * 6);
  
  // 3. Motif Poverty Penalty (0-20 points)
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

// ============================================================================
// PERCEPTION STAT - THE SCOUT
// ============================================================================

/**
 * Interpret Perception stat using opposing forces
 * 
 * Philosophy: Awareness from rare symbol detection and sensitivity
 * Favors: Rare symbols, scattered patterns, symbol variety
 * Penalized by: Homogeneity, dominant symbols
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Perception stat (1-10) with optional debug info
 */
export function interpretPerceptionStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Rare Symbol Detection (0-50 points)
  const rareCount = countRareSymbols(segment, 8);
  const rareSymbolDetection = Math.min(50, rareCount * 10);
  
  // 2. Symbol Variety (0-30 points)
  const counts = countSymbols(segment);
  const symbolsPresent = Object.values(counts).filter(c => c > 0).length;
  const symbolVariety = symbolsPresent * 3.75;
  
  // 3. Edge Detection (0-20 points)
  const transitions = countSymbolTransitions(segment);
  const edgeDetection = Math.min(20, transitions / 5);
  
  const specializationScore = rareSymbolDetection + symbolVariety + edgeDetection;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Dominant Symbol Penalty (0-50 points)
  const dominantSymbol = findDominantSymbol(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const dominantSymbolPenalty = dominantPercent > 40
    ? Math.min(50, (dominantPercent - 40) * 0.83)
    : 0;
  
  // 2. Pattern Repetition Penalty (0-30 points)
  const repeats = detectTandemRepeats(segment);
  const patternRepetitionPenalty = Math.min(30, repeats.length * 6);
  
  // 3. Motif Absence Penalty (0-20 points)
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

// ============================================================================
// PSYCHIC STAT - THE MYSTIC
// ============================================================================

/**
 * Interpret Psychic stat using opposing forces
 * 
 * Philosophy: Mental power from specific esoteric patterns
 * Favors: Alien DNA (WXYZ) concentration, specific motif sequences
 * Penalized by: Cat DNA (ATCG) dominance, disorder
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Psychic stat (1-10) with optional debug info
 */
export function interpretPsychicStat(
  segment: string,
  debug: boolean = false
): StatResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Alien DNA Concentration (0-50 points)
  const alienCount = countAlienDNA(segment);
  const alienConcentration = (alienCount / segment.length) * 50;
  
  // 2. Esoteric Motif Density (0-30 points)
  const motifMatches = findMotifs(segment, MOTIFS.PSYCHIC);
  const esotericMotifDensity = Math.min(30, motifMatches.length * 5);
  
  // 3. Alien Run Bonus (0-20 points)
  const alienSymbols = 'WXYZ';
  const alienFragments = measureFragmentation(segment, alienSymbols);
  const alienRuns = Math.max(1, Math.ceil(alienCount / Math.max(1, alienFragments)));
  const alienRunBonus = Math.min(20, alienRuns * 4);
  
  const specializationScore = alienConcentration + esotericMotifDensity + alienRunBonus;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Cat DNA Interference (0-50 points)
  const catCount = countCatDNA(segment);
  const catDNAInterference = (catCount / segment.length) * 50;
  
  // 2. Disorder Penalty (0-30 points)
  const alienFragmentation = measureFragmentation(segment, alienSymbols);
  const disorderPenalty = alienCount > 0 
    ? Math.min(30, (alienFragmentation / Math.max(1, alienCount)) * 100)
    : 0;
  
  // 3. Motif Poverty Penalty (0-20 points)
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