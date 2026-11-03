import compression from 'compression';
import cookieParser from 'cookie-parser';
import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import mongoose from 'mongoose';
import morgan from 'morgan';
import { env, isProd, isTest } from './config/env';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';
import { apiLimiter } from './middleware/rateLimit';
import { sanitizeBody } from './middleware/sanitize';
import { apiRouter } from './routes';

export function createApp() {
  const app = express();

  // Render (and the Vercel rewrite in front of it) sit between the visitor and us;
  // trusting exactly that many hops makes req.ip the real client IP for rate limiting.
  app.set('trust proxy', env.TRUST_PROXY);
  app.disable('x-powered-by');

  app.use(
    helmet({
      // JSON API only: no HTML is served, so lock everything down.
      contentSecurityPolicy: { directives: { defaultSrc: ["'none'"], frameAncestors: ["'none'"] } },
      crossOriginResourcePolicy: { policy: 'same-site' },
    }),
  );
  app.use(
    cors({
      origin: (origin, cb) => cb(null, !origin || env.CLIENT_ORIGINS.includes(origin)),
      credentials: true,
      methods: ['GET', 'POST', 'PATCH', 'DELETE'],
      maxAge: 600,
    }),
  );
  app.use(compression());
  if (!isTest) app.use(morgan(isProd ? 'combined' : 'dev'));

  app.use(express.json({ limit: '200kb' }));
  app.use(cookieParser());
  app.use(sanitizeBody);

  app.get('/health', (_req, res) => {
    res.set('Cache-Control', 'no-store').json({
      status: 'ok',
      db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      uptime: Math.round(process.uptime()),
    });
  });

  app.use('/api', apiLimiter, apiRouter);

  app.use(notFoundHandler);
  app.use(errorHandler);
  return app;
}
