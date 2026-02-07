// models/Cats.ts

import { ObjectId } from "mongodb";

export type SkinType = "fur";
export type Size = "tiny" | "small" | "medium" | "large" | "massive";

export interface IPhysicalTraits {
  eyes: 2;
  legs: 4;
  wings: 0;
  tails: 1;
  skinType: "fur";
  size: Size;
  colour: string;
  hasClaws: true;
  hasFangs: true;
}

export interface IStats {
  strength: number; // 1 - 10 (normalized to 3-7 for cats)
  agility: number; // 1 - 10 (normalized to 6-10 for cats)
  endurance: number; // 1 - 10 (normalized to 4-8 for cats)
  intelligence: number; // 1 - 10 (normalized to 5-9 for cats)
  perception: number; // 1 - 10 (normalized to 7-10 for cats)
  psychic: 0; // Always 0 for pure cats
}

export interface IBehavior {
  aggression: number; // 1 - 10 (normalized to 2-8 for cats)
  curiosity: number; // 1 - 10 (normalized to 7-10 for cats)
  loyalty: number; // 1 - 10 (normalized to 3-9 for cats)
  chaos: number; // 1 - 10 (normalized to 5-9 for cats)
}

export interface ICat {
  _id?: ObjectId;
  type: "cat";
  name: string;
  description: string;
  genome: string; // 1000-base ATCG-only genome string
  physicalTraits: IPhysicalTraits;
  stats: IStats;
  behavior: IBehavior;
  svgImage: string;
  createdAt: Date;
}