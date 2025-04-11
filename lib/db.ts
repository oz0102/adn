// lib/db.ts - Server-side only Mongoose connection
// This file is only used on the server side
// Add a check to prevent importing in browser environments
if (typeof window !== 'undefined') {
  throw new Error('This module is server-side only and cannot be imported in browser code');
}

import mongoose from 'mongoose';

// Define a proper interface for our cached mongoose connection
interface MongooseCache {
  conn: mongoose.Connection | null;
  promise: Promise<mongoose.Mongoose> | null;
}

// Define the mongoose property on global
declare global {
  var mongoose: MongooseCache | undefined;
}

const MONGODB_URI = process.env.MONGODB_URI!;

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable');
}

// Initialize the cache
let cached: MongooseCache = global.mongoose ?? {
  conn: null,
  promise: null
};

// Set the global cache
if (!global.mongoose) {
  global.mongoose = cached;
}

async function connectToDatabase(): Promise<mongoose.Connection> {
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

export default connectToDatabase;
