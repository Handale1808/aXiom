// lib/generation/genome/interpretation/normalization.ts

import type { IPhysicalTraits, IStats, IBehavior } from "@/models/Cats";
import type { GenomeInterpretationResult } from "./index";

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
    eyes: 2, // Always 2 eyes
    legs: 4, // Always 4 legs
    tails: 1, // Always 1 tail
    wings: 0, // Never wings
    skinType: "fur", // Always fur
    hasClaws: true, // Always have claws
    hasFangs: true, // Always have fangs
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
 * Normalizes interpreted genome data to produce alien-like traits
 *
 * Aliens should have:
 * - Must have wings (1-10, never 0)
 * - Must have psychic abilities (psychic stat 3-10, never 0)
 * - Higher resistances, especially psychic and radiation
 * - Can never have fur (only scales, chitin, or skin)
 * - More extreme trait distributions
 * - Generally more powerful and chaotic than cats
 *
 * @param rawInterpretation - Raw interpretation from interpretGenome()
 * @returns Normalized interpretation with alien characteristics
 */
export function normalizeToAlien(
  rawInterpretation: GenomeInterpretationResult
): GenomeInterpretationResult {
  // Clone to avoid mutation
  const normalized = JSON.parse(JSON.stringify(rawInterpretation));

  // Helper function to map ranges
  const mapRange = (
    value: number,
    targetMin: number,
    targetMax: number
  ): number => {
    return Math.round(targetMin + ((value - 1) / 9) * (targetMax - targetMin));
  };

  // Helper function to map resistance ranges (0-100 input)
  const mapResistanceRange = (
    value: number,
    targetMin: number,
    targetMax: number
  ): number => {
    return Math.round(targetMin + (value / 100) * (targetMax - targetMin));
  };

  // 1. NORMALIZE PHYSICAL TRAITS
  const rawTraits = normalized.physicalTraits;

  // Ensure aliens never have fur - remap to alien skin types
  let skinType = rawTraits.skinType;
  if (skinType === "fur") {
    // Remap based on raw value's first letter for determinism
    const firstChar = rawInterpretation.genome?.charAt(0) || "W";
    if (firstChar === "W" || firstChar === "A") {
      skinType = "scales";
    } else if (firstChar === "X" || firstChar === "T") {
      skinType = "chitin";
    } else {
      skinType = "skin";
    }
  }

  normalized.physicalTraits = {
    ...rawTraits,
    // Wings: MUST have wings (map 0-10 to 1-10)
    wings: rawTraits.wings === 0 ? 1 : rawTraits.wings,

    // Skin type: Never fur
    skinType,

    // Keep other traits as-is (aliens can have extreme values)
    // eyes, legs, tails, size, colour, hasClaws, hasFangs - all kept raw
  };

  // 2. NORMALIZE STATS
  const rawStats = normalized.stats;

  normalized.stats = {
    // Strength: Aliens are strong (3-9 range)
    strength: mapRange(rawStats.strength, 3, 9),

    // Agility: Aliens have full range (1-10, keep raw)
    agility: rawStats.agility,

    // Endurance: Aliens are hardy (4-10 range)
    endurance: mapRange(rawStats.endurance, 4, 10),

    // Intelligence: Aliens are intelligent (4-10 range)
    intelligence: mapRange(rawStats.intelligence, 4, 10),

    // Perception: Aliens have sharp senses (5-10 range)
    perception: mapRange(rawStats.perception, 5, 10),

    // Psychic: Aliens MUST have psychic abilities (3-10 range)
    psychic: mapRange(Math.max(rawStats.psychic, 1), 3, 10),
  };

  // 3. NORMALIZE RESISTANCES
  const rawResistances = normalized.resistances;

  normalized.resistances = {
    // Toxin resistances: Aliens resist well (30-90 range)
    poison: mapResistanceRange(rawResistances.poison, 30, 90),
    acid: mapResistanceRange(rawResistances.acid, 30, 90),

    // Thermal resistances: Full range (0-100, keep raw)
    fire: rawResistances.fire,
    cold: rawResistances.cold,

    // Psychic resistance: Very high (40-100 range)
    psychic: mapResistanceRange(rawResistances.psychic, 40, 100),

    // Radiation resistance: Extremely high (50-100 range)
    // Aliens evolved in radioactive environments
    radiation: mapResistanceRange(rawResistances.radiation, 50, 100),
  };

  // 4. NORMALIZE BEHAVIOR
  const rawBehavior = normalized.behavior;

  normalized.behavior = {
    // Aggression: Aliens are more aggressive (3-10 range)
    aggression: mapRange(rawBehavior.aggression, 3, 10),

    // Curiosity: Aliens are very curious (5-10 range)
    curiosity: mapRange(rawBehavior.curiosity, 5, 10),

    // Loyalty: Full range (1-10, keep raw)
    loyalty: rawBehavior.loyalty,

    // Chaos: Aliens are chaotic (4-10 range)
    chaos: mapRange(rawBehavior.chaos, 4, 10),
  };

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
