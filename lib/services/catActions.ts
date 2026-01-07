// lib/services/catActions.ts

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

export async function saveCatAction(
  cat: ICat,
  abilities: IAbility[],
  svgString: string
): Promise<{ success: true; catId: string } | { success: false; error: string }> {
  try {
    // Validation
    if (!cat || !cat.name || !cat.description) {
      return { success: false, error: "Invalid cat data" };
    }

    if (!Array.isArray(abilities)) {
      return { success: false, error: "Invalid abilities data" };
    }

    if (!svgString || typeof svgString !== "string") {
      return { success: false, error: "Invalid SVG data" };
    }

    // Database connection
    const client = await clientPromise;
    const db = client.db("axiom");

    // Prepare cat document with SVG
    const catDocument: ICat = {
      ...cat,
      svgImage: svgString,
      createdAt: new Date(),
    };

    // Insert cat
    const catResult = await db.collection("cats").insertOne(catDocument);
    const catId = catResult.insertedId;

    // Prepare catAbility junction records
    if (abilities.length > 0) {
      const catAbilityDocuments = abilities.map((ability) => ({
        catId: catId,
        abilityId: ability._id!,
        roll: Math.random(),
        acquiredAt: new Date(),
      }));

      // Insert catAbility records
      await db.collection("catAbilities").insertMany(catAbilityDocuments);
    }

    return {
      success: true,
      catId: catId.toString(),
    };
  } catch (error) {
    console.error("Failed to save cat:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}