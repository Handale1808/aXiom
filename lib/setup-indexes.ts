import clientPromise from "./mongodb";

export async function setupFeedbackIndexes() {
  try {
    const client = await clientPromise;
    const db = client.db("axiom");
    const collection = db.collection("feedbacks");

    console.log("Creating indexes for feedbacks collection...");

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
    console.log("✓ Text search index created");

    // 2. Sentiment filter index
    await collection.createIndex(
      { "analysis.sentiment": 1 },
      { name: "sentiment_index" }
    );
    console.log("✓ Sentiment index created");

    // 3. Priority filter index
    await collection.createIndex(
      { "analysis.priority": 1 },
      { name: "priority_index" }
    );
    console.log("✓ Priority index created");

    // 4. Tags filter index
    await collection.createIndex(
      { "analysis.tags": 1 },
      { name: "tags_index" }
    );
    console.log("✓ Tags index created");

    // 5. CreatedAt sort index (descending for newest first)
    await collection.createIndex(
      { createdAt: -1 },
      { name: "created_at_index" }
    );
    console.log("✓ CreatedAt index created");

    console.log("All indexes created successfully!");
  } catch (error) {
    console.error("Error creating indexes:", error);
    throw error;
  }
}