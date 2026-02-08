// models/Cats.ts

import { ObjectId } from "mongodb";

export type TailType = "none" | "short" | "long" | "prehensile";
export type SkinType = "fur" | "scales" | "chitin" | "skin";
export type Size = "tiny" | "small" | "medium" | "large" | "massive";

export interface IPhysicalTraits {
  eyes: number; // 0 - 10
  legs: number; // 0 - 10
  wings: number; // 0 - 10
  tails: number; // 0 - 10
  skinType: SkinType;
  size: Size;
  colour: string;
  hasClaws: boolean;
  hasFangs: boolean;
}

export interface IStats {
  strength: number; // 1 - 10
  agility: number; // 1 - 10
  endurance: number; // 1 - 10
  intelligence: number; // 1 - 10
  perception: number; // 1 - 10
  psychic: number; // 1 - 10
}

export interface IResistances {
  poison: number; // 0 - 100
  acid: number; // 0 - 100
  fire: number; // 0 - 100
  cold: number; // 0 - 100
  psychic: number; // 0 - 100
  radiation: number; // 0 - 100
}

export interface IBehavior {
  aggression: number; // 1 - 10
  curiosity: number; // 1 - 10
  loyalty: number; // 1 - 10
  chaos: number; // 1 - 10
}

export interface ICatAlien {
  _id?: ObjectId;
  type: "cat-alien";
  name: string;
  description: string;
  genome: string; // NEW: 1000-base genome string (ATCGWXYZ alphabet)
  physicalTraits: IPhysicalTraits;
  stats: IStats;
  resistances: IResistances;
  behavior: IBehavior;
  svgImage: string;
  createdAt: Date;
}