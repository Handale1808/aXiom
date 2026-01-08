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

    const allAbilities = (await db
      .collection("abilities")
      .find({})
      .toArray()) as unknown as IAbility[];

    const allRules = (await db
      .collection("abilityRules")
      .find({})
      .toArray()) as unknown as IAbilityRule[];

    const result = await generateCat(allRules, allAbilities);

    return {
      cat: JSON.parse(JSON.stringify(result.cat)),
      abilities: JSON.parse(JSON.stringify(result.abilities)),
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
): Promise<
  { success: true; catId: string } | { success: false; error: string }
> {
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

export async function fetchAllCatsAction(): Promise<
  Array<{
    _id: string;
    name: string;
    svgImage: string;
    createdAt: string;
  }>
> {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");

    const cats = await db
      .collection("cats")
      .find({})
      .project({ _id: 1, name: 1, svgImage: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    return cats.map((cat) => ({
      _id: cat._id.toString(),
      name: cat.name as string,
      svgImage: cat.svgImage as string,
      createdAt: cat.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch cats:", error);
    return [];
  }
}

export async function fetchCatByIdAction(catId: string): Promise<{
  cat: ICat | null;
  abilities: IAbility[];
}> {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const { ObjectId } = await import("mongodb");

    const cat = await db
      .collection("cats")
      .findOne({ _id: new ObjectId(catId) });

    if (!cat) {
      return { cat: null, abilities: [] };
    }

    const catAbilities = await db
      .collection("catAbilities")
      .find({ catId: new ObjectId(catId) })
      .toArray();

    if (catAbilities.length === 0) {
      // Let's check if any records exist at all
      const allCatAbilities = await db
        .collection("catAbilities")
        .find({})
        .limit(5)
        .toArray();
    }

    const abilityIds = catAbilities.map((ca) => ca.abilityId);

    // Convert abilityIds to ObjectIds if they're strings
    const abilityObjectIds = abilityIds.map((id) =>
      typeof id === "string" ? new ObjectId(id) : id
    );

    const abilities =
      abilityObjectIds.length > 0
        ? await db
            .collection("abilities")
            .find({ _id: { $in: abilityObjectIds } })
            .toArray()
        : [];

    return {
      cat: JSON.parse(JSON.stringify(cat)) as ICat,
      abilities: JSON.parse(JSON.stringify(abilities)) as IAbility[],
    };
  } catch (error) {
    console.error("[SERVER] Failed to fetch cat by ID:", error);
    return { cat: null, abilities: [] };
  }
}
