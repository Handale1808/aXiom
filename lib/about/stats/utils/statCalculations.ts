// lib/components/about/stats/utils/statCalculations.ts

import { SUBREGIONS, MOTIFS } from '@/lib/generation/genome/regions';
import {
  interpretStrengthStat,
  interpretAgilityStat,
  interpretEnduranceStat,
  interpretIntelligenceStat,
  interpretPerceptionStat,
  interpretPsychicStat,
  interpretPoisonResistance,
  interpretAcidResistance,
  interpretFireResistance,
  interpretColdResistance,
  interpretPsychicResistance,
  interpretRadiationResistance,
  interpretAggression,
  interpretCuriosity,
  interpretLoyalty,
  interpretChaos,
} from '@/lib/generation/genome/interpretation/interpreters';
import {
  extractRegion,
  findMotifs,
  countSymbolRuns,
  detectTandemRepeats,
  findPalindromes,
  countAlternations,
  findDominantSymbol,
  countSymbols,
} from '@/lib/generation/genome/interpretation/utils';

export type StatCategory = 'stats' | 'resistances' | 'behaviors';

export interface StatConfig {
  id: string;
  name: string;
  category: StatCategory;
  subregion: { start: number; end: number };
  interpreter: (segment: string, debug: boolean) => any;
  philosophy: string;
  favors: string[];
  penalizedBy: string[];
}

export interface DetectedPattern {
  id: string;
  type: 'motif' | 'run' | 'palindrome' | 'alternation' | 'tandemRepeat';
  value: string;
  positions: number[];
  count: number;
}

export interface CalculationResult {
  segment: string;
  patterns: DetectedPattern[];
  specializationScore: number;
  specializationComponents: Record<string, number>;
  chaosPenalty: number;
  chaosComponents: Record<string, number>;
  rawScore: number;
  finalValue: number;
  debugInfo?: any;
}

/**
 * All stat configurations
 */
export const STATS_CONFIG: StatConfig[] = [
  {
    id: 'strength',
    name: 'Strength',
    category: 'stats',
    subregion: SUBREGIONS.PHYSICAL_POWER,
    interpreter: interpretStrengthStat,
    philosophy: 'Raw power from genetic dominance and repetition. Strength emerges when sequences lock into unwavering patterns, creating biological engines of pure force.',
    favors: ['Homogeneity', 'Long runs', 'Low entropy'],
    penalizedBy: ['Diversity', 'Complexity', 'Rare symbols'],
  },
  {
    id: 'agility',
    name: 'Agility',
    category: 'stats',
    subregion: SUBREGIONS.LOCOMOTION,
    interpreter: interpretAgilityStat,
    philosophy: 'Coordination from rhythmic patterns and balance. Agility requires genetic choreography where bases dance in alternating sequences and palindromic symmetries.',
    favors: ['Alternating patterns', 'Palindromes', 'Moderate entropy'],
    penalizedBy: ['Chaos', 'Extreme homogeneity', 'Random noise'],
  },
  {
    id: 'endurance',
    name: 'Endurance',
    category: 'stats',
    subregion: SUBREGIONS.DEFENSE,
    interpreter: interpretEnduranceStat,
    philosophy: 'Resilience from structural consistency and redundancy. Endurance builds through repeated defensive patterns that create biological armor.',
    favors: ['Symbol balance', 'Consistent patterns', 'Moderate runs'],
    penalizedBy: ['Extreme dominance', 'High fragmentation', 'Chaos'],
  },
  {
    id: 'intelligence',
    name: 'Intelligence',
    category: 'stats',
    subregion: SUBREGIONS.INTELLIGENCE,
    interpreter: interpretIntelligenceStat,
    philosophy: 'Cognitive power from complexity and information density. Intelligence emerges when genetic code achieves high entropy and diverse symbol usage.',
    favors: ['High entropy', 'Diverse symbols', 'Complex patterns'],
    penalizedBy: ['Homogeneity', 'Long runs', 'Predictability'],
  },
  {
    id: 'perception',
    name: 'Perception',
    category: 'stats',
    subregion: SUBREGIONS.SENSORY,
    interpreter: interpretPerceptionStat,
    philosophy: 'Sensory acuity from pattern recognition ability. Perception requires genetic sensitivity to detect subtle environmental signals.',
    favors: ['Balanced symbols', 'Motif diversity', 'Pattern variety'],
    penalizedBy: ['Extreme dominance', 'Low entropy', 'Fragmentation'],
  },
  {
    id: 'psychic',
    name: 'Psychic',
    category: 'stats',
    subregion: SUBREGIONS.PSYCHIC,
    interpreter: interpretPsychicStat,
    philosophy: 'Mental power from hybrid genetic fusion. Psychic abilities emerge where cat and alien DNA achieve perfect integration and balance.',
    favors: ['Cat-Alien balance', 'Complex patterns', 'High entropy'],
    penalizedBy: ['Pure cat DNA', 'Pure alien DNA', 'Extreme imbalance'],
  },
];

