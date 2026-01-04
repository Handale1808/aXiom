import { IBehavior } from "../../models/Cats";
import { GENERATION_LIMITS, BEHAVIOR_RANGES } from "./constants";

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

export function generateBehavior(): IBehavior {
  const behaviorNames: (keyof IBehavior)[] = [
    "aggression",
    "curiosity",
    "loyalty",
    "chaos",
  ];

  const behavior: IBehavior = {
    aggression: BEHAVIOR_RANGES.AGGRESSION.min,
    curiosity: BEHAVIOR_RANGES.CURIOSITY.min,
    loyalty: BEHAVIOR_RANGES.LOYALTY.min,
    chaos: BEHAVIOR_RANGES.CHAOS.min,
  };

  const minValue = BEHAVIOR_RANGES.AGGRESSION.min;
  const maxValue = BEHAVIOR_RANGES.AGGRESSION.max;
  let remainingPoints =
    GENERATION_LIMITS.BEHAVIOR_MAX_TOTAL - behaviorNames.length * minValue;

  // Distribute remaining points randomly
  const shuffledBehaviors = shuffle(behaviorNames);

  for (const trait of shuffledBehaviors) {
    if (remainingPoints === 0) break;

    const maxAddition = Math.min(maxValue - behavior[trait], remainingPoints);

    const addition = randomInt(0, maxAddition);
    behavior[trait] += addition;
    remainingPoints -= addition;
  }

  return behavior;
}
