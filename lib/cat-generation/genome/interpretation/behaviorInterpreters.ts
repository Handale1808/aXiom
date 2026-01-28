// lib/genome/interpretation/behaviorInterpreters.ts

import type { DebugInfo } from '../types';
import {
  calculateEntropy,
  countSymbolRuns,
  countRareSymbols,
  findDominantSymbol,
  countSymbols,
  detectTandemRepeats,
  countSymbolTransitions,
  findOverlappingPatterns,
  calculateFrequencyVariance
} from './utils';

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
 * Convert raw score (-100 to +100) to final behavior (1 to 10)
 */
function rawScoreToBehavior(rawScore: number): number {
  const normalized = 1 + ((rawScore / 100) * 9);
  return Math.round(clamp(normalized, 1, 10));
}

// ============================================================================
// AGGRESSION - THE DOMINATOR
// ============================================================================

/**
 * Interpret Aggression behavior using opposing forces
 * 
 * Philosophy: Aggression from genetic dominance and focus
 * Favors: Homogeneity, long runs, low entropy (single-minded fury)
 * Penalized by: Diversity, scattered patterns, complexity (indecisive, weak)
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Aggression behavior (1-10) with optional debug info
 */
export function interpretAggression(
  segment: string,
  debug: boolean = false
): BehaviorResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Dominant Focus (0-50 points)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantCount = counts[dominantSymbol];
  const dominantFocus = (dominantCount / segment.length) * 50;
  
  // 2. Aggressive Runs (0-30 points)
  const longRuns = countSymbolRuns(segment, 4);
  const aggressiveRuns = Math.min(30, longRuns * 6);
  
  // 3. Single-Mindedness (0-20 points)
  const entropy = calculateEntropy(segment);
  const singleMindedness = entropy < 2.0 ? Math.min(20, (2.0 - entropy) * 10) : 0;
  
  const specializationScore = dominantFocus + aggressiveRuns + singleMindedness;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Diversity Penalty (0-40 points)
  const diversityPenalty = (entropy / 3) * 40;
  
  // 2. Scattered Pattern Penalty (0-40 points)
  const transitions = countSymbolTransitions(segment);
  const scatteredPatternPenalty = Math.min(40, (transitions / segment.length) * 50);
  
  // 3. Weakness Penalty (0-20 points)
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

// ============================================================================
// CURIOSITY - THE EXPLORER
// ============================================================================

/**
 * Interpret Curiosity behavior using opposing forces
 * 
 * Philosophy: Curiosity from diversity and novelty-seeking
 * Favors: Rare symbols, high diversity, scattered patterns (exploring everything)
 * Penalized by: Homogeneity, repetition, predictability (boring, incurious)
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Curiosity behavior (1-10) with optional debug info
 */
export function interpretCuriosity(
  segment: string,
  debug: boolean = false
): BehaviorResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Novelty Seeking (0-50 points)
  const rareCount = countRareSymbols(segment, 8);
  const noveltySeeking = Math.min(50, rareCount * 10);
  
  // 2. Exploratory Diversity (0-30 points)
  const entropy = calculateEntropy(segment);
  const exploratoryDiversity = (entropy / 3) * 30;
  
  // 3. Pattern Variety (0-20 points)
  const symbolsPresent = Object.values(countSymbols(segment)).filter(c => c > 0).length;
  const patternVariety = symbolsPresent * 2.5;
  
  const specializationScore = noveltySeeking + exploratoryDiversity + patternVariety;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Homogeneity Penalty (0-50 points)
  const dominantSymbol = findDominantSymbol(segment);
  const counts = countSymbols(segment);
  const dominantPercent = (counts[dominantSymbol] / segment.length) * 100;
  const homogeneityPenalty = dominantPercent > 40
    ? Math.min(50, (dominantPercent - 40) * 0.83)
    : 0;
  
  // 2. Repetition Penalty (0-30 points)
  const repeats = detectTandemRepeats(segment);
  const repetitionPenalty = Math.min(30, repeats.length * 6);
  
  // 3. Predictability Penalty (0-20 points)
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

// ============================================================================
// LOYALTY - THE FAITHFUL
// ============================================================================

/**
 * Interpret Loyalty behavior using opposing forces
 * 
 * Philosophy: Loyalty from consistency and repeated patterns
 * Favors: Tandem repeats, consistency, stable patterns (reliable, steadfast)
 * Penalized by: Volatility, rare symbols, instability (unreliable, fickle)
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Loyalty behavior (1-10) with optional debug info
 */
export function interpretLoyalty(
  segment: string,
  debug: boolean = false
): BehaviorResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Pattern Consistency (0-50 points)
  const repeats = detectTandemRepeats(segment);
  const patternConsistency = Math.min(50, repeats.length * 10);
  
  // 2. Steadfast Stability (0-30 points)
  const variance = calculateFrequencyVariance(segment);
  const steadfastStability = Math.max(0, 30 - (variance / 3));
  
  // 3. Commitment Score (0-20 points)
  const mediumRuns = countSymbolRuns(segment, 3);
  const commitmentScore = Math.min(20, mediumRuns * 2);
  
  const specializationScore = patternConsistency + steadfastStability + commitmentScore;
  
  // CHAOS PENALTY (0-100)
  
  // 1. Volatility Penalty (0-40 points)
  const transitions = countSymbolTransitions(segment);
  const volatilityPenalty = Math.min(40, (transitions / segment.length) * 50);
  
  // 2. Rare Symbol Penalty (0-40 points)
  const rareCount = countRareSymbols(segment, 4);
  const rareSymbolPenalty = Math.min(40, rareCount * 8);
  
  // 3. Instability Penalty (0-20 points)
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

// ============================================================================
// CHAOS - THE UNPREDICTABLE
// ============================================================================

/**
 * Interpret Chaos behavior using opposing forces
 * 
 * Philosophy: Chaos from entropy and unpredictability
 * Favors: High entropy, complexity, overlapping patterns (wild, erratic)
 * Penalized by: Homogeneity, simplicity, predictable patterns (boring, orderly)
 * 
 * @param segment - Genome segment to analyze
 * @param debug - Whether to include debug info
 * @returns Chaos behavior (1-10) with optional debug info
 */
export function interpretChaos(
  segment: string,
  debug: boolean = false
): BehaviorResult {
  // SPECIALIZATION SCORE (0-100)
  
  // 1. Entropy Score (0-50 points)
  const entropy = calculateEntropy(segment);
  const entropyScore = (entropy / 3) * 50;
  
  // 2. Complexity Bonus (0-30 points)
  const overlappingPatterns = findOverlappingPatterns(segment);
  const complexityBonus = Math.min(30, overlappingPatterns * 5);
  
  // 3. Unpredictability Score (0-20 points)
  const transitions = countSymbolTransitions(segment);
  const unpredictabilityScore = Math.min(20, (transitions / segment.length) * 25);
  
  const specializationScore = entropyScore + complexityBonus + unpredictabilityScore;
  
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
  
  // 3. Order Penalty (0-20 points)
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