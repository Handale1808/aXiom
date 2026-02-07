// lib\cat-generation\genome\types.ts

/**
 * Valid genome symbols
 * A, T, C, G = Cat DNA bases
 * W, X, Y, Z = Alien DNA bases
 */
export type GenomeSymbol = 'A' | 'T' | 'C' | 'G' | 'W' | 'X' | 'Y' | 'Z';

/**
 * Represents a functional region of the genome
 */
export interface GenomeRegion {
  name: string;
  start: number;
  end: number;
  description: string;
  subregions?: GenomeSubregion[];
}

/**
 * Represents a subregion within a larger genome region
 */
export interface GenomeSubregion {
  name: string;
  start: number;
  end: number;
  purpose: string;
}

/**
 * Debug information for genome interpretation
 * Used when debug mode is enabled to understand how traits were derived
 */
export interface DebugInfo {
  region: string;
  foundMotifs: string[];
  symbolFrequencies: Record<GenomeSymbol, number>;
  dominantSymbol?: GenomeSymbol;
  repeatingPatterns?: string[];
  entropy?: number;
  derivedValue?: any;
}

/**
 * Wrapper for interpretation results
 * Includes the derived value and optional debug information
 */
export interface InterpretationResult<T> {
  value: T;
  debugInfo?: DebugInfo;
}