// lib/cat-generation/generateCat.ts

import { ICat } from "@/models/Cats";
import { generateDescription } from "../generateDescription";
import { generateGenome } from "../genome/generation";
import { interpretGenome } from "../genome/interpretation/index";
import { generateSvgString } from "../generateImage";

// Specimen name generation for cats
const SPECIMEN_PREFIXES = [
  "WHISKERS",
  "MITTENS",
  "SNUGGLES",
  "PUDDING",
  "MARSHMALLOW",
  "BISCUIT",
  "MUFFIN",
  "PEANUT",
  "BUTTON",
  "JELLYBEAN",
  "CUPCAKE",
  "PEACHES",
  "PUMPKIN",
  "BUTTERSCOTCH",
  "HONEYBUN",
  "NUGGET",
  "DUMPLING",
  "WAFFLES",
  "PANCAKE",
  "COOKIE",
  "FLUFFY",
  "FUZZY",
  "TINY",
  "SMOKEY",
  "SHADOW",
  "PEPPER",
  "COCOA",
  "MOCHA",
  "CARAMEL",
  "TOFFEE",
  "NOODLE",
  "PICKLES",
  "SPRINKLES",
  "BUBBLES",
  "SKITTLES",
  "POPPY",
  "DAISY",
  "WILLOW",
  "Luna",
  "BABY"
];

const SPECIMEN_SUFFIXES = [
  "PAWS",
  "FLUFF",
  "BEAN",
  "PURR",
  "SNOOT",
  "TOES",
  "BELLY",
  "WHISKER",
  "FUR",
  "MEOW",
  "TAIL",
  "EARS",
  "CHEEKS",
  "NOSE",
  "SNUGGLE",
  "CUDDLE",
  "SOFTPAW",
  "FUZZY",
  "VELVET",
  "SMOOCH",
  "LOVE",
  "SWEET",
  "SOFT",
  "GENTLE",
  "CLOUD",
  "DREAM",
  "ANGEL",
  "BABY",
  "DARLING",
  "TREASURE",
  "PRECIOUS",
  "MOCHI",
  "PUDGE",
  "CHONK",
  "LOAF",
  "BOI",
  "GIRL",
  "FRIEND",
  "PAL",
  "BUN"
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
      normalizeCats: true,
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
      physicalTraits: phenotype.physicalTraits as ICat["physicalTraits"],
      resistances: {} as ICat["resistances"],
      stats: phenotype.stats as ICat["stats"],
      behavior: phenotype.behavior as ICat["behavior"],
      svgImage: svgImage || "🐱", // Placeholder emoji (will be replaced with real image later)
      createdAt: new Date(),
    };

    return cat;
  } catch (error) {
    console.error("Error generating cat:", error);
    throw new Error(
      `Failed to generate cat: ${error instanceof Error ? error.message : "Unknown error"}`
    );
  }
}
