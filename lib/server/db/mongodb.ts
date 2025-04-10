/**
 * Server-side only MongoDB connection
 * This file should never be imported by client-side code
 */

import { MongoClient } from 'mongodb';

// Verify we're on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const uri = process.env.MONGODB_URI;
const options = {};

// Global is used here to maintain a cached connection across hot reloads
// in development. This prevents connections growing exponentially
// during API Route usage.
let cached = global.mongoClientPromise;

if (!cached) {
  cached = global.mongoClientPromise = {};
}

async function connectToMongoDB() {
  if (cached.promise) {
    return cached.promise;
  }

  const client = new MongoClient(uri, options);
  cached.promise = client.connect();
  return cached.promise;
}

export { connectToMongoDB };
