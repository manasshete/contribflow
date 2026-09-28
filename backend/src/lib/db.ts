import mongoose from 'mongoose';
import { env } from '../config/env';

/**
 * Cached connection promise so warm serverless invocations (Vercel Fluid
 * Compute reuses instances) reuse the existing Mongo connection instead of
 * reconnecting on every request. Safe for local dev too - connects once.
 */
let connectionPromise: Promise<typeof mongoose> | null = null;

export function connectDB(): Promise<typeof mongoose> {
  if (mongoose.connection.readyState === 1) {
    return Promise.resolve(mongoose);
  }
  if (!connectionPromise) {
    connectionPromise = mongoose
      .connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      })
      .catch((err) => {
        connectionPromise = null; // allow retry on the next request instead of caching a failure
        throw err;
      });
  }
  return connectionPromise;
}
