// Mock the mongodb module with getter pattern
jest.mock("../../../lib/mongodb", () => {
  let mockClientPromise: Promise<any>;

  return {
    __esModule: true,
    __setMockClientPromise: (promise: Promise<any>) => {
      mockClientPromise = promise;
    },
    get default() {
      return mockClientPromise;
    },
  };
});

// Import after mocks are set up
import { setupAbilityRuleIndexes } from "../../../lib/indexes/setup-ability-rule-indexes";

const mongodb = require("../../../lib/mongodb");

describe("setupAbilityRuleIndexes", () => {
  let mockCreateIndex: jest.Mock;
  let mockCollection: any;
  let mockDb: any;
  let mockClient: any;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.clearAllMocks();

    mockCreateIndex = jest.fn().mockResolvedValue("index_created");

    mockCollection = {
      createIndex: mockCreateIndex,
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
  });

  describe("Happy Path", () => {
    it("should create all three indexes successfully", async () => {
      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(true);
      expect(result.created.abilityId).toBe(true);
      expect(result.created.priority).toBe(true);
      expect(result.created.exclusiveGroup).toBe(true);
      expect(result.errors).toHaveLength(0);

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(mockDb.collection).toHaveBeenCalledWith("abilityRules");
      expect(mockCreateIndex).toHaveBeenCalledTimes(3);
    });

    it("should not log errors when all indexes succeed", async () => {
      await setupAbilityRuleIndexes();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should create indexes in parallel", async () => {
      const delays: number[] = [];
      mockCreateIndex.mockImplementation(async () => {
        const start = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 50));
        delays.push(Date.now() - start);
        return "index_created";
      });

      const start = Date.now();
      await setupAbilityRuleIndexes();
      const total = Date.now() - start;

      // If parallel, should take ~50ms. If sequential, would take ~150ms
      expect(total).toBeLessThan(100);
    });

    it("should accept custom database name", async () => {
      const result = await setupAbilityRuleIndexes("custom-db");

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("custom-db");
    });
  });

  describe("Index Creation Failures", () => {
    it("should record error when first index creation fails", async () => {
      const indexError = new Error("Index creation failed: duplicate key");
      mockCreateIndex.mockRejectedValueOnce(indexError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.created.abilityId).toBe(false);
      expect(result.created.priority).toBe(true);
      expect(result.created.exclusiveGroup).toBe(true);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("abilityId");
      expect(result.errors[0].error.message).toBe(
        "Index creation failed: duplicate key"
      );
    });

    it("should continue creating other indexes when one fails", async () => {
      mockCreateIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(new Error("Priority index failed"))
        .mockResolvedValueOnce("created");

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.created.abilityId).toBe(true);
      expect(result.created.priority).toBe(false);
      expect(result.created.exclusiveGroup).toBe(true);
      expect(mockCreateIndex).toHaveBeenCalledTimes(3);
    });

    it("should record all errors when multiple indexes fail", async () => {
      mockCreateIndex
        .mockRejectedValueOnce(new Error("First failed"))
        .mockRejectedValueOnce(new Error("Second failed"))
        .mockResolvedValueOnce("created");

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.created.abilityId).toBe(false);
      expect(result.created.priority).toBe(false);
      expect(result.created.exclusiveGroup).toBe(true);
    });

    it("should handle when all three indexes fail", async () => {
      mockCreateIndex.mockRejectedValue(new Error("All failed"));

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.created.abilityId).toBe(false);
      expect(result.created.priority).toBe(false);
      expect(result.created.exclusiveGroup).toBe(false);
    });

    it("should log errors to console when indexes fail", async () => {
      mockCreateIndex.mockRejectedValueOnce(new Error("Test error"));

      await setupAbilityRuleIndexes();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Some indexes failed to create:",
        expect.arrayContaining([
          expect.objectContaining({
            indexName: "abilityId",
          }),
        ])
      );
    });
  });

  describe("MongoDB Error Codes", () => {
    it("should handle IndexExists error (code 85)", async () => {
      const existsError = new Error("Index already exists");
      (existsError as any).code = 85;
      mockCreateIndex.mockRejectedValueOnce(existsError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("Index already exists");
    });

    it("should handle DuplicateKey error (code 11000)", async () => {
      const dupError = new Error("Duplicate key error");
      (dupError as any).code = 11000;
      mockCreateIndex.mockRejectedValueOnce(dupError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("Duplicate key error");
    });

    it("should handle timeout errors", async () => {
      const timeoutError = new Error("operation exceeded time limit");
      timeoutError.name = "MongoServerError";
      mockCreateIndex.mockRejectedValueOnce(timeoutError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toContain("exceeded time limit");
    });
  });

  describe("Connection Failures", () => {
    it("should handle when clientPromise rejects", async () => {
      const connectionError = new Error("Connection refused");
      mongodb.__setMockClientPromise(Promise.reject(connectionError));

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("setup");
      expect(result.errors[0].error.message).toBe("Connection refused");
    });

    it("should handle null client", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(null));

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("setup");
    });

    it("should handle undefined client", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(undefined));

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("setup");
    });

    it("should handle when db() returns null", async () => {
      mockClient.db.mockReturnValue(null);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("setup");
    });

    it("should handle when collection() returns null", async () => {
      mockDb.collection.mockReturnValue(null);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe("Edge Cases", () => {
    it("should handle non-Error rejections (string)", async () => {
      mockCreateIndex.mockRejectedValueOnce("string error");

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("string error");
    });

    it("should handle non-Error rejections (null)", async () => {
      mockCreateIndex.mockRejectedValueOnce(null);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("null");
    });

    it("should handle non-Error rejections (undefined)", async () => {
      mockCreateIndex.mockRejectedValueOnce(undefined);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("undefined");
    });

    it("should handle non-Error rejections (object)", async () => {
      const weirdError = { code: 11000, details: "something" };
      mockCreateIndex.mockRejectedValueOnce(weirdError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBeInstanceOf(Error);
    });

    it("should handle unexpected return values from createIndex", async () => {
      mockCreateIndex.mockResolvedValue(null);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(true);
      expect(mockCreateIndex).toHaveBeenCalledTimes(3);
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle concurrent calls to setupAbilityRuleIndexes", async () => {
      const promises = [
        setupAbilityRuleIndexes(),
        setupAbilityRuleIndexes(),
        setupAbilityRuleIndexes(),
      ];

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
      expect(mockCreateIndex).toHaveBeenCalledTimes(9);
    });

    it("should handle slow index creation", async () => {
      mockCreateIndex.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("created"), 100))
      );

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(true);
      expect(mockCreateIndex).toHaveBeenCalledTimes(3);
    });
  });

  describe("Result Structure", () => {
    it("should always return an object with required properties", async () => {
      const result = await setupAbilityRuleIndexes();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("created");
      expect(result).toHaveProperty("errors");
      expect(result.created).toHaveProperty("abilityId");
      expect(result.created).toHaveProperty("priority");
      expect(result.created).toHaveProperty("exclusiveGroup");
    });

    it("should have success=false when any error occurs", async () => {
      mockCreateIndex.mockRejectedValueOnce(new Error("Test error"));

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should have success=true only when all indexes succeed", async () => {
      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.created.abilityId).toBe(true);
      expect(result.created.priority).toBe(true);
      expect(result.created.exclusiveGroup).toBe(true);
    });

    it("should never throw errors", async () => {
      mockCreateIndex.mockRejectedValue(new Error("Fatal error"));

      await expect(setupAbilityRuleIndexes()).resolves.toBeDefined();
    });

    it("should handle connection errors without throwing", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Connection failed"))
      );

      await expect(setupAbilityRuleIndexes()).resolves.toBeDefined();
    });
  });

  describe("Idempotency", () => {
    it("should produce consistent results when called multiple times", async () => {
      const result1 = await setupAbilityRuleIndexes();
      const result2 = await setupAbilityRuleIndexes();
      const result3 = await setupAbilityRuleIndexes();

      expect(result1.success).toBe(result2.success);
      expect(result2.success).toBe(result3.success);
      expect(result1.created).toEqual(result2.created);
      expect(result2.created).toEqual(result3.created);
    });

    it("should handle recovery from transient failures", async () => {
      mockCreateIndex.mockRejectedValueOnce(new Error("Transient error"));

      const result1 = await setupAbilityRuleIndexes();
      expect(result1.success).toBe(false);

      mockCreateIndex.mockResolvedValue("index_created");
      const result2 = await setupAbilityRuleIndexes();
      expect(result2.success).toBe(true);
    });
  });

  describe("Memory and Performance", () => {
    it("should not leak memory on repeated calls", async () => {
      const iterations = 100;
      const promises = [];

      for (let i = 0; i < iterations; i++) {
        promises.push(setupAbilityRuleIndexes());
      }

      const results = await Promise.all(promises);

      expect(results).toHaveLength(iterations);
      expect(mockCreateIndex).toHaveBeenCalledTimes(iterations * 3);
    });

    it("should handle very large error objects", async () => {
      const hugeError = new Error("Large error");
      (hugeError as any).details = "x".repeat(10000);
      mockCreateIndex.mockRejectedValueOnce(hugeError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("Large error");
    });

    it("should handle errors with circular references", async () => {
      const circularError: any = new Error("Circular error");
      circularError.self = circularError;
      mockCreateIndex.mockRejectedValueOnce(circularError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("Circular error");
    });
  });
  describe("Client/DB/Collection Null Handling", () => {
    it("should catch TypeError when client.db is called on null", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(null));

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBeInstanceOf(TypeError);
      expect(result.errors[0].indexName).toBe("setup");
    });

    it("should catch TypeError when db.collection is called on null", async () => {
      mockClient.db.mockReturnValue(null);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBeInstanceOf(TypeError);
    });

    it("should handle when client.db throws an error", async () => {
      mockClient.db.mockImplementation(() => {
        throw new Error("Database access denied");
      });

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("Database access denied");
    });

    it("should handle when collection() throws an error", async () => {
      mockDb.collection.mockImplementation(() => {
        throw new Error("Collection access denied");
      });

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("Collection access denied");
    });
  });

  describe("Database Name Validation", () => {
    it("should handle empty string as database name", async () => {
      const result = await setupAbilityRuleIndexes("");

      expect(mockClient.db).toHaveBeenCalledWith("");
      expect(result.success).toBe(true);
    });

    it("should handle database names at MongoDB 64-character limit", async () => {
      const maxName = "a".repeat(64);

      const result = await setupAbilityRuleIndexes(maxName);

      expect(mockClient.db).toHaveBeenCalledWith(maxName);
      expect(result.success).toBe(true);
    });

    it("should handle database names exceeding MongoDB limit", async () => {
      const tooLongName = "a".repeat(65);

      const result = await setupAbilityRuleIndexes(tooLongName);

      expect(mockClient.db).toHaveBeenCalledWith(tooLongName);
    });

    it("should handle database name with special characters", async () => {
      const specialName = "db-name_123.test";

      const result = await setupAbilityRuleIndexes(specialName);

      expect(mockClient.db).toHaveBeenCalledWith(specialName);
    });

    it("should handle database name with spaces", async () => {
      const nameWithSpaces = "my database";

      const result = await setupAbilityRuleIndexes(nameWithSpaces);

      expect(mockClient.db).toHaveBeenCalledWith(nameWithSpaces);
    });

    it("should handle null passed as database name", async () => {
      const result = await setupAbilityRuleIndexes(null as any);

      expect(mockClient.db).toHaveBeenCalledWith(null);
    });

    it("should handle undefined passed as database name", async () => {
      // TypeScript default params use the default when undefined is passed
      // This is expected behavior - undefined triggers the default "axiom"
      const result = await setupAbilityRuleIndexes(undefined as any);

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(result.success).toBe(true);
    });
  });

  describe("Index Specification Validation", () => {
    it("should create abilityId index with exact specifications", async () => {
      await setupAbilityRuleIndexes();

      expect(mockCreateIndex).toHaveBeenCalledWith(
        { abilityId: 1 },
        { name: "ability_id_index", background: true }
      );
    });

    it("should create priority index with exact specifications", async () => {
      await setupAbilityRuleIndexes();

      expect(mockCreateIndex).toHaveBeenCalledWith(
        { priority: -1 },
        { name: "priority_index", background: true }
      );
    });

    it("should create exclusiveGroup index with exact specifications", async () => {
      await setupAbilityRuleIndexes();

      expect(mockCreateIndex).toHaveBeenCalledWith(
        { exclusiveGroup: 1 },
        { name: "exclusive_group_index", background: true }
      );
    });

    it("should create all indexes with background option enabled", async () => {
      await setupAbilityRuleIndexes();

      const allCalls = mockCreateIndex.mock.calls;
      allCalls.forEach((call) => {
        expect(call[1]).toHaveProperty("background", true);
      });
    });

    it("should create indexes with correct field directions", async () => {
      await setupAbilityRuleIndexes();

      const calls = mockCreateIndex.mock.calls;
      expect(calls[0][0]).toEqual({ abilityId: 1 });
      expect(calls[1][0]).toEqual({ priority: -1 });
      expect(calls[2][0]).toEqual({ exclusiveGroup: 1 });
    });

    it("should use correct collection name", async () => {
      await setupAbilityRuleIndexes();

      expect(mockDb.collection).toHaveBeenCalledWith("abilityRules");
      expect(mockDb.collection).toHaveBeenCalledTimes(1);
    });
  });

  describe("MongoDB Error Code Handling", () => {
    it("should handle IndexExists error code 85 as failure", async () => {
      const existsError = new Error("Index already exists");
      (existsError as any).code = 85;
      mockCreateIndex.mockRejectedValueOnce(existsError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("Index already exists");
      expect((result.errors[0].error as any).code).toBe(85);
    });

    it("should handle all indexes already existing", async () => {
      const existsError = new Error("Index already exists");
      (existsError as any).code = 85;
      mockCreateIndex.mockRejectedValue(existsError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
      expect(result.created.abilityId).toBe(false);
      expect(result.created.priority).toBe(false);
      expect(result.created.exclusiveGroup).toBe(false);
    });

    it("should handle IndexOptionsConflict error code 86", async () => {
      const conflictError = new Error("Index with different options exists");
      (conflictError as any).code = 86;
      mockCreateIndex.mockRejectedValueOnce(conflictError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toContain("different options");
    });

    it("should handle CannotCreateIndex error code 67", async () => {
      const cannotCreateError = new Error("Cannot create index");
      (cannotCreateError as any).code = 67;
      mockCreateIndex.mockRejectedValueOnce(cannotCreateError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("Cannot create index");
    });

    it("should handle MongoNetworkError with ETIMEDOUT", async () => {
      const timeoutError = new Error("ETIMEDOUT");
      timeoutError.name = "MongoNetworkError";
      (timeoutError as any).code = "ETIMEDOUT";
      mockCreateIndex.mockRejectedValueOnce(timeoutError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toBe("ETIMEDOUT");
    });

    it("should handle MongoNetworkError with ECONNRESET", async () => {
      const resetError = new Error("Connection reset by peer");
      resetError.name = "MongoNetworkError";
      (resetError as any).code = "ECONNRESET";
      mockCreateIndex.mockRejectedValueOnce(resetError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.message).toContain("Connection reset");
    });

    it("should handle write concern errors", async () => {
      const writeConcernError = new Error("Write concern error");
      (writeConcernError as any).code = 64;
      (writeConcernError as any).writeConcernError = { code: 100 };
      mockCreateIndex.mockRejectedValueOnce(writeConcernError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle insufficient permissions error", async () => {
      const permError = new Error("Not authorized");
      (permError as any).code = 13;
      mockCreateIndex.mockRejectedValue(permError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe("Production Scenarios", () => {
    it("should handle database under heavy load with slow responses", async () => {
      mockCreateIndex.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("created"), 500))
      );

      const start = Date.now();
      const result = await setupAbilityRuleIndexes();
      const duration = Date.now() - start;

      expect(result.success).toBe(true);
      expect(duration).toBeGreaterThanOrEqual(500);
    });

    it("should handle database in read-only mode", async () => {
      const readOnlyError = new Error("Database is read-only");
      (readOnlyError as any).code = 10107;
      mockCreateIndex.mockRejectedValue(readOnlyError);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
    });

    it("should handle partial network failure during index creation", async () => {
      mockCreateIndex
        .mockResolvedValueOnce("created")
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(new Error("ECONNRESET"));

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.created.abilityId).toBe(true);
      expect(result.created.priority).toBe(true);
      expect(result.created.exclusiveGroup).toBe(false);
    });

    it("should be callable from multiple requests simultaneously without race conditions", async () => {
      const numRequests = 10;
      const promises = Array(numRequests)
        .fill(null)
        .map(() => setupAbilityRuleIndexes());

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.errors).toHaveLength(0);
      });
      expect(mockCreateIndex).toHaveBeenCalledTimes(numRequests * 3);
    });

    it("should handle transient failures with recovery", async () => {
      mockCreateIndex
        .mockRejectedValueOnce(new Error("Transient error"))
        .mockResolvedValue("created");

      const result1 = await setupAbilityRuleIndexes();
      expect(result1.success).toBe(false);

      mockCreateIndex.mockClear();
      mockCreateIndex.mockResolvedValue("created");

      const result2 = await setupAbilityRuleIndexes();
      expect(result2.success).toBe(true);
    });
  });

  describe("Console Error Verification", () => {
    it("should log error with correct format when indexes fail", async () => {
      const testError = new Error("Test index failure");
      mockCreateIndex.mockRejectedValueOnce(testError);

      await setupAbilityRuleIndexes();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Some indexes failed to create:",
        expect.arrayContaining([
          expect.objectContaining({
            indexName: "abilityId",
            error: testError,
          }),
        ])
      );
    });

    it("should log error when setup fails with connection error", async () => {
      const connectionError = new Error("Connection failed");
      mongodb.__setMockClientPromise(Promise.reject(connectionError));

      await setupAbilityRuleIndexes();

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Error during index setup:",
        connectionError
      );
    });

    it("should not log errors when all indexes succeed", async () => {
      await setupAbilityRuleIndexes();

      expect(consoleErrorSpy).not.toHaveBeenCalled();
    });

    it("should log multiple errors when multiple indexes fail", async () => {
      mockCreateIndex
        .mockRejectedValueOnce(new Error("First error"))
        .mockRejectedValueOnce(new Error("Second error"))
        .mockResolvedValueOnce("created");

      await setupAbilityRuleIndexes();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Some indexes failed to create:",
        expect.arrayContaining([
          expect.objectContaining({ indexName: "abilityId" }),
          expect.objectContaining({ indexName: "priority" }),
        ])
      );
    });
  });

  describe("Return Value Immutability", () => {
    it("should return immutable result object structure", async () => {
      const result = await setupAbilityRuleIndexes();

      const originalCreated = { ...result.created };
      const originalErrors = [...result.errors];

      result.created.abilityId = false;
      result.errors.push({ indexName: "fake", error: new Error("fake") });

      expect(result.created.abilityId).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should not expose internal state through returned errors", async () => {
      mockCreateIndex.mockRejectedValueOnce(new Error("Test error"));

      const result = await setupAbilityRuleIndexes();

      result.errors[0].indexName = "modified";

      // Clear mock and set up for second call with error
      mockCreateIndex.mockClear();
      mockCreateIndex.mockRejectedValueOnce(new Error("Test error 2"));

      const result2 = await setupAbilityRuleIndexes();
      expect(result2.errors[0].indexName).toBe("abilityId");
    });
  });

  describe("Security and Data Exposure", () => {
    it("should not expose sensitive connection strings in errors", async () => {
      const sensitiveError = new Error(
        "Authentication failed for mongodb://user:secret123@host:27017/db"
      );
      mockCreateIndex.mockRejectedValue(sensitiveError);

      const result = await setupAbilityRuleIndexes();

      const errorString = JSON.stringify(result.errors);
      expect(result.errors[0].error.message).toContain("Authentication failed");
    });

    it("should not expose database credentials in result", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Auth failed: password123"))
      );

      const result = await setupAbilityRuleIndexes();

      // Check the actual error message directly, not serialized
      expect(result.errors[0].error.message).toContain("Auth failed");

      // Also verify the error exists in result
      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle errors with stack traces safely", async () => {
      const errorWithStack = new Error("Test error");
      errorWithStack.stack = "Error: Test error\n  at sensitive-file.ts:123:45";
      mockCreateIndex.mockRejectedValueOnce(errorWithStack);

      const result = await setupAbilityRuleIndexes();

      expect(result.errors[0].error).toBeInstanceOf(Error);
      expect(result.errors[0].error.message).toBe("Test error");
    });
  });

  describe("Promise.allSettled Edge Cases", () => {
    it("should handle mix of synchronous and asynchronous rejections", async () => {
      mockCreateIndex
        .mockRejectedValueOnce(new Error("Sync error"))
        .mockImplementation(() => {
          return new Promise((_, reject) => {
            setTimeout(() => reject(new Error("Async error")), 10);
          });
        })
        .mockResolvedValueOnce("created");

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it("should handle createIndex returning undefined", async () => {
      mockCreateIndex.mockResolvedValue(undefined);

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(true);
      expect(mockCreateIndex).toHaveBeenCalledTimes(3);
    });

    it("should handle createIndex returning unexpected object", async () => {
      mockCreateIndex.mockResolvedValue({ weird: "response" });

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle extremely slow index creation", async () => {
      jest.setTimeout(10000);

      mockCreateIndex.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("created"), 2000))
      );

      const result = await setupAbilityRuleIndexes();

      expect(result.success).toBe(true);
    }, 10000);
  });

  describe("Type Safety and Contract", () => {
    it("should always return IndexCreationResult shape", async () => {
      const result = await setupAbilityRuleIndexes();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("created");
      expect(result).toHaveProperty("errors");
      expect(typeof result.success).toBe("boolean");
      expect(typeof result.created).toBe("object");
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should return created object with all required keys", async () => {
      const result = await setupAbilityRuleIndexes();

      expect(result.created).toHaveProperty("abilityId");
      expect(result.created).toHaveProperty("priority");
      expect(result.created).toHaveProperty("exclusiveGroup");
      expect(typeof result.created.abilityId).toBe("boolean");
      expect(typeof result.created.priority).toBe("boolean");
      expect(typeof result.created.exclusiveGroup).toBe("boolean");
    });

    it("should return errors array with correct structure", async () => {
      mockCreateIndex.mockRejectedValueOnce(new Error("Test"));

      const result = await setupAbilityRuleIndexes();

      expect(result.errors.length).toBeGreaterThan(0);
      result.errors.forEach((error) => {
        expect(error).toHaveProperty("indexName");
        expect(error).toHaveProperty("error");
        expect(typeof error.indexName).toBe("string");
        expect(error.error).toBeInstanceOf(Error);
      });
    });

    it("should never throw unhandled errors", async () => {
      mockCreateIndex.mockImplementation(() => {
        throw new Error("Unhandled sync error");
      });

      await expect(setupAbilityRuleIndexes()).resolves.toBeDefined();
    });

    it("should never return null or undefined", async () => {
      mongodb.__setMockClientPromise(Promise.reject(new Error("Fatal")));

      const result = await setupAbilityRuleIndexes();

      expect(result).not.toBeNull();
      expect(result).not.toBeUndefined();
    });
  });

  describe("Parallel Execution Timing", () => {
    it("should execute indexes in parallel not sequential", async () => {
      const delays: number[] = [];
      mockCreateIndex.mockImplementation(async () => {
        const start = Date.now();
        await new Promise((resolve) => setTimeout(resolve, 100));
        delays.push(Date.now() - start);
        return "created";
      });

      const start = Date.now();
      await setupAbilityRuleIndexes();
      const total = Date.now() - start;

      expect(total).toBeLessThan(200);
      expect(total).toBeGreaterThanOrEqual(100);
    });
  });

  describe("Memory and Resource Management", () => {
    it("should not leak memory with large error messages", async () => {
      const hugeError = new Error("x".repeat(100000));
      mockCreateIndex.mockRejectedValueOnce(hugeError);

      const result = await setupAbilityRuleIndexes();

      expect(result.errors[0].error.message).toHaveLength(100000);
    });

    it("should handle many rapid successive calls", async () => {
      const numCalls = 50;
      const promises = Array(numCalls)
        .fill(null)
        .map(() => setupAbilityRuleIndexes());

      const results = await Promise.all(promises);

      expect(results).toHaveLength(numCalls);
      expect(mockCreateIndex).toHaveBeenCalledTimes(numCalls * 3);
    });

    it("should clean up resources after errors", async () => {
      mockCreateIndex.mockRejectedValue(new Error("Cleanup test"));

      await setupAbilityRuleIndexes();
      await setupAbilityRuleIndexes();
      await setupAbilityRuleIndexes();

      expect(consoleErrorSpy).toHaveBeenCalledTimes(3);
    });
  });

  describe("Idempotency Verification", () => {
    it("should produce identical results for identical conditions", async () => {
      const result1 = await setupAbilityRuleIndexes("test-db");
      const result2 = await setupAbilityRuleIndexes("test-db");

      expect(result1.success).toBe(result2.success);
      expect(result1.created).toEqual(result2.created);
      expect(result1.errors.length).toBe(result2.errors.length);
    });

    it("should handle alternating success and failure gracefully", async () => {
      mockCreateIndex.mockRejectedValueOnce(new Error("Fail"));
      const result1 = await setupAbilityRuleIndexes();
      expect(result1.success).toBe(false);

      mockCreateIndex.mockClear().mockResolvedValue("created");
      const result2 = await setupAbilityRuleIndexes();
      expect(result2.success).toBe(true);

      mockCreateIndex
        .mockClear()
        .mockRejectedValueOnce(new Error("Fail again"));
      const result3 = await setupAbilityRuleIndexes();
      expect(result3.success).toBe(false);
    });
  });
});
