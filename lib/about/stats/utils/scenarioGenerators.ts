// lib/components/about/stats/utils/scenarioGenerators.ts

import type { GenomeSymbol } from '@/lib/cat-alien-generation/genome/types';

export interface Scenario {
  id: string;
  name: string;
  description: string;
  pattern: string;
  expectedOutcome: string;
}

/**
 * Generate scenarios for a specific stat type
 */
export function generateScenarios(statId: string, length: number = 100): Scenario[] {
  const generators: Record<string, (length: number) => Scenario[]> = {
    strength: generateStrengthScenarios,
    agility: generateAgilityScenarios,
    endurance: generateEnduranceScenarios,
    intelligence: generateIntelligenceScenarios,
    perception: generatePerceptionScenarios,
    psychic: generatePsychicScenarios,
    poison: generatePoisonScenarios,
    acid: generateAcidScenarios,
    fire: generateFireScenarios,
    cold: generateColdScenarios,
    psychicResistance: generatePsychicResistanceScenarios,
    radiation: generateRadiationScenarios,
    aggression: generateAggressionScenarios,
    curiosity: generateCuriosityScenarios,
    loyalty: generateLoyaltyScenarios,
    chaos: generateChaosScenarios,
  };

  return generators[statId]?.(length) || [];
}

/**
 * Strength scenarios - favor homogeneity and runs
 */
function generateStrengthScenarios(length: number): Scenario[] {
  return [
    {
      id: 'extreme-homogeneity',
      name: 'EXTREME_HOMOGENEITY',
      description: 'All A (max dominance)',
      pattern: 'A'.repeat(length),
      expectedOutcome: 'Very High Strength (9-10)',
    },
    {
      id: 'perfect-runs',
      name: 'PERFECT_RUNS',
      description: 'Long consecutive runs',
      pattern: generateRunPattern(length, 'AAAA', 'GGGG', 'TTTT', 'CCCC'),
      expectedOutcome: 'High Strength (7-9)',
    },
    {
      id: 'motif-rich',
      name: 'MOTIF_RICH',
      description: 'Packed with strength motifs',
      pattern: generateMotifPattern(length, ['ATG', 'GTA', 'TAG']),
      expectedOutcome: 'High Strength (7-8)',
    },
    {
      id: 'chaos-pattern',
      name: 'CHAOS_PATTERN',
      description: 'Maximum entropy & diversity',
      pattern: generateRandomPattern(length),
      expectedOutcome: 'Very Low Strength (1-3)',
    },
  ];
}

/**
 * Agility scenarios - favor alternations and palindromes
 */
function generateAgilityScenarios(length: number): Scenario[] {
  return [
    {
      id: 'perfect-alternation',
      name: 'PERFECT_ALTERNATION',
      description: 'ABABAB pattern',
      pattern: generateAlternatingPattern(length, 'AB'),
      expectedOutcome: 'Very High Agility (9-10)',
    },
    {
      id: 'palindrome-rich',
      name: 'PALINDROME_RICH',
      description: 'Multiple palindromes',
      pattern: generatePalindromePattern(length),
      expectedOutcome: 'High Agility (7-9)',
    },
    {
      id: 'balanced-symbols',
      name: 'BALANCED_SYMBOLS',
      description: 'Perfect symbol balance',
      pattern: generateBalancedPattern(length),
      expectedOutcome: 'Moderate Agility (5-7)',
    },
    {
      id: 'too-homogeneous',
      name: 'TOO_HOMOGENEOUS',
      description: 'All one symbol (penalized)',
      pattern: 'G'.repeat(length),
      expectedOutcome: 'Low Agility (2-4)',
    },
  ];
}

/**
 * Endurance scenarios - favor consistency and moderate patterns
 */
function generateEnduranceScenarios(length: number): Scenario[] {
  return [
    {
      id: 'consistent-pattern',
      name: 'CONSISTENT_PATTERN',
      description: 'Repeating ATCG',
      pattern: 'ATCG'.repeat(Math.ceil(length / 4)).substring(0, length),
      expectedOutcome: 'High Endurance (7-9)',
    },
    {
      id: 'balanced-runs',
      name: 'BALANCED_RUNS',
      description: 'Moderate runs of each',
      pattern: generateBalancedRuns(length),
      expectedOutcome: 'High Endurance (7-8)',
    },
    {
      id: 'motif-rich',
      name: 'MOTIF_RICH',
      description: 'Endurance motifs',
      pattern: generateMotifPattern(length, ['CAG', 'GCA', 'ACG']),
      expectedOutcome: 'Moderate Endurance (5-7)',
    },
    {
      id: 'extreme-chaos',
      name: 'EXTREME_CHAOS',
      description: 'High fragmentation',
      pattern: generateFragmentedPattern(length),
      expectedOutcome: 'Low Endurance (2-4)',
    },
  ];
}

