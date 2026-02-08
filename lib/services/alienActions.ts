// lib/services/alienActions.ts

"use server";

import clientPromise from "@/lib/mongodb";
import { IAbility } from "@/models/Ability";
import { IAbilityRule } from "@/models/AbilityRules";
import { IAlien } from "@/models/Aliens";
import { generateAlien } from "@/lib/generation/alien-generation/generateAlien";
import { addCatToStock, getAllCatsInStock } from "./stockHelpers";

/**
 * Generates a pure alien specimen (WXYZ genome only)
 * Returns alien data with abilities
 */
export async function generateAlienAction(): Promise<{
  alien: IAlien;
  abilities: IAbility[];
}> {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");

    // Fetch all abilities and rules from database
    const allAbilities = (await db
      .collection("abilities")
      .find({})
      .toArray()) as unknown as IAbility[];

    const allRules = (await db
      .collection("abilityRules")
      .find({})
      .toArray()) as unknown as IAbilityRule[];

    // Generate alien with abilities
    const result = await generateAlien(allRules, allAbilities);

    return {
      alien: JSON.parse(JSON.stringify(result.alien)),
      abilities: JSON.parse(JSON.stringify(result.abilities)),
    };
  } catch (error) {
    console.error("Failed to generate alien:", error);
    throw error;
  }
}

/**
 * Saves a pure alien to the database
 * Uses 'aliens' collection (separate from 'catAliens')
 */
export async function saveAlienAction(
  alien: IAlien,
  abilities: IAbility[],
  svgString: string
): Promise<
  { success: true; alienId: string } | { success: false; error: string }
> {
  try {
    // Validation
    if (!alien || !alien.name || !alien.description) {
      return { success: false, error: "Invalid alien data" };
    }

    if (!Array.isArray(abilities)) {
      return { success: false, error: "Invalid abilities data" };
    }

    if (!svgString || typeof svgString !== "string") {
      return { success: false, error: "Invalid SVG data" };
    }

    // Ensure type is set to "alien"
    if (alien.type !== "alien") {
      return { success: false, error: "Invalid alien type" };
    }

    // Database connection
    const client = await clientPromise;
    const db = client.db("axiom");

    // Prepare alien document with SVG and type
    const alienDocument: IAlien = {
      ...alien,
      type: "alien", // Ensure type is set
      svgImage: svgString,
      createdAt: new Date(),
    };

    // Insert into aliens collection
    const alienResult = await db.collection("aliens").insertOne(alienDocument);
    const alienId = alienResult.insertedId;

    // Prepare alienAbility junction records
    if (abilities.length > 0) {
      const alienAbilityDocuments = abilities.map((ability) => ({
        alienId: alienId,
        abilityId: ability._id!,
        roll: Math.random(),
        acquiredAt: new Date(),
      }));

      // Insert alienAbility records
      await db.collection("alienAbilities").insertMany(alienAbilityDocuments);
    }

    // Add alien to stock
    const stockResult = await addCatToStock(alienId);
    if (!stockResult.success) {
      console.error(
        `Alien ${alienId.toString()} saved but failed to add to stock:`,
        stockResult.error
      );
    }

    return {
      success: true,
      alienId: alienId.toString(),
    };
  } catch (error) {
    console.error("Failed to save alien:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

/**
 * Fetches all pure aliens from the database
 */
export async function fetchAllAliensAction(): Promise<
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

    const aliens = await db
      .collection("aliens")
      .find({})
      .project({ _id: 1, name: 1, svgImage: 1, createdAt: 1 })
      .sort({ createdAt: -1 })
      .toArray();

    return aliens.map((alien) => ({
      _id: alien._id.toString(),
      name: alien.name as string,
      svgImage: alien.svgImage as string,
      createdAt: alien.createdAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch aliens:", error);
    return [];
  }
}

/**
 * Fetches a single pure alien by ID
 */
export async function fetchAlienByIdAction(alienId: string): Promise<{
  alien: IAlien | null;
  abilities: IAbility[];
}> {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const { ObjectId } = await import("mongodb");

    const alien = await db
      .collection("aliens")
      .findOne({ _id: new ObjectId(alienId) });

    if (!alien) {
      return { alien: null, abilities: [] };
    }

    const alienAbilities = await db
      .collection("alienAbilities")
      .find({ alienId: new ObjectId(alienId) })
      .toArray();

    const abilityIds = alienAbilities.map((aa) => aa.abilityId);

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
      alien: JSON.parse(JSON.stringify(alien)) as IAlien,
      abilities: JSON.parse(JSON.stringify(abilities)) as IAbility[],
    };
  } catch (error) {
    console.error("[SERVER] Failed to fetch alien by ID:", error);
    return { alien: null, abilities: [] };
  }
}

/**
 * Gets all aliens currently in stock
 */
export async function getAllAliensInStockAction(): Promise<
  Array<{ alienId: string; addedAt: string }>
> {
  try {
    const stockItems = await getAllCatsInStock();
    return stockItems.map(item => ({
      alienId: item.catAlienId,
      addedAt: item.addedAt
    }));
  } catch (error) {
    console.error("Failed to get aliens in stock:", error);
    return [];
  }
}

/**
 * Gets aliens purchased by a specific user
 */
export async function getUserPurchasedAliensAction(userId: string): Promise<
  Array<{
    alienId: string;
    name: string;
    svgImage: string;
    purchasedAt: string;
  }>
> {
  try {
    if (!userId) {
      return [];
    }

    const client = await clientPromise;
    const db = client.db("axiom");
    const { ObjectId } = await import("mongodb");

    const purchases = await db
      .collection("purchases")
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $lookup: {
            from: "aliens",
            localField: "alienId",
            foreignField: "_id",
            as: "alien",
          },
        },
        { $unwind: "$alien" },
        {
          $project: {
            alienId: "$alienId",
            name: "$alien.name",
            svgImage: "$alien.svgImage",
            purchasedAt: "$purchasedAt",
          },
        },
        { $sort: { purchasedAt: -1 } },
      ])
      .toArray();

    return purchases.map((purchase) => ({
      alienId: purchase.alienId.toString(),
      name: purchase.name,
      svgImage: purchase.svgImage,
      purchasedAt: purchase.purchasedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch user purchased aliens:", error);
    return [];
  }
}