export const RESISTANCES_CONFIG: StatConfig[] = [
  {
    id: 'poison',
    name: 'Poison',
    category: 'resistances',
    subregion: { start: 400, end: 449 },
    interpreter: interpretPoisonResistance,
    philosophy: 'Toxin immunity from specialized detoxification patterns. Poison resistance builds through repetitive defensive motifs.',
    favors: ['Poison motifs (ATT, TTA)', 'Defensive runs', 'Consistency'],
    penalizedBy: ['High entropy', 'Scattered patterns', 'Rare symbols'],
  },
  {
    id: 'acid',
    name: 'Acid',
    category: 'resistances',
    subregion: { start: 450, end: 499 },
    interpreter: interpretAcidResistance,
    philosophy: 'Corrosion resistance from stable molecular structures. Acid resistance requires genetic sequences that resist breakdown.',
    favors: ['Acid motifs (CGG, GGC)', 'Long runs', 'Low diversity'],
    penalizedBy: ['High entropy', 'Pattern fragmentation', 'Volatility'],
  },
  {
    id: 'fire',
    name: 'Fire',
    category: 'resistances',
    subregion: { start: 500, end: 549 },
    interpreter: interpretFireResistance,
    philosophy: 'Thermal resistance from extreme homogeneity. Fire resistance emerges when sequences achieve maximum concentration and purity.',
    favors: ['Extreme runs (GGG, GGGG)', 'Pure dominance', 'Ultra-low entropy'],
    penalizedBy: ['Diversity', 'Mixed symbols', 'High entropy'],
  },
  {
    id: 'cold',
    name: 'Cold',
    category: 'resistances',
    subregion: { start: 550, end: 599 },
    interpreter: interpretColdResistance,
    philosophy: 'Thermal regulation from sequence stability. Cold resistance builds through consistent, unchanging genetic patterns.',
    favors: ['Extreme runs (AAA, AAAA)', 'Consistency', 'Low entropy'],
    penalizedBy: ['High transitions', 'Diversity', 'Pattern instability'],
  },
  {
    id: 'psychicResistance',
    name: 'Psychic Resistance',
    category: 'resistances',
    subregion: { start: 900, end: 949 },
    interpreter: interpretPsychicResistance,
    philosophy: 'Mental shielding from structured complexity. Psychic resistance requires balanced patterns that deflect mental intrusion.',
    favors: ['Palindromic structures', 'Balanced entropy', 'Symmetry'],
    penalizedBy: ['Chaos', 'Extreme dominance', 'Random patterns'],
  },
  {
    id: 'radiation',
    name: 'Radiation',
    category: 'resistances',
    subregion: { start: 950, end: 999 },
    interpreter: interpretRadiationResistance,
    philosophy: 'Cellular protection from DNA repair mechanisms. Radiation resistance builds through redundant, self-correcting sequences.',
    favors: ['Radiation motifs (ATCG)', 'Balance', 'Redundancy'],
    penalizedBy: ['Extreme dominance', 'Fragmentation', 'Rare patterns'],
  },
];

