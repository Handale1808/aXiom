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
    "A mysterious feline entity discovered in Sector 7-G",
    "An otherworldly specimen recovered from deep space",
    "A genetically modified creature of unknown origin",
    "A strange being found in the quantum laboratory",
    "An anomalous lifeform detected in the void",
    "A peculiar organism manifested during the experiment",
    "A bizarre creature from an alternate dimension",
    "An enigmatic specimen salvaged from the ruins",
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