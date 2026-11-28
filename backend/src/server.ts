import express from 'express';
import cors from 'cors';
import { env } from './config/env';
import { connectDB } from './config/db';
import authRoutes from './routes/auth.routes';
import researchRoutes from './routes/research.routes';
import paperRoutes from './routes/paper.routes';
import userRoutes from './routes/user.routes';
import { errorHandler } from './middleware/error.middleware';

const app = express();

// Connect to MongoDB Database
connectDB();

// Middleware configuration
app.use(
  cors({
    origin: '*', // Allow local frontend and deployment domains
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Content-Disposition', 'Content-Length', 'X-Paper-Count', 'X-Archive-Mode'],
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure MongoDB connection promise settles before request handlers run (prevents serverless cold-start race)
app.use(async (_req, _res, next) => {
  await connectDB();
  next();
});

// Netlify Functions path normalization middleware
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    const stripped = req.url.replace('/.netlify/functions/api', '');
    req.url = stripped.startsWith('/') ? stripped : '/' + stripped;
    if (req.url === '') req.url = '/';
  }
  next();
});

// Health Check
app.get(['/api/health', '/health'], (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'PaperInsight: Research Analysis and Literature Review Generation System API',
    version: '1.0.0',
  });
});

// API Routes - mounted on both /api/* and /* for universal serverless/cloud compatibility
app.use('/api/auth', authRoutes);
app.use('/auth', authRoutes);

app.use('/api/research', researchRoutes);
app.use('/research', researchRoutes);

app.use('/api/papers', paperRoutes);
app.use('/papers', paperRoutes);

app.use('/api/user', userRoutes);
app.use('/user', userRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10) || 5000;
const isServerlessRuntime = Boolean(
  process.env.NETLIFY ||
    process.env.AWS_LAMBDA_FUNCTION_NAME ||
    process.env.LAMBDA_TASK_ROOT ||
    process.env.VERCEL
);

if (process.env.NODE_ENV !== 'test' && !isServerlessRuntime) {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`[PaperInsight: Research Analysis and Literature Review Generation System API Active]`);
    console.log(`Port: http://localhost:${PORT}`);
    console.log(`API Base: http://localhost:${PORT}/api`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;
