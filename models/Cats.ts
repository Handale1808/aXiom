import { ObjectId } from "mongodb";

export type TailType = "none" | "short" | "long" | "prehensile";
export type SkinType = "fur" | "scales" | "chitin" | "skin";
export type Size = "tiny" | "small" | "medium" | "large" | "massive";

export interface IPhysicalTraits {
  legs: number;
  arms: number;
  wings: number;
  tailType: TailType;
  skinType: SkinType;
  size: Size;
  colour: string;
  eyeCount: number;
  hasClaws: boolean;
  hasFangs: boolean;
}

export interface IStats {
  strength: number;
  agility: number;
  endurance: number;
  intelligence: number;
  perception: number;
  psychic: number;
}

export interface IResistances {
  poison: number;
  acid: number;
  fire: number;
  cold: number;
  psychic: number;
  radiation: number;
}

export interface IBehavior {
  aggression: number;
  curiosity: number;
  loyalty: number;
  chaos: number;
}

export interface ICat {
  _id?: ObjectId;
  name: string;
  description: string;
  physicalTraits: IPhysicalTraits;
  stats: IStats;
  resistances: IResistances;
  behavior: IBehavior;
  createdAt: Date;
}