/**
 * Intelligence scenarios - favor high entropy and diversity
 */
function generateIntelligenceScenarios(length: number): Scenario[] {
  return [
    {
      id: 'maximum-entropy',
      name: 'MAXIMUM_ENTROPY',
      description: 'All 8 symbols evenly',
      pattern: generateMaxEntropyPattern(length),
      expectedOutcome: 'Very High Intelligence (9-10)',
    },
    {
      id: 'complex-patterns',
      name: 'COMPLEX_PATTERNS',
      description: 'Overlapping motifs',
      pattern: generateComplexPattern(length),
      expectedOutcome: 'High Intelligence (7-9)',
    },
    {
      id: 'diverse-symbols',
      name: 'DIVERSE_SYMBOLS',
      description: 'High symbol variety',
      pattern: generateRandomPattern(length),
      expectedOutcome: 'High Intelligence (7-8)',
    },
    {
      id: 'homogeneous',
      name: 'HOMOGENEOUS',
      description: 'All T (penalized)',
      pattern: 'T'.repeat(length),
      expectedOutcome: 'Very Low Intelligence (1-2)',
    },
  ];
}

/**
 * Perception scenarios - favor balance and motif diversity
 */
function generatePerceptionScenarios(length: number): Scenario[] {
  return [
    {
      id: 'balanced-motifs',
      name: 'BALANCED_MOTIFS',
      description: 'Diverse perception motifs',
      pattern: generateMotifPattern(length, ['TAC', 'ACT', 'CTA', 'XWY']),
      expectedOutcome: 'High Perception (7-9)',
    },
    {
      id: 'perfect-balance',
      name: 'PERFECT_BALANCE',
      description: 'All symbols equal',
      pattern: generateBalancedPattern(length),
      expectedOutcome: 'High Perception (7-8)',
    },
    {
      id: 'moderate-diversity',
      name: 'MODERATE_DIVERSITY',
      description: 'Mix of patterns',
      pattern: generateMixedPattern(length),
      expectedOutcome: 'Moderate Perception (5-7)',
    },
    {
      id: 'extreme-dominance',
      name: 'EXTREME_DOMINANCE',
      description: '90% one symbol',
      pattern: generateDominantPattern(length, 'A', 0.9),
      expectedOutcome: 'Low Perception (2-4)',
    },
  ];
}

/**
 * Psychic scenarios - favor cat-alien balance
 */
function generatePsychicScenarios(length: number): Scenario[] {
  return [
    {
      id: 'perfect-hybrid',
      name: 'PERFECT_HYBRID',
      description: '50% cat, 50% alien',
      pattern: generateHybridPattern(length, 0.5),
      expectedOutcome: 'Very High Psychic (9-10)',
    },
    {
      id: 'complex-fusion',
      name: 'COMPLEX_FUSION',
      description: 'Interleaved cat-alien',
      pattern: generateInterleavedHybrid(length),
      expectedOutcome: 'High Psychic (7-9)',
    },
    {
      id: 'pure-cat',
      name: 'PURE_CAT',
      description: 'Only ATCG (penalized)',
      pattern: generatePureCatPattern(length),
      expectedOutcome: 'Low Psychic (2-4)',
    },
    {
      id: 'pure-alien',
      name: 'PURE_ALIEN',
      description: 'Only WXYZ (penalized)',
      pattern: generatePureAlienPattern(length),
      expectedOutcome: 'Low Psychic (2-4)',
    },
  ];
}

/**
 * Fire resistance scenarios - favor extreme runs
 */
function generateFireScenarios(length: number): Scenario[] {
  return [
    {
      id: 'extreme-g-runs',
      name: 'EXTREME_G_RUNS',
      description: 'All G (max resistance)',
      pattern: 'G'.repeat(length),
      expectedOutcome: 'Very High Resistance (90-100)',
    },
    {
      id: 'long-runs',
      name: 'LONG_RUNS',
      description: 'GGGG ZZZZ patterns',
      pattern: generateRunPattern(length, 'GGGG', 'ZZZZ'),
      expectedOutcome: 'High Resistance (70-85)',
    },
    {
      id: 'motif-rich',
      name: 'MOTIF_RICH',
      description: 'Fire motifs',
      pattern: generateMotifPattern(length, ['GGG', 'GGGG', 'ZZZ']),
      expectedOutcome: 'Moderate Resistance (50-70)',
    },
    {
      id: 'high-diversity',
      name: 'HIGH_DIVERSITY',
      description: 'Mixed symbols (vulnerable)',
      pattern: generateRandomPattern(length),
      expectedOutcome: 'Low Resistance (10-30)',
    },
  ];
}

