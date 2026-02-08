"use server";

import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";
import { IStock } from "@/models/Stock";

async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  let lastError: Error;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < maxRetries - 1) {
        const delay = Math.pow(2, attempt) * 1000;
        console.warn(`Retrying stock operation, attempt ${attempt + 1}/${maxRetries}, delay: ${delay}ms`);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError!;
}

export async function addCatToStock(
  catAlienId: ObjectId
): Promise<{ success: boolean; error?: string }> {
  try {
    await retryWithBackoff(async () => {
      const client = await clientPromise;
      const db = client.db("axiom");

      const stockDocument: IStock = {
        catAlienId: catAlienId,
        addedAt: new Date(),
        removedAt: null,
      };

      await db.collection("stock").insertOne(stockDocument);
    }, 3);

    return { success: true };
  } catch (error) {
    console.error("Failed to add cat to stock after retries:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getAllCatsInStock(): Promise<
  Array<{ catAlienId: string; addedAt: string }>
> {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");

    const stockRecords = await db
      .collection("stock")
      .find({ removedAt: null })
      .project({ catAlienId: 1, addedAt: 1 })
      .sort({ addedAt: -1 })
      .toArray();

    return stockRecords.map((record) => ({
      catAlienId: record.catAlienId.toString(),
      addedAt: record.addedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to fetch cats in stock:", error);
    return [];
  }
}

export async function removeCatFromStock(
  catAlienId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");

    const result = await db.collection("stock").updateOne(
      { catAlienId: new ObjectId(catAlienId) },
      { $set: { removedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return {
        success: false,
        error: "Cat not found in stock",
      };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to remove cat from stock:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}