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

  const isServerless = !!(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT);
  const isLocalMongoUri = env.MONGODB_URI.includes('127.0.0.1') || env.MONGODB_URI.includes('localhost');

  // In serverless cloud without remote Atlas URI, skip local connection attempt to avoid 5-second cold start timeout
  if (isServerless && isLocalMongoUri) {
    console.log('[MongoDB Info] Serverless cloud environment detected without remote MONGODB_URI. Using resilient local/tmp database.');
    return;
  }

  try {
    const conn = await mongoose.connect(env.MONGODB_URI, {
      serverSelectionTimeoutMS: 2000,
      connectTimeoutMS: 2000,
    });
    console.log(`[MongoDB] Connected successfully to host: ${conn.connection.host}`);
  } catch (error: any) {
    console.warn(`[MongoDB Warning] Live MongoDB connection unavailable (${error.message}).`);
    console.warn(`[MongoDB Info] Activated instant in-memory/tmp fallback store for zero-latency testing.`);
  }
};
