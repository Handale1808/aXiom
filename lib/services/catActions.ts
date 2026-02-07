// lib/services/catActions.ts

"use server";

import clientPromise from "@/lib/mongodb";
import { IAbility } from "@/models/Ability";
import { IAbilityRule } from "@/models/AbilityRules";
import { ICatAlien } from "@/models/CatAliens";
import { generateCat } from "@/lib/cat-alien-generation/generateCat";
import { addCatToStock, getAllCatsInStock } from "./stockHelpers";

export async function generateCatAction(): Promise<{
  cat: ICatAlien;
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
  cat: ICatAlien,
  abilities: IAbility[],
  svgString: string
): Promise<
  { success: true; catAlienId: string } | { success: false; error: string }
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
    const catDocument: ICatAlien = {
      ...cat,
      svgImage: svgString,
      createdAt: new Date(),
    };

    // Insert cat
    // Insert cat
    const catResult = await db.collection("cats").insertOne(catDocument);
    const catAlienId = catResult.insertedId;

    // Prepare catAbility junction records
    if (abilities.length > 0) {
      const catAbilityDocuments = abilities.map((ability) => ({
        catAlienId: catAlienId,
        abilityId: ability._id!,
        roll: Math.random(),
        acquiredAt: new Date(),
      }));

      // Insert catAbility records
      await db.collection("catAlienAbilities").insertMany(catAbilityDocuments);
    }

    // Add cat to stock
    const stockResult = await addCatToStock(catAlienId);
    if (!stockResult.success) {
      console.error(
        `Cat ${catAlienId.toString()} saved but failed to add to stock:`,
        stockResult.error
      );
    }

    return {
      success: true,
      catAlienId: catAlienId.toString(),
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

export async function fetchCatByIdAction(catAlienId: string): Promise<{
  cat: ICatAlien | null;
  abilities: IAbility[];
}> {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const { ObjectId } = await import("mongodb");

    const cat = await db
      .collection("cats")
      .findOne({ _id: new ObjectId(catAlienId) });

    if (!cat) {
      return { cat: null, abilities: [] };
    }

    const catAlienAbilities = await db
      .collection("catAlienAbilities")
      .find({ catAlienId: new ObjectId(catAlienId) })
      .toArray();

    if (catAlienAbilities.length === 0) {
      // Let's check if any records exist at all
      const allCatAbilities = await db
        .collection("catAlienAbilities")
        .find({})
        .limit(5)
        .toArray();
    }

    const abilityIds = catAlienAbilities.map((ca) => ca.abilityId);

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
      cat: JSON.parse(JSON.stringify(cat)) as ICatAlien,
      abilities: JSON.parse(JSON.stringify(abilities)) as IAbility[],
    };
  } catch (error) {
    console.error("[SERVER] Failed to fetch cat by ID:", error);
    return { cat: null, abilities: [] };
  }
}

export async function getAllCatsInStockAction(): Promise<
  Array<{ catAlienId: string; addedAt: string }>
> {
  try {
    return await getAllCatsInStock();
  } catch (error) {
    console.error("Failed to get cats in stock:", error);
    return [];
  }
}

export async function getUserPurchasedCatsAction(userId: string): Promise<
  Array<{
    catAlienId: string;
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
            from: "cats",
            localField: "catAlienId",
            foreignField: "_id",
            as: "cat",
          },
        },
        { $unwind: "$cat" },
        {
          $project: {
            catAlienId: "$catAlienId",
            name: "$cat.name",
            svgImage: "$cat.svgImage",
            purchasedAt: "$purchasedAt",
          },
        },
        { $sort: { purchasedAt: -1 } },
      ])
      .toArray();

    return purchases.map((purchase) => ({
      catAlienId: purchase.catAlienId.toString(),
      name: purchase.name,
      svgImage: purchase.svgImage,
      purchasedAt: purchase.purchasedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch user purchased cats:", error);
    return [];
  }
}
