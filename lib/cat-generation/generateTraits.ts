import { IPhysicalTraits, SkinType, Size } from "../../models/Cats";
import { TRAIT_RANGES } from "./constants";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHexColor(): string {
  const r = randomInt(0, 255).toString(16).padStart(2, "0");
  const g = randomInt(0, 255).toString(16).padStart(2, "0");
  const b = randomInt(0, 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

function randomChoice<T>(array: T[]): T {
  return array[randomInt(0, array.length - 1)];
}

export function generateTraits(): IPhysicalTraits {
  const skinTypes: SkinType[] = ["fur", "scales", "chitin", "skin"];
  const sizes: Size[] = ["tiny", "small", "medium", "large", "massive"];

  return {
    eyes: randomInt(TRAIT_RANGES.EYES.min, TRAIT_RANGES.EYES.max),
    legs: randomInt(TRAIT_RANGES.LEGS.min, TRAIT_RANGES.LEGS.max),
    wings: randomInt(TRAIT_RANGES.WINGS.min, TRAIT_RANGES.WINGS.max),
    tails: randomInt(TRAIT_RANGES.TAILS.min, TRAIT_RANGES.TAILS.max),
    skinType: randomChoice(skinTypes),
    size: randomChoice(sizes),
    colour: randomHexColor(),
    hasClaws: Math.random() < 0.5,
    hasFangs: Math.random() < 0.5,
  };
}