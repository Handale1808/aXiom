// lib/cat-generation/generateCat.ts

import { ICat } from "@/models/Cats";
import { generateDescription } from "../generateDescription";
import { generateGenome } from "../genome/generation";
import { interpretGenome } from "../genome/interpretation/index";
import { generateSvgString } from "../generateImage";

// Reuse same specimen name generation as cat-aliens
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
 * Main pure cat generation function
 * 
 * Flow:
 * 1. Generate ATCG-only genome (type: "cat")
 * 2. Interpret genome → derive phenotype (auto-normalized for cats)
 * 3. Generate description from phenotype
 * 4. Assemble and return cat document
 * 
 * Note: No abilities or resistances for pure cats
 */
export async function generateCat(): Promise<ICat> {
  try {
    // Step 1: Generate pure cat genome (ATCG only)
    const genome = generateGenome("cat");
    
    // Step 2: Interpret genome → derive phenotype
    // normalizeCats: true (default) ensures realistic cat traits
    const phenotype = interpretGenome(genome, { 
      debug: false, 
      normalizeCats: true 
    });
    
    // Step 3: Generate description
    // Pass empty abilities array (cats don't have abilities)
    // Don't pass resistances (cats don't have them)
    const description = await generateDescription(
      {
        physicalTraits: phenotype.physicalTraits,
        stats: phenotype.stats,
        behavior: phenotype.behavior,
      },
      [] // No abilities for cats
    );

    // Step 4: Generate SVG image
    const svgImage = generateSvgString(phenotype.physicalTraits);
    
    // Step 5: Assemble cat document
    const cat: ICat = {
      type: "cat", // Always "cat" for pure cats
      name: generateName(),
      description,
      genome, // ATCG-only genome string
      physicalTraits: phenotype.physicalTraits,
      stats: phenotype.stats,
      behavior: phenotype.behavior,
      svgImage: svgImage || "🐱", // Placeholder emoji (will be replaced with real image later)
      createdAt: new Date(),
    };

    
    
    return cat;
  } catch (error) {
    console.error("Error generating cat:", error);
    throw new Error(
      `Failed to generate cat: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}