/**
 * Cold resistance scenarios - favor extreme A runs
 */
function generateColdScenarios(length: number): Scenario[] {
  return [
    {
      id: 'extreme-a-runs',
      name: 'EXTREME_A_RUNS',
      description: 'All A (max resistance)',
      pattern: 'A'.repeat(length),
      expectedOutcome: 'Very High Resistance (90-100)',
    },
    {
      id: 'long-runs',
      name: 'LONG_RUNS',
      description: 'AAAA WWWW patterns',
      pattern: generateRunPattern(length, 'AAAA', 'WWWW'),
      expectedOutcome: 'High Resistance (70-85)',
    },
    {
      id: 'motif-rich',
      name: 'MOTIF_RICH',
      description: 'Cold motifs',
      pattern: generateMotifPattern(length, ['AAA', 'AAAA', 'WWW']),
      expectedOutcome: 'Moderate Resistance (50-70)',
    },
    {
      id: 'high-transitions',
      name: 'HIGH_TRANSITIONS',
      description: 'Frequent changes (vulnerable)',
      pattern: generateAlternatingPattern(length, 'ATCG'),
      expectedOutcome: 'Low Resistance (10-30)',
    },
  ];
}

/**
 * Poison resistance scenarios
 */
function generatePoisonScenarios(length: number): Scenario[] {
  return [
    {
      id: 'motif-packed',
      name: 'MOTIF_PACKED',
      description: 'Poison motifs everywhere',
      pattern: generateMotifPattern(length, ['ATT', 'TTA', 'AAT', 'WXX']),
      expectedOutcome: 'High Resistance (70-85)',
    },
    {
      id: 'defensive-runs',
      name: 'DEFENSIVE_RUNS',
      description: 'Long consistent runs',
      pattern: generateRunPattern(length, 'TTT', 'AAA'),
      expectedOutcome: 'Moderate-High Resistance (60-75)',
    },
    {
      id: 'consistent-pattern',
      name: 'CONSISTENT_PATTERN',
      description: 'Low entropy pattern',
      pattern: 'ATTATTA'.repeat(Math.ceil(length / 7)).substring(0, length),
      expectedOutcome: 'Moderate Resistance (50-65)',
    },
    {
      id: 'scattered-chaos',
      name: 'SCATTERED_CHAOS',
      description: 'High entropy (vulnerable)',
      pattern: generateRandomPattern(length),
      expectedOutcome: 'Low Resistance (20-40)',
    },
  ];
}

/**
 * Acid resistance scenarios
 */
function generateAcidScenarios(length: number): Scenario[] {
  return [
    {
      id: 'motif-dominant',
      name: 'MOTIF_DOMINANT',
      description: 'CGG GGC patterns',
      pattern: generateMotifPattern(length, ['CGG', 'GGC', 'CCG', 'YZZ']),
      expectedOutcome: 'High Resistance (70-85)',
    },
    {
      id: 'long-g-runs',
      name: 'LONG_G_RUNS',
      description: 'Stable G sequences',
      pattern: generateRunPattern(length, 'GGG', 'CCC'),
      expectedOutcome: 'High Resistance (65-80)',
    },
    {
      id: 'low-diversity',
      name: 'LOW_DIVERSITY',
      description: 'Minimal symbol variety',
      pattern: generateDominantPattern(length, 'G', 0.7),
      expectedOutcome: 'Moderate Resistance (50-70)',
    },
    {
      id: 'fragmented',
      name: 'FRAGMENTED',
      description: 'High volatility (vulnerable)',
      pattern: generateFragmentedPattern(length),
      expectedOutcome: 'Low Resistance (15-35)',
    },
  ];
}

/**
 * Psychic resistance scenarios
 */
