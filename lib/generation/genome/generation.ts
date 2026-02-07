// lib/genome/generation.ts

import { GENOME_LENGTH } from './regions';
import type { GenerationType, GenomeSymbol } from './types';
import { validateGenome } from './validation';

/**
 * Symbol sets for each generation type
 */
const SYMBOL_SETS: Record<GenerationType, GenomeSymbol[]> = {
  cat: ['A', 'T', 'C', 'G'],
  alien: ['W', 'X', 'Y', 'Z'],
  hybrid: ['A', 'T', 'C', 'G', 'W', 'X', 'Y', 'Z']
};

/**
 * Generates a genome string based on specimen type
 * 
 * @param type - Specimen type: "cat" (ATCG only), "alien" (WXYZ only), or "hybrid" (all)
 * @returns A valid 1000-base genome string
 * @throws Error if generated genome fails validation
 */
export function generateGenome(type: GenerationType = "hybrid"): string {
  const symbols = SYMBOL_SETS[type];
  const genome: string[] = [];
  
  // Generate 1000 random bases from the appropriate symbol set
  for (let i = 0; i < GENOME_LENGTH; i++) {
    const randomIndex = Math.floor(Math.random() * symbols.length);
    genome.push(symbols[randomIndex]);
  }
  
  const genomeString = genome.join('');
  
  // Validate before returning
  const validation = validateGenome(genomeString);
  if (!validation.valid) {
    throw new Error(`Generated invalid genome: ${validation.errors.join(', ')}`);
  }
  
  return genomeString;
}