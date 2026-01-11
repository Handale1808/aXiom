// lib/mongodb.ts

import { MongoClient } from "mongodb";

if (!process.env.MONGODB_URI) {
  throw new Error("Please add your MONGODB_URI to .env.local");
}

const uri = process.env.MONGODB_URI.trim();

// Validate URI format
if (!uri.startsWith("mongodb://") && !uri.startsWith("mongodb+srv://")) {
  throw new Error("MONGODB_URI must start with mongodb:// or mongodb+srv://");
}

const options = Object.freeze({
  maxPoolSize: 10,
  minPoolSize: 2,
  maxIdleTimeMS: 30000,
});

/**
 * MongoDB client connection promise.
 *
 * In development: Cached globally to prevent hot-reload connection leaks.
 * In production: New connection per module import (Next.js creates multiple instances).
 */
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
  };

  if (!globalWithMongo._mongoClientPromise) {
    const client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
  }
  clientPromise = globalWithMongo._mongoClientPromise;
} else {
  const client = new MongoClient(uri, options);
  clientPromise = client.connect();
}

export default clientPromise;
