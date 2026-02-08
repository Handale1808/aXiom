// lib/cat-generation/generateCat.ts

import { ICatAlien } from "../../../models/CatAliens";
import { IAbility } from "../../../models/Ability";
import { IAbilityRule } from "../../../models/AbilityRules";
import { generateAbilities } from "../generateAbilities";
import { generateDescription } from "../generateDescription";
import { generateGenome } from "../genome/generation";
import { interpretGenome } from "../genome/interpretation/index";
import { generateSvgString } from "../generateImage";

// Specimen name generation constants (unchanged)
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
 * Main cat generation function
 * Now genome-driven instead of random
 *
 * Flow:
 * 1. Generate genome (1000-base string)
 * 2. Interpret genome → derive complete phenotype
 * 3. Grant abilities based on derived phenotype (unchanged logic)
 * 4. Generate description from phenotype (unchanged logic)
 * 5. Assemble and return cat document with genome
 */
export async function generateCat(
  allRules: IAbilityRule[],
  allAbilities: IAbility[]
): Promise<{
  cat: ICatAlien;
  abilities: IAbility[];
}> {
  try {
    // Step 1: Generate genome
    const genome = generateGenome();

    // Step 2: Interpret genome → derive phenotype
    const phenotype = interpretGenome(genome, { debug: false });

    // Step 3: Grant abilities based on derived phenotype
    // generateAbilities logic is unchanged - still checks phenotype conditions
    const abilities = await generateAbilities(
      phenotype.physicalTraits,
      phenotype.stats,
      phenotype.resistances,
      phenotype.behavior,
      allRules,
      allAbilities
    );

    // Step 4: Generate description (unchanged - uses phenotype)
    const description = await generateDescription(
      {
        physicalTraits: phenotype.physicalTraits,
        stats: phenotype.stats,
        resistances: phenotype.resistances,
        behavior: phenotype.behavior,
        type: "cat-alien",
      },
      abilities
    );

    // Step 5: Generate SVG image
    const svgImage = generateSvgString(phenotype.physicalTraits);

    // Step 6: Assemble cat document
    const cat: ICatAlien = {
      name: generateName(),
      description,
      genome,
      physicalTraits: phenotype.physicalTraits,
      stats: phenotype.stats,
      resistances: phenotype.resistances,
      behavior: phenotype.behavior,
      svgImage,
      createdAt: new Date(),
      type: "cat-alien",
    };

    return { cat, abilities };
  } catch (error) {
    console.error("Error generating cat:", error);
    throw new Error(
      `Failed to generate cat: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
