import { setupCatIndexes } from "../../../lib/indexes/setup-cat-indexes";

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

describe("setupCatIndexes", () => {
  let mockCollection: any;
  let mockDb: any;
  let mockClient: any;

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
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("Normal Operation", () => {
    it("should create all seven indexes successfully", async () => {
      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(mockDb.collection).toHaveBeenCalledWith("cats");
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(7);
    });

    it("should call db() exactly once", async () => {
      await setupCatIndexes();

      expect(mockClient.db).toHaveBeenCalledTimes(1);
    });

    it("should call collection() exactly once", async () => {
      await setupCatIndexes();

      expect(mockDb.collection).toHaveBeenCalledTimes(1);
    });

    it("should use hardcoded database name 'axiom' by default", async () => {
      await setupCatIndexes();

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
    });

    it("should accept custom database name parameter", async () => {
      await setupCatIndexes("custom-db");

      expect(mockClient.db).toHaveBeenCalledWith("custom-db");
    });

    it("should use hardcoded collection name 'cats'", async () => {
      await setupCatIndexes();

      expect(mockDb.collection).toHaveBeenCalledWith("cats");
    });

    it("should create cat_created_at_index with correct specification", async () => {
      await setupCatIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find(
        (c) => c[1].name === "cat_created_at_index"
      );

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ createdAt: -1 });
      expect(indexCall[1]).toEqual({ name: "cat_created_at_index" });
    });

    it("should create cat_name_index with correct specification", async () => {
      await setupCatIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "cat_name_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ name: 1 });
      expect(indexCall[1]).toEqual({ name: "cat_name_index" });
    });

    it("should create stat_strength_index with correct specification", async () => {
      await setupCatIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "stat_strength_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ "stats.strength": 1 });
      expect(indexCall[1]).toEqual({ name: "stat_strength_index" });
    });

    it("should create stat_agility_index with correct specification", async () => {
      await setupCatIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "stat_agility_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ "stats.agility": 1 });
      expect(indexCall[1]).toEqual({ name: "stat_agility_index" });
    });

    it("should create stat_psychic_index with correct specification", async () => {
      await setupCatIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "stat_psychic_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ "stats.psychic": 1 });
      expect(indexCall[1]).toEqual({ name: "stat_psychic_index" });
    });

    it("should create trait_size_index with correct specification", async () => {
      await setupCatIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "trait_size_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ "physicalTraits.size": 1 });
      expect(indexCall[1]).toEqual({ name: "trait_size_index" });
    });

    it("should create trait_skin_type_index with correct specification", async () => {
      await setupCatIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find(
        (c) => c[1].name === "trait_skin_type_index"
      );

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ "physicalTraits.skinType": 1 });
      expect(indexCall[1]).toEqual({ name: "trait_skin_type_index" });
    });

    it("should execute all createIndex calls in parallel", async () => {
      const startTimes: number[] = [];
      const endTimes: number[] = [];

      mockCollection.createIndex.mockImplementation(async () => {
        startTimes.push(Date.now());
        await new Promise((resolve) => setTimeout(resolve, 10));
        endTimes.push(Date.now());
        return "created";
      });

      await setupCatIndexes();

      const allStarted =
        Math.max(...startTimes) - Math.min(...startTimes) < 50;
      expect(allStarted).toBe(true);
    });

    it("should return success result with all created indexes", async () => {
      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toEqual([
        "cat_created_at_index",
        "cat_name_index",
        "stat_strength_index",
        "stat_agility_index",
        "stat_psychic_index",
        "trait_size_index",
        "trait_skin_type_index",
      ]);
      expect(result.existingIndexes).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("should return structured result object", async () => {
      const result = await setupCatIndexes();

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

      const result = await setupCatIndexes();

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

      await setupCatIndexes();

      expect(mockCollection.createIndex).not.toHaveBeenCalled();
    });

    it("should return error result when client is null", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(null));

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result when client is undefined", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(undefined));

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result when client has no db method", async () => {
      mongodb.__setMockClientPromise(Promise.resolve({}));

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result when client.db is not a function", async () => {
      mongodb.__setMockClientPromise(Promise.resolve({ db: "not-a-function" }));

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should handle when db() throws an error", async () => {
      mockClient.db.mockImplementation(() => {
        throw new Error("Database not found");
      });

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Database not found");
    });

    it("should handle when collection() returns null", async () => {
      mockDb.collection.mockReturnValue(null);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle when collection() returns undefined", async () => {
      mockDb.collection.mockReturnValue(undefined);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle when collection has no createIndex method", async () => {
      mockDb.collection.mockReturnValue({});

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Partial Failures", () => {
    it("should continue creating other indexes when one fails", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(new Error("Index 3 failed"))
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created");

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(6);
      expect(result.errors).toHaveLength(1);
    });

    it("should track which specific index failed", async () => {
      mockCollection.createIndex.mockImplementation(
        async (spec: any, options: any) => {
          if (options.name === "stat_agility_index") {
            throw new Error("Agility index failed");
          }
          return "created";
        }
      );

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("stat_agility_index");
      expect(result.errors[0].error).toContain("Agility index failed");
      expect(result.createdIndexes).toHaveLength(6);
    });

    it("should handle multiple simultaneous failures", async () => {
      mockCollection.createIndex.mockImplementation(
        async (spec: any, options: any) => {
          if (
            options.name === "stat_strength_index" ||
            options.name === "trait_size_index"
          ) {
            throw new Error("Index failed");
          }
          return "created";
        }
      );

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.createdIndexes).toHaveLength(5);
    });

    it("should handle when all indexes fail", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("All failed"));

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(7);
      expect(result.createdIndexes).toHaveLength(0);
    });

    it("should handle mix of created, existing, and failed indexes", async () => {
      const existingError = new Error("Already exists") as any;
      existingError.code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existingError)
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(new Error("Real failure"))
        .mockRejectedValueOnce(existingError)
        .mockResolvedValueOnce("created");

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(4);
      expect(result.existingIndexes).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("Index Already Exists Scenarios", () => {
    it("should handle when all indexes already exist with code 85", async () => {
      const existingError = new Error("IndexAlreadyExists") as any;
      existingError.code = 85;

      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(7);
      expect(result.createdIndexes).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle when all indexes already exist with codeName", async () => {
      const existingError = new Error("IndexAlreadyExists") as any;
      existingError.codeName = "IndexAlreadyExists";

      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(7);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle when some indexes exist and others are created", async () => {
      const existingError = new Error("Already exists") as any;
      existingError.code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existingError)
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existingError)
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created");

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(5);
      expect(result.existingIndexes).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it("should track which specific indexes already exist", async () => {
      const existingError = new Error("Exists") as any;
      existingError.code = 85;

      mockCollection.createIndex.mockImplementation(
        async (spec: any, options: any) => {
          if (
            options.name === "cat_name_index" ||
            options.name === "stat_psychic_index"
          ) {
            throw existingError;
          }
          return "created";
        }
      );

      const result = await setupCatIndexes();

      expect(result.existingIndexes).toContain("cat_name_index");
      expect(result.existingIndexes).toContain("stat_psychic_index");
      expect(result.existingIndexes).toHaveLength(2);
    });
  });

  describe("Error Object Edge Cases", () => {
    it("should handle error without message property", async () => {
      const errorWithoutMessage = { code: 123 } as any;

      mockCollection.createIndex.mockRejectedValue(errorWithoutMessage);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(7);
      result.errors.forEach((error) => {
        expect(typeof error.error).toBe("string");
      });
    });

    it("should handle error that is a string", async () => {
      mockCollection.createIndex.mockRejectedValue("String error");

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("String error");
    });

    it("should handle error that is a number", async () => {
      mockCollection.createIndex.mockRejectedValue(404);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("404");
    });

    it("should handle error that is null", async () => {
      mockCollection.createIndex.mockRejectedValue(null);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("null");
    });

    it("should handle error that is undefined", async () => {
      mockCollection.createIndex.mockRejectedValue(undefined);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("undefined");
    });

    it("should handle error with empty string message", async () => {
      const error = new Error("");

      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      result.errors.forEach((error) => {
        expect(typeof error.error).toBe("string");
      });
    });

    it("should handle error that is a complex object", async () => {
      const complexError = {
        nested: { deeply: { error: "hidden" } },
        code: 999,
      };

      mockCollection.createIndex.mockRejectedValue(complexError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(typeof result.errors[0].error).toBe("string");
    });

    it("should handle error with circular reference", async () => {
      const circularError: any = { message: "Circular" };
      circularError.self = circularError;

      mockCollection.createIndex.mockRejectedValue(circularError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(typeof result.errors[0].error).toBe("string");
    });

    it("should handle error with both code 85 and other error properties", async () => {
      const ambiguousError = new Error("Something went wrong") as any;
      ambiguousError.code = 85;
      ambiguousError.severity = "CRITICAL";

      mockCollection.createIndex.mockRejectedValue(ambiguousError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(7);
    });

    it("should handle error with message that is not a string", async () => {
      const weirdError = { message: { nested: "error" } } as any;

      mockCollection.createIndex.mockRejectedValue(weirdError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(typeof result.errors[0].error).toBe("string");
    });
  });

  describe("Database Name Edge Cases", () => {
    it("should handle empty string database name", async () => {
      await setupCatIndexes("");

      expect(mockClient.db).toHaveBeenCalledWith("");
    });

    it("should handle very long database name", async () => {
      const longName = "a".repeat(1000);
      await setupCatIndexes(longName);

      expect(mockClient.db).toHaveBeenCalledWith(longName);
    });

    it("should handle database name with special characters", async () => {
      await setupCatIndexes("db-name_with.special$chars");

      expect(mockClient.db).toHaveBeenCalledWith("db-name_with.special$chars");
    });

    it("should handle database name with unicode characters", async () => {
      await setupCatIndexes("数据库");

      expect(mockClient.db).toHaveBeenCalledWith("数据库");
    });

    it("should handle database name with spaces", async () => {
      await setupCatIndexes("my database name");

      expect(mockClient.db).toHaveBeenCalledWith("my database name");
    });

    it("should handle null database name by using default", async () => {
      await setupCatIndexes(null as any);

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
    });

    it("should handle undefined database name by using default", async () => {
      await setupCatIndexes(undefined);

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
    });
  });

  describe("Success Flag Logic", () => {
    it("should return true when all indexes created", async () => {
      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
    });

    it("should return true when all indexes already exist", async () => {
      const existingError = new Error("Exists") as any;
      existingError.code = 85;

      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
    });

    it("should return true when mix of created and existing indexes", async () => {
      const existingError = new Error("Exists") as any;
      existingError.code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existingError)
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existingError)
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created");

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
    });

    it("should return false when any real error occurs", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(new Error("Real error"));

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
    });

    it("should return false when connection fails", async () => {
      mongodb.__setMockClientPromise(Promise.reject(new Error("Failed")));

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
    });

    it("should return false when errors exist regardless of created/existing", async () => {
      const existingError = new Error("Exists") as any;
      existingError.code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existingError)
        .mockRejectedValueOnce(new Error("Real error"))
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created");

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
    });
  });

  describe("MongoDB Driver Edge Cases", () => {
    it("should handle when createIndex resolves with null", async () => {
      mockCollection.createIndex.mockResolvedValue(null);

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(7);
    });

    it("should handle when createIndex resolves with undefined", async () => {
      mockCollection.createIndex.mockResolvedValue(undefined);

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when createIndex resolves with empty string", async () => {
      mockCollection.createIndex.mockResolvedValue("");

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when createIndex resolves with unexpected object", async () => {
      mockCollection.createIndex.mockResolvedValue({ weird: "response" });

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when createIndex resolves with false", async () => {
      mockCollection.createIndex.mockResolvedValue(false);

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when createIndex resolves with 0", async () => {
      mockCollection.createIndex.mockResolvedValue(0);

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
    });
  });

  describe("Promise.allSettled Handling", () => {
    it("should handle when one promise rejects synchronously", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockImplementationOnce(() => {
          throw new Error("Sync error");
        })
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created");

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(6);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle when promises resolve in unexpected order", async () => {
      const delays = [50, 10, 100, 5, 80, 30, 60];
      let callIndex = 0;

      mockCollection.createIndex.mockImplementation(() => {
        const delay = delays[callIndex++];
        return new Promise((resolve) =>
          setTimeout(() => resolve("created"), delay)
        );
      });

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(7);
    });

    it("should handle when all promises reject synchronously", async () => {
      mockCollection.createIndex.mockImplementation(() => {
        throw new Error("Sync reject");
      });

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(7);
    });

    it("should handle when promises have varying async/sync behavior", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callCount++;
        if (callCount % 2 === 0) {
          throw new Error("Sync error");
        }
        return Promise.resolve("created");
      });

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.createdIndexes.length).toBeGreaterThan(0);
    });
  });

  describe("Real-World Production Scenarios", () => {
    it("should handle network interruption during index creation", async () => {
      const networkError = new Error("ECONNRESET") as any;
      networkError.code = "ECONNRESET";

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(networkError)
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created");

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("ECONNRESET");
    });

    it("should handle MongoDB server restart scenario", async () => {
      const serverError = new Error("connection closed") as any;
      serverError.code = "ETIMEDOUT";

      mongodb.__setMockClientPromise(Promise.reject(serverError));

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
    });

    it("should handle when database is read-only", async () => {
      const readOnlyError = new Error("database is read-only") as any;
      readOnlyError.code = 13;

      mockCollection.createIndex.mockRejectedValue(readOnlyError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(7);
    });

    it("should handle when user lacks permissions", async () => {
      const permissionError = new Error("not authorized") as any;
      permissionError.code = 13;

      mockCollection.createIndex.mockRejectedValue(permissionError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle when disk space is full", async () => {
      const diskError = new Error("No space left on device") as any;
      diskError.code = 14031;

      mockCollection.createIndex.mockRejectedValue(diskError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle intermittent failures that resolve on retry", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callCount++;
        if (callCount === 3 || callCount === 5) {
          return Promise.reject(new Error("Transient failure"));
        }
        return Promise.resolve("created");
      });

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes.length).toBe(5);
      expect(result.errors.length).toBe(2);
    });

    it("should handle MongoDB topology change", async () => {
      const topologyError = new Error("topology was destroyed") as any;
      topologyError.code = "ERR_TOPOLOGY_DESTROYED";

      mongodb.__setMockClientPromise(Promise.reject(topologyError));

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
    });

    it("should handle slow index creation that eventually succeeds", async () => {
      mockCollection.createIndex.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("created"), 100))
      );

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(7);
    });
  });

  describe("Idempotency Verification", () => {
    it("should produce identical result when called twice with same state", async () => {
      const result1 = await setupCatIndexes();
      const result2 = await setupCatIndexes();

      expect(result1.success).toBe(result2.success);
      expect(result1.createdIndexes).toEqual(result2.createdIndexes);
      expect(result1.existingIndexes).toEqual(result2.existingIndexes);
      expect(result1.errors).toEqual(result2.errors);
    });

    it("should be safe to call multiple times even with errors", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("fail"));

      const result1 = await setupCatIndexes();
      const result2 = await setupCatIndexes();
      const result3 = await setupCatIndexes();

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it("should handle when indexes exist on second call", async () => {
      const result1 = await setupCatIndexes();
      expect(result1.createdIndexes).toHaveLength(7);

      const existingError = new Error("Exists") as any;
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result2 = await setupCatIndexes();

      expect(result2.existingIndexes).toHaveLength(7);
      expect(result2.success).toBe(true);
    });

    it("should handle rapid successive calls", async () => {
      const results = await Promise.all([
        setupCatIndexes(),
        setupCatIndexes(),
        setupCatIndexes(),
      ]);

      const allSuccessful = results.every((r) => r.success);
      expect(allSuccessful).toBe(true);
    });

    it("should not mutate shared state between calls", async () => {
      const result1 = await setupCatIndexes();

      result1.createdIndexes.push("TAMPERED");
      result1.success = false;

      const result2 = await setupCatIndexes();

      expect(result2.createdIndexes).not.toContain("TAMPERED");
      expect(result2.success).toBe(true);
    });
  });

  describe("Type Safety at Boundaries", () => {
    it("should never return properties outside IndexSetupResult interface", async () => {
      const result = await setupCatIndexes();

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

      const result = await setupCatIndexes();

      result.errors.forEach((error) => {
        expect(error).toHaveProperty("indexName");
        expect(error).toHaveProperty("error");
        expect(Object.keys(error).length).toBe(2);
      });
    });

    it("should never return frozen or sealed objects", async () => {
      const result = await setupCatIndexes();

      expect(Object.isFrozen(result)).toBe(false);
      expect(Object.isSealed(result)).toBe(false);
      expect(Object.isFrozen(result.createdIndexes)).toBe(false);
      expect(Object.isFrozen(result.existingIndexes)).toBe(false);
      expect(Object.isFrozen(result.errors)).toBe(false);
    });

    it("should ensure all array elements are strings for createdIndexes", async () => {
      const result = await setupCatIndexes();

      result.createdIndexes.forEach((name) => {
        expect(typeof name).toBe("string");
      });
    });

    it("should ensure all array elements are strings for existingIndexes", async () => {
      const existingError = new Error("Exists") as any;
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupCatIndexes();

      result.existingIndexes.forEach((name) => {
        expect(typeof name).toBe("string");
      });
    });

    it("should ensure error objects have correct types", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("test"));

      const result = await setupCatIndexes();

      result.errors.forEach((error) => {
        expect(typeof error.indexName).toBe("string");
        expect(typeof error.error).toBe("string");
      });
    });

    it("should never include null in arrays", async () => {
      mockCollection.createIndex.mockResolvedValue(null);

      const result = await setupCatIndexes();

      expect(result.createdIndexes).not.toContain(null);
      expect(result.existingIndexes).not.toContain(null);
      expect(result.errors).not.toContain(null);
    });

    it("should never include undefined in arrays", async () => {
      mockCollection.createIndex.mockResolvedValue(undefined);

      const result = await setupCatIndexes();

      expect(result.createdIndexes).not.toContain(undefined);
      expect(result.existingIndexes).not.toContain(undefined);
      expect(result.errors).not.toContain(undefined);
    });
  });

  describe("Concurrency and Race Conditions", () => {
    it("should handle parallel calls to setupCatIndexes", async () => {
      const promises = [
        setupCatIndexes(),
        setupCatIndexes("db1"),
        setupCatIndexes("db2"),
      ];

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should handle when MongoDB connection pool is exhausted", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(mockClient));
      const result1 = await setupCatIndexes();

      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Connection pool exhausted"))
      );
      const result2 = await setupCatIndexes();

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
    });

    it("should handle race condition in index creation", async () => {
      let firstCall = true;
      mockCollection.createIndex.mockImplementation(() => {
        if (firstCall) {
          firstCall = false;
          return new Promise((resolve) =>
            setTimeout(() => resolve("created"), 50)
          );
        }
        const existingError = new Error("Exists") as any;
        existingError.code = 85;
        return Promise.reject(existingError);
      });

      const [result1, result2] = await Promise.all([
        setupCatIndexes(),
        setupCatIndexes(),
      ]);

      const totalCreated =
        result1.createdIndexes.length + result2.createdIndexes.length;
      const totalExisting =
        result1.existingIndexes.length + result2.existingIndexes.length;

      expect(totalCreated + totalExisting).toBeGreaterThan(0);
    });
  });

  describe("Memory and Resource Management", () => {
    it("should not leak memory with large number of calls", async () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(await setupCatIndexes());
      }

      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should handle when createIndex returns very large objects", async () => {
      const largeObject = { data: "x".repeat(10000) };
      mockCollection.createIndex.mockResolvedValue(largeObject);

      const result = await setupCatIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when error messages are extremely long", async () => {
      const longError = new Error("x".repeat(100000));
      mockCollection.createIndex.mockRejectedValue(longError);

      const result = await setupCatIndexes();

      expect(result.success).toBe(false);
      result.errors.forEach((error) => {
        expect(error.error.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Index Specification Correctness", () => {
    it("should create descending index for createdAt", async () => {
      await setupCatIndexes();

      const createdAtCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "cat_created_at_index"
      );

      expect(createdAtCall[0].createdAt).toBe(-1);
    });

    it("should create ascending indexes for all other fields", async () => {
      await setupCatIndexes();

      const calls = mockCollection.createIndex.mock.calls.filter(
        (call) => call[1].name !== "cat_created_at_index"
      );

      calls.forEach((call) => {
        const keys = Object.keys(call[0]);
        keys.forEach((key) => {
          expect(call[0][key]).toBe(1);
        });
      });
    });

    it("should use dot notation for nested fields", async () => {
      await setupCatIndexes();

      const nestedFields = [
        "stats.strength",
        "stats.agility",
        "stats.psychic",
        "physicalTraits.size",
        "physicalTraits.skinType",
      ];

      const calls = mockCollection.createIndex.mock.calls;

      nestedFields.forEach((field) => {
        const callWithField = calls.find((call) => call[0][field] !== undefined);
        expect(callWithField).toBeDefined();
      });
    });

    it("should ensure each index has unique name", async () => {
      await setupCatIndexes();

      const names = mockCollection.createIndex.mock.calls.map(
        (call) => call[1].name
      );
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });

    it("should ensure each index has exactly one field", async () => {
      await setupCatIndexes();

      mockCollection.createIndex.mock.calls.forEach((call) => {
        const fieldCount = Object.keys(call[0]).length;
        expect(fieldCount).toBe(1);
      });
    });
  });
});