// lib/indexes/setup-alien-indexes.ts

import clientPromise from "../mongodb";

export interface IndexSetupResult {
  success: boolean;
  createdIndexes: string[];
  existingIndexes: string[];
  errors: Array<{ indexName: string; error: string }>;
}

/**
 * Sets up MongoDB indexes for the aliens collection (pure aliens)
 */
export async function setupAlienIndexes(
  databaseName: string = "axiom"
): Promise<IndexSetupResult> {
  const result: IndexSetupResult = {
    success: true,
    createdIndexes: [],
    existingIndexes: [],
    errors: [],
  };

  try {
    const client = await clientPromise;
    const db = client.db(databaseName);
    const collection = db.collection("aliens");

    const indexDefinitions = [
      {
        name: "alien_created_at_index",
        spec: { createdAt: -1 } as const,
        options: { name: "alien_created_at_index" },
      },
      {
        name: "alien_name_index",
        spec: { name: 1 } as const,
        options: { name: "alien_name_index" },
      },
      {
        name: "alien_type_index",
        spec: { type: 1 } as const,
        options: { name: "alien_type_index" },
      },
      {
        name: "alien_stat_strength_index",
        spec: { "stats.strength": 1 } as const,
        options: { name: "alien_stat_strength_index" },
      },
      {
        name: "alien_stat_psychic_index",
        spec: { "stats.psychic": 1 } as const,
        options: { name: "alien_stat_psychic_index" },
      },
      {
        name: "alien_trait_wings_index",
        spec: { "physicalTraits.wings": 1 } as const,
        options: { name: "alien_trait_wings_index" },
      },
      {
        name: "alien_trait_skin_type_index",
        spec: { "physicalTraits.skinType": 1 } as const,
        options: { name: "alien_trait_skin_type_index" },
      },
      {
        name: "alien_trait_size_index",
        spec: { "physicalTraits.size": 1 } as const,
        options: { name: "alien_trait_size_index" },
      },
    ] as const;

    const indexPromises = indexDefinitions.map(async (def) => {
      try {
        await collection.createIndex(def.spec, def.options);
        return { status: "created" as const, name: def.name };
      } catch (error: any) {
        if (error?.code === 85 || error?.codeName === "IndexAlreadyExists") {
          return { status: "existing" as const, name: def.name };
        }

        const errorMessage = error?.message || String(error);
        return { status: "error" as const, name: def.name, error: errorMessage };
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
      }
    }

    result.success = result.errors.length === 0;
  } catch (error: any) {
    result.success = false;
    result.errors.push({
      indexName: "connection",
      error: error?.message || String(error),
    });
  }

  return result;
}