export const BEHAVIORS_CONFIG: StatConfig[] = [
  {
    id: 'aggression',
    name: 'Aggression',
    category: 'behaviors',
    subregion: { start: 700, end: 749 },
    interpreter: interpretAggression,
    philosophy: 'Hostility from dominant, forceful patterns. Aggression emerges when sequences achieve overwhelming dominance and singular focus.',
    favors: ['Dominant symbols', 'Long runs', 'Single-mindedness'],
    penalizedBy: ['Diversity', 'Scattered patterns', 'Weakness'],
  },
  {
    id: 'curiosity',
    name: 'Curiosity',
    category: 'behaviors',
    subregion: { start: 750, end: 799 },
    interpreter: interpretCuriosity,
    philosophy: 'Inquisitiveness from diversity and novelty-seeking. Curiosity requires genetic exploration of many possibilities and rare patterns.',
    favors: ['Rare symbols', 'High diversity', 'Pattern variety'],
    penalizedBy: ['Homogeneity', 'Repetition', 'Predictability'],
  },
  {
    id: 'loyalty',
    name: 'Loyalty',
    category: 'behaviors',
    subregion: { start: 700, end: 749 },
    interpreter: interpretLoyalty,
    philosophy: 'Steadfastness from consistent, repeated patterns. Loyalty emerges when sequences commit to stable, reliable structures.',
    favors: ['Tandem repeats', 'Consistency', 'Low variance'],
    penalizedBy: ['Volatility', 'Rare symbols', 'Instability'],
  },
  {
    id: 'chaos',
    name: 'Chaos',
    category: 'behaviors',
    subregion: { start: 750, end: 799 },
    interpreter: interpretChaos,
    philosophy: 'Unpredictability from maximum entropy and complexity. Chaos thrives in genetic turbulence where patterns overlap and collide.',
    favors: ['High entropy', 'Overlapping patterns', 'Complexity'],
    penalizedBy: ['Homogeneity', 'Simplicity', 'Order'],
  },
];

/**
 * Get all stat configs as a flat array
 */
export function getAllStatConfigs(): StatConfig[] {
  return [...STATS_CONFIG, ...RESISTANCES_CONFIG, ...BEHAVIORS_CONFIG];
}

/**
 * Get stat config by ID
 */
export function getStatConfig(id: string): StatConfig | undefined {
  return getAllStatConfigs().find(config => config.id === id);
}

/**
 * Extract segment from full genome using subregion coordinates
 */
export function extractSegment(genome: string, subregion: { start: number; end: number }): string {
  return extractRegion(genome, subregion.start, subregion.end);
}

/**
 * Detect all patterns in a segment based on the stat type
 */
export function detectPatterns(segment: string, statId: string): DetectedPattern[] {
  const patterns: DetectedPattern[] = [];
  let patternCounter = 0;

  // Detect motifs (always relevant)
  const motifList = getRelevantMotifs(statId);
  if (motifList.length > 0) {
    const motifMatches = findMotifs(segment, motifList);
    const motifGroups = new Map<string, number[]>();
    
    motifMatches.forEach(match => {
      if (!motifGroups.has(match.motif)) {
        motifGroups.set(match.motif, []);
      }
      motifGroups.get(match.motif)!.push(match.position);
    });

    motifGroups.forEach((positions, motifValue) => {
      patterns.push({
        id: `motif-${patternCounter++}`,
        type: 'motif',
        value: motifValue,
        positions,
        count: positions.length,
      });
    });
  }

  // Detect runs (for strength, fire, cold, aggression)
  if (['strength', 'fire', 'cold', 'aggression', 'endurance', 'poison', 'acid'].includes(statId)) {
    const runs = detectSymbolRuns(segment);
    runs.forEach(run => {
      patterns.push({
        id: `run-${patternCounter++}`,
        type: 'run',
        value: run.symbol.repeat(run.length),
        positions: Array.from({ length: run.length }, (_, i) => run.start + i),
        count: 1,
      });
    });
  }

  // Detect palindromes (for agility, psychicResistance)
  if (['agility', 'psychicResistance'].includes(statId)) {
    const palindromes = findPalindromes(segment, 4);
    palindromes.forEach(palindrome => {
      const positions = findPalindromePositions(segment, palindrome);
      patterns.push({
        id: `palindrome-${patternCounter++}`,
        type: 'palindrome',
        value: palindrome,
        positions,
        count: positions.length / palindrome.length,
      });
    });
  }

  // Detect alternations (for agility)
  if (['agility'].includes(statId)) {
    const alternation = detectLongestAlternation(segment);
    if (alternation) {
      patterns.push({
        id: `alternation-${patternCounter++}`,
        type: 'alternation',
        value: alternation.pattern,
        positions: alternation.positions,
        count: 1,
      });
    }
  }

  // Detect tandem repeats (for loyalty)
  if (['loyalty'].includes(statId)) {
    const repeats = detectTandemRepeats(segment);
    repeats.forEach(repeat => {
      const positions = findTandemRepeatPositions(segment, repeat);
      patterns.push({
        id: `tandemRepeat-${patternCounter++}`,
        type: 'tandemRepeat',
        value: repeat,
        positions,
        count: positions.length / repeat.length,
      });
    });
  }

  return patterns;
}

/**
 * Get relevant motifs for a stat type
 */
