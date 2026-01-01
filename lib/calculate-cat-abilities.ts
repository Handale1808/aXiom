import { ObjectId } from "mongodb";
import clientPromise from "./mongodb";
import { ICat } from "../models/Cats";
import { IAbilityRule, ICondition } from "../models/AbilityRules";
import { ICatAbility } from "../models/CatAbility";

function evaluateCondition(condition: ICondition, cat: ICat): boolean {
  let catValue: any;

  switch (condition.source) {
    case "stat":
      catValue = cat.stats[condition.key as keyof typeof cat.stats];
      break;
    case "trait":
      catValue = cat.physicalTraits[condition.key as keyof typeof cat.physicalTraits];
      break;
    case "resistance":
      catValue = cat.resistances[condition.key as keyof typeof cat.resistances];
      break;
    case "behavior":
      catValue = cat.behavior[condition.key as keyof typeof cat.behavior];
      break;
    default:
      return false;
  }

  if (catValue === undefined) {
    return false;
  }

  switch (condition.op) {
    case ">=":
      return catValue >= condition.value;
    case "<=":
      return catValue <= condition.value;
    case "=":
      return catValue === condition.value;
    case "!=":
      return catValue !== condition.value;
    case "in":
      return Array.isArray(condition.value) && condition.value.includes(catValue);
    case "not_in":
      return Array.isArray(condition.value) && !condition.value.includes(catValue);
    default:
      return false;
  }
}

export async function calculateCatAbilities(cat: ICat): Promise<ICatAbility[]> {
  const client = await clientPromise;
  const db = client.db("axiom");
  const rulesCollection = db.collection("abilityRules");

  const allRules = await rulesCollection
    .find({})
    .sort({ priority: -1 })
    .toArray() as unknown as IAbilityRule[];

  const eligibleAbilities: Array<{
    rule: IAbilityRule;
    roll: number;
  }> = [];

  for (const rule of allRules) {
    const allConditionsMet = rule.conditions.every((condition) =>
      evaluateCondition(condition, cat)
    );

    if (allConditionsMet) {
      const roll = Math.random();
      if (roll <= rule.chance) {
        eligibleAbilities.push({ rule, roll });
      }
    }
  }

  const exclusiveGroupMap = new Map<string, Array<{ rule: IAbilityRule; roll: number }>>();
  const noGroupAbilities: Array<{ rule: IAbilityRule; roll: number }> = [];

  for (const ability of eligibleAbilities) {
    if (ability.rule.exclusiveGroup) {
      if (!exclusiveGroupMap.has(ability.rule.exclusiveGroup)) {
        exclusiveGroupMap.set(ability.rule.exclusiveGroup, []);
      }
      exclusiveGroupMap.get(ability.rule.exclusiveGroup)!.push(ability);
    } else {
      noGroupAbilities.push(ability);
    }
  }

  const finalAbilities: Array<{ rule: IAbilityRule; roll: number }> = [...noGroupAbilities];

  for (const [group, abilities] of exclusiveGroupMap.entries()) {
    abilities.sort((a, b) => b.rule.priority - a.rule.priority);
    finalAbilities.push(abilities[0]);
  }

  const catAbilities: ICatAbility[] = finalAbilities.map((ability) => ({
    catId: cat._id!,
    abilityId: ability.rule.abilityId,
    roll: ability.roll,
    acquiredAt: new Date(),
  }));

  return catAbilities;
}