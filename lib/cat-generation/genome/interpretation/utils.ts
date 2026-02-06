// lib/genome/interpretation/utils.ts

import type { GenomeSymbol, DebugInfo } from '../types';

/**
 * Extract a substring from genome based on region boundaries
 * 
 * @param genome - Full genome string
 * @param start - Start position (inclusive)
 * @param end - End position (inclusive)
 * @returns Extracted segment
 */
export function extractRegion(genome: string, start: number, end: number): string {
  return genome.substring(start, end + 1);
}

/**
 * Count frequency of each symbol in a genome segment
 * 
 * @param segment - Genome segment to analyze
 * @returns Object mapping each symbol to its count
 */
export function countSymbols(segment: string): Record<GenomeSymbol, number> {
  const counts: Record<string, number> = {
    A: 0, T: 0, C: 0, G: 0, W: 0, X: 0, Y: 0, Z: 0
  };
  
  for (const symbol of segment) {
    if (symbol in counts) {
      counts[symbol]++;
    }
  }
  
  return counts as Record<GenomeSymbol, number>;
}

/**
 * Find the dominant (most frequent) symbol in a segment
 * Tiebreaker: alphabetical order (A < C < G < T < W < X < Y < Z)
 * 
 * @param segment - Genome segment to analyze
 * @returns The most frequent symbol
 */
export function findDominantSymbol(segment: string): GenomeSymbol {
  const counts = countSymbols(segment);
  const symbolOrder: GenomeSymbol[] = ['A', 'C', 'G', 'T', 'W', 'X', 'Y', 'Z'];
  
  let maxCount = 0;
  let dominant: GenomeSymbol = 'A';
  
  for (const symbol of symbolOrder) {
    if (counts[symbol] > maxCount) {
      maxCount = counts[symbol];
      dominant = symbol;
    }
  }
  
  return dominant;
}

/**
 * Search for specific motifs in a genome segment
 * Returns array of motif matches with their positions
 * 
 * @param segment - Genome segment to search
 * @param motifs - Array of motif strings to find
 * @returns Array of matches with motif and position
 */
export function findMotifs(segment: string, motifs: string[]): Array<{ motif: string; position: number }> {
  const matches: Array<{ motif: string; position: number }> = [];
  
  for (const motif of motifs) {
    let position = 0;
    while ((position = segment.indexOf(motif, position)) !== -1) {
      matches.push({ motif, position });
      position += 1;
    }
  }
  
  return matches;
}

/**
 * Count unique motif types found (not total occurrences)
 * 
 * @param segment - Genome segment to search
 * @param motifs - Array of motif strings to find
 * @returns Number of different motif types found
 */
export function countUniqueMotifs(segment: string, motifs: string[]): number {
  const foundMotifs = new Set<string>();
  
  for (const motif of motifs) {
    if (segment.includes(motif)) {
      foundMotifs.add(motif);
    }
  }
  
  return foundMotifs.size;
}

/**
 * Detect tandem repeats (patterns that repeat immediately adjacent)
 * Example: "ATAT" is a tandem repeat of "AT"
 * 
 * @param segment - Genome segment to analyze
 * @param minLength - Minimum pattern length to detect (default: 2)
 * @param maxLength - Maximum pattern length to detect (default: 5)
 * @returns Array of unique repeat patterns found
 */
export function detectTandemRepeats(segment: string, minLength: number = 2, maxLength: number = 5): string[] {
  const repeats = new Set<string>();
  
  for (let patternLength = minLength; patternLength <= maxLength; patternLength++) {
    for (let i = 0; i <= segment.length - patternLength * 2; i++) {
      const pattern = segment.substring(i, i + patternLength);
      const nextPattern = segment.substring(i + patternLength, i + patternLength * 2);
      
      if (pattern === nextPattern) {
        repeats.add(pattern);
      }
    }
  }
  
  return Array.from(repeats);
}

/**
 * Calculate Shannon entropy of symbol distribution
 * Higher entropy = more diverse/random
 * Range: 0 (all same symbol) to ~3 (perfectly uniform distribution of 8 symbols)
 * 
 * @param segment - Genome segment to analyze
 * @returns Entropy value
 */
export function calculateEntropy(segment: string): number {
  const counts = countSymbols(segment);
  const length = segment.length;
  
  if (length === 0) return 0;
  
  let entropy = 0;
  for (const symbol in counts) {
    const p = counts[symbol as GenomeSymbol] / length;
    if (p > 0) {
      entropy -= p * Math.log2(p);
    }
  }
  
  return entropy;
}

/**
 * Count consecutive runs of identical symbols (length >= threshold)
 * Example: "AAAA" is a run of 4 A's
 * 
 * @param segment - Genome segment to analyze
 * @param minRunLength - Minimum run length to count (default: 3)
 * @returns Number of runs found
 */
