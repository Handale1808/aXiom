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
      position += 1; // Continue searching after this match (allows overlapping)
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
  
  // Try each possible pattern length
  for (let patternLength = minLength; patternLength <= maxLength; patternLength++) {
    // Scan through segment looking for repeating patterns
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
  
  // Check final run
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