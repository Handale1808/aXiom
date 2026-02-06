// lib/genome/validation.ts

import { GENOME_LENGTH } from './regions';
import type { GenomeSymbol } from './types';

/**
 * Set of all valid genome symbols
 */
const VALID_SYMBOLS: Set<string> = new Set(['A', 'T', 'C', 'G', 'W', 'X', 'Y', 'Z']);

/**
 * Validation result interface
 */
export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a genome string
 * Checks length and symbol validity
 * 
 * @param genome - The genome string to validate
 * @returns Validation result with any errors found
 */
export function validateGenome(genome: string): ValidationResult {
  const errors: string[] = [];
  
  // Check length
  if (genome.length !== GENOME_LENGTH) {
    errors.push(`Genome length must be ${GENOME_LENGTH}, got ${genome.length}`);
  }
  
  // Check symbols
  const invalidSymbols: Array<{ symbol: string; position: number }> = [];
  
  for (let i = 0; i < genome.length; i++) {
    const symbol = genome[i];
    if (!VALID_SYMBOLS.has(symbol)) {
      invalidSymbols.push({ symbol, position: i });
      
      // Limit error reporting to first 10 invalid symbols to avoid overwhelming output
      if (invalidSymbols.length >= 10) {
        break;
      }
    }
  }
  
  // Add invalid symbol errors
  for (const { symbol, position } of invalidSymbols) {
    errors.push(`Invalid symbol '${symbol}' at position ${position}`);
  }
  
  // Add summary if we stopped early
  if (invalidSymbols.length === 10) {
    // Count remaining invalid symbols
    let remainingInvalid = 0;
    for (let i = invalidSymbols[9].position + 1; i < genome.length; i++) {
      if (!VALID_SYMBOLS.has(genome[i])) {
        remainingInvalid++;
      }
    }
    
    if (remainingInvalid > 0) {
      errors.push(`... and ${remainingInvalid} more invalid symbol(s)`);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Quick validation check
 * Returns true if genome is valid, false otherwise
 * 
 * @param genome - The genome string to validate
 * @returns true if valid, false otherwise
 */
export function isValidGenome(genome: string): boolean {
  return validateGenome(genome).valid;
}