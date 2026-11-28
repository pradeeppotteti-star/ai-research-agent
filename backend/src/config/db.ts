import mongoose from 'mongoose';
import { env } from './env';

// Disable buffering commands so queries fail fast or fall back to local store if DB is unreachable
mongoose.set('bufferCommands', false);

let connectionPromise: Promise<void> | null = null;

export const isMongoConnected = (): boolean => {
  return mongoose.connection.readyState === 1;
};

export const connectDB = async (): Promise<void> => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (connectionPromise) {
    return connectionPromise;
  }

  const isServerless = Boolean(
    process.env.NETLIFY ||
      process.env.AWS_LAMBDA_FUNCTION_NAME ||
      process.env.LAMBDA_TASK_ROOT ||
      process.env.VERCEL
  );
  const isLocalMongoUri = env.MONGODB_URI.includes('127.0.0.1') || env.MONGODB_URI.includes('localhost');

  // Keep unit/integration tests isolated from live databases unless explicitly opted in
  if (process.env.NODE_ENV === 'test' && process.env.ALLOW_TEST_MONGO !== 'true') {
    return;
  }

  // Skip local Mongo connection attempts in serverless environments without a remote URI
  if (isLocalMongoUri && isServerless) {
    console.log('[MongoDB Info] Serverless environment without remote MONGODB_URI. Using local/tmp fallback.');
    return;
  }

  connectionPromise = (async () => {
    try {
      const conn = await mongoose.connect(env.MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
      });
      console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
    } catch (error: any) {
      connectionPromise = null;
      console.warn(`[MongoDB Warning] Live MongoDB connection unavailable (${error.message}).`);
      console.warn('[MongoDB Info] Fallback store active until MongoDB is reachable.');
    }
  })();

  return connectionPromise;
};
