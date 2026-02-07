"use server";

import clientPromise from "@/lib/mongodb";
import { ICat } from "@/models/Cats";
import { generateCat } from "@/lib/cat-generation/generateCat";
import { addCatToStock, getAllCatsInStock } from "./stockHelpers";

/**
 * Generates a pure cat specimen (ATCG genome only)
 * Returns cat data without abilities (cats don't have abilities)
 */
export async function generatePureCatAction(): Promise<{ cat: ICat }> {
  try {
    const cat = await generateCat();

    return {
      cat: JSON.parse(JSON.stringify(cat)),
    };
  } catch (error) {
    console.error("Failed to generate cat:", error);
    throw error;
  }
}

/**
 * Saves a pure cat to the database
 * Uses separate 'cats' collection (not 'catAliens')
 */
export async function savePureCatAction(
  cat: ICat,
  svgString: string
): Promise<
  { success: true; catId: string } | { success: false; error: string }
> {
  try {
    // Validation
    if (!cat || !cat.name || !cat.description) {
      return { success: false, error: "Invalid cat data" };
    }

    if (!svgString || typeof svgString !== "string") {
      return { success: false, error: "Invalid SVG data" };
    }

    // Ensure type is set to "cat"
    if (cat.type !== "cat") {
      return { success: false, error: "Invalid cat type" };
    }

    // Database connection
    const client = await clientPromise;
    const db = client.db("axiom");

    // Prepare cat document with SVG
    const catDocument: ICat = {
      ...cat,
      type: "cat", // Ensure type is set
      svgImage: svgString,
      createdAt: new Date(),
    };

    // Insert into 'cats' collection (separate from catAliens)
    const catResult = await db.collection("cats").insertOne(catDocument);
    const catId = catResult.insertedId;

    // Note: No catAbilities junction records needed (cats don't have abilities)

    // Add cat to stock (reuse existing stock system)
    const stockResult = await addCatToStock(catId);
    if (!stockResult.success) {
      console.error(
        `Cat ${catId.toString()} saved but failed to add to stock:`,
        stockResult.error
      );
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

/**
 * Fetches all pure cats from the database
 */
export async function fetchAllPureCatsAction(): Promise<
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

/**
 * Fetches a single pure cat by ID
 */
export async function fetchPureCatByIdAction(catId: string): Promise<{
  cat: ICat | null;
}> {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const { ObjectId } = await import("mongodb");

    const cat = await db
      .collection("cats")
      .findOne({ _id: new ObjectId(catId) });

    if (!cat) {
      return { cat: null };
    }

    return {
      cat: JSON.parse(JSON.stringify(cat)) as ICat,
    };
  } catch (error) {
    console.error("[SERVER] Failed to fetch cat by ID:", error);
    return { cat: null };
  }
}