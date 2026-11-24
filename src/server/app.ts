import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { apiRouter } from './routes/api.routes.ts';
import { errorHandler } from './middlewares/errorHandler.ts';

import { getDatabaseStatus } from './db/connection.ts';

export const createApp = () => {
  const app = express();

  // Basic security headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    next();
  });

  // Body and cookie parsing
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  app.use(cookieParser());

  // Static uploads directory serving
  app.use('/uploads', express.static(path.resolve(process.cwd(), 'public', 'uploads')));

  // Mount API v1 router
  app.use('/api/v1', apiRouter);

  // Health endpoints reporting MongoDB status
  const handleHealth = (req: express.Request, res: express.Response) => {
    const dbStatus = getDatabaseStatus();
    const isHealthy = dbStatus.status === 'connected';

    if (!isHealthy) {
      return res.status(503).json({
        status: 'unhealthy',
        database: {
          provider: 'MongoDB',
          status: dbStatus.status,
          error: 'Database disconnected or unavailable'
        },
        timestamp: new Date().toISOString()
      });
    }

    return res.status(200).json({
      status: 'healthy',
      database: {
        provider: 'MongoDB',
        status: 'connected'
      },
      app: 'Darkvence API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  };

  app.get('/health', handleHealth);
  app.get('/api/health', handleHealth);

  // Error handler middleware
  app.use(errorHandler);

  return app;
};
