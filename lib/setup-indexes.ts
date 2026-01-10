import clientPromise from "./mongodb.ts";

export async function setupFeedbackIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("feedbacks");

    // 1. Text search index (existing)
    await collection.createIndex(
      {
        text: "text",
        "analysis.summary": "text",
      },
      {
        name: "feedback_text_search",
        weights: {
          text: 2,
          "analysis.summary": 1,
        },
      }
    );

    // 2. Sentiment filter index
    await collection.createIndex(
      { "analysis.sentiment": 1 },
      { name: "sentiment_index" }
    );

    // 3. Priority filter index
    await collection.createIndex(
      { "analysis.priority": 1 },
      { name: "priority_index" }
    );

    // 4. Tags filter index
    await collection.createIndex(
      { "analysis.tags": 1 },
      { name: "tags_index" }
    );

    // 5. CreatedAt sort index (descending for newest first)
    await collection.createIndex(
      { createdAt: -1 },
      { name: "created_at_index" }
    );

    // 6. CatId filter index
    await collection.createIndex({ catId: 1 }, { name: "cat_id_index" });

    // 7. UserId filter index
    await collection.createIndex({ userId: 1 }, { name: "user_id_index" });

    // 8. Compound index for user-cat feedback queries
    await collection.createIndex(
      { userId: 1, catId: 1 },
      { name: "user_cat_index" }
    );

    // 9. Compound index for cat feedback chronology
    await collection.createIndex(
      { catId: 1, createdAt: -1 },
      { name: "cat_created_at_index" }
    );
  } catch (error) {
    console.error("Error creating indexes:", error);
    throw error;
  }
}
