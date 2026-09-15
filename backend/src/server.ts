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
  })
);
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Netlify Functions path normalization middleware
app.use((req, res, next) => {
  if (req.url.startsWith('/.netlify/functions/api')) {
    req.url = req.url.replace('/.netlify/functions/api', '/api');
  }
  next();
});

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'AI SMART RESEARCH AGENT: EVIDENCE-GROUNDED MULTI-SOURCE LITERATURE SURVEY SYNTHESIS API',
    version: '1.0.0',
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/research', researchRoutes);
app.use('/api/papers', paperRoutes);
app.use('/api/user', userRoutes);

// Centralized Error Handling Middleware
app.use(errorHandler);

const PORT = parseInt(env.PORT, 10) || 5000;

if (process.env.NODE_ENV !== 'test') {
  app.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`[Research Agent Backend Server Active]`);
    console.log(`Port: http://localhost:${PORT}`);
    console.log(`API Base: http://localhost:${PORT}/api`);
    console.log(`Health Check: http://localhost:${PORT}/api/health`);
    console.log(`=======================================================`);
  });
}

export default app;
