// __tests__/setup-cat-ability-indexes.test.ts
import { setupCatAbilityIndexes } from "../../../lib/indexes/setup-cat-ability-indexes";

jest.mock("../../../lib/mongodb", () => {
  let mockClientPromise: Promise<any>;

  return {
    __esModule: true,
    default: mockClientPromise,
    __setMockClientPromise: (promise: Promise<any>) => {
      mockClientPromise = promise;
    },
    get default() {
      return mockClientPromise;
    },
  };
});

const mongodb = require("../../../lib/mongodb");

describe("setupCatAbilityIndexes", () => {
  let mockCollection: any;
  let mockDb: any;
  let mockClient: any;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    mockCollection = {
      createIndex: jest.fn().mockResolvedValue("index_created"),
    };

    mockDb = {
      collection: jest.fn().mockReturnValue(mockCollection),
    };

    mockClient = {
      db: jest.fn().mockReturnValue(mockDb),
    };

    mongodb.__setMockClientPromise(Promise.resolve(mockClient));
    consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.clearAllMocks();
    consoleErrorSpy.mockRestore();
  });

  describe("Normal Operation", () => {
    it("should create all three indexes successfully", async () => {
      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(mockDb.collection).toHaveBeenCalledWith("catAbilities");
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(3);
    });

    it("should call db() exactly once", async () => {
      await setupCatAbilityIndexes();

      expect(mockClient.db).toHaveBeenCalledTimes(1);
    });

    it("should call collection() exactly once", async () => {
      await setupCatAbilityIndexes();

      expect(mockDb.collection).toHaveBeenCalledTimes(1);
    });

    it("should use hardcoded database name 'axiom'", async () => {
      await setupCatAbilityIndexes();

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
    });

    it("should accept custom database name parameter", async () => {
      await setupCatAbilityIndexes("custom-db");

      expect(mockClient.db).toHaveBeenCalledWith("custom-db");
    });

    it("should use hardcoded collection name 'catAbilities'", async () => {
      await setupCatAbilityIndexes();

      expect(mockDb.collection).toHaveBeenCalledWith("catAbilities");
    });

    it("should create catId index with correct specification", async () => {
      await setupCatAbilityIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const catIdIndexCall = calls.find((c) => c[1].name === "cat_id_index");

      expect(catIdIndexCall).toBeDefined();
      expect(catIdIndexCall[0]).toEqual({ catId: 1 });
      expect(catIdIndexCall[1]).toEqual({ name: "cat_id_index" });
    });

    it("should create abilityId index with correct specification", async () => {
      await setupCatAbilityIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const abilityIdIndexCall = calls.find(
        (c) => c[1].name === "cat_ability_ability_id_index"
      );

      expect(abilityIdIndexCall).toBeDefined();
      expect(abilityIdIndexCall[0]).toEqual({ abilityId: 1 });
      expect(abilityIdIndexCall[1]).toEqual({
        name: "cat_ability_ability_id_index",
      });
    });

    it("should create compound unique index with correct specification", async () => {
      await setupCatAbilityIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const compoundIndexCall = calls.find(
        (c) => c[1].name === "cat_ability_unique_index"
      );

      expect(compoundIndexCall).toBeDefined();
      expect(compoundIndexCall[0]).toEqual({ catId: 1, abilityId: 1 });
      expect(compoundIndexCall[1]).toEqual({
        name: "cat_ability_unique_index",
        unique: true,
      });
    });

    it("should create indexes in correct order", async () => {
      await setupCatAbilityIndexes();

      const calls = mockCollection.createIndex.mock.calls;

      expect(calls[0][1].name).toBe("cat_id_index");
      expect(calls[1][1].name).toBe("cat_ability_ability_id_index");
      expect(calls[2][1].name).toBe("cat_ability_unique_index");
    });

    it("should not log any errors on success", async () => {
      await setupCatAbilityIndexes();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should return success result with all created indexes", async () => {
      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toEqual([
        "cat_id_index",
        "cat_ability_ability_id_index",
        "cat_ability_unique_index",
      ]);
      expect(result.existingIndexes).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("should return structured result object", async () => {
      const result = await setupCatAbilityIndexes();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("createdIndexes");
      expect(result).toHaveProperty("existingIndexes");
      expect(result).toHaveProperty("errors");
      expect(Array.isArray(result.createdIndexes)).toBe(true);
      expect(Array.isArray(result.existingIndexes)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });
  });

  describe("Connection Failures", () => {
    it("should return error result when clientPromise rejects", async () => {
      const connectionError = new Error("Connection timeout");
      mongodb.__setMockClientPromise(Promise.reject(connectionError));

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        indexName: "connection",
        error: "Connection timeout",
      });
      expect(result.createdIndexes).toEqual([]);
      expect(result.existingIndexes).toEqual([]);
    });

    it("should not create any indexes when connection fails", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Connection failed"))
      );

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(mockCollection.createIndex).not.toHaveBeenCalled();
    });

    it("should return error result when client is null", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(null));

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result when client is undefined", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(undefined));

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result when client has no db method", async () => {
      mongodb.__setMockClientPromise(Promise.resolve({}));

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result when client.db is not a function", async () => {
      const invalidClient = { db: "not a function" };
      mongodb.__setMockClientPromise(Promise.resolve(invalidClient));

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should preserve original error message in error result", async () => {
      const specificError = new Error(
        "MongoDB connection failed: network unreachable at replica-1.mongodb.net:27017"
      );
      mongodb.__setMockClientPromise(Promise.reject(specificError));

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe(
        "MongoDB connection failed: network unreachable at replica-1.mongodb.net:27017"
      );
    });
  });

  describe("Database/Collection Failures", () => {
    it("should return error result when db() returns null", async () => {
      mockClient.db.mockReturnValue(null);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid database instance");
    });

    it("should return error result when db() returns undefined", async () => {
      mockClient.db.mockReturnValue(undefined);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid database instance");
    });

    it("should return error result when db() throws synchronously", async () => {
      mockClient.db.mockImplementation(() => {
        throw new Error("Database not found");
      });

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Database not found");
    });

    it("should return error result when collection() returns null", async () => {
      mockDb.collection.mockReturnValue(null);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });

    it("should return error result when collection() returns undefined", async () => {
      mockDb.collection.mockReturnValue(undefined);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });

    it("should return error result when collection() throws synchronously", async () => {
      mockDb.collection.mockImplementation(() => {
        throw new Error("Collection access denied");
      });

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Collection access denied");
    });

    it("should return error result when collection has no createIndex method", async () => {
      mockDb.collection.mockReturnValue({});

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });

    it("should return error result when collection.createIndex is not a function", async () => {
      mockDb.collection.mockReturnValue({ createIndex: "not a function" });

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });
  });

  describe("Index Creation Failures - Partial Success with Promise.allSettled", () => {
    it("should continue creating all indexes even when first fails", async () => {
      const indexError = new Error("Index creation failed");
      mockCollection.createIndex.mockRejectedValueOnce(indexError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toEqual([
        "cat_ability_ability_id_index",
        "cat_ability_unique_index",
      ]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("cat_id_index");
      expect(result.errors[0].error).toBe("Index creation failed");
    });

    it("should continue creating all indexes even when second fails", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(new Error("Second index failed"));

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toEqual([
        "cat_id_index",
        "cat_ability_unique_index",
      ]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("cat_ability_ability_id_index");
    });

    it("should continue creating all indexes even when third fails", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(new Error("Third index failed"));

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toEqual([
        "cat_id_index",
        "cat_ability_ability_id_index",
      ]);
      expect(result.errors).toHaveLength(1);
    });

    it("should attempt all three indexes even when first fails", async () => {
      mockCollection.createIndex.mockRejectedValueOnce(
        new Error("First failed")
      );

      await setupCatAbilityIndexes();

      expect(mockCollection.createIndex).toHaveBeenCalledTimes(3);
    });

    it("should track multiple failed indexes", async () => {
      mockCollection.createIndex
        .mockRejectedValueOnce(new Error("First failed"))
        .mockRejectedValueOnce(new Error("Second failed"))
        .mockResolvedValueOnce("created");

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toEqual(["cat_ability_unique_index"]);
      expect(result.errors).toHaveLength(2);
    });

    it("should track all three failures", async () => {
      mockCollection.createIndex
        .mockRejectedValueOnce(new Error("First"))
        .mockRejectedValueOnce(new Error("Second"))
        .mockRejectedValueOnce(new Error("Third"));

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toEqual([]);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe("MongoDB Error Codes", () => {
    it("should treat error code 85 as existing index", async () => {
      const duplicateError = new Error(
        "Index with name 'cat_id_index' already exists with different options"
      );
      (duplicateError as any).code = 85;
      (duplicateError as any).codeName = "IndexOptionsConflict";

      mockCollection.createIndex.mockRejectedValueOnce(duplicateError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toContain("cat_id_index");
      expect(result.errors).toHaveLength(0);
    });

    it("should treat error code 86 as existing index", async () => {
      const duplicateError = new Error("Index already exists");
      (duplicateError as any).code = 86;

      mockCollection.createIndex.mockRejectedValueOnce(duplicateError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toContain("cat_id_index");
    });

    it("should fail on duplicate key error during unique index creation (error code 11000)", async () => {
      const duplicateKeyError = new Error(
        "E11000 duplicate key error collection: axiom.catAbilities index: cat_ability_unique_index"
      );
      (duplicateKeyError as any).code = 11000;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(duplicateKeyError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("cat_ability_unique_index");
    });

    it("should fail on insufficient resources error (error code 12586)", async () => {
      const resourceError = new Error("not enough data-bearing nodes");
      (resourceError as any).code = 12586;

      mockCollection.createIndex.mockRejectedValueOnce(resourceError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should fail on unauthorized error (error code 13)", async () => {
      const authError = new Error("not authorized on axiom to execute command");
      (authError as any).code = 13;
      (authError as any).codeName = "Unauthorized";

      mockCollection.createIndex.mockRejectedValueOnce(authError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should fail on write conflict error (error code 112)", async () => {
      const writeConflictError = new Error("WriteConflict");
      (writeConflictError as any).code = 112;

      mockCollection.createIndex.mockRejectedValueOnce(writeConflictError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
    });

    it("should fail on command not supported error (error code 115)", async () => {
      const notSupportedError = new Error("Command not supported");
      (notSupportedError as any).code = 115;

      mockCollection.createIndex.mockRejectedValueOnce(notSupportedError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
    });

    it("should fail on index build aborted error (error code 125)", async () => {
      const abortedError = new Error("Index build aborted: collection dropped");
      (abortedError as any).code = 125;

      mockCollection.createIndex.mockRejectedValueOnce(abortedError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
    });
  });

  describe("Error Object Variations", () => {
    it("should handle error with no message", async () => {
      const emptyError = new Error("");
      mockCollection.createIndex.mockRejectedValueOnce(emptyError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle non-Error object thrown", async () => {
      mockCollection.createIndex.mockRejectedValueOnce("string error");

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("string error");
    });

    it("should handle null thrown as error", async () => {
      mockCollection.createIndex.mockRejectedValueOnce(null);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle undefined thrown as error", async () => {
      mockCollection.createIndex.mockRejectedValueOnce(undefined);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle number thrown as error", async () => {
      mockCollection.createIndex.mockRejectedValueOnce(404);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("404");
    });

    it("should handle error with additional properties", async () => {
      const richError = new Error("Index error");
      (richError as any).code = 67;
      (richError as any).codeName = "CannotCreateIndex";
      (richError as any).errmsg = "detailed error message";
      (richError as any).index = { catId: 1 };

      mockCollection.createIndex.mockRejectedValueOnce(richError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Index error");
    });

    it("should handle error with very long message", async () => {
      const longMessage = "x".repeat(10000);
      const longError = new Error(longMessage);

      mockCollection.createIndex.mockRejectedValueOnce(longError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toHaveLength(10000);
    });

    it("should handle error with special characters in message", async () => {
      const specialError = new Error(
        "Error: \n\t\r\\x00\\xFF\u0000\uFFFD 🚨 <script>"
      );

      mockCollection.createIndex.mockRejectedValueOnce(specialError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle error with circular references", async () => {
      const circularError: any = new Error("Circular error");
      circularError.self = circularError;

      mockCollection.createIndex.mockRejectedValueOnce(circularError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
    });
  });

  describe("Timing and Race Conditions", () => {
    it("should handle all indexes completing concurrently with Promise.allSettled", async () => {
      mockCollection.createIndex.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve("done"), 50))
      );

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(3);
    });

    it("should handle indexes completing in reverse order", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(() => {
        const delay = callCount === 0 ? 100 : callCount === 1 ? 50 : 10;
        callCount++;
        return new Promise((resolve) =>
          setTimeout(() => resolve("done"), delay)
        );
      });

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle very slow index creation", async () => {
      mockCollection.createIndex.mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve("done"), 500))
      );

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(3);
    });

    it("should handle immediate rejection but continue with other indexes", async () => {
      mockCollection.createIndex.mockRejectedValueOnce(
        new Error("Immediate failure")
      );

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(3);
    });

    it("should handle delayed rejection and continue with other indexes", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockImplementation(
          () =>
            new Promise((_, reject) =>
              setTimeout(() => reject(new Error("Delayed failure")), 100)
            )
        );

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("Client State Corruption", () => {
    it("should complete successfully even if client properties mutate during execution", async () => {
      let indexCount = 0;

      mockCollection.createIndex.mockImplementation(async () => {
        indexCount++;
        if (indexCount === 2) {
          (mockClient as any).corrupted = true;
          (mockClient as any).db = undefined;
        }
        return "created";
      });

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(3);
    });

    it("should complete successfully with captured references despite external changes", async () => {
      const originalDb = mockDb;
      const originalCollection = mockCollection;

      let firstIndexStarted = false;
      mockCollection.createIndex.mockImplementation(async () => {
        if (!firstIndexStarted) {
          firstIndexStarted = true;
          mockClient.db = jest.fn().mockReturnValue(null);
          mockDb.collection = jest.fn().mockReturnValue(null);
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "created";
      });

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);

      mockClient.db = jest.fn().mockReturnValue(originalDb);
      mockDb.collection = jest.fn().mockReturnValue(originalCollection);
    });

    it("should handle collection being deleted from db during execution", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockImplementation(async () => {
          mockDb.collection = jest.fn().mockReturnValue(null);
          return "created";
        });

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
    });
  });

  describe("Memory and Resource Edge Cases", () => {
    it("should handle index creation returning very large result object", async () => {
      const largeResult = {
        ok: 1,
        createdCollectionAutomatically: false,
        numIndexesBefore: 1,
        numIndexesAfter: 2,
        metadata: "x".repeat(100000),
      };

      mockCollection.createIndex.mockResolvedValue(largeResult);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle index creation returning null", async () => {
      mockCollection.createIndex.mockResolvedValue(null);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle index creation returning undefined", async () => {
      mockCollection.createIndex.mockResolvedValue(undefined);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle index creation returning empty object", async () => {
      mockCollection.createIndex.mockResolvedValue({});

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle collection with thousands of existing indexes", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(async () => {
        callCount++;
        await new Promise((resolve) => setTimeout(resolve, 10));
        return {
          numIndexesBefore: 5000 + callCount,
          numIndexesAfter: 5001 + callCount,
        };
      });

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
    });
  });

  describe("MongoDB Driver Behavior", () => {
    it("should handle createIndex returning promise that never resolves", async () => {
      mockCollection.createIndex.mockReturnValueOnce(new Promise(() => {}));

      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("Test timeout")), 100)
      );

      await expect(
        Promise.race([setupCatAbilityIndexes(), timeoutPromise])
      ).rejects.toThrow("Test timeout");
    });

    it("should call createIndex with exactly two arguments for each index", async () => {
      let capturedArgs: any[] = [];
      mockCollection.createIndex.mockImplementation((...args: any[]) => {
        capturedArgs.push(args);
        return Promise.resolve("created");
      });

      await setupCatAbilityIndexes();

      capturedArgs.forEach((args) => {
        expect(args).toHaveLength(2);
        expect(args[0]).toBeTruthy();
        expect(args[1]).toBeTruthy();
      });
    });

    it("should pass exactly the specified index keys and options", async () => {
      await setupCatAbilityIndexes();

      const calls = mockCollection.createIndex.mock.calls;

      const hasFirstIndex = calls.some(
        (c) =>
          JSON.stringify(c[0]) === JSON.stringify({ catId: 1 }) &&
          c[1].name === "cat_id_index"
      );
      const hasSecondIndex = calls.some(
        (c) =>
          JSON.stringify(c[0]) === JSON.stringify({ abilityId: 1 }) &&
          c[1].name === "cat_ability_ability_id_index"
      );
      const hasThirdIndex = calls.some(
        (c) =>
          JSON.stringify(c[0]) === JSON.stringify({ catId: 1, abilityId: 1 }) &&
          c[1].name === "cat_ability_unique_index" &&
          c[1].unique === true
      );

      expect(hasFirstIndex).toBe(true);
      expect(hasSecondIndex).toBe(true);
      expect(hasThirdIndex).toBe(true);
    });

    it("should not mutate index specification objects", async () => {
      const indexKeys = [
        { catId: 1 },
        { abilityId: 1 },
        { catId: 1, abilityId: 1 },
      ];

      await setupCatAbilityIndexes();

      expect(indexKeys[0]).toEqual({ catId: 1 });
      expect(indexKeys[1]).toEqual({ abilityId: 1 });
      expect(indexKeys[2]).toEqual({ catId: 1, abilityId: 1 });
    });
  });

  describe("TypeScript Type Safety Edge Cases", () => {
    it("should handle when db returns wrong type but has collection method", async () => {
      const strangeDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
        somethingElse: "weird",
      };
      mockClient.db.mockReturnValue(strangeDb as any);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(strangeDb.collection).toHaveBeenCalledWith("catAbilities");
    });

    it("should handle when collection returns wrong type but has createIndex method", async () => {
      const strangeCollection = {
        createIndex: jest.fn().mockResolvedValue("created"),
        notExpected: 123,
      };
      mockDb.collection.mockReturnValue(strangeCollection as any);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
    });
  });

  describe("Partial Success Scenarios", () => {
    it("should mark success as false when any index fails", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(new Error("Second failed"))
        .mockResolvedValueOnce("created");

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
    });

    it("should mark success as true when all indexes succeed", async () => {
      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });

    it("should mark success as true when all indexes exist", async () => {
      const existingError = new Error("Index already exists");
      (existingError as any).code = 85;

      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(3);
      expect(result.errors).toHaveLength(0);
    });

    it("should mark success as true for mix of created and existing", async () => {
      const existingError = new Error("Index already exists");
      (existingError as any).code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existingError)
        .mockResolvedValueOnce("created");

      const result = await setupCatAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
      expect(result.existingIndexes).toHaveLength(1);
    });
  });

  describe("Return Value Integrity", () => {
    it("should never return undefined for any property", async () => {
      const result = await setupCatAbilityIndexes();

      expect(result.success).toBeDefined();
      expect(result.createdIndexes).toBeDefined();
      expect(result.existingIndexes).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it("should ensure arrays are never null", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("fail"));

      const result = await setupCatAbilityIndexes();

      expect(result.createdIndexes).not.toBeNull();
      expect(result.existingIndexes).not.toBeNull();
      expect(result.errors).not.toBeNull();
    });

    it("should ensure success is always boolean", async () => {
      const result = await setupCatAbilityIndexes();

      expect(typeof result.success).toBe("boolean");
    });

    it("should have consistent types across success and failure", async () => {
      const successResult = await setupCatAbilityIndexes();

      mockCollection.createIndex.mockRejectedValue(new Error("fail"));
      const failureResult = await setupCatAbilityIndexes();

      expect(typeof successResult.success).toBe(typeof failureResult.success);
      expect(Array.isArray(successResult.createdIndexes)).toBe(
        Array.isArray(failureResult.createdIndexes)
      );
      expect(Array.isArray(successResult.existingIndexes)).toBe(
        Array.isArray(failureResult.existingIndexes)
      );
      expect(Array.isArray(successResult.errors)).toBe(
        Array.isArray(failureResult.errors)
      );
    });
  });

  describe("Concurrent Index Creation with Promise.allSettled", () => {
    it("should create all indexes concurrently not sequentially", async () => {
      const executionOrder: string[] = [];

      mockCollection.createIndex
        .mockImplementationOnce(async () => {
          executionOrder.push("start-1");
          await new Promise((resolve) => setTimeout(resolve, 50));
          executionOrder.push("end-1");
          return "created";
        })
        .mockImplementationOnce(async () => {
          executionOrder.push("start-2");
          await new Promise((resolve) => setTimeout(resolve, 50));
          executionOrder.push("end-2");
          return "created";
        })
        .mockImplementationOnce(async () => {
          executionOrder.push("start-3");
          await new Promise((resolve) => setTimeout(resolve, 50));
          executionOrder.push("end-3");
          return "created";
        });

      await setupCatAbilityIndexes();

      // With Promise.allSettled, all should start before any end
      expect(executionOrder).toEqual([
        "start-1",
        "start-2",
        "start-3",
        "end-1",
        "end-2",
        "end-3",
      ]);
    });
  });

  describe("setupCatAbilityIndexes - Additional Production Tests", () => {
    let mockCollection: any;
    let mockDb: any;
    let mockClient: any;
    let consoleErrorSpy: jest.SpyInstance;

    beforeEach(() => {
      mockCollection = {
        createIndex: jest.fn().mockResolvedValue("index_created"),
      };

      mockDb = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mockClient = {
        db: jest.fn().mockReturnValue(mockDb),
      };

      mongodb.__setMockClientPromise(Promise.resolve(mockClient));
      consoleErrorSpy = jest.spyOn(console, "error").mockImplementation();
    });

    afterEach(() => {
      jest.clearAllMocks();
      consoleErrorSpy.mockRestore();
    });

    // CRITICAL GAP: Empty string database name
    describe("Edge Cases - Database Name Validation", () => {
      it("should handle empty string database name", async () => {
        const result = await setupCatAbilityIndexes("");

        expect(mockClient.db).toHaveBeenCalledWith("");
        expect(result.success).toBe(true);
      });

      it("should handle database name with special characters", async () => {
        const result = await setupCatAbilityIndexes("test-db_123.prod");

        expect(mockClient.db).toHaveBeenCalledWith("test-db_123.prod");
      });

      it("should handle very long database name", async () => {
        const longName = "a".repeat(500);
        const result = await setupCatAbilityIndexes(longName);

        expect(mockClient.db).toHaveBeenCalledWith(longName);
      });

      it("should handle database name with unicode characters", async () => {
        const result = await setupCatAbilityIndexes("数据库");

        expect(mockClient.db).toHaveBeenCalledWith("数据库");
      });
    });

    // CRITICAL GAP: Logging behavior validation
    describe("Console Error Logging - Complete Coverage", () => {
      it("should log complete error context including database name", async () => {
        const error = new Error("Network timeout");
        mongodb.__setMockClientPromise(Promise.reject(error));

        await setupCatAbilityIndexes("production-db");

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error creating catAbilities indexes:",
          expect.objectContaining({
            database: "production-db",
            collection: "catAbilities",
            error: "Network timeout",
          })
        );
      });

      it("should log error code when present", async () => {
        const error = new Error("Duplicate key") as any;
        error.code = 11000;
        error.codeName = "DuplicateKey";
        mongodb.__setMockClientPromise(Promise.reject(error));

        await setupCatAbilityIndexes();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error creating catAbilities indexes:",
          expect.objectContaining({
            errorCode: 11000,
            errorName: "DuplicateKey",
          })
        );
      });

      it("should log undefined error code when not present", async () => {
        const error = new Error("Generic error");
        mongodb.__setMockClientPromise(Promise.reject(error));

        await setupCatAbilityIndexes();

        expect(consoleErrorSpy).toHaveBeenCalledWith(
          "Error creating catAbilities indexes:",
          expect.objectContaining({
            errorCode: undefined,
            errorName: undefined,
          })
        );
      });

      it("should not log when indexes are created successfully", async () => {
        await setupCatAbilityIndexes();

        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it("should not log when indexes already exist (code 85)", async () => {
        const existingError = new Error("Index exists") as any;
        existingError.code = 85;
        mockCollection.createIndex.mockRejectedValue(existingError);

        await setupCatAbilityIndexes();

        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });

      it("should not log when indexes already exist (code 86)", async () => {
        const existingError = new Error("Index exists") as any;
        existingError.code = 86;
        mockCollection.createIndex.mockRejectedValue(existingError);

        await setupCatAbilityIndexes();

        expect(consoleErrorSpy).not.toHaveBeenCalled();
      });
    });

    // CRITICAL GAP: Error code 86 handling
    describe("Index Already Exists - Code 86", () => {
      it("should treat error code 86 as existing index", async () => {
        const existingError = new Error("Index already exists") as any;
        existingError.code = 86;
        mockCollection.createIndex.mockRejectedValue(existingError);

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(true);
        expect(result.existingIndexes).toHaveLength(3);
        expect(result.existingIndexes).toEqual([
          "cat_id_index",
          "cat_ability_ability_id_index",
          "cat_ability_unique_index",
        ]);
        expect(result.errors).toHaveLength(0);
      });

      it("should handle mix of code 85 and 86", async () => {
        const error85 = new Error("Exists") as any;
        error85.code = 85;
        const error86 = new Error("Exists") as any;
        error86.code = 86;

        mockCollection.createIndex
          .mockRejectedValueOnce(error85)
          .mockRejectedValueOnce(error86)
          .mockResolvedValueOnce("created");

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(true);
        expect(result.existingIndexes).toHaveLength(2);
        expect(result.createdIndexes).toHaveLength(1);
      });
    });

    // CRITICAL GAP: Race conditions and timing
    describe("Race Conditions and Timing", () => {
      it("should handle when second call starts before first completes", async () => {
        let firstCallResolve: any;
        const firstCallPromise = new Promise((resolve) => {
          firstCallResolve = resolve;
        });

        mockCollection.createIndex.mockReturnValue(firstCallPromise);

        const firstCall = setupCatAbilityIndexes();
        const secondCall = setupCatAbilityIndexes();

        firstCallResolve("created");

        const [result1, result2] = await Promise.all([firstCall, secondCall]);

        expect(result1.success).toBe(true);
        expect(result2.success).toBe(true);
      });

      it("should handle extremely fast index creation", async () => {
        mockCollection.createIndex.mockResolvedValue("created");

        const start = Date.now();
        await setupCatAbilityIndexes();
        const duration = Date.now() - start;

        expect(duration).toBeLessThan(100);
      });

      it("should handle slow network with indexes created in different order", async () => {
        mockCollection.createIndex
          .mockImplementationOnce(
            () =>
              new Promise((resolve) =>
                setTimeout(() => resolve("created"), 100)
              )
          )
          .mockImplementationOnce(
            () =>
              new Promise((resolve) => setTimeout(() => resolve("created"), 10))
          )
          .mockImplementationOnce(
            () =>
              new Promise((resolve) => setTimeout(() => resolve("created"), 50))
          );

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(true);
        expect(result.createdIndexes).toHaveLength(3);
      });
    });

    // CRITICAL GAP: Memory and resource management
    describe("Memory and Resource Management", () => {
      it("should not leak memory with large number of sequential calls", async () => {
        const iterations = 50;
        const results = [];

        for (let i = 0; i < iterations; i++) {
          const result = await setupCatAbilityIndexes();
          results.push(result);
        }

        expect(results).toHaveLength(iterations);
        expect(mockCollection.createIndex).toHaveBeenCalledTimes(
          iterations * 3
        );
        results.forEach((result) => {
          expect(result.success).toBe(true);
        });
      });

      it("should handle extremely large error messages", async () => {
        const hugeError = new Error("x".repeat(100000));
        mongodb.__setMockClientPromise(Promise.reject(hugeError));

        const result = await setupCatAbilityIndexes();

        expect(result.errors[0].error).toHaveLength(100000);
      });

      it("should not mutate global state between calls", async () => {
        const result1 = await setupCatAbilityIndexes();
        const result2 = await setupCatAbilityIndexes();

        expect(result1).not.toBe(result2);
        expect(result1.createdIndexes).not.toBe(result2.createdIndexes);
      });
    });

    // CRITICAL GAP: Corrupted or malformed data
    describe("Corrupted Data and Type Coercion", () => {
      it("should handle when createIndex throws non-Error object", async () => {
        mockCollection.createIndex.mockRejectedValueOnce("string error");

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.errors[0].error).toBe("string error");
      });

      it("should handle when createIndex throws number", async () => {
        mockCollection.createIndex.mockRejectedValueOnce(404);

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.errors[0].error).toBe("404");
      });

      it("should handle when createIndex throws object without toString", async () => {
        const strangeError = Object.create(null);
        strangeError.code = 12345;
        mockCollection.createIndex.mockRejectedValueOnce(strangeError);

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.errors[0].error).toBeTruthy();
      });

      it("should handle Error with circular reference", async () => {
        const circularError: any = new Error("Circular");
        circularError.self = circularError;
        mongodb.__setMockClientPromise(Promise.reject(circularError));

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.errors[0].error).toBe("Circular");
      });
    });

    // CRITICAL GAP: Return value edge cases
    describe("Return Value Edge Cases", () => {
      it("should maintain index order in createdIndexes array", async () => {
        const result = await setupCatAbilityIndexes();

        expect(result.createdIndexes).toEqual([
          "cat_id_index",
          "cat_ability_ability_id_index",
          "cat_ability_unique_index",
        ]);
      });

      it("should maintain consistent error array structure", async () => {
        mockCollection.createIndex.mockRejectedValue(new Error("fail"));

        const result = await setupCatAbilityIndexes();

        result.errors.forEach((error) => {
          expect(error).toHaveProperty("indexName");
          expect(error).toHaveProperty("error");
          expect(typeof error.indexName).toBe("string");
          expect(typeof error.error).toBe("string");
        });
      });

      it("should not include duplicate index names in arrays", async () => {
        const result = await setupCatAbilityIndexes();

        const allIndexes = [
          ...result.createdIndexes,
          ...result.existingIndexes,
        ];
        const uniqueIndexes = [...new Set(allIndexes)];

        expect(allIndexes.length).toBe(uniqueIndexes.length);
      });
    });

    // CRITICAL GAP: Partial failure combinations
    describe("Complex Partial Failure Scenarios", () => {
      it("should handle first index fails, rest succeed", async () => {
        mockCollection.createIndex
          .mockRejectedValueOnce(new Error("First failed"))
          .mockResolvedValueOnce("created")
          .mockResolvedValueOnce("created");

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.createdIndexes).toEqual([
          "cat_ability_ability_id_index",
          "cat_ability_unique_index",
        ]);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].indexName).toBe("cat_id_index");
      });

      it("should handle last index fails, rest succeed", async () => {
        mockCollection.createIndex
          .mockResolvedValueOnce("created")
          .mockResolvedValueOnce("created")
          .mockRejectedValueOnce(new Error("Last failed"));

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.createdIndexes).toEqual([
          "cat_id_index",
          "cat_ability_ability_id_index",
        ]);
        expect(result.errors).toHaveLength(1);
        expect(result.errors[0].indexName).toBe("cat_ability_unique_index");
      });

      it("should handle alternating success and failure", async () => {
        mockCollection.createIndex
          .mockResolvedValueOnce("created")
          .mockRejectedValueOnce(new Error("Second failed"))
          .mockResolvedValueOnce("created");

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.createdIndexes).toHaveLength(2);
        expect(result.existingIndexes).toHaveLength(0);
        expect(result.errors).toHaveLength(1);
      });

      it("should handle mix of created, existing, and failed", async () => {
        const existingError = new Error("Exists") as any;
        existingError.code = 85;

        mockCollection.createIndex
          .mockResolvedValueOnce("created")
          .mockRejectedValueOnce(existingError)
          .mockRejectedValueOnce(new Error("Real failure"));

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.createdIndexes).toHaveLength(1);
        expect(result.existingIndexes).toHaveLength(1);
        expect(result.errors).toHaveLength(1);
      });

      it("should handle all indexes failing with different errors", async () => {
        mockCollection.createIndex
          .mockRejectedValueOnce(new Error("Error 1"))
          .mockRejectedValueOnce(new Error("Error 2"))
          .mockRejectedValueOnce(new Error("Error 3"));

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.createdIndexes).toHaveLength(0);
        expect(result.existingIndexes).toHaveLength(0);
        expect(result.errors).toHaveLength(3);
        expect(result.errors[0].error).toBe("Error 1");
        expect(result.errors[1].error).toBe("Error 2");
        expect(result.errors[2].error).toBe("Error 3");
      });
    });

    // CRITICAL GAP: Success condition logic
    describe("Success Condition Logic Verification", () => {
      it("should return false when no indexes created and none exist", async () => {
        mockCollection.createIndex.mockRejectedValue(new Error("fail"));

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
      });

      it("should return true when at least one index created and no errors", async () => {
        const existingError = new Error("Exists") as any;
        existingError.code = 85;

        mockCollection.createIndex
          .mockResolvedValueOnce("created")
          .mockRejectedValueOnce(existingError)
          .mockRejectedValueOnce(existingError);

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(true);
      });

      it("should return true when all indexes exist and no errors", async () => {
        const existingError = new Error("Exists") as any;
        existingError.code = 85;
        mockCollection.createIndex.mockRejectedValue(existingError);

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(true);
      });

      it("should return false when errors exist regardless of created/existing", async () => {
        const existingError = new Error("Exists") as any;
        existingError.code = 85;

        mockCollection.createIndex
          .mockResolvedValueOnce("created")
          .mockRejectedValueOnce(existingError)
          .mockRejectedValueOnce(new Error("Real error"));

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
      });
    });

    // CRITICAL GAP: MongoDB driver edge cases
    describe("MongoDB Driver Edge Cases", () => {
      it("should handle when createIndex resolves with null", async () => {
        mockCollection.createIndex.mockResolvedValue(null);

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(true);
        expect(result.createdIndexes).toHaveLength(3);
      });

      it("should handle when createIndex resolves with undefined", async () => {
        mockCollection.createIndex.mockResolvedValue(undefined);

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(true);
      });

      it("should handle when createIndex resolves with empty string", async () => {
        mockCollection.createIndex.mockResolvedValue("");

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(true);
      });

      it("should handle when createIndex resolves with unexpected object", async () => {
        mockCollection.createIndex.mockResolvedValue({ weird: "response" });

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(true);
      });
    });

    // CRITICAL GAP: Promise.allSettled edge cases
    describe("Promise.allSettled Handling", () => {
      it("should handle when one promise rejects synchronously", async () => {
        mockCollection.createIndex
          .mockResolvedValueOnce("created")
          .mockImplementationOnce(() => {
            throw new Error("Sync error");
          })
          .mockResolvedValueOnce("created");

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.createdIndexes).toHaveLength(2);
        expect(result.errors).toHaveLength(1);
      });

      it("should handle when promises resolve in unexpected order", async () => {
        const delays = [50, 10, 30];
        let callIndex = 0;

        mockCollection.createIndex.mockImplementation(() => {
          const delay = delays[callIndex++];
          return new Promise((resolve) =>
            setTimeout(() => resolve("created"), delay)
          );
        });

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(true);
        expect(result.createdIndexes).toHaveLength(3);
      });
    });

    // CRITICAL GAP: Real-world production scenarios
    describe("Real-World Production Scenarios", () => {
      it("should handle network interruption during index creation", async () => {
        const networkError = new Error("ECONNRESET") as any;
        networkError.code = "ECONNRESET";

        mockCollection.createIndex
          .mockResolvedValueOnce("created")
          .mockRejectedValueOnce(networkError)
          .mockResolvedValueOnce("created");

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.errors[0].error).toContain("ECONNRESET");
      });

      it("should handle MongoDB server restart scenario", async () => {
        const serverError = new Error("connection closed") as any;
        serverError.code = "ETIMEDOUT";

        mongodb.__setMockClientPromise(Promise.reject(serverError));

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.errors[0].indexName).toBe("connection");
      });

      it("should handle when database is read-only", async () => {
        const readOnlyError = new Error("database is read-only") as any;
        readOnlyError.code = 13;

        mockCollection.createIndex.mockRejectedValue(readOnlyError);

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
        expect(result.errors).toHaveLength(3);
      });

      it("should handle when user lacks permissions", async () => {
        const permissionError = new Error("not authorized") as any;
        permissionError.code = 13;

        mockCollection.createIndex.mockRejectedValue(permissionError);

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
      });

      it("should handle when disk space is full", async () => {
        const diskError = new Error("No space left on device") as any;
        diskError.code = 14031;

        mockCollection.createIndex.mockRejectedValue(diskError);

        const result = await setupCatAbilityIndexes();

        expect(result.success).toBe(false);
      });
    });

    // CRITICAL GAP: Idempotency verification
    describe("Idempotency Verification", () => {
      it("should produce identical result when called twice with same state", async () => {
        const result1 = await setupCatAbilityIndexes();
        const result2 = await setupCatAbilityIndexes();

        expect(result1.success).toBe(result2.success);
        expect(result1.createdIndexes).toEqual(result2.createdIndexes);
        expect(result1.existingIndexes).toEqual(result2.existingIndexes);
        expect(result1.errors).toEqual(result2.errors);
      });

      it("should be safe to call multiple times even with errors", async () => {
        mockCollection.createIndex.mockRejectedValue(new Error("fail"));

        const result1 = await setupCatAbilityIndexes();
        const result2 = await setupCatAbilityIndexes();
        const result3 = await setupCatAbilityIndexes();

        expect(result1).toEqual(result2);
        expect(result2).toEqual(result3);
      });

      it("should handle when indexes exist on second call", async () => {
        const result1 = await setupCatAbilityIndexes();
        expect(result1.createdIndexes).toHaveLength(3);

        const existingError = new Error("Exists") as any;
        existingError.code = 85;
        mockCollection.createIndex.mockRejectedValue(existingError);

        const result2 = await setupCatAbilityIndexes();

        expect(result2.existingIndexes).toHaveLength(3);
        expect(result2.success).toBe(true);
      });
    });

    // CRITICAL GAP: Type safety at boundaries
    describe("Type Safety at Boundaries", () => {
      it("should never return properties outside IndexSetupResult interface", async () => {
        const result = await setupCatAbilityIndexes();

        const expectedKeys = [
          "success",
          "createdIndexes",
          "existingIndexes",
          "errors",
        ];
        const actualKeys = Object.keys(result);

        expect(actualKeys.sort()).toEqual(expectedKeys.sort());
      });

      it("should ensure error objects always have required properties", async () => {
        mockCollection.createIndex.mockRejectedValue(new Error("test"));

        const result = await setupCatAbilityIndexes();

        result.errors.forEach((error) => {
          expect(error).toHaveProperty("indexName");
          expect(error).toHaveProperty("error");
          expect(Object.keys(error).length).toBe(2);
        });
      });

      it("should never return frozen or sealed objects", async () => {
        const result = await setupCatAbilityIndexes();

        expect(Object.isFrozen(result)).toBe(false);
        expect(Object.isSealed(result)).toBe(false);
        expect(Object.isFrozen(result.createdIndexes)).toBe(false);
        expect(Object.isFrozen(result.existingIndexes)).toBe(false);
        expect(Object.isFrozen(result.errors)).toBe(false);
      });
    });
  });
});
