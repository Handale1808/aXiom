import { ObjectId } from "mongodb";

export type ConditionSource = "stat" | "trait" | "resistance" | "behavior";
export type ConditionOperator = ">=" | "<=" | "=" | "!=" | "in" | "not_in";

export interface ICondition {
  source: ConditionSource;
  key: string;
  op: ConditionOperator;
  value: number | string | boolean | string[];
}

export interface IAbilityRule {
  _id?: ObjectId;
  abilityId: ObjectId;
  chance: number;
  conditions: ICondition[];
  priority: number;
  exclusiveGroup: string | null;
  createdAt: Date;
}