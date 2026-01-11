require("@testing-library/jest-dom");
const { configure } = require("@testing-library/react");

process.env.NODE_ENV = "test";
process.env.MONGODB_URI = "mongodb://localhost:27017/test";
process.env.ANTHROPIC_API_KEY = "test-key-12345";

configure({
  getElementError: (message) => {
    const error = new Error(message);
    error.name = "TestingLibraryElementError";
    error.stack = "";
    return error;
  },
});

// Global cleanup for MongoDB tests
afterEach(() => {
  if (global._mongoClientPromise) {
    delete global._mongoClientPromise;
  }
});