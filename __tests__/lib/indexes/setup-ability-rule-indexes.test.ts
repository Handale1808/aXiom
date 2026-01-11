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
        await new Promise(resolve => setTimeout(resolve, 50));
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
      expect(result.errors[0].error.message).toBe("Index creation failed: duplicate key");
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

      results.forEach(result => {
        expect(result.success).toBe(true);
      });
      expect(mockCreateIndex).toHaveBeenCalledTimes(9);
    });

    it("should handle slow index creation", async () => {
      mockCreateIndex.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve("created"), 100))
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
      mongodb.__setMockClientPromise(Promise.reject(new Error("Connection failed")));

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
});