// lib/services/cartActions.ts

"use server";

import clientPromise from "@/lib/mongodb";
import { ICart } from "@/models/Cart";
import { IPurchase } from "@/models/Purchase";
import { ObjectId } from "mongodb";
import { getCatPriceAction } from "./settingsActions";
import { removeCatFromStock } from "./stockHelpers";

export async function addToCartAction(
  userId: string,
  catId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId || !catId) {
      return { success: false, error: "Missing required fields" };
    }

    const client = await clientPromise;
    const db = client.db("axiom");

    // Check if cat is still in stock
    const stockItem = await db
      .collection("stock")
      .findOne({ catId: new ObjectId(catId), removedAt: null });

    if (!stockItem) {
      return { success: false, error: "Cat not available" };
    }

    // Check if already in cart
    const existingCartItem = await db
      .collection("cart")
      .findOne({ userId: new ObjectId(userId), catId: new ObjectId(catId) });

    if (existingCartItem) {
      return { success: false, error: "Cat already in cart" };
    }

    // Add to cart
    const cartDocument: ICart = {
      userId: new ObjectId(userId),
      catId: new ObjectId(catId),
      addedAt: new Date(),
    };

    await db.collection("cart").insertOne(cartDocument);

    return { success: true };
  } catch (error) {
    console.error("Failed to add to cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function removeFromCartAction(
  userId: string,
  catId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId || !catId) {
      return { success: false, error: "Missing required fields" };
    }

    const client = await clientPromise;
    const db = client.db("axiom");

    const result = await db
      .collection("cart")
      .deleteOne({ userId: new ObjectId(userId), catId: new ObjectId(catId) });

    if (result.deletedCount === 0) {
      return { success: false, error: "Cart item not found" };
    }

    return { success: true };
  } catch (error) {
    console.error("Failed to remove from cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function getUserCartAction(
  userId: string
): Promise<
  Array<{
    catId: string;
    name: string;
    svgImage: string;
    addedAt: string;
  }>
> {
  try {
    if (!userId) {
      return [];
    }

    const client = await clientPromise;
    const db = client.db("axiom");

    const cartItems = await db
      .collection("cart")
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $lookup: {
            from: "cats",
            localField: "catId",
            foreignField: "_id",
            as: "cat",
          },
        },
        { $unwind: "$cat" },
        {
          $lookup: {
            from: "stock",
            localField: "catId",
            foreignField: "catId",
            as: "stock",
          },
        },
        { $unwind: "$stock" },
        { $match: { "stock.removedAt": null } },
        {
          $project: {
            catId: "$catId",
            name: "$cat.name",
            svgImage: "$cat.svgImage",
            addedAt: "$addedAt",
          },
        },
        { $sort: { addedAt: -1 } },
      ])
      .toArray();

    return cartItems.map((item) => ({
      catId: item.catId.toString(),
      name: item.name,
      svgImage: item.svgImage,
      addedAt: item.addedAt.toISOString(),
    }));
  } catch (error) {
    console.error("Failed to get user cart:", error);
    return [];
  }
}

export async function getCartCountAction(userId: string): Promise<number> {
  try {
    if (!userId) {
      return 0;
    }

    const client = await clientPromise;
    const db = client.db("axiom");

    const result = await db
      .collection("cart")
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $lookup: {
            from: "stock",
            localField: "catId",
            foreignField: "catId",
            as: "stock",
          },
        },
        { $unwind: "$stock" },
        { $match: { "stock.removedAt": null } },
        { $count: "count" },
      ])
      .toArray();

    return result.length > 0 ? result[0].count : 0;
  } catch (error) {
    console.error("Failed to get cart count:", error);
    return 0;
  }
}

export async function clearCartAction(
  userId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!userId) {
      return { success: false, error: "Missing user ID" };
    }

    const client = await clientPromise;
    const db = client.db("axiom");

    await db.collection("cart").deleteMany({ userId: new ObjectId(userId) });

    return { success: true };
  } catch (error) {
    console.error("Failed to clear cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function checkoutCartAction(
  userId: string
): Promise<{
  success: boolean;
  error?: string;
  purchasedCount?: number;
}> {
  try {
    if (!userId) {
      return { success: false, error: "Missing user ID" };
    }

    const client = await clientPromise;
    const db = client.db("axiom");

    // Get current price
    const price = await getCatPriceAction();

    // Get cart items with stock validation
    const cartItems = await db
      .collection("cart")
      .aggregate([
        { $match: { userId: new ObjectId(userId) } },
        {
          $lookup: {
            from: "cats",
            localField: "catId",
            foreignField: "_id",
            as: "cat",
          },
        },
        { $unwind: "$cat" },
        {
          $lookup: {
            from: "stock",
            localField: "catId",
            foreignField: "catId",
            as: "stock",
          },
        },
        { $unwind: "$stock" },
        {
          $project: {
            catId: "$catId",
            catName: "$cat.name",
            stockRemovedAt: "$stock.removedAt",
          },
        },
      ])
      .toArray();

    if (cartItems.length === 0) {
      return { success: false, error: "Cart is empty" };
    }

    // Check if all cats are still in stock
    const unavailableCats = cartItems.filter(
      (item) => item.stockRemovedAt !== null
    );

    if (unavailableCats.length > 0) {
      const catNames = unavailableCats.map((c) => c.catName).join(", ");
      return {
        success: false,
        error: `The following cats are no longer available: ${catNames}`,
      };
    }

    // Process purchases
    const purchaseDocuments: IPurchase[] = cartItems.map((item) => ({
      userId: new ObjectId(userId),
      catId: item.catId,
      purchasedAt: new Date(),
      price: price,
    }));

    // Insert purchases
    await db.collection("purchases").insertMany(purchaseDocuments);

    // Remove cats from stock
    for (const item of cartItems) {
      await removeCatFromStock(item.catId.toString());
    }

    // Clear cart
    await db.collection("cart").deleteMany({ userId: new ObjectId(userId) });

    return { success: true, purchasedCount: cartItems.length };
  } catch (error) {
    console.error("Failed to checkout cart:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}