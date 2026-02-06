// lib/components/about/stats/utils/visualHelpers.ts

import type { StatCategory } from './statCalculations';

/**
 * Format component name from camelCase to DISPLAY_FORMAT
 * Example: 'dominantConcentration' -> 'Dominant Concentration'
 */
export function formatComponentName(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

/**
 * Get the mapping formula based on category
 */
export function getMappingFormula(category: StatCategory): string {
  if (category === 'resistances') {
    return 'RESISTANCE = 50 + (RAW_SCORE / 2)';
  }
  return 'STAT = 1 + ((RAW_SCORE / 100) × 9)';
}

/**
 * Get stat label based on value
 */
export function getStatLabel(value: number, category: StatCategory): string {
  if (category === 'resistances') {
    if (value >= 80) return 'IMMUNE';
    if (value >= 60) return 'HIGH';
    if (value >= 40) return 'MODERATE';
    if (value >= 20) return 'LOW';
    return 'VULNERABLE';
  }
  
  if (value >= 9) return 'EXCEPTIONAL';
  if (value >= 7) return 'HIGH';
  if (value >= 5) return 'MODERATE';
  if (value >= 3) return 'LOW';
  return 'MINIMAL';
}

/**
 * Get narrative interpretation of a stat value
 */
export function getStatInterpretation(
  value: number, 
  category: StatCategory,
  statName: string
): string {
  const label = getStatLabel(value, category);
  
  const interpretations: Record<StatCategory, Record<string, Record<string, string>>> = {
    stats: {
      strength: {
        EXCEPTIONAL: 'This creature exhibits extraordinary physical power. Capable of feats that defy conventional biology.',
        HIGH: 'Significantly above-average strength. Can overpower most terrestrial predators.',
        MODERATE: 'Average strength for a hybrid specimen. Comparable to large Earth felines.',
        LOW: 'Below-average physical power. Relies more on other attributes.',
        MINIMAL: 'Minimal strength expression. This specimen prioritizes other survival strategies.',
      },
      agility: {
        EXCEPTIONAL: 'Movements flow with preternatural grace. This creature seems to dance through spacetime itself.',
        HIGH: 'Highly coordinated and nimble. Exceptional reflexes and motor control.',
        MODERATE: 'Standard agility for a hybrid. Capable but not exceptional.',
        LOW: 'Below-average coordination. Movements lack fluidity.',
        MINIMAL: 'Poor agility. This specimen is better suited to stationary activities.',
      },
      endurance: {
        EXCEPTIONAL: 'Biological resilience far exceeds standard parameters. Can withstand extreme conditions indefinitely.',
        HIGH: 'High stamina and durability. Recovers quickly from physical stress.',
        MODERATE: 'Average endurance. Can sustain moderate activity levels.',
        LOW: 'Below-average stamina. Tires more easily than typical specimens.',
        MINIMAL: 'Poor endurance. Requires frequent rest periods.',
      },
      intelligence: {
        EXCEPTIONAL: 'Cognitive abilities approach or exceed human levels. Capable of complex problem-solving.',
        HIGH: 'Highly intelligent. Can learn complex behaviors and understand abstract concepts.',
        MODERATE: 'Standard intelligence for a hybrid. Can learn basic commands and routines.',
        LOW: 'Below-average cognitive function. Relies primarily on instinct.',
        MINIMAL: 'Minimal cognitive complexity. Operates on pure instinct.',
      },
      perception: {
        EXCEPTIONAL: 'Sensory acuity beyond measurement. Can detect phenomena invisible to standard detection methods.',
        HIGH: 'Highly perceptive. Notices subtle environmental changes and patterns.',
        MODERATE: 'Standard sensory capabilities. Adequate awareness of surroundings.',
        LOW: 'Below-average perception. Misses subtle environmental cues.',
        MINIMAL: 'Poor sensory processing. Limited awareness of environment.',
      },
      psychic: {
        EXCEPTIONAL: 'Powerful psionic abilities. Can manipulate thoughts, perceive distant events, and affect reality.',
        HIGH: 'Significant psychic potential. Demonstrates telepathic sensitivity and minor reality distortion.',
        MODERATE: 'Modest psychic abilities. Occasional precognitive flashes or empathic sensitivity.',
        LOW: 'Minimal psionic expression. Rare and weak psychic phenomena.',
        MINIMAL: 'No measurable psychic abilities. Purely physical specimen.',
      },
    },
    resistances: {
      poison: {
        IMMUNE: 'Complete immunity to all known toxins. Metabolism converts poisons into harmless compounds.',
        HIGH: 'Highly resistant to toxins. Can survive exposure to most poisons with minimal effects.',
        MODERATE: 'Moderate poison resistance. Can tolerate some toxins but not all.',
        LOW: 'Low resistance. Susceptible to most toxins.',
        VULNERABLE: 'Highly vulnerable to poisons. Even mild toxins can be fatal.',
      },
      acid: {
        IMMUNE: 'Complete acid immunity. Molecular structure resists all corrosive compounds.',
        HIGH: 'High acid resistance. Can withstand exposure to strong acids.',
        MODERATE: 'Moderate protection. Can handle weak acids but vulnerable to strong ones.',
        LOW: 'Low resistance. Most acids cause significant damage.',
        VULNERABLE: 'Extremely vulnerable to acid. Even weak solutions are dangerous.',
      },
      fire: {
        IMMUNE: 'Complete thermal immunity. Can walk through flames unharmed.',
        HIGH: 'High fire resistance. Can withstand extreme heat with minimal damage.',
        MODERATE: 'Moderate heat tolerance. Can survive brief fire exposure.',
        LOW: 'Low resistance. Fire causes significant injury.',
        VULNERABLE: 'Highly flammable. Extreme vulnerability to heat and flames.',
      },
      cold: {
        IMMUNE: 'Complete cryogenic immunity. Functions normally at absolute zero.',
        HIGH: 'High cold resistance. Thrives in sub-zero temperatures.',
        MODERATE: 'Moderate cold tolerance. Can survive freezing conditions briefly.',
        LOW: 'Low resistance. Cold causes significant harm.',
        VULNERABLE: 'Extreme vulnerability to cold. Cannot survive low temperatures.',
      },
      psychicResistance: {
        IMMUNE: 'Complete mental shielding. Impervious to all psionic intrusion.',
        HIGH: 'Strong mental defenses. Resists most psychic attacks and manipulation.',
        MODERATE: 'Moderate mental shielding. Some protection against psionic influence.',
        LOW: 'Weak mental defenses. Vulnerable to psychic manipulation.',
        VULNERABLE: 'No mental shielding. Completely open to psychic intrusion.',
      },
      radiation: {
        IMMUNE: 'Complete radiation immunity. DNA repair mechanisms are perfect.',
        HIGH: 'High radiation resistance. Can survive nuclear environments.',
        MODERATE: 'Moderate protection. Can tolerate elevated radiation levels.',
        LOW: 'Low resistance. Radiation causes cellular damage.',
        VULNERABLE: 'Extreme radiation vulnerability. DNA degrades rapidly under exposure.',
      },
    },
    behaviors: {
      aggression: {
        EXCEPTIONAL: 'Extremely hostile and territorial. Attacks unprovoked. Handle with extreme caution.',
        HIGH: 'Highly aggressive. Quick to violence when threatened or frustrated.',
        MODERATE: 'Moderately aggressive. Normal defensive responses to threats.',
        LOW: 'Low aggression. Prefers avoidance over confrontation.',
        MINIMAL: 'Exceptionally docile. Rarely displays hostility even when threatened.',
      },
      curiosity: {
        EXCEPTIONAL: 'Insatiably curious. Explores everything. May disassemble reality to understand it.',
        HIGH: 'Very curious and inquisitive. Constantly investigates novel stimuli.',
        MODERATE: 'Moderately curious. Shows interest in new things but not obsessively.',
        LOW: 'Low curiosity. Prefers familiar routines and environments.',
        MINIMAL: 'No curiosity. Completely uninterested in novelty or exploration.',
      },
      loyalty: {
        EXCEPTIONAL: 'Unwavering loyalty. Will follow commands even at great personal cost.',
        HIGH: 'Highly loyal and devoted. Strong bond with handler.',
        MODERATE: 'Moderately loyal. Reliable but not fanatical.',
        LOW: 'Low loyalty. Unreliable and easily distracted.',
        MINIMAL: 'No loyalty. Completely independent and unreliable.',
      },
      chaos: {
        EXCEPTIONAL: 'Pure chaos incarnate. Behavior is completely unpredictable. Reality bends around this specimen.',
        HIGH: 'Highly chaotic and erratic. No consistent behavior patterns.',
        MODERATE: 'Moderately unpredictable. Some chaotic tendencies.',
        LOW: 'Low chaos. Mostly predictable with occasional surprises.',
        MINIMAL: 'Completely orderly. Behavior is perfectly predictable.',
      },
    },
  };

  const categoryInterpretations = interpretations[category];
  const statInterpretations = categoryInterpretations[statName.toLowerCase()];
  
  if (statInterpretations && statInterpretations[label]) {
    return statInterpretations[label];
  }

  return `${label} ${statName}: ${value}/${category === 'resistances' ? '100' : '10'}`;
}

/**
 * Get explanation text for a specific component
 */
export function getComponentExplanation(
  componentKey: string,
  value: number
): string {
  const explanations: Record<string, (v: number) => string> = {
    // Strength components
    dominantConcentration: (v) => 
      `Measures how concentrated the dominant symbol is. Formula: (dominantCount / segmentLength) × 40. Value: ${v}. Higher concentration = more strength.`,
    consecutiveRuns: (v) =>
      `Counts long runs of identical symbols (4+ bases). Formula: min(40, runCount × 8). Value: ${v}. More runs = more brute force.`,
    motifDensity: (v) =>
      `Counts strength motifs (ATG, GTA, TAG, etc.). Formula: min(20, motifCount × 2). Value: ${v}. More motifs = more power.`,
    
    // Agility components
    alternationScore: (v) =>
      `Measures longest alternating pattern (ABABAB...). Formula: min(50, alternationLength × 5). Value: ${v}. Longer alternations = better coordination.`,
    palindromeBonus: (v) =>
      `Counts palindromic sequences (reads same forwards/backwards). Formula: min(30, palindromeCount × 6). Value: ${v}. More palindromes = better balance.`,
    balanceScore: (v) =>
      `Measures how evenly symbols are distributed. Formula: 20 - (stdDev × 100). Value: ${v}. Perfect balance = maximum agility.`,
    
    // Endurance components
    symbolBalance: (v) =>
      `Symbol distribution evenness. Formula: 20 - (variance / 3). Value: ${v}. Balance = resilience.`,
    consistentPatterns: (v) =>
      `Measures pattern consistency. Formula: min(40, repeatCount × 8). Value: ${v}. Consistency = durability.`,
    moderateRuns: (v) =>
      `Optimal run length (3-5 bases). Formula: min(40, optimalRunCount × 8). Value: ${v}. Moderate runs = stamina.`,
    
    // Intelligence components
    entropyScore: (v) =>
      `Shannon entropy measurement. Formula: (entropy / 3) × 50. Value: ${v}. Higher entropy = more cognitive complexity.`,
    symbolDiversity: (v) =>
      `Number of different symbols present. Formula: uniqueSymbols × 10. Value: ${v}. More diversity = more intelligence.`,
    patternComplexity: (v) =>
      `Overlapping pattern count. Formula: min(30, overlapCount × 5). Value: ${v}. Complexity = cognitive power.`,
    
    // Perception components
    motifDiversity: (v) =>
      `Variety of different motifs found. Formula: min(40, uniqueMotifs × 8). Value: ${v}. Diverse motifs = better perception.`,
    balancedSymbols: (v) =>
      `Symbol distribution balance. Formula: 20 - (stdDev × 100). Value: ${v}. Balance = sensory acuity.`,
    patternVariety: (v) =>
      `Different pattern types detected. Formula: min(40, varietyScore × 4). Value: ${v}. Variety = awareness.`,
    
    // Psychic components
    catAlienBalance: (v) =>
      `Balance between cat (ATCG) and alien (WXYZ) DNA. Formula: 50 - abs(catPercent - 50). Value: ${v}. Perfect 50/50 = maximum psychic power.`,
    fusionComplexity: (v) =>
      `Complexity of cat-alien integration. Formula: (entropy / 3) × 30. Value: ${v}. Complex fusion = psionic ability.`,
    hybridEntropy: (v) =>
      `Entropy across both DNA types. Formula: (combinedEntropy / 3) × 20. Value: ${v}. High entropy = mental power.`,
    
    // Chaos penalties (shared across many stats)
    entropyPenalty: (v) =>
      `Penalty for excessive entropy/disorder. Formula: (entropy / 3) × penalty_weight. Value: ${v}. Chaos disrupts specialization.`,
    rareSymbolPenalty: (v) =>
      `Penalty for rare symbols that weaken patterns. Formula: rareCount × weight. Value: ${v}. Rare symbols = genetic noise.`,
    fragmentationPenalty: (v) =>
      `Penalty for pattern fragmentation. Formula: min(20, fragmentCount × 2). Value: ${v}. Fragmentation = instability.`,
    homogeneityPenalty: (v) =>
      `Penalty for excessive dominance of one symbol. Formula: (dominantPercent - threshold) × weight. Value: ${v}. Too much homogeneity hurts traits that need diversity.`,
    diversityPenalty: (v) =>
      `Penalty for excessive diversity. Formula: min(40, (entropy - threshold) × 133). Value: ${v}. Too much chaos disrupts coordination.`,
    randomPatternPenalty: (v) =>
      `Penalty for lack of recognizable patterns. Formula: min(20, randomLength / 5). Value: ${v}. No patterns = no structure.`,
  };

  const explainer = explanations[componentKey];
  
  if (explainer) {
    return explainer(value);
  }

  return `${formatComponentName(componentKey)}: ${value}`;
}

/**
 * Color palette for pattern types
 */
export const PATTERN_COLORS = {
  motif: '#30D6D6',
  run: '#FFE66D',
  palindrome: '#B388FF',
  alternation: '#4ECDC4',
  tandemRepeat: '#FF6B9D',
};

/**
 * Get color for a pattern type
 */
export function getPatternColor(patternType: string): string {
  return PATTERN_COLORS[patternType as keyof typeof PATTERN_COLORS] || '#30D6D6';
}

/**
 * Get display name for pattern type
 */
export function getPatternTypeName(patternType: string): string {
  const names: Record<string, string> = {
    motif: 'MOTIFS',
    run: 'RUNS',
    palindrome: 'PALINDROMES',
    alternation: 'ALTERNATIONS',
    tandemRepeat: 'TANDEM_REPEATS',
  };
  
  return names[patternType] || patternType.toUpperCase();
}

/**
 * Format position for display
 */
export function formatPosition(position: number): string {
  return position.toString().padStart(3, '0');
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value)}%`;
}

/**
 * Get implementation code snippet for a stat
 */
export function getImplementationCode(statId: string): string {
  const codeSnippets: Record<string, string> = {
    strength: `// Strength calculation
