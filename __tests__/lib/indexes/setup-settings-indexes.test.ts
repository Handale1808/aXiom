import { setupSettingsIndexes } from "../../../lib/indexes/setup-settings-indexes";

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

describe("setupSettingsIndexes", () => {
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
    it("should create both indexes successfully", async () => {
      const result = await setupSettingsIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toContain("settings_key_unique_index");
      expect(result.createdIndexes).toContain("settings_updated_at_index");
      expect(result.createdIndexes).toHaveLength(2);
      expect(result.existingIndexes).toEqual([]);
      expect(result.errors).toEqual([]);

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(mockDb.collection).toHaveBeenCalledWith("settings");
      expect(mockCollection.createIndex).toHaveBeenCalledTimes(2);
    });

    it("should call db() exactly once", async () => {
      await setupSettingsIndexes();

      expect(mockClient.db).toHaveBeenCalledTimes(1);
    });

    it("should call collection() exactly once", async () => {
      await setupSettingsIndexes();

      expect(mockDb.collection).toHaveBeenCalledTimes(1);
    });

    it("should use default database name when undefined is passed", async () => {
      const result = await setupSettingsIndexes(undefined as any);

      expect(mockClient.db).toHaveBeenCalledWith("axiom");
      expect(result.success).toBe(true);
    });

    it("should accept custom database name parameter", async () => {
      await setupSettingsIndexes("custom-db");

      expect(mockClient.db).toHaveBeenCalledWith("custom-db");
    });

    it("should use hardcoded collection name 'settings'", async () => {
      await setupSettingsIndexes();

      expect(mockDb.collection).toHaveBeenCalledWith("settings");
    });

    it("should return structured result object", async () => {
      const result = await setupSettingsIndexes();

      expect(result).toHaveProperty("success");
      expect(result).toHaveProperty("createdIndexes");
      expect(result).toHaveProperty("existingIndexes");
      expect(result).toHaveProperty("errors");
      expect(Array.isArray(result.createdIndexes)).toBe(true);
      expect(Array.isArray(result.existingIndexes)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
    });

    it("should create unique index on key field", async () => {
      await setupSettingsIndexes();

      const calls = mockCollection.createIndex.mock.calls;

      const hasKeyIndex = calls.some(
        (c) =>
          JSON.stringify(c[0]) === JSON.stringify({ key: 1 }) &&
          c[1].name === "settings_key_unique_index" &&
          c[1].unique === true
      );

      expect(hasKeyIndex).toBe(true);
    });

    it("should create descending index on updatedAt field", async () => {
      await setupSettingsIndexes();

      const calls = mockCollection.createIndex.mock.calls;

      const hasUpdatedAtIndex = calls.some(
        (c) =>
          JSON.stringify(c[0]) === JSON.stringify({ updatedAt: -1 }) &&
          c[1].name === "settings_updated_at_index"
      );

      expect(hasUpdatedAtIndex).toBe(true);
    });

    it("should create indexes in expected order", async () => {
      await setupSettingsIndexes();

      const calls = mockCollection.createIndex.mock.calls;

      expect(calls[0][1].name).toBe("settings_key_unique_index");
      expect(calls[1][1].name).toBe("settings_updated_at_index");
    });
  });

  describe("Connection Failures", () => {
    it("should return error result when clientPromise rejects", async () => {
      const connectionError = new Error("Connection timeout");
      mongodb.__setMockClientPromise(Promise.reject(connectionError));

      const result = await setupSettingsIndexes();

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

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result for undefined client", async () => {
      mongodb.__setMockClientPromise(Promise.resolve(undefined));

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should return error result for client with missing db method", async () => {
      mongodb.__setMockClientPromise(Promise.resolve({}));

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid MongoDB client");
    });

    it("should not create any indexes when connection fails", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Connection failed"))
      );

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(mockCollection.createIndex).not.toHaveBeenCalled();
    });

    it("should handle non-Error rejection in clientPromise", async () => {
      mongodb.__setMockClientPromise(Promise.reject("string error"));

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("string error");
    });

    it("should handle numeric error in clientPromise", async () => {
      mongodb.__setMockClientPromise(Promise.reject(500));

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("500");
    });

    it("should handle object rejection in clientPromise", async () => {
      mongodb.__setMockClientPromise(
        Promise.reject({ code: 123, message: "custom" })
      );

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("123");
    });
  });

  describe("Database/Collection Failures", () => {
    it("should return error result when db() returns null", async () => {
      mockClient.db.mockReturnValue(null);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].indexName).toBe("connection");
      expect(result.errors[0].error).toContain("Invalid database instance");
    });

    it("should return error result when db() returns undefined", async () => {
      mockClient.db.mockReturnValue(undefined);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid database instance");
    });

    it("should return error result when db() throws synchronously", async () => {
      mockClient.db.mockImplementation(() => {
        throw new Error("Database not found");
      });

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Database not found");
    });

    it("should return error result when collection() returns null", async () => {
      mockDb.collection.mockReturnValue(null);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });

    it("should return error result when collection() returns undefined", async () => {
      mockDb.collection.mockReturnValue(undefined);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });

    it("should return error result when collection() throws", async () => {
      mockDb.collection.mockImplementation(() => {
        throw new Error("Collection access denied");
      });

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("Collection access denied");
    });

    it("should handle collection with missing createIndex method", async () => {
      mockDb.collection.mockReturnValue({});

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });

    it("should handle collection with null createIndex", async () => {
      mockDb.collection.mockReturnValue({ createIndex: null });

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Invalid collection instance");
    });
  });

  describe("Index Creation Failures", () => {
    it("should track error when first index fails", async () => {
      mockCollection.createIndex.mockRejectedValueOnce(
        new Error("Index failed")
      );

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("settings_key_unique_index");
      expect(result.errors[0].error).toBe("Index failed");
    });

    it("should track error when second index fails", async () => {
      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(new Error("Second index failed"));

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.createdIndexes).toContain("settings_key_unique_index");
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].indexName).toBe("settings_updated_at_index");
    });

    it("should continue creating indexes after first failure", async () => {
      mockCollection.createIndex
        .mockRejectedValueOnce(new Error("First failed"))
        .mockResolvedValueOnce("created");

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(1);
      expect(result.createdIndexes).toHaveLength(1);
      expect(result.createdIndexes).toContain("settings_updated_at_index");
    });

    it("should track errors for both indexes when both fail", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("All failed"));

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
      expect(result.createdIndexes).toEqual([]);
    });

    it("should handle non-Error rejection from createIndex", async () => {
      mockCollection.createIndex.mockRejectedValue("string error");

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("string error");
    });

    it("should handle null rejection from createIndex", async () => {
      mockCollection.createIndex.mockRejectedValue(null);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("null");
    });

    it("should handle undefined rejection from createIndex", async () => {
      mockCollection.createIndex.mockRejectedValue(undefined);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toBe("undefined");
    });

    it("should handle object error without message", async () => {
      mockCollection.createIndex.mockRejectedValue({ code: 999 });

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(typeof result.errors[0].error).toBe("string");
    });
  });

  describe("Index Already Exists Scenarios", () => {
    it("should detect IndexOptionsConflict error code 85", async () => {
      const error: any = new Error("Index options conflict");
      error.code = 85;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.existingIndexes).toHaveLength(2);
      expect(result.existingIndexes).toContain("settings_key_unique_index");
      expect(result.existingIndexes).toContain("settings_updated_at_index");
      expect(result.success).toBe(true);
    });

    it("should detect IndexOptionsConflict by codeName", async () => {
      const error: any = new Error("Index options conflict");
      error.codeName = "IndexOptionsConflict";
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.existingIndexes).toHaveLength(2);
      expect(result.success).toBe(true);
    });

    it("should detect IndexKeySpecsConflict error code 86", async () => {
      const error: any = new Error("Index key specs conflict");
      error.code = 86;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.existingIndexes).toHaveLength(2);
      expect(result.success).toBe(true);
    });

    it("should detect IndexKeySpecsConflict by codeName", async () => {
      const error: any = new Error("Index key specs conflict");
      error.codeName = "IndexKeySpecsConflict";
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.existingIndexes).toHaveLength(2);
      expect(result.success).toBe(true);
    });

    it("should detect duplicate key error code 11000", async () => {
      const error: any = new Error("E11000 duplicate key");
      error.code = 11000;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.existingIndexes).toHaveLength(2);
      expect(result.success).toBe(true);
    });

    it("should detect E11000 in error message", async () => {
      const error = new Error(
        "E11000 duplicate key error collection: axiom.settings"
      );
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.existingIndexes).toHaveLength(2);
      expect(result.success).toBe(true);
    });

    it("should handle mixed success and existing indexes", async () => {
      const existingError: any = new Error("Index exists");
      existingError.code = 85;

      mockCollection.createIndex
        .mockResolvedValueOnce("created")
        .mockRejectedValueOnce(existingError);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toContain("settings_key_unique_index");
      expect(result.existingIndexes).toContain("settings_updated_at_index");
    });

    it("should track all existing when called multiple times", async () => {
      const existingError: any = new Error("Exists");
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result1 = await setupSettingsIndexes();
      const result2 = await setupSettingsIndexes();

      expect(result1.existingIndexes).toHaveLength(2);
      expect(result2.existingIndexes).toHaveLength(2);
      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe("Edge Cases and Type Safety", () => {
    it("should handle createIndex returning null", async () => {
      mockCollection.createIndex.mockResolvedValue(null);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle createIndex returning undefined", async () => {
      mockCollection.createIndex.mockResolvedValue(undefined);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should handle createIndex returning empty string", async () => {
      mockCollection.createIndex.mockResolvedValue("");

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle createIndex returning number", async () => {
      mockCollection.createIndex.mockResolvedValue(42);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(true);
    });

    it("should handle empty database name", async () => {
      await setupSettingsIndexes("");

      expect(mockClient.db).toHaveBeenCalledWith("");
    });

    it("should handle database name with special characters", async () => {
      await setupSettingsIndexes("db-name_123");

      expect(mockClient.db).toHaveBeenCalledWith("db-name_123");
    });

    it("should handle very long database name", async () => {
      const longName = "a".repeat(200);
      await setupSettingsIndexes(longName);

      expect(mockClient.db).toHaveBeenCalledWith(longName);
    });

    it("should handle database name with unicode", async () => {
      await setupSettingsIndexes("データベース");

      expect(mockClient.db).toHaveBeenCalledWith("データベース");
    });

    it("should handle null as database name", async () => {
      await setupSettingsIndexes(null as any);

      expect(mockClient.db).toHaveBeenCalledWith(null);
    });
  });

  describe("MongoDB-Specific Error Codes", () => {
    it("should handle insufficient disk space error", async () => {
      const error: any = new Error("Insufficient disk space");
      error.code = 14031;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors[0].error).toContain("Insufficient disk space");
    });

    it("should handle authentication error", async () => {
      const error: any = new Error("Authentication failed");
      error.code = 18;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
      expect(result.errors).toHaveLength(2);
    });

    it("should handle network timeout error", async () => {
      const error: any = new Error("Network timeout");
      error.code = 89;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle cursor not found error", async () => {
      const error: any = new Error("Cursor not found");
      error.code = 43;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle background operation in progress error", async () => {
      const error: any = new Error("Background operation in progress");
      error.code = 12587;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle too many indexes error", async () => {
      const error: any = new Error("Too many indexes");
      error.code = 67;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle namespace not found error", async () => {
      const error: any = new Error("Namespace not found");
      error.code = 26;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle write concern error", async () => {
      const error: any = new Error("Write concern error");
      error.code = 100;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
    });

    it("should handle connection pool exhaustion", async () => {
      const error: any = new Error("Connection pool timeout");
      error.code = 9001;
      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(false);
    });
  });

  describe("Concurrent Operations", () => {
    it("should handle multiple simultaneous calls", async () => {
      const results = await Promise.all([
        setupSettingsIndexes(),
        setupSettingsIndexes(),
        setupSettingsIndexes(),
      ]);

      results.forEach((result) => {
        expect(result.success).toBe(true);
        expect(result.createdIndexes).toHaveLength(2);
      });
    });

    it("should handle race condition with connection failure", async () => {
      const promise1 = setupSettingsIndexes();

      mongodb.__setMockClientPromise(
        Promise.reject(new Error("Connection lost"))
      );

      const promise2 = setupSettingsIndexes();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(false);
    });

    it("should handle slow index creation with fast subsequent call", async () => {
      let callCount = 0;
      mockCollection.createIndex.mockImplementation(async () => {
        callCount++;
        if (callCount <= 2) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
        return "created";
      });

      const promise1 = setupSettingsIndexes();
      await new Promise((resolve) => setTimeout(resolve, 10));
      const promise2 = setupSettingsIndexes();

      const [result1, result2] = await Promise.all([promise1, promise2]);

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
    });
  });

  describe("Performance and Timing", () => {
    it("should complete within reasonable time for both indexes", async () => {
      mockCollection.createIndex.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("created"), 50))
      );

      const start = Date.now();
      await setupSettingsIndexes();
      const duration = Date.now() - start;

      expect(duration).toBeLessThan(5000);
      expect(duration).toBeGreaterThan(45);
    });

    it("should handle very slow index creation", async () => {
      mockCollection.createIndex.mockImplementation(
        () =>
          new Promise((resolve) => setTimeout(() => resolve("created"), 500))
      );

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should process indexes sequentially not in parallel", async () => {
      const timestamps: number[] = [];

      mockCollection.createIndex.mockImplementation(async () => {
        timestamps.push(Date.now());
        await new Promise((resolve) => setTimeout(resolve, 100));
        return "created";
      });

      await setupSettingsIndexes();

      expect(timestamps).toHaveLength(2);
      expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(90);
    });
  });

  describe("Client State Changes During Execution", () => {
    it("should complete successfully even if client state changes after getting collection", async () => {
      let indexCount = 0;

      mockCollection.createIndex.mockImplementation(async () => {
        indexCount++;
        if (indexCount === 1) {
          mockClient.someProperty = undefined;
        }
        return "created";
      });

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);
    });

    it("should complete successfully with captured references despite external mock changes", async () => {
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

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(true);
      expect(result.createdIndexes).toHaveLength(2);

      mockClient.db = jest.fn().mockReturnValue(originalDb);
      mockDb.collection = jest.fn().mockReturnValue(originalCollection);
    });
  });

  describe("Error Message Quality", () => {
    it("should preserve full error message for debugging", async () => {
      const detailedError = new Error(
        "Failed to create index: insufficient disk space on /data/db, " +
          "available: 100MB, required: 500MB, collection: settings"
      );
      (detailedError as any).code = 14031;

      mockCollection.createIndex.mockRejectedValue(detailedError);

      const result = await setupSettingsIndexes();

      expect(result.errors[0].error).toContain("insufficient disk space");
      expect(result.errors[0].error).toContain("100MB");
    });

    it("should include index name in error for failed index", async () => {
      const error = new Error("Index creation failed");
      (error as any).code = 67;

      mockCollection.createIndex.mockRejectedValue(error);

      const result = await setupSettingsIndexes();

      result.errors.forEach((err) => {
        expect(err.indexName).toBeTruthy();
        expect(typeof err.indexName).toBe("string");
        expect(err.indexName).toMatch(/settings_(key_unique|updated_at)_index/);
      });
    });

    it("should handle error with stack trace", async () => {
      const errorWithStack = new Error("Database error");
      errorWithStack.stack =
        "Error: Database error\n    at Object.<anonymous> (/app/index.js:10:15)";
      (errorWithStack as any).code = 50;

      mockCollection.createIndex.mockRejectedValue(errorWithStack);

      const result = await setupSettingsIndexes();

      expect(result.errors[0].error).toBeTruthy();
      expect(typeof result.errors[0].error).toBe("string");
    });

    it("should distinguish between different index failures", async () => {
      mockCollection.createIndex
        .mockRejectedValueOnce(new Error("First index error"))
        .mockRejectedValueOnce(new Error("Second index error"));

      const result = await setupSettingsIndexes();

      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].indexName).toBe("settings_key_unique_index");
      expect(result.errors[1].indexName).toBe("settings_updated_at_index");
      expect(result.errors[0].error).toBe("First index error");
      expect(result.errors[1].error).toBe("Second index error");
    });
  });

  describe("Return Value Integrity", () => {
    it("should never return undefined for any property", async () => {
      const result = await setupSettingsIndexes();

      expect(result.success).toBeDefined();
      expect(result.createdIndexes).toBeDefined();
      expect(result.existingIndexes).toBeDefined();
      expect(result.errors).toBeDefined();
    });

    it("should ensure arrays are never null", async () => {
      mockCollection.createIndex.mockRejectedValue(new Error("fail"));

      const result = await setupSettingsIndexes();

      expect(result.createdIndexes).not.toBeNull();
      expect(result.existingIndexes).not.toBeNull();
      expect(result.errors).not.toBeNull();
    });

    it("should ensure success is always boolean", async () => {
      const result = await setupSettingsIndexes();

      expect(typeof result.success).toBe("boolean");
    });

    it("should have consistent types across success and failure", async () => {
      const successResult = await setupSettingsIndexes();

      mockCollection.createIndex.mockRejectedValue(new Error("fail"));
      const failureResult = await setupSettingsIndexes();

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

    it("should not mutate return value arrays after return", async () => {
      const result = await setupSettingsIndexes();

      const originalCreated = [...result.createdIndexes];
      const originalExisting = [...result.existingIndexes];
      const originalErrors = [...result.errors];

      result.createdIndexes.push("fake-index");
      result.existingIndexes.push("fake-index");
      result.errors.push({ indexName: "fake", error: "fake" });

      const result2 = await setupSettingsIndexes();

      expect(result2.createdIndexes).toEqual(originalCreated);
      expect(result2.existingIndexes).toEqual(originalExisting);
      expect(result2.errors).toEqual(originalErrors);
    });

    it("should always return new array instances", async () => {
      const result1 = await setupSettingsIndexes();
      const result2 = await setupSettingsIndexes();

      expect(result1.createdIndexes).not.toBe(result2.createdIndexes);
      expect(result1.existingIndexes).not.toBe(result2.existingIndexes);
      expect(result1.errors).not.toBe(result2.errors);
    });
  });

  describe("Index Specification Correctness", () => {
    it("should specify ascending order for key field", async () => {
      await setupSettingsIndexes();

      const keyIndexCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "settings_key_unique_index"
      );

      expect(keyIndexCall).toBeDefined();
      expect(keyIndexCall[0]).toEqual({ key: 1 });
    });

    it("should specify descending order for updatedAt field", async () => {
      await setupSettingsIndexes();

      const updatedAtCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "settings_updated_at_index"
      );

      expect(updatedAtCall).toBeDefined();
      expect(updatedAtCall[0]).toEqual({ updatedAt: -1 });
    });

    it("should mark key index as unique", async () => {
      await setupSettingsIndexes();

      const keyIndexCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "settings_key_unique_index"
      );

      expect(keyIndexCall[1].unique).toBe(true);
    });

    it("should not mark updatedAt index as unique", async () => {
      await setupSettingsIndexes();

      const updatedAtCall = mockCollection.createIndex.mock.calls.find(
        (call) => call[1].name === "settings_updated_at_index"
      );

      expect(updatedAtCall[1].unique).toBeUndefined();
    });
  });

  describe("Idempotency", () => {
    it("should be safe to call multiple times in sequence", async () => {
      const result1 = await setupSettingsIndexes();
      const result2 = await setupSettingsIndexes();
      const result3 = await setupSettingsIndexes();

      expect(result1.success).toBe(true);
      expect(result2.success).toBe(true);
      expect(result3.success).toBe(true);
    });

    it("should handle indexes created externally between calls", async () => {
      await setupSettingsIndexes();

      const existingError: any = new Error("Index exists");
      existingError.code = 85;
      mockCollection.createIndex.mockRejectedValue(existingError);

      const result = await setupSettingsIndexes();

      expect(result.success).toBe(true);
      expect(result.existingIndexes).toHaveLength(2);
    });
  });
});