// models/Aliens.ts

import { ObjectId } from "mongodb";
import {
  IPhysicalTraits,
  IStats,
  IResistances,
  IBehavior,
} from "./CatAliens";

/**
 * Pure Alien specimen interface
 * 
 * Pure aliens are extraterrestrial organisms with WXYZ-only genomes.
 * Unlike cats (ATCG) or cat-aliens (ATCG+WXYZ), aliens are fully alien DNA.
 * 
 * Key characteristics (enforced by normalization):
 * - Must have wings (never 0)
 * - Must have psychic abilities (psychic stat > 0)
 * - Higher resistances, especially psychic and radiation
 * - Can never have fur (only scales, chitin, or skin)
 * - More extreme trait distributions than cats
 */
export interface IAlien {
  _id?: ObjectId;
  type: "alien";
  name: string;
  description: string;
  genome: string; // 1000-base WXYZ-only genome string
  physicalTraits: IPhysicalTraits;
  stats: IStats;
  resistances: IResistances;
  behavior: IBehavior;
  svgImage: string;
  createdAt: Date;
}