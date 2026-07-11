import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import { config } from './config';

// Import routes
import authRoutes from './routes/auth';
import weddingRoutes from './routes/wedding';
import tripRoutes from './routes/trip';
import babyRoutes from './routes/baby';
import aiRoutes from './routes/ai';
import notificationRoutes from './routes/notification';
import paymentRoutes from './routes/payment';

const app = express();

// ─── Security ───
app.use(helmet());
app.use(cors({
  origin: config.frontendUrl,
  credentials: true,
}));

// ─── Rate Limiting ───
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/auth', limiter);

// ─── Body Parsing ───
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// ─── Logging ───
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// ─── Health Check ───
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// ─── Routes ───
app.use('/api/auth', authRoutes);
app.use('/api/wedding', weddingRoutes);
app.use('/api/trip', tripRoutes);
app.use('/api/baby', babyRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payment', paymentRoutes);

// ─── 404 Handler ───
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// ─── Error Handler ───
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    error: config.nodeEnv === 'production' ? 'Internal server error' : err.message,
  });
});

// ─── Start Server ───
app.listen(config.port, () => {
  console.log(`🚀 YOLA Backend running on http://localhost:${config.port}`);
  console.log(`📋 Environment: ${config.nodeEnv}`);
  console.log(`🤖 AI Model: ${config.openai.model}`);
});

export default app;