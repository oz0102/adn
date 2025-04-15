/**
 * Server-side only Mongoose connection
 * This file should never be imported by client-side code
 */

import mongoose from 'mongoose';

// Verify we're on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

// Define mongoose connection cache type
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Mongoose> | null;
}

// Define global mongoose property
declare global {
  // eslint-disable-next-line no-var
  var mongooseConnection: MongooseCache | undefined;
}

if (!process.env.MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

const MONGODB_URI = process.env.MONGODB_URI;

// Initialize the cache
const cached: MongooseCache = global.mongooseConnection ?? {
  conn: null,
  promise: null
};

// Set the global cache
if (!global.mongooseConnection) {
  global.mongooseConnection = cached;
}

/**
 * Connect to MongoDB using Mongoose
 * @returns Mongoose connection
 */
async function connectToMongoose(): Promise<mongoose.Connection> {
  // If we have a connection, return it
  if (cached.conn) {
    return cached.conn;
  }

  // If we don't have a promise yet, create one
  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
    };

    cached.promise = mongoose.connect(MONGODB_URI, opts).then((mongoose) => {
      return mongoose;
    });
  }

  try {
    // Wait for the connection
    const mongoDB = await cached.promise;
    cached.conn = mongoDB.connection;
  } catch (e) {
    // Reset the promise if it fails
    cached.promise = null;
    throw e;
  }

  return cached.conn;
}

export { connectToMongoose };