export function countSymbolRuns(segment: string, minRunLength: number = 3): number {
  let runCount = 0;
  let currentSymbol = '';
  let currentRunLength = 0;
  
  for (const symbol of segment) {
    if (symbol === currentSymbol) {
      currentRunLength++;
    } else {
      if (currentRunLength >= minRunLength) {
        runCount++;
      }
      currentSymbol = symbol;
      currentRunLength = 1;
    }
  }
  
  if (currentRunLength >= minRunLength) {
    runCount++;
  }
  
  return runCount;
}

/**
 * Count rare symbols (symbols appearing fewer than threshold times)
 * 
 * @param segment - Genome segment to analyze
 * @param threshold - Maximum count to be considered "rare" (default: 5)
 * @returns Number of rare symbols
 */
export function countRareSymbols(segment: string, threshold: number = 5): number {
  const counts = countSymbols(segment);
  let rareCount = 0;
  
  for (const symbol in counts) {
    const count = counts[symbol as GenomeSymbol];
    if (count > 0 && count < threshold) {
      rareCount++;
    }
  }
  
  return rareCount;
}

/**
 * Convert RGB components to hex color string
 * 
 * @param r - Red component (0-255)
 * @param g - Green component (0-255)
 * @param b - Blue component (0-255)
 * @returns Hex color string (e.g., "#FF00AA")
 */
export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const clamped = Math.max(0, Math.min(255, Math.round(n)));
    return clamped.toString(16).padStart(2, '0');
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

/**
 * Create debug info object for logging/debugging
 * 
 * @param region - Region name
 * @param segment - Genome segment being analyzed
 * @param options - Optional debug features to include
 * @returns Debug info object
 */
export function createDebugInfo(
  region: string,
  segment: string,
  options?: {
    motifs?: string[];
    includeEntropy?: boolean;
    includeDominant?: boolean;
    includeRepeats?: boolean;
  }
): DebugInfo {
  const counts = countSymbols(segment);
  const debugInfo: DebugInfo = {
    region,
    foundMotifs: [],
    symbolFrequencies: counts
  };
  
  if (options?.motifs) {
    const matches = findMotifs(segment, options.motifs);
    debugInfo.foundMotifs = matches.map(m => m.motif);
  }
  
  if (options?.includeEntropy) {
    debugInfo.entropy = calculateEntropy(segment);
  }
  
  if (options?.includeDominant) {
    debugInfo.dominantSymbol = findDominantSymbol(segment);
  }
  
  if (options?.includeRepeats) {
    debugInfo.repeatingPatterns = detectTandemRepeats(segment);
  }
  
  return debugInfo;
}

// ============================================================================
// NEW UTILITY FUNCTIONS FOR OPPOSING FORCES STAT SYSTEM
// ============================================================================

/**
 * Count alternating patterns in a segment
 * Detects patterns like ABABAB, ABCABC, etc.
 * 
 * @param segment - Genome segment to analyze
 * @returns Length of longest alternation found
 */
export function countAlternations(segment: string): number {
  if (segment.length < 2) return 0;
  
  let maxAlternation = 0;
  
  for (let patternLength = 2; patternLength <= 6; patternLength++) {
    for (let i = 0; i <= segment.length - patternLength * 2; i++) {
      const pattern = segment.substring(i, i + patternLength);
      let alternationLength = patternLength;
      
      let pos = i + patternLength;
      while (pos + patternLength <= segment.length) {
        const nextChunk = segment.substring(pos, pos + patternLength);
        if (nextChunk === pattern) {
          alternationLength += patternLength;
          pos += patternLength;
        } else {
          break;
        }
      }
      
      if (alternationLength > maxAlternation) {
        maxAlternation = alternationLength;
      }
    }
  }
  
  return maxAlternation;
}

/**
 * Find palindromic sequences in a segment
 * Palindrome reads the same forwards and backwards (e.g., ATCGCGTA)
 * 
 * @param segment - Genome segment to search
 * @param minLength - Minimum palindrome length (default: 4)
 * @returns Array of palindromes found
 */
export function findPalindromes(segment: string, minLength: number = 4): string[] {
  const palindromes = new Set<string>();
  
  for (let length = minLength; length <= Math.min(10, segment.length); length++) {
    for (let i = 0; i <= segment.length - length; i++) {
      const substr = segment.substring(i, i + length);
      const reversed = substr.split('').reverse().join('');
      
      if (substr === reversed) {
        palindromes.add(substr);
      }
    }
  }
  
  return Array.from(palindromes);
}

/**
 * Calculate symbol balance score
 * Measures how evenly symbols are distributed
 * Perfect balance (all symbols equal) = 20, completely skewed = 0
 * 
 * @param segment - Genome segment to analyze
 * @returns Balance score (0-20)
 */
