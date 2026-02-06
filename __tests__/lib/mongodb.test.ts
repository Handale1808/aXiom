// __tests__/lib/mongodb.test.ts

const mockConnect = jest.fn();
const mockClose = jest.fn();
const mockDb = jest.fn();
const mockAdmin = jest.fn();
const mockPing = jest.fn();
const mockMongoClientInstances: any[] = [];

class MockMongoClient {
  constructor(
    public uri: string,
    public options?: any
  ) {
    mockMongoClientInstances.push(this);
  }

  connect = mockConnect;
  close = mockClose;
  db = mockDb;
}

jest.mock("mongodb", () => ({
  MongoClient: MockMongoClient,
}));

describe("lib/mongodb.ts", () => {
  const originalEnv = { ...process.env };

  function cleanupGlobalMongo() {
    const globalWithMongo = global as typeof globalThis & {
      _mongoClientPromise?: Promise<any>;
    };
    delete globalWithMongo._mongoClientPromise;
  }

  function importMongodbModule() {
    jest.resetModules();
    return require("@/lib/mongodb").default;
  }

  function setupMocks(config?: {
    connectShouldSucceed?: boolean;
    connectError?: Error;
    connectDelay?: number;
  }) {
    const shouldSucceed = config?.connectShouldSucceed ?? true;

    mockConnect.mockImplementation(function (this: any) {
      const delay = config?.connectDelay || 0;
      const error = config?.connectError || new Error("Mock connection failed");

      return new Promise((resolve, reject) => {
        setTimeout(() => {
          shouldSucceed ? resolve(this) : reject(error);
        }, delay);
      });
    });

    mockClose.mockResolvedValue(undefined);
    mockDb.mockReturnValue({ admin: mockAdmin });
    mockAdmin.mockReturnValue({ ping: mockPing });
    mockPing.mockResolvedValue({ ok: 1 });
  }

  function resetMocks() {
    mockConnect.mockClear();
    mockClose.mockClear();
    mockDb.mockClear();
    mockAdmin.mockClear();
    mockPing.mockClear();
    mockConnect.mockImplementation(function (this: any) {
      return Promise.resolve(this);
    });
    mockClose.mockResolvedValue(undefined);
    mockDb.mockReturnValue({
      admin: mockAdmin,
    });
    mockAdmin.mockReturnValue({
      ping: mockPing,
    });
    mockPing.mockResolvedValue({ ok: 1 });
    mockMongoClientInstances.length = 0;
  }

  beforeEach(() => {
    jest.resetModules();
    resetMocks();
    cleanupGlobalMongo();
    process.env = { ...originalEnv };
    setupMocks();
  });

  afterEach(() => {
    cleanupGlobalMongo();
    jest.resetModules();
    process.env = originalEnv;
  });

  describe("Environment Variable Validation", () => {
    it("should throw error when MONGODB_URI is missing", () => {
      delete process.env.MONGODB_URI;

      expect(() => {
        importMongodbModule();
      }).toThrow("Please add your MONGODB_URI to .env.local");
    });

    it("should throw when MONGODB_URI is empty string because empty string is falsy", () => {
      process.env.MONGODB_URI = "";

      expect(() => {
        importMongodbModule();
      }).toThrow("Please add your MONGODB_URI to .env.local");
    });

    it("should use the MONGODB_URI from environment", () => {
      process.env.MONGODB_URI = "mongodb://test:27017/mydb";

      importMongodbModule();

      expect(mockMongoClientInstances.length).toBeGreaterThan(0);
      expect(mockMongoClientInstances[0].uri).toBe("mongodb://test:27017/mydb");
      expect(mockMongoClientInstances[0].options).toEqual(expect.any(Object));
    });

    it("should handle MONGODB_URI with whitespace", () => {
      process.env.MONGODB_URI = "  mongodb://localhost:27017  ";
      jest.resetModules();
      cleanupGlobalMongo();

      importMongodbModule();

      // Should trim whitespace from URI
      expect(mockMongoClientInstances[0].uri).toBe(
        "mongodb://localhost:27017" // Expect trimmed version
      );
    });

    it("should handle MONGODB_URI with special characters in password", () => {
      process.env.MONGODB_URI = "mongodb://user:p@ss%20word@localhost:27017";

      importMongodbModule();

      expect(mockMongoClientInstances[0].uri).toBe(
        "mongodb://user:p@ss%20word@localhost:27017"
      );
    });

    it("should handle malformed connection strings", () => {
      process.env.MONGODB_URI = "not-a-mongodb-uri";
      jest.resetModules();
      cleanupGlobalMongo();

      // Should throw when trying to import with malformed URI
      expect(() => {
        importMongodbModule();
      }).toThrow("MONGODB_URI must start with mongodb:// or mongodb+srv://");
    });

    it("should handle connection string with invalid credentials", async () => {
      process.env.MONGODB_URI = "mongodb://bad:creds@localhost:27017";
      setupMocks({
        connectShouldSucceed: false,
        connectError: new Error("Authentication failed"),
      });

      const clientPromise = importMongodbModule();

      await expect(clientPromise).rejects.toThrow("Authentication failed");
    });
  });

  describe("Development Environment Connection Behavior", () => {
    beforeEach(() => {
      jest.resetModules();
      resetMocks();
      cleanupGlobalMongo();
      process.env = { ...originalEnv };
      process.env.NODE_ENV = "development";
      setupMocks();
    });

    it("should create new connection on first import", () => {
      importMongodbModule();

      expect(mockMongoClientInstances.length).toBe(1);
      expect(mockConnect).toHaveBeenCalledTimes(1);

      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<any>;
      };
      expect(globalWithMongo._mongoClientPromise).toBeDefined();
    });

    it("should reuse cached connection on second import", () => {
      importMongodbModule();

      const firstInstanceCount = mockMongoClientInstances.length;
      const firstConnectCount = mockConnect.mock.calls.length;

      importMongodbModule();

      expect(mockMongoClientInstances.length).toBe(firstInstanceCount);
      expect(mockConnect).toHaveBeenCalledTimes(firstConnectCount);
    });

    it("should cache persist across multiple imports", () => {
      const promise1 = importMongodbModule();
      const promise2 = importMongodbModule();
      const promise3 = importMongodbModule();

      expect(mockMongoClientInstances.length).toBe(1);
      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(promise1).toBe(promise2);
      expect(promise2).toBe(promise3);
    });

    it("should pass correct connection options", () => {
      importMongodbModule();

      expect(mockMongoClientInstances.length).toBeGreaterThan(0);
      expect(mockMongoClientInstances[0].options).toEqual({
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
      });
    });

    it("should cache failed connection promise", async () => {
      const testError = new Error("Connection failed");
      setupMocks({
        connectShouldSucceed: false,
        connectError: testError,
      });

      const promise1 = importMongodbModule();

      await expect(promise1).rejects.toThrow("Connection failed");

      const promise2 = importMongodbModule();

      expect(promise1).toBe(promise2);
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it("should store promise in global._mongoClientPromise", () => {
      const promise = importMongodbModule();

      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<any>;
      };

      expect(globalWithMongo._mongoClientPromise).toBe(promise);
    });

    it("should handle race condition when global cache is being set", async () => {
      setupMocks({ connectDelay: 50 });

      const promises = await Promise.all(
        Array(10)
          .fill(0)
          .map(() => importMongodbModule())
      );

      expect(mockMongoClientInstances.length).toBe(1);
      expect(mockConnect).toHaveBeenCalledTimes(1);

      const uniquePromises = new Set(promises);
      expect(uniquePromises.size).toBe(1);
    });

    it("should handle module hot reload in development", () => {
      const promise1 = importMongodbModule();

      jest.resetModules();

      const promise2 = importMongodbModule();

      expect(promise1).toBe(promise2);
      expect(mockMongoClientInstances.length).toBe(1);
    });

    it("should not pollute global scope beyond _mongoClientPromise", () => {
      const globalKeys = Object.keys(global).filter(
        (k) =>
          k.toLowerCase().includes("mongo") ||
          k.toLowerCase().includes("client")
      );

      importMongodbModule();

      const newGlobalKeys = Object.keys(global).filter(
        (k) =>
          k.toLowerCase().includes("mongo") ||
          k.toLowerCase().includes("client")
      );

      expect(newGlobalKeys.length - globalKeys.length).toBeLessThanOrEqual(1);
      expect(newGlobalKeys.some((k) => k.includes("_mongoClientPromise"))).toBe(
        true
      );
    });
  });

  describe("Production Environment Connection Behavior", () => {
    beforeEach(() => {
      jest.resetModules();
      resetMocks();
      cleanupGlobalMongo();
      process.env = { ...originalEnv };
      process.env.NODE_ENV = "production";
      setupMocks();
    });

    it("should create connection on first import", () => {
      importMongodbModule();

      expect(mockMongoClientInstances.length).toBe(1);
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it("should not use global cache", () => {
      importMongodbModule();

      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<any>;
      };

      expect(globalWithMongo._mongoClientPromise).toBeUndefined();
    });

    it("should create new connection on second import", () => {
      importMongodbModule();

      const firstInstanceCount = mockMongoClientInstances.length;
      const firstConnectCount = mockConnect.mock.calls.length;

      importMongodbModule();

      expect(mockMongoClientInstances.length).toBe(firstInstanceCount + 1);
      expect(mockConnect).toHaveBeenCalledTimes(firstConnectCount + 1);
    });

    it("should return different promise instances on multiple imports", () => {
      const promise1 = importMongodbModule();
      const promise2 = importMongodbModule();

      expect(promise1).not.toBe(promise2);
    });

    it("should pass correct connection options", () => {
      importMongodbModule();

      expect(mockMongoClientInstances.length).toBeGreaterThan(0);
      expect(mockMongoClientInstances[0].options).toEqual({
        maxPoolSize: 10,
        minPoolSize: 2,
        maxIdleTimeMS: 30000,
      });
    });

    it("should not leak connections in production on repeated imports", () => {
      for (let i = 0; i < 100; i++) {
        importMongodbModule();
      }

      expect(mockMongoClientInstances.length).toBe(100);
      expect(mockConnect).toHaveBeenCalledTimes(100);
    });

    it("should handle concurrent production requests creating separate clients", async () => {
      const promises = [
        importMongodbModule(),
        importMongodbModule(),
        importMongodbModule(),
      ];

      const clients = await Promise.all(promises);

      expect(mockMongoClientInstances.length).toBe(3);
      expect(clients[0]).not.toBe(clients[1]);
      expect(clients[1]).not.toBe(clients[2]);
    });
  });

  describe("Connection Success and Failure", () => {
    beforeEach(() => {
      jest.resetModules();
      resetMocks();
      cleanupGlobalMongo();
      process.env = { ...originalEnv };
      setupMocks();
    });

    it("should resolve with client on successful connection", async () => {
      setupMocks({ connectShouldSucceed: true });

      const clientPromise = importMongodbModule();
      const client = await clientPromise;

      expect(client).toBeDefined();
      expect(client.connect).toBeDefined();
    });

    it("should reject with error on failed connection", async () => {
      const testError = new Error("Network timeout");
      setupMocks({
        connectShouldSucceed: false,
        connectError: testError,
      });

      const clientPromise = importMongodbModule();

      await expect(clientPromise).rejects.toThrow("Network timeout");
    });

    it("should preserve error message on connection failure", async () => {
      const customError = new Error("Custom connection error message");
      setupMocks({
        connectShouldSucceed: false,
        connectError: customError,
      });

      const clientPromise = importMongodbModule();

      await expect(clientPromise).rejects.toThrow(
        "Custom connection error message"
      );
    });

    it("should create new client instance on each import in production", () => {
      process.env.NODE_ENV = "production";

      const promise1 = importMongodbModule();

      jest.resetModules();
      setupMocks();

      const promise2 = importMongodbModule();

      expect(mockMongoClientInstances.length).toBe(2);
      expect(promise1).not.toBe(promise2);
    });

    it("should not pollute subsequent imports after connection failure in production", async () => {
      process.env.NODE_ENV = "production";
      setupMocks({
        connectShouldSucceed: false,
        connectError: new Error("First connection failed"),
      });

      const promise1 = importMongodbModule();
      await expect(promise1).rejects.toThrow("First connection failed");

      jest.resetModules();
      resetMocks();
      setupMocks();

      const promise2 = importMongodbModule();
      await expect(promise2).resolves.toBeDefined();
    });

    it("should handle connection delay", async () => {
      setupMocks({
        connectShouldSucceed: true,
        connectDelay: 100,
      });

      const startTime = Date.now();
      const clientPromise = importMongodbModule();

      await clientPromise;

      const elapsed = Date.now() - startTime;
      expect(elapsed).toBeGreaterThanOrEqual(95);
    });

    it("should support custom connect implementation", async () => {
      // Create a custom client with specific behavior
      const customClient = {
        connect: jest.fn().mockResolvedValue({
          db: jest.fn(),
          close: jest.fn(),
        }),
        db: jest.fn(),
        close: jest.fn(),
      };

      // Instead of trying to mock MongoClient constructor mid-test,
      // mock the connect method behavior
      mockConnect.mockResolvedValue(customClient);

      process.env.MONGODB_URI = "mongodb://localhost:27017/test";
      process.env.NODE_ENV = "production";

      const clientPromise = importMongodbModule();
      const client = await clientPromise;

      // Verify custom behavior was used
      expect(client).toBe(customClient);
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it("should provide clear error on authentication failure", async () => {
      setupMocks({
        connectShouldSucceed: false,
        connectError: new Error("Authentication failed for user"),
      });

      await expect(importMongodbModule()).rejects.toThrow(/authentication/i);
    });

    it("should handle connection timeouts gracefully", async () => {
      setupMocks({
        connectShouldSucceed: false,
        connectError: new Error("Connection timeout after 30000ms"),
        connectDelay: 100,
      });

      const clientPromise = importMongodbModule();

      await expect(clientPromise).rejects.toThrow(/timeout/i);
    });

    it("should handle intermittent network failures", async () => {
      let callCount = 0;
      mockConnect.mockImplementation(function (this: any) {
        callCount++;
        if (callCount <= 2) {
          return Promise.reject(new Error("ECONNREFUSED"));
        }
        return Promise.resolve(this);
      });

      await expect(importMongodbModule()).rejects.toThrow("ECONNREFUSED");

      resetMocks();
      setupMocks();

      const clientPromise = importMongodbModule();
      await expect(clientPromise).resolves.toBeDefined();
    });

    it("should not crash process on unhandled connection rejection", async () => {
      setupMocks({
        connectShouldSucceed: false,
        connectError: new Error("Connection refused"),
      });

      const clientPromise = importMongodbModule();

      // Catch the error to prevent unhandled rejection
      clientPromise.catch(() => {});

      await new Promise((resolve) => setTimeout(resolve, 100));

      await expect(clientPromise).rejects.toThrow("Connection refused");
    });
  });

  describe("Connection String Validation", () => {
    beforeEach(() => {
      jest.resetModules();
      resetMocks();
      cleanupGlobalMongo();
      process.env = { ...originalEnv };
      setupMocks();
    });

    it("should accept standard MongoDB URI", () => {
      process.env.MONGODB_URI = "mongodb://localhost:27017/db";

      expect(() => importMongodbModule()).not.toThrow();
      expect(mockMongoClientInstances[0].uri).toBe(
        "mongodb://localhost:27017/db"
      );
    });

    it("should accept MongoDB Atlas srv URI", () => {
      process.env.MONGODB_URI =
        "mongodb+srv://user:pass@cluster.mongodb.net/db";

      expect(() => importMongodbModule()).not.toThrow();
      expect(mockMongoClientInstances[0].uri).toBe(
        "mongodb+srv://user:pass@cluster.mongodb.net/db"
      );
    });

    it("should accept multi-host replica set URI", () => {
      process.env.MONGODB_URI =
        "mongodb://host1:27017,host2:27017,host3:27017/db?replicaSet=rs0";

      expect(() => importMongodbModule()).not.toThrow();
    });

    it("should accept URI with query parameters", () => {
      process.env.MONGODB_URI =
        "mongodb://localhost:27017/db?retryWrites=true&w=majority";

      expect(() => importMongodbModule()).not.toThrow();
    });

    it("should accept IPv6 addresses", () => {
      process.env.MONGODB_URI = "mongodb://[::1]:27017/db";

      expect(() => importMongodbModule()).not.toThrow();
    });

    it("should accept 127.0.0.1 as localhost", () => {
      process.env.MONGODB_URI = "mongodb://127.0.0.1:27017/db";

      expect(() => importMongodbModule()).not.toThrow();
    });

    it("should reject URI without mongodb:// prefix", () => {
      process.env.MONGODB_URI = "localhost:27017/db";

      expect(() => importMongodbModule()).toThrow(
        "MONGODB_URI must start with mongodb:// or mongodb+srv://"
      );
    });

    it("should reject completely invalid URI format", () => {
      process.env.MONGODB_URI = "not-a-valid-uri";

      expect(() => importMongodbModule()).toThrow(
        "MONGODB_URI must start with mongodb:// or mongodb+srv://"
      );
    });

    it("should trim whitespace from URI", () => {
      process.env.MONGODB_URI = "  mongodb://localhost:27017  ";

      expect(() => importMongodbModule()).not.toThrow();
      expect(mockMongoClientInstances[0].uri).toBe("mongodb://localhost:27017");
    });
  });

  describe("MongoDB Client Operations", () => {
    beforeEach(() => {
      jest.resetModules();
      resetMocks();
      cleanupGlobalMongo();
      process.env = { ...originalEnv };
      setupMocks();
    });

    it("should return a client with db() method", async () => {
      const clientPromise = importMongodbModule();
      const client = await clientPromise;

      expect(client).toBeDefined();
      expect(typeof client.db).toBe("function");
    });

    it("should return a client with close() method", async () => {
      const clientPromise = importMongodbModule();
      const client = await clientPromise;

      expect(typeof client.close).toBe("function");
    });

    it("should allow database operations on resolved client", async () => {
      const clientPromise = importMongodbModule();
      const client = await clientPromise;

      const db = client.db();
      expect(db).toBeDefined();
      expect(typeof db.admin).toBe("function");
    });
  });

  describe("Connection Pool and Resource Management", () => {
    beforeEach(() => {
      jest.resetModules();
      resetMocks();
      cleanupGlobalMongo();
      process.env = { ...originalEnv };
      setupMocks();
    });

    it("should pass connection pool configuration", () => {
      importMongodbModule();

      const options = mockMongoClientInstances[0].options;
      expect(options.maxPoolSize).toBe(10);
      expect(options.minPoolSize).toBe(2);
      expect(options.maxIdleTimeMS).toBe(30000);
    });

    it("should not be affected by options object mutation after passing to MongoClient", () => {
      jest.resetModules();
      cleanupGlobalMongo();

      process.env.MONGODB_URI = "mongodb://localhost:27017";
      process.env.NODE_ENV = "production";

      importMongodbModule();

      const instance = mockMongoClientInstances[0];

      // Should throw because options are frozen
      expect(() => {
        instance.options.maxPoolSize = 999;
      }).toThrow(TypeError);

      // Original value should be unchanged
      expect(instance.options.maxPoolSize).toBe(10);
    });

    it("should pass immutable options object", () => {
      jest.resetModules();
      cleanupGlobalMongo();

      process.env.MONGODB_URI = "mongodb://localhost:27017";
      process.env.NODE_ENV = "production";

      importMongodbModule();

      const firstCallOptions = mockMongoClientInstances[0].options;

      // Should throw because options are frozen
      expect(() => {
        firstCallOptions.maxPoolSize = 999;
      }).toThrow(TypeError);

      jest.resetModules();
      cleanupGlobalMongo();

      importMongodbModule();

      const secondCallOptions = mockMongoClientInstances[1].options;

      // Second call should have original values
      expect(secondCallOptions.maxPoolSize).toBe(10);
      expect(secondCallOptions.minPoolSize).toBe(2);
    });

    it("should use sensible default pool sizes", () => {
      importMongodbModule();

      const options = mockMongoClientInstances[0].options;
      expect(options.maxPoolSize).toBeGreaterThan(0);
      expect(options.minPoolSize).toBeGreaterThanOrEqual(0);
      expect(options.minPoolSize).toBeLessThanOrEqual(options.maxPoolSize);
    });

    it("should set reasonable idle timeout", () => {
      importMongodbModule();

      const options = mockMongoClientInstances[0].options;
      expect(options.maxIdleTimeMS).toBeGreaterThan(0);
      expect(options.maxIdleTimeMS).toBeLessThan(3600000); // Less than 1 hour
    });
  });

  describe("Edge Cases and Integration", () => {
    beforeEach(() => {
      jest.resetModules();
      resetMocks();
      cleanupGlobalMongo();
      process.env = { ...originalEnv };
      setupMocks();
    });

    it("should switch from development to production correctly", () => {
      process.env.NODE_ENV = "development";
      importMongodbModule();

      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<any>;
      };
      expect(globalWithMongo._mongoClientPromise).toBeDefined();

      const devInstanceCount = mockMongoClientInstances.length;

      cleanupGlobalMongo();
      jest.resetModules();
      resetMocks();
      setupMocks();
      process.env.NODE_ENV = "production";
      importMongodbModule();

      expect(globalWithMongo._mongoClientPromise).toBeUndefined();
      expect(mockMongoClientInstances.length).toBe(1);
    });

    it("should initiate connection without awaiting promise", () => {
      const promise = importMongodbModule();

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(promise).toBeInstanceOf(Promise);
    });

    it("should handle multiple simultaneous imports in development", () => {
      process.env.NODE_ENV = "development";

      const promise1 = importMongodbModule();
      const promise2 = importMongodbModule();
      const promise3 = importMongodbModule();

      expect(mockConnect).toHaveBeenCalledTimes(1);
      expect(promise1).toBe(promise2);
      expect(promise2).toBe(promise3);
    });

    it("should throw on empty MONGODB_URI string because empty string is falsy", () => {
      process.env.MONGODB_URI = "";

      expect(() => {
        importMongodbModule();
      }).toThrow("Please add your MONGODB_URI to .env.local");
    });

    it("should work with test environment NODE_ENV", () => {
      process.env.NODE_ENV = "test";

      importMongodbModule();

      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<any>;
      };

      expect(globalWithMongo._mongoClientPromise).toBeUndefined();
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it("should handle undefined NODE_ENV as production", () => {
      delete process.env.NODE_ENV;

      importMongodbModule();

      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<any>;
      };

      expect(globalWithMongo._mongoClientPromise).toBeUndefined();
      expect(mockConnect).toHaveBeenCalledTimes(1);
    });

    it("should handle NODE_ENV variations (staging, qa, etc)", () => {
      const envs = ["staging", "qa", "uat", ""];

      envs.forEach((env) => {
        jest.resetModules();
        cleanupGlobalMongo();
        resetMocks();
        setupMocks();
        process.env.NODE_ENV = env;

        importMongodbModule();

        const globalWithMongo = global as typeof globalThis & {
          _mongoClientPromise?: Promise<any>;
        };

        expect(globalWithMongo._mongoClientPromise).toBeUndefined();
      });
    });

    it("should handle MONGODB_URI change in development mode", () => {
      process.env.NODE_ENV = "development";
      process.env.MONGODB_URI = "mongodb://original:27017";
      jest.resetModules();
      cleanupGlobalMongo();

      importMongodbModule();
      expect(mockMongoClientInstances[0].uri).toBe("mongodb://original:27017");

      // Change URI and reset modules
      process.env.MONGODB_URI = "mongodb://changed:27017";
      jest.resetModules();
      // Note: We keep the global cache (don't cleanup) to simulate real dev behavior

      importMongodbModule();

      // In development, the cached connection is reused
      // So we should still have only 1 instance with the original URI
      expect(mockMongoClientInstances.length).toBe(1);
      expect(mockMongoClientInstances[0].uri).toBe("mongodb://original:27017");

      // If we actually want a new connection, we need to clear the cache
      cleanupGlobalMongo();
      jest.resetModules();
      importMongodbModule();

      // Now we should have a new connection with the changed URI
      expect(mockMongoClientInstances.length).toBe(2);
      expect(mockMongoClientInstances[1].uri).toBe("mongodb://changed:27017");
    });

    it("should not leak development cache when switching to production", () => {
      process.env.NODE_ENV = "development";
      importMongodbModule();

      const globalWithMongo = global as typeof globalThis & {
        _mongoClientPromise?: Promise<any>;
      };
      expect(globalWithMongo._mongoClientPromise).toBeDefined();

      jest.resetModules();
      cleanupGlobalMongo();
      resetMocks();
      setupMocks();
      process.env.NODE_ENV = "production";

      importMongodbModule();

      expect(globalWithMongo._mongoClientPromise).toBeUndefined();
    });

    it("should handle import while connection is pending", async () => {
      process.env.NODE_ENV = "development";
      setupMocks({ connectDelay: 50 });

      const promise1 = importMongodbModule();

      // Import again before first connection resolves
      await new Promise((resolve) => setTimeout(resolve, 10));
      const promise2 = importMongodbModule();

      expect(promise1).toBe(promise2);

      const client = await promise1;
      expect(client).toBeDefined();
    });

    it("should resolve with actual MongoClient instance not wrapper", async () => {
      const clientPromise = importMongodbModule();
      const client = await clientPromise;

      expect(client).toBeInstanceOf(MockMongoClient);
      expect(client.connect).toBeDefined();
      expect(client.close).toBeDefined();
      expect(client.db).toBeDefined();
    });
  });

  describe("Security and Error Messages", () => {
    beforeEach(() => {
      jest.resetModules();
      resetMocks();
      cleanupGlobalMongo();
      process.env = { ...originalEnv };
      setupMocks();
    });

    it("should not expose password in connection errors", async () => {
      process.env.MONGODB_URI = "mongodb://user:secretpass123@localhost:27017";
      const error = new Error("Connection failed to localhost:27017");
      setupMocks({
        connectShouldSucceed: false,
        connectError: error,
      });

      const promise = importMongodbModule();

      await expect(promise).rejects.toThrow();
      // Ensure error doesn't contain the password
      try {
        await promise;
      } catch (e: any) {
        expect(e.message).not.toContain("secretpass123");
      }
    });

    it("should handle URI with special characters in password", () => {
      process.env.MONGODB_URI = "mongodb://user:p@ss%20w0rd!@localhost:27017";

      expect(() => importMongodbModule()).not.toThrow();
    });
  });
});
