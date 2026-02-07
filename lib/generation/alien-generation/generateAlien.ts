// lib/generation/alien-generation/generateAlien.ts

import { IAlien } from "@/models/Aliens";
import { IAbility } from "@/models/Ability";
import { IAbilityRule } from "@/models/AbilityRules";
import { generateAbilities } from "../generateAbilities";
import { generateDescription } from "../generateDescription";
import { generateGenome } from "../genome/generation";
import { interpretGenome } from "../genome/interpretation/index";
import { generateSvgString } from "../generateImage";

// Specimen name generation constants
// Using same sci-fi themed names as cat-aliens (already alien-appropriate)
const SPECIMEN_PREFIXES = [
  "SPECIMEN",
  "SUBJECT",
  "ENTITY",
  "MUTANT",
  "HYBRID",
  "CLONE",
  "PROTOTYPE",
  "ANOMALY",
  "SAMPLE",
  "UNIT",
  "INSTANCE",
  "ORGANISM",
  "LIFEFORM",
  "CONSTRUCT",
  "EXPERIMENT",
  "TEMPLATE",
  "GENESIS",
  "CATALYST",
  "VECTOR",
  "BIOFORM",
  "CHASSIS",
  "VARIANT",
  "ITERATION",
  "SEQUENCE",
  "MATRIX",
  "PHANTOM",
  "CIPHER",
  "RELIC",
  "ARTIFACT",
  "VESSEL",
  "CHIMERA",
  "FUSION",
  "REPLICATE",
  "ECHO",
  "FRAGMENT",
  "STRAIN",
  "CODEX",
  "ARCHETYPE",
  "SIMULACRA",
  "DEVIATION",
  "OFFSPRING",
  "AUGMENT",
  "SYNTHETIC",
  "CRYPTID",
  "SPECIMEN",
  "INCUBATE",
  "PARASITE",
];

const SPECIMEN_SUFFIXES = [
  "ALPHA",
  "BETA",
  "GAMMA",
  "DELTA",
  "EPSILON",
  "ZETA",
  "OMEGA",
  "NOVA",
  "VOID",
  "NEXUS",
  "FLUX",
  "PRIME",
  "SIGMA",
  "PSI",
  "THETA",
  "KAPPA",
  "LAMBDA",
  "RHO",
  "TAU",
  "PHI",
  "CHI",
  "ETA",
  "IOTA",
  "OMICRON",
  "UPSILON",
  "XI",
  "CORE",
  "APEX",
  "ZENITH",
  "NADIR",
  "STRAIN",
  "DAWN",
  "DUSK",
  "STORM",
  "SHADE",
  "SPARK",
  "PULSE",
  "ECHO",
  "WRAITH",
  "SPECTER",
  "PHANTOM",
  "SHADOW",
  "MIRAGE",
  "VORTEX",
  "TEMPEST",
  "CASCADE",
  "RIFT",
  "BREACH",
  "SURGE",
  "VECTOR",
  "VERTEX",
  "AXIS",
  "PIVOT",
  "NODE",
  "STRAND",
  "HELIX",
  "SPIRAL",
  "FRACTAL",
  "QUANTUM",
  "SINGULARITY",
  "INFINITY",
  "ENTROPY",
  "CHAOS",
  "ORDER",
  "ABYSS",
  "CORONA",
  "ECLIPSE",
  "NEBULA",
  "QUASAR",
  "PULSAR",
  "PRISM",
  "CRYSTAL",
  "SHARD",
  "FRAGMENT",
  "EMBER",
  "CINDER",
  "BLAZE",
  "FROST",
  "CHILL",
  "ZERO",
  "NULL",
  "CIPHER",
  "CODE",
  "PARADOX",
  "ANOMALY",
  "GLITCH",
];

function randomChoice<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function generateName(): string {
  const prefix = randomChoice(SPECIMEN_PREFIXES);
  const suffix = randomChoice(SPECIMEN_SUFFIXES);
  return `${prefix}_${suffix}`;
}

/**
 * Main pure alien generation function
 * 
 * Flow:
 * 1. Generate WXYZ-only genome (type: "alien")
 * 2. Interpret genome → derive phenotype (auto-normalized for aliens)
 * 3. Grant abilities based on phenotype
 * 4. Generate description from phenotype
 * 5. Generate SVG image
 * 6. Assemble and return alien document with abilities
 * 
 * @param allRules - All ability rules from database
 * @param allAbilities - All abilities from database
 * @returns Promise resolving to alien specimen and granted abilities
 */
export async function generateAlien(
  allRules: IAbilityRule[],
  allAbilities: IAbility[]
): Promise<{
  alien: IAlien;
  abilities: IAbility[];
}> {
  try {
    // Step 1: Generate pure alien genome (WXYZ only)
    const genome = generateGenome("alien");

    // Step 2: Interpret genome → derive phenotype
    // normalizeAliens: true ensures alien-like traits
    const phenotype = interpretGenome(genome, {
      debug: false,
      normalizeAliens: true,
    });

    // Step 3: Grant abilities based on derived phenotype
    // generateAbilities logic works with any phenotype
    const abilities = await generateAbilities(
      phenotype.physicalTraits,
      phenotype.stats,
      phenotype.resistances,
      phenotype.behavior,
      allRules,
      allAbilities
    );

    // Step 4: Generate description
    // Pass type: "alien" for alien-focused prompt
    const description = await generateDescription(
      {
        physicalTraits: phenotype.physicalTraits,
        stats: phenotype.stats,
        resistances: phenotype.resistances,
        behavior: phenotype.behavior,
        type: "alien",
      },
      abilities
    );

    // Step 5: Generate SVG image
    // Uses same image generation as cat-aliens
    const svgImage = generateSvgString(phenotype.physicalTraits, "alien");

    // Step 6: Assemble alien document
    const alien: IAlien = {
      type: "alien", // Always "alien" for pure aliens
      name: generateName(),
      description,
      genome, // WXYZ-only genome string
      physicalTraits: phenotype.physicalTraits,
      stats: phenotype.stats,
      resistances: phenotype.resistances,
      behavior: phenotype.behavior,
      svgImage: svgImage || "👽", // Placeholder emoji (will be replaced with real image)
      createdAt: new Date(),
    };

    return { alien, abilities };
  } catch (error) {
    console.error("Error generating alien:", error);
    throw new Error(
      `Failed to generate alien: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}