export function calculateSymbolBalance(segment: string): number {
  if (segment.length === 0) return 0;
  
  const counts = countSymbols(segment);
  const symbolsPresent = Object.values(counts).filter(c => c > 0);
  
  if (symbolsPresent.length === 0) return 0;
  
  const mean = segment.length / symbolsPresent.length;
  
  let sumSquaredDiff = 0;
  for (const count of symbolsPresent) {
    sumSquaredDiff += Math.pow(count - mean, 2);
  }
  
  const variance = sumSquaredDiff / symbolsPresent.length;
  const stdDev = Math.sqrt(variance);
  
  const normalizedStdDev = stdDev / segment.length;
  const balanceScore = Math.max(0, 20 - (normalizedStdDev * 100));
  
  return Math.round(balanceScore);
}

/**
 * Count symbol transitions (changes between different symbols)
 * Example: "AAABBBCCC" has 2 transitions (A→B, B→C)
 * 
 * @param segment - Genome segment to analyze
 * @returns Number of transitions
 */
export function countSymbolTransitions(segment: string): number {
  if (segment.length < 2) return 0;
  
  let transitions = 0;
  for (let i = 1; i < segment.length; i++) {
    if (segment[i] !== segment[i - 1]) {
      transitions++;
    }
  }
  
  return transitions;
}

/**
 * Measure fragmentation of a specific symbol or group
 * Counts how many times the target is interrupted by other symbols
 * 
 * @param segment - Genome segment to analyze
 * @param targetSymbols - Symbols to track fragmentation for
 * @returns Fragmentation count
 */
export function measureFragmentation(segment: string, targetSymbols: string): number {
  if (segment.length === 0) return 0;
  
  let fragmentCount = 0;
  let inTarget = false;
  
  for (const symbol of segment) {
    const isTarget = targetSymbols.includes(symbol);
    
    if (isTarget && !inTarget) {
      fragmentCount++;
      inTarget = true;
    } else if (!isTarget && inTarget) {
      inTarget = false;
    }
  }
  
  return fragmentCount;
}

/**
 * Find overlapping patterns (patterns that contain other patterns)
 * Example: "ATCGATCG" contains both "ATC" and "TCG" overlapping
 * 
 * @param segment - Genome segment to analyze
 * @returns Count of overlapping pattern instances
 */
export function findOverlappingPatterns(segment: string): number {
  const patterns = new Set<string>();
  
  for (let length = 3; length <= 6; length++) {
    for (let i = 0; i <= segment.length - length; i++) {
      const pattern = segment.substring(i, i + length);
      patterns.add(pattern);
    }
  }
  
  let overlapCount = 0;
  
  for (const pattern of patterns) {
    for (let i = 0; i < segment.length - pattern.length + 1; i++) {
      if (segment.substring(i, i + pattern.length) === pattern) {
        for (let offset = 1; offset < pattern.length; offset++) {
          if (i + offset + pattern.length <= segment.length) {
            const overlapping = segment.substring(i + offset, i + offset + pattern.length);
            if (overlapping === pattern) {
              overlapCount++;
            }
          }
        }
      }
    }
  }
  
  return overlapCount;
}

/**
 * Count cat DNA bases (A, T, C, G)
 * 
 * @param segment - Genome segment to analyze
 * @returns Count of cat DNA bases
 */
export function countCatDNA(segment: string): number {
  let count = 0;
  for (const symbol of segment) {
    if (symbol === 'A' || symbol === 'T' || symbol === 'C' || symbol === 'G') {
      count++;
    }
  }
  return count;
}

/**
 * Count alien DNA bases (W, X, Y, Z)
 * 
 * @param segment - Genome segment to analyze
 * @returns Count of alien DNA bases
 */
export function countAlienDNA(segment: string): number {
  let count = 0;
  for (const symbol of segment) {
    if (symbol === 'W' || symbol === 'X' || symbol === 'Y' || symbol === 'Z') {
      count++;
    }
  }
  return count;
}

/**
 * Calculate variance in symbol frequencies
 * Higher variance = more inconsistent distribution
 * 
 * @param segment - Genome segment to analyze
 * @returns Frequency variance
 */
export function calculateFrequencyVariance(segment: string): number {
  if (segment.length === 0) return 0;
  
  const counts = countSymbols(segment);
  const frequencies = Object.values(counts);
  
  const mean = frequencies.reduce((sum, f) => sum + f, 0) / frequencies.length;
  
  const variance = frequencies.reduce((sum, f) => sum + Math.pow(f - mean, 2), 0) / frequencies.length;
  
  return variance;
}

/**
 * Calculate standard deviation of symbol frequencies
 * Used for balance calculations
 * 
 * @param segment - Genome segment to analyze
 * @returns Standard deviation
 */
export function calculateStandardDeviation(segment: string): number {
  const variance = calculateFrequencyVariance(segment);
  return Math.sqrt(variance);
}