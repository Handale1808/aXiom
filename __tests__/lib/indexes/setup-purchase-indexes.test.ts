import { setupPurchaseIndexes } from "../../../lib/indexes/setup-purchase-indexes";

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

describe("setupPurchaseIndexes", () => {
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
    it("should create all three indexes successfully", async () => {
      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(mockDb.collection).toHaveBeenCalledWith("purchases");
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(3);
    });

    it("should call db() exactly once", async () => {
      await setupPurchaseIndexes();

      expect(mockClient.db).toHaveBeenCalledTimes(1);
    });

    it("should call collection() exactly once", async () => {
      await setupPurchaseIndexes();

      expect(mockDb.collection).toHaveBeenCalledTimes(1);
    });

    it("should use hardcoded database name 'axiom' by default", async () => {
      await setupPurchaseIndexes();

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
    });

    it("should accept custom database name parameter", async () => {
      await setupPurchaseIndexes("custom-db");

      expect(mockClient.db).toHaveBeenCalledWith("custom-db");
    });

    it("should handle empty string database name", async () => {
      await setupPurchaseIndexes("");

      expect(mockClient.db).toHaveBeenCalledWith("");
    });

    it("should handle very long database name", async () => {
      const longName = "a".repeat(1000);
      await setupPurchaseIndexes(longName);

      expect(mockClient.db).toHaveBeenCalledWith(longName);
    });

    it("should handle database name with special characters", async () => {
      await setupPurchaseIndexes("db-name_123.test");

      expect(mockClient.db).toHaveBeenCalledWith("db-name_123.test");
    });

    it("should use hardcoded collection name 'purchases'", async () => {
      await setupPurchaseIndexes();

      expect(mockDb.collection).toHaveBeenCalledWith("purchases");
    });

    it("should create purchase_user_id_index with correct specification", async () => {
      await setupPurchaseIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find(
        (c) => c[1].name === "purchase_user_id_index"
      );

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ userId: 1 });
      expect(indexCall[1]).toEqual({ name: "purchase_user_id_index" });
    });

    it("should create purchase_purchased_at_index with correct specification", async () => {
      await setupPurchaseIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find(
        (c) => c[1].name === "purchase_purchased_at_index"
      );

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ purchasedAt: -1 });
      expect(indexCall[1]).toEqual({ name: "purchase_purchased_at_index" });
    });

    it("should create purchase_user_date_index with correct specification", async () => {
      await setupPurchaseIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find(
        (c) => c[1].name === "purchase_user_date_index"
      );

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ userId: 1, purchasedAt: -1 });
      expect(indexCall[1]).toEqual({ name: "purchase_user_date_index" });
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

      await setupPurchaseIndexes();

      const allStarted = Math.max(...startTimes) - Math.min(...startTimes) < 50;
      expect(allStarted).toBe(true);
    });

    it("should return success result with all created indexes", async () => {
      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toEqual([
        "purchase_user_id_index",
        "purchase_purchased_at_index",
        "purchase_user_date_index",
      ]);
      expect(result.existingIndexes).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("should return structured result object", async () => {
      const result = await setupPurchaseIndexes();

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
      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Connection failed"))
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toEqual([]);
      expect(result.existingIndexes).toEqual([]);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Connection failed");
    });

    it("should handle client.db() throwing error", async () => {
      mockClient.db = jest.fn().mockImplementation(() => {
        throw new Error("Database not found");
      });
      mongodb.__setMockClientPromise(Promise.resolve(mockClient));

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Database not found");
    });

    it("should handle db.collection() throwing error", async () => {
      mockDb.collection = jest.fn().mockImplementation(() => {
        throw new Error("Collection access denied");
      });
      mongodb.__setMockClientPromise(Promise.resolve(mockClient));

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
    });

    it("should handle null client", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(null));

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle undefined client", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(undefined));

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle clientPromise rejecting with non-Error object", async () => {
      mongodb.__setMockClientPromise(Promise.reject("string error"));

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("string error");
    });

    it("should handle clientPromise rejecting with null", async () => {
      mongodb.__setMockClientPromise(Promise.reject(null));

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("null");
    });

    it("should handle clientPromise rejecting with number", async () => {
      mongodb.__setMockClientPromise(Promise.reject(404));

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("404");
    });
  });

  describe("Existing Indexes", () => {
    it("should handle when all indexes already exist (error code 85)", async () => {
      const existingError = new Error("Index already exists") as any;
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toEqual([]);
      expect(result.existingIndexes).toEqual([
        "purchase_user_id_index",
        "purchase_purchased_at_index",
        "purchase_user_date_index",
      ]);
      expect(result.errors).toEqual([]);
    });

    it("should handle when all indexes already exist (error code 86)", async () => {
      const existingError = new Error("Index key specs conflict") as any;
      existingError.code = 86;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(3);
      expect(result.errors).toEqual([]);
    });

    it("should handle mixed scenario with some existing and some new indexes", async () => {
      let callNumber = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callNumber++;
        if (callNumber === 1) {
          const existingError = new Error("Exists") as any;
          existingError.code = 85;
          return Promise.reject(existingError);
        }
        return Promise.resolve("created");
      });

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(1);
      expect(result.createdIndexes).toHaveLength(2);
      expect(result.errors).toEqual([]);
    });

    it("should report success when only existing indexes found", async () => {
      const existingError = new Error("Already there") as any;
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
    });
  });

  describe("Partial Failures", () => {
    it("should continue creating other indexes when one fails", async () => {
      let callNumber = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callNumber++;
        if (callNumber === 2) {
          return Promise.reject(new Error("Index creation failed"));
        }
        return Promise.resolve("created");
      });

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(2);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("purchase_purchased_at_index");
    });

    it("should record which specific index failed", async () => {
      let callNumber = 0;
      mockCollection.createIndex.mockImplementation((spec) => {
        callNumber++;
        if (callNumber === 1) {
          return Promise.reject(new Error("userId index failed"));
        }
        return Promise.resolve("created");
      });

      const result = await setupPurchaseIndexes();

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("purchase_user_id_index");
      expect(result.errors[0].error).toContain("userId index failed");
    });

    it("should handle all indexes failing with different errors", async () => {
      let callNumber = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callNumber++;
        return Promise.reject(new Error(`Error ${callNumber}`));
      });

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toEqual([]);
      expect(result.errors).toHaveLength(3);
      expect(result.errors[0].error).toContain("Error 1");
      expect(result.errors[1].error).toContain("Error 2");
      expect(result.errors[2].error).toContain("Error 3");
    });

    it("should handle mix of created, existing, and failed indexes", async () => {
      let callNumber = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callNumber++;
        if (callNumber === 1) {
          return Promise.resolve("created");
        }
        if (callNumber === 2) {
          const existingError = new Error("Exists") as any;
          existingError.code = 85;
          return Promise.reject(existingError);
        }
        return Promise.reject(new Error("Failed"));
      });

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(1);
      expect(result.existingIndexes).toHaveLength(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe("Error Types and Edge Cases", () => {
    it("should handle Error objects with createIndex", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("Standard error")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Standard error");
    });

    it("should handle string errors from createIndex", async () => {
      mockCollection.createIndex.mockRejectedValue("string error");

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("string error");
    });

    it("should handle null errors from createIndex", async () => {
      mockCollection.createIndex.mockRejectedValue(null);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("null");
    });

    it("should handle undefined errors from createIndex", async () => {
      mockCollection.createIndex.mockRejectedValue(undefined);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("undefined");
    });

    it("should handle numeric errors from createIndex", async () => {
      mockCollection.createIndex.mockRejectedValue(500);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("500");
    });

    it("should handle object errors without message from createIndex", async () => {
      mockCollection.createIndex.mockRejectedValue({ code: 42, detail: "bad" });

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("[object Object]");
    });

    it("should handle errors with very long messages", async () => {
      const longMessage = "x".repeat(10000);
      mockCollection.createIndex.mockRejectedValue(new Error(longMessage));

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error.length).toBe(10000);
    });

    it("should handle errors with empty messages", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error(""));

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Error");
    });

    it("should handle errors with special characters", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error('Error with "quotes" and \\slashes\\ and \n newlines')
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("quotes");
    });

    it("should handle errors with unicode characters", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("Error 错误"));

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("错误");
    });
  });

  describe("Return Value Types and Nullish Values", () => {
    it("should handle createIndex returning null", async () => {
      mockCollection.createIndex.mockResolvedValue(null);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(3);
    });

    it("should handle createIndex returning undefined", async () => {
      mockCollection.createIndex.mockResolvedValue(undefined);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle createIndex returning empty string", async () => {
      mockCollection.createIndex.mockResolvedValue("");

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle createIndex returning 0", async () => {
      mockCollection.createIndex.mockResolvedValue(0);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle createIndex returning false", async () => {
      mockCollection.createIndex.mockResolvedValue(false);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle createIndex returning NaN", async () => {
      mockCollection.createIndex.mockResolvedValue(NaN);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle createIndex returning object with weird properties", async () => {
      mockCollection.createIndex.mockResolvedValue({
        [Symbol("weird")]: "value",
        null: "null",
        undefined: "undefined",
      });

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
    });
  });

  describe("MongoDB-Specific Errors", () => {
    it("should handle duplicate key error (code 11000)", async () => {
      const dupKeyError = new Error("Duplicate key") as any;
      dupKeyError.code = 11000;
      mockCollection.createIndex.mockRejectedValue(dupKeyError);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(3);
    });

    it("should handle write concern error", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("Write concern error")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle network timeout error", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("connection timed out")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("timed out");
    });

    it("should handle cursor not found error", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("cursor id not found")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle namespace not found error", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("ns not found")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
    });
  });

  describe("Concurrent Execution", () => {
    it("should handle multiple simultaneous calls independently", async () => {
      const results = await Promise.all([
        setupPurchaseIndexes(),
        setupPurchaseIndexes(),
        setupPurchaseIndexes(),
      ]);

      expect(results).toHaveLength(3);
      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.createdIndexes).toHaveLength(3);
      });
    });

    it("should maintain separate state across concurrent calls", async () => {
      // First call should succeed
      mockCollection.createIndex.mockResolvedValueOnce("created");
      mockCollection.createIndex.mockResolvedValueOnce("created");
      mockCollection.createIndex.mockResolvedValueOnce("created");

      // Second call should fail
      mockCollection.createIndex.mockRejectedValueOnce(new Error("Failed"));
      mockCollection.createIndex.mockRejectedValueOnce(new Error("Failed"));
      mockCollection.createIndex.mockRejectedValueOnce(new Error("Failed"));

      const results = await Promise.all([
        setupPurchaseIndexes(),
        setupPurchaseIndexes(),
      ]);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[0].createdIndexes).toHaveLength(3);
      expect(results[1].errors).toHaveLength(3);
    });

    it("should handle concurrent calls with different database names", async () => {
      const results = await Promise.all([
        setupPurchaseIndexes("db1"),
        setupPurchaseIndexes("db2"),
        setupPurchaseIndexes("db3"),
      ]);

      expect(mockClient.db).toHaveBeenCalledWith("db1");
      expect(mockClient.db).toHaveBeenCalledWith("db2");
      expect(mockClient.db).toHaveBeenCalledWith("db3");
    });

    it("should handle race conditions with createIndex", async () => {
      let callNumber = 0;
      mongodb.__setMockClientPromise(Promise.resolve(mockClient));

      mockCollection.createIndex.mockImplementation(() => {
        callNumber++;
        if (callNumber % 3 === 0) {
          return Promise.reject(new Error("Failed"));
        }
        if (callNumber % 3 === 1) {
          const existingError = new Error("Exists") as any;
          existingError.code = 85;
          return Promise.reject(existingError);
        }
        return Promise.resolve("created");
      });

      const results = await Promise.all([
        setupPurchaseIndexes(),
        setupPurchaseIndexes(),
        setupPurchaseIndexes(),
      ]);

      results.forEach((result) => {
        expect(result).toHaveProperty("success");
        expect(result).toHaveProperty("createdIndexes");
        expect(result).toHaveProperty("existingIndexes");
        expect(result).toHaveProperty("errors");
      });
    });
  });

  describe("Memory and Resource Management", () => {
    it("should not leak memory with large number of calls", async () => {
      const results = [];
      for (let i = 0; i < 100; i++) {
        results.push(await setupPurchaseIndexes());
      }

      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should handle when createIndex returns very large objects", async () => {
      const largeObject = { data: "x".repeat(10000) };
      mockCollection.createIndex.mockResolvedValue(largeObject);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when error messages are extremely long", async () => {
      const longError = new Error("x".repeat(100000));
      mockCollection.createIndex.mockRejectedValue(longError);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      result.errors.forEach((error) => {
        expect(error.error.length).toBeGreaterThan(0);
      });
    });

    it("should handle rapid successive calls without state pollution", async () => {
      const result1 = await setupPurchaseIndexes();

      mockCollection.createIndex.mockRejectedValue(new Error("Failed"));
      const result2 = await setupPurchaseIndexes();

      mockCollection.createIndex.mockResolvedValue("created");
      const result3 = await setupPurchaseIndexes();

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(true);

      expect(result1.errors).toHaveLength(0);
      expect(result2.errors.length).toBeGreaterThan(0);
      expect(result3.errors).toHaveLength(0);
    });

    it("should handle createIndex returning circular references", async () => {
      const circular: any = { prop: "value" };
      circular.self = circular;
      mockCollection.createIndex.mockResolvedValue(circular);

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(true);
    });
  });

  describe("Index Specification Correctness", () => {
    it("should create ascending index for userId", async () => {
      await setupPurchaseIndexes();

      const userIdCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "purchase_user_id_index"
      );

      expect(userIdCall[0].userId).toBe(1);
    });

    it("should create descending index for purchasedAt", async () => {
      await setupPurchaseIndexes();

      const purchasedAtCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "purchase_purchased_at_index"
      );

      expect(purchasedAtCall[0].purchasedAt).toBe(-1);
    });

    it("should create compound index with correct field order", async () => {
      await setupPurchaseIndexes();

      const compoundCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "purchase_user_date_index"
      );

      const keys = Object.keys(compoundCall[0]);
      expect(keys[0]).toBe("userId");
      expect(keys[1]).toBe("purchasedAt");
    });

    it("should create compound index with correct sort directions", async () => {
      await setupPurchaseIndexes();

      const compoundCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "purchase_user_date_index"
      );

      expect(compoundCall[0].userId).toBe(1);
      expect(compoundCall[0].purchasedAt).toBe(-1);
    });

    it("should ensure each index has unique name", async () => {
      await setupPurchaseIndexes();

      const names = mockCollection.createIndex.mock.calls.map(
        (call) => call[1].name
      );
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
      expect(uniqueNames.size).toBe(3);
    });

    it("should pass index name in options object", async () => {
      await setupPurchaseIndexes();

      mockCollection.createIndex.mock.calls.forEach((call) => {
        expect(call[1]).toHaveProperty("name");
        expect(typeof call[1].name).toBe("string");
      });
    });

    it("should not include extra properties in index specs", async () => {
      await setupPurchaseIndexes();

      const userIdCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "purchase_user_id_index"
      );

      expect(Object.keys(userIdCall[0])).toEqual(["userId"]);
    });

    it("should not include extra properties in index options", async () => {
      await setupPurchaseIndexes();

      mockCollection.createIndex.mock.calls.forEach((call) => {
        expect(Object.keys(call[1])).toEqual(["name"]);
      });
    });
  });

  describe("Production Reliability Scenarios", () => {
    it("should handle MongoDB server restart during operation", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callCount++;
        if (callCount === 2) {
          return Promise.reject(new Error("Connection lost"));
        }
        return Promise.resolve("created");
      });

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes.length).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle transient network failures", async () => {
      let attempt = 0;
      mockCollection.createIndex.mockImplementation(() => {
        attempt++;
        if (attempt <= 2) {
          return Promise.reject(new Error("ETIMEDOUT"));
        }
        return Promise.resolve("created");
      });

      const result = await setupPurchaseIndexes();

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should provide actionable error information", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("insufficient privileges")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      result.errors.forEach((error) => {
        expect(error.indexName).toBeTruthy();
        expect(error.error).toContain("privileges");
      });
    });

    it("should handle disk space errors gracefully", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("No space left on device")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("space");
    });

    it("should handle authentication errors", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Authentication failed"))
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Authentication");
    });

    it("should handle MongoDB version incompatibility", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("Feature not supported in this version")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("version");
    });

    it("should handle collection locking errors", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("collection is locked")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("locked");
    });

    it("should handle replica set primary step down", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("not master and slaveOk=false")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("master");
    });

    it("should handle out of memory errors", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("out of memory")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("memory");
    });

    it("should handle invalid index specification errors", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("Index key pattern cannot contain an empty string")
      );

      const result = await setupPurchaseIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("empty string");
    });
  });

  describe("Idempotency", () => {
    it("should produce same result when called multiple times sequentially", async () => {
      const result1 = await setupPurchaseIndexes();
      const result2 = await setupPurchaseIndexes();
      const result3 = await setupPurchaseIndexes();

      expect(result1).toEqual(result2);
      expect(result2).toEqual(result3);
    });

    it("should handle existing indexes on second call", async () => {
      const result1 = await setupPurchaseIndexes();
      expect(result1.success).toBe(true);
      expect(result1.createdIndexes).toHaveLength(3);

      const existingError = new Error("Already exists") as any;
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result2 = await setupPurchaseIndexes();
      expect(result2.success).toBe(true);
      expect(result2.existingIndexes).toHaveLength(3);
    });

    it("should not mutate input parameters across calls", async () => {
      const dbName = "test-db";
      await setupPurchaseIndexes(dbName);
      await setupPurchaseIndexes(dbName);

      expect(mockClient.db).toHaveBeenCalledTimes(2);
      expect(mockClient.db).toHaveBeenNthCalledWith(1, "test-db");
      expect(mockClient.db).toHaveBeenNthCalledWith(2, "test-db");
    });
  });

  describe("Type Safety and Boundary Conditions", () => {
    it("should handle database name as special MongoDB value", async () => {
      await setupPurchaseIndexes("$external");

      expect(mockClient.db).toHaveBeenCalledWith("$external");
    });

    it("should handle very short database name", async () => {
      await setupPurchaseIndexes("a");

      expect(mockClient.db).toHaveBeenCalledWith("a");
    });

    it("should handle database name with dots", async () => {
      await setupPurchaseIndexes("db.test.name");

      expect(mockClient.db).toHaveBeenCalledWith("db.test.name");
    });

    it("should handle numeric database name", async () => {
      await setupPurchaseIndexes("123");

      expect(mockClient.db).toHaveBeenCalledWith("123");
    });

    it("should return new object instances on each call", async () => {
      const result1 = await setupPurchaseIndexes();
      const result2 = await setupPurchaseIndexes();

      expect(result1).not.toBe(result2);
      expect(result1.createdIndexes).not.toBe(result2.createdIndexes);
      expect(result1.existingIndexes).not.toBe(result2.existingIndexes);
      expect(result1.errors).not.toBe(result2.errors);
    });

    it("should not share array references between calls", async () => {
      const result1 = await setupPurchaseIndexes();
      result1.createdIndexes.push("modified");

      const result2 = await setupPurchaseIndexes();

      expect(result2.createdIndexes).not.toContain("modified");
    });
  });
});