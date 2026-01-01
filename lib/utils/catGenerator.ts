import { CatTraits } from "@/lib/types/cat-drawing";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomHexColor(): string {
  const r = randomInt(0, 255).toString(16).padStart(2, "0");
  const g = randomInt(0, 255).toString(16).padStart(2, "0");
  const b = randomInt(0, 255).toString(16).padStart(2, "0");
  return `#${r}${g}${b}`;
}

export function generateRandomCatTraits(): CatTraits {
  return {
    legs: randomInt(0, 10),
    wings: randomInt(0, 10),
    tails: randomInt(0, 10),
    eyes: randomInt(0, 10),
    color: randomHexColor(),
  };
}