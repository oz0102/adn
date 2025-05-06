// lib/mongodb.ts - Server-side only MongoDB client
// This file is only used on the server side
// Add a check to prevent importing in browser environments
if (typeof window !== "undefined") {
  throw new Error("This module is server-side only and cannot be imported in browser code");
}

import { MongoClient } from "mongodb";
import mongoose from "mongoose"; // Import mongoose

if (!process.env.MONGODB_URI) {
  throw new Error("Please define the MONGODB_URI environment variable");
}

const uri = process.env.MONGODB_URI;
const options = {
  // compressors: "none", // Removing as it might not be standard or necessary for all setups
  // autoEncryption: { // Removing as it might not be standard or necessary for all setups
  //   bypassAutoEncryption: true
  // }
};

let client: MongoClient;
let clientPromise: Promise<MongoClient>;

if (process.env.NODE_ENV === "development") {
  const globalWithMongo = global as typeof globalThis & {
    _mongoClientPromise?: Promise<MongoClient>;
    _mongooseConnection?: typeof mongoose;
  };

  if (!globalWithMongo._mongoClientPromise) {
    client = new MongoClient(uri, options);
    globalWithMongo._mongoClientPromise = client.connect();
    console.log("New MongoDB client connected in development.");
  }
  clientPromise = globalWithMongo._mongoClientPromise;

  // Mongoose connection handling
  if (!globalWithMongo._mongooseConnection) {
    mongoose.connect(uri/*, options */).then((m) => {
      console.log("Mongoose connected in development.");
      globalWithMongo._mongooseConnection = m;
      return m;
    }).catch(err => console.error("Mongoose connection error (dev):", err));
  } else {
    // console.log("Using existing Mongoose connection in development.");
  }

} else {
  client = new MongoClient(uri, options);
  clientPromise = client.connect();
  console.log("New MongoDB client connected in production.");

  // Mongoose connection for production
  mongoose.connect(uri/*, options */).then(() => {
    console.log("Mongoose connected in production.");
  }).catch(err => console.error("Mongoose connection error (prod):", err));
}

/**
 * Function to establish MongoDB connection using Mongoose.
 * This is the preferred way to ensure DB connection for services using Mongoose models.
 */
async function connectToDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState >= 1) {
    // console.log("Using existing Mongoose connection.");
    return mongoose;
  }
  try {
    // console.log("Attempting new Mongoose connection...");
    await mongoose.connect(uri/*, options */);
    // console.log("Mongoose connected successfully.");
    return mongoose;
  } catch (e) {
    console.error("Mongoose connection error in connectToDB:", e);
    throw new Error("Could not connect to DB using Mongoose.");
  }
}

// Export the function for Mongoose connections
export default connectToDB;

// Export the MongoClient promise for direct MongoDB driver usage if needed, though connectToDB (Mongoose) is preferred for this app.
export { clientPromise as mongoClientPromise };

