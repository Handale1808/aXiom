import { IPhysicalTraits, IStats, IResistances, IBehavior } from "../../models/Cats";
import { IAbility } from "../../models/Ability";
import { IAbilityRule, ICondition, ConditionSource, ConditionOperator } from "../../models/AbilityRules";
import { ObjectId } from "mongodb";

function evaluateCondition(
  condition: ICondition,
  traits: IPhysicalTraits,
  stats: IStats,
  resistances: IResistances,
  behavior: IBehavior
): boolean {
  let actualValue: any;

  switch (condition.source) {
    case "trait":
      actualValue = traits[condition.key as keyof IPhysicalTraits];
      break;
    case "stat":
      actualValue = stats[condition.key as keyof IStats];
      break;
    case "resistance":
      actualValue = resistances[condition.key as keyof IResistances];
      break;
    case "behavior":
      actualValue = behavior[condition.key as keyof IBehavior];
      break;
    default:
      return false;
  }

  switch (condition.op) {
    case ">=":
      return actualValue >= condition.value;
    case "<=":
      return actualValue <= condition.value;
    case "=":
      return actualValue === condition.value;
    case "!=":
      return actualValue !== condition.value;
    case "in":
      return (condition.value as string[]).includes(actualValue);
    case "not_in":
      return !(condition.value as string[]).includes(actualValue);
    default:
      return false;
  }
}

function evaluateRule(
  rule: IAbilityRule,
  traits: IPhysicalTraits,
  stats: IStats,
  resistances: IResistances,
  behavior: IBehavior
): boolean {
  return rule.conditions.every((condition) =>
    evaluateCondition(condition, traits, stats, resistances, behavior)
  );
}

function selectAbilityByChance(eligibleRules: IAbilityRule[]): IAbilityRule | null {
  if (eligibleRules.length === 0) return null;
  if (eligibleRules.length === 1) return eligibleRules[0];

  const totalWeight = eligibleRules.reduce((sum, rule) => sum + rule.chance, 0);
  const random = Math.random() * totalWeight;

  let cumulativeWeight = 0;
  for (const rule of eligibleRules) {
    cumulativeWeight += rule.chance;
    if (random < cumulativeWeight) {
      return rule;
    }
  }

  return eligibleRules[eligibleRules.length - 1];
}

export async function generateAbilities(
  traits: IPhysicalTraits,
  stats: IStats,
  resistances: IResistances,
  behavior: IBehavior,
  allRules: IAbilityRule[],
  allAbilities: IAbility[]
): Promise<IAbility[]> {
  const abilityMap = new Map<string, IAbility>();
  allAbilities.forEach((ability) => {
    if (ability._id) {
      abilityMap.set(ability._id.toString(), ability);
    }
  });

  const sortedRules = [...allRules].sort((a, b) => b.priority - a.priority);

  const usedExclusiveGroups = new Set<string>();

  const eligibleRulesByAbility = new Map<string, IAbilityRule[]>();

  for (const rule of sortedRules) {
    if (rule.exclusiveGroup && usedExclusiveGroups.has(rule.exclusiveGroup)) {
      continue;
    }

    if (evaluateRule(rule, traits, stats, resistances, behavior)) {
      const abilityIdStr = rule.abilityId.toString();
      if (!eligibleRulesByAbility.has(abilityIdStr)) {
        eligibleRulesByAbility.set(abilityIdStr, []);
      }
      eligibleRulesByAbility.get(abilityIdStr)!.push(rule);
    }
  }

  const grantedAbilities: IAbility[] = [];

  for (const [abilityIdStr, eligibleRules] of eligibleRulesByAbility) {
    const selectedRule = selectAbilityByChance(eligibleRules);

    if (selectedRule) {
      const randomRoll = Math.random();
      
      if (randomRoll < selectedRule.chance) {
        const ability = abilityMap.get(abilityIdStr);
        if (ability) {
          grantedAbilities.push(ability);

          if (selectedRule.exclusiveGroup) {
            usedExclusiveGroups.add(selectedRule.exclusiveGroup);
          }
        }
      }
    }
  }

  return grantedAbilities;
}