const dominantSymbol = findDominantSymbol(segment);
const counts = countSymbols(segment);
const dominantCount = counts[dominantSymbol];
const dominantConcentration = (dominantCount / segment.length) * 40;

const runs = countSymbolRuns(segment, 4);
const consecutiveRuns = Math.min(40, runs * 8);

const motifMatches = findMotifs(segment, MOTIFS.STRENGTH);
const motifDensity = Math.min(20, motifMatches.length * 2);

const specializationScore = 
  dominantConcentration + consecutiveRuns + motifDensity;

const entropy = calculateEntropy(segment);
const entropyPenalty = (entropy / 3) * 50;

const chaosPenalty = entropyPenalty + rareSymbolPenalty + ...;

const rawScore = specializationScore - chaosPenalty;
const finalStat = 1 + ((rawScore / 100) * 9);`,

    agility: `// Agility calculation
const longestAlternation = countAlternations(segment);
const alternationScore = Math.min(50, longestAlternation * 5);

const palindromes = findPalindromes(segment, 4);
const palindromeBonus = Math.min(30, palindromes.length * 6);

const balanceScore = calculateSymbolBalance(segment);

const specializationScore = 
  alternationScore + palindromeBonus + balanceScore;

const homogeneityPenalty = dominantPercent > 70 
  ? Math.min(40, (dominantPercent - 70) * 1.33) 
  : 0;

