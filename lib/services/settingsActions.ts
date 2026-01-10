// lib/services/settingsActions.ts

"use server";

import clientPromise from "@/lib/mongodb";
import { ISettings } from "@/models/Settings";
import { ObjectId } from "mongodb";

export async function getCatPriceAction(): Promise<number> {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");

    const setting = (await db
      .collection("settings")
      .findOne({ key: "cat_price" })) as unknown as ISettings | null;

    return setting?.value ?? 500;
  } catch (error) {
    console.error("Failed to get cat price:", error);
    return 500;
  }
}

export async function updateCatPriceAction(
  newPrice: number,
  adminId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!newPrice || newPrice <= 0) {
      return { success: false, error: "Invalid price" };
    }

    if (!adminId) {
      return { success: false, error: "Admin ID required" };
    }

    const client = await clientPromise;
    const db = client.db("axiom");

    await db.collection("settings").updateOne(
      { key: "cat_price" },
      {
        $set: {
          key: "cat_price",
          value: newPrice,
          updatedAt: new Date(),
          updatedBy: new ObjectId(adminId),
        },
      },
      { upsert: true }
    );

    return { success: true };
  } catch (error) {
    console.error("Failed to update cat price:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}