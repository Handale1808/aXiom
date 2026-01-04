import { ICat } from "../../models/Cats";
import { IAbility } from "../../models/Ability";
import { IAbilityRule } from "../../models/AbilityRules";
import { generateTraits } from "./generateTraits";
import { generateStats } from "./generateStats";
import { generateResistances } from "./generateResistances";
import { generateBehavior } from "./generateBehavior";
import { generateAbilities } from "./generateAbilities";

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

function generateDescription(): string {
  const descriptors = [
    "A feline hybrid infused with extraterrestrial genetic material",
    "A cat-like entity bearing traces of cosmic DNA sequences",
    "A domestic specimen contaminated by alien cellular structures",
    "A quadruped altered by xeno-biological integration",
    "A terrestrial feline merged with off-world chromosomes",
    "A household pet transformed by interstellar gene therapy",
    "A mammalian subject exposed to non-terrestrial pathogens",
    "A carnivorous specimen enhanced with starborn genetics",
    "A feline organism spliced with DNA from the outer reaches",
    "A four-legged creature bearing alien genetic markers",
    "A mutated cat displaying extra-planetary characteristics",
    "A common feline corrupted by otherworldly biomatter",
    "A domesticated animal fused with cosmic genetic code",
    "A small predator augmented with xenomorphic DNA strands",
    "A furry specimen containing fragments of stellar origin",
    "A terrestrial hunter modified by celestial gene sequences",
    "A whispered companion altered by void-touched genetics",
    "A purring entity embedded with interdimensional helixes",
    "A clawed subject infused with nebula-born chromosomes",
    "A feline form corrupted by deep space biological agents",
    "A house cat transfigured by alien nucleotide chains",
    "A meowing creature spliced with extra-solar genetic material",
    "A soft-furred being contaminated by cosmic mutagenic factors",
    "A nocturnal hunter enhanced with non-human DNA patterns",
    "A domestic companion twisted by xenobiological fusion",
    "A prowling specimen marked by otherworldly gene expression",
    "A territorial feline bearing signatures of distant worlds",
    "A curious creature hybridized with stellar genetic sequences",
    "A playful entity altered by extraterrestrial chromosomal data",
    "A hunting machine upgraded with alien evolutionary traits",
    "A purring anomaly carrying foreign genetic instructions",
    "A feline subject rewritten by cosmic biological programming",
    "A small carnivore merged with DNA from beyond the stars",
    "A whiskered specimen corrupted by void-borne gene fragments",
    "A four-pawed entity spliced with unknown stellar genomes",
    "A terrestrial predator enhanced by alien genetic engineering",
    "A domesticated creature transformed by xeno-DNA grafting",
    "A fur-bearing specimen infected with interstellar genetics",
    "A nocturnal being augmented with celestial chromosomes",
    "A feline form contaminated by extra-planetary biomaterial",
  ];
  return randomChoice(descriptors);
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

    const cat: ICat = {
      name: generateName(),
      description: generateDescription(),
      physicalTraits,
      stats,
      resistances,
      behavior,
      createdAt: new Date(),
    };

    return { cat, abilities };
  } catch (error) {
    console.error("Error generating cat:", error);

    const physicalTraits = generateTraits();
    const stats = generateStats();
    const resistances = generateResistances();
    const behavior = generateBehavior();

    const cat: ICat = {
      name: generateName(),
      description: generateDescription(),
      physicalTraits,
      stats,
      resistances,
      behavior,
      createdAt: new Date(),
    };

    return { cat, abilities: [] };
  }
}