function generatePsychicResistanceScenarios(length: number): Scenario[] {
  return [
    {
      id: 'palindrome-shield',
      name: 'PALINDROME_SHIELD',
      description: 'Symmetric patterns',
      pattern: generatePalindromePattern(length),
      expectedOutcome: 'High Resistance (70-85)',
    },
    {
      id: 'balanced-structure',
      name: 'BALANCED_STRUCTURE',
      description: 'Even entropy',
      pattern: generateBalancedPattern(length),
      expectedOutcome: 'Moderate-High Resistance (60-75)',
    },
    {
      id: 'motif-rich',
      name: 'MOTIF_RICH',
      description: 'CGCG patterns',
      pattern: generateMotifPattern(length, ['CGCG', 'GCGC', 'YXYX']),
      expectedOutcome: 'Moderate Resistance (50-70)',
    },
    {
      id: 'extreme-chaos',
      name: 'EXTREME_CHAOS',
      description: 'Random noise (vulnerable)',
      pattern: generateRandomPattern(length),
      expectedOutcome: 'Low Resistance (20-40)',
    },
  ];
}

/**
 * Radiation resistance scenarios
 */
function generateRadiationScenarios(length: number): Scenario[] {
  return [
    {
      id: 'perfect-balance',
      name: 'PERFECT_BALANCE',
      description: 'Balanced redundancy',
      pattern: generateBalancedPattern(length),
      expectedOutcome: 'High Resistance (70-85)',
    },
    {
      id: 'motif-redundant',
      name: 'MOTIF_REDUNDANT',
      description: 'ATCG repair motifs',
      pattern: generateMotifPattern(length, ['ATCG', 'GCTA', 'WXYZ']),
      expectedOutcome: 'Moderate-High Resistance (60-75)',
    },
    {
      id: 'consistent-pattern',
      name: 'CONSISTENT_PATTERN',
      description: 'Self-correcting sequences',
      pattern: 'ATCGATCG'.repeat(Math.ceil(length / 8)).substring(0, length),
      expectedOutcome: 'Moderate Resistance (50-70)',
    },
    {
      id: 'extreme-dominance',
      name: 'EXTREME_DOMINANCE',
      description: 'Too homogeneous (vulnerable)',
      pattern: 'C'.repeat(length),
      expectedOutcome: 'Low Resistance (20-40)',
    },
  ];
}

/**
 * Aggression scenarios
 */
function generateAggressionScenarios(length: number): Scenario[] {
  return [
    {
      id: 'dominant-force',
      name: 'DOMINANT_FORCE',
      description: 'Overwhelming A presence',
      pattern: generateDominantPattern(length, 'A', 0.85),
      expectedOutcome: 'Very High Aggression (9-10)',
    },
    {
      id: 'aggressive-runs',
      name: 'AGGRESSIVE_RUNS',
      description: 'Long forceful runs',
      pattern: generateRunPattern(length, 'AAAAA', 'GGGGG'),
      expectedOutcome: 'High Aggression (7-9)',
    },
    {
      id: 'single-minded',
      name: 'SINGLE_MINDED',
      description: 'Ultra-low entropy',
      pattern: 'G'.repeat(length),
      expectedOutcome: 'High Aggression (7-8)',
    },
    {
      id: 'scattered-weak',
      name: 'SCATTERED_WEAK',
      description: 'High diversity (timid)',
      pattern: generateRandomPattern(length),
      expectedOutcome: 'Low Aggression (2-4)',
    },
  ];
}

/**
 * Curiosity scenarios
 */
function generateCuriosityScenarios(length: number): Scenario[] {
  return [
    {
      id: 'maximum-novelty',
      name: 'MAXIMUM_NOVELTY',
      description: 'All rare symbols',
      pattern: generateMaxEntropyPattern(length),
      expectedOutcome: 'Very High Curiosity (9-10)',
    },
    {
      id: 'exploratory-diversity',
      name: 'EXPLORATORY_DIVERSITY',
      description: 'High symbol variety',
      pattern: generateRandomPattern(length),
      expectedOutcome: 'High Curiosity (7-9)',
    },
    {
      id: 'pattern-variety',
      name: 'PATTERN_VARIETY',
      description: 'Many different patterns',
      pattern: generateComplexPattern(length),
      expectedOutcome: 'Moderate Curiosity (5-7)',
    },
    {
      id: 'boring-repetition',
      name: 'BORING_REPETITION',
      description: 'Same pattern (incurious)',
      pattern: 'TT'.repeat(Math.ceil(length / 2)).substring(0, length),
      expectedOutcome: 'Very Low Curiosity (1-3)',
    },
  ];
}

/**
 * Loyalty scenarios
 */
