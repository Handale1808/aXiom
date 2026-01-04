import { ICat } from "../../models/Cats";
import { IAbility } from "../../models/Ability";
import { IAbilityRule } from "../../models/AbilityRules";
import { generateTraits } from "./generateTraits";
import { generateStats } from "./generateStats";
import { generateResistances } from "./generateResistances";
import { generateBehavior } from "./generateBehavior";
import { generateAbilities } from "./generateAbilities";
import { generateDescription } from "./generateDescription";

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

export async function generateCat(
  allRules: IAbilityRule[],
  allAbilities: IAbility[]
): Promise<{
  cat: ICat;
  abilities: IAbility[];
}> {
  try {
    const physicalTraits = generateTraits();
    const stats = generateStats();
    const resistances = generateResistances();
    const behavior = generateBehavior();

    const abilities = await generateAbilities(
      physicalTraits,
      stats,
      resistances,
      behavior,
      allRules,
      allAbilities
    );

    const description = await generateDescription(
      {
        physicalTraits,
        stats,
        resistances,
        behavior,
      },
      abilities
    );

    const cat: ICat = {
      name: generateName(),
      description,
      physicalTraits,
      stats,
      resistances,
      behavior,
      createdAt: new Date(),
    };

    return { cat, abilities };
  } catch (error) {
    console.error("Error generating cat:", error);
    throw new Error(
      `Failed to generate cat: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}