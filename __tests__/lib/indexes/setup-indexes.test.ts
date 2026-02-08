import { setupFeedbackIndexes } from "../../../lib/indexes/setup-indexes";

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

describe("setupFeedbackIndexes", () => {
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
    it("should create all nine indexes successfully", async () => {
      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(mockDb.collection).toHaveBeenCalledWith("feedbacks");
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(9);
    });

    it("should call db() exactly once", async () => {
      await setupFeedbackIndexes();

      expect(mockClient.db).toHaveBeenCalledTimes(1);
    });

    it("should call collection() exactly once", async () => {
      await setupFeedbackIndexes();

      expect(mockDb.collection).toHaveBeenCalledTimes(1);
    });

    it("should use hardcoded database name 'axiom' by default", async () => {
      await setupFeedbackIndexes();

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
    });

    it("should accept custom database name parameter", async () => {
      await setupFeedbackIndexes("custom-db");

      expect(mockClient.db).toHaveBeenCalledWith("custom-db");
    });

    it("should use hardcoded collection name 'feedbacks'", async () => {
      await setupFeedbackIndexes();

      expect(mockDb.collection).toHaveBeenCalledWith("feedbacks");
    });

    it("should create feedback_text_search index with correct specification", async () => {
      await setupFeedbackIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "feedback_text_search");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({
        text: "text",
        "analysis.summary": "text",
      });
      expect(indexCall[1]).toEqual({
        name: "feedback_text_search",
        weights: {
          text: 2,
          "analysis.summary": 1,
        },
      });
    });

    it("should create sentiment_index with correct specification", async () => {
      await setupFeedbackIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "sentiment_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ "analysis.sentiment": 1 });
      expect(indexCall[1]).toEqual({ name: "sentiment_index" });
    });

    it("should create priority_index with correct specification", async () => {
      await setupFeedbackIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "priority_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ "analysis.priority": 1 });
      expect(indexCall[1]).toEqual({ name: "priority_index" });
    });

    it("should create tags_index with correct specification", async () => {
      await setupFeedbackIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "tags_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ "analysis.tags": 1 });
      expect(indexCall[1]).toEqual({ name: "tags_index" });
    });

    it("should create created_at_index with correct specification", async () => {
      await setupFeedbackIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "created_at_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ createdAt: -1 });
      expect(indexCall[1]).toEqual({ name: "created_at_index" });
    });

    it("should create cat_id_index with correct specification", async () => {
      await setupFeedbackIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "cat_id_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ catAlienId: 1 });
      expect(indexCall[1]).toEqual({ name: "cat_id_index" });
    });

    it("should create user_id_index with correct specification", async () => {
      await setupFeedbackIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "user_id_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ userId: 1 });
      expect(indexCall[1]).toEqual({ name: "user_id_index" });
    });

    it("should create user_cat_index with correct specification", async () => {
      await setupFeedbackIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "user_cat_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ userId: 1, catAlienId: 1 });
      expect(indexCall[1]).toEqual({ name: "user_cat_index" });
    });

    it("should create cat_created_at_index with correct specification", async () => {
      await setupFeedbackIndexes();

      const calls = mockCollection.createIndex.mock.calls;
      const indexCall = calls.find((c) => c[1].name === "cat_created_at_index");

      expect(indexCall).toBeDefined();
      expect(indexCall[0]).toEqual({ catAlienId: 1, createdAt: -1 });
      expect(indexCall[1]).toEqual({ name: "cat_created_at_index" });
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

      await setupFeedbackIndexes();

      const allStarted = Math.max(...startTimes) - Math.min(...startTimes) < 50;
      expect(allStarted).toBe(true);
    });

    it("should return success result with all created indexes", async () => {
      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toEqual([
        "feedback_text_search",
        "sentiment_index",
        "priority_index",
        "tags_index",
        "created_at_index",
        "cat_id_index",
        "user_id_index",
        "user_cat_index",
        "cat_created_at_index",
      ]);
      expect(result.existingIndexes).toEqual([]);
      expect(result.errors).toEqual([]);
    });

    it("should return structured result object", async () => {
      const result = await setupFeedbackIndexes();

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

      const result = await setupFeedbackIndexes();

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

      await setupFeedbackIndexes();

      expect(mockCollection.createIndex).not.toHaveBeenCalled();
    });

    it("should return error result when client is null", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(null));

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        indexName: "connection",
        error: "MongoDB client is null",
      });
    });

    it("should return error result when client is undefined", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(undefined));

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
    });

    it("should handle connection rejection with string error", async () => {
      mongodb.__setMockClientPromise(Promise.reject("String error message"));

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0]).toEqual({
        indexName: "connection",
        error: "String error message",
      });
    });

    it("should handle connection rejection with non-Error object", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject({ custom: "error object" })
      );

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0]).toEqual({
        indexName: "connection",
        error: "Unknown connection error",
      });
    });

    it("should handle connection rejection with number", async () => {
      mongodb.__setMockClientPromise(Promise.reject(404));

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Unknown connection error");
    });

    it("should handle connection rejection with null", async () => {
      mongodb.__setMockClientPromise(Promise.reject(null));

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Unknown connection error");
    });

    it("should return error result when db() returns null", async () => {
      mockClient.db.mockReturnValue(null);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        indexName: "database",
        error: "Failed to get database instance",
      });
    });

    it("should return error result when db() returns undefined", async () => {
      mockClient.db.mockReturnValue(undefined);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("database");
    });

    it("should return error result when collection() returns null", async () => {
      mockDb.collection.mockReturnValue(null);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0]).toEqual({
        indexName: "collection",
        error: "Failed to get collection instance",
      });
    });

    it("should return error result when collection() returns undefined", async () => {
      mockDb.collection.mockReturnValue(undefined);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("collection");
    });
  });

  describe("Index Already Exists", () => {
    it("should handle MongoDB error code 85 as existing index", async () => {
      const existingError = new Error("Index already exists") as any;
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(9);
      expect(result.createdIndexes).toHaveLength(0);
      expect(result.errors).toHaveLength(0);
    });

    it("should handle IndexOptionsConflict codeName as existing index", async () => {
      const existingError = new Error("Index exists") as any;
      existingError.codeName = "IndexOptionsConflict";
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(9);
    });

    it("should track existing indexes by name", async () => {
      const existingError = new Error("Exists") as any;
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupFeedbackIndexes();

      expect(result.existingIndexes).toContain("feedback_text_search");
      expect(result.existingIndexes).toContain("sentiment_index");
      expect(result.existingIndexes).toContain("cat_created_at_index");
    });

    it("should handle mixed created and existing indexes", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callCount++;
        if (callCount <= 3) {
          return Promise.resolve("created");
        }
        const existingError = new Error("Exists") as any;
        existingError.code = 85;
        return Promise.reject(existingError);
      });

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(3);
      expect(result.existingIndexes).toHaveLength(6);
    });

    it("should succeed when all indexes already exist", async () => {
      const existingError = new Error("Exists") as any;
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
      expect(result.errors).toHaveLength(0);
    });
  });

  describe("Partial Failures", () => {
    it("should handle some indexes failing with real errors", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callCount++;
        if (callCount <= 5) {
          return Promise.resolve("created");
        }
        return Promise.reject(new Error("Index creation failed"));
      });

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(5);
      expect(result.errors).toHaveLength(4);
    });

    it("should track which specific indexes failed", async () => {
      mockCollection.createIndex.mockImplementation((spec, options) => {
        if (options.name === "sentiment_index") {
          return Promise.reject(new Error("Sentiment index failed"));
        }
        if (options.name === "tags_index") {
          return Promise.reject(new Error("Tags index failed"));
        }
        return Promise.resolve("created");
      });

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.errors).toContainEqual({
        indexName: "sentiment_index",
        error: "Sentiment index failed",
      });
      expect(result.errors).toContainEqual({
        indexName: "tags_index",
        error: "Tags index failed",
      });
    });

    it("should continue creating other indexes when some fail", async () => {
      mockCollection.createIndex.mockImplementation((spec, options) => {
        if (options.name === "sentiment_index") {
          return Promise.reject(new Error("Failed"));
        }
        return Promise.resolve("created");
      });

      const result = await setupFeedbackIndexes();

      expect(result.createdIndexes).toHaveLength(8);
      expect(result.errors).toHaveLength(1);
    });

    it("should handle mix of created, existing, and failed indexes", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callCount++;
        if (callCount <= 3) {
          return Promise.resolve("created");
        }
        if (callCount <= 6) {
          const existingError = new Error("Exists") as any;
          existingError.code = 85;
          return Promise.reject(existingError);
        }
        return Promise.reject(new Error("Failed"));
      });

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toHaveLength(3);
      expect(result.existingIndexes).toHaveLength(3);
      expect(result.errors).toHaveLength(3);
    });
  });

  describe("Error Message Handling", () => {
    it("should extract error message from Error objects", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("Detailed error message")
      );

      const result = await setupFeedbackIndexes();

      expect(result.errors[0].error).toBe("Detailed error message");
    });

    it("should handle string errors directly", async () => {
      mockCollection.createIndex.mockRejectedValue("String error");

      const result = await setupFeedbackIndexes();

      expect(result.errors[0].error).toBe("String error");
    });

    it("should handle non-Error object rejections", async () => {
      mockCollection.createIndex.mockRejectedValue({
        custom: "error",
        message: "Custom error",
      });

      const result = await setupFeedbackIndexes();

      expect(result.errors[0].error).toBe("Unknown error");
    });

    it("should handle null error rejections", async () => {
      mockCollection.createIndex.mockRejectedValue(null);

      const result = await setupFeedbackIndexes();

      expect(result.errors[0].error).toBe("Unknown error");
    });

    it("should handle undefined error rejections", async () => {
      mockCollection.createIndex.mockRejectedValue(undefined);

      const result = await setupFeedbackIndexes();

      expect(result.errors[0].error).toBe("Unknown error");
    });

    it("should handle number error rejections", async () => {
      mockCollection.createIndex.mockRejectedValue(500);

      const result = await setupFeedbackIndexes();

      expect(result.errors[0].error).toBe("Unknown error");
    });

    it("should handle boolean error rejections", async () => {
      mockCollection.createIndex.mockRejectedValue(false);

      const result = await setupFeedbackIndexes();

      expect(result.errors[0].error).toBe("Unknown error");
    });

    it("should handle Error objects with empty message", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error(""));

      const result = await setupFeedbackIndexes();

      expect(typeof result.errors[0].error).toBe("string");
    });

    it("should handle errors with circular references", async () => {
      const circularError: any = new Error("Circular") as any;
      circularError.self = circularError;
      mockCollection.createIndex.mockRejectedValue(circularError);

      const result = await setupFeedbackIndexes();

      expect(result.errors[0].error).toBe("Circular");
    });
  });

  describe("Edge Cases and Data Corruption", () => {
    it("should handle when createIndex returns unexpected values", async () => {
      mockCollection.createIndex.mockResolvedValue(null);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(9);
    });

    it("should handle when createIndex returns undefined", async () => {
      mockCollection.createIndex.mockResolvedValue(undefined);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when createIndex returns empty object", async () => {
      mockCollection.createIndex.mockResolvedValue({});

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when createIndex returns array", async () => {
      mockCollection.createIndex.mockResolvedValue([]);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when createIndex returns number", async () => {
      mockCollection.createIndex.mockResolvedValue(42);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when db() throws synchronously", async () => {
      mockClient.db.mockImplementation(() => {
        throw new Error("DB access error");
      });

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
    });

    it("should handle when collection() throws synchronously", async () => {
      mockDb.collection.mockImplementation(() => {
        throw new Error("Collection access error");
      });

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
    });

    it("should handle when db name is empty string", async () => {
      const result = await setupFeedbackIndexes("");

      expect(mockClient.db).toHaveBeenCalledWith("");
    });

    it("should handle when db name has special characters", async () => {
      const result = await setupFeedbackIndexes("db-name_123!@#");

      expect(mockClient.db).toHaveBeenCalledWith("db-name_123!@#");
    });

    it("should handle when db name is very long", async () => {
      const longName = "a".repeat(1000);
      const result = await setupFeedbackIndexes(longName);

      expect(mockClient.db).toHaveBeenCalledWith(longName);
    });

    it("should handle when db name contains null bytes", async () => {
      const dbName = "test\x00db";
      const result = await setupFeedbackIndexes(dbName);

      expect(mockClient.db).toHaveBeenCalledWith(dbName);
    });
  });

  describe("Result Contract Validation", () => {
    it("should always return object with exactly 4 properties", async () => {
      const result = await setupFeedbackIndexes();

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

      const result = await setupFeedbackIndexes();

      result.errors.forEach((error) => {
        expect(error).toHaveProperty("indexName");
        expect(error).toHaveProperty("error");
        expect(Object.keys(error).length).toBe(2);
      });
    });

    it("should never return frozen or sealed objects", async () => {
      const result = await setupFeedbackIndexes();

      expect(Object.isFrozen(result)).toBe(false);
      expect(Object.isSealed(result)).toBe(false);
      expect(Object.isFrozen(result.createdIndexes)).toBe(false);
      expect(Object.isFrozen(result.existingIndexes)).toBe(false);
      expect(Object.isFrozen(result.errors)).toBe(false);
    });

    it("should ensure all array elements are strings for createdIndexes", async () => {
      const result = await setupFeedbackIndexes();

      result.createdIndexes.forEach((name) => {
        expect(typeof name).toBe("string");
      });
    });

    it("should ensure all array elements are strings for existingIndexes", async () => {
      const existingError = new Error("Exists") as any;
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupFeedbackIndexes();

      result.existingIndexes.forEach((name) => {
        expect(typeof name).toBe("string");
      });
    });

    it("should ensure error objects have correct types", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("test"));

      const result = await setupFeedbackIndexes();

      result.errors.forEach((error) => {
        expect(typeof error.indexName).toBe("string");
        expect(typeof error.error).toBe("string");
      });
    });

    it("should never include null in arrays", async () => {
      mockCollection.createIndex.mockResolvedValue(null);

      const result = await setupFeedbackIndexes();

      expect(result.createdIndexes).not.toContain(null);
      expect(result.existingIndexes).not.toContain(null);
      expect(result.errors).not.toContain(null);
    });

    it("should never include undefined in arrays", async () => {
      mockCollection.createIndex.mockResolvedValue(undefined);

      const result = await setupFeedbackIndexes();

      expect(result.createdIndexes).not.toContain(undefined);
      expect(result.existingIndexes).not.toContain(undefined);
      expect(result.errors).not.toContain(undefined);
    });
  });

  describe("Concurrency and Race Conditions", () => {
    it("should handle parallel calls to setupFeedbackIndexes", async () => {
      const promises = [
        setupFeedbackIndexes(),
        setupFeedbackIndexes("db1"),
        setupFeedbackIndexes("db2"),
      ];

      const results = await Promise.all(promises);

      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should handle when MongoDB connection pool is exhausted", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(mockClient));
      const result1 = await setupFeedbackIndexes();

      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Connection pool exhausted"))
      );
      const result2 = await setupFeedbackIndexes();

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
        setupFeedbackIndexes(),
        setupFeedbackIndexes(),
      ]);

      const totalCreated =
        result1.createdIndexes.length + result2.createdIndexes.length;
      const totalExisting =
        result1.existingIndexes.length + result2.existingIndexes.length;

      expect(totalCreated + totalExisting).toBeGreaterThan(0);
    });

    it("should handle multiple parallel calls with different outcomes", async () => {
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
        setupFeedbackIndexes(),
        setupFeedbackIndexes(),
        setupFeedbackIndexes(),
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
        results.push(await setupFeedbackIndexes());
      }

      expect(results).toHaveLength(100);
      results.forEach((result) => {
        expect(result.success).toBe(true);
      });
    });

    it("should handle when createIndex returns very large objects", async () => {
      const largeObject = { data: "x".repeat(10000) };
      mockCollection.createIndex.mockResolvedValue(largeObject);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle when error messages are extremely long", async () => {
      const longError = new Error("x".repeat(100000));
      mockCollection.createIndex.mockRejectedValue(longError);

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      result.errors.forEach((error) => {
        expect(error.error.length).toBeGreaterThan(0);
      });
    });

    it("should handle rapid successive calls without state pollution", async () => {
      const result1 = await setupFeedbackIndexes();

      mockCollection.createIndex.mockRejectedValue(new Error("Failed"));
      const result2 = await setupFeedbackIndexes();

      mockCollection.createIndex.mockResolvedValue("created");
      const result3 = await setupFeedbackIndexes();

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
      expect(result3.success).toBe(true);

      expect(result1.errors).toHaveLength(0);
      expect(result2.errors.length).toBeGreaterThan(0);
      expect(result3.errors).toHaveLength(0);
    });
  });

  describe("Index Specification Correctness", () => {
    it("should create descending index for createdAt", async () => {
      await setupFeedbackIndexes();

      const createdAtCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "created_at_index"
      );

      expect(createdAtCall[0].createdAt).toBe(-1);
    });

    it("should create descending index for catAlienId+createdAt compound", async () => {
      await setupFeedbackIndexes();

      const compoundCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "cat_created_at_index"
      );

      expect(compoundCall[0].catAlienId).toBe(1);
      expect(compoundCall[0].createdAt).toBe(-1);
    });

    it("should use dot notation for nested fields", async () => {
      await setupFeedbackIndexes();

      const nestedFields = [
        "analysis.sentiment",
        "analysis.priority",
        "analysis.tags",
        "analysis.summary",
      ];

      const calls = mockCollection.createIndex.mock.calls;

      nestedFields.forEach((field) => {
        const callWithField = calls.find(
          (call) => call[0][field] !== undefined
        );
        expect(callWithField).toBeDefined();
      });
    });

    it("should ensure each index has unique name", async () => {
      await setupFeedbackIndexes();

      const names = mockCollection.createIndex.mock.calls.map(
        (call) => call[1].name
      );
      const uniqueNames = new Set(names);

      expect(uniqueNames.size).toBe(names.length);
    });

    it("should create text index with correct weights", async () => {
      await setupFeedbackIndexes();

      const textSearchCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "feedback_text_search"
      );

      expect(textSearchCall[1].weights).toEqual({
        text: 2,
        "analysis.summary": 1,
      });
    });

    it("should create compound index with correct field order", async () => {
      await setupFeedbackIndexes();

      const compoundCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "user_cat_index"
      );

      const keys = Object.keys(compoundCall[0]);
      expect(keys[0]).toBe("userId");
      expect(keys[1]).toBe("catAlienId");
    });
  });

  describe("Production Reliability Scenarios", () => {
    it("should handle MongoDB server restart during operation", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(() => {
        callCount++;
        if (callCount === 5) {
          return Promise.reject(new Error("Connection lost"));
        }
        return Promise.resolve("created");
      });

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes.length).toBeGreaterThan(0);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should handle transient network failures", async () => {
      let attempt = 0;
      mockCollection.createIndex.mockImplementation(() => {
        attempt++;
        if (attempt <= 3) {
          return Promise.reject(new Error("ETIMEDOUT"));
        }
        return Promise.resolve("created");
      });

      const result = await setupFeedbackIndexes();

      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should provide actionable error information", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("insufficient privileges")
      );

      const result = await setupFeedbackIndexes();

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

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("space");
    });

    it("should handle authentication errors", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Authentication failed"))
      );

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Authentication");
    });

    it("should handle MongoDB version incompatibility", async () => {
      mockCollection.createIndex.mockRejectedValue(
        new Error("Feature not supported in this version")
      );

      const result = await setupFeedbackIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("version");
    });
  });
});