function generateLoyaltyScenarios(length: number): Scenario[] {
  return [
    {
      id: 'perfect-repeats',
      name: 'PERFECT_REPEATS',
      description: 'Tandem repeats everywhere',
      pattern: generateTandemRepeatPattern(length, 'ATCG'),
      expectedOutcome: 'Very High Loyalty (9-10)',
    },
    {
      id: 'consistent-pattern',
      name: 'CONSISTENT_PATTERN',
      description: 'Ultra-stable sequence',
      pattern: 'AATTCC'.repeat(Math.ceil(length / 6)).substring(0, length),
      expectedOutcome: 'High Loyalty (7-9)',
    },
    {
      id: 'low-variance',
      name: 'LOW_VARIANCE',
      description: 'Minimal fluctuation',
      pattern: generateLowVariancePattern(length),
      expectedOutcome: 'Moderate-High Loyalty (6-8)',
    },
    {
      id: 'volatile-fickle',
      name: 'VOLATILE_FICKLE',
      description: 'Constant changes (disloyal)',
      pattern: generateFragmentedPattern(length),
      expectedOutcome: 'Low Loyalty (2-4)',
    },
  ];
}

/**
 * Chaos scenarios
 */
function generateChaosScenarios(length: number): Scenario[] {
  return [
    {
      id: 'maximum-entropy',
      name: 'MAXIMUM_ENTROPY',
      description: 'Ultimate disorder',
      pattern: generateMaxEntropyPattern(length),
      expectedOutcome: 'Very High Chaos (9-10)',
    },
    {
      id: 'overlapping-patterns',
      name: 'OVERLAPPING_PATTERNS',
      description: 'Colliding structures',
      pattern: generateComplexPattern(length),
      expectedOutcome: 'High Chaos (7-9)',
    },
    {
      id: 'high-complexity',
      name: 'HIGH_COMPLEXITY',
      description: 'Genetic turbulence',
      pattern: generateRandomPattern(length),
      expectedOutcome: 'High Chaos (7-8)',
    },
    {
      id: 'boring-order',
      name: 'BORING_ORDER',
      description: 'Predictable (orderly)',
      pattern: 'ATCG'.repeat(Math.ceil(length / 4)).substring(0, length),
      expectedOutcome: 'Low Chaos (2-4)',
    },
  ];
}

// ============================================================================
// PATTERN GENERATORS
// ============================================================================

function generateRunPattern(length: number, ...runs: string[]): string {
  let pattern = '';
  let runIndex = 0;
  
  while (pattern.length < length) {
    const run = runs[runIndex % runs.length];
    pattern += run;
    runIndex++;
  }
  
  return pattern.substring(0, length);
}

function generateMotifPattern(length: number, motifs: string[]): string {
  let pattern = '';
  let motifIndex = 0;
  
  while (pattern.length < length) {
    pattern += motifs[motifIndex % motifs.length];
    motifIndex++;
  }
  
  return pattern.substring(0, length);
}

function generateAlternatingPattern(length: number, sequence: string): string {
  return sequence.repeat(Math.ceil(length / sequence.length)).substring(0, length);
}

function generatePalindromePattern(length: number): string {
  const palindromes = ['ATCGCGTA', 'AGGA', 'TAAT', 'CGCG', 'WXYZZYXW'];
  return generateMotifPattern(length, palindromes);
}

function generateBalancedPattern(length: number): string {
  const symbols: GenomeSymbol[] = ['A', 'T', 'C', 'G', 'W', 'X', 'Y', 'Z'];
  let pattern = '';
  
  while (pattern.length < length) {
    pattern += symbols[pattern.length % symbols.length];
  }
  
  return pattern;
}

function generateBalancedRuns(length: number): string {
  const runs = ['AAA', 'TTT', 'CCC', 'GGG'];
  return generateRunPattern(length, ...runs);
}

function generateFragmentedPattern(length: number): string {
  const symbols: GenomeSymbol[] = ['A', 'T', 'C', 'G', 'W', 'X', 'Y', 'Z'];
  let pattern = '';
  
  for (let i = 0; i < length; i++) {
    pattern += symbols[Math.floor(Math.random() * symbols.length)];
  }
  
  return pattern;
}

function generateMaxEntropyPattern(length: number): string {
  const symbols: GenomeSymbol[] = ['A', 'T', 'C', 'G', 'W', 'X', 'Y', 'Z'];
  let pattern = '';
  const targetPerSymbol = Math.floor(length / 8);
  
  for (const symbol of symbols) {
    pattern += symbol.repeat(targetPerSymbol);
  }
  
  while (pattern.length < length) {
    pattern += symbols[pattern.length % symbols.length];
  }
  
  return shuffleString(pattern);
}

