// lib/indexes/setup-alien-ability-indexes.ts

import clientPromise from "../mongodb";

export interface IndexSetupResult {
  success: boolean;
  createdIndexes: string[];
  existingIndexes: string[];
  errors: Array<{ indexName: string; error: string }>;
}

/**
 * Sets up MongoDB indexes for the alienAbilities junction collection
 * This collection tracks which abilities each alien has acquired
 */
export async function setupAlienAbilityIndexes(
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
    const collection = db.collection("alienAbilities");

    const indexDefinitions = [
      {
        name: "alien_ability_alienId_index",
        spec: { alienId: 1 } as const,
        options: { name: "alien_ability_alienId_index" },
      },
      {
        name: "alien_ability_abilityId_index",
        spec: { abilityId: 1 } as const,
        options: { name: "alien_ability_abilityId_index" },
      },
      {
        name: "alien_ability_compound_index",
        spec: { alienId: 1, abilityId: 1 } as const,
        options: { name: "alien_ability_compound_index", unique: true },
      },
      {
        name: "alien_ability_acquired_at_index",
        spec: { acquiredAt: -1 } as const,
        options: { name: "alien_ability_acquired_at_index" },
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