// models/AlienAbility.ts

import { ObjectId } from "mongodb";

/**
 * Junction table interface for alien-ability relationships
 * 
 * This tracks which abilities each alien has acquired.
 * Mirrors the structure of ICatAlienAbility but for aliens.
 * 
 * Collections:
 * - alienAbilities: Junction records
 * - aliens: The alien specimens
 * - abilities: The ability definitions
 * 
 * Relationship: Many-to-Many
 * - One alien can have many abilities
 * - One ability can belong to many aliens
 */
export interface IAlienAbility {
  _id?: ObjectId;
  alienId: ObjectId;
  abilityId: ObjectId;
  roll: number;
  acquiredAt: Date;
}