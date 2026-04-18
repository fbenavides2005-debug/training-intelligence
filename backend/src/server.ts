import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import { config } from './config';

import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import healthRoutes from './routes/health';
import coachRoutes from './routes/coach';
import whoopRoutes from './routes/whoop';

const app = express();

// ── Middleware ──────────────────────────────────────────

app.use(cors());
app.use(express.json({ limit: '5mb' }));

// ── Routes ─────────────────────────────────────────────

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/auth', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/health', healthRoutes);
app.use('/api/coach', coachRoutes);
app.use('/api/whoop', whoopRoutes);

// ── Error handler ──────────────────────────────────────

app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction,
  ) => {
    console.error('Unhandled error:', err.message);
    res.status(500).json({ error: 'Internal server error' });
  },
);

// ── Start ──────────────────────────────────────────────

async function start() {
  // Start listening immediately so WHOOP OAuth routes are reachable
  app.listen(config.port, () => {
    console.log(`TrainIQ API running on port ${config.port}`);
    console.log(`Environment: ${config.env}`);
  });

  // MongoDB connection is non-fatal — routes that need it will fail gracefully
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');
  } catch (err) {
    console.warn(
      'MongoDB unavailable — DB-backed routes will not work:',
      err instanceof Error ? err.message : err,
    );
  }
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
