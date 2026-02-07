// lib/cat-alien-generation/genome/interpretation/normalization.ts

import type { IPhysicalTraits, IStats, IBehavior } from '@/models/Cats';
import type { GenomeInterpretationResult } from './index';

/**
 * Normalizes interpreted genome data to produce realistic cat traits
 * 
 * Cats should have:
 * - 2 eyes, 4 legs, 1 tail, 0 wings
 * - Fur skin type only
 * - Always have claws and fangs
 * - No psychic abilities (psychic stat = 0)
 * - Typical cat stat ranges (high agility, moderate strength, etc.)
 * - Typical cat behavior patterns
 * 
 * @param rawInterpretation - Raw interpretation from interpretGenome()
 * @returns Normalized interpretation with realistic cat values
 */
export function normalizeToCat(
  rawInterpretation: GenomeInterpretationResult
): GenomeInterpretationResult {
  
  // Clone to avoid mutation
  const normalized = JSON.parse(JSON.stringify(rawInterpretation));
  
  // 1. NORMALIZE PHYSICAL TRAITS
  normalized.physicalTraits = {
    ...normalized.physicalTraits,
    eyes: 2,           // Always 2 eyes
    legs: 4,           // Always 4 legs
    tails: 1,          // Always 1 tail
    wings: 0,          // Never wings
    skinType: 'fur',   // Always fur
    hasClaws: true,    // Always have claws
    hasFangs: true,    // Always have fangs
    // Keep: size, colour (these can vary)
  };
  
  // 2. NORMALIZE STATS
  // Use interpreted values as base, then constrain to realistic cat ranges
  const rawStats = normalized.stats;
  
  normalized.stats = {
    // Strength: Cats are moderately strong (3-7 range)
    // Map raw 1-10 to 3-7
    strength: Math.round(3 + (rawStats.strength - 1) * (4 / 9)),
    
    // Agility: Cats are very agile (6-10 range)
    // Map raw 1-10 to 6-10
    agility: Math.round(6 + (rawStats.agility - 1) * (4 / 9)),
    
    // Endurance: Cats have moderate endurance (4-8 range)
    // Map raw 1-10 to 4-8
    endurance: Math.round(4 + (rawStats.endurance - 1) * (4 / 9)),
    
    // Intelligence: Cats are clever (5-9 range)
    // Map raw 1-10 to 5-9
    intelligence: Math.round(5 + (rawStats.intelligence - 1) * (4 / 9)),
    
    // Perception: Cats have excellent perception (7-10 range)
    // Map raw 1-10 to 7-10
    perception: Math.round(7 + (rawStats.perception - 1) * (3 / 9)),
    
    // Psychic: Cats have no psychic abilities
    psychic: 0,
  };
  
  // 3. NORMALIZE BEHAVIOR
  // Use interpreted values as base, then adjust to typical cat patterns
  const rawBehavior = normalized.behavior;
  
  normalized.behavior = {
    // Aggression: Cats can vary (2-8 range, excluding extremes)
    // Map raw 1-10 to 2-8
    aggression: Math.round(2 + (rawBehavior.aggression - 1) * (6 / 9)),
    
    // Curiosity: Cats are very curious (7-10 range)
    // Map raw 1-10 to 7-10
    curiosity: Math.round(7 + (rawBehavior.curiosity - 1) * (3 / 9)),
    
    // Loyalty: Cats vary in loyalty (3-9 range)
    // Map raw 1-10 to 3-9
    loyalty: Math.round(3 + (rawBehavior.loyalty - 1) * (6 / 9)),
    
    // Chaos: Cats are somewhat chaotic (5-9 range)
    // Map raw 1-10 to 5-9
    chaos: Math.round(5 + (rawBehavior.chaos - 1) * (4 / 9)),
  };
  
  // 4. REMOVE RESISTANCES
  // Cats don't have special resistances (this field shouldn't exist in ICat model)
  delete normalized.resistances;
  
  return normalized;
}

/**
 * Helper: Determines if a genome is pure cat DNA (only ATCG bases)
 */
export function isPureCatGenome(genome: string): boolean {
  const alienBases = /[WXYZ]/;
  return !alienBases.test(genome);
}

/**
 * Helper: Determines if a genome is pure alien DNA (only WXYZ bases)
 */
export function isPureAlienGenome(genome: string): boolean {
  const catBases = /[ATCG]/;
  return !catBases.test(genome);
}

/**
 * Helper: Determines if a genome is hybrid (contains both cat and alien DNA)
 */
export function isHybridGenome(genome: string): boolean {
  const hasCatBases = /[ATCG]/.test(genome);
  const hasAlienBases = /[WXYZ]/.test(genome);
  return hasCatBases && hasAlienBases;
}