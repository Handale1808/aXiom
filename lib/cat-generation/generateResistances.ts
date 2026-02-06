import { IResistances } from "../../models/Cats";
import { GENERATION_LIMITS, RESISTANCE_RANGES } from "./constants";

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function generateResistances(): IResistances {
  const resistanceNames: (keyof IResistances)[] = [
    "poison",
    "acid",
    "fire",
    "cold",
    "psychic",
    "radiation",
  ];

  const resistances: IResistances = {
    poison: RESISTANCE_RANGES.POISON.min,
    acid: RESISTANCE_RANGES.ACID.min,
    fire: RESISTANCE_RANGES.FIRE.min,
    cold: RESISTANCE_RANGES.COLD.min,
    psychic: RESISTANCE_RANGES.PSYCHIC.min,
    radiation: RESISTANCE_RANGES.RADIATION.min,
  };

  const minValue = RESISTANCE_RANGES.POISON.min;
  const maxValue = RESISTANCE_RANGES.POISON.max;
  let remainingPoints =
    GENERATION_LIMITS.RESISTANCES_MAX_TOTAL - resistanceNames.length * minValue;

  // Distribute remaining points randomly
  const shuffledResistances = shuffle(resistanceNames);

  for (const resistance of shuffledResistances) {
    if (remainingPoints === 0) break;

    const maxAddition = Math.min(
      maxValue - resistances[resistance],
      remainingPoints
    );

    const addition = randomInt(0, maxAddition);
    resistances[resistance] += addition;
    remainingPoints -= addition;
  }

  return resistances;
}
