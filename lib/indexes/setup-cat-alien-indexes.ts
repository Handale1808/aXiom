import clientPromise from "../mongodb.ts";

export interface IndexSetupResult {
  success: boolean;
  createdIndexes: string[];
  existingIndexes: string[];
  errors: Array<{
    indexName: string;
    error: string;
  }>;
}

export async function setupCatAlienIndexes(
  databaseName: string = "axiom"
): Promise<IndexSetupResult> {
  const dbName = databaseName ?? "axiom";
  
  const result: IndexSetupResult = {
    success: true,
    createdIndexes: [],
    existingIndexes: [],
    errors: [],
  };

  try {
    const client = await clientPromise;

    if (!client || typeof client.db !== "function") {
      result.success = false;
      result.errors.push({
        indexName: "connection",
        error: "Invalid MongoDB client: client is null or missing db method",
      });
      return result;
    }

    const db = client.db(dbName);
    const collection = db.collection("catAliens");

   const indexDefinitions = [
      {
        name: "cat_created_at_index",
        spec: { createdAt: -1 } as const,
        options: { name: "cat_created_at_index" },
      },
      {
        name: "cat_name_index",
        spec: { name: 1 } as const,
        options: { name: "cat_name_index" },
      },
      {
        name: "stat_strength_index",
        spec: { "stats.strength": 1 } as const,
        options: { name: "stat_strength_index" },
      },
      {
        name: "stat_agility_index",
        spec: { "stats.agility": 1 } as const,
        options: { name: "stat_agility_index" },
      },
      {
        name: "stat_psychic_index",
        spec: { "stats.psychic": 1 } as const,
        options: { name: "stat_psychic_index" },
      },
      {
        name: "trait_size_index",
        spec: { "physicalTraits.size": 1 } as const,
        options: { name: "trait_size_index" },
      },
      {
        name: "trait_skin_type_index",
        spec: { "physicalTraits.skinType": 1 } as const,
        options: { name: "trait_skin_type_index" },
      },
    ] as const;

    const indexPromises = indexDefinitions.map(async (def) => {
      try {
        await collection.createIndex(def.spec, def.options);
        return { status: "created" as const, name: def.name };
      } catch (error: any) {
        const errorCode = error?.code;
        const errorCodeName = error?.codeName;
        
        if (errorCode === 85 || errorCodeName === "IndexAlreadyExists") {
          return { status: "existing" as const, name: def.name };
        }
        
        let errorMessage: string;
        if (error === null) {
          errorMessage = "null";
        } else if (error === undefined) {
          errorMessage = "undefined";
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (error instanceof Error) {
          errorMessage = error.message || String(error);
        } else if (error && typeof error === "object" && "message" in error) {
          errorMessage = typeof error.message === "string" 
            ? error.message 
            : String(error.message);
        } else {
          errorMessage = String(error);
        }
        
        return {
          status: "error" as const,
          name: def.name,
          error: errorMessage,
        };
      }
    });

    const results = await Promise.allSettled(indexPromises);

    for (const promiseResult of results) {
      if (promiseResult.status === "fulfilled") {
        const indexResult = promiseResult.value;
        if (indexResult.status === "created") {
          result.createdIndexes.push(indexResult.name);
        } else if (indexResult.status === "existing") {
          result.existingIndexes.push(indexResult.name);
        } else if (indexResult.status === "error") {
          result.errors.push({
            indexName: indexResult.name,
            error: indexResult.error,
          });
        }
      } else {
        result.errors.push({
          indexName: "unknown",
          error: promiseResult.reason?.message || String(promiseResult.reason),
        });
      }
    }

    if (result.errors.length > 0) {
      result.success = false;
    }
  } catch (error: any) {
    result.success = false;
    result.errors.push({
      indexName: "connection",
      error: error.message || String(error),
    });
  }

  return result;
}