"use server";

import clientPromise from "@/lib/mongodb";
import { IAbility } from "@/models/Ability";
import { IAbilityRule } from "@/models/AbilityRules";
import { ICat } from "@/models/Cats";
import { generateCat } from "@/lib/cat-generation/generateCat";

export async function generateCatAction(): Promise<{
  cat: ICat;
  abilities: IAbility[];
}> {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");

    const allAbilities = await db
      .collection("abilities")
      .find({})
      .toArray() as unknown as IAbility[];
    
    const allRules = await db
      .collection("abilityRules")
      .find({})
      .toArray() as unknown as IAbilityRule[];

    const result = await generateCat(allRules, allAbilities);
    
    return {
      cat: JSON.parse(JSON.stringify(result.cat)),
      abilities: JSON.parse(JSON.stringify(result.abilities))
    };
  } catch (error) {
    console.error("Failed to generate cat:", error);
    throw error;
  }
}