function getRelevantMotifs(statId: string): string[] {
  const motifMap: Record<string, string[]> = {
    strength: MOTIFS.STRENGTH,
    agility: MOTIFS.AGILITY,
    endurance: MOTIFS.ENDURANCE,
    intelligence: MOTIFS.INTELLIGENCE,
    perception: MOTIFS.PERCEPTION,
    psychic: MOTIFS.PSYCHIC,
    poison: MOTIFS.POISON,
    acid: MOTIFS.ACID,
    fire: MOTIFS.FIRE,
    cold: MOTIFS.COLD,
    psychicResistance: MOTIFS.PSYCHIC_RESISTANCE,
    radiation: MOTIFS.RADIATION,
  };

  return motifMap[statId] || [];
}

/**
 * Detect symbol runs in segment
 */
function detectSymbolRuns(segment: string, minLength: number = 3): Array<{
  symbol: string;
  start: number;
  length: number;
}> {
  const runs: Array<{ symbol: string; start: number; length: number }> = [];
  let currentSymbol = segment[0];
  let currentStart = 0;
  let currentLength = 1;

  for (let i = 1; i < segment.length; i++) {
    if (segment[i] === currentSymbol) {
      currentLength++;
    } else {
      if (currentLength >= minLength) {
        runs.push({
          symbol: currentSymbol,
          start: currentStart,
          length: currentLength,
        });
      }
      currentSymbol = segment[i];
      currentStart = i;
      currentLength = 1;
    }
  }

  if (currentLength >= minLength) {
    runs.push({
      symbol: currentSymbol,
      start: currentStart,
      length: currentLength,
    });
  }

  return runs;
}

/**
 * Find all positions of a palindrome in segment
 */
function findPalindromePositions(segment: string, palindrome: string): number[] {
  const positions: number[] = [];
  for (let i = 0; i <= segment.length - palindrome.length; i++) {
    if (segment.substring(i, i + palindrome.length) === palindrome) {
      for (let j = 0; j < palindrome.length; j++) {
        positions.push(i + j);
      }
    }
  }
  return positions;
}

/**
 * Find all positions of a tandem repeat in segment
 */
function findTandemRepeatPositions(segment: string, repeat: string): number[] {
  const positions: number[] = [];
  for (let i = 0; i <= segment.length - repeat.length * 2; i++) {
    const pattern = segment.substring(i, i + repeat.length);
    const next = segment.substring(i + repeat.length, i + repeat.length * 2);
    if (pattern === repeat && next === repeat) {
      for (let j = 0; j < repeat.length * 2; j++) {
        if (!positions.includes(i + j)) {
          positions.push(i + j);
        }
      }
    }
  }
  return positions;
}

/**
 * Detect longest alternation pattern
 */
function detectLongestAlternation(segment: string): {
  pattern: string;
  positions: number[];
} | null {
  const maxLength = countAlternations(segment);
  
  if (maxLength < 4) return null;

  for (let patternLength = 2; patternLength <= 6; patternLength++) {
    for (let i = 0; i <= segment.length - patternLength * 2; i++) {
      const pattern = segment.substring(i, i + patternLength);
      let alternationLength = patternLength;
      const positions = Array.from({ length: patternLength }, (_, idx) => i + idx);

      let pos = i + patternLength;
      while (pos + patternLength <= segment.length) {
        const nextChunk = segment.substring(pos, pos + patternLength);
        if (nextChunk === pattern) {
          alternationLength += patternLength;
          for (let j = 0; j < patternLength; j++) {
            positions.push(pos + j);
          }
          pos += patternLength;
        } else {
          break;
        }
      }

      if (alternationLength === maxLength) {
        return { pattern, positions };
      }
    }
  }

  return null;
}

/**
 * Calculate stat with full debug information
 */
export function calculateStat(
  genome: string,
  config: StatConfig
): CalculationResult {
  const segment = extractSegment(genome, config.subregion);
  
  const result = config.interpreter(segment, true);
  
  const patterns = detectPatterns(segment, config.id);

  return {
    segment,
    patterns,
    specializationScore: result.debugInfo?.specializationScore || 0,
    specializationComponents: result.debugInfo?.specializationComponents || {},
    chaosPenalty: result.debugInfo?.chaosPenalty || 0,
    chaosComponents: result.debugInfo?.chaosComponents || {},
    rawScore: result.debugInfo?.rawScore || 0,
    finalValue: result.value,
    debugInfo: result.debugInfo,
  };
}