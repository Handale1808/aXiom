import clientPromise from "../mongodb.ts";

export interface IndexCreationResult {
  success: boolean;
  created: {
    abilityId: boolean;
    priority: boolean;
    exclusiveGroup: boolean;
  };
  errors: Array<{
    indexName: string;
    error: Error;
  }>;
}

export async function setupAbilityRuleIndexes(
  dbName: string = "axiom"
): Promise<IndexCreationResult> {
  const result: IndexCreationResult = {
    success: false,
    created: {
      abilityId: false,
      priority: false,
      exclusiveGroup: false,
    },
    errors: [],
  };

  try {
    const client = await clientPromise;
    const db = client.db(dbName);
    const collection = db.collection("abilityRules");

    const indexOperations = [
      {
        key: "abilityId" as const,
        create: async () => {
          await collection.createIndex(
            { abilityId: 1 },
            { name: "ability_id_index", background: true }
          );
        },
      },
      {
        key: "priority" as const,
        create: async () => {
          await collection.createIndex(
            { priority: -1 },
            { name: "priority_index", background: true }
          );
        },
      },
      {
        key: "exclusiveGroup" as const,
        create: async () => {
          await collection.createIndex(
            { exclusiveGroup: 1 },
            { name: "exclusive_group_index", background: true }
          );
        },
      },
    ];

    const results = await Promise.allSettled(
      indexOperations.map((op) => op.create())
    );

    results.forEach((promiseResult, index) => {
      const operation = indexOperations[index];
      
      if (promiseResult.status === "fulfilled") {
        result.created[operation.key] = true;
      } else {
        const error =
          promiseResult.reason instanceof Error
            ? promiseResult.reason
            : new Error(String(promiseResult.reason));
        
        result.errors.push({
          indexName: operation.key,
          error,
        });
      }
    });

    result.success = result.errors.length === 0;

    if (!result.success) {
      console.error("Some indexes failed to create:", result.errors);
    }

    return result;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    console.error("Error during index setup:", err);
    
    result.errors.push({
      indexName: "setup",
      error: err,
    });
    
    return result;
  }
}