function generateComplexPattern(length: number): string {
  const patterns = ['ATCG', 'WXYZ', 'AGCT', 'WYXZ', 'ATGC', 'WZYX'];
  let result = '';
  
  for (const p of patterns) {
    result += p.repeat(Math.ceil(length / (patterns.length * p.length)));
  }
  
  return shuffleString(result).substring(0, length);
}

function generateRandomPattern(length: number): string {
  const symbols: GenomeSymbol[] = ['A', 'T', 'C', 'G', 'W', 'X', 'Y', 'Z'];
  let pattern = '';
  
  for (let i = 0; i < length; i++) {
    pattern += symbols[Math.floor(Math.random() * symbols.length)];
  }
  
  return pattern;
}

function generateDominantPattern(length: number, dominantSymbol: string, ratio: number): string {
  const dominantCount = Math.floor(length * ratio);
  const otherSymbols: GenomeSymbol[] = ['A', 'T', 'C', 'G'].filter(s => s !== dominantSymbol) as GenomeSymbol[];
  
  let pattern = dominantSymbol.repeat(dominantCount);
  
  while (pattern.length < length) {
    pattern += otherSymbols[Math.floor(Math.random() * otherSymbols.length)];
  }
  
  return shuffleString(pattern);
}

function generateHybridPattern(length: number, alienRatio: number): string {
  const catSymbols: GenomeSymbol[] = ['A', 'T', 'C', 'G'];
  const alienSymbols: GenomeSymbol[] = ['W', 'X', 'Y', 'Z'];
  
  const alienCount = Math.floor(length * alienRatio);
  const catCount = length - alienCount;
  
  let pattern = '';
  
  for (let i = 0; i < catCount; i++) {
    pattern += catSymbols[Math.floor(Math.random() * catSymbols.length)];
  }
  
  for (let i = 0; i < alienCount; i++) {
    pattern += alienSymbols[Math.floor(Math.random() * alienSymbols.length)];
  }
  
  return shuffleString(pattern);
}

function generateInterleavedHybrid(length: number): string {
  const catSymbols: GenomeSymbol[] = ['A', 'T', 'C', 'G'];
  const alienSymbols: GenomeSymbol[] = ['W', 'X', 'Y', 'Z'];
  
  let pattern = '';
  
  for (let i = 0; i < length; i++) {
    if (i % 2 === 0) {
      pattern += catSymbols[Math.floor(Math.random() * catSymbols.length)];
    } else {
      pattern += alienSymbols[Math.floor(Math.random() * alienSymbols.length)];
    }
  }
  
  return pattern;
}

function generatePureCatPattern(length: number): string {
  const catSymbols: GenomeSymbol[] = ['A', 'T', 'C', 'G'];
  let pattern = '';
  
  for (let i = 0; i < length; i++) {
    pattern += catSymbols[Math.floor(Math.random() * catSymbols.length)];
  }
  
  return pattern;
}

function generatePureAlienPattern(length: number): string {
  const alienSymbols: GenomeSymbol[] = ['W', 'X', 'Y', 'Z'];
  let pattern = '';
  
  for (let i = 0; i < length; i++) {
    pattern += alienSymbols[Math.floor(Math.random() * alienSymbols.length)];
  }
  
  return pattern;
}

function generateMixedPattern(length: number): string {
  const patterns = [
    'ATCGATCG',
    'WXYZWXYZ',
    'AAATTTCCCGGG',
    'WWWXXXYYYZZZ',
  ];
  
  let result = '';
  
  for (const p of patterns) {
    result += p.repeat(Math.ceil(length / (patterns.length * p.length)));
  }
  
  return shuffleString(result).substring(0, length);
}

function generateTandemRepeatPattern(length: number, repeat: string): string {
  return repeat.repeat(Math.ceil(length / repeat.length)).substring(0, length);
}

function generateLowVariancePattern(length: number): string {
  const symbols: GenomeSymbol[] = ['A', 'A', 'A', 'T', 'T', 'C'];
  let pattern = '';
  
  for (let i = 0; i < length; i++) {
    pattern += symbols[Math.floor(Math.random() * symbols.length)];
  }
  
  return pattern;
}

function shuffleString(str: string): string {
  const arr = str.split('');
  
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  
  return arr.join('');
}