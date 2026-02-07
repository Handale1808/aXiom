// lib/genome/generation.ts

import { GENOME_LENGTH } from './regions';
import type { GenomeSymbol } from './types';
import { validateGenome } from './validation';

/**
 * All valid genome symbols
 * A, T, C, G = Cat DNA bases
 * W, X, Y, Z = Alien DNA bases
 */
const SYMBOLS: GenomeSymbol[] = ['A', 'T', 'C', 'G', 'W', 'X', 'Y', 'Z'];

/**
 * Generates a random genome string
 * 
 * Currently uses pure random generation where each position has equal probability
 * for all 8 symbols (1/8 = 12.5% each).
 * 
 * This will be replaced in future iterations with:
 * - Cat-only generation (ATCG bases only)
 * - Alien-only generation (WXYZ bases only)
 * - Spliced generation (combining cat and alien segments)
 * 
 * @returns A valid 1000-base genome string
 * @throws Error if generated genome fails validation
 */
export function generateGenome(): string {
  const genome: string[] = [];
  
  // Generate 1000 random bases
  for (let i = 0; i < GENOME_LENGTH; i++) {
    // Select random symbol with equal probability
    const randomIndex = Math.floor(Math.random() * SYMBOLS.length);
    genome.push(SYMBOLS[randomIndex]);
  }
  
  const genomeString = genome.join('');
  
  // Validate before returning to ensure consistency
  const validation = validateGenome(genomeString);
  if (!validation.valid) {
    // This should never happen with the current implementation,
    // but we check anyway for safety
    throw new Error(`Generated invalid genome: ${validation.errors.join(', ')}`);
  }
  
  return genomeString;
}