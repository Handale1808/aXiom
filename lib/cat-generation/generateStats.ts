import { IStats } from "../../models/Cats";
import { GENERATION_LIMITS, STAT_RANGES } from "./constants";

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

export function generateStats(): IStats {
  const statNames: (keyof IStats)[] = [
    "strength",
    "agility",
    "endurance",
    "intelligence",
    "perception",
    "psychic",
  ];

  const stats: IStats = {
    strength: STAT_RANGES.STRENGTH.min,
    agility: STAT_RANGES.AGILITY.min,
    endurance: STAT_RANGES.ENDURANCE.min,
    intelligence: STAT_RANGES.INTELLIGENCE.min,
    perception: STAT_RANGES.PERCEPTION.min,
    psychic: STAT_RANGES.PSYCHIC.min,
  };

  const minValue = STAT_RANGES.STRENGTH.min;
  const maxValue = STAT_RANGES.STRENGTH.max;
  let remainingPoints =
    GENERATION_LIMITS.STATS_MAX_TOTAL - statNames.length * minValue;

  // Distribute remaining points randomly
  const shuffledStats = shuffle(statNames);

  for (const stat of shuffledStats) {
    if (remainingPoints === 0) break;

    const maxAddition = Math.min(maxValue - stats[stat], remainingPoints);

    const addition = randomInt(0, maxAddition);
    stats[stat] += addition;
    remainingPoints -= addition;
  }

  return stats;
}
