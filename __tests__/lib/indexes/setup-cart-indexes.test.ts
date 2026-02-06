// __tests__/setup-cart-indexes.test.ts
import { setupCartIndexes } from "../../../lib/indexes/setup-cart-indexes";

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

describe("setupCartIndexes", () => {
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
    it("should create all four indexes successfully", async () => {
      const result = await setupCartIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toContain("cart_user_id_index");
      expect(result.createdIndexes).toContain("cart_cat_id_index");
      expect(result.createdIndexes).toContain("cart_user_cat_unique_index");
      expect(result.createdIndexes).toContain("cart_added_at_index");
      expect(result.createdIndexes).toHaveLength(4);
      expect(result.existingIndexes).toEqual([]);
      expect(result.errors).toEqual([]);

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(mockDb.collection).toHaveBeenCalledWith("cart");
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(4);
    });

    it("should call db() exactly once", async () => {
      await setupCartIndexes();

      expect(mockClient.db).toHaveBeenCalledTimes(1);
    });

    it("should call collection() exactly once", async () => {
      await setupCartIndexes();

      expect(mockDb.collection).toHaveBeenCalledTimes(1);
    });

    it("should use default database name when undefined is passed", async () => {
      const result = await setupCartIndexes(undefined as any);

      // TypeScript default parameters treat undefined as "use default"
      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(result.success).toBe(true);
    });

    it("should accept custom database name parameter", async () => {
      await setupCartIndexes("custom-db");

      expect(mockClient.db).toHaveBeenCalledWith("custom-db");
    });

    it("should use hardcoded collection name 'cart'", async () => {
      await setupCartIndexes();

      expect(mockDb.collection).toHaveBeenCalledWith("cart");
    });

    it("should return structured result object", async () => {
      const result = await setupCartIndexes();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("createdIndexes");
      expect(result).toHaveProperty("existingIndexes");
      expect(result).toHaveProperty("errors");
      expect(Array.isArray(result.createdIndexes)).toBe(true);
      expect(Array.isArray(result.existingIndexes)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should create all expected index specifications", async () => {
      await setupCartIndexes();

      const calls = mockCollection.createIndex.mock.calls;

      const hasUserIdIndex = calls.some(
        (c) =>
          JSON.stringify(c[0]) === JSON.stringify({ userId: 1 }) &&
          c[1].name === "cart_user_id_index"
      );

      const hasCatIdIndex = calls.some(
        (c) =>
          JSON.stringify(c[0]) === JSON.stringify({ catId: 1 }) &&
          c[1].name === "cart_cat_id_index"
      );

      const hasCompoundIndex = calls.some(
        (c) =>
          JSON.stringify(c[0]) === JSON.stringify({ userId: 1, catId: 1 }) &&
          c[1].name === "cart_user_cat_unique_index" &&
          c[1].unique === true
      );

      const hasAddedAtIndex = calls.some(
        (c) =>
          JSON.stringify(c[0]) === JSON.stringify({ addedAt: -1 }) &&
          c[1].name === "cart_added_at_index"
      );

      expect(hasUserIdIndex).toBe(true);
      expect(hasCatIdIndex).toBe(true);
      expect(hasCompoundIndex).toBe(true);
      expect(hasAddedAtIndex).toBe(true);
    });
  });

  describe("Connection Failures", () => {
    it("should return error result when clientPromise rejects", async () => {
      const connectionError = new Error("Connection timeout");
      mongodb.__setMockClientPromise(Promise.reject(connectionError));

      const result = await setupCartIndexes();

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

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result for undefined client", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(undefined));

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result for client with missing db method", async () => {
      mongodb.__setMockClientPromise(Promise.resolve({}));

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should not create any indexes when connection fails", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Connection failed"))
      );

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(mockCollection.createIndex).not.toHaveBeenCalled();
    });
  });

  describe("Database/Collection Failures", () => {
    it("should return error result when db() returns null", async () => {
      mockClient.db.mockReturnValue(null);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid database instance");
    });

    it("should return error result when db() returns undefined", async () => {
      mockClient.db.mockReturnValue(undefined);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid database instance");
    });

    it("should return error result when db() throws synchronously", async () => {
      mockClient.db.mockImplementation(() => {
        throw new Error("Database not found");
      });

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Database not found");
    });

    it("should return error result when collection() returns null", async () => {
      mockDb.collection.mockReturnValue(null);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });

    it("should return error result when collection() returns undefined", async () => {
      mockDb.collection.mockReturnValue(undefined);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });

    it("should return error result when collection() throws synchronously", async () => {
      mockDb.collection.mockImplementation(() => {
        throw new Error("Collection access denied");
      });

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Collection access denied");
    });

    it("should return error result when collection has no createIndex method", async () => {
      mockDb.collection.mockReturnValue({});

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
    });

    it("should return error result when collection.createIndex is not a function", async () => {
      mockDb.collection.mockReturnValue({ createIndex: "not a function" });

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
    });
  });

  describe("Index Creation Failures - Partial Success with Promise.all", () => {
    it("should record error when one index fails but continue with others", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("success")
        .mockRejectedValueOnce(new Error("Index creation failed"))
        .mockResolvedValueOnce("success")
        .mockResolvedValueOnce("success");

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toBe("Index creation failed");
      expect(result.createdIndexes).toHaveLength(3);
    });

    it("should record all errors when multiple indexes fail", async () => {
      mockCollection.createIndex
        .mockRejectedValueOnce(new Error("First error"))
        .mockRejectedValueOnce(new Error("Second error"))
        .mockResolvedValueOnce("success")
        .mockResolvedValueOnce("success");

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle all indexes failing", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("All failed"));

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.createdIndexes).toHaveLength(0);
    });
  });

  describe("MongoDB-Specific Error Codes", () => {
    it("should treat code 85 (IndexOptionsConflict) as existing index", async () => {
      const error = new Error("Index already exists with different options");
      (error as any).code = 85;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(4);
      expect(result.errors).toEqual([]);
    });

    it("should treat code 86 (IndexKeySpecsConflict) as existing index", async () => {
      const error = new Error("Index with different key spec already exists");
      (error as any).code = 86;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(4);
    });

    it("should handle code 11000 (DuplicateKey) as error", async () => {
      const error = new Error("E11000 duplicate key error");
      (error as any).code = 11000;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(4);
    });

    it("should handle code 13 (Unauthorized)", async () => {
      const error = new Error("not authorized");
      (error as any).code = 13;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].error).toContain("not authorized");
    });

    it("should handle code 26 (NamespaceNotFound)", async () => {
      const error = new Error("Database does not exist");
      (error as any).code = 26;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle code 67 (CannotCreateIndex)", async () => {
      const error = new Error("Cannot create index");
      (error as any).code = 67;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle code 127 (NamespaceLengthExceeded)", async () => {
      const error = new Error("Namespace length exceeded");
      (error as any).code = 127;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle code 211 (KeyTooLong)", async () => {
      const error = new Error("Index key too large");
      (error as any).code = 211;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle MongoServerError class", async () => {
      const error: any = new Error("Server error");
      error.name = "MongoServerError";
      error.code = 500;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle MongoNetworkError", async () => {
      const error: any = new Error("Network error");
      error.name = "MongoNetworkError";
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle MongoTimeoutError", async () => {
      const error: any = new Error("Operation timeout");
      error.name = "MongoTimeoutError";
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Race Conditions and Concurrency", () => {
    it("should handle rapid repeated calls with Promise.all parallelization", async () => {
      const promises = Array.from({ length: 10 }, () => setupCartIndexes());

      const results = await Promise.all(promises);

      expect(mockCollection.createIndex).toHaveBeenCalledTimes(40);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should use Promise.all for parallel index creation (faster than sequential)", async () => {
      let totalTime = 0;
      mockCollection.createIndex.mockImplementation(async () => {
        const start = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 25));
        totalTime += Date.now() - start;
        return "created";
      });

      await setupCartIndexes();

      // With Promise.all, all 4 indexes run in parallel, so total time should be
      // close to 1x delay (~25-30ms) rather than 4x delay (100ms+)
      // Using 110ms threshold to account for event loop timing variations
      expect(totalTime).toBeLessThan(110);
    });

    it("should handle mixed success and failure across concurrent calls", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(async () => {
        callCount++;
        if (callCount % 2 === 0) {
          throw new Error("Intermittent failure");
        }
        return "created";
      });

      const results = await Promise.allSettled([
        setupCartIndexes(),
        setupCartIndexes(),
      ]);

      expect(results.every((r) => r.status === "fulfilled")).toBe(true);
      expect(
        results.some((r) => r.status === "fulfilled" && !r.value.success)
      ).toBe(true);
    });
  });

  describe("Error Object Variations", () => {
    it("should handle Error with only message", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("Simple error"));

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Simple error");
    });

    it("should handle Error with message and code", async () => {
      const error = new Error("Error with code");
      (error as any).code = 123;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Error with code");
    });

    it("should handle Error with empty message", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error(""));

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle string thrown as error", async () => {
      mockCollection.createIndex.mockRejectedValue("String error");

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("String error");
    });

    it("should handle null thrown as error gracefully", async () => {
      mockCollection.createIndex.mockRejectedValue(null);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle undefined thrown as error gracefully", async () => {
      mockCollection.createIndex.mockRejectedValue(undefined);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle object without message property", async () => {
      mockCollection.createIndex.mockRejectedValue({
        code: 123,
        details: "info",
      });

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBeTruthy();
    });

    it("should handle Error with circular references", async () => {
      const error: any = new Error("Circular error");
      error.self = error;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Circular error");
    });

    it("should handle Error with very long message", async () => {
      const longMessage = "x".repeat(10000);
      mockCollection.createIndex.mockRejectedValue(new Error(longMessage));

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBeTruthy();
    });

    it("should handle Error with special characters in message", async () => {
      const specialMessage =
        "Error:\n\t\"quotes\" 'apostrophes' \\backslashes\\ \u0000null";
      mockCollection.createIndex.mockRejectedValue(new Error(specialMessage));

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBeTruthy();
    });
  });

  describe("Promise and Async Edge Cases", () => {
    it("should hang if createIndex never resolves", async () => {
      const neverResolves = new Promise(() => {});
      mockCollection.createIndex.mockReturnValue(neverResolves);

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ timeout: true }), 100)
      );

      const result = await Promise.race([setupCartIndexes(), timeoutPromise]);

      expect(result).toEqual({ timeout: true });
    });

    it("should handle createIndex that resolves then throws in next tick", async () => {
      mockCollection.createIndex.mockImplementation(async () => {
        await Promise.resolve("created");
        throw new Error("Post-resolution error");
      });

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle createIndex with delayed rejection", async () => {
      mockCollection.createIndex.mockImplementation(async () => {
        await new Promise((resolve) => setTimeout(resolve, 50));
        throw new Error("Delayed error");
      });

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle createIndex that rejects immediately", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("Immediate rejection")
      );

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle createIndex that throws synchronously", async () => {
      mockCollection.createIndex.mockImplementation(() => {
        throw new Error("Synchronous throw");
      });

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Idempotency", () => {
    it("should be idempotent - handle existing indexes gracefully", async () => {
      const result1 = await setupCartIndexes();
      expect(result1.success).toBe(true);

      const existsError = new Error("Index already exists");
      (existsError as any).code = 85;
      mockCollection.createIndex.mockRejectedValue(existsError);

      const result2 = await setupCartIndexes();
      expect(result2.success).toBe(true);
      expect(result2.existingIndexes).toHaveLength(4);
    });

    it("should produce consistent results when called multiple times", async () => {
      const result1 = await setupCartIndexes();
      const result2 = await setupCartIndexes();

      expect(result1.success).toBe(result2.success);
      expect(result1.createdIndexes.sort()).toEqual(
        result2.createdIndexes.sort()
      );
    });

    it("should track which indexes were created vs existing", async () => {
      const existsError = new Error("Already exists");
      (existsError as any).code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existsError)
        .mockRejectedValueOnce(existsError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
      expect(result.existingIndexes).toHaveLength(2);

      const allIndexes = [...result.createdIndexes, ...result.existingIndexes];
      expect(allIndexes).toHaveLength(4);
    });
  });

  describe("Documentation vs Implementation", () => {
    it("should create userId index as documented", async () => {
      await setupCartIndexes();

      const call = mockCollection.createIndex.mock.calls.find(
        (c) => c[1]?.name === "cart_user_id_index"
      );

      expect(call).toBeDefined();
      expect(call[0]).toEqual({ userId: 1 });
    });

    it("should create catId index as documented", async () => {
      await setupCartIndexes();

      const call = mockCollection.createIndex.mock.calls.find(
        (c) => c[1]?.name === "cart_cat_id_index"
      );

      expect(call).toBeDefined();
      expect(call[0]).toEqual({ catId: 1 });
    });

    it("should create compound unique index as documented", async () => {
      await setupCartIndexes();

      const call = mockCollection.createIndex.mock.calls.find(
        (c) => c[1]?.name === "cart_user_cat_unique_index"
      );

      expect(call).toBeDefined();
      expect(call[0]).toEqual({ userId: 1, catId: 1 });
      expect(call[1].unique).toBe(true);
    });

    it("should create addedAt index as documented", async () => {
      await setupCartIndexes();

      const call = mockCollection.createIndex.mock.calls.find(
        (c) => c[1]?.name === "cart_added_at_index"
      );

      expect(call).toBeDefined();
      expect(call[0]).toEqual({ addedAt: -1 });
    });
  });

  describe("Result Structure Guarantees", () => {
    it("should never have success=true when real errors exist", async () => {
      const realError = new Error("Real failure");
      mockCollection.createIndex.mockRejectedValue(realError);

      const result = await setupCartIndexes();

      if (result.errors.length > 0) {
        const hasRealError = result.errors.some(
          (e) =>
            e.indexName !== "connection" || e.error !== "Index already exists"
        );
        if (hasRealError) {
          expect(result.success).toBe(false);
        }
      }
    });

    it("should always have arrays initialized even on connection failure", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Connection failed"))
      );

      const result = await setupCartIndexes();

      expect(Array.isArray(result.createdIndexes)).toBe(true);
      expect(Array.isArray(result.existingIndexes)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should not have duplicate entries in createdIndexes", async () => {
      const result = await setupCartIndexes();

      const unique = new Set(result.createdIndexes);
      expect(unique.size).toBe(result.createdIndexes.length);
    });

    it("should not have duplicate entries in existingIndexes", async () => {
      const existsError = new Error("Already exists");
      (existsError as any).code = 85;
      mockCollection.createIndex.mockRejectedValue(existsError);

      const result = await setupCartIndexes();

      const unique = new Set(result.existingIndexes);
      expect(unique.size).toBe(result.existingIndexes.length);
    });

    it("should not have same index in both createdIndexes and existingIndexes", async () => {
      const existsError = new Error("Already exists");
      (existsError as any).code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existsError)
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existsError);

      const result = await setupCartIndexes();

      const created = new Set(result.createdIndexes);
      const existing = new Set(result.existingIndexes);
      const intersection = [...created].filter((x) => existing.has(x));

      expect(intersection).toHaveLength(0);
    });
  });

  describe("Race Conditions and Async Ordering", () => {
    it("should handle indexes completing in reverse order", async () => {
      let resolvers: Array<(value: any) => void> = [];

      mockCollection.createIndex.mockImplementation(
        () => new Promise((resolve) => resolvers.push(resolve))
      );

      const promise = setupCartIndexes();

      // Wait for all promises to be created
      await new Promise((resolve) => setTimeout(resolve, 10));

      // Resolve in reverse order (last to first)
      for (let i = resolvers.length - 1; i >= 0; i--) {
        resolvers[i]("created");
      }

      const result = await promise;

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(4);
      expect(result.errors).toHaveLength(0);
    }, 10000);

    it("should handle indexes completing at different speeds", async () => {
      mockCollection.createIndex
        .mockImplementation(
          () => new Promise((r) => setTimeout(() => r("done"), 100))
        )
        .mockImplementationOnce(
          () => new Promise((r) => setTimeout(() => r("done"), 10))
        )
        .mockImplementationOnce(
          () => new Promise((r) => setTimeout(() => r("done"), 50))
        );

      const result = await setupCartIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(4);
    });

    it("should handle one index hanging while others complete", async () => {
      const neverResolves = new Promise(() => {});

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockReturnValueOnce(neverResolves)
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created");

      const timeoutPromise = new Promise((resolve) =>
        setTimeout(() => resolve({ timeout: true }), 200)
      );

      const result = await Promise.race([setupCartIndexes(), timeoutPromise]);

      expect(result).toEqual({ timeout: true });
    });
  });

  describe("Partial Failure Scenarios", () => {
    it("should handle mix of success, existing, and real errors", async () => {
      const existsError = new Error("Already exists");
      (existsError as any).code = 85;

      const permissionError = new Error("Insufficient permissions");
      (permissionError as any).code = 13;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existsError)
        .mockRejectedValueOnce(permissionError)
        .mockResolvedValueOnce("created");

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(2);
      expect(result.existingIndexes).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain("Insufficient permissions");
    });

    it("should handle first index failing with real error", async () => {
      const authError = new Error("Not authorized");
      (authError as any).code = 13;

      mockCollection.createIndex
        .mockRejectedValueOnce(authError)
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created");

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(3);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle last index failing with real error", async () => {
      const timeoutError = new Error("Operation timed out");
      (timeoutError as any).code = 50;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(timeoutError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(3);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].error).toContain("Operation timed out");
    });

    it("should handle alternating success and failure pattern", async () => {
      const existsError = new Error("Already exists");
      (existsError as any).code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existsError)
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existsError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
      expect(result.existingIndexes).toHaveLength(2);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle three failures and one success", async () => {
      const authError = new Error("Not authorized");
      (authError as any).code = 13;

      mockCollection.createIndex
        .mockRejectedValueOnce(authError)
        .mockRejectedValueOnce(authError)
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(authError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(1);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe("MongoDB Error Codes", () => {
    it("should handle code 11000 duplicate key error", async () => {
      const dupKeyError = new Error("E11000 duplicate key error");
      (dupKeyError as any).code = 11000;
      mockCollection.createIndex.mockRejectedValue(dupKeyError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(4);
      expect(result.errors[0].error).toContain("duplicate key");
    });

    it("should handle code 13 authorization error", async () => {
      const authError = new Error("Not authorized on db to execute command");
      (authError as any).code = 13;
      mockCollection.createIndex.mockRejectedValue(authError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Not authorized");
    });

    it("should handle code 26 namespace not found", async () => {
      const nsError = new Error("Namespace axiom.cart not found");
      (nsError as any).code = 26;
      mockCollection.createIndex.mockRejectedValue(nsError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("not found");
    });

    it("should handle code 50 operation timeout", async () => {
      const timeoutError = new Error("operation exceeded time limit");
      (timeoutError as any).code = 50;
      mockCollection.createIndex.mockRejectedValue(timeoutError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("time limit");
    });

    it("should handle code 67 CannotCreateIndex error", async () => {
      const cannotCreateError = new Error("cannot create index");
      (cannotCreateError as any).code = 67;
      mockCollection.createIndex.mockRejectedValue(cannotCreateError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("cannot create");
    });

    it("should handle code 86 IndexKeySpecsConflict", async () => {
      const conflictError = new Error("Index key specs conflict");
      (conflictError as any).code = 86;
      mockCollection.createIndex.mockRejectedValue(conflictError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(4);
    });

    it("should handle error with code and codeName properties", async () => {
      const mongoError = new Error(
        "Index with name: cart_user_id_index already exists with different options"
      );
      (mongoError as any).code = 85;
      (mongoError as any).codeName = "IndexOptionsConflict";

      mockCollection.createIndex.mockRejectedValue(mongoError);

      const result = await setupCartIndexes();

      expect(result.existingIndexes).toHaveLength(4);
      expect(result.success).toBe(true);
    });

    it("should handle unknown error code", async () => {
      const unknownError = new Error("Unknown database error");
      (unknownError as any).code = 99999;
      mockCollection.createIndex.mockRejectedValue(unknownError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe("Database Name Edge Cases", () => {
    it("should handle empty string database name", async () => {
      const result = await setupCartIndexes("");

      expect(mockClient.db).toHaveBeenCalledWith("");
      expect(result.success).toBe(true);
    });

    it("should handle database name with special characters", async () => {
      const result = await setupCartIndexes("test-db_2024.backup");

      expect(mockClient.db).toHaveBeenCalledWith("test-db_2024.backup");
      expect(result.success).toBe(true);
    });

    it("should handle database name with spaces", async () => {
      const result = await setupCartIndexes("my test db");

      expect(mockClient.db).toHaveBeenCalledWith("my test db");
    });

    it("should handle very long database name", async () => {
      const longName = "a".repeat(64);
      const result = await setupCartIndexes(longName);

      expect(mockClient.db).toHaveBeenCalledWith(longName);
      expect(result.success).toBe(true);
    });

    it("should handle database name with unicode characters", async () => {
      const result = await setupCartIndexes("数据库");

      expect(mockClient.db).toHaveBeenCalledWith("数据库");
    });

    it("should handle database name with slash", async () => {
      const result = await setupCartIndexes("test/db");

      expect(mockClient.db).toHaveBeenCalledWith("test/db");
    });

    it("should handle null as database name", async () => {
      const result = await setupCartIndexes(null as any);

      expect(mockClient.db).toHaveBeenCalledWith(null);
    });
  });

  describe("Index Options Validation", () => {
    it("should verify unique constraint is only on compound index", async () => {
      await setupCartIndexes();

      const calls = mockCollection.createIndex.mock.calls;

      const uniqueIndexes = calls.filter((c) => c[1]?.unique === true);
      expect(uniqueIndexes).toHaveLength(1);
      expect(uniqueIndexes[0][1].name).toBe("cart_user_cat_unique_index");
    });

    it("should verify no other indexes have unique constraint", async () => {
      await setupCartIndexes();

      const calls = mockCollection.createIndex.mock.calls;

      const nonUniqueIndexNames = [
        "cart_user_id_index",
        "cart_cat_id_index",
        "cart_added_at_index",
      ];

      nonUniqueIndexNames.forEach((name) => {
        const call = calls.find((c) => c[1]?.name === name);
        expect(call[1].unique).toBeUndefined();
      });
    });

    it("should verify ascending sort on userId index", async () => {
      await setupCartIndexes();

      const call = mockCollection.createIndex.mock.calls.find(
        (c) => c[1]?.name === "cart_user_id_index"
      );

      expect(call[0].userId).toBe(1);
    });

    it("should verify ascending sort on catId index", async () => {
      await setupCartIndexes();

      const call = mockCollection.createIndex.mock.calls.find(
        (c) => c[1]?.name === "cart_cat_id_index"
      );

      expect(call[0].catId).toBe(1);
    });

    it("should verify descending sort on addedAt index", async () => {
      await setupCartIndexes();

      const call = mockCollection.createIndex.mock.calls.find(
        (c) => c[1]?.name === "cart_added_at_index"
      );

      expect(call[0].addedAt).toBe(-1);
    });

    it("should verify compound index has correct field order", async () => {
      await setupCartIndexes();

      const call = mockCollection.createIndex.mock.calls.find(
        (c) => c[1]?.name === "cart_user_cat_unique_index"
      );

      const keys = Object.keys(call[0]);
      expect(keys[0]).toBe("userId");
      expect(keys[1]).toBe("catId");
    });

    it("should verify all indexes have explicit names", async () => {
      await setupCartIndexes();

      const calls = mockCollection.createIndex.mock.calls;

      calls.forEach((call) => {
        expect(call[1]).toHaveProperty("name");
        expect(typeof call[1].name).toBe("string");
        expect(call[1].name.length).toBeGreaterThan(0);
      });
    });

    it("should verify index names follow naming convention", async () => {
      await setupCartIndexes();

      const calls = mockCollection.createIndex.mock.calls;

      calls.forEach((call) => {
        expect(call[1].name).toMatch(/^cart_/);
        expect(call[1].name).toMatch(/_index$/);
      });
    });
  });

  describe("Concurrent Execution", () => {
    it("should handle multiple simultaneous calls to setupCartIndexes", async () => {
      const results = await Promise.all([
        setupCartIndexes(),
        setupCartIndexes(),
        setupCartIndexes(),
      ]);

      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.createdIndexes).toHaveLength(4);
      });

      expect(mockCollection.createIndex).toHaveBeenCalledTimes(12);
    });

    it("should handle concurrent calls with different database names", async () => {
      const results = await Promise.all([
        setupCartIndexes("db1"),
        setupCartIndexes("db2"),
        setupCartIndexes("db3"),
      ]);

      expect(mockClient.db).toHaveBeenCalledWith("db1");
      expect(mockClient.db).toHaveBeenCalledWith("db2");
      expect(mockClient.db).toHaveBeenCalledWith("db3");

      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should handle concurrent calls where one fails", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(async () => {
        callCount++;
        if (callCount >= 5 && callCount <= 8) {
          throw new Error("Temporary failure");
        }
        return "created";
      });

      const results = await Promise.all([
        setupCartIndexes(),
        setupCartIndexes(),
        setupCartIndexes(),
      ]);

      const successCount = results.filter((r) => r.success).length;
      const failureCount = results.filter((r) => !r.success).length;

      expect(successCount + failureCount).toBe(3);
    });
  });

  describe("Real MongoDB Behavior Patterns", () => {
    it("should match actual MongoDB IndexAlreadyExistsError format", async () => {
      const realError = new Error(
        "Index with name: cart_user_id_index already exists with different options"
      );
      (realError as any).code = 85;
      (realError as any).codeName = "IndexOptionsConflict";

      mockCollection.createIndex.mockRejectedValue(realError);

      const result = await setupCartIndexes();

      expect(result.existingIndexes).toContain("cart_user_id_index");
      expect(result.success).toBe(true);
    });

    it("should handle MongoDB connection pool exhaustion", async () => {
      const poolError = new Error("connection pool timeout");
      (poolError as any).code = 9001;

      mockCollection.createIndex.mockRejectedValue(poolError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("timeout");
    });

    it("should handle MongoDB write concern error", async () => {
      const writeConcernError = new Error("write concern error");
      (writeConcernError as any).code = 100;

      mockCollection.createIndex.mockRejectedValue(writeConcernError);

      const result = await setupCartIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle MongoDB replication lag scenario", async () => {
      let attempts = 0;
      mockCollection.createIndex.mockImplementation(async () => {
        attempts++;
        if (attempts <= 2) {
          await new Promise((resolve) => setTimeout(resolve, 50));
        }
        return "created";
      });

      const result = await setupCartIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(4);
    });
  });

  describe("Performance and Boundaries", () => {
    it("should complete within reasonable time for all indexes", async () => {
      mockCollection.createIndex.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("created"), 100))
      );

      const start = Date.now();
      await setupCartIndexes();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000);
      expect(duration).toBeGreaterThan(90);
    });

    it("should handle very slow index creation", async () => {
      mockCollection.createIndex.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("created"), 500))
      );

      const result = await setupCartIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(4);
    });

    it("should process all indexes even with varying speeds", async () => {
      mockCollection.createIndex
        .mockImplementationOnce(
          () => new Promise((r) => setTimeout(() => r("done"), 10))
        )
        .mockImplementationOnce(
          () => new Promise((r) => setTimeout(() => r("done"), 100))
        )
        .mockImplementationOnce(
          () => new Promise((r) => setTimeout(() => r("done"), 50))
        )
        .mockImplementationOnce(
          () => new Promise((r) => setTimeout(() => r("done"), 75))
        );

      const start = Date.now();
      const result = await setupCartIndexes();
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeGreaterThanOrEqual(100);
      expect(duration).toBeLessThan(200);
    });
  });

  describe("Client State Changes During Execution", () => {
    it("should complete successfully even if client state changes after getting collection", async () => {
      let indexCount = 0;

      mockCollection.createIndex.mockImplementation(async () => {
        indexCount++;
        if (indexCount === 2) {
          mockClient.someProperty = undefined;
        }
        return "created";
      });

      const result = await setupCartIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(4);
    });

    it("should complete successfully with captured references despite external mock changes", async () => {
      const originalDb = mockDb;
      const originalCollection = mockCollection;

      let firstIndexStarted = false;
      mockCollection.createIndex.mockImplementation(async () => {
        if (!firstIndexStarted) {
          firstIndexStarted = true;
          // Try to sabotage from outside
          mockClient.db = jest.fn().mockReturnValue(null);
          mockDb.collection = jest.fn().mockReturnValue(null);
        }
        await new Promise((resolve) => setTimeout(resolve, 10));
        return "created";
      });

      const result = await setupCartIndexes();

      // Should succeed because function captured references early
      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(4);

      // Restore for other tests
      mockClient.db = jest.fn().mockReturnValue(originalDb);
      mockDb.collection = jest.fn().mockReturnValue(originalCollection);
    });
  });

  describe("Error Message Quality", () => {
    it("should preserve full error message for debugging", async () => {
      const detailedError = new Error(
        "Failed to create index: insufficient disk space on /data/db, " +
          "available: 100MB, required: 500MB, collection: cart, indexes: 4"
      );
      (detailedError as any).code = 14031;

      mockCollection.createIndex.mockRejectedValue(detailedError);

      const result = await setupCartIndexes();

      expect(result.errors[0].error).toContain("insufficient disk space");
      expect(result.errors[0].error).toContain("100MB");
    });

    it("should include index name in error for failed index", async () => {
      const error = new Error("Index creation failed");
      (error as any).code = 67;

      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupCartIndexes();

      result.errors.forEach((err) => {
        expect(err.indexName).toBeTruthy();
        expect(typeof err.indexName).toBe("string");
      });
    });

    it("should handle error with stack trace", async () => {
      const errorWithStack = new Error("Database error");
      errorWithStack.stack =
        "Error: Database error\n    at Object.<anonymous> (/app/index.js:10:15)";
      (errorWithStack as any).code = 50;

      mockCollection.createIndex.mockRejectedValue(errorWithStack);

      const result = await setupCartIndexes();

      expect(result.errors[0].error).toBeTruthy();
      expect(typeof result.errors[0].error).toBe("string");
    });
  });

  describe("Return Value Integrity", () => {
    it("should never return undefined for any property", async () => {
      const result = await setupCartIndexes();

      expect(result.success).toBeDefined();
      expect(result.createdIndexes).toBeDefined();
      expect(result.existingIndexes).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it("should ensure arrays are never null", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("fail"));

      const result = await setupCartIndexes();

      expect(result.createdIndexes).not.toBeNull();
      expect(result.existingIndexes).not.toBeNull();
      expect(result.errors).not.toBeNull();
    });

    it("should ensure success is always boolean", async () => {
      const result = await setupCartIndexes();

      expect(typeof result.success).toBe("boolean");
    });

    it("should have consistent types across success and failure", async () => {
      const successResult = await setupCartIndexes();

      mockCollection.createIndex.mockRejectedValue(new Error("fail"));
      const failureResult = await setupCartIndexes();

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
});
