/**
 * Server-side only MongoDB adapter for Auth.js
 * This file should never be imported by client-side code
 */

import { connectToMongoDB } from '../db/mongodb';
import { MongoDBAdapter } from "@auth/mongodb-adapter";

// Verify we're on the server
if (typeof window !== 'undefined') {
  throw new Error('This module can only be used on the server side');
}

/**
 * Get MongoDB adapter for Auth.js
 * @returns MongoDB adapter instance
 */
export async function getMongoDBAdapter() {
  const clientPromise = await connectToMongoDB();
  return MongoDBAdapter(clientPromise);
}
