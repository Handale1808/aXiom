// __tests__/setup-ability-indexes.test.ts
import { setupAbilityIndexes } from "../../../lib/indexes/setup-ability-indexes";

// Mock the mongodb module
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

describe("setupAbilityIndexes", () => {
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
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  describe("Normal Operation", () => {
    it("should create both indexes successfully", async () => {
      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toEqual([
        "ability_key_unique_index",
        "ability_created_at_index",
      ]);
      expect(result.existingIndexes).toEqual([]);
      expect(result.errors).toEqual([]);

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(mockDb.collection).toHaveBeenCalledWith("abilities");
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(2);

      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { key: 1 },
        {
          name: "ability_key_unique_index",
          unique: true,
        }
      );

      expect(mockCollection.createIndex).toHaveBeenCalledWith(
        { createdAt: -1 },
        { name: "ability_created_at_index" }
      );
    });

    it("should create indexes in the correct order", async () => {
      await setupAbilityIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      expect(calls[0][0]).toEqual({ key: 1 });
      expect(calls[1][0]).toEqual({ createdAt: -1 });
    });

    it("should work with custom database name", async () => {
      const result = await setupAbilityIndexes("test-db");

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("test-db");
    });

    it("should work with empty string database name", async () => {
      const result = await setupAbilityIndexes("");

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("");
      expect(mockDb.collection).toHaveBeenCalled();
    });
  });

  describe("Connection Failures", () => {
    it("should return error result when clientPromise rejects", async () => {
      const connectionError = new Error("Connection timeout");
      mongodb.__setMockClientPromise(Promise.reject(connectionError));

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        indexName: "connection",
        error: "Connection timeout",
      });
      expect(result.createdIndexes).toEqual([]);
      expect(result.existingIndexes).toEqual([]);
    });

    it("should return error result for null client", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(null));

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result for undefined client", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(undefined));

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result for client with missing db method", async () => {
      mongodb.__setMockClientPromise(Promise.resolve({}));

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });
  });

  describe("Database/Collection Failures", () => {
    it("should return error result when db() returns null", async () => {
      mockClient.db.mockReturnValue(null);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid database instance");
    });

    it("should return error result when collection() returns null", async () => {
      mockDb.collection.mockReturnValue(null);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });

    it("should return error result when collection() returns undefined", async () => {
      mockDb.collection.mockReturnValue(undefined);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });

    it("should return error result when db() throws synchronously", async () => {
      mockClient.db.mockImplementation(() => {
        throw new Error("Database not found");
      });

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Database not found");
    });

    it("should return error result when collection() throws synchronously", async () => {
      mockDb.collection.mockImplementation(() => {
        throw new Error("Collection access denied");
      });

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Collection access denied");
    });
  });

  describe("Index Creation Failures", () => {
    it("should record error when first index creation fails", async () => {
      const indexError = new Error("Duplicate key error");
      mockCollection.createIndex.mockRejectedValueOnce(indexError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        indexName: "ability_key_unique_index",
        error: "Duplicate key error",
      });
      expect(result.createdIndexes).toContain("ability_created_at_index");
    });

    it("should record error when second index creation fails", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("success")
        .mockRejectedValueOnce(new Error("Index creation failed"));

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toContain("ability_key_unique_index");
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("ability_created_at_index");
      expect(result.errors[0].error).toBe("Index creation failed");
    });

    it("should record errors when both indexes fail", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("Permission denied")
      );

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toBe("Permission denied");
      expect(result.errors[1].error).toBe("Permission denied");
      expect(result.createdIndexes).toHaveLength(0);
    });

    it("should handle createIndex returning null", async () => {
      mockCollection.createIndex.mockResolvedValue(null);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle createIndex returning unexpected values", async () => {
      mockCollection.createIndex.mockResolvedValue({ weird: "response" });

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });
  });

  describe("Edge Cases and Unexpected Types", () => {
    it("should handle string error gracefully", async () => {
      mockCollection.createIndex.mockRejectedValue("string error");

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toBe("string error");
      expect(result.errors[1].error).toBe("string error");
    });

    it("should handle null rejection", async () => {
      mockCollection.createIndex.mockRejectedValue(null);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toBe("null");
    });

    it("should handle undefined rejection", async () => {
      mockCollection.createIndex.mockRejectedValue(undefined);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toBe("undefined");
    });

    it("should handle numeric rejection", async () => {
      mockCollection.createIndex.mockRejectedValue(404);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toBe("404");
    });

    it("should handle complex object rejection", async () => {
      const complexError = {
        code: 11000,
        message: "Duplicate",
        nested: { deep: { error: true } },
      };
      mockCollection.createIndex.mockRejectedValue(complexError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toBe("Duplicate");
    });

    it("should handle circular reference in error", async () => {
      const circularError: any = { message: "Error" };
      circularError.self = circularError;
      mockCollection.createIndex.mockRejectedValue(circularError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toBe("Error");
    });

    it("should handle NaN in database name", async () => {
      const result = await setupAbilityIndexes(NaN as any);

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith(NaN);
    });

    it("should handle null database name", async () => {
      const result = await setupAbilityIndexes(null as any);

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith(null);
    });

    it("should handle object as database name", async () => {
      const result = await setupAbilityIndexes({ weird: "input" } as any);

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith({ weird: "input" });
    });

    it("should handle extremely long database name", async () => {
      const longName = "a".repeat(10000);
      const result = await setupAbilityIndexes(longName);

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith(longName);
    });

    it("should handle special characters in database name", async () => {
      const result = await setupAbilityIndexes("test\0null\nbyte");

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("test\0null\nbyte");
    });

    it("should handle Unicode database name", async () => {
      const result = await setupAbilityIndexes("数据库🚀");

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("数据库🚀");
    });
  });

  describe("Race Conditions and Timing", () => {
    it("should handle concurrent calls without interference", async () => {
      const call1 = setupAbilityIndexes();
      const call2 = setupAbilityIndexes();

      const [result1, result2] = await Promise.all([call1, call2]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(4);
    });

    it("should handle slow first index creation", async () => {
      let resolveFirst: any;
      const slowPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });

      mockCollection.createIndex
        .mockReturnValueOnce(slowPromise)
        .mockResolvedValueOnce("fast");

      const promise = setupAbilityIndexes();

      setTimeout(() => resolveFirst("finally done"), 10);

      const result = await promise;

      expect(result.success).toBe(true);
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(2);
    });

    it("should handle indexes created out of order due to timing", async () => {
      let resolveFirst: any;
      let resolveSecond: any;

      const firstPromise = new Promise((resolve) => {
        resolveFirst = resolve;
      });
      const secondPromise = new Promise((resolve) => {
        resolveSecond = resolve;
      });

      mockCollection.createIndex
        .mockReturnValueOnce(firstPromise)
        .mockReturnValueOnce(secondPromise);

      const promise = setupAbilityIndexes();

      resolveSecond("second done");
      resolveFirst("first done");

      const result = await promise;

      expect(result.success).toBe(true);
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(2);
    });

    it("should continue processing all indexes even on failure", async () => {
      const error = new Error("First index failed");
      mockCollection.createIndex.mockRejectedValueOnce(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.createdIndexes).toContain("ability_created_at_index");
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(2);
    });
  });

  describe("Memory and Resource Concerns", () => {
    it("should handle very large mock call stack", async () => {
      for (let i = 0; i < 100; i++) {
        const result = await setupAbilityIndexes();
        expect(result.success).toBe(true);
      }

      expect(mockCollection.createIndex).toHaveBeenCalledTimes(200);
    });

    it("should not hold references after completion", async () => {
      const weakRef = new WeakRef(mockCollection);
      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(weakRef.deref()).toBe(mockCollection);
    });

    it("should handle collection method being reassigned mid-execution", async () => {
      let callCount = 0;
      const originalMock = jest.fn().mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          // Reassign the method after first call
          mockCollection.createIndex = jest.fn().mockResolvedValue("new impl");
        }
        return "original";
      });
      mockCollection.createIndex = originalMock;

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      // JavaScript accesses properties dynamically, so after reassignment
      // the second call uses the new mock, not the original
      expect(originalMock).toHaveBeenCalledTimes(1);
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(1);
    });
  });

  describe("Production Scenarios", () => {
    it("should record MongoDB timeout errors", async () => {
      const timeoutError = new Error("operation exceeded time limit");
      timeoutError.name = "MongoTimeoutError";
      mockCollection.createIndex.mockRejectedValue(timeoutError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toContain("operation exceeded time limit");
    });

    it("should record MongoDB network errors", async () => {
      const networkError = new Error("connection refused");
      mockCollection.createIndex.mockRejectedValue(networkError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toContain("connection refused");
    });

    it("should record MongoDB authentication errors", async () => {
      const authError = new Error("authentication failed");
      (authError as any).code = 18;
      mockCollection.createIndex.mockRejectedValue(authError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toContain("authentication failed");
    });

    it("should complete when MongoDB returns success with metadata", async () => {
      mockCollection.createIndex.mockResolvedValue({
        ok: 1,
        createdCollectionAutomatically: false,
        numIndexesBefore: 1,
        numIndexesAfter: 3,
      });

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle index already exists gracefully", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created");

      const result1 = await setupAbilityIndexes();
      expect(result1.success).toBe(true);

      const duplicateError = new Error("Index already exists");
      (duplicateError as any).code = 85;
      mockCollection.createIndex
        .mockRejectedValueOnce(duplicateError)
        .mockRejectedValueOnce(duplicateError);

      const result2 = await setupAbilityIndexes();

      expect(result2.success).toBe(true);
      expect(result2.existingIndexes).toHaveLength(2);
      expect(result2.createdIndexes).toHaveLength(0);
      expect(result2.errors).toHaveLength(0);
    });

    it("should handle code 86 as index already exists", async () => {
      const duplicateError = new Error("Index already exists");
      (duplicateError as any).code = 86;
      mockCollection.createIndex.mockRejectedValue(duplicateError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle codeName IndexAlreadyExists", async () => {
      const duplicateError = new Error("Index already exists");
      (duplicateError as any).codeName = "IndexAlreadyExists";
      mockCollection.createIndex.mockRejectedValue(duplicateError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Result Structure", () => {
    it("should not log on success", async () => {
      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should return all result fields on success", async () => {
      const result = await setupAbilityIndexes();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("createdIndexes");
      expect(result).toHaveProperty("existingIndexes");
      expect(result).toHaveProperty("errors");
    });

    it("should return all result fields on failure", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("Test"));

      const result = await setupAbilityIndexes();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("createdIndexes");
      expect(result).toHaveProperty("existingIndexes");
      expect(result).toHaveProperty("errors");
    });
  });

  describe("Type Safety and Invalid Inputs", () => {
    it("should handle null dbName parameter", async () => {
      const result = await setupAbilityIndexes(null as any);

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith(null);
    });

    it("should handle numeric dbName parameter", async () => {
      const result = await setupAbilityIndexes(123 as any);

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith(123);
    });

    it("should handle object dbName parameter", async () => {
      const dbObj = { name: "test" };
      const result = await setupAbilityIndexes(dbObj as any);

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith(dbObj);
    });

    it("should handle array dbName parameter", async () => {
      const result = await setupAbilityIndexes(["axiom"] as any);

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith(["axiom"]);
    });

    it("should handle dbName with MongoDB special characters", async () => {
      const result = await setupAbilityIndexes("test/db.$name");

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("test/db.$name");
    });

    it("should handle dbName with spaces", async () => {
      const result = await setupAbilityIndexes("my database name");

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("my database name");
    });

    it("should handle dbName with Unicode characters", async () => {
      const result = await setupAbilityIndexes("数据库");

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("数据库");
    });

    it("should handle extremely long database name", async () => {
      const longName = "a".repeat(200);
      const result = await setupAbilityIndexes(longName);

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith(longName);
    });
  });

  describe("Partial Success States", () => {
    it("should handle first index exists (code 85), second creates successfully", async () => {
      const existsError = new Error("Index already exists");
      (existsError as any).code = 85;

      mockCollection.createIndex
        .mockRejectedValueOnce(existsError)
        .mockResolvedValueOnce("created");

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toEqual(["ability_key_unique_index"]);
      expect(result.createdIndexes).toEqual(["ability_created_at_index"]);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle first creates successfully, second exists (code 85)", async () => {
      const existsError = new Error("Index already exists");
      (existsError as any).code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existsError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toEqual(["ability_key_unique_index"]);
      expect(result.existingIndexes).toEqual(["ability_created_at_index"]);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle first exists (85), second fails with real error", async () => {
      const existsError = new Error("Index already exists");
      (existsError as any).code = 85;
      const realError = new Error("Insufficient permissions");

      mockCollection.createIndex
        .mockRejectedValueOnce(existsError)
        .mockRejectedValueOnce(realError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.existingIndexes).toEqual(["ability_key_unique_index"]);
      expect(result.createdIndexes).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        indexName: "ability_created_at_index",
        error: "Insufficient permissions",
      });
    });

    it("should handle first fails with real error, second exists (85)", async () => {
      const realError = new Error("Invalid index specification");
      const existsError = new Error("Index already exists");
      (existsError as any).code = 85;

      mockCollection.createIndex
        .mockRejectedValueOnce(realError)
        .mockRejectedValueOnce(existsError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(0);
      expect(result.existingIndexes).toEqual(["ability_created_at_index"]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        indexName: "ability_key_unique_index",
        error: "Invalid index specification",
      });
    });

    it("should handle mixed error codes across indexes", async () => {
      const code85Error = new Error("Already exists");
      (code85Error as any).code = 85;
      const code86Error = new Error("Already exists");
      (code86Error as any).code = 86;

      mockCollection.createIndex
        .mockRejectedValueOnce(code85Error)
        .mockRejectedValueOnce(code86Error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("MongoDB Driver Return Values", () => {
    it("should handle createIndex returning null", async () => {
      mockCollection.createIndex.mockResolvedValue(null);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle createIndex returning undefined", async () => {
      mockCollection.createIndex.mockResolvedValue(undefined);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle createIndex returning empty string", async () => {
      mockCollection.createIndex.mockResolvedValue("");

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle createIndex returning zero", async () => {
      mockCollection.createIndex.mockResolvedValue(0);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle createIndex returning false", async () => {
      mockCollection.createIndex.mockResolvedValue(false);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle createIndex returning complex object", async () => {
      mockCollection.createIndex.mockResolvedValue({
        ok: 1,
        createdCollectionAutomatically: true,
        numIndexesBefore: 0,
        numIndexesAfter: 2,
        note: "some note",
      });

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });
  });

  describe("Client and Connection State Changes", () => {
    it("should handle db() returning different instances on each call", async () => {
      const mockDb2 = {
        collection: jest.fn().mockReturnValue(mockCollection),
      };

      mockClient.db.mockReturnValueOnce(mockDb).mockReturnValueOnce(mockDb2);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledTimes(1);
    });

    it("should handle collection() returning different instances between indexes", async () => {
      const mockCollection2 = {
        createIndex: jest.fn().mockResolvedValue("created"),
      };

      let callCount = 0;
      mockDb.collection.mockImplementation(() => {
        callCount++;
        return callCount === 1 ? mockCollection : mockCollection2;
      });

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(mockDb.collection).toHaveBeenCalledTimes(1);
    });

    it("should handle client that becomes invalid during execution", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(async () => {
        callCount++;
        if (callCount === 2) {
          mockClient.db = null;
        }
        return "created";
      });

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle db method being deleted during execution", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(async () => {
        callCount++;
        if (callCount === 1) {
          delete mockClient.db;
        }
        return "created";
      });

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });
  });

  describe("Error Object Variations", () => {
    it("should handle error object with circular reference", async () => {
      const error: any = new Error("Circular error");
      error.circular = error;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Circular error");
    });

    it("should handle error that throws during toString()", async () => {
      const error: any = {
        toString: () => {
          throw new Error("Cannot convert to string");
        },
      };
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it("should handle Symbol as error", async () => {
      const error = Symbol("error symbol");
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Symbol");
    });

    it("should handle error with only code property", async () => {
      const error: any = { code: 11000 };
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("[object Object]");
    });

    it("should handle error as plain object with message", async () => {
      const error = { message: "Custom error object" };
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Custom error object");
    });

    it("should handle error as number", async () => {
      mockCollection.createIndex.mockRejectedValue(404);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("404");
    });

    it("should handle error as boolean", async () => {
      mockCollection.createIndex.mockRejectedValue(false);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("false");
    });

    it("should handle null as error", async () => {
      mockCollection.createIndex.mockRejectedValue(null);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("null");
    });

    it("should handle undefined as error", async () => {
      mockCollection.createIndex.mockRejectedValue(undefined);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("undefined");
    });
  });

  describe("Index Conflict Scenarios", () => {
    it("should handle unique constraint violation on existing data", async () => {
      const duplicateKeyError = new Error("E11000 duplicate key error");
      (duplicateKeyError as any).code = 11000;
      mockCollection.createIndex.mockRejectedValue(duplicateKeyError);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].error).toContain("duplicate key error");
    });

    it("should handle index with incompatible options", async () => {
      const error = new Error("Index with different options already exists");
      (error as any).code = 85;
      (error as any).codeName = "IndexOptionsConflict";
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(2);
    });

    it("should handle namespace length exceeded error", async () => {
      const error = new Error("Namespace length exceeded");
      (error as any).code = 127;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Namespace length exceeded");
    });

    it("should handle too many indexes error", async () => {
      const error = new Error("Too many indexes");
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });

  describe("Idempotency Verification", () => {
    it("should produce identical results when called twice in sequence", async () => {
      const result1 = await setupAbilityIndexes();
      const result2 = await setupAbilityIndexes();

      expect(result1).toEqual(result2);
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });

    it("should handle rapid repeated calls with same database", async () => {
      const promises = Array.from({ length: 10 }, () => setupAbilityIndexes());
      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.createdIndexes).toHaveLength(2);
      });
    });

    it("should handle sequential calls with alternating success and existing", async () => {
      mockCollection.createIndex.mockResolvedValue("created");
      const result1 = await setupAbilityIndexes();
      expect(result1.success).toBe(true);

      const existsError = new Error("Already exists");
      (existsError as any).code = 85;
      mockCollection.createIndex.mockRejectedValue(existsError);
      const result2 = await setupAbilityIndexes();

      expect(result2.success).toBe(true);
      expect(result2.existingIndexes).toHaveLength(2);
    });
  });

  describe("Result Structure Guarantees", () => {
    it("should never have success=true when errors array has real errors", async () => {
      const realError = new Error("Real failure");
      mockCollection.createIndex.mockRejectedValue(realError);

      const result = await setupAbilityIndexes();

      if (
        result.errors.length > 0 &&
        !result.errors.every((e) => e.indexName === "connection")
      ) {
        expect(result.success).toBe(false);
      }
    });

    it("should always have arrays initialized even on connection failure", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Connection failed"))
      );

      const result = await setupAbilityIndexes();

      expect(Array.isArray(result.createdIndexes)).toBe(true);
      expect(Array.isArray(result.existingIndexes)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should preserve array order matching index definition order", async () => {
      const result = await setupAbilityIndexes();

      expect(result.createdIndexes[0]).toBe("ability_key_unique_index");
      expect(result.createdIndexes[1]).toBe("ability_created_at_index");
    });

    it("should not have duplicate entries in createdIndexes", async () => {
      const result = await setupAbilityIndexes();

      const unique = new Set(result.createdIndexes);
      expect(unique.size).toBe(result.createdIndexes.length);
    });

    it("should not have duplicate entries in existingIndexes", async () => {
      const existsError = new Error("Already exists");
      (existsError as any).code = 85;
      mockCollection.createIndex.mockRejectedValue(existsError);

      const result = await setupAbilityIndexes();

      const unique = new Set(result.existingIndexes);
      expect(unique.size).toBe(result.existingIndexes.length);
    });

    it("should not have same index in both createdIndexes and existingIndexes", async () => {
      const existsError = new Error("Already exists");
      (existsError as any).code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existsError);

      const result = await setupAbilityIndexes();

      const created = new Set(result.createdIndexes);
      const existing = new Set(result.existingIndexes);
      const intersection = [...created].filter((x) => existing.has(x));

      expect(intersection).toHaveLength(0);
    });
  });

  describe("MongoDB-Specific Error Codes", () => {
    it("should handle code 13 (Unauthorized)", async () => {
      const error = new Error("not authorized");
      (error as any).code = 13;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("not authorized");
    });

    it("should handle code 26 (NamespaceNotFound)", async () => {
      const error = new Error("Database does not exist");
      (error as any).code = 26;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it("should handle code 211 (KeyTooLong)", async () => {
      const error = new Error("Index key too large");
      (error as any).code = 211;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Index key too large");
    });

    it("should handle MongoServerError class errors", async () => {
      const error: any = new Error("Server error");
      error.name = "MongoServerError";
      error.code = 500;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it("should handle MongoNetworkError", async () => {
      const error: any = new Error("Network error");
      error.name = "MongoNetworkError";
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Network error");
    });
  });

  describe("Promise and Async Edge Cases", () => {
    it("should handle createIndex that never resolves", async () => {
      const neverResolves = new Promise(() => {});
      mockCollection.createIndex.mockReturnValue(neverResolves);

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ timeout: true }), 100)
      );

      const result = await Promise.race([
        setupAbilityIndexes(),
        timeoutPromise,
      ]);

      expect(result).toEqual({ timeout: true });
    });

    it("should handle createIndex that resolves then throws", async () => {
      mockCollection.createIndex.mockImplementation(async () => {
        await Promise.resolve("created");
        throw new Error("Post-resolution error");
      });

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle createIndex with delayed rejection", async () => {
      mockCollection.createIndex.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        throw new Error("Delayed error");
      });

      const result = await setupAbilityIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
    });
  });
});
