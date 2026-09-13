import mongoose from 'mongoose';
import { env } from './env';

// Disable buffering commands so queries fail fast or fall back to in-memory store if DB is unreachable
mongoose.set('bufferCommands', false);

export const isMongoConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }
  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`[MongoDB Warning] Live MongoDB connection unavailable (${error.message}).`);
    console.warn(`[MongoDB Info] Activated instant in-memory fallback store for zero-latency testing.`);
  }
};