const chaosPenalty = 
  homogeneityPenalty + diversityPenalty + randomPatternPenalty;

const rawScore = specializationScore - chaosPenalty;
const finalStat = 1 + ((rawScore / 100) * 9);`,

    intelligence: `// Intelligence calculation
const entropy = calculateEntropy(segment);
const entropyScore = (entropy / 3) * 50;

const uniqueSymbols = Object.values(countSymbols(segment))
  .filter(c => c > 0).length;
const diversityBonus = uniqueSymbols * 10;

const complexityScore = findOverlappingPatterns(segment);

const specializationScore = 
  entropyScore + diversityBonus + complexityScore;

const runs = countSymbolRuns(segment, 4);
const homogeneityPenalty = Math.min(40, runs * 8);

const chaosPenalty = 
  homogeneityPenalty + predictabilityPenalty + ...;

const rawScore = specializationScore - chaosPenalty;
const finalStat = 1 + ((rawScore / 100) * 9);`,
  };

  return codeSnippets[statId] || `// Implementation code for ${statId} not yet documented`;
}

/**
 * Stagger delay for animations (in milliseconds)
 */
export function getStaggerDelay(index: number, delayMs: number = 50): number {
  return index * delayMs;
}

/**
 * Determine if a raw score is positive or negative for display
 */
export function getScoreSign(rawScore: number): '+' | '-' | '' {
  if (rawScore > 0) return '+';
  if (rawScore < 0) return '-';
  return '';
}

/**
 * Get background color opacity based on value
 */
export function getValueOpacity(value: number, max: number): number {
  const ratio = value / max;
  return Math.max(0.1, Math.min(